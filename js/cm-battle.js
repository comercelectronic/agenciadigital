/* Agència Digital — COMERÇMONS: motor de combat per torns.
   És una funció pura i determinista (llavor aleatòria pròpia): el mateix combat amb les mateixes accions
   dona sempre el mateix resultat. Així el servidor el pot tornar a jugar per validar combats i tornejos.
   El fan servir el joc (combats al món, entrenadors i agències rivals) i, més endavant, les funcions del servidor.

   Estat d'un combat: { turn, r (llavor), sides: [{ team: [lluitador], act }, ...], over: null | { win, timeout } }
   Accions: { t: 'atk', i: índex de l'atac, q: true/false (resposta a la pregunta dels atacs especials) } · { t: 'switch', to } */
(function () {
  'use strict';
  const G = typeof window !== 'undefined' ? window : globalThis;
  const GD = G.GD;
  const T = (s, a) => (G.T ? G.T(s, a) : (a ? String(s).replace(/\{(\d+)\}/g, (m, i) => a[i]) : s));

  GD.CMB = {
    MAX_TURNS: 80,
    DMG: 0.12,          // dany = potència × (atac / defensa) × (DMG + nivell × DMGL)
    DMGL: 0.012,
    HP0: 30, HPD: 1.0,  // vida: base + defensa × HPD + energia i intel·ligència
    FATIGUE: 20,        // a partir d'aquest torn el dany creix un 6 % per torn (evita combats infinits)          // escala general del dany
    REGEN: 8,           // energia recuperada cada torn (+ un 25 % de l'estadística d'energia)
    CRIT: 0.08,         // probabilitat de cop crític (×1,5)
    BAL: { 'publifoc:0': 1.43, 'publifoc:1': 1.46, 'publifoc:2': 1.02, 'analitopus:0': 2.2, 'analitopus:1': 2.2, 'analitopus:2': 1.11, 'brandalia:0': 1.24, 'brandalia:1': 1.41, 'brandalia:2': 0.8, 'financrac:0': 1.66, 'financrac:1': 1.97, 'financrac:2': 0.99, 'socialbee:0': 2.2, 'socialbee:1': 1.54, 'socialbee:2': 1.33, 'vendifox:0': 1.43, 'vendifox:1': 1.23, 'vendifox:2': 0.95, 'sabionet:0': 2.2, 'sabionet:1': 2.2, 'sabionet:2': 1.39, 'creativola:0': 2.2, 'creativola:1': 2.2, 'creativola:2': 1.06, 'seolop:0': 1.11, 'seolop:1': 1.37, 'seolop:2': 0.91, 'logistort:0': 1.63, 'logistort:1': 1.68, 'logistort:2': 0.76, 'comunivol:0': 2.19, 'comunivol:1': 2.2, 'comunivol:2': 1.58, 'estratego:0': 1.75, 'estratego:1': 1.94, 'estratego:2': 0.87, 'segmentiu:0': 1.19, 'segmentiu:1': 1, 'posicionix:0': 1.36, 'posicionix:1': 1.3, 'posicionix:2': 0.83, 'enquestola:0': 2.2, 'enquestola:1': 1.65, 'enquestola:2': 1.09, 'preuxi:0': 1.28, 'preuxi:1': 1.09, 'imanto:0': 1.57, 'imanto:1': 1.95, 'imanto:2': 1.04, 'pactoru:0': 1.72, 'pactoru:1': 1.27, 'pactoru:2': 0.98, 'fideli:0': 2.01, 'fideli:1': 2.2, 'fideli:2': 0.77, 'ateneta:0': 1.51, 'ateneta:1': 1.55, 'aparadorix:0': 1.51, 'aparadorix:1': 1.72, 'aparadorix:2': 0.97, 'copiuma:0': 1.63, 'copiuma:1': 1.28, 'copiuma:2': 0.91, 'videolot:0': 1.2, 'videolot:1': 1.16, 'bustiola:0': 1.51, 'bustiola:1': 2.15, 'ressenyol:0': 0.72, 'ressenyol:1': 0.91, 'clicarro:0': 2.2, 'clicarro:1': 1.84, 'clicarro:2': 1.03, 'estocadillo:0': 0.99, 'estocadillo:1': 0.91, 'startupi:0': 1.99, 'startupi:1': 2.2, 'startupi:2': 1.16, 'facturo:0': 2.2, 'facturo:1': 1.91, 'facturo:2': 0.97, 'exportas:0': 1.37, 'exportas:1': 1.29, 'pinzellet:0': 2.11, 'pinzellet:1': 1.61, 'pinzellet:2': 0.91, 'innovolt:0': 1.2, 'innovolt:1': 1.32, 'puzzlet:0': 2.05, 'puzzlet:1': 1.52, 'puzzlet:2': 1.01, 'monopolion:0': 0.9, 'disruptor:0': 0.88, 'globalia:0': 1.13, 'liderax:0': 0.79 },            // ajust d'equilibri per espècie i forma (calculat amb simulacions: vegeu tests/combat.test.js)
    BASIC: { n: 'Atac bàsic', cat: 'ofensiu', cost: 0, pow: 30, acc: 95, cd: 0, fx: '' }
  };

  /* ---------- Efectes dels atacs ----------
     Els atacs del catàleg descriuen l'efecte en text; aquí es tradueix a un efecte mecànic (el mateix per a tothom). */
  const pct = (t, d) => { const m = t.match(/(\d+)\s*%/); return m ? +m[1] / 100 : d; };
  const turnsOf = (t, d) => { const m = t.match(/durant (\d+) torns?/); return m ? +m[1] : d; };
  function statOf(t) {
    if (/totes les estad/.test(t)) return 'all';
    if (/intel/.test(t)) return 'int';
    if (/defensa/.test(t)) return 'def';
    if (/velocitat|primer/.test(t)) return 'vel';
    if (/atac/.test(t)) return 'atk';
    return null;
  }
  GD.cmAtkFx = (a) => {
    const t = String(a.fx || '').toLowerCase();
    if (a.pow > 0 || a.cat === 'ofensiu') {
      const e = { k: 'dmg', pow: a.pow > 0 ? a.pow : 55 };
      if (/no falla/.test(t)) e.sure = 1;
      if (/sempre actua primer/.test(t)) e.first = 1;
      if (/paralitza|paràlisi|confon|confusió|enlluerna/.test(t)) e.stun = 1;
      if (/cura igual al dany/.test(t)) e.leech = 1;
      if (/roba/.test(t)) e.drain = pct(t.slice(t.indexOf('roba')), 0.1);
      if (/doble de dany|dany doble/.test(t)) e.exec = 1;
      if (/tres cops/.test(t)) e.pow = Math.round(e.pow * 1.8);
      const m = t.match(/\+\s*(\d+)\s*% (?:de |d')?(velocitat|atac|defensa|intel)/) || t.match(/equip guanya un (\d+) % de (defensa|atac|velocitat)/);
      if (m) e.self = { s: statOf(m[2]), v: +m[1] / 100, n: 3 };
      return e;
    }
    if (/esquiva|només el pot atacar/.test(t)) return { k: 'dodge' };
    if (/treu .*efectes? negatius?|immune/.test(t)) return { k: 'cleanse' };
    if (/converteix .* en vida/.test(t)) return { k: 'heal', v: pct(t, 0.3) };
    if (/atrau els atacs|no perd vida/.test(t)) return { k: 'shield', v: 0.3, n: 2 };
    if (/recupera la recuperació|actua tot seguit|repeteix l'atac/.test(t)) return { k: 'energy', v: 0.25 };
    if (/revela|marca un rival/.test(t)) return { k: 'vuln', v: 0.15, n: 3 };
    if (/confon|perd el torn/.test(t)) return { k: 'stun' };
    if (/precisió/.test(t)) return /rival/.test(t) ? { k: 'debuff', s: 'acc', v: pct(t, 0.2), n: 3 } : { k: 'buff', s: 'acc', v: 0.15, n: 3 };
    if (/retorna/.test(t)) return { k: 'reflect', v: pct(t, 0.4) };
    if (/vida/.test(t) && /recupera/.test(t)) return /cada torn/.test(t) ? { k: 'hot', v: 0.1, n: turnsOf(t, 3) } : { k: 'heal', v: pct(t, 0.3) };
    if (/energia/.test(t) && /(recupera|reparteix)/.test(t)) return { k: 'energy', v: pct(t, 0.3) };
    if (/escut|absorbeix|dany rebut|menys de dany/.test(t)) return { k: 'shield', v: pct(t, 0.3), n: turnsOf(t, 1) };
    if (/rep un \d+ % més de dany/.test(t)) return { k: 'vuln', v: pct(t, 0.2), n: turnsOf(t, 2) };
    if (/paralitza/.test(t)) return { k: 'stun' };
    if (/(redueix|baixa)/.test(t) && /rival/.test(t)) return { k: 'debuff', s: statOf(t) || 'def', v: pct(t, 0.2), n: 3 };
    if (/actua primer/.test(t)) return { k: 'buff', s: 'vel', v: 0.5, n: 1 };
    const s = statOf(t);
    return { k: 'buff', s: s || 'atk', v: pct(t, 0.15), n: turnsOf(t, 3) };
  };
  GD.cmMovesOf = (sp, form) => {
    const L = [Object.assign({}, GD.CMB.BASIC, { n: T('Atac bàsic'), basic: 1 })];
    sp.forms.slice(0, form + 1).forEach(f => (f.attacks || []).forEach(a => L.push(a)));
    const M = L.map(a => Object.assign({}, a, { e: GD.cmAtkFx(a) }));
    // si l'únic atac que fa mal és el bàsic, és més fort (les formes de suport també han de poder guanyar)
    if (!M.some(m => !m.basic && m.e.k === 'dmg')) { M[0].pow = 50; M[0].e = { k: 'dmg', pow: 50 }; }
    return M;
  };
  // Forma natural d'un Comerçmon salvatge o d'un rival segons el nivell
  GD.cmFormAt = (sp, lvl) => { let f = 0; sp.forms.forEach((fo, i) => { if (i && lvl >= fo.lvl) f = i; }); return f; };

  /* ---------- Lluitadors ---------- */
  GD.cmFighter = (id, form, lvl) => {
    const sp = GD.cmById(id); if (!sp) throw new Error('espècie ' + id);
    form = Math.max(0, Math.min(sp.forms.length - 1, form == null ? GD.cmFormAt(sp, lvl) : form));
    lvl = Math.max(1, Math.min(GD.CM.MAX_LEVEL, lvl | 0));
    const st = GD.cmStats(sp, form, lvl);
    const maxHp = Math.round(GD.CMB.HP0 + st.def * GD.CMB.HPD + st.ene * 0.6 + st.int * 0.4 + lvl * 0.8), maxEn = Math.round(40 + st.ene * 1.5);
    return { id, form, lvl, name: sp.forms[form].name, type: sp.type, st, hp: maxHp, maxHp, en: maxEn, maxEn,
      moves: GD.cmMovesOf(sp, form), cd: {}, buf: {}, shield: null, vuln: null, hot: null, dodge: 0, reflect: 0, stun: 0, dealt: 0 };
  };

  /* ---------- Aleatorietat amb llavor (mulberry32) ---------- */
  function rnd(s) {
    s.r = (s.r + 0x6D2B79F5) | 0;
    let t = Math.imul(s.r ^ (s.r >>> 15), 1 | s.r);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  GD.cmBattleNew = (teamA, teamB, seed) => ({
    turn: 0, r: (seed >>> 0) || 1, over: null,
    sides: [teamA, teamB].map(tm => ({ team: tm.map(m => GD.cmFighter(m.id, m.form, m.lvl)), act: 0 }))
  });
  const cur = (s, i) => s.sides[i].team[s.sides[i].act];
  GD.cmBattleCur = cur;
  const statV = (f, k) => {
    let m = 1;
    const b = f.buf[k], a = f.buf.all;
    if (b) m *= 1 + b[0];
    if (a) m *= 1 + a[0];
    return f.st[k] * Math.max(0.3, m);
  };
  // Atacs que es poden fer ara (energia i recuperació)
  GD.cmUsable = (f) => f.moves.map((mv, i) => ({ i, mv, ok: f.en >= mv.cost && !(f.cd[i] > 0) }));

  function nextAlive(s, i) {
    const sd = s.sides[i];
    const k = sd.team.findIndex(f => f.hp > 0);
    if (k < 0) return false;
    sd.act = k; return true;
  }
  function addBuf(f, s, v, n) { f.buf[s] = [Math.max(-0.4, Math.min(0.6, (f.buf[s] ? f.buf[s][0] : 0) + v)), n]; }

  function hit(s, ai, A, D, mv, act, ev) {
    const e = mv.e;
    A.en -= mv.cost; if (mv.cd) A.cd[A.moves.indexOf(mv)] = mv.cd + 1;
    const base = { k: 'atk', side: ai, who: A.name, mv: mv.n, cat: mv.cat };
    if (mv.cat === 'especial' && act.q === false) { ev.push(Object.assign(base, { fail: 1 })); return; }
    const bonus = mv.cat === 'especial' && act.q ? 1.2 : 1;
    if (e.k === 'dmg') {
      if (D.dodge) { D.dodge = 0; ev.push(Object.assign(base, { dodged: 1 })); return; }
      // la velocitat ajuda a esquivar: fins a un 20 % menys de precisió contra un rival molt més ràpid
      const evade = Math.min(0.2, Math.max(0, (statV(D, 'vel') / Math.max(1, statV(A, 'vel')) - 1) * 0.25));
      if (!e.sure && rnd(s) * 100 >= mv.acc * (1 - evade) * Math.max(0.5, 1 + (A.buf.acc ? A.buf.acc[0] : 0))) { ev.push(Object.assign(base, { miss: 1 })); return; }
      let at = statV(A, 'atk'); if (mv.cat === 'especial') at = (at + statV(A, 'int')) / 2;
      const df = statV(D, 'def'), eff = GD.cmEff(A.type, D.type), crit = rnd(s) < GD.CMB.CRIT;
      let d = (GD.CMB.BAL[A.id + ':' + A.form] || 1) * e.pow * (at + 6) / (df + 6) * (GD.CMB.DMG + A.lvl * GD.CMB.DMGL) * eff * (0.82 + rnd(s) * 0.18) * bonus;
      if (crit) d *= 1.5;
      if (s.turn > GD.CMB.FATIGUE) d *= 1 + (s.turn - GD.CMB.FATIGUE) * 0.06;
      if (e.exec && D.hp / D.maxHp < 0.3) d *= 2;
      if (D.vuln) d *= 1 + D.vuln[0];
      if (D.shield) d *= 1 - D.shield[0];
      d = Math.max(1, Math.round(d));
      D.hp = Math.max(0, D.hp - d); A.dealt += d;
      const x = Object.assign(base, { dmg: d, eff, crit: crit ? 1 : 0 });
      if (D.reflect && D.hp > 0) { const r = Math.max(1, Math.round(d * D.reflect)); A.hp = Math.max(0, A.hp - r); x.reflect = r; }
      if (e.leech) { A.hp = Math.min(A.maxHp, A.hp + d); x.heal = d; }
      if (e.drain) { const r = Math.round(D.maxEn * e.drain); D.en = Math.max(0, D.en - r); A.en = Math.min(A.maxEn, A.en + r); x.drain = r; }
      if (e.stun && D.hp > 0 && rnd(s) < 0.5) { D.stun = 1; x.stun = 1; }
      if (e.self) addBuf(A, e.self.s, e.self.v * bonus, e.self.n);
      ev.push(x);
      return;
    }
    const v = (e.v || 0) * bonus, x = Object.assign(base, { fx: e.k });
    if (e.k === 'dodge') A.dodge = 1;
    else if (e.k === 'reflect') A.reflect = v;
    else if (e.k === 'heal') { const h = Math.round(A.maxHp * v); A.hp = Math.min(A.maxHp, A.hp + h); x.heal = h; }
    else if (e.k === 'hot') A.hot = [v, e.n];
    else if (e.k === 'energy') { const h = Math.round(A.maxEn * v); A.en = Math.min(A.maxEn, A.en + h); x.en = h; }
    else if (e.k === 'shield') A.shield = [Math.min(0.6, v), e.n];
    else if (e.k === 'cleanse') { Object.keys(A.buf).forEach(b => { if (A.buf[b][0] < 0) delete A.buf[b]; }); A.vuln = null; A.stun = 0; A.shield = [0.25, 1]; }
    else if (e.k === 'vuln') { D.vuln = [v, e.n]; x.target = D.name; }
    else if (e.k === 'stun') { if (rnd(s) < 0.6) { D.stun = 1; x.target = D.name; } else x.miss = 1; }
    else if (e.k === 'debuff') { addBuf(D, e.s, -v, e.n); x.target = D.name; x.s = e.s; }
    else if (e.k === 'buff') { addBuf(A, e.s, v, e.n); x.s = e.s; }
    ev.push(x);
  }

  // Juga un torn. acts = [acció del costat 0, acció del costat 1]. Retorna la llista d'esdeveniments.
  GD.cmBattleTurn = (s, acts) => {
    const ev = [];
    if (s.over) return ev;
    s.turn++;
    [0, 1].forEach(i => {
      s.sides[i].team.forEach(f => { f.reflect = 0; });
      const a = acts[i];
      if (a && a.t === 'switch') {
        const to = a.to | 0, f = s.sides[i].team[to];
        if (f && f.hp > 0 && to !== s.sides[i].act) { s.sides[i].act = to; ev.push({ k: 'switch', side: i, who: f.name }); }
      }
    });
    const att = [0, 1].filter(i => acts[i] && acts[i].t === 'atk').map(i => {
      const f = cur(s, i), mv = f.moves[acts[i].i | 0];
      return { i, f, mv, act: acts[i] };
    });
    att.forEach(o => { o.pr = (o.mv && o.mv.e.first ? 1000 : 0) + statV(o.f, 'vel') + rnd(s) * 0.5; });
    att.sort((a, b) => b.pr - a.pr);
    for (const o of att) {
      if (s.over) break;
      const A = o.f, D = cur(s, 1 - o.i);
      if (A.hp <= 0 || A !== cur(s, o.i)) continue;
      if (A.stun) { A.stun = 0; ev.push({ k: 'stunned', side: o.i, who: A.name }); continue; }
      let mv = o.mv;
      const idx = A.moves.indexOf(mv);
      if (!mv || A.en < mv.cost || A.cd[idx] > 0) mv = A.moves[0];
      hit(s, o.i, A, D, mv, o.act, ev);
      [[D, 1 - o.i], [A, o.i]].forEach(([f, side]) => {
        if (f.hp <= 0 && !f.fainted) {
          f.fainted = 1; ev.push({ k: 'faint', side, who: f.name });
          if (nextAlive(s, side)) ev.push({ k: 'switch', side, who: cur(s, side).name, auto: 1 });
          else s.over = { win: 1 - side };
        }
      });
    }
    // final del torn: energia, curació contínua i durada dels efectes
    s.sides.forEach((sd) => sd.team.forEach((f, k) => {
      if (f.hp <= 0) return;
      const active = k === sd.act;
      f.en = Math.min(f.maxEn, f.en + Math.round(GD.CMB.REGEN + f.st.ene * 0.25) * (active ? 1 : 2));
      if (f.hot && active) { const h = Math.round(f.maxHp * f.hot[0]); f.hp = Math.min(f.maxHp, f.hp + h); if (--f.hot[1] <= 0) f.hot = null; }
      Object.keys(f.cd).forEach(i => { if (f.cd[i] > 0) f.cd[i]--; });
      Object.keys(f.buf).forEach(b => { if (--f.buf[b][1] <= 0) delete f.buf[b]; });
      ['shield', 'vuln'].forEach(b => { if (f[b] && --f[b][1] <= 0) f[b] = null; });
    }));
    if (!s.over && s.turn >= GD.CMB.MAX_TURNS) s.over = { win: 1, timeout: 1 };
    return ev;
  };

  /* ---------- Decisió dels rivals ---------- */
  GD.cmBattleAI = (s, side, smart) => {
    const A = cur(s, side), D = cur(s, 1 - side);
    let best = 0, bestV = -1;
    GD.cmUsable(A).forEach(({ i, mv, ok }) => {
      if (!ok) return;
      const e = mv.e, hpA = A.hp / A.maxHp;
      let v;
      if (e.k === 'dmg') {
        const exp = e.pow * (e.sure ? 100 : mv.acc) / 100 * GD.cmEff(A.type, D.type) * (e.exec && D.hp / D.maxHp < 0.3 ? 2 : 1);
        v = exp * (statV(A, 'atk') + 6) / (statV(D, 'def') + 6) * (GD.CMB.DMG + A.lvl * GD.CMB.DMGL) >= D.hp ? 300 : exp;
        if (e.stun) v += 8;
      } else if (e.k === 'heal' || e.k === 'hot') v = hpA < 0.45 ? 70 : 2;
      else if (e.k === 'energy') v = A.en / A.maxEn < 0.35 ? 55 : 4;
      else if (e.k === 'cleanse') v = Object.values(A.buf).some(b => b[0] < 0) || A.vuln ? 45 : 10;
      else if (e.k === 'shield' || e.k === 'dodge' || e.k === 'reflect') v = hpA < 0.6 && !A.shield ? 38 : 8;
      else if (e.k === 'vuln') v = D.vuln ? 3 : 34;
      else if (e.k === 'stun') v = D.stun ? 0 : 30;
      else if (e.k === 'debuff') v = D.buf[e.s] && D.buf[e.s][0] < 0 ? 3 : 30;
      else v = A.buf[e.s] && A.buf[e.s][0] > 0 ? 3 : (s.turn <= 3 ? 40 : 18);
      v *= 1 + rnd(s) * (smart ? 0.25 : 0.9);
      if (v > bestV) { bestV = v; best = i; }
    });
    return { t: 'atk', i: best, q: true };
  };

  // Experiència que dona derrotar un Comerçmon d'aquest nivell
  GD.cmBattleXp = (lvl) => 10 + 4 * lvl;
})();
