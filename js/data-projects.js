/* Agència Digital — Projectes reals: lliuraments que l'alumne fa de veritat i que el professorat revisa.
   Cada projecte s'activa en acabar el capítol «after» i bloqueja el capítol següent fins que el professor l'aprova.
   La guia completa de cada projecte es pot consultar a guia.html. */
window.GD = window.GD || {};

GD.projGuide = {
  intro: T("Al llarg del joc, els clients de l'agència et demanaran feines reals: plans, campanyes, anuncis, informes i propostes. No n'hi ha prou de respondre preguntes: les has de fer de veritat, entregar-les i esperar que el professor les aprovi per continuar la campanya."),
  how: [
    { h: T("1. Llegeix l'encàrrec i la guia"), d: T("Cada projecte té una guia amb el que ha de contenir, els passos, les eines recomanades i com s'avaluarà. Llegeix-la sencera abans de començar.") },
    { h: T("2. Fes servir les dades del joc"), d: T("Les empreses són fictícies, però el que has descobert jugant (problemes, pressupostos, públics, resultats) és la teva informació de partida. Completa-la amb dades reals del mercat (Idescat, INE, Google Trends, competidors reals de la zona) i marca com a «supòsit» tot el que t'inventis.") },
    { h: T("3. Crea el document"), d: T("Fes-lo amb Google Docs, Google Slides, Canva, Word o PowerPoint en línia. Segueix l'estructura de la guia: pots copiar-ne la plantilla des del joc o des d'aquesta pàgina.") },
    { h: T("4. Comparteix-lo bé"), d: T("Obre l'opció de compartir i tria «Qualsevol persona que tingui l'enllaç pot veure». Si el professor no el pot obrir, te'l retornarà sense revisar.") },
    { h: T("5. Entrega'l des del joc"), d: T("Pestanya 📋 Projectes: enganxa l'enllaç, marca les seccions que inclou i escriu un resum de la teva proposta. Necessites el codi de classe del professor.") },
    { h: T("6. Espera la revisió"), d: T("El professor el pot aprovar o demanar-te canvis amb comentaris. Si et demana canvis, corregeix el mateix document (o fes-ne una versió nova) i torna'l a entregar. Mentrestant pots fer encàrrecs, lliçons i el Taller web.") }
  ],
  ai: T("Pots fer servir la IA per buscar idees, revisar textos o generar esborranys, però la feina ha de ser teva i adaptada al client: indica al final del document quines eines d'IA has fet servir i per a què. Un document genèric copiat d'una IA es retornarà."),
  ads: T("Quan un projecte demana anuncis reals, crea'ls de veritat: dissenya les peces (Canva, Adobe Express, CapCut...) i munta la campanya a l'eina real (Meta Ads Manager, Google Ads, LinkedIn Campaign Manager) fins al pas abans de publicar, i fes-ne captures. No cal publicar ni gastar diners. Si no pots crear un compte, fes servir les vistes prèvies oficials i explica-ho a la nota."),
  grading: T("Cada projecte s'avalua amb els criteris que trobaràs a la seva guia. Per aprovar, ha d'estar complet, adaptat al client i justificat amb dades. El professor també pot posar-hi una nota de 0 a 10.")
};

GD.projects = [
  /* ===================== ETAPA 1 ===================== */
  {
    id: 'pla-forn', after: '1.3', who: 'carme', bg: 'forn', kind: T("Pla de màrqueting"),
    title: T("Pla de màrqueting del forn de la Carme"),
    brief: [
      ['carme.n', T("{nom}, m'has explicat el pla de paraula, però jo ho vull per escrit. Que ho pugui ensenyar al meu fill.")],
      ['carme.t', T("Què farem, per què, quant costa i com sabré si ha funcionat. Clar i sense paraulotes de màrqueting.")],
      ['pau.t', T("Un pla de màrqueting de debò. Això ho he de fer jo, no el joc.")]
    ],
    goal: T("Redactar un pla de màrqueting complet i realista per al forn de la Carme, amb el pressupost de 300 € i l'objectiu de recuperar les vendes de la tarda."),
    format: T("Document de 4 a 8 pàgines (Google Docs, Word o Canva) o presentació de 10 a 15 diapositives."),
    sections: [
      { h: T("Resum executiu"), d: T("En mitja pàgina: problema, objectiu, accions principals, pressupost i com es mesurarà. És el que llegirà primer la Carme.") },
      { h: T("Diagnosi de la situació"), d: T("El que vas descobrir a l'entrevista: franges fluixes, clients, canvis de l'entorn (supermercat, horari de l'escola), fitxa de Google errònia. Inclou un DAFO.") },
      { h: T("Públic objectiu"), d: T("Almenys dos perfils de client (buyer persona): famílies de l'escola, gent gran del barri... Què necessiten, quan passen pel forn i què els faria entrar a la tarda.") },
      { h: T("Objectiu SMART"), d: T("Específic, mesurable, assolible, rellevant i amb termini. Per exemple: +15 % de vendes dimarts i dimecres de 16 a 19 h en 4 setmanes.") },
      { h: T("Estratègia i posicionament"), d: T("Quin missatge principal farem servir i per què el forn és diferent del supermercat. Una frase de posicionament.") },
      { h: T("Pla d'accions i canals"), d: T("Cada acció amb què es fa, on, per a qui i qui se n'encarrega: fitxa de Google, oferta de berenar, cupons, anuncis locals... Justifica per què cada canal.") },
      { h: T("Calendari"), d: T("Cronograma de les 4 setmanes (taula o diagrama de Gantt) amb les accions setmana a setmana.") },
      { h: T("Pressupost"), d: T("Taula amb el repartiment dels 300 € per partida. Recorda: són diners de la clienta, no ingressos de l'agència.") },
      { h: T("Indicadors i seguiment"), d: T("3 o 4 KPI amb el valor de partida, l'objectiu i com i quan es mesuraran (caixa, cupons bescanviats, fitxa de Google).") }
    ],
    steps: [
      T("Repassa les notes de l'entrevista amb la Carme (capítol 1.2) i les decisions que vas prendre al capítol 1.3."),
      T("Busca dades reals de l'entorn: competència (forns i supermercats de Vic), horaris de les escoles, població del barri a Idescat."),
      T("Fes el DAFO i les buyer persona abans d'escriure les accions: les accions han de sortir de la diagnosi."),
      T("Escriu el pla seguint l'estructura i afegeix-hi taules per al calendari, el pressupost i els KPI."),
      T("Rellegeix-lo pensant en la Carme: s'entén sense saber màrqueting? Elimina tecnicismes innecessaris.")
    ],
    tools: T("Google Docs o Word · Canva (plantilles de DAFO i buyer persona) · Google Sheets per al pressupost · Idescat i Google Maps per a l'entorn"),
    rubric: [
      T("La diagnosi es basa en dades del client i de l'entorn, i el DAFO és coherent"),
      T("L'objectiu és SMART i està lligat al problema real (les tardes)"),
      T("Les accions es justifiquen i encaixen amb el públic i el pressupost"),
      T("Pressupost i calendari realistes i ben presentats"),
      T("KPI mesurables amb valor de partida i objectiu"),
      T("Redacció clara, adaptada a una clienta que no és experta")
    ],
    tips: [
      T("Error freqüent: començar per Instagram. Primer el problema, després els canals."),
      T("Si un número és inventat, marca'l com a supòsit i explica d'on surt l'estimació.")
    ],
    reward: { xp: 220, money: 150, rep: 2, trust: 'carme' }
  },
  {
    id: 'campanya-forn', after: '1.4', who: 'carme', bg: 'forn', kind: T("Campanya i anuncis"),
    title: T("Campanya «Berenar de tarda» amb anuncis reals"),
    brief: [
      ['carme.h', T("El pla m'agrada. Ara vull veure els anuncis de veritat abans que surtin, que no em trobi sorpreses.")],
      ['carme.n', T("I el cartell per a la sortida de l'escola, que la gent gran no mira el mòbil.")],
      ['pau.h', T("Peces reals, textos reals i la campanya muntada a l'eina. Som-hi.")]
    ],
    goal: T("Crear la campanya «Berenar de tarda»: anuncis reals per a Meta i Google, el material imprès i la configuració de la campanya a punt per publicar."),
    format: T("Carpeta compartida (Google Drive o Canva) amb les peces i un document de campanya que les expliqui, amb captures de la configuració."),
    sections: [
      { h: T("Concepte creatiu"), d: T("La idea central i l'eslògan de la campanya, amb el to de veu del forn i per què connecta amb el públic.") },
      { h: T("3 anuncis per a Instagram i Facebook"), d: T("Formats quadrat (1:1) i vertical (9:16) amb text principal, títol i botó d'acció. Almenys un ha de ser una història o un reel.") },
      { h: T("Anunci de cerca de Google"), d: T("Paraules clau (per exemple, «forn obert Vic»), 3 títols i 2 descripcions, i l'extensió d'ubicació.") },
      { h: T("Material imprès"), d: T("Cupó o cartell «Berenar de tarda» per repartir a la sortida de l'escola, amb codi o marca per comptar-ne els bescanvis.") },
      { h: T("Segmentació i pressupost"), d: T("Ubicació (radi al voltant del forn), edat, interessos, horaris de publicació i repartiment del pressupost per canal i per setmana.") },
      { h: T("Configuració a l'eina"), d: T("Captures de la campanya muntada a Meta Ads Manager i a Google Ads (objectiu, públic, pressupost, anunci) fins al pas abans de publicar.") },
      { h: T("Mesura"), d: T("Com comptareu els resultats de cada canal: enllaços amb UTM, codi del cupó, trucades i rutes de la fitxa de Google.") }
    ],
    steps: [
      T("Defineix el concepte i l'eslògan a partir del públic del pla de màrqueting."),
      T("Dissenya les peces a Canva amb les mides correctes (1080×1080 i 1080×1920) i el text llegible al mòbil."),
      T("Escriu els textos de l'anunci de Google respectant els límits (30 caràcters per títol i 90 per descripció)."),
      T("Munta la campanya a Meta Ads Manager i a Google Ads sense publicar-la i fes-ne captures. Si no pots, fes servir les vistes prèvies oficials."),
      T("Crea els enllaços amb UTM amb el Campaign URL Builder de Google i afegeix-los al document.")
    ],
    tools: T("Canva o Adobe Express · Meta Ads Manager · Google Ads (mode expert, sense publicar) · Campaign URL Builder · Biblioteca d'anuncis de Meta per inspirar-te"),
    rubric: [
      T("Concepte creatiu clar i coherent amb el pla i el públic"),
      T("Les peces tenen les mides correctes i una crida a l'acció clara"),
      T("L'anunci de Google respecta els límits i fa servir paraules clau locals"),
      T("La segmentació i el pressupost són coherents amb els 300 €"),
      T("La campanya està muntada realment a les eines (captures)"),
      T("Cada canal té una manera concreta de mesurar-ne el resultat")
    ],
    tips: [
      T("Mira a la Biblioteca d'anuncis de Meta què fan forns i cafeteries reals abans de dissenyar."),
      T("Un anunci amb massa text no es llegeix: una idea, una imatge, una acció.")
    ],
    reward: { xp: 240, money: 200, rep: 2, trust: 'carme' }
  },

  /* ===================== ETAPA 2 ===================== */
  {
    id: 'local-jordi', after: '2.1', who: 'jordi', bg: 'restaurant', kind: T("SEO local i reputació"),
    title: T("Estratègia de SEO local i ressenyes per a Can Jordi"),
    brief: [
      ['jordi.n', T("Els dilluns i dimarts tinc el menjador mig buit i a Google surto per sota de tres restaurants que cuinen pitjor.")],
      ['jordi.t', T("Vull saber exactament què he de canviar a la fitxa, què he de publicar i com responc les ressenyes.")]
    ],
    goal: T("Auditar la presència local de Can Jordi i fer un pla per omplir el menjador els dies fluixos amb SEO local, ressenyes i una promoció."),
    format: T("Document o presentació amb captures i taules."),
    sections: [
      { h: T("Auditoria de la fitxa de Google"), d: T("Revisa una fitxa real d'un restaurant de la zona com a model: categories, horaris, fotos, carta, atributs, preguntes i respostes. Indica què falta i què milloraries a Can Jordi.") },
      { h: T("Paraules clau locals"), d: T("Almenys 10 cerques que faria un client (per exemple, «menú del dia Tona»), amb el volum aproximat i la intenció de cada una.") },
      { h: T("Anàlisi de 3 competidors"), d: T("Restaurants reals de la zona: valoració, nombre de ressenyes, fotos i què fan millor o pitjor.") },
      { h: T("Pla de ressenyes"), d: T("Com aconseguir-ne més (QR a la taula, missatge després de la reserva) i 4 respostes redactades: dues positives i dues negatives.") },
      { h: T("Promoció per als dies fluixos"), d: T("Una oferta per a dilluns i dimarts pensada per al públic local (no per als seguidors de Barcelona) i com es comunicarà.") },
      { h: T("5 publicacions de Google"), d: T("Textos (i imatges si pots) de 5 publicacions per a la fitxa de Google: novetats, menú, oferta i esdeveniments.") },
      { h: T("Indicadors"), d: T("Com es mesurarà: posició a les cerques, trucades, reserves, rutes i cobertes de dilluns i dimarts.") }
    ],
    steps: [
      T("Cerca a Google Maps «restaurant Tona» i analitza com apareixen els competidors."),
      T("Troba paraules clau amb les suggerències de Google, Google Trends o el planificador de paraules clau de Google Ads."),
      T("Redacta les respostes a ressenyes: agraeix, personalitza i, en les negatives, ofereix una solució sense discutir."),
      T("Dissenya la promoció pensant en qui viu o treballa a prop de Tona."),
      T("Posa-ho tot en un document amb captures i una taula de prioritats.")
    ],
    tools: T("Google Maps i Perfil d'Empresa de Google · Google Trends · Planificador de paraules clau de Google Ads · Canva"),
    rubric: [
      T("L'auditoria de la fitxa és completa i amb propostes concretes"),
      T("Les paraules clau són locals i tenen en compte la intenció de cerca"),
      T("L'anàlisi de la competència fa servir dades reals"),
      T("Les respostes a ressenyes són professionals i empàtiques"),
      T("La promoció s'adreça al públic local i té una manera de mesurar-la")
    ],
    tips: [
      T("Error freqüent: pensar en seguidors. Can Jordi necessita gent que pugui venir a dinar un dilluns."),
      T("Una resposta a una ressenya negativa la llegeixen els futurs clients, no només qui l'ha escrit.")
    ],
    reward: { xp: 250, money: 250, rep: 2, trust: null }
  },
  {
    id: 'b2b-miquel', after: '2.2', who: 'miquel', bg: 'fabrica', kind: T("Campanya B2B"),
    title: T("Campanya de captació B2B per a Mecanitzats Bellmunt"),
    brief: [
      ['miquel.n', T("Ja t'ho vaig dir: no vull m'agrades. Vull que em truquin fabricants de maquinària.")],
      ['miquel.t', T("Ensenya'm la campanya sencera: a qui ens adrecem, quins anuncis, on aterren i com sabré si el contacte és bo.")]
    ],
    goal: T("Dissenyar una campanya de generació de contactes qualificats (leads) per a una empresa industrial que ven a altres empreses."),
    format: T("Document o presentació, amb els anuncis creats i captures de les eines."),
    sections: [
      { h: T("Client ideal i centre de decisió"), d: T("Perfil d'empresa ideal (sector, mida, zona) i les persones que intervenen en la compra: qui la necessita, qui l'aprova i qui la paga.") },
      { h: T("Investigació de paraules clau"), d: T("Almenys 15 paraules clau de cerca industrial amb volum, competència i tipus de concordança. Llista de paraules clau negatives.") },
      { h: T("2 anuncis de cerca de Google"), d: T("Anuncis adaptables amb títols i descripcions centrats en especificacions, terminis i certificacions.") },
      { h: T("2 anuncis de LinkedIn"), d: T("Imatge i text per a LinkedIn amb la segmentació per càrrec, sector i mida d'empresa.") },
      { h: T("Pàgina d'aterratge i formulari"), d: T("Esquema de la pàgina on arriben els anuncis i el formulari qualificat: empresa, sector, necessitat, volum.") },
      { h: T("Qualificació i seguiment"), d: T("Com es decideix si un contacte és bo, qui el truca i en quant de temps. Inclou el valor d'un client nou.") },
      { h: T("Pressupost i KPI"), d: T("Pressupost mensual per canal, cost per contacte objectiu i contactes qualificats esperats.") }
    ],
    steps: [
      T("Defineix el client ideal amb el que t'ha explicat el Miquel (maquinària agrícola i alimentària de Catalunya i l'Aragó)."),
      T("Fes la recerca de paraules clau al planificador de Google Ads i descarta les cerques de particulars."),
      T("Crea els anuncis a Google Ads i a LinkedIn Campaign Manager sense publicar-los i fes-ne captures."),
      T("Dibuixa l'esquema de la pàgina d'aterratge (a mà, a Canva o a Figma)."),
      T("Calcula quants contactes necessites per guanyar un client i si la campanya surt a compte.")
    ],
    tools: T("Planificador de paraules clau de Google Ads · LinkedIn Campaign Manager · Canva o Figma · Google Sheets"),
    rubric: [
      T("El client ideal i el centre de decisió estan ben definits"),
      T("Les paraules clau són professionals i inclouen paraules negatives"),
      T("Els anuncis parlen el llenguatge del comprador industrial"),
      T("El formulari permet qualificar els contactes"),
      T("Els números (cost per contacte, valor d'un client) tenen sentit")
    ],
    tips: [
      T("En B2B, el «sí» no el diu una sola persona: pensa en l'enginyer, en compres i en direcció."),
      T("Un contacte barat que no compra mai és car.")
    ],
    reward: { xp: 260, money: 300, rep: 2, trust: 'miquel' }
  },
  {
    id: 'ecommerce-nuria', after: '2.3', who: 'nuria', bg: 'botiga', kind: T("Comerç electrònic"),
    title: T("Pla de botiga en línia i correus automàtics per a la Cansaladeria Núria"),
    brief: [
      ['nuria.n', T("La botiga ja té forma, però em fa por: com explico que el fuet arriba fresc? I què passa si la gent deixa el carretó a mitges?")],
      ['nuria.h', T("Vull les fitxes de producte ben fetes i els correus que s'envien sols.")]
    ],
    goal: T("Definir l'embut de venda de la botiga en línia, redactar fitxes de producte que venguin i crear els correus automàtics bàsics."),
    format: T("Document amb les fitxes i els correus, i captures o enllaç dels correus dissenyats."),
    sections: [
      { h: T("Embut de venda"), d: T("Les etapes des que algú descobreix la botiga fins que repeteix compra, amb una acció i un indicador per a cada etapa.") },
      { h: T("3 fitxes de producte"), d: T("Títol, descripció orientada a beneficis, pes, conservació, al·lèrgens, preu, enviament i fotos recomanades. Optimitzades per al SEO.") },
      { h: T("Política d'enviament en fred"), d: T("Com s'explica l'enviament en fred, els terminis, el cost i l'enviament gratuït a partir d'un import.") },
      { h: T("Correu de benvinguda"), d: T("Assumpte, text previ i cos del correu per a qui se subscriu, amb una oferta de primera compra.") },
      { h: T("Correu de carretó abandonat"), d: T("Seqüència de 2 correus (al cap d'1 hora i de 24 hores) amb assumptes i textos.") },
      { h: T("Correu després de la compra"), d: T("Agraïment, consells de conservació i petició de ressenya.") },
      { h: T("Mètriques de la botiga"), d: T("Taxa de conversió, valor mitjà de la comanda, taxa d'abandonament del carretó i repetició, amb objectius.") }
    ],
    steps: [
      T("Mira 3 botigues reals d'embotits en línia i apunta què fan bé a les fitxes i a l'enviament."),
      T("Escriu les fitxes pensant en el dubte del comprador: és fresc? quant dura? quan arriba?"),
      T("Dissenya els correus amb una eina gratuïta (Mailchimp, Brevo o Shopify Email) o en un document amb l'estructura visual."),
      T("Revisa la llei: preus amb IVA, cost d'enviament visible i dret de desistiment."),
      T("Afegeix a cada etapa de l'embut quin número miraràs cada setmana.")
    ],
    tools: T("Mailchimp, Brevo o Shopify Email (pla gratuït) · Canva · Botigues de referència del sector"),
    rubric: [
      T("L'embut és complet i cada etapa té un indicador"),
      T("Les fitxes responen els dubtes del comprador i tenen la informació legal"),
      T("L'enviament en fred s'explica amb claredat i confiança"),
      T("Els correus tenen assumptes atractius i una sola acció principal"),
      T("Les mètriques tenen objectius realistes")
    ],
    tips: [
      T("La descripció no és «fuet de Vic»: és per què aquest fuet i no un altre."),
      T("L'assumpte decideix si s'obre el correu: prova'n dues versions.")
    ],
    reward: { xp: 260, money: 300, rep: 2, trust: null }
  },
  {
    id: 'kpi-sergi', after: '2.4', who: 'sergi', bg: 'despatx', kind: T("Analítica"),
    title: T("Pla de mesura i quadre de comandament per a Cim Trail"),
    brief: [
      ['sergi.n', T("D'acord, els seguidors no paguen factures. Però llavors, què he de mirar cada setmana?")],
      ['sergi.t', T("Vull una pantalla on vegi d'un cop d'ull si la cosa va bé o malament.")]
    ],
    goal: T("Definir què s'ha de mesurar a Cim Trail i construir un quadre de comandament real amb dades d'exemple."),
    format: T("Enllaç a un quadre de comandament (Looker Studio o Google Sheets) i un document breu que l'expliqui."),
    sections: [
      { h: T("Objectius de negoci i de màrqueting"), d: T("Del «vendre més» als objectius concrets de vendes, clients nous i repetició.") },
      { h: T("Arbre de KPI"), d: T("Indicadors principals i secundaris per a cada objectiu, separant les mètriques de vanitat de les que importen.") },
      { h: T("Pla d'etiquetatge"), d: T("Quins esdeveniments i conversions es mesuren a la web i com s'etiqueten les campanyes amb UTM.") },
      { h: T("Quadre de comandament"), d: T("Panell amb gràfics: vendes per canal, cost per adquisició, ROAS, conversió i evolució setmanal.") },
      { h: T("Dades d'exemple"), d: T("Taula de 8 setmanes amb dades inventades però coherents, indicant que són d'exemple.") },
      { h: T("Lectura i recomanacions"), d: T("3 conclusions que es treuen del panell i què faries la setmana següent.") }
    ],
    steps: [
      T("Escriu els objectius del Sergi en una frase cada un."),
      T("Crea a Google Sheets una taula de dades d'exemple de 8 setmanes per canal."),
      T("Connecta-la a Looker Studio (gratuït) i fes-hi el panell amb 4 a 6 gràfics. Si ho prefereixes, fes els gràfics a Google Sheets."),
      T("Comparteix el panell amb accés de lectura per a qualsevol persona amb l'enllaç."),
      T("Escriu la lectura del panell com si l'expliquessis al Sergi en 2 minuts.")
    ],
    tools: T("Looker Studio · Google Sheets · Campaign URL Builder · Compte de demostració de Google Analytics (opcional)"),
    rubric: [
      T("Els KPI responen objectius de negoci, no de vanitat"),
      T("El pla d'etiquetatge és concret (esdeveniments i UTM)"),
      T("El panell és clar, llegible i amb els gràfics adequats"),
      T("Les dades d'exemple són coherents i estan identificades com a tals"),
      T("Les conclusions es dedueixen de les dades")
    ],
    tips: [
      T("Un panell amb 20 gràfics no el mira ningú. Prioritza."),
      T("Posa sempre la comparació: respecte a la setmana anterior o a l'objectiu.")
    ],
    reward: { xp: 260, money: 250, rep: 2, trust: null }
  },

  /* ===================== ETAPA 3 ===================== */
  {
    id: 'pitch-coop', after: '3.2', who: 'laia', bg: 'fira', kind: T("Posicionament i pitch"),
    title: T("Anàlisi de la competència i pitch de l'agència"),
    brief: [
      ['laia.n', T("Quaranta diapositives i cinc especialistes. Tu, què hi poses al davant?")],
      ['pau.t', T("Necessito saber exactament on soc diferent i explicar-ho en deu minuts.")]
    ],
    goal: T("Analitzar agències competidores reals i preparar la presentació de l'agència per guanyar un client davant la competència."),
    format: T("Presentació de 8 a 12 diapositives (Google Slides, Canva o PowerPoint) i, opcionalment, un vídeo o àudio del pitch de 3 minuts."),
    sections: [
      { h: T("Mapa de la competència"), d: T("Almenys 4 agències reals (locals i de Barcelona): serveis, clients, preus si es coneixen, punts forts i febles.") },
      { h: T("Mapa de posicionament"), d: T("Gràfic de dos eixos on es vegi on és cada agència i l'espai que ocupa la teva.") },
      { h: T("Proposta de valor"), d: T("Una frase clara: per a qui, quin problema resols i per què tu i no un altre.") },
      { h: T("Estructura del pitch"), d: T("Problema del client, solució, com treballeu, casos (el forn, Can Jordi...), equip, inversió i següent pas.") },
      { h: T("Gestió d'objeccions"), d: T("Les 4 objeccions més probables («sou petits», «sou cars»...) i com les respondries.") }
    ],
    steps: [
      T("Busca agències reals d'Osona i de Barcelona i analitza'n la web, els serveis i els casos."),
      T("Situa-les en un mapa de posicionament (per exemple: preu i especialització)."),
      T("Escriu la proposta de valor i prova-la amb algú: l'entén a la primera?"),
      T("Dissenya les diapositives amb poc text i una idea per diapositiva."),
      T("Assaja el pitch en veu alta amb cronòmetre.")
    ],
    tools: T("Google Slides o Canva · Webs i LinkedIn de les agències · Ressenyes de Google"),
    rubric: [
      T("L'anàlisi de la competència fa servir agències reals i és rigorosa"),
      T("El posicionament és diferenciat i creïble"),
      T("La proposta de valor és clara i concreta"),
      T("La presentació és visual i té una estructura persuasiva"),
      T("Les objeccions es responen amb arguments")
    ],
    tips: [
      T("Competir en preu és l'última opció: busca en què ets millor per a aquest client."),
      T("Les diapositives acompanyen el que dius, no ho repeteixen.")
    ],
    reward: { xp: 280, money: 300, rep: 3, trust: 'laia' }
  },
  {
    id: 'proposta-quim', after: '3.3', who: 'quim', bg: 'despatx', kind: T("Proposta comercial"),
    title: T("Proposta comercial i pressupost per a Soler Motor"),
    brief: [
      ['quim.h', T("Jo vull «tot el digital», ja t'ho he dit. Envia'm el paper i ho signem.")],
      ['pau.t', T("Si l'abast no queda escrit, d'aquí a dues setmanes em demanarà un vídeo de TikTok i tres logos.")]
    ],
    goal: T("Redactar una proposta comercial professional amb l'abast tancat, el calendari, el preu i les condicions."),
    format: T("Document de proposta (PDF o Google Docs) i full de càlcul amb el pressupost."),
    sections: [
      { h: T("Context i objectius del client"), d: T("Què necessita Soler Motor (cotxes de segona mà i recanvis) i quins objectius mesurables tindrà el projecte.") },
      { h: T("Abast del servei"), d: T("Què inclou i, sobretot, què no inclou. Nombre de peces, canals, reunions i revisions.") },
      { h: T("Entregables i calendari"), d: T("Llista d'entregables amb les dates i les fites de validació del client.") },
      { h: T("Pressupost"), d: T("Desglossat per partides amb les hores estimades i el preu per hora, separant els honoraris de la inversió publicitària.") },
      { h: T("Condicions"), d: T("Forma de pagament, durada, canvis fora d'abast (com es pressuposten), propietat dels materials i cancel·lació.") },
      { h: T("Següents passos"), d: T("Què ha de fer el client per començar i data de validesa de la proposta.") }
    ],
    steps: [
      T("Separa el «tot el digital» en serveis concrets i decideix-ne l'abast."),
      T("Estima les hores de cada tasca en un full de càlcul i calcula el preu amb un marge."),
      T("Redacta les condicions pensant en els problemes que vas tenir al joc."),
      T("Dona-li un format professional: portada, índex, logotip de l'agència i signatura.")
    ],
    tools: T("Google Docs o Word · Google Sheets · Canva per a la maquetació"),
    rubric: [
      T("L'abast és concret i diu clarament què no s'inclou"),
      T("El pressupost està desglossat i és rendible per a l'agència"),
      T("Les condicions protegeixen davant dels canvis i dels impagaments"),
      T("El calendari té fites de validació"),
      T("El document té una presentació professional")
    ],
    tips: [
      T("Tot el que no és a la proposta, el client creurà que està inclòs."),
      T("Separa sempre els honoraris de la inversió en anuncis.")
    ],
    reward: { xp: 280, money: 400, rep: 2, trust: 'quim' }
  },

  /* ===================== ETAPA 4 ===================== */
  {
    id: 'continguts-berta', after: '4.2', who: 'berta', bg: 'despatx', kind: T("Continguts"),
    title: T("Calendari editorial i peces de contingut"),
    brief: [
      ['berta.h', T("Si hem de publicar cada setmana per a tres clients, no podem improvisar cada dilluns.")],
      ['berta.n', T("Fem un calendari d'un mes per a un client i creem les primeres peces de veritat.")]
    ],
    goal: T("Planificar un mes de continguts per a un client del joc (a triar) i produir-ne les primeres peces."),
    format: T("Calendari en un full de càlcul o en Notion/Trello i carpeta amb les peces creades."),
    sections: [
      { h: T("Objectius i pilars de contingut"), d: T("Per a què serveixen les xarxes d'aquest client i 3 o 4 pilars temàtics.") },
      { h: T("To de veu i línia visual"), d: T("Com parla la marca, paraules que sí i que no, colors, tipografies i estil de les fotos.") },
      { h: T("Calendari d'un mes"), d: T("Data, xarxa, pilar, format, text, crida a l'acció i responsable de cada publicació (mínim 12).") },
      { h: T("6 peces acabades"), d: T("Dissenys finals: almenys 2 carrusels, 2 vídeos curts (reel o TikTok) i 2 publicacions o històries.") },
      { h: T("Procés d'aprovació"), d: T("Qui crea, qui revisa i quan aprova el client, amb les dates límit.") },
      { h: T("Mesura"), d: T("Indicadors per pilar i com es revisarà el calendari a final de mes.") }
    ],
    steps: [
      T("Tria el client (el forn, Can Jordi, la Cansaladeria Núria o Cim Trail) i el seu objectiu."),
      T("Defineix els pilars i el to de veu abans de pensar publicacions."),
      T("Omple el calendari en una plantilla (full de càlcul, Notion o Trello)."),
      T("Crea les 6 peces amb Canva, CapCut o l'eina que prefereixis."),
      T("Revisa ortografia, mides i subtítols dels vídeos.")
    ],
    tools: T("Google Sheets, Notion o Trello · Canva · CapCut · Meta Business Suite per programar (opcional)"),
    rubric: [
      T("Els pilars i el to de veu encaixen amb la marca i el públic"),
      T("El calendari és complet, variat i realista de produir"),
      T("Les peces tenen qualitat i coherència visual"),
      T("Cada peça té una crida a l'acció i un objectiu"),
      T("El procés d'aprovació i la mesura estan definits")
    ],
    tips: [
      T("Cada pilar ha de respondre a una necessitat del públic, no només a què vol dir la marca."),
      T("Els vídeos s'han de poder entendre sense so: posa-hi subtítols.")
    ],
    reward: { xp: 300, money: 300, rep: 2, trust: 'berta' }
  },
  {
    id: 'processos-julia', after: '4.3', who: 'julia', bg: 'despatx', kind: T("Gestió de projectes"),
    title: T("Sistema de treball: brief, tauler i flux d'aprovació"),
    brief: [
      ['julia.n', T("Peticions per WhatsApp, per correu, per telèfon... Així perdrem un client.")],
      ['julia.t', T("Vull una plantilla de brief, un tauler on es vegi qui fa què i un flux clar. Funcional, no bonic.")]
    ],
    goal: T("Dissenyar i muntar el sistema de treball de l'agència en una eina real de gestió de projectes."),
    format: T("Enllaç públic (o captures) del tauler i document amb la plantilla de brief i el flux de treball."),
    sections: [
      { h: T("Plantilla de brief"), d: T("Formulari o document amb el que el client ha d'explicar: objectiu, públic, missatge, terminis, pressupost i referències.") },
      { h: T("Tauler de projecte"), d: T("Tauler real a Trello, Asana, Notion o ClickUp amb columnes per estat i almenys 10 tasques d'un projecte del joc.") },
      { h: T("Flux de treball"), d: T("Diagrama des de la petició fins a la publicació: qui fa cada pas i en quant de temps.") },
      { h: T("Rols i responsabilitats"), d: T("Taula RACI (qui ho fa, qui n'és responsable, a qui es consulta i a qui s'informa) per a les tasques principals.") },
      { h: T("Normes de comunicació"), d: T("Per on entren les peticions, temps de resposta i com es demanen canvis.") }
    ],
    steps: [
      T("Crea un compte gratuït en una eina de gestió de projectes."),
      T("Converteix el brief en un formulari (Google Forms, Notion o el de l'eina mateixa)."),
      T("Munta el tauler amb un projecte real del joc i assigna tasques, dates i etiquetes."),
      T("Dibuixa el flux amb draw.io, Canva o Miro."),
      T("Comparteix el tauler en mode lectura o fes-ne captures clares.")
    ],
    tools: T("Trello, Asana, Notion o ClickUp · Google Forms · draw.io, Miro o Canva"),
    rubric: [
      T("El brief recull tota la informació necessària"),
      T("El tauler està muntat de veritat i reflecteix un projecte real"),
      T("El flux és clar i té responsables i temps"),
      T("La matriu RACI és coherent"),
      T("El sistema resol els problemes del capítol (peticions disperses, retards)")
    ],
    tips: [
      T("Si una tasca no té responsable ni data, no es farà."),
      T("Menys columnes és millor: Pendent, En curs, Revisió, Fet.")
    ],
    reward: { xp: 300, money: 250, rep: 2, trust: 'julia' }
  },

  /* ===================== ETAPA 5 ===================== */
  {
    id: 'auditoria-nuria', after: '5.1', who: 'nuria', bg: 'botiga', kind: T("Auditoria de campanya"),
    title: T("Auditoria de la campanya fallida i pla de recuperació"),
    brief: [
      ['nuria.a', T("He gastat el pressupost i no he venut res. Vull saber per què, per escrit, i què fareu per arreglar-ho.")],
      ['pau.t', T("Toca una auditoria honesta: on ha fallat l'embut i com ho recuperem.")]
    ],
    goal: T("Analitzar una campanya que no ha funcionat, trobar-ne les causes amb dades i proposar un pla de recuperació."),
    format: T("Informe (document o presentació) amb taules i gràfics."),
    sections: [
      { h: T("Resum per a la clienta"), d: T("Què ha passat, per què i què proposeu, en mitja pàgina i sense excuses.") },
      { h: T("Anàlisi de l'embut"), d: T("Impressions, clics, CTR, visites, carretons i compres amb les taxes de cada pas. Indica on es perd la gent.") },
      { h: T("Hipòtesis de les causes"), d: T("Segmentació, creativitat, pàgina d'aterratge, preu, enviament, seguiment... Ordena-les per probabilitat i justifica-les.") },
      { h: T("Pla de recuperació"), d: T("Canvis concrets ordenats per impacte i esforç, amb un calendari de 4 setmanes.") },
      { h: T("Proves A/B"), d: T("Almenys 2 proves amb la hipòtesi, la variant, la mètrica i quan es considerarà guanyadora.") },
      { h: T("Comunicació amb el client"), d: T("El correu o guió de la reunió per explicar-ho a la Núria i recuperar-ne la confiança.") }
    ],
    steps: [
      T("Recupera les dades de la campanya del capítol 5.1 i completa-les amb supòsits raonables."),
      T("Calcula les taxes de cada pas de l'embut en un full de càlcul i fes-ne un gràfic."),
      T("Compara-les amb mitjanes de referència del sector (busca'n fonts i cita-les)."),
      T("Escriu el pla de recuperació i les proves A/B."),
      T("Redacta el missatge per a la clienta: reconeix l'error, explica el pla i fixa la propera revisió.")
    ],
    tools: T("Google Sheets · Looker Studio o gràfics de Sheets · Google Docs o Slides"),
    rubric: [
      T("L'anàlisi de l'embut és correcta i localitza el problema"),
      T("Les hipòtesis es justifiquen amb dades"),
      T("El pla de recuperació és concret i prioritzat"),
      T("Les proves A/B estan ben plantejades"),
      T("La comunicació amb la clienta és honesta i professional")
    ],
    tips: [
      T("No culpis l'algoritme: busca què podies controlar."),
      T("Canvia una sola variable a cada prova, o no sabràs què ha funcionat.")
    ],
    reward: { xp: 320, money: 300, rep: 3, trust: null }
  },
  {
    id: 'crisi-jordi', after: '5.2', who: 'jordi', bg: 'restaurant', kind: T("Gestió de crisi"),
    title: T("Pla de gestió de crisi de reputació per a Can Jordi"),
    brief: [
      ['jordi.a', T("Han tornat els comentaris dolents. Jo ho esborraria tot i tancaria les xarxes!")],
      ['pau.t', T("Esborrar-ho tot faria la crisi més gran. Cal un protocol i respostes ben pensades.")]
    ],
    goal: T("Preparar el protocol de crisi de reputació del restaurant i les respostes per a la situació actual."),
    format: T("Document de protocol amb annexos de respostes."),
    sections: [
      { h: T("Diagnosi de la crisi"), d: T("Què ha passat, on es parla del tema, quin abast té i quin nivell de gravetat (escala de 1 a 3).") },
      { h: T("Protocol d'actuació"), d: T("Passos de la primera hora, del primer dia i de la primera setmana. Qui parla, qui aprova i què no s'ha de fer mai.") },
      { h: T("Comunicat públic"), d: T("Text per a xarxes i web: reconeixement, explicació, mesures i contacte. Màxim 150 paraules.") },
      { h: T("Respostes a 6 comentaris"), d: T("Respostes a comentaris de diferents tipus: queixa justa, queixa exagerada, insult, fals, client fidel que defensa i mitjà de comunicació.") },
      { h: T("Pla de recuperació"), d: T("Accions per recuperar la confiança les setmanes següents i com es farà el seguiment de la reputació.") },
      { h: T("Lliçons apreses"), d: T("Què canviareu perquè no torni a passar.") }
    ],
    steps: [
      T("Busca un cas real de crisi de reputació d'un restaurant o d'una marca i analitza com es va gestionar."),
      T("Escriu el protocol en forma de llista de comprovació que es pugui seguir amb pressa."),
      T("Redacta el comunicat i les respostes. Llegeix-les en veu alta: sonen humanes?"),
      T("Defineix com es farà el seguiment (alertes de Google, revisió diària de ressenyes).")
    ],
    tools: T("Google Docs · Alertes de Google · Ressenyes de Google Maps i TripAdvisor com a exemple"),
    rubric: [
      T("La diagnosi mesura l'abast i la gravetat"),
      T("El protocol és clar, ordenat i es pot aplicar"),
      T("El comunicat és honest, breu i empàtic"),
      T("Les respostes s'adapten a cada tipus de comentari"),
      T("Hi ha un pla de seguiment i de millora")
    ],
    tips: [
      T("Esborrar comentaris crítics sol multiplicar-los."),
      T("Respon en públic una vegada i continua la conversa en privat.")
    ],
    reward: { xp: 320, money: 300, rep: 3, trust: null }
  },

  /* ===================== ETAPA 6 ===================== */
  {
    id: 'informe-marta', after: '6.2', who: 'marta', bg: 'oficina', kind: T("Informe per a client"),
    title: T("Informe executiu mensual per a Làctics de la Plana"),
    brief: [
      ['marta.n', T("A la meva empresa, si no hi ha informe, no ha passat. I el director general en llegeix una pàgina, no més.")],
      ['marta.t', T("Vull un informe mensual seriós: resultats, què hem après i què recomaneu.")]
    ],
    goal: T("Elaborar l'informe mensual de resultats per a un client gran, amb lectura executiva i recomanacions."),
    format: T("Presentació de 8 a 12 diapositives o informe de 4 a 6 pàgines, amb gràfics."),
    sections: [
      { h: T("Resum executiu"), d: T("Una diapositiva o mitja pàgina: 3 resultats clau, 1 problema i 3 recomanacions.") },
      { h: T("Resultats respecte als objectius"), d: T("Taula dels KPI amb l'objectiu, el resultat, la diferència i un semàfor.") },
      { h: T("Anàlisi per canal"), d: T("Rendiment de cada canal (cerca, xarxes, correu, botigues) amb gràfics i una conclusió per canal.") },
      { h: T("Aprenentatges"), d: T("Què ha funcionat, què no i per què, amb dades.") },
      { h: T("Recomanacions i pla del mes vinent"), d: T("Accions concretes amb pressupost i impacte esperat.") },
      { h: T("Annex de dades"), d: T("Taules completes i la metodologia: fonts, període i com s'atribueixen les vendes.") }
    ],
    steps: [
      T("Prepara un conjunt de dades d'un mes (pots fer servir les del capítol i completar-les), indicant que són d'exemple."),
      T("Fes els gràfics a Google Sheets o Looker Studio."),
      T("Escriu primer les conclusions i després tria els gràfics que les demostren."),
      T("Revisa que el resum executiu s'entengui sense llegir la resta.")
    ],
    tools: T("Google Slides o PowerPoint · Google Sheets · Looker Studio"),
    rubric: [
      T("El resum executiu és clar i suficient per si sol"),
      T("Els resultats es comparen amb els objectius"),
      T("Els gràfics són adequats i fàcils de llegir"),
      T("Els aprenentatges i les recomanacions es basen en dades"),
      T("La metodologia és transparent")
    ],
    tips: [
      T("Cada gràfic ha de tenir un títol que digui la conclusió, no només què mostra."),
      T("Si un resultat és dolent, explica'l abans que te'l preguntin.")
    ],
    reward: { xp: 340, money: 500, rep: 3, trust: null }
  },
  {
    id: 'marca-agencia', after: '6.4', who: 'berta', bg: 'despatx', kind: T("Marca"),
    title: T("Manual de marca de l'agència"),
    brief: [
      ['berta.n', T("Si no sabem qui som, cada client ens farà ser una cosa diferent.")],
      ['berta.h', T("Fem el manual de marca de l'agència: qui som, com parlem, com ens veiem i què no farem mai.")]
    ],
    goal: T("Crear el manual de marca de l'agència que has construït durant el joc."),
    format: T("Manual de 10 a 20 pàgines o diapositives (Canva, Figma, Google Slides o PDF)."),
    sections: [
      { h: T("Propòsit, missió, visió i valors"), d: T("Per què existeix l'agència i com treballa. Coherent amb les decisions que has pres al joc.") },
      { h: T("Posicionament i públic"), d: T("Per a qui treballeu, en què us especialitzeu i quins projectes rebutgeu.") },
      { h: T("Identitat verbal"), d: T("To de veu, missatges clau, eslògan i exemples de com escriure (i com no).") },
      { h: T("Identitat visual"), d: T("Logotip i versions, paleta de colors amb codis, tipografies, estil d'imatges i usos incorrectes.") },
      { h: T("Aplicacions"), d: T("Exemples aplicats: perfil de LinkedIn, plantilla de proposta, publicació a xarxes i signatura de correu.") }
    ],
    steps: [
      T("Repassa les decisions del joc: camí de creixement, clients que has acceptat o rebutjat."),
      T("Escriu primer la part estratègica i després la visual."),
      T("Dissenya el logotip i la paleta a Canva o Figma i comprova el contrast dels colors."),
      T("Aplica la marca a almenys 4 suports reals.")
    ],
    tools: T("Canva o Figma · Coolors per a la paleta · Google Fonts · Comprovador de contrast de WebAIM"),
    rubric: [
      T("La part estratègica és coherent amb la trajectòria del joc"),
      T("El to de veu és clar i té exemples"),
      T("La identitat visual és professional i està ben documentada"),
      T("Les aplicacions demostren que la marca funciona"),
      T("El manual es pot fer servir per algú que no l'ha creat")
    ],
    tips: [
      T("Un manual de marca és una eina de treball: posa-hi normes, no només imatges boniques."),
      T("Comprova que els colors tenen prou contrast per llegir-se bé.")
    ],
    reward: { xp: 340, money: 300, rep: 3, trust: 'berta' }
  },

  /* ===================== ETAPA 7 ===================== */
  {
    id: 'franca-amelie', after: '7.2', who: 'amelie', bg: 'franca', kind: T("Campanya internacional"),
    title: T("Pla de llançament a França per a Cosmètica del Montseny"),
    brief: [
      ['amelie.n', T("La direcció vol veure el pla abans d'invertir. I ho volen en un format que entengui també l'equip de França.")],
      ['amelie.h', T("Mercat, missatge en francès, anuncis i un pressupost de prova. Allez!")]
    ],
    goal: T("Fer el pla de llançament internacional: estudi de mercat, localització, anuncis en francès i una prova amb pressupost limitat."),
    format: T("Presentació o document, amb els anuncis en francès creats."),
    sections: [
      { h: T("Estudi del mercat francès"), d: T("Mida del mercat de cosmètica natural, competidors francesos reals, preus i canals de venda.") },
      { h: T("Públic i comportament de compra"), d: T("Buyer persona francès, què valora (certificacions, ingredients) i on compra.") },
      { h: T("Localització"), d: T("Paraules clau en francès, missatges adaptats, certificacions i aspectes legals (etiquetatge, galetes).") },
      { h: T("Anuncis en francès"), d: T("2 anuncis per a Meta i 2 de cerca per a Google en francès, amb la justificació de les paraules triades.") },
      { h: T("Pla de prova"), d: T("Prova de 4 a 6 setmanes amb pressupost, segmentació, KPI i criteris per decidir si s'amplia.") },
      { h: T("Riscos i pla B"), d: T("Què pot fallar (logística, devolucions, idioma) i com es mitiga.") }
    ],
    steps: [
      T("Busca dades del mercat a fonts com Statista, ICEX o informes sectorials i cita-les."),
      T("Analitza 3 marques franceses de cosmètica natural: web, preus, missatges."),
      T("Fes la recerca de paraules clau en francès amb Google Trends (França) i el planificador de Google Ads."),
      T("Crea els anuncis i, si pots, fes-los revisar per algú que parli francès."),
      T("Defineix la prova amb un pressupost tancat i criteris clars d'èxit.")
    ],
    tools: T("Google Trends (França) · Planificador de paraules clau de Google Ads · Statista o ICEX · Canva · Biblioteca d'anuncis de Meta"),
    rubric: [
      T("L'estudi de mercat fa servir fonts reals i citades"),
      T("La localització va més enllà de la traducció"),
      T("Els anuncis en francès són correctes i adaptats"),
      T("La prova és acotada, mesurable i té criteris de decisió"),
      T("S'identifiquen els riscos principals")
    ],
    tips: [
      T("Traduir no és localitzar: busca com ho diuen els francesos, no com ho diríem nosaltres."),
      T("Comença petit i amplia només el que funciona.")
    ],
    reward: { xp: 360, money: 500, rep: 3, trust: null }
  },
  {
    id: 'ia-berta', after: '7.5', who: 'berta', bg: 'oficina', kind: T("IA i automatització"),
    title: T("Pla d'ús de la IA a l'agència"),
    brief: [
      ['berta.t', T("La competència fa en una hora el que nosaltres fem en un dia. Però tampoc vull que tot sembli fet per un robot.")],
      ['berta.n', T("Proposa'm com fem servir la IA: on sí, on no, amb quines normes. I demostra-ho amb peces reals.")]
    ],
    goal: T("Dissenyar com l'agència integrarà la IA i l'automatització, i demostrar-ho amb peces reals creades i revisades."),
    format: T("Document o presentació i carpeta amb les peces generades (abans i després de la revisió)."),
    sections: [
      { h: T("Mapa de tasques"), d: T("Tasques de l'agència classificades: on la IA ajuda, on cal supervisió i on no s'ha de fer servir.") },
      { h: T("Flux de treball amb IA"), d: T("Un procés complet (per exemple, de brief a publicació) amb les eines, les instruccions (prompts) i els punts de revisió humana.") },
      { h: T("3 peces reals"), d: T("3 peces creades amb IA per a un client del joc (text, imatge o vídeo) amb el prompt, el resultat inicial i la versió revisada.") },
      { h: T("Automatització"), d: T("Una automatització senzilla (Zapier, Make o les eines del CRM) que estalviï temps, amb captures.") },
      { h: T("Política d'ús"), d: T("Normes de l'agència: privacitat de dades dels clients, drets d'autor, transparència i revisió.") }
    ],
    steps: [
      T("Fes la llista de tasques setmanals de l'agència i estima'n el temps."),
      T("Prova almenys 2 eines d'IA diferents per a les 3 peces i guarda els prompts."),
      T("Revisa i millora cada resultat: dades, to de marca, errors i drets."),
      T("Crea l'automatització amb una eina gratuïta i prova-la."),
      T("Redacta la política d'ús en una pàgina.")
    ],
    tools: T("Claude, ChatGPT o Gemini · Canva amb IA o Adobe Firefly · Zapier o Make (pla gratuït)"),
    rubric: [
      T("El mapa de tasques és realista i justificat"),
      T("El flux inclou punts de revisió humana"),
      T("Les peces mostren el procés: prompt, resultat i revisió"),
      T("L'automatització funciona i estalvia temps"),
      T("La política tracta la privacitat, els drets i la transparència")
    ],
    tips: [
      T("No posis mai dades personals de clients en una eina d'IA sense permís."),
      T("El valor de l'agència és el criteri: la IA fa esborranys, tu decideixes.")
    ],
    reward: { xp: 380, money: 400, rep: 3, trust: 'berta' }
  },

  /* ===================== ETAPA 8 ===================== */
  {
    id: 'portafoli-final', after: '8.1', who: 'julia', bg: 'vic', kind: T("Projecte final"),
    title: T("Portafoli professional i presentació final"),
    brief: [
      ['julia.h', T("Abans de decidir el futur de l'agència, mira enrere: tot el que has fet és un portafoli.")],
      ['julia.n', T("Prepara'l com si l'haguessis d'ensenyar demà en una entrevista de feina.")]
    ],
    goal: T("Recopilar els millors projectes del joc en un portafoli professional i presentar-ne la trajectòria i els aprenentatges."),
    format: T("Portafoli web (pot ser una web del Taller), PDF o presentació, i un vídeo de presentació de 3 a 5 minuts (opcional però recomanat)."),
    sections: [
      { h: T("Presentació personal"), d: T("Qui ets com a professional del màrqueting, les teves especialitats i com treballes.") },
      { h: T("3 casos d'èxit"), d: T("Tres projectes que hagis entregat, amb el format repte → què vas fer → resultat → què vas aprendre.") },
      { h: T("Habilitats i eines"), d: T("Les eines que has après a fer servir, amb exemples de feina feta amb cada una.") },
      { h: T("Reflexió final"), d: T("Les decisions més difícils del joc, què faries diferent i què vols aprendre a continuació.") },
      { h: T("Contacte i enllaços"), d: T("Com contactar-te i enllaços als projectes i a les webs del Taller.") }
    ],
    steps: [
      T("Revisa tots els projectes aprovats i els comentaris del professor."),
      T("Tria els 3 millors i millora'ls amb els comentaris rebuts."),
      T("Escriu cada cas amb la mateixa estructura i amb resultats concrets."),
      T("Dissenya el portafoli amb una línia visual coherent."),
      T("Grava't presentant-lo (opcional) i comparteix l'enllaç.")
    ],
    tools: T("Canva, Google Slides, Notion o una web del Taller · Loom o la gravadora de pantalla per al vídeo"),
    rubric: [
      T("Els casos tenen repte, acció, resultat i aprenentatge"),
      T("S'hi incorporen les millores demanades als projectes anteriors"),
      T("La presentació és professional i coherent"),
      T("La reflexió és personal, honesta i concreta"),
      T("Es podria fer servir de debò per buscar feina")
    ],
    tips: [
      T("Un cas sense resultat és una anècdota: posa-hi xifres (encara que siguin del joc)."),
      T("Menys projectes ben explicats valen més que molts sense context.")
    ],
    reward: { xp: 400, money: 500, rep: 4, trust: 'julia' }
  }
];

GD.projectById = (id) => GD.projects.find(p => p.id === id);
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
