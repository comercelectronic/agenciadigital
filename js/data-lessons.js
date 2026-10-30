/* Agència Digital — biblioteca de lliçons */
window.GD = window.GD || {};
GD.areas = {
  fonaments: T('Fonaments del màrqueting'),
  mercat: T('Investigació de mercat'),
  marca: T('Marca i creativitat'),
  seo: T('SEO'),
  xarxes: T('Xarxes socials'),
  ads: T('Publicitat digital'),
  email: T('Correu i CRM'),
  web: T('Web i comerç electrònic'),
  analitica: T('Analítica'),
  creixement: T('Creixement'),
  direccio: T('Direcció empresarial'),
  avancat: T('Nivell avançat')
};

GD.lessons = {
  /* ---------- ETAPA 1 ---------- */
  L_mkt: {
    area: 'fonaments', title: T('Què és (i què no és) el màrqueting'),
    goal: T('Distingir el màrqueting de la simple publicitat i formular una proposta de valor.'),
    body: [
      T('El màrqueting és el procés d\'entendre què necessiten unes persones concretes, crear una oferta que hi respongui i fer que la coneguin, la triïn i hi tornin. <b>Publicar a xarxes o fer anuncis només és una part de la feina</b>: abans hi ha la investigació, el producte, el preu i la manera de distribuir-lo.'),
      T('Un client no compra hores de feina ni publicacions: compra un <b>resultat</b> (més clients, més vendes, menys temps perdut). Vendre un <b>servei</b> és dir «et gestiono l\'Instagram»; vendre un <b>resultat</b> és dir «t\'ajudaré a omplir les tardes del forn, i ho mesurarem».'),
      T('La <b>proposta de valor</b> resumeix per a qui treballes, quin problema resols i per què ets una opció millor que les alternatives. Ha de ser concreta i comprovable.')
    ],
    example: T('Proposta feble: «Fem màrqueting digital de qualitat». Proposta forta: «Ajudem els comerços d\'Osona a aconseguir més clients del barri amb accions mesurables i pressupostos petits».'),
    errors: [T('Confondre tenir presència a les xarxes amb aconseguir resultats comercials.'), T('Prometre resultats sense haver estudiat el negoci.'), T('Definir-se amb paraules buides que podria dir qualsevol competidor.')],
    quiz: [
      { q: T('Quina d\'aquestes frases descriu millor el màrqueting?'), o: [T('Fer arribar el producte a més gent amb anuncis i promocions ben pensades'), T('Entendre necessitats, crear una oferta que hi respongui i fer que la triïn'), T('Comunicar els avantatges del producte als canals on és el públic'), T('Crear una marca reconeguda i una comunitat fidel a les xarxes')], c: 1, why: T('La publicitat és una eina dins del màrqueting, no el màrqueting sencer.') },
      { q: T('Quina proposta ven un resultat?'), o: [T('«Et gestionem les xarxes amb 12 publicacions al mes i un informe d\'abast»'), T('«T\'ajudem a augmentar les reserves dels dimarts i ho mesurem cada setmana»'), T('«Farem créixer la teva comunitat i la visibilitat de la marca a Vic»'), T('«Et fem una campanya d\'anuncis segmentada als clients dels dimarts»')], c: 1, why: T('Parla del problema del client i de com es mesurarà l\'èxit.') },
      { q: T('Què ha d\'incloure una bona proposta de valor?'), o: [T('Per a qui és, quin problema resol i per què és millor que les alternatives'), T('Què fa l\'empresa, quins serveis ofereix i quina experiència té'), T('Per a qui és, quin preu té i quines garanties ofereix'), T('Quin problema resol, quin eslògan el resumeix i quin to fa servir')], c: 0, why: T('Una proposta de valor és concreta: públic, problema i diferència.') },
      { q: T('Cas real · Nespresso. Nestlé no es va limitar a vendre cafè: va crear les càpsules, les màquines, les botigues pròpies i un club de socis. Què demostra?'), o: [T('Que el màrqueting abraça el producte, la distribució i l\'experiència, no només la comunicació'), T('Que una marca forta ha d\'invertir sobretot en publicitat amb famosos'), T('Que el millor és controlar la distribució encara que el producte sigui normal'), T('Que el preu alt és el que fa que el producte sembli de qualitat')], c: 0, why: T('Nespresso va dissenyar tota l\'oferta (producte, canal, preu i experiència) al voltant d\'una necessitat: un cafè de qualitat a casa, fàcil i ràpid.') },
      { q: T('Cas real · Kodak. Un enginyer de Kodak va inventar la càmera digital el 1975, però l\'empresa va continuar centrada en el carret i va fer fallida el 2012. Quin error de màrqueting va cometre?'), o: [T('No va fer prou publicitat de les seves càmeres digitals'), T('Va defensar el producte que venia en lloc de la necessitat del client, guardar records'), T('Va abaixar massa els preus del carret per competir'), T('Va llançar la càmera digital massa aviat, abans que el mercat estigués preparat')], c: 1, why: T('Els clients no volien carrets: volien fotos. Quan la manera de fer-les va canviar, Kodak no va adaptar la seva oferta.') }
    ]
  },
  L_fin: {
    area: 'direccio', title: T('Ingressos, despeses, benefici i liquiditat'),
    goal: T('Entendre per què una empresa amb vendes pot quedar-se sense diners.'),
    body: [
      T('<b>Ingressos</b>: el que factures. <b>Despeses</b>: el que et costa funcionar (lloguer, eines, sous, desplaçaments). <b>Benefici</b> = ingressos − despeses.'),
      T('La <b>liquiditat</b> són els diners que tens disponibles ara mateix per pagar. Pots tenir beneficis sobre el paper i no poder pagar el lloguer si els clients encara no t\'han pagat.'),
      T('Per això convé tenir una <b>reserva per a imprevistos</b>: uns quants mesos de despeses fixes que no toques si no és imprescindible.')
    ],
    example: T('Una agència factura 4.000 € al gener, però cobra a 60 dies. Si les despeses de gener són 2.500 €, té benefici, però el gener no ha entrat res al compte: necessita liquiditat per aguantar.'),
    errors: [T('Pensar que facturar és el mateix que cobrar.'), T('Gastar tota la caixa inicial en eines abans de tenir clients.'), T('No separar els diners de l\'empresa dels personals.')],
    quiz: [
      { q: T('Factures 3.000 € i les despeses són 2.200 €. Quin és el benefici?'), o: [T('5.200 €'), T('800 €'), T('2.200 €'), T('3.000 €, perquè el benefici és el que factures')], c: 1, why: '3.000 − 2.200 = 800 €.' },
      { q: T('Què és la liquiditat?'), o: [T('El benefici que queda després de pagar totes les despeses de l\'any'), T('Els diners disponibles ara per fer front als pagaments'), T('El total que has facturat, encara que no ho hagis cobrat'), T('La diferència entre el que et deuen i el que deus')], c: 1, why: T('La liquiditat és la caixa disponible, no el resultat comptable.') },
      { q: T('Per què serveix una reserva per a imprevistos?'), o: [T('Per invertir-la quan surti una oportunitat de creixement'), T('Per aguantar retards de cobrament o despeses inesperades'), T('Per pagar menys impostos a final d\'any'), T('Per demostrar al banc que l\'empresa és solvent')], c: 1, why: T('Protegeix l\'empresa davant de cobraments que s\'endarrereixen o de crisis.') },
      { q: T('Cas real · Thomas Cook. El 2019, l\'agència de viatges centenària facturava milers de milions, però va fer fallida perquè no va aconseguir 200 milions de lliures per pagar els seus compromisos. Quin concepte il·lustra?'), o: [T('Que una empresa amb pèrdues sempre acaba fent fallida'), T('Que facturar molt no garanteix tenir liquiditat per pagar'), T('Que el benefici i la facturació són el mateix a llarg termini'), T('Que les empreses grans no necessiten reserva')], c: 1, why: T('Sense caixa per pagar quan toca, fins i tot una empresa enorme ha de tancar.') },
      { q: T('Cas real · Inditex. El grup de Zara té una posició de caixa neta molt alta (més diners que deutes). Durant el tancament de botigues del 2020 va poder resistir sense ofegar-se. Per què?'), o: [T('Perquè va vendre més per internet que abans de la crisi'), T('Perquè té més benefici que les altres empreses de moda'), T('Perquè la reserva de caixa li permetia pagar sense dependre de nous préstecs'), T('Perquè va deixar de pagar els proveïdors fins que va obrir')], c: 2, why: T('La reserva és el coixí per als mesos dolents: permet aguantar sense prendre decisions desesperades.') }
    ]
  },
  L_recerca: {
    area: 'mercat', title: T('Investigar abans de proposar'),
    goal: T('Distingir símptomes de causes i segmentar els clients.'),
    body: [
      T('Un <b>símptoma</b> és el que el client veu («venc menys a la tarda»). La <b>causa</b> és el que ho provoca (un horari mal publicat, un competidor nou, un canvi d\'hàbits del barri). Si ataques el símptoma sense conèixer la causa, pots gastar diners en la solució equivocada.'),
      T('Les eines bàsiques són l\'<b>entrevista</b> amb el client, l\'observació, les dades de vendes i l\'anàlisi dels <b>competidors</b>. Fes preguntes obertes: «què ha canviat?», «qui compra i quan?».'),
      T('La <b>segmentació</b> consisteix a dividir els clients en grups amb necessitats semblants (per exemple: gent gran del barri al matí, famílies a la sortida de l\'escola). Cada segment pot necessitar un missatge i un moment diferents.')
    ],
    example: T('Una perruqueria creu que necessita més anuncis. Entrevistant clientes descobreix que molts no saben que obre els dissabtes: el problema era d\'informació, no de visibilitat.'),
    errors: [T('Proposar la solució abans d\'escoltar.'), T('Fer preguntes que només confirmen el que ja penses.'), T('Tractar tots els clients com si fossin iguals.')],
    quiz: [
      { q: T('«Les vendes de la tarda han baixat.» Això és…'), o: [T('Una causa'), T('Un símptoma'), T('Un diagnòstic'), T('Un objectiu')], c: 1, why: T('És el que s\'observa; encara cal descobrir per què passa.') },
      { q: T('Quina pregunta és millor en una primera entrevista?'), o: [T('«Quin pressupost teniu per a xarxes socials aquest any?»'), T('«Què ha canviat aquest darrer any al barri i al negoci?»'), T('«Creieu que us falta publicitat a internet?»'), T('«Quins productes voleu promocionar primer?»')], c: 1, why: T('Les preguntes obertes revelen causes que no coneixies.') },
      { q: T('Què és segmentar?'), o: [T('Triar el públic que més compra i oblidar-se de la resta'), T('Dividir el públic en grups amb necessitats semblants'), T('Dividir els clients segons el canal per on compren'), T('Fer una oferta diferent per a cada client')], c: 1, why: T('Segmentar permet adaptar missatge, canal i moment a cada grup.') },
      { q: T('Cas real · Coca-Cola (1985). Abans de llançar la «New Coke», l\'empresa va fer unes 200.000 proves de gust i la nova fórmula guanyava. Als 79 dies va haver de recuperar la clàssica. Què va fallar en la recerca?'), o: [T('La mostra era massa petita per ser fiable'), T('Va mesurar el gust però no el vincle emocional dels clients amb la marca'), T('Les proves es van fer en un país diferent del de llançament'), T('La competència va copiar la fórmula abans del llançament')], c: 1, why: T('Les dades responien una pregunta massa estreta. Calia investigar què significava la marca per a la gent.') },
      { q: T('Cas real · IKEA. L\'empresa visita llars de clients arreu del món per veure com cuinen, guarden les coses i fan servir l\'espai. Quin tipus de recerca és?'), o: [T('Una enquesta quantitativa'), T('Observació qualitativa en el context real del client'), T('Una prova A/B de producte'), T('Anàlisi de dades secundàries')], c: 1, why: T('Observar com viu la gent revela necessitats que no surten en una enquesta.') }
    ]
  },
  L_smart: {
    area: 'fonaments', title: T('Objectius SMART'),
    goal: T('Escriure objectius que es puguin mesurar i avaluar.'),
    body: [
      T('Un objectiu <b>SMART</b> és: e<b>S</b>pecífic (què exactament), <b>M</b>esurable (amb quina xifra), <b>A</b>ssolible (realista amb els recursos), <b>R</b>ellevant (connectat amb el problema del negoci) i limitat en el <b>T</b>emps (per a quan).'),
      T('«Vendre més» no és un objectiu: no saps quan l\'has assolit. «Augmentar un 15 % les vendes de dimarts i dimecres de 16 a 19 h en quatre setmanes» sí que ho és.')
    ],
    example: T('Objectiu dolent: «Tenir més presència». Objectiu SMART: «Aconseguir 40 reserves noves per als dilluns de març mitjançant la web».'),
    errors: [T('Triar un objectiu que no té relació amb el problema (per exemple, seguidors quan el problema són vendes).'), T('No definir el punt de partida per poder comparar.')],
    quiz: [
      { q: T('Quin objectiu és SMART?'), o: [T('Ser el forn de referència de Vic per al berenar abans de l\'estiu'), T('Augmentar un 15 % les vendes de la franja 16–19 h en 4 setmanes'), T('Augmentar molt les vendes de la tarda durant les properes setmanes'), T('Aconseguir 1.000 seguidors nous a Instagram en 4 setmanes')], c: 1, why: T('És específic, mesurable, rellevant, assolible i té termini. L\'objectiu de seguidors també es pot mesurar i té data, però no és rellevant: el problema del forn són les vendes de la tarda.') },
      { q: T('Què li falta a «Aconseguir 50 contactes comercials»?'), o: [T('Un termini'), T('Que sigui mesurable'), T('Que sigui específic'), T('Res: ja és un objectiu SMART')], c: 0, why: T('Sense data límit no pots avaluar si l\'has assolit.') },
      { q: T('Per què l\'objectiu ha de ser rellevant?'), o: [T('Perquè el client l\'entengui i l\'aprovi més de pressa'), T('Perquè ha de respondre al problema real del negoci'), T('Perquè es pugui mesurar amb les eines que ja tens'), T('Perquè sigui assolible amb el pressupost disponible')], c: 1, why: T('Pots assolir un objectiu irrellevant i continuar tenint el mateix problema.') },
      { q: T('Cas real · Microsoft. Als anys vuitanta, la seva fita era «un ordinador a cada escriptori i a cada llar». Com la classificaries?'), o: [T('Un objectiu SMART, perquè és molt específic'), T('Una visió inspiradora, però no un objectiu SMART: no té xifra ni termini'), T('Un KPI de vendes'), T('Un objectiu SMART, perquè és mesurable')], c: 1, why: T('Una visió orienta la direcció; després cal traduir-la en objectius SMART amb xifres i dates.') },
      { q: T('Cas real · Unilever. El 2010 es va proposar reduir a la meitat la petjada ambiental dels seus productes abans del 2020. Quins elements SMART té clarament?'), o: [T('Només és específic: no es pot mesurar'), T('És assolible, perquè les empreses grans sempre ho aconsegueixen'), T('Una fita mesurable (la meitat) i un termini (2020)'), T('Cap: els objectius ambientals no poden ser SMART')], c: 2, why: T('Té xifra i data. Precisament per això es pot avaluar si s\'ha complert, i Unilever no el va assolir del tot.') }
    ]
  },
  L_metriques: {
    area: 'analitica', title: T('Impressions, interaccions, visites i vendes'),
    goal: T('Triar indicadors que responguin preguntes empresarials.'),
    body: [
      T('Les <b>impressions</b> són les vegades que es mostra un contingut. Les <b>interaccions</b> (m\'agrada, comentaris) indiquen interès. Les <b>visites</b> són persones que arriben a la web o a la botiga. Les <b>vendes</b> (o conversions) són el resultat que paga les factures.'),
      T('Cada pas és més petit que l\'anterior. Una campanya amb moltes impressions pot no generar cap venda. Un indicador és útil si t\'ajuda a <b>prendre una decisió</b> o a respondre una pregunta del negoci.'),
      T('Les <b>mètriques de vanitat</b> (seguidors, m\'agrada) fan bonic però no diuen si el negoci va millor.')
    ],
    example: T('Una cafeteria té 3.000 m\'agrada en un vídeo, però el nombre de cafès venuts no varia. En canvi, un cupó bescanviat a la caixa és una prova directa de visita.'),
    errors: [T('Presentar impressions com si fossin clients.'), T('Mesurar només el que és fàcil de mesurar.'), T('No tenir dades d\'abans per comparar.')],
    quiz: [
      { q: T('Quin indicador està més a prop de les vendes?'), o: [T('Clics a l\'enllaç de l\'anunci'), T('Visites a la pàgina de l\'oferta'), T('Cupons bescanviats a la botiga'), T('Persones que han desat la publicació')], c: 2, why: T('Un cupó bescanviat implica una visita i, normalment, una compra.') },
      { q: T('Què és una mètrica de vanitat?'), o: [T('Una dada que fa bonic però no ajuda a decidir'), T('Una dada que creix sola sense fer res'), T('Una mètrica que només interessa a la competència'), T('Una dada que no es pot mesurar amb exactitud')], c: 0, why: T('Seguidors i m\'agrada poden créixer sense que el negoci millori.') },
      { q: T('Per què cal saber les vendes de les setmanes anteriors?'), o: [T('Per tenir un punt de comparació'), T('Per calcular el pressupost de la campanya'), T('Per triar el millor dia per publicar'), T('Per saber quin producte promocionar')], c: 0, why: T('Sense punt de partida no pots saber si la campanya ha canviat res.') },
      { q: T('Cas real · Pepsi (2010). El «Pepsi Refresh Project» va aconseguir milions de vots i seguidors a les xarxes, però aquell any Pepsi va perdre quota de mercat. Què n\'aprens?'), o: [T('Que les xarxes socials no serveixen per a les marques grans'), T('Que les mètriques d\'interacció poden créixer sense que creixin les vendes'), T('Que la campanya va fallar perquè va durar poc'), T('Que cal mesurar només els seguidors nous')], c: 1, why: T('Vots i seguidors són mètriques de vanitat si no es connecten amb compres.') },
      { q: T('Cas real · Airbnb. La seva mètrica principal són les «nits reservades», no les visites a la web. Per què?'), o: [T('Perquè reflecteix el valor real per a hostes, amfitrions i empresa'), T('Perquè és més fàcil de mesurar que les visites'), T('Perquè les visites no es poden mesurar en una app'), T('Perquè així el número és més gran als informes')], c: 0, why: T('La mètrica principal ha d\'estar a prop del resultat de negoci: una nit reservada és una venda.') }
    ]
  },
  L_ads1: {
    area: 'ads', title: T('Com es munta una campanya d\'anuncis'),
    goal: T('Configurar objectiu, segmentació, pressupost i conversions.'),
    body: [
      T('L\'<b>objectiu</b> de la campanya diu a la plataforma què ha d\'optimitzar. Si tries «interacció», et portarà gent que fa m\'agrada, no necessàriament gent que s\'inscriu o compra.'),
      T('La <b>segmentació</b> defineix qui veu l\'anunci. Un negoci local no guanya res mostrant anuncis a tot el país: paga impressions inútils.'),
      T('Cal repartir el <b>pressupost</b> de manera raonable al llarg del període i, sobretot, configurar la <b>conversió</b> (inscripció, compra, trucada). Sense conversió mesurada, no saps què et costa cada client.')
    ],
    example: T('Un gimnàs local que segmenta «18–65 anys, tota Espanya» i optimitza per interaccions gasta el pressupost en persones que mai no hi aniran.'),
    errors: [T('Triar l\'objectiu equivocat.'), T('Segmentació massa àmplia.'), T('No mesurar la conversió.'), T('Gastar tot el pressupost en un sol dia.')],
    quiz: [
      { q: T('Un gimnàs de Vic vol inscripcions. Quin objectiu ha de triar?'), o: [T('Trànsit al web, perquè hi ha el formulari d\'inscripció'), T('Conversions / contactes (inscripcions)'), T('Abast, perquè com més gent ho vegi, més inscripcions'), T('Interacció, per fer créixer la comunitat primer')], c: 1, why: T('La plataforma optimitza per allò que li demanes.') },
      { q: T('Quina segmentació té més sentit?'), o: [T('Tota la comarca d\'Osona, 18–65 anys, interessos en esport'), T('10 km al voltant del gimnàs, 20–55 anys'), T('Tot Catalunya, 20–55 anys, per tenir més abast'), T('2 km al voltant del gimnàs, només 25–30 anys')], c: 1, why: T('Un servei presencial necessita gent que hi pugui anar.') },
      { q: T('Què passa si no configures la conversió?'), o: [T('La plataforma optimitza pels clics i acabes pagant més'), T('No pots saber quantes inscripcions genera ni quant costen'), T('L\'anunci no es pot publicar fins que la configuris'), T('Només perds les dades de les persones que no compren')], c: 1, why: T('Sense mesura no hi ha optimització ni retiment de comptes.') },
      { q: T('Cas real · Burger King «Whopper Detour» (2018). L\'app oferia un Whopper per un cèntim, però només si feies la comanda a menys de 180 metres d\'un McDonald\'s. Quina tècnica de segmentació feia servir?'), o: [T('Segmentació per interessos'), T('Geolocalització (geofencing)'), T('Remàrqueting'), T('Públics semblants (lookalike)')], c: 1, why: T('Una zona virtual al voltant d\'un lloc activa l\'oferta quan l\'usuari hi és. L\'objectiu real eren les descàrregues de l\'app.') },
      { q: T('Cas real · Procter & Gamble (2017). Va retallar uns 200 milions de dòlars d\'anuncis digitals mal segmentats o poc visibles i va mantenir el creixement. Quina conclusió en treus?'), o: [T('Que la publicitat digital no funciona per a marques de consum'), T('Que és millor tornar a la televisió'), T('Que més pressupost no és més resultat si no es controla on i a qui arriben els anuncis'), T('Que les marques grans no necessiten fer publicitat')], c: 2, why: T('Segmentar bé i mesurar evita pagar per impressions que no arriben a ningú útil.') }
    ]
  },

  /* ---------- ETAPA 2 ---------- */
  L_seolocal: {
    area: 'seo', title: T('SEO local i reputació'),
    goal: T('Aparèixer quan algú busca a prop i convertir la cerca en visita.'),
    body: [
      T('Moltes cerques tenen <b>intenció de visita</b>: «restaurant obert dilluns Vic», «forn a prop». Per aparèixer-hi, la fitxa de <b>Google Business Profile</b> ha de tenir horaris correctes, categoria, fotos reals, carta o serveis i un enllaç per reservar o trucar.'),
      T('Les <b>ressenyes</b> influeixen en la decisió i en la visibilitat. Cal demanar-les als clients satisfets, respondre-les totes (també les negatives) amb educació i solucionar el que es critica.'),
      T('La <b>conversió</b> local és el pas de la cerca a l\'acció: trucar, demanar com arribar, reservar.')
    ],
    example: T('Un restaurant que publica el menú del dilluns a la fitxa i activa les reserves en línia passa de 2 a 9 reserves els dilluns (cas simulat).'),
    errors: [T('Horaris desactualitzats.'), T('Respondre de manera defensiva a les crítiques.'), T('Comprar ressenyes falses (és enganyós i pot ser sancionat).')],
    quiz: [
      { q: T('Quina cerca té intenció de visita?'), o: [T('«Millors restaurants de Catalunya»'), T('«Restaurant obert dilluns a Vic»'), T('«Restaurant Can Jordi opinions»'), T('«Menú de migdia preu mitjà»')], c: 1, why: T('La persona vol anar a un lloc concret, ara.') },
      { q: T('Com respons una ressenya negativa justa?'), o: [T('Agraeixes l\'opinió i convides el client a tornar'), T('Agraeixes, expliques què canviaràs i ho fas'), T('Demanes disculpes en privat perquè no es vegi'), T('Expliques per què va passar i que va ser excepcional')], c: 1, why: T('Una resposta honesta i útil genera confiança en els futurs clients.') },
      { q: T('Què és prioritari en una fitxa local?'), o: [T('Horaris i informació correctes'), T('Moltes fotos i publicacions recents'), T('Una bona descripció amb paraules clau'), T('Respondre totes les preguntes dels usuaris')], c: 0, why: T('Si la informació és errònia, perds visites encara que siguis visible.') },
      { q: T('Cas real · «The Shed at Dulwich» (2017). Un periodista va aconseguir que un restaurant inexistent, al jardí de casa seva, fos el número 1 de Londres a TripAdvisor amb ressenyes falses. Què demostra?'), o: [T('Que convé comprar ressenyes al principi per arrencar'), T('Que les ressenyes es poden manipular i que les plataformes i la llei persegueixen les falses'), T('Que TripAdvisor no té cap valor per als restaurants'), T('Que la ubicació no importa en el SEO local')], c: 1, why: T('Va ser un experiment per denunciar el problema. Avui les ressenyes falses estan prohibides i es poden sancionar.') },
      { q: T('Cas real · McDonald\'s. Cada restaurant de la cadena té la seva pròpia fitxa a Google Maps, amb el seu horari, telèfon i ressenyes. Per què no en té una de sola?'), o: [T('Perquè Google obliga les franquícies a separar-les'), T('Perquè les cerques locals mostren el local més proper amb la seva informació concreta'), T('Perquè així té més ressenyes en total'), T('Perquè cada fitxa costa menys que una de gran')], c: 1, why: T('Qui busca «hamburgueseria a prop» vol saber on és la més propera i si està oberta ara.') }
    ]
  },
  L_b2b: {
    area: 'creixement', title: T('Màrqueting B2B i l\'embut comercial'),
    goal: T('Captar contactes empresarials de qualitat i coordinar-se amb vendes.'),
    body: [
      T('En el <b>B2B</b> (empresa a empresa) decideixen diverses persones (compres, enginyeria, direcció), les compres són grans i el <b>cicle de venda</b> pot durar mesos.'),
      T('L\'<b>embut</b> té etapes: descobriment → interès → contacte (lead) → oportunitat → venda. El màrqueting ha de portar contactes <b>qualificats</b> i vendes ha de fer-ne el seguiment ràpidament.'),
      T('Indicadors clau: <b>cost per contacte</b>, percentatge de contactes que es converteixen en oportunitats, i <b>cost d\'adquisició de client (CAC)</b> = inversió comercial ÷ clients nous.')
    ],
    example: T('Una campanya genera 200 contactes a 5 € cadascun, però cap no és una empresa compradora. Una altra en genera 20 a 40 €, i 4 acaben en comanda. La segona és molt millor.'),
    errors: [T('Mesurar només el volum de contactes.'), T('No definir què és un contacte qualificat.'), T('Deixar passar dies abans de trucar.')],
    quiz: [
      { q: T('Inverteixes 2.000 € i aconsegueixes 4 clients nous. Quin és el CAC?'), o: [T('500 €'), T('8.000 €'), T('2.000 €'), T('250 €')], c: 0, why: T('2.000 ÷ 4 = 500 € per client.') },
      { q: T('Què és un contacte qualificat?'), o: [T('Algú que ha descarregat un catàleg i ha deixat el correu'), T('Algú amb necessitat, capacitat de compra i encaix amb el producte'), T('Algú que ha demanat informació i té càrrec de direcció'), T('Algú que coneix la marca i interactua a LinkedIn')], c: 1, why: T('La qualificació separa curiosos de compradors potencials.') },
      { q: T('Quin és un tret típic del B2B?'), o: [T('Les compres es decideixen sobretot pel preu'), T('Diverses persones decideixen i el cicle és llarg'), T('El client compra sovint i en quantitats petites'), T('La publicitat massiva és el canal principal')], c: 1, why: T('Per això cal contingut tècnic i un seguiment comercial acurat.') },
      { q: T('Cas real · HubSpot. Aquesta empresa de programari B2B atrau clients amb un blog, cursos gratuïts i un CRM gratuït, i després els ofereix versions de pagament. Quina part de l\'embut treballa sobretot el contingut gratuït?'), o: [T('L\'atracció de contactes, a la part alta de l\'embut'), T('El tancament de la venda'), T('La facturació i el cobrament'), T('La renovació dels clients actuals')], c: 0, why: T('HubSpot va popularitzar l\'«inbound marketing»: atraure amb contingut útil i després qualificar i convertir.') },
      { q: T('Cas real · LinkedIn. Microsoft la va comprar el 2016 per 26.200 milions de dòlars. Per què és tan valuosa per al màrqueting B2B?'), o: [T('Perquè té més usuaris que cap altra xarxa social'), T('Perquè els anuncis són els més barats del mercat'), T('Perquè permet arribar a decisors segons el càrrec, el sector i l\'empresa'), T('Perquè és l\'única xarxa on es poden fer vendes')], c: 2, why: T('En B2B no compra qualsevol persona: cal arribar a qui decideix, i LinkedIn té aquestes dades professionals.') }
    ]
  },
  L_seo: {
    area: 'seo', title: T('SEO: intenció de cerca i continguts'),
    goal: T('Atraure visites amb intenció a través dels cercadors.'),
    body: [
      T('El <b>SEO</b> (optimització per a cercadors) consisteix a fer que una web aparegui quan algú busca allò que oferim. Cal saber <b>quines paraules</b> fa servir el client i <b>amb quina intenció</b> (informar-se, comparar, comprar).'),
      T('Tres pilars: <b>tècnic</b> (la web carrega ràpid, es pot indexar, funciona al mòbil), <b>contingut</b> (pàgines útils que responen preguntes reals) i <b>autoritat</b> (enllaços i mencions de webs fiables).'),
      T('En sectors industrials, les cerques són poques però molt valuoses: «fabricant engranatges a mida», «component inoxidable normativa X».')
    ],
    example: T('Una fàbrica crea una pàgina per a cada família de producte amb fitxa tècnica descarregable. En sis mesos rep consultes de compradors que abans no la trobaven (cas simulat).'),
    errors: [T('Escriure per a robots en lloc de persones.'), T('Una sola pàgina genèrica per a tots els productes.'), T('Esperar resultats en una setmana.')],
    quiz: [
      { q: T('Quina cerca indica intenció de compra B2B?'), o: [T('«Com funciona un engranatge helicoïdal»'), T('«Fabricant engranatges a mida pressupost»'), T('«Tipus d\'engranatges industrials»'), T('«Engranatges millors marques»')], c: 1, why: T('Inclou paraules com «fabricant» i «pressupost».') },
      { q: T('Quin és un problema de SEO tècnic?'), o: [T('La web no funciona bé al mòbil'), T('Els textos no tenen prou paraules clau'), T('El blog no s\'actualitza des de fa mesos'), T('Poques webs enllacen a la pàgina')], c: 0, why: T('El rendiment i l\'accessibilitat tècnica afecten la indexació i l\'experiència.') },
      { q: T('Quant triga normalment el SEO a donar resultats?'), o: [T('Uns dies, si el contingut és bo'), T('Setmanes o mesos'), T('Més d\'un any, sempre'), T('Immediatament, si la web és ràpida')], c: 1, why: T('És una inversió a mitjà termini.') },
      { q: T('Cas real · J.C. Penney (2011). Els grans magatzems apareixien primers a Google per centenars de cerques gràcies a milers d\'enllaços pagats. Quan es va descobrir, què va passar?'), o: [T('Google li va cobrar una multa econòmica'), T('Google la va penalitzar i va caure en picat als resultats'), T('No va passar res, perquè comprar enllaços és legal'), T('Google li va oferir fer SEM gratis per compensar')], c: 1, why: T('Comprar enllaços per manipular el rànquing va contra les normes de Google. Els atalls en SEO es paguen.') },
      { q: T('Cas real · Google (2015). Una actualització de l\'algoritme, anomenada «Mobilegeddon», va afavorir les webs adaptades al mòbil a les cerques des del mòbil. Quin tipus de SEO hi entra en joc?'), o: [T('SEO de continguts'), T('SEO tècnic'), T('SEO local'), T('Construcció d\'enllaços')], c: 1, why: T('Com es veu i funciona la web en cada dispositiu és una qüestió tècnica que afecta el posicionament.') }
    ]
  },
  L_ecom: {
    area: 'web', title: T('Botiga en línia: conversió i abandonament'),
    goal: T('Dissenyar una botiga que vengui, no només que sigui bonica.'),
    body: [
      T('La <b>taxa de conversió</b> és el percentatge de visites que acaben comprant. Si 1.000 persones visiten la botiga i 15 compren, la conversió és de l\'1,5 %.'),
      T('Les causes habituals d\'<b>abandonament del carretó</b> són: costos d\'enviament inesperats al final, obligació de crear un compte, pocs mètodes de pagament, dubtes sobre l\'entrega i webs lentes al mòbil.'),
      T('Una bona <b>fitxa de producte</b> respon les preguntes del comprador: què és, quant pesa, com es conserva, quan arriba, què passa si no m\'agrada.'),
      T('Cal calcular el <b>marge per comanda</b>: preu − cost del producte − enviament − comissions − cost d\'adquisició.')
    ],
    example: T('Una botiga d\'embotits mostra el cost de l\'enviament refrigerat només al final. Quan el mostra a la fitxa i ofereix enviament gratuït a partir de 45 €, l\'abandonament baixa (cas simulat).'),
    errors: [T('Prioritzar l\'estètica per sobre de la usabilitat.'), T('Amagar costos fins al darrer pas.'), T('Oblidar la logística i l\'atenció al client.')],
    quiz: [
      { q: T('2.000 visites i 30 comandes. Quina és la conversió?'), o: [T('15 %'), T('1,5 %'), T('0,15 %'), T('6,6 %')], c: 1, why: '30 ÷ 2.000 = 0,015 → 1,5 %.' },
      { q: T('Quina és una causa típica d\'abandonament?'), o: [T('Costos d\'enviament que apareixen al final'), T('Poques fotos de cada producte'), T('No tenir xat a la web'), T('Massa productes a la pàgina d\'inici')], c: 0, why: T('Les sorpreses de preu al final fan desconfiar.') },
      { q: T('Per què cal calcular el marge per comanda?'), o: [T('Per saber si cada venda deixa diners després de tots els costos'), T('Per saber quant pots gastar en publicitat cada mes'), T('Per fixar el preu final dels productes'), T('Per calcular els impostos de cada venda')], c: 0, why: T('Pots vendre molt i perdre diners en cada comanda.') },
      { q: T('Cas real · Amazon. El 1999 va patentar la compra amb «1-Click»: comprar sense tornar a escriure adreça ni targeta. Quin problema de la botiga en línia resolia?'), o: [T('El cost d\'enviament'), T('La fricció al pagament, que provoca abandonaments'), T('La seguretat de les dades de targeta'), T('La manca de fotos dels productes')], c: 1, why: T('Cada pas extra en el pagament és una oportunitat perquè el client abandoni.') },
      { q: T('Cas real · Zappos. Aquesta botiga en línia de sabates va oferir enviament i devolucions gratuïts, amb un termini de devolució d\'un any. Per què?'), o: [T('Per tenir més dades dels clients'), T('Perquè la llei ho obligava als Estats Units'), T('Per reduir el risc percebut de comprar sabates sense provar-les'), T('Per vendre l\'estoc retornat a un preu més alt')], c: 2, why: T('Treure la por a equivocar-se augmenta la conversió, encara que les devolucions tinguin un cost.') }
    ]
  },
  L_xarxes: {
    area: 'xarxes', title: T('Estratègia a xarxes socials'),
    goal: T('Fer servir les xarxes amb un propòsit i mesurar-ne l\'efecte real.'),
    body: [
      T('Les xarxes serveixen per crear <b>comunitat</b>, mantenir la marca present i portar trànsit cap a una acció. Una <b>estratègia editorial</b> defineix per a qui publiques, quins temes, amb quina freqüència i què vols que facin després.'),
      T('El creixement de seguidors pot venir de sortejos o de contingut viral que no té res a veure amb el teu client. Un seguidor que no comprarà mai no té valor comercial.'),
      T('Les col·laboracions amb <b>creadors</b> funcionen si el seu públic coincideix amb el teu i la relació comercial s\'indica clarament.')
    ],
    example: T('Una marca de roba guanya 8.000 seguidors amb un sorteig d\'un mòbil. Les vendes no es mouen: la majoria de nous seguidors només volien el mòbil.'),
    errors: [T('Publicar per publicar.'), T('Mesurar l\'èxit només en seguidors.'), T('No indicar que un contingut és publicitat.')],
    quiz: [
      { q: T('Un sorteig d\'un mòbil fa créixer molt els seguidors d\'una botiga de llana. Què és probable?'), o: [T('Que les vendes pugin, però menys que els seguidors'), T('Que molts seguidors no siguin clients potencials'), T('Que l\'abast de les publicacions millori durant mesos'), T('Que la marca es faci coneguda entre les teixidores')], c: 1, why: T('El premi atrau gent interessada en el premi, no en el producte.') },
      { q: T('Què ha d\'incloure una estratègia editorial?'), o: [T('Públic, temes, freqüència i acció desitjada'), T('Temes, formats, freqüència i hashtags'), T('Públic, xarxes, horaris i pressupost'), T('Calendari, formats i to de comunicació')], c: 0, why: T('Sense propòsit, la freqüència no serveix de res.') },
      { q: T('Quan treballes amb un creador de contingut pagat…'), o: [T('Només cal dir-ho si el creador cobra diners, no si rep producte'), T('Cal indicar clarament que és publicitat'), T('N\'hi ha prou amb etiquetar la marca a la publicació'), T('Cal dir-ho només si té més de 100.000 seguidors')], c: 1, why: T('La transparència és una obligació i protegeix la confiança.') },
      { q: T('Cas real · Wendy\'s. La cadena d\'hamburgueses és coneguda a X (Twitter) per respondre amb un to irònic i atrevit, sempre el mateix. Què treballa sobretot?'), o: [T('Un to de veu propi i coherent que la fa reconeixible'), T('La venda directa a les xarxes'), T('L\'atenció al client per resoldre queixes'), T('La publicitat pagada a X')], c: 0, why: T('Un to coherent forma part de l\'estratègia editorial: fa que la marca es reconegui sense veure el logo.') },
      { q: T('Cas real · Fyre Festival (2017). Famoses influencers van publicar el mateix quadrat taronja per promocionar el festival sense indicar que cobraven. El festival va ser un frau. Quin error es va cometre?'), o: [T('Publicar el mateix contingut a totes les xarxes'), T('Triar influencers amb massa seguidors'), T('No indicar que era publicitat pagada'), T('Fer la campanya només a Instagram')], c: 2, why: T('La publicitat amb creadors s\'ha d\'identificar. Les autoritats nord-americanes ho van recordar arran d\'aquest cas.') }
    ]
  },
  L_kpi: {
    area: 'analitica', title: T('KPI, etiquetatge i causalitat'),
    goal: T('Construir un informe que separi activitat, resultats de màrqueting i resultats comercials.'),
    body: [
      T('Un <b>KPI</b> (indicador clau de rendiment) és la mètrica que diu si avances cap a l\'objectiu. Separa tres nivells: <b>activitat</b> (publicacions fetes), <b>resultats de màrqueting</b> (visites, contactes) i <b>resultats comercials</b> (vendes, ingressos).'),
      T('Per saber d\'on ve cada visita cal <b>etiquetar</b> els enllaços de les campanyes (paràmetres UTM) i definir <b>esdeveniments i conversions</b> a l\'analítica web.'),
      T('<b>Correlació no és causalitat</b>: que dues coses passin alhora no vol dir que una provoqui l\'altra. Les vendes poden pujar al desembre per Nadal, no per la campanya.')
    ],
    example: T('Un informe honest: «Hem publicat 20 vegades (activitat), han arribat 1.200 visites des d\'Instagram (màrqueting) i 18 han comprat, 540 € (comercial)».'),
    errors: [T('Barrejar activitat amb resultats.'), T('Atribuir tot el canvi a la campanya.'), T('Enllaços sense etiquetar.')],
    quiz: [
      { q: T('«Hem publicat 30 vídeos.» Quin nivell és?'), o: [T('Activitat'), T('Resultat comercial'), T('Interacció'), T('Abast')], c: 0, why: T('Descriu la feina feta, no el resultat obtingut.') },
      { q: T('Per a què serveixen els paràmetres UTM?'), o: [T('Per identificar de quina campanya ve cada visita'), T('Per saber quantes vegades s\'ha vist l\'anunci'), T('Per comptar les vendes de cada producte'), T('Per evitar que les visites es dupliquin a Analytics')], c: 0, why: T('Permeten atribuir visites i vendes a cada acció.') },
      { q: T('Les vendes pugen al desembre i la campanya també era al desembre. Què pots afirmar?'), o: [T('La campanya ha causat la pujada, perquè coincideixen'), T('Hi ha correlació, però cal descartar l\'estacionalitat'), T('La campanya ha funcionat si les vendes han pujat més d\'un 10 %'), T('No es pot saber res de cap campanya feta al desembre')], c: 1, why: T('Cal comparar amb anys anteriors o un grup de control.') },
      { q: T('Cas real · Wells Fargo (2016). El banc va fixar objectius molt agressius de comptes oberts per client. Milers d\'empleats van obrir comptes sense permís dels clients. Què il·lustra?'), o: [T('Que els objectius de vendes no s\'han de mesurar'), T('Que un KPI mal triat pot incentivar conductes que fan mal al negoci'), T('Que el problema era que el KPI no tenia termini'), T('Que calia mesurar més KPI alhora')], c: 1, why: T('Quan una mètrica es converteix en l\'objectiu, la gent pot optimitzar el número en lloc del resultat real.') },
      { q: T('Cas real · Google Analytics. Els paràmetres UTM es diuen així per Urchin, l\'empresa que Google va comprar el 2005 i que va donar origen a Google Analytics. Quin d\'aquests enllaços està ben etiquetat per a un butlletí?'), o: [T('web.cat/?font=correu'), T('web.cat/?utm_source=butlleti&utm_medium=email&utm_campaign=novembre'), T('web.cat/?utm_campaign=novembre'), T('web.cat/butlleti-novembre')], c: 1, why: T('Font, mitjà i campanya permeten saber d\'on ve cada visita i comparar canals.') }
    ]
  },

  /* ---------- ETAPA 3 ---------- */
  L_prospeccio: {
    area: 'direccio', title: T('Prospecció i qualificació comercial'),
    goal: T('Invertir el temps comercial en els contactes amb més potencial.'),
    body: [
      T('La <b>prospecció</b> és buscar clients potencials. A una fira parlaràs amb molta gent: el repte és identificar qui té un problema que pots resoldre, pressupost, capacitat de decisió i urgència.'),
      T('Un <b>argumentari</b> no és un monòleg: és una conversa preparada amb preguntes, exemples de resultats i respostes a objeccions habituals.'),
      T('El <b>retorn d\'una acció comercial</b> = (marge dels clients aconseguits − cost de l\'acció) ÷ cost de l\'acció. Inclou el teu temps!')
    ],
    example: T('Després d\'una fira, en lloc d\'enviar el mateix correu a 80 targetes, l\'agència prioritza les 8 empreses que han explicat un problema concret i tenen pressupost.'),
    errors: [T('Perseguir tothom per igual.'), T('Parlar només dels teus serveis.'), T('No fer seguiment en 48 hores.')],
    quiz: [
      { q: T('Quin contacte té més potencial?'), o: [T('Un director que ha descarregat tres catàlegs aquest mes'), T('Una gerent amb un problema concret, pressupost i data límit'), T('Una empresa gran del sector que encara no et coneix'), T('Un client antic que et recomana a tothom')], c: 1, why: T('Necessitat, capacitat de decisió, pressupost i urgència.') },
      { q: T('Una fira costa 600 € i et porta 2 clients amb 1.500 € de marge total. Quin és el retorn?'), o: [T('150 %'), T('250 %'), T('60 %'), T('40 %')], c: 0, why: '(1.500 − 600) ÷ 600 = 1,5 → 150 %.' },
      { q: T('Què hauria d\'incloure un bon argumentari?'), o: [T('Preguntes, exemples i respostes a objeccions'), T('Preus, descomptes i condicions de pagament'), T('Serveis, casos d\'èxit i premis de l\'agència'), T('Una presentació breu de l\'agència i del seu equip')], c: 0, why: T('Una conversa útil per al client ven més que un monòleg.') },
      { q: T('Cas real · Salesforce. El llibre «Predictable Revenue» explica com l\'empresa va separar qui busca i qualifica contactes de qui tanca les vendes. Quin avantatge té?'), o: [T('Que els venedors no han de parlar mai amb clients nous'), T('Que els venedors dediquen el temps als contactes ja qualificats'), T('Que es poden contractar menys venedors'), T('Que tots els contactes acaben comprant')], c: 1, why: T('Qualificar abans de vendre evita perdre temps comercial amb qui no comprarà.') },
      { q: T('Cas real · Mobile World Congress (Barcelona). Moltes empreses hi van a buscar clients. Què és el més eficaç per sortir-ne amb contactes de valor?'), o: [T('Repartir el màxim de targetes i fullets a l\'estand'), T('Fer un estand gran i esperar que la gent s\'hi acosti'), T('Preparar una llista d\'empreses objectiu i concertar reunions abans de la fira'), T('Fer un sorteig per recollir correus')], c: 2, why: T('A les fires grans, les reunions es tanquen setmanes abans. Sense llista ni cita, et quedes amb contactes poc qualificats.') }
    ]
  },
  L_posicionament: {
    area: 'fonaments', title: T('Posicionament i diferenciació'),
    goal: T('Triar on competir i on no.'),
    body: [
      T('El <b>posicionament</b> és el lloc que ocupes a la ment dels clients en comparació amb els competidors. No pots ser el més barat, el més gran i el més especialitzat alhora.'),
      T('Formes de diferenciar-se: <b>coneixement local</b>, <b>especialització</b> en un sector o servei, <b>servei personalitzat</b>, o una <b>estructura de costos</b> més eficient.'),
      T('De vegades un competidor és també un possible <b>aliat</b>: si les vostres habilitats són complementàries, podeu compartir projectes.')
    ],
    example: T('Una agència petita no pot igualar els recursos d\'una de Barcelona, però pot ser la que millor coneix els comerços i la indústria d\'Osona i respondre en el mateix dia.'),
    errors: [T('Competir només en preu.'), T('Prometre més del que pots complir.'), T('Copiar el discurs del competidor gran.')],
    quiz: [
      { q: T('Quina diferenciació és més creïble per a una agència petita de Vic?'), o: [T('Preus més baixos que les agències de Barcelona'), T('Coneixement local i servei proper amb resultats mesurables'), T('Experiència en tots els sectors i tots els canals'), T('Les últimes eines d\'IA per a tots els serveis')], c: 1, why: T('És veritat, és difícil de copiar i és valuós per al client.') },
      { q: T('Competir només amb preus baixos…'), o: [T('Funciona si tens costos més baixos que la competència'), T('Redueix el marge i atrau clients que marxaran per un preu més baix'), T('Fa créixer la cartera de clients sense riscos'), T('És la millor manera d\'entrar en un mercat nou')], c: 1, why: T('Sempre hi haurà algú més barat.') },
      { q: T('Quan té sentit aliar-se amb un competidor?'), o: [T('Quan l\'altre és més gran i et pot passar clients'), T('Quan les habilitats són complementàries i hi ha confiança'), T('Quan feu els mateixos serveis i així baixeu preus'), T('Quan us voleu repartir els clients per zones')], c: 1, why: T('La col·laboració permet accedir a projectes que sol no podries fer.') },
      { q: T('Cas real · Volvo. Durant dècades, la marca s\'ha associat a una idea: la seguretat. Fins i tot va alliberar la patent del cinturó de tres punts el 1959. Quina estratègia segueix?'), o: [T('Competir en preu amb les marques de luxe'), T('Posicionar-se en un sol atribut clar i creïble'), T('Ser el líder en vendes a tot el món'), T('Oferir tots els tipus de cotxe per a tothom')], c: 1, why: T('Un posicionament clar i coherent durant anys fa que la marca ocupi un lloc a la ment del client.') },
      { q: T('Cas real · Avis (1962). La companyia de lloguer de cotxes era la número 2 darrere d\'Hertz i va llançar l\'eslògan «We try harder» (Ens hi esforcem més). Què va fer?'), o: [T('Va baixar preus per superar Hertz'), T('Va convertir ser el número 2 en un argument de servei'), T('Va copiar el posicionament d\'Hertz'), T('Va amagar que no era el líder')], c: 1, why: T('Un posicionament honest i diferent pot ser més creïble que dir que ets el millor.') }
    ]
  },
  L_pressupost: {
    area: 'direccio', title: T('Abast, pressupost i marge'),
    goal: T('Pressupostar un servei sense perdre diners.'),
    body: [
      T('L\'<b>abast</b> defineix exactament què inclou el servei: quines tasques, quantes peces, quantes <b>revisions</b>, quins terminis i què <b>no</b> inclou.'),
      T('Per pressupostar: estima les <b>hores</b>, multiplica-les pel teu cost per hora i afegeix-hi un marge. <b>Marge brut</b> = (preu − cost directe) ÷ preu.'),
      T('Pacta com es gestionen els <b>canvis</b>: «les modificacions fora d\'abast es pressuposten a part». Així protegeixes la rendibilitat i la relació.')
    ],
    example: T('Un projecte de 1.200 € que requereix 30 hores a un cost de 25 €/h té un cost directe de 750 €: marge brut del 37,5 %. Si el client demana 20 hores més sense pagar, el marge passa a ser negatiu.'),
    errors: [T('Acceptar «encarrega\'t de tot» sense límits.'), T('No comptar el temps de reunions i correus.'), T('Fer canvis gratis per por de perdre el client.')],
    quiz: [
      { q: T('Preu 2.000 €, cost directe 1.200 €. Quin és el marge brut?'), o: [T('40 %'), T('60 %'), T('67 %'), T('800 €, que és un 80 %')], c: 0, why: '(2.000 − 1.200) ÷ 2.000 = 0,40.' },
      { q: T('Què ha de dir l\'abast d\'un projecte?'), o: [T('Què inclou, què no, revisions i terminis'), T('Què inclou, el preu i la forma de pagament'), T('Els objectius, el públic i els canals'), T('Les tasques, les persones i les eines')], c: 0, why: T('Un abast clar evita conflictes.') },
      { q: T('El client demana una feina que no era al contracte. Què fas?'), o: [T('La fas per mantenir la relació i la factures al final'), T('L\'expliques i la pressuposteu a part o canvieu prioritats'), T('La fas gratis aquesta vegada i avises que serà l\'última'), T('Li dius que no és possible fins al contracte següent')], c: 1, why: T('És professional i manté la confiança.') },
      { q: T('Cas real · Aeroport de Berlín-Brandenburg. Havia d\'obrir el 2011, però per canvis constants en el projecte i errors va obrir el 2020, amb un cost diverses vegades superior al previst. Quina lliçó en treus?'), o: [T('Que els projectes grans sempre s\'endarrereixen'), T('Que els canvis d\'abast sense control disparen costos i terminis'), T('Que cal pressupostar sempre el doble'), T('Que el problema va ser triar un proveïdor barat')], c: 1, why: T('Cada canvi a mig projecte s\'ha d\'avaluar, pressupostar i aprovar, també a una agència petita.') },
      { q: T('Cas real · Costco. Aquesta cadena limita el marge sobre el cost dels productes (al voltant del 14–15 %) i guanya bona part del benefici amb les quotes anuals dels socis. Què implica?'), o: [T('Que perd diners amb cada producte que ven'), T('Que el marge per producte no importa en cap negoci'), T('Que el model de negoci no depèn només del marge per producte'), T('Que cobra més car que la competència')], c: 2, why: T('Un marge baix pot ser una estratègia si hi ha altres ingressos recurrents que el compensen.') }
    ]
  },
  L_planificacio: {
    area: 'direccio', title: T('Planificació i priorització'),
    goal: T('Repartir el temps quan tot arriba alhora.'),
    body: [
      T('Classifica les tasques per <b>urgència</b> i <b>impacte</b>. Primer el que és urgent i important; planifica el que és important però no urgent; delega o ajorna (avisant!) la resta.'),
      T('Estima recursos amb honestedat: una tasca sempre porta temps de coordinació. Afegeix-hi un marge.'),
      T('La <b>comunicació</b> és part de la planificació: un client que sap que rebrà la feina dijous està més tranquil que un que no sap res.')
    ],
    example: T('Tres clients demanen canvis la mateixa setmana. L\'agència resol primer l\'error que impedeix vendre a la botiga en línia, programa la campanya per dijous i avisa el tercer client que el redisseny arribarà dilluns.'),
    errors: [T('Treballar de nit sistemàticament: la qualitat cau.'), T('Ajornar sense avisar.'), T('Dir que sí a tot.')],
    quiz: [
      { q: T('Què resols primer?'), o: [T('Un informe trimestral que el client vol veure demà'), T('Un error que impedeix comprar a la botiga en línia d\'un client'), T('La proposta per a un client nou que pot ser molt gran'), T('Les publicacions de la setmana vinent d\'un client')], c: 1, why: T('És urgent i té un gran impacte en el negoci del client.') },
      { q: T('Si has d\'ajornar una tasca…'), o: [T('Avises el client el dia de l\'entrega'), T('Avises el client amb una data nova realista'), T('Ho fas tu el cap de setmana per no ajornar-la'), T('Entregues una versió parcial sense dir res')], c: 1, why: T('La transparència preserva la confiança.') },
      { q: T('Subcontractar una tasca té sentit quan…'), o: [T('No tens capacitat i algú la pot fer bé amb un cost raonable'), T('Algú la pot fer més barata, encara que sigui pitjor'), T('El client no ho ha de saber mai'), T('Així la responsabilitat del resultat passa a l\'altre')], c: 0, why: T('Continues sent responsable del resultat davant del client.') },
      { q: T('Cas real · Toyota. El tauler «kanban» que fan servir moltes agències ve del sistema de producció de Toyota. Per a què serveix sobretot?'), o: [T('Per calcular quant cobrar cada tasca'), T('Per veure les tasques per estat i limitar la feina en curs'), T('Per controlar les hores de cada persona'), T('Per fer el calendari de publicacions')], c: 1, why: T('Veure-ho tot en columnes (pendent, en curs, fet) ajuda a prioritzar i a no començar massa coses alhora.') },
      { q: T('Cas real · Amazon. A les reunions de direcció no es fan presentacions: es llegeix en silenci un document de sis pàgines abans de debatre. Per què?'), o: [T('Per estalviar el temps de fer diapositives'), T('Perquè obliga a pensar bé la proposta i les prioritats abans de decidir'), T('Perquè així les reunions són més curtes'), T('Perquè així no cal que hi vagi tothom')], c: 1, why: T('Escriure amb claredat obliga a ordenar idees i prioritats; tothom decideix amb la mateixa informació.') }
    ]
  },

  /* ---------- ETAPA 4 ---------- */
  L_contractar: {
    area: 'direccio', title: T('Contractar i delegar'),
    goal: T('Decidir quan i com incorporar persones a l\'equip.'),
    body: [
      T('El <b>cost total</b> d\'una persona contractada és més alt que el sou brut: cal sumar-hi la Seguretat Social a càrrec de l\'empresa, eines, formació i temps d\'incorporació.'),
      T('Contractar té sentit quan els <b>ingressos recurrents</b> poden cobrir-ne el cost i quan el temps que alliberes pots dedicar-lo a feina de més valor (vendre, dirigir).'),
      T('<b>Delegar</b> no és desentendre\'s: cal definir objectius, criteris de qualitat i revisions periòdiques.')
    ],
    example: T('Una analista amb un sou de 1.900 € bruts al mes costa a l\'empresa uns 2.500 € amb cotitzacions i eines. Si allibera 60 hores al mes del director per vendre, pot ser rendible (xifres orientatives i simplificades).'),
    errors: [T('Contractar amb ingressos puntuals, no recurrents.'), T('Delegar sense instruccions clares.'), T('No preveure el temps de formació.')],
    quiz: [
      { q: T('Què cal comparar abans de contractar?'), o: [T('El cost total amb el valor i el temps que aportarà'), T('El sou amb el que cobren a altres agències'), T('L\'experiència de la persona amb el sou que demana'), T('El cost de la persona amb el d\'una eina d\'IA')], c: 0, why: T('Una contractació és una inversió.') },
      { q: T('Quin ingrés és més segur per cobrir un sou?'), o: [T('Un projecte gran que acabes de signar'), T('Quotes mensuals de clients recurrents'), T('La previsió de vendes del trimestre'), T('Una subvenció per a la contractació')], c: 1, why: T('Els sous es paguen cada mes.') },
      { q: T('Delegar bé vol dir…'), o: [T('Explicar la tasca i revisar-la quan estigui acabada'), T('Definir objectius, criteris i revisions'), T('Donar llibertat total perquè la persona aprengui'), T('Revisar cada pas perquè no hi hagi errors')], c: 1, why: T('Així la persona té autonomia i tu tens control de qualitat.') },
      { q: T('Cas real · Zappos. Després de la formació inicial, l\'empresa oferia diners als treballadors nous perquè marxessin si no s\'hi sentien bé. Quin objectiu tenia?'), o: [T('Reduir la plantilla de manera barata'), T('Que marxi aviat qui no encaixa, abans que costi més'), T('Premiar els treballadors més ràpids'), T('Complir una obligació legal')], c: 1, why: T('Una mala contractació costa molt més que un pagament per marxar a temps.') },
      { q: T('Cas real · Google, «Project Oxygen». Google va estudiar què fa bons els seus caps d\'equip. Un dels comportaments clau era donar autonomia i…'), o: [T('revisar personalment cada tasca'), T('no microgestionar'), T('fixar objectius individuals secrets'), T('fer-ho tot ell quan hi ha pressa')], c: 1, why: T('Delegar bé és definir objectius i criteris, i després confiar en l\'equip.') }
    ]
  },
  L_brief: {
    area: 'marca', title: T('Marca, brief creatiu i proves de missatge'),
    goal: T('Fer que la creativitat serveixi l\'objectiu.'),
    body: [
      T('La <b>identitat de marca</b> inclou valors, to de veu, estil visual i promesa. Ha de ser <b>coherent</b> en tots els punts de contacte.'),
      T('Un <b>brief creatiu</b> és el document que orienta la creativitat: objectiu, públic, missatge principal, proves que el sustenten, formats, to i com es mesurarà l\'èxit.'),
      T('Les <b>proves de missatge</b> (A/B) permeten comparar dues propostes amb dades en lloc d\'opinions. Una peça bonica no és necessàriament efectiva.')
    ],
    example: T('La Berta proposa un vídeo poètic per a una fàbrica. Amb el brief, adapta la idea: imatges espectaculars de la maquinària, però amb el missatge «entrega en 48 hores» que és el que valoren els compradors.'),
    errors: [T('Començar a dissenyar sense brief.'), T('Decidir per gust personal.'), T('Canviar de to a cada campanya.')],
    quiz: [
      { q: T('Què NO és part d\'un brief creatiu?'), o: [T('El públic objectiu'), T('El missatge principal'), T('El color preferit del director'), T('Els límits de pressupost i terminis')], c: 2, why: T('El brief parteix de l\'objectiu i el públic, no de gustos personals.') },
      { q: T('Com decideixes entre dues propostes creatives?'), o: [T('Les ensenyes al client i tria la que li agradi més'), T('Amb una prova A/B davant del públic real'), T('Fas una enquesta entre l\'equip de l\'agència'), T('Tries la que segueix millor les tendències')], c: 1, why: T('Les dades del públic són millors que les opinions internes.') },
      { q: T('Coherència de marca vol dir…'), o: [T('Fer servir el mateix logo i colors a tot arreu'), T('Mantenir valors, to i estil en tots els canals'), T('Publicar el mateix contingut a totes les xarxes'), T('No canviar mai el missatge principal')], c: 1, why: T('Ajuda a reconèixer la marca i confiar-hi.') },
      { q: T('Cas real · Campanya d\'Obama (2008). L\'equip va provar diverses fotos i botons a la pàgina d\'inscripció i la versió guanyadora va obtenir al voltant d\'un 40 % més d\'inscripcions. Com va decidir?'), o: [T('Per votació de l\'equip de campanya'), T('Segons l\'opinió del director creatiu'), T('Amb proves A/B davant de visitants reals'), T('Amb un grup de discussió presencial')], c: 2, why: T('La versió que l\'equip preferia no era la guanyadora: per això es prova amb el públic real.') },
      { q: T('Cas real · Tiffany & Co. L\'empresa té registrat com a marca el seu color blau característic i el fa servir a les caixes, bosses i web. Què treballa?'), o: [T('La coherència i el reconeixement de marca'), T('El posicionament en preu'), T('La segmentació del públic'), T('El SEO de la web')], c: 0, why: T('Un element visual constant a tot arreu fa que la marca es reconegui a l\'instant.') }
    ]
  },
  L_processos: {
    area: 'direccio', title: T('Processos, documentació i qualitat'),
    goal: T('Treballar en equip sense perdre informació.'),
    body: [
      T('Quan hi ha diverses persones i clients, cal un <b>canal únic</b> per a les peticions, una <b>eina de gestió de tasques</b> amb responsables i dates, i <b>plantilles</b> per a informes i propostes.'),
      T('Un <b>control de qualitat</b> senzill (una llista de comprovació abans d\'enviar res) evita la majoria d\'errors.'),
      T('Una <b>rutina de revisió</b> setmanal permet detectar retards abans que siguin un problema.')
    ],
    example: T('Abans: peticions per WhatsApp, correu i trucades, i tres errors de coordinació al mes. Després: formulari de peticions + tauler de tasques + revisió dels dilluns.'),
    errors: [T('Massa processos: ningú no els segueix.'), T('Tasques sense responsable.'), T('No documentar les decisions del client.')],
    quiz: [
      { q: T('Quin és el primer pas per ordenar les peticions dels clients?'), o: [T('Un canal únic d\'entrada'), T('Una reunió setmanal amb cada client'), T('Respondre totes les peticions el mateix dia'), T('Un gestor de tasques per a l\'equip')], c: 0, why: T('Si les peticions entren per tot arreu, es perden.') },
      { q: T('Tota tasca hauria de tenir…'), o: [T('Un responsable i una data'), T('Dos responsables, per si un falla'), T('Una data i una prioritat'), T('Un responsable i una prioritat')], c: 0, why: T('Si és de tothom, no és de ningú.') },
      { q: T('Una llista de comprovació abans d\'enviar un informe serveix per…'), o: [T('Reduir errors evitables'), T('Que el client vegi que hi ha un procés'), T('Fer l\'informe més de pressa'), T('Que no calgui que ningú el revisi')], c: 0, why: T('És el control de qualitat més barat que existeix.') },
      { q: T('Cas real · Boeing (1935). Després que un avió de prova s\'estavellés per un oblit dels pilots, es va crear la primera llista de comprovació d\'aviació. Per què funciona?'), o: [T('Perquè substitueix la formació dels pilots'), T('Perquè evita errors per oblit en tasques complexes'), T('Perquè fa que la feina vagi més de pressa'), T('Perquè reparteix la responsabilitat entre tots')], c: 1, why: T('Fins i tot els experts obliden passos quan la tasca és llarga. Una llista curta és el control de qualitat més barat.') },
      { q: T('Cas real · Toyota, l\'«andon». A les fàbriques de Toyota, qualsevol treballador pot aturar la cadena si veu un defecte. Quina idea de qualitat hi ha al darrere?'), o: [T('Que els errors els ha de resoldre només el cap'), T('Que és millor corregir els errors al final, tots alhora'), T('Que és millor aturar-se i resoldre l\'error on neix que deixar-lo passar'), T('Que la velocitat és més important que la qualitat')], c: 2, why: T('En una agència és igual: un error detectat abans d\'enviar un informe costa molt menys que un de detectat pel client.') }
    ]
  },
  L_crm: {
    area: 'email', title: T('CRM, automatització i protecció de dades'),
    goal: T('Automatitzar el que és repetitiu respectant el consentiment.'),
    body: [
      T('Un <b>CRM</b> és una eina on es registren els contactes i les relacions comercials: qui és, què li interessa, en quina fase està, quan cal fer el seguiment.'),
      T('L\'<b>automatització</b> és útil per a tasques repetitives (enviar un correu de benvinguda, classificar contactes, generar informes). Les decisions de criteri (estratègia, respostes delicades) requereixen persones.'),
      T('Per enviar correus comercials cal el <b>consentiment</b> de la persona o una relació prèvia que ho permeti, informar de qui ets i oferir una manera fàcil de donar-se de baixa (RGPD i normativa de comunicacions comercials). Comprar bases de dades és mala pràctica i un risc legal.')
    ],
    example: T('Quan algú descarrega una fitxa tècnica (i accepta rebre informació), el CRM li envia un correu útil al cap de 3 dies i avisa el comercial si torna a visitar la pàgina de preus.'),
    errors: [T('Comprar llistes de correus.'), T('Automatitzar respostes a queixes.'), T('No segmentar: enviar el mateix a tothom.')],
    quiz: [
      { q: T('Quina tasca és millor automatitzar?'), o: [T('Respondre una ressenya negativa d\'un client habitual'), T('Enviar un correu de benvinguda a qui s\'ha subscrit'), T('Decidir quins clients reben un descompte especial'), T('Preparar la proposta per a un client nou')], c: 1, why: T('És repetitiva i no necessita criteri humà en cada cas.') },
      { q: T('Pots enviar butlletins a una llista de correus comprada?'), o: [T('Sí, si el proveïdor garanteix que les dades són legals'), T('No: cal consentiment o una base legal'), T('Sí, si cada correu inclou l\'enllaç de baixa'), T('Sí, si són adreces d\'empreses i no de particulars')], c: 1, why: T('Sense consentiment vulneres la normativa i la confiança.') },
      { q: T('Què és un CRM?'), o: [T('Una eina per enviar butlletins i automatitzar campanyes'), T('Una eina per gestionar contactes i relacions comercials'), T('Un programa de facturació i comptabilitat'), T('Una base de dades de clients potencials comprada')], c: 1, why: T('Centralitza la informació dels clients i el seguiment.') },
      { q: T('Cas real · Amazon. La secció «Els clients que van comprar això també van comprar…» es genera sola a partir de l\'historial de compres. Què és?'), o: [T('Una recomanació automatitzada basada en dades de clients'), T('Un anunci pagat pels venedors'), T('Una selecció manual de l\'equip de màrqueting'), T('Una oferta de venda creuada pactada amb marques')], c: 0, why: T('Les dades del CRM i de les compres permeten automatitzar recomanacions personalitzades a gran escala.') },
      { q: T('Cas real · Vodafone (2021). L\'Agència Espanyola de Protecció de Dades li va imposar una multa de més de 8 milions d\'euros. Per quin motiu, principalment?'), o: [T('Per tenir la web sense certificat de seguretat'), T('Per fer trucades i enviar missatges comercials a persones que no ho havien autoritzat'), T('Per pujar els preus sense avisar'), T('Per no tenir un CRM actualitzat')], c: 1, why: T('Les comunicacions comercials necessiten consentiment o una base legal, també quan les fan empreses col·laboradores.') }
    ]
  },
  L_rendibilitat: {
    area: 'direccio', title: T('Rendibilitat per client'),
    goal: T('Saber quins clients fan créixer l\'empresa i quins la desgasten.'),
    body: [
      T('No tots els clients són igual de rendibles. Per a cada client: <b>ingressos</b> − <b>hores reals × cost per hora</b> − altres costos = <b>marge</b>.'),
      T('Un client que paga molt però consumeix el triple d\'hores de les pressupostades pot ser menys rendible que un de petit i ordenat.'),
      T('Opcions: <b>revisar preus</b>, <b>ajustar l\'abast</b>, <b>millorar processos</b> o, en darrer cas, <b>deixar el client</b> de manera professional.')
    ],
    example: T('Client A: 1.500 €/mes, 80 h reals × 25 € = 2.000 € de cost → −500 €. Client B: 600 €/mes, 12 h × 25 € = 300 € → +300 €.'),
    errors: [T('Mirar només la facturació.'), T('No registrar les hores reals.'), T('Rebaixar preus per por.')],
    quiz: [
      { q: T('Un client paga 1.000 €/mes i consumeix 50 h a 25 €/h. Quin marge deixa?'), o: [T('−250 €'), T('+250 €'), T('0 €'), T('−1.250 €')], c: 0, why: T('50 × 25 = 1.250 € de cost: 1.000 − 1.250 = −250 €.') },
      { q: T('Quina dada necessites per calcular la rendibilitat per client?'), o: [T('Les hores reals dedicades'), T('Les hores pressupostades al contracte'), T('La facturació anual del client'), T('El nombre de projectes que t\'ha encarregat')], c: 0, why: T('Sense hores reals no saps el cost.') },
      { q: T('Davant d\'un client poc rendible, la primera opció hauria de ser…'), o: [T('Pujar-li el preu a partir del mes següent'), T('Parlar-hi per revisar abast o preu'), T('Dedicar-hi menys hores fins que quadri'), T('Passar-lo a un becari per reduir el cost')], c: 1, why: T('Sovint es pot redreçar amb una conversa clara.') },
      { q: T('Cas real · Best Buy (2004). La cadena d\'electrònica va detectar clients que només compraven en rebaixes, retornaven productes i els revenien. Què va fer?'), o: [T('Va abaixar els preus per a tothom'), T('Va analitzar la rendibilitat per client i va deixar de prioritzar els que li feien perdre diners'), T('Va fer més publicitat per captar-ne de nous'), T('Va treure les rebaixes per sempre')], c: 1, why: T('No tots els clients són rendibles. Saber quins ho són permet decidir on posar l\'esforç.') },
      { q: T('Cas real · Ryanair. Cobra a part l\'equipatge gran, triar seient o embarcar primer. Què aconsegueix amb aquest model?'), o: [T('Que tots els passatgers paguin el mateix'), T('Que el bitllet sigui més car però amb tot inclòs'), T('Que cada client pagui pel servei que fa servir i el preu base sigui baix'), T('Que els clients facin servir més serveis gratuïts')], c: 2, why: T('Separar el servei bàsic dels extres fa que cada client sigui rendible. A una agència, és el mateix amb les revisions o feines fora de l\'abast.') }
    ]
  },

  /* ---------- ETAPA 5 ---------- */
  L_ads2: {
    area: 'ads', title: T('Diagnosticar una campanya: CTR, CPC, CPA i ROAS'),
    goal: T('Trobar on falla una campanya abans de tocar res.'),
    body: [
      T('<b>CTR</b> = clics ÷ impressions. Indica si l\'anunci crida l\'atenció del públic. <b>CPC</b> = cost ÷ clics. <b>CPA</b> = cost ÷ conversions (quant costa cada venda o contacte). <b>ROAS</b> = ingressos generats ÷ inversió publicitària.'),
      T('Llegeix l\'embut: si el CTR és bo però no hi ha conversions, el problema pot ser la <b>pàgina de destinació</b>, el procés de compra o el <b>seguiment</b> (la conversió no es registra).'),
      T('Abans d\'aturar una campanya, comprova que les dades són <b>fiables</b>.')
    ],
    example: T('CTR del 3 % (bo), 400 clics, 0 compres registrades. En revisar-ho, la pàgina de pagament no funcionava en mòbils Android (cas simulat).'),
    errors: [T('Canviar l\'anunci quan el problema és la web.'), T('Mirar el ROAS sense restar el marge del producte.'), T('Treure conclusions amb poques dades.')],
    quiz: [
      { q: T('10.000 impressions i 200 clics. Quin és el CTR?'), o: [T('0,2 %'), T('2 %'), T('20 %'), T('5 %')], c: 1, why: '200 ÷ 10.000 = 0,02 → 2 %.' },
      { q: T('Has gastat 600 € i has fet 20 vendes. Quin és el CPA?'), o: [T('30 €'), T('3,3 €'), T('300 €'), T('20 €')], c: 0, why: '600 ÷ 20 = 30 €.' },
      { q: T('Molts clics, CTR alt, zero conversions. On mires primer?'), o: [T('La pàgina de destinació i el seguiment de conversions'), T('La segmentació del públic de l\'anunci'), T('El text i la imatge de l\'anunci'), T('La puja màxima per clic')], c: 0, why: T('L\'anunci funciona; el problema és després del clic.') },
      { q: T('Cas real · Super Bowl 2024. Un anunci de 30 segons costava uns 7 milions de dòlars i el partit el van veure uns 120 milions de persones. Quin és el cost per mil impressions (CPM) aproximat?'), o: [T('Uns 58 $'), T('Uns 5,8 $'), T('Uns 583 $'), T('Uns 17 $')], c: 0, why: T('7.000.000 ÷ (120.000.000 ÷ 1.000) = 7.000.000 ÷ 120.000 ≈ 58 $ per mil espectadors.') },
      { q: T('Cas real · Google Ads. El «nivell de qualitat» fa que un anunci més rellevant pugui pagar menys per clic que un competidor que puja més. Com abaixes el CPC?'), o: [T('Pujant menys i esperant'), T('Millorant la rellevància de l\'anunci, de les paraules clau i de la pàgina de destinació'), T('Afegint moltes més paraules clau'), T('Mostrant l\'anunci només de nit')], c: 1, why: T('Google premia els anuncis útils per a l\'usuari: més qualitat, més posició per menys diners.') }
    ]
  },
  L_crisi: {
    area: 'xarxes', title: T('Comunicació de crisi i reputació'),
    goal: T('Respondre a una crisi amb honestedat i accions reals.'),
    body: [
      T('En una crisi de reputació: 1) <b>escolta</b> i entén què ha passat; 2) <b>reconeix</b> el que és cert; 3) explica què faràs per <b>solucionar-ho</b>; 4) <b>fes-ho</b>; 5) informa del canvi.'),
      T('Esborrar crítiques legítimes o respondre de manera defensiva normalment amplifica el problema.'),
      T('No tornis a fer promoció fins que el problema de fons s\'hagi resolt: estaries portant gent a una mala experiència.')
    ],
    example: T('Un restaurant canvia el menú i apuja preus sense explicar-ho. Rep crítiques. Resposta efectiva: reconèixer-ho, recuperar el plat més demanat i explicar el perquè dels preus.'),
    errors: [T('Esborrar comentaris crítics.'), T('Culpar els clients.'), T('Prometre canvis que no es faran.')],
    quiz: [
      { q: T('Quin és el primer pas en una crisi?'), o: [T('Publicar un comunicat de disculpa de seguida'), T('Entendre què ha passat'), T('Respondre un per un tots els comentaris'), T('Aturar totes les publicacions i anuncis')], c: 1, why: T('Sense diagnòstic, la resposta pot empitjorar-ho.') },
      { q: T('Esborrar crítiques legítimes…'), o: [T('Evita que la crítica arribi a més gent'), T('Sol amplificar-la i destrueix la confiança'), T('Està permès si són a la teva pàgina'), T('Funciona si després publiques una resposta general')], c: 1, why: T('Els clients ho noten i se sumen més veus.') },
      { q: T('Quan tornes a fer promoció?'), o: [T('Quan han passat dues setmanes i la gent ho ha oblidat'), T('Quan el problema de fons està resolt'), T('De seguida, amb una oferta per compensar els clients'), T('Quan els comentaris negatius deixen d\'arribar')], c: 1, why: T('La promoció amplifica tant les bones com les males experiències.') },
      { q: T('Cas real · KFC Regne Unit (2018). Per un canvi de proveïdor logístic, centenars de restaurants es van quedar sense pollastre. KFC va publicar als diaris un cubell buit amb les lletres «FCK» i una disculpa. Per què va funcionar?'), o: [T('Perquè va culpar el proveïdor de manera clara'), T('Perquè va assumir l\'error amb honestedat, amb un to propi, i va explicar com ho resolia'), T('Perquè va regalar pollastre a tothom'), T('Perquè va fer que la gent oblidés el problema')], c: 1, why: T('Reconèixer, disculpar-se i explicar què es fa per solucionar-ho redueix la crisi.') },
      { q: T('Cas real · United Airlines (2017). Un passatger va ser arrossegat fora d\'un avió i el primer comunicat del director parlava de «reubicar clients». La indignació va créixer. Què va fallar?'), o: [T('Va trigar massa a respondre'), T('Va minimitzar els fets amb un llenguatge fred en lloc d\'entendre la gravetat i disculpar-se'), T('Va respondre a les xarxes en lloc de fer-ho a la premsa'), T('Va fer una disculpa massa emotiva')], c: 1, why: T('El primer pas és entendre què ha passat i com ho viu la gent; un eufemisme ho empitjora.') }
    ]
  },
  L_atribucio: {
    area: 'analitica', title: T('Atribució i incrementalitat'),
    goal: T('Interpretar amb prudència qui «s\'emporta» cada venda.'),
    body: [
      T('L\'<b>atribució</b> és la regla que decideix quin canal rep el mèrit d\'una venda. Cada plataforma fa servir el seu model i la seva <b>finestra de conversió</b> (per exemple, 7 dies després del clic), i sovint totes s\'atribueixen la mateixa venda.'),
      T('Per això la suma de les vendes que diuen les plataformes pot ser més gran que les vendes reals de la botiga.'),
      T('La <b>incrementalitat</b> respon una altra pregunta: quantes vendes <b>no</b> s\'haurien produït sense la campanya? Es mesura amb experiments: un grup que veu els anuncis i un altre que no (per exemple, per zones geogràfiques).')
    ],
    example: T('Meta diu 120 vendes, Google 90, el correu 40. La botiga n\'ha fet 160. No hi ha cap error greu: els models d\'atribució se solapen.'),
    errors: [T('Sumar les vendes de totes les plataformes.'), T('Creure que atribuir és demostrar causalitat.'), T('Canviar de model d\'atribució per fer quedar bé un canal.')],
    quiz: [
      { q: T('Les plataformes sumen 250 vendes però la botiga n\'ha fet 160. Per què?'), o: [T('Les plataformes compten també les vendes de la competència'), T('Diversos canals s\'atribueixen la mateixa venda'), T('La botiga no ha instal·lat bé el píxel'), T('Hi ha vendes cancel·lades que no s\'han restat')], c: 1, why: T('Cada plataforma compta les vendes on ha participat.') },
      { q: T('Com mesures la incrementalitat?'), o: [T('Amb un experiment amb grup de control'), T('Comparant el ROAS de cada plataforma'), T('Amb el model d\'atribució de l\'últim clic'), T('Comparant el mes de la campanya amb el mes anterior')], c: 0, why: T('Compara el que passa amb i sense la campanya.') },
      { q: T('Què és una finestra de conversió?'), o: [T('El període després d\'un clic o impressió en què una venda s\'atribueix a l\'anunci'), T('El temps que l\'anunci es mostra a cada usuari'), T('Els dies que dura una campanya d\'anuncis'), T('El temps que triga un usuari a fer clic a l\'anunci')], c: 0, why: T('Finestres més llargues atribueixen més vendes.') },
      { q: T('Cas real · eBay (2013). Va aturar els anuncis a Google per a cerques amb el seu propi nom en algunes zones i les vendes gairebé no van canviar. Què en conclous?'), o: [T('Que els anuncis a Google no funcionen mai'), T('Que molts d\'aquells clics haurien arribat igualment: tenien poca incrementalitat'), T('Que el ROAS d\'aquells anuncis era negatiu'), T('Que cal invertir més en la pròpia marca')], c: 1, why: T('La plataforma s\'atribuïa aquelles vendes, però sense anuncis la gent clicava el resultat orgànic. Només un experiment ho revela.') },
      { q: T('Cas real · Airbnb (2020). Durant la pandèmia va retallar molt la publicitat de rendiment i el trànsit a la web es va recuperar gairebé al nivell anterior. Què va aprendre?'), o: [T('Que la publicitat no serveix per a marques conegudes'), T('Que el trànsit orgànic sempre supera el de pagament'), T('Que part de les vendes atribuïdes als anuncis s\'haurien fet igualment'), T('Que cal tornar a invertir el doble per recuperar-se')], c: 2, why: T('Mesurar la incrementalitat va permetre redirigir el pressupost cap a la marca i el producte.') }
    ]
  },
  L_tresoreria: {
    area: 'direccio', title: T('Tresoreria i risc financer'),
    goal: T('Preveure els diners que entraran i sortiran.'),
    body: [
      T('Un <b>pla de tresoreria</b> és una taula setmana a setmana amb els cobraments previstos i els pagaments (nòmines, lloguer, impostos, proveïdors).'),
      T('Per reduir el risc: factures clares amb <b>venciment</b>, cobrament per avançat d\'una part del projecte, seguiment dels impagaments i una <b>reserva</b>.'),
      T('La <b>concentració</b> és perillosa: si un client representa més del 30–40 % dels ingressos, el seu retard pot posar en perill l\'empresa.')
    ],
    example: T('Una agència cobra el 40 % a l\'inici de cada projecte. Quan un client retarda el pagament final, la bestreta i la reserva cobreixen les nòmines.'),
    errors: [T('Començar a treballar sense bestreta en projectes grans.'), T('No reclamar les factures vençudes.'), T('Dependre d\'un sol client.')],
    quiz: [
      { q: T('Què és la concentració de clients?'), o: [T('Tenir molts clients del mateix sector'), T('Dependre molt d\'un o pocs clients'), T('Tenir els clients a la mateixa comarca'), T('Cobrar tots els clients el mateix dia')], c: 1, why: T('És un risc: si aquell client falla, l\'empresa trontolla.') },
      { q: T('Quina mesura redueix el risc de cobrament?'), o: [T('Cobrar una bestreta a l\'inici'), T('Allargar el termini de pagament a 90 dies'), T('Fer un descompte per pagament al final'), T('Facturar tot el projecte quan s\'acabi')], c: 0, why: T('Asseguren part dels ingressos abans de treballar.') },
      { q: T('Un client no paga i no tens reserva. Què és prioritari?'), o: [T('Fer un pla de tresoreria i parlar amb el client per pactar un calendari'), T('Demanar un préstec de seguida per cobrir el forat'), T('Deixar de treballar per a aquell client fins que pagui'), T('Retardar el pagament dels sous fins que cobris')], c: 0, why: T('Cal saber quants diners necessites i quan, i negociar.') },
      { q: T('Cas real · Imagination Technologies (2017). Apple representava prop de la meitat dels seus ingressos. Quan Apple va anunciar que deixaria de fer servir els seus xips gràfics, l\'acció va caure un 70 % en un dia. Quin risc és?'), o: [T('Risc de tipus de canvi'), T('Concentració de clients'), T('Risc de cobrament'), T('Risc tecnològic')], c: 1, why: T('Dependre d\'un sol client fa que una decisió d\'aquest client pugui enfonsar l\'empresa.') },
      { q: T('Cas real · Pebble (2012). Aquest rellotge intel·ligent va aconseguir més de 10 milions de dòlars a Kickstarter abans de fabricar-lo. Quin avantatge financer té la prevenda?'), o: [T('Que no cal pagar impostos per les vendes'), T('Que es cobra abans de pagar la producció, com una bestreta'), T('Que el producte surt més barat de fabricar'), T('Que no hi ha devolucions')], c: 1, why: T('Cobrar per avançat finança el projecte i valida la demanda; a una agència, és la bestreta a l\'inici.') }
    ]
  },

  /* ---------- ETAPA 6 ---------- */
  L_financament: {
    area: 'direccio', title: T('Finançament i creixement'),
    goal: T('Valorar quan val la pena accelerar amb diners de fora.'),
    body: [
      T('Es pot créixer amb <b>beneficis propis</b> (lent però amb control), amb <b>préstecs</b> (s\'han de tornar amb interessos) o amb <b>inversors</b> (aporten capital a canvi d\'una part de l\'empresa i d\'expectatives de creixement).'),
      T('Més capital permet contractar i captar clients grans, però augmenta les <b>despeses fixes</b> i la pressió. Si els ingressos no creixen al ritme previst, el risc és alt.'),
      T('Abans d\'acceptar, negocia: percentatge, control de decisions, objectius i què passa si no s\'assoleixen.')
    ],
    example: T('Un inversor ofereix 80.000 € pel 30 % de l\'agència i demana duplicar la facturació en dos anys. L\'agència ha de valorar si hi ha prou demanda i equip.'),
    errors: [T('Acceptar diners sense un pla d\'ús.'), T('Augmentar costos fixos abans de tenir ingressos.'), T('Cedir el control sense adonar-se\'n.')],
    quiz: [
      { q: T('Què implica acceptar un inversor?'), o: [T('Rebre diners que s\'han de retornar amb interessos'), T('Cedir una part de l\'empresa i assumir expectatives de creixement'), T('Obtenir diners sense perdre el control de les decisions'), T('Rebre un ajut públic que no cal retornar')], c: 1, why: T('L\'inversor espera un retorn.') },
      { q: T('Quin és el principal risc de créixer massa de pressa?'), o: [T('No poder atendre tots els clients nous'), T('Despeses fixes que superen els ingressos'), T('Perdre la cultura de l\'empresa'), T('Que la competència copiï el model')], c: 1, why: T('La tresoreria pot no aguantar.') },
      { q: T('Créixer amb beneficis propis és…'), o: [T('Més lent però dona més control'), T('Més ràpid perquè no depens de ningú'), T('Més arriscat perquè poses els teus diners'), T('Només possible en empreses grans')], c: 0, why: T('No hi ha una resposta universal: depèn del mercat i del risc que vols assumir.') },
      { q: T('Cas real · WeWork. Va créixer molt de pressa signant lloguers d\'oficines a llarg termini amb diners d\'inversors. El 2019 va cancel·lar la sortida a borsa i el 2023 va entrar en fallida. Quin va ser el problema principal?'), o: [T('Massa competència d\'altres empreses'), T('Uns costos fixos enormes que els ingressos no cobrien'), T('La falta de clients interessats'), T('Una mala estratègia a les xarxes socials')], c: 1, why: T('Créixer amb diners externs no elimina el risc: si les despeses fixes superen els ingressos, la caixa s\'esgota.') },
      { q: T('Cas real · Mailchimp. Va créixer durant 20 anys sense inversors, amb els seus propis beneficis, i el 2021 la va comprar Intuit per uns 12.000 milions de dòlars. Què mostra?'), o: [T('Que créixer amb beneficis propis pot ser més lent però dona control i pot funcionar molt bé'), T('Que sense inversors no es pot créixer'), T('Que sempre és millor que buscar inversors'), T('Que les empreses sense inversors no paguen impostos')], c: 0, why: T('No hi ha una resposta universal, però el creixement propi evita cedir el control i les pressions d\'un inversor.') }
    ]
  },
  L_marca: {
    area: 'marca', title: T('La marca de l\'agència'),
    goal: T('Definir quins clients vols atraure i quins rebutges.'),
    body: [
      T('La <b>marca corporativa</b> és la promesa que fas al mercat. Una promesa clara atrau els clients adequats i n\'allunya d\'altres: això és bo.'),
      T('La coherència entre el que dius i el que fas és clau. Si dius «resultats mesurables», els teus informes han de ser rigorosos.'),
      T('Decidir quins projectes <b>rebutges</b> és tan important com decidir quins acceptes.')
    ],
    example: T('«Fem créixer els negocis d\'Osona amb dades i proximitat» atrau comerços i pimes locals, i deixa clar que no és una agència de grans campanyes de televisió.'),
    errors: [T('Voler agradar a tothom.'), T('Promeses que l\'equip no pot complir.'), T('Canviar de posicionament cada any.')],
    quiz: [
      { q: T('Una marca clara…'), o: [T('Fa que tothom la reconegui i la recordi'), T('Atrau els clients adequats i n\'allunya d\'altres'), T('Permet cobrar més a qualsevol client'), T('Evita haver de fer publicitat')], c: 1, why: T('Filtra i redueix el cost de captar clients que encaixen.') },
      { q: T('Si promets «resultats mesurables»…'), o: [T('Has de ser rigorós en els informes'), T('Has de mostrar sobretot el creixement de seguidors'), T('Has de garantir resultats per contracte'), T('N\'hi ha prou amb un informe a final d\'any')], c: 0, why: T('La marca es demostra amb fets.') },
      { q: T('Rebutjar projectes que no encaixen…'), o: [T('Fa perdre ingressos que l\'agència necessita'), T('Reforça el posicionament i protegeix l\'equip'), T('Només té sentit quan l\'agència és gran'), T('Dona mala imatge davant dels clients')], c: 1, why: T('Focalitza recursos on aportes més valor.') },
      { q: T('Cas real · Patagonia (2011). El Black Friday va publicar un anunci al New York Times que deia «Don\'t buy this jacket» (No compris aquesta jaqueta). Què aconsegueix?'), o: [T('Reduir l\'estoc de jaquetes'), T('Reforçar uns valors clars que atrauen el seu públic i n\'allunyen d\'altres'), T('Vendre més durant el Black Friday'), T('Criticar la competència')], c: 1, why: T('Una marca amb valors clars connecta amb qui els comparteix. Patagonia defensa el consum responsable.') },
      { q: T('Cas real · Volkswagen (2015). Anunciava el «dièsel net», però es va descobrir que manipulava les proves d\'emissions. Què li va passar a la marca?'), o: [T('Res, perquè els cotxes funcionaven bé'), T('Va guanyar notorietat i va vendre més'), T('Va perdre confiança i va pagar milers de milions en sancions'), T('Només la va afectar als Estats Units')], c: 2, why: T('Si la promesa de marca no es compleix, la confiança cau en picat. La marca es demostra amb fets.') }
    ]
  },
  L_ltv: {
    area: 'creixement', title: T('Retenció: LTV i CAC'),
    goal: T('Entendre per què mantenir un client val més que captar-ne un de nou.'),
    body: [
      T('El <b>valor de vida del client (LTV)</b> és el marge total que deixa un client durant tota la relació: marge mensual × mesos que es queda.'),
      T('El <b>CAC</b> és el que costa aconseguir-lo. Un negoci sa té un LTV clarament superior al CAC (sovint s\'usa com a referència orientativa una relació de 3 a 1).'),
      T('Per retenir: revisar objectius periòdicament, demostrar valor amb dades, escoltar objeccions i ajustar el servei abans que el client decideixi marxar.')
    ],
    example: T('Un client deixa 400 €/mes de marge i es queda 24 mesos: LTV = 9.600 €. Si costa 1.200 € captar-lo, la relació LTV/CAC és 8.'),
    errors: [T('Dedicar tota l\'energia a captar i oblidar els clients actuals.'), T('Esperar la renovació per parlar de resultats.')],
    quiz: [
      { q: T('Marge de 300 €/mes durant 20 mesos. Quin és el LTV?'), o: [T('6.000 €'), T('3.000 €'), T('320 €'), T('15 €')], c: 0, why: '300 × 20 = 6.000 €.' },
      { q: T('LTV 2.000 €, CAC 2.500 €. Què passa?'), o: [T('Es perden diners amb cada client nou'), T('Es guanyen 500 € per client'), T('És normal: el LTV sempre és més baix que el CAC'), T('Només és un problema si el client marxa aviat')], c: 0, why: T('Costa més captar el client del que deixa.') },
      { q: T('Quan has de parlar de resultats amb un client?'), o: [T('Quan s\'acaba el contracte i cal renovar-lo'), T('Periòdicament, amb objectius revisats'), T('Quan els resultats són bons'), T('Quan el client ho demana')], c: 1, why: T('La retenció es construeix cada mes.') },
      { q: T('Cas real · Amazon Prime. Els socis paguen una quota anual i reben enviaments ràpids gratuïts i vídeo. Quin efecte busca Amazon sobretot?'), o: [T('Guanyar diners amb el vídeo'), T('Que els clients comprin més sovint i durant més temps (més LTV)'), T('Reduir el cost dels enviaments'), T('Captar clients nous més barats')], c: 1, why: T('Un client que ja ha pagat la quota tendeix a concentrar les compres a Amazon: augmenta la freqüència i la retenció.') },
      { q: T('Cas real · Spotify Wrapped. Cada desembre, Spotify ensenya a cada usuari el seu resum musical de l\'any i milions de persones el comparteixen. Quin objectiu principal té?'), o: [T('Vendre publicitat als artistes'), T('Reforçar el vincle dels usuaris actuals i, de pas, atraure\'n de nous'), T('Recollir dades que no tenia'), T('Substituir les campanyes d\'anuncis')], c: 1, why: T('Fer sentir valorat qui ja és client augmenta la retenció, i compartir-ho fa de publicitat gratuïta.') }
    ]
  },

  /* ---------- ETAPA 7 ---------- */
  L_internacional: {
    area: 'avancat', title: T('Màrqueting internacional i localització'),
    goal: T('Adaptar una estratègia a un mercat nou.'),
    body: [
      T('Traduir no és <b>localitzar</b>. Cal adaptar missatges, referències culturals, preus, mètodes de pagament, logística i atenció al client.'),
      T('El <b>SEO multilingüe</b> requereix investigar les paraules que fa servir la gent de cada país (no les traduccions literals) i indicar als cercadors la versió de cada idioma.'),
      T('Abans d\'invertir fort: investiga la <b>demanda</b>, la <b>competència</b> local i la capacitat de servei (enviaments, devolucions, idioma).')
    ],
    example: T('Una marca de cosmètica descobreix que a França els compradors busquen «cosmétique naturelle certifiée bio» i valoren molt les certificacions, més que l\'origen.'),
    errors: [T('Traducció automàtica sense revisió.'), T('Mateixos preus i missatges a tots els mercats.'), T('Oblidar la logística i les devolucions.')],
    quiz: [
      { q: T('Localitzar vol dir…'), o: [T('Traduir els textos amb un traductor professional'), T('Adaptar missatge, preus, pagament i servei al mercat'), T('Obrir una oficina al país de destinació'), T('Fer servir el domini del país (.fr, .de...)')], c: 1, why: T('Cada mercat té hàbits i expectatives diferents.') },
      { q: T('Per al SEO en un altre idioma…'), o: [T('Tradueixes les paraules clau que ja funcionen aquí'), T('Investigues com busca la gent d\'aquell país'), T('Fas servir les mateixes paraules clau en anglès'), T('Copies les paraules clau del competidor local')], c: 1, why: T('Les cerques reals no coincideixen amb les traduccions.') },
      { q: T('Què has de comprovar abans d\'una gran campanya internacional?'), o: [T('Demanda, competència i capacitat de servei'), T('Pressupost, idioma i xarxes socials del país'), T('Preus, impostos i tipus de canvi'), T('Competència, influencers i festius locals')], c: 0, why: T('Sense capacitat de servei, l\'èxit es converteix en un problema.') },
      { q: T('Cas real · Walmart a Alemanya. Va entrar el 1997 amb el mateix model dels Estats Units (salutacions a la porta, somriures obligatoris, bossa feta pel personal) i el 2006 se\'n va anar amb grans pèrdues. Què va fallar?'), o: [T('Els preus eren massa baixos'), T('No va adaptar l\'experiència als hàbits i la cultura del país'), T('No va traduir bé la web'), T('Va obrir poques botigues')], c: 1, why: T('Localitzar és adaptar el servei i el tracte, no només la llengua.') },
      { q: T('Cas real · McDonald\'s a l\'Índia. No ven hamburgueses de vedella i ofereix el McAloo Tikki, de patata i espècies. Què fa?'), o: [T('Localitzar el producte als hàbits i creences del mercat'), T('Abaixar costos amb ingredients més barats'), T('Fer una campanya temporal de novetats'), T('Copiar la carta d\'un competidor local')], c: 0, why: T('La marca és global, però la carta s\'adapta a cada país.') }
    ]
  },
  L_experiments: {
    area: 'analitica', title: T('Proves de mercat i mostres petites'),
    goal: T('No treure conclusions precipitades de poques dades.'),
    body: [
      T('Una <b>prova de mercat</b> és una inversió petita per aprendre abans d\'apostar fort. Defineix abans què mesuraràs i quin resultat et faria continuar.'),
      T('Amb <b>mostres petites</b> l\'atzar pesa molt: 3 vendes contra 1 no demostra que un mercat sigui el triple de bo. Cal un volum mínim de dades o repetir la prova.'),
      T('Compara mercats amb el mateix indicador i el mateix període.')
    ],
    example: T('França: 12 vendes amb 1.000 €. Bèlgica: 4 vendes amb 300 €. El CPA és semblant (83 € vs 75 €); no hi ha prou dades per dir que Bèlgica és millor.'),
    errors: [T('Declarar guanyador després de dos dies.'), T('Canviar diverses variables alhora.'), T('No definir el criteri d\'èxit abans.')],
    quiz: [
      { q: T('Anunci A: 2 vendes. Anunci B: 1 venda. Conclusió?'), o: [T('A és el doble de bo que B'), T('No hi ha prou dades'), T('A és millor, però només una mica'), T('Cal invertir tot el pressupost en A')], c: 1, why: T('Amb tan poques dades, la diferència pot ser atzar.') },
      { q: T('Quan defineixes el criteri d\'èxit d\'una prova?'), o: [T('Abans de començar'), T('A meitat de la prova, amb les primeres dades'), T('Quan acaba la prova'), T('Quan el client veu els resultats')], c: 0, why: T('Així evites interpretar les dades a conveniència.') },
      { q: T('Per comparar dos mercats…'), o: [T('Fes servir el mateix indicador i període'), T('Fes servir el mateix pressupost als dos'), T('Compara el mercat que més ha venut'), T('Fes servir indicadors diferents adaptats a cada mercat')], c: 0, why: T('Només així la comparació és justa.') },
      { q: T('Cas real · Google (2009). Per triar el blau dels enllaços, Google va provar 41 tons diferents amb usuaris reals. Per què una empresa petita no pot fer el mateix?'), o: [T('Perquè les proves A/B són il·legals per a empreses petites'), T('Perquè amb poques visites les diferències petites no són fiables'), T('Perquè els colors no influeixen en els clics'), T('Perquè cal pagar Google per fer proves')], c: 1, why: T('Google té milions de visites i pot detectar diferències mínimes. Amb poques dades, cal provar canvis grans.') },
      { q: T('Cas real · Booking.com. Té centenars d\'experiments en marxa alhora i qualsevol canvi a la web s\'ha de provar abans de quedar-se. Què n\'aprens?'), o: [T('Que cal canviar la web cada setmana'), T('Que les opinions de l\'equip no compten mai'), T('Que les decisions es prenen amb proves i criteris fixats abans, no amb intuïcions'), T('Que els experiments només serveixen a les agències de viatges')], c: 2, why: T('Una cultura d\'experiments evita discussions d\'opinió: guanya el que funciona amb el públic real.') }
    ]
  },
  L_lideratge: {
    area: 'direccio', title: T('Lideratge i estructura'),
    goal: T('Fer que l\'empresa funcioni sense que tot passi per tu.'),
    body: [
      T('Quan l\'equip creix, el director ha de passar de <b>fer</b> a <b>fer que es faci</b>: definir objectius compartits, rols clars i responsables per àrea.'),
      T('Els <b>objectius per equip</b> han d\'estar alineats amb l\'estratègia de l\'empresa i tenir indicadors.'),
      T('Gestionar talent inclou feedback periòdic, formació, reconeixement i càrregues de feina sostenibles.')
    ],
    example: T('L\'agència crea tres responsables (estratègia, analítica i creativitat) amb objectius trimestrals. {En} deixa de revisar cada peça i es dedica a clients grans i direcció.'),
    errors: [T('Microgestionar-ho tot.'), T('Rols ambigus.'), T('Sobrecarregar les persones més competents.')],
    quiz: [
      { q: T('Quin és el canvi principal del director quan l\'equip creix?'), o: [T('Revisar personalment totes les feines abans d\'entregar-les'), T('Passar de fer les tasques a dirigir i definir objectius'), T('Contractar perfils sèniors per a cada àrea'), T('Dedicar més temps a captar clients nous')], c: 1, why: T('Si tot passa per tu, ets el coll d\'ampolla.') },
      { q: T('Un objectiu d\'equip ha de ser…'), o: [T('Alineat amb l\'estratègia i mesurable'), T('Ambiciós, encara que no es pugui mesurar'), T('El mateix per a cada persona de l\'equip'), T('Decidit per l\'equip sense la direcció')], c: 0, why: T('L\'equip ha de saber cap a on va i com es mesura.') },
      { q: T('Què és un risc en equips que creixen?'), o: [T('Sobrecarregar els més competents'), T('Tenir massa reunions de seguiment'), T('Que la gent demani més formació'), T('Que els rols siguin massa definits')], c: 0, why: T('Porta a esgotament i a perdre talent.') },
      { q: T('Cas real · Google, «Project Aristotle». Google va estudiar què fa que un equip funcioni bé. Quin va ser el factor més important?'), o: [T('Tenir les persones amb més talent'), T('La seguretat psicològica: poder opinar i equivocar-se sense por'), T('Que tots tinguin la mateixa formació'), T('Que l\'equip sigui molt gran')], c: 1, why: T('Si la gent té por de parlar, els problemes s\'amaguen fins que és tard.') },
      { q: T('Cas real · Spotify. Per créixer sense perdre agilitat, va organitzar la feina en equips petits i autònoms («squads») agrupats per àrees. Quina idea hi ha al darrere?'), o: [T('Que cada equip decideixi els objectius de l\'empresa'), T('Equips petits amb autonomia, alineats amb objectius comuns'), T('Eliminar els caps per estalviar costos'), T('Que tothom faci de tot')], c: 1, why: T('L\'autonomia funciona quan tothom sap cap a on va l\'empresa i com es mesura.') }
    ]
  },
  L_ia: {
    area: 'avancat', title: T('IA responsable i governança de dades'),
    goal: T('Fer servir la intel·ligència artificial amb qualitat, transparència i respecte.'),
    body: [
      T('La IA pot accelerar tasques: esborranys de textos, variacions d\'anuncis, resums d\'informes, classificació de dades. Però pot cometre errors, inventar dades o reproduir biaixos.'),
      T('Principis: <b>supervisió humana</b> de tot el que es publica, <b>no introduir dades personals</b> de clients en eines sense garanties, <b>transparència</b> quan el contingut ho requereixi, i respecte dels <b>drets d\'autor</b> i de la imatge de les persones.'),
      T('La IA no substitueix l\'estratègia ni el coneixement del client: és una eina per dedicar més temps a pensar.')
    ],
    example: T('L\'agència usa IA per generar 20 variants de títols, però una persona les revisa, en tria 4 i comprova que no fan promeses falses abans de provar-les.'),
    errors: [T('Publicar sense revisar.'), T('Pujar dades de clients a eines públiques.'), T('Fer servir la imatge o la veu d\'algú sense permís.')],
    quiz: [
      { q: T('Quin ús de la IA és responsable?'), o: [T('Fer servir la IA per escriure tots els textos i publicar-los si sonen bé'), T('Generar esborranys que una persona revisa i valida'), T('Deixar que la IA respongui les ressenyes sense supervisió'), T('Fer servir la IA només per a imatges i mai per a textos')], c: 1, why: T('La supervisió humana garanteix qualitat i veracitat.') },
      { q: T('Pots introduir la base de dades de clients en una eina d\'IA qualsevol?'), o: [T('Sí, si després esborres l\'historial de l\'eina'), T('No sense garanties de protecció de dades i base legal'), T('Sí, si l\'eina és d\'una empresa coneguda'), T('Sí, si només hi poses els noms i no els telèfons')], c: 1, why: T('Les dades personals estan protegides.') },
      { q: T('Què NO hauria de delegar-se a la IA?'), o: [T('La redacció dels primers esborranys'), T('La decisió estratègica i la responsabilitat davant del client'), T('L\'anàlisi de les dades de la campanya'), T('La traducció dels textos a altres idiomes')], c: 1, why: T('L\'estratègia i la responsabilitat són humanes.') },
      { q: T('Cas real · Air Canada (2024). El chatbot de la web va donar informació falsa sobre un descompte i un tribunal va obligar l\'aerolínia a complir-la. Què en treus?'), o: [T('Que els chatbots no són legals'), T('Que l\'empresa és responsable del que diu la seva IA'), T('Que la culpa va ser del proveïdor del chatbot'), T('Que cal posar un avís i així no hi ha responsabilitat')], c: 1, why: T('La IA no treu la responsabilitat: cal supervisar-la i revisar el que diu als clients.') },
      { q: T('Cas real · Samsung (2023). Uns enginyers van enganxar codi confidencial a ChatGPT per revisar-lo, i l\'empresa va restringir l\'ús d\'eines d\'IA generativa. Quin risc havien corregut?'), o: [T('Compartir informació confidencial amb un servei extern sense garanties'), T('Que la IA escrivís codi amb errors'), T('Que la IA fos massa lenta'), T('Que la IA no entengués el codi en coreà')], c: 0, why: T('Abans de posar dades d\'empresa o de clients en una IA, cal saber on van i amb quines garanties.') }
    ]
  }
};
