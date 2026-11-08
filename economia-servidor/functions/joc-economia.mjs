// Economia del joc «Agència Digital» validada al servidor (Netlify Database).
// Totes les operacions amb diners passen per aquí: el joc les envia amb una clau d'idempotència i el servidor
// les valida (límits, una sola vegada, nota real dels projectes), hi aplica l'impost i actualitza la guardiola de la classe.
//
// Accions dels alumnes (classe + identificador secret): alta, estat, moviments, guardiola.
// Accions del professor (contrasenya TEACHER_PASSWORD): admin-estat, admin-aprovar, admin-config, admin-moviments.
import crypto from 'node:crypto';
import { getDatabase } from '@netlify/database';
import { getStore } from '@netlify/blobs';
import '../lib/gd-node.mjs';
import '../../js/data-web.js';
import '../../js/data-projects.js';
import { alta, registrar, estat, guardiolaInfo, auditoria, adminLog, getConfig, DEFAULTS } from '../lib/economia.mjs';

const GD = globalThis.GD;
const CLASS_RE = /^[A-Z0-9_-]{1,32}$/, ID_RE = /^[a-z0-9-]{8,40}$/, PID_RE = /^[a-f0-9]{12}$/;
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const pidOf = (classe, id) => sha(classe + '/' + id).slice(0, 12); // el mateix identificador públic que el rànquing de la classe
const json = (status, body) => Response.json(body, { status });
const teacherPassword = () => process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || '';
let pool = null;
const db = () => (pool || (pool = getDatabase().pool));

// Màxim que es pot cobrar per un projecte o una web: el decideix la nota desada al servidor (amb el +25 % màxim de bonificacions)
function maxPagamentFactory(classe, id) {
  let tasks = null;
  return async (tipus, ref) => {
    if (!tasks) { let rev = null; try { rev = await getStore('joc-revisions').get(`${classe}/${id}`, { type: 'json' }); } catch (e) { rev = null; } tasks = (rev && rev.tasks) || {}; }
    const rv = tasks[ref];
    if (!rv || rv.status !== 'approved') return null;
    const g = rv.grade != null ? rv.grade : GD.PASS_GRADE;
    if (tipus === 'projecte') { const p = GD.projectById(ref); return p ? Math.ceil(GD.payFor(GD.projMax(p), g) * 1.25) : null; }
    const L = GD.webLevels.find(x => 'web-' + x.n === ref);
    return L ? Math.ceil(GD.payFor(GD.webMax(L), g) * 1.25) : null;
  };
}

function validConfig(clau, valor) {
  if (clau === 'impost') return valor && Array.isArray(valor.trams) && valor.trams.length && valor.trams.length <= 6 && valor.trams.every(t => Number.isFinite(t.des) && t.des >= 0 && Number.isFinite(t.pct) && t.pct >= 0 && t.pct <= 50) && (!valor.tipus || (Array.isArray(valor.tipus) && valor.tipus.every(x => DEFAULTS.impost.tipus.includes(x))));
  if (clau === 'limits') return valor && Object.entries(valor).every(([k, v]) => k in DEFAULTS.limits && Number.isFinite(v));
  if (clau === 'inicial') return Number.isInteger(valor) && valor >= 0 && valor <= 100000;
  if (clau === 'autoaprovar') return typeof valor === 'boolean';
  return false;
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Mètode no permès' });
  let body;
  try { body = await req.json(); } catch (e) { return json(400, { error: 'JSON no vàlid' }); }
  const action = String(body.action || '');
  try {
    if (!action.startsWith('admin-')) {
      const classe = String(body.classe || ''), id = String(body.id || '');
      if (!CLASS_RE.test(classe) || !ID_RE.test(id)) return json(400, { error: 'Alumne no vàlid.' });
      const pid = pidOf(classe, id), P = db();
      const reg = await alta(P, { classe, pid, idHash: sha(id), nom: body.nom, agencia: body.agencia });
      if (action === 'alta' || action === 'estat') return json(200, Object.assign({ pid }, await estat(P, classe, pid)));
      if (action === 'guardiola') return json(200, await guardiolaInfo(P, classe));
      if (action === 'moviments') {
        const evs = Array.isArray(body.events) ? body.events.slice(0, 50) : [];
        const ctx = { maxPagament: maxPagamentFactory(classe, id) };
        const results = [];
        if (!reg.bloquejat) for (const ev of evs) results.push(await registrar(P, classe, pid, ev, ctx));
        return json(200, { results, estat: await estat(P, classe, pid) });
      }
      return json(400, { error: 'Acció desconeguda.' });
    }
    // Professorat
    const pw = teacherPassword();
    if (!pw) return json(500, { error: 'El panell del professorat no està configurat.' });
    if (body.password !== pw) return json(401, { error: 'Contrasenya incorrecta.' });
    const classe = String(body.classe || '');
    if (!(CLASS_RE.test(classe) || (action === 'admin-config' && classe === '*'))) return json(400, { error: 'Codi de classe no vàlid.' });
    const P = db();
    if (action === 'admin-estat') {
      const [jug, rej, logs] = await Promise.all([
        P.query(`SELECT j.pid, j.nom, j.agencia, j.aprovat, j.bloquejat, j.creat_at, COALESCE(s.saldo, 0) saldo,
          (SELECT COUNT(*) FROM moviments m WHERE m.classe = j.classe AND m.pid = j.pid) moviments,
          (SELECT COUNT(*) FROM rebutjats r WHERE r.classe = j.classe AND r.pid = j.pid) rebutjats,
          (SELECT COALESCE(SUM(impost), 0) FROM moviments m WHERE m.classe = j.classe AND m.pid = j.pid) impostos
          FROM jugadors j LEFT JOIN saldos s ON s.classe = j.classe AND s.pid = j.pid WHERE j.classe = $1 ORDER BY j.creat_at`, [classe]),
        P.query('SELECT r.pid, j.nom, r.tipus, r.ref, r.import_demanat, r.motiu, r.creat_at FROM rebutjats r LEFT JOIN jugadors j ON j.classe = r.classe AND j.pid = r.pid WHERE r.classe = $1 ORDER BY r.id DESC LIMIT 50', [classe]),
        P.query("SELECT accio, detall, creat_at FROM admin_log WHERE classe = $1 OR classe = '*' ORDER BY id DESC LIMIT 30", [classe])
      ]);
      return json(200, {
        jugadors: jug.rows.map(r => Object.assign(r, { saldo: +r.saldo, moviments: +r.moviments, rebutjats: +r.rebutjats, impostos: +r.impostos })),
        rebutjats: rej.rows, admin: logs.rows, guardiola: await guardiolaInfo(P, classe), config: await getConfig(P, classe), auditoria: await auditoria(P, classe)
      });
    }
    if (action === 'admin-aprovar') {
      const pid = String(body.pid || '');
      if (!PID_RE.test(pid)) return json(400, { error: 'Alumne no vàlid.' });
      const c = await P.connect();
      try {
        await c.query('BEGIN');
        const r = await c.query('UPDATE jugadors SET aprovat = $3, bloquejat = $4 WHERE classe = $1 AND pid = $2 RETURNING nom', [classe, pid, !!body.aprovat, !!body.bloquejat]);
        if (!r.rows.length) { await c.query('ROLLBACK'); return json(404, { error: 'No existeix.' }); }
        await adminLog(c, classe, 'aprovar', { pid, nom: r.rows[0].nom, aprovat: !!body.aprovat, bloquejat: !!body.bloquejat });
        await c.query('COMMIT');
      } catch (e) { await c.query('ROLLBACK').catch(() => { }); throw e; } finally { c.release(); }
      return json(200, { ok: true });
    }
    if (action === 'admin-config') {
      const clau = String(body.clau || '');
      if (!validConfig(clau, body.valor)) return json(400, { error: 'Valor no vàlid.' });
      const c = await P.connect();
      try {
        await c.query('BEGIN');
        const prev = await c.query('SELECT valor FROM config WHERE classe = $1 AND clau = $2', [classe, clau]);
        await c.query('INSERT INTO config (classe, clau, valor) VALUES ($1, $2, $3) ON CONFLICT (classe, clau) DO UPDATE SET valor = EXCLUDED.valor, actualitzat = NOW()', [classe, clau, JSON.stringify(body.valor)]);
        await adminLog(c, classe, 'config', { clau, abans: prev.rows[0] ? prev.rows[0].valor : null, despres: body.valor });
        await c.query('COMMIT');
      } catch (e) { await c.query('ROLLBACK').catch(() => { }); throw e; } finally { c.release(); }
      return json(200, { ok: true, config: await getConfig(P, classe === '*' ? 'ZZZ' : classe) });
    }
    if (action === 'admin-moviments') {
      const pid = String(body.pid || '');
      const r = await P.query(`SELECT m.pid, j.nom, m.tipus, m.ref, m.brut, m.impost, m.net, m.saldo_final, m.creat_at FROM moviments m LEFT JOIN jugadors j ON j.classe = m.classe AND j.pid = m.pid
        WHERE m.classe = $1 ${PID_RE.test(pid) ? 'AND m.pid = $2' : ''} ORDER BY m.id DESC LIMIT 200`, PID_RE.test(pid) ? [classe, pid] : [classe]);
      return json(200, { moviments: r.rows });
    }
    return json(400, { error: 'Acció desconeguda.' });
  } catch (e) {
    console.error('Economia:', e && e.message);
    return json(500, { error: e && e.message === 'identitat' ? 'Identitat no vàlida.' : 'Error del servidor.' });
  }
};
