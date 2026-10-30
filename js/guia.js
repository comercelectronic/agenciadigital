/* Agència Digital — guia dels projectes reals (pàgina guia.html) */
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Els textos de la guia no coneixen el jugador: es treuen els marcadors de nom i es fa servir la forma neutra
  const clean = (s) => String(s || '').replace(/\{g:[^|}]*\|[^|}]*\|([^}]*)\}/g, '$1').replace(/^\{nom\},?\s*/, '').replace(/\{nomc?\}/g, '').replace(/^./, c => c.toUpperCase());
  const G = GD.projGuide;

  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast good'; t.textContent = msg;
    document.getElementById('toasts').appendChild(t); setTimeout(() => t.remove(), 2600);
  }
  function copy(text) {
    const done = () => toast(T('Plantilla copiada: enganxa-la al teu document.'));
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => fallback());
    else fallback();
    function fallback() { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { } ta.remove(); }
  }

  function project(p, n) {
    const quote = p.brief.find(l => !l[0].startsWith('pau'));
    return `<article class="card" id="${p.id}">
      <div class="pj-h"><span class="pj-ava">${ART.portrait(p.who, 'n')}</span>
        <div><small>${T('Projecte {0}', [n])} · ${esc(p.kind)} · ${T('després del capítol {0}', [p.after])}</small><h2>${esc(p.title)}</h2>${(GD.codes.projects[p.id] || []).map(c => `<em class="tm-chip" title="${esc(GD.temariTitle(c))}">${c}</em>`).join('')}</div></div>
      ${quote ? `<p><i>«${esc(clean(quote[1]))}»</i> — ${esc(GD.names[p.who] || '')}</p>` : ''}
      <div class="meta"><p><b>${T('Objectiu:')}</b> ${esc(p.goal)}</p><p><b>${T('Format:')}</b> ${esc(p.format)}</p></div>
      <h3>${T('Què ha de contenir')}</h3>
      <ol class="pj-sec">${p.sections.map(s => `<li><b>${esc(s.h)}.</b> ${esc(s.d)}</li>`).join('')}</ol>
      <h3>${T('Passos recomanats')}</h3>
      <ol class="steps">${p.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <h3>${T('Eines')}</h3><p>${esc(p.tools)}</p>
      <h3>${T('Rúbrica: com s\'avaluarà')}</h3>
      <div class="table-wrap"><table class="tbl rubric"><thead><tr><th>${T('Criteri')}</th>${GD.rubricLevels.map((l, i) => `<th>${i} · ${esc(l.n)}</th>`).join('')}</tr></thead><tbody>
        ${p.rubric.map(s => `<tr><td>${esc(s)}</td>${GD.rubricLevels.map(() => '<td></td>').join('')}</tr>`).join('')}</tbody></table></div>
      <div class="errors"><b>💡 ${T('Consells')}</b><ul class="tips">${p.tips.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
      <div class="row-btns"><button class="btn primary" data-tpl="${p.id}">${T('📄 Copiar la plantilla')}</button><a class="btn ghost" href="#top">${T('↑ Índex')}</a></div>
    </article>`;
  }

  function render() {
    const root = document.getElementById('gd');
    let n = 0;
    const byStage = GD.stages.map(st => ({ st, ps: GD.projects.filter(p => GD.chapters[p.after] && GD.chapters[p.after].stage === st.id) })).filter(x => x.ps.length);
    root.innerHTML = `
      <header class="gd-h" id="top"><img src="icons/icon.svg" alt="">
        <div><h1>${T('📘 Guia dels projectes reals')}</h1><p>${T('Agència Digital · què has de fer, com i com s\'avaluarà')}</p></div>
        <span class="langs small">🌐 ${LANGS.map(([k, nm]) => `<button class="${k === LANG ? 'on' : ''}" data-lang="${k}">${nm}</button>`).join('')}</span></header>
      <section class="card"><p>${esc(G.intro)}</p>
        <div class="how">${G.how.map(h => `<div><b>${esc(h.h)}</b>${esc(h.d)}</div>`).join('')}</div>
        <h3>${T('🤖 Ús de la IA')}</h3><p>${esc(G.ai)}</p>
        <h3>${T('📣 Anuncis reals')}</h3><p>${esc(G.ads)}</p>
        <h3>${T('✅ Avaluació')}</h3><p>${esc(G.grading)}</p>
        <div class="table-wrap"><table class="tbl rubric"><thead><tr>${GD.rubricLevels.map((l, i) => `<th>${i} · ${esc(l.n)}</th>`).join('')}</tr></thead><tbody><tr>${GD.rubricLevels.map(l => `<td>${esc(l.d)}</td>`).join('')}</tr></tbody></table></div>
        <div class="row-btns noprint"><a class="btn" href="./">${T('🎮 Tornar al joc')}</a><button class="btn" id="print">${T('🖨️ Imprimir o desar en PDF')}</button></div></section>
      <nav class="card toc"><h3>${T('Índex de projectes')}</h3><ol>${GD.projects.map(p => `<li><a href="#${p.id}">${esc(p.title)}</a> <small class="muted">(${T('cap. {0}', [p.after])})</small></li>`).join('')}</ol></nav>
      ${byStage.map(({ st, ps }) => `<h2 class="stage-t">${T('Etapa {0}', [st.id])} · ${esc(clean(st.title))}</h2>${ps.map(p => project(p, ++n)).join('')}`).join('')}`;
    root.querySelectorAll('[data-tpl]').forEach(b => b.onclick = () => copy(GD.projectTemplate(GD.projectById(b.dataset.tpl), '')));
    root.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { if (b.dataset.lang !== LANG) setLang(b.dataset.lang); });
    document.getElementById('print').onclick = () => window.print();
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 50); }
  }
  render();
})();
