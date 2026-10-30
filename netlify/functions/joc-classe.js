// Rànquing de la classe i mercat entre agències del joc «Agència Digital».
//
// Cada alumne juga en el seu propi món, però les agències d'una mateixa classe poden:
// - veure el rànquing (dades públiques del resum: nivell, reputació, capítols, projectes...);
// - proposar-se tractes (contractar o oferir un servei) i negociar el preu amb contraofertes;
// - recomanar-se (fins a 3 recomanacions per alumne).
// Els alumnes s'identifiquen amb el codi de classe i el seu identificador secret; als companys
// només se'ls mostra un identificador públic derivat. El professor ho pot consultar tot amb la contrasenya.
//
// Netlify Blobs: magatzem 'joc-resultats' (resums dels alumnes) i 'joc-mercat'
// (tractes "<CLASSE>/o/<id>", liquidacions "<CLASSE>/s/<tracte>-<alumne>" i recomanacions "<CLASSE>/r/<de>-<a>").
const crypto = require('crypto');
const { getStore, connectLambda } = require('@netlify/blobs');

const CLASS_RE = /^[A-Z0-9_-]{1,32}$/;
const ID_RE = /^[a-z0-9-]{8,40}$/;
const PID_RE = /^[a-f0-9]{12}$/;
const OFFER_RE = /^[a-z0-9]{10,20}$/;
// Servei → habilitat de qui el fa (la qualitat depèn de com n'és d'especialista)
const SERVICES = { video: 'creativitat', fotos: 'creativitat', disseny: 'creativitat', web: 'estrategia', ads: 'estrategia', analitica: 'analitica', traduccio: 'comercial', lead: 'comercial', processos: 'gestio' };
const MIN_PRICE = 50, MAX_PRICE = 5000, MAX_OPEN = 5, MAX_ROUNDS = 4, MAX_RECS = 3;
const EXPIRE_MS = 7 * 24 * 3600 * 1000;

const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const pidOf = (classe, id) => crypto.createHash('sha256').update(classe + '/' + id).digest('hex').slice(0, 12);
const teacherPassword = () => process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || '';

function publicRow(r, classe) {
  const hab = r.habilitats || {};
  const top = Object.entries(hab).sort((a, b) => b[1] - a[1])[0];
  return {
    pid: pidOf(classe, r.id),
    nom: `${r.nom || ''} ${(r.cognom || '').slice(0, 1)}${r.cognom ? '.' : ''}`.trim(),
    agencia: r.agencia || '', aspecte: r.aspecte || null,
    nivell: r.nivell || 1, reputacio: r.reputacio || 0, liquiditat: r.liquiditat || 0,
    capitols: r.capitolsCompletats || 0, etapa: r.etapaActual || 1,
    projectes: r.projectesAprovats || 0, webs: r.websEntregades || 0, clients: r.clients || 0,
    fallides: r.fallides || 0, especialitat: top && top[1] > 0 ? top[0] : '', habilitats: hab,
    final: r.final ? 1 : 0, actualitzat: r.actualitzat || ''
  };
}
// Puntuació global: progrés, feina real aprovada i salut de l'empresa
const score = (r) => r.capitols * 10 + r.projectes * 25 + r.webs * 10 + r.nivell * 5 + r.reputacio + Math.max(-50, Math.min(100, Math.round(r.liquiditat / 1000))) - r.fallides * 30;

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Petició no vàlida.' }); }
  const classe = String(body.classe || '');
  if (!CLASS_RE.test(classe)) return json(400, { error: 'Codi de classe no vàlid.' });

  connectLambda(event);
  const results = getStore('joc-resultats');
  const market = getStore('joc-mercat');

  async function classRows() {
    const { blobs } = await results.list({ prefix: `${classe}/` });
    const all = (await Promise.all(blobs.map(b => results.get(b.key, { type: 'json' }).catch(() => null)))).filter(r => r && r.id && r.nom);
    return all.map(r => Object.assign(publicRow(r, classe), { _r: r }));
  }
  async function offers() {
    const { blobs } = await market.list({ prefix: `${classe}/o/` });
    const now = Date.now();
    return (await Promise.all(blobs.map(b => market.get(b.key, { type: 'json' }).catch(() => null)))).filter(Boolean).map(o => {
      if (['pending'].includes(o.status) && now - new Date(o.updated).getTime() > EXPIRE_MS) o.status = 'expired';
      return o;
    });
  }
  async function recs() {
    const { blobs } = await market.list({ prefix: `${classe}/r/` });
    return blobs.map(b => b.key.slice(`${classe}/r/`.length).split('-'));
  }

  // --- Professorat: tot el mercat de la classe ---
  if (body.action === 'teacher') {
    const pw = teacherPassword();
    if (!pw || body.password !== pw) return json(401, { error: 'Contrasenya incorrecta.' });
    const [rows, list, rl] = await Promise.all([classRows(), offers(), recs()]);
    const names = Object.fromEntries(rows.map(r => [r.pid, r._r.nom + ' ' + (r._r.cognom || '')]));
    return json(200, { offers: list.sort((a, b) => String(b.updated).localeCompare(String(a.updated))), recs: rl, names });
  }

  const id = String(body.id || '');
  if (!ID_RE.test(id)) return json(400, { error: 'Alumne no vàlid.' });
  const me = pidOf(classe, id);

  if (body.action === 'ranking') {
    const [rows, rl] = await Promise.all([classRows(), recs()]);
    const out = rows.map(r => { const { _r, ...pub } = r; return Object.assign(pub, { punts: score(pub), recomanacions: rl.filter(x => x[1] === r.pid).length }); });
    out.sort((a, b) => b.punts - a.punts);
    return json(200, { me, rows: out, recsGiven: rl.filter(x => x[0] === me).map(x => x[1]), maxRecs: MAX_RECS });
  }

  if (body.action === 'market') {
    const [list, rl] = await Promise.all([offers(), recs()]);
    const mine = list.filter(o => o.buyer === me || o.seller === me).sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
    // tractes acceptats que aquest alumne encara no ha liquidat
    for (const o of mine) if (o.status === 'accepted') o.pendingSettle = !(await market.get(`${classe}/s/${o.id}-${me}`).catch(() => null));
    return json(200, { me, offers: mine.slice(0, 40), recsReceived: rl.filter(x => x[1] === me).length });
  }

  if (body.action === 'offer') {
    const to = String(body.to || ''), role = body.role === 'sell' ? 'sell' : 'buy', kind = String(body.kind || '');
    const price = Math.round(Number(body.price));
    if (!PID_RE.test(to) || to === me) return json(400, { error: 'Agència no vàlida.' });
    if (!SERVICES[kind]) return json(400, { error: 'Servei no vàlid.' });
    if (!(price >= MIN_PRICE && price <= MAX_PRICE)) return json(400, { error: `El preu ha de ser entre ${MIN_PRICE} i ${MAX_PRICE} €.` });
    const rows = await classRows();
    const meRow = rows.find(r => r.pid === me), other = rows.find(r => r.pid === to);
    if (!meRow || !other) return json(400, { error: 'Les dues agències han d\'haver enviat resultats a la classe.' });
    const list = await offers();
    if (list.filter(o => (o.buyer === me || o.seller === me) && o.status === 'pending').length >= MAX_OPEN) return json(400, { error: 'Ja tens massa tractes oberts. Tanca\'n algun abans.' });
    const oid = crypto.randomBytes(8).toString('hex').slice(0, 14);
    const now = new Date().toISOString();
    const o = {
      id: oid, kind, price, status: 'pending', creator: me, turn: to, rounds: 0,
      buyer: role === 'buy' ? me : to, seller: role === 'buy' ? to : me,
      names: { [me]: meRow.nom + ' · ' + meRow.agencia, [to]: other.nom + ' · ' + other.agencia },
      history: [{ by: me, price, act: 'offer', at: now }], created: now, updated: now
    };
    await market.setJSON(`${classe}/o/${oid}`, o);
    return json(200, { ok: true, offer: o });
  }

  if (body.action === 'respond' || body.action === 'cancel' || body.action === 'settle') {
    const oid = String(body.offer || '');
    if (!OFFER_RE.test(oid)) return json(400, { error: 'Tracte no vàlid.' });
    const key = `${classe}/o/${oid}`;
    const o = await market.get(key, { type: 'json' }).catch(() => null);
    if (!o || (o.buyer !== me && o.seller !== me)) return json(404, { error: 'No s\'ha trobat el tracte.' });
    const now = new Date().toISOString();

    if (body.action === 'cancel') {
      if (o.status !== 'pending' || o.creator !== me) return json(400, { error: 'Aquest tracte ja no es pot anul·lar.' });
      o.status = 'cancelled'; o.updated = now; o.history.push({ by: me, act: 'cancel', at: now });
      await market.setJSON(key, o); return json(200, { ok: true, offer: o });
    }

    if (body.action === 'settle') {
      // Cada part cobra o paga una sola vegada quan el tracte s'ha acceptat
      const skey = `${classe}/s/${oid}-${me}`;
      if (o.status !== 'accepted' || await market.get(skey).catch(() => null)) return json(200, { ok: true, fx: null, offer: o });
      await market.setJSON(skey, { at: now });
      const q = o.quality || 1;
      const fx = me === o.buyer ? { money: -o.price, rep: 1 + q, xp: 30 } : { money: o.price, rep: 1, xp: 40 };
      return json(200, { ok: true, fx, offer: o });
    }

    // respond: accept / reject / counter
    if (o.status !== 'pending') return json(400, { error: 'Aquest tracte ja està tancat.' });
    if (Date.now() - new Date(o.updated).getTime() > EXPIRE_MS) { o.status = 'expired'; await market.setJSON(key, o); return json(400, { error: 'El tracte ha caducat.' }); }
    if (o.turn !== me) return json(400, { error: 'Ara li toca respondre a l\'altra agència.' });
    const other = me === o.buyer ? o.seller : o.buyer;
    if (body.decision === 'accept') {
      // la qualitat depèn de l'especialització de l'agència que fa la feina
      const sellerRow = (await classRows()).find(r => r.pid === o.seller);
      const lvl = sellerRow ? (sellerRow.habilitats[SERVICES[o.kind]] || 0) : 0;
      o.quality = lvl >= 3 ? 3 : lvl >= 1 ? 2 : 1;
      o.status = 'accepted'; o.history.push({ by: me, act: 'accept', price: o.price, at: now });
    } else if (body.decision === 'reject') {
      o.status = 'rejected'; o.history.push({ by: me, act: 'reject', at: now });
    } else if (body.decision === 'counter') {
      const price = Math.round(Number(body.price));
      if (o.rounds >= MAX_ROUNDS) return json(400, { error: 'S\'ha arribat al màxim de contraofertes: accepta o rebutja.' });
      if (!(price >= MIN_PRICE && price <= MAX_PRICE) || price === o.price) return json(400, { error: 'Preu de la contraoferta no vàlid.' });
      o.price = price; o.rounds++; o.turn = other; o.history.push({ by: me, act: 'counter', price, at: now });
    } else return json(400, { error: 'Resposta no vàlida.' });
    o.updated = now;
    await market.setJSON(key, o);
    return json(200, { ok: true, offer: o });
  }

  if (body.action === 'recommend') {
    const to = String(body.to || '');
    if (!PID_RE.test(to) || to === me) return json(400, { error: 'Agència no vàlida.' });
    const rl = await recs();
    if (rl.some(x => x[0] === me && x[1] === to)) return json(400, { error: 'Ja l\'has recomanada.' });
    if (rl.filter(x => x[0] === me).length >= MAX_RECS) return json(400, { error: `Només pots fer ${MAX_RECS} recomanacions.` });
    const rows = await classRows();
    if (!rows.some(r => r.pid === me) || !rows.some(r => r.pid === to)) return json(400, { error: 'Les dues agències han d\'haver enviat resultats a la classe.' });
    await market.setJSON(`${classe}/r/${me}-${to}`, { at: new Date().toISOString() });
    return json(200, { ok: true });
  }

  return json(400, { error: 'Acció desconeguda.' });
};
