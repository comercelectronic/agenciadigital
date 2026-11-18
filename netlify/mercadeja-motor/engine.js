/* Mercadeja · motor del joc. Pur i determinista: tot l'atzar surt de la llavor de la partida.
   El mateix codi funciona al navegador i a Node (proves i, en el futur, servidor multijugador).
   Totes les operacions econòmiques queden al registre (state.log) i les accions són idempotents (act.id). */
(function (root) {
  const NODE = typeof module !== 'undefined' && module.exports;
  const MD = NODE ? require('./data.js') : root.MD;
  const LL = NODE ? require('./llicons.js') : root.MLL;
  const E = {};

  /* ---------- Utilitats ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r0 = (v) => Math.round(v);
  const r2 = (v) => Math.round(v * 100) / 100;
  function rng(state) { // mulberry32 amb estat desat a la partida
    let t = (state.rng = (state.rng + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const dau = (s) => 1 + Math.floor(rng(s) * 6);
  function barreja(s, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng(s) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const eur = (v) => (Math.round(v)).toLocaleString('ca-ES') + ' €';
  E.eur = eur; E.clamp = clamp;
  const sector = (s) => MD.sectors[s.config.sector];
  const carta = (id) => MD.cartes.find(c => c.id === id);
  const casella = (i) => MD.tauler[i];
  const propDef = (id) => MD.tauler.find(c => c.id === id);
  E.carta = carta; E.propDef = propDef;

  /* ---------- Crear partida ---------- */
  E.crearPartida = function (cfg) {
    const config = Object.assign({ sector: 'alimentacio', rondes: 8, capital: 100000, dificultat: 'mitja', llavor: Date.now() % 2147483647, nom: 'Partida' }, cfg);
    const sec = MD.sectors[config.sector];
    const s = { v: 1, config, rng: (config.llavor >>> 0) || 1, ronda: 0, fase: 'inici', torn: 0, empreses: [], propietaris: {}, millores: {},
      piles: {}, esdeveniment: null, efectesMercat: [], log: [], fets: {}, ofertes: [], resultats: [], missatges: [], dau: null, pendent: null, estudi: null };
    config.empreses.forEach((e, i) => {
      const atr = {}; MD.ATR.forEach(a => atr[a] = 40);
      s.empreses.push({
        id: i, nom: e.nom, fitxa: e.fitxa || MD.fitxes[i % MD.fitxes.length].id, humana: !!e.humana, perfil: e.perfil || 'equilibrada', membres: e.membres || [],
        pos: 0, diners: config.capital, deute: 0, deuteEmerg: 0, atr, preu: sec.preuRef, canals: { botiga: true }, ampliacions: 0,
        not: MD.NOTORIETAT_INICIAL, rep: MD.REPUTACIO_INICIAL, efectes: [], campRonda: [], xp: 0, negociacions: 0, voltes: 0,
        inversio: { producte: 0, canals: 0, capacitat: 0, promocio: 0 }, us4P: {}, hist: [], dificultat: false
      });
    });
    s.piles.empresa = barreja(s, MD.cartesPer(['oportunitat', 'crisi']).map(c => c.id));
    s.piles.oport = barreja(s, MD.cartesPer(['oportunitat']).map(c => c.id));
    s.piles.mercat = barreja(s, MD.cartesPer(['calendari', 'territori', 'competitiva']).map(c => c.id));
    return s;
  };
  function roba(s, pila) {
    if (!s.piles[pila].length) {
      const tipus = pila === 'empresa' ? ['oportunitat', 'crisi'] : pila === 'oport' ? ['oportunitat'] : ['calendari', 'territori', 'competitiva'];
      s.piles[pila] = barreja(s, MD.cartesPer(tipus).map(c => c.id));
    }
    return carta(s.piles[pila].shift());
  }

  /* ---------- Registre i diners ---------- */
  function mou(s, emp, imp, concepte, tipus) {
    if (!imp) return;
    emp.diners = r0(emp.diners + imp);
    s.log.push({ ronda: s.ronda, fase: s.fase, emp: emp.id, empresa: emp.nom, tipus: tipus || (imp > 0 ? 'ingres' : 'despesa'), concepte, import: r0(imp), saldo: emp.diners });
  }
  E.mou = mou;
  const msg = (s, t, cls) => { s.missatges.push({ t, cls: cls || '' }); };

  /* ---------- Càlculs de l'empresa ---------- */
  const efectesActius = (s, emp) => emp.efectes.filter(f => f.fins >= s.ronda);
  const efectesMercat = (s) => s.efectesMercat.filter(f => f.fins >= s.ronda).map(f => carta(f.carta));
  const propsDe = (s, emp) => Object.keys(s.propietaris).filter(k => s.propietaris[k] === emp.id);
  E.propsDe = propsDe;
  function benefProp(s, id) { const p = propDef(id), m = s.millores[id] ? MD.MILLORA_PROP.benefici : 1; return { p, m }; }
  E.mitjanaAtr = (emp) => MD.ATR.reduce((a, k) => a + emp.atr[k], 0) / MD.ATR.length;
  E.costUnitari = function (s, emp) {
    const sec = sector(s);
    let c = sec.costBase * (0.84 + 0.4 * E.mitjanaAtr(emp) / 100);
    efectesActius(s, emp).forEach(f => { if (f.e.costMult) c *= f.e.costMult; });
    let red = 0; propsDe(s, emp).forEach(id => { const { p, m } = benefProp(s, id); if (p.ben.cost) red += p.ben.cost * m; });
    // Economies d'escala: com més unitats es van vendre l'última ronda, més barat surt cada unitat (fins a un −12 %)
    if (emp.darrer) red += MD.ESCALA.max * clamp((emp.darrer.unitats / sec.bd - MD.ESCALA.des) / MD.ESCALA.rang, 0, 1);
    efectesMercat(s).forEach(c2 => { if (c2.e.costMultTots) c *= c2.e.costMultTots; });
    return r2(c * (1 - red));
  };
  E.capacitats = function (s, emp) {
    const bd = sector(s).bd;
    let prod = MD.CAPACITAT_INICIAL + emp.ampliacions * MD.CAPACITAT_AMPLIAR.cap, dist = 0;
    MD.CAN.forEach(k => { if (emp.canals[k]) dist += MD.canals[k].cap; });
    propsDe(s, emp).forEach(id => { const { p, m } = benefProp(s, id); if (p.ben.prod) prod += p.ben.prod * m; if (p.ben.dist) dist += p.ben.dist * m; });
    efectesActius(s, emp).forEach(f => { if (f.e.cap) { prod += f.e.cap; dist += f.e.cap; } if (f.e.capProd) prod *= f.e.capProd; if (f.e.capDist) dist *= f.e.capDist; });
    return { prod: r0(prod * bd), dist: r0(dist * bd), total: r0(Math.min(prod, dist) * bd) };
  };
  E.cobertura = function (s, emp) {
    const out = {};
    const premis = []; efectesMercat(s).forEach(c => { if (c.e.premiCanal) premis.push(c.e.premiCanal); if (c.e.premiCanal2) premis.push(c.e.premiCanal2); });
    MD.SEG.forEach(seg => {
      let q = 1;
      MD.CAN.forEach(k => { if (emp.canals[k]) q *= 1 - clamp(MD.canals[k].cov[seg] + (premis.includes(k) ? 15 : 0), 0, 95) / 100; });
      let v = 100 * (1 - q);
      propsDe(s, emp).forEach(id => { const { p, m } = benefProp(s, id); if (p.ben.cov && p.ben.cov[seg]) v += p.ben.cov[seg] * m; });
      efectesActius(s, emp).forEach(f => { if (f.e.cobSeg && f.e.cobSeg[seg]) v += f.e.cobSeg[seg]; if (f.e.cobTots) v += f.e.cobTots; });
      out[seg] = r0(clamp(v, 0, 100));
    });
    return out;
  };
  E.comissioMitjana = function (emp) {
    let cap = 0, com = 0; MD.CAN.forEach(k => { if (emp.canals[k]) { cap += MD.canals[k].cap; com += MD.canals[k].cap * MD.canals[k].comissio; } });
    return cap ? com / cap : 0;
  };
  E.costosFixos = function (s, emp) {
    let f = MD.COSTOS_FIXOS_BASE; MD.CAN.forEach(k => { if (emp.canals[k]) f += MD.canals[k].fix; });
    propsDe(s, emp).forEach(id => { f += propDef(id).mant; });
    return f;
  };
  E.qualitatPercebuda = (emp) => clamp(0.8 * (0.5 * emp.atr.qualitat + 0.2 * emp.atr.disseny + 0.3 * emp.atr.servei) + 0.2 * emp.rep, 0, 100);
  E.valorEmpresa = function (s, emp) {
    const V = MD.VALORACIO;
    let props = 0, mill = 0; propsDe(s, emp).forEach(id => { props += propDef(id).preu * V.propietat; if (s.millores[id]) mill += propDef(id).preu * MD.MILLORA_PROP.cost * V.millora; });
    const actius = props + mill + emp.inversio.capacitat * V.capacitat + emp.inversio.canals * V.canal + emp.inversio.producte * V.producte;
    const marca = (emp.not + emp.rep) * V.marca;
    return { tresoreria: emp.diners, propietats: r0(props + mill), altresActius: r0(emp.inversio.capacitat * V.capacitat + emp.inversio.canals * V.canal + emp.inversio.producte * V.producte),
      marca: r0(marca), deute: emp.deute + emp.deuteEmerg, total: r0(emp.diners + actius + marca - emp.deute - emp.deuteEmerg) };
  };

  /* ---------- Índex d'atractiu i repartiment de la demanda ---------- */
  E.atractiu = function (s, emp) {
    const sec = sector(s), cob = E.cobertura(s, emp), Q = E.qualitatPercebuda(emp), mercat = efectesMercat(s);
    const out = {};
    MD.SEG.forEach(seg => {
      const sg = MD.segments[seg];
      let e = sg.e; mercat.forEach(c => { if (c.e.elasticitat && c.e.elasticitat[seg]) e *= c.e.elasticitat[seg]; });
      const P = clamp(100 * Math.pow((0.8 * sec.preuRef) / emp.preu, e), 0, 100);
      let N = emp.not + 0.12 * emp.atr.innovacio; emp.campRonda.forEach(k => { if (MD.campanyes[k].seg.includes(seg)) N += MD.campanyes[k].not * 0.6; });
      N = clamp(N, 0, 100);
      const S = seg === 'preu' ? P : seg === 'qualitat' ? (emp.atr.qualitat + emp.atr.servei) / 2 : seg === 'innovadors' ? (emp.atr.innovacio + emp.atr.disseny) / 2 : (0.6 * emp.atr.sostenibilitat + 0.4 * emp.rep);
      let wQ = sg.w.Q; mercat.forEach(c => { if (c.e.pesQ) wQ *= c.e.pesQ; });
      let A = sg.w.P * P + wQ * Q + sg.w.N * N + sg.w.D * cob[seg] + sg.w.S * S;
      if (seg === 'preu') emp.campRonda.forEach(k => { if (MD.campanyes[k].impuls) A += MD.campanyes[k].impuls; });
      if (mercat.some(c => c.temporada === 'turisme' || (c.e && c.e.temporada === 'turisme')) && propsDe(s, emp).some(id => propDef(id).ben.temporada === 'turisme')) A *= 1.08;
      out[seg] = { A: r2(clamp(A, 0, 100)), P: r0(P), Q: r0(Q), N: r0(N), D: cob[seg], S: r0(S) };
    });
    return out;
  };
  E.demandaSegments = function (s) {
    const sec = sector(s), n = s.empreses.length, out = {};
    MD.SEG.forEach(seg => {
      let m = 1; efectesMercat(s).forEach(c => { const d = c.e.demanda; if (d) { if (d.tots) m *= d.tots; if (d[seg]) m *= d[seg]; } });
      out[seg] = r0(sec.bd * n * MD.segments[seg].pes * m);
    });
    return out;
  };

  /* ---------- Resolució del mercat ---------- */
  E.resoldreMercat = function (s) {
    const sec = sector(s), dem = E.demandaSegments(s);
    let fora = MD.ATRACTIU_FORA; efectesMercat(s).forEach(c => { if (c.e.fora) fora *= c.e.fora; });
    const atr = s.empreses.map(e => E.atractiu(s, e));
    const res = s.empreses.map((e, i) => ({ emp: i, assignat: 0, segAssignat: {}, segVenut: {}, atractiu: atr[i] }));
    MD.SEG.forEach(seg => {
      const tot = atr.reduce((a, x) => a + x[seg].A * x[seg].A, 0) + fora * fora;
      res.forEach((r, i) => { const u = dem[seg] * (atr[i][seg].A * atr[i][seg].A) / tot; r.segAssignat[seg] = u; r.assignat += u; });
    });
    let totalVenut = 0;
    res.forEach((r, i) => {
      const e = s.empreses[i], cap = E.capacitats(s, e).total;
      r.capacitat = cap;
      const factor = r.assignat > cap ? cap / r.assignat : 1;
      r.unitats = 0; MD.SEG.forEach(seg => { r.segVenut[seg] = r0(r.segAssignat[seg] * factor); r.unitats += r.segVenut[seg]; });
      r.assignat = r0(r.assignat); r.perdudes = Math.max(0, r.assignat - r.unitats);
      totalVenut += r.unitats;
    });
    res.forEach((r, i) => {
      const e = s.empreses[i], ant = e.hist[e.hist.length - 1];
      r.preu = e.preu; r.costUnitari = E.costUnitari(s, e);
      r.ingressos = r0(r.unitats * e.preu);
      r.costVariable = r0(r.unitats * r.costUnitari);
      r.comissions = r0(r.ingressos * E.comissioMitjana(e));
      r.margeBrut = r.ingressos - r.costVariable - r.comissions;
      r.costosFixos = E.costosFixos(s, e);
      r.promocio = e.campRonda.reduce((a, k) => a + MD.campanyes[k].cost, 0);
      r.beneficiOperatiu = r.margeBrut - r.costosFixos - r.promocio;
      r.interessos = r0(e.deute * MD.PRESTEC.interes + e.deuteEmerg * MD.PRESTEC.interesEmergencia);
      r.altres = s.log.filter(l => l.ronda === s.ronda && l.emp === i && l.tipus === 'altres').reduce((a, l) => a + l.import, 0);
      r.resultat = r.beneficiOperatiu - r.interessos + r.altres;
      r.quota = totalVenut ? r2(r.unitats / totalVenut * 100) : 0;
      // Moviments de tresoreria de la resolució (la promoció i els altres ja s'han pagat durant la ronda)
      mou(s, e, r.ingressos, 'Vendes: ' + r.unitats.toLocaleString('ca-ES') + ' ' + sec.unitats + ' a ' + eur(e.preu), 'vendes');
      mou(s, e, -r.costVariable, 'Cost variable (' + r.costUnitari.toLocaleString('ca-ES') + ' € per unitat)', 'cost');
      mou(s, e, -r.comissions, 'Comissions dels canals', 'cost');
      mou(s, e, -r.costosFixos, 'Costos fixos (estructura, canals i manteniment)', 'cost');
      mou(s, e, -r.interessos, 'Interessos dels préstecs', 'financer');
      // Satisfacció i reputació
      const Qb = 0.5 * e.atr.qualitat + 0.2 * e.atr.disseny + 0.3 * e.atr.servei;
      const valor = clamp(Qb - 60 * (e.preu / sec.preuRef - 1), 0, 100);
      const disp = r.assignat ? 100 * r.unitats / r.assignat : 100;
      r.satisfaccio = r0(clamp(0.45 * Qb + 0.25 * valor + 0.2 * disp + 0.1 * e.atr.servei, 0, 100));
      e.rep = r0(clamp(e.rep + 0.25 * (r.satisfaccio - e.rep), 0, 100));
      r.reputacio = e.rep; r.notorietat = r0(e.not);
      // XP
      let xp = 0; if (r.resultat > 0) xp += 10; if (ant && r.quota > ant.quota) xp += 10; xp += 5 * Object.keys(e.us4P).length; if (e.rep >= 70) xp += 15;
      e.xp += xp; r.xp = xp;
      r.capacitats = E.capacitats(s, e); r.cobertura = E.cobertura(s, e); r.us4P = Object.keys(e.us4P);
      r.explicacio = E.explicar(s, e, r, atr);
      r.ronda = s.ronda;
    });
    // Classificació i tancament de la ronda
    res.forEach((r, i) => {
      const e = s.empreses[i];
      if (e.diners < 0) { const falta = -e.diners; e.deuteEmerg += falta; mou(s, e, falta, 'Préstec d\'emergència (dificultat financera)', 'financer'); e.dificultat = true; msg(s, e.nom + ' ha entrat en dificultat financera: rep un préstec d\'emergència de ' + eur(falta) + ' al 6 %.', 'neg'); }
      r.valor = E.valorEmpresa(s, e).total; r.tresoreria = e.diners; r.deute = e.deute + e.deuteEmerg;
      e.not = r2(e.not * MD.NOTORIETAT_OBLIT); e.darrer = r; e.hist.push(r); e.campRonda = []; e.us4P = {};
    });
    const ordre = res.slice().sort((a, b) => b.valor - a.valor);
    ordre.forEach((r, k) => { r.posicio = k + 1; const e = s.empreses[r.emp], ant = e.hist[e.hist.length - 2]; r.canviPosicio = ant ? ant.posicio - r.posicio : 0; });
    s.resultats.push({ ronda: s.ronda, demanda: dem, empreses: res.map(r => ({ emp: r.emp, unitats: r.unitats, quota: r.quota, resultat: r.resultat, valor: r.valor, preu: r.preu, posicio: r.posicio })) });
    return res;
  };

  // Per què ha passat? Comparació de cada component amb la mitjana del mercat
  E.explicar = function (s, e, r, atr) {
    const out = [], sec = sector(s), i = e.id, n = s.empreses.length;
    const mitja = (seg, k) => atr.reduce((a, x) => a + x[seg][k], 0) / n;
    const preus = s.empreses.map(x => x.preu), minP = Math.min(...preus), maxP = Math.max(...preus);
    if (e.preu === minP && n > 1 && minP < maxP) out.push(['+', 'Tens el preu més baix (' + eur(e.preu) + '): guanyes clients sensibles al preu.']);
    if (e.preu === maxP && n > 1 && minP < maxP) out.push([atr[i].qualitat.Q >= mitja('qualitat', 'Q') ? '=' : '−', 'Tens el preu més alt (' + eur(e.preu) + ')' + (atr[i].qualitat.Q >= mitja('qualitat', 'Q') ? ': el compensa la qualitat percebuda.' : ', però la qualitat percebuda no el justifica.')]);
    if (r.costUnitari >= e.preu) out.push(['−', 'Vens per sota del cost unitari (' + r.costUnitari.toLocaleString('ca-ES') + ' €): cada venda perd diners.']);
    else if ((e.preu - r.costUnitari) / e.preu < 0.25) out.push(['−', 'El marge per unitat és molt baix (' + Math.round((e.preu - r.costUnitari) / e.preu * 100) + ' %).']);
    if (r.perdudes > Math.max(1, r.assignat * 0.01)) out.push(['−', 'No has pogut servir ' + r.perdudes.toLocaleString('ca-ES') + ' ' + sec.unitats + ': et falta capacitat de ' + (r.capacitats.prod < r.capacitats.dist ? 'producció' : 'distribució') + '.']);
    else if (r.capacitat > r.assignat * 1.6 && r.assignat > 0) out.push(['=', 'Tens molta capacitat sense fer servir: els canals i la producció costen diners encara que no venguis.']);
    if (e.not < mitja('preu', 'N') * 0.8) out.push(['−', 'La teva notorietat (' + r0(e.not) + ') és més baixa que la mitjana: et coneix menys gent.']);
    else if (atr[i].preu.N > mitja('preu', 'N') * 1.2) out.push(['+', 'Ets una de les marques més conegudes del mercat.']);
    const bestSeg = MD.SEG.slice().sort((a, b) => (atr[i][b].A - mitja(b, 'A')) - (atr[i][a].A - mitja(a, 'A')))[0];
    if (atr[i][bestSeg].A > mitja(bestSeg, 'A') * 1.05) out.push(['+', 'El teu punt fort és el segment «' + MD.segments[bestSeg].nom.toLowerCase() + '».']);
    const worst = MD.SEG.slice().sort((a, b) => (atr[i][a].A - mitja(a, 'A')) - (atr[i][b].A - mitja(b, 'A')))[0];
    if (atr[i][worst].A < mitja(worst, 'A') * 0.9) out.push(['−', 'Ets poc atractiu per al segment «' + MD.segments[worst].nom.toLowerCase() + '»: ' + ({ preu: 'revisa el preu', qualitat: 'millora la qualitat i el servei', innovadors: 'millora la innovació i el disseny', responsables: 'millora la sostenibilitat i la reputació' })[worst] + '.']);
    if (r.promocio && r.promocio > r.margeBrut * 0.5 && r.margeBrut > 0) out.push(['=', 'La promoció ha costat més de la meitat del marge brut: comprova si les vendes ho justifiquen.']);
    return out.slice(0, 5);
  };

  /* ---------- Fases i accions ---------- */
  E.FASES = ['esdeveniment', 'decisions', 'moviment', 'mercat', 'resultats'];
  E.NOM_FASE = { inici: 'Preparació', esdeveniment: 'Esdeveniment', decisions: 'Decisions', moviment: 'Tauler', mercat: 'Mercat', resultats: 'Resultats', final: 'Final', pausa: 'Pausa' };

  E.iniciarRonda = function (s) {
    s.ronda++; s.fase = 'esdeveniment'; s.torn = 0; s.pendent = null; s.estudi = null; s.missatges = [];
    const c = roba(s, 'mercat');
    s.esdeveniment = c.id;
    aplicaCartaMercat(s, c);
    return c;
  };
  function aplicaCartaMercat(s, c) {
    s.efectesMercat.push({ carta: c.id, fins: s.ronda + (c.e.rondes || 1) - 1 });
    if (c.e.notTots) s.empreses.forEach(e => { e.not = clamp(e.not + c.e.notTots, 0, 100); });
    if (c.e.atrTots) s.empreses.forEach(e => { Object.entries(c.e.atrTots).forEach(([k, v]) => { e.atr[k] = clamp(e.atr[k] + v, 0, 100); }); });
    s.log.push({ ronda: s.ronda, fase: s.fase, emp: -1, empresa: 'Mercat', tipus: 'esdeveniment', concepte: c.titol, import: 0 });
  }
  function aplicaCartaEmpresa(s, emp, c) {
    const e = c.e;
    if (e.diners) mou(s, emp, e.diners, 'Carta: ' + c.titol, 'altres');
    if (e.not) emp.not = clamp(emp.not + e.not, 0, 100);
    if (e.rep) emp.rep = clamp(emp.rep + e.rep, 0, 100);
    if (e.atr) Object.entries(e.atr).forEach(([k, v]) => { emp.atr[k] = clamp(emp.atr[k] + v, 0, 100); });
    if (e.costMult || e.cap || e.capProd || e.capDist || e.cobSeg || e.cobTots) emp.efectes.push({ carta: c.id, e, fins: s.ronda + (e.rondes || 1) - 1 });
    s.log.push({ ronda: s.ronda, fase: s.fase, emp: emp.id, empresa: emp.nom, tipus: 'carta', concepte: c.titol, import: 0, saldo: emp.diners });
  }
  E.empresaTorn = (s) => s.empreses[s.torn];
  E.potPagar = (emp, imp) => emp.diners >= imp;

  // Executa una acció del jugador o de la IA. Retorna { ok, err }. Les accions amb id només s'executen una vegada.
  E.accio = function (s, a) {
    if (a.id && s.fets[a.id]) return { ok: true, repetida: true };
    const r = fer(s, a);
    if (r.ok && a.id) s.fets[a.id] = 1;
    return r;
  };
  function err(t) { return { ok: false, err: t }; }
  function fer(s, a) {
    const emp = a.emp != null ? s.empreses[a.emp] : null, sec = sector(s);
    const decidint = s.fase === 'decisions' && emp && s.torn === emp.id;
    switch (a.tipus) {
      case 'millorar': {
        if (!decidint) return err('Ara no és el moment de decidir.');
        const v = emp.atr[a.atr]; if (v == null) return err('Atribut desconegut.');
        if (v >= 100) return err('Aquest atribut ja és al màxim.');
        const c = MD.millorarCost(v); if (!E.potPagar(emp, c)) return err('No tens prou tresoreria.');
        mou(s, emp, -c, 'Millora de producte: ' + MD.atributs[a.atr].nom.toLowerCase(), 'inversio');
        emp.atr[a.atr] = clamp(v + MD.MILLORA_PASSOS, 0, 100); emp.inversio.producte += c; emp.us4P.producte = 1;
        return { ok: true };
      }
      case 'preu': {
        if (!decidint) return err('Ara no és el moment de decidir.');
        const v = r2(+a.valor); if (!(v >= sec.preuRef * MD.PREU_MIN && v <= sec.preuRef * MD.PREU_MAX)) return err('El preu ha d\'estar entre ' + eur(sec.preuRef * MD.PREU_MIN) + ' i ' + eur(sec.preuRef * MD.PREU_MAX) + '.');
        if (v !== emp.preu) { emp.preu = v; emp.us4P.preu = 1; s.log.push({ ronda: s.ronda, fase: s.fase, emp: emp.id, empresa: emp.nom, tipus: 'decisio', concepte: 'Preu de venda: ' + eur(v), import: 0, saldo: emp.diners }); }
        return { ok: true };
      }
      case 'canal': {
        if (!decidint) return err('Ara no és el moment de decidir.');
        const c = MD.canals[a.canal]; if (!c) return err('Canal desconegut.');
        if (a.actiu) {
          if (emp.canals[a.canal]) return { ok: true };
          if (!E.potPagar(emp, c.activar)) return err('No tens prou tresoreria.');
          mou(s, emp, -c.activar, 'Activació del canal: ' + c.nom, 'inversio'); emp.inversio.canals += c.activar; emp.canals[a.canal] = true;
        } else {
          if (!emp.canals[a.canal]) return { ok: true };
          if (Object.values(emp.canals).filter(Boolean).length <= 1) return err('Has de tenir com a mínim un canal actiu.');
          emp.canals[a.canal] = false; emp.inversio.canals = Math.max(0, emp.inversio.canals - c.activar);
          s.log.push({ ronda: s.ronda, fase: s.fase, emp: emp.id, empresa: emp.nom, tipus: 'decisio', concepte: 'Tanca el canal: ' + c.nom, import: 0, saldo: emp.diners });
        }
        emp.us4P.distribucio = 1; return { ok: true };
      }
      case 'capacitat': {
        if (!decidint) return err('Ara no és el moment de decidir.');
        const c = MD.CAPACITAT_AMPLIAR.cost; if (!E.potPagar(emp, c)) return err('No tens prou tresoreria.');
        mou(s, emp, -c, 'Ampliació de la capacitat de producció', 'inversio'); emp.ampliacions++; emp.inversio.capacitat += c; emp.us4P.distribucio = 1;
        return { ok: true };
      }
      case 'campanya': {
        if (!decidint) return err('Ara no és el moment de decidir.');
        const c = MD.campanyes[a.camp]; if (!c) return err('Campanya desconeguda.');
        if (emp.campRonda.includes(a.camp)) return err('Aquesta campanya ja està contractada aquesta ronda.');
        if (!E.potPagar(emp, c.cost)) return err('No tens prou tresoreria.');
        mou(s, emp, -c.cost, 'Campanya: ' + c.nom, 'promocio');
        emp.campRonda.push(a.camp); emp.inversio.promocio += c.cost; emp.us4P.promocio = 1;
        emp.not = clamp(emp.not + c.not * (1 - emp.not / 120), 0, 100);
        if (c.rep) emp.rep = clamp(emp.rep + c.rep, 0, 100);
        if (c.cob) emp.efectes.push({ carta: 'camp-' + a.camp, e: { cobTots: c.cob }, fins: s.ronda });
        return { ok: true };
      }
      case 'prestec': {
        if (!decidint) return err('Ara no és el moment de decidir.');
        const v = r0(+a.import); if (!(v > 0)) return err('Import no vàlid.');
        if (emp.deute + v > MD.PRESTEC.maxim) return err('El límit de préstecs és ' + eur(MD.PRESTEC.maxim) + '.');
        emp.deute += v; mou(s, emp, v, 'Préstec bancari (' + Math.round(MD.PRESTEC.interes * 100) + ' % per ronda)', 'financer');
        return { ok: true };
      }
      case 'retornar': {
        if (!decidint) return err('Ara no és el moment de decidir.');
        let v = r0(+a.import); const total = emp.deute + emp.deuteEmerg; v = Math.min(v, total);
        if (!(v > 0)) return err('No tens deute per retornar.');
        if (!E.potPagar(emp, v)) return err('No tens prou tresoreria.');
        const em = Math.min(v, emp.deuteEmerg); emp.deuteEmerg -= em; emp.deute -= (v - em);
        mou(s, emp, -v, 'Devolució de préstec', 'financer');
        if (!emp.deuteEmerg) emp.dificultat = false;
        return { ok: true };
      }
      case 'oferta': { // comprar una propietat a una altra empresa
        if (!decidint) return err('Ara no és el moment de negociar.');
        const p = propDef(a.prop); if (!p) return err('Propietat desconeguda.');
        const prop = s.propietaris[a.prop]; if (prop == null || prop === emp.id) return err('Aquesta propietat no és d\'una altra empresa.');
        const v = r0(+a.import); if (!(v > 0)) return err('Import no vàlid.'); if (!E.potPagar(emp, v)) return err('No tens prou tresoreria.');
        const of = { id: 'of' + s.ronda + '-' + s.ofertes.length, de: emp.id, a: prop, prop: a.prop, import: v, estat: 'pendent' };
        s.ofertes.push(of); return { ok: true, oferta: of };
      }
      case 'respondre': {
        const of = s.ofertes.find(o => o.id === a.oferta); if (!of || of.estat !== 'pendent') return err('Aquesta oferta ja no és vàlida.');
        if (!a.accepta) { of.estat = 'rebutjada'; return { ok: true }; }
        const comp = s.empreses[of.de], ven = s.empreses[of.a];
        if (s.propietaris[of.prop] !== ven.id) { of.estat = 'anul·lada'; return Object.assign(err('La propietat ja no és del venedor.'), { muta: true }); }
        if (!E.potPagar(comp, of.import)) { of.estat = 'anul·lada'; return Object.assign(err('El comprador ja no té prou tresoreria.'), { muta: true }); }
        mou(s, comp, -of.import, 'Compra negociada: ' + propDef(of.prop).nom + ' a ' + ven.nom, 'inversio');
        mou(s, ven, of.import, 'Venda negociada: ' + propDef(of.prop).nom + ' a ' + comp.nom, 'altres');
        s.propietaris[of.prop] = comp.id; of.estat = 'acceptada';
        comp.negociacions++; ven.negociacions++; comp.xp += 10; ven.xp += 10;
        return { ok: true };
      }
      case 'confirmar': { // acaba les decisions d'aquesta empresa
        if (!decidint) return err('No és el teu torn.');
        s.log.push({ ronda: s.ronda, fase: s.fase, emp: emp.id, empresa: emp.nom, tipus: 'decisio', concepte: 'Decisions confirmades: ' + (Object.keys(emp.us4P).join(', ') || 'cap canvi'), import: 0, saldo: emp.diners });
        avancaTorn(s); return { ok: true };
      }
      case 'tirar': {
        if (s.fase !== 'moviment' || !emp || s.torn !== emp.id || s.pendent) return err('Ara no et toca tirar.');
        const d1 = dau(s), d2 = dau(s); s.dau = [d1, d2];
        const ant = emp.pos; emp.pos = (emp.pos + d1 + d2) % MD.tauler.length;
        if (emp.pos < ant || emp.pos === 0) { emp.voltes++; mou(s, emp, MD.INGRES_SORTIDA, 'Pas per l\'inici de negoci', 'altres'); }
        s.pendent = resoldreCasella(s, emp);
        return { ok: true, daus: [d1, d2], desde: ant, pendent: s.pendent };
      }
      case 'comprar': {
        const pe = s.pendent; if (!pe || pe.tipus !== 'compra' || pe.emp !== emp.id) return err('No hi ha res per comprar.');
        const p = propDef(pe.prop); if (s.propietaris[p.id] != null) return err('Ja té propietari.');
        if (!E.potPagar(emp, p.preu)) return err('No tens prou tresoreria.');
        mou(s, emp, -p.preu, 'Compra de l\'actiu: ' + p.nom, 'inversio'); s.propietaris[p.id] = emp.id;
        s.pendent = null; avancaTorn(s); return { ok: true };
      }
      case 'millorarProp': {
        const pe = s.pendent; if (!pe || pe.tipus !== 'propia' || pe.emp !== emp.id) return err('No pots millorar aquest actiu ara.');
        const p = propDef(pe.prop), c = r0(p.preu * MD.MILLORA_PROP.cost);
        if (s.millores[p.id]) return err('Ja està millorat.'); if (!E.potPagar(emp, c)) return err('No tens prou tresoreria.');
        mou(s, emp, -c, 'Millora de l\'actiu: ' + p.nom, 'inversio'); s.millores[p.id] = 1;
        s.pendent = null; avancaTorn(s); return { ok: true };
      }
      case 'acceptar': { // promoció local o parada a la fira
        const pe = s.pendent; if (!pe || pe.emp !== emp.id || !['promo', 'fira'].includes(pe.tipus)) return err('No hi ha res per acceptar.');
        const c = pe.tipus === 'promo' ? 2000 : 4000; if (!E.potPagar(emp, c)) return err('No tens prou tresoreria.');
        mou(s, emp, -c, pe.tipus === 'promo' ? 'Promoció local' : 'Parada a la fira', 'promocio'); emp.inversio.promocio += c;
        emp.not = clamp(emp.not + (pe.tipus === 'promo' ? 8 : 10), 0, 100);
        if (pe.tipus === 'fira') emp.efectes.push({ carta: 'fira', e: { cobTots: 10 }, fins: s.ronda });
        emp.us4P.promocio = 1; s.pendent = null; avancaTorn(s); return { ok: true };
      }
      case 'passar': {
        const pe = s.pendent; if (!pe || pe.emp !== emp.id) return err('No hi ha res pendent.');
        s.pendent = null; avancaTorn(s); return { ok: true };
      }
      case 'llico': { // resposta a la pregunta d'una lliçó (es pot fer en qualsevol moment)
        const l = LL && LL.per(a.llico); if (!l || !emp) return err('Lliçó desconeguda.');
        s.llicons = s.llicons || {}; const m = (s.llicons[emp.id] = s.llicons[emp.id] || {});
        if (m[a.llico]) return err('Aquesta lliçó ja està resposta.');
        const ok = +a.resposta === l.pregunta.c;
        m[a.llico] = { r: +a.resposta, ok, ronda: s.ronda }; emp.xp += ok ? 10 : 3;
        return { ok: true, encert: ok };
      }
      case 'continuar': { // fases sense decisió
        if (s.fase === 'esdeveniment') { s.fase = 'decisions'; s.torn = 0; return { ok: true }; }
        if (s.fase === 'mercat') { s.fase = 'resultats'; return { ok: true }; }
        if (s.fase === 'resultats') { if (s.ronda >= s.config.rondes) { s.fase = 'final'; return { ok: true, final: true }; } E.iniciarRonda(s); return { ok: true }; }
        return err('No es pot continuar ara.');
      }
      default: return err('Acció desconeguda: ' + a.tipus);
    }
  }
  function avancaTorn(s) {
    s.torn++;
    if (s.torn < s.empreses.length) return;
    s.torn = 0;
    if (s.fase === 'decisions') { s.fase = 'moviment'; s.dau = null; return; }
    if (s.fase === 'moviment') { s.fase = 'mercat'; s.darrerMercat = E.resoldreMercat(s); }
  }
  E.avancaTorn = avancaTorn;
  // Què passa en caure a una casella: s'aplica el que és automàtic i es retorna què cal decidir
  function resoldreCasella(s, emp) {
    const c = casella(emp.pos), out = { emp: emp.id, casella: emp.pos, tipus: 'info', text: '' };
    switch (c.t) {
      case 'sortida': out.text = 'Inici de negoci: cobres ' + eur(MD.INGRES_SORTIDA) + '.'; break;
      case 'prop': {
        const prop = s.propietaris[c.id];
        if (prop == null) { out.tipus = 'compra'; out.prop = c.id; out.text = c.nom + ' està disponible per ' + eur(c.preu) + '.'; return out; }
        if (prop === emp.id) { if (!s.millores[c.id]) { out.tipus = 'propia'; out.prop = c.id; out.text = 'És teu. El pots millorar per ' + eur(c.preu * MD.MILLORA_PROP.cost) + '.'; return out; } out.text = 'És teu i ja està millorat.'; break; }
        const amo = s.empreses[prop], t = c.taxa * (s.millores[c.id] ? MD.MILLORA_PROP.taxa : 1);
        mou(s, emp, -t, 'Taxa d\'ús: ' + c.nom + ' (de ' + amo.nom + ')', 'altres'); mou(s, amo, t, 'Taxa cobrada: ' + c.nom + ' (a ' + emp.nom + ')', 'altres');
        out.text = c.nom + ' és de ' + amo.nom + ': pagues una taxa de ' + eur(t) + '.'; break;
      }
      case 'oport': { const k = roba(s, 'oport'); aplicaCartaEmpresa(s, emp, k); out.tipus = 'carta'; out.carta = k.id; out.text = k.titol; break; }
      case 'empresa': { const k = roba(s, 'empresa'); aplicaCartaEmpresa(s, emp, k); out.tipus = 'carta'; out.carta = k.id; out.text = k.titol; break; }
      case 'mercat': { const k = roba(s, 'mercat'); aplicaCartaMercat(s, k); out.tipus = 'carta'; out.carta = k.id; out.mercat = true; out.text = k.titol; break; }
      case 'imposts': { const b = emp.darrer ? emp.darrer.resultat : 0, t = Math.max(1000, r0(b * 0.1 / 100) * 100); mou(s, emp, -t, 'Impostos empresarials', 'altres'); out.text = 'Pagues ' + eur(t) + ' d\'impostos.'; break; }
      case 'consultoria': { emp.estudis = (emp.estudis || 0) + 1; s.estudi = { emp: emp.id, atr: s.empreses.map(e => E.atractiu(s, e)) }; out.tipus = 'estudi'; out.text = 'Estudi de mercat gratuït.'; break; }
      case 'promo': out.tipus = 'promo'; out.text = c.desc; return out;
      case 'fira': out.tipus = 'fira'; out.text = c.desc; return out;
      case 'auditoria': {
        const ok = emp.darrer && emp.darrer.resultat > 0 && emp.rep >= 50;
        mou(s, emp, ok ? 3000 : -2000, 'Auditoria empresarial', 'altres');
        out.text = ok ? 'Auditoria favorable: cobres 3.000 €.' : 'L\'auditoria troba punts febles: pagues 2.000 €.'; break;
      }
    }
    return out; // info, carta o estudi: el jugador només ha de continuar (acció «passar»)
  }

  /* ---------- Intel·ligència artificial ---------- */
  // Només fa servir informació pública: preus i resultats publicats de les rondes anteriors i el propi estat.
  E.decidirIA = function (s, i) {
    const e = s.empreses[i], P = MD.perfilsIA[e.perfil] || MD.perfilsIA.equilibrada, sec = sector(s), dif = s.config.dificultat;
    const A = (a) => E.accio(s, Object.assign({ emp: i }, a));
    const soroll = dif === 'facil' ? 0.12 : dif === 'mitja' ? 0.05 : 0.0;
    const reserva = 20000 + (dif === 'facil' ? 10000 : 0);
    const cu = E.costUnitari(s, e), d = e.darrer;
    // Preu
    let p = sec.preuRef * P.preu * (1 + (rng(s) * 2 - 1) * soroll);
    if (d && dif !== 'facil') {
      if (d.perdudes > d.unitats * 0.05) p = Math.max(p, e.preu * 1.05);           // venut tot: es pot apujar
      if (dif === 'dificil' && d.quota < 100 / s.empreses.length * 0.7) p *= 0.95;  // poca quota: més agressiu
      const pubs = s.resultats.length ? s.resultats[s.resultats.length - 1].empreses.map(x => x.preu) : [];
      if (dif === 'dificil' && pubs.length) { const mitja = pubs.reduce((a, b) => a + b, 0) / pubs.length; if (e.perfil === 'agressiva') p = Math.min(p, mitja * 0.92); }
    }
    p = clamp(p, Math.max(cu * 1.18, sec.preuRef * MD.PREU_MIN), sec.preuRef * MD.PREU_MAX);
    A({ tipus: 'preu', valor: Math.round(p * 100) / 100 });
    // Distribució i capacitat
    if (d && d.perdudes > d.unitats * 0.08) {
      const cap = E.capacitats(s, e);
      if (cap.prod <= cap.dist) { if (e.diners - MD.CAPACITAT_AMPLIAR.cost > reserva) A({ tipus: 'capacitat' }); }
      else { const nou = P.canals.find(k => !e.canals[k]); if (nou && e.diners - MD.canals[nou].activar > reserva) A({ tipus: 'canal', canal: nou, actiu: true }); }
    } else if (!d && dif !== 'facil') { const nou = P.canals[0]; if (!e.canals[nou] && e.diners - MD.canals[nou].activar > 60000) A({ tipus: 'canal', canal: nou, actiu: true }); }
    // Producte
    let pressProd = e.diners * (dif === 'facil' ? 0.06 : 0.12);
    for (let k = 0; k < 3 && pressProd > 0; k++) {
      const atr = P.atr.slice().sort((a, b) => e.atr[a] - e.atr[b])[0], c = MD.millorarCost(e.atr[atr]);
      if (c > pressProd || e.diners - c < reserva || e.atr[atr] >= 95) break;
      A({ tipus: 'millorar', atr }); pressProd -= c;
    }
    // Promoció
    let pressProm = Math.max(0, e.diners - reserva) * (dif === 'facil' ? 0.05 : 0.09);
    for (const k of P.camp) { const c = MD.campanyes[k].cost; if (c <= pressProm && e.diners - c > reserva) { A({ tipus: 'campanya', camp: k }); pressProm -= c; } }
    if (dif === 'dificil' && e.not < 25 && e.diners - 3500 > reserva) A({ tipus: 'campanya', camp: 'digital' });
    // Finances
    if (e.deuteEmerg && e.diners > e.deuteEmerg + reserva) A({ tipus: 'retornar', import: e.deuteEmerg });
    A({ tipus: 'confirmar' });
  };
  // Decisió de la IA a la casella on ha caigut
  E.resoldreIA = function (s, i) {
    const e = s.empreses[i], P = MD.perfilsIA[e.perfil] || MD.perfilsIA.equilibrada, pe = s.pendent;
    if (!pe) return;
    const marge = 25000 * (1 - P.compra) + 10000;
    if (pe.tipus === 'compra') { const p = propDef(pe.prop); if (e.diners - p.preu > marge) return E.accio(s, { tipus: 'comprar', emp: i }); }
    if (pe.tipus === 'propia') { const p = propDef(pe.prop); if (e.diners - p.preu * MD.MILLORA_PROP.cost > marge + 10000) return E.accio(s, { tipus: 'millorarProp', emp: i }); }
    if ((pe.tipus === 'promo' || pe.tipus === 'fira') && e.diners > 40000 && e.not < 60) return E.accio(s, { tipus: 'acceptar', emp: i });
    return E.accio(s, { tipus: 'passar', emp: i });
  };
  // Resposta de la IA a una oferta de compra d'un actiu seu
  E.respostaIA = function (s, of) {
    const p = propDef(of.prop); return of.import >= p.preu * 1.3;
  };

  /* ---------- Final de partida ---------- */
  E.classificacio = (s) => s.empreses.map(e => ({ e, v: E.valorEmpresa(s, e) })).sort((a, b) => b.v.total - a.v.total);
  E.reconeixements = function (s) {
    const em = s.empreses, out = {};
    const best = (f, min) => { let m = null, bv = -Infinity; em.forEach(e => { const v = f(e); if (v > bv && (min == null || v >= min)) { bv = v; m = e; } }); return m ? m.id : null; };
    const sum = (e, k) => e.hist.reduce((a, h) => a + (h[k] || 0), 0);
    out.rendible = best(e => sum(e, 'resultat'));
    out.quota = best(e => e.hist.length ? sum(e, 'quota') / e.hist.length : 0);
    out.innovadora = best(e => e.atr.innovacio);
    out.reputacio = best(e => e.rep);
    out.producte = best(e => E.mitjanaAtr(e));
    out.preu = best(e => { const ing = sum(e, 'ingressos'); return ing ? sum(e, 'margeBrut') / ing * (e.hist.length ? sum(e, 'quota') / e.hist.length : 0) : 0; });
    out.distribucio = best(e => { const a = sum(e, 'assignat'); return a ? sum(e, 'unitats') / a * 100 + MD.SEG.reduce((x, k) => x + E.cobertura(s, e)[k], 0) / 4 : 0; });
    out.promocio = best(e => e.inversio.promocio ? e.not / (e.inversio.promocio / 10000) + e.not : e.not);
    out.sostenible = best(e => e.atr.sostenibilitat + e.rep / 2);
    out.negociador = best(e => e.negociacions, 1);
    return out;
  };

  /* ---------- Informe per al professor ---------- */
  E.csvResultats = function (s) {
    const rows = [['Ronda', 'Empresa', 'Preu', 'Unitats', 'Quota %', 'Ingressos', 'Cost variable', 'Comissions', 'Costos fixos', 'Promoció', 'Benefici operatiu', 'Resultat', 'Tresoreria', 'Deute', 'Valor empresarial', 'Notorietat', 'Reputació', 'Satisfacció', 'Posició', '4P treballades']];
    s.empreses.forEach(e => e.hist.forEach(h => rows.push([h.ronda, e.nom, h.preu, h.unitats, h.quota, h.ingressos, h.costVariable, h.comissions, h.costosFixos, h.promocio, h.beneficiOperatiu, h.resultat, h.tresoreria, h.deute, h.valor, h.notorietat, h.reputacio, h.satisfaccio, h.posicio, (h.us4P || []).join(' ')])));
    return rows.map(r => r.map(v => /[;"\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v).join(';')).join('\n');
  };
  E.csvRegistre = function (s) {
    const rows = [['Ronda', 'Fase', 'Empresa', 'Tipus', 'Concepte', 'Import', 'Saldo']];
    s.log.forEach(l => rows.push([l.ronda, l.fase, l.empresa, l.tipus, l.concepte, l.import, l.saldo == null ? '' : l.saldo]));
    return rows.map(r => r.map(v => /[;"\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v).join(';')).join('\n');
  };

  /* ---------- Registre d'accions: reproduir i verificar una partida sense servidor ----------
     Cada partida desa la seqüència d'accions (S.reg). Com que el motor és determinista, a partir de la
     configuració i del registre es torna a obtenir exactament el mateix estat. */
  const CODI = { millorar: 'm', preu: 'p', canal: 'c', capacitat: 'k', campanya: 'a', prestec: 'l', retornar: 'r', oferta: 'o', respondre: 's', confirmar: 'f', tirar: 't', comprar: 'b', millorarProp: 'u', acceptar: 'x', passar: 'z', continuar: 'n', llico: 'q' };
  const DECODI = Object.fromEntries(Object.entries(CODI).map(([k, v]) => [v, k]));
  const ARGS = { millorar: ['atr'], preu: ['valor'], canal: ['canal', 'actiu'], campanya: ['camp'], prestec: ['import'], retornar: ['import'], oferta: ['prop', 'import'], respondre: ['oferta', 'accepta'], llico: ['llico', 'resposta'] };
  E.compacta = (reg) => reg.map(r => {
    if (r.ia) return [r.ia, r.emp == null ? -1 : r.emp];
    return [CODI[r.tipus], r.emp == null ? -1 : r.emp].concat((ARGS[r.tipus] || []).map(k => typeof r[k] === 'boolean' ? (r[k] ? 1 : 0) : r[k]));
  });
  E.descompacta = (arr) => arr.map(x => {
    if (['I', 'D', 'R', 'F'].includes(x[0])) return { ia: x[0], emp: x[1] < 0 ? null : x[1] };
    const tipus = DECODI[x[0]], a = { tipus }; if (x[1] >= 0) a.emp = x[1];
    (ARGS[tipus] || []).forEach((k, i) => { a[k] = x[2 + i]; }); if (tipus === 'canal') a.actiu = !!a.actiu; if (tipus === 'respondre') a.accepta = !!a.accepta;
    return a;
  });
  // Aplica una entrada del registre (acció de jugador o torn de la IA)
  E.aplica = function (s, r) {
    if (r.ia === 'I') { E.iniciarRonda(s); return { ok: true }; }
    if (r.ia === 'D') { E.decidirIA(s, r.emp); return { ok: true }; }
    if (r.ia === 'R') { E.resoldreIA(s, r.emp); return { ok: true }; }
    if (r.ia === 'F') { s.fase = 'final'; return { ok: true }; } // el docent acaba la partida abans d'hora
    const a = Object.assign({}, r); delete a.id; return fer(s, a);
  };
  E.repetir = function (cfg, reg) {
    const s = E.crearPartida(cfg); let errors = 0;
    reg.forEach(r => { const x = E.aplica(s, r); if (!x.ok && !x.muta) errors++; }); // al registre només hi ha accions que han canviat la partida
    s.reg = reg.slice(); return { s, errors };
  };

  /* ---------- Reptes de classe: tots els equips juguen la mateixa partida ----------
     Codi llegible (per dictar o escriure a la pissarra): A8M-K3X9QZ = sector, rondes, dificultat i llavor. */
  const SECT = { alimentacio: 'A', moda: 'M', tecnologia: 'T', turisme: 'U' }, SECT_R = Object.fromEntries(Object.entries(SECT).map(([k, v]) => [v, k]));
  const DIF = { facil: 'F', mitja: 'M', dificil: 'D' }, DIF_R = Object.fromEntries(Object.entries(DIF).map(([k, v]) => [v, k]));
  const RONDES = { 4: '4', 8: '8', 12: 'C' }, RONDES_R = { 4: 4, 8: 8, C: 12 };
  E.codiRepte = (sector, rondes, dificultat, llavor) => SECT[sector] + RONDES[rondes] + DIF[dificultat] + '-' + (llavor >>> 0).toString(36).toUpperCase().padStart(6, '0');
  E.llegirRepte = function (codi) {
    const m = String(codi || '').trim().toUpperCase().replace(/\s/g, '').match(/^([AMTU])([48C])([FMD])-?([0-9A-Z]{1,7})$/);
    if (!m) return null;
    const llavor = parseInt(m[4], 36); if (!(llavor > 0)) return null;
    return { codi: m[1] + m[2] + m[3] + '-' + m[4].padStart(6, '0'), sector: SECT_R[m[1]], rondes: RONDES_R[m[2]], dificultat: DIF_R[m[3]], llavor };
  };
  // Mateixos rivals per a tots els equips: tres empreses de la IA amb estratègies diferents
  E.RIVALS = [['premium', 'diamant'], ['agressiva', 'llamp'], ['innovadora', 'corona']];
  E.cfgRepte = function (rep, equip) {
    const noms = MD.empresesSuggerides[rep.sector];
    return { nom: equip.repteNom || 'Repte de classe', sector: rep.sector, rondes: rep.rondes, capital: 100000, dificultat: rep.dificultat, llavor: rep.llavor,
      repte: { codi: rep.codi, nom: equip.repteNom || '' },
      empreses: [{ nom: equip.nom, fitxa: 'coet', humana: true, membres: equip.membres || [] }].concat(E.RIVALS.map(([perfil, fitxa], i) => ({ nom: noms[i + 1], fitxa, perfil }))) };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = E; else root.ME = E;
})(typeof window !== 'undefined' ? window : globalThis);
