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
      setJSON: async (k, v, o) => { if (o && o.onlyIfNew && (nom + ':' + k) in dades) return { modified: false }; dades[nom + ':' + k] = JSON.stringify(v); return { modified: true }; },
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
function jugaRepte(rep, nom, dies) {
  const s = ME.crearPartida(ME.cfgRepte(rep, { nom, membres: ['A'] })); s.reg = [];
  const fa = (a) => { const x = ME.accio(s, a); if (!x.repetida && (x.ok || x.muta)) { const c = Object.assign({}, a); delete c.id; s.reg.push(c); } return x; };
  s.reg.push({ ia: 'I' }); ME.aplica(s, { ia: 'I' });
  while (s.fase !== 'final' && !(s.fase === 'resultats' && s.ronda >= dies)) {
    if (s.fase === 'planificacio') { fa({ tipus: 'promo', promo: 'xarxes' }); fa({ tipus: 'comanda', prod: 'fruita', caixes: 3 }); fa({ tipus: 'obrir' }); }
    else if (s.fase === 'botiga') { const st = Object.assign({}, s.dia.estocInici); fa({ tipus: 'tancar', res: s.dia.clients.map(c => { if (c.motiu) return [c.id, 0, c.motiu]; const v = Math.min(c.qty, st[c.prod] || 0); st[c.prod] -= v; return [c.id, v, v ? 0 : 3]; }) }); }
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
  const trampa = JSON.parse(JSON.stringify(b.p)); const kt = trampa.reg.findIndex(x => x[0] === 't'); trampa.reg[kt][1] = trampa.reg[kt][1].map(x => [x[0], 99, 0]);
  r = await crida({ action: 'enviar', repte: rep.codi, codi: 'MJ1Z' + zlib.deflateRawSync(Buffer.from(JSON.stringify(trampa))).toString('base64url') });
  assert.ok(r.verificat === false || r.desat === false, 'uns resultats inventats no entren al rànquing');

  // Codi d'un altre repte
  const altre = ME.llegirRepte(ME.codiRepte('alimentacio', 4, 'mitja', 5));
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

  // Comptes d'alumne
  r = await crida({ action: 'registre', usuari: 'Anna.P', contrasenya: 'secreta1', nom: 'Anna P.', classe: 'cm10 2a' });
  assert.strictEqual(r.st, 200); assert.strictEqual(r.compte.usuari, 'anna.p'); assert.strictEqual(r.compte.classe, 'CM10-2A');
  const tok = r.token;
  assert.strictEqual((await crida({ action: 'registre', usuari: 'anna.p', contrasenya: 'altra12', nom: 'X', classe: 'A' })).st, 409, 'usuari repetit');
  assert.strictEqual((await crida({ action: 'registre', usuari: 'bo', contrasenya: 'secreta1', nom: 'X', classe: 'A' })).st, 400);
  assert.strictEqual((await crida({ action: 'entrar', usuari: 'anna.p', contrasenya: 'malament' })).st, 401);
  assert.ok(!('hash' in r.compte) && !('salt' in r.compte));
  // Partida lliure: el servidor la torna a jugar i en desa el resum; el capital del codi no compta
  const s = ME.crearPartida({ nom: 'Partida', rondes: 0, dificultat: 'mitja', llavor: 4242, capital: 999999, sector: 'alimentacio', empreses: [{ nom: 'Can Anna', humana: true, membres: [] }] }); s.reg = [];
  const fa = (x) => { const y = ME.accio(s, x); if (!y.repetida && (y.ok || y.muta)) s.reg.push(Object.assign({}, x)); return y; };
  s.reg.push({ ia: 'I' }); ME.aplica(s, { ia: 'I' });
  for (let d = 0; d < 3; d++) {
    fa({ tipus: 'comanda', prod: 'fruita', caixes: 3 }); fa({ tipus: 'obrir' });
    const st = Object.assign({}, s.dia.estocInici); fa({ tipus: 'tancar', res: s.dia.clients.map(c => { if (c.motiu) return [c.id, 0, c.motiu]; const v = Math.min(c.qty, st[c.prod] || 0); st[c.prod] -= v; return [c.id, v, v ? 0 : 3]; }) }); fa({ tipus: 'continuar' });
  }
  const codiL = 'MJ1Z' + zlib.deflateRawSync(Buffer.from(JSON.stringify({ v: 1, cfg: s.config, reg: ME.compacta(s.reg), refl: { 0: 'Hem après molt' } }))).toString('base64url');
  r = await crida({ action: 'desar', token: tok, codi: codiL }); assert.ok(r.desat, 'desa la partida');
  assert.strictEqual((await crida({ action: 'desar', token: 'fals.x', codi: codiL })).st, 401);
  r = await crida({ action: 'entrar', usuari: 'ANNA.P', contrasenya: 'secreta1' }); assert.strictEqual(r.partida.codi, codiL);
  r = await crida({ action: 'carregar', token: tok }); assert.strictEqual(r.partida.codi, codiL);
  // Professorat
  assert.strictEqual((await crida({ action: 'alumnes', password: 'no' })).st, 401);
  r = await crida({ action: 'alumnes', password: 'secret', classe: 'CM10-2A' });
  const al = r.alumnes[0]; assert.strictEqual(al.usuari, 'anna.p'); assert.strictEqual(al.partida.ronda, 4); assert.strictEqual(al.partida.fase, 1); assert.ok(al.partida.verificat);
  assert.ok(al.partida.valor < 20000, 'el capital manipulat no compta: ' + al.partida.valor);
  r = await crida({ action: 'alumne', password: 'secret', usuari: 'anna.p' }); assert.strictEqual(r.codi, codiL); assert.strictEqual(r.refl, 'Hem après molt');
  // El professor canvia la contrasenya: la sessió antiga deixa de valer
  assert.ok((await crida({ action: 'alumne-contrasenya', password: 'secret', usuari: 'anna.p', nova: 'nova123' })).ok);
  assert.strictEqual((await crida({ action: 'carregar', token: tok })).st, 401);
  assert.strictEqual((await crida({ action: 'entrar', usuari: 'anna.p', contrasenya: 'nova123' })).st, 200);
  console.log('✔ comptes d\'alumne: registre, partida al núvol verificada i seguiment del professor');
})().catch(e => { console.error('✘', e); process.exit(1); });
