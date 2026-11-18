/* Mercadeja · lliçons que surten mentre es juga.
   Cada lliçó està lligada a un resultat d'aprenentatge (RA) i a criteris d'avaluació (CA) del mòdul
   1226 Màrqueting en l'activitat comercial (CFGM Activitats comercials).
   - quan(s, e): es desbloqueja quan la partida arriba a aquesta situació (condicions persistents)
   - exemple(s, e, ME, MD): explica el concepte amb les dades de la partida de l'equip
   - pregunta: l'opció correcta és sempre la primera (o[0]); el joc les barreja en mostrar-les */
(function (root) {
  const f = (v) => Math.round(v).toLocaleString('ca-ES');
  const e2 = (v) => (Math.round(v * 100) / 100).toLocaleString('ca-ES') + ' €';
  const pc = (v) => (Math.round(v * 10) / 10).toLocaleString('ca-ES') + ' %';
  const H = (e) => e.hist || [];
  const darrer = (e) => H(e)[H(e).length - 1];
  const TIPUS_CANAL = { botiga: 'directe', ecommerce: 'directe', directa: 'directe', marketplace: 'curt', supers: 'curt', distribuidor: 'llarg' };
  const TIPUS_CAMP = { xarxes: 'màrqueting en línia', influencers: 'màrqueting en línia', digital: 'publicitat (mitjà digital)', exterior: 'publicitat (mitjà exterior)', radio: 'publicitat (ràdio)', televisio: 'publicitat (televisió)', esdeveniments: 'relacions públiques i promoció', fires: 'fires comercials (relacions públiques)', pdv: 'promoció de vendes i marxandatge', rp: 'relacions públiques' };
  const ENTORN = { calendari: 'del macroentorn (factor social i cultural: calendari i costums)', territori: 'del macroentorn (factor econòmic i geogràfic del territori)', competitiva: 'del microentorn (la competència i els clients)' };

  const L = [
    {
      id: 'mix', ra: 'RA1 · CA 1.4 · RA8 · CA 8.5', titol: 'El màrqueting mix: les quatre P',
      quan: (s) => s.ronda > 1 || s.fase !== 'esdeveniment',
      cos: ['El **màrqueting mix** és la combinació dels quatre instruments que l\'empresa controla: **producte** (què venc), **preu** (quant costa al client), **distribució** (com i on arriba) i **promoció** o comunicació (com ho faig saber).',
        'La clau és la **coherència**: un producte de molta qualitat amb un preu molt baix, venut en un sol punt i sense comunicació, desaprofita els seus punts forts.'],
      exemple: (s, e, ME, MD) => `Ara mateix ${e.nom} ven ${MD.sectors[s.config.sector].producte.toLowerCase()} a ${e2(e.preu)}, amb una qualitat percebuda de ${f(ME.qualitatPercebuda(e))}/100, ${Object.values(e.canals).filter(Boolean).length} canal(s) de venda i una notorietat de ${f(e.not)}/100. Cada ronda decidireu les quatre P.`,
      pregunta: { p: 'Una empresa ven un producte de molta qualitat a un preu molt baix, només a la botiga del barri i sense cap comunicació. Quin és el problema principal?', o: ['Les quatre P no són coherents entre elles', 'Té massa canals de distribució oberts', 'El preu és massa alt per al seu segment', 'Hauria d\'invertir primer en el disseny'], per: 'El problema no és cap P aïllada, sinó que no encaixen: la qualitat demana un preu i una comunicació que la facin valer.' }
    },
    {
      id: 'segmentacio', ra: 'RA2 · CA 2.5 i 2.6', titol: 'Segmentació del mercat',
      quan: (s, e) => H(e).length >= 1,
      cos: ['**Segmentar** és dividir el mercat en grups de consumidors **homogenis** dins del grup i diferents entre grups, per adaptar-los l\'oferta.',
        'Criteris habituals: **geogràfics** (on viuen), **demogràfics** (edat, renda), **psicogràfics** (valors, estil de vida) i **conductuals** (beneficis que busquen, ús, fidelitat). Al joc hi ha quatre segments definits pels beneficis que busquen: preu, qualitat, innovació i responsabilitat.'],
      exemple: (s, e, ME, MD) => { const d = darrer(e); if (!d) return ''; const k = MD.SEG.slice().sort((a, b) => d.segVenut[b] - d.segVenut[a])[0]; return `A la ronda ${d.ronda}, el segment on ${e.nom} ha venut més ha estat «${MD.segments[k].nom}»: ${f(d.segVenut[k])} de ${f(d.unitats)} unitats. ${MD.SEG.map(x => MD.segments[x].curt + ' ' + f(d.segVenut[x])).join(' · ')}.`; },
      pregunta: { p: 'Els «consumidors responsables» del joc s\'han definit amb un criteri de segmentació…', o: ['Psicogràfic: valors i estil de vida', 'Demogràfic: edat i nivell de renda', 'Geogràfic: comarca on viuen', 'Conductual: quantitat que compren'], per: 'Agrupar clients per la importància que donen a la sostenibilitat i la proximitat és segmentar per valors: criteri psicogràfic.' }
    },
    {
      id: 'sim', ra: 'RA3 · CA 3.2, 3.3 i 3.5', titol: 'El sistema d\'informació de màrqueting',
      quan: (s, e) => H(e).length >= 1,
      cos: ['Per decidir bé, l\'empresa necessita informació. El **SIM** l\'organitza en quatre parts: **dades internes** (vendes, costos, clients), **intel·ligència de màrqueting** (què fa la competència i l\'entorn), **investigació comercial** (estudis fets expressament) i **anàlisi** de tot plegat.',
        'Les fonts poden ser **internes o externes** i **primàries** (les recollim nosaltres per a aquest objectiu) o **secundàries** (ja existien).'],
      exemple: (s, e) => `Al joc, la pestanya «Finances» és el vostre sistema de dades internes; els preus publicats de la competència i els esdeveniments són intel·ligència de màrqueting; la casella «Consultoria de mercat» és una investigació comercial.`,
      pregunta: { p: 'El compte de resultats de la vostra pròpia empresa és una font d\'informació…', o: ['Interna i secundària', 'Externa i primària', 'Externa i secundària', 'Interna i primària'], per: 'És de l\'empresa (interna) i ja existeix abans de qualsevol estudi (secundària).' }
    },
    {
      id: 'costMarge', ra: 'RA5 · CA 5.1, 5.3 i 5.5', titol: 'Cost, marge i preu de venda',
      quan: (s, e) => H(e).length >= 1,
      cos: ['**Preu de venda = cost unitari + marge.** El marge es pot calcular sobre el cost o sobre el preu de venda, i no donen el mateix percentatge:',
        '**Marge sobre el preu** = (preu − cost) ÷ preu × 100. **Marge sobre el cost** = (preu − cost) ÷ cost × 100. Al preu també s\'hi han de restar les **comissions** dels intermediaris.'],
      exemple: (s, e, ME) => { const c = ME.costUnitari(s, e), m = e.preu - c; return `${e.nom}: preu ${e2(e.preu)}, cost unitari ${e2(c)} → marge unitari ${e2(m)}. Sobre el preu: ${pc(m / e.preu * 100)}. Sobre el cost: ${pc(m / c * 100)}. Comissions mitjanes dels canals: ${pc(ME.comissioMitjana(e) * 100)} de cada venda.`; },
      pregunta: { p: 'Un producte costa 6 € i el venem a 10 €. Quin és el marge sobre el preu de venda?', o: ['40 %', '66,7 %', '4 %', '60 %'], per: '(10 − 6) ÷ 10 = 0,40 → 40 %. Sobre el cost seria 4 ÷ 6 = 66,7 %.' }
    },
    {
      id: 'mixCom', ra: 'RA7 · CA 7.1 i 7.3', titol: 'El mix de comunicació',
      quan: (s, e) => (e.inversio && e.inversio.promocio > 0) || H(e).length >= 2,
      cos: ['La comunicació comercial combina diverses eines: **publicitat** (missatge pagat en mitjans: televisió, ràdio, exterior, digital), **promoció de vendes** (incentius a curt termini: ofertes, degustacions), **relacions públiques** (imatge i confiança), **venda personal**, **màrqueting directe** i **màrqueting en línia** (xarxes, influencers, cercadors).',
        'Cada eina té un cost, un abast i un públic diferent: no totes serveixen per a tots els segments.'],
      exemple: (s, e, ME, MD) => { const usades = new Set(); (s.log || []).forEach(l => { if (l.emp === e.id && l.tipus === 'promocio' && l.concepte.startsWith('Campanya: ')) usades.add(l.concepte.slice(10)); }); if (!usades.size) return `${e.nom} encara no ha fet cap campanya: sense comunicació, la notorietat baixa cada ronda.`; return `Eines que ha fet servir ${e.nom}: ` + [...usades].map(n => { const k = MD.CAMP.find(x => MD.campanyes[x].nom === n); return n + ' → ' + (TIPUS_CAMP[k] || 'comunicació'); }).join(' · ') + '.'; },
      pregunta: { p: 'Una degustació amb descompte a la botiga durant una setmana és una acció de…', o: ['Promoció de vendes', 'Publicitat en mitjans', 'Relacions públiques', 'Venda personal'], per: 'És un incentiu temporal per empènyer la compra al punt de venda: promoció de vendes.' }
    },
    {
      id: 'entorn', ra: 'RA2 · CA 2.4', titol: 'L\'entorn: macroentorn i microentorn',
      quan: (s) => s.ronda >= 2,
      cos: ['L\'empresa no decideix sola. El **macroentorn** són forces generals que no pot controlar: polítiques, econòmiques, socials, tecnològiques, ecològiques i legals (anàlisi **PESTEL**).',
        'El **microentorn** és el més proper: clients, competidors, proveïdors i intermediaris. Les cartes de mercat del joc són canvis de l\'entorn.'],
      exemple: (s, e, ME) => { const c = s.esdeveniment && ME.carta(s.esdeveniment); return c ? `L'esdeveniment d'aquesta ronda, «${c.titol}», és un factor ${ENTORN[c.tipus] || 'de l\'entorn'}.` : ''; },
      pregunta: { p: 'Una pujada del preu de l\'energia que afecta totes les empreses és un factor…', o: ['Del macroentorn, de tipus econòmic', 'Del microentorn, perquè afecta clients', 'Intern, perquè canvia els costos', 'Del microentorn, de tipus competitiu'], per: 'Afecta tothom i l\'empresa no el controla: és macroentorn econòmic.' }
    },
    {
      id: 'atributs', ra: 'RA4 · CA 4.1 i 4.6', titol: 'Els atributs del producte',
      quan: (s, e) => (e.inversio && e.inversio.producte > 0) || H(e).length >= 2,
      cos: ['Un producte és un conjunt d\'**atributs**: tangibles (qualitat, disseny, envàs) i intangibles (marca, servei, garantia).',
        'Es parla de **producte bàsic** (la necessitat que cobreix), **producte formal** (com és: qualitat, disseny, marca) i **producte ampliat** (serveis afegits com el postvenda). Cada segment valora atributs diferents.'],
      exemple: (s, e, ME, MD) => `Atributs de ${e.nom}: ${MD.ATR.map(k => MD.atributs[k].nom + ' ' + e.atr[k]).join(' · ')}. Els clients de qualitat valoren sobretot la qualitat i el servei; els innovadors, la innovació i el disseny; els responsables, la sostenibilitat.`,
      pregunta: { p: 'El servei postvenda (garantia, reparacions, atenció) forma part del…', o: ['Producte ampliat', 'Producte bàsic', 'Canal de distribució', 'Preu de venda'], per: 'Són serveis que s\'afegeixen al producte formal: producte ampliat.' }
    },
    {
      id: 'llindar', ra: 'RA5 · CA 5.5', titol: 'El llindar de rendibilitat',
      quan: (s, e) => H(e).some(h => h.resultat < 0) || H(e).length >= 2,
      cos: ['El **llindar de rendibilitat** (punt mort) és el nombre d\'unitats a partir del qual l\'empresa deixa de perdre diners.',
        '**Llindar = costos fixos ÷ (preu − cost variable unitari).** La diferència entre preu i cost variable és el **marge de contribució**: el que aporta cada unitat per pagar els costos fixos.'],
      exemple: (s, e) => { const d = darrer(e); if (!d || !d.unitats) return ''; const mc = (d.ingressos - d.costVariable - d.comissions) / d.unitats, fixos = d.costosFixos + d.promocio; if (mc <= 0) return `A la ronda ${d.ronda}, cada unitat no aportava res per cobrir els costos fixos: amb aquest preu, cap volum de vendes us faria guanyar diners.`; return `Ronda ${d.ronda} de ${e.nom}: costos fixos + promoció = ${f(fixos)} €; marge de contribució ${e2(mc)} per unitat (després de comissions). Llindar ≈ ${f(fixos / mc)} unitats. N'heu venut ${f(d.unitats)}: ${d.unitats >= fixos / mc ? 'heu superat el llindar.' : 'no hi heu arribat.'}`; },
      pregunta: { p: 'Costos fixos 6.000 €, preu 12 € i cost variable 8 € per unitat. Quantes unitats cal vendre per no perdre diners?', o: ['1.500 unitats', '750 unitats', '500 unitats', '2.000 unitats'], per: '6.000 ÷ (12 − 8) = 1.500 unitats.' }
    },
    {
      id: 'canals', ra: 'RA6 · CA 6.3, 6.4 i 6.6', titol: 'Canals de distribució',
      quan: (s, e) => Object.values(e.canals).filter(Boolean).length > 1 || H(e).length >= 3,
      cos: ['Un canal és el camí del producte fins al consumidor. Segons el nombre d\'**intermediaris**: **directe** (sense intermediaris: botiga pròpia, web pròpia, venda directa), **curt** (un detallista: gran superfície, marketplace) i **llarg** (majorista + detallista).',
        'Els intermediaris donen **cobertura** (arriben a més clients) però cobren un marge o una **comissió**. La venda en línia pot ser directa o a través d\'un marketplace.'],
      exemple: (s, e, ME, MD) => `Canals actius de ${e.nom}: ${MD.CAN.filter(k => e.canals[k]).map(k => MD.canals[k].nom + ' (canal ' + TIPUS_CANAL[k] + ')').join(', ')}.`,
      pregunta: { p: 'Fabricant → majorista → detallista → consumidor és un canal…', o: ['Llarg', 'Directe', 'Curt', 'Integrat'], per: 'Hi ha dos intermediaris (majorista i detallista): canal llarg.' }
    },
    {
      id: 'competencia', ra: 'RA5 · CA 5.7 i 5.8', titol: 'Estratègies de preus',
      quan: (s, e) => H(e).length >= 2,
      cos: ['El preu també es fixa mirant la **competència** i el client. Estratègies habituals: **penetració** (preu baix per guanyar quota ràpidament), **desnatament** (preu alt d\'entrada per a qui més valora la novetat), **prestigi** (preu alt que comunica qualitat), **seguir el líder** i **preus psicològics** (9,95 € en lloc de 10 €).'],
      exemple: (s, e) => { const pubs = (s.resultats[s.resultats.length - 1] || { empreses: [] }).empreses.filter(x => x.emp !== e.id); if (!pubs.length) return ''; const m = pubs.reduce((a, x) => a + x.preu, 0) / pubs.length, d = (e.preu / m - 1) * 100; return `El preu de ${e.nom} (${e2(e.preu)}) està un ${pc(Math.abs(d))} ${d >= 0 ? 'per sobre' : 'per sota'} de la mitjana de la competència (${e2(m)}): ${d > 8 ? 's\'apropa a una estratègia de prestigi; cal que la qualitat ho justifiqui.' : d < -8 ? 's\'apropa a una estratègia de penetració; vigileu el marge.' : 'esteu seguint el preu del mercat.'}`; },
      pregunta: { p: 'Llançar un producte nou a un preu baix per guanyar quota ràpidament és una estratègia de…', o: ['Preus de penetració', 'Preus de desnatament', 'Preus de prestigi', 'Preus psicològics'], per: 'Entrar amb preu baix per captar molts clients és penetració.' }
    },
    {
      id: 'posicionament', ra: 'RA4 · CA 4.3 · RA2', titol: 'El posicionament',
      quan: (s, e) => H(e).length >= 2,
      cos: ['El **posicionament** és el lloc que ocupa una marca a la ment del consumidor **respecte de la competència**.',
        'Un **mapa de posicionament** situa les marques segons dos atributs (per exemple, preu i qualitat percebuda) i ajuda a veure espais buits o competidors massa propers.'],
      exemple: (s, e, ME) => { const qs = s.empreses.map(x => ME.qualitatPercebuda(x)), ps = s.empreses.map(x => x.preu); const mq = qs.reduce((a, b) => a + b, 0) / qs.length, mp = ps.reduce((a, b) => a + b, 0) / ps.length; const q = ME.qualitatPercebuda(e); return `${e.nom} té ${e.preu >= mp ? 'un preu per sobre' : 'un preu per sota'} de la mitjana i ${q >= mq ? 'una qualitat percebuda per sobre' : 'una qualitat percebuda per sota'}: ${e.preu >= mp && q >= mq ? 'posicionament prèmium.' : e.preu < mp && q >= mq ? 'molt bona relació qualitat-preu.' : e.preu < mp ? 'posicionament econòmic.' : 'posició feble: cara i amb menys qualitat.'} Ho podeu veure al «Mapa de posicionament» de la pestanya Mercat.`; },
      pregunta: { p: 'Un mapa de posicionament serveix sobretot per…', o: ['Comparar com perceben les marques', 'Calcular el preu a partir del cost', 'Triar el canal més econòmic', 'Saber quanta gent coneix la marca'], per: 'Mostra on se situen les marques, les unes respecte de les altres, segons la percepció dels clients.' }
    },
    {
      id: 'costDist', ra: 'RA6 · CA 6.5', titol: 'Els costos de distribució',
      quan: (s, e) => H(e).some(h => h.comissions > 0) || H(e).length >= 4,
      cos: ['Fer arribar el producte té costos: **transport**, **emmagatzematge**, **assegurances**, **comissions i marges** dels intermediaris i **despeses fixes** de cada canal (personal, lloguer, plataforma).',
        'Per comparar canals cal mirar el **cost de distribució per unitat venuda**, no només el cost d\'entrada.'],
      exemple: (s, e, ME, MD) => { const d = darrer(e); if (!d || !d.unitats) return ''; const fixCan = MD.CAN.filter(k => e.canals[k]).reduce((a, k) => a + MD.canals[k].fix, 0); return `Ronda ${d.ronda}: comissions ${f(d.comissions)} € + costos fixos dels canals ${f(fixCan)} € = ${e2((d.comissions + fixCan) / d.unitats)} de distribució per unitat venuda.`; },
      pregunta: { p: 'Un distribuïdor cobra un 12 % de comissió sobre unes vendes de 20.000 €. Quant li paguem?', o: ['2.400 €', '1.200 €', '240 €', '12.000 €'], per: '20.000 × 0,12 = 2.400 €.' }
    },
    {
      id: 'elasticitat', ra: 'RA5 · CA 5.6', titol: 'L\'elasticitat de la demanda',
      quan: (s, e) => { const h = H(e); for (let i = 1; i < h.length; i++) if (Math.abs(h[i].preu / h[i - 1].preu - 1) >= 0.03) return true; return h.length >= 4; },
      cos: ['L\'**elasticitat preu** mesura quant canvien les vendes quan canvia el preu: **E = % de variació de la quantitat ÷ % de variació del preu**.',
        'Si |E| > 1 la demanda és **elàstica** (els clients reaccionen molt, com el segment sensible al preu); si |E| < 1 és **inelàstica**. Al mercat real també hi influeixen la competència, la publicitat i l\'època de l\'any.'],
      exemple: (s, e) => { const h = H(e); for (let i = h.length - 1; i >= 1; i--) { const dp = h[i].preu / h[i - 1].preu - 1; if (Math.abs(dp) >= 0.03 && h[i - 1].unitats) { const dq = h[i].unitats / h[i - 1].unitats - 1; return `De la ronda ${h[i - 1].ronda} a la ${h[i].ronda}, ${e.nom} ha passat de ${e2(h[i - 1].preu)} a ${e2(h[i].preu)} (${pc(dp * 100)}) i les unitats de ${f(h[i - 1].unitats)} a ${f(h[i].unitats)} (${pc(dq * 100)}). Elasticitat aproximada: ${(Math.round(dq / dp * 100) / 100).toLocaleString('ca-ES')}. Compte: aquella ronda també van canviar altres coses.`; } } return `${e.nom} no ha canviat gaire el preu. Proveu-ho una ronda i compareu les unitats venudes.`; },
      pregunta: { p: 'Si apugem el preu un 10 % i les vendes baixen un 25 %, la demanda és…', o: ['Elàstica: hi reacciona molt', 'Inelàstica: gairebé no hi reacciona', 'Unitària: baixa igual que puja el preu', 'Rígida perquè és de primera necessitat'], per: 'E = −25 % ÷ 10 % = −2,5; |E| > 1 → elàstica.' }
    },
    {
      id: 'notorietat', ra: 'RA7 · CA 7.2 i 7.8', titol: 'Objectius de la comunicació',
      quan: (s, e) => H(e).length >= 3 || (H(e).length >= 2 && H(e).some(h => !h.promocio)),
      cos: ['Una campanya ha de tenir un **objectiu**: **informar** (donar a conèixer un producte nou), **persuadir** (convèncer de comprar-lo en lloc d\'un altre) o **recordar** (mantenir la marca present).',
        'La **notorietat** és el grau de coneixement de la marca. Si no es comunica, s\'oblida: al joc es perd un 12 % cada ronda.'],
      exemple: (s, e) => { const h = H(e); if (h.length < 2) return ''; return `Notorietat de ${e.nom} al final de cada ronda: ${h.map(x => f(x.notorietat)).join(' → ')}. Inversió en promoció per ronda: ${h.map(x => f(x.promocio) + ' €').join(' · ')}.`; },
      pregunta: { p: 'Una marca molt coneguda que fa anuncis per seguir present a la ment del client busca sobretot…', o: ['Recordar', 'Informar d\'una novetat', 'Persuadir els clients rivals', 'Abaixar el preu de venda'], per: 'Si ja és coneguda, l\'objectiu és mantenir el record: publicitat de recordatori.' }
    },
    {
      id: 'capacitat', ra: 'RA6 · CA 6.1', titol: 'La distribució acosta el producte',
      quan: (s, e) => H(e).some(h => h.perdudes > h.assignat * 0.03) || H(e).length >= 5,
      cos: ['La **distribució** ha de posar el producte al lloc i al moment en què el client el vol, en la quantitat que vol.',
        'Si la demanda supera el que podeu fabricar o servir, el client no espera: compra a la competència. Per això cal equilibrar la **capacitat de producció** i la **capacitat dels canals**.'],
      exemple: (s, e) => { const h = H(e).filter(x => x.perdudes > 0); return h.length ? `${e.nom} ha perdut vendes per falta de capacitat: ${h.map(x => 'ronda ' + x.ronda + ': ' + f(x.perdudes) + ' unitats').join(' · ')}.` : `${e.nom} ha pogut servir tota la demanda: la capacitat és suficient.`; },
      pregunta: { p: 'El mercat us demana 3.000 unitats i només en podeu servir 2.000. Què passa amb les altres 1.000?', o: ['Les compren a la competència o es perden', 'Es queden en estoc per a la ronda següent', 'Les cobreu igualment a final de mes', 'La capacitat s\'amplia automàticament'], per: 'La demanda no servida es perd: el client compra a un altre lloc.' }
    },
    {
      id: 'investigacio', ra: 'RA3 · CA 3.4 i 3.7', titol: 'La investigació comercial',
      quan: (s, e) => (e.estudis || 0) > 0 || H(e).length >= 4,
      cos: ['La **investigació comercial** busca informació concreta per decidir. Fases: **definir el problema** → **dissenyar l\'estudi** → **treball de camp** (recollir dades) → **anàlisi** → **informe**.',
        'Les tècniques poden ser **quantitatives** (enquestes amb molts casos, dades numèriques) o **qualitatives** (entrevistes en profunditat, dinàmiques de grup, observació: el perquè).'],
      exemple: (s, e) => (e.estudis || 0) > 0 ? `${e.nom} ha fet servir la «Consultoria de mercat»: un estudi que mesurava l'atractiu de cada empresa per a cada segment. És un estudi quantitatiu i de dades primàries.` : `Quan caigueu a la casella «Consultoria de mercat» rebreu un estudi de mercat: aprofiteu-lo per decidir el preu i la promoció.`,
      pregunta: { p: 'Una enquesta feta pel vostre equip a 200 clients us dona dades…', o: ['Primàries i quantitatives', 'Secundàries i quantitatives', 'Primàries i qualitatives', 'Secundàries i qualitatives'], per: 'Les recolliu vosaltres per a l\'estudi (primàries) i són respostes comptables de molts clients (quantitatives).' }
    },
    {
      id: 'control', ra: 'RA8 · CA 8.6 i 8.7', titol: 'Seguiment i control del pla',
      quan: (s, e) => H(e).length >= 3,
      cos: ['Un **pla de màrqueting** fixa objectius, estratègies i accions, i després es **controla**: es comparen els resultats amb els objectius i s\'analitzen les **desviacions** i les seves causes.',
        'Desviació = resultat real − objectiu previst. Si és negativa, cal saber per què (preu, competència, capacitat, entorn…) i corregir el pla.'],
      exemple: (s, e) => { const h = H(e), a = h[h.length - 2], b = h[h.length - 1]; if (!a || !b) return ''; return `Si l'objectiu de ${e.nom} fos mantenir la quota de la ronda ${a.ronda} (${pc(a.quota)}), a la ronda ${b.ronda} la desviació ha estat de ${(b.quota - a.quota >= 0 ? '+' : '') + pc(b.quota - a.quota)} punts; la del resultat, ${(b.resultat - a.resultat >= 0 ? '+' : '') + f(b.resultat - a.resultat)} €. Les explicacions del resum de la ronda us donen les causes.`; },
      pregunta: { p: 'Volíeu vendre 3.000 unitats i n\'heu venut 2.400. Quina és la desviació?', o: ['−600 unitats, un 20 % per sota', '+600 unitats, un 25 % per sobre', '−600 unitats, un 25 % per sota', '−2.400 unitats respecte del pla'], per: '2.400 − 3.000 = −600; −600 ÷ 3.000 = −20 %.' }
    },
    {
      id: 'reputacio', ra: 'RA7 · CA 7.4', titol: 'Relacions públiques i reputació',
      quan: (s, e) => H(e).length >= 4 || e.rep <= 40,
      cos: ['Les **relacions públiques** construeixen una **imatge** i una relació de confiança amb el públic: notes de premsa, esdeveniments, **patrocini** (a canvi de visibilitat) i **mecenatge** (suport a causes sense contrapartida directa).',
        'La **reputació** també depèn de la satisfacció dels clients: un producte que decep la fa baixar.'],
      exemple: (s, e) => `Reputació de ${e.nom}: ${f(e.rep)}/100. Satisfacció dels clients per ronda: ${H(e).map(h => f(h.satisfaccio)).join(' · ')}.`,
      pregunta: { p: 'Pagar les samarretes de l\'equip de futbol del poble a canvi que hi surti la marca és…', o: ['Patrocini', 'Mecenatge', 'Màrqueting directe', 'Promoció de vendes'], per: 'Hi ha una contrapartida de visibilitat per a la marca: patrocini.' }
    },
    {
      id: 'marca', ra: 'RA4 · contingut 4.9', titol: 'La marca i el valor de marca',
      quan: (s, e) => H(e).length >= 5,
      cos: ['La **marca** és el nom, el símbol o el disseny que identifica un producte i el diferencia. Es pot registrar per protegir-la legalment.',
        'El **valor de marca** és un actiu **intangible**: si la marca és coneguda i té bona reputació, l\'empresa val més. Al joc, el valor empresarial inclou la notorietat i la reputació.'],
      exemple: (s, e, ME) => { const v = ME.valorEmpresa(s, e); return `El valor de marca de ${e.nom} és de ${f(v.marca)} €, un ${pc(v.marca / v.total * 100)} del valor empresarial total (${f(v.total)} €).`; },
      pregunta: { p: 'Quin d\'aquests és un actiu intangible de l\'empresa?', o: ['La reputació de la marca', 'Els diners de la tresoreria', 'La maquinària de producció', 'L\'estoc de producte acabat'], per: 'La reputació no es pot tocar, però dona valor: és un actiu intangible.' }
    }
  ];

  // L'opció correcta és la primera
  L.forEach(l => { l.pregunta.c = 0; });
  const API = { llicons: L, per: (id) => L.find(l => l.id === id) };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.MLL = API;
})(typeof window !== 'undefined' ? window : globalThis);
