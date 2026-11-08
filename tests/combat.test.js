// Tests del motor de combat dels Comerçmons i de les dades del món (hàbitats, entrenadors i agències rivals)
// node tests/combat.test.js
const assert = require('assert');
global.window = global;
global.T = (s, a) => (a ? String(s).replace(/\{(\d+)\}/g, (m, i) => a[i]) : s);
require('../js/data-comercmons.js');
require('../js/data-mon-world.js');
require('../js/cm-battle.js');

let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
const fight = (a, b, seed) => { const s = GD.cmBattleNew(a, b, seed); while (!s.over) GD.cmBattleTurn(s, [GD.cmBattleAI(s, 0, true), GD.cmBattleAI(s, 1, true)]); return s; };
const rate = (a, b, runs = 120) => { let w = 0; for (let i = 1; i <= runs; i++) if (fight(a, b, i * 7919).over.win === 0) w++; return w / runs; };
const ids = GD.cmSpecies.map(s => s.id);

/* ---- Efectes dels atacs ---- */
const KINDS = ['dmg', 'dodge', 'reflect', 'heal', 'hot', 'energy', 'shield', 'vuln', 'stun', 'debuff', 'buff', 'cleanse'];
GD.cmSpecies.forEach(sp => sp.forms.forEach((f, i) => {
  GD.cmMovesOf(sp, i).forEach(mv => {
    ok(KINDS.includes(mv.e.k), `${sp.id}: efecte conegut per a ${mv.n}`);
    if (mv.e.k === 'dmg') ok(mv.e.pow > 0, `${sp.id}: ${mv.n} fa mal`);
    ok(mv.cost >= 0 && mv.acc > 0, `${sp.id}: ${mv.n} té cost i precisió`);
  });
  ok(GD.cmMovesOf(sp, i).some(m => m.e.k === 'dmg'), `${sp.id} forma ${i}: té algun atac que fa mal`);
}));
ok(GD.cmSpecies.every(sp => sp.forms.every((f, i) => GD.CMB.BAL[sp.id + ':' + i] > 0)), 'ajust d\'equilibri per a totes les espècies i formes');

/* ---- Determinisme: mateixa llavor i mateixes accions → mateix resultat ---- */
const A = [{ id: 'publifoc', lvl: 12 }, { id: 'analitopus', lvl: 12 }], B = [{ id: 'brandalia', lvl: 12 }, { id: 'logistort', lvl: 12 }];
const s1 = fight(A, B, 42), s2 = fight(A, B, 42);
ok(JSON.stringify(s1) === JSON.stringify(s2), 'combat determinista');

/* ---- Regles ---- */
{
  const s = GD.cmBattleNew([{ id: 'vendifox', lvl: 10 }], [{ id: 'sabionet', lvl: 10 }], 5);
  const f = GD.cmBattleCur(s, 0), esp = f.moves.findIndex(m => m.cat === 'especial');
  const en0 = f.en, ev = GD.cmBattleTurn(s, [{ t: 'atk', i: esp, q: false }, { t: 'atk', i: 0 }]);
  ok(ev.some(e => e.side === 0 && e.fail), 'atac especial amb resposta incorrecta: no surt');
  ok(f.en < en0 + 20, 'l\'atac fallat també gasta energia');
}
{
  const s = GD.cmBattleNew([{ id: 'vendifox', lvl: 10 }, { id: 'publifoc', lvl: 10 }], [{ id: 'sabionet', lvl: 10 }], 9);
  const ev = GD.cmBattleTurn(s, [{ t: 'switch', to: 1 }, { t: 'atk', i: 0 }]);
  ok(GD.cmBattleCur(s, 0).id === 'publifoc' && ev[0].k === 'switch', 'canvi de Comerçmon');
}
{
  // un atac sense energia suficient es converteix en l'atac bàsic
  const s = GD.cmBattleNew([{ id: 'vendifox', lvl: 10 }], [{ id: 'sabionet', lvl: 10 }], 3);
  const f = GD.cmBattleCur(s, 0); f.en = 0;
  const ev = GD.cmBattleTurn(s, [{ t: 'atk', i: 1 }, { t: 'atk', i: 0 }]);
  ok(ev.find(e => e.side === 0 && e.k === 'atk').mv === 'Atac bàsic', 'sense energia: atac bàsic');
}

/* ---- Equilibri ---- */
const wr = {};
ids.forEach(a => {
  let w = 0, t = 0;
  ids.forEach((b, k) => { if (a === b || k % 3) return; for (const side of [0, 1]) { const X = [{ id: a, lvl: 50, form: 9 }], Y = [{ id: b, lvl: 50, form: 9 }]; const s = side ? fight(Y, X, t + 11) : fight(X, Y, t + 11); if (s.over.win === side) w++; t++; } });
  wr[a] = w / t;
});
Object.entries(wr).forEach(([id, v]) => ok(v > 0.2 && v < 0.8, `${id}: cap espècie domina (${Math.round(v * 100)} % de victòries)`));
ok(rate([{ id: 'publifoc', lvl: 15 }], [{ id: 'publifoc', lvl: 15 }]) > 0.35 && rate([{ id: 'publifoc', lvl: 15 }], [{ id: 'publifoc', lvl: 15 }]) < 0.65, 'combat mirall equilibrat');
ok(rate([{ id: 'vendifox', lvl: 15 }], [{ id: 'vendifox', lvl: 10 }]) > 0.7, 'el nivell compta');
ok(rate([{ id: 'publifoc', lvl: 20 }], [{ id: 'facturo', lvl: 20 }]) > 0.6, 'l\'avantatge d\'element compta (Foc contra Natura)');
let timeouts = 0;
for (let k = 0; k < 60; k++) { const p = (j) => ({ id: ids[(k * 7 + j * 13) % ids.length], lvl: 30 }); if (fight([p(0), p(1), p(2)], [p(3), p(4), p(5)], k + 1).over.timeout) timeouts++; }
ok(timeouts <= 2, `els combats s'acaben (${timeouts} sense acabar)`);

/* ---- Món: hàbitats, entrenadors i agències ---- */
const UNLOCK = { devesa: 0, vic: 0, tona: 1, gurb: 2, fira: 2, montseny: 2, barcelona: 4, port: 6 };
ok(Object.keys(UNLOCK).every(z => GD.cmZones[z]), 'zones definides');
GD.cmSpecies.forEach(sp => {
  const z = GD.cmZonesOf(sp.id);
  ok(z.length > 0 && z.every(x => GD.cmZones[x]), `${sp.id}: té hàbitat`);
});
Object.keys(GD.cmZones).forEach(z => ok(GD.cmSpeciesIn(z).length >= 2, `${z}: hi viuen com a mínim 2 espècies`));
ok(Object.keys(GD.cmHabitat).every(id => GD.cmById(id)), 'hàbitats d\'espècies que existeixen');
GD.cmTrainers.forEach(tr => {
  ok(GD.cmZones[tr.map] && tr.team.every(id => GD.cmById(id)) && tr.team.length >= 2 && tr.team.length <= GD.CM.TEAM_SIZE, `entrenador ${tr.id} vàlid`);
});
GD.cmGyms.forEach((g, i) => {
  ok(GD.cmZones[g.map] && UNLOCK[g.map] <= g.stage, `${g.id}: la zona és oberta a l'etapa del repte`);
  ok(g.staff.length === 2 && g.staff.every(st => st.team.every(([id, lvl]) => GD.cmById(id) && lvl >= 1 && lvl <= 50)), `${g.id}: rivals vàlids`);
  ok(g.prize > 0 && g.prize <= 6000, `${g.id}: premi dins del límit del servidor`);
  // hi ha prou espècies que compleixen cada requisit i que es poden trobar abans del repte
  const reach = GD.cmSpecies.filter(sp => GD.cmZonesOf(sp.id).some(z => UNLOCK[z] <= g.stage) && sp.rarity !== 'lleg');
  g.req.forEach(r => {
    let cands = reach;
    if (r.types) cands = reach.filter(sp => r.types.includes(sp.type));
    if (r.family) cands = reach.filter(sp => sp.family === r.family);
    if (r.kind) cands = reach.filter(sp => sp.passive.kind === r.kind);
    if (r.rarity) cands = reach.filter(sp => r.rarity.includes(sp.rarity));
    ok(cands.length >= 2, `${g.id}: requisit assolible (${JSON.stringify(r)}: ${cands.length} espècies)`);
  });
  if (i) ok(g.staff[1].team.slice(-1)[0][1] > GD.cmGyms[i - 1].staff[1].team.slice(-1)[0][1], `${g.id}: més difícil que l'anterior`);
});
{
  const g = GD.cmGymById('g1');
  ok(GD.cmGymReq(g, [{ id: 'publifoc', lvl: 10, form: 0 }]).every(r => r.ok), 'requisits complerts');
  ok(!GD.cmGymReq(g, [{ id: 'brandalia', lvl: 12, form: 0 }]).every(r => r.ok), 'requisits no complerts');
  ok(GD.cmGymReq(GD.cmGymById('g8'), [{ id: 'publifoc', lvl: 42 }, { id: 'analitopus', lvl: 43 }, { id: 'brandalia', lvl: 44 }]).every(r => r.ok), 'repte final: tres elements de nivell 42');
}
console.log(`✔ ${n} comprovacions de combat i del món`);
