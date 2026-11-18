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
function verifica(p, rep) {
  const { s, errors } = ME.repetir(cfgSegura(p, rep), ME.descompacta(p.reg));
  return s.empreses.filter(e => e.humana).map(e => {
    const h = e.hist, resp = (s.llicons || {})[e.id] || {}, cl = ME.classificacio(s);
    let des = 0; LL.llicons.forEach(l => { try { if (l.quan(s, e)) des++; } catch (x) { } });
    return {
      equip: e.nom, membres: e.membres || [], ronda: s.ronda, rondes: s.config.rondes, acabada: s.fase === 'final',
      valor: ME.valorEmpresa(s, e).total, resultat: h.reduce((a, x) => a + x.resultat, 0),
      quota: h.length ? Math.round(h.reduce((a, x) => a + x.quota, 0) / h.length * 10) / 10 : 0,
      posJoc: cl.findIndex(x => x.e.id === e.id) + 1, nJoc: s.empreses.length,
      llDesc: des, llResp: Object.keys(resp).length, llEnc: Object.values(resp).filter(x => x.ok).length,
      refl: String((p.refl || {})[e.id] || '').slice(0, 3000), errors
    };
  });
}
const publica = (r) => ({ equip: r.equip, valor: r.valor, ronda: r.ronda, rondes: r.rondes, acabada: r.acabada, quota: r.quota, posJoc: r.posJoc, nJoc: r.nJoc, llDesc: r.llDesc, llEnc: r.llEnc, verificat: !r.errors, actualitzat: r.actualitzat });

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if ((event.body || '').length > MAX_CODI + 2000) return json(413, { error: 'El codi és massa llarg.' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'Petició no vàlida.' }); }
  const rep = body.repte ? ME.llegirRepte(body.repte) : null;
  if (body.repte && !rep) return json(400, { error: 'Codi de repte no vàlid.' });

  connectLambda(event);
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
