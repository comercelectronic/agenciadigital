// Comptes d'alumne del joc «Palet» (ecoynexo.com/jocs/palet/): usuari i contrasenya, partida desada al núvol i seguiment del professorat.
//
//   registre { usuari, contrasenya, nom, classe } · entrar { usuari, contrasenya } · carregar { token }
//   desar { token, partida }              → desa la partida i en calcula el resum (nivell, torns, nota mitjana, avisos…)
//   alumnes { password, classe? }         → llista d'alumnes amb el resum (professorat, TEACHER_PASSWORD)
//   alumne { password, usuari }           → historial de torns de l'alumne
//   alumne-contrasenya { password, usuari, nova }
// Palet es juga en temps real: el servidor no pot tornar a jugar la partida, però en comprova la forma i en recalcula el resum.
// Netlify Blobs: magatzem 'palet-comptes', claus "u/<usuari>" (compte) i "p/<usuari>" (partida).
const crypto = require('crypto');
const { getStore, connectLambda } = require('@netlify/blobs');

const MAX = 400 * 1024;
const USER_RE = /^[a-z0-9._-]{3,24}$/, CLASS_RE = /^[A-Z0-9_-]{1,32}$/;
const SESSION_MS = 180 * 24 * 3600 * 1000, MAX_FAILS = 8, LOCK_MS = 5 * 60 * 1000;
const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
const teacherPassword = () => process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || '';
const secret = () => process.env.SESSION_SECRET ? 'palet/' + process.env.SESSION_SECRET : (teacherPassword() ? crypto.createHash('sha256').update('palet/sessions/' + teacherPassword()).digest('hex') : '');
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
const NIVELLS = ['Mosso de magatzem', 'Preparador de comandes', 'Carretoner', 'Cap d\'equip', 'Cap de magatzem'];
const num = (v, min, max) => { const n = Math.round(+v); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min; };

// Resum de la partida a partir de l'historial de torns (no es fia de cap resum que enviï el joc)
const MAGATZEMS = ['aliment', 'fred', 'cross', 'ecom', 'recanvis'];
// Continguts del temari (1.1 … 8.4) treballats: a partir de cada torn (cont), les lliçons i el taller d'habilitat
const COD = /^[1-8]\.[1-9]$/;
const LLICO_CONT = { recepcio: ['2.1', '2.2', '2.3'], codis: ['1.5'], criteris: ['1.6'], fefo: ['4.2'], picking: ['5.1'], paletitzar: ['5.4'], rutes: ['5.3'], carrega: ['5.6'], seguretat: ['7.1'], transpalet: ['6.1'], fred: ['3.2'], perillosos: ['3.4'], estanteries: ['1.3'], compacta: ['1.3'], cross: ['1.1'], ecom: ['5.2', '5.4'], fredtemps: ['3.2'], inventari: ['4.1', '4.4'] };
const TALLER_CONT = { manual: ['7.2', '3.3'], extraccio: ['7.2', '3.3'], transpalet: ['6.1'], toro: ['6.2', '6.3', '6.4'] };
function cobertura(p) {
  const out = {}, o = (k) => (out[k] = out[k] || { fets: 0, ok: 0, teoria: null, taller: null });
  (Array.isArray(p.historial) ? p.historial : []).slice(-400).forEach(x => {
    const c = x && x.cont; if (!c || typeof c !== 'object') return;
    Object.keys(c).slice(0, 60).forEach(k => { if (!COD.test(k)) return; const e = o(k); e.fets++; if (c[k] === 'ok') e.ok++; });
  });
  if (p.llicons && typeof p.llicons === 'object') Object.keys(p.llicons).slice(0, 60).forEach(id => (LLICO_CONT[id] || []).forEach(k => { const e = o(k); e.teoria = e.teoria || !!(p.llicons[id] && p.llicons[id].ok); }));
  if (p.taller && typeof p.taller === 'object') Object.keys(p.taller).slice(0, 20).forEach(id => (TALLER_CONT[id] || []).forEach(k => { const e = o(k); e.taller = Math.max(e.taller || 0, num(p.taller[id], 0, 100)); }));
  return out;
}
function resum(p) {
  const h = (Array.isArray(p.historial) ? p.historial : []).slice(-400).map(x => ({ torn: num(x.torn, 0, 9999), nivell: num(x.nivell, 1, 5), nota: num(x.nota, 0, 100), productivitat: num(x.productivitat, 0, 100), qualitat: num(x.qualitat, 0, 100), seguretat: num(x.seguretat, 0, 100), veredicte: ['bo', 'regular', 'bronca'].includes(x.veredicte) ? x.veredicte : 'regular', canvi: ['ascens', 'acomiadament'].includes(x.canvi) ? x.canvi : null,
    errors: (Array.isArray(x.errors) ? x.errors : []).concat(Array.isArray(x.greus) ? x.greus : []).slice(0, 40).map(e => String((e || [])[0] || '').slice(0, 20)) }));
  const temes = {}; h.forEach(x => x.errors.forEach(t => { temes[t] = (temes[t] || 0) + 1; }));
  const ll = p.llicons && typeof p.llicons === 'object' ? Object.values(p.llicons) : [];
  return { nom: String((p.config || {}).nom || '').slice(0, 30), magatzem: MAGATZEMS.includes((p.config || {}).magatzem) ? p.config.magatzem : 'aliment', nivell: num(p.nivell, 1, 5), nivellNom: NIVELLS[num(p.nivell, 1, 5) - 1], torns: h.length, avisos: num(p.avisos, 0, 3),
    notaMitja: h.length ? Math.round(h.reduce((a, x) => a + x.nota, 0) / h.length) : null, darreraNota: h.length ? h[h.length - 1].nota : null,
    broncas: h.filter(x => x.veredicte === 'bronca').length, ascensos: h.filter(x => x.canvi === 'ascens').length, acomiadaments: h.filter(x => x.canvi === 'acomiadament').length,
    acomiadat: !!(p.final && p.final.tipus === 'acomiadament'), errorsFreq: Object.entries(temes).sort((a, b) => b[1] - a[1]).slice(0, 4), llResp: ll.length, llEnc: ll.filter(x => x && x.ok).length,
    cont: cobertura(p),
    historial: h.slice(-60).map(({ errors, ...x }) => Object.assign(x, { errors: errors.length })) };
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if ((event.body || '').length > MAX) return json(413, { error: 'La partida és massa gran.' });
  let body; try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Petició no vàlida.' }); }
  if (!secret()) return json(500, { error: 'Els comptes no estan configurats (falta TEACHER_PASSWORD).' });
  connectLambda(event);
  const accs = getStore('palet-comptes'), action = String(body.action || ''), now = new Date().toISOString();
  const getAcc = (u) => accs.get('u/' + u, { type: 'json' }).catch(() => null);
  const getSave = (u) => accs.get('p/' + u, { type: 'json' }).catch(() => null);

  if (action === 'registre') {
    const usuari = normUser(body.usuari), pw = String(body.contrasenya || ''), nom = String(body.nom || '').trim().slice(0, 60), classe = normClass(body.classe);
    if (!USER_RE.test(usuari)) return json(400, { error: 'El nom d\'usuari ha de tenir de 3 a 24 caràcters: lletres sense accents, números, punts o guions.' });
    if (pw.length < 6 || pw.length > 100) return json(400, { error: 'La contrasenya ha de tenir com a mínim 6 caràcters.' });
    if (!nom) return json(400, { error: 'Escriu el teu nom.' });
    if (!CLASS_RE.test(classe)) return json(400, { error: 'Escriu el codi de grup que t\'ha donat el professor (per exemple, CM10-2A).' });
    const salt = crypto.randomBytes(16).toString('hex');
    const acc = { usuari, nom, classe, salt, hash: hashPw(pw, salt), tv: 0, creat: now, darrer: now, fails: 0, lock: 0 };
    let creat = true;
    try { const r = await accs.setJSON('u/' + usuari, acc, { onlyIfNew: true }); if (r && r.modified === false) creat = false; } catch (e) { if (await getAcc(usuari)) creat = false; else throw e; }
    if (!creat) return json(409, { error: 'Aquest nom d\'usuari ja existeix. Tria\'n un altre o entra amb la teva contrasenya.' });
    return json(200, { token: makeToken(acc), compte: publicAcc(acc), partida: null });
  }
  if (action === 'entrar') {
    const usuari = normUser(body.usuari), acc = USER_RE.test(usuari) ? await getAcc(usuari) : null;
    if (!acc) return json(401, { error: 'Usuari o contrasenya incorrectes.' });
    if ((acc.lock || 0) > Date.now()) return json(429, { error: 'Massa intents. Torna-ho a provar d\'aquí a uns minuts o demana al professor que et canviï la contrasenya.' });
    if (!checkPw(body.contrasenya, acc)) { acc.fails = (acc.fails || 0) + 1; if (acc.fails >= MAX_FAILS) { acc.fails = 0; acc.lock = Date.now() + LOCK_MS; } await accs.setJSON('u/' + usuari, acc); return json(401, { error: 'Usuari o contrasenya incorrectes.' }); }
    acc.fails = 0; acc.lock = 0; acc.darrer = now; await accs.setJSON('u/' + usuari, acc);
    const sv = await getSave(usuari);
    return json(200, { token: makeToken(acc), compte: publicAcc(acc), partida: sv ? sv.partida : null, at: sv ? sv.at : null });
  }
  if (action === 'carregar' || action === 'desar') {
    const t = readToken(body.token), acc = t ? await getAcc(t.u) : null;
    if (!acc || (acc.tv || 0) !== t.v) return json(401, { error: 'La sessió ha caducat. Torna a entrar.', sessio: true });
    if (action === 'carregar') { const sv = await getSave(acc.usuari); return json(200, { compte: publicAcc(acc), partida: sv ? sv.partida : null, at: sv ? sv.at : null }); }
    const p = body.partida;
    if (!p || typeof p !== 'object' || p.v !== 1 || !Array.isArray(p.historial) || !p.config) return json(400, { error: 'Partida no vàlida.' });
    const ant = await getSave(acc.usuari);
    // Una partida nova (llavor diferent) substitueix l'anterior, que queda a l'historial de partides
    const partides = (ant && ant.partides) || [];
    if (ant && ant.partida && ant.partida.config && ant.partida.config.llavor !== p.config.llavor && ant.resum && ant.resum.torns) partides.unshift(Object.assign({ at: ant.at }, ant.resum, { historial: undefined }));
    const at = Date.now();
    await accs.setJSON('p/' + acc.usuari, { partida: p, at, resum: resum(p), partides: partides.slice(0, 10) });
    if (!acc.darrer || at - new Date(acc.darrer).getTime() > 10 * 60 * 1000) { acc.darrer = now; await accs.setJSON('u/' + acc.usuari, acc); }
    return json(200, { ok: true, at });
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
      return Object.assign(publicAcc(a), { partida: sv && sv.resum ? Object.assign({ at: sv.at }, sv.resum, { historial: undefined }) : null, partides: sv ? 1 + (sv.partides || []).length : 0 });
    }))).filter(Boolean).sort((a, b) => a.classe.localeCompare(b.classe) || a.nom.localeCompare(b.nom));
    return json(200, { ok: true, alumnes: llista, grups: [...new Set(llista.map(a => a.classe))].sort() });
  }
  const usuari = normUser(body.usuari), acc = USER_RE.test(usuari) ? await getAcc(usuari) : null;
  if (!acc) return json(404, { error: 'No existeix aquest usuari.' });
  if (action === 'alumne') { const sv = await getSave(usuari); return json(200, { ok: true, compte: publicAcc(acc), resum: sv ? sv.resum : null, partides: sv ? sv.partides || [] : [] }); }
  if (action === 'alumne-contrasenya') {
    const nova = String(body.nova || ''); if (nova.length < 6 || nova.length > 100) return json(400, { error: 'La contrasenya ha de tenir com a mínim 6 caràcters.' });
    acc.salt = crypto.randomBytes(16).toString('hex'); acc.hash = hashPw(nova, acc.salt); acc.tv = (acc.tv || 0) + 1; acc.fails = 0; acc.lock = 0;
    await accs.setJSON('u/' + usuari, acc); return json(200, { ok: true });
  }
  return json(400, { error: 'Acció desconeguda.' });
};
