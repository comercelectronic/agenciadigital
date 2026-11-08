/* Agència Digital — motor del joc */
(function () {
  'use strict';

  const GD = window.GD;
  const SAVE_KEY = 'agencia-digital-partida-v1';
  const $ = (s, r) => (r || document).querySelector(s);
  // Qualsevol pantalla nova tanca el món explorable (si estava obert)
  const app = () => { if (window.WORLD) WORLD.close(); return $('#app'); };

  /* ================= Constants de joc ================= */
  const SKILLS = {
    estrategia:  { n: T('Estratègia'),  i: '🧭', d: T('Diagnòstics més encertats i plans més sòlids. +qualitat a totes les campanyes.') },
    creativitat: { n: T('Creativitat'), i: '🎨', d: T('Missatges i continguts que connecten. +resultats en marca, xarxes i anuncis.') },
    analitica:   { n: T('Analítica'),   i: '📊', d: T('Llegeixes les dades amb rigor. +precisió i opcions de diàleg basades en dades.') },
    comercial:   { n: T('Comercial'),   i: '🤝', d: T('Negocies millor. +5% als honoraris per cada 10 nivells i més confiança dels clients.') },
    gestio:      { n: T('Direcció'),    i: '🏢', d: T('Organitzes equip i diners. −4% de despeses fixes per cada 10 nivells i més marge en crisis.') }
  };
  // Habilitats: 50 nivells (S.skills) que la història llegeix en una escala de 0 a 5 (cada 10 nivells, 1 punt)
  const SKILL_MAX = 50, SKILL_TIER = 10, SKILL_TIERS = SKILL_MAX / SKILL_TIER;
  const CHARS_TRUST = ['carme', 'miquel', 'julia', 'berta', 'quim', 'laia'];
  const RANKS = {
    m: [T('Emprenedor novell'), T('Consultor local'), T('Estrateg digital'), T('Director d\'equip'), T('Gestor de crisis'), T('Director d\'agència'), T('Director estratègic'), T('Referent del sector'), T('Llegenda d\'Osona')],
    f: [T('Emprenedora novella'), T('Consultora local'), T('Estratega digital'), T('Directora d\'equip'), T('Gestora de crisis'), T('Directora d\'agència'), T('Directora estratègica'), T('Referent del sector'), T('Llegenda d\'Osona')],
    n: [T('Primeres passes'), T('Consultoria local'), T('Estratègia digital'), T('Direcció d\'equip'), T('Gestió de crisis'), T('Direcció d\'agència'), T('Direcció estratègica'), T('Referent del sector'), T('Llegenda d\'Osona')]
  };
  // Les funcions es criden amb una ruta relativa a la carpeta del joc: serveix tant a la seva adreça de Netlify com dins d'ecoynexo.com/jocs/agencia-digital/
  const FN = location.pathname.replace(/[^/]*$/, '') + '.netlify/functions/';
  const API = FN + 'joc-resultats';
  // Progressió a 100 nivells: cada nivell antic equival a 3 nivells nous (mateixa experiència total)
  const xpNeed = (lvl) => 60 + 25 * Math.ceil(lvl / 12);
  const MAX_LEVEL = 100;
  const SP_PER_LEVEL = 3;

  /* ================= Estat ================= */
  let S = null;
  let settings = { speed: 18 };

  function newState() {
    return {
      v: 1, agency: T('Píxel d\'Osona'), profile: null,
      player: { id: uid(), name: 'Pau', surname: 'Riera', g: 'm', look: Object.assign({}, ART.PLAYER_DEFAULT) },
      classe: '', quizLog: {}, syncPending: false, lastSync: 0, web: { platforms: [], levels: {} }, proj: {}, upgrades: {},
      level: 1, xp: 0, sp: 0, prog: 2,
      skills: { estrategia: 0, creativitat: 0, analitica: 0, comercial: 0, gestio: 0 },
      money: 3000, reserve: 0, week: 1, rep: 5,
      trust: { carme: 0, miquel: 0, julia: 0, berta: 0, quim: 0, laia: 0 },
      know: Object.fromEntries(Object.keys(GD.areas).map(k => [k, 0])),
      rent: 350, tools: 50, team: [], clients: [],
      f: {}, history: [], lessons: {}, done: {}, cur: null,
      gigs: [], gigsDone: {}, cm: {}, days: {}, stats: { income: 0, expenses: 0, gigs: 0, campaigns: 0, good: 0 },
      ending: null, started: Date.now()
    };
  }

  function uid() {
    try { if (crypto.randomUUID) return crypto.randomUUID(); } catch (e) { }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  }
  function applyPlayer() { if (!S) return; ART.setPlayer(S.player.look); ART.CHARS.pau.name = S.player.name; }
  function save() { if (S) { if (!S.days) S.days = {}; S.days[today()] = 1; } try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* sense emmagatzematge */ } }
  function loadSave() { try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
  function loadSettings() { try { Object.assign(settings, JSON.parse(localStorage.getItem(SAVE_KEY + '-cfg') || '{}')); } catch (e) { } }
  function saveSettings() { try { localStorage.setItem(SAVE_KEY + '-cfg', JSON.stringify(settings)); } catch (e) { } }

  /* ================= Utilitats ================= */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const eur = (n) => (Math.round(n)).toLocaleString(LOCALE) + ' €';
  const pct = (n) => (Math.round(n * 10) / 10).toLocaleString(LOCALE) + ' %';
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rnd = (a, b) => a + Math.random() * (b - a);
  // Marcadors del guió: {nom}, {nomc} (nom complet), {en}/{En} («en Pau», «la Marta», «l'Anna»),
  // {den} («d'en Pau», «de la Marta») i {g:masculí|femení|neutre}.
  function gi() { return { m: 0, f: 1, n: 2 }[S && S.player ? S.player.g : 'm'] || 0; }
  function playerRefs() {
    const p = (S && S.player) || { name: 'Pau', surname: '', g: 'm' };
    const n = esc(p.name), vow = /^h?[aeiouàèéíòóú]/i.test(p.name);
    let en, den;
    if (LANG === 'es') { en = n; den = 'de ' + n; }
    else if (LANG === 'en') { en = n; den = n + '\u2019s'; }
    else if (p.g === 'f') { en = (vow ? 'l\'' : 'la ') + n; den = (vow ? 'de l\'' : 'de la ') + n; }
    else if (p.g === 'n') { en = n; den = (vow ? 'd\'' : 'de ') + n; }
    else { en = (vow ? 'l\'' : 'en ') + n; den = (vow ? 'de l\'' : 'd\'en ') + n; }
    return { nom: n, nomc: esc((p.name + ' ' + (p.surname || '')).trim()), en, En: en.charAt(0).toUpperCase() + en.slice(1), den };
  }
  function txt(t) {
    if (typeof t === 'function') t = t(S, H);
    const r = playerRefs(), g = gi();
    return String(t == null ? '' : t)
      .replace(/\{g:([^}]*)\}/g, (_, v) => { const o = v.split('|'); return o[g] != null && o[g] !== '' ? o[g] : o[0]; })
      .replace(/\{agencia\}/g, esc(S ? S.agency : ''))
      .replace(/\{(nomc|nom|En|en|den)\}/g, (_, k) => r[k]);
  }
  function stageOf(chId) { return GD.chapters[chId].stage; }
  function stagesDone() { return GD.stages.filter(st => st.chapters.every(c => S.done[c])).length; }
  function rank() { return Math.min(4, Math.floor(stagesDone() / 2)); }
  function title() { const L = RANKS[(S && S.player && S.player.g) || 'm']; return L[Math.min(L.length - 1, stagesDone())]; }
  // Habilitat efectiva: punts del personatge + bonificacions de les millores comprades
  function sk(k) { return Math.min(SKILL_TIERS, ((S.skills[k] || 0) + SKILL_TIER * upSkill(k)) / SKILL_TIER); }
  const skLvl = (k) => Math.min(SKILL_MAX, (S.skills[k] || 0) + SKILL_TIER * upSkill(k));
  GD.sk = (k) => (S ? sk(k) : 0);
  const owned = () => Object.keys(S.upgrades || {}).map(GD.upgradeById).filter(Boolean);
  function upSkill(k) { return owned().reduce((a, u) => a + ((u.bonus.skill || {})[k] || 0), 0); }
  function upBonus(kind) { return owned().reduce((a, u) => a + (u.bonus[kind] || 0), 0); }
  function upMonthly() { return owned().reduce((a, u) => a + (u.monthly || 0), 0); }
  function weeklyIncome() { return S.clients.reduce((a, c) => a + c.fee, 0) / 4; }
  function weeklyCost() {
    const base = S.rent + S.tools + upMonthly() + S.team.reduce((a, t) => a + t.salary, 0);
    return base * (1 - 0.04 * sk('gestio')) * (1 - cmBonus('costs') / 100) / 4;
  }
  function knowTotal() { return Object.values(S.know).reduce((a, b) => a + b, 0); }

  // Ajudes per al contingut (data.js)
  const H = {
    sk, clamp, rnd, eur, pct,
    f: (k) => S.f[k],
    trust: (c) => S.trust[c] || 0,
    know: (k) => S.know[k] || 0,
    lesson: (id) => S.lessons[id] ? S.lessons[id].best : 0,
    // Qualitat d'una acció: base (0-1) + habilitats + coneixement + soroll
    q: (base, skills, know) => {
      let v = base;
      (skills || []).forEach(k => v += 0.035 * sk(k));
      (know || []).forEach(k => v += 0.02 * Math.min(4, S.know[k] || 0));
      return clamp(v + rnd(-0.06, 0.06), 0, 1.2);
    },
    hasClient: (id) => S.clients.some(c => c.id === id),
    teamHas: (id) => S.team.some(t => t.id === id),
    get S() { return S; }
  };
  window.H = H;

  /* ================= Efectes ================= */
  let RUN = null; // resum del capítol en curs
  function runInit() { RUN = S.cur && S.cur.run ? S.cur.run : { xp: 0, money: 0, rep: 0, trust: {}, know: {} }; if (S.cur) S.cur.run = RUN; }

  function applyFx(fx, silent) {
    if (!fx) return;
    if (typeof fx === 'function') fx = fx(S, H);
    if (!fx) return;
    const notes = [];
    if (fx.money) {
      let m = fx.money;
      if (m > 0 && fx.fee) m = Math.round(m * (1 + 0.05 * sk('comercial') + upBonus('fee') / 100));
      if (m > 0 && fx.src) m = Math.round(m * (1 + cmBonus(fx.src) / 100)); // habilitats passives dels Comerçmons
      // Economia del servidor: l'operació va a la cua; l'impost dels ingressos va a la guardiola de la classe
      const [etipus, eref] = econTipus(fx, m);
      econPush(etipus, eref, m);
      const imp = econTax(m, etipus);
      if (imp) { m -= imp; notes.push(T('🐷 −{0} d\'impostos', [eur(imp)])); }
      S.money += m; if (m > 0) S.stats.income += m; else S.stats.expenses -= m;
      if (RUN) RUN.money += m;
      notes.push((m > 0 ? '+' : '') + eur(m));
    }
    if (fx.reserve) { S.money -= fx.reserve; S.reserve += fx.reserve; }
    if (fx.rep > 0 && S.cm) { const b = cmBonus('rep'); if (b) { S.cm.repFrac = (S.cm.repFrac || 0) + fx.rep * b / 100; if (S.cm.repFrac >= 1) { fx.rep += Math.floor(S.cm.repFrac); S.cm.repFrac -= Math.floor(S.cm.repFrac); } } }
    if (fx.rep) { S.rep = clamp(S.rep + fx.rep, 0, 100); if (RUN) RUN.rep += fx.rep; notes.push((fx.rep > 0 ? '+' : '') + fx.rep + T(' reputació')); }
    if (fx.trust) for (const k in fx.trust) {
      S.trust[k] = clamp((S.trust[k] || 0) + fx.trust[k], -5, 10);
      if (RUN) RUN.trust[k] = (RUN.trust[k] || 0) + fx.trust[k];
      if (!silent && GD.names[k]) notes.push(`${GD.names[k]} ${fx.trust[k] > 0 ? '♥+' : '💔'}${fx.trust[k] > 0 ? fx.trust[k] : fx.trust[k]}`);
    }
    if (fx.know) for (const k in fx.know) { S.know[k] = (S.know[k] || 0) + fx.know[k]; if (RUN) RUN.know[k] = (RUN.know[k] || 0) + fx.know[k]; }
    if (fx.skill) for (const k in fx.skill) S.skills[k] = clamp(S.skills[k] + fx.skill[k] * SKILL_TIER, 0, SKILL_MAX);
    if (fx.flags) Object.assign(S.f, fx.flags);
    if (fx.client) { S.clients = S.clients.filter(c => c.id !== fx.client.id); S.clients.push(fx.client); notes.push(T("Nou client recurrent: {0}", [fx.client.name])); }
    if (fx.dropClient) { const c = S.clients.find(x => x.id === fx.dropClient); if (c) { S.clients = S.clients.filter(x => x.id !== fx.dropClient); notes.push(T("Deixes de treballar amb {0}", [c.name])); } }
    if (fx.clientFee) for (const k in fx.clientFee) { const c = S.clients.find(x => x.id === k); if (c) c.fee = Math.max(0, c.fee + fx.clientFee[k]); }
    if (fx.hire) { if (!S.team.some(t => t.id === fx.hire.id)) { S.team.push(fx.hire); notes.push(T("S'incorpora {0} a l'equip", [fx.hire.name])); } }
    if (fx.fire) S.team = S.team.filter(t => t.id !== fx.fire);
    if (fx.rent != null) S.rent = fx.rent;
    if (fx.tools != null) S.tools = fx.tools;
    if (fx.log) S.history.push({ ch: S.cur ? S.cur.id : '-', week: S.week, t: txt(fx.log), key: !!fx.key });
    if (fx.xp) addXP(fx.xp);
    if (!silent && notes.length) toast(notes.join(' · '));
  }

  function addXP(n) {
    if (S.level >= MAX_LEVEL) { cmShareXp(n); return; }
    n = Math.round(n * (1 + upBonus('xp') / 100 + cmBonus('xp') / 100));
    cmShareXp(n);
    S.xp += n; if (RUN) RUN.xp += n;
    let up = 0;
    while (S.level < MAX_LEVEL && S.xp >= xpNeed(S.level)) { S.xp -= xpNeed(S.level); S.level++; S.sp += SP_PER_LEVEL; up++; }
    if (up) levelUpFx();
    hud();
  }

  function advanceWeeks(n) {
    let inc = 0, cost = 0;
    for (let i = 0; i < n; i++) {
      inc += weeklyIncome(); cost += weeklyCost();
      // Préstec ràpid: 3.000 € que es tornen amb un 30 % d'interessos en 26 setmanes
      if (S.f.prestec && (S.f.prestecPagat || 0) < 26) { cost += 150; S.f.prestecPagat = (S.f.prestecPagat || 0) + 1; }
    }
    const incTax = econTax(Math.round(inc), 'clients');
    econPush('clients', 'setmana-' + (S.week + n), inc); econPush('despesa', 'setmana-' + (S.week + n), -cost);
    S.week += n; S.money += inc - incTax - cost; S.stats.income += inc; S.stats.expenses += cost;
    if (S.money < 0) S.f.numerosVermells = (S.f.numerosVermells || 0) + 1;
    return { inc, cost, n };
  }

  /* ================= Fallida ================= */
  // Si la liquiditat (diners + reserva) queda en negatiu, l'agència tanca i cal començar de zero.
  function bankrupt() {
    if (!S || S.ending || S.money >= 0) return false;
    if (S.money + S.reserve >= 0) {
      const m = -S.money; S.reserve -= m; S.money = 0; save();
      toast(T('⚠️ Has hagut de fer servir {0} de la reserva per pagar les despeses.', [eur(m)]), 'bad');
      return false;
    }
    bankruptScreen(); return true;
  }
  function bankruptScreen() {
    const losses = S.history.filter(h => /−|-\d|€/.test(h.t)).slice(-6).reverse();
    app().innerHTML = `<section class="ending bankrupt">
      <div class="bg">${ART.background('despatx:night')}</div>
      <div class="ending-box">
        <small>${T('Fi de la partida')}</small>
        <h1>${T('💸 L\'agència ha fet fallida')}</h1>
        <div class="ending-cast"><span>${ART.portrait('pau', 'w', { rank: rank() })}</span></div>
        <p>${T('La liquiditat ha quedat en {0}. Sense diners per pagar el lloguer, les eines i els sous, {agencia} ha de tancar.', [eur(S.money + S.reserve)]).replace('{agencia}', esc(S.agency))}</p>
        ${losses.length ? `<h4>${T('Les decisions que més han pesat')}</h4><ul class="history">${losses.map(h => `<li class="key"><small>${T('Cap.')} ${h.ch} · S${h.week}</small>${esc(h.t)}</li>`).join('')}</ul>` : ''}
        <p class="muted">${T('Recorda: el pressupost dels clients no és teu, cada error es paga i cal tenir una reserva per als mesos dolents.')}</p>
        <p class="muted small">${T('Començaràs de zero: es perden el nivell, els diners, els clients i els capítols. Es conserven el teu personatge, el codi de classe, els projectes reals entregats i les webs del Taller.')}</p>
        <div class="row-btns center"><button class="btn primary big" id="restart">${T('🔁 Tornar a començar de zero')}</button></div>
      </div></section>`;
    $('#restart').onclick = () => {
      const keep = {
        player: S.player, classe: S.classe, proj: S.proj, web: S.web, quizLog: S.quizLog, cm: S.cm, days: S.days,
        fallides: (S.fallides || 0) + 1,
        fallidesLog: (S.fallidesLog || []).concat([{ at: new Date().toISOString(), setmana: S.week, nivell: S.level, capitols: Object.keys(S.done).length }])
      };
      const econKeep = S.econ;
      S = Object.assign(newState(), keep);
      S.econ = econKeep; econPush('reinici', 'fallida', 1);
      applyPlayer(); save(); queueSync();
      goWorld();
      toast(T('Nova oportunitat. Aquesta vegada, vigila els diners!'), 'good');
    };
  }

  /* ================= Interfície general ================= */
  function toast(msg, cls) {
    const t = document.createElement('div');
    t.className = 'toast ' + (cls || ''); t.innerHTML = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 3200);
    setTimeout(() => t.remove(), 3800);
  }

  function levelUpFx() {
    const d = document.createElement('div');
    d.className = 'levelup';
    d.innerHTML = `<div class="lu-lines"></div><div class="lu-box"><div class="lu-t">${T("LEVEL UP!")}</div><div class="lu-s">${T("Nivell")} ${S.level} ${T("· +{0} punts d'habilitat", [SP_PER_LEVEL])}</div></div>`;
    document.body.appendChild(d);
    petals(d, 24);
    setTimeout(() => d.classList.add('out'), 1900);
    setTimeout(() => d.remove(), 2500);
  }

  function petals(container, n) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'petal';
      p.style.left = rnd(0, 100) + '%';
      p.style.animationDelay = rnd(0, 6) + 's';
      p.style.animationDuration = rnd(6, 12) + 's';
      p.style.transform = `scale(${rnd(0.6, 1.3)})`;
      container.appendChild(p);
    }
  }

  function hud() {
    const h = $('#hud'); if (!h || !S) return;
    const need = xpNeed(S.level);
    h.innerHTML = `
      <button class="hud-agency" data-act="hub" title="Tornar al centre d'operacions">
        <span class="hud-ava">${ART.portrait('pau', 'n', { rank: rank() })}</span>
        <span><b>${esc(S.agency)}</b><small>${title()}</small></span>
      </button>
      <div class="hud-stats">
        <span class="chip ${S.money < 0 ? 'neg' : ''}" title="Liquiditat">💶 ${eur(S.money)}</span>
        <span class="chip" title="Reputació">⭐ ${S.rep}</span>
        <span class="chip" title="Setmana">📅 S${S.week}</span>
        <span class="chip lvl" title="Nivell i experiència">${T("Nv")} ${S.level}<i class="xpbar"><i style="width:${S.level >= MAX_LEVEL ? 100 : Math.round(S.xp / need * 100)}%"></i></i></span>
      </div>`;
  }

  /* ================= Pantalla de títol ================= */
  function titleScreen() {
    const has = loadSave();
    ART.setPlayer(has && has.player ? has.player.look : null);
    app().innerHTML = `
      <section class="title-screen">
        <div class="title-bg">${ART.background('vic')}</div>
        <div class="title-petals"></div>
        <div class="title-content">
          <div class="title-ava">${ART.portrait('pau', 'h', { rank: 0 })}</div>
          <h1 class="logo"><span>${T("Agència")}</span><span>${T("Digital")}</span></h1>
          <p class="tagline">${T("De Vic al món · Un joc de màrqueting i empresa")}</p>
          <div class="title-btns">
            ${has ? `<button class="btn big primary" data-act="continue">${T("▶ Continuar partida")} <small>${has.player ? esc(has.player.name) + ' · ' : ''}${esc(has.agency)} ${T("· Nivell")} ${has.level}</small></button>` : ''}
            <button class="btn big ${has ? '' : 'primary'}" data-act="new">${T("✦ Nova partida")}</button>
            <button class="btn" data-act="import">${T("⇪ Importar partida")}</button>
            <div class="langs">${LANGS.map(([k, n]) => `<button class="${k === LANG ? 'on' : ''}" data-lang="${k}">${n}</button>`).join('')}</div>
            <button class="btn ghost install-btn" data-act="install" hidden>${T("📲 Instal·lar com a app")}</button>
          </div>
          <p class="fine">${T("Personatges, empreses i resultats de les campanyes són ficticis i simulats.")}</p>
        </div>
      </section>`;
    petals($('.title-petals'), 18);
    updateInstallBtn();
  }

  /* ================= Centre d'operacions (hub) ================= */
  let hubTab = 'campanya';
  function hubScreen(tab) {
    if (tab) hubTab = tab;
    S.cur = null; save();
    app().innerHTML = `
      <header id="hud"></header>
      <main class="hub">
        <button class="to-world" data-act="world">🗺️ ${T('Sortir a explorar Vic')}</button>
        <div class="hub-body" id="hubBody"></div>
      </main>
      <nav class="tabs">
        ${[['campanya', '🗺️', T('Campanya')], ['pau', '🧑', esc(S.player.name)], ['encarrecs', '📨', T('Encàrrecs')], ['projectes', '📋', T('Projectes')], ['comercdex', '🐾', T('Comerçdex')], ['classe', '🏆', T('Classe')], ['taller', '🛠️', T('Taller')], ['biblioteca', '📚', T('Biblioteca')], ['empresa', '🏢', T('Empresa')]]
          .map(([k, i, n]) => `<button class="tab ${hubTab === k ? 'on' : ''}" data-tab="${k}"><span>${i}</span>${n}${k === 'pau' && S.sp ? `<em class="dot">${S.sp}</em>` : ''}${k === 'projectes' && projTodo() ? `<em class="dot">${projTodo()}</em>` : ''}${k === 'comercdex' && (!cmState().starter || cmAvailable().length) ? `<em class="dot">${cmState().starter ? cmAvailable().length : '!'}</em>` : ''}${k === 'classe' && S.market && S.market.myTurn ? `<em class="dot">${S.market.myTurn}</em>` : ''}</button>`).join('')}
      </nav>`;
    hud();
    const body = $('#hubBody');
    ({ campanya: tabCampanya, pau: tabPau, encarrecs: tabGigs, projectes: tabProjectes, classe: tabClasse, taller: tabTaller, comercdex: tabComercdex, biblioteca: tabLibrary, empresa: tabEmpresa })[hubTab](body);
  }

  function chapterState(chId) {
    if (S.done[chId]) return 'done';
    const ch = GD.chapters[chId];
    const st = GD.stages.find(s => s.id === ch.stage);
    const idx = st.chapters.indexOf(chId);
    const prevStage = GD.stages.find(s => s.id === ch.stage - 1);
    if (prevStage && !prevStage.chapters.every(c => S.done[c])) return 'locked';
    if (S.level < st.minLevel && idx === 0) return 'level';
    if (idx > 0 && !S.done[st.chapters[idx - 1]]) return 'locked';
    if (projGate(chId)) return 'proj';
    if (S.level < st.minLevel) return 'level';
    return 'open';
  }

  function tabCampanya(el) {
    const next = Object.keys(GD.chapters).find(c => chapterState(c) === 'open');
    el.innerHTML = `
      ${S.ending ? `<div class="card ending-mini"><b>${T("Has arribat a un final:")} ${esc(GD.endings[S.ending].title)}</b><p>${T("Pots continuar en mode lliure amb els encàrrecs o començar una partida nova amb una altra estratègia.")}</p><button class="btn" data-act="showEnding">${T("Tornar a veure el final")}</button></div>` : ''}
      ${fixesCard()}
      ${next ? `<button class="next-mission" data-ch="${next}">
          <span class="nm-ava">${ART.portrait(GD.chapters[next].who || 'pau', 'n', { rank: rank() })}</span>
          <span class="nm-txt"><small>${T("Següent missió · Capítol")} ${next}</small><b>${txt(GD.chapters[next].title)}</b><i>${txt(GD.chapters[next].blurb || '')}</i></span>
          <span class="nm-go">▶</span></button>` : ''}
      ${!next && !S.ending ? (() => {
        const gc = Object.keys(GD.chapters).find(c => chapterState(c) === 'proj'), gp = gc && projGate(gc);
        if (!gp) return `<div class="card warn">${levelHint()}</div>`;
        const ps = projStatus(gp);
        return `<button class="next-mission proj-gate" data-proj="${gp.id}">
          <span class="nm-ava">${ART.portrait(gp.who, ps === 'changes' ? 't' : 'n')}</span>
          <span class="nm-txt"><small>${T('📋 Projecte real · entrega\'l per continuar')}</small><b>${txt(gp.title)}</b><i>${T('Per continuar amb el capítol {0}, fes aquest projecte i entrega\'l.', [gc])} 💶 ${T('Pagament: fins a {0}', [eur(GD.projMax(gp))])}</i></span>
          <span class="nm-go">${PST()[ps][0]}</span></button>`;
      })() : ''}
      <div class="stages">
        ${GD.stages.map(st => {
          const done = st.chapters.filter(c => S.done[c]).length;
          const prevOk = st.id === 1 || GD.stages[st.id - 2].chapters.every(c => S.done[c]);
          const lock = !prevOk;
          return `<section class="stage ${lock ? 'locked' : ''} ${done === st.chapters.length ? 'complete' : ''}" style="--sc:${st.color}">
            <header><span class="st-num">${String(st.id).padStart(2, '0')}</span><div><h3>${txt(st.title)}</h3><p>${esc(st.sub)} ${T("· Nivells")} ${st.levels}</p></div><span class="st-prog">${done}/${st.chapters.length}</span></header>
            ${lock ? T('<p class="lockmsg">🔒 Completa l\'etapa anterior per desbloquejar-la.</p>') : `<ol>${st.chapters.map(c => {
              const s = chapterState(c);
              return `<li class="ch ${s}"><button ${s === 'open' || s === 'done' ? `data-ch="${c}"` : s === 'proj' ? `data-proj="${projGate(c).id}"` : 'disabled'}><span class="ch-id">${c}</span><span class="ch-t">${GD.chapters[c].temari ? '<em class="tm-badge">📘 ' + T('Temari') + '</em> ' : ''}${txt(GD.chapters[c].title)}</span><span class="ch-s">${s === 'done' ? '✔' : s === 'open' ? '▶' : s === 'proj' ? '📋' : s === 'level' ? T("Nv {0}", [st.minLevel]) : '🔒'}</span></button></li>`;
            }).join('')}</ol>`}
          </section>`;
        }).join('')}
      </div>`;
  }

  function levelHint() {
    const st = GD.stages.find(s => s.chapters.some(c => !S.done[c]));
    if (!st) return T('Has completat la campanya!');
    if (S.level < st.minLevel) return `${T("🔒 L'etapa")} <b>${txt(st.title)}</b> ${T("requereix nivell")} ${st.minLevel}${T(". Fes encàrrecs a la pestanya")} <b>${T("📨 Encàrrecs")}</b> ${T("per guanyar experiència i diners.")}`;
    return T('Continua amb la següent missió.');
  }

  function tabPau(el) {
    const need = xpNeed(S.level);
    el.innerHTML = `
      <div class="sheet">
        <div class="sheet-ava">${ART.portrait('pau', S.sp ? 'h' : 'n', { rank: rank() })}<span class="rank-badge">${title()}</span></div>
        <div class="sheet-info">
          <h2>${txt(T('{nomc}'))}</h2>
          <p class="muted">${S.f.profile && GD.profiles[S.f.profile] ? GD.profiles[S.f.profile].n : T('Perfil per definir')} · ${txt(T('{g:Director|Directora|Direcció}'))} de ${esc(S.agency)}</p>
          <div class="lvl-big">${T("Nivell")} <b>${S.level}</b><span class="xpbar big"><i style="width:${S.level >= MAX_LEVEL ? 100 : Math.round(S.xp / need * 100)}%"></i></span><small>${S.level >= MAX_LEVEL ? T('Nivell màxim') : T("{0} / {1} EXP", [S.xp, need])}</small></div>
          <p class="sp ${S.sp ? 'has' : ''}">${T("Punts d'habilitat disponibles:")} <b>${S.sp}</b></p>
          <p class="muted small">${txt(T('El vestuari {den} millora a mesura que completes etapes.'))}</p>
          <button class="btn small" data-act="editAvatar">${T("✏️ Canviar aspecte i nom")}</button>
        </div>
      </div>
      <h3 class="sec">${T("Habilitats")}</h3>
      <div class="skills">
        ${Object.entries(SKILLS).map(([k, s]) => `
          <div class="skill">
            <div class="sk-h"><span class="sk-i">${s.i}</span><b>${s.n}</b><span class="pips" title="${T('Nivell {0} de {1}', [skLvl(k), SKILL_MAX])}">${Array.from({ length: SKILL_TIERS }, (_, i) => { const own = Math.max(0, Math.min(1, S.skills[k] / SKILL_TIER - i)), tot = Math.max(0, Math.min(1, skLvl(k) / SKILL_TIER - i)); return `<i class="${own >= 1 ? 'on' : tot >= 1 ? 'up' : ''}"${own > 0 && own < 1 ? ` style="background:linear-gradient(90deg,var(--accent,#ff7aa2) ${Math.round(own * 100)}%,transparent 0)"` : ''}></i>`; }).join('')}</span>${upSkill(k) ? `<em class="up-b" title="${T('Bonificació de les millores')}">+${upSkill(k) * SKILL_TIER} 🛒</em>` : ''}</div>
            <p class="sk-lv"><b>${T('Nivell {0} / {1}', [skLvl(k), SKILL_MAX])}</b></p>
            <p>${s.d}</p>
            <div class="row-btns" style="margin:0"><button class="btn small" data-skill="${k}" ${S.sp && S.skills[k] < SKILL_MAX ? '' : 'disabled'}>${S.skills[k] >= SKILL_MAX ? T('Màxim') : T('+ Millorar')}</button>${S.sp > 1 && S.skills[k] < SKILL_MAX ? `<button class="btn small" data-skill="${k}" data-n="${Math.min(S.sp, SKILL_MAX - S.skills[k], SKILL_TIER - (S.skills[k] % SKILL_TIER))}">+${Math.min(S.sp, SKILL_MAX - S.skills[k], SKILL_TIER - (S.skills[k] % SKILL_TIER))}</button>` : ''}</div>
          </div>`).join('')}
      </div>
      <h3 class="sec">${T("Coneixement per àrees")}</h3>
      <div class="know">${Object.entries(GD.areas).map(([k, n]) => `<div class="kn"><span>${n}</span><span class="kbar"><i style="width:${Math.min(100, (S.know[k] || 0) * 20)}%"></i></span><b>${S.know[k] || 0}</b></div>`).join('')}</div>`;
  }

  // Punts del temari que l'alumne ja ha treballat (lliçons, missions, projectes, webs i accions del món)
  function temariDone() {
    const C = GD.codes, done = new Set(), add = (l) => (l || []).forEach(c => done.add(c));
    Object.keys(S.lessons).forEach(id => add(C.lessons[id]));
    Object.keys(S.done).forEach(id => add(GD.chapters[id] && GD.chapters[id].codes));
    GD.projects.forEach(p => { if (projStatus(p) === 'approved') add(C.projects[p.id]); });
    Object.keys((S.web && S.web.levels) || {}).forEach(n => add(C.web[n]));
    Object.keys((S.world && S.world.actions) || {}).forEach(k => add(C.actions[k]));
    Object.keys((S.world && S.world.problems) || {}).forEach(k => add(C.problems[k]));
    return done;
  }
  function tabLibrary(el) {
    const ids = Object.keys(GD.lessons);
    const byArea = {};
    ids.forEach(id => { const l = GD.lessons[id]; (byArea[l.area] = byArea[l.area] || []).push(id); });
    const td = temariDone();
    const chips = (id) => (GD.codes.lessons[id] || []).map(c => `<em class="tm-chip">${c}</em>`).join('');
    el.innerHTML = `<div class="card"><h3>${T('📚 El temari')}</h3>
      <p class="small">${T('Punts treballats: <b>{0}</b> de {1}. Cada lliçó, missió, projecte, web i acció del món treballa uns punts del temari.', [td.size, GD.temari.length])}</p>
      ${Object.entries(GD.temariBlocks).map(([b, n]) => `<p class="tm-block"><b>${b}. ${esc(n)}</b><br>${GD.temari.filter(([c]) => c.split('.')[0] === b).map(([c, t]) => `<span class="tm-c ${td.has(c) ? 'on' : ''}" title="${esc(t)}">${td.has(c) ? '✔' : '·'} ${c}</span>`).join('')}</p>`).join('')}
      <details class="tm-now"><summary>${T('Com es treballa avui')}</summary><p class="small">${T("Alguns punts del temari parlen de tecnologies que han canviat. Al joc es treballen amb les eines que es fan servir ara:")}</p><ul>${Object.entries(GD.temariNow).map(([c, n]) => `<li><b>${c}</b> ${esc(GD.temariTitle(c))}. ${esc(n)}</li>`).join('')}</ul></details></div>
      <p class="muted">${T("Les lliçons es desbloquegen durant les missions. Pots repassar-les i repetir-ne l'exercici quan vulguis.")}</p>
      ${Object.entries(GD.areas).map(([a, n]) => byArea[a] ? `
        <h3 class="sec">${n}</h3>
        <div class="lessons">${byArea[a].map(id => {
          const l = GD.lessons[id], r = S.lessons[id];
          return `<button class="lesson-card ${r ? '' : 'locked'}" ${r ? `data-lesson="${id}"` : 'disabled'}><b>${r ? esc(l.title) : '🔒 ' + esc(l.title)}</b><span class="tm-chips">${chips(id)}</span><small>${r ? T("Millor resultat: {0}/{1}", [r.best, l.quiz.length]) : T('Es desbloqueja en una missió')}</small></button>`;
        }).join('')}</div>` : '').join('')}`;
  }

  /* ================= Millores de l'agència ================= */
  function upgradesCard() {
    const st = curStage(), mine = S.upgrades || {};
    const fx = (u) => [
      ...Object.entries(u.bonus.skill || {}).map(([k, v]) => `${SKILLS[k].i} +${v} ${SKILLS[k].n}`),
      u.bonus.fee ? T('💶 +{0} % honoraris', [u.bonus.fee]) : '', u.bonus.gig ? T('📨 +{0} % encàrrecs', [u.bonus.gig]) : '',
      u.bonus.xp ? T('✨ +{0} % EXP', [u.bonus.xp]) : '', u.rep ? T('⭐ +{0} reputació', [u.rep]) : ''
    ].filter(Boolean).join(' · ');
    return `<div class="card upgrades" id="millores"><h3>${T("🛒 Millores de l'agència")}</h3>
      <p class="muted small">${T("Inverteix en eines, equip, publicitat i local. Les bonificacions d'habilitat compten a les missions (desbloquegen opcions i milloren els resultats), però les quotes mensuals s'afegeixen a les despeses fixes: si gastes massa, pots fer fallida.")}</p>
      <p class="small">${T('Quotes mensuals actuals de millores: <b>{0}</b>', [eur(upMonthly())])}</p>
      ${GD.upgradeCats.map(c => `<h4>${c.i} ${esc(c.n)}</h4><div class="up-grid">${GD.upgrades.filter(u => u.cat === c.id).map(u => {
        const has = !!mine[u.id], lock = (u.stage || 1) > st, poor = S.money < u.price;
        return `<div class="up ${has ? 'has' : ''} ${lock ? 'locked' : ''}">
          <div class="up-h"><span class="up-i">${u.i}</span><b>${esc(u.n)}</b></div>
          <small>${esc(u.d)}</small>
          <small class="up-use">🎯 ${esc(u.use)}</small>
          <small class="up-fx">${fx(u)}</small>
          <div class="up-f"><span>${u.price ? eur(u.price) : T('Sense cost inicial')}${u.monthly ? ` + ${eur(u.monthly)}${T('/mes')}` : ''}</span>
          ${has ? (u.monthly ? `<button class="btn small" data-unbuy="${u.id}">${T('Donar de baixa')}</button>` : `<em>✔ ${T('Comprada')}</em>`)
            : lock ? `<em>🔒 ${T('Etapa {0}', [u.stage])}</em>` : `<button class="btn small primary" data-buy="${u.id}" ${poor ? 'disabled' : ''}>${poor ? T('Sense diners') : T('Comprar')}</button>`}</div>
        </div>`;
      }).join('')}</div>`).join('')}</div>`;
  }
  function buyUpgrade(id) {
    const u = GD.upgradeById(id); if (!u || S.upgrades[id]) return;
    const newMonthly = (weeklyCost() * 4) + (u.monthly || 0);
    confirmBox(T("Comprar «{0}» per {1}{2}? Les despeses fixes passaran a {3} al mes.", [esc(u.n), eur(u.price), u.monthly ? ` + ${eur(u.monthly)}${T('/mes')}` : '', eur(newMonthly)]), () => {
      if (S.money < u.price) return toast(T('No tens prou liquiditat.'), 'bad');
      S.money -= u.price; S.stats.expenses += u.price; econPush('despesa', 'millora-' + id, -u.price);
      S.upgrades[id] = { week: S.week };
      applyFx({ rep: u.rep || 0, log: T("Va invertir en «{0}» ({1}).", [u.n, eur(u.price)]) }, true);
      save(); queueSync(); toast(`${u.i} ${esc(u.n)} ✔`, 'good');
      if (!bankrupt()) hubScreen('empresa');
    });
  }
  function unbuyUpgrade(id) {
    const u = GD.upgradeById(id); if (!u) return;
    confirmBox(T("Donar de baixa «{0}»? Estalviaràs {1} al mes, però en perdràs els avantatges.", [esc(u.n), eur(u.monthly)]), () => {
      delete S.upgrades[id]; save(); queueSync(); hubScreen('empresa');
    });
  }

  function tabEmpresa(el) {
    const inc = weeklyIncome() * 4, cost = weeklyCost() * 4;
    if (S.classe && (!econ().srv || Date.now() - econ().srv.at > 60000)) econSync().then(r => { if (r && hubTab === 'empresa' && $('.econ-card')) hubScreen('empresa'); });
    el.innerHTML = `
      ${econCard()}
      ${upgradesCard()}
      <div class="grid2">
        <div class="card"><h3>${T("💶 Finances")}</h3>
          <dl class="kv"><dt>${T("Liquiditat")}</dt><dd class="${S.money < 0 ? 'neg' : ''}">${eur(S.money)}</dd>
          <dt>${T("Reserva per imprevistos")}</dt><dd>${eur(S.reserve)}</dd>
          <dt>${T("Ingressos recurrents / mes")}</dt><dd>${eur(inc)}</dd>
          <dt>${T("Despeses fixes / mes")}</dt><dd>${eur(cost)}</dd>
          <dt>${T("Resultat recurrent / mes")}</dt><dd class="${inc - cost < 0 ? 'neg' : 'pos'}">${eur(inc - cost)}</dd>
          <dt>${T("Ingressos acumulats")}</dt><dd>${eur(S.stats.income)}</dd>
          <dt>${T("Despeses acumulades")}</dt><dd>${eur(S.stats.expenses)}</dd></dl>
          <p class="muted small">${T("Recorda: el pressupost publicitari d'un client no és ingrés de l'agència. Només ho són els honoraris.")}</p>
          ${S.reserve > 0 ? `<button class="btn small" data-act="useReserve">${T("Moure la reserva a liquiditat")}</button>` : ''}
        </div>
        <div class="card"><h3>${T("🤝 Relacions")}</h3>
          ${CHARS_TRUST.filter(c => S.f['met_' + c]).map(c => `<div class="rel"><span class="rel-ava">${ART.portrait(c, S.trust[c] >= 3 ? 'h' : S.trust[c] < 0 ? 'w' : 'n')}</span><b>${GD.names[c]}</b><span class="hearts">${trustHearts(S.trust[c])}</span></div>`).join('') || T('<p class="muted">Encara no coneixes ningú.</p>')}
        </div>
        <div class="card"><h3>${T("📁 Clients recurrents")}</h3>
          ${S.clients.length ? `<ul class="list">${S.clients.map(c => `<li><b>${esc(c.name)}</b><span>${eur(c.fee)}/mes</span></li>`).join('')}</ul>` : T('<p class="muted">Cap client recurrent encara.</p>')}
        </div>
        <div class="card"><h3>${T("👥 Equip i estructura")}</h3>
          <ul class="list"><li><b>${txt(T('{nomc}'))}</b><span>${T("Direcció")}</span></li>${S.team.map(t => `<li><b>${esc(t.name)}</b><span>${eur(t.salary)}/mes</span></li>`).join('')}
          <li><b>${T("Lloguer")}</b><span>${eur(S.rent)}/mes</span></li><li><b>${T("Eines")}</b><span>${eur(S.tools)}/mes</span></li></ul>
        </div>
      </div>
      <div class="card"><h3>${T("📜 Historial de decisions")}</h3>
        ${S.history.length ? `<ul class="history">${S.history.slice().reverse().map(h => `<li class="${h.key ? 'key' : ''}"><small>${T("Cap.")} ${h.ch} · S${h.week}</small>${esc(h.t)}</li>`).join('')}</ul>` : T('<p class="muted">Les teves decisions apareixeran aquí.</p>')}
      </div>
      <div class="card"><h3>${T("🎓 Resultats per al professor")}</h3>
        <p class="small">${T("Codi de classe:")} <b>${S.classe ? esc(S.classe) : T('— cap —')}</b>${S.classe ? ` · ${S.syncPending ? T('<span class="neg">pendent d\'enviar</span>') : S.lastSync ? T('enviat el ') + new Date(S.lastSync).toLocaleString(LOCALE) : T('encara no enviat')}` : ''}</p>
        <p class="muted small">${T("Si poses el codi de classe que t'ha donat el professor, el teu nom i els resultats del joc s'envien automàticament cada vegada que acabes un capítol. Si no tens connexió, pots descarregar un fitxer i enviar-l'hi.")}</p>
        <div class="row-btns">
          <button class="btn small" data-act="setClass">🏷️ ${S.classe ? T('Canviar') : T('Posar')} ${T("codi de classe")}</button>
          ${S.classe ? T('<button class="btn small primary" data-act="syncNow">📤 Enviar resultats ara</button>') : ''}
          <button class="btn small" data-act="downloadResults">${T("⇩ Descarregar fitxer de resultats")}</button>
        </div>
      </div>
      <div class="card"><h3>${T("⚙️ Partida")}</h3>
        <div class="row-btns">
          <button class="btn small" data-act="export">${T("⇩ Exportar partida")}</button>
          <button class="btn small" data-act="import">${T("⇪ Importar partida")}</button>
          <span class="langs small">🌐 ${LANGS.map(([k, n]) => `<button class="${k === LANG ? 'on' : ''}" data-lang="${k}">${n}</button>`).join('')}</span>
          <button class="btn small" data-act="speed">${T("Velocitat del text:")} ${settings.speed <= 8 ? T('ràpida') : settings.speed <= 18 ? T('normal') : T('lenta')}</button>
          <button class="btn small install-btn" data-act="install" hidden>${T("📲 Instal·lar app")}</button>
          <button class="btn small danger" data-act="reset">${T("Esborrar partida")}</button>
          <button class="btn small ghost" data-act="title">${T("Pantalla inicial")}</button>
        </div>
        <p class="muted small">${T("La partida es desa automàticament en aquest dispositiu. Per continuar-la en un altre (web ↔ app), exporta-la i importa-la allà.")}</p>
      </div>`;
    updateInstallBtn();
  }
  function trustHearts(v) { if (v < 0) return '💔'.repeat(Math.min(3, -v)); return '♥'.repeat(Math.min(10, v)) + '<span class="empty">' + '♡'.repeat(Math.max(0, 5 - v)) + '</span>'; }

  /* ================= Economia validada al servidor (Netlify Database) ================= */
  // Cada moviment de diners es desa en una cua amb una clau única (idempotència) i s'envia a joc-economia.
  // El servidor el valida, hi aplica l'impost i actualitza la guardiola de la classe. El saldo del servidor mana:
  // quan la cua està buida, la liquiditat del joc (diners + reserva) s'iguala amb el saldo del servidor.
  const EAPI = FN + 'joc-economia';
  const TAXED = ['capitol', 'clients', 'encarrec', 'projecte', 'web', 'botiguer', 'mercat', 'gimnas', 'altre'];
  function econ() {
    if (!S.econ) S.econ = { seq: 0, queue: [], srv: null, inici: false };
    return S.econ;
  }
  function econTax(brut, tipus) {
    const e = econ(); if (!S.classe || !(brut > 0) || !e.srv || e.off) return 0; // sense servidor d'economia no hi ha impost
    const imp = e.srv.impost || { trams: [{ des: 0, pct: 5 }], tipus: TAXED };
    if (!(imp.tipus || TAXED).includes(tipus)) return 0;
    const t = imp.trams.slice().sort((a, b) => a.des - b.des); let x = 0;
    t.forEach((tr, i) => { const hi = i + 1 < t.length ? t[i + 1].des : Infinity; x += Math.max(0, Math.min(brut, hi) - tr.des) * tr.pct / 100; });
    return Math.floor(x);
  }
  function econPush(tipus, ref, brut) {
    brut = Math.round(brut);
    if (!brut && tipus !== 'reinici') return;
    const e = econ();
    e.queue.push({ idem: `${S.player.id.slice(0, 10)}-${Date.now().toString(36)}-${++e.seq}`, tipus, ref: String(ref || '').slice(0, 80), brut: brut || 1 });
    if (e.queue.length > 2000) e.queue.splice(0, e.queue.length - 2000);
    econSoon();
  }
  // Tipus d'operació segons d'on venen els diners
  function econTipus(fx, m) {
    if (m < 0) return fx.src === 'mercat' ? ['mercat', fx.ref] : ['despesa', fx.ref || fx.src || (S.cur ? S.cur.id : '')];
    switch (fx.src) {
      case 'gig': return ['encarrec', fx.ref];
      case 'gimnas': return ['gimnas', fx.ref];
      case 'chapter': return ['capitol', fx.ref || (S.cur && S.cur.id) || (curCh && curCh.id)];
      case 'proj': return [String(fx.ref || '').startsWith('web-') ? 'web' : 'projecte', fx.ref];
      case 'world': return ['botiguer', fx.ref];
      case 'mercat': return ['mercat', fx.ref];
      default: return S.cur && GD.chapters[S.cur.id] ? ['capitol', S.cur.id] : ['altre', fx.src || ''];
    }
  }
  let econTimer = null, econBusy = false;
  function econSoon() { clearTimeout(econTimer); econTimer = setTimeout(() => econSync(), 2500); }
  async function econSync(manual) {
    if (!S || !S.classe || econBusy) return null;
    const e = econ(); econBusy = true;
    let rejected = 0, lastEstat = null, pending = false;
    try {
      do {
        const batch = e.queue.slice(0, 50);
        const res = await fetch(EAPI, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: batch.length ? 'moviments' : 'estat', classe: S.classe, id: S.player.id, nom: `${S.player.name} ${S.player.surname || ''}`.trim(), agencia: S.agency, events: batch }) });
        if (res.status === 404) { e.off = true; e.queue = e.queue.slice(-200); save(); if (manual) toast(T('L\'economia validada pel servidor encara no està activada.')); return null; }
        if (!res.ok) throw new Error('Error ' + res.status);
        const j = await res.json();
        lastEstat = j.estat || j;
        if (!batch.length) break;
        const done = new Set();
        (j.results || []).forEach(r => { if (r.pendent) { pending = true; return; } done.add(r.idem); if (!r.ok && !r.repetit) rejected += batch.find(b => b.idem === r.idem).brut; });
        e.queue = e.queue.filter(q => !done.has(q.idem));
        if (pending || !done.size) break;
      } while (e.queue.length);
      e.off = false;
      e.srv = Object.assign({}, lastEstat, { at: Date.now() });
      // El saldo del servidor és el bo: si no hi ha res pendent, la liquiditat del joc s'hi iguala
      if (!e.queue.length && lastEstat && lastEstat.aprovat) {
        const liq = S.money + S.reserve;
        if (liq !== lastEstat.saldo) { S.money = lastEstat.saldo - S.reserve; if (Math.abs(liq - lastEstat.saldo) >= 1 && $('#hud')) hud(); }
      }
      save();
      if (rejected > 0) toast(T('⚠️ El servidor no ha acceptat {0} en operacions que superen els límits del joc.', [eur(rejected)]), 'bad');
      if (manual) toast(pending ? T('El professor encara ha de validar el teu compte.') : T('Economia sincronitzada amb el servidor.'), pending ? '' : 'good');
      return e.srv;
    } catch (err) {
      if (manual) toast(T('No s\'ha pogut connectar amb el servidor de l\'economia.'), 'bad');
      return null;
    } finally { econBusy = false; }
  }
  async function econGuardiola() {
    if (!S.classe) return null;
    try { const r = await fetch(EAPI, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'guardiola', classe: S.classe, id: S.player.id, nom: `${S.player.name} ${S.player.surname || ''}`.trim(), agencia: S.agency }) }); return r.ok ? r.json() : null; } catch (e) { return null; }
  }
  const MOVT = () => ({ inici: T('Capital inicial'), reinici: T('Reinici després de la fallida'), capitol: T('Missió'), clients: T('Clients recurrents'), encarrec: T('Encàrrec'), projecte: T('Projecte'), web: T('Web del Taller'), botiguer: T('Botiguer de Vic'), mercat: T('Tracte entre agències'), despesa: T('Despesa'), gimnas: T('Repte d\'agència rival'), altre: T('Altres') });
  function econCard() {
    const e = econ(), s = e.srv;
    if (!S.classe) return `<div class="card"><h3>${T('🏦 Economia i guardiola')}</h3><p class="muted small">${T('Posa el codi de classe perquè el servidor validi la teva economia i participis en la guardiola comuna.')}</p><button class="btn small" data-act="setClass">${T('🏷️ Posar codi de classe')}</button></div>`;
    return `<div class="card econ-card"><h3>${T('🏦 Economia i guardiola')}</h3>
      ${e.off ? `<p class="muted small">${T('L\'economia validada pel servidor encara no està activada: de moment els diners es compten només al teu navegador i no hi ha impostos.')}</p>` : !s ? `<p class="muted small">${T('Connectant amb el servidor…')}</p>` : !s.aprovat ? `<div class="warn small">${T('⏳ El professor encara ha de validar el teu compte. Mentrestant pots jugar: les operacions s\'enviaran quan et validi.')}</div>` : ''}
      ${s ? `<dl class="kv"><dt>${T('Saldo validat')}</dt><dd>${eur(s.saldo)}</dd><dt>${T('Impost sobre els ingressos')}</dt><dd>${(s.impost.trams || []).map(t => `${t.pct} %${t.des ? ' ' + T('des de {0}', [eur(t.des)]) : ''}`).join(' · ')}</dd><dt>${T('🐷 Guardiola de la classe')}</dt><dd>${eur(s.guardiola)}</dd>${e.queue.length ? `<dt>${T('Pendents d\'enviar')}</dt><dd>${e.queue.length}</dd>` : ''}</dl>
        ${s.darrers && s.darrers.length ? `<details class="small"><summary>${T('Darrers moviments')}</summary><table class="tbl small"><tbody>${s.darrers.slice(0, 12).map(m => `<tr><td>${esc(MOVT()[m.tipus] || m.tipus)}${m.ref ? ` <span class="muted">${esc(m.ref)}</span>` : ''}</td><td class="${m.net < 0 ? 'neg' : ''}">${m.net > 0 ? '+' : ''}${eur(m.net)}</td><td class="muted">${m.impost ? '🐷 ' + eur(m.impost) : ''}</td></tr>`).join('')}</tbody></table></details>` : ''}` : ''}
      <div class="row-btns"><button class="btn small" data-act="econSync">🔄 ${T('Sincronitzar')}</button><button class="btn small" data-act="guardiola">🐷 ${T('Veure la guardiola')}</button></div></div>`;
  }
  async function guardiolaModal() {
    const g = await econGuardiola();
    if (!g) { toast(T('No s\'ha pogut consultar la guardiola.'), 'bad'); return; }
    const d = document.createElement('div'); d.className = 'modal';
    d.innerHTML = `<div class="modal-box"><h3>🐷 ${T('Guardiola de la classe')}</h3>
      <dl class="kv"><dt>${T('Saldo disponible')}</dt><dd>${eur(g.saldo)}</dd><dt>${T('Impostos recaptats')}</dt><dd>${eur(g.impostos)}</dd><dt>${T('Premis entregats')}</dt><dd>${eur(g.premis)}</dd><dt>${T('Aportacions')}</dt><dd>${g.aportacions}</dd></dl>
      <p class="muted small">${T('Cada ingrés del joc paga un impost que va a la guardiola. Es repartirà en concursos de coneixements: guanya qui encerta més preguntes, mai a l\'atzar.')}</p>
      <table class="tbl small"><tbody>${g.historial.map(h => `<tr><td>${esc(h.nom || '—')}</td><td>${h.tipus === 'impost' ? T('Impost') : h.tipus === 'premi' ? T('Premi') : esc(h.tipus)}</td><td>${h.import > 0 ? '+' : ''}${eur(h.import)}</td><td class="muted">${new Date(h.at).toLocaleDateString(LOCALE)}</td></tr>`).join('')}</tbody></table>
      <div class="row-btns"><button class="btn" id="n">${T('Tancar')}</button></div></div>`;
    document.body.appendChild(d); d.querySelector('#n').onclick = () => d.remove();
  }

  /* ================= COMERÇMONS: col·lecció, equip, captures, evolucions i Comerçdex ================= */
  // Estat: S.cm = { owned: { id: { lvl, xp, form, at, trained } }, team: [id…], seen: { id: 1 }, escape: { id: hora }, starter, evoQueue: [] }
  // S.days = { 'AAAA-MM-DD': 1 }: dies diferents de joc (moltes captures els demanen, perquè no es puguin fer totes en un dia)
  const CMC = () => GD.CM;
  function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function cmState() {
    if (!S.cm) S.cm = {};
    S.cm.owned = S.cm.owned || {}; S.cm.team = (S.cm.team || []).filter(id => S.cm.owned[id]); S.cm.seen = S.cm.seen || {};
    S.cm.escape = S.cm.escape || {}; S.cm.evoQueue = S.cm.evoQueue || [];
    if (!S.days) S.days = {};
    return S.cm;
  }
  function markDay() { cmState(); S.days[today()] = 1; }
  const cmOwned = (id) => cmState().owned[id];
  const cmOwnedCount = () => Object.keys(cmState().owned).length;
  const lessonPassed = (id) => { const r = S.lessons[id], l = GD.lessons[id]; return !!(r && l && r.best >= Math.ceil(l.quiz.length / 2)); };
  const passedLessons = () => Object.keys(S.lessons || {}).filter(lessonPassed);
  const stageDone = (n) => { const st = GD.stages.find(s => s.id === n); return !!st && st.chapters.every(c => S.done[c]); };

  // Condicions de captura i d'evolució: totes depenen del progrés real (no de la sort)
  function cmCond(cond) {
    const c = cond || {}, parts = [];
    const add = (ok, label, cur, need) => parts.push({ ok: !!ok, label, cur, need });
    if (c.starter) add(false, T('Comerçmon inicial'));
    if (c.ch) add(S.done[c.ch], T('Capítol {0}: {1}', [c.ch, txt(GD.chapters[c.ch].title)]));
    if (c.stage) add(stageDone(c.stage), T('Superar l\'etapa {0}', [c.stage]));
    if (c.lessons) { const n = passedLessons().length; add(n >= c.lessons, T('Lliçons superades'), n, c.lessons); }
    if (c.area) { const n = passedLessons().filter(id => GD.lessons[id].area === c.area[0]).length; add(n >= c.area[1], T('Lliçons de {0}', [GD.areas[c.area[0]]]), n, c.area[1]); }
    if (c.level) add(S.level >= c.level, T('Nivell del personatge'), S.level, c.level);
    if (c.proj) { const n = GD.projects.filter(p => projStatus(p) === 'approved').length; add(n >= c.proj, T('Projectes aprovats'), n, c.proj); }
    if (c.web) { const n = Object.keys(webState().levels).length; add(n >= c.web, T('Webs entregades al Taller'), n, c.web); }
    if (c.world) { const n = Object.keys((S.world && S.world.problems) || {}).length; add(n >= c.world, T('Botiguers de Vic ajudats'), n, c.world); }
    if (c.gigs) add(S.stats.gigs >= c.gigs, T('Encàrrecs completats'), S.stats.gigs, c.gigs);
    if (c.week) add(S.week >= c.week, T('Setmana de joc'), S.week, c.week);
    if (c.days) { const n = Object.keys(S.days || {}).length; add(n >= c.days, T('Dies diferents de joc'), n, c.days); }
    if (c.dex) add(cmOwnedCount() >= c.dex, T('Comerçmons capturats'), cmOwnedCount(), c.dex);
    return { ok: parts.length > 0 && parts.every(p => p.ok), parts };
  }
  // Comerçmons que han aparegut (condició complerta) i encara no tens
  function cmAvailable() {
    cmState();
    return GD.cmSpecies.filter(sp => cmCatchable(sp.id));
  }
  function cmRefreshSeen() {
    let n = 0;
    cmAvailable().forEach(sp => { if (!S.cm.seen[sp.id]) { S.cm.seen[sp.id] = 1; n++; } });
    return n;
  }

  /* ---------- Bonificacions (passives de l'equip, sinergies i bonificacions d'equip) ---------- */
  function cmTeamSpecies() { return cmState().team.map(id => ({ sp: GD.cmById(id), m: S.cm.owned[id] })).filter(x => x.sp && x.m); }
  function cmSynergiesActive() {
    const ids = cmState().team, team = cmTeamSpecies(), out = [];
    GD.cmSynergies.forEach(y => { if (y.ids.every(id => ids.includes(id))) out.push(y); });
    if (team.length === CMC().TEAM_SIZE) {
      const fam = team[0].sp.family;
      if (team.every(x => x.sp.family === fam)) out.push(Object.assign({}, GD.cmTeamBonus[0], { kind: GD.cmFamilyKind[fam] }));
      if (new Set(team.map(x => x.sp.type)).size === team.length) out.push(GD.cmTeamBonus[1]);
    }
    return out;
  }
  // Monopolion no es pot combinar amb un altre llegendari: si n'hi ha dos, el seu bonus no compta
  function cmBonus(kind) {
    if (!S || !S.cm) return 0;
    const team = cmTeamSpecies(), legs = team.filter(x => x.sp.rarity === 'lleg').length;
    let b = 0;
    team.forEach(x => { if (x.sp.passive.kind === kind && !(x.sp.id === 'monopolion' && legs > 1)) b += GD.cmPassive(x.sp, x.m.form); });
    cmSynergiesActive().forEach(y => { if (y.kind === kind) b += y.v; });
    return Math.min(CMC().BONUS_CAP, Math.round(b * 10) / 10);
  }

  /* ---------- Experiència i evolució ---------- */
  function cmGainXp(id, n) {
    const m = cmOwned(id), sp = GD.cmById(id);
    if (!m || !sp || n <= 0) return;
    if (m.lvl >= CMC().MAX_LEVEL) return;
    m.xp += Math.round(n);
    while (m.lvl < CMC().MAX_LEVEL && m.xp >= GD.cmXpNeed(m.lvl)) { m.xp -= GD.cmXpNeed(m.lvl); m.lvl++; }
    if (m.lvl >= CMC().MAX_LEVEL) m.xp = 0;
    cmCheckEvo(id);
  }
  // Una evolució necessita el nivell i, en algunes espècies, una condició especial (projectes, dies de joc…)
  function cmEvoReady(id) {
    const m = cmOwned(id), sp = GD.cmById(id), next = sp && m && sp.forms[m.form + 1];
    if (!next) return null;
    const lvlOk = m.lvl >= next.lvl, cond = next.cond ? cmCond(next.cond) : { ok: true, parts: [] };
    return { next, lvlOk, cond, ok: lvlOk && cond.ok };
  }
  function cmCheckEvo(id) {
    const r = cmEvoReady(id);
    if (r && r.ok) {
      const m = cmOwned(id), from = m.form;
      m.form++;
      S.cm.evoQueue.push({ id, from, to: m.form });
      toast(T('✨ {0} evoluciona a {1}!', [GD.cmById(id).forms[from].name, r.next.name]), 'good');
      cmCheckEvo(id);
    }
  }
  function cmShareXp(n) {
    if (!S || !S.cm || !S.cm.team.length || n <= 0) return;
    const share = n * CMC().XP_SHARE * (1 + cmBonus('monxp') / 100);
    S.cm.team.forEach(id => cmGainXp(id, share));
  }

  /* ---------- Repte de coneixement (captura i entrenament) ---------- */
  function cmQuestion(sp) {
    // Preferència: preguntes de les lliçons que ja has superat, millor si són de l'especialitat del Comerçmon
    const famAreas = { mkt: ['mercat', 'marca', 'seo', 'analitica', 'fonaments'], vend: ['creixement', 'email', 'fonaments'], com: ['xarxes', 'ads', 'marca'], emp: ['direccio', 'web', 'analitica'], crea: ['marca', 'avancat', 'web'], lleg: ['direccio', 'avancat', 'creixement'] }[sp.family] || [];
    let ids = passedLessons();
    const fav = ids.filter(id => famAreas.includes(GD.lessons[id].area));
    if (fav.length) ids = fav;
    if (!ids.length) ids = Object.keys(GD.lessons).slice(0, 6);
    const id = ids[Math.floor(Math.random() * ids.length)], l = GD.lessons[id];
    return Object.assign({ lesson: id }, l.quiz[Math.floor(Math.random() * l.quiz.length)]);
  }
  function cmQuizModal(sp, form, title, intro, onResult) {
    const q = cmQuestion(sp), order = shuffledIdx(q.o.length);
    const d = document.createElement('div'); d.className = 'modal cm-modal';
    d.innerHTML = `<div class="modal-box cm-quiz"><div class="cm-quiz-art ${'r-' + sp.rarity}">${CMART.render(sp, form, { size: 120, cls: 'cm-bob' })}</div>
      <h3>${title}</h3><p class="muted small">${intro}</p><p><b>${esc(txt(q.q))}</b></p>
      <div class="opts">${order.map(k => `<button class="opt" data-k="${k}">${esc(txt(q.o[k]))}</button>`).join('')}</div></div>`;
    document.body.appendChild(d);
    d.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const ok = +b.dataset.k === q.c;
      d.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (+x.dataset.k === q.c) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
      d.querySelector('.modal-box').insertAdjacentHTML('beforeend', `<p class="small ${ok ? 'good' : 'bad'}">${ok ? T('✔ Correcte!') : T('✘ No és correcte.')} ${esc(txt(q.why || ''))}</p><div class="row-btns"><button class="btn primary" id="cmq">${T('Continuar')}</button></div>`);
      d.querySelector('#cmq').onclick = () => { d.remove(); onResult(ok); };
    });
  }
  function cmCaptureAnim(sp, onEnd) {
    const d = document.createElement('div'); d.className = 'modal cm-modal';
    d.innerHTML = `<div class="cm-catch r-${sp.rarity}"><div class="cm-catch-card">${CMART.render(sp, 0, { size: 170 })}</div><div class="cm-catch-burst"></div>
      <h2>${T('{0} capturat!', [esc(sp.forms[0].name)])}</h2><p>${esc(GD.cmRarities[sp.rarity].n)} · ${GD.cmTypes[sp.type].i} ${esc(GD.cmTypes[sp.type].n)} · ${esc(sp.specialty)}</p>
      <button class="btn primary" id="cmok">${T('Veure la fitxa')}</button></div>`;
    document.body.appendChild(d);
    d.querySelector('#cmok').onclick = () => { d.remove(); onEnd && onEnd(); };
  }
  function cmEvoAnim(ev, onEnd) {
    const sp = GD.cmById(ev.id);
    const d = document.createElement('div'); d.className = 'modal cm-modal';
    d.innerHTML = `<div class="cm-evo r-${sp.rarity}"><p class="kicker">${T('Evolució!')}</p><div class="cm-evo-stage"><div class="cm-evo-a">${CMART.render(sp, ev.from, { size: 190 })}</div><div class="cm-evo-b">${CMART.render(sp, ev.to, { size: 190 })}</div></div>
      <h2>${T('{0} ha evolucionat a {1}', [esc(sp.forms[ev.from].name), esc(sp.forms[ev.to].name)])}</h2><p>${esc(txt(sp.forms[ev.to].desc))}</p>
      ${(sp.forms[ev.to].attacks || []).map(a => `<p class="small">🆕 ${T('Atac nou:')} <b>${esc(a.n)}</b> — ${esc(a.fx)}</p>`).join('')}
      <button class="btn primary" id="cmok">${T('Genial!')}</button></div>`;
    document.body.appendChild(d);
    d.querySelector('#cmok').onclick = () => { d.remove(); onEnd && onEnd(); };
  }
  function cmFlushEvos(then) {
    const ev = cmState().evoQueue.shift();
    if (!ev) { then && then(); return; }
    save();
    cmEvoAnim(ev, () => cmFlushEvos(then));
  }

  function cmGet(id) {
    const st = cmState();
    st.owned[id] = { lvl: 1, xp: 0, form: 0, at: new Date().toISOString() };
    st.seen[id] = 1; delete st.escape[id];
    if (st.team.length < CMC().TEAM_SIZE) st.team.push(id);
    S.history.push({ ch: '-', week: S.week, t: T('Va capturar {0}.', [GD.cmById(id).forms[0].name]), key: true });
  }
  function cmTrain(id) {
    const m = cmOwned(id), sp = GD.cmById(id); if (!m) return;
    if (m.trained === today()) { toast(T('Ja ha entrenat avui. Torna demà!')); return; }
    cmQuizModal(sp, m.form, T('Entrenament diari: {0}', [sp.forms[m.form].name]), T('Una pregunta al dia per Comerçmon. Si l\'encertes, guanya experiència.'), (ok) => {
      m.trained = today();
      if (ok) { const xp = Math.round(CMC().TRAIN_XP * (1 + cmBonus('monxp') / 100)); cmGainXp(id, xp); toast(T('+{0} EXP per a {1}', [xp, sp.forms[m.form].name]), 'good'); }
      save(); queueSync(); cmFlushEvos(() => cmDetail(id));
    });
  }
  function cmToggleTeam(id) {
    const st = cmState();
    if (st.team.includes(id)) st.team = st.team.filter(x => x !== id);
    else if (st.team.length >= CMC().TEAM_SIZE) { toast(T('L\'equip ja té {0} Comerçmons. Treu-ne un primer.', [CMC().TEAM_SIZE]), 'bad'); return; }
    else st.team.push(id);
    save(); queueSync();
  }

  /* ================= Combats de Comerçmons ================= */
  // Es pot capturar? (condició complerta, no escapat). Els inicials no triats, a partir de l'etapa 2.
  function cmCatchable(id) {
    const sp = GD.cmById(id); if (!sp || cmOwned(id)) return false;
    if (Date.now() < (cmState().escape[id] || 0)) return false;
    return sp.capture.cond.starter ? stageDone(2) : cmCond(sp.capture.cond).ok;
  }
  function cmVisible(id) {
    const sp = GD.cmById(id); if (!sp) return false;
    if (sp.rarity === 'lleg') return cmCatchable(id);
    return !sp.capture.cond.starter || stageDone(2) || !!cmOwned(id);
  }
  const cmTeamTop = () => Math.max(1, ...cmState().team.map(id => (cmOwned(id) || {}).lvl || 1));
  // Nivell d'un Comerçmon salvatge: segueix el teu equip (fixat durant el torn de 15 minuts)
  function cmWildLevel(id) {
    const sp = GD.cmById(id), slot = Math.floor(Date.now() / 900000);
    const jitter = ((slot * 31 + id.length * 7 + sp.num) % 5) - 2;
    const base = sp.rarity === 'lleg' ? cmTeamTop() + 3 : Math.round(cmTeamTop() * 0.85) + jitter;
    return Math.max(GD.cmWildMin[sp.rarity] || 2, Math.min(CMC().MAX_LEVEL, base));
  }
  const cmWildForm = (id) => GD.cmFormAt(GD.cmById(id), cmWildLevel(id));
  const cmMyTeam = () => cmState().team.map(id => ({ id, lvl: cmOwned(id).lvl, form: cmOwned(id).form }));
  const zoneNames = (id) => GD.cmZonesOf(id).map(z => GD.cmZones[z].i + ' ' + GD.cmZones[z].n).join(' · ');
  // Experiència de combat: com a molt 12 combats al dia en donen (entrenadors i salvatges)
  function cmBattleXpLeft() { const st = cmState(); if (!st.bxp || st.bxp.d !== today()) st.bxp = { d: today(), n: 0 }; return 12 - st.bxp.n; }

  const STAT_TXT = () => ({ atk: T('l\'atac'), def: T('la defensa'), vel: T('la velocitat'), int: T('la intel·ligència'), all: T('totes les estadístiques'), acc: T('la precisió') });
  function cmEvTxt(e, foe) {
    const who = (side, n) => side === 1 ? `<b class="cmb-foe">${esc(n)}</b>` : `<b>${esc(n)}</b>`;
    const W = who(e.side, e.who), S2 = STAT_TXT();
    switch (e.k) {
      case 'atk': {
        const mv = `<i>${esc(e.mv)}</i>`;
        if (e.fail) return T('{0} intenta {1}, però la resposta no era correcta i l\'atac no surt.', [W, mv]);
        if (e.miss) return T('{0} fa servir {1}… però falla.', [W, mv]);
        if (e.dodged) return T('{0} fa servir {1}, però el rival l\'esquiva.', [W, mv]);
        if (e.dmg != null) {
          let t = T('{0} fa servir {1}: {2} de dany.', [W, mv, e.dmg]);
          if (e.crit) t += ' ' + T('Cop crític!');
          if (e.eff > 1) t += ' ' + T('És molt eficaç!'); else if (e.eff < 1) t += ' ' + T('No és gaire eficaç…');
          if (e.heal) t += ' ' + T('Recupera {0} de vida.', [e.heal]);
          if (e.reflect) t += ' ' + T('La contraoferta li retorna {0} de dany.', [e.reflect]);
          if (e.stun) t += ' ' + T('El rival queda bloquejat.');
          return t;
        }
        const tg = e.target ? `<b>${esc(e.target)}</b>` : '';
        const fx = { heal: T('recupera {0} de vida', [e.heal]), hot: T('es regenerarà uns quants torns'), energy: T('recupera {0} d\'energia', [e.en]), shield: T('es protegeix'),
          dodge: T('es prepara per esquivar'), reflect: T('prepara una contraoferta'), vuln: T('deixa exposat {0}', [tg]), stun: e.miss ? T('intenta bloquejar el rival, però no se\'n surt') : T('bloqueja {0}', [tg]),
          debuff: T('rebaixa {0} de {1}', [S2[e.s] || '', tg]), buff: T('millora {0}', [S2[e.s] || '']), cleanse: T('es treu els efectes negatius') }[e.fx] || '';
        return T('{0} fa servir {1}: {2}.', [W, mv, fx]);
      }
      case 'faint': return T('{0} queda fora de combat!', [W]);
      case 'switch': return T('Entra {0}!', [W]);
      case 'stunned': return T('{0} està bloquejat i perd el torn.', [W]);
    }
    return '';
  }
  function cmFighterCard(f, foe) {
    const sp = GD.cmById(f.id), pc = (v, m) => Math.max(0, Math.round(v / m * 100));
    const eff = [f.shield ? '🛡️' : '', f.dodge ? '💨' : '', f.vuln ? '🎯' : '', f.stun ? '💫' : '', f.hot ? '💚' : '', ...Object.entries(f.buf).map(([k, b]) => (b[0] > 0 ? '⬆️' : '⬇️'))].join('');
    return `<div class="cmb-card ${foe ? 'foe' : 'me'}">
      <div class="cmb-art r-${sp.rarity}">${CMART.render(sp, f.form, { size: foe ? 120 : 130, cls: 'cm-bob' })}</div>
      <div class="cmb-info"><b>${esc(f.name)}</b> <small>${T('Nv')} ${f.lvl}</small> ${typeChip(f.type)} <span class="cmb-eff">${eff}</span>
        <div class="cmb-bar hp"><i style="width:${pc(f.hp, f.maxHp)}%"></i><span>❤️ ${f.hp}/${f.maxHp}</span></div>
        <div class="cmb-bar en"><i style="width:${pc(f.en, f.maxEn)}%"></i><span>⚡ ${f.en}/${f.maxEn}</span></div></div></div>`;
  }
  const CAT_I = { ofensiu: '💥', defensiu: '🛡️', estrategic: '🧠', especial: '🌟' };

  /* Combat genèric. opts = { title, sub, foe: [{ id, lvl, form? }], kind: 'wild'|'trainer'|'gym', flee: bool, xpMult }
     onEnd({ win, fled }) */
  function cmBattle(opts, onEnd) {
    const mine = cmMyTeam();
    if (!mine.length) { toast(T('Primer has de tenir Comerçmons a l\'equip actiu (Comerçdex).'), 'bad'); onEnd && onEnd({ win: false, fled: true }); return; }
    const s = GD.cmBattleNew(mine, opts.foe, (Date.now() % 2147483647) || 7);
    const log = [`<span class="muted">${esc(opts.sub || '')}</span>`];
    const d = document.createElement('div'); d.className = 'modal cm-modal cmb-w';
    document.body.appendChild(d);
    let locked = false;
    const render = (shake) => {
      const A = GD.cmBattleCur(s, 0), B = GD.cmBattleCur(s, 1);
      const dots = (i) => s.sides[i].team.map((f, k) => `<i class="${f.hp <= 0 ? 'ko' : k === s.sides[i].act ? 'on' : ''}"></i>`).join('');
      d.innerHTML = `<div class="modal-box cmb">
        <div class="cmb-top"><b>${esc(opts.title)}</b><span class="cmb-dots">${dots(1)}</span></div>
        <div class="cmb-field">
          <div class="${shake === 1 ? 'cmb-hit' : ''}">${cmFighterCard(B, true)}</div>
          <div class="${shake === 0 ? 'cmb-hit' : ''}">${cmFighterCard(A, false)}</div>
        </div>
        <div class="cmb-dots me">${dots(0)} <small class="muted">${T('Torn {0}', [s.turn])}</small></div>
        <div class="cmb-log">${log.slice(-5).map(l => `<p>${l}</p>`).join('')}</div>
        ${s.over ? '' : `<div class="cmb-moves">${GD.cmUsable(A).map(({ i, mv, ok }) => `<button class="cmb-mv ${mv.cat}" data-mv="${i}" ${ok && !locked ? '' : 'disabled'} title="${esc(mv.fx || '')}">
            <b>${CAT_I[mv.cat] || '💥'} ${esc(mv.n)}</b><small>⚡${mv.cost}${mv.e.k === 'dmg' ? ` · 💥${mv.e.pow}` : ''}${A.cd[i] > 0 ? ` · ⏳${A.cd[i]}` : ''}${mv.cat === 'especial' ? ' · ❓' : ''}</small></button>`).join('')}</div>
          <div class="row-btns cmb-actions">
            ${s.sides[0].team.some((f, k) => f.hp > 0 && k !== s.sides[0].act) ? `<button class="btn small" data-sw ${locked ? 'disabled' : ''}>🔄 ${T('Canviar')}</button>` : ''}
            <button class="btn small" data-flee ${locked ? 'disabled' : ''}>${opts.flee === false ? '🏳️ ' + T('Rendir-se') : '🏃 ' + T('Marxar')}</button>
          </div>`}
      </div>`;
      d.querySelectorAll('[data-mv]').forEach(b => b.onclick = () => choose(+b.dataset.mv));
      const sw = d.querySelector('[data-sw]'); if (sw) sw.onclick = switchMenu;
      const fl = d.querySelector('[data-flee]'); if (fl) fl.onclick = () => { d.remove(); onEnd && onEnd({ win: false, fled: true }); };
    };
    const switchMenu = () => {
      const box = d.querySelector('.cmb-actions');
      box.innerHTML = s.sides[0].team.map((f, k) => f.hp > 0 && k !== s.sides[0].act ? `<button class="btn small" data-to="${k}">${esc(f.name)} · ❤️${f.hp}</button>` : '').join('') + `<button class="btn small ghost" data-back>✕</button>`;
      box.querySelectorAll('[data-to]').forEach(b => b.onclick = () => play({ t: 'switch', to: +b.dataset.to }));
      box.querySelector('[data-back]').onclick = () => render();
    };
    const choose = (i) => {
      const A = GD.cmBattleCur(s, 0), mv = A.moves[i];
      if (mv.cat !== 'especial') return play({ t: 'atk', i });
      // Atac especial: cal encertar una pregunta (si l'encertes, l'atac fa un 20 % més)
      const q = cmQuestion(GD.cmById(A.id)), order = shuffledIdx(q.o.length);
      const box = d.querySelector('.cmb-moves');
      box.innerHTML = `<div class="cmb-q"><p><b>🌟 ${esc(mv.n)}</b> · ${T('Respon bé per llançar l\'atac especial:')}</p><p>${esc(txt(q.q))}</p>
        <div class="opts">${order.map(k => `<button class="opt" data-k="${k}">${esc(txt(q.o[k]))}</button>`).join('')}</div></div>`;
      d.querySelector('.cmb-actions').innerHTML = '';
      box.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const ok = +b.dataset.k === q.c;
        box.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (+x.dataset.k === q.c) x.classList.add('good'); else if (x === b) x.classList.add('bad'); });
        setTimeout(() => play({ t: 'atk', i, q: ok }), ok ? 500 : 1400);
      });
    };
    const play = (act) => {
      if (locked || s.over) return;
      locked = true;
      const ev = GD.cmBattleTurn(s, [act, GD.cmBattleAI(s, 1, opts.kind === 'gym')]);
      let k = 0;
      const step = () => {
        if (k >= ev.length) { locked = false; render(); if (s.over) finish(); return; }
        const e = ev[k++], t = cmEvTxt(e);
        if (t) log.push(t);
        render(e.k === 'atk' && e.dmg ? 1 - e.side : null);
        setTimeout(step, e.k === 'atk' ? 650 : 450);
      };
      step();
    };
    const finish = () => {
      const win = s.over.win === 0;
      const xpGain = {};
      if (win) {
        const left = opts.kind === 'gym' ? 99 : cmBattleXpLeft();
        if (left > 0 && opts.xpMult !== 0) {
          if (opts.kind !== 'gym') cmState().bxp.n++;
          const tot = opts.foe.reduce((a, f) => a + GD.cmBattleXp(f.lvl), 0) * (opts.xpMult || 1) * (1 + cmBonus('monxp') / 100);
          s.sides[0].team.forEach(f => { const x = Math.round(tot * (f.dealt > 0 ? 1 : 0.5)); cmGainXp(f.id, x); xpGain[f.id] = x; });
        }
      }
      save(); queueSync();
      const box = d.querySelector('.modal-box');
      box.insertAdjacentHTML('beforeend', `<div class="cmb-end ${win ? 'good' : 'bad'}"><h3>${win ? T('🏆 Victòria!') : s.over.timeout ? T('⏱️ Temps esgotat') : T('😵 Derrota')}</h3>
        ${Object.keys(xpGain).length ? `<p class="small">${Object.entries(xpGain).map(([id, x]) => `${esc(cmOwned(id) ? GD.cmById(id).forms[cmOwned(id).form].name : id)} +${x} EXP`).join(' · ')}</p>` : win && opts.kind !== 'gym' ? `<p class="small muted">${opts.xpMult === 0 ? T('Avui ja havies entrenat amb aquest rival: aquest combat no dona experiència.') : T('Avui ja has fet els 12 combats que donen experiència. Torna demà!')}</p>` : ''}
        ${!win ? `<p class="small">${T('Cap problema: els Comerçmons es recuperen de seguida. Entrena\'ls, millora l\'equip o tria elements amb avantatge i torna-ho a provar.')}</p>` : ''}
        <button class="btn primary" id="cmbOk">${T('Continuar')}</button></div>`);
      box.querySelector('#cmbOk').onclick = () => { d.remove(); cmFlushEvos(() => onEnd && onEnd({ win })); };
    };
    render();
  }

  // Comerçmon salvatge trobat al món
  function cmWild(id, zone, done) {
    const sp = GD.cmById(id), st = cmState();
    const fin = (r) => { save(); done && done(r); };
    if (!cmState().starter) { toast(T('Primer tria el teu Comerçmon inicial a la 🐾 Comerçdex.'), 'bad'); return fin({}); }
    const lvl = cmWildLevel(id), form = GD.cmFormAt(sp, lvl), catchable = cmCatchable(id), own = cmOwned(id);
    const fresh = !st.seen[id]; st.seen[id] = 1;
    const d = document.createElement('div'); d.className = 'modal cm-modal';
    const cond = cmCond(sp.capture.cond);
    d.innerHTML = `<div class="modal-box cm-quiz"><div class="cm-quiz-art r-${sp.rarity}">${CMART.render(sp, form, { size: 140, cls: 'cm-bob' })}</div>
      <h3>${own ? T('Un {0} salvatge!', [esc(sp.forms[form].name)]) : catchable ? T('Has trobat {0}!', [esc(sp.forms[form].name)]) : T('{0} t\'observa des de lluny…', [esc(sp.forms[form].name)])}</h3>
      <p>${typeChip(sp.type)} ${rarChip(sp.rarity)} · ${T('Nivell {0}', [lvl])}${fresh ? ` · <b>${T('Nou a la Comerçdex!')}</b>` : ''}</p>
      ${own ? `<p class="small">${T('Ja el tens. Un combat d\'entrenament donarà experiència al teu equip.')}</p>`
        : catchable ? `<p class="small">${T('Confia prou en tu per unir-se a l\'agència. Guanya el combat i després supera el repte de coneixement per capturar-lo.')}</p>`
        : `<p class="small">${T('Encara no confia en tu i fuig. Per capturar-lo:')} <b>${esc(sp.capture.text)}</b></p>${sp.capture.cond.starter ? '' : `<ul class="cm-cond">${cond.parts.map(p => `<li class="${p.ok ? 'ok' : ''}">${p.ok ? '✅' : '⬜'} ${esc(p.label)}${p.need ? ` <b>${p.cur}/${p.need}</b>` : ''}</li>`).join('')}</ul>`}`}
      <div class="row-btns">${own || catchable ? `<button class="btn primary" data-go>⚔️ ${T('Combatre')}</button><button class="btn" data-no>🏃 ${T('Deixar-lo')}</button>` : `<button class="btn primary" data-no>${T('D\'acord')}</button>`}</div></div>`;
    document.body.appendChild(d);
    d.querySelector('[data-no]').onclick = () => { d.remove(); fin({ gone: !own && !catchable }); };
    const go = d.querySelector('[data-go]');
    if (go) go.onclick = () => {
      d.remove();
      cmBattle({ title: T('{0} salvatge', [sp.forms[form].name]), sub: GD.cmZones[zone] ? GD.cmZones[zone].n : '', foe: [{ id, lvl, form }], kind: 'wild' }, (r) => {
        if (r.fled) return fin({ gone: false });
        if (!r.win) { toast(T('{0} ha fugit.', [sp.forms[form].name]), 'bad'); return fin({ gone: true }); }
        if (!catchable) return fin({ gone: true });
        cmQuizModal(sp, 0, T('Repte de captura: {0}', [sp.forms[0].name]), T('Respon bé aquesta pregunta per convèncer-lo que s\'uneixi a la teva agència.'), (ok) => {
          if (!ok) { st.escape[id] = Date.now() + CMC().ESCAPE_MS; toast(T('{0} s\'ha escapat. Repassa i torna-ho a provar d\'aquí a una hora.', [sp.forms[0].name]), 'bad'); return fin({ gone: true }); }
          cmGet(id); save(); queueSync();
          cmCaptureAnim(sp, () => fin({ gone: true, caught: true }));
        });
      });
    };
  }

  // Entrenadors: combats d'entrenament amb personatges del joc
  const cmTrainerFresh = (id) => (cmState().tr || {})[id] !== today();
  function cmTrainer(tr, done) {
    const st = cmState(); st.tr = st.tr || {};
    if (!st.starter) { toast(T('Primer tria el teu Comerçmon inicial a la 🐾 Comerçdex.'), 'bad'); return done && done(); }
    const top = cmTeamTop(), lvl = Math.max(3, Math.min(CMC().MAX_LEVEL, top - 2 + tr.d)), name = (GD.names[tr.id] && txt(GD.names[tr.id])) || (ART.CHARS[tr.id] && ART.CHARS[tr.id].name) || tr.id;
    const foe = tr.team.map((id, k) => ({ id, lvl: Math.max(2, lvl - (tr.team.length - 1 - k)) }));
    const fresh = cmTrainerFresh(tr.id);
    const d = document.createElement('div'); d.className = 'modal cm-modal';
    d.innerHTML = `<div class="modal-box"><div class="cmb-trainer">${ART.portrait(tr.id, 'h')}<div><h3>${esc(name)}</h3><p>«${esc(tr.line)}»</p></div></div>
      <p class="small">${T('Equip rival:')} ${foe.map(f => { const sp = GD.cmById(f.id); return `${typeChip(sp.type)} ${esc(sp.forms[GD.cmFormAt(sp, f.lvl)].name)} ${T('Nv')} ${f.lvl}`; }).join(' · ')}</p>
      <p class="small muted">${fresh ? T('La primera victòria del dia contra cada entrenador dona experiència extra.') : T('Avui ja hi has guanyat: podeu tornar a combatre, però sense experiència.')}</p>
      <div class="row-btns"><button class="btn primary" data-go>⚔️ ${T('Combatre')}</button><button class="btn" data-no>${T('Ara no')}</button></div></div>`;
    document.body.appendChild(d);
    d.querySelector('[data-no]').onclick = () => { d.remove(); done && done(); };
    d.querySelector('[data-go]').onclick = () => {
      d.remove();
      cmBattle({ title: T('Combat amb {0}', [name]), sub: tr.line, foe, kind: 'trainer', xpMult: fresh ? 1.5 : 0 }, (r) => {
        if (r.win) { st.tr[tr.id] = today(); save(); }
        done && done();
      });
    };
  }

  // Agències rivals: els grans reptes (dos combats seguits)
  function cmBadges() { const st = cmState(); st.badges = st.badges || {}; return st.badges; }
  function cmGymOpen(g) {
    const B = cmBadges(), i = GD.cmGyms.indexOf(g);
    if (!stageDone(g.stage)) return T('Supera l\'etapa {0} de la campanya.', [g.stage]);
    if (i > 0 && !B[GD.cmGyms[i - 1].id]) return T('Primer guanya {0}.', [GD.cmGyms[i - 1].n]);
    return '';
  }
  function cmGym(gid, done) {
    const g = GD.cmGymById(gid); if (!g) return done && done();
    const B = cmBadges(), team = cmMyTeam(), req = GD.cmGymReq(g, team), lock = cmGymOpen(g), ok = !lock && req.every(r => r.ok) && team.length;
    const d = document.createElement('div'); d.className = 'modal cm-modal';
    d.innerHTML = `<div class="modal-box cm-gym"><p class="kicker">${T('Agència rival')} ${g.final ? '· ' + T('repte final') : ''}</p>
      <h2>${g.i} ${esc(g.n)}</h2><p class="small">${esc(g.spec)} · ${g.types.map(typeChip).join(' ')}</p>
      ${B[gid] ? `<p class="good">🏅 ${T('Ja tens el {0}. Pots tornar a competir per entrenar.', [esc(g.badge)])}</p>` : `<p class="small">${T('Premi: {0} i el {1}.', [eur(g.prize), esc(g.badge)])}</p>`}
      ${lock ? `<p class="warn small">🔒 ${esc(lock)}</p>` : ''}
      <h4>${T('Per entrar, el teu equip actiu necessita:')}</h4>
      <ul class="cm-cond">${req.map(r => `<li class="${r.ok ? 'ok' : ''}">${r.ok ? '✅' : '⬜'} ${esc(r.label)}</li>`).join('')}</ul>
      <p class="small muted">💡 ${esc(g.hint)}</p>
      <p class="small">${T('Rivals:')} ${g.staff.map(st => `<b>${esc(st.n)}</b> (${st.team.length})`).join(' → ')}</p>
      <div class="row-btns">${ok ? `<button class="btn primary" data-go>⚔️ ${T('Començar el repte')}</button>` : ''}<button class="btn" data-no>${T('Tornar')}</button>
        ${!ok && !lock ? `<button class="btn small" data-dex>🐾 ${T('Canviar l\'equip')}</button>` : ''}</div></div>`;
    document.body.appendChild(d);
    d.querySelector('[data-no]').onclick = () => { d.remove(); done && done(); };
    const dx = d.querySelector('[data-dex]'); if (dx) dx.onclick = () => { d.remove(); hubScreen('comercdex'); };
    const go = d.querySelector('[data-go]');
    if (go) go.onclick = () => {
      d.remove();
      const round = (k) => {
        const stf = g.staff[k];
        cmBattle({ title: `${g.i} ${g.n} · ${stf.n}`, sub: k ? T('Combat final del repte.') : T('Primer combat del repte.'), foe: stf.team.map(([id, lvl]) => ({ id, lvl })), kind: 'gym', flee: false, xpMult: B[gid] ? 0.5 : 2 }, (r) => {
          if (!r.win) { toast(T('{0} us ha guanyat. Prepara millor l\'equip i torna-ho a provar.', [g.n]), 'bad'); return done && done(); }
          if (k + 1 < g.staff.length) return round(k + 1);
          const first = !B[gid];
          B[gid] = new Date().toISOString();
          if (first) {
            applyFx({ money: g.prize, src: 'gimnas', ref: gid, log: T('Va guanyar el repte de l\'agència {0} i el {1}.', [g.n, g.badge]), key: true }, true);
            S.history.push({ ch: '-', week: S.week, t: T('Va guanyar el repte de l\'agència {0}.', [g.n]), key: true });
          }
          save(); queueSync();
          const w = document.createElement('div'); w.className = 'modal cm-modal';
          w.innerHTML = `<div class="cm-catch r-epic"><div class="cm-badge big">${g.i}</div><div class="cm-catch-burst"></div>
            <h2>${first ? T('Has guanyat el {0}!', [esc(g.badge)]) : T('Has tornat a guanyar {0}!', [esc(g.n)])}</h2>
            <p>${first ? T('L\'agència {0} reconeix la teva feina. Premi: {1}.', [esc(g.n), eur(g.prize)]) : T('Bon entrenament!')}</p>
            ${g.final && first ? `<p><b>${T('Has superat totes les agències rivals. Ets la referència del sector!')}</b></p>` : ''}
            <button class="btn primary" id="cmok">${T('Genial!')}</button></div>`;
          document.body.appendChild(w);
          w.querySelector('#cmok').onclick = () => { w.remove(); done && done(); };
        });
      };
      round(0);
    };
  }

  /* ---------- Comerçdex ---------- */
  let cmFilter = { fam: '', view: 'tots' };
  const typeChip = (t) => `<span class="cm-type" style="--tc:${GD.cmTypes[t].c}">${GD.cmTypes[t].i} ${esc(GD.cmTypes[t].n)}</span>`;
  const rarChip = (r) => `<span class="cm-rar" style="--rc:${GD.cmRarities[r].c}">${esc(GD.cmRarities[r].n)}</span>`;
  const kindTxt = (k, v) => `${k === 'quizcost' || k === 'costs' ? '−' : '+'}${v} % ${esc(GD.cmKinds[k])}`;

  function tabComercdex(el) {
    const st = cmState(); markDay();
    if (!st.starter) return cmStarterPick(el);
    Object.keys(st.owned).forEach(cmCheckEvo);
    const newly = cmRefreshSeen(); if (newly || st.evoQueue.length) save();
    const all = GD.cmSpecies, own = cmOwnedCount(), seen = all.filter(s => st.seen[s.id] || st.owned[s.id]).length;
    const avail = cmAvailable(), syn = cmSynergiesActive();
    const list = all.filter(s => (!cmFilter.fam || s.family === cmFilter.fam) && (cmFilter.view === 'tots' || (cmFilter.view === 'meus' ? st.owned[s.id] : !st.owned[s.id])));
    const kinds = Object.keys(GD.cmKinds).map(k => [k, cmBonus(k)]).filter(([, v]) => v > 0);
    el.innerHTML = `
      <div class="card cm-head">
        <div class="cm-head-t"><h3>🐾 ${T('Comerçdex')}</h3><b class="cm-count">${own} / ${all.length}</b></div>
        <div class="cm-bar"><i style="width:${Math.round(own / all.length * 100)}%"></i></div>
        <p class="muted small">${T('Capturats: {0} · Vistos: {1} · Per descobrir: {2}', [own, seen, all.length - seen])} · ${T('Dies de joc: {0}', [Object.keys(S.days).length])}</p>
        ${avail.length ? `<div class="cm-alert">🔔 ${T('{0} Comerçmon(s) ja confien en tu. Busca\'ls al món i guanya\'ls un combat:', [avail.length])} ${avail.map(s => `<button class="btn small primary" data-cm="${s.id}">${esc(s.forms[0].name)} · ${GD.cmZonesOf(s.id).map(z => GD.cmZones[z].i).join('')}</button>`).join(' ')} <button class="btn small" data-act="hub">🗺️ ${T('Sortir a explorar')}</button></div>` : ''}
        ${avail.length ? '' : `<p class="small">📍 ${T('Els Comerçmons viuen al món. El lloc més fàcil per començar és el 🌳 Parc de la Devesa: surt de Vic per l\'oest, pel passeig del riu (passa el pont de la plaça cap al sud). Els que tenen ✨ ja confien en tu.')}</p>`}
        <div class="cm-badges"><b>🏅 ${T('Agències rivals')}</b> ${GD.cmGyms.map(g => { const b = cmBadges()[g.id]; return `<span class="cm-badge ${b ? 'got' : ''}" title="${esc(g.n + ' · ' + g.badge + ' · ' + GD.cmZones[g.map].n)}">${b ? g.i : '🔒'}<small>${esc(g.n)}</small></span>`; }).join('')}</div>
      </div>
      <div class="card cm-team">
        <h4>${T('Equip actiu ({0}/{1})', [st.team.length, CMC().TEAM_SIZE])}</h4>
        <div class="cm-slots">${Array.from({ length: CMC().TEAM_SIZE }, (_, i) => { const id = st.team[i]; const sp = id && GD.cmById(id), m = id && st.owned[id];
          return sp ? `<button class="cm-slot r-${sp.rarity}" data-cm="${id}">${CMART.render(sp, m.form, { size: 78 })}<b>${esc(sp.forms[m.form].name)}</b><small>${T('Nv')} ${m.lvl}</small></button>` : `<div class="cm-slot empty">${T('Buit')}</div>`; }).join('')}</div>
        <p class="small">${kinds.length ? kinds.map(([k, v]) => `<span class="cm-bonus">${kindTxt(k, v)}</span>`).join(' ') : `<span class="muted">${T('Afegeix Comerçmons a l\'equip per activar les seves habilitats passives.')}</span>`}</p>
        ${syn.length ? `<p class="small">${syn.map(y => `<span class="cm-syn">🔗 <b>${esc(y.n)}</b> · ${esc(y.d)}</span>`).join(' ')}</p>` : ''}
        <details class="small"><summary>${T('Sinergies i bonificacions d\'equip')}</summary><ul>${GD.cmSynergies.map(y => `<li><b>${esc(y.n)}</b>: ${y.ids.map(id => esc(GD.cmById(id).forms[0].name)).join(' + ')} → ${kindTxt(y.kind, y.v)}</li>`).join('')}${GD.cmTeamBonus.map(y => `<li><b>${esc(y.n)}</b>: ${esc(y.d)}</li>`).join('')}</ul>
          <p class="muted">${T('Les bonificacions de cada tipus tenen un límit del {0} %.', [CMC().BONUS_CAP])}</p></details>
      </div>
      <div class="cm-filters">
        <div class="seg">${[['tots', T('Tots')], ['meus', T('Capturats')], ['pendents', T('Per capturar')]].map(([k, n]) => `<button data-cmview="${k}" class="${cmFilter.view === k ? 'on' : ''}">${n}</button>`).join('')}</div>
        <div class="cm-fams"><button data-cmfam="" class="${!cmFilter.fam ? 'on' : ''}">${T('Totes')}</button>${Object.entries(GD.cmFamilies).map(([k, f]) => `<button data-cmfam="${k}" class="${cmFilter.fam === k ? 'on' : ''}" title="${esc(f.n)}">${f.i} ${esc(f.n)}</button>`).join('')}</div>
      </div>
      <div class="cm-grid">${list.map(sp => {
        const m = st.owned[sp.id], vis = m || st.seen[sp.id], av = !m && avail.includes(sp);
        return `<button class="cm-card r-${sp.rarity} ${m ? 'own' : vis ? 'seen' : 'unk'}" data-cm="${sp.id}">
          <small>#${String(sp.num).padStart(3, '0')}</small>${av ? '<em class="cm-new">!</em>' : ''}
          ${CMART.render(sp, m ? m.form : 0, { size: 96, silhouette: !vis })}
          <b>${vis ? esc(sp.forms[m ? m.form : 0].name) : '???'}</b>
          ${vis ? typeChip(sp.type) : `<span class="muted small">${esc(GD.cmFamilies[sp.family].i)}</span>`}
          ${m ? `<span class="cm-lv">${T('Nv')} ${m.lvl}</span>` : ''}</button>`;
      }).join('')}</div>`;
    el.querySelectorAll('[data-cm]').forEach(b => b.onclick = () => cmDetail(b.dataset.cm));
    el.querySelectorAll('[data-cmview]').forEach(b => b.onclick = () => { cmFilter.view = b.dataset.cmview; tabComercdex(el); });
    el.querySelectorAll('[data-cmfam]').forEach(b => b.onclick = () => { cmFilter.fam = b.dataset.cmfam; tabComercdex(el); });
    if (st.evoQueue.length) cmFlushEvos(() => hubScreen('comercdex'));
  }

  function cmStarterPick(el) {
    const starters = GD.cmSpecies.filter(s => s.starter);
    el.innerHTML = `<div class="card cm-head"><h3>🐾 ${T('Benvingut a la Comerçdex!')}</h3>
      <p>${T('Els Comerçmons són criatures del món del comerç i el màrqueting. T\'ajuden a la teva agència, evolucionen i es fan més forts amb tu. Tria el teu primer company:')}</p></div>
      <div class="cm-starters">${starters.map(sp => `<div class="card cm-starter r-${sp.rarity}">${CMART.render(sp, 0, { size: 150, cls: 'cm-bob' })}
        <h3>${esc(sp.forms[0].name)}</h3><p>${typeChip(sp.type)} · ${esc(sp.specialty)}</p><p class="small">${esc(sp.desc)}</p>
        <p class="small"><b>${esc(sp.passive.name)}:</b> ${esc(sp.utility)}</p>
        <button class="btn primary" data-start="${sp.id}">${T('Triar {0}', [esc(sp.forms[0].name)])}</button></div>`).join('')}</div>`;
    el.querySelectorAll('[data-start]').forEach(b => b.onclick = () => {
      const st = cmState(); if (st.starter) return;
      st.starter = b.dataset.start; starters.forEach(s => { st.seen[s.id] = 1; });
      cmGet(b.dataset.start); save(); queueSync();
      cmCaptureAnim(GD.cmById(b.dataset.start), () => { hubScreen('comercdex'); toast(T('Ara surt a explorar: al 🌳 Parc de la Devesa (oest de Vic, pel passeig del riu) hi viuen molts Comerçmons.'), 'good'); });
    });
  }

  function statBars(stats, max) {
    return `<div class="cm-stats">${Object.entries(stats).map(([k, v]) => `<div><span>${esc(GD.cmStatNames[k])}</span><i><b style="width:${Math.min(100, Math.round(v / max * 100))}%"></b></i><em>${v}</em></div>`).join('')}</div>`;
  }
  function cmDetail(id, showForm) {
    const sp = GD.cmById(id); if (!sp) return;
    const st = cmState(), m = st.owned[id], vis = m || st.seen[id];
    const curForm = m ? m.form : 0, f = showForm != null ? showForm : curForm;
    const capture = cmCond(sp.capture.cond), evo = m ? cmEvoReady(id) : null, avail = !m && cmAvailable().includes(sp);
    const lvl = m ? m.lvl : 1, stats = GD.cmStats(sp, f, f === curForm ? lvl : sp.forms[f].lvl), maxStat = Math.ceil(GD.CM.STAT_TOTAL / 5 * 1.54 * 1.8 * 2 / 6);
    const ty = GD.cmTypes[sp.type];
    const d = document.querySelector('.cm-modal.cm-sheet-w') || document.createElement('div');
    d.className = 'modal cm-modal cm-sheet-w';
    const formTabs = sp.forms.map((fo, i) => `<button class="${i === f ? 'on' : ''}" data-form="${i}" ${!vis ? 'disabled' : ''}>${vis && (m ? true : i === 0) ? esc(fo.name) : '???'}${i ? ` · ${T('Nv')} ${fo.lvl}` : ''}</button>`).join('');
    const showFull = m || (vis && f === 0);
    d.innerHTML = `<div class="modal-box cm-sheet r-${sp.rarity}">
      <button class="cm-x" aria-label="${T('Tancar')}">✕</button>
      <div class="cm-sheet-top" style="--tc:${ty.c};--tc2:${ty.c2}">
        <div class="cm-sheet-art">${CMART.render(sp, f, { size: 200, silhouette: !showFull, cls: 'cm-bob' })}</div>
        <div><small>#${String(sp.num).padStart(3, '0')} · ${T('Generació {0}', [sp.gen])}</small>
          <h2>${vis ? esc(sp.forms[f].name) : '???'}</h2>
          <p>${typeChip(sp.type)} ${rarChip(sp.rarity)} <span class="cm-fam">${GD.cmFamilies[sp.family].i} ${esc(GD.cmFamilies[sp.family].n)}</span></p>
          ${vis ? `<p class="small"><b>${T('Especialitat:')}</b> ${esc(sp.specialty)} · <b>${T('Perfil:')}</b> ${esc(GD.cmArch[sp.arch].n)}</p>` : ''}
          ${m ? `<p class="small"><b>${T('Nivell {0}', [m.lvl])}</b> ${m.lvl < CMC().MAX_LEVEL ? `<i class="cm-xp"><b style="width:${Math.round(m.xp / GD.cmXpNeed(m.lvl) * 100)}%"></b></i> <span class="muted">${m.xp}/${GD.cmXpNeed(m.lvl)} EXP</span>` : T('(màxim)')}</p>` : ''}
        </div></div>
      ${sp.forms.length > 1 ? `<div class="seg cm-forms">${formTabs}</div>` : ''}
      ${showFull ? `<p>${esc(txt(sp.forms[f].desc))}</p><p class="small muted">${esc(sp.desc)}</p><p class="small"><b>${T('Personalitat:')}</b> ${esc(sp.personality)}</p>` : `<p class="muted">${T('Encara no l\'has descobert. Compleix les condicions de captura per veure\'l.')}</p>`}
      ${vis ? `
      <h4>${T('Estadístiques')} <small class="muted">(${f === curForm && m ? T('nivell actual') : T('al nivell {0}', [sp.forms[f].lvl])})</small></h4>${statBars(stats, maxStat)}
      <h4>${T('Habilitat passiva')}: ${esc(sp.passive.name)}</h4>
      <p class="small">⚔️ ${esc(sp.passive.combat)}</p><p class="small">🏢 ${esc(sp.utility)} <b>${kindTxt(sp.passive.kind, GD.cmPassive(sp, f))}</b> ${T('quan és a l\'equip actiu.')}</p>
      <h4>${T('Atacs')}</h4>
      <div class="cm-attacks">${sp.forms.flatMap((fo, i) => fo.attacks.map(a => ({ a, i }))).map(({ a, i }) => { const lock = !m || i > curForm; return `<div class="cm-atk ${lock && !(i === 0 && vis) ? 'lock' : ''}"><b>${esc(a.n)}</b> <span class="cm-cat ${a.cat}">${esc(GD.cmAttackCats[a.cat])}</span>${i ? ` <small class="muted">(${esc(sp.forms[i].name)})</small>` : ''}<br><small>⚡${a.cost} · 💥${a.pow || '—'} · 🎯${a.acc} % · ⏳${a.cd}</small><br><small>${esc(a.fx)}</small></div>`; }).join('')}</div>
      <h4>${T('Element')}: ${ty.i} ${esc(ty.n)}</h4>
      <p class="small">${T('Fort contra:')} ${GD.cmStrong[sp.type].map(t => typeChip(t)).join(' ')} · ${T('Feble contra:')} ${Object.keys(GD.cmStrong).filter(t => GD.cmStrong[t].includes(sp.type)).map(t => typeChip(t)).join(' ')}</p>
      <h4>${T('Evolucions')}</h4>
      <div class="cm-evos">${sp.forms.map((fo, i) => `${i ? `<span class="cm-arrow">→<small>${T('Nv')} ${fo.lvl}${fo.cond ? ' + ' + cmCond(fo.cond).parts.map(p => p.label + (p.need ? ` ${p.need}` : '')).join(', ') : ''}</small></span>` : ''}<span class="cm-evo-f ${m && i <= curForm ? 'got' : ''}">${CMART.render(sp, i, { size: 64, silhouette: !(m && i <= curForm) && !(vis && i === 0) })}<small>${m && i <= curForm || i === 0 ? esc(fo.name) : '???'}</small></span>`).join('')}</div>
      ${evo && !evo.ok ? `<p class="small muted">${T('Pròxima evolució:')} ${T('nivell {0}', [evo.next.lvl])}${evo.cond.parts.length ? ' · ' + evo.cond.parts.map(p => `${p.ok ? '✅' : '⬜'} ${esc(p.label)}${p.need ? ` (${p.cur}/${p.need})` : ''}`).join(' · ') : ''}</p>` : ''}` : ''}
      <h4>${T('Com es captura')}</h4><p class="small">${esc(sp.capture.text)}</p>
      <p class="small">📍 <b>${T('On viu:')}</b> ${vis ? esc(zoneNames(id)) : T('encara no ho saps: explora el món.')}</p>
      ${!m && !sp.capture.cond.starter ? `<ul class="cm-cond">${capture.parts.map(p => `<li class="${p.ok ? 'ok' : ''}">${p.ok ? '✅' : '⬜'} ${esc(p.label)}${p.need ? ` <b>${p.cur}/${p.need}</b>` : ''}</li>`).join('')}</ul>` : ''}
      <div class="row-btns">
        ${avail ? `<p class="cm-alert small">🎯 ${T('Ja confia en tu! Busca\'l a {0}, guanya-li un combat i supera el repte per capturar-lo.', [esc(zoneNames(id))])}</p>` : ''}
        ${m ? `<button class="btn ${st.team.includes(id) ? '' : 'primary'}" data-cmact="team">${st.team.includes(id) ? T('Treure de l\'equip') : T('Afegir a l\'equip')}</button>
          <button class="btn" data-cmact="train" ${m.trained === today() ? 'disabled' : ''}>🏋️ ${m.trained === today() ? T('Ja ha entrenat avui') : T('Entrenament diari')}</button>` : ''}
      </div></div>`;
    if (!d.parentNode) document.body.appendChild(d);
    d.onclick = (e) => { if (e.target === d) close(); };
    const close = () => { d.remove(); if ($('#hubBody') && hubTab === 'comercdex') hubScreen('comercdex'); };
    d.querySelector('.cm-x').onclick = close;
    d.querySelectorAll('[data-form]').forEach(b => b.onclick = () => cmDetail(id, +b.dataset.form));
    const act = (k) => { const b = d.querySelector(`[data-cmact="${k}"]`); return b; };
    if (act('team')) act('team').onclick = () => { cmToggleTeam(id); cmDetail(id, f); };
    if (act('train')) act('train').onclick = () => { d.remove(); cmTrain(id); };
  }

  /* ================= Encàrrecs lliures ================= */
  // Estudiar té un cost: cada resposta incorrecta d'un test es paga (material i hores de repàs), més car a cada etapa
  function studyCost() { return Math.round((30 + 20 * (curStage() - 1)) * (1 - cmBonus('quizcost') / 100)); }
  function payStudy(title) {
    const c = studyCost();
    applyFx({ money: -c, log: T('Resposta incorrecta a «{0}»: −{1} en hores de repàs.', [title, eur(c)]) }, true);
    return c;
  }
  // Ordre aleatori de les opcions d'una pregunta (retorna els índexs originals)
  function shuffledIdx(n) { const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function curStage() { const st = GD.stages.find(s => s.chapters.some(c => !S.done[c])); return st ? st.id : 8; }
  // Els encàrrecs lliures no es repeteixen: un cop fets s'esborren i ja no tornen a aparèixer
  function gigPool() { const st = curStage(), done = S.gigsDone || {}; return GD.gigs.filter(g => (g.minStage || 1) <= st && !done[g.id]); }
  function genGigs() {
    const st = curStage();
    const pool = gigPool();
    const picks = [];
    const used = new Set();
    while (picks.length < 3 && used.size < pool.length) {
      const i = Math.floor(Math.random() * pool.length); if (used.has(i)) continue; used.add(i);
      const g = pool[i];
      picks.push({ id: g.id, pay: Math.round((g.pay || 180) * (0.8 + 0.25 * st) / 10) * 10, xp: 50 + 22 * st });
    }
    S.gigs = picks;
  }
  /* ================= Taller web (curs opcional) ================= */
  const WP = () => GD.webPlatforms;
  function webState() { if (!S.web) S.web = { platforms: [], levels: {} }; return S.web; }
  // Estat d'una web del taller: per fer, en revisió, cal millorar-la, aprovada o entregada abans de les notes (sense nota)
  function webStatus(L) {
    const r = webState().levels[L.n];
    if (!r) return 'todo';
    if (r.review && r.review.status === 'approved') return 'approved';
    if (r.review && r.review.status === 'changes' && r.review.v >= r.v) return 'changes';
    return r.v ? 'sent' : 'legacy';
  }
  function webOpen(n) { return n === 1 || !!webState().levels[n - 1]; }
  const safeUrl = (u) => /^https?:\/\//i.test(u || '') ? esc(u) : '#';

  function tabTaller(el) {
    const W = webState();
    if (!W.platforms.length) return webPicker(el);
    const done = Object.keys(W.levels).length;
    el.innerHTML = `
      <div class="card web-head">
        <h3>${T('🛠️ Taller web')}</h3>
        <p>${T('Aprèn a crear webs professionals per als clients de l\'agència. Cada nivell és un encàrrec real: el construeixes amb la plataforma que vulguis i n\'entregues l\'enllaç. És opcional: pots avançar en la campanya igualment.')}</p>
        <div class="web-plats">${W.platforms.map(k => `<span class="plat-chip">${WP()[k].i} ${esc(WP()[k].n)}</span>`).join('')}
          <button class="btn small" data-act="webPlatforms">${T('Canviar plataformes')}</button></div>
        <p class="muted small">${T('Webs entregades: {0} de {1}', [done, GD.webLevels.length])}</p>
      </div>
      <div class="web-levels">${GD.webLevels.map(L => {
        const d = W.levels[L.n], open = webOpen(L.n), p = d && WP()[d.platform];
        return `<div class="web-level card ${d ? 'done' : open ? 'open' : 'locked'}">
          <span class="wl-ava">${ART.portrait(L.who, d ? 'h' : 'n')}</span>
          <div class="wl-txt"><small>${T('Nivell {0}', [L.n])} · ${txt(L.sub)} · 💶 ${GD.webMax(L) ? (d && d.paid > 0 && webStatus(L) === 'approved' ? T('Cobrat: {0}', [eur(d.paid)]) : T('fins a {0}', [eur(GD.webMax(L))])) : T('sense pagament')}</small><b>${txt(L.title)}</b>
            ${d ? `<em class="pstat ${webStatus(L)}">${webStatus(L) === 'legacy' ? T('📤 Entregada (sense nota)') : PST()[webStatus(L)].join(' ')}${d.review && d.review.status === 'approved' && d.review.grade != null ? ' · ' + T('Nota: {0}', [d.review.grade]) : ''}</em><br><a href="${safeUrl(d.url)}" target="_blank" rel="noopener">${esc(d.url)}</a>${p ? ` <em class="plat-chip">${p.i} ${esc(p.n)}</em>` : ''}` : ''}
          </div>
          ${open ? `<button class="btn ${d ? 'small' : 'primary'}" data-web="${L.n}">${d ? (webStatus(L) === 'changes' ? T('Corregir') : T('Revisar')) : T('Començar')}</button>` : '<span class="ch-s">🔒</span>'}
        </div>`;
      }).join('')}</div>`;
  }

  function webPicker(el) {
    const W = webState(); const sel = new Set(W.platforms);
    const draw = () => {
      el.innerHTML = `<div class="card"><h3>${T('🛠️ Taller web')}</h3>
        <p>${T('Tria amb quines plataformes vols aprendre a crear webs. Pots escollir-ne una o diverses i canviar-ho quan vulguis: a cada nivell veuràs la guia pas a pas de les plataformes triades.')}</p></div>
        <div class="plat-grid">${Object.entries(WP()).map(([k, p]) => `<button class="plat ${sel.has(k) ? 'on' : ''}" data-plat="${k}">
          <span class="plat-top"><span class="plat-i">${p.i}</span><b>${esc(p.n)}</b><em>${sel.has(k) ? '☑' : '☐'}</em></span>
          <small>${txt(p.d)}</small><small class="plat-free">🆓 ${txt(p.free)}</small><small>🎯 ${txt(p.ideal)}</small></button>`).join('')}</div>
        <button class="btn primary big" id="platOk" ${sel.size ? '' : 'disabled'}>${T('Confirmar plataformes')}</button>`;
      el.querySelectorAll('[data-plat]').forEach(b => b.onclick = () => { const k = b.dataset.plat; if (sel.has(k)) sel.delete(k); else sel.add(k); draw(); });
      el.querySelector('#platOk').onclick = () => { W.platforms = Object.keys(WP()).filter(k => sel.has(k)); save(); hubScreen('taller'); };
    };
    draw();
  }

  function urlHint(u, k) {
    if (!u) return '';
    let url;
    try { url = new URL(/^https?:\/\//i.test(u) ? u : 'https://' + u); } catch (e) { return T('⚠️ L\'enllaç no és vàlid.'); }
    const p = WP()[k];
    if (p && p.domains.some(d => url.hostname.includes(d))) return T('✔ Adreça de {0}.', [p.n]);
    return T('⚠️ L\'adreça no sembla de {0}. Si fas servir un domini propi, cap problema.', [p ? p.n : '']);
  }

  // Nota i comentaris d'una web corregida (automàticament o pel professor)
  function webFeedback(L, rec) {
    const rv = rec && rec.review, st = webStatus(L);
    if (!rec || !rec.v) return '';
    if (st === 'sent') return `<div class="warn small">${rv && rv.autoError && rv.autoError.v >= rec.v ? `<b>${T('🤖 No s\'ha pogut fer la correcció automàtica.')}</b> ${autoErrorText(rv.autoError.reason)} ${T('El professor el revisarà igualment.')}` : T('⏳ Correcció automàtica en curs: pot trigar uns minuts. Després, el professor la pot revisar.')}</div>`;
    if (!rv || !rv.status) return '';
    const auto = rv.by === 'auto';
    return `<div class="${rv.status === 'approved' ? 'info' : 'errors'}"><b>${rv.status === 'approved' ? (auto ? T('✅ Aprovat per la correcció automàtica') : T('✅ Aprovat pel professor')) : (auto ? T('✏️ La correcció automàtica demana canvis') : T('✏️ El professor demana canvis'))}${rv.grade != null ? ' · ' + T('Nota: {0}', [rv.grade]) : ''}</b>
      ${auto ? `<p class="muted small">${T('El professor pot revisar i modificar aquesta nota i els comentaris.')}</p>` : ''}${rv.feedback ? `<p class="pre">${esc(rv.feedback)}</p>` : ''}</div>`;
  }

  function webLevel(n) {
    const L = GD.webLevels.find(x => x.n === n); const W = webState();
    const prev = W.levels[n];
    let plat = prev && W.platforms.includes(prev.platform) ? prev.platform : W.platforms[0];
    rightActor = null;
    sceneShell(L.bg);
    const back = () => hubScreen('taller');
    const brief = () => panel(`<div class="pn-h"><b>🧾 ${txt(L.title)}</b><small>${T('Taller web · Nivell {0}', [n])} · ${txt(L.sub)}</small></div>
      <h4>${T('Què demana el client')}</h4>
      <ul class="req-list">${L.reqs.map(r => `<li>${txt(r)}</li>`).join('')}</ul>
      ${GD.webMax(L) ? payBox(GD.webMax(L), prev && prev.paid) : `<div class="pay-box">💶 <b>${T('Sense pagament: és la teva pròpia web, però la nota compta igualment.')}</b></div>`}
      ${prev ? `<div class="info">${T('Ja has entregat aquest nivell:')} <a href="${safeUrl(prev.url)}" target="_blank" rel="noopener">${esc(prev.url)}</a></div>` : ''}
      ${webFeedback(L, prev)}
      <div class="row-btns"><button class="btn primary" id="learn">${T('📚 Aprèn a fer-la')}</button>${webStatus(L) === 'approved' ? '' : `<button class="btn" id="deliver">${prev ? T('📤 Tornar a entregar') : T('📤 Entregar')}</button>`}<button class="btn ghost" id="back">${T('Tornar al taller')}</button></div>`, (p) => {
      p.querySelector('#learn').onclick = learn; const dl = p.querySelector('#deliver'); if (dl) dl.onclick = deliver; p.querySelector('#back').onclick = back;
    });
    const learn = () => panel(`<div class="lesson"><div class="ls-h"><small>${T('🛠️ Taller web · Nivell {0}', [n])}</small><h2>${txt(L.title)}</h2></div>
        ${L.concepts.map(c => `<p>${txt(c)}</p>`).join('')}
        <div class="example"><b>${T('✨ Animacions')}</b><p>${txt(L.anim)}</p></div>
        <h4>${T('Guia pas a pas')}</h4>
        <div class="seg plat-tabs">${W.platforms.map(k => `<button data-pl="${k}" class="${k === plat ? 'on' : ''}">${WP()[k].i} ${esc(WP()[k].n)}</button>`).join('')}</div>
        <ol class="steps">${(L.guides[plat] || []).map(s => `<li>${txt(s)}</li>`).join('')}</ol>
        <div class="errors"><b>💡 ${T('Consell professional')}</b><p>${txt(L.pro)}</p></div>
        <div class="row-btns"><button class="btn primary" id="deliver">${T('📤 Ja l\'he feta: entregar')}</button><button class="btn" id="brief">${T('Veure l\'encàrrec')}</button></div></div>`, (p) => {
      p.querySelectorAll('[data-pl]').forEach(b => b.onclick = () => { plat = b.dataset.pl; learn(); });
      p.querySelector('#deliver').onclick = deliver; p.querySelector('#brief').onclick = brief;
    });
    const deliver = () => {
      const d = prev || {};
      if (!S.classe) {
        panel(`<div class="pn-h"><b>📤 ${T('Entrega de la web')}</b><small>${txt(L.title)}</small></div>
          <p>${T('Per entregar webs necessites el codi de classe del professor: és el que permet corregir-les i que cobris.')}</p>
          <div class="row-btns"><button class="btn primary" data-act="setClass">${T('🏷️ Posar codi de classe')}</button><button class="btn ghost" id="b">${T('Tornar')}</button></div>`, (pn) => { pn.querySelector('#b').onclick = brief; });
        return;
      }
      panel(`<div class="pn-h"><b>📤 ${T('Entrega de la web')}</b><small>${txt(L.title)}</small></div>
        <label class="fld">${T('Plataforma amb què l\'has feta')}<select class="inp" id="wPlat">${W.platforms.map(k => `<option value="${k}" ${k === (d.platform || plat) ? 'selected' : ''}>${esc(WP()[k].n)}</option>`).join('')}</select></label>
        <label class="fld">${T('Enllaç públic de la web')}<input class="inp" id="wUrl" type="url" inputmode="url" placeholder="https://..." value="${esc(d.url || '')}"></label>
        <p class="muted small" id="wHint"></p>
        <p class="lbl">${T('Comprova que compleix tot el que demana el client:')}</p>
        <div class="checks">${L.reqs.map((r, i) => `<label class="chk"><input type="checkbox" data-r="${i}" ${d.url ? 'checked' : ''}><span>${txt(r)}</span></label>`).join('')}</div>
        <label class="fld">${T('Explica breument com l\'has feta i com has creat les animacions')}<textarea class="inp" id="wRef" rows="3" maxlength="1000">${esc(d.reflection || '')}</textarea></label>
        <label class="fld">${T('Nota per al client (opcional): contrasenya de la botiga, puntuació de rendiment...')}<textarea class="inp" id="wNote" rows="2" maxlength="500">${esc(d.note || '')}</textarea></label>
        <div class="row-btns"><button class="btn primary" id="send">${T('Entregar al client')}</button><button class="btn ghost" id="learn">${T('Tornar a la guia')}</button></div>`, (p) => {
        const hint = () => { p.querySelector('#wHint').textContent = urlHint(p.querySelector('#wUrl').value.trim(), p.querySelector('#wPlat').value); };
        p.querySelector('#wUrl').oninput = hint; p.querySelector('#wPlat').onchange = hint; hint();
        p.querySelector('#learn').onclick = learn;
        p.querySelector('#send').onclick = async () => {
          let u = p.querySelector('#wUrl').value.trim();
          if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;
          let url = null;
          try { url = new URL(u); } catch (e) { }
          if (!url || !/^https?:$/.test(url.protocol) || !url.hostname.includes('.') || /^(localhost|127\.|192\.168\.|10\.)/.test(url.hostname)) { toast(T('Escriu l\'enllaç públic de la web (per exemple, https://el-meu-lloc.wixsite.com/forn).'), 'bad'); return; }
          if ([...p.querySelectorAll('[data-r]')].some(c => !c.checked)) { toast(T('Revisa i marca tots els requisits abans d\'entregar.'), 'bad'); return; }
          const reflection = p.querySelector('#wRef').value.trim();
          if (reflection.length < 20) { toast(T('Explica en almenys una frase com l\'has feta.'), 'bad'); p.querySelector('#wRef').focus(); return; }
          const btn = p.querySelector('#send'); btn.disabled = true; btn.textContent = T('Comprovant l\'enllaç…');
          const reach = await Promise.race([
            fetch(url.href, { mode: 'no-cors', cache: 'no-store' }).then(() => true).catch(() => false),
            new Promise(r => setTimeout(() => r(false), 7000))
          ]);
          const finish = () => webDelivered(L, { url: url.href, platform: p.querySelector('#wPlat').value, reflection, note: p.querySelector('#wNote').value.trim(), reachable: reach, at: new Date().toISOString() }, !prev);
          if (reach) finish();
          else { btn.disabled = false; btn.textContent = T('Entregar al client'); confirmBox(T('No hem pogut comprovar que la web estigui publicada. Assegura\'t que l\'enllaç és públic. Vols entregar-la igualment?'), finish); }
        };
      });
    };
    playLines(L.brief, brief);
  }

  function webDelivered(L, rec, first) {
    const old = webState().levels[L.n], R = L.reward;
    // Les entregues anteriors al pagament per nota ja van cobrar l'import antic: només es cobra el que falti
    rec.v = old ? (old.v || 0) + 1 : 1;
    rec.paid = old ? (old.paid != null ? old.paid : (old.v ? 0 : (R.money || 0))) : 0;
    webState().levels[L.n] = rec;
    if (first) {
      applyFx({ xp: R.xp, rep: R.rep, trust: R.trust ? { [R.trust]: 1 } : null, log: T('Va entregar la web «{0}» feta amb {1}.', [txt(L.title), WP()[rec.platform].n]), key: true }, true);
      advanceWeeks(1);
    }
    save();
    doSync(false).then(ok => { if (ok) requestAutograde('web-' + L.n, rec.v); else { rec.autoPending = true; save(); } });
    showActors(L.who, 'h');
    playLines([[L.who + '.h', T('Ja la tinc! Moltes gràcies, {nom}. Ara mateix l\'ensenyo a tothom.')]], () => {
      const next = GD.webLevels.find(x => x.n === L.n + 1);
      panel(`<div class="reward"><div class="rw-h"><small>${T('Taller web · Nivell {0}', [L.n])}</small><h2>🎉 ${T('Web entregada!')}</h2></div>
        <p><a href="${safeUrl(rec.url)}" target="_blank" rel="noopener">${esc(rec.url)}</a></p>
        ${first ? `<div class="metrics"><div class="metric good"><small>${T('Experiència')}</small><b>+${R.xp}</b></div>
          <div class="metric good"><small>${T('Reputació')}</small><b>+${R.rep}</b></div></div>` : `<p class="muted">${T('Entrega actualitzada. L\'experiència i la reputació només es donen la primera vegada.')}</p>`}
        ${GD.webMax(L) ? payBox(GD.webMax(L), rec.paid) : ''}
        <p class="small">${T('La correcció automàtica puntuarà la web en pocs minuts i el professor en pot modificar la nota. El que cobres depèn de la nota.')}</p>
        ${next ? `<div class="stage-clear" style="--sc:#38d1c4"><b>🔓 ${T('Nou encàrrec desbloquejat:')}</b><p>${txt(next.title)}</p></div>` : `<div class="stage-clear" style="--sc:#ffd24a"><b>🏆 ${T('Has completat el Taller web!')}</b></div>`}
        <button class="btn primary big" data-act="hubTaller">${T('Tornar al taller')}</button></div>`);
      if (first) petals($('.scene'), 20);
    });
  }

  /* ================= Projectes reals (revisats pel professor) ================= */
  const CH_ORDER = GD.stages.flatMap(s => s.chapters);
  // Pagament segons la nota: «import màxim × nota ÷ 10». Si la nota puja, es cobra la diferència; mai es treu res.
  const payBox = (max, paid) => max > 0 ? `<div class="pay-box">💶 <b>${T('Pagament: fins a {0}', [eur(max)])}</b>
      <span class="small">${T('Cobraràs segons la nota: amb un 5 → {0} · amb un 7 → {1} · amb un 10 → {2}. Si la nota puja, cobres la diferència.', [eur(GD.payFor(max, 5)), eur(GD.payFor(max, 7)), eur(max)])}</span>
      ${paid > 0 ? `<span class="paid">✅ ${T('Has cobrat {0}.', [eur(paid)])}</span>` : ''}</div>` : '';
  function settlePay(rec, max, rv, title, ref) {
    if (!rv || rv.status !== 'approved' || !(max > 0)) return 0;
    const g = rv.grade != null ? rv.grade : GD.PASS_GRADE, target = GD.payFor(max, g), delta = target - (rec.paid || 0);
    if (delta <= 0) return 0;
    const keep = RUN; RUN = null;
    applyFx({ money: delta, fee: false, src: 'proj', ref, log: T('Cobrament pel projecte «{0}» (nota {1}): {2}.', [title, g, eur(delta)]), key: true }, true);
    RUN = keep; rec.paid = target;
    return delta;
  }
  function projRec(id) { if (!S.proj) S.proj = {}; return S.proj[id] || null; }
  function projStatus(p) {
    const r = projRec(p.id);
    if (r && r.review && r.review.status === 'approved') return 'approved';
    if (!S.done[p.after]) return 'locked';
    if (!r || !r.v) return 'todo';
    if (r.review && r.review.status === 'changes' && r.review.v >= r.v) return 'changes';
    return 'sent';
  }
  // Projecte que cal haver entregat per poder jugar aquest capítol. No cal esperar la revisió:
  // la IA el corregeix de seguida i, si cal millorar-lo, l'alumne rep un avís però pot continuar.
  function projGate(chId) {
    const i = CH_ORDER.indexOf(chId);
    const p = i > 0 ? GD.projectAfter(CH_ORDER[i - 1]) : null;
    return p && ['locked', 'todo'].includes(projStatus(p)) ? p : null;
  }
  // Projectes entregats que cal arreglar: canvis demanats o document que la IA no ha pogut llegir
  function projFixes() {
    return GD.projects.filter(p => { const s = projStatus(p), r = projRec(p.id), ae = r && r.review && r.review.autoError;
      return s === 'changes' || (s === 'sent' && ae && ae.v >= r.v && ae.reason !== 'ai'); });
  }
  function fixesCard() {
    const F = projFixes();
    return F.length ? `<div class="card warn fixes"><b>${T('✏️ Projectes per millorar ({0})', [F.length])}</b><p class="small">${T('Pots continuar jugant, però corregeix-los i torna\'ls a entregar: la recompensa del client només arriba quan s\'aproven.')}</p>
      <div class="row-btns">${F.map(p => `<button class="btn small" data-proj="${p.id}">${txt(p.title)}</button>`).join('')}</div></div>` : '';
  }
  const PST = () => ({
    locked: ['🔒', T('Bloquejat')], todo: ['📝', T('Per fer')], sent: ['⏳', T('En revisió')],
    changes: ['✏️', T('Cal millorar-lo')], approved: ['✅', T('Aprovat')]
  });
  const guideUrl = (p) => 'guia.html' + (p ? '#' + p.id : '');

  function tabProjectes(el) {
    const st = GD.projects.map(p => projStatus(p));
    const n = (k) => st.filter(s => s === k).length;
    el.innerHTML = `
      <div class="card web-head">
        <h3>${T('📋 Projectes reals')}</h3>
        <p>${T('Els clients et demanen feines de veritat: plans, campanyes, anuncis, informes... Les has de fer tu (amb Google Docs, Canva, les eines d\'anuncis...), entregar-ne l\'enllaç i continuar la campanya. La IA els corregeix en pocs minuts i el professor en revisa la nota. Si cal millorar-ne algun, rebràs un avís.')}</p>
        <div class="row-btns"><a class="btn small primary" href="${guideUrl()}" target="_blank" rel="noopener">${T('📘 Guia dels projectes')}</a>
          ${S.classe ? `<button class="btn small" data-act="checkReviews">${T('🔄 Comprovar revisions')}</button>` : ''}</div>
        <p class="muted small">${T('Aprovats: {0} de {1}', [n('approved'), GD.projects.length])} · ${T('En revisió: {0}', [n('sent')])} · ${T('Per millorar: {0}', [n('changes')])}</p>
        ${S.classe ? '' : `<div class="warn small">${T('⚠️ Per entregar projectes necessites el codi de classe del professor.')} <button class="btn small" data-act="setClass">${T('🏷️ Posar codi de classe')}</button></div>`}
      </div>
      <div class="web-levels">${GD.projects.map((p, i) => {
        const s = st[i], r = projRec(p.id), [ic, lb] = PST()[s];
        const rv = r && r.review;
        return `<div class="web-level card proj ${s}">
          <span class="wl-ava">${ART.portrait(p.who, s === 'approved' ? 'h' : s === 'changes' ? 't' : 'n')}</span>
          <div class="wl-txt"><small>${T('Capítol {0}', [p.after])} · ${txt(p.kind)} · 💶 ${s === 'approved' && r && r.paid > 0 ? T('Cobrat: {0}', [eur(r.paid)]) : T('fins a {0}', [eur(GD.projMax(p))])}</small><b>${txt(p.title)}</b>
            <em class="pstat ${s}">${ic} ${lb}${rv && rv.grade != null && s === 'approved' ? ' · ' + T('Nota: {0}', [rv.grade]) : ''}</em></div>
          ${s === 'locked' ? `<span class="ch-s small">${T('Cap. {0}', [p.after])}</span>` : `<button class="btn ${s === 'todo' || s === 'changes' ? 'primary' : 'small'}" data-proj="${p.id}">${s === 'todo' ? T('Començar') : s === 'changes' ? T('Corregir') : T('Veure')}</button>`}
        </div>`;
      }).join('')}</div>`;
  }

  function projectScreen(id, skipIntro) {
    const p = GD.projectById(id); if (!p) return;
    rightActor = null;
    sceneShell(p.bg);
    const back = () => hubScreen('projectes');
    const s = projStatus(p), r = projRec(p.id) || {}, rv = r.review;
    const auto = rv && rv.by === 'auto';
    const ae = rv && rv.autoError && rv.autoError.v >= (r.v || 0) && s === 'sent' ? rv.autoError : null;
    const fb = (rv && rv.status && !(s === 'sent')) ? `<div class="${rv.status === 'approved' ? 'info' : 'errors'}"><b>${rv.status === 'approved' ? (auto ? T('✅ Aprovat per la correcció automàtica') : T('✅ Aprovat pel professor')) : (auto ? T('✏️ La correcció automàtica demana canvis') : T('✏️ El professor demana canvis'))}${rv.grade != null ? ' · ' + T('Nota: {0}', [rv.grade]) : ''}</b>
        ${auto ? `<p class="muted small">${T('El professor pot revisar i modificar aquesta nota i els comentaris.')}</p>` : ''}${rv.feedback ? `<p class="pre">${esc(rv.feedback)}</p>` : ''}</div>`
      : s === 'sent' ? `<div class="warn small">${ae ? `<b>${T('🤖 No s\'ha pogut fer la correcció automàtica.')}</b> ${autoErrorText(ae.reason)} ${T('El professor el revisarà igualment.')}` : T('⏳ Correcció automàtica en curs: pot trigar uns minuts. Després, el professor la pot revisar.')}</div>` : '';
    const brief = () => panel(`<div class="pn-h"><b>📋 ${txt(p.title)}</b><small>${txt(p.kind)} · ${T('Capítol {0}', [p.after])} · ${PST()[s].join(' ')}</small></div>
      ${fb}
      ${payBox(GD.projMax(p), r.paid)}
      <p><b>${T('Objectiu:')}</b> ${txt(p.goal)}</p>
      <p><b>${T('Format:')}</b> ${txt(p.format)}</p>
      <h4>${T('Què ha de contenir')}</h4>
      <ol class="req-list">${p.sections.map(x => `<li><b>${txt(x.h)}.</b> ${txt(x.d)}</li>`).join('')}</ol>
      <h4>${T('Rúbrica: com s\'avaluarà')}</h4>
      ${rubricTable(p, rv && rv.scores && !(s === 'sent') ? rv : null)}
      ${r.url ? `<p class="small">${T('La teva entrega (versió {0}):', [r.v])} <a href="${safeUrl(r.url)}" target="_blank" rel="noopener">${esc(r.url)}</a></p>` : ''}
      <div class="row-btns">
        <a class="btn primary" href="${guideUrl(p)}" target="_blank" rel="noopener">${T('📘 Guia pas a pas')}</a>
        <button class="btn" id="tpl">${T('📄 Copiar la plantilla')}</button>
        ${s === 'approved' ? '' : `<button class="btn ${s === 'sent' ? '' : 'primary'}" id="deliver">${s === 'sent' ? T('📤 Tornar a entregar') : T('📤 Entregar')}</button>`}
        ${s === 'sent' && S.classe ? `<button class="btn" id="chk">${T('🔄 Comprovar revisió')}</button>` : ''}
        <button class="btn ghost" id="back">${T('Tornar als projectes')}</button></div>`, (pn) => {
      pn.querySelector('#back').onclick = back;
      pn.querySelector('#tpl').onclick = () => textBox(T('Copia aquesta plantilla al teu document (Google Docs, Word...) i omple cada apartat:'), GD.projectTemplate(p, txt(S.agency)));
      const d = pn.querySelector('#deliver'); if (d) d.onclick = deliver;
      const c = pn.querySelector('#chk'); if (c) c.onclick = () => checkReviews(true).then(() => projectScreen(id, true));
    });
    const deliver = () => {
      if (!S.classe) {
        panel(`<div class="pn-h"><b>📤 ${T('Entrega del projecte')}</b><small>${txt(p.title)}</small></div>
          <p>${T('Per entregar projectes necessites el codi de classe del professor: és el que permet que te\'ls revisi.')}</p>
          <div class="row-btns"><button class="btn primary" data-act="setClass">${T('🏷️ Posar codi de classe')}</button><button class="btn ghost" id="b">${T('Tornar')}</button></div>`, (pn) => { pn.querySelector('#b').onclick = brief; });
        return;
      }
      panel(`<div class="pn-h"><b>📤 ${T('Entrega del projecte')}</b><small>${txt(p.title)}</small></div>
        <label class="fld">${T('Enllaç al projecte (Google Docs, Slides, Canva, Drive...)')}<input class="inp" id="pUrl" type="url" inputmode="url" placeholder="https://..." value="${esc(r.url || '')}"></label>
        <label class="fld">${T('Enllaç addicional (opcional): carpeta de peces, panell, vídeo...')}<input class="inp" id="pUrl2" type="url" inputmode="url" placeholder="https://..." value="${esc(r.url2 || '')}"></label>
        <label class="chk"><input type="checkbox" id="pShare"><span>${T('He comprovat que l\'enllaç s\'obre sense iniciar sessió («Qualsevol persona que tingui l\'enllaç pot veure»).')}</span></label>
        <p class="lbl">${T('Marca les seccions que inclou el teu projecte (han de ser-hi totes):')}</p>
        <div class="checks">${p.sections.map((x, i) => `<label class="chk"><input type="checkbox" data-sec="${i}" ${r.v ? 'checked' : ''}><span>${txt(x.h)}</span></label>`).join('')}</div>
        <label class="fld">${T('Resum de la teva proposta per al client (mínim 150 caràcters)')}<textarea class="inp" id="pSum" rows="5" maxlength="2000">${esc(r.summary || '')}</textarea></label>
        <p class="muted small" id="pCount"></p>
        ${rv && rv.status === 'changes' ? `<label class="fld">${T('Què has canviat respecte a la versió anterior?')}<textarea class="inp" id="pChg" rows="3" maxlength="1000"></textarea></label>` : ''}
        <label class="fld">${T('Eines d\'IA que has fet servir i per a què (si no n\'has fet servir, escriu «cap»)')}<input class="inp" id="pAi" maxlength="500" value="${esc(r.ai || '')}"></label>
        <div class="row-btns"><button class="btn primary" id="send">${T('Entregar al professor')}</button><button class="btn ghost" id="b">${T('Tornar a l\'encàrrec')}</button></div>`, (pn) => {
        pn.querySelector('#b').onclick = brief;
        const sum = pn.querySelector('#pSum'), cnt = () => { pn.querySelector('#pCount').textContent = T('{0} caràcters', [sum.value.trim().length]); };
        sum.oninput = cnt; cnt();
        pn.querySelector('#send').onclick = async () => {
          const norm = (u) => { u = (u || '').trim(); if (!u) return ''; if (!/^https?:\/\//i.test(u)) u = 'https://' + u; try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.hostname.includes('.') ? x.href : null; } catch (e) { return null; } };
          const url = norm(pn.querySelector('#pUrl').value), url2 = norm(pn.querySelector('#pUrl2').value);
          if (!url || url2 === null) { toast(T('Escriu un enllaç vàlid al projecte (per exemple, https://docs.google.com/...).'), 'bad'); return; }
          if (!pn.querySelector('#pShare').checked) { toast(T('Comprova que l\'enllaç és públic i marca la casella.'), 'bad'); return; }
          if ([...pn.querySelectorAll('[data-sec]')].some(c => !c.checked)) { toast(T('Al projecte hi han de ser totes les seccions. Completa\'l abans d\'entregar.'), 'bad'); return; }
          const summary = sum.value.trim();
          if (summary.length < 150) { toast(T('El resum ha de tenir almenys 150 caràcters.'), 'bad'); sum.focus(); return; }
          const ai = pn.querySelector('#pAi').value.trim();
          if (!ai) { toast(T('Indica si has fet servir eines d\'IA (o escriu «cap»).'), 'bad'); return; }
          const chg = pn.querySelector('#pChg');
          if (chg && chg.value.trim().length < 20) { toast(T('Explica què has canviat després dels comentaris del professor.'), 'bad'); chg.focus(); return; }
          const rec = Object.assign({}, r, { url, url2, summary, ai, changes: chg ? chg.value.trim() : '', at: new Date().toISOString(), v: (r.v || 0) + 1 });
          S.proj[p.id] = rec;
          if (!rec.first) rec.first = rec.at;
          save();
          const btn = pn.querySelector('#send'); btn.disabled = true; btn.textContent = T('Enviant…');
          const ok = await doSync(false);
          if (ok) requestAutograde(p.id, rec.v); else { rec.autoPending = true; save(); }
          showActors(p.who, 'h');
          playLines([[p.who + '.h', T('Rebut! Ho miraré amb calma, {nom}. T\'ho tornaré revisat.')]], () => {
            panel(`<div class="reward"><div class="rw-h"><small>${txt(p.kind)}</small><h2>📤 ${T('Projecte entregat!')}</h2></div>
              <p><a href="${safeUrl(url)}" target="_blank" rel="noopener">${esc(url)}</a></p>
              ${payBox(GD.projMax(p))}
              <p>${ok ? T('Ja pots continuar la campanya. La correcció automàtica el puntuarà en pocs minuts i el professor en revisarà la nota. Si cal millorar alguna cosa, rebràs un avís; la recompensa arriba quan s\'aprova.') : T('No s\'ha pogut enviar ara (sense connexió?). S\'enviarà automàticament quan tornis a tenir connexió; també ho pots fer des d\'Empresa → Enviar resultats ara.')}</p>
              <button class="btn primary big" data-act="hubProj">${T('Tornar als projectes')}</button></div>`);
          });
        };
      });
    };
    if (skipIntro || s === 'approved') brief(); else playLines(p.brief, brief);
  }

  function autoErrorText(reason) {
    return reason === 'private' ? T('El document és privat: obre «Compartir», tria «Qualsevol persona que tingui l\'enllaç pot veure» i torna\'l a entregar.')
      : reason === 'folder' ? T('Has entregat una carpeta: entrega l\'enllaç del document principal i posa la carpeta a l\'enllaç addicional.')
      : reason === 'ai' ? T('El servei de correcció no està disponible ara mateix.')
      : T('No se n\'ha pogut llegir el contingut (Canva, vídeo o format no compatible). Entrega també un Google Docs o un PDF.');
  }
  // Taula de la rúbrica; si hi ha revisió, marca el nivell de cada criteri i el comentari
  function rubricTable(p, rv) {
    const L = GD.rubricLevels;
    return `<div class="table-wrap"><table class="tbl rubric"><thead><tr><th>${T('Criteri')}</th>${L.map((l, i) => `<th title="${esc(l.d)}">${i} · ${esc(l.n)}</th>`).join('')}</tr></thead><tbody>
      ${p.rubric.map((c, i) => `<tr><td>${txt(c)}${rv && rv.comments && rv.comments[i] ? `<br><small class="muted">${esc(rv.comments[i])}</small>` : ''}</td>${L.map((l, k) => `<td class="${rv && rv.scores[i] === k ? 'hit' : ''}">${rv && rv.scores[i] === k ? '●' : ''}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div><p class="muted small">${L.map((l, i) => `<b>${i} ${esc(l.n)}:</b> ${esc(l.d)}`).join(' · ')} ${T('Nota = punts obtinguts ÷ punts possibles × 10. S\'aprova amb un {0}.', [GD.PASS_GRADE])}</p>`;
  }
  function requestAutograde(task, v) {
    fetch(FN + 'joc-correccio-background', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classe: S.classe, id: S.player.id, task, v }) }).catch(() => { });
  }

  let lastReviewCheck = 0;
  async function checkReviews(manual) {
    if (!S || !S.classe || !S.proj) return;
    // Mentre hi ha correccions en curs es comprova sovint; després, cada minut per si el professor canvia alguna revisió
    const waiting = GD.projects.some(p => projStatus(p) === 'sent') || GD.webLevels.some(L => webStatus(L) === 'sent'),
      delivered = GD.projects.some(p => S.proj[p.id] && S.proj[p.id].v) || GD.webLevels.some(L => { const w = webState().levels[L.n]; return w && w.v; });
    if (!manual && (!delivered || Date.now() - lastReviewCheck < (waiting ? 12000 : 60000))) return;
    lastReviewCheck = Date.now();
    let reviews;
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reviews', classe: S.classe, id: S.player.id }) });
      if (!res.ok) throw new Error('Error ' + res.status);
      reviews = (await res.json()).reviews || {};
    } catch (e) { if (manual) toast(T('No s\'han pogut comprovar les revisions. Torna-ho a provar més tard.'), 'bad'); return; }
    let changed = false;
    for (const p of GD.projects) {
      const r = S.proj[p.id], rv = reviews[p.id];
      // Si el servei d'IA ha fallat, es torna a demanar la correcció (fins a 3 vegades, cada 5 minuts)
      if (r && rv && rv.autoError && rv.autoError.reason === 'ai' && rv.autoError.v >= r.v && !rv.status && (r.aiRetry || 0) < 3 && Date.now() - (r.aiRetryAt || 0) > 300000) {
        r.aiRetry = (r.aiRetry || 0) + 1; r.aiRetryAt = Date.now(); requestAutograde(p.id, r.v); changed = true;
      }
      if (!r || !rv || (r.review && r.review.at === rv.at)) continue;
      r.review = rv; changed = true;
      if (r.paid == null) r.paid = r.rewarded ? ((p.reward && p.reward.money) || 0) : 0; // projectes aprovats abans del pagament per nota
      if (rv.status === 'approved') {
        if (!r.rewarded) {
          r.rewarded = true;
          const R = p.reward, keep = RUN; RUN = null;
          applyFx({ xp: R.xp, rep: R.rep, trust: R.trust ? { [R.trust]: 1 } : null, log: T('Projecte aprovat: «{0}».', [txt(p.title)]), key: true }, true);
          RUN = keep;
        }
        const got = settlePay(r, GD.projMax(p), rv, txt(p.title), p.id);
        toast(got ? T('✅ Projecte aprovat: {0} · nota {1} · +{2}', [txt(p.title), rv.grade != null ? rv.grade : GD.PASS_GRADE, eur(got)]) : T('✅ Projecte aprovat: {0} (+{1} EXP)', [txt(p.title), p.reward.xp]), 'good');
      } else if (rv.status === 'changes' && rv.v >= r.v) toast((rv.by === 'teacher' ? T('✏️ El professor demana canvis a «{0}» (nota {1}).', [txt(p.title), rv.grade != null ? rv.grade : '—']) : T('✏️ Cal millorar «{0}» (nota {1}).', [txt(p.title), rv.grade != null ? rv.grade : '—'])) + ' ' + T('Pots continuar jugant: corregeix-lo a 📋 Projectes.'), 'bad');
      else if (rv.autoError && rv.autoError.v >= r.v) toast(T('🤖 No s\'ha pogut corregir automàticament «{0}». Obre el projecte per veure-ne el motiu.', [txt(p.title)]), 'bad');
    }
    for (const L of GD.webLevels) {
      const r = webState().levels[L.n], rv = reviews['web-' + L.n], title = txt(L.title);
      if (r && rv && rv.autoError && rv.autoError.reason === 'ai' && rv.autoError.v >= r.v && !rv.status && (r.aiRetry || 0) < 3 && Date.now() - (r.aiRetryAt || 0) > 300000) {
        r.aiRetry = (r.aiRetry || 0) + 1; r.aiRetryAt = Date.now(); requestAutograde('web-' + L.n, r.v); changed = true;
      }
      if (!r || !rv || (r.review && r.review.at === rv.at)) continue;
      r.review = rv; changed = true;
      if (r.paid == null) r.paid = r.v ? 0 : ((L.reward && L.reward.money) || 0);
      if (rv.status === 'approved') {
        const got = settlePay(r, GD.webMax(L), rv, title, 'web-' + L.n);
        toast(got ? T('✅ Web aprovada: {0} · nota {1} · +{2}', [title, rv.grade != null ? rv.grade : GD.PASS_GRADE, eur(got)]) : T('✅ Web aprovada: {0} · nota {1}', [title, rv.grade != null ? rv.grade : GD.PASS_GRADE]), 'good');
      } else if (rv.status === 'changes' && rv.v >= r.v) toast(T('✏️ Cal millorar la web «{0}» (nota {1}).', [title, rv.grade != null ? rv.grade : '—']));
      else if (rv.autoError && rv.autoError.v >= r.v) toast(T('🤖 No s\'ha pogut corregir automàticament «{0}». Obre el projecte per veure-ne el motiu.', [title]), 'bad');
    }
    if (changed) { save(); queueSync(); if ($('.hub')) hubScreen(); }
    else if (manual) toast(T('Encara no hi ha revisions noves.'));
  }

  /* ================= Classe: rànquing i mercat entre agències ================= */
  const CAPI = FN + 'joc-classe';
  let classView = 'rank', rankSort = 'punts', classData = null, lastMarket = 0;
  async function capi(body) {
    const r = await fetch(CAPI, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ classe: S.classe, id: S.player.id }, body)) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || 'Error ' + r.status);
    return j;
  }
  const mk = () => { if (!S.market) S.market = { recsApplied: 0, seen: [], myTurn: 0 }; return S.market; };
  // Liquida els tractes acceptats, aplica les recomanacions rebudes i avisa de les ofertes noves
  async function marketSync(force) {
    if (!S || !S.classe || (!force && Date.now() - lastMarket < 25000)) return null;
    lastMarket = Date.now();
    let m;
    try { m = await capi({ action: 'market' }); } catch (e) { return null; }
    const M = mk();
    for (const o of m.offers) {
      if (!o.pendingSettle) continue;
      try {
        const r = await capi({ action: 'settle', offer: o.id });
        if (r.fx) {
          const sv = GD.serviceById(o.kind), other = o.names[o.buyer === m.me ? o.seller : o.buyer];
          const keep = RUN; RUN = null;
          applyFx(Object.assign({ fee: false, src: 'mercat', ref: o.id, log: o.buyer === m.me ? T('Va contractar «{0}» a {1} per {2}.', [sv.n, other, eur(o.price)]) : T('Va fer «{0}» per a {1} i en va cobrar {2}.', [sv.n, other, eur(o.price)]) }, r.fx), true);
          RUN = keep; M.closed = (M.closed || 0) + 1;
          toast(T('🤝 Tracte tancat amb {0}: {1}{2}', [esc(other), r.fx.money > 0 ? '+' : '', eur(r.fx.money)]), 'good');
        }
      } catch (e) { }
    }
    if (m.recsReceived > M.recsApplied) {
      const n = m.recsReceived - M.recsApplied; M.recsApplied = m.recsReceived;
      applyFx({ rep: n, log: T('Ha rebut {0} recomanació/ns d\'agències de la classe.', [n]) }, true);
      toast(T('⭐ Una agència de la classe t\'ha recomanat (+{0} reputació)', [n]), 'good');
    }
    const mine = m.offers.filter(o => o.status === 'pending' && o.turn === m.me);
    const fresh = mine.filter(o => !M.seen.includes(o.id + o.rounds));
    if (fresh.length) { toast(T('🤝 Tens {0} proposta/es de tracte per respondre (pestanya Classe).', [fresh.length]), 'good'); M.seen = M.seen.concat(fresh.map(o => o.id + o.rounds)).slice(-60); }
    M.myTurn = mine.length;
    save(); queueSync();
    if (bankrupt()) return m;
    return m;
  }

  async function tabClasse(el) {
    if (!S.classe) {
      el.innerHTML = `<div class="card"><h3>${T('🏆 Classe')}</h3><p>${T('Posa el codi de classe del professor per veure el rànquing i fer tractes amb les agències dels companys.')}</p><button class="btn primary" data-act="setClass">${T('🏷️ Posar codi de classe')}</button></div>`;
      return;
    }
    el.innerHTML = `<div class="card"><p class="muted">${T('Carregant la classe…')}</p></div>`;
    try {
      const [rk, m] = await Promise.all([capi({ action: 'ranking' }), marketSync(true)]);
      classData = { rk, m: m || { offers: [], me: rk.me } };
    } catch (e) {
      el.innerHTML = `<div class="card warn">${T('No s\'ha pogut carregar la classe: {0}. Comprova la connexió i torna-ho a provar.', [esc(e.message)])}</div>`;
      return;
    }
    drawClasse(el);
  }
  function drawClasse(el) {
    if (!el || !el.isConnected) return;
    const { rk, m } = classData, me = rk.me;
    const turn = m.offers.filter(o => o.status === 'pending' && o.turn === me).length;
    const head = `<div class="card web-head"><h3>${T('🏆 Classe {0}', [esc(S.classe)])}</h3>
      <p class="small">${T('Cada agència juga en el seu propi món, però aquí podeu comparar-vos, contractar-vos serveis, negociar preus i recomanar-vos.')}</p>
      <div class="seg cls-seg"><button data-cv="rank" class="${classView === 'rank' ? 'on' : ''}">${T('🏆 Rànquing')}</button><button data-cv="market" class="${classView === 'market' ? 'on' : ''}">${T('🤝 Mercat')}${turn ? ` <em class="dot">${turn}</em>` : ''}</button></div></div>`;
    if (classView === 'rank') {
      const sorts = [['punts', T('Global')], ['reputacio', T('Reputació')], ['liquiditat', T('Liquiditat')], ['projectes', T('Projectes')], ['nivell', T('Nivell')], ['capitols', T('Capítols')]];
      const rows = rk.rows.slice().sort((a, b) => (b[rankSort] - a[rankSort]) || (b.punts - a.punts));
      const given = rk.recsGiven || [];
      el.innerHTML = head + `<div class="card">
        <div class="seg sort-seg">${sorts.map(([k, n]) => `<button data-rs="${k}" class="${rankSort === k ? 'on' : ''}">${n}</button>`).join('')}</div>
        <p class="muted small">${T('Punts globals = capítols × 10 + projectes aprovats × 25 + webs × 10 + nivell × 5 + reputació + liquiditat (fins a 100) − fallides × 30.')}</p>
        <ol class="rank">${rows.map((r, i) => `<li class="${r.pid === me ? 'me' : ''}">
          <span class="rk-pos">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
          <span class="rk-ava">${(ART.setPlayer(r.aspecte), ART.portrait('pau', 'n', { rank: Math.min(4, Math.floor((r.etapa - 1) / 2)) }))}</span>
          <span class="rk-txt"><b>${esc(r.nom)}${r.pid === me ? ` <em>${T('(tu)')}</em>` : ''}</b><small>${esc(r.agencia)}${r.especialitat && SKILLS[r.especialitat] ? ` · ${SKILLS[r.especialitat].i} ${SKILLS[r.especialitat].n}` : ''}</small>
            <small class="rk-stats">⭐ ${r.reputacio} · 💶 ${eur(r.liquiditat)} · ${T('Nv')} ${r.nivell} · 📖 ${r.capitols} · 📋 ${r.projectes}${r.recomanacions ? ` · 👍 ${r.recomanacions}` : ''}${r.fallides ? ` · 💸 ${r.fallides}` : ''}</small></span>
          <span class="rk-score"><b>${rankSort === 'liquiditat' ? eur(r.liquiditat) : r[rankSort]}</b>
            ${r.pid === me ? '' : `<span class="rk-btns"><button class="btn small primary" data-deal="${r.pid}">🤝</button><button class="btn small" data-rec="${r.pid}" ${given.includes(r.pid) || given.length >= rk.maxRecs ? 'disabled' : ''} title="${T('Recomanar')}">${given.includes(r.pid) ? '✔' : '👍'}</button></span>`}</span>
        </li>`).join('')}</ol>
        <p class="muted small">${T('🤝 proposa un tracte · 👍 recomana una agència (+1 de reputació per a ella). Pots fer {0} recomanacions; te\'n queden {1}.', [rk.maxRecs, Math.max(0, rk.maxRecs - given.length)])}</p></div>`;
      applyPlayer();
    } else {
      const list = m.offers;
      const svc = (o) => { const s = GD.serviceById(o.kind); return s ? `${s.i} ${esc(s.n)}` : o.kind; };
      const who = (o) => esc(o.names[o.buyer === me ? o.seller : o.buyer] || '');
      const desc = (o) => o.buyer === me ? T('Contractes {0} per fer: {1}', [who(o), svc(o)]) : T('{0} et contracta per fer: {1}', [who(o), svc(o)]);
      const hist = (o) => o.history.map(h => `${h.by === me ? T('Tu') : esc((o.names[h.by] || '').split(' · ')[0])}: ${({ offer: T('proposta'), counter: T('contraoferta'), accept: T('accepta'), reject: T('rebutja'), cancel: T('anul·la') })[h.act]}${h.price ? ' ' + eur(h.price) : ''}`).join(' → ');
      const mineTurn = list.filter(o => o.status === 'pending' && o.turn === me), waiting = list.filter(o => o.status === 'pending' && o.turn !== me), closed = list.filter(o => o.status !== 'pending').slice(0, 12);
      const ST = { accepted: T('✅ Tancat'), rejected: T('❌ Rebutjat'), cancelled: T('🚫 Anul·lat'), expired: T('⌛ Caducat') };
      el.innerHTML = head + `<div class="card"><h4>${T('Com funciona')}</h4>
        <p class="small">${T('Si <b>contractes</b> una altra agència, pagues el preu i el teu client queda content: guanyes reputació (més com més especialitzada és l\'agència en aquell servei) i experiència. Si <b>et contracten</b>, cobres el preu i guanyes experiència. El preu es negocia: podeu fer contraofertes fins a quatre vegades. Els tractes caduquen en 7 dies.')}</p>
        <p class="small">${T('Per començar un tracte, ves al rànquing i prem 🤝 al costat d\'una agència.')}</p></div>
        <div class="card"><h4>${T('📥 Et toca respondre ({0})', [mineTurn.length])}</h4>
        ${mineTurn.length ? mineTurn.map(o => `<div class="deal"><b>${desc(o)}</b><div class="deal-p">${eur(o.price)}</div><small class="muted">${hist(o)}</small>
          <div class="row-btns"><button class="btn small primary" data-dr="accept" data-o="${o.id}">${T('✅ Acceptar')}</button>
          ${o.rounds < 4 ? `<input class="inp deal-in" type="number" min="50" max="5000" step="10" value="${o.price}" data-ci="${o.id}"><button class="btn small" data-dr="counter" data-o="${o.id}">${T('💬 Contraoferta')}</button>` : ''}
          <button class="btn small danger" data-dr="reject" data-o="${o.id}">${T('Rebutjar')}</button></div></div>`).join('') : `<p class="muted">${T('Cap proposta pendent.')}</p>`}</div>
        <div class="card"><h4>${T('⏳ Esperant l\'altra agència ({0})', [waiting.length])}</h4>
        ${waiting.length ? waiting.map(o => `<div class="deal"><b>${desc(o)}</b><div class="deal-p">${eur(o.price)}</div><small class="muted">${hist(o)}</small>${o.creator === me ? `<div class="row-btns"><button class="btn small ghost" data-dr="cancel" data-o="${o.id}">${T('Anul·lar')}</button></div>` : ''}</div>`).join('') : `<p class="muted">${T('Res pendent.')}</p>`}</div>
        <div class="card"><h4>${T('📁 Tractes tancats')}</h4>
        ${closed.length ? `<ul class="list">${closed.map(o => `<li><span>${desc(o)}<br><small class="muted">${hist(o)}</small></span><span>${ST[o.status] || o.status}${o.status === 'accepted' ? '<br>' + eur(o.price) : ''}</span></li>`).join('')}</ul>` : `<p class="muted">${T('Encara cap.')}</p>`}</div>`;
    }
    el.querySelectorAll('[data-cv]').forEach(b => b.onclick = () => { classView = b.dataset.cv; drawClasse(el); });
    el.querySelectorAll('[data-rs]').forEach(b => b.onclick = () => { rankSort = b.dataset.rs; drawClasse(el); });
    el.querySelectorAll('[data-deal]').forEach(b => b.onclick = () => dealModal(b.dataset.deal));
    el.querySelectorAll('[data-rec]').forEach(b => b.onclick = async () => {
      const r = classData.rk.rows.find(x => x.pid === b.dataset.rec);
      confirmBox(T('Recomanar {0}? Només en pots fer {1} en tota la partida.', [esc(r.agencia || r.nom), classData.rk.maxRecs]), async () => {
        try { await capi({ action: 'recommend', to: r.pid }); toast(T('👍 Has recomanat {0}', [esc(r.agencia)]), 'good'); tabClasse(el); } catch (e) { toast(esc(e.message), 'bad'); }
      });
    });
    el.querySelectorAll('[data-dr]').forEach(b => b.onclick = () => {
      const o = classData.m.offers.find(x => x.id === b.dataset.o), d = b.dataset.dr;
      const go = async () => {
        try {
          if (d === 'cancel') await capi({ action: 'cancel', offer: o.id });
          else await capi({ action: 'respond', offer: o.id, decision: d, price: d === 'counter' ? +el.querySelector(`[data-ci="${o.id}"]`).value : undefined });
          toast(d === 'accept' ? T('🤝 Tracte acceptat!') : d === 'counter' ? T('💬 Contraoferta enviada') : d === 'reject' ? T('Tracte rebutjat') : T('Tracte anul·lat'), 'good');
          await marketSync(true); tabClasse(el);
        } catch (e) { toast(esc(e.message), 'bad'); }
      };
      if (d === 'accept' && o.buyer === classData.m.me) confirmBox(T('Acceptar i pagar {0}? Tens {1} de liquiditat.', [eur(o.price), eur(S.money)]), go); else go();
    });
  }
  function dealModal(pid) {
    const r = classData.rk.rows.find(x => x.pid === pid); if (!r) return;
    const d = document.createElement('div'); d.className = 'modal';
    const lvl = (k) => (r.habilitats || {})[k] || 0;
    d.innerHTML = `<div class="modal-box"><h3 style="margin-top:0">🤝 ${T('Tracte amb {0}', [esc(r.agencia || r.nom)])}</h3>
      <div class="seg"><button data-role="buy" class="on">${T('Vull contractar-los')}</button><button data-role="sell">${T('Els ofereixo un servei')}</button></div>
      <label class="fld">${T('Servei')}<select class="inp" id="dk">${GD.services.map(s => `<option value="${s.id}">${s.i} ${esc(s.n)}</option>`).join('')}</select></label>
      <p class="small" id="dq"></p>
      <label class="fld">${T('Preu proposat (€)')}<input class="inp" id="dp" type="number" min="50" max="5000" step="10"></label>
      <p class="muted small">${T('L\'altra agència podrà acceptar, rebutjar o fer-te una contraoferta.')}</p>
      <div class="row-btns"><button class="btn primary" id="ds">${T('Enviar la proposta')}</button><button class="btn ghost" id="dc">${T('Cancel·lar')}</button></div></div>`;
    document.body.appendChild(d);
    let role = 'buy';
    const upd = () => {
      const s = GD.serviceById(d.querySelector('#dk').value), sk2 = SKILLS[s.skill];
      d.querySelector('#dq').innerHTML = role === 'buy'
        ? T('Especialitat de l\'agència en aquest servei: {0} {1} nivell {2}. Com més alta, més reputació guanyaràs.', [sk2.i, sk2.n, lvl(s.skill)])
        : T('La teva habilitat en aquest servei: {0} {1} nivell {2}. Si et contracten, cobraràs el preu acordat.', [sk2.i, sk2.n, skLvl(s.skill)]);
      if (!d.querySelector('#dp').dataset.touched) d.querySelector('#dp').value = s.sug;
    };
    d.querySelectorAll('[data-role]').forEach(b => b.onclick = () => { role = b.dataset.role; d.querySelectorAll('[data-role]').forEach(x => x.classList.toggle('on', x === b)); upd(); });
    d.querySelector('#dk').onchange = upd; d.querySelector('#dp').oninput = (e) => { e.target.dataset.touched = 1; };
    d.querySelector('#dc').onclick = () => d.remove();
    d.querySelector('#ds').onclick = async () => {
      try {
        await capi({ action: 'offer', to: pid, role, kind: d.querySelector('#dk').value, price: +d.querySelector('#dp').value });
        d.remove(); toast(T('🤝 Proposta enviada a {0}', [esc(r.agencia)]), 'good'); classView = 'market'; hubScreen('classe');
      } catch (e) { toast(esc(e.message), 'bad'); }
    };
    upd();
  }

  function tabGigs(el) {
    if (!S.gigs || !S.gigs.length) genGigs();
    if (!S.gigs.length) {
      const left = GD.gigs.some(g => !(S.gigsDone || {})[g.id]);
      el.innerHTML = `<div class="card"><p>${left ? T("Ara no hi ha més encàrrecs disponibles. N'arribaran de nous quan avancis a la campanya.") : T("Has fet tots els encàrrecs lliures. Bona feina!")}</p></div>`;
      return;
    }
    el.innerHTML = `<p class="muted">${T("Petits encàrrecs que arriben per recomanacions. Cada encàrrec dura una setmana, et fa guanyar experiència i diners, i posa a prova el que has après.")}</p>
      <div class="gigs">${S.gigs.map((g, i) => {
        const t = GD.gigs.find(x => x.id === g.id);
        return `<div class="gig card"><span class="gig-ava">${ART.portrait(t.who || 'client', 'n')}</span><div><b>${esc(t.title)}</b><p>${esc(t.intro)}</p><small>💶 ${eur(g.pay)} · ✨ ${g.xp} ${T("EXP · 1 setmana")}</small></div><button class="btn primary" data-gig="${i}">${T("Acceptar")}</button></div>`;
      }).join('')}</div>
      ${gigPool().length > S.gigs.length ? `<button class="btn ghost small" data-act="refreshGigs">${T("↻ Buscar altres encàrrecs (−1 setmana)")}</button>` : ''}`;
  }

  function playGig(i) {
    const g = S.gigs[i]; const t = GD.gigs.find(x => x.id === g.id);
    sceneShell(t.bg || 'despatx');
    showActors(t.who || 'client', 'n');
    const learned = Object.keys(S.lessons);
    const qPool = [];
    learned.forEach(id => GD.lessons[id].quiz.forEach(q => qPool.push({ id, q })));
    const extra = qPool.length ? qPool[Math.floor(Math.random() * qPool.length)] : null;
    panel(`<div class="pn-h"><b>${esc(t.title)}</b><small>${T("Encàrrec")}</small></div><p>${esc(t.problem)}</p>
      <div class="opts">${t.opts.map((o, k) => `<button class="opt" data-k="${k}"><b>${esc(o.t)}</b></button>`).join('')}</div>`, (root) => {
      root.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const o = t.opts[+b.dataset.k];
        const ok = o.q >= 0.7;
        const mult = o.q >= 0.7 ? 1 : o.q >= 0.4 ? 0.5 : 0;
        const finish = (bonus) => {
          const money = o.q < 0.4 ? -Math.round(g.pay * 0.4) : Math.round(g.pay * mult * (1 + upBonus('gig') / 100));
          const xp = Math.round(g.xp * mult * bonus);
          applyFx({ money, fee: money > 0, src: 'gig', ref: g.id, xp, rep: ok ? 1 : (o.q < 0.4 ? -2 : 0), know: { [t.area]: ok ? 1 : 0 }, log: money < 0 ? T('Encàrrec mal resolt: «{0}». Va haver de retornar {1}.', [t.title, eur(-money)]) : null }, true);
          const w = advanceWeeks(1);
          S.stats.gigs++; queueSync();
          (S.gigsDone = S.gigsDone || {})[g.id] = 1;
          S.gigs.splice(i, 1);
          save();
          panel(`<div class="pn-h"><b>${ok ? T('✨ Bona feina!') : o.q >= 0.4 ? T('🙂 Correcte, però millorable') : T('😓 No ha funcionat')}</b></div>
            <p>${esc(o.r)}</p>
            <dl class="kv">${money < 0 ? `<dt>${T("Devolució al client")}</dt><dd class="neg">−${eur(-money)}</dd>` : `<dt>${T("Honoraris cobrats")}</dt><dd>${eur(money * (1 + 0.05 * sk('comercial')))}</dd>`}<dt>${T("Experiència")}</dt><dd>+${xp} ${T("EXP")}</dd><dt>${T("Balanç de la setmana")}</dt><dd>+${eur(w.inc)} / −${eur(w.cost)}</dd></dl>
            <button class="btn primary" data-act="hubGigs">${T("Tornar al despatx")}</button>`);
          if (bankrupt()) return;
        };
        if (extra) {
          const q = extra.q;
          panel(`<div class="pn-h"><b>${T("Pregunta del client")}</b><small>${T("Repàs:")} ${esc(GD.lessons[extra.id].title)}</small></div><p>${esc(t.opts[+b.dataset.k].t)} ${T("— d'acord. Però abans, una pregunta:")}</p><p class="quiz-q">${esc(q.q)}</p>
            <div class="opts">${shuffledIdx(q.o.length).map(k => `<button class="opt" data-a="${k}">${q.o[k]}</button>`).join('')}</div>`, (r2) => {
            r2.querySelectorAll('[data-a]').forEach(bb => bb.onclick = () => {
              const right = +bb.dataset.a === q.c;
              const cost = right ? 0 : payStudy(GD.lessons[extra.id].title);
              toast(right ? T('✔ Resposta correcta: +50% EXP') : '✘ −' + eur(cost) + ' · ' + q.why, right ? 'good' : 'bad');
              finish(right ? 1.5 : 1);
            });
          });
        } else finish(1);
      });
    });
  }

  /* ================= Escenes ================= */
  let curCh = null;

  function sceneShell(bg) {
    app().innerHTML = `
      <header id="hud"></header>
      <section class="scene">
        <div class="bg" id="bg">${ART.background(bg)}</div>
        <div class="actors"><div class="actor left" id="actL"></div><div class="actor right" id="actR"></div></div>
        <div class="dlg" id="dlg" hidden><div class="dlg-name" id="dlgName"></div><div class="dlg-text" id="dlgText"></div><div class="dlg-next">▼</div></div>
        <div class="panel-wrap" id="panelWrap" hidden><div class="panel" id="panel"></div></div>
        <button class="scene-menu" data-act="sceneMenu" aria-label="Menú">☰</button>
      </section>`;
    hud();
  }
  function setBg(bg) { if (S && S.cur && bg) S.cur.bg = bg; const b = $('#bg'); if (b && bg && b.dataset.bg !== bg) { b.dataset.bg = bg; b.innerHTML = ART.background(bg); b.classList.remove('fade'); void b.offsetWidth; b.classList.add('fade'); } }

  let rightActor = null;
  function showActors(who, e) {
    const L = $('#actL'), R = $('#actR');
    if (!L) return;
    if (who === 'pau') {
      L.innerHTML = ART.portrait('pau', e, { rank: rank() }); L.className = 'actor left on';
      if (R.innerHTML) R.className = 'actor right dim';
    } else if (who) {
      if (rightActor !== who + e) { R.innerHTML = ART.portrait(who, e); rightActor = who + e; }
      R.className = 'actor right on';
      L.className = L.innerHTML ? 'actor left dim' : 'actor left';
    } else {
      L.className = L.innerHTML ? 'actor left dim' : 'actor left'; R.className = R.innerHTML ? 'actor right dim' : 'actor right';
    }
  }
  function clearRight() { const R = $('#actR'); if (R) { R.innerHTML = ''; R.className = 'actor right'; rightActor = null; } }

  function panel(html, bind) {
    const w = $('#panelWrap'), p = $('#panel');
    $('#dlg').hidden = true;
    p.innerHTML = html; w.hidden = false; p.scrollTop = 0;
    if (bind) bind(p);
  }
  function hidePanel() { const w = $('#panelWrap'); if (w) w.hidden = true; }

  // Diàleg amb efecte de màquina d'escriure
  function playLines(lines, done) {
    if (typeof lines === 'function') lines = lines(S, H);
    lines = (lines || []).filter(Boolean);
    hidePanel();
    let i = 0;
    const dlg = $('#dlg'), name = $('#dlgName'), text = $('#dlgText');
    let typing = null, full = '';
    function show() {
      if (i >= lines.length) { dlg.onclick = null; dlg.hidden = true; done(); return; }
      let [who, t] = lines[i];
      if (typeof who === 'function') who = who(S, H);
      let [c, e] = String(who || '').split('.');
      if (c === 'clear') { clearRight(); i++; show(); return; }
      if (c === 'bg') { setBg(t); i++; show(); return; }
      dlg.hidden = false;
      dlg.className = 'dlg ' + (c ? (c === 'pau' ? 'from-left' : 'from-right') : 'narrator');
      name.innerHTML = c ? txt(GD.names[c] || c) : '';
      name.hidden = !c;
      showActors(c, e || 'n');
      full = txt(t);
      text.innerHTML = '';
      let k = 0;
      clearInterval(typing);
      const plain = full;
      if (settings.speed <= 0) { text.innerHTML = plain; typing = null; return; }
      typing = setInterval(() => {
        k += 2;
        text.innerHTML = plain.slice(0, k).replace(/<[^>]*$/, '');
        if (k >= plain.length) { clearInterval(typing); typing = null; text.innerHTML = plain; }
      }, settings.speed);
    }
    dlg.onclick = () => {
      if (typing) { clearInterval(typing); typing = null; text.innerHTML = full; return; }
      i++; show();
    };
    show();
  }

  function startChapter(chId, resume) {
    const ch = GD.chapters[chId];
    curCh = ch;
    if (!resume || !S.cur || S.cur.id !== chId) S.cur = { id: chId, step: 0, run: null, cache: {} };
    if (S.done[chId] && !resume) S.cur.replay = true;
    runInit();
    rightActor = null;
    sceneShell((resume && S.cur.bg) || ch.bg || 'despatx');
    if (S.cur.step === 0) {
      // Targeta de títol del capítol
      const st = GD.stages.find(s => s.id === ch.stage);
      panel(`<div class="chapter-card" style="--sc:${st.color}"><small>${T("Etapa")} ${st.id} · ${txt(st.title)}</small><h2><span>${T("Capítol")} ${ch.id}</span>${txt(ch.title)}</h2>${ch.blurb ? `<p>${txt(ch.blurb)}</p>` : ''}<button class="btn primary big" id="go">${T("Començar ▶")}</button></div>`, (p) => {
        p.querySelector('#go').onclick = () => runStep();
      });
      $('#panelWrap').classList.add('center');
    } else runStep();
  }

  function nextStep(label) {
    const steps = curCh.steps;
    if (label) {
      const idx = steps.findIndex(s => s.label === label);
      S.cur.step = idx >= 0 ? idx : S.cur.step + 1;
    } else S.cur.step++;
    save();
    runStep();
  }

  function runStep() {
    const w = $('#panelWrap'); if (w) w.classList.remove('center');
    const steps = curCh.steps;
    while (S.cur.step < steps.length && steps[S.cur.step].when && !steps[S.cur.step].when(S, H)) S.cur.step++;
    if (S.cur.step >= steps.length) return finishChapter();
    const st = steps[S.cur.step];
    if (st.bg) setBg(st.bg);
    const h = STEP[st.t];
    if (!h) { console.warn(T('Pas desconegut'), st); return nextStep(); }
    h(st);
  }

  function reqOk(r) {
    if (!r) return true;
    if (typeof r === 'function') return r(S, H);
    if (r.skill) return sk(r.skill) >= r.min;
    if (r.flag) return !!S.f[r.flag];
    if (r.money) return S.money >= r.money;
    return true;
  }
  function reqLabel(r) {
    if (!r) return '';
    if (r.label) return r.label;
    if (r.skill) return T("Requereix {0} {1}", [SKILLS[r.skill].n, r.min]);
    if (r.money) return T("Requereix {0}", [eur(r.money)]);
    return T('No disponible');
  }

  const STEP = {
    dlg(st) { playLines(st.lines, () => nextStep(st.go)); },
    fx(st) { applyFx(st.fx, st.silent); nextStep(st.go); },
    go(st) { nextStep(st.to); },

    input(st) {
      panel(`<div class="pn-h"><b>${txt(st.prompt)}</b></div>${st.help ? `<p class="muted">${txt(st.help)}</p>` : ''}
        <input class="inp" id="inp" maxlength="${st.max || 28}" value="${esc(S[st.key] || st.def || '')}" />
        <div class="sugg">${(st.sugg || []).map(s => `<button class="chipbtn">${esc(s)}</button>`).join('')}</div>
        <button class="btn primary" id="ok">${T("Confirmar")}</button>`, (p) => {
        const inp = p.querySelector('#inp');
        p.querySelectorAll('.chipbtn').forEach(b => b.onclick = () => { inp.value = b.textContent; });
        p.querySelector('#ok').onclick = () => {
          const v = inp.value.trim(); if (!v) { inp.focus(); return; }
          S[st.key] = v; hud(); nextStep();
        };
      });
    },

    choice(st) {
      const opts = (typeof st.opts === 'function' ? st.opts(S, H) : st.opts).filter(o => !o.hide || !o.hide(S, H));
      if (st.who) showActors(st.who.split('.')[0], st.who.split('.')[1] || 'n');
      panel(`<div class="pn-h"><b>${txt(st.prompt)}</b>${st.sub ? `<small>${txt(st.sub)}</small>` : ''}</div>
        ${st.info ? `<div class="info">${txt(st.info)}</div>` : ''}
        <div class="opts">${opts.map((o, i) => {
          const ok = reqOk(o.req);
          return `<button class="opt ${ok ? '' : 'locked'}" data-i="${i}" ${ok ? '' : 'disabled'}><b>${txt(o.t)}</b>${o.d ? `<small>${txt(o.d)}</small>` : ''}${ok ? '' : `<em>🔒 ${reqLabel(o.req)}</em>`}${o.req && ok && o.req.skill ? `<em class="perk">${SKILLS[o.req.skill].i} ${SKILLS[o.req.skill].n}</em>` : ''}</button>`;
        }).join('')}</div>`, (p) => {
        p.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          const o = opts[+b.dataset.i];
          if (st.key) S.f[st.key] = o.v != null ? o.v : +b.dataset.i;
          // Qualitat de les decisions de les missions del temari (per al professorat)
          if (o.q != null && st.key) (S.choiceLog || (S.choiceLog = {}))[st.key] = { q: o.q, ch: curCh.id, i: +b.dataset.i };
          applyFx(o.fx);
          save();
          if (o.say) playLines(o.say, () => nextStep(o.go || st.go)); else nextStep(o.go || st.go);
        });
      });
    },

    invest(st) {
      const key = 'inv_' + S.cur.step;
      const used = S.cur.cache[key] = S.cur.cache[key] || [];
      const left = st.time - used.reduce((a, i) => a + (st.opts[i].cost || 1), 0);
      const known = (o) => o.flag && S.f['wclue_' + o.flag];
      if (st.who) showActors(st.who, 'n');
      panel(`<div class="pn-h"><b>${txt(st.prompt)}</b><small>${T("⏳ Temps disponible:")} ${'●'.repeat(Math.max(0, left))}${'○'.repeat(Math.max(0, st.time - left))}</small></div>
        ${st.info ? `<p class="muted">${txt(st.info)}</p>` : ''}
        <div class="opts">${st.opts.map((o, i) => {
          const kn = known(o) && !used.includes(i);
          const done = used.includes(i) || kn; const ok = reqOk(o.req); const can = !done && ok && (o.cost || 1) <= left;
          return `<button class="opt ${done ? 'done' : ''} ${ok ? '' : 'locked'}" data-i="${i}" ${can ? '' : 'disabled'}><b>${done ? '✔ ' : '🔍 '}${txt(o.t)}</b>${done && o.note ? `<small>${txt(o.note)}</small>` : ''}${kn ? `<em class="perk">🗺️ ${T('Ho vas descobrir explorant: no et costa temps')}</em>` : ''}${!ok ? `<em>🔒 ${reqLabel(o.req)}</em>` : ''}</button>`;
        }).join('')}</div>
        <button class="btn primary" id="enough">${left > 0 ? T('Ja en tinc prou') : T('Continuar')}</button>`, (p) => {
        p.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          const i = +b.dataset.i, o = st.opts[i];
          used.push(i);
          if (o.flag) S.f[o.flag] = true;
          applyFx(o.fx, true);
          save();
          playLines(o.a, () => STEP.invest(st));
        });
        p.querySelector('#enough').onclick = () => { S.f[(st.key || key) + '_n'] = used.length; nextStep(); };
      });
    },

    lesson(st) { lessonFlow(st.id, true, () => nextStep()); },

    budget(st) {
      const alloc = Object.fromEntries(st.items.map(it => [it.id, 0]));
      const stepv = st.step || 50;
      const draw = (p) => {
        const used = Object.values(alloc).reduce((a, b) => a + b, 0);
        p.innerHTML = `<div class="pn-h"><b>${txt(st.prompt)}</b><small>${T("Pressupost:")} ${eur(st.total)} ${T("· Per assignar:")} <b class="${used > st.total ? 'neg' : ''}">${eur(st.total - used)}</b></small></div>
          ${st.info ? `<p class="muted">${txt(st.info)}</p>` : ''}
          <div class="budget">${st.items.map(it => `<div class="bud"><div><b>${txt(it.t)}</b><small>${txt(it.d || '')}</small></div>
            <div class="bud-ctl"><button class="rb" data-m="${it.id}">−</button><span>${eur(alloc[it.id])}</span><button class="rb" data-p="${it.id}">+</button></div></div>`).join('')}</div>
          <button class="btn primary" id="ok" ${used === st.total || (st.allowLeft && used <= st.total) ? '' : 'disabled'}>${used === st.total || st.allowLeft ? T('Confirmar repartiment') : T('Has d\'assignar tot el pressupost')}</button>`;
        p.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { alloc[b.dataset.m] = Math.max(0, alloc[b.dataset.m] - stepv); draw(p); });
        p.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { if (used + stepv <= st.total) { alloc[b.dataset.p] += stepv; draw(p); } });
        p.querySelector('#ok').onclick = () => { S.f[st.key] = Object.assign({}, alloc); applyFx(st.fx); save(); nextStep(); };
      };
      panel('', draw);
    },

    multi(st) {
      const sel = new Set();
      const draw = (p) => {
        p.innerHTML = `<div class="pn-h"><b>${txt(st.prompt)}</b><small>${T("Tria'n")} ${st.pick} ${T("· Seleccionades:")} ${sel.size}</small></div>
          ${st.info ? `<div class="info">${txt(st.info)}</div>` : ''}
          <div class="opts multi">${st.opts.map((o, i) => `<button class="opt ${sel.has(i) ? 'sel' : ''}" data-i="${i}"><b>${sel.has(i) ? '☑' : '☐'} ${txt(o.t)}</b></button>`).join('')}</div>
          <button class="btn primary" id="ok" ${sel.size === st.pick ? '' : 'disabled'}>${T("Confirmar")}</button>`;
        p.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          const i = +b.dataset.i;
          if (sel.has(i)) sel.delete(i); else if (sel.size < st.pick) sel.add(i);
          draw(p);
        });
        p.querySelector('#ok').onclick = () => {
          const chosen = [...sel];
          const good = chosen.filter(i => st.opts[i].ok).length;
          const maxGood = Math.min(st.pick, st.opts.filter(o => o.ok).length);
          S.f[st.key] = { chosen, good, max: maxGood, ids: chosen.map(i => st.opts[i].id).filter(Boolean) };
          if (st.fx) applyFx(st.fx(S, good, maxGood));
          save();
          // Retroacció de cada opció
          p.innerHTML = `<div class="pn-h"><b>${good === maxGood ? T('✨ Perfecte!') : good >= maxGood / 2 ? T('🙂 Força bé') : T('🤔 Cal repassar-ho')}</b><small>${good} de ${maxGood} encerts</small></div>
            <ul class="feedback">${st.opts.map((o, i) => `<li class="${o.ok ? 'ok' : 'ko'} ${sel.has(i) ? 'picked' : ''}"><b>${sel.has(i) ? '☑' : '☐'} ${txt(o.t)}</b><small>${o.ok ? '✔' : '✘'} ${txt(o.why || '')}</small></li>`).join('')}</ul>
            <button class="btn primary" id="cont">${T("Continuar")}</button>`;
          p.querySelector('#cont').onclick = () => nextStep();
        };
      };
      panel('', draw);
    },

    sim(st) {
      const key = 'sim_' + S.cur.step;
      let r = S.cur.cache[key];
      if (!r) {
        r = st.calc(S, H); S.cur.cache[key] = r; applyFx(r.fx); S.stats.campaigns++; if (r.verdict === 'good') S.stats.good++;
        // Una campanya fallida es paga: el client demana una compensació
        if (r.verdict === 'bad') { r.penalty = 150 + 150 * curCh.stage; applyFx({ money: -r.penalty, log: T('Campanya fallida al capítol {0}: compensació de {1} al client.', [curCh.id, eur(r.penalty)]) }, true); }
        save();
      }
      const vcls = { good: 'good', mid: 'mid', bad: 'bad' }[r.verdict] || 'mid';
      panel(`<div class="pn-h"><b>📈 ${txt(r.title || T('Resultats'))}</b><small>${T("Resultats simulats")}</small></div>
        ${r.intro ? `<p>${txt(r.intro)}</p>` : ''}
        <div class="metrics">${(r.metrics || []).map(([l, v, cls]) => `<div class="metric ${cls || ''}"><small>${l}</small><b data-count>${v}</b></div>`).join('')}</div>
        ${r.chart ? chart(r.chart) : ''}
        <div class="verdict ${vcls}">${txt(r.summary || '')}</div>
        ${r.penalty ? `<div class="errors"><b>💸 ${T('Compensació al client: −{0}', [eur(r.penalty)])}</b><p>${T('Quan una campanya fracassa per errors de l\'agència, el client no la paga sencera. Aquests diners surten de la teva liquiditat.')}</p></div>` : ''}
        <h4>${T("Per què ha passat?")}</h4>
        <ul class="factors">${(r.factors || []).map(([g, t]) => `<li class="${g === true ? 'ok' : g === false ? 'ko' : 'neu'}">${g === true ? '▲' : g === false ? '▼' : '●'} ${txt(t)}</li>`).join('')}</ul>
        <button class="btn primary" id="cont">${T("Continuar")}</button>`, (p) => {
        p.querySelector('#cont').onclick = () => nextStep(r.go);
      });
    },

    reward(st) { finishChapter(st); },

    report() { reportScreen(() => nextStep()); },
    ending(st) {
      const id = GD.computeEnding(S, H);
      S.ending = id; S.done[curCh.id] = true; S.cur = null; queueSync();
      S.history.push({ ch: curCh.id, week: S.week, t: T('Final aconseguit: ') + GD.endings[id].title, key: true });
      save(); endingScreen(id, true);
    }
  };

  function chart(c) {
    // Gràfic de barres senzill: {labels:[], series:[{name, values:[], cls}]}
    const max = Math.max(1, ...c.series.flatMap(s => s.values));
    return `<div class="chart"><div class="chart-bars">${c.labels.map((l, i) => `<div class="cb"><div class="cb-col">${c.series.map(s => `<i class="${s.cls || ''}" style="height:${Math.round(s.values[i] / max * 100)}%" title="${s.name}: ${s.values[i]}"></i>`).join('')}</div><small>${l}</small></div>`).join('')}</div>
      <div class="chart-leg">${c.series.map(s => `<span><i class="${s.cls || ''}"></i>${s.name}</span>`).join('')}</div></div>`;
  }

  /* ================= Lliçons ================= */
  function lessonFlow(id, inMission, done) {
    const l = GD.lessons[id];
    if (!l) { done(); return; }
    const first = !S.lessons[id];
    const page = () => panel(`<div class="lesson">
        <div class="ls-h"><small>${T("📚 Lliçó ·")} ${GD.areas[l.area]}</small><h2>${esc(l.title)}</h2><p class="goal">🎯 ${esc(l.goal)}</p></div>
        ${l.body.map(b => `<p>${txt(b)}</p>`).join('')}
        ${l.example ? `<div class="example"><b>${l.exampleTitle || T('Exemple (cas simulat)')}</b><p>${txt(l.example)}</p></div>` : ''}
        ${l.errors ? `<div class="errors"><b>${T("⚠️ Errors freqüents")}</b><ul>${l.errors.map(e => `<li>${e}</li>`).join('')}</ul></div>` : ''}
        ${l.source ? `<p class="source">${T("Font:")} ${l.source}</p>` : ''}
        <p class="study-cost">${T("💸 Cada resposta incorrecta et costarà {0}: tornar a estudiar també és temps i diners.", [eur(studyCost())])}</p>
        <button class="btn primary" id="quiz">${T("Fer l'exercici ✍️")}</button>
        ${!inMission ? T('<button class="btn ghost" id="back">Tornar a la biblioteca</button>') : ''}
      </div>`, (p) => {
      p.querySelector('#quiz').onclick = () => quiz(0, 0);
      const b = p.querySelector('#back'); if (b) b.onclick = done;
    });
    const quiz = (qi, score) => {
      if (qi >= l.quiz.length) {
        const pass = score >= Math.ceil(l.quiz.length / 2);
        const prev = S.lessons[id];
        // Registre per al professor: primer intent, millor resultat i nombre d'intents
        const ql = S.quizLog[id] || (S.quizLog[id] = { first: score, best: 0, tries: 0, total: l.quiz.length });
        ql.tries++; ql.best = Math.max(ql.best, score);
        queueSync();
        if (pass || !inMission) {
          S.lessons[id] = { best: Math.max(prev ? prev.best : 0, score), tries: (prev ? prev.tries : 0) + 1 };
          if (pass && first) applyFx({ xp: 20 + 15 * score, know: { [l.area]: 1 } }, true);
          save();
        }
        panel(`<div class="pn-h"><b>${score === l.quiz.length ? T('🌸 Perfecte!') : pass ? T('✔ Superat') : T('✘ Encara no')}</b><small>${score} de ${l.quiz.length} ${T("respostes correctes")}</small></div>
          ${pass && first ? `<p class="good-t">+${20 + 15 * score} ${T("EXP · +1 coneixement en")} ${GD.areas[l.area]}</p>` : ''}
          ${!pass && inMission ? T('<p>Necessites encertar almenys la meitat de les preguntes per aplicar-ho a la missió. Repassa la lliçó i torna-ho a provar.</p>') : ''}
          <div class="row-btns">${!pass && inMission ? T('<button class="btn primary" id="retry">Repassar la lliçó</button>') : T('<button class="btn primary" id="cont">Continuar</button>')}</div>`, (p) => {
          const r = p.querySelector('#retry'); if (r) r.onclick = page;
          const c = p.querySelector('#cont'); if (c) c.onclick = done;
        });
        return;
      }
      const q = l.quiz[qi];
      panel(`<div class="pn-h"><b>${T("Exercici")} ${qi + 1}/${l.quiz.length}</b><small>${esc(l.title)}</small></div>
        <p class="quiz-q">${q.q}</p>
        <div class="opts">${shuffledIdx(q.o.length).map(i => `<button class="opt" data-i="${i}">${q.o[i]}</button>`).join('')}</div>`, (p) => {
        p.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          const ok = +b.dataset.i === q.c;
          p.querySelectorAll('.opt').forEach(bb => { bb.disabled = true; if (+bb.dataset.i === q.c) bb.classList.add('right'); });
          if (!ok) b.classList.add('wrong');
          const cost = ok ? 0 : payStudy(l.title);
          if (!ok) hud();
          const fb = document.createElement('div');
          fb.className = 'quiz-fb ' + (ok ? 'ok' : 'ko');
          fb.innerHTML = `<b>${ok ? T('✔ Correcte') : T('✘ Incorrecte · −{0}', [eur(cost)])}</b><p>${q.why}</p><button class="btn primary">${T("Següent")}</button>`;
          p.appendChild(fb);
          fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          fb.querySelector('button').onclick = () => { if (!ok && bankrupt()) return; quiz(qi + 1, score + (ok ? 1 : 0)); };
        });
      });
    };
    page();
  }

  /* ================= Final de capítol ================= */
  function finishChapter(st) {
    st = st || {};
    const ch = curCh;
    const replay = S.cur && S.cur.replay;
    if (!replay) {
      const val = (v) => typeof v === 'function' ? v(S, H) : v;
      const xp = st.xp != null ? val(st.xp) : (ch.xp != null ? ch.xp : 110 + 60 * ch.stage);
      applyFx({ xp, money: val(st.money), fee: true, src: 'chapter', ref: ch.id, rep: val(st.rep), flags: st.flags }, true);
      if (st.fx) applyFx(st.fx, true);
    }
    const w = replay ? { inc: 0, cost: 0, n: 0 } : advanceWeeks(ch.weeks != null ? ch.weeks : 2);
    const wasDone = S.done[ch.id];
    S.done[ch.id] = true;
    const run = RUN || { xp: 0, money: 0, rep: 0, trust: {}, know: {} };
    const stage = GD.stages.find(s => s.id === ch.stage);
    const stageComplete = !wasDone && stage.chapters.every(c => S.done[c]);
    S.cur = null;
    queueSync();
    S.gigs = []; // nous encàrrecs disponibles
    save();
    const summary = st.text ? txt(st.text) : '';
    if (bankrupt()) return;
    const lowCash = S.money + S.reserve < weeklyCost() * 4;
    sceneShell(ch.bg || 'despatx');
    showActors('pau', 'h');
    panel(`<div class="reward">
        <div class="rw-h"><small>${T("Capítol")} ${ch.id} completat</small><h2>${txt(ch.title)}</h2></div>
        ${summary ? `<p>${summary}</p>` : ''}
        ${replay ? T('<p class="muted">Mode repàs: aquesta partida ja tenia el capítol completat, no es tornen a sumar recompenses.</p>') : `
        <div class="metrics">
          <div class="metric good"><small>${T("Experiència")}</small><b>+${run.xp}</b></div>
          <div class="metric ${run.money < 0 ? 'bad' : ''}"><small>${T("Diners del capítol")}</small><b>${run.money >= 0 ? '+' : ''}${eur(run.money)}</b></div>
          <div class="metric ${run.rep < 0 ? 'bad' : 'good'}"><small>${T("Reputació")}</small><b>${run.rep >= 0 ? '+' : ''}${run.rep}</b></div>
          <div class="metric"><small>${w.n} ${T("setmanes de despeses i quotes")}</small><b>${w.inc - w.cost >= 0 ? '+' : ''}${eur(w.inc - w.cost)}</b></div>
        </div>
        ${Object.keys(run.trust).length ? `<p class="trustline">${Object.entries(run.trust).map(([k, v]) => `<span class="${v >= 0 ? 'pos' : 'neg'}">${GD.names[k]} ${v >= 0 ? '♥ +' + v : '💔 ' + v}</span>`).join('')}</p>` : ''}`}
        ${(() => { const pj = !replay && GD.projectAfter(ch.id); return pj && projStatus(pj) !== 'approved' ? `<div class="stage-clear proj-new" style="--sc:#7a8cff"><b>📋 ${T('Nou projecte real:')} ${txt(pj.title)}</b><p>${T('Per jugar el capítol següent l\'has de fer de veritat, entregar-lo i el professor l\'ha d\'aprovar.')}</p><button class="btn" data-proj="${pj.id}">${T('Veure l\'encàrrec')}</button></div>` : ''; })()}
        ${lowCash && !replay ? `<div class="errors"><b>${T('⚠️ Liquiditat baixa')}</b><p>${T('Tens menys diners que les despeses d\'un mes ({0}). Si arribes a zero, l\'agència farà fallida i hauràs de començar de nou.', [eur(weeklyCost() * 4)])}</p></div>` : ''}
        ${stageComplete ? `<div class="stage-clear" style="--sc:${stage.color}"><b>${T("🌸 Etapa")} ${stage.id} ${T("superada!")}</b><p>${txt(stage.outro || '')}</p><p>${T("Nou rang:")} <b>${title()}</b></p></div>` : ''}
        <button class="btn primary big" data-act="hub">${T('🗺️ Tornar a Vic')}</button>
      </div>`);
    if (stageComplete) petals($('.scene'), 30);
    hud();
  }

  /* ================= Informe final i finals ================= */
  function reportScreen(done) {
    const t = S.trust;
    const best = Object.entries(S.know).sort((a, b) => b[1] - a[1]).slice(0, 3).filter(x => x[1] > 0).map(x => GD.areas[x[0]]);
    const keys = S.history.filter(h => h.key).slice(-8);
    panel(`<div class="report">
      <div class="ls-h"><small>${T("Capítol 8.1")}</small><h2>${T("Informe de tota una carrera")}</h2></div>
      <div class="metrics">
        <div class="metric"><small>${T("Ingressos acumulats")}</small><b>${eur(S.stats.income)}</b></div>
        <div class="metric"><small>${T("Despeses acumulades")}</small><b>${eur(S.stats.expenses)}</b></div>
        <div class="metric ${S.money < 0 ? 'bad' : 'good'}"><small>${T("Liquiditat actual")}</small><b>${eur(S.money + S.reserve)}</b></div>
        <div class="metric"><small>${T("Reputació")}</small><b>${S.rep}/100</b></div>
        <div class="metric"><small>${T("Clients recurrents")}</small><b>${S.clients.length}</b></div>
        <div class="metric"><small>${T("Equip")}</small><b>${S.team.length + 1} persones</b></div>
        <div class="metric"><small>${T("Campanyes amb bon resultat")}</small><b>${S.stats.good}/${S.stats.campaigns}</b></div>
        <div class="metric"><small>${T("Encàrrecs lliures")}</small><b>${S.stats.gigs}</b></div>
      </div>
      <p><b>${T("Especialitats dominades:")}</b> ${best.join(', ') || '—'}</p>
      <p><b>${T("Risc financer:")}</b> ${S.money + S.reserve < 0 ? T('Alt: l\'empresa té números vermells.') : S.money + S.reserve < weeklyCost() * 8 ? T('Mitjà: la liquiditat cobreix menys de dos mesos de despeses.') : T('Baix: hi ha coixí per fer front a imprevistos.')}</p>
      <h4>${T("Relacions")}</h4>
      <p class="trustline">${CHARS_TRUST.filter(c => S.f['met_' + c]).map(c => `<span class="${t[c] >= 0 ? 'pos' : 'neg'}">${GD.names[c]} ${trustHearts(t[c])}</span>`).join('')}</p>
      <h4>${T("Les decisions que han marcat la història")}</h4>
      <ul class="history">${keys.map(h => `<li class="key"><small>${T("Cap.")} ${h.ch}</small>${esc(h.t)}</li>`).join('') || '<li>—</li>'}</ul>
      <button class="btn primary" id="cont">${T("Continuar")}</button></div>`, (p) => { p.querySelector('#cont').onclick = done; });
  }

  function endingScreen(id, fresh) {
    const e = GD.endings[id];
    app().innerHTML = `<section class="ending">
      <div class="bg">${ART.background(e.bg || 'vic')}</div>
      <div class="ending-petals"></div>
      <div class="ending-box">
        <small>${fresh ? T('Final aconseguit') : T('El teu final')}</small>
        <h1>${esc(e.title)}</h1>
        <div class="ending-cast">${(e.cast || ['pau']).map(c => `<span>${c === 'pau' ? ART.portrait('pau', 'h', { rank: rank() }) : ART.portrait(c, S.trust[c] >= 2 ? 'h' : 'n')}</span>`).join('')}</div>
        ${e.text.map(p => `<p>${txt(p)}</p>`).join('')}
        ${(GD.epilogue(S, H) || []).map(p => `<p class="epi">${txt(p)}</p>`).join('')}
        <p class="muted">${txt(T('Habilitats {den}'))}: ${Object.entries(SKILLS).map(([k, s]) => `${s.i} ${s.n} ${S.skills[k]}`).join(' · ')}</p>
        <div class="row-btns center"><button class="btn primary" data-act="hub">${T("Mode lliure")}</button><button class="btn" data-act="new">${T("Nova partida")}</button></div>
      </div></section>`;
    petals($('.ending-petals'), 30);
  }

  /* ================= Accions globals ================= */
  function confirmBox(msg, yes) {
    const d = document.createElement('div');
    d.className = 'modal';
    d.innerHTML = `<div class="modal-box"><p>${msg}</p><div class="row-btns"><button class="btn danger" id="y">${T("Sí")}</button><button class="btn" id="n">${T("Cancel·lar")}</button></div></div>`;
    document.body.appendChild(d);
    d.querySelector('#y').onclick = () => { d.remove(); yes(); };
    d.querySelector('#n').onclick = () => d.remove();
  }
  function textBox(title, value, onOk, okLabel) {
    const d = document.createElement('div');
    d.className = 'modal';
    d.innerHTML = `<div class="modal-box"><p><b>${title}</b></p><textarea class="inp" rows="5">${esc(value || '')}</textarea><div class="row-btns">${onOk ? `<button class="btn primary" id="y">${okLabel || T('Importar')}</button>` : T('<button class="btn primary" id="cp">Copiar</button>')}<button class="btn" id="n">${T("Tancar")}</button></div></div>`;
    document.body.appendChild(d);
    const ta = d.querySelector('textarea');
    if (!onOk) { ta.select(); d.querySelector('#cp').onclick = () => { ta.select(); try { navigator.clipboard.writeText(ta.value); toast(T('Codi copiat')); } catch (e) { document.execCommand('copy'); } }; }
    else d.querySelector('#y').onclick = () => { onOk(ta.value.trim()); d.remove(); };
    d.querySelector('#n').onclick = () => d.remove();
  }

  /* ================= Creació del personatge ================= */
  const normClass = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim().replace(/\s+/g, '-').replace(/[^A-Z0-9_-]/g, '').slice(0, 32);

  function setupScreen(editing) {
    const base = editing ? S : newState();
    const d = { name: editing ? S.player.name : '', surname: editing ? S.player.surname : '', g: base.player.g, classe: base.classe, look: Object.assign({}, ART.PLAYER_DEFAULT, JSON.parse(JSON.stringify(base.player.look))) };
    const O = ART.LOOK_OPTIONS;
    // Mostres de color i un selector lliure per triar qualsevol altre color
    const swatches = (k, list, label) => `<div class="swatches" id="s_${k}">${list.map(c => c ? `<button data-${k}="${c}" style="background:${c}" aria-label="${label} ${c}"></button>` : `<button data-${k}="" class="sw-auto" title="${T('Segons el rang')}">${T('Auto')}</button>`).join('')}<label class="sw-custom" title="${T('Color personalitzat')}">🎨<input type="color" data-custom="${k}" aria-label="${T('Color personalitzat')}"></label></div>`;
    app().innerHTML = `<section class="setup">
      <div class="setup-preview"><div class="setup-ava" id="sAva"></div><p class="setup-example" id="sEx"></p></div>
      <div class="setup-form card">
        <h2>${editing ? T('Canvia el teu personatge') : T('Crea el teu personatge')}</h2>
        <div class="row2">
          <label>${T("Nom")}<input class="inp" id="sName" maxlength="20" value="${esc(d.name)}" placeholder="Per exemple: Marta" autocomplete="given-name"></label>
          <label>${T("Cognom")} <small>${T("(opcional)")}</small><input class="inp" id="sSur" maxlength="24" value="${esc(d.surname)}" placeholder="Per exemple: Puig" autocomplete="family-name"></label>
        </div>
        <p class="lbl">${T("Com vols que et tractin al joc?")}</p>
        <div class="seg" id="sG">${[['m', T('Masculí («en»)')], ['f', T('Femení («la»)')], ['n', T('Neutre (sense article)')]].map(([k, n]) => `<button data-g="${k}">${n}</button>`).join('')}</div>
        <p class="lbl">${T("Pentinat")}</p>
        <div class="styles" id="sStyle">${O.style.map(([k, n]) => `<button data-style="${k}" title="${n}"><span></span><small>${n}</small></button>`).join('')}</div>
        <p class="lbl">${T("Color dels cabells")}</p>
        ${swatches('hair', O.hair, T('Color'))}
        <p class="lbl">${T("Color dels ulls")}</p>
        ${swatches('eye', O.eye, T('Color'))}
        <p class="lbl">${T("To de pell")}</p>
        <div class="swatches" id="s_skin">${O.skin.map(c => `<button data-skin="${c}" style="background:${c}" aria-label="${T('To')} ${c}"></button>`).join('')}</div>
        <p class="lbl">${T("Color de la roba")} <small>${T("(Auto: canvia amb el teu rang)")}</small></p>
        ${swatches('cloth', O.cloth, T('Color'))}
        <p class="lbl">${T("Complements")} <small>${T("(en pots combinar diversos)")}</small></p>
        <div class="seg acc-grid" id="sAcc"><button data-acc="">${T('Sense complements')}</button>${O.acc.map(([k, n]) => `<button data-acc="${k}">${n}</button>`).join('')}</div>
        <p class="lbl">${T("Codi de classe")} <small>${T("(opcional, te'l dona el professor)")}</small></p>
        <input class="inp" id="sClass" maxlength="32" value="${esc(d.classe)}" placeholder="Per exemple: 4ESO-B">
        <p class="muted small">${T("Si poses un codi de classe, el teu nom i els resultats del joc s'enviaran al teu professor.")}</p>
        <div class="row-btns">
          <button class="btn primary big" id="sGo">${editing ? T('Desar canvis') : T('Començar l\'aventura ▶')}</button>
          <button class="btn ghost" id="sBack">${editing ? T('Cancel·lar') : T('Tornar')}</button>
        </div>
      </div></section>`;
    const draw = () => {
      ART.setPlayer(d.look);
      $('#sAva').innerHTML = ART.portrait('pau', 'h', { rank: editing ? rank() : 0 });
      const prevS = S; S = { player: { name: d.name || 'Pau', surname: d.surname, g: d.g }, agency: base.agency };
      $('#sEx').innerHTML = txt(T('«{En} torna a Vic amb una idea: muntar una agència de màrqueting digital.»'));
      S = prevS;
      document.querySelectorAll('#sG [data-g]').forEach(b => b.classList.toggle('on', b.dataset.g === d.g));
      document.querySelectorAll('#sAcc [data-acc]').forEach(b => b.classList.toggle('on', b.dataset.acc ? d.look.acc.includes(b.dataset.acc) : !d.look.acc.length));
      ['style', 'hair', 'eye', 'skin', 'cloth'].forEach(k => document.querySelectorAll(`button[data-${k}]`).forEach(b => b.classList.toggle('on', b.dataset[k] === (d.look[k] || ''))));
      ['hair', 'eye', 'cloth'].forEach(k => { const i = document.querySelector(`[data-custom="${k}"]`), own = d.look[k] && !O[k].includes(d.look[k]); i.parentNode.classList.toggle('on', !!own); if (own) i.value = d.look[k]; });
      document.querySelectorAll('#sStyle [data-style]').forEach(b => {
        const look = Object.assign({}, d.look, { style: b.dataset.style, acc: [] });
        ART.setPlayer(look); b.querySelector('span').innerHTML = ART.portrait('pau', 'n', { rank: 0 });
      });
      ART.setPlayer(d.look);
    };
    $('#sName').oninput = (e) => { d.name = e.target.value.trim(); draw(); };
    $('#sSur').oninput = (e) => { d.surname = e.target.value.trim(); draw(); };
    $('#sClass').oninput = (e) => { d.classe = e.target.value; };
    document.querySelector('.setup').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.g) d.g = b.dataset.g;
      else if (b.dataset.acc != null) {
        const k = b.dataset.acc, grp = (x) => (O.acc.find(a => a[0] === x) || [])[2];
        if (!k) d.look.acc = [];
        else if (d.look.acc.includes(k)) d.look.acc = d.look.acc.filter(x => x !== k);
        else d.look.acc = d.look.acc.filter(x => grp(x) !== grp(k)).concat(k);
      }
      else if (b.dataset.style) d.look.style = b.dataset.style;
      else if (b.dataset.hair) d.look.hair = b.dataset.hair;
      else if (b.dataset.eye) d.look.eye = b.dataset.eye;
      else if (b.dataset.skin) d.look.skin = b.dataset.skin;
      else if (b.dataset.cloth != null) d.look.cloth = b.dataset.cloth;
      else return;
      draw();
    });
    document.querySelectorAll('[data-custom]').forEach(i => i.oninput = () => { d.look[i.dataset.custom] = i.value; draw(); });
    $('#sBack').onclick = () => editing ? hubScreen('pau') : titleScreen();
    $('#sGo').onclick = () => {
      if (!d.name) { $('#sName').focus(); toast(T('Escriu el teu nom'), 'bad'); return; }
      if (!editing) { S = base; S.econ = { seq: 0, queue: [], srv: null, inici: true }; econPush('inici', 'inici', S.money); }
      Object.assign(S.player, { name: d.name, surname: d.surname, g: d.g, look: d.look });
      const c = normClass(d.classe);
      if (c !== S.classe) { S.classe = c; S.lastSync = 0; }
      applyPlayer(); save(); queueSync();
      if (editing) { toast(T('Personatge actualitzat'), 'good'); hubScreen('pau'); } else startChapter('1.1');
    };
    draw();
  }

  /* ================= Resultats per al professor ================= */
  function buildSummary() {
    const lessonIds = Object.keys(GD.lessons);
    const passed = lessonIds.filter(id => S.lessons[id]);
    const logs = Object.entries(S.quizLog || {});
    const avg = (f) => logs.length ? Math.round(logs.reduce((a, [, q]) => a + f(q) / q.total, 0) / logs.length * 100) : null;
    const curStageObj = GD.stages.find(s => s.chapters.some(c => !S.done[c]));
    return {
      v: 1, id: S.player.id, classe: S.classe, idioma: LANG,
      nom: S.player.name, cognom: S.player.surname || '', tractament: S.player.g,
      aspecte: S.player.look,
      agencia: S.agency, perfil: S.f.profile || '',
      actualitzat: new Date().toISOString(), iniciat: new Date(S.started).toISOString(),
      nivell: S.level, setmana: S.week,
      etapaActual: curStageObj ? curStageObj.id : 8, etapesCompletades: stagesDone(),
      capitolsCompletats: Object.keys(S.done).filter(c => GD.chapters[c]).length, capitolsTotal: Object.keys(GD.chapters).length,
      capitolActual: S.cur ? S.cur.id : '',
      llicons: Object.fromEntries(lessonIds.filter(id => S.quizLog && S.quizLog[id]).map(id => [id, Object.assign({ superada: !!S.lessons[id] }, S.quizLog[id])])),
      llicionsSuperades: passed.length, llicionsTotal: lessonIds.length,
      mitjanaPrimerIntent: avg(q => q.first), mitjanaMillor: avg(q => q.best),
      reputacio: S.rep, liquiditat: Math.round(S.money + S.reserve), clients: S.clients.length, equip: S.team.length + 1,
      cami: S.f.path || '', final: S.ending ? GD.endings[S.ending].title : '',
      habilitats: S.skills, coneixement: S.know, confianca: S.trust,
      encarrecs: S.stats.gigs, campanyes: S.stats.campaigns, campanyesBones: S.stats.good,
      webPlataformes: (S.web && S.web.platforms) || [],
      webs: Object.fromEntries(Object.entries((S.web && S.web.levels) || {}).map(([k, v]) => [k, { url: v.url, platform: v.platform, at: v.at, reflection: v.reflection, note: v.note, reachable: v.reachable, v: v.v || 0 }])),
      websEntregades: Object.keys((S.web && S.web.levels) || {}).length,
      projectes: Object.assign(Object.fromEntries(Object.entries(S.proj || {}).filter(([, r]) => r && r.v).map(([k, r]) => [k, { url: r.url, url2: r.url2 || '', resum: r.summary, ia: r.ai, canvis: r.changes || '', at: r.at, primer: r.first || r.at, v: r.v }])),
        // Les webs del taller es corregeixen com els projectes, amb la clau «web-N»
        Object.fromEntries(Object.entries((S.web && S.web.levels) || {}).filter(([, v]) => v && v.v).map(([k, v]) => ['web-' + k, { url: v.url, url2: '', resum: v.reflection || '', nota: v.note || '', ia: '', canvis: '', at: v.at, primer: v.at, v: v.v }]))),
      projectesEntregats: Object.values(S.proj || {}).filter(r => r && r.v).length,
      projectesAprovats: GD.projects.filter(p => projStatus(p) === 'approved').length,
      projectesTotal: GD.projects.length,
      decisionsTemari: S.choiceLog || {},
      mon: { accions: (S.world && S.world.actions) || {}, problemes: (S.world && S.world.problems) || {}, pistes: Object.keys((S.world && S.world.clues) || {}) },
      fallides: S.fallides || 0, fallidesDetall: S.fallidesLog || [],
      millores: Object.keys(S.upgrades || {}),
      comercdex: (() => { const st = cmState(); return { capturats: Object.keys(st.owned).length, total: GD.cmSpecies.length, equip: st.team, inicial: st.starter || '', diesJoc: Object.keys(S.days || {}).length, col: Object.fromEntries(Object.entries(st.owned).map(([k, m]) => [k, { nivell: m.lvl, forma: m.form }])) }; })(),
      tractesTancats: (S.market && S.market.closed) || 0,
      decisions: S.history.filter(h => h.key).map(h => T("Cap. {0}: {1}", [h.ch, h.t]))
    };
  }
  let syncTimer = null;
  function queueSync() {
    if (!S || !S.classe) return;
    S.syncPending = true; save();
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => doSync(false), 1200);
  }
  async function doSync(manual) {
    if (!S || !S.classe) return false;
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'submit', classe: S.classe, id: S.player.id, data: buildSummary() }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Error ' + r.status);
      S.syncPending = false; S.lastSync = Date.now(); save();
      Object.entries(S.proj || {}).forEach(([k, r]) => { if (r && r.autoPending) { r.autoPending = false; requestAutograde(k, r.v); } });
      Object.entries((S.web && S.web.levels) || {}).forEach(([k, r]) => { if (r && r.autoPending) { r.autoPending = false; requestAutograde('web-' + k, r.v); } });
      if (manual) { toast(T('📤 Resultats enviats al professor'), 'good'); if ($('.hub')) hubScreen(); }
      return true;
    } catch (e) {
      S.syncPending = true; save();
      if (manual) toast(T('No s\'han pogut enviar els resultats (') + esc(e.message || T('sense connexió')) + T('). Torna-ho a provar o descarrega el fitxer.'), 'bad');
      return false;
    }
  }
  function downloadResults() {
    const data = buildSummary();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    const nm = normClass((S.player.name + '-' + (S.player.surname || '')).replace(/-$/, '')).toLowerCase() || 'alumne';
    a.href = URL.createObjectURL(blob); a.download = `agencia-digital_${nm}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  window.addEventListener('online', () => { if (S && S.syncPending) doSync(false); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && $('.hub')) checkReviews(false); });
  setInterval(() => { if (!document.hidden && ($('.hub') || $('.world'))) { checkReviews(false); marketSync(false); } }, 13000);
  function projTodo() { return GD.projects.filter(p => ['todo', 'changes'].includes(projStatus(p))).length; }

  /* ================= Món explorable ================= */
  function goWorld() {
    if (!window.WORLD || !S) return hubScreen('campanya');
    if (bankrupt()) return;
    S.cur = S.cur && GD.chapters[S.cur.id] ? S.cur : null;
    WORLD.open({
      S: () => S, save, toast, txt, esc, eur, applyFx, rank, bankrupt, payStudy, startChapter, projectScreen,
      hubScreen: (tab) => hubScreen(tab), chapterState, projGate, projStatus,
      speed: () => settings.speed, hudRefresh: () => WORLD.refresh(),
      cmReady: () => !!cmState().starter, cmVisible, cmCatchable, cmWildForm, cmWild, cmTrainer, cmTrainerFresh, cmGym
    });
    const F = projFixes();
    if (F.length) toast(T('✏️ Tens projectes per millorar ({0}): {1}. Els trobaràs a 📋 Projectes.', [F.length, F.map(p => txt(p.title)).join(', ')]), 'bad');
  }

  function newGame() {
    const go = () => setupScreen(false);
    if (loadSave()) confirmBox(T('Començar una partida nova esborrarà la partida desada. Vols continuar?'), go); else go();
  }
  // Partides antigues (30 nivells, habilitats 0–5) → 100 nivells i habilitats 0–50
  function migrateProgress() {
    S.level = Math.min(MAX_LEVEL, (S.level - 1) * 3 + 1);
    S.xp = Math.floor((S.xp || 0) / 3);
    S.sp = (S.sp || 0) * SKILL_TIER;
    for (const k in S.skills) S.skills[k] = Math.min(SKILL_MAX, (S.skills[k] || 0) * SKILL_TIER);
    S.prog = 2;
  }
  function continueGame() {
    S = loadSave();
    if (!S) return titleScreen();
    const old = !S.prog;
    S = Object.assign(newState(), S);
    if (old) migrateProgress();
    if (!S.econ) { econ().inici = true; econPush('inici', 'inici', 3000); }
    applyPlayer();
    if (S.syncPending) queueSync();
    if (S.cur && GD.chapters[S.cur.id]) startChapter(S.cur.id, true); else goWorld();
  }

  document.addEventListener('click', (ev) => {
    const lb = ev.target.closest('[data-lang]');
    if (lb && !lb.closest('.setup')) { if (lb.dataset.lang !== LANG) setLang(lb.dataset.lang); return; }
    const ub = ev.target.closest('[data-buy],[data-unbuy]');
    if (ub && !ub.disabled) { if (ub.dataset.buy) buyUpgrade(ub.dataset.buy); else unbuyUpgrade(ub.dataset.unbuy); return; }
    const b = ev.target.closest('[data-act],[data-ch],[data-tab],[data-skill],[data-lesson],[data-gig],[data-web],[data-proj]');
    if (!b || b.disabled) return;
    if (b.dataset.ch) { startChapter(b.dataset.ch); return; }
    if (b.dataset.tab) { hubScreen(b.dataset.tab); return; }
    if (b.dataset.skill) {
      const k = b.dataset.skill;
      const n = Math.max(1, Math.min(+(b.dataset.n || 1), S.sp, SKILL_MAX - S.skills[k]));
      if (S.sp > 0 && S.skills[k] < SKILL_MAX) { S.sp -= n; S.skills[k] += n; save(); toast(T("{0} {1} puja a {2}", [SKILLS[k].i, SKILLS[k].n, S.skills[k]]), 'good'); hubScreen('pau'); }
      return;
    }
    if (b.dataset.lesson) { sceneShell('despatx'); showActors('pau', 't'); lessonFlow(b.dataset.lesson, false, () => hubScreen('biblioteca')); return; }
    if (b.dataset.gig != null) { playGig(+b.dataset.gig); return; }
    if (b.dataset.web != null) { webLevel(+b.dataset.web); return; }
    if (b.dataset.proj) { projectScreen(b.dataset.proj); return; }
    switch (b.dataset.act) {
      case 'new': newGame(); break;
      case 'continue': continueGame(); break;
      case 'hub': if (S.ending && $('.ending')) { hubScreen('campanya'); } else goWorld(); break;
      case 'world': goWorld(); break;
      case 'hubGigs': hubScreen('encarrecs'); break;
      case 'econSync': econSync(true).then(() => hubScreen('empresa')); break;
      case 'guardiola': guardiolaModal(); break;
      case 'hubTaller': hubScreen('taller'); break;
      case 'hubProj': hubScreen('projectes'); break;
      case 'checkReviews': checkReviews(true); break;
      case 'webPlatforms': webPicker($('#hubBody')); break;
      case 'title': titleScreen(); break;
      case 'showEnding': endingScreen(S.ending, false); break;
      case 'refreshGigs': if (gigPool().length <= (S.gigs || []).length) { toast(T('No hi ha més encàrrecs per ara.')); break; } advanceWeeks(1); genGigs(); save(); if (bankrupt()) break; hubScreen('encarrecs'); toast(T('Ha passat una setmana. Nous encàrrecs disponibles.')); break;
      case 'useReserve': S.money += S.reserve; S.reserve = 0; save(); hubScreen('empresa'); break;
      case 'export': textBox(T('Codi de la teva partida (copia\'l i enganxa\'l a l\'altre dispositiu):'), btoa(unescape(encodeURIComponent(JSON.stringify(S))))); break;
      case 'import': textBox(T('Enganxa el codi de la partida:'), '', (v) => {
        try { const d = JSON.parse(decodeURIComponent(escape(atob(v)))); if (!d || !d.v) throw 0; S = Object.assign(newState(), d); applyPlayer(); save(); toast(T('Partida importada'), 'good'); goWorld(); }
        catch (e) { toast(T('El codi no és vàlid'), 'bad'); }
      }); break;
      case 'speed': settings.speed = settings.speed <= 8 ? 18 : settings.speed <= 18 ? 32 : 6; saveSettings(); hubScreen('empresa'); break;
      case 'reset': confirmBox(T('Segur que vols esborrar la partida? No es pot desfer.'), () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } S = null; titleScreen(); }); break;
      case 'install': doInstall(); break;
      case 'editAvatar': setupScreen(true); break;
      case 'syncNow': doSync(true); break;
      case 'downloadResults': downloadResults(); break;
      case 'setClass': textBox(T('Codi de classe (te\'l dona el professor):'), S.classe, (v) => {
        S.classe = normClass(v); S.lastSync = 0; save();
        if (S.classe) { toast(T('Codi desat: ') + esc(S.classe), 'good'); if (!$('.hub')) hubScreen('projectes'); doSync(true); } else if ($('.hub')) hubScreen(); else hubScreen('projectes');
      }, T('Desar')); break;
      case 'sceneMenu': confirmBox(T('Vols sortir de la missió? El progrés de la missió es desa i la podràs reprendre.'), () => { const c = S.cur; save(); hubScreen('campanya'); S.cur = c; save(); }); break;
      case 'upgrades': hubScreen('empresa'); break;
    }
  });

  /* ================= Instal·lació com a app (PWA) ================= */
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; updateInstallBtn(); });
  function updateInstallBtn() {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    document.querySelectorAll('.install-btn').forEach(b => { b.hidden = standalone || !(deferredPrompt || /iphone|ipad|ipod/i.test(navigator.userAgent)); });
  }
  function doInstall() {
    if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt.userChoice.finally(() => { deferredPrompt = null; updateInstallBtn(); }); }
    else confirmBox(T('A l\'iPhone o iPad: toca el botó <b>Compartir</b> de Safari i després <b>«Afegeix a la pantalla d\'inici»</b>.'), () => { });
  }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
  }

  // Represa d'una missió interrompuda des del hub
  const _hub = hubScreen;
  hubScreen = function (tab) {
    if (bankrupt()) return;
    const pending = S && S.cur && GD.chapters[S.cur.id] ? S.cur : null;
    _hub(tab);
    window.scrollTo(0, 0);
    checkReviews(false);
    if (pending) { S.cur = pending; save(); const nm = document.querySelector('.next-mission'); if (nm) { nm.dataset.resume = '1'; } }
  };
  document.addEventListener('click', (ev) => {
    const nm = ev.target.closest('.next-mission[data-resume]');
    if (nm && S.cur && S.cur.id === nm.dataset.ch) { ev.stopImmediatePropagation(); startChapter(S.cur.id, true); }
  }, true);

  loadSettings();
  window.GAME = { get S() { return S; }, startChapter, hubScreen, applyFx, econSync };
  titleScreen();
})();
