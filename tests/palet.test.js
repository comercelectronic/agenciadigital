// Proves de la funció de comptes de Palet amb un magatzem de Netlify Blobs simulat. node tests/palet.test.js
const assert = require('assert');
const Module = require('module');
const dades = {};
const original = Module._load;
Module._load = function (req, ...a) {
  if (req === '@netlify/blobs') return {
    connectLambda: () => { },
    getStore: (nom) => ({
      get: async (k) => { const v = dades[nom + ':' + k]; return v == null ? null : JSON.parse(v); },
      setJSON: async (k, v, o) => { if (o && o.onlyIfNew && (nom + ':' + k) in dades) return { modified: false }; dades[nom + ':' + k] = JSON.stringify(v); return { modified: true }; },
      list: async (o) => ({ blobs: Object.keys(dades).filter(k => k.startsWith(nom + ':' + ((o && o.prefix) || ''))).map(k => ({ key: k.slice(nom.length + 1) })) })
    })
  };
  return original.call(this, req, ...a);
};
process.env.TEACHER_PASSWORD = 'secret';
const { handler } = require('../netlify/functions/palet.js');
const crida = async (body) => { const r = await handler({ httpMethod: 'POST', body: JSON.stringify(body) }); return { st: r.statusCode, ...JSON.parse(r.body) }; };

(async () => {
  let r = await crida({ action: 'registre', usuari: 'Pau.M', contrasenya: 'magatzem1', nom: 'Pau M.', classe: 'cm10 2a' });
  assert.strictEqual(r.st, 200); assert.strictEqual(r.compte.classe, 'CM10-2A');
  const tok = r.token;
  assert.strictEqual((await crida({ action: 'registre', usuari: 'pau.m', contrasenya: 'altra12', nom: 'X', classe: 'A' })).st, 409);
  assert.strictEqual((await crida({ action: 'entrar', usuari: 'pau.m', contrasenya: 'no' })).st, 401);
  const partida = { v: 1, config: { nom: 'Pau', llavor: 5 }, nivell: 3, avisos: 1, llicons: { fefo: { ok: true }, codis: { ok: false } },
    historial: [{ torn: 1, nivell: 1, nota: 92, productivitat: 90, qualitat: 95, seguretat: 100, veredicte: 'bo', errors: [], greus: [] },
      { torn: 2, nivell: 1, nota: 88, productivitat: 85, qualitat: 90, seguretat: 100, veredicte: 'bo', canvi: 'ascens', errors: [['fefo', 'x']], greus: [] },
      { torn: 3, nivell: 2, nota: 40, productivitat: 70, qualitat: 30, seguretat: 20, veredicte: 'bronca', errors: [['fefo', 'x'], ['picking', 'y']], greus: [['seguretat', 'z']] }] };
  assert.strictEqual((await crida({ action: 'desar', token: tok, partida: { v: 9 } })).st, 400);
  assert.ok((await crida({ action: 'desar', token: tok, partida })).ok);
  r = await crida({ action: 'entrar', usuari: 'PAU.M', contrasenya: 'magatzem1' }); assert.strictEqual(r.partida.nivell, 3);
  assert.strictEqual((await crida({ action: 'alumnes', password: 'no' })).st, 401);
  r = await crida({ action: 'alumnes', password: 'secret', classe: 'CM10-2A' });
  const p = r.alumnes[0].partida;
  assert.strictEqual(p.nivell, 3); assert.strictEqual(p.torns, 3); assert.strictEqual(p.notaMitja, 73); assert.strictEqual(p.broncas, 1); assert.strictEqual(p.ascensos, 1);
  assert.deepStrictEqual(p.errorsFreq[0], ['fefo', 2]); assert.strictEqual(p.llEnc, 1); assert.ok(!('historial' in p) || p.historial === undefined);
  r = await crida({ action: 'alumne', password: 'secret', usuari: 'pau.m' }); assert.strictEqual(r.resum.historial.length, 3);
  // Partida nova: l'anterior queda a l'historial de partides
  assert.ok((await crida({ action: 'desar', token: tok, partida: Object.assign({}, partida, { config: { nom: 'Pau', llavor: 6 }, historial: [] }) })).ok);
  r = await crida({ action: 'alumne', password: 'secret', usuari: 'pau.m' }); assert.strictEqual(r.partides.length, 1); assert.strictEqual(r.partides[0].torns, 3);
  assert.ok((await crida({ action: 'alumne-contrasenya', password: 'secret', usuari: 'pau.m', nova: 'nova123' })).ok);
  assert.strictEqual((await crida({ action: 'carregar', token: tok })).st, 401);
  console.log('✔ funció de Palet: comptes, partida al núvol i seguiment del professor');
})().catch(e => { console.error('✘', e); process.exit(1); });
