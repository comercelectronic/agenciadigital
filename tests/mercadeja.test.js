// Proves de la funció del rànquing de Mercadeja amb un magatzem de Netlify Blobs simulat en memòria.
// node tests/mercadeja.test.js
const assert = require('assert');
const zlib = require('zlib');
const Module = require('module');

// @netlify/blobs simulat
const dades = {};
const original = Module._load;
Module._load = function (req, ...a) {
  if (req === '@netlify/blobs') return {
    connectLambda: () => { },
    getStore: (nom) => ({
      get: async (k) => { const v = dades[nom + ':' + k]; return v == null ? null : JSON.parse(v); },
      setJSON: async (k, v) => { dades[nom + ':' + k] = JSON.stringify(v); },
      delete: async (k) => { delete dades[nom + ':' + k]; },
      list: async (o) => ({ blobs: Object.keys(dades).filter(k => k.startsWith(nom + ':' + ((o && o.prefix) || ''))).map(k => ({ key: k.slice(nom.length + 1) })) })
    })
  };
  return original.call(this, req, ...a);
};
process.env.TEACHER_PASSWORD = 'secret';
const { handler } = require('../netlify/functions/mercadeja.js');
const ME = require('../netlify/mercadeja-motor/engine.js');
const crida = async (body) => { const r = await handler({ httpMethod: 'POST', body: JSON.stringify(body) }); return { st: r.statusCode, ...JSON.parse(r.body) }; };

// Juga un repte com el joc (registrant les accions) i en fa el codi de resultat
function jugaRepte(rep, nom, rondes) {
  const s = ME.crearPartida(ME.cfgRepte(rep, { nom, membres: ['A'] })); s.reg = [];
  const fa = (a) => { const x = ME.accio(s, a); if (!x.repetida && (x.ok || x.muta)) { const c = Object.assign({}, a); delete c.id; s.reg.push(c); } return x; };
  const fia = (k, emp) => { s.reg.push({ ia: k, emp: emp == null ? null : emp }); return ME.aplica(s, { ia: k, emp }); };
  fia('I');
  while (s.fase !== 'final' && !(s.fase === 'resultats' && s.ronda >= rondes)) {
    const e = s.empreses[s.torn];
    if (s.fase === 'decisions') { if (e.humana) { fa({ tipus: 'campanya', emp: e.id, camp: 'xarxes' }); fa({ tipus: 'confirmar', emp: e.id }); } else fia('D', e.id); }
    else if (s.fase === 'moviment') { if (!s.pendent) fa({ tipus: 'tirar', emp: e.id }); else if (e.humana) fa({ tipus: 'passar', emp: e.id }); else fia('R', e.id); }
    else fa({ tipus: 'continuar' });
  }
  const p = { v: 1, cfg: s.config, reg: ME.compacta(s.reg), refl: { 0: 'Reflexió de prova' } };
  return { s, codi: 'MJ1Z' + zlib.deflateRawSync(Buffer.from(JSON.stringify(p))).toString('base64url'), p };
}

(async () => {
  const rep = ME.llegirRepte(ME.codiRepte('alimentacio', 4, 'mitja', 777));
  const a = jugaRepte(rep, 'Equip Alfa', 2), b = jugaRepte(rep, 'Equip Beta', 4);

  let r = await crida({ action: 'enviar', repte: rep.codi, codi: a.codi });
  assert.strictEqual(r.st, 200); assert.ok(r.desat && r.verificat);
  assert.strictEqual(r.fila.valor, ME.valorEmpresa(a.s, a.s.empreses[0]).total, 'el servidor calcula el mateix valor que el joc');
  r = await crida({ action: 'enviar', repte: rep.codi, codi: b.codi }); assert.ok(r.desat);

  // Un codi més endarrerit no substitueix el més avançat
  const a1 = jugaRepte(rep, 'Equip Alfa', 1);
  r = await crida({ action: 'enviar', repte: rep.codi, codi: a1.codi }); assert.strictEqual(r.desat, false);

  // Manipulació: canviar la tresoreria inicial o afegir accions impossibles no passa la verificació
  const fals = JSON.parse(JSON.stringify(a.p)); fals.cfg.capital = 900000;
  r = await crida({ action: 'enviar', repte: rep.codi, codi: 'MJ1Z' + zlib.deflateRawSync(Buffer.from(JSON.stringify(fals))).toString('base64url') });
  const v = (await crida({ action: 'ranking', repte: rep.codi })).files.find(x => x.equip === 'Equip Alfa');
  assert.ok(v.valor < 400000, 'el capital manipulat no entra al rànquing');
  const trampa = JSON.parse(JSON.stringify(b.p)); trampa.reg.splice(5, 0, ['l', 0, 999999], ['k', 0], ['k', 0], ['k', 0], ['k', 0]);
  r = await crida({ action: 'enviar', repte: rep.codi, codi: 'MJ1Z' + zlib.deflateRawSync(Buffer.from(JSON.stringify(trampa))).toString('base64url') });
  assert.strictEqual(r.verificat, false, 'les accions impossibles es detecten');

  // Codi d'un altre repte
  const altre = ME.llegirRepte(ME.codiRepte('moda', 4, 'mitja', 5));
  r = await crida({ action: 'enviar', repte: altre.codi, codi: a.codi }); assert.strictEqual(r.st, 400);
  r = await crida({ action: 'enviar', repte: rep.codi, codi: 'MJ1Zbrossa' }); assert.strictEqual(r.st, 400);

  // Rànquing públic: ordenat i sense dades personals
  r = await crida({ action: 'ranking', repte: rep.codi });
  assert.strictEqual(r.files.length, 2); assert.ok(r.files[0].valor >= r.files[1].valor);
  assert.ok(!('membres' in r.files[0]) && !('refl' in r.files[0]) && !('codi' in r.files[0]));

  // Professorat
  assert.strictEqual((await crida({ action: 'docent', password: 'no' })).st, 401);
  r = await crida({ action: 'docent', password: 'secret' }); assert.strictEqual(r.reptes[0].repte, rep.codi); assert.strictEqual(r.reptes[0].equips, 2);
  r = await crida({ action: 'docent', password: 'secret', repte: rep.codi }); assert.ok(r.files[0].codi && r.files[0].refl === 'Reflexió de prova' && r.files[0].membres[0] === 'A');
  await crida({ action: 'esborrar', password: 'secret', repte: rep.codi, equip: 'Equip Beta' });
  assert.strictEqual((await crida({ action: 'ranking', repte: rep.codi })).files.length, 1);
  console.log('✔ funció de Mercadeja: enviament verificat, rànquing i panell docent');
})().catch(e => { console.error('✘', e); process.exit(1); });
