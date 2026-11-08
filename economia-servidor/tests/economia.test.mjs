// Proves de l'economia al servidor amb una base de dades Postgres local (Netlify Database en mode desenvolupament).
// Ús: node tests/economia.test.mjs
import assert from 'node:assert/strict';
import { NetlifyDB } from '@netlify/database-dev';
import pg from 'pg';
import { alta, registrar, estat, guardiolaInfo, auditoria, calcImpost } from '../lib/economia.mjs';

const db = new NetlifyDB();
const cs = await db.start();
await db.applyMigrations('./database/migrations');
const pool = new pg.Pool({ connectionString: cs, max: 8 });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; }; const eq = (a, b, m) => { assert.deepEqual(a, b, m); n++; };
const C = 'CLASSE1', A = 'aaaaaaaaaaaa', B = 'bbbbbbbbbbbb';
let k = 0; const ev = (tipus, brut, ref = '', idem) => ({ idem: idem || `t-${++k}`, tipus, brut, ref });

try {
  // Impostos per trams
  eq(calcImpost(1000, [{ des: 0, pct: 5 }]), 50, '5 % de 1.000');
  eq(calcImpost(1500, [{ des: 0, pct: 5 }, { des: 1000, pct: 10 }]), 100, 'trams: 50 + 50');
  eq(calcImpost(-200, [{ des: 0, pct: 5 }]), 0, 'les despeses no paguen impost');

  // Alta: cal la validació del professor
  await alta(pool, { classe: C, pid: A, idHash: 'hashA', nom: 'Anna' });
  let r = await registrar(pool, C, A, ev('inici', 3000, 'inici'));
  ok(!r.ok && r.pendent, 'sense validar no compta');
  await pool.query('UPDATE jugadors SET aprovat = TRUE WHERE classe = $1', [C]);
  r = await registrar(pool, C, A, ev('inici', 3000, 'inici', 'ini-A'));
  ok(r.ok && r.saldo === 3000 && r.impost === 0, 'capital inicial sense impost');
  r = await registrar(pool, C, A, ev('inici', 3000, 'inici'));
  ok(!r.ok && r.motiu === 'inici-repetit', 'el capital inicial només es dona una vegada');
  // No es pot suplantar un jugador amb un altre identificador
  await assert.rejects(alta(pool, { classe: C, pid: A, idHash: 'altre', nom: 'X' })); n++;

  // Ingrés amb impost i guardiola
  r = await registrar(pool, C, A, ev('capitol', 1000, '1.2', 'cap-1'));
  ok(r.ok && r.impost === 50 && r.net === 950 && r.saldo === 3950, 'capítol: 5 % a la guardiola');
  const rep = await registrar(pool, C, A, ev('capitol', 1000, '1.2', 'cap-1'));
  ok(rep.ok && rep.repetit && rep.saldo === 3950, 'idempotència: la mateixa operació no es cobra dues vegades');
  eq((await guardiolaInfo(pool, C)).saldo, 50, 'guardiola amb 50 €');
  r = await registrar(pool, C, A, ev('capitol', 15000, '1.2'));
  ok(!r.ok && r.motiu === 'supera-limit', 'límit per capítol');
  r = await registrar(pool, C, A, ev('capitol', 100, 'hack'));
  ok(!r.ok && r.motiu === 'ref', 'referència de capítol invàlida');

  // Encàrrecs: una sola vegada
  ok((await registrar(pool, C, A, ev('encarrec', 300, 'celler'))).ok, 'encàrrec cobrat');
  r = await registrar(pool, C, A, ev('encarrec', 300, 'celler'));
  ok(!r.ok && r.motiu === 'ja-cobrat', 'un encàrrec no es pot cobrar dues vegades');

  // Projectes: el màxim el decideix la nota del servidor
  const ctx = { maxPagament: async (t, ref) => ref === 'pla-forn' ? 900 : null };
  r = await registrar(pool, C, A, ev('projecte', 500, 'sense-revisio'), ctx);
  ok(!r.ok && r.motiu === 'sense-nota', 'sense nota no es cobra');
  ok((await registrar(pool, C, A, ev('projecte', 720, 'pla-forn'), ctx)).ok, 'projecte cobrat segons la nota');
  r = await registrar(pool, C, A, ev('projecte', 400, 'pla-forn'), ctx);
  ok(!r.ok && r.motiu === 'supera-limit', 'no es pot cobrar més del que permet la nota');

  // Despeses, tipus no permesos i reinici
  ok((await registrar(pool, C, A, ev('despesa', -350, 'lloguer'))).ok, 'despesa');
  r = await registrar(pool, C, A, ev('premi', 1000, 'x'));
  ok(!r.ok && r.motiu === 'tipus', 'el joc no pot demanar premis');
  r = await registrar(pool, C, A, ev('reinici', 3000, 'fallida'));
  ok(!r.ok && r.motiu === 'reinici-sense-fallida', 'reinici només en fallida');
  const st0 = (await estat(pool, C, A)).saldo;
  ok((await registrar(pool, C, A, ev('despesa', -(st0 + 500), 'crisi'))).ok, 'queda en negatiu');
  r = await registrar(pool, C, A, ev('reinici', 3500, 'fallida'));
  ok(r.ok && r.saldo === 3000, 'reinici: torna a 3.000 €');

  // Límit d'altres ingressos
  ok((await registrar(pool, C, A, ev('altre', 500, 'x'))).ok, 'altre ingrés');
  r = await registrar(pool, C, A, ev('altre', 600, 'y'));
  ok(!r.ok && r.motiu === 'supera-limit', 'altre: límit per operació');

  // Duplicats: reenviar 10 operacions ja fetes no canvia res
  // (Nota: la base de dades local de proves, PGlite, no aïlla les transaccions simultànies com Postgres; per això
  //  els duplicats es proven en seqüència. A producció, la clau única i les actualitzacions atòmiques ho garanteixen.)
  // Concurrència: 30 operacions simultànies de dos jugadors no deixen saldos inconsistents
  await alta(pool, { classe: C, pid: B, idHash: 'hashB', nom: 'Biel' });
  await pool.query('UPDATE jugadors SET aprovat = TRUE WHERE classe = $1', [C]);
  await registrar(pool, C, B, ev('inici', 3000, 'inici', 'ini-B'));
  const before = { A: (await estat(pool, C, A)).saldo, B: (await estat(pool, C, B)).saldo, G: (await guardiolaInfo(pool, C)).saldo };
  const ops = [];
  for (let i = 0; i < 10; i++) ops.push(registrar(pool, C, A, ev('capitol', 100, '2.1', `par-A-${i}`)));
  for (let i = 0; i < 20; i++) ops.push(registrar(pool, C, B, ev('capitol', 100, '2.1', `par-B-${i}`)));
  const res = await Promise.all(ops);
  ok(res.every(x => x.ok), 'totes les operacions simultànies s\'apliquen');
  for (let i = 0; i < 10; i++) { const x = await registrar(pool, C, A, ev('capitol', 100, '2.1', `par-A-${i}`)); ok(x.ok && x.repetit, 'duplicat detectat'); }
  const after = { A: (await estat(pool, C, A)).saldo, B: (await estat(pool, C, B)).saldo, G: (await guardiolaInfo(pool, C)).saldo };
  eq(after.A - before.A, 10 * 95, 'saldo A correcte');
  eq(after.B - before.B, 20 * 95, 'saldo B correcte');
  eq(after.G - before.G, 30 * 5, 'guardiola correcta');

  // Auditoria: els saldos es poden reconstruir des del llibre comptable
  const au = await auditoria(pool, C);
  ok(au.ok && au.jugadors === 2, 'auditoria sense diferències');
  // El llibre comptable no es pot modificar ni esborrar
  await assert.rejects(pool.query('UPDATE moviments SET net = 999999'), /només d'afegir/); n++;
  await assert.rejects(pool.query('DELETE FROM guardiola_moviments'), /només d'afegir/); n++;
  const g = await guardiolaInfo(pool, C);
  ok(g.impostos === g.saldo && g.aportacions > 0, 'historial de la guardiola');
  console.log(`✔ ${n} comprovacions de l'economia`);
} finally {
  await pool.end(); await db.stop();
}
