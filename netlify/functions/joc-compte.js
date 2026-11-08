// Comptes dels alumnes del joc «Agència Digital»: usuari i contrasenya, partida desada al núvol i grup.
//
// Alumnes:
//   registre { usuari, contrasenya, nom, classe }  → crea el compte (el grup el tria l'alumne amb el codi del professor)
//   entrar   { usuari, contrasenya }               → sessió + partida desada
//   carregar { token }                             → compte + partida
//   desar    { token, partida }                    → desa la partida (el grup sempre el posa el servidor)
//   contrasenya { token, actual, nova }
// Professorat (contrasenya TEACHER_PASSWORD):
//   admin-comptes { classe? }                      → llista de comptes (sense contrasenyes)
//   admin-grup { usuari, classe }                  → canvia el grup i hi mou els resultats i les revisions
//   admin-contrasenya { usuari, nova }             → restableix la contrasenya (tanca les sessions obertes)
//
// Netlify Blobs: 'joc-comptes' ("u/<usuari>" compte, "id/<id>" índex) i 'joc-partides' ("<usuari>" partida).
// Les contrasenyes es desen amb scrypt i sal; la sessió és un testimoni signat amb HMAC.
const crypto = require('crypto');
const { getStore, connectLambda } = require('@netlify/blobs');

const USER_RE = /^[a-z0-9._-]{3,24}$/;
const CLASS_RE = /^[A-Z0-9_-]{1,32}$/;
const MAX_BYTES = 950 * 1024;
const SESSION_MS = 120 * 24 * 3600 * 1000;
const MAX_FAILS = 8, LOCK_MS = 5 * 60 * 1000;

const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const teacherPassword = () => process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || '';
const secret = () => process.env.SESSION_SECRET || (teacherPassword() ? crypto.createHash('sha256').update('agencia-digital/sessions/' + teacherPassword()).digest('hex') : '');
const b64 = (s) => Buffer.from(s).toString('base64url');
const hmac = (s) => crypto.createHmac('sha256', secret()).update(s).digest('base64url');
const normUser = (v) => String(v || '').trim().toLowerCase();
const normClass = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim().replace(/\s+/g, '-').replace(/[^A-Z0-9_-]/g, '').slice(0, 32);

function hashPw(pw, salt) { return crypto.scryptSync(String(pw), salt, 32).toString('hex'); }
function checkPw(pw, acc) {
  const a = Buffer.from(hashPw(pw, acc.salt), 'hex'), b = Buffer.from(acc.hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function makeToken(acc) {
  const p = b64(JSON.stringify({ u: acc.usuari, v: acc.tv || 0, exp: Date.now() + SESSION_MS }));
  return p + '.' + hmac(p);
}
function readToken(t) {
  const [p, sig] = String(t || '').split('.');
  if (!p || !sig) return null;
  const good = hmac(p);
  if (good.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(good), Buffer.from(sig))) return null;
  try { const d = JSON.parse(Buffer.from(p, 'base64url').toString()); return d.exp > Date.now() ? d : null; } catch (e) { return null; }
}
const publicAcc = (a) => ({ usuari: a.usuari, nom: a.nom, classe: a.classe, id: a.id, creat: a.creat, darrer: a.darrer || null });
function newId() { return crypto.randomUUID(); }

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if ((event.body || '').length > MAX_BYTES) return json(413, { error: 'La partida és massa gran.' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Petició no vàlida.' }); }
  if (!secret()) return json(500, { error: 'Els comptes no estan configurats (falta TEACHER_PASSWORD a Netlify).' });

  connectLambda(event);
  const accs = getStore('joc-comptes'), saves = getStore('joc-partides');
  const getAcc = (u) => accs.get('u/' + u, { type: 'json' }).catch(() => null);
  const action = String(body.action || '');
  const now = new Date().toISOString();

  // Sessió de l'alumne
  async function session() {
    const t = readToken(body.token);
    if (!t) return null;
    const acc = await getAcc(t.u);
    return acc && (acc.tv || 0) === t.v ? acc : null;
  }
  const loadSave = async (u) => (await saves.get(u, { type: 'json' }).catch(() => null)) || null;

  if (action === 'registre') {
    const usuari = normUser(body.usuari), pw = String(body.contrasenya || ''), nom = String(body.nom || '').trim().slice(0, 60), classe = normClass(body.classe);
    if (!USER_RE.test(usuari)) return json(400, { error: 'El nom d\'usuari ha de tenir de 3 a 24 caràcters: lletres sense accents, números, punts o guions.' });
    if (pw.length < 6 || pw.length > 100) return json(400, { error: 'La contrasenya ha de tenir com a mínim 6 caràcters.' });
    if (!nom) return json(400, { error: 'Escriu el teu nom.' });
    if (!CLASS_RE.test(classe)) return json(400, { error: 'Escriu el codi de grup que t\'ha donat el professor.' });
    const salt = crypto.randomBytes(16).toString('hex');
    const acc = { usuari, nom, classe, id: newId(), salt, hash: hashPw(pw, salt), tv: 0, creat: now, darrer: now, fails: 0, lock: 0 };
    let created = true;
    try { const r = await accs.setJSON('u/' + usuari, acc, { onlyIfNew: true }); if (r && r.modified === false) created = false; }
    catch (e) { if (await getAcc(usuari)) created = false; else throw e; }
    if (!created) return json(409, { error: 'Aquest nom d\'usuari ja existeix. Tria\'n un altre o entra amb la teva contrasenya.' });
    await accs.setJSON('id/' + acc.id, { usuari });
    return json(200, { token: makeToken(acc), compte: publicAcc(acc), partida: null });
  }

  if (action === 'entrar') {
    const usuari = normUser(body.usuari), acc = USER_RE.test(usuari) ? await getAcc(usuari) : null;
    if (!acc) return json(401, { error: 'Usuari o contrasenya incorrectes.' });
    if ((acc.lock || 0) > Date.now()) return json(429, { error: 'Massa intents. Torna-ho a provar d\'aquí a uns minuts o demana al professor que et canviï la contrasenya.' });
    if (!checkPw(body.contrasenya, acc)) {
      acc.fails = (acc.fails || 0) + 1;
      if (acc.fails >= MAX_FAILS) { acc.fails = 0; acc.lock = Date.now() + LOCK_MS; }
      await accs.setJSON('u/' + usuari, acc);
      return json(401, { error: 'Usuari o contrasenya incorrectes.' });
    }
    acc.fails = 0; acc.lock = 0; acc.darrer = now;
    await accs.setJSON('u/' + usuari, acc);
    const sv = await loadSave(usuari);
    return json(200, { token: makeToken(acc), compte: publicAcc(acc), partida: sv ? sv.partida : null, at: sv ? sv.at : null });
  }

  if (['carregar', 'desar', 'contrasenya'].includes(action)) {
    const acc = await session();
    if (!acc) return json(401, { error: 'La sessió ha caducat. Torna a entrar.', sessio: true });
    if (action === 'carregar') {
      const sv = await loadSave(acc.usuari);
      return json(200, { compte: publicAcc(acc), partida: sv ? sv.partida : null, at: sv ? sv.at : null });
    }
    if (action === 'desar') {
      const p = body.partida;
      if (!p || typeof p !== 'object' || !p.player) return json(400, { error: 'Partida no vàlida.' });
      // El grup i l'identificador els decideix el servidor (només el professor pot canviar el grup)
      p.classe = acc.classe; p.player.id = acc.id;
      const at = Date.now();
      await saves.setJSON(acc.usuari, { partida: p, at });
      if (!acc.darrer || Date.now() - new Date(acc.darrer).getTime() > 10 * 60 * 1000) { acc.darrer = now; await accs.setJSON('u/' + acc.usuari, acc); }
      return json(200, { ok: true, at, compte: publicAcc(acc) });
    }
    if (action === 'contrasenya') {
      if (!checkPw(body.actual, acc)) return json(401, { error: 'La contrasenya actual no és correcta.' });
      const nova = String(body.nova || '');
      if (nova.length < 6 || nova.length > 100) return json(400, { error: 'La contrasenya nova ha de tenir com a mínim 6 caràcters.' });
      acc.salt = crypto.randomBytes(16).toString('hex'); acc.hash = hashPw(nova, acc.salt); acc.tv = (acc.tv || 0) + 1;
      await accs.setJSON('u/' + acc.usuari, acc);
      return json(200, { ok: true, token: makeToken(acc) });
    }
  }

  // Professorat
  if (!action.startsWith('admin-')) return json(400, { error: 'Acció desconeguda.' });
  if (!teacherPassword()) return json(500, { error: 'El panell del professorat no està configurat.' });
  if (body.password !== teacherPassword()) return json(401, { error: 'Contrasenya incorrecta.' });

  if (action === 'admin-comptes') {
    const filtre = body.classe ? normClass(body.classe) : '';
    const { blobs } = await accs.list({ prefix: 'u/' });
    const list = (await Promise.all(blobs.map(b => accs.get(b.key, { type: 'json' }).catch(() => null)))).filter(Boolean)
      .filter(a => !filtre || a.classe === filtre).map(publicAcc).sort((a, b) => a.classe.localeCompare(b.classe) || a.nom.localeCompare(b.nom));
    return json(200, { comptes: list });
  }

  const usuari = normUser(body.usuari), acc = USER_RE.test(usuari) ? await getAcc(usuari) : null;
  if (!acc) return json(404, { error: 'No existeix aquest usuari.' });

  if (action === 'admin-grup') {
    const nova = normClass(body.classe);
    if (!CLASS_RE.test(nova)) return json(400, { error: 'Codi de grup no vàlid.' });
    const vella = acc.classe;
    if (nova !== vella) {
      // Mou els resultats i les revisions dels projectes al grup nou
      const res = getStore('joc-resultats'), rev = getStore('joc-revisions');
      const from = `${vella}/${acc.id}`, to = `${nova}/${acc.id}`;
      const r = await res.get(from, { type: 'json' }).catch(() => null);
      if (r) { await res.setJSON(to, Object.assign(r, { classe: nova })); await res.delete(from); }
      const v = await rev.get(from, { type: 'json' }).catch(() => null);
      if (v) { await rev.setJSON(to, v); await rev.delete(from); }
      acc.classe = nova;
      await accs.setJSON('u/' + usuari, acc);
      const sv = await loadSave(usuari);
      if (sv && sv.partida) { sv.partida.classe = nova; sv.partida.lastSync = 0; await saves.setJSON(usuari, sv); }
    }
    return json(200, { ok: true, compte: publicAcc(acc), abans: vella });
  }

  if (action === 'admin-contrasenya') {
    const nova = String(body.nova || '');
    if (nova.length < 6 || nova.length > 100) return json(400, { error: 'La contrasenya ha de tenir com a mínim 6 caràcters.' });
    acc.salt = crypto.randomBytes(16).toString('hex'); acc.hash = hashPw(nova, acc.salt); acc.tv = (acc.tv || 0) + 1; acc.fails = 0; acc.lock = 0;
    await accs.setJSON('u/' + usuari, acc);
    return json(200, { ok: true });
  }

  return json(400, { error: 'Acció desconeguda.' });
};
