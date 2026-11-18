/* Mercadeja · motor de la botiga. Pur i determinista: tot l'atzar surt de la llavor del repte, en fluxos separats
   per dia i per propòsit, de manera que tots els equips d'un repte tenen els mateixos esdeveniments i el mateix carrer.
   El mateix codi funciona al navegador, a les proves (Node) i al servidor (verificació dels resultats). */
(function (root) {
  const NODE = typeof module !== 'undefined' && module.exports;
  const MD = NODE ? require('./data.js') : root.MD;
  const LL = NODE ? require('./llicons.js') : root.MLL;
  const E = {};

  /* ---------- Utilitats ---------- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r0 = (v) => Math.round(v);
  const r2 = (v) => Math.round(v * 100) / 100;
  function hash(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0; } return h || 1; }
  // Generador mulberry32 independent per a cada (llavor, clau)
  function rngDe(llavor, clau) {
    let a = (hash(String(llavor >>> 0) + '|' + clau)) >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const eur = (v) => (Math.round(v)).toLocaleString('ca-ES') + ' €';
  const eur2 = (v) => (Math.round(v * 100) / 100).toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  E.eur = eur; E.eur2 = eur2; E.clamp = clamp; E.rngDe = rngDe;
  const prod = (id) => MD.productes[id];
  E.prod = prod;
  E.esdeveniment = (id) => MD.esdeveniments.find(x => x.id === id);

  /* ---------- Crear partida ---------- */
  E.crearPartida = function (cfg) {
    const config = Object.assign({ sector: 'alimentacio', rondes: 8, capital: MD.CAPITAL, dificultat: 'mitja', llavor: 12345, nom: 'Partida' }, cfg);
    const h = (config.empreses || [])[0] || { nom: 'La meva botiga' };
    const s = { v: 2, config, ronda: 0, fase: 'inici', empreses: [], esdeveniment: null, log: [], fets: {}, dia: null, llicons: {} };
    const inicials = ['motlle', 'llet', 'fruita', 'fuet'];
    const estoc = {}; inicials.forEach(p => { estoc[p] = 20; });
    s.empreses.push({
      id: 0, nom: String(h.nom || 'La meva botiga').slice(0, 30), humana: true, membres: (h.membres || []).slice(0, 4), fitxa: 'coet', color: '#F5C542',
      diners: config.capital, nPrest: MD.PRESTATGES_INICIALS, prestatges: inicials.map(p => ({ prod: p, preu: prod(p).ref })),
      estoc, serveis: { dependent: false, online: false, horari: false }, onlineActivat: false,
      promosDia: [], aparador: null, enquesta: null, objectiu: 0, imgDia: 0,
      not: MD.NOT_INI, rep: MD.REP_INI, xp: 0, estudis: 0, hist: [], darrer: null,
      inversio: { prestatges: 0, online: 0, promocio: 0, compres: 0 }, us4P: {}
    });
    MD.RIVALS.forEach((r, i) => s.empreses.push({
      id: i + 1, nom: r.nom, humana: false, perfil: r.perfil, color: r.color, rival: r.id, diners: config.capital,
      prods: r.prods.slice(), preuMult: r.preu, not: r.not, rep: MD.REP_INI, xp: 0, hist: [], darrer: null, promosDia: []
    }));
    return s;
  };

  /* ---------- Registre i diners ---------- */
  function mou(s, emp, imp, concepte, tipus) {
    if (!imp) return;
    emp.diners = r2(emp.diners + imp);
    s.log.push({ ronda: s.ronda, fase: s.fase, emp: emp.id, empresa: emp.nom, tipus: tipus || (imp > 0 ? 'ingres' : 'despesa'), concepte, import: r2(imp), saldo: emp.diners });
  }
  const jugador = (s) => s.empreses[0];
  E.jugador = jugador;

  /* ---------- Atractiu de cada botiga per a cada tipus de client ---------- */
  function catalegDe(s, e) {
    if (e.humana) return e.prestatges.slice(0, e.nPrest).filter(x => x && x.prod).map(x => ({ prod: x.prod, preu: x.preu * (e.promosDia.includes('descompte') ? 0.9 : 1) }));
    const ev = E.esdeveniment(s.esdeveniment) || { e: {} };
    const m = e.preuMult * (e.rival === 'estalvi' && ev.e.rivalPreu ? ev.e.rivalPreu : 1) * (e.preuSoroll || 1);
    return e.prods.map(p => ({ prod: p, preu: r2(prod(p).ref * m) }));
  }
  E.catalegDe = catalegDe;
  // Encaix d'un producte amb el que busca un tipus de client (0-1)
  const encaix = (seg, p) => { const g = MD.segments[seg].gust, P = prod(p); let n = 0, d = 0; Object.keys(g).forEach(k => { n += g[k] * (P[k] || 0); d += g[k]; }); return n / 100 / d; };
  E.encaix = encaix;
  E.atractiu = function (s, e) {
    const cat = catalegDe(s, e), out = {};
    const ratio = cat.length ? cat.reduce((a, x) => a + x.preu / prod(x.prod).ref, 0) / cat.length : 1.5;
    const Q = clamp((cat.length ? cat.reduce((a, x) => a + prod(x.prod).q, 0) / cat.length : 0) + (e.imgDia || 0), 0, 100);
    const assort = clamp(cat.length / MD.PRESTATGES_MAX * 100, 0, 100);
    MD.SEG.forEach(seg => {
      const sg = MD.segments[seg];
      const P = clamp(100 * Math.pow(0.9 / ratio, sg.e), 0, 100);
      let N = e.not;
      (e.promosDia || []).forEach(k => { const pr = MD.promos[k]; if (pr && pr.seg.includes(seg)) N += pr.not * 0.8; });
      if (e.aparador && MD.aparadors[e.aparador] && MD.aparadors[e.aparador].seg === seg) N += 12;
      N = clamp(N, 0, 100);
      const F = seg === 'preu' ? P : clamp(Math.max(0, ...cat.map(x => encaix(seg, x.prod))) * 100, 0, 100);
      const A = sg.w.P * P + sg.w.Q * Q + sg.w.N * N + sg.w.F * F + sg.w.A * assort + sg.w.R * e.rep;
      out[seg] = { A: r2(A), P: r0(P), Q: r0(Q), N: r0(N), F: r0(F), Ast: r0(assort), R: r0(e.rep) };
    });
    return out;
  };
  // Quota de la gent que tria cada botiga (atractiu al quadrat, amb l'opció de no comprar enlloc)
  function quotes(s, atr, online) {
    const out = s.empreses.map(() => ({}));
    MD.SEG.forEach(seg => {
      const A = atr.map((a, i) => online && !(i === 0 && s.empreses[0].serveis.online) ? 0 : a[seg].A);
      const tot = A.reduce((x, v) => x + v * v, 0) + MD.FORA * MD.FORA;
      A.forEach((v, i) => { out[i][seg] = v * v / tot; });
    });
    return out;
  }
  E.demanda = function (s, online) {
    const ev = E.esdeveniment(s.esdeveniment) || { e: {} }, out = {};
    MD.SEG.forEach(seg => {
      let m = 1; const d = ev.e.demanda || {}; if (d.tots) m *= d.tots; if (d[seg]) m *= d[seg];
      out[seg] = online ? MD.TRANSIT_ONLINE * MD.ONLINE_PES[seg] * (ev.e.online || 1) * m : MD.TRANSIT * MD.segments[seg].pes * m;
    });
    return out;
  };

  // Què compra (o per què no compra) un client d'un tipus a la botiga del jugador
  function decideix(s, e, seg, r) {
    const sg = MD.segments[seg], ev = E.esdeveniment(s.esdeveniment) || { e: {} }, sens = sg.sens * (ev.e.preuSens || 1);
    // Cada client tria entre els productes que li agraden i pot pagar: més probable com més li convé (amb varietat)
    const cand = []; let adequat = false;
    catalegDe(s, e).forEach(x => {
      const a = encaix(seg, x.prod) + (r() - 0.5) * 0.16, ratio = x.preu / prod(x.prod).ref;
      if (a < sg.min) return;
      adequat = true;
      if (ratio > sg.maxPreu / (1 + ((ev.e.preuSens || 1) - 1) * 0.5)) return;
      cand.push({ prod: x.prod, u: a - sens * (ratio - 1) * 0.35 });
    });
    if (cand.length) {
      const mx = Math.max(...cand.map(c => c.u)), w = cand.map(c => Math.exp((c.u - mx) / 0.08)), tot = w.reduce((x, y) => x + y, 0);
      let t = r() * tot; for (let i = 0; i < cand.length; i++) { t -= w[i]; if (t <= 0) return { prod: cand[i].prod, motiu: 0 }; }
      return { prod: cand[cand.length - 1].prod, motiu: 0 };
    }
    return { prod: null, motiu: adequat ? 1 : 2 };   // 1: massa car · 2: no hi ha res per a ell
  }

  /* ---------- Dies ---------- */
  E.FASES = ['planificacio', 'botiga', 'resultats'];
  E.NOM_FASE = { inici: 'Preparació', planificacio: 'Planificació', botiga: 'Botiga oberta', resultats: 'Resultats', final: 'Final' };
  E.MOTIUS = ['Comprat', 'Massa car', 'No hi ha res per a mi', 'S\'ha acabat', 'Massa cua'];
  E.iniciarDia = function (s) {
    s.ronda++; s.fase = 'planificacio'; s.dia = null;
    const r = rngDe(s.config.llavor, 'esdev-' + s.ronda);
    const pool = MD.esdeveniments.filter(x => x.id !== 'normal');
    s.esdeveniment = s.ronda === 1 ? 'normal' : (r() < 0.25 ? 'normal' : pool[Math.floor(r() * pool.length)].id);
    const ev = E.esdeveniment(s.esdeveniment);
    s.empreses.forEach(e => { e.promosDia = []; e.imgDia = 0; if (e.humana) { e.aparador = null; e.enquesta = null; e.us4P = {}; } if (ev.e.notTots) e.not = clamp(e.not + ev.e.notTots, 0, 100); });
    s.log.push({ ronda: s.ronda, fase: s.fase, emp: -1, empresa: 'Barri', tipus: 'esdeveniment', concepte: ev.titol, import: 0 });
    return ev;
  };
  E.iniciarRonda = E.iniciarDia;

  // Decisions diàries de les botigues rivals (només depenen de la llavor i del dia)
  function decideixRivals(s) {
    const dif = s.config.dificultat;
    s.empreses.filter(e => !e.humana).forEach(e => {
      const r = rngDe(s.config.llavor, 'ia-' + e.rival + '-' + s.ronda), def = MD.RIVALS.find(x => x.id === e.rival);
      e.preuSoroll = 1 + (r() - 0.5) * (dif === 'facil' ? 0.12 : 0.06);
      e.promosDia = [];
      const pr = dif === 'facil' ? 0.35 : dif === 'mitja' ? 0.55 : 0.75;
      if (r() < pr) { const k = def.promos[Math.floor(r() * def.promos.length)]; e.promosDia.push(k); e.not = clamp(e.not + MD.promos[k].not * (1 - e.not / 120), 0, 100); if (MD.promos[k].img) e.imgDia = MD.promos[k].img; }
    });
  }

  // Obre la botiga: calcula el mercat del dia i la llista de clients que vindran (i les comandes en línia)
  function obrir(s) {
    const e = jugador(s);
    if (e.aparador) { const a = MD.aparadors[e.aparador]; mou(s, e, -a.cost, 'Aparador: ' + a.nom.toLowerCase(), 'promocio'); e.inversio.promocio += a.cost; e.us4P.promocio = 1; }
    decideixRivals(s);
    const atr = s.empreses.map(x => E.atractiu(s, x));
    const q = quotes(s, atr, false), qOn = quotes(s, atr, true), dem = E.demanda(s, false), demOn = E.demanda(s, true);
    const r = rngDe(s.config.llavor, 'clients-' + s.ronda);
    const clients = []; let id = 0;
    const mult = e.serveis.horari ? 1.2 : 1;
    MD.SEG.forEach(seg => {
      const n = Math.round(dem[seg] * q[0][seg] * mult), sg = MD.segments[seg];
      for (let k = 0; k < n; k++) {
        const d = decideix(s, e, seg, r);
        clients.push({ id: 0, seg, t: r2(0.02 + r() * 0.84), qty: sg.qty[0] + Math.floor(r() * (sg.qty[1] - sg.qty[0] + 1)), prod: d.prod, motiu: d.motiu, pac: r0(20 + r() * 14), online: false, look: Math.floor(r() * 1000) });
      }
      if (e.serveis.online) {
        const m = Math.round(demOn[seg] * qOn[0][seg]);
        for (let k = 0; k < m; k++) {
          const d = decideix(s, e, seg, r);
          if (d.motiu) continue; // a la web, qui no hi troba res simplement no fa la comanda
          clients.push({ id: 0, seg, t: r2(0.05 + r() * 0.8), qty: 1 + Math.floor(r() * 3), prod: d.prod, motiu: 0, pac: r0(40 + r() * 15), online: true, look: Math.floor(r() * 1000) });
        }
      }
    });
    clients.sort((a, b) => a.t - b.t).forEach(c => { c.id = id++; });
    s.dia = { clients, atr, quotes: q, demanda: dem, estocInici: Object.assign({}, e.estoc) };
    s.fase = 'botiga';
  }
  E.obrir = obrir;

  // Tanca el dia amb el que ha passat a la botiga: res = [[idClient, unitatsVenudes, motiu], ...]
  function tancar(s, res) {
    const e = jugador(s), dia = s.dia, cl = dia.clients;
    if (!Array.isArray(res)) return err('Falten els resultats del dia.');
    const per = {}; res.forEach(x => { if (Array.isArray(x)) per[x[0]] = x; });
    const venut = {}; let invalid = false;
    const out = cl.map(c => {
      const x = per[c.id] || [c.id, 0, c.motiu || 4];
      const v = Math.max(0, Math.floor(+x[1] || 0)), m = +x[2] || 0;
      if (c.motiu) { if (v || m !== c.motiu) invalid = true; return { c, v: 0, m: c.motiu }; }
      if (v > c.qty || ![0, 3, 4].includes(m) || (v === 0 && m === 0)) invalid = true;
      if (v > 0) venut[c.prod] = (venut[c.prod] || 0) + v;
      return { c, v, m: v > 0 ? 0 : m };
    });
    Object.keys(venut).forEach(p => { if (venut[p] > (dia.estocInici[p] || 0)) invalid = true; });
    if (invalid) return err('Els resultats del dia no són coherents amb la botiga.');
    // Economia del dia
    const desc = e.promosDia.includes('descompte') ? 0.9 : 1, preuDe = {};
    e.prestatges.forEach(x => { if (x && x.prod) preuDe[x.prod] = x.preu * desc; });
    let ingressos = 0, cogs = 0, unitats = 0, servits = 0, onlineN = 0;
    const perduts = { preu: 0, assortiment: 0, esgotat: 0, cua: 0 }, perSeg = {};
    MD.SEG.forEach(k => { perSeg[k] = { entren: 0, compren: 0, perduts: { preu: 0, assortiment: 0, esgotat: 0, cua: 0 } }; });
    out.forEach(({ c, v, m }) => {
      perSeg[c.seg].entren++;
      if (v > 0) { ingressos += v * preuDe[c.prod]; cogs += v * prod(c.prod).cost; unitats += v; servits++; perSeg[c.seg].compren++; if (c.online) onlineN++; e.estoc[c.prod] -= v; }
      else { const k = ['', 'preu', 'assortiment', 'esgotat', 'cua'][m]; perduts[k]++; perSeg[c.seg].perduts[k]++; }
    });
    ingressos = r2(ingressos); cogs = r2(cogs);
    // Merma: el producte perible que sobra es fa malbé en part
    let merma = 0, mermaU = 0;
    Object.keys(e.estoc).forEach(p => { if (prod(p).perible && e.estoc[p] > 0) { const w = Math.floor(e.estoc[p] * MD.MERMA); e.estoc[p] -= w; mermaU += w; merma += w * prod(p).cost; } });
    merma = r2(merma);
    const sv = MD.serveis;
    const serveis = (e.serveis.dependent ? sv.dependent.cost : 0) + (e.serveis.online ? sv.online.cost : 0) + (e.serveis.horari ? sv.horari.cost : 0);
    const comissions = r2(onlineN * sv.online.perComanda);
    const promocio = r2(s.log.filter(l => l.ronda === s.ronda && l.emp === 0 && l.tipus === 'promocio').reduce((a, l) => a - l.import, 0));
    const estudi = r2(s.log.filter(l => l.ronda === s.ronda && l.emp === 0 && l.tipus === 'estudi').reduce((a, l) => a - l.import, 0));
    mou(s, e, ingressos, 'Vendes: ' + unitats + ' unitats a ' + servits + ' clients', 'vendes');
    mou(s, e, -MD.FIXOS, 'Lloguer, llum i assegurances', 'fixos');
    if (serveis) mou(s, e, -serveis, 'Serveis: ' + Object.keys(e.serveis).filter(k => e.serveis[k]).map(k => sv[k].nom.toLowerCase()).join(', '), 'serveis');
    if (comissions) mou(s, e, -comissions, 'Embalatge i repartiment de ' + onlineN + ' comandes en línia', 'serveis');
    const resultat = r2(ingressos - cogs - merma - MD.FIXOS - serveis - comissions - promocio - estudi);
    // Satisfacció i reputació
    const total = cl.length || 1;
    const sat = r0(clamp(100 * (servits + 0.55 * (perduts.preu + perduts.assortiment) + 0.1 * (perduts.esgotat + perduts.cua)) / total, 0, 100));
    e.rep = r0(clamp(e.rep + 0.3 * (sat - e.rep), 0, 100));
    // Rivals: venda estimada amb el seu servei habitual
    const rivals = s.empreses.filter(x => !x.humana).map(x => venesRival(s, x));
    const totU = unitats + rivals.reduce((a, x) => a + x.unitats, 0);
    const actius = e.prestatges.slice(0, e.nPrest).filter(x => x && x.prod);
    const h = {
      ronda: s.ronda, esdeveniment: s.esdeveniment, ingressos, unitats, clients: cl.length, servits, online: onlineN, perduts, perSeg,
      cogs, merma, mermaU, fixos: MD.FIXOS, serveis, comissions, promocio, estudi, resultat,
      quota: totU ? r2(unitats / totU * 100) : 0, objectiu: e.objectiu || 0, satisfaccio: sat,
      preuMitja: r2(actius.reduce((a, x) => a + x.preu / prod(x.prod).ref, 0) / Math.max(1, actius.length)),
      preus: Object.fromEntries(actius.map(x => [x.prod, x.preu])),
      venuts: Object.assign({}, venut),
      us4P: Object.keys(e.us4P), notorietat: r0(e.not), reputacio: e.rep, atractiu: dia.atr[0], quotesCarrer: dia.quotes[0]
    };
    // Boca-orella i oblit
    e.not = r2(clamp(e.not * MD.OBLIT + servits * 0.12, 0, 100));
    let xp = 0; if (resultat > 0) xp += 10; xp += 5 * h.us4P.length; if (!perduts.cua && !perduts.esgotat && servits) xp += 10; if (h.objectiu && ingressos >= h.objectiu) xp += 10;
    e.xp += xp; h.xp = xp;
    h.explicacio = E.explicar(s, e, h, rivals);
    // Tancament: valor i posició de totes les botigues
    s.empreses.forEach((x, i) => {
      const hh = i === 0 ? h : rivals[i - 1];
      if (i > 0) { x.not = r2(clamp(x.not * MD.OBLIT + hh.servits * 0.12, 0, 100)); hh.quota = totU ? r2(hh.unitats / totU * 100) : 0; }
      hh.valor = E.valorEmpresa(s, x).total; hh.tresoreria = r0(x.diners);
      x.hist.push(hh); x.darrer = hh;
    });
    s.empreses.slice().sort((a, b) => b.darrer.valor - a.darrer.valor).forEach((x, k) => { const ant = x.hist[x.hist.length - 2]; x.darrer.posicio = k + 1; x.darrer.canviPosicio = ant ? ant.posicio - (k + 1) : 0; });
    s.fase = 'resultats';
    return { ok: true, h };
  }
  function venesRival(s, x) {
    const dia = s.dia, cat = catalegDe(s, x), servei = MD.SERVEI_IA[s.config.dificultat] || 0.84;
    let unitats = 0, ingressos = 0, cogs = 0, servits = 0, entren = 0;
    MD.SEG.forEach(seg => {
      const n = dia.demanda[seg] * dia.quotes[x.id][seg], sg = MD.segments[seg];
      entren += n;
      // Quina part dels clients troba alguna cosa adequada i assequible
      const bo = cat.filter(c => encaix(seg, c.prod) >= sg.min && c.preu / prod(c.prod).ref <= sg.maxPreu);
      const conv = (bo.length ? 0.9 : 0.25) * servei, qty = (sg.qty[0] + sg.qty[1]) / 2;
      const c = bo.length ? bo : cat; const pm = c.reduce((a, y) => a + y.preu, 0) / c.length, cm = c.reduce((a, y) => a + prod(y.prod).cost, 0) / c.length;
      servits += n * conv; unitats += n * conv * qty; ingressos += n * conv * qty * pm; cogs += n * conv * qty * cm;
    });
    const promo = (x.promosDia || []).reduce((a, k) => a + MD.promos[k].cost, 0);
    const resultat = r2(ingressos - cogs - (MD.FIXOS_RIVAL[s.config.dificultat] || 150) - promo - ingressos * 0.06); // inclou merma i petites despeses
    x.diners = r2(x.diners + resultat);
    const sat = r0(clamp(100 * servits / Math.max(1, entren) + 15, 0, 100));
    x.rep = r0(clamp(x.rep + 0.3 * (sat - x.rep), 0, 100));
    return { ronda: s.ronda, ingressos: r2(ingressos), unitats: r0(unitats), servits: r0(servits), clients: r0(entren), resultat, satisfaccio: sat, reputacio: x.rep, notorietat: r0(x.not), preuMitja: r2(cat.reduce((a, y) => a + y.preu / prod(y.prod).ref, 0) / cat.length) };
  }

  // Per què ha passat? Frases curtes a partir dels clients perduts i de la comparació amb les rivals
  E.explicar = function (s, e, h, rivals) {
    const out = [], P = h.perduts, segMax = (k) => MD.SEG.slice().sort((a, b) => h.perSeg[b].perduts[k] - h.perSeg[a].perduts[k])[0];
    if (P.preu >= 3) out.push(['−', P.preu + ' clients han marxat perquè els ha semblat massa car (sobretot ' + MD.segments[segMax('preu')].nom.toLowerCase() + '). Revisa el preu o tria productes que ells valorin més.']);
    if (P.assortiment >= 3) { const k = segMax('assortiment'); out.push(['−', P.assortiment + ' clients no han trobat res per a ells (sobretot ' + MD.segments[k].nom.toLowerCase() + ': ' + ({ preu: 'volen producte barat', qualitat: 'volen producte de qualitat', innovadors: 'volen novetats', responsables: 'volen producte ecològic o de proximitat' })[k] + ').']); }
    if (P.esgotat >= 2) out.push(['−', P.esgotat + ' clients han trobat la prestatgeria buida. Reposa abans o demana més estoc.']);
    if (P.cua >= 2) out.push(['−', P.cua + ' clients s\'han cansat d\'esperar. Atén el taulell o contracta una dependenta.']);
    if (h.mermaU >= 4) out.push(['=', 'S\'han fet malbé ' + h.mermaU + ' unitats de producte perible (' + eur(h.merma) + '). Ajusta les comandes.']);
    const quotaCarrer = MD.SEG.reduce((a, k) => a + h.quotesCarrer[k] * MD.segments[k].pes, 0);
    const millor = rivals.map((r, i) => ({ r, e: s.empreses[i + 1] })).sort((a, b) => b.r.clients - a.r.clients)[0];
    if (millor && millor.r.clients > h.clients * 1.2) out.push(['=', 'Molta gent ha anat a ' + millor.e.nom + ' (' + Math.round(millor.r.clients) + ' clients). ' + (millor.e.not > e.not + 5 ? 'És més coneguda: notorietat ' + Math.round(millor.e.not) + ' contra ' + Math.round(e.not) + '.' : 'Compara el seu preu i els seus productes amb els teus.')]);
    if (h.servits && !P.cua && !P.esgotat) out.push(['+', 'Cap client s\'ha quedat sense servir per culpa de la cua o l\'estoc: bona organització!']);
    if (h.resultat > 0) out.push(['+', 'Has guanyat ' + eur(h.resultat) + ' avui.']);
    else out.push(['−', 'Avui has perdut ' + eur(-h.resultat) + ': els costos fixos són de ' + eur(MD.FIXOS) + ' al dia i cal vendre prou per cobrir-los.']);
    if (quotaCarrer < 0.12) out.push(['−', 'Només el ' + Math.round(quotaCarrer * 100) + ' % de la gent del carrer ha entrat a la teva botiga. Fes-te conèixer (promoció) i millora l\'aparador.']);
    return out.slice(0, 6);
  };

  /* ---------- Valor de la botiga ---------- */
  E.valorEmpresa = function (s, e) {
    const V = MD.VALOR;
    if (!e.humana) { const marca = (e.not + e.rep) * V.marca; return { tresoreria: r0(e.diners), estoc: 600, actius: 0, marca: r0(marca), total: r0(e.diners + 600 + marca) }; }
    const estoc = Object.keys(e.estoc).reduce((a, p) => a + Math.max(0, e.estoc[p]) * prod(p).cost, 0);
    const actius = (e.nPrest - MD.PRESTATGES_INICIALS) * MD.PRESTATGE_COST * V.prestatge + (e.onlineActivat ? MD.serveis.online.activar * V.online : 0);
    const marca = (e.not + e.rep) * V.marca;
    return { tresoreria: r0(e.diners), estoc: r0(estoc), actius: r0(actius), marca: r0(marca), total: r0(e.diners + estoc + actius + marca) };
  };
  E.classificacio = (s) => s.empreses.map(e => ({ e, v: E.valorEmpresa(s, e) })).sort((a, b) => b.v.total - a.v.total);

  // Estudi de mercat (enquesta): què busca cada tipus de client i quanta gent t'escolliria avui
  function enquesta(s) {
    const atr = s.empreses.map(x => E.atractiu(s, x)), q = quotes(s, atr, false), dem = E.demanda(s, false);
    const out = {};
    MD.SEG.forEach(seg => {
      const prefs = MD.PROD.slice().sort((a, b) => encaix(seg, b) - encaix(seg, a)).slice(0, 3);
      out[seg] = { gent: r0(dem[seg]), teus: r0(dem[seg] * q[0][seg]), millorRival: s.empreses.slice(1).map((x, i) => ({ nom: x.nom, n: r0(dem[seg] * q[i + 1][seg]) })).sort((a, b) => b.n - a.n)[0], prefs, A: atr[0][seg] };
    });
    return out;
  }

  /* ---------- Accions ---------- */
  E.accio = function (s, a) {
    if (a.id && s.fets[a.id]) return { ok: true, repetida: true };
    const r = fer(s, a);
    if (r.ok && a.id) s.fets[a.id] = 1;
    return r;
  };
  function err(t) { return { ok: false, err: t }; }
  function fer(s, a) {
    const e = jugador(s), plan = s.fase === 'planificacio';
    const noPlan = plan ? null : err('Ara no és el moment de decidir: la botiga és oberta.');
    switch (a.tipus) {
      case 'producte': {
        if (noPlan) return noPlan;
        const k = +a.slot; if (!(k >= 0 && k < e.nPrest)) return err('Prestatgeria no vàlida.');
        if (a.prod && !prod(a.prod)) return err('Producte desconegut.');
        if (a.prod && e.prestatges.some((x, i) => i !== k && x && x.prod === a.prod)) return err('Aquest producte ja és en una altra prestatgeria.');
        const ant = e.prestatges[k];
        e.prestatges[k] = a.prod ? { prod: a.prod, preu: ant && ant.prod === a.prod ? ant.preu : prod(a.prod).ref } : { prod: null, preu: 0 };
        e.us4P.producte = 1; return { ok: true };
      }
      case 'preu': {
        if (noPlan) return noPlan;
        const x = e.prestatges[+a.slot]; if (!x || !x.prod) return err('Aquesta prestatgeria és buida.');
        const ref = prod(x.prod).ref, v = Math.round(+a.valor * 20) / 20;
        if (!(v >= ref * MD.PREU_MIN - 0.001 && v <= ref * MD.PREU_MAX + 0.001)) return err('El preu ha d\'estar entre ' + eur2(ref * MD.PREU_MIN) + ' i ' + eur2(ref * MD.PREU_MAX) + '.');
        if (v !== x.preu) { x.preu = v; e.us4P.preu = 1; }
        return { ok: true };
      }
      case 'comanda': {
        if (noPlan) return noPlan;
        const p = prod(a.prod), n = Math.floor(+a.caixes); if (!p) return err('Producte desconegut.');
        if (!(n >= 1 && n <= 20)) return err('Entre 1 i 20 caixes.');
        const c = r2(n * MD.CAIXA * p.cost); if (e.diners < c) return err('No tens prou diners.');
        mou(s, e, -c, 'Compra al proveïdor: ' + n + ' caixes de ' + p.nom.toLowerCase(), 'compres');
        e.estoc[a.prod] = (e.estoc[a.prod] || 0) + n * MD.CAIXA; e.inversio.compres += c; e.us4P.distribucio = 1;
        return { ok: true };
      }
      case 'prestatge': {
        if (noPlan) return noPlan;
        if (e.nPrest >= MD.PRESTATGES_MAX) return err('No hi caben més prestatgeries.');
        if (e.diners < MD.PRESTATGE_COST) return err('No tens prou diners.');
        mou(s, e, -MD.PRESTATGE_COST, 'Prestatgeria nova', 'inversio'); e.nPrest++; e.inversio.prestatges += MD.PRESTATGE_COST;
        while (e.prestatges.length < e.nPrest) e.prestatges.push({ prod: null, preu: 0 });
        e.us4P.producte = 1; return { ok: true };
      }
      case 'servei': {
        if (noPlan) return noPlan;
        const sv = MD.serveis[a.servei]; if (!sv) return err('Servei desconegut.');
        const on = !!a.actiu;
        if (on && a.servei === 'online' && !e.onlineActivat) {
          if (e.diners < sv.activar) return err('No tens prou diners per crear la botiga en línia.');
          mou(s, e, -sv.activar, 'Creació de la botiga en línia', 'inversio'); e.onlineActivat = true; e.inversio.online += sv.activar;
        }
        e.serveis[a.servei] = on; e.us4P.distribucio = 1; return { ok: true };
      }
      case 'promo': {
        if (noPlan) return noPlan;
        const p = MD.promos[a.promo]; if (!p) return err('Promoció desconeguda.');
        if (e.promosDia.includes(a.promo)) return err('Ja l\'has contractada avui.');
        if (e.diners < p.cost) return err('No tens prou diners.');
        mou(s, e, -p.cost, 'Promoció: ' + p.nom.toLowerCase(), 'promocio');
        e.promosDia.push(a.promo); e.inversio.promocio += p.cost; e.us4P.promocio = 1;
        e.not = r2(clamp(e.not + p.not * (1 - e.not / 120), 0, 100));
        if (p.img) e.imgDia = p.img; if (p.rep) e.rep = clamp(e.rep + p.rep, 0, 100);
        if (p.desc10) e.us4P.preu = 1;
        return { ok: true };
      }
      case 'aparador': {
        if (noPlan) return noPlan;
        if (a.tema && !MD.aparadors[a.tema]) return err('Tema desconegut.');
        e.aparador = a.tema || null; return { ok: true };
      }
      case 'enquesta': {
        if (noPlan) return noPlan;
        if (e.enquesta) return { ok: true, enquesta: e.enquesta };
        if (e.diners < MD.ENQUESTA_COST) return err('No tens prou diners.');
        mou(s, e, -MD.ENQUESTA_COST, 'Enquesta als clients del barri', 'estudi');
        e.enquesta = enquesta(s); e.estudis++; return { ok: true, enquesta: e.enquesta };
      }
      case 'objectiu': {
        if (noPlan) return noPlan;
        e.objectiu = clamp(Math.round(+a.valor || 0), 0, 100000); return { ok: true };
      }
      case 'obrir': {
        if (noPlan) return noPlan;
        if (!e.prestatges.slice(0, e.nPrest).some(x => x && x.prod)) return err('Posa algun producte a les prestatgeries abans d\'obrir.');
        obrir(s); return { ok: true, dia: s.dia };
      }
      case 'tancar': {
        if (s.fase !== 'botiga') return err('La botiga no és oberta.');
        return tancar(s, a.res);
      }
      case 'llico': {
        const l = LL && LL.per(a.llico); if (!l) return err('Lliçó desconeguda.');
        const m = (s.llicons[0] = s.llicons[0] || {});
        if (m[a.llico]) return err('Aquesta lliçó ja està resposta.');
        const ok = +a.resposta === l.pregunta.c;
        m[a.llico] = { r: +a.resposta, ok, ronda: s.ronda }; e.xp += ok ? 10 : 3;
        return { ok: true, encert: ok };
      }
      case 'continuar': {
        if (s.fase !== 'resultats') return err('No es pot continuar ara.');
        if (s.ronda >= s.config.rondes) { s.fase = 'final'; return { ok: true, final: true }; }
        E.iniciarDia(s); return { ok: true };
      }
      default: return err('Acció desconeguda: ' + a.tipus);
    }
  }

  /* ---------- Reconeixements ---------- */
  E.reconeixements = function (s) {
    const e = jugador(s), h = e.hist, sum = (k) => h.reduce((a, x) => a + (x[k] || 0), 0), out = [];
    const cl = sum('clients'), sv = sum('servits'), perdServ = h.reduce((a, x) => a + x.perduts.cua + x.perduts.esgotat, 0);
    if (sum('resultat') > 0) out.push('rendible');
    if (sv >= 150) out.push('clients');
    if (cl && perdServ / cl < 0.06) out.push('servei');
    if (e.rep >= 70) out.push('reputacio');
    const ll = Object.values(s.llicons[0] || {}).filter(x => x.ok).length; if (ll >= 10) out.push('llicons');
    return out;
  };

  /* ---------- Informes ---------- */
  const csv = (rows) => rows.map(r => r.map(v => /[;"\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v).join(';')).join('\n');
  E.csvResultats = function (s) {
    const rows = [['Dia', 'Botiga', 'Esdeveniment', 'Clients', 'Atesos', 'Unitats', 'Vendes', 'Cost de la mercaderia', 'Merma', 'Fixos', 'Serveis', 'Promoció', 'Resultat', 'Quota %', 'Notorietat', 'Reputació', 'Satisfacció', 'Valor', 'Posició', 'Perduts per preu', 'Perduts per assortiment', 'Perduts per estoc', 'Perduts per cua', '4P treballades']];
    s.empreses.forEach(e => e.hist.forEach(h => rows.push([h.ronda, e.nom, (E.esdeveniment(h.esdeveniment || '') || {}).titol || '', h.clients, h.servits, h.unitats, h.ingressos, h.cogs == null ? '' : h.cogs, h.merma == null ? '' : h.merma, h.fixos == null ? '' : h.fixos, h.serveis == null ? '' : h.serveis, h.promocio == null ? '' : h.promocio, h.resultat, h.quota, h.notorietat, h.reputacio, h.satisfaccio, h.valor, h.posicio,
      h.perduts ? h.perduts.preu : '', h.perduts ? h.perduts.assortiment : '', h.perduts ? h.perduts.esgotat : '', h.perduts ? h.perduts.cua : '', (h.us4P || []).join(' ')])));
    return csv(rows);
  };
  E.csvRegistre = function (s) {
    const rows = [['Dia', 'Fase', 'Botiga', 'Tipus', 'Concepte', 'Import', 'Saldo']];
    s.log.forEach(l => rows.push([l.ronda, l.fase, l.empresa, l.tipus, l.concepte, l.import, l.saldo == null ? '' : l.saldo]));
    return csv(rows);
  };

  /* ---------- Registre d'accions: reproduir i verificar una partida sense confiar en el client ---------- */
  const CODI = { producte: 'p', preu: 'r', comanda: 'c', prestatge: 'k', servei: 's', promo: 'm', aparador: 'a', enquesta: 'e', objectiu: 'o', obrir: 'b', tancar: 't', continuar: 'n', llico: 'q' };
  const DECODI = Object.fromEntries(Object.entries(CODI).map(([k, v]) => [v, k]));
  const ARGS = { producte: ['slot', 'prod'], preu: ['slot', 'valor'], comanda: ['prod', 'caixes'], servei: ['servei', 'actiu'], promo: ['promo'], aparador: ['tema'], objectiu: ['valor'], tancar: ['res'], llico: ['llico', 'resposta'] };
  E.compacta = (reg) => reg.map(r => {
    if (r.ia) return [r.ia];
    return [CODI[r.tipus]].concat((ARGS[r.tipus] || []).map(k => typeof r[k] === 'boolean' ? (r[k] ? 1 : 0) : r[k] == null ? null : r[k]));
  });
  E.descompacta = (arr) => arr.map(x => {
    if (['I', 'F'].includes(x[0])) return { ia: x[0] };
    const tipus = DECODI[x[0]], a = { tipus };
    (ARGS[tipus] || []).forEach((k, i) => { a[k] = x[1 + i]; });
    if (tipus === 'servei') a.actiu = !!a.actiu;
    return a;
  });
  E.aplica = function (s, r) {
    if (r.ia === 'I') { E.iniciarDia(s); return { ok: true }; }
    if (r.ia === 'F') { s.fase = 'final'; return { ok: true }; }   // el docent acaba la partida abans d'hora
    const a = Object.assign({}, r); delete a.id; return fer(s, a);
  };
  E.repetir = function (cfg, reg) {
    const s = E.crearPartida(cfg); let errors = 0;
    reg.forEach(r => { const x = E.aplica(s, r); if (!x.ok && !x.muta) errors++; });
    s.reg = reg.slice(); return { s, errors };
  };

  /* ---------- Reptes de classe: tots els equips juguen el mateix carrer ----------
     Codi llegible (per dictar o escriure a la pissarra): A8M-K3X9QZ = sector, dies, dificultat i llavor. */
  const SECT = { alimentacio: 'A' }, SECT_R = { A: 'alimentacio' };
  const DIF = { facil: 'F', mitja: 'M', dificil: 'D' }, DIF_R = Object.fromEntries(Object.entries(DIF).map(([k, v]) => [v, k]));
  const RONDES = { 4: '4', 8: '8', 12: 'C' }, RONDES_R = { 4: 4, 8: 8, C: 12 };
  E.codiRepte = (sector, rondes, dificultat, llavor) => (SECT[sector] || 'A') + RONDES[rondes] + DIF[dificultat] + '-' + (llavor >>> 0).toString(36).toUpperCase().padStart(6, '0');
  E.llegirRepte = function (codi) {
    const m = String(codi || '').trim().toUpperCase().replace(/\s/g, '').match(/^([A])([48C])([FMD])-?([0-9A-Z]{1,7})$/);
    if (!m) return null;
    const llavor = parseInt(m[4], 36); if (!(llavor > 0)) return null;
    return { codi: m[1] + m[2] + m[3] + '-' + m[4].padStart(6, '0'), sector: SECT_R[m[1]], rondes: RONDES_R[m[2]], dificultat: DIF_R[m[3]], llavor };
  };
  E.cfgRepte = function (rep, equip) {
    return { nom: equip.repteNom || 'Repte de classe', sector: rep.sector, rondes: rep.rondes, capital: MD.CAPITAL, dificultat: rep.dificultat, llavor: rep.llavor,
      repte: { codi: rep.codi, nom: equip.repteNom || '' }, empreses: [{ nom: equip.nom, humana: true, membres: equip.membres || [] }] };
  };

  if (NODE) module.exports = E; else root.ME = E;
})(typeof window !== 'undefined' ? window : globalThis);
