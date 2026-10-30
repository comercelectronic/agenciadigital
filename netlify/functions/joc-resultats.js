// Resultats del joc «Agència Digital» per al professorat.
//
// - Els alumnes que han posat un codi de classe envien el resum de la seva
//   partida (action: 'submit'). No cal contrasenya: cada alumne té un
//   identificador aleatori i només pot sobreescriure el seu propi resum.
// - El professor consulta i esborra resultats des de professor.html amb
//   la contrasenya de la variable d'entorn TEACHER_PASSWORD (si no existeix,
//   es fa servir ADMIN_PASSWORD).
//
// - Projectes reals: l'alumne els entrega dins del seu resum; el professor els
//   revisa (action: 'review') i l'alumne consulta l'estat (action: 'reviews'). La correcció
//   automàtica la fa joc-correccio-background.js; la revisió del professor sempre la sobreescriu.
//
// Es desa a Netlify Blobs: magatzem 'joc-resultats' (resums) i 'joc-revisions'
// (revisions del professor), amb la clau "<CLASSE>/<id de l'alumne>".
const { getStore, connectLambda } = require('@netlify/blobs');

const MAX_BYTES = 200 * 1024;
const TASK_RE = /^[a-z0-9-]{1,40}$/;
const CLASS_RE = /^[A-Z0-9_-]{1,32}$/;
const ID_RE = /^[a-z0-9-]{8,40}$/;

const json = (statusCode, body) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

function teacherPassword() {
  return process.env.TEACHER_PASSWORD || process.env.ADMIN_PASSWORD || '';
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  if ((event.body || '').length > MAX_BYTES) return json(413, { error: 'Les dades són massa grans.' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Petició no vàlida.' });
  }

  connectLambda(event);
  const store = getStore('joc-resultats');
  const revStore = getStore('joc-revisions');
  const validStudent = () => CLASS_RE.test(String(body.classe || '')) && ID_RE.test(String(body.id || ''));

  if (body.action === 'submit') {
    const classe = String(body.classe || '');
    const id = String(body.id || '');
    if (!CLASS_RE.test(classe)) return json(400, { error: 'Codi de classe no vàlid.' });
    if (!ID_RE.test(id)) return json(400, { error: 'Identificador d\'alumne no vàlid.' });
    if (!body.data || typeof body.data !== 'object') return json(400, { error: 'Falten les dades.' });
    const data = Object.assign({}, body.data, { id, classe, rebut: new Date().toISOString() });
    await store.setJSON(`${classe}/${id}`, data);
    return json(200, { ok: true });
  }

  if (body.action === 'reviews') {
    if (!validStudent()) return json(400, { error: 'Alumne no vàlid.' });
    const rev = await revStore.get(`${body.classe}/${body.id}`, { type: 'json' }).catch(() => null);
    return json(200, { reviews: (rev && rev.tasks) || {} });
  }

  // A partir d'aquí, accions del professorat
  const password = teacherPassword();
  if (!password) {
    console.error('Falta la variable d\'entorn TEACHER_PASSWORD (o ADMIN_PASSWORD) a Netlify.');
    return json(500, { error: 'El panell del professorat no està configurat.' });
  }
  if (body.password !== password) return json(401, { error: 'Contrasenya incorrecta.' });

  if (body.action === 'list') {
    const classe = body.classe ? String(body.classe) : '';
    if (classe && !CLASS_RE.test(classe)) return json(400, { error: 'Codi de classe no vàlid.' });
    const { blobs } = await store.list(classe ? { prefix: `${classe}/` } : {});
    const results = (await Promise.all(blobs.map(async (b) => {
      const r = await store.get(b.key, { type: 'json' }).catch(() => null);
      if (!r) return null;
      const rev = await revStore.get(b.key, { type: 'json' }).catch(() => null);
      return Object.assign(r, { revisions: (rev && rev.tasks) || {} });
    }))).filter(Boolean);
    return json(200, { results });
  }

  if (body.action === 'review') {
    if (!validStudent()) return json(400, { error: 'Alumne no vàlid.' });
    const task = String(body.task || '');
    if (!TASK_RE.test(task)) return json(400, { error: 'Projecte no vàlid.' });
    if (!['approved', 'changes'].includes(body.status)) return json(400, { error: 'Estat no vàlid.' });
    const grade = body.grade === null || body.grade === '' || body.grade === undefined ? null : Number(body.grade);
    if (grade !== null && !(grade >= 0 && grade <= 10)) return json(400, { error: 'La nota ha de ser de 0 a 10.' });
    const key = `${body.classe}/${body.id}`;
    const rev = (await revStore.get(key, { type: 'json' }).catch(() => null)) || { tasks: {} };
    const prev = rev.tasks[task] || {};
    const scores = Array.isArray(body.scores) && body.scores.length <= 20 && body.scores.every(x => [0, 1, 2, 3].includes(x)) ? body.scores : prev.scores;
    // La revisió del professor sempre preval sobre la correcció automàtica
    rev.tasks[task] = Object.assign({}, prev, {
      status: body.status, grade, scores,
      feedback: String(body.feedback || '').slice(0, 4000),
      v: Number(body.v) || 1, at: new Date().toISOString(), by: 'teacher', autoError: null,
      comments: prev.by === 'auto' && JSON.stringify(scores) === JSON.stringify(prev.scores) ? prev.comments : null
    });
    await revStore.setJSON(key, rev);
    return json(200, { ok: true, review: rev.tasks[task] });
  }

  if (body.action === 'delete') {
    const key = `${body.classe}/${body.id}`;
    if (!CLASS_RE.test(String(body.classe || '')) || !ID_RE.test(String(body.id || ''))) return json(400, { error: 'Alumne no vàlid.' });
    await store.delete(key);
    await revStore.delete(key).catch(() => {});
    return json(200, { ok: true });
  }

  return json(400, { error: 'Acció desconeguda.' });
};
