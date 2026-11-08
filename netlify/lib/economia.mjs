// Economia del joc validada al servidor: llibre comptable, impostos, guardiola de la classe i límits contra abusos.
// La fan servir la funció joc-economia i les proves (tests/economia.test.mjs). Rep un pg.Pool.

export const DEFAULTS = {
  inicial: 3000,                          // capital amb què comença cada agència
  impost: {
    // Retenció per trams sobre cada ingrés (marginal, com l'IRPF): de 0 a 1.000 € un 5 %, a partir de 1.000 € un 8 %...
    trams: [{ des: 0, pct: 5 }],
    // Operacions subjectes a impost (només els ingressos; mai les despeses, el capital inicial ni el reinici)
    tipus: ['capitol', 'clients', 'encarrec', 'projecte', 'web', 'botiguer', 'mercat', 'missio', 'combat', 'premi', 'altre']
  },
  limits: {
    capitol: 15000,      // màxim que pot ingressar un mateix capítol de la campanya
    clients: 6000,       // honoraris dels clients recurrents en una operació (setmanes de joc)
    encarrec: 4000,      // màxim per encàrrec (cada encàrrec només es cobra una vegada)
    botiguer: 800,       // màxim per botiguer de Vic (una vegada)
    mercat: 5000,        // màxim per tracte entre agències
    altre: 500,          // altres ingressos sense categoria, per operació
    altreDiari: 3000,    // i per dia
    diari: 60000,        // màxim d'ingressos d'un jugador en un dia
    despesaMin: -100000  // despesa màxima en una sola operació
  },
  autoaprovar: false     // si és fals, el professor ha de validar cada alumne abans que la seva economia compti
};
export const TIPUS = ['inici', 'reinici', 'capitol', 'clients', 'encarrec', 'projecte', 'web', 'botiguer', 'mercat', 'despesa', 'estudi', 'altre'];
const ONE_SHOT = ['encarrec', 'botiguer', 'mercat'];

const deepMerge = (a, b) => {
  const o = Array.isArray(a) ? a.slice() : Object.assign({}, a);
  for (const k of Object.keys(b || {})) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a && typeof a[k] === 'object' ? deepMerge(a[k], b[k]) : b[k];
  return o;
};

export async function getConfig(db, classe) {
  const { rows } = await db.query('SELECT classe, clau, valor FROM config WHERE classe = $1 OR classe = $2', ['*', classe]);
  let cfg = DEFAULTS;
  for (const scope of ['*', classe]) for (const r of rows.filter(r => r.classe === scope)) cfg = deepMerge(cfg, { [r.clau]: r.valor });
  return cfg;
}

// Impost marginal per trams (sempre arrodonit a la baixa: mai es cobra de més)
export function calcImpost(brut, trams) {
  if (!(brut > 0) || !trams || !trams.length) return 0;
  const t = trams.slice().sort((a, b) => a.des - b.des);
  let imp = 0;
  t.forEach((tr, i) => {
    const hi = i + 1 < t.length ? t[i + 1].des : Infinity;
    const part = Math.max(0, Math.min(brut, hi) - tr.des);
    imp += part * (tr.pct || 0) / 100;
  });
  return Math.floor(imp);
}

export async function alta(pool, { classe, pid, idHash, nom, agencia }) {
  const cfg = await getConfig(pool, classe);
  await pool.query(`INSERT INTO jugadors (classe, pid, id_hash, nom, agencia, aprovat) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (classe, pid) DO UPDATE SET nom = COALESCE(NULLIF(EXCLUDED.nom, ''), jugadors.nom), agencia = COALESCE(NULLIF(EXCLUDED.agencia, ''), jugadors.agencia)`, [classe, pid, idHash, String(nom || '').slice(0, 80), String(agencia || '').slice(0, 80), !!cfg.autoaprovar]);
  await pool.query('INSERT INTO saldos (classe, pid, saldo) VALUES ($1, $2, 0) ON CONFLICT DO NOTHING', [classe, pid]);
  const { rows } = await pool.query('SELECT aprovat, bloquejat, id_hash FROM jugadors WHERE classe = $1 AND pid = $2', [classe, pid]);
  if (rows[0].id_hash !== idHash) throw new Error('identitat');
  return rows[0];
}

/* Registra una operació econòmica del joc dins d'una transacció.
   ev = { idem, tipus, ref, brut, detall }   ctx = { maxPagament(tipus, ref) → import màxim o null }
   Retorna { ok, idem, brut, impost, net, saldo } o { ok:false, motiu, pendent? }. Idempotent: la mateixa idem retorna el mateix resultat. */
export async function registrar(pool, classe, pid, ev, ctx = {}) {
  const idem = String(ev.idem || '').slice(0, 80), tipus = String(ev.tipus || ''), ref = String(ev.ref || '').slice(0, 80);
  let brut = Number(ev.brut);
  if (!idem || !/^[\w.:-]+$/.test(idem)) return { ok: false, idem, motiu: 'idem' };
  if (!TIPUS.includes(tipus)) return { ok: false, idem, motiu: 'tipus' };
  if (!Number.isInteger(brut) || brut === 0) return { ok: false, idem, motiu: 'import' };
  const previ = async () => {
    const prev = await pool.query('SELECT brut, impost, net, saldo_final FROM moviments WHERE classe = $1 AND pid = $2 AND idem = $3', [classe, pid, idem]);
    if (prev.rows.length) { const p = prev.rows[0]; return { ok: true, repetit: true, idem, brut: +p.brut, impost: +p.impost, net: +p.net, saldo: +p.saldo_final }; }
    const rej = await pool.query('SELECT motiu FROM rebutjats WHERE classe = $1 AND pid = $2 AND idem = $3', [classe, pid, idem]);
    return rej.rows.length ? { ok: false, repetit: true, idem, motiu: rej.rows[0].motiu } : null;
  };
  const ja = await previ();
  if (ja) return ja;
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const jug = await c.query('SELECT aprovat, bloquejat FROM jugadors WHERE classe = $1 AND pid = $2', [classe, pid]);
    if (!jug.rows.length) { await c.query('ROLLBACK'); return { ok: false, idem, motiu: 'jugador' }; }
    if (jug.rows[0].bloquejat) { await c.query('ROLLBACK'); return { ok: false, idem, motiu: 'bloquejat' }; }
    if (!jug.rows[0].aprovat) { await c.query('ROLLBACK'); return { ok: false, pendent: true, idem, motiu: 'pendent' }; }
    // Bloqueja el saldo del jugador: les operacions simultànies s'executen una darrere l'altra
    const sres = await c.query('SELECT saldo FROM saldos WHERE classe = $1 AND pid = $2 FOR UPDATE', [classe, pid]);
    const saldo = +sres.rows[0].saldo;
    const cfg = await getConfig(c, classe), L = cfg.limits;
    const sumRef = async (positius) => +(await c.query(`SELECT COALESCE(SUM(brut), 0) s FROM moviments WHERE classe = $1 AND pid = $2 AND tipus = $3 AND ref = $4 ${positius ? 'AND brut > 0' : ''}`, [classe, pid, tipus, ref])).rows[0].s;
    const avui = async (filtre) => +(await c.query(`SELECT COALESCE(SUM(brut), 0) s FROM moviments WHERE classe = $1 AND pid = $2 AND brut > 0 AND creat_at >= date_trunc('day', NOW()) ${filtre || ''}`, [classe, pid])).rows[0].s;
    let motiu = null;
    if (brut < 0) {
      if (['inici', 'reinici', 'premi'].includes(tipus)) motiu = 'tipus';
      else if (brut < L.despesaMin) motiu = 'despesa-massa-gran';
    } else if (tipus === 'inici') {
      const n = +(await c.query("SELECT COUNT(*) n FROM moviments WHERE classe = $1 AND pid = $2 AND tipus = 'inici'", [classe, pid])).rows[0].n;
      if (n) motiu = 'inici-repetit'; else if (brut !== cfg.inicial) motiu = 'inici-import';
    } else if (tipus === 'reinici') {
      // Fallida: el servidor calcula l'import perquè el saldo torni al capital inicial
      if (saldo >= 0) motiu = 'reinici-sense-fallida'; else brut = cfg.inicial - saldo;
    } else {
      if (ONE_SHOT.includes(tipus) && await sumRef(true) > 0) motiu = 'ja-cobrat';
      const lim = tipus === 'capitol' ? L.capitol : tipus === 'clients' ? L.clients : tipus === 'encarrec' ? L.encarrec : tipus === 'botiguer' ? L.botiguer : tipus === 'mercat' ? L.mercat : tipus === 'altre' ? L.altre : (tipus === 'projecte' || tipus === 'web') && ctx.maxPagament ? await ctx.maxPagament(tipus, ref) : null;
      if (!motiu && (tipus === 'projecte' || tipus === 'web') && lim == null) motiu = 'sense-nota';
      if (!motiu && lim != null && (await sumRef(true)) + brut > lim) motiu = 'supera-limit';
      if (!motiu && tipus === 'altre' && (await avui("AND tipus = 'altre'")) + brut > L.altreDiari) motiu = 'limit-diari';
      if (!motiu && tipus === 'capitol' && !/^\d{1,2}\.\d{1,2}$/.test(ref)) motiu = 'ref';
      if (!motiu && (await avui("AND tipus NOT IN ('inici', 'reinici')")) + brut > L.diari) motiu = 'limit-diari';
    }
    if (motiu) {
      await c.query('INSERT INTO rebutjats (classe, pid, idem, tipus, ref, import_demanat, motiu) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING', [classe, pid, idem, tipus, ref, brut, motiu]);
      await c.query('COMMIT');
      return { ok: false, idem, motiu };
    }
    const impost = brut > 0 && cfg.impost.tipus.includes(tipus) ? calcImpost(brut, cfg.impost.trams) : 0;
    const net = brut - impost;
    // Actualització atòmica (saldo = saldo + net): no depèn del valor llegit abans
    const saldoFinal = +(await c.query('UPDATE saldos SET saldo = saldo + $3, actualitzat = NOW() WHERE classe = $1 AND pid = $2 RETURNING saldo', [classe, pid, net])).rows[0].saldo;
    const mv = await c.query('INSERT INTO moviments (classe, pid, idem, tipus, ref, brut, impost, net, saldo_final, detall) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
      [classe, pid, idem, tipus, ref, brut, impost, net, saldoFinal, JSON.stringify(ev.detall || {}).length < 2000 ? ev.detall || {} : {}]);
    if (impost > 0) await guardiolaMoure(c, classe, 'impost', impost, pid, mv.rows[0].id, `${tipus}:${ref}`);
    await c.query('COMMIT');
    return { ok: true, idem, brut, impost, net, saldo: saldoFinal };
  } catch (e) {
    await c.query('ROLLBACK').catch(() => { });
    // Dues peticions simultànies amb la mateixa clau: la clau única ho impedeix i es retorna el resultat de la primera
    if (e && e.code === '23505') { const ja2 = await previ(); if (ja2) return ja2; }
    throw e;
  } finally { c.release(); }
}

// Moviment de la guardiola (dins d'una transacció oberta)
export async function guardiolaMoure(c, classe, tipus, imp, pid, movId, ref) {
  await c.query('INSERT INTO guardioles (classe, saldo) VALUES ($1, 0) ON CONFLICT DO NOTHING', [classe]);
  // Actualització atòmica; si el saldo quedés negatiu, no es fa res i es llança un error (la transacció es desfà)
  const g = await c.query('UPDATE guardioles SET saldo = saldo + $2, actualitzat = NOW() WHERE classe = $1 AND saldo + $2 >= 0 RETURNING saldo', [classe, imp]);
  if (!g.rows.length) throw new Error('guardiola-insuficient');
  const fin = +g.rows[0].saldo;
  await c.query('INSERT INTO guardiola_moviments (classe, tipus, import, pid, moviment_id, ref, saldo_final) VALUES ($1, $2, $3, $4, $5, $6, $7)', [classe, tipus, imp, pid || null, movId || null, ref || '', fin]);
  return fin;
}

export async function estat(pool, classe, pid) {
  const [j, s, m, g, cfg] = await Promise.all([
    pool.query('SELECT aprovat, bloquejat FROM jugadors WHERE classe = $1 AND pid = $2', [classe, pid]),
    pool.query('SELECT saldo FROM saldos WHERE classe = $1 AND pid = $2', [classe, pid]),
    pool.query('SELECT tipus, ref, brut, impost, net, saldo_final, creat_at FROM moviments WHERE classe = $1 AND pid = $2 ORDER BY id DESC LIMIT 20', [classe, pid]),
    pool.query('SELECT saldo FROM guardioles WHERE classe = $1', [classe]),
    getConfig(pool, classe)
  ]);
  const n = +(await pool.query('SELECT COUNT(*) n FROM moviments WHERE classe = $1 AND pid = $2', [classe, pid])).rows[0].n;
  return {
    aprovat: !!(j.rows[0] && j.rows[0].aprovat), bloquejat: !!(j.rows[0] && j.rows[0].bloquejat), saldo: s.rows[0] ? +s.rows[0].saldo : 0, moviments: n,
    darrers: m.rows.map(r => ({ tipus: r.tipus, ref: r.ref, brut: +r.brut, impost: +r.impost, net: +r.net, saldo: +r.saldo_final, at: r.creat_at })),
    guardiola: g.rows[0] ? +g.rows[0].saldo : 0, impost: cfg.impost, inicial: cfg.inicial
  };
}

export async function guardiolaInfo(pool, classe, limit = 30) {
  const [g, tot, mv] = await Promise.all([
    pool.query('SELECT saldo FROM guardioles WHERE classe = $1', [classe]),
    pool.query("SELECT COALESCE(SUM(CASE WHEN tipus = 'impost' THEN import END), 0) impostos, COALESCE(-SUM(CASE WHEN tipus = 'premi' THEN import END), 0) premis, COUNT(*) n FROM guardiola_moviments WHERE classe = $1", [classe]),
    pool.query('SELECT gm.tipus, gm.import, gm.ref, gm.saldo_final, gm.creat_at, j.nom FROM guardiola_moviments gm LEFT JOIN jugadors j ON j.classe = gm.classe AND j.pid = gm.pid WHERE gm.classe = $1 ORDER BY gm.id DESC LIMIT $2', [classe, limit])
  ]);
  return { saldo: g.rows[0] ? +g.rows[0].saldo : 0, impostos: +tot.rows[0].impostos, premis: +tot.rows[0].premis, aportacions: +tot.rows[0].n,
    historial: mv.rows.map(r => ({ tipus: r.tipus, import: +r.import, ref: r.ref, saldo: +r.saldo_final, at: r.creat_at, nom: r.nom || '' })) };
}

// Reconstrueix els saldos a partir dels llibres comptables i els compara amb els saldos desats
export async function auditoria(pool, classe) {
  const jug = await pool.query(`SELECT s.pid, s.saldo, COALESCE((SELECT SUM(net) FROM moviments m WHERE m.classe = s.classe AND m.pid = s.pid), 0) calc
    FROM saldos s WHERE s.classe = $1`, [classe]);
  const g = await pool.query('SELECT (SELECT saldo FROM guardioles WHERE classe = $1) saldo, (SELECT COALESCE(SUM(import), 0) FROM guardiola_moviments WHERE classe = $1) calc', [classe]);
  const errors = jug.rows.filter(r => +r.saldo !== +r.calc).map(r => ({ pid: r.pid, saldo: +r.saldo, calculat: +r.calc }));
  const gs = g.rows[0], gErr = gs.saldo != null && +gs.saldo !== +gs.calc;
  return { ok: !errors.length && !gErr, jugadors: jug.rows.length, errors, guardiola: { saldo: gs.saldo == null ? 0 : +gs.saldo, calculat: +gs.calc, ok: !gErr } };
}

export async function adminLog(c, classe, accio, detall) {
  await c.query('INSERT INTO admin_log (classe, accio, detall) VALUES ($1, $2, $3)', [classe, accio, detall || {}]);
}
