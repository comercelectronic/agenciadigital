/* Agència Digital — panell del professor: consulta i exportació dels resultats dels alumnes */
(function () {
  'use strict';
  const API = '/.netlify/functions/joc-resultats';
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LESSONS = Object.keys(GD.lessons);
  const PKEY = 'agencia-digital-professor';

  let rows = new Map(); // clau "classe/id" → resum
  let sortKey = 'classe', sortDir = 1;

  function toast(msg, cls) {
    const t = document.createElement('div'); t.className = 'toast ' + (cls || ''); t.innerHTML = msg;
    $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3500);
  }
  const normClass = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim().replace(/\s+/g, '-').replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
  const fullName = (r) => `${r.nom || ''} ${r.cognom || ''}`.trim() || T('(sense nom)');
  const pctTxt = (v) => v == null ? '—' : v + ' %';
  const dateTxt = (d) => d ? new Date(d).toLocaleString(LOCALE, { dateStyle: 'short', timeStyle: 'short' }) : '—';
  const avatar = (r) => { ART.setPlayer(r.aspecte); return ART.portrait('pau', 'n', { rank: Math.min(4, Math.floor((r.etapesCompletades || 0) / 2)) }); };

  function add(list, source) {
    let n = 0;
    list.forEach(r => {
      if (!r || !r.id) return;
      const k = `${r.classe || '—'}/${r.id}`;
      const prev = rows.get(k);
      if (!prev || new Date(r.actualitzat) >= new Date(prev.actualitzat)) { rows.set(k, Object.assign({}, r, { _font: source })); n++; }
    });
    render();
    return n;
  }

  const COLS = [
    ['alumne', T('Alumne'), r => fullName(r).toLowerCase()],
    ['classe', T('Classe'), r => r.classe || ''],
    ['nivell', T('Nivell'), r => r.nivell || 0],
    ['etapa', T('Etapa'), r => r.etapaActual || 0],
    ['capitols', T('Capítols'), r => r.capitolsCompletats || 0],
    ['llicons', T('Lliçons superades'), r => r.llicionsSuperades || 0],
    ['primer', T('1r intent'), r => r.mitjanaPrimerIntent || 0],
    ['millor', T('Millor'), r => r.mitjanaMillor || 0],
    ['projectes', T('Projectes'), r => projCount(r, 'passed') * 100 + projCount(r, 'pending') + projCount(r, 'auto')],
    ['webs', T('Webs'), r => r.websEntregades || 0],
    ['rep', T('Reputació'), r => r.reputacio || 0],
    ['diners', T('Liquiditat'), r => r.liquiditat || 0],
    ['final', T('Final'), r => r.final || ''],
    ['data', T('Actualitzat'), r => r.actualitzat || '']
  ];

  /* ===== Projectes reals ===== */
  // Estat d'un projecte d'un alumne: none, pending (per revisar), auto (corregit per la IA, per validar), changes, approved
  function projState(r, p) {
    const sub = (r.projectes || {})[p.id], rv = (r.revisions || {})[p.id];
    if (rv && rv.status === 'approved' && rv.by !== 'auto') return 'approved';
    if (!sub) return rv && rv.status === 'approved' ? 'auto' : 'none';
    if (rv && rv.status && rv.v >= sub.v) return rv.by === 'auto' ? 'auto' : rv.status === 'approved' ? 'approved' : 'changes';
    if (rv && rv.status === 'approved') return 'auto';
    return 'pending';
  }
  // Aprovat (pel professor o per la correcció automàtica): l'alumne pot continuar
  const isPassed = (r, p) => { const rv = (r.revisions || {})[p.id]; return !!(rv && rv.status === 'approved'); };
  const projCount = (r, st) => GD.projects.filter(p => st === 'passed' ? isPassed(r, p) : projState(r, p) === st).length;
  const PLB = () => ({ none: ['—', ''], pending: ['⏳', T('Per revisar')], auto: ['🤖', T('Corregit automàticament')], changes: ['✏️', T('Canvis demanats')], approved: ['✅', T('Aprovat')] });
  const link = (u) => u ? `<a href="${/^https?:\/\//i.test(u) ? esc(u) : '#'}" target="_blank" rel="noopener">${esc(u)}</a>` : '';
  const AUTO_ERR = () => ({ private: T('document privat'), folder: T('és una carpeta'), ai: T('servei d\'IA no disponible'), unreadable: T('no s\'ha pogut llegir'), empty: T('document buit') });

  function pendingTable(items, withGrade) {
    return `<div class="table-wrap"><table class="tbl"><thead><tr><th>${T('Alumne')}</th><th>${T('Projecte')}</th><th>${T('Versió')}</th><th>${T('Entregat')}</th>${withGrade ? `<th>${T('Nota')}</th>` : ''}<th></th></tr></thead><tbody>
      ${items.map(({ r, k, p, sub }) => { const rv = (r.revisions || {})[p.id] || {}; return `<tr><td><span class="ava-s">${avatar(r)}</span><b>${esc(fullName(r))}</b> <small class="muted">${esc(r.classe || '')}</small></td>
        <td>${esc(p.title)}<br><small class="muted">${esc(p.kind)} · ${T('cap. {0}', [p.after])}${!withGrade && rv.autoError && rv.autoError.v >= sub.v ? ` · 🤖 ${esc((AUTO_ERR()[rv.autoError.reason] || rv.autoError.reason))}` : ''}</small></td><td>${sub.v}</td><td><small>${dateTxt(sub.at)}</small></td>
        ${withGrade ? `<td><b>${rv.grade != null ? rv.grade : '—'}</b> ${rv.status === 'approved' ? '✅' : '✏️'}</td>` : ''}
        <td>${r._font === 'servidor' ? `<button class="btn small ${withGrade ? '' : 'primary'}" data-review="${esc(k)}|${p.id}">${withGrade ? T('Validar') : T('Revisar')}</button>` : T('<small class="muted">només del servidor</small>')}</td></tr>`; }).join('')}
      </tbody></table></div>`;
  }
  function renderPending() {
    const pend = [], auto = [];
    rows.forEach((r, k) => GD.projects.forEach(p => {
      const st = projState(r, p), sub = (r.projectes || {})[p.id];
      if (st === 'pending') pend.push({ r, k, p, sub });
      if (st === 'auto' && sub) auto.push({ r, k, p, sub });
    }));
    const byDate = (a, b) => String(a.sub.at).localeCompare(String(b.sub.at));
    pend.sort(byDate); auto.sort(byDate);
    $('#pendSec').hidden = !rows.size;
    $('#pend').innerHTML = (pend.length ? pendingTable(pend, false) : `<p class="muted">${T('No hi ha cap projecte pendent de revisar. 🎉')}</p>`)
      + (auto.length ? `<h4>${T('🤖 Corregits automàticament ({0}) · revisa\'ls i valida o modifica la nota', [auto.length])}</h4>${pendingTable(auto, true)}` : '');
  }

  function reviewModal(k, pid) {
    const r = rows.get(k), p = GD.projectById(pid); if (!r || !p) return;
    const sub = (r.projectes || {})[pid] || {}, rv = (r.revisions || {})[pid];
    const auto = rv && rv.by === 'auto';
    const lv = (rv && rv.scores) || p.rubric.map(() => null);
    const d = document.createElement('div'); d.className = 'modal';
    d.innerHTML = `<div class="modal-box wide">
      <div class="detail-h"><span class="ava-s">${avatar(r)}</span><div><small class="muted">${esc(fullName(r))} · ${esc(r.classe || '')}</small><h2 style="margin:0">${esc(p.title)}</h2>
        <p class="muted small" style="margin:0">${esc(p.kind)} · ${T('Versió {0}', [sub.v || '—'])} · ${dateTxt(sub.at)} · <a href="guia.html#${p.id}" target="_blank" rel="noopener">${T('📘 Guia del projecte')}</a></p></div></div>
      ${sub.url ? `<p>🔗 <b>${link(sub.url)}</b>${sub.url2 ? `<br>🔗 ${link(sub.url2)}` : ''}</p>` : `<p class="muted">${T('L\'alumne encara no l\'ha entregat.')}</p>`}
      ${sub.resum ? `<h4>${T('Resum de l\'alumne')}</h4><p class="pre">${esc(sub.resum)}</p>` : ''}
      ${sub.canvis ? `<h4>${T('Canvis respecte a la versió anterior')}</h4><p class="pre">${esc(sub.canvis)}</p>` : ''}
      ${sub.ia ? `<p class="small"><b>${T('Ús d\'IA:')}</b> ${esc(sub.ia)}</p>` : ''}
      ${rv && rv.autoError && rv.autoError.v >= (sub.v || 0) && !(rv.status && rv.v >= sub.v) ? `<div class="errors"><b>🤖 ${T('No s\'ha pogut fer la correcció automàtica:')}</b> ${esc(AUTO_ERR()[rv.autoError.reason] || rv.autoError.reason)}</div>` : ''}
      ${rv && rv.status ? `<div class="info"><b>${auto ? T('🤖 Correcció automàtica') : T('Revisió anterior')} (${rv.status === 'approved' ? T('aprovat') : T('canvis demanats')}${rv.grade != null ? ' · ' + rv.grade : ''}, ${dateTxt(rv.at)})</b>${auto ? `<p class="small muted">${T('La pots validar tal com està o modificar els nivells, la nota i els comentaris.')}</p>` : ''}</div>` : ''}
      <h4>${T('Rúbrica')}</h4>
      <div class="table-wrap"><table class="tbl rubric"><thead><tr><th>${T('Criteri')}</th>${GD.rubricLevels.map((l, i) => `<th title="${esc(l.d)}">${i} · ${esc(l.n)}</th>`).join('')}</tr></thead><tbody>
        ${p.rubric.map((c, i) => `<tr><td>${esc(c)}${rv && rv.comments && rv.comments[i] ? `<br><small class="muted">🤖 ${esc(rv.comments[i])}</small>` : ''}</td>${GD.rubricLevels.map((l, n) => `<td><input type="radio" name="crit${i}" value="${n}" ${lv[i] === n ? 'checked' : ''} aria-label="${esc(l.n)}"></td>`).join('')}</tr>`).join('')}
      </tbody></table></div>
      <p class="small">${T('Nota segons la rúbrica:')} <b id="calc">—</b></p>
      <label class="fld">${T('Comentaris per a l\'alumne')}<textarea class="inp" id="fb" rows="7" maxlength="4000">${esc(rv && rv.feedback && (auto || rv.v >= sub.v) ? rv.feedback : '')}</textarea></label>
      <label class="fld" style="max-width:180px">${T('Nota (0–10)')}<input class="inp" id="grade" type="number" min="0" max="10" step="0.5" value="${rv && rv.grade != null ? rv.grade : ''}"></label>
      <div class="row-btns">
        <button class="btn primary" id="ok" ${sub.v ? '' : 'disabled'}>${auto && rv.status === 'approved' ? T('✅ Validar l\'aprovat') : T('✅ Aprovar')}</button>
        <button class="btn" id="chg" ${sub.v ? '' : 'disabled'}>${T('✏️ Demanar canvis')}</button>
        <button class="btn ghost" id="close">${T('Tancar')}</button></div></div>`;
    document.body.appendChild(d);
    const close = () => d.remove();
    d.querySelector('#close').onclick = close;
    d.onclick = (e) => { if (e.target === d) close(); };
    const levels = () => p.rubric.map((c, i) => { const x = d.querySelector(`input[name=crit${i}]:checked`); return x ? +x.value : null; });
    let gradeTouched = false;
    d.querySelector('#grade').oninput = () => { gradeTouched = true; };
    const recalc = () => {
      const L = levels();
      if (L.some(x => x == null)) { d.querySelector('#calc').textContent = T('marca tots els criteris'); return; }
      const g = GD.gradeFromLevels(L);
      d.querySelector('#calc').textContent = g;
      if (!gradeTouched) d.querySelector('#grade').value = g;
    };
    d.querySelectorAll('input[type=radio]').forEach(x => x.onchange = recalc);
    recalc();
    const send = async (status) => {
      let feedback = d.querySelector('#fb').value.trim();
      const L = levels();
      const miss = p.rubric.filter((c, i) => L[i] != null && L[i] < 2);
      if (status === 'changes') {
        if (!feedback && miss.length) feedback = `${T('Criteris a millorar:')}\n${miss.map(m => '- ' + m).join('\n')}`;
        if (!feedback) { toast(T('Escriu què ha de millorar l\'alumne.'), 'bad'); return; }
      }
      const g = d.querySelector('#grade').value;
      try {
        const { review } = await api({ action: 'review', password: $('#pw').value, classe: r.classe, id: r.id, task: pid, status, feedback, grade: g === '' ? null : Number(g), v: sub.v, scores: L.every(x => x != null) ? L : null });
        r.revisions = Object.assign({}, r.revisions, { [pid]: review });
        close(); render();
        toast(status === 'approved' ? T('Projecte aprovat') : T('Canvis demanats'), 'good');
      } catch (err) { toast(esc(err.message), 'bad'); }
    };
    d.querySelector('#ok').onclick = () => send('approved');
    d.querySelector('#chg').onclick = () => send('changes');
  }

  function render() {
    renderPending();
    const list = [...rows.values()];
    const col = COLS.find(c => c[0] === sortKey) || COLS[1];
    list.sort((a, b) => { const x = col[2](a), y = col[2](b); return (x > y ? 1 : x < y ? -1 : fullName(a).localeCompare(fullName(b))) * sortDir; });
    $('#csv').disabled = !list.length; $('#csvTemari').disabled = !list.length;
    const avg = (f) => { const v = list.map(f).filter(x => x != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : '—'; };
    $('#stats').innerHTML = list.length ? `
      <div class="metric"><small>${T("Alumnes")}</small><b>${list.length}</b></div>
      <div class="metric"><small>${T("Nivell mitjà")}</small><b>${avg(r => r.nivell)}</b></div>
      <div class="metric"><small>${T("Capítols mitjans")}</small><b>${avg(r => r.capitolsCompletats)} / ${list[0].capitolsTotal || 37}</b></div>
      <div class="metric"><small>${T("Lliçons: 1r intent")}</small><b>${avg(r => r.mitjanaPrimerIntent)} %</b></div>
      <div class="metric"><small>${T("Han acabat el joc")}</small><b>${list.filter(r => r.final).length}</b></div>` : '';
    if (!list.length) { $('#tbl').innerHTML = T('<tr><td class="empty">Encara no hi ha resultats. Introdueix la contrasenya o afegeix fitxers d\'alumnes.</td></tr>'); return; }
    $('#tbl').innerHTML = `<thead><tr>${COLS.map(c => `<th data-sort="${c[0]}">${c[1]}${sortKey === c[0] ? (sortDir > 0 ? ' ▲' : ' ▼') : ''}</th>`).join('')}<th></th></tr></thead>
      <tbody>${list.map(r => {
        const k = `${r.classe || '—'}/${r.id}`;
        const cp = Math.round((r.capitolsCompletats || 0) / (r.capitolsTotal || 37) * 100);
        return `<tr>
          <td><span class="ava-s">${avatar(r)}</span><b>${esc(fullName(r))}</b><br><small class="muted">${esc(r.agencia || '')}</small></td>
          <td>${esc(r.classe || '')} ${r._font === 'fitxer' ? T('<span class="tag file">fitxer</span>') : ''}</td>
          <td><b>${r.nivell || 1}</b></td>
          <td>${r.etapaActual || 1} / 8</td>
          <td><span class="bar"><i style="width:${cp}%"></i></span>${r.capitolsCompletats || 0}</td>
          <td>${r.llicionsSuperades || 0} / ${r.llicionsTotal || LESSONS.length}</td>
          <td>${pctTxt(r.mitjanaPrimerIntent)}</td>
          <td>${pctTxt(r.mitjanaMillor)}</td>
          <td><b>${projCount(r, 'passed')}</b>/${GD.projects.length}${projCount(r, 'pending') ? ` <span class="tag file">⏳ ${projCount(r, 'pending')}</span>` : ''}${projCount(r, 'auto') ? ` <span class="tag">🤖 ${projCount(r, 'auto')}</span>` : ''}${r.fallides ? ` <span class="tag" title="${esc(T('Fallides'))}">💸 ${r.fallides}</span>` : ''}</td>
          <td>${r.websEntregades ? `<b>${r.websEntregades}</b>/${GD.webLevels.length}` : '—'}</td>
          <td>${r.reputacio ?? '—'}</td>
          <td>${r.liquiditat != null ? r.liquiditat.toLocaleString(LOCALE) + ' €' : '—'}</td>
          <td>${esc(r.final ? r.final.replace(/^\S+ \d — /, '') : '—')}</td>
          <td><small>${dateTxt(r.actualitzat)}</small></td>
          <td style="white-space:nowrap"><button class="btn small" data-detail="${esc(k)}">${T("Detall")}</button> ${r._font === 'servidor' ? `<button class="btn small danger" data-del="${esc(k)}" title="Esborrar">✕</button>` : ''}</td>
        </tr>`;
      }).join('')}</tbody>`;
  }

  function detail(k) {
    const r = rows.get(k); if (!r) return;
    const d = document.createElement('div'); d.className = 'modal';
    const ll = r.llicons || {};
    d.innerHTML = `<div class="modal-box wide">
      <div class="detail-h"><span class="ava-s">${avatar(r)}</span><div><h2 style="margin:0">${esc(fullName(r))}</h2><p class="muted" style="margin:0">${esc(r.classe || '')} · ${esc(r.agencia || '')} ${T("· Nivell")} ${r.nivell} ${T("· Camí")} ${esc(r.cami || '—')}</p></div></div>
      <div class="metrics">
        <div class="metric"><small>${T("Capítols")}</small><b>${r.capitolsCompletats} / ${r.capitolsTotal}</b></div>
        <div class="metric"><small>${T("Lliçons superades")}</small><b>${r.llicionsSuperades} / ${r.llicionsTotal}</b></div>
        <div class="metric"><small>${T("Mitjana 1r intent")}</small><b>${pctTxt(r.mitjanaPrimerIntent)}</b></div>
        <div class="metric"><small>${T("Campanyes bones")}</small><b>${r.campanyesBones || 0} / ${r.campanyes || 0}</b></div>
        <div class="metric"><small>${T("Encàrrecs fets")}</small><b>${r.encarrecs || 0}</b></div>
        <div class="metric"><small>${T("Final")}</small><b style="font-size:.9em">${esc(r.final || T('Encara no'))}</b></div>
        <div class="metric ${r.fallides ? 'bad' : ''}"><small>${T("Fallides")}</small><b>${r.fallides || 0}</b></div>
      </div>
      <h4>${T("📚 Lliçons")}</h4>
      <table class="tbl"><thead><tr><th>${T("Lliçó")}</th><th>${T("Àrea")}</th><th>${T("1r intent")}</th><th>${T("Millor")}</th><th>${T("Intents")}</th></tr></thead><tbody>
        ${LESSONS.map(id => { const q = ll[id], l = GD.lessons[id]; return `<tr><td>${esc(l.title)}</td><td><small>${esc(GD.areas[l.area])}</small></td><td>${q ? q.first + '/' + q.total : '—'}</td><td>${q ? q.best + '/' + q.total : '—'}</td><td>${q ? q.tries : 0}</td></tr>`; }).join('')}
      </tbody></table>
      <h4>${T('📋 Projectes reals')}</h4>
      <table class="tbl"><thead><tr><th>${T('Projecte')}</th><th>${T('Estat')}</th><th>${T('Enllaç')}</th><th>${T('Nota')}</th><th></th></tr></thead><tbody>
        ${GD.projects.map(p => { const st = projState(r, p), sub = (r.projectes || {})[p.id], rv = (r.revisions || {})[p.id]; return `<tr><td>${esc(p.title)}<br><small class="muted">${T('cap. {0}', [p.after])}</small></td><td>${PLB()[st].join(' ')}${sub ? `<br><small class="muted">v${sub.v} · ${dateTxt(sub.at)}</small>` : ''}</td><td>${sub ? link(sub.url) : '—'}</td><td>${rv && rv.grade != null ? rv.grade : '—'}</td><td>${sub && r._font === 'servidor' ? `<button class="btn small" data-review="${esc(k)}|${p.id}">${T('Revisar')}</button>` : ''}</td></tr>`; }).join('')}
      </tbody></table>
      <h4>${T('🛠️ Taller web')}</h4>
      ${(r.webPlataformes || []).length ? `<p class="small">${T('Plataformes triades:')} ${r.webPlataformes.map(k => esc(GD.webPlatforms[k] ? GD.webPlatforms[k].n : k)).join(', ')}</p>` : ''}
      <table class="tbl"><thead><tr><th>${T('Nivell')}</th><th>${T('Encàrrec')}</th><th>${T('Plataforma')}</th><th>${T('Enllaç')}</th></tr></thead><tbody>
        ${GD.webLevels.map(L => { const w = (r.webs || {})[L.n]; return `<tr><td>${L.n}</td><td>${esc(L.title)}${w && w.reflection ? `<br><small class="muted">${esc(w.reflection)}</small>` : ''}${w && w.note ? `<br><small>📝 ${esc(w.note)}</small>` : ''}</td><td>${w ? esc(GD.webPlatforms[w.platform] ? GD.webPlatforms[w.platform].n : w.platform) : '—'}</td><td>${w ? `<a href="${/^https?:\/\//i.test(w.url) ? esc(w.url) : '#'}" target="_blank" rel="noopener">${esc(w.url)}</a>${w.reachable === false ? ' ⚠️' : ''}` : '—'}</td></tr>`; }).join('')}
      </tbody></table>
      <h4>${T("🛒 Millores de l'agència")}</h4>
      <p class="small">${(r.millores || []).map(id => { const u = GD.upgradeById(id); return u ? `${u.i} ${esc(u.n)}` : esc(id); }).join(' · ') || '—'}</p>
      ${r.fallides ? `<p class="small err">💸 ${T('Fallides: {0}', [r.fallides])}${(r.fallidesDetall || []).map(f => ` · ${T('setmana {0}, nivell {1}', [f.setmana, f.nivell])}`).join('')}</p>` : ''}
      <h4>${T("🧭 Habilitats i coneixement")}</h4>
      <p class="small">${Object.entries(r.habilitats || {}).map(([k, v]) => `${esc(k)}: <b>${v}</b>`).join(' · ')}</p>
      <p class="small">${Object.entries(r.coneixement || {}).filter(([, v]) => v).map(([k, v]) => `${esc(GD.areas[k] || k)}: <b>${v}</b>`).join(' · ') || '—'}</p>
      <h4>${T("📜 Decisions clau")}</h4>
      <ul class="history">${(r.decisions || []).map(t => `<li class="key">${esc(t)}</li>`).join('') || '<li>—</li>'}</ul>
      <div class="row-btns"><button class="btn primary" id="close">${T("Tancar")}</button></div></div>`;
    document.body.appendChild(d);
    d.querySelector('#close').onclick = () => d.remove();
    d.onclick = (e) => { if (e.target === d) d.remove(); };
  }

  async function api(body) {
    const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Error ' + r.status);
    return j;
  }

  async function load() {
    const pw = $('#pw').value; const classe = normClass($('#cls').value);
    $('#cls').value = classe;
    if (!pw) { $('#pw').focus(); return; }
    $('#msg').innerHTML = T('Carregant…');
    try {
      const { results } = await api({ action: 'list', password: pw, classe });
      try { sessionStorage.setItem(PKEY, JSON.stringify({ pw, classe })); } catch (e) { }
      [...rows.keys()].forEach(k => { if (rows.get(k)._font === 'servidor') rows.delete(k); });
      add(results, 'servidor');
      $('#msg').innerHTML = `<span class="pos">✔ ${T(results.length === 1 ? '{0} alumne' : '{0} alumnes', [results.length])} ${classe ? T('a la classe ') + esc(classe) : T('en total')}.</span>`;
      loadMarket(pw, classe);
    } catch (e) { $('#msg').innerHTML = `<span class="err">${esc(e.message)}</span>`; }
  }

  // Mercat entre agències (només amb una classe concreta)
  async function loadMarket(pw, classe) {
    $('#mktSec').hidden = !classe;
    if (!classe) return;
    try {
      const r = await fetch('/.netlify/functions/joc-classe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'teacher', password: pw, classe }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error);
      const nm = (p) => esc(j.names[p] || p);
      const ST = { pending: T('⏳ En negociació'), accepted: T('✅ Tancat'), rejected: T('❌ Rebutjat'), cancelled: T('🚫 Anul·lat'), expired: T('⌛ Caducat') };
      $('#mkt').innerHTML = (j.offers.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>${T('Data')}</th><th>${T('Contracta')}</th><th>${T('Fa la feina')}</th><th>${T('Servei')}</th><th>${T('Preu')}</th><th>${T('Contraofertes')}</th><th>${T('Estat')}</th></tr></thead><tbody>
        ${j.offers.map(o => { const sv = GD.serviceById(o.kind); return `<tr><td><small>${dateTxt(o.updated)}</small></td><td>${nm(o.buyer)}</td><td>${nm(o.seller)}</td><td>${sv ? sv.i + ' ' + esc(sv.n) : esc(o.kind)}</td><td>${o.price.toLocaleString(LOCALE)} €</td><td>${o.rounds}</td><td>${ST[o.status] || o.status}</td></tr>`; }).join('')}
        </tbody></table></div>` : `<p class="muted">${T('Encara no hi ha cap tracte.')}</p>`)
        + (j.recs.length ? `<p class="small"><b>${T('Recomanacions:')}</b> ${j.recs.map(([a, b]) => `${nm(a)} → ${nm(b)}`).join(' · ')}</p>` : '');
    } catch (e) { $('#mkt').innerHTML = `<p class="err">${esc(e.message)}</p>`; }
  }

  // CSV per a Excel: separador «;», BOM UTF-8 i una columna per lliçó
  /* ===== Temari: a quin punt pertany cada contingut ===== */
  const tag = (codes) => (codes && codes.length ? `[${codes.join(', ')}] ` : '');
  const QL = () => ({ 1: T('Bona'), 0.5: T('Regular'), 0: T('Dolenta') });
  // Totes les decisions puntuades de les missions del temari, en ordre
  const TM_CHOICES = Object.values(GD.chapters).filter(ch => ch.temari).flatMap(ch => ch.steps.filter(st => st.t === 'choice' && st.key && st.opts.some(o => o.q != null)).map(st => ({ key: st.key, ch, prompt: st.prompt })));
  // Llista de tot el que ha fet un alumne, amb els punts del temari i una puntuació en %
  function temariItems(r) {
    const C = GD.codes, out = [], ll = r.llicons || {};
    LESSONS.forEach(id => { const q = ll[id]; if (q) out.push({ codes: C.lessons[id] || [], tipus: T('Lliçó'), nom: GD.lessons[id].title, res: T('1r intent {0}/{1} · millor {2}/{1} · {3} intents', [q.first, q.total, q.best, q.tries]), pct: Math.round(q.best / q.total * 100) }); });
    GD.projects.forEach(p => { const st = projState(r, p), rv = (r.revisions || {})[p.id]; if (st !== 'none') out.push({ codes: C.projects[p.id] || [], tipus: T('Projecte real'), nom: p.title, res: PLB()[st][1] + (rv && rv.grade != null ? ' · ' + T('Nota: {0}', [rv.grade]) : ''), pct: rv && rv.grade != null ? rv.grade * 10 : null }); });
    TM_CHOICES.forEach(c => { const d = (r.decisionsTemari || {})[c.key]; if (d) out.push({ codes: c.ch.codes || [], tipus: T('Missió del temari'), nom: `${c.ch.id} ${c.ch.title} · ${c.prompt}`, res: QL()[d.q], pct: Math.round(d.q * 100) }); });
    GD.webLevels.forEach(L => { const w = (r.webs || {})[L.n]; if (w) out.push({ codes: C.web[L.n] || [], tipus: T('Taller web'), nom: T('Nivell {0}: {1}', [L.n, L.title]), res: w.url, pct: 100 }); });
    const M = r.mon || {};
    Object.entries(M.accions || {}).forEach(([k, a]) => out.push({ codes: C.actions[k] || [], tipus: T('Acció al món'), nom: k, res: `${a.score}/${a.max}`, pct: Math.round(a.score / a.max * 100) }));
    Object.entries(M.problemes || {}).forEach(([k, v]) => out.push({ codes: C.problems[k] || [], tipus: T('Botiguer del món'), nom: k, res: v, pct: v === 'ok' ? 100 : v === 'mig' ? 50 : 0 }));
    return out;
  }
  function codePct(items, code) {
    const v = items.filter(i => i.codes.includes(code) && i.pct != null).map(i => i.pct);
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : '';
  }
  // CSV llarg: una fila per alumne, contingut i punt del temari (ideal per a taules dinàmiques)
  function exportTemariCsv() {
    const list = [...rows.values()].sort((a, b) => (a.classe || '').localeCompare(b.classe || '') || fullName(a).localeCompare(fullName(b)));
    const cell = (v) => { const s = v == null ? '' : String(v); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = [[T('Classe'), T('Alumne'), T('Bloc'), T('Punt del temari'), T('Títol del punt'), T('Tipus de contingut'), T('Contingut'), T('Resultat'), T('Puntuació (%)')].map(cell).join(';')];
    // Una fila per punt del temari i contingut, ordenades per punt (1.1, 1.2... 1.10) dins de cada alumne
    const ord = (c) => { const [b, n] = c.split('.').map(Number); return (b || 99) * 100 + (n || 0); };
    list.forEach(r => temariItems(r).flatMap(it => (it.codes.length ? it.codes : ['—']).map(c => [c, it])).sort((x, y) => ord(x[0]) - ord(y[0]))
      .forEach(([c, it]) => lines.push([r.classe, fullName(r), c.split('.')[0], c, c === '—' ? T("Complementari: gestió de l'agència") : GD.temariTitle(c), it.tipus, it.nom, it.res, it.pct == null ? '' : it.pct].map(cell).join(';'))));
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); const cls = normClass($('#cls').value);
    a.href = URL.createObjectURL(blob); a.download = `agencia-digital_temari${cls ? '_' + cls : ''}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  function exportCsv() {
    const list = [...rows.values()].sort((a, b) => (a.classe || '').localeCompare(b.classe || '') || fullName(a).localeCompare(fullName(b)));
    const head = [T('Classe'), T('Nom'), T('Cognom'), T('Agència'), T('Perfil'), T('Nivell'), T('Etapa actual'), T('Etapes completades'), T('Capítols completats'), T('Capítols totals'), T('Capítol en curs'),
      T('Lliçons superades'), T('Lliçons totals'), T('Mitjana 1r intent (%)'), T('Mitjana millor (%)'), T('Reputació'), T('Liquiditat (€)'), T('Clients'), T('Equip'), T('Camí'), T('Final'),
      T('Campanyes bones'), T('Campanyes'), T('Encàrrecs'), T('Setmana de joc'), T('Iniciat'), T('Darrera actualització'), T('Decisions clau'), T('Projectes aprovats'), T('Fallides'), T('Webs entregades'), T('Plataformes web'),
      ...GD.temari.map(([c, t]) => T('Temari {0} · {1} (%)', [c, t])),
      ...GD.projects.flatMap(p => { const tg = tag(GD.codes.projects[p.id]); return [tg + T('{0} · estat', [p.title]), tg + T('{0} · nota', [p.title]), tg + T('{0} · enllaç', [p.title])]; }),
      ...TM_CHOICES.map(c => tag(c.ch.codes) + T('Missió {0} · {1}', [c.ch.id, c.prompt])),
      ...GD.webLevels.flatMap(L => { const tg = tag(GD.codes.web[L.n]); return [tg + T('Web {0} · plataforma', [L.n]), tg + T('Web {0} · enllaç', [L.n])]; }),
      ...LESSONS.flatMap(id => { const tg = tag(GD.codes.lessons[id]); return [tg + T("{0} · 1r intent", [GD.lessons[id].title]), tg + T("{0} · millor", [GD.lessons[id].title])]; })];
    const cell = (v) => { const s = v == null ? '' : String(v); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = [head.map(cell).join(';')];
    list.forEach(r => {
      const ll = r.llicons || {};
      lines.push([r.classe, r.nom, r.cognom, r.agencia, r.perfil, r.nivell, r.etapaActual, r.etapesCompletades, r.capitolsCompletats, r.capitolsTotal, r.capitolActual,
        r.llicionsSuperades, r.llicionsTotal, r.mitjanaPrimerIntent, r.mitjanaMillor, r.reputacio, r.liquiditat, r.clients, r.equip, r.cami, r.final,
        r.campanyesBones, r.campanyes, r.encarrecs, r.setmana, dateTxt(r.iniciat), dateTxt(r.actualitzat), (r.decisions || []).join(' | '), projCount(r, 'passed'), r.fallides || 0, r.websEntregades || 0, (r.webPlataformes || []).join(', '),
        ...(() => { const it = temariItems(r); return GD.temari.map(([c]) => codePct(it, c)); })(),
        ...GD.projects.flatMap(p => { const st = projState(r, p), sub = (r.projectes || {})[p.id], rv = (r.revisions || {})[p.id]; return [st === 'none' ? '' : PLB()[st][1], rv && rv.grade != null ? rv.grade : '', sub ? sub.url : '']; }),
        ...TM_CHOICES.map(c => { const d = (r.decisionsTemari || {})[c.key]; return d ? QL()[d.q] : ''; }),
        ...GD.webLevels.flatMap(L => { const w = (r.webs || {})[L.n]; return w ? [w.platform, w.url] : ['', '']; }),
        ...LESSONS.flatMap(id => ll[id] ? [`${ll[id].first}/${ll[id].total}`, `${ll[id].best}/${ll[id].total}`] : ['', ''])].map(cell).join(';'));
    });
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    const cls = normClass($('#cls').value);
    a.href = URL.createObjectURL(blob);
    a.download = `agencia-digital_resultats${cls ? '_' + cls : ''}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  $('#load').onclick = load;
  $('#pw').onkeydown = $('#cls').onkeydown = (e) => { if (e.key === 'Enter') load(); };
  $('#csv').onclick = exportCsv;
  $('#csvTemari').onclick = exportTemariCsv;
  $('#files').onchange = async (e) => {
    const list = [];
    for (const f of e.target.files) {
      try { const j = JSON.parse(await f.text()); if (j && j.id) list.push(j); else throw 0; }
      catch (err) { toast(T("El fitxer {0} no és un fitxer de resultats vàlid", [esc(f.name)]), 'bad'); }
    }
    const n = add(list, 'fitxer');
    if (n) toast(T("{0} alumne{1} afegit{2} des de fitxer", [n, n === 1 ? '' : 's', n === 1 ? '' : 's']), 'good');
    e.target.value = '';
  };
  document.addEventListener('click', async (e) => {
    const th = e.target.closest('th[data-sort]');
    if (th) { if (sortKey === th.dataset.sort) sortDir *= -1; else { sortKey = th.dataset.sort; sortDir = 1; } render(); return; }
    const det = e.target.closest('[data-detail]'); if (det) { detail(det.dataset.detail); return; }
    const rvb = e.target.closest('[data-review]');
    if (rvb) { const [k, pid] = rvb.dataset.review.split('|'); document.querySelectorAll('.modal').forEach(m => m.remove()); reviewModal(k, pid); return; }
    const del = e.target.closest('[data-del]');
    if (del) {
      const r = rows.get(del.dataset.del);
      if (!r || !confirm(T("Vols esborrar els resultats de {0}? No es pot desfer.", [fullName(r)]))) return;
      try { await api({ action: 'delete', password: $('#pw').value, classe: r.classe, id: r.id }); rows.delete(del.dataset.del); render(); toast(T('Resultats esborrats')); }
      catch (err) { toast(esc(err.message), 'bad'); }
    }
  });

  try { const s = JSON.parse(sessionStorage.getItem(PKEY) || 'null'); if (s) { $('#pw').value = s.pw; $('#cls').value = s.classe || ''; load(); } } catch (e) { }
  translateDom();
  document.title = T('Panell del professor') + ' · Agència Digital';
  $('#langs').innerHTML = LANGS.map(([k, n]) => `<button class="${k === LANG ? 'on' : ''}" data-lang="${k}">${n}</button>`).join('');
  $('#langs').onclick = (e) => { const b = e.target.closest('[data-lang]'); if (b && b.dataset.lang !== LANG) setLang(b.dataset.lang); };
  render();
})();
