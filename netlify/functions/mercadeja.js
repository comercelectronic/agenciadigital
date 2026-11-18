// Rànquing en directe dels reptes de classe de «Mercadeja» (joc de les quatre P allotjat a ecoynexo.com/jocs/mercadeja/).
//
// Cada equip juga el mateix repte al seu dispositiu i, en acabar cada ronda, el joc envia aquí el seu codi de resultat
// (configuració + registre d'accions comprimits). El servidor torna a jugar la partida amb el mateix motor
// (netlify/mercadeja-motor, còpia del de ecoynexo) i només desa el que surt de la reproducció: ningú no pot enviar
// un valor inventat.
//
// Accions (POST JSON):
//   enviar   { repte, codi }            → desa el resultat verificat de l'equip
//   ranking  { repte }                  → classificació pública (sense membres ni reflexions)
//   docent   { password, repte? }       → tots els reptes, o tots els codis d'un repte (per al rànquing del professorat)
//   esborrar { password, repte, equip } → treu un equip del rànquing
// Netlify Blobs: magatzem 'mercadeja', claus "<REPTE>/<equip>".
//
// Comptes d'alumne (usuari i contrasenya; la partida es desa al núvol i el professor en segueix el progrés):
//   registre { usuari, contrasenya, nom, classe } · entrar { usuari, contrasenya } · carregar { token }
//   desar { token, codi }                → el servidor torna a jugar la partida i en desa el codi i el resum
//   alumnes { password, classe? }        → llista de comptes amb el resum de la partida (professorat)
//   alumne { password, usuari }          → codi de la partida de l'alumne (per veure'n el detall)
//   alumne-contrasenya { password, usuari, nova }
// Netlify Blobs: magatzem 'mercadeja-comptes', claus "u/<usuari>" (compte) i "p/<usuari>" (partida).
// Les contrasenyes es desen amb scrypt i sal; la sessió és un testimoni signat amb HMAC.
const crypto = require('crypto');
const zlib = require('zlib');
const { getStore, connectLambda } = require('@netlify/blobs');
const ME = require('../mercadeja-motor/engine.js');
const LL = require('../mercadeja-motor/llicons.js');

const MAX_CODI = 80000;
const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
const teacherPassword = () => process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || '';
const slug = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

function llegeixCodi(codi) {
  const t = String(codi || '').replace(/\s+/g, ''), pre = t.slice(0, 4), dades = Buffer.from(t.slice(4), 'base64url');
  const bytes = pre === 'MJ1Z' ? zlib.inflateRawSync(dades, { maxOutputLength: 2e6 }) : pre === 'MJ1J' ? dades : null;
  if (!bytes) throw new Error('codi');
  const p = JSON.parse(bytes.toString('utf8'));
  if (!p || p.v !== 1 || !p.cfg || !Array.isArray(p.reg) || p.reg.length > 20000) throw new Error('codi');
  return p;
}

// Torna a jugar la partida i en treu el resum de cada equip d'alumnes
// La configuració no es llegeix del codi: es reconstrueix a partir del repte (només s'hi agafa el nom de l'equip)
function cfgSegura(p, rep) {
  const h = (p.cfg.empreses || [])[0] || {};
  return ME.cfgRepte(rep, { nom: String(h.nom || '').slice(0, 30), membres: (Array.isArray(h.membres) ? h.membres : []).slice(0, 4).map(x => String(x).slice(0, 40)), repteNom: String((p.cfg.repte || {}).nom || '').slice(0, 40) });
}
// Partida lliure (sense repte): només s'accepten les opcions que ofereix el joc
function cfgLliure(p) {
  const c = p.cfg, h = (c.empreses || [])[0] || {};
  const rondes = [4, 8, 12, 16, 20, 0].includes(+c.rondes) ? +c.rondes : 16;
  return { nom: 'Partida', sector: 'alimentacio', rondes, dificultat: ['facil', 'mitja', 'dificil'].includes(c.dificultat) ? c.dificultat : 'mitja', llavor: (+c.llavor >>> 0) || 1, empreses: [{ nom: String(h.nom || 'Botiga').slice(0, 30), humana: true, membres: [] }] };
}
function verifica(p, rep) {
  const { s, errors } = ME.repetir(rep ? cfgSegura(p, rep) : cfgLliure(p), ME.descompacta(p.reg));
  return s.empreses.filter(e => e.humana).map(e => {
    const h = e.hist, resp = (s.llicons || {})[e.id] || {}, cl = ME.classificacio(s);
    let des = 0; LL.llicons.forEach(l => { try { if (l.quan(s, e)) des++; } catch (x) { } });
    return {
      equip: e.nom, membres: e.membres || [], ronda: s.ronda, rondes: s.config.rondes, acabada: s.fase === 'final', fase: e.fase || 1, botigues: (e.botigues || []).length,
      valor: ME.valorEmpresa(s, e).total, resultat: h.reduce((a, x) => a + x.resultat, 0),
      quota: h.length ? Math.round(h.reduce((a, x) => a + x.quota, 0) / h.length * 10) / 10 : 0,
      posJoc: cl.findIndex(x => x.e.id === e.id) + 1, nJoc: s.empreses.length,
      llDesc: des, llResp: Object.keys(resp).length, llEnc: Object.values(resp).filter(x => x.ok).length,
      refl: String((p.refl || {})[e.id] || '').slice(0, 3000), errors
    };
  });
}
const publica = (r) => ({ equip: r.equip, valor: r.valor, ronda: r.ronda, rondes: r.rondes, acabada: r.acabada, fase: r.fase || 1, quota: r.quota, posJoc: r.posJoc, nJoc: r.nJoc, llDesc: r.llDesc, llEnc: r.llEnc, verificat: !r.errors, actualitzat: r.actualitzat });

// ---------- Comptes d'alumne ----------
const USER_RE = /^[a-z0-9._-]{3,24}$/, CLASS_RE = /^[A-Z0-9_-]{1,32}$/;
const SESSION_MS = 180 * 24 * 3600 * 1000, MAX_FAILS = 8, LOCK_MS = 5 * 60 * 1000;
const secret = () => process.env.SESSION_SECRET ? 'mercadeja/' + process.env.SESSION_SECRET : (teacherPassword() ? crypto.createHash('sha256').update('mercadeja/sessions/' + teacherPassword()).digest('hex') : '');
const hmac = (t) => crypto.createHmac('sha256', secret()).update(t).digest('base64url');
const normUser = (v) => String(v || '').trim().toLowerCase();
const normClass = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim().replace(/\s+/g, '-').replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 32).toString('hex');
function checkPw(pw, acc) { const a = Buffer.from(hashPw(pw, acc.salt), 'hex'), b = Buffer.from(acc.hash, 'hex'); return a.length === b.length && crypto.timingSafeEqual(a, b); }
function makeToken(acc) { const t = Buffer.from(JSON.stringify({ u: acc.usuari, v: acc.tv || 0, exp: Date.now() + SESSION_MS })).toString('base64url'); return t + '.' + hmac(t); }
function readToken(tok) {
  const [t, sig] = String(tok || '').split('.'); if (!t || !sig) return null;
  const good = hmac(t); if (good.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(good), Buffer.from(sig))) return null;
  try { const d = JSON.parse(Buffer.from(t, 'base64url').toString()); return d.exp > Date.now() ? d : null; } catch (e) { return null; }
}
const publicAcc = (a) => ({ usuari: a.usuari, nom: a.nom, classe: a.classe, creat: a.creat, darrer: a.darrer || null });
const resumPartida = (f) => f && { botiga: f.equip, ronda: f.ronda, rondes: f.rondes, acabada: f.acabada, fase: f.fase, botigues: f.botigues, valor: f.valor, resultat: f.resultat, quota: f.quota, posJoc: f.posJoc, nJoc: f.nJoc, llDesc: f.llDesc, llResp: f.llResp, llEnc: f.llEnc, verificat: !f.errors, repte: f.repte || null };

async function comptes(body, now) {
  const accs = getStore('mercadeja-comptes'), action = body.action;
  const getAcc = (u) => accs.get('u/' + u, { type: 'json' }).catch(() => null);
  const getSave = (u) => accs.get('p/' + u, { type: 'json' }).catch(() => null);
  if (!secret()) return json(500, { error: 'Els comptes no estan configurats (falta TEACHER_PASSWORD).' });

  if (action === 'registre') {
    const usuari = normUser(body.usuari), pw = String(body.contrasenya || ''), nom = String(body.nom || '').trim().slice(0, 60), classe = normClass(body.classe);
    if (!USER_RE.test(usuari)) return json(400, { error: 'El nom d\'usuari ha de tenir de 3 a 24 caràcters: lletres sense accents, números, punts o guions.' });
    if (pw.length < 6 || pw.length > 100) return json(400, { error: 'La contrasenya ha de tenir com a mínim 6 caràcters.' });
    if (!nom) return json(400, { error: 'Escriu el teu nom.' });
    if (!CLASS_RE.test(classe)) return json(400, { error: 'Escriu el codi de grup que t\'ha donat el professor (per exemple, CM10-2A).' });
    const salt = crypto.randomBytes(16).toString('hex');
    const acc = { usuari, nom, classe, salt, hash: hashPw(pw, salt), tv: 0, creat: now, darrer: now, fails: 0, lock: 0 };
    let creat = true;
    try { const r = await accs.setJSON('u/' + usuari, acc, { onlyIfNew: true }); if (r && r.modified === false) creat = false; }
    catch (e) { if (await getAcc(usuari)) creat = false; else throw e; }
    if (!creat) return json(409, { error: 'Aquest nom d\'usuari ja existeix. Tria\'n un altre o entra amb la teva contrasenya.' });
    return json(200, { token: makeToken(acc), compte: publicAcc(acc), partida: null });
  }
  if (action === 'entrar') {
    const usuari = normUser(body.usuari), acc = USER_RE.test(usuari) ? await getAcc(usuari) : null;
    if (!acc) return json(401, { error: 'Usuari o contrasenya incorrectes.' });
    if ((acc.lock || 0) > Date.now()) return json(429, { error: 'Massa intents. Torna-ho a provar d\'aquí a uns minuts o demana al professor que et canviï la contrasenya.' });
    if (!checkPw(body.contrasenya, acc)) {
      acc.fails = (acc.fails || 0) + 1; if (acc.fails >= MAX_FAILS) { acc.fails = 0; acc.lock = Date.now() + LOCK_MS; }
      await accs.setJSON('u/' + usuari, acc);
      return json(401, { error: 'Usuari o contrasenya incorrectes.' });
    }
    acc.fails = 0; acc.lock = 0; acc.darrer = now; await accs.setJSON('u/' + usuari, acc);
    const sv = await getSave(usuari);
    return json(200, { token: makeToken(acc), compte: publicAcc(acc), partida: sv ? { codi: sv.codi, at: sv.at } : null });
  }
  if (action === 'carregar' || action === 'desar') {
    const t = readToken(body.token), acc = t ? await getAcc(t.u) : null;
    if (!acc || (acc.tv || 0) !== t.v) return json(401, { error: 'La sessió ha caducat. Torna a entrar.', sessio: true });
    if (action === 'carregar') { const sv = await getSave(acc.usuari); return json(200, { compte: publicAcc(acc), partida: sv ? { codi: sv.codi, at: sv.at } : null }); }
    let p; try { p = llegeixCodi(body.codi); } catch (e) { return json(400, { error: 'Partida no vàlida.' }); }
    const rep = p.cfg.repte ? ME.llegirRepte(p.cfg.repte.codi) : null;
    let f; try { f = verifica(p, rep)[0]; } catch (e) { return json(400, { error: 'No s\'ha pogut reproduir la partida.' }); }
    if (!f) return json(400, { error: 'Partida no vàlida.' });
    const ant = await getSave(acc.usuari), at = Date.now(), llavor = +p.cfg.llavor || 0;
    const historial = (ant && ant.historial) || [];
    // Partida nova: la que hi havia passa a l'historial
    if (ant && ant.llavor !== llavor && ant.resum) historial.unshift(Object.assign({ at: ant.at }, ant.resum));
    if (ant && ant.llavor === llavor && ant.resum && ant.resum.ronda > f.ronda && !body.forca) return json(200, { ok: true, desat: false, motiu: 'Al núvol hi ha aquesta partida més avançada.', at: ant.at });
    if (rep) f.repte = rep.codi;
    await accs.setJSON('p/' + acc.usuari, { codi: String(body.codi).replace(/\s+/g, ''), llavor, at, resum: resumPartida(f), refl: f.refl, historial: historial.slice(0, 20) });
    if (!acc.darrer || at - new Date(acc.darrer).getTime() > 10 * 60 * 1000) { acc.darrer = now; await accs.setJSON('u/' + acc.usuari, acc); }
    return json(200, { ok: true, desat: true, at });
  }
  // Professorat
  if (!teacherPassword()) return json(500, { error: 'El panell del professorat no està configurat (falta TEACHER_PASSWORD).' });
  if (body.password !== teacherPassword()) return json(401, { error: 'Contrasenya incorrecta.' });
  if (action === 'alumnes') {
    const filtre = body.classe ? normClass(body.classe) : '';
    const { blobs } = await accs.list({ prefix: 'u/' });
    const llista = (await Promise.all(blobs.map(async b => {
      const a = await accs.get(b.key, { type: 'json' }).catch(() => null); if (!a || (filtre && a.classe !== filtre)) return null;
      const sv = await getSave(a.usuari);
      return Object.assign(publicAcc(a), { partida: sv ? Object.assign({ at: sv.at }, sv.resum) : null, partides: sv ? 1 + (sv.historial || []).length : 0, millor: sv ? Math.max(sv.resum ? sv.resum.valor : 0, ...(sv.historial || []).map(x => x.valor || 0)) : 0 });
    }))).filter(Boolean).sort((a, b) => a.classe.localeCompare(b.classe) || a.nom.localeCompare(b.nom));
    return json(200, { ok: true, alumnes: llista, grups: [...new Set(llista.map(a => a.classe))].sort() });
  }
  const usuari = normUser(body.usuari), acc = USER_RE.test(usuari) ? await getAcc(usuari) : null;
  if (!acc) return json(404, { error: 'No existeix aquest usuari.' });
  if (action === 'alumne') { const sv = await getSave(usuari); return json(200, { ok: true, compte: publicAcc(acc), codi: sv ? sv.codi : null, refl: sv ? sv.refl || '' : '', historial: sv ? sv.historial || [] : [] }); }
  if (action === 'alumne-contrasenya') {
    const nova = String(body.nova || ''); if (nova.length < 6 || nova.length > 100) return json(400, { error: 'La contrasenya ha de tenir com a mínim 6 caràcters.' });
    acc.salt = crypto.randomBytes(16).toString('hex'); acc.hash = hashPw(nova, acc.salt); acc.tv = (acc.tv || 0) + 1; acc.fails = 0; acc.lock = 0;
    await accs.setJSON('u/' + usuari, acc); return json(200, { ok: true });
  }
  return json(400, { error: 'Acció desconeguda.' });
}
const ACCIONS_COMPTE = ['registre', 'entrar', 'carregar', 'desar', 'alumnes', 'alumne', 'alumne-contrasenya'];

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if ((event.body || '').length > MAX_CODI + 2000) return json(413, { error: 'El codi és massa llarg.' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Petició no vàlida.' }); }
  const rep = body.repte ? ME.llegirRepte(body.repte) : null;
  if (body.repte && !rep) return json(400, { error: 'Codi de repte no vàlid.' });

  connectLambda(event);
  if (ACCIONS_COMPTE.includes(body.action)) return comptes(body, new Date().toISOString());
  const store = getStore('mercadeja');
  const llista = async (prefix) => {
    const { blobs } = await store.list({ prefix });
    return (await Promise.all(blobs.map(b => store.get(b.key, { type: 'json' }).catch(() => null)))).filter(Boolean);
  };

  if (body.action === 'enviar') {
    if (!rep) return json(400, { error: 'Falta el codi del repte.' });
    let p; try { p = llegeixCodi(body.codi); } catch (e) { return json(400, { error: 'Aquest codi de resultat no és vàlid.' }); }
    if (!p.cfg.repte || p.cfg.repte.codi !== rep.codi) return json(400, { error: 'El codi no correspon a aquest repte.' });
    let fitxes; try { fitxes = verifica(p, rep); } catch (e) { return json(400, { error: 'No s\'ha pogut reproduir la partida.' }); }
    if (fitxes.length !== 1 || !fitxes[0].equip) return json(400, { error: 'Partida no vàlida.' });
    const f = fitxes[0], key = rep.codi + '/' + slug(f.equip);
    if (!slug(f.equip)) return json(400, { error: 'Nom d\'equip no vàlid.' });
    const ant = await store.get(key, { type: 'json' }).catch(() => null);
    if (ant && ant.ronda > f.ronda) return json(200, { ok: true, desat: false, motiu: 'Ja hi ha un resultat més avançat d\'aquest equip.' });
    const fila = Object.assign(f, { repte: rep.codi, repteNom: String(p.cfg.repte.nom || '').slice(0, 40), codi: String(body.codi).replace(/\s+/g, ''), actualitzat: new Date().toISOString() });
    await store.setJSON(key, fila);
    return json(200, { ok: true, desat: true, verificat: !f.errors, fila: publica(fila) });
  }

  if (body.action === 'ranking') {
    if (!rep) return json(400, { error: 'Falta el codi del repte.' });
    const files = (await llista(rep.codi + '/')).map(publica).sort((a, b) => b.valor - a.valor);
    return json(200, { ok: true, repte: rep.codi, files });
  }

  // Professorat
  const password = teacherPassword();
  if (!password) return json(500, { error: 'El panell del professorat no està configurat (falta TEACHER_PASSWORD).' });
  if (body.password !== password) return json(401, { error: 'Contrasenya incorrecta.' });

  if (body.action === 'docent') {
    if (rep) return json(200, { ok: true, repte: rep.codi, files: (await llista(rep.codi + '/')).sort((a, b) => b.valor - a.valor) });
    const { blobs } = await store.list();
    const reptes = {};
    blobs.forEach(b => { const k = b.key.split('/')[0]; reptes[k] = (reptes[k] || 0) + 1; });
    const noms = {};
    await Promise.all(Object.keys(reptes).map(async k => { const f = blobs.find(b => b.key.startsWith(k + '/')); const r = f && await store.get(f.key, { type: 'json' }).catch(() => null); noms[k] = r ? r.repteNom || '' : ''; }));
    return json(200, { ok: true, reptes: Object.keys(reptes).map(k => ({ repte: k, nom: noms[k], equips: reptes[k] })) });
  }
  if (body.action === 'esborrar') {
    if (!rep || !body.equip) return json(400, { error: 'Falten dades.' });
    await store.delete(rep.codi + '/' + slug(body.equip));
    return json(200, { ok: true });
  }
  return json(400, { error: 'Acció desconeguda.' });
};
