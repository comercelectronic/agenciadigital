/* Mercadeja · dades del joc: la botiga de barri.
   Cada dia de joc: planificació (les quatre P) → botiga oberta (el ninot reposa, cobra i prepara comandes) → resultats. */
(function (root) {
  const D = {};

  // Sector (de moment, un: botiga d'alimentació de proximitat). Es manté l'estructura per als codis de repte.
  D.sectors = {
    alimentacio: { nom: 'Botiga de barri', producte: 'Alimentació de proximitat', icona: 'cistella', unitat: 'unitat', unitats: 'unitats' }
  };

  // Tipus de client (segments). pes: proporció de la gent que passa pel carrer.
  // w: què mira per triar botiga (P preu, Q qualitat, N notorietat, F encaix amb el que busca, A assortiment, R reputació)
  // sens: sensibilitat al preu dins la botiga · maxPreu: preu màxim respecte del de referència · min: exigència mínima
  // gust: com valora cada atribut del producte (q qualitat, eco sostenibilitat/proximitat, nou novetat)
  D.SEG = ['preu', 'qualitat', 'innovadors', 'responsables'];
  D.segments = {
    preu: { nom: 'Estalviadors', curt: 'Estalviadors', icona: 'moneda', color: '#F5C542', desc: 'Busquen el millor preu. Comparen molt i canvien de botiga fàcilment.',
      pes: 0.36, e: 2.6, w: { P: 0.42, Q: 0.08, N: 0.18, F: 0.10, A: 0.10, R: 0.12 }, sens: 3.2, maxPreu: 1.2, min: 0.4, gust: { q: 0.15, eco: 0.0, nou: 0.0, bas: 0.85 }, qty: [2, 4] },
    qualitat: { nom: 'Exigents', curt: 'Exigents', icona: 'estrella', color: '#4EA5F5', desc: 'Paguen més per un producte bo i un tracte excel·lent.',
      pes: 0.26, e: 1.0, w: { P: 0.12, Q: 0.32, N: 0.14, F: 0.16, A: 0.10, R: 0.16 }, sens: 0.9, maxPreu: 1.7, min: 0.6, gust: { q: 0.85, eco: 0.15, nou: 0.10 }, qty: [2, 5] },
    innovadors: { nom: 'Moderns', curt: 'Moderns', icona: 'bombeta', color: '#E879B9', desc: 'Volen novetats. Els influeixen molt les xarxes socials.',
      pes: 0.18, e: 1.1, w: { P: 0.12, Q: 0.10, N: 0.30, F: 0.30, A: 0.10, R: 0.08 }, sens: 1.1, maxPreu: 1.55, min: 0.45, gust: { q: 0.25, eco: 0.10, nou: 0.85 }, qty: [2, 4] },
    responsables: { nom: 'Responsables', curt: 'Responsables', icona: 'fulla', color: '#36B37E', desc: 'Valoren el producte ecològic, de proximitat i la reputació de la botiga.',
      pes: 0.20, e: 1.3, w: { P: 0.14, Q: 0.12, N: 0.12, F: 0.32, A: 0.10, R: 0.20 }, sens: 1.3, maxPreu: 1.5, min: 0.55, gust: { q: 0.25, eco: 0.85, nou: 0.10 }, qty: [2, 5] }
  };

  // Catàleg de productes. cost: preu de compra al proveïdor · ref: preu de venda habitual al mercat
  // q, eco, nou: atributs 0-100 · bas: producte bàsic i de primera necessitat (el que busquen els estalviadors) · perible: el que sobra a final del dia es fa malbé en part
  D.productes = {
    motlle: { nom: 'Pa de motlle', cat: 'pa', color: '#E8C07D', cost: 0.9, ref: 1.7, q: 30, eco: 10, nou: 10, bas: 90, perible: false, desc: 'Barat i pràctic. El de tota la vida.' },
    pages: { nom: 'Pa de pagès de llenya', cat: 'pa', color: '#B9813F', cost: 1.8, ref: 3.6, q: 85, eco: 55, nou: 20, bas: 45, perible: true, desc: 'Del forn del poble. Cruixent i de llarga durada.' },
    llet: { nom: 'Llet sencera', cat: 'ampolla', color: '#F1F5F9', cost: 0.55, ref: 1.05, q: 40, eco: 10, nou: 5, bas: 95, perible: false, desc: 'Marca blanca. La que compra tothom.' },
    lleteco: { nom: 'Llet ecològica de la Garrotxa', cat: 'ampolla', color: '#BFE3C9', cost: 1.0, ref: 1.9, q: 70, eco: 92, nou: 20, bas: 50, perible: false, desc: 'De granja de proximitat, certificada ecològica.' },
    fruita: { nom: 'Fruita de temporada', cat: 'fruita', color: '#E5533D', cost: 1.3, ref: 2.6, q: 65, eco: 70, nou: 10, bas: 65, perible: true, desc: 'Del Maresme i de Lleida, segons l\'època.' },
    formatge: { nom: 'Formatge artesà del Montseny', cat: 'formatge', color: '#F2C94C', cost: 3.8, ref: 8.0, q: 95, eco: 55, nou: 30, bas: 10, perible: false, desc: 'Llet crua, curació de sis mesos. Premiat.' },
    fuet: { nom: 'Fuet de Vic', cat: 'embotit', color: '#A0522D', cost: 2.6, ref: 5.2, q: 78, eco: 35, nou: 15, bas: 35, perible: false, desc: 'Un clàssic de la Plana. Agrada a tothom.' },
    galetes: { nom: 'Galetes de paquet', cat: 'caixa', color: '#7FA7D9', cost: 0.8, ref: 1.5, q: 28, eco: 5, nou: 12, bas: 80, perible: false, desc: 'Les de sempre, en oferta contínua.' },
    kombutxa: { nom: 'Kombutxa de gerds', cat: 'ampolla', color: '#D14D72', cost: 1.5, ref: 3.4, q: 60, eco: 45, nou: 92, bas: 15, perible: false, desc: 'Beguda fermentada de moda. Feta a Girona.' },
    hummus: { nom: 'Hummus de remolatxa', cat: 'pot', color: '#B83280', cost: 1.3, ref: 3.0, q: 62, eco: 50, nou: 85, bas: 20, perible: true, desc: 'Nou i molt instagramejable.' },
    granel: { nom: 'Llegums a granel', cat: 'sac', color: '#C9A66B', cost: 1.1, ref: 2.4, q: 60, eco: 88, nou: 40, bas: 55, perible: false, desc: 'Sense envàs: portes el teu pot.' },
    croissant: { nom: 'Croissant de mantega', cat: 'pasta', color: '#E9A23B', cost: 0.45, ref: 1.3, q: 58, eco: 10, nou: 25, bas: 70, perible: true, desc: 'Acabat de fer cada matí.' }
  };
  D.PROD = Object.keys(D.productes);
  D.PREU_MIN = 0.5; D.PREU_MAX = 2.2;          // preu permès respecte del de referència
  D.PRESTATGE_MAX = 12;                         // unitats que hi caben a cada prestatgeria
  D.CAIXA = 10;                                 // unitats per caixa del proveïdor
  D.MERMA = 0.5;                                // part del producte perible que es llença en tancar
  D.PRESTATGES_INICIALS = 4; D.PRESTATGES_MAX = 6; D.PRESTATGE_COST = 250;

  // Distribució i serveis
  D.serveis = {
    dependent: { nom: 'Dependenta al taulell', icona: 'usuari', cost: 45, desc: 'Cobra els clients mentre tu reposes. Una mica més lenta que tu.' },
    online: { nom: 'Botiga en línia', icona: 'mobil', activar: 200, cost: 10, perComanda: 1, desc: 'Comandes per internet: les prepares en una caixa i les recull el repartidor. Atreu sobretot moderns i responsables.' },
    horari: { nom: 'Horari ampliat', icona: 'rellotge', cost: 25, desc: 'Obres més hores: passa un 20 % més de gent, però hi ha més despeses.' }
  };
  // Promoció (es contracta per a un dia). seg: a qui arriba més. not: notorietat · img: millora la imatge de qualitat · desc: descompte
  D.promos = {
    cartell: { nom: 'Cartell al carrer', icona: 'cartell', tipus: 'publicitat exterior', cost: 10, not: 4, seg: ['preu', 'qualitat', 'innovadors', 'responsables'], desc: 'Una pissarra a la vorera: la veu tothom qui passa.' },
    fullets: { nom: 'Fullets al barri', icona: 'diari', tipus: 'màrqueting directe', cost: 25, not: 7, seg: ['preu', 'responsables'], desc: 'A les bústies del barri: funciona amb la gent gran i les famílies.' },
    xarxes: { nom: 'Publicació a les xarxes', icona: 'mobil', tipus: 'màrqueting en línia', cost: 20, not: 8, seg: ['innovadors', 'qualitat'], desc: 'Fotos i vídeos curts. Arriba als moderns.' },
    radio: { nom: 'Falca a la ràdio local', icona: 'radio', tipus: 'publicitat', cost: 90, not: 14, seg: ['preu', 'qualitat', 'responsables'], desc: 'Molt d\'abast, però cara.' },
    tast: { nom: 'Tast a la botiga', icona: 'festa', tipus: 'promoció de vendes', cost: 30, not: 4, img: 10, rep: 2, seg: ['qualitat', 'responsables'], desc: 'La gent prova el producte: millora la imatge de qualitat.' },
    descompte: { nom: 'Descompte del 10 %', icona: 'etiqueta', tipus: 'promoció de vendes', cost: 0, not: 3, desc10: true, seg: ['preu'], desc: 'Tot un 10 % més barat avui: atrau estalviadors, però redueix el marge.' }
  };
  D.PROMO = Object.keys(D.promos);
  // Aparador (marxandatge): un tema per atraure un tipus de client
  D.aparadors = {
    oferta: { nom: 'Ofertes', seg: 'preu', color: '#F5C542', cost: 15 },
    qualitat: { nom: 'Producte gurmet', seg: 'qualitat', color: '#4EA5F5', cost: 15 },
    novetat: { nom: 'Novetats', seg: 'innovadors', color: '#E879B9', cost: 15 },
    eco: { nom: 'Ecològic i de proximitat', seg: 'responsables', color: '#36B37E', cost: 15 }
  };
  D.ENQUESTA_COST = 25;

  // Economia de la botiga
  D.CAPITAL = 3000;
  D.FIXOS = 70;              // lloguer, llum i assegurances per dia
  D.TRANSIT = 180;            // persones que passen pel carrer i podrien comprar (per dia)
  D.TRANSIT_ONLINE = 34;      // persones que podrien comprar en línia (per dia)
  D.ONLINE_PES = { preu: 0.15, qualitat: 0.2, innovadors: 0.38, responsables: 0.27 };
  D.FORA = 32;                // atractiu de «no comprar a cap botiga del carrer»
  D.NOT_INI = 18; D.OBLIT = 0.85; D.REP_INI = 50;
  D.VALOR = { estoc: 1, prestatge: 0.6, online: 0.5, marca: 12 };

  // Botigues rivals (IA). prods: productes que tenen; preu: multiplicador del preu de referència; serv: part dels clients que atenen bé
  D.RIVALS = [
    { id: 'estalvi', nom: 'Súper Estalvi', perfil: 'econòmica', color: '#F29D49', desc: 'Preus baixos i producte bàsic.', prods: ['motlle', 'llet', 'galetes', 'fruita'], preu: 0.86, not: 34, promos: ['fullets', 'cartell'] },
    { id: 'gurmet', nom: 'La Delícia', perfil: 'gurmet', color: '#9B7AE8', desc: 'Producte gurmet i preus alts.', prods: ['formatge', 'fuet', 'pages', 'croissant'], preu: 1.18, not: 22, promos: ['tast', 'xarxes'] },
    { id: 'granel', nom: 'Gra a Gra', perfil: 'ecològica', color: '#36B37E', desc: 'Granel, ecològic i proximitat.', prods: ['granel', 'lleteco', 'fruita', 'pages'], preu: 1.08, not: 18, promos: ['xarxes', 'tast'] }
  ];
  D.SERVEI_IA = { facil: 0.62, mitja: 0.74, dificil: 0.86 };
  D.FIXOS_RIVAL = { facil: 120, mitja: 105, dificil: 90 };  // les rivals són botigues més grans: més lloguer i personal

  // Esdeveniments del dia (entorn). demanda: multiplicador per segment · preuSens: més sensibilitat al preu · fora: gent que no compra
  const E = (id, tipus, titol, text, aprenem, e) => ({ id, tipus, titol, text, aprenem, e });
  D.esdeveniments = [
    E('normal', 'calendari', 'Un dia qualsevol', 'Dimarts tranquil al barri.', 'Els dies normals permeten comparar l\'efecte de les teves decisions.', {}),
    E('nadal', 'calendari', 'Setmana de Nadal', 'Les famílies compren més i busquen producte bo.', 'L\'estacionalitat canvia la demanda: cal preveure més estoc.', { demanda: { tots: 1.3, qualitat: 1.2 } }),
    E('santjordi', 'calendari', 'Sant Jordi', 'El carrer s\'omple de gent i de parades.', 'Els dies amb molta gent són una oportunitat per fer-se conèixer.', { demanda: { tots: 1.2 }, notTots: 4 }),
    E('rebaixes', 'calendari', 'Comencen les rebaixes', 'Tothom compara preus.', 'En rebaixes la demanda és més sensible al preu.', { demanda: { preu: 1.3, qualitat: 0.9 }, preuSens: 1.3 }),
    E('pluja', 'territori', 'Dia de pluja', 'Poca gent pel carrer, però més comandes per internet.', 'L\'entorn també afecta els canals: quan plou, guanya la venda en línia.', { demanda: { tots: 0.75 }, online: 1.6 }),
    E('mercat', 'territori', 'Dia de mercat setmanal', 'Les parades de pagès porten gent al barri.', 'Els esdeveniments del territori creen trànsit per al comerç de proximitat.', { demanda: { tots: 1.15, responsables: 1.25 } }),
    E('calor', 'territori', 'Onada de calor', 'La gent surt poc i busca coses fresques.', 'El clima és un factor del macroentorn que canvia el consum.', { demanda: { tots: 0.85, innovadors: 1.2 }, online: 1.3 }),
    E('festa', 'calendari', 'Festa major', 'Tot el barri és al carrer.', 'Les festes locals són calendari comercial: més clients i més varietat.', { demanda: { tots: 1.25, innovadors: 1.2 } }),
    E('preus', 'competitiva', 'Guerra de preus', 'El Súper Estalvi anuncia preus baixíssims.', 'Quan un competidor abaixa preus, no sempre cal seguir-lo: pots diferenciar-te.', { rivalPreu: 0.9, preuSens: 1.2 }),
    E('tendencia', 'competitiva', 'Canvi de tendència', 'Es posa de moda menjar sa i de proximitat.', 'Les tendències canvien què valora cada segment.', { demanda: { responsables: 1.35, innovadors: 1.15 } }),
    E('influencer', 'competitiva', 'Una influencer del barri', 'Penja vídeos de botigues amb novetats.', 'El màrqueting d\'influència mou sobretot el públic jove.', { demanda: { innovadors: 1.45 } }),
    E('crisi', 'calendari', 'Final de mes', 'Les famílies van justes de diners.', 'La renda disponible és part del macroentorn econòmic.', { demanda: { preu: 1.2, qualitat: 0.85 }, preuSens: 1.25 })
  ];

  // Ninots
  D.fitxes = [{ id: 'coet', nom: 'Coet', color: '#F5C542' }];
  D.empresesSuggerides = { alimentacio: ['El Rebost del Barri', 'Súper Estalvi', 'La Delícia', 'Gra a Gra'] };
  D.insignies = {
    rendible: { nom: 'Botiga més rendible', icona: 'grafic' },
    clients: { nom: 'Més clients atesos', icona: 'equip' },
    servei: { nom: 'Millor servei', icona: 'estrella' },
    reputacio: { nom: 'Millor reputació', icona: 'escut' },
    llicons: { nom: 'Lliçons apreses', icona: 'llibre' }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = D; else root.MD = D;
})(typeof window !== 'undefined' ? window : globalThis);
