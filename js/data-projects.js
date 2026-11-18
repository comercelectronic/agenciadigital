/* Agència Digital — Projectes reals: lliuraments que l'alumne fa de veritat i que el professorat revisa.
   Simplificats: dos plans de màrqueting curts (2 a 4 pàgines de Canva) i quatre campanyes on només s'entreguen les peces de Canva.
   Cada projecte s'activa en acabar el capítol «after» i cal entregar-lo per jugar el capítol següent. La IA el corregeix i el professor
   en revisa la nota; si cal millorar-lo, l'alumne rep un avís però no queda bloquejat.
   La guia completa de cada projecte es pot consultar a guia.html. */
window.GD = window.GD || {};

GD.projGuide = {
  intro: T("Al llarg del joc, alguns clients de l'agència et demanaran feines reals: un pla de màrqueting curt o les peces publicitàries d'una campanya. Les fas a Canva i les entregues per continuar la campanya."),
  how: [
    { h: T("1. Llegeix l'encàrrec"), d: T("Cada projecte diu exactament quines pàgines o quines peces cal fer i per a quin client. Fes servir el que has descobert jugant: el problema, el públic, el pressupost i el to de la marca.") },
    { h: T("2. Fes-ho a Canva"), d: T("Plans: una presentació de 2 a 4 pàgines amb el més important, en frases curtes, taules i imatges. Campanyes: només les peces (publicacions, històries, anuncis, cartells), amb la mida de cada xarxa i sense textos que les expliquin.") },
    { h: T("3. Descarrega'l en PDF"), d: T("A Canva: Comparteix → Descarrega → PDF estàndard. Totes les pàgines o peces en un sol PDF.") },
    { h: T("4. Puja'l a Google Drive"), d: T("Puja el PDF a Google Drive, obre «Comparteix» i tria «Qualsevol persona que tingui l'enllaç pot veure». Copia l'enllaç.") },
    { h: T("5. Entrega'l des del joc"), d: T("Pestanya 📋 Projectes: enganxa l'enllaç del PDF i marca les pàgines o peces que inclou. Necessites el codi de classe del professor.") },
    { h: T("6. Correcció i revisió"), d: T("En pocs minuts, una correcció automàtica llegeix el PDF, el puntua amb la rúbrica i et dona comentaris. Pots continuar jugant mentrestant. El professor pot canviar la nota en qualsevol moment. Si cal millorar-lo, rebràs un avís: corregeix-lo i torna'l a entregar.") }
  ],
  ai: T("Pots fer servir la IA per buscar idees o revisar textos, però el que compta és que les peces i les pàgines siguin teves i adaptades al client del joc. Un disseny genèric, que podria ser de qualsevol empresa, es retornarà."),
  ads: T("Les peces han de semblar anuncis de veritat: la mida correcta de cada xarxa, el logotip o el nom del negoci, un missatge curt i una crida a l'acció clara. No cal publicar res ni gastar diners."),
  grading: T("Cada projecte s'avalua amb la seva rúbrica: cada criteri té 4 nivells (de 0 a 3 punts) i la nota és la proporció de punts obtinguts sobre 10. S'aprova amb un 5. La correcció automàtica llegeix el PDF de Google Drive; la nota final la decideix sempre el professor.")
};

GD.projGuide.pay = T("Cada projecte i cada web del Taller web es paga segons la nota: cobres l'import màxim indicat × nota ÷ 10 (arrodonit a 10 €). Amb un 5 cobres la meitat; amb un 10, tot. Si millores la nota (tornant a entregar o perquè el professor la puja), cobres la diferència. Aquests imports són molt superiors a la resta d'ingressos del joc: val la pena fer-ho bé.");

// Formats comuns
const FORMAT_PLA = T("Presentació de Canva de 2 a 4 pàgines, descarregada en PDF i pujada a Google Drive (enllaç públic). Res de documents de text.");
const FORMAT_PECES = T("Només les peces fetes a Canva, sense textos que les expliquin. Totes en un sol PDF pujat a Google Drive (enllaç públic).");
const RUBRICA_PECES = [
  T("Les peces encaixen amb el client: el seu nom o logotip, els seus colors i el seu to"),
  T("El missatge és curt i clar, i hi ha una crida a l'acció (què ha de fer la persona)"),
  T("Cada peça té la mida i el format del seu canal (publicació, història, anunci, cartell...)"),
  T("Es dirigeixen al públic correcte i parlen del que l'interessa"),
  T("El disseny es llegeix bé: jerarquia, contrast, poques lletres i imatges adequades"),
  T("Els textos no tenen faltes i les dades (preus, horaris, adreça) són coherents amb el joc")
];
const EINES_PECES = T("Canva (plantilles de publicació d'Instagram, història, anunci de Facebook, bàner de Google i cartell A4) · Fotos pròpies o d'Unsplash i Pexels");

GD.projects = [
  /* ===================== ETAPA 1 ===================== */
  {
    id: 'pla-forn', after: '1.3', who: 'carme', bg: 'forn', kind: T("Pla de màrqueting"),
    title: T("Pla de màrqueting del forn de la Carme"),
    brief: [
      ['carme.n', T("{nom}, m'has explicat el pla de paraula, però el vull veure en poques pàgines. Que ho pugui ensenyar al meu fill.")],
      ['carme.t', T("Què farem, per a qui, quant costa i com sabré si ha funcionat. Clar i sense paraulotes de màrqueting.")],
      ['pau.t', T("Una presentació curta a Canva amb el més important. Res de documents llargs.")]
    ],
    goal: T("Explicar en 2 a 4 pàgines de Canva el pla per recuperar les vendes de la tarda del forn de la Carme, amb un pressupost de 300 €."),
    format: FORMAT_PLA, pla: true,
    sections: [
      { h: T("El problema i l'objectiu"), d: T("Què passa a les tardes i un objectiu SMART amb número i termini (per exemple, +15 % de vendes de 16 a 19 h en 4 setmanes).") },
      { h: T("Per a qui"), d: T("Un o dos perfils de client (famílies de l'escola, gent gran del barri) amb el que necessiten.") },
      { h: T("Què farem"), d: T("Les 3 o 4 accions principals (fitxa de Google, oferta de berenar, cupons, anuncis locals), amb el canal de cadascuna.") },
      { h: T("Quant costa i com ho mesurarem"), d: T("Taula amb el repartiment dels 300 € i 2 o 3 indicadors (vendes de la tarda, cupons bescanviats...).") }
    ],
    steps: [
      T("Repassa les notes de l'entrevista amb la Carme (capítol 1.2) i les decisions del capítol 1.3."),
      T("Tria una plantilla de presentació a Canva i fes una pàgina per a cada apartat (2 a 4 en total)."),
      T("Escriu frases curtes: si cal un paràgraf llarg per explicar-ho, és que encara no està clar."),
      T("Descarrega-ho en PDF i puja-ho a Google Drive amb enllaç públic.")
    ],
    tools: T("Canva (plantilla de presentació) · Google Drive"),
    rubric: [
      T("L'objectiu és SMART i respon al problema real (les tardes)"),
      T("El públic està ben triat i les accions hi encaixen"),
      T("El pressupost suma 300 € i és realista"),
      T("Hi ha indicadors mesurables"),
      T("Es llegeix ràpid: 2 a 4 pàgines clares, sense text sobrant")
    ],
    tips: [
      T("Error freqüent: començar per Instagram. Primer el problema, després els canals."),
      T("Una taula o un esquema expliquen més que un paràgraf.")
    ],
    reward: { xp: 220, money: 150, rep: 2, trust: 'carme' }
  },
  {
    id: 'campanya-forn', after: '1.4', who: 'carme', bg: 'forn', kind: T("Campanya i anuncis"),
    title: T("Campanya «Berenar de tarda»: les peces"),
    brief: [
      ['carme.h', T("El pla m'agrada. Ara vull veure els anuncis de veritat abans que surtin, que no em trobi sorpreses.")],
      ['carme.n', T("I el cartell per a la sortida de l'escola, que la gent gran no mira el mòbil.")],
      ['pau.h', T("Només les peces, ben fetes. No cal explicar res: han de parlar soles.")]
    ],
    goal: T("Dissenyar a Canva les peces de la campanya «Berenar de tarda» del forn de la Carme."),
    format: FORMAT_PECES, peces: true,
    sections: [
      { h: T("Publicació d'Instagram (1080 × 1080)"), d: T("L'oferta de berenar amb una foto que faci gana.") },
      { h: T("Història d'Instagram (1080 × 1920)"), d: T("Vertical, amb el missatge a dalt i la crida a l'acció a baix.") },
      { h: T("Anunci de Facebook (1200 × 628)"), d: T("Pensat per a famílies del barri.") },
      { h: T("Bàner de Google (300 × 250 o 728 × 90)"), d: T("Molt poc text: nom, oferta i botó.") },
      { h: T("Cartell A4 per a l'escola"), d: T("Per a la gent que no mira el mòbil: lletra gran, horari i adreça.") }
    ],
    steps: [
      T("Defineix una idea i un eslògan que es repeteixi a totes les peces."),
      T("Fes cada peça amb la mida del seu canal (Canva té plantilles amb la mida correcta)."),
      T("Revisa que el nom del forn, l'horari de la tarda i l'oferta surtin bé a totes."),
      T("Posa-les totes en un sol PDF, puja'l a Google Drive i entrega l'enllaç.")
    ],
    tools: EINES_PECES,
    rubric: RUBRICA_PECES,
    tips: [T("Si una peça necessita una explicació per entendre's, no funciona."), T("Una sola idea per peça: oferta, horari i crida a l'acció.")],
    reward: { xp: 240, money: 200, rep: 2, trust: 'carme' }
  },
  /* ===================== ETAPA 2 ===================== */
  {
    id: 'local-jordi', after: '2.1', who: 'jordi', bg: 'restaurant', kind: T("Pla de SEO local"),
    title: T("Pla de SEO local i ressenyes per a Can Jordi"),
    brief: [
      ['jordi.n', T("Els dilluns i dimarts tinc el menjador mig buit i a Google surto per sota de tres restaurants que cuinen pitjor.")],
      ['jordi.t', T("Ensenya-m'ho en poques pàgines: què he de canviar a la fitxa, com demano ressenyes i quina promoció faig.")]
    ],
    goal: T("Explicar en 2 a 4 pàgines de Canva com millorar la presència de Can Jordi a Google i omplir el menjador els dies fluixos."),
    format: FORMAT_PLA, pla: true,
    sections: [
      { h: T("La fitxa de Google, abans i després"), d: T("Què està malament (categoria, horaris, fotos, descripció) i com ha de quedar.") },
      { h: T("Paraules clau locals"), d: T("5 cerques que fa la gent (per exemple, «menú migdia Vic») i on les posarem.") },
      { h: T("Ressenyes"), d: T("Com les demanarem i dues respostes model: una de positiva i una de negativa.") },
      { h: T("Promoció dels dies fluixos i indicadors"), d: T("Una promoció per a dilluns i dimarts i 2 o 3 indicadors per saber si funciona.") }
    ],
    steps: [
      T("Mira fitxes reals de restaurants de Vic a Google Maps per veure què funciona."),
      T("Fes una pàgina per a cada apartat a Canva (2 a 4 en total), amb captures o esquemes."),
      T("Descarrega-ho en PDF i puja-ho a Google Drive amb enllaç públic.")
    ],
    tools: T("Canva · Google Maps · Google Drive"),
    rubric: [
      T("Les millores de la fitxa de Google són concretes i correctes"),
      T("Les paraules clau són locals i realistes"),
      T("Les respostes a ressenyes són professionals i amables"),
      T("La promoció ataca els dies fluixos i es pot mesurar"),
      T("Es llegeix ràpid: 2 a 4 pàgines clares, sense text sobrant")
    ],
    tips: [T("Les respostes a ressenyes negatives: agrair, demanar disculpes, solucionar i convidar a tornar.")],
    reward: { xp: 250, money: 250, rep: 2, trust: null }
  },
  {
    id: 'b2b-miquel', after: '2.2', who: 'miquel', bg: 'fabrica', kind: T("Campanya B2B"),
    title: T("Campanya B2B de Mecanitzats Bellmunt: les peces"),
    brief: [
      ['miquel.n', T("Ja t'ho vaig dir: no vull m'agrades. Vull que em truquin fabricants de maquinària.")],
      ['miquel.t', T("Ensenya'm els anuncis i el correu que veuran els clients. Res més.")]
    ],
    goal: T("Dissenyar a Canva les peces d'una campanya per aconseguir contactes de fabricants de maquinària."),
    format: FORMAT_PECES, peces: true,
    sections: [
      { h: T("Anunci de LinkedIn (1200 × 627)"), d: T("Per a responsables de compres i d'enginyeria: precisió, terminis i certificacions.") },
      { h: T("Segon anunci de LinkedIn"), d: T("Un altre missatge per comparar quin funciona millor (per exemple, rapidesa o qualitat).") },
      { h: T("Anunci de cerca de Google"), d: T("Simulat a Canva: títols, descripció i enllaç, com sortiria a Google.") },
      { h: T("Correu de presentació"), d: T("Dissenyat com un correu: assumpte, missatge curt i botó per demanar pressupost.") }
    ],
    steps: [
      T("Pensa en qui decideix la compra en una fàbrica i què li preocupa (terminis, toleràncies, preu)."),
      T("Fes les peces amb un to professional: res d'emoticones ni frases de consum."),
      T("Posa-les en un sol PDF, puja'l a Google Drive i entrega l'enllaç.")
    ],
    tools: EINES_PECES + T(" · Plantilles de LinkedIn i de correu de Canva"),
    rubric: RUBRICA_PECES,
    tips: [T("En B2B la crida a l'acció és «Demana pressupost» o «Parla amb un enginyer», no «Compra ara».")],
    reward: { xp: 260, money: 300, rep: 2, trust: 'miquel' }
  },
  /* ===================== ETAPA 4 ===================== */
  {
    id: 'continguts-berta', after: '4.2', who: 'berta', bg: 'despatx', kind: T("Continguts per a xarxes"),
    title: T("Una setmana de publicacions per a un client"),
    brief: [
      ['berta.h', T("Si hem de publicar cada setmana per a tres clients, no podem improvisar cada dilluns.")],
      ['berta.n', T("Tria un client i fes les publicacions d'una setmana. Només les peces: les ensenyarem tal com sortiran.")]
    ],
    goal: T("Dissenyar a Canva les publicacions d'una setmana per a un client del joc (a triar)."),
    format: FORMAT_PECES, peces: true,
    sections: [
      { h: T("3 publicacions d'Instagram (1080 × 1080 o 1080 × 1350)"), d: T("Variades: producte, persones del negoci i un consell útil.") },
      { h: T("2 històries d'Instagram (1080 × 1920)"), d: T("Una amb una enquesta o pregunta i una amb una oferta o novetat.") },
      { h: T("1 carrusel (3 a 5 diapositives)"), d: T("Un tema que s'expliqui per passos.") },
      { h: T("Portada de vídeo curt o reel"), d: T("La imatge de portada amb el títol del vídeo.") }
    ],
    steps: [
      T("Tria el client i repassa el seu to a la llibreta (pestanya Clients)."),
      T("Fes servir els mateixos colors i tipografies a totes les peces: que es vegi que són de la mateixa marca."),
      T("Posa-les en un sol PDF en l'ordre de publicació, puja'l a Google Drive i entrega l'enllaç.")
    ],
    tools: EINES_PECES + T(" · Plantilles de carrusel i de reel de Canva"),
    rubric: RUBRICA_PECES,
    tips: [T("Varia el tipus de contingut: no tot ha de ser vendre.")],
    reward: { xp: 300, money: 300, rep: 2, trust: 'berta' }
  },
  /* ===================== ETAPA 7 ===================== */
  {
    id: 'franca-amelie', after: '7.2', who: 'amelie', bg: 'franca', kind: T("Campanya internacional"),
    title: T("Anuncis en francès per a Cosmètica del Montseny"),
    brief: [
      ['amelie.n', T("La direcció vol veure els anuncis abans d'invertir a França. I els vol en francès de veritat, no traduïts amb pressa.")],
      ['amelie.h', T("Les peces, adaptades al públic francès. Allez!")]
    ],
    goal: T("Dissenyar a Canva les peces en francès per al llançament de Cosmètica del Montseny a França."),
    format: FORMAT_PECES, peces: true,
    sections: [
      { h: T("Publicació d'Instagram en francès"), d: T("Amb el producte estrella i un missatge adaptat (no traduït paraula per paraula).") },
      { h: T("Història d'Instagram en francès"), d: T("Amb la crida a l'acció i l'enviament a França.") },
      { h: T("Anunci de Facebook en francès"), d: T("Per al públic que heu triat al joc.") },
      { h: T("Anunci de cerca de Google en francès"), d: T("Simulat a Canva, amb paraules clau en francès.") }
    ],
    steps: [
      T("Repassa al capítol 7.2 què valora el públic francès (ingredients naturals, certificacions, enviament ràpid)."),
      T("Escriu els textos en francès i revisa'ls amb cura: una falta en un anunci fa perdre confiança."),
      T("Posa les peces en un sol PDF, puja'l a Google Drive i entrega l'enllaç.")
    ],
    tools: EINES_PECES,
    rubric: RUBRICA_PECES.slice(0, 5).concat([T("El francès és correcte i el missatge està adaptat al mercat francès")]),
    tips: [T("Adaptar no és traduir: els preus en euros, l'enviament a França i referències que entenguin allà.")],
    reward: { xp: 360, money: 500, rep: 3, trust: null }
  }
];

GD.projectById = (id) => GD.projects.find(p => p.id === id);

/* Pagament segons la nota: cada entrega cobra «import màxim × nota ÷ 10» (arrodonit a 10 €), i s'aprova amb un 5.
   L'import màxim és molt superior a la resta d'ingressos del joc. Si la nota puja (per una nova entrega o perquè
   el professor la modifica), l'alumne cobra la diferència; mai se li treu res. */
GD.PAY_PROJECT = 6; GD.PAY_WEB = 4;
GD.projMax = (p) => Math.round(((p.reward && p.reward.money) || 0) * GD.PAY_PROJECT);
GD.webMax = (L) => Math.round(((L.reward && L.reward.money) || 0) * GD.PAY_WEB);
GD.payFor = (max, grade) => Math.round(max * Math.min(10, Math.max(0, +grade || 0)) / 100) * 10;

// Les webs del Taller web es corregeixen igual que els projectes (tasca «web-N», amb els requisits del client com a rúbrica)
GD.webTasks = (GD.webLevels || []).map(L => ({
  id: 'web-' + L.n, web: L.n, who: L.who, bg: L.bg, kind: T("Taller web"), title: L.title, after: 'web ' + L.n,
  brief: L.brief, goal: L.sub, format: T("Web publicada (enllaç públic)"), sections: [], rubric: L.reqs, reward: L.reward
}));
GD.gradable = GD.projects.concat(GD.webTasks);
GD.gradableById = (id) => GD.gradable.find(p => p.id === id);
GD.projectAfter = (chId) => GD.projects.find(p => p.after === chId);
// Plantilla per copiar a Google Docs: títol, client i seccions amb el que han de contenir
GD.projectTemplate = (p, name) => [
  p.title.toUpperCase(),
  T("Agència: {0}", [name || '']),
  '',
  ...p.sections.flatMap((s, i) => [`${i + 1}. ${s.h}`, `[${s.d}]`, '']),
  T("Eines d'IA utilitzades i per a què:"),
  ''
].join('\n');

// Rúbrica: cada criteri de cada projecte es puntua amb aquests 4 nivells (0–3 punts)
GD.rubricLevels = [
  { n: T("No assolit"), d: T("No hi és o és incorrecte.") },
  { n: T("En procés"), d: T("Hi és, però incomplet, genèric o poc justificat.") },
  { n: T("Assolit"), d: T("Complet, correcte i adaptat al client.") },
  { n: T("Excel·lent"), d: T("Complet, justificat amb dades i amb aportacions pròpies d'alt nivell.") }
];
// Nota de 0 a 10 (arrodonida a mig punt) a partir dels nivells de cada criteri
GD.gradeFromLevels = (levels) => levels.length ? Math.round(levels.reduce((a, b) => a + (+b || 0), 0) / (3 * levels.length) * 20) / 2 : 0;
GD.PASS_GRADE = 5;
