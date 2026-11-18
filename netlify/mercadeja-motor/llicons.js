/* Mercadeja · lliçons que surten mentre es juga.
   Cada lliçó està lligada a un resultat d'aprenentatge (RA) i a criteris d'avaluació (CA) del mòdul
   1226 Màrqueting en l'activitat comercial (CFGM Activitats comercials).
   - quan(s, e): es desbloqueja quan la partida arriba a aquesta situació (condicions persistents)
   - exemple(s, e, ME, MD): explica el concepte amb les dades de la botiga de l'equip
   - pregunta: l'opció correcta és sempre la primera (o[0]); el joc les barreja en mostrar-les */
(function (root) {
  const f = (v) => Math.round(v).toLocaleString('ca-ES');
  const e2 = (v) => (Math.round(v * 100) / 100).toLocaleString('ca-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const pc = (v) => (Math.round(v * 10) / 10).toLocaleString('ca-ES') + ' %';
  const H = (e) => e.hist || [];
  const darrer = (e) => H(e)[H(e).length - 1];
  const prods = (e) => (e.prestatges || []).slice(0, e.nPrest).filter(x => x && x.prod);
  const usades = (s, tipus) => { const out = new Set(); (s.log || []).forEach(l => { if (l.emp === 0 && l.tipus === tipus) out.add(l.concepte); }); return [...out]; };
  const ENTORN = { calendari: 'del macroentorn (factor social i cultural: el calendari i els costums)', territori: 'del macroentorn (factor natural i econòmic del territori)', competitiva: 'del microentorn (la competència i els clients)' };

  const L = [
    {
      id: 'mix', ra: 'RA1 · CA 1.4 · RA8 · CA 8.5', titol: 'El màrqueting mix: les quatre P',
      quan: (s) => s.ronda >= 1,
      cos: ['El **màrqueting mix** és la combinació dels quatre instruments que l\'empresa controla: **producte** (què vens), **preu** (quant costa al client), **distribució** (com i on arriba) i **promoció** o comunicació (com ho fas saber).',
        'La clau és la **coherència**: un formatge artesà molt bo, venut massa barat, sense que ningú en sàpiga res i amb la prestatgeria sovint buida, desaprofita els seus punts forts.'],
      exemple: (s, e, ME, MD) => `A ${e.nom} decidiu cada matí les quatre P: què hi ha a les ${e.nPrest} prestatgeries (producte), a quin preu (preu), quant estoc demaneu, si teniu dependenta i botiga en línia (distribució) i quines promocions feu (promoció).`,
      pregunta: { p: 'Una botiga ven formatge artesà de molta qualitat a un preu molt baix, sense cap comunicació i amb la prestatgeria sovint buida. Quin és el problema principal?', o: ['Les quatre P no són coherents entre elles', 'Té massa productes a la botiga', 'El preu és massa alt per als clients', 'Hauria de canviar el disseny de l\'envàs'], per: 'El problema no és una P aïllada, sinó que no encaixen: la qualitat demana un preu, una comunicació i una disponibilitat que la facin valer.' }
    },
    {
      id: 'segmentacio', ra: 'RA2 · CA 2.5 i 2.6', titol: 'Segmentació del mercat',
      quan: (s, e) => H(e).length >= 1,
      cos: ['**Segmentar** és dividir el mercat en grups de consumidors **homogenis** dins del grup i diferents entre grups, per adaptar-los l\'oferta.',
        'Criteris habituals: **geogràfics** (on viuen), **demogràfics** (edat, renda), **psicogràfics** (valors, estil de vida) i **conductuals** (beneficis que busquen, fidelitat). Al joc hi ha quatre tipus de client segons el que busquen: estalviadors, exigents, moderns i responsables.'],
      exemple: (s, e, ME, MD) => { const d = darrer(e); if (!d) return ''; return `El dia ${d.ronda} van entrar a ${e.nom}: ` + MD.SEG.map(k => d.perSeg[k].entren + ' ' + MD.segments[k].nom.toLowerCase() + ' (en van comprar ' + d.perSeg[k].compren + ')').join(', ') + '.'; },
      pregunta: { p: 'Els clients «responsables» del joc s\'han agrupat segons un criteri…', o: ['Psicogràfic: valors i estil de vida', 'Demogràfic: edat i nivell de renda', 'Geogràfic: el barri on viuen', 'Conductual: quantitat que compren'], per: 'Agrupar clients per la importància que donen a l\'ecologia i la proximitat és segmentar per valors: criteri psicogràfic.' }
    },
    {
      id: 'costMarge', ra: 'RA5 · CA 5.1, 5.3 i 5.5', titol: 'Cost, marge i preu de venda',
      quan: (s, e) => s.ronda >= 1 && (H(e).length >= 1 || !!(e.us4P && e.us4P.preu)),
      cos: ['**Preu de venda = cost + marge.** El marge es pot calcular sobre el cost o sobre el preu de venda, i no dona el mateix percentatge:',
        '**Marge sobre el preu** = (preu − cost) ÷ preu × 100. **Marge sobre el cost** = (preu − cost) ÷ cost × 100.'],
      exemple: (s, e, ME) => { const x = prods(e)[0]; if (!x) return ''; const p = ME.prod(x.prod), m = x.preu - p.cost; return `${p.nom}: el compreu a ${e2(p.cost)} i el veneu a ${e2(x.preu)} → marge de ${e2(m)} per unitat. Sobre el preu: ${pc(m / x.preu * 100)}. Sobre el cost: ${pc(m / p.cost * 100)}.`; },
      pregunta: { p: 'Un producte ens costa 6 € i el venem a 10 €. Quin és el marge sobre el preu de venda?', o: ['40 %', '66,7 %', '4 %', '60 %'], per: '(10 − 6) ÷ 10 = 0,40 → 40 %. Sobre el cost seria 4 ÷ 6 = 66,7 %.' }
    },
    {
      id: 'sim', ra: 'RA3 · CA 3.2, 3.3 i 3.5', titol: 'El sistema d\'informació de màrqueting',
      quan: (s, e) => H(e).length >= 1,
      cos: ['Per decidir bé, l\'empresa necessita informació. El **SIM** l\'organitza en quatre parts: **dades internes** (vendes, costos, clients), **intel·ligència de màrqueting** (què fa la competència i com canvia l\'entorn), **investigació comercial** (estudis fets expressament) i **anàlisi**.',
        'Les fonts poden ser **internes o externes** i **primàries** (les recollim nosaltres per a aquest objectiu) o **secundàries** (ja existien).'],
      exemple: () => 'Al joc, la pantalla de resultats de cada dia són les vostres dades internes; el que veieu de les botigues rivals és intel·ligència de màrqueting; l\'enquesta als clients del barri és una investigació comercial.',
      pregunta: { p: 'El resum de vendes del dia de la vostra pròpia botiga és una font d\'informació…', o: ['Interna i secundària', 'Externa i primària', 'Externa i secundària', 'Interna i primària'], per: 'És de l\'empresa (interna) i ja existeix abans de qualsevol estudi (secundària).' }
    },
    {
      id: 'atributs', ra: 'RA4 · CA 4.1 i 4.6', titol: 'Els atributs del producte',
      quan: (s, e) => H(e).length >= 1 && (!!(e.us4P && e.us4P.producte) || H(e).length >= 2),
      cos: ['Un producte és un conjunt d\'**atributs**: tangibles (qualitat, envàs, origen) i intangibles (marca, servei, garantia).',
        'Es parla de **producte bàsic** (la necessitat que cobreix), **producte formal** (com és: qualitat, marca, envàs) i **producte ampliat** (serveis afegits, com el repartiment a domicili). Cada tipus de client valora atributs diferents.'],
      exemple: (s, e, ME) => 'Els vostres productes: ' + prods(e).map(x => { const p = ME.prod(x.prod); return p.nom + ' (qualitat ' + p.q + ', eco ' + p.eco + ', novetat ' + p.nou + ')'; }).join('; ') + '. Els exigents miren la qualitat; els moderns, la novetat; els responsables, l\'eco i la proximitat.',
      pregunta: { p: 'El repartiment a domicili de la botiga en línia forma part del…', o: ['Producte ampliat', 'Producte bàsic', 'Preu de venda', 'Producte formal'], per: 'És un servei que s\'afegeix al producte: producte ampliat.' }
    },
    {
      id: 'entorn', ra: 'RA2 · CA 2.4', titol: 'L\'entorn: macroentorn i microentorn',
      quan: (s) => s.ronda >= 2,
      cos: ['La botiga no decideix sola. El **macroentorn** són forces generals que no pot controlar: polítiques, econòmiques, socials, tecnològiques, ecològiques i legals (anàlisi **PESTEL**).',
        'El **microentorn** és el més proper: clients, competidors, proveïdors i intermediaris. Els esdeveniments de cada dia són canvis de l\'entorn.'],
      exemple: (s, e, ME) => { const ev = ME.esdeveniment(s.esdeveniment); return ev ? `L'esdeveniment d'avui, «${ev.titol}», és un factor ${ENTORN[ev.tipus] || 'de l\'entorn'}.` : ''; },
      pregunta: { p: 'Una pujada del preu de l\'energia que afecta tots els comerços és un factor…', o: ['Del macroentorn, de tipus econòmic', 'Del microentorn, perquè afecta clients', 'Intern, perquè canvia els costos', 'Del microentorn, de tipus competitiu'], per: 'Afecta tothom i la botiga no el controla: és macroentorn econòmic.' }
    },
    {
      id: 'llindar', ra: 'RA5 · CA 5.5', titol: 'El llindar de rendibilitat',
      quan: (s, e) => H(e).some(h => h.resultat < 0) || H(e).length >= 2,
      cos: ['El **llindar de rendibilitat** (punt mort) és el volum de vendes a partir del qual l\'empresa deixa de perdre diners.',
        '**Llindar = costos fixos ÷ (preu − cost variable unitari).** La diferència entre preu i cost variable és el **marge de contribució**: el que aporta cada venda per pagar els costos fixos (lloguer, llum, sous...).'],
      exemple: (s, e) => { const d = darrer(e); if (!d || !d.unitats) return ''; const mc = (d.ingressos - d.cogs) / d.unitats, fixos = d.fixos + d.serveis + d.promocio + (d.estudi || 0); return mc <= 0 ? 'Cada unitat no aportava res per cobrir els costos fixos: cap volum de vendes us faria guanyar diners amb aquests preus.' : `Dia ${d.ronda}: costos fixos del dia (lloguer, serveis i promoció) ${f(fixos)} €; marge de contribució ${e2(mc)} per unitat. Llindar ≈ ${f(fixos / mc)} unitats. N'heu venut ${f(d.unitats)}: ${d.unitats >= fixos / mc ? 'l\'heu superat.' : 'no hi heu arribat.'}`; },
      pregunta: { p: 'Costos fixos 6.000 €, preu 12 € i cost variable 8 € per unitat. Quantes unitats cal vendre per no perdre diners?', o: ['1.500 unitats', '750 unitats', '500 unitats', '2.000 unitats'], per: '6.000 ÷ (12 − 8) = 1.500 unitats.' }
    },
    {
      id: 'mixCom', ra: 'RA7 · CA 7.1 i 7.3', titol: 'El mix de comunicació',
      quan: (s, e) => usades(s, 'promocio').length > 0 || H(e).length >= 2,
      cos: ['La comunicació comercial combina diverses eines: **publicitat** (missatge pagat en mitjans: ràdio, cartells, internet), **promoció de vendes** (incentius a curt termini: descomptes, tastos), **relacions públiques** (imatge i confiança), **venda personal**, **màrqueting directe** (fullets a les bústies, correus) i **màrqueting en línia** (xarxes, influencers).',
        'L\'**aparador** és **marxandatge**: comunicació al mateix punt de venda.'],
      exemple: (s, e, ME, MD) => { const fet = new Set(); (s.log || []).forEach(l => { if (l.emp === 0 && l.tipus === 'promocio') { const k = MD.PROMO.find(x => l.concepte === 'Promoció: ' + MD.promos[x].nom.toLowerCase()); if (k) fet.add(MD.promos[k].nom + ' → ' + MD.promos[k].tipus); else if (l.concepte.startsWith('Aparador')) fet.add('Aparador → marxandatge'); } }); return fet.size ? 'Eines que heu fet servir: ' + [...fet].join(' · ') + '.' : 'Encara no heu fet cap promoció: sense comunicació, la notorietat baixa cada dia.'; },
      pregunta: { p: 'Un tast gratuït de formatge a la botiga amb un 10 % de descompte aquell dia és una acció de…', o: ['Promoció de vendes', 'Publicitat en mitjans', 'Relacions públiques', 'Màrqueting directe'], per: 'És un incentiu temporal per empènyer la compra al punt de venda: promoció de vendes.' }
    },
    {
      id: 'canals', ra: 'RA6 · CA 6.2, 6.3 i 6.6', titol: 'Canals de distribució',
      quan: (s, e) => H(e).length >= 2 || !!(e.serveis && e.serveis.online),
      cos: ['Un canal és el camí del producte fins al consumidor. Segons el nombre d\'**intermediaris**: **directe** (el productor ven al consumidor), **curt** (hi ha un detallista) i **llarg** (majorista + detallista).',
        'La vostra botiga és un **detallista**: compra al proveïdor i ven al consumidor final. Si obriu la **botiga en línia**, feu venda sense establiment i arribeu a clients que no passen pel carrer.'],
      exemple: (s, e) => `Els vostres productes arriben pel canal productor → proveïdor (majorista) → ${e.nom} (detallista) → consumidor. ${e.serveis && e.serveis.online ? 'A més, veneu en línia: ' + H(e).reduce((a, h) => a + (h.online || 0), 0) + ' comandes fins ara.' : 'Encara no veneu en línia.'}`,
      pregunta: { p: 'Productor → majorista → botiga de barri → consumidor és un canal…', o: ['Llarg', 'Directe', 'Curt', 'Sense establiment'], per: 'Hi ha dos intermediaris (majorista i detallista): canal llarg.' }
    },
    {
      id: 'competencia', ra: 'RA5 · CA 5.7 i 5.8', titol: 'Estratègies de preus',
      quan: (s, e) => H(e).length >= 2,
      cos: ['El preu també es fixa mirant la **competència** i el client. Estratègies habituals: **penetració** (preu baix per guanyar clients ràpidament), **desnatament** (preu alt d\'entrada per a qui més valora la novetat), **prestigi** (preu alt que comunica qualitat), **seguir el líder** i **preus psicològics** (2,95 € en lloc de 3 €).'],
      exemple: (s, e) => { const d = darrer(e); if (!d) return ''; const riv = s.empreses.slice(1).map(x => x.darrer ? x.darrer.preuMitja : 1), m = riv.reduce((a, b) => a + b, 0) / riv.length; const dif = (d.preuMitja / m - 1) * 100; return `Els vostres preus estan de mitjana al ${pc(d.preuMitja * 100)} del preu de mercat; les rivals, al ${pc(m * 100)}. Esteu un ${pc(Math.abs(dif))} ${dif >= 0 ? 'per sobre' : 'per sota'}: ${dif > 8 ? 's\'assembla a una estratègia de prestigi; cal que la qualitat ho justifiqui.' : dif < -8 ? 's\'assembla a una estratègia de penetració; vigileu el marge.' : 'seguiu el preu del mercat.'}`; },
      pregunta: { p: 'Obrir una botiga amb preus molt baixos durant el primer mes per atraure clients és una estratègia de…', o: ['Preus de penetració', 'Preus de desnatament', 'Preus de prestigi', 'Preus psicològics'], per: 'Entrar amb preu baix per captar molts clients és penetració.' }
    },
    {
      id: 'posicionament', ra: 'RA4 · CA 4.3 · RA2', titol: 'El posicionament',
      quan: (s, e) => H(e).length >= 2,
      cos: ['El **posicionament** és el lloc que ocupa una marca a la ment del consumidor **respecte de la competència**.',
        'Un **mapa de posicionament** situa les botigues segons dos atributs (per exemple, preu i qualitat) i ajuda a veure espais buits o competidors massa propers.'],
      exemple: (s, e, ME) => { const q = (x) => { const c = ME.catalegDe(s, x); return c.reduce((a, y) => a + ME.prod(y.prod).q, 0) / Math.max(1, c.length); }, pr = (x) => { const c = ME.catalegDe(s, x); return c.reduce((a, y) => a + y.preu / ME.prod(y.prod).ref, 0) / Math.max(1, c.length); }; return s.empreses.map(x => `${x.nom}: preu ${pc(pr(x) * 100)} del mercat, qualitat ${f(q(x))}`).join(' · ') + '. Busqueu un lloc on no hi hagi ningú i que els clients valorin.'; },
      pregunta: { p: 'Un mapa de posicionament serveix sobretot per…', o: ['Comparar com perceben les botigues', 'Calcular el preu a partir del cost', 'Triar el proveïdor més econòmic', 'Saber quanta gent passa pel carrer'], per: 'Mostra on se situen les marques, les unes respecte de les altres, segons la percepció dels clients.' }
    },
    {
      id: 'elasticitat', ra: 'RA5 · CA 5.6', titol: 'L\'elasticitat de la demanda',
      quan: (s, e) => { const h = H(e); for (let i = 1; i < h.length; i++) if (Math.abs(h[i].preuMitja / h[i - 1].preuMitja - 1) >= 0.04) return true; return h.length >= 4; },
      cos: ['L\'**elasticitat preu** mesura quant canvien les vendes quan canvia el preu: **E = % de variació de la quantitat ÷ % de variació del preu**.',
        'Si |E| > 1 la demanda és **elàstica** (els clients reaccionen molt, com els estalviadors); si |E| < 1 és **inelàstica**. Al carrer també hi influeixen la competència, la promoció i el dia.'],
      exemple: (s, e) => { const h = H(e); for (let i = h.length - 1; i >= 1; i--) { const dp = h[i].preuMitja / h[i - 1].preuMitja - 1; if (Math.abs(dp) >= 0.04 && h[i - 1].unitats) { const dq = h[i].unitats / h[i - 1].unitats - 1; return `Del dia ${h[i - 1].ronda} al ${h[i].ronda}, els vostres preus van variar un ${pc(dp * 100)} i les unitats venudes un ${pc(dq * 100)}. Elasticitat aproximada: ${(Math.round(dq / dp * 100) / 100).toLocaleString('ca-ES')}. Compte: aquells dies també van canviar altres coses.`; } } return 'No heu canviat gaire els preus. Proveu-ho un dia i compareu les unitats venudes.'; },
      pregunta: { p: 'Si apugem el preu un 10 % i les vendes baixen un 25 %, la demanda és…', o: ['Elàstica: hi reacciona molt', 'Inelàstica: gairebé no hi reacciona', 'Unitària: baixa igual que puja el preu', 'Rígida perquè és de primera necessitat'], per: 'E = −25 % ÷ 10 % = −2,5; |E| > 1 → elàstica.' }
    },
    {
      id: 'costDist', ra: 'RA6 · CA 6.5', titol: 'Els costos de distribució',
      quan: (s, e) => H(e).some(h => h.mermaU > 0 || h.comissions > 0) || H(e).length >= 3,
      cos: ['Fer arribar el producte al client té costos: **transport**, **emmagatzematge**, **embalatge**, **comissions** dels intermediaris, **personal** i producte que es fa malbé (**merma**).',
        'Per comparar canals cal mirar el **cost per unitat venuda**, no només el cost d\'entrada.'],
      exemple: (s, e, ME, MD) => { const h = H(e); const merma = h.reduce((a, x) => a + (x.merma || 0), 0), com = h.reduce((a, x) => a + (x.comissions || 0), 0), on = h.reduce((a, x) => a + (x.online || 0), 0); return `Fins ara: ${e2(merma)} de producte fet malbé (merma) i ${e2(com)} d'embalatge i repartiment per a ${on} comandes en línia${on ? ' (' + e2(MD.serveis.online.perComanda) + ' per comanda)' : ''}.`; },
      pregunta: { p: 'Un repartidor cobra 1,50 € per comanda. Si feu 40 comandes amb una venda mitjana de 15 €, quin percentatge de les vendes en línia se\'n va en repartiment?', o: ['10 %', '1,5 %', '15 %', '40 %'], per: '1,50 ÷ 15 = 0,10 → 10 % de cada venda.' }
    },
    {
      id: 'notorietat', ra: 'RA7 · CA 7.2 i 7.8', titol: 'Objectius de la comunicació',
      quan: (s, e) => H(e).length >= 3,
      cos: ['Una campanya ha de tenir un **objectiu**: **informar** (donar a conèixer un producte o una botiga nova), **persuadir** (convèncer de comprar-hi en lloc d\'anar a la competència) o **recordar** (mantenir la marca present).',
        'La **notorietat** és el grau de coneixement de la marca. Si no es comunica, s\'oblida: al joc es perd un 15 % cada dia.'],
      exemple: (s, e) => `Notorietat de ${e.nom} al final de cada dia: ${H(e).map(x => f(x.notorietat)).join(' → ')}. Inversió en promoció: ${H(e).map(x => f(x.promocio) + ' €').join(' · ')}.`,
      pregunta: { p: 'Una botiga molt coneguda que posa un cartell cada setmana per seguir present a la ment del client busca sobretot…', o: ['Recordar', 'Informar d\'una novetat', 'Persuadir els clients rivals', 'Abaixar el preu de venda'], per: 'Si ja és coneguda, l\'objectiu és mantenir el record: comunicació de recordatori.' }
    },
    {
      id: 'capacitat', ra: 'RA6 · CA 6.1', titol: 'La distribució acosta el producte',
      quan: (s, e) => H(e).some(h => h.perduts && (h.perduts.esgotat + h.perduts.cua) >= 3) || H(e).length >= 4,
      cos: ['La **distribució** ha de posar el producte al lloc i al moment que el client el vol, en la quantitat que vol.',
        'Si la prestatgeria és buida o la cua és massa llarga, el client no espera: compra en una altra botiga. Per això cal planificar l\'**estoc** i el **personal**.'],
      exemple: (s, e) => { const h = H(e); const es = h.reduce((a, x) => a + x.perduts.esgotat, 0), cu = h.reduce((a, x) => a + x.perduts.cua, 0); return `${e.nom} ha perdut ${es} clients per prestatgeries buides i ${cu} per la cua. ${es + cu === 0 ? 'Molt ben organitzat!' : 'Són vendes que s\'emporta la competència.'}`; },
      pregunta: { p: 'Un client vol 4 unitats i a la prestatgeria i al magatzem no en queda cap. Què passa amb aquesta venda?', o: ['Es perd: compra en una altra botiga', 'Es queda pendent per a demà', 'La cobres igualment a final de mes', 'El proveïdor la serveix a l\'instant'], per: 'La demanda no servida es perd: el client compra a un altre lloc.' }
    },
    {
      id: 'investigacio', ra: 'RA3 · CA 3.4 i 3.7', titol: 'La investigació comercial',
      quan: (s, e) => (e.estudis || 0) > 0 || H(e).length >= 4,
      cos: ['La **investigació comercial** busca informació concreta per decidir. Fases: **definir el problema** → **dissenyar l\'estudi** → **treball de camp** (recollir dades) → **anàlisi** → **informe**.',
        'Les tècniques poden ser **quantitatives** (enquestes amb molts casos, dades numèriques) o **qualitatives** (entrevistes en profunditat, dinàmiques de grup, observació: el perquè).'],
      exemple: (s, e) => (e.estudis || 0) > 0 ? `Heu fet ${e.estudis} enquesta(es) als clients del barri: és un estudi quantitatiu amb dades primàries que us diu què busca cada tipus de client i quants en podríeu atraure.` : 'Podeu encarregar una enquesta als clients del barri a la pestanya «Mercat»: us dirà què busca cada tipus de client.',
      pregunta: { p: 'Una enquesta feta per la vostra botiga a 200 veïns us dona dades…', o: ['Primàries i quantitatives', 'Secundàries i quantitatives', 'Primàries i qualitatives', 'Secundàries i qualitatives'], per: 'Les recolliu vosaltres per a l\'estudi (primàries) i són respostes comptables de molta gent (quantitatives).' }
    },
    {
      id: 'control', ra: 'RA8 · CA 8.4, 8.6 i 8.7', titol: 'Objectius i control del pla',
      quan: (s, e) => H(e).length >= 3 || H(e).some(h => h.objectiu > 0),
      cos: ['Un **pla de màrqueting** fixa **objectius** (quantificables i amb termini), estratègies i accions, i després es **controla**: es comparen els resultats amb els objectius i s\'analitzen les **desviacions**.',
        'Desviació = resultat real − objectiu previst. Si és negativa, cal saber per què (preu, competència, estoc, entorn...) i corregir el pla.'],
      exemple: (s, e) => { const h = H(e).filter(x => x.objectiu > 0); if (!h.length) return 'Podeu fixar un objectiu de vendes cada matí a la pestanya «Mercat». Al vespre veureu la desviació.'; return 'Objectius de vendes i desviacions: ' + h.map(x => `dia ${x.ronda}: ${f(x.objectiu)} € → ${f(x.ingressos)} € (${x.ingressos >= x.objectiu ? '+' : ''}${f(x.ingressos - x.objectiu)} €)`).join(' · ') + '.'; },
      pregunta: { p: 'Volíeu vendre 3.000 € i n\'heu venut 2.400 €. Quina és la desviació?', o: ['−600 €, un 20 % per sota', '+600 €, un 25 % per sobre', '−600 €, un 25 % per sota', '−2.400 € respecte del pla'], per: '2.400 − 3.000 = −600; −600 ÷ 3.000 = −20 %.' }
    },
    {
      id: 'reputacio', ra: 'RA7 · CA 7.4', titol: 'Relacions públiques i reputació',
      quan: (s, e) => H(e).length >= 4 || e.rep <= 40,
      cos: ['Les **relacions públiques** construeixen una **imatge** i una relació de confiança: notes de premsa, esdeveniments, **patrocini** (a canvi de visibilitat) i **mecenatge** (suport a causes sense contrapartida directa).',
        'La **reputació** també depèn de la satisfacció dels clients: les cues llargues i les prestatgeries buides la fan baixar.'],
      exemple: (s, e) => `Reputació de ${e.nom}: ${f(e.rep)}/100. Satisfacció dels clients per dia: ${H(e).map(h => f(h.satisfaccio)).join(' · ')}.`,
      pregunta: { p: 'Pagar les samarretes de l\'equip de futbol del barri a canvi que hi surti el nom de la botiga és…', o: ['Patrocini', 'Mecenatge', 'Màrqueting directe', 'Promoció de vendes'], per: 'Hi ha una contrapartida de visibilitat per a la marca: patrocini.' }
    },
    {
      id: 'marca', ra: 'RA4 · contingut 4.9', titol: 'La marca i el valor de marca',
      quan: (s, e) => H(e).length >= 5,
      cos: ['La **marca** és el nom, el símbol o el disseny que identifica una botiga o un producte i el diferencia. Es pot registrar per protegir-la legalment.',
        'El **valor de marca** és un actiu **intangible**: si la botiga és coneguda i té bona reputació, val més. Al joc, el valor de la botiga inclou la notorietat i la reputació.'],
      exemple: (s, e, ME) => { const v = ME.valorEmpresa(s, e); return `El valor de marca de ${e.nom} és de ${f(v.marca)} €, un ${pc(v.marca / v.total * 100)} del valor total de la botiga (${f(v.total)} €).`; },
      pregunta: { p: 'Quin d\'aquests és un actiu intangible de la botiga?', o: ['La reputació de la marca', 'Els diners de la caixa', 'Les prestatgeries noves', 'L\'estoc del magatzem'], per: 'La reputació no es pot tocar, però dona valor: és un actiu intangible.' }
    }
  ];

  // L'opció correcta és la primera
  L.forEach(l => { l.pregunta.c = 0; });
  const API = { llicons: L, per: (id) => L.find(l => l.id === id) };
  if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.MLL = API;
})(typeof window !== 'undefined' ? window : globalThis);
