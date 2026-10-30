// Correcció automàtica dels projectes reals del joc «Agència Digital» (funció en segon pla).
//
// El joc la crida just després que l'alumne entrega un projecte. La funció:
// 1. llegeix l'entrega desada a Netlify Blobs (magatzem 'joc-resultats');
// 2. descarrega el document compartit (Google Docs, Slides, Sheets, Drive, PDF o pàgina web);
// 3. el fa corregir a Claude amb la rúbrica del projecte (js/data-projects.js);
// 4. desa la nota i la retroacció com a revisió automàtica ('joc-revisions'), que el professor pot modificar.
// Si el document no es pot llegir o la IA no està disponible, ho anota i el projecte queda per al professor.
const { getStore, connectLambda } = require('@netlify/blobs');
const AnthropicModule = require('@anthropic-ai/sdk');
const Anthropic = AnthropicModule.default || AnthropicModule;

// Les dades dels projectes són un fitxer del navegador: les carreguem amb un T() que retorna el text català
globalThis.window = globalThis;
globalThis.T = (s, a) => (a ? String(s).replace(/\{(\d+)\}/g, (m, i) => a[i]) : s);
require('../../js/data-projects.js');
const GD = globalThis.GD;

const CLASS_RE = /^[A-Z0-9_-]{1,32}$/;
const ID_RE = /^[a-z0-9-]{8,40}$/;
const TASK_RE = /^[a-z0-9-]{1,40}$/;
const MODEL = 'claude-opus-5-5';
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_TEXT = 150000;
const LANG_NAME = { ca: 'Catalan', es: 'Spanish', en: 'English' };

/* ---------- Lectura del document ---------- */
function isPrivateHost(h) {
  if (process.env.TEST_ALLOW_LOCAL) return false;
  return /^(localhost|0\.|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?|\[?f[cd])/i.test(h) || !h.includes('.');
}

function htmlToText(html) {
  return html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n\n').trim();
}

async function download(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'AgenciaDigital-Correccio/1.0' } });
    const finalHost = new URL(res.url || url).hostname;
    if (finalHost === 'accounts.google.com') return { error: 'private' };
    if (!res.ok) return { error: res.status === 401 || res.status === 403 ? 'private' : 'http ' + res.status };
    const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_BYTES) return { error: 'too-big' };
    if (type === 'application/pdf' || buf.slice(0, 5).toString() === '%PDF-') return { kind: 'pdf', data: buf.toString('base64') };
    if (/^image\/(png|jpeg|gif|webp)$/.test(type)) return { kind: 'image', media: type, data: buf.toString('base64') };
    const body = buf.toString('utf8');
    if (type.includes('html')) {
      if (/ServiceLogin|accounts\.google\.com\/v3\/signin/.test(body) && body.length < 400000) return { error: 'private' };
      return { kind: 'text', text: htmlToText(body) };
    }
    if (type.startsWith('text/') || type.includes('json') || type.includes('csv')) return { kind: 'text', text: body };
    return { error: 'format ' + type };
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

// Converteix els enllaços de Google en enllaços d'exportació que es poden llegir sense iniciar sessió
async function readLink(raw) {
  let u;
  try { u = new URL(raw); } catch (e) { return { error: 'url' }; }
  if (!/^https?:$/.test(u.protocol) || isPrivateHost(u.hostname)) return { error: 'url' };
  let m;
  if (u.hostname === 'docs.google.com') {
    if ((m = u.pathname.match(/\/document\/d\/([\w-]+)/))) return download(`https://docs.google.com/document/d/${m[1]}/export?format=txt`);
    if ((m = u.pathname.match(/\/presentation\/d\/([\w-]+)/))) return download(`https://docs.google.com/presentation/d/${m[1]}/export/pdf`);
    if ((m = u.pathname.match(/\/spreadsheets\/d\/([\w-]+)/))) return download(`https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv`);
  }
  if (u.hostname === 'drive.google.com') {
    if (/\/folders\//.test(u.pathname)) return { error: 'folder' };
    const id = (u.pathname.match(/\/file\/d\/([\w-]+)/) || [])[1] || u.searchParams.get('id');
    if (id) return download(`https://drive.google.com/uc?export=download&id=${id}`);
  }
  return download(u.href);
}

/* ---------- Correcció amb Claude ---------- */
function gradingSchema(n) {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['document_readable', 'matches_project', 'criteria', 'strengths', 'improvements', 'feedback'],
    properties: {
      document_readable: { type: 'boolean', description: 'False if the content is empty, a login page, or not a real student document.' },
      matches_project: { type: 'boolean', description: 'False if the document is about something else or is a generic text not adapted to this client.' },
      criteria: {
        type: 'array', minItems: n, maxItems: n,
        items: {
          type: 'object', additionalProperties: false, required: ['level', 'comment'],
          properties: { level: { type: 'integer', enum: [0, 1, 2, 3] }, comment: { type: 'string' } }
        }
      },
      strengths: { type: 'array', items: { type: 'string' } },
      improvements: { type: 'array', items: { type: 'string' } },
      feedback: { type: 'string' }
    }
  };
}

function buildPrompt(p, sub, lang) {
  const levels = GD.rubricLevels.map((l, i) => `${i} = ${l.n}: ${l.d}`).join('\n');
  return `You are a marketing teacher assessing a project handed in by a vocational-training student who is playing "Agència Digital", an educational game where they run a digital marketing agency in Vic (Osona, Catalonia). The companies are fictional, but students must use the information from the game plus real market data, and mark anything they invent as an assumption.

PROJECT: ${p.title} (${p.kind})
CLIENT CONTEXT (what the client asked for): ${p.brief.map(l => l[1]).join(' ')}
OBJECTIVE: ${p.goal}
EXPECTED FORMAT: ${p.format}
REQUIRED SECTIONS:
${p.sections.map((s, i) => `${i + 1}. ${s.h}: ${s.d}`).join('\n')}

RUBRIC — score each criterion with one level:
${levels}
CRITERIA (in this order):
${p.rubric.map((c, i) => `${i + 1}. ${c}`).join('\n')}

STUDENT'S SUMMARY OF THEIR PROPOSAL: ${sub.resum || '(none)'}
AI USE DECLARED BY THE STUDENT: ${sub.ia || '(not stated)'}
${sub.canvis ? `CHANGES SINCE THE PREVIOUS VERSION (after teacher feedback): ${sub.canvis}` : ''}

Instructions:
- Assess only what is actually in the attached document(s), not what the summary promises.
- Be fair but demanding: level 2 means complete, correct and adapted to this client; level 3 needs data, justification and real insight. Missing sections score 0.
- If the document is generic, clearly copied from an AI without adapting it to the client, or about another topic, set matches_project to false and score low.
- Give one short, specific comment per criterion that explains the level and how to improve it.
- "feedback" is addressed directly to the student (second person), 80–200 words, encouraging and concrete, ending with the most important next step.
- Write every comment, strength, improvement and the feedback in ${LANG_NAME[lang] || 'Catalan'}.`;
}

async function grade(p, sub, docs, lang) {
  const content = [];
  docs.forEach((d, i) => {
    if (d.kind === 'pdf') content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: d.data }, title: `Student document ${i + 1}` });
    else if (d.kind === 'image') content.push({ type: 'image', source: { type: 'base64', media_type: d.media, data: d.data } });
    else {
      const cut = d.text.length > MAX_TEXT;
      content.push({ type: 'text', text: `<student_document index="${i + 1}"${cut ? ' truncated="true"' : ''}>\n${d.text.slice(0, MAX_TEXT)}\n</student_document>` });
    }
  });
  content.push({ type: 'text', text: buildPrompt(p, sub, lang) });
  const client = new Anthropic();
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: gradingSchema(p.rubric.length) } },
    messages: [{ role: 'user', content }]
  });
  if (res.stop_reason === 'refusal') throw new Error('refusal');
  const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return JSON.parse(text);
}

const LABELS = {
  ca: { auto: 'Correcció automàtica', good: 'Punts forts', imp: 'Què has de millorar', off: 'El document no correspon a aquest projecte o no està adaptat al client.' },
  es: { auto: 'Corrección automática', good: 'Puntos fuertes', imp: 'Qué tienes que mejorar', off: 'El documento no corresponde a este proyecto o no está adaptado al cliente.' },
  en: { auto: 'Automatic marking', good: 'Strengths', imp: 'What to improve', off: 'The document does not match this project or is not adapted to the client.' }
};

exports.handler = async function (event) {
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return; }
  const classe = String(body.classe || ''), id = String(body.id || ''), task = String(body.task || '');
  if (!CLASS_RE.test(classe) || !ID_RE.test(id) || !TASK_RE.test(task)) return;
  const p = GD.projects.find(x => x.id === task);
  if (!p) return;

  connectLambda(event);
  const store = getStore('joc-resultats');
  const revStore = getStore('joc-revisions');
  const key = `${classe}/${id}`;
  const summary = await store.get(key, { type: 'json' }).catch(() => null);
  const sub = summary && summary.projectes && summary.projectes[task];
  if (!sub || !sub.url) return;
  const v = Number(sub.v) || 1;

  const rev = (await revStore.get(key, { type: 'json' }).catch(() => null)) || { tasks: {} };
  const prev = rev.tasks[task] || {};
  // Cada versió es corregeix una sola vegada, i mai per sobre d'una revisió del professor
  if ((prev.autoV || 0) >= v || (prev.by === 'teacher' && prev.v >= v) || prev.status === 'approved') return;
  const save = async (fields) => {
    const cur = (await revStore.get(key, { type: 'json' }).catch(() => null)) || { tasks: {} };
    const before = cur.tasks[task] || {};
    if (before.by === 'teacher' && before.v >= v) return; // el professor s'hi ha avançat
    cur.tasks[task] = Object.assign({}, before, fields, { autoV: v });
    await revStore.setJSON(key, cur);
  };

  const lang = ['ca', 'es', 'en'].includes(summary.idioma) ? summary.idioma : 'ca';
  const docs = [], problems = [];
  for (const u of [sub.url, sub.url2].filter(Boolean)) {
    const d = await readLink(u);
    if (d.error) problems.push(d.error);
    else if (d.kind !== 'text' || d.text.trim().length >= 200) docs.push(d);
    else problems.push('empty');
  }
  if (!docs.length) {
    await save({ autoError: { v, reason: problems[0] || 'unreadable', at: new Date().toISOString() }, at: new Date().toISOString() });
    return;
  }

  let out;
  try {
    out = await grade(p, sub, docs, lang);
  } catch (e) {
    console.error('Correcció automàtica fallida:', e && e.message);
    await save({ autoError: { v, reason: 'ai', at: new Date().toISOString() }, at: new Date().toISOString() });
    return;
  }
  if (!out.document_readable) {
    await save({ autoError: { v, reason: 'unreadable', at: new Date().toISOString() }, at: new Date().toISOString() });
    return;
  }

  const levels = p.rubric.map((c, i) => (out.criteria[i] ? out.criteria[i].level : 0));
  let g = GD.gradeFromLevels(levels);
  if (!out.matches_project) g = Math.min(g, 3);
  const L = LABELS[lang];
  const feedback = [
    `🤖 ${L.auto}`,
    !out.matches_project ? L.off : '',
    out.feedback,
    out.strengths.length ? `${L.good}:\n${out.strengths.map(s => '+ ' + s).join('\n')}` : '',
    out.improvements.length ? `${L.imp}:\n${out.improvements.map(s => '- ' + s).join('\n')}` : ''
  ].filter(Boolean).join('\n\n');
  await save({
    status: g >= GD.PASS_GRADE && out.matches_project ? 'approved' : 'changes',
    grade: g, feedback, v, by: 'auto', at: new Date().toISOString(),
    scores: levels, comments: out.criteria.map(c => c.comment), autoError: null
  });
};
