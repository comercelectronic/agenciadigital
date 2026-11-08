// Proves del catàleg de Comerçmons: estructura, condicions vàlides i equilibri (cap espècie millor en tot)
// Ús: node tests/comercmons.test.js
const assert = require('assert');
globalThis.window = globalThis; globalThis.T = (s) => s; globalThis.ART = new Proxy({}, { get: () => () => '' });
for (const f of ['data-lessons', 'data-story1', 'data-story2', 'data-story3', 'data-temari', 'data-comercmons']) { try { require('../js/' + f + '.js'); } catch (e) { if (f === 'data-comercmons') throw e; } }
const G = globalThis.GD, S = G.cmSpecies;
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

ok(S.length >= 30, `Hi ha d'haver almenys 30 espècies (n'hi ha ${S.length})`);
ok(new Set(S.map(s => s.id)).size === S.length, 'Identificadors únics');
ok(new Set(S.map(s => s.num)).size === S.length, 'Números únics');
const names = S.flatMap(s => s.forms.map(f => f.name));
ok(new Set(names).size === names.length, 'Noms de forma únics');
const KINDS = Object.keys(G.cmKinds);
for (const s of S) {
  for (const k of ['family', 'specialty', 'type', 'rarity', 'arch', 'desc', 'personality', 'utility', 'passive', 'capture', 'forms']) ok(s[k], `${s.id}: falta ${k}`);
  ok(G.cmTypes[s.type] && G.cmFamilies[s.family] && G.cmRarities[s.rarity] && G.cmArch[s.arch], `${s.id}: tipus, família, raresa o arquetip desconeguts`);
  ok(KINDS.includes(s.passive.kind) && s.passive.v > 0 && s.passive.v <= 10, `${s.id}: passiva incorrecta`);
  ok(s.forms[0].attacks.length >= 3, `${s.id}: calen almenys 3 atacs propis`);
  s.forms.forEach((f, i) => {
    ok(f.look && f.look.body && f.desc, `${s.id}/${f.name}: falta aspecte o descripció`);
    if (i) ok(f.lvl > s.forms[i - 1].lvl && f.lvl <= G.CM.MAX_LEVEL, `${s.id}/${f.name}: nivell d'evolució incorrecte`);
    f.attacks.forEach(a => ok(G.cmAttackCats[a.cat] && a.cost >= 0 && a.acc > 0 && a.acc <= 100 && a.cd >= 0, `${s.id}: atac ${a.n} incorrecte`));
  });
  const c = s.capture.cond;
  if (c.ch) ok(G.chapters[c.ch], `${s.id}: capítol ${c.ch} inexistent`);
  if (c.area) ok(G.areas[c.area[0]], `${s.id}: àrea ${c.area[0]} inexistent`);
  if (c.stage) ok(G.stages.find(x => x.id === c.stage), `${s.id}: etapa ${c.stage} inexistent`);
  // les espècies rares, èpiques i llegendàries no es poden aconseguir el primer dia
  if (['epic', 'lleg'].includes(s.rarity)) ok(c.days >= 6, `${s.id}: ${s.rarity} ha d'exigir diversos dies de joc`);
}
ok(S.filter(s => s.starter).length === 3, 'Hi ha 3 inicials');
ok(S.filter(s => s.rarity === 'lleg').length >= 4, 'Hi ha llegendaris empresarials');
// Tipus: cada element és fort contra 2 i feble contra 2
for (const t of Object.keys(G.cmTypes)) {
  ok(G.cmStrong[t].length === 2, `${t}: 2 avantatges`);
  ok(Object.values(G.cmStrong).filter(v => v.includes(t)).length === 2, `${t}: 2 debilitats`);
}
// Equilibri: compara la forma final de cada espècie al nivell 50; cap no ha de superar una altra en les 5 estadístiques
const fin = S.map(s => ({ id: s.id, st: G.cmStats(s, s.forms.length - 1, 50) }));
const dom = [];
for (const a of fin) for (const b of fin) if (a !== b) {
  const K = ['atk', 'def', 'vel', 'ene', 'int'];
  if (K.every(k => a.st[k] >= b.st[k]) && K.some(k => a.st[k] > b.st[k])) dom.push(`${a.id} > ${b.id}`);
}
ok(!dom.length, 'Cap espècie no pot ser millor en tot que una altra: ' + dom.join(', '));
for (const y of G.cmSynergies) ok(y.ids.every(G.cmById) && KINDS.includes(y.kind), `Sinergia ${y.n} incorrecta`);
console.log(`✔ ${n} comprovacions del catàleg (${S.length} espècies, ${names.length} formes)`);
