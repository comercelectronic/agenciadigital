// Prova de la funció joc-economia (peticions HTTP reals contra una base de dades local)
import assert from 'node:assert/strict';
import { NetlifyDB } from '@netlify/database-dev';
const db = new NetlifyDB(); const cs = await db.start();
await db.applyMigrations('./netlify/database/migrations');
process.env.NETLIFY_DB_URL = cs; process.env.TEACHER_PASSWORD = 'prof';
const { default: fn } = await import('../netlify/functions/joc-economia.mjs');
const call = async (body) => { const r = await fn(new Request('http://x/', { method: 'POST', body: JSON.stringify(body) })); return [r.status, await r.json()]; };
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const st = { classe: 'TEST1', id: 'alumne-123456' };
try {
  let [s, r] = await call(Object.assign({ action: 'alta', nom: 'Anna' }, st));
  ok(s === 200 && r.aprovat === false && r.saldo === 0, 'alta pendent de validar');
  [s, r] = await call(Object.assign({ action: 'moviments', events: [{ idem: 'a1', tipus: 'inici', brut: 3000, ref: 'inici' }] }, st));
  ok(r.results[0].pendent, 'esperant el professor');
  [s, r] = await call({ action: 'admin-aprovar', password: 'dolenta', classe: 'TEST1', pid: 'x' });
  ok(s === 401, 'contrasenya del professor');
  const [, est] = await call({ action: 'admin-estat', password: 'prof', classe: 'TEST1' });
  ok(est.jugadors.length === 1 && est.auditoria.ok, 'el professor veu l\'alumne');
  [s] = await call({ action: 'admin-aprovar', password: 'prof', classe: 'TEST1', pid: est.jugadors[0].pid, aprovat: true });
  ok(s === 200, 'aprovat');
  [s] = await call({ action: 'admin-config', password: 'prof', classe: 'TEST1', clau: 'impost', valor: { trams: [{ des: 0, pct: 10 }] } });
  ok(s === 200, 'impost del 10 %');
  [s] = await call({ action: 'admin-config', password: 'prof', classe: 'TEST1', clau: 'impost', valor: { trams: [{ des: 0, pct: 90 }] } });
  ok(s === 400, 'impost fora de rang rebutjat');
  [s, r] = await call(Object.assign({ action: 'moviments', events: [{ idem: 'a1', tipus: 'inici', brut: 3000, ref: 'inici' }, { idem: 'a2', tipus: 'capitol', brut: 500, ref: '1.1' }, { idem: 'a3', tipus: 'projecte', brut: 900, ref: 'pla-forn' }] }, st));
  ok(r.results[0].ok && r.results[1].impost === 50 && !r.results[2].ok && r.estat.saldo === 3450, 'moviments validats amb impost del 10 %');
  [s, r] = await call(Object.assign({ action: 'guardiola' }, st));
  ok(r.saldo === 50 && r.historial.length === 1, 'guardiola transparent');
  const [, est2] = await call({ action: 'admin-estat', password: 'prof', classe: 'TEST1' });
  ok(est2.jugadors[0].nom === 'Anna', 'el nom no es perd en consultes sense nom');
  ok(est2.admin.length === 2 && est2.rebutjats.length === 1 && est2.auditoria.ok, 'registre administratiu, rebutjats i auditoria');
  [s] = await call({ action: 'moviments', classe: 'TEST1', id: 'x' });
  ok(s === 400, 'identificador no vàlid');
  console.log(`✔ ${n} comprovacions de la funció`);
} finally { await db.stop(); process.exit(0); }
