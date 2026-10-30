/* Agència Digital — temari del mòdul i etiquetatge dels continguts del joc.
   Cada lliçó, projecte, missió, nivell del Taller web i acció del món porta els punts del temari que treballa,
   i el professorat ho veu al panell i al CSV. Aquí també hi ha les lliçons i missions afegides per cobrir tot el temari. */
window.GD = window.GD || {};

GD.temariBlocks = {
  1: T("Aplicació de les directrius del pla de màrqueting digital"),
  2: T("Realització d'accions de compravenda en línia"),
  3: T("Realització del manteniment de la pàgina web"),
  4: T("Establiment i gestió de relacions amb altres usuaris de la xarxa"),
  5: T("Ús d'entorns web 2.0")
};
GD.temari = [
  ['1.1', T("Pla de màrqueting digital")],
  ['1.2', T("Alta en cercadors i en directoris especialitzats")],
  ['1.3', T("Característiques específiques del client en línia")],
  ['1.4', T("Butlletins electrònics enviats amb e-mail màrqueting")],
  ['1.5', T("Disseny de blogs corporatius: modalitats i objectius")],
  ['1.6', T("Màrqueting en cercadors: SEM, SEO i campanyes en pàgines afins")],
  ['1.7', T("Normativa sobre comunicacions electròniques i privacitat")],
  ['1.8', T("Pagaments amb diners electrònics i pagaments en línia")],
  ['1.9', T("Màrqueting d'afiliació")],
  ['1.10', T("Màrqueting relacional i gestió de la relació amb els clients (CRM)")],
  ['1.11', T("Cross màrqueting")],
  ['1.12', T("Màrqueting viral")],
  ['1.13', T("Màrqueting one-to-one")],
  ['1.14', T("Màrqueting mòbil i TDT. Banca mòbil. Pagament amb el mòbil")],
  ['1.15', T("Internet TV, videoblogs i web TV")],
  ['2.1', T("Idea i disseny d'una botiga virtual")],
  ['2.2', T("Catàleg de productes en línia")],
  ['2.3', T("Selecció i registre de domini")],
  ['2.4', T("Models de negoci digital: portals horitzontals, B2B i B2C")],
  ['2.5', T("Aparador web. Catàleg electrònic")],
  ['2.6', T("Control logístic de les mercaderies venudes en línia")],
  ['2.7', T("La reclamació com a instrument de fidelització del client")],
  ['2.8', T("Mitjans de pagament electrònic")],
  ['2.9', T("Períodes de reflexió i cancel·lacions")],
  ['2.10', T("Seguretat en les transaccions: xifratge, firma digital, certificats digitals i DNI electrònic")],
  ['2.11', T("Encriptació")],
  ['2.12', T("Negocis electrònics: e-procurement, e-shop, e-mail, e-marketplace i e-auction")],
  ['3.1', T("Estructura d'una pàgina web corporativa")],
  ['3.2', T("El llenguatge HTML")],
  ['3.3', T("Creació de pàgines web amb els editors web més habituals")],
  ['3.4', T("Elecció del servidor per allotjar pàgines web")],
  ['3.5', T("Publicació de pàgines web via FTP")],
  ['3.6', T("Alta en cercadors")],
  ['3.7', T("Programes de disseny gràfic i altres utilitats per al web")],
  ['3.8', T("Catàleg en línia")],
  ['3.9', T("Fluxos de caixa de la botiga en línia")],
  ['3.10', T("Zones calentes i zones d'usuari")],
  ['3.11', T("El carretó de la compra en línia")],
  ['4.1', T("Grups de conversa o xat: IRC i webxat")],
  ['4.2', T("Servei de missatgeria instantània")],
  ['4.3', T("Telefonia per Internet")],
  ['4.4', T("Els fòrums: llegir i escriure en un fòrum")],
  ['4.5', T("Els grups de discussió")],
  ['4.6', T("Xarxes socials")],
  ['4.7', T("Weblogs, blogs i altres eines de comunicació")],
  ['4.8', T("Xarxes socials per a empreses")],
  ['4.9', T("Afegir elements a una pàgina d'una xarxa social")],
  ['4.10', T("Elements fotogràfics i audiovisuals en una pàgina d'una xarxa social")],
  ['4.11', T("Afegir aplicacions professionals a una pàgina")],
  ['4.12', T("Com buscar un grup interessant")],
  ['4.13', T("Crear una xarxa de contactes influents")],
  ['4.14', T("Comprar i vendre en xarxes socials")],
  ['5.1', T("Web 2.0: concepte i característiques")],
  ['5.2', T("Funcionalitats: opinions i fòrums d'usuaris")],
  ['5.3', T("Reputació corporativa en línia")],
  ['5.4', T("Objectius a assolir en la web 2.0")],
  ['5.5', T("Eines del màrqueting en línia de la web 2.0")],
  ['5.6', T("Webs integrats")],
  ['5.7', T("Xarxes socials que integren els consumidors com a prescriptors")],
  ['5.8', T("Consumidors proactius: opinions, ofertes creuades i comparatives")],
  ['5.9', T("Implementació d'estratègies de seguretat informàtica")]
];
GD.temariTitle = (c) => (GD.temari.find(x => x[0] === c) || [])[1] || c;

// Etiquetes dels continguts que ja existien
GD.codes = {
  lessons: {
    L_mkt: ['1.1'], L_recerca: ['1.1', '1.3'], L_smart: ['1.1'], L_metriques: ['1.1', '1.6'], L_ads1: ['1.6'], L_seolocal: ['1.2', '1.6', '5.2', '5.3'],
    L_b2b: ['2.4', '1.10'], L_seo: ['1.6', '3.6'], L_ecom: ['2.1', '2.2', '3.11'], L_xarxes: ['4.6', '4.8'], L_kpi: ['1.1', '3.10'], L_prospeccio: ['1.10'],
    L_posicionament: ['1.1'], L_brief: ['4.10'], L_crm: ['1.10', '1.4', '1.7'], L_ads2: ['1.6'], L_crisi: ['5.3', '5.2'], L_atribucio: ['1.6', '1.9'],
    L_tresoreria: ['3.9'], L_fin: ['3.9'], L_marca: ['5.3'], L_ltv: ['1.10'], L_internacional: ['1.3', '2.1'], L_experiments: ['1.1'], L_ia: ['5.9', '1.7']
  },
  projects: {
    'pla-forn': ['1.1', '1.3'], 'campanya-forn': ['1.6', '4.10'], 'local-jordi': ['1.2', '3.6', '5.2', '5.3'], 'b2b-miquel': ['1.6', '2.4', '4.8'],
    'ecommerce-nuria': ['2.1', '2.2', '1.4', '2.6', '2.9', '3.11'], 'kpi-sergi': ['1.1', '3.10'], 'pitch-coop': ['1.1'], 'proposta-quim': ['2.4'],
    'continguts-berta': ['4.6', '4.9', '4.10', '1.5'], 'processos-julia': ['4.2'], 'auditoria-nuria': ['1.6', '3.11', '3.9'], 'crisi-jordi': ['5.3', '5.2', '2.7'],
    'informe-marta': ['1.1'], 'marca-agencia': ['5.3', '3.7'], 'franca-amelie': ['1.3', '1.6'], 'ia-berta': ['5.9', '1.7'], 'portafoli-final': ['3.1', '4.7']
  },
  web: { 1: ['3.1', '3.3', '3.4'], 2: ['3.1', '3.6', '1.6'], 3: ['3.1', '2.4'], 4: ['2.1', '2.2', '2.5', '3.8', '3.11', '2.8', '2.9'], 5: ['1.4', '1.6', '1.7', '3.10'], 6: ['3.1', '3.7', '5.9'], 7: ['1.7', '1.3'], 8: ['1.15', '3.10'] },
  actions: { fitxa: ['1.2', '3.6'], fotos: ['3.7', '4.10'], cupons: ['1.13', '1.11'], ressenyes: ['5.2', '5.7', '2.7'], cartell: ['2.5', '3.7'] },
  problems: { montse: ['1.2'], bar: ['1.2', '1.3'], parada: ['4.2', '4.14', '2.12'], marisa: ['4.2', '1.14'] }
};

// Personatges nous de les missions del temari
Object.assign(ART.CHARS, {
  sara: { name: T('Sara'), skin: '#f6d8c8', hair: '#3a2a20', hi: '#6a5040', eye: '#2f6a8a', style: 'pony', outfit: 'shirt', oc: '#5ac8e8', acc: ['glassesRound'] },
  laura: { name: T('Laura'), skin: '#f2cfb3', hair: '#e2a040', hi: '#ffd890', eye: '#3f7a3a', style: 'pony', outfit: 'hoodie', oc: '#2f9a6e' },
  mireia: { name: T('Mireia'), skin: '#fbe1cf', hair: '#8a3a2a', hi: '#c06a50', eye: '#5a3fa0', style: 'wavy', outfit: 'cardigan', oc: '#e07a4a' },
  pere: { name: T('Pere'), skin: '#efcdb2', hair: '#c8c8d0', hi: '#ffffff', eye: '#3c5a80', style: 'neat', outfit: 'cardigan', oc: '#7a5a3a', acc: ['glassesRect'], age: 1 },
  ivan: { name: T('Iván'), skin: '#e8be9c', hair: '#1a1a1a', hi: '#4a4a4a', eye: '#4b2e1c', style: 'buzz', outfit: 'shirt', oc: '#7a1f3d' },
  elena: { name: T('Elena'), skin: '#f7dccb', hair: '#26313f', hi: '#55657a', eye: '#3a5a2a', style: 'bob', outfit: 'blazer', oc: '#3a4a5a', acc: ['earrings'] },
  neus: { name: T('Neus'), skin: '#fae3d3', hair: '#5a3b2a', hi: '#8c6450', eye: '#7a4a2a', style: 'long', outfit: 'shirt', oc: '#d65a8a' },
  oriol: { name: T('Oriol'), skin: '#f4d2b6', hair: '#7a4a2a', hi: '#a8744c', eye: '#3a5a2a', style: 'neat', outfit: 'polo', oc: '#3d6fb8' },
  pilar: { name: T('Pilar'), skin: '#f3d0b4', hair: '#b0b0b8', hi: '#e0e0e8', eye: '#5a3a20', style: 'bob', outfit: 'blazer', oc: '#2f9a6e', age: 1 },
  xavi: { name: T('Xavi'), skin: '#eec7a6', hair: '#4a2f22', hi: '#7a5444', eye: '#2d4a6a', style: 'spiky', outfit: 'hoodie', oc: '#1d1b2b', acc: ['sunglasses'] }
});
Object.assign(GD.names, { sara: T('Sara'), laura: T('Laura'), mireia: T('Mireia'), pere: T('Pere'), ivan: T('Iván'), elena: T('Elena'), neus: T('Neus'), oriol: T('Oriol'), pilar: T('Pilar'), xavi: T('Xavi') });

/* ============================================================
   LLIÇONS NOVES (per cobrir tot el temari)
   ============================================================ */
const L = (id, o) => { GD.lessons[id] = o; GD.codes.lessons[id] = o.codes; };

L('L_directoris', {
  area: 'seo', codes: ['1.2', '3.6'], title: T("Alta en cercadors i directoris"),
  goal: T("Fer que els cercadors i els directoris trobin, entenguin i mostrin bé una empresa."),
  body: [
    T("Els cercadors troben les webs sols, però és millor <b>donar-les d'alta</b>: a Google Search Console i a Bing Webmaster Tools s'hi verifica el domini, s'envia el <b>mapa del lloc (sitemap.xml)</b> i es veuen els errors d'indexació i les cerques per les quals apareix la web."),
    T("Per als negocis locals és imprescindible la fitxa de <b>Google Business Profile</b> (i Apple Maps i Bing Places). A més hi ha <b>directoris generals</b> (Pàgines Grogues, cambres de comerç) i <b>especialitzats</b> per sector: TripAdvisor o TheFork per a restaurants, Doctoralia per a clíniques, Booking per a allotjaments, Habitaclia per a immobiliàries..."),
    T("La clau és la coherència <b>NAP</b> (nom, adreça i telèfon iguals a tot arreu), triar bé la categoria i mantenir horaris, fotos i ressenyes al dia. Un directori desactualitzat fa més mal que no ser-hi.")
  ],
  example: T("Una clínica dental verifica la web a Search Console, hi envia el sitemap, completa la fitxa de Google i s'apunta a Doctoralia amb el mateix nom, adreça i telèfon. En un mes, les reserves des del mòbil es dupliquen."),
  errors: [T("Pagar per sortir en centenars de directoris de poca qualitat."), T("Tenir telèfons o adreces diferents en cada directori."), T("No enviar el sitemap ni mirar mai els errors d'indexació.")],
  quiz: [
    { q: T("Per a què serveix Google Search Console?"), o: [T("Per fer anuncis de pagament"), T("Per verificar la web, enviar el sitemap i veure com apareix als resultats"), T("Per dissenyar la web")], c: 1, why: T("És l'eina gratuïta per comunicar-se amb Google i controlar la indexació.") },
    { q: T("Quin directori especialitzat és el més adequat per a un restaurant?"), o: [T("Doctoralia"), T("TheFork o TripAdvisor"), T("Habitaclia")], c: 1, why: T("Cada sector té els seus directoris: els comensals busquen a TheFork i TripAdvisor.") },
    { q: T("Què vol dir mantenir la coherència NAP?"), o: [T("Que nom, adreça i telèfon siguin idèntics a tots els directoris"), T("Publicar a totes les xarxes alhora"), T("Tenir un nom de domini curt")], c: 0, why: T("Les dades coherents generen confiança als cercadors i als clients.") }
  ]
});
L('L_sem', {
  area: 'ads', codes: ['1.6'], title: T("SEO, SEM i campanyes en pàgines afins"),
  goal: T("Distingir el posicionament orgànic, els anuncis als cercadors i la publicitat en webs relacionades."),
  body: [
    T("El <b>SEO</b> (Search Engine Optimization) busca aparèixer als resultats orgànics: contingut útil, paraules clau, velocitat, estructura i enllaços. És lent però no es paga per clic. El <b>SEM</b> (Search Engine Marketing) són els anuncis als cercadors (Google Ads, Microsoft Ads): es paga per clic i dona resultats immediats mentre hi ha pressupost."),
    T("Les <b>campanyes en pàgines afins</b> mostren anuncis en webs que visita el teu públic: la xarxa de display de Google, la publicitat nativa en diaris, els patrocinis en blogs del sector o el <b>remàrqueting</b>, que torna a impactar qui ja ha visitat la web."),
    T("Una bona estratègia combina les tres: SEO per al llarg termini, SEM per a les cerques amb intenció de compra i pàgines afins per guanyar notorietat i recuperar visitants.")
  ],
  example: T("Una botiga de bicis fa SEO amb guies de rutes per Osona, SEM per a «botiga bicis Vic» i remàrqueting a qui ha mirat una bici elèctrica sense comprar-la."),
  errors: [T("Pensar que el SEM millora el posicionament orgànic."), T("Fer display a tothom sense segmentar."), T("Abandonar el SEO quan les campanyes de pagament funcionen.")],
  quiz: [
    { q: T("Què és el SEM?"), o: [T("Optimitzar el contingut per als resultats orgànics"), T("Publicitat de pagament als cercadors"), T("Enviar butlletins")], c: 1, why: T("SEM són els anuncis als cercadors; SEO, el posicionament orgànic.") },
    { q: T("Què és el remàrqueting?"), o: [T("Tornar a mostrar anuncis a qui ja ha visitat la web"), T("Reescriure els textos de la web"), T("Fer màrqueting a la ràdio")], c: 0, why: T("Recupera visitants que coneixen la marca i encara no han comprat.") },
    { q: T("Quin avantatge principal té el SEO?"), o: [T("Resultats immediats"), T("No es paga per cada clic i els resultats duren"), T("Es pot fer sense contingut")], c: 1, why: T("És més lent, però el trànsit orgànic no depèn d'un pressupost diari.") }
  ]
});
L('L_domini', {
  area: 'web', codes: ['2.3', '3.4', '3.5'], title: T("Domini, allotjament i publicació per FTP"),
  goal: T("Triar i registrar un domini, escollir el servidor i publicar una web."),
  body: [
    T("El <b>domini</b> és l'adreça de la web (osonabikes.cat). Ha de ser curt, fàcil de dir i escriure, sense guions ni números innecessaris, i amb l'extensió adequada: <b>.cat</b> per al públic català, <b>.es</b> per a Espanya, <b>.com</b> per a l'internacional. Es registra en un <b>registrador</b> acreditat i es renova cada any; convé registrar-lo a nom de l'empresa."),
    T("L'<b>allotjament</b> (hosting) és el servidor on viu la web: <b>compartit</b> (barat, per a webs petites), <b>VPS o núvol</b> (més potència i control), <b>gestionat</b> (WordPress gestionat, Shopify, Wix: tot inclòs) o plataformes estàtiques (Netlify, GitHub Pages). Cal mirar velocitat, ubicació dels servidors, còpies de seguretat, certificat SSL i suport."),
    T("Per pujar els fitxers al servidor es fa servir <b>FTP</b> o, millor, <b>SFTP</b> (xifrat), amb programes com FileZilla: host, usuari, contrasenya i port. Avui moltes plataformes publiquen arrossegant una carpeta o connectant un repositori.")
  ],
  example: T("La botiga de bicis registra osonabikes.cat i osonabikes.com, contracta un allotjament gestionat amb SSL i còpies diàries i puja la web per SFTP amb FileZilla."),
  errors: [T("Registrar el domini a nom d'un proveïdor o d'un familiar."), T("Deixar caducar el domini perquè no es renova."), T("Fer servir FTP sense xifrar amb contrasenyes febles.")],
  quiz: [
    { q: T("Quin domini és millor per a una botiga de bicis de Vic amb clients catalans?"), o: [T("bicis-osona-barates-online24.net"), T("osonabikes.cat"), T("ob.xyz")], c: 1, why: T("Curt, clar i amb l'extensió del seu públic.") },
    { q: T("Què és l'allotjament web?"), o: [T("El servidor on es guarden i se serveixen els fitxers de la web"), T("El nom de la web"), T("Un programa de disseny")], c: 0, why: T("El domini és l'adreça; l'allotjament és on viu la web.") },
    { q: T("Per què és millor SFTP que FTP?"), o: [T("És més ràpid"), T("Xifra la connexió i protegeix les credencials"), T("No necessita usuari")], c: 1, why: T("L'FTP clàssic envia usuari i contrasenya sense xifrar.") }
  ]
});
L('L_html', {
  area: 'web', codes: ['3.1', '3.2', '3.3'], title: T("Estructura web, HTML i editors"),
  goal: T("Conèixer l'estructura d'una web corporativa, l'HTML bàsic i els editors més habituals."),
  body: [
    T("Una <b>web corporativa</b> sol tenir: inici (què fem i per a qui), qui som, serveis o productes, casos o opinions, blog, contacte, i les pàgines legals (avís legal, privacitat i galetes). El menú ha de ser simple i el contacte, a un clic."),
    T("L'<b>HTML</b> descriu l'estructura amb etiquetes: <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;footer&gt;</code>, títols de <code>&lt;h1&gt;</code> a <code>&lt;h6&gt;</code>, paràgrafs <code>&lt;p&gt;</code>, enllaços <code>&lt;a href&gt;</code> i imatges <code>&lt;img alt&gt;</code>. El CSS en defineix l'aspecte i el JavaScript, el comportament."),
    T("Els <b>editors</b> poden ser visuals (WYSIWYG: Wix, WordPress amb Elementor, Webflow, Dreamweaver en mode disseny) o de codi (Visual Studio Code, amb ajuda de la IA). Els visuals són ràpids; el codi dona més control i webs més lleugeres.")
  ],
  example: T("La pàgina d'inici de la botiga de bicis té un únic &lt;h1&gt; («Bicicletes i reparacions a Vic»), un &lt;nav&gt; amb cinc enllaços i imatges amb text alternatiu."),
  errors: [T("Fer servir diversos &lt;h1&gt; a la mateixa pàgina."), T("Oblidar el text alternatiu de les imatges."), T("Amagar el contacte en un menú secundari.")],
  quiz: [
    { q: T("Quina etiqueta HTML conté el menú de navegació?"), o: ['&lt;nav&gt;', '&lt;footer&gt;', '&lt;h1&gt;'], c: 0, why: T("&lt;nav&gt; agrupa els enllaços de navegació.") },
    { q: T("Per a què serveix l'atribut alt d'una imatge?"), o: [T("Per canviar-ne la mida"), T("Per descriure-la a cercadors i lectors de pantalla"), T("Per enllaçar-la")], c: 1, why: T("Millora l'accessibilitat i el SEO.") },
    { q: T("Quin d'aquests és un editor de codi?"), o: [T("Visual Studio Code"), T("Wix"), T("Canva")], c: 0, why: T("Wix és un editor visual i Canva, un programa de disseny gràfic.") }
  ]
});
L('L_clientonline', {
  area: 'mercat', codes: ['1.3'], title: T("El client en línia"),
  goal: T("Entendre com busca, compara i decideix el client digital."),
  body: [
    T("El client en línia és <b>multidispositiu</b> (comença al mòbil i acaba a l'ordinador o a la botiga), <b>impacient</b> (si la web triga més de tres segons, marxa) i <b>informat</b>: compara preus, llegeix opinions i demana recomanacions abans de comprar."),
    T("Molts fan <b>ROPO</b> (research online, purchase offline): busquen per internet i compren a la botiga física; i a l'inrevés (showrooming). Per això cal una experiència <b>omnicanal</b> coherent: mateix preu, mateixa informació i atenció a tots els canals."),
    T("També espera respostes ràpides (xat, WhatsApp), enviaments i devolucions fàcils, pagaments segurs i un tracte personalitzat. Cada generació i cada segment té hàbits propis: cal investigar-los, no suposar-los.")
  ],
  example: T("Un hotel rural descobreix que el 70 % de les visites arriben des del mòbil i que la gent llegeix les opinions de TripAdvisor abans de reservar: prioritza una reserva mòbil ràpida i respon totes les opinions."),
  errors: [T("Dissenyar només per a ordinador."), T("Ignorar les opinions dels altres compradors."), T("Tenir preus diferents a la web i a la botiga sense explicar-ho.")],
  quiz: [
    { q: T("Què és el ROPO?"), o: [T("Investigar en línia i comprar fora de línia"), T("Un tipus d'anunci"), T("Un mitjà de pagament")], c: 0, why: T("Research Online, Purchase Offline: la recerca digital influeix en la compra física.") },
    { q: T("Quina característica té el client en línia?"), o: [T("Compra sense comparar"), T("Compara preus i opinions abans de decidir"), T("No fa servir el mòbil")], c: 1, why: T("És un client informat i exigent.") },
    { q: T("Què vol dir una experiència omnicanal?"), o: [T("Ser a tots els canals amb informació i servei coherents"), T("Fer anuncis a la TV"), T("Tenir només botiga en línia")], c: 0, why: T("El client passa d'un canal a l'altre i espera coherència.") }
  ]
});
L('L_onetoone', {
  area: 'email', codes: ['1.13', '1.10'], title: T("Màrqueting one-to-one i relacional"),
  goal: T("Personalitzar la relació amb cada client a partir de les dades."),
  body: [
    T("El <b>màrqueting relacional</b> busca relacions duradores en lloc de vendes puntuals. El <b>one-to-one</b> en porta la idea al límit: tractar cada client com a únic, amb ofertes, missatges i moments adaptats al que sabem d'ell."),
    T("Funciona amb un <b>CRM</b> ben alimentat (compres, preferències, interaccions), <b>segmentació</b> i <b>automatització</b>: felicitacions d'aniversari, recomanacions segons l'historial, recordatoris de reposició o ofertes al client que fa temps que no torna."),
    T("Sempre amb <b>consentiment</b> i transparència: el client ha de saber quines dades es fan servir i per a què, i poder-se'n donar de baixa fàcilment.")
  ],
  example: T("L'hotel envia a cada client un correu abans de l'estada amb activitats segons els seus interessos: rutes en bici per als esportistes i el mercat de Vic per a qui ve amb nens."),
  errors: [T("Enviar el mateix missatge a tothom i dir-ne «personalització»."), T("Personalitzar amb dades que el client no ha autoritzat."), T("Tenir el CRM ple de dades velles o duplicades.")],
  quiz: [
    { q: T("Què caracteritza el màrqueting one-to-one?"), o: [T("Un missatge únic per a tothom"), T("Adaptar l'oferta i el missatge a cada client"), T("Fer només anuncis")], c: 1, why: T("La personalització individual és la base del one-to-one.") },
    { q: T("Quina eina és clau per fer one-to-one?"), o: [T("Un CRM amb dades de cada client"), T("Un cartell"), T("Un fax")], c: 0, why: T("Sense dades organitzades no es pot personalitzar.") },
    { q: T("Què cal per fer servir les dades d'un client?"), o: [T("Res, si les tenim"), T("El seu consentiment i informar-lo de l'ús"), T("Pagar-li")], c: 1, why: T("La normativa de protecció de dades ho exigeix.") }
  ]
});
L('L_mobil', {
  area: 'avancat', codes: ['1.14'], title: T("Màrqueting mòbil, TDT i pagament amb el mòbil"),
  goal: T("Conèixer les eines del màrqueting mòbil i els pagaments i la banca des del mòbil."),
  body: [
    T("El <b>màrqueting mòbil</b> inclou webs adaptades (mobile first), apps, notificacions push, SMS i missatgeria, codis QR, geolocalització (ofertes quan el client és a prop) i anuncis dins d'apps. El mòbil és personal: cal permís i missatges útils, no intrusius."),
    T("La <b>TDT</b> (televisió digital terrestre) i la TV connectada permeten publicitat interactiva (HbbTV: prémer el botó vermell per veure més informació) i anuncis segmentats a les plataformes de televisió en línia."),
    T("La <b>banca mòbil</b> permet gestionar comptes i fer transferències des de l'app del banc. El <b>pagament amb el mòbil</b> es fa amb NFC (Apple Pay, Google Pay), amb Bizum entre persones i comerços, o amb codis QR. Per al comerç vol dir cues més curtes i menys efectiu.")
  ],
  example: T("L'hotel envia per WhatsApp (amb permís) el codi d'entrada i un enllaç per pagar les activitats amb Bizum, i fa servir un QR a recepció per deixar opinions."),
  errors: [T("Enviar SMS comercials sense consentiment."), T("Fer una web que al mòbil obliga a fer zoom."), T("No acceptar pagaments amb el mòbil en un negoci amb públic jove.")],
  quiz: [
    { q: T("Què és l'HbbTV?"), o: [T("TV híbrida interactiva: continguts i publicitat interactius des del televisor"), T("Un tipus de SMS"), T("Una xarxa social")], c: 0, why: T("Permet interactuar amb la publicitat i els continguts de la TDT.") },
    { q: T("Quina tecnologia fa servir Apple Pay o Google Pay a la botiga?"), o: ['NFC', 'FTP', 'HTML'], c: 0, why: T("L'NFC permet pagar acostant el mòbil al datàfon.") },
    { q: T("Quina regla bàsica té el màrqueting mòbil?"), o: [T("Enviar molts missatges"), T("Tenir permís i aportar valor"), T("Fer servir només SMS")], c: 1, why: T("El mòbil és molt personal: sense permís i utilitat, molesta.") }
  ]
});
L('L_blog', {
  area: 'xarxes', codes: ['1.5', '4.7'], title: T("Blogs corporatius: modalitats i objectius"),
  goal: T("Decidir quin tipus de blog necessita una empresa i per a què."),
  body: [
    T("Un <b>blog corporatiu</b> és la secció de continguts d'una empresa. Modalitats: <b>institucional</b> (notícies de l'empresa), <b>de producte o servei</b> (guies i usos), <b>d'experts</b> (articles d'especialistes de l'empresa), <b>de comunitat</b> (hi escriuen clients o col·laboradors) i <b>intern</b> (per a l'equip)."),
    T("Objectius possibles: atraure trànsit des dels cercadors (SEO), demostrar coneixement i generar confiança, fidelitzar, captar contactes (amb descàrregues o subscripció) i donar contingut per a les xarxes i els butlletins."),
    T("Funciona amb un <b>calendari editorial</b>, temes que responen preguntes reals del públic, títols clars, imatges, enllaços interns i una crida a l'acció. Altres eines de comunicació semblants: videoblogs, podcasts i newsletters.")
  ],
  example: T("La llibreria fa un blog de comunitat on els clubs de lectura recomanen llibres, i cada article acaba amb un enllaç per reservar-los."),
  errors: [T("Publicar només notícies de l'empresa que no interessen a ningú."), T("Començar amb força i abandonar el blog al cap d'un mes."), T("No incloure cap crida a l'acció.")],
  quiz: [
    { q: T("Quin tipus de blog fa servir articles escrits pels clients?"), o: [T("Blog de comunitat"), T("Blog intern"), T("Blog institucional")], c: 0, why: T("El blog de comunitat dona veu als clients i col·laboradors.") },
    { q: T("Quin és un objectiu habitual d'un blog corporatiu?"), o: [T("Atraure trànsit orgànic i generar confiança"), T("Substituir la botiga"), T("Evitar les xarxes")], c: 0, why: T("El contingut útil posiciona i demostra coneixement.") },
    { q: T("Què cal per mantenir un blog viu?"), o: [T("Un calendari editorial realista"), T("Publicar cent articles el primer dia"), T("No mesurar res")], c: 0, why: T("La constància importa més que el volum inicial.") }
  ]
});
L('L_newsletter', {
  area: 'email', codes: ['1.4', '1.7'], title: T("Butlletins electrònics i e-mail màrqueting"),
  goal: T("Planificar, enviar i mesurar un butlletí electrònic legal i eficaç."),
  body: [
    T("Un <b>butlletí</b> (newsletter) s'envia periòdicament a persones que s'hi han <b>subscrit</b> amb consentiment explícit (millor amb doble opt-in: confirmen la subscripció per correu). Mai a llistes comprades."),
    T("Elements clau: <b>assumpte</b> breu i atractiu, text previ, remitent reconeixible, contingut útil, una crida a l'acció principal, disseny adaptat al mòbil i l'enllaç de <b>baixa</b> visible. Es fa amb eines com Mailchimp, Brevo o Acumbamail."),
    T("Es mesura amb la <b>taxa d'obertura</b>, la <b>taxa de clics</b>, les conversions, les baixes i els rebots. Segmentar la llista (interessos, compres) millora molt els resultats.")
  ],
  example: T("La llibreria envia un butlletí mensual amb les novetats per gènere; qui va comprar novel·la negra rep primer les novetats d'aquest gènere. L'obertura passa del 18 % al 34 %."),
  errors: [T("Comprar una llista de correus."), T("Amagar l'enllaç per donar-se de baixa."), T("Enviar-ho tot a tothom i massa sovint.")],
  quiz: [
    { q: T("Què és el doble opt-in?"), o: [T("Confirmar la subscripció amb un segon pas per correu"), T("Enviar dos correus al dia"), T("Tenir dues llistes")], c: 0, why: T("Garanteix que l'adreça és real i que la persona vol rebre els correus.") },
    { q: T("Quina mètrica indica quanta gent ha obert el butlletí?"), o: [T("Taxa d'obertura"), T("Taxa de rebot de la web"), T("CPC")], c: 0, why: T("La taxa d'obertura mesura les obertures sobre els enviaments.") },
    { q: T("Què ha d'incloure sempre un butlletí comercial?"), o: [T("Un enllaç per donar-se de baixa"), T("Un descompte"), T("Un vídeo")], c: 0, why: T("La normativa obliga a oferir una manera fàcil de deixar de rebre'l.") }
  ]
});
L('L_models', {
  area: 'web', codes: ['2.4', '2.5', '2.12'], title: T("Models de negoci digital i negocis electrònics"),
  goal: T("Distingir els models de negoci en línia i triar el més adequat."),
  body: [
    T("Segons qui ven a qui: <b>B2C</b> (empresa a consumidor), <b>B2B</b> (empresa a empresa), <b>C2C</b> (entre particulars, com Wallapop), <b>B2G</b> (a l'administració) i <b>C2B</b>. Segons el tipus de portal: <b>horitzontals</b> (generalistes, de tot per a tothom: Amazon) i <b>verticals</b> (especialitzats en un sector)."),
    T("Negocis electrònics: <b>e-shop</b> (botiga pròpia), <b>e-marketplace</b> (mercat on venen molts venedors: Amazon, Etsy), <b>e-procurement</b> (compres i proveïdors de les empreses en línia), <b>e-auction</b> (subhastes, com eBay), <b>e-mail</b> comercial i els portals de subscripció."),
    T("L'<b>aparador web</b> o <b>catàleg electrònic</b> mostra els productes amb fotos, descripcions i preus, amb o sense compra en línia: és el primer pas de molts comerços i és clau per al B2B.")
  ],
  example: T("La formatgeria ven al consumidor a la seva e-shop, als restaurants per una àrea B2B amb preus de professional i les edicions limitades en una subhasta anual."),
  errors: [T("Pensar que un marketplace no cobra comissions."), T("Fer servir el mateix catàleg i preus per a professionals i particulars."), T("No tenir cap aparador web perquè «no venem en línia».")],
  quiz: [
    { q: T("Amazon com a portal on es ven de tot és un portal..."), o: [T("horitzontal"), T("vertical"), T("B2G")], c: 0, why: T("Els portals horitzontals són generalistes.") },
    { q: T("Què és l'e-procurement?"), o: [T("La gestió de compres i proveïdors en línia entre empreses"), T("Una subhasta"), T("Un blog")], c: 0, why: T("Digitalitza el procés de compra de les empreses.") },
    { q: T("Una plataforma on molts venedors ofereixen productes és un..."), o: [T("e-marketplace"), T("e-mail"), T("aparador físic")], c: 0, why: T("El marketplace reuneix molts venedors i compradors.") }
  ]
});
L('L_normativa', {
  area: 'email', codes: ['1.7', '2.9'], title: T("Normativa: comunicacions electròniques, privacitat i consumidors"),
  goal: T("Aplicar la LSSI, el RGPD, la normativa de galetes i els drets dels consumidors en línia."),
  body: [
    T("La <b>LSSI-CE</b> obliga a identificar l'empresa a la web (avís legal amb raó social, NIF, adreça i contacte) i prohibeix enviar comunicacions comercials per correu o SMS sense <b>consentiment previ</b>, llevat de clients anteriors amb productes semblants i possibilitat de baixa."),
    T("El <b>RGPD</b> i la <b>LOPDGDD</b> regulen les dades personals: base legal per tractar-les, informació clara (política de privacitat), mínim de dades necessàries, seguretat i els drets d'accés, rectificació, supressió, oposició, limitació i portabilitat. Les <b>galetes</b> no necessàries requereixen consentiment, i rebutjar ha de ser tan fàcil com acceptar."),
    T("En les vendes a distància, el consumidor té un <b>dret de desistiment de 14 dies naturals</b> sense haver de justificar-ho (amb excepcions com els productes peribles o personalitzats), i s'ha d'informar de les condicions de venda, devolució i cancel·lació abans de comprar.")
  ],
  example: T("Una botiga revisa la web: afegeix l'avís legal, un bàner de galetes amb el botó «Rebutjar», casella de consentiment no marcada al formulari i la informació del desistiment a les condicions de venda."),
  errors: [T("Casella de consentiment marcada per defecte."), T("Carregar Google Analytics abans que l'usuari accepti les galetes."), T("No informar del dret de desistiment.")],
  quiz: [
    { q: T("Quants dies té el consumidor per desistir d'una compra en línia?"), o: [T("7 dies"), T("14 dies naturals"), T("30 dies hàbils")], c: 1, why: T("És el termini general de la normativa de consumidors.") },
    { q: T("Es pot enviar un correu comercial a qualsevol adreça que trobem a internet?"), o: [T("Sí, si és d'una empresa"), T("No, cal consentiment previ"), T("Sí, un cop l'any")], c: 1, why: T("La LSSI prohibeix les comunicacions comercials no sol·licitades.") },
    { q: T("Com ha de ser el bàner de galetes?"), o: [T("Amb el botó de rebutjar tan visible com el d'acceptar"), T("Sense opció de rebutjar"), T("Només informatiu")], c: 0, why: T("El consentiment ha de ser lliure.") }
  ]
});
L('L_logistica', {
  area: 'web', codes: ['2.6', '2.7', '2.9'], title: T("Logística, reclamacions i devolucions"),
  goal: T("Controlar l'enviament de les comandes i convertir les reclamacions en fidelitat."),
  body: [
    T("El <b>control logístic</b> inclou l'estoc actualitzat (per no vendre el que no hi ha), la preparació de comandes, la tria del transportista, el seguiment de l'enviament per al client i la <b>logística inversa</b> (devolucions). Un retard sense avís és la primera causa de queixes."),
    T("Una <b>reclamació</b> és una oportunitat: el client que veu el problema resolt ràpidament sovint és més fidel que el que no n'ha tingut cap. Cal un canal fàcil, resposta ràpida, empatia, solució concreta i registrar-ho per millorar. Les empreses han de tenir fulls de reclamació també per als clients en línia."),
    T("Els <b>períodes de reflexió</b> (desistiment de 14 dies) i les <b>cancel·lacions</b> s'han d'explicar clarament: com es fa, qui paga el retorn i quan es retornen els diners (com a màxim 14 dies des que se'n té notícia).")
  ],
  example: T("La botiga de roba envia un correu automàtic quan la comanda surt, amb el número de seguiment. Quan un paquet es perd, truca la clienta, envia un altre producte l'endemà i li regala l'enviament de la propera compra."),
  errors: [T("Vendre productes sense estoc."), T("Respondre una reclamació amb excuses i sense solució."), T("Posar traves a les devolucions dins del termini legal.")],
  quiz: [
    { q: T("Què és la logística inversa?"), o: [T("La gestió de les devolucions"), T("Enviar més ràpid"), T("Comprar estoc")], c: 0, why: T("És el flux del producte del client cap a la botiga.") },
    { q: T("Com s'ha de gestionar una reclamació?"), o: [T("Ràpid, amb empatia i una solució concreta"), T("Ignorar-la si és en línia"), T("Discutir qui té raó")], c: 0, why: T("Ben resolta, fidelitza el client.") },
    { q: T("En quin termini cal retornar els diners d'un desistiment?"), o: [T("Com a màxim 14 dies"), T("6 mesos"), T("No cal retornar-los")], c: 0, why: T("La normativa fixa un màxim de 14 dies naturals.") }
  ]
});
L('L_pagaments', {
  area: 'web', codes: ['1.8', '2.8', '1.14'], title: T("Pagaments en línia i diners electrònics"),
  goal: T("Triar els mitjans de pagament d'una botiga en línia."),
  body: [
    T("Mitjans de pagament en línia: <b>targeta</b> amb TPV virtual o passarel·les (Redsys, Stripe), <b>PayPal</b> i altres moneders, <b>Bizum</b>, <b>transferència</b>, <b>domiciliació</b>, pagament ajornat (finançament), <b>contra reemborsament</b> i pagament amb el mòbil (Apple Pay, Google Pay)."),
    T("El <b>diner electrònic</b> és un valor monetari emmagatzemat electrònicament (moneders digitals, targetes prepagament) que s'accepta com a pagament. Les entitats que l'emeten estan supervisades."),
    T("Cal equilibrar <b>comissions</b>, <b>confiança</b> del client i <b>seguretat</b>: oferir els mètodes que el teu públic fa servir, mostrar-los abans del pagament i complir l'autenticació reforçada (PSD2: el banc demana un segon factor).")
  ],
  example: T("La botiga de mobles ofereix targeta, Bizum, PayPal i finançament a 12 mesos per a compres de més de 600 €. L'abandonament del carretó baixa un 20 %."),
  errors: [T("Oferir només transferència bancària."), T("Amagar les comissions del contra reemborsament fins al final."), T("Guardar les dades de targeta dels clients a la teva base de dades.")],
  quiz: [
    { q: T("Què és un TPV virtual?"), o: [T("El sistema que permet cobrar amb targeta a la web"), T("Un programa de disseny"), T("Un tipus de domini")], c: 0, why: T("És l'equivalent en línia del datàfon.") },
    { q: T("Què exigeix la directiva PSD2 en els pagaments en línia?"), o: [T("Autenticació reforçada amb dos factors"), T("Pagar només en efectiu"), T("Res")], c: 0, why: T("L'autenticació reforçada redueix el frau.") },
    { q: T("Què és el diner electrònic?"), o: [T("Valor monetari emmagatzemat electrònicament, com en un moneder digital"), T("Bitllets escanejats"), T("Punts d'una botiga")], c: 0, why: T("És un mitjà de pagament regulat.") }
  ]
});
L('L_seguretat', {
  area: 'avancat', codes: ['2.10', '2.11', '5.9'], title: T("Seguretat: xifratge, certificats i firma digital"),
  goal: T("Protegir les transaccions i els sistemes d'una empresa digital."),
  body: [
    T("L'<b>encriptació o xifratge</b> transforma la informació perquè només la pugui llegir qui té la clau. <b>Simètric</b>: la mateixa clau per xifrar i desxifrar. <b>Asimètric</b>: una clau pública per xifrar i una privada per desxifrar. L'<b>HTTPS</b> (TLS) xifra la connexió entre el navegador i la web: el cadenat és imprescindible en una botiga."),
    T("Un <b>certificat digital</b> identifica una persona, empresa o web (emès per una autoritat de certificació). La <b>firma digital</b> garanteix qui ha signat un document i que no s'ha modificat. El <b>DNI electrònic</b> porta certificats per identificar-se i signar en línia, com l'idCAT o el certificat de la FNMT."),
    T("Estratègia de <b>seguretat informàtica</b>: contrasenyes llargues i úniques amb gestor, verificació en dos passos, actualitzacions, còpies de seguretat (regla 3-2-1), permisos mínims, formació contra el <b>phishing</b> i un pla de resposta a incidents.")
  ],
  example: T("La botiga de mobles activa HTTPS, verificació en dos passos a tots els comptes i còpies diàries. Quan arriba un correu fals «del banc», l'equip el detecta perquè ha fet una formació de phishing."),
  errors: [T("Fer servir la mateixa contrasenya a tot arreu."), T("No fer còpies de seguretat fora del servidor."), T("Clicar enllaços de correus urgents sense comprovar el remitent.")],
  quiz: [
    { q: T("En el xifratge asimètric..."), o: [T("es fa servir una clau pública i una privada"), T("es fa servir una sola clau"), T("no hi ha claus")], c: 0, why: T("La clau pública xifra; només la privada desxifra.") },
    { q: T("Què garanteix la firma digital?"), o: [T("La identitat del signant i que el document no s'ha modificat"), T("Que el document és gratuït"), T("Que s'envia més ràpid")], c: 0, why: T("Autenticitat i integritat.") },
    { q: T("Quina és una bona pràctica contra el phishing?"), o: [T("Comprovar remitent i enllaços abans de clicar"), T("Respondre amb la contrasenya"), T("Desactivar l'antivirus")], c: 0, why: T("El phishing es basa en enganyar amb urgència i aparença oficial.") }
  ]
});
L('L_afiliacio', {
  area: 'creixement', codes: ['1.9', '1.11'], title: T("Màrqueting d'afiliació i cross màrqueting"),
  goal: T("Fer créixer les vendes amb socis que cobren per resultats i amb aliances entre marques."),
  body: [
    T("En el <b>màrqueting d'afiliació</b>, altres webs o persones (afiliats) promocionen el teu producte amb un enllaç o codi propi i cobren una <b>comissió per venda</b> o per contacte (CPA). Es gestiona amb plataformes (Awin, Tradedoubler) o directament, amb enllaços de seguiment."),
    T("El <b>cross màrqueting</b> (màrqueting creuat) és una aliança entre marques <b>complementàries</b> que comparteixen públic però no competeixen: promocions conjuntes, descomptes creuats o productes combinats. No s'ha de confondre amb la <b>venda creuada</b> (cross-selling), que és oferir un producte complementari al mateix client."),
    T("Cal un acord clar: comissions, durada de la galeta de seguiment, normes de publicitat (no fer anuncis amb la teva marca, per exemple) i mesura de resultats.")
  ],
  example: T("El gimnàs dona un codi a tres entrenadores conegudes (10 % de comissió per alta) i fa una promoció creuada amb una botiga de nutrició: els socis tenen descompte a la botiga i els clients de la botiga, una setmana gratis."),
  errors: [T("Pagar els afiliats per clic sense controlar la qualitat."), T("Aliar-se amb una marca que competeix amb tu."), T("No mesurar d'on venen les vendes.")],
  quiz: [
    { q: T("Com cobra normalment un afiliat?"), o: [T("Una comissió per venda o contacte"), T("Un sou fix"), T("Res")], c: 0, why: T("L'afiliació paga per resultats.") },
    { q: T("Què és el cross màrqueting?"), o: [T("Una aliança entre marques complementàries"), T("Rebaixar preus"), T("Copiar un competidor")], c: 0, why: T("Comparteixen públic sense competir.") },
    { q: T("Oferir patates a qui compra una hamburguesa és..."), o: [T("venda creuada (cross-selling)"), T("afiliació"), T("SEO")], c: 0, why: T("És oferir un complement al mateix client.") }
  ]
});
L('L_viral', {
  area: 'xarxes', codes: ['1.12'], title: T("Màrqueting viral"),
  goal: T("Dissenyar continguts i incentius perquè la gent comparteixi."),
  body: [
    T("El <b>màrqueting viral</b> aconsegueix que el missatge s'escampi de persona a persona, com un virus. Es basa en continguts que provoquen emoció (humor, sorpresa, tendresa), utilitat o identitat, i en fer-ho fàcil de compartir."),
    T("També es pot provocar amb <b>programes de referits</b> («porta un amic i tots dos guanyeu») i reptes o concursos a xarxes. El <b>coeficient viral</b> indica quants nous usuaris porta cada usuari: si és superior a 1, creix sol."),
    T("Riscos: no es pot garantir que un contingut es faci viral, i un missatge mal plantejat també es pot escampar en contra de la marca. Cal coherència amb la marca, respecte i un pla per gestionar comentaris.")
  ],
  example: T("El gimnàs llança el repte «30 dies, 30 esquats» amb un vídeo divertit i un premi per a qui convidi més amics. El 40 % de les altes noves arriben per referits."),
  errors: [T("Prometre al client que «ho farem viral»."), T("Reptes perillosos o ofensius per cridar l'atenció."), T("No preparar-se per a una allau de comentaris.")],
  quiz: [
    { q: T("Què indica un coeficient viral superior a 1?"), o: [T("Que cada usuari porta més d'un usuari nou"), T("Que la campanya ha fallat"), T("Que hi ha un error")], c: 0, why: T("Amb més d'1, la difusió creix per si sola.") },
    { q: T("Quin element ajuda a fer viral un contingut?"), o: [T("Que provoqui emoció i sigui fàcil de compartir"), T("Que sigui molt llarg"), T("Que no tingui imatges")], c: 0, why: T("L'emoció i la facilitat són els motors de la difusió.") },
    { q: T("Quin risc té el màrqueting viral?"), o: [T("Que un missatge mal plantejat s'escampi en contra"), T("Cap"), T("Que sigui massa barat")], c: 0, why: T("La viralitat no es controla del tot.") }
  ]
});
L('L_comunitats', {
  area: 'xarxes', codes: ['4.1', '4.2', '4.3', '4.4', '4.5', '4.12', '4.13'], title: T("Xats, missatgeria, fòrums i grups"),
  goal: T("Fer servir els canals de conversa en línia per relacionar-se amb clients i contactes."),
  body: [
    T("Els <b>xats</b> van començar amb l'<b>IRC</b> (canals temàtics amb programes com mIRC) i els <b>webxats</b> (xat dins d'una web); avui les empreses fan servir el xat de la web i chatbots. La <b>missatgeria instantània</b> (WhatsApp Business, Telegram) permet catàlegs, respostes ràpides, missatges automàtics i canals de difusió. La <b>telefonia per internet</b> (VoIP: Teams, Meet, Zoom o centraletes virtuals) abarateix trucades i reunions."),
    T("Als <b>fòrums</b> i <b>grups de discussió</b> (fòrums sectorials, grups de LinkedIn o Facebook, Reddit) es llegeix abans d'escriure, es respecten les normes i la <b>netiqueta</b>, s'aporta valor i no es fa spam. Per <b>buscar un grup interessant</b>: cercar per paraules clau del sector, mirar l'activitat, el nombre de membres actius i les normes."),
    T("Per <b>crear una xarxa de contactes influents</b>: identificar persones clau del sector (clients, periodistes, creadors, associacions), seguir-les i interactuar amb aportacions útils, presentar-se amb un missatge personalitzat i mantenir el contacte donant abans de demanar.")
  ],
  example: T("L'associació de comerciants crea una comunitat de WhatsApp amb canals per temes, un fòrum per a dubtes de digitalització i reunions mensuals per Meet, i convida dos creadors locals a les trobades."),
  errors: [T("Afegir gent a grups de WhatsApp sense permís."), T("Entrar en un fòrum només per fer publicitat."), T("Demanar favors a contactes influents sense haver aportat res abans.")],
  quiz: [
    { q: T("Què és l'IRC?"), o: [T("Un sistema clàssic de xat per canals"), T("Una xarxa de pagament"), T("Un tipus de domini")], c: 0, why: T("Internet Relay Chat va ser el primer gran sistema de xat.") },
    { q: T("Què és la netiqueta?"), o: [T("Les normes de comportament en línia"), T("Una etiqueta HTML"), T("Un preu")], c: 0, why: T("Respecte, aportar valor i no fer spam.") },
    { q: T("Quina és la millor manera d'entrar en un grup de discussió professional?"), o: [T("Llegir-ne les normes i aportar valor abans de promocionar res"), T("Publicar ofertes el primer dia"), T("Enviar missatges privats a tothom")], c: 0, why: T("La confiança es guanya participant.") }
  ]
});
L('L_paginaxarxa', {
  area: 'xarxes', codes: ['4.8', '4.9', '4.10', '4.11', '4.14'], title: T("Pàgines d'empresa i comerç a les xarxes socials"),
  goal: T("Configurar una pàgina d'empresa completa i vendre des de les xarxes."),
  body: [
    T("Les <b>xarxes socials per a empreses</b> (perfils professionals d'Instagram i TikTok, pàgines de Facebook i LinkedIn) ofereixen estadístiques, anuncis i eines. A la pàgina s'hi <b>afegeixen elements</b>: logo, portada, descripció amb paraules clau, botó d'acció (trucar, reservar, comprar), horari, ubicació, enllaç a la web i històries destacades."),
    T("Els <b>elements fotogràfics i audiovisuals</b> (fotos reals, carrusels, vídeos curts, directes) són els que més interacció generen; cal adaptar-ne el format a cada xarxa. Les <b>aplicacions professionals</b> afegeixen funcions: botiga, reserves, Meta Business Suite per programar, xat amb WhatsApp, formularis de contacte."),
    T("Per <b>comprar i vendre a les xarxes</b> (social commerce): Instagram i Facebook Shopping amb catàleg i etiquetes de producte, TikTok Shop, Facebook Marketplace o vendes per missatge. Cal un catàleg actualitzat, preus clars, condicions de venda i un bon servei d'atenció.")
  ],
  example: T("Cim Trail connecta el catàleg de la botiga a Instagram, etiqueta les jaquetes a les fotos i als reels i afegeix el botó «Comprar». Les vendes des de xarxes passen a ser un 25 % del total."),
  errors: [T("Fer servir un perfil personal en lloc d'un professional."), T("Deixar la descripció i el botó d'acció buits."), T("Vendre per missatge sense condicions de venda ni factura.")],
  quiz: [
    { q: T("Quin avantatge té un perfil professional respecte d'un de personal?"), o: [T("Estadístiques, botons d'acció i anuncis"), T("Més seguidors automàticament"), T("Cap")], c: 0, why: T("Les eines professionals només hi són als perfils d'empresa.") },
    { q: T("Què és el social commerce?"), o: [T("Vendre directament des de les xarxes socials"), T("Fer anuncis a la TV"), T("Un blog")], c: 0, why: T("La compra es fa sense sortir de la xarxa o amb molt pocs passos.") },
    { q: T("Quin tipus de contingut sol generar més interacció?"), o: [T("Fotos reals i vídeos curts"), T("Text llarg sense imatges"), T("Enllaços sense descripció")], c: 0, why: T("El contingut visual és el que més funciona a les xarxes.") }
  ]
});
L('L_web20', {
  area: 'xarxes', codes: ['5.1', '5.2', '5.4', '5.5', '5.6', '5.7', '5.8'], title: T("La web 2.0 i el consumidor proactiu"),
  goal: T("Aprofitar la participació dels usuaris per millorar la reputació i les vendes."),
  body: [
    T("La <b>web 2.0</b> és la web participativa: els usuaris no només llegeixen, també creen contingut, opinen, comparteixen i col·laboren (xarxes, blogs, wikis, ressenyes, fòrums). Els <b>objectius</b> d'una empresa a la web 2.0: escoltar, conversar, generar confiança, millorar productes amb les opinions i convertir clients en prescriptors."),
    T("Eines del màrqueting 2.0: xarxes socials, blogs, sindicació de continguts (RSS), plataformes d'opinions, wikis i comunitats. Els <b>webs integrats</b> (mashups) combinen serveis de diverses fonts: un mapa de Google, les ressenyes, el feed d'Instagram o un sistema de reserves incrustats a la web."),
    T("Els <b>consumidors proactius</b> (prosumidors) opinen, comparen, recomanen i fins i tot creen continguts sobre les marques. Les xarxes que els fan <b>prescriptors</b> (TripAdvisor, Google, comunitats de marca, ambaixadors) influeixen més que la publicitat. Cal facilitar opinions, respondre-les totes i aprofitar les ofertes creuades i els comparadors.")
  ],
  example: T("Can Jordi incrusta a la web les ressenyes de Google i un mapa, convida els clients a penjar fotos amb una etiqueta i respon cada opinió. La nota passa de 3,9 a 4,5."),
  errors: [T("Respondre només les opinions bones."), T("Esborrar comentaris crítics."), T("Comprar ressenyes falses.")],
  quiz: [
    { q: T("Què defineix la web 2.0?"), o: [T("La participació dels usuaris en la creació de continguts"), T("Webs només de lectura"), T("Webs sense imatges")], c: 0, why: T("L'usuari passa de lector a participant.") },
    { q: T("Què és un web integrat o mashup?"), o: [T("Un web que combina serveis o continguts de diverses fonts"), T("Un web sense menú"), T("Una web en dos idiomes")], c: 0, why: T("Per exemple, un mapa i ressenyes incrustats.") },
    { q: T("Què és un prosumidor?"), o: [T("Un consumidor que també crea, opina i recomana"), T("Un proveïdor"), T("Un tipus de virus")], c: 0, why: T("Productor + consumidor.") }
  ]
});
L('L_zones', {
  area: 'analitica', codes: ['3.10', '3.9', '3.7', '3.11', '3.8'], title: T("Zones calentes, flux de caixa i eines de disseny"),
  goal: T("Analitzar on mira i clica l'usuari, controlar la caixa de la botiga i fer servir eines gràfiques."),
  body: [
    T("Els <b>mapes de calor</b> (Hotjar, Microsoft Clarity) mostren les <b>zones calentes</b> on l'usuari mira, clica i fins on fa scroll: la part superior de la pàgina i el patró en F reben més atenció. La <b>zona d'usuari</b> (àrea de client amb inici de sessió) permet veure comandes, guardar adreces i llistes de desitjos. El <b>carretó</b> ha de mostrar costos totals aviat i permetre comprar com a convidat."),
    T("El <b>flux de caixa</b> d'una botiga en línia inclou cobraments (que la passarel·la ingressa amb uns dies de retard), comissions de pagament i de marketplace, devolucions, enviaments, compres d'estoc, publicitat i impostos. Es pot vendre molt i quedar-se sense caixa si l'estoc i la publicitat es paguen abans de cobrar."),
    T("<b>Programes de disseny gràfic</b> i utilitats per al web: Canva o Adobe Express (ràpids), Photoshop i GIMP (retoc d'imatge), Illustrator i Inkscape (vectorial: logos), Figma (prototips de web) i compressors d'imatge (Squoosh, TinyPNG) perquè la web carregui ràpid.")
  ],
  example: T("El mapa de calor de la cansaladeria mostra que ningú veu el botó de l'enviament refrigerat perquè és a baix de tot: el pugen a la part superior i les comandes augmenten un 15 %."),
  errors: [T("Posar la informació clau on ningú hi arriba fent scroll."), T("Obligar a crear un compte per comprar."), T("Confondre vendes amb diners disponibles al banc.")],
  quiz: [
    { q: T("Què mostra un mapa de calor?"), o: [T("On miren, cliquen i fan scroll els usuaris"), T("La temperatura del servidor"), T("Les vendes per províncies")], c: 0, why: T("Revela les zones calentes i les que ningú veu.") },
    { q: T("Per què una botiga amb moltes vendes pot tenir problemes de caixa?"), o: [T("Perquè paga estoc i publicitat abans de cobrar"), T("No pot passar mai"), T("Perquè ven massa barat sempre")], c: 0, why: T("El flux de caixa depèn de quan entren i surten els diners.") },
    { q: T("Quin programa és vectorial, adequat per dissenyar un logo?"), o: ['Illustrator', 'Excel', 'FileZilla'], c: 0, why: T("Els logos es fan en vectorial perquè escalin sense perdre qualitat.") }
  ]
});
L('L_videotv', {
  area: 'avancat', codes: ['1.15', '1.14'], title: T("Internet TV, web TV i videoblogs"),
  goal: T("Fer servir el vídeo en línia i la televisió connectada en una estratègia de màrqueting."),
  body: [
    T("La <b>Internet TV</b> o <b>TV per internet</b> emet continguts de televisió a través de la xarxa (plataformes OTT, televisió a la carta, canals en directe). La <b>web TV</b> és un canal de vídeo propi d'una organització a la seva web o a YouTube, i els <b>videoblogs</b> (vlogs) són blogs en format vídeo, sovint personals i propers."),
    T("Per a les marques, el vídeo serveix per explicar productes (tutorials, demostracions), mostrar l'empresa per dins, fer directes (presentacions, preguntes i respostes) i anunciar-se a YouTube o a la TV connectada amb segmentació, com en digital."),
    T("Claus: els primers segons decideixen si es continua mirant, subtítols (molta gent el mira sense so), formats adaptats a cada plataforma (horitzontal per a YouTube i TV, vertical per a xarxes), regularitat i mesurar la retenció i les conversions.")
  ],
  example: T("La televisió local crea una web TV amb programes a la carta, un videoblog setmanal amb comerços del territori i paquets d'anuncis a la TV connectada per als anunciants locals."),
  errors: [T("Pujar vídeos llargs sense subtítols ni un inici que enganxi."), T("Fer servir el mateix format per a totes les plataformes."), T("Mesurar només les visualitzacions.")],
  quiz: [
    { q: T("Què és un videoblog?"), o: [T("Un blog en format de vídeo"), T("Un anunci de TV"), T("Un fòrum")], c: 0, why: T("És el format vlog: entrades en vídeo.") },
    { q: T("Què és una plataforma OTT?"), o: [T("Un servei de vídeo que es distribueix per internet"), T("Un tipus de cable"), T("Una ràdio")], c: 0, why: T("Over The Top: contingut directament per internet.") },
    { q: T("Per què cal posar subtítols als vídeos?"), o: [T("Perquè molta gent els mira sense so"), T("Per ocupar més espai"), T("No cal")], c: 0, why: T("Milloren la comprensió i l'accessibilitat.") }
  ]
});

/* ============================================================
   MISSIONS DEL TEMARI (dues per etapa; cal fer-les per passar a l'etapa següent)
   Cada decisió té una qualitat (q: 1 bona, 0.5 regular, 0 dolenta) que veu el professorat.
   ============================================================ */
const M = (id, o) => {
  const stage = +id.split('.')[0];
  GD.chapters[id] = Object.assign({ id, stage, temari: true, weeks: 1 }, o);
  GD.stages[stage - 1].chapters.push(id);
};
const good = (xp, extra) => Object.assign({ xp: xp || 30, rep: 2 }, extra || {});
const bad = (money, log) => ({ money: -money, rep: -1, log });

M('1.6', {
  title: T("Una clínica que no surt enlloc"), who: 'sara', bg: 'despatx', codes: ['1.2', '3.6', '1.6'],
  blurb: T("La doctora Sara ha obert una clínica dental a Vic. Té web, però ningú no la troba."),
  steps: [
    { t: 'dlg', lines: [['sara.n', T("Tinc una web preciosa, però si busco «dentista Vic» no surto ni a la tercera pàgina. I a Google Maps tampoc.")], ['pau.t', T("(Primer cal que els cercadors i els directoris sàpiguen que existeix.)")]] },
    { t: 'lesson', id: 'L_directoris' },
    { t: 'choice', key: 'tm_sara1', who: 'sara', prompt: T("Què fas primer?"), opts: [
      { t: T("Verificar la web a Search Console, enviar el sitemap i crear la fitxa de Google amb dades coherents"), q: 1, fx: good(40), say: [['sara.h', T("Ja apareix al mapa! I Search Console m'avisa d'una pàgina que no s'indexava.")]] },
      { t: T("Pagar 300 € per sortir en 200 directoris automàtics"), q: 0, fx: bad(300, T("Va pagar 300 € per directoris de baixa qualitat.")), say: [['sara.a', T("He rebut enllaços de webs estranyes i Google m'ha baixat posicions. Quins diners més mal gastats!")]] },
      { t: T("Esperar que Google la trobi sola"), q: 0.5, fx: { rep: 0 }, say: [['sara.t', T("Al cap d'un mes, poca cosa. Potser podríem ajudar-lo una mica...")]] }
    ] },
    { t: 'lesson', id: 'L_sem' },
    { t: 'choice', key: 'tm_sara2', who: 'sara', prompt: T("Té 400 € al mes. Com els reparteixes?"), opts: [
      { t: T("SEM per a «dentista urgència Vic», SEO local al blog i remàrqueting suau per a qui ha vist la pàgina d'ortodòncia"), q: 1, fx: good(40, { money: 300, fee: true }) },
      { t: T("Tot en anuncis de display a qualsevol web"), q: 0, fx: bad(150, T("Va gastar el pressupost en display sense segmentar i va haver de retornar part dels honoraris.")) },
      { t: T("Tot en SEM, sense tocar res de SEO"), q: 0.5, fx: { money: 150, fee: true } }
    ] },
    { t: 'dlg', lines: [['sara.h', T("I a més m'he donat d'alta a Doctoralia amb el mateix nom i telèfon. Ja m'han fet sis reserves!")]] },
    { t: 'reward', money: 200 }
  ]
});
M('1.7', {
  title: T("Osona Bikes vol la seva pròpia web"), who: 'laura', bg: 'despatx', codes: ['2.3', '3.1', '3.2', '3.3', '3.4', '3.5'],
  blurb: T("Una botiga de bicicletes necessita domini, allotjament i una web ben estructurada."),
  steps: [
    { t: 'dlg', lines: [['laura.n', T("Vull una web per a la botiga, però no sé què és un domini, ni un hosting, ni un FTP. M'ho expliques?")]] },
    { t: 'lesson', id: 'L_domini' },
    { t: 'choice', key: 'tm_laura1', who: 'laura', prompt: T("Quin domini i quin allotjament li recomanes?"), opts: [
      { t: T("osonabikes.cat (i el .com per protegir-lo) a nom de l'empresa, amb allotjament gestionat amb SSL i còpies"), q: 1, fx: good(40) },
      { t: T("bicis-osona-barates-24h.net a nom teu, amb un allotjament gratuït amb anuncis"), q: 0, fx: bad(200, T("El domini a nom de l'agència i l'allotjament amb anuncis van obligar a refer-ho tot (−200 €).")), say: [['laura.a', T("A la web hi surten anuncis d'altres botigues de bicis! I el domini no és meu?")]] },
      { t: T("Un servidor propi a la rebotiga"), q: 0.5, fx: { money: -50, log: T("Va recomanar un servidor propi i va acabar pagant una reparació (−50 €).") } }
    ] },
    { t: 'lesson', id: 'L_html' },
    { t: 'choice', key: 'tm_laura2', who: 'laura', prompt: T("Com plantegeu la web i com la publiqueu?"), opts: [
      { t: T("Inici, bicis, taller, rutes (blog), qui som, contacte i pàgines legals; HTML semàntic amb un sol h1 i publicació per SFTP"), q: 1, fx: good(40, { money: 400, fee: true }) },
      { t: T("Una sola pàgina amb tot barrejat i la pugem per FTP sense xifrar"), q: 0, fx: bad(100, T("Les credencials FTP es van filtrar i van haver de netejar la web (−100 €).")) },
      { t: T("Copiar l'estructura d'una web gran d'una altra botiga"), q: 0.5, fx: { money: 200, fee: true } }
    ] },
    { t: 'dlg', lines: [['laura.h', T("osonabikes.cat ja és en línia! I ara entenc què és cada cosa.")]] },
    { t: 'reward', money: 200 }
  ]
});
M('2.6', {
  title: T("L'hotel rural i el client connectat"), who: 'mireia', bg: 'despatx', codes: ['1.3', '1.13', '1.14', '1.10'],
  blurb: T("Un hotel rural del Montseny perd reserves davant de les grans plataformes."),
  steps: [
    { t: 'dlg', lines: [['mireia.n', T("Tot el que reservem ve de Booking, i ens cobren un 18 %. Els clients que vénen directament són gent gran que truca.")], ['pau.t', T("(Cal entendre com busca i reserva el client d'avui.)")]] },
    { t: 'lesson', id: 'L_clientonline' },
    { t: 'lesson', id: 'L_mobil' },
    { t: 'choice', key: 'tm_mireia1', who: 'mireia', prompt: T("Què canvies primer?"), opts: [
      { t: T("Reserva directa ràpida des del mòbil, pagament amb targeta, Bizum i Apple Pay, i un millor preu per reservar a la web"), q: 1, fx: good(40) },
      { t: T("Enviar SMS comercials a tots els números que tenen a la llibreta"), q: 0, fx: bad(400, T("Va enviar SMS sense consentiment i l'hotel va rebre una sanció que l'agència va haver d'assumir en part (−400 €).")) },
      { t: T("Fer un anunci a la TDT local"), q: 0.5, fx: { rep: 0 } }
    ] },
    { t: 'lesson', id: 'L_onetoone' },
    { t: 'choice', key: 'tm_mireia2', who: 'mireia', prompt: T("Com fidelitzes els clients que ja han vingut?"), opts: [
      { t: T("CRM amb preferències i correus personalitzats: rutes per als esportistes, activitats per a les famílies, i un descompte per tornar en temporada baixa"), q: 1, fx: good(40, { money: 500, fee: true }) },
      { t: T("El mateix correu promocional cada setmana a tothom"), q: 0, fx: bad(100, T("Molts clients es van donar de baixa i l'hotel va reduir la quota (−100 €).")) },
      { t: T("Felicitar-los per Nadal i prou"), q: 0.5, fx: { money: 200, fee: true } }
    ] },
    { t: 'reward', money: 300 }
  ]
});
M('2.7', {
  title: T("El blog i el butlletí de la Llibreria Peix"), who: 'pere', bg: 'vic', codes: ['1.5', '4.7', '1.4', '1.7'],
  blurb: T("Una llibreria de tota la vida vol fer comunitat de lectors a internet."),
  steps: [
    { t: 'dlg', lines: [['pere.n', T("Els clubs de lectura van plens, però a la web no hi ha vida. M'han dit que faci un blog i un butlletí. Per on començo?")]] },
    { t: 'lesson', id: 'L_blog' },
    { t: 'choice', key: 'tm_pere1', who: 'pere', prompt: T("Quin blog proposes?"), opts: [
      { t: T("Un blog de comunitat amb ressenyes dels clubs de lectura, guies per edats i enllaç per reservar cada llibre; un article cada setmana"), q: 1, fx: good(40) },
      { t: T("Notícies de la llibreria: horaris, festius i inventari"), q: 0.5, fx: { rep: 0 } },
      { t: T("Comprar 50 articles genèrics fets amb IA i publicar-los el mateix dia"), q: 0, fx: bad(150, T("Va publicar contingut genèric que va perjudicar el SEO de la llibreria (−150 €).")) }
    ] },
    { t: 'lesson', id: 'L_newsletter' },
    { t: 'choice', key: 'tm_pere2', who: 'pere', prompt: T("I el butlletí?"), opts: [
      { t: T("Formulari amb doble opt-in a la web i a la botiga, butlletí mensual segmentat per gèneres i enllaç de baixa visible"), q: 1, fx: good(40, { money: 300, fee: true }) },
      { t: T("Importar els correus dels tiquets de compra sense demanar permís"), q: 0, fx: bad(500, T("Va enviar correus sense consentiment i l'Agència de Protecció de Dades va obrir un expedient (−500 €).")) },
      { t: T("Un butlletí diari amb totes les novetats"), q: 0.5, fx: { money: 100, fee: true } }
    ] },
    { t: 'reward', money: 300 }
  ]
});
M('3.6', {
  title: T("Formatges Roser: quin model de negoci?"), who: 'client', bg: 'fira', codes: ['2.4', '2.5', '2.12', '2.1', '2.2'],
  blurb: T("Una formatgeria vol vendre a particulars, a restaurants i les edicions limitades."),
  steps: [
    { t: 'dlg', lines: [['', T("A la fira, la Roser, de la formatgeria del mercat, t'atura.")], ['client.n', T("Em diuen que vengui a Amazon, que faci una botiga, que vengui a restaurants... Quin model em convé?")]] },
    { t: 'lesson', id: 'L_models' },
    { t: 'choice', key: 'tm_roser1', prompt: T("Quina combinació proposes?"), opts: [
      { t: T("E-shop pròpia (B2C) amb catàleg i aparador web, àrea B2B amb preus per a restaurants i una subhasta anual per a les edicions limitades"), q: 1, fx: good(50, { money: 600, fee: true }) },
      { t: T("Tot a un marketplace generalista, sense web pròpia"), q: 0.5, fx: { money: 200, fee: true, log: T("Va recomanar dependre només d'un marketplace (comissions i poca marca).") } },
      { t: T("Una sola web amb els mateixos preus per a tothom i comandes per telèfon"), q: 0, fx: bad(200, T("Els restaurants no van entendre els preus i la Roser va perdre comandes (−200 €).")) }
    ] },
    { t: 'choice', key: 'tm_roser2', prompt: T("Els seus proveïdors de llet volen fer les comandes en línia. Com s'anomena aquest tipus de sistema?"), opts: [
      { t: T("E-procurement"), q: 1, fx: good(30) },
      { t: T("E-auction"), q: 0, fx: { rep: -1 } },
      { t: T("Màrqueting viral"), q: 0, fx: { rep: -1 } }
    ] },
    { t: 'reward', money: 300 }
  ]
});
M('3.7', {
  title: T("Una inspecció a la vista"), who: 'elena', bg: 'despatx', codes: ['1.7', '2.9'],
  blurb: T("Una advocada avisa que algunes webs dels clients no compleixen la normativa."),
  steps: [
    { t: 'dlg', lines: [['elena.n', T("Sóc l'Elena, advocada de la cambra de comerç. He revisat tres webs que porteu: galetes sense opció de rebutjar, formularis sense informació de privacitat i cap avís legal.")], ['pau.w', T("(Això pot acabar en sancions per als clients... i per a nosaltres.)")]] },
    { t: 'lesson', id: 'L_normativa' },
    { t: 'choice', key: 'tm_elena1', who: 'elena', prompt: T("Què fas?"), opts: [
      { t: T("Revisar totes les webs: avís legal, privacitat, bàner de galetes amb «Rebutjar», caselles de consentiment desmarcades i condicions de venda amb el desistiment"), q: 1, fx: good(50) },
      { t: T("Posar un text legal copiat d'una altra web"), q: 0.5, fx: { money: -100, log: T("Va copiar textos legals que no s'ajustaven als clients (−100 €).") } },
      { t: T("Ignorar-ho: «a les botigues petites no les inspeccionen mai»"), q: 0, fx: bad(900, T("Un client va rebre una sanció per galetes i l'agència en va assumir una part (−900 €).")) }
    ] },
    { t: 'choice', key: 'tm_elena2', who: 'elena', prompt: T("Una clienta d'una botiga en línia vol tornar un producte al cap de 10 dies, sense donar cap motiu. Què li responeu?"), opts: [
      { t: T("Que té dret al desistiment de 14 dies i li retornareu els diners en 14 dies com a màxim"), q: 1, fx: good(30) },
      { t: T("Que no, perquè ja l'ha obert"), q: 0, fx: bad(150, T("Una devolució denegada il·legalment va acabar en reclamació i compensació (−150 €).")) },
      { t: T("Que només li podeu donar un val de compra"), q: 0, fx: { rep: -1 } }
    ] },
    { t: 'reward', money: 400 }
  ]
});
M('4.6', {
  title: T("Fil i Cotó: paquets perduts i clientes enfadades"), who: 'neus', bg: 'despatx', codes: ['2.6', '2.7', '2.9'],
  blurb: T("Una botiga de roba en línia té massa reclamacions i devolucions."),
  steps: [
    { t: 'dlg', lines: [['neus.a', T("Venem molt per internet, però cada setmana hi ha paquets que no arriben, clientes que es queixen a Instagram i devolucions que ens maten.")]] },
    { t: 'lesson', id: 'L_logistica' },
    { t: 'choice', key: 'tm_neus1', who: 'neus', prompt: T("Com organitzes la logística?"), opts: [
      { t: T("Estoc sincronitzat amb la web, avís automàtic amb el número de seguiment, un transportista fiable i un procés de devolucions clar"), q: 1, fx: good(50) },
      { t: T("Canviar al transportista més barat"), q: 0, fx: bad(300, T("Més incidències d'enviament i compensacions als clients (−300 €).")) },
      { t: T("Treure les devolucions gratuïtes sense avisar"), q: 0, fx: bad(200, T("Les clientes van protestar i la botiga va haver de compensar-les (−200 €).")) }
    ] },
    { t: 'choice', key: 'tm_neus2', who: 'neus', prompt: T("Una clienta publica a Instagram que el seu vestit no ha arribat a temps per a un casament. Què feu?"), opts: [
      { t: T("Disculpar-vos en públic, contactar-la en privat, enviar-li un altre vestit urgent i un regal, i revisar què ha fallat"), q: 1, fx: good(50, { money: 500, fee: true }), say: [['neus.h', T("Ha publicat que som la botiga amb millor tracte que coneix. Ha guanyat més seguidores que el problema!")]] },
      { t: T("Esborrar el comentari"), q: 0, fx: bad(200, T("Esborrar la queixa la va fer viral (−200 €).")) },
      { t: T("Respondre que la culpa és del transportista"), q: 0.5, fx: { rep: 0 } }
    ] },
    { t: 'reward', money: 400 }
  ]
});
M('4.7', {
  title: T("Mobles Ter: pagaments i seguretat"), who: 'oriol', bg: 'despatx', codes: ['1.8', '2.8', '2.10', '2.11', '5.9', '1.14'],
  blurb: T("Una botiga de mobles vol vendre en línia, però té por dels pagaments i dels pirates."),
  steps: [
    { t: 'dlg', lines: [['oriol.n', T("Volem vendre mobles a la web, però amb compres de 800 € la gent té por de pagar. I a més ens han intentat entrar al correu dues vegades.")]] },
    { t: 'lesson', id: 'L_pagaments' },
    { t: 'choice', key: 'tm_oriol1', who: 'oriol', prompt: T("Quins mitjans de pagament hi poses?"), opts: [
      { t: T("Targeta amb TPV virtual i autenticació reforçada, Bizum, PayPal i finançament per a compres grans"), q: 1, fx: good(50) },
      { t: T("Només transferència bancària"), q: 0.5, fx: { rep: 0, log: T("Va limitar els pagaments a transferència i va perdre vendes.") } },
      { t: T("Guardar les dades de targeta dels clients en un Excel per cobrar més ràpid"), q: 0, fx: bad(800, T("Una filtració de dades de targeta va comportar una sanció i despeses (−800 €).")) }
    ] },
    { t: 'lesson', id: 'L_seguretat' },
    { t: 'choice', key: 'tm_oriol2', who: 'oriol', prompt: T("Quina estratègia de seguretat implantes?"), opts: [
      { t: T("HTTPS, gestor de contrasenyes i verificació en dos passos, còpies 3-2-1, actualitzacions i formació contra el phishing; signatura digital per als contractes"), q: 1, fx: good(50, { money: 600, fee: true }) },
      { t: T("Canviar les contrasenyes un cop l'any"), q: 0.5, fx: { money: 100, fee: true } },
      { t: T("Res: «som massa petits perquè ens ataquin»"), q: 0, fx: bad(700, T("Un atac de ransomware va aturar la botiga una setmana (−700 €).")) }
    ] },
    { t: 'reward', money: 400 }
  ]
});
M('5.6', {
  title: T("El gimnàs que vol créixer sense anuncis"), who: 'toni', bg: 'despatx', codes: ['1.9', '1.11', '1.12'],
  blurb: T("El Toni vol socis nous, però no vol tornar a llençar diners en anuncis."),
  steps: [
    { t: 'dlg', lines: [['toni.n', T("Els anuncis ja els tinc controlats, però vull créixer d'una altra manera. Què em proposes?")]] },
    { t: 'lesson', id: 'L_afiliacio' },
    { t: 'choice', key: 'tm_toni1', who: 'toni', prompt: T("Quina aliança proposes?"), opts: [
      { t: T("Afiliació amb entrenadores locals (codi propi i comissió per alta) i promoció creuada amb una botiga de nutrició"), q: 1, fx: good(50) },
      { t: T("Pagar influencers per clic sense controlar d'on vénen les altes"), q: 0, fx: bad(400, T("Va pagar clics que no van portar cap alta (−400 €).")) },
      { t: T("Una promoció conjunta amb un altre gimnàs de Vic"), q: 0, fx: { rep: -1, log: T("Va proposar una aliança amb un competidor directe.") } }
    ] },
    { t: 'lesson', id: 'L_viral' },
    { t: 'choice', key: 'tm_toni2', who: 'toni', prompt: T("I per fer-ho córrer?"), opts: [
      { t: T("Repte saludable de 30 dies amb vídeos divertits i premi per a qui porti amics (programa de referits)"), q: 1, fx: good(50, { money: 700, fee: true }) },
      { t: T("Un repte extrem per cridar l'atenció"), q: 0, fx: bad(500, T("Una lesió en el repte va acabar en polèmica i compensacions (−500 €).")) },
      { t: T("Publicar el mateix anunci a tot arreu"), q: 0.5, fx: { money: 100, fee: true } }
    ] },
    { t: 'reward', money: 500 }
  ]
});
M('5.7', {
  title: T("L'associació de comerciants vol fer comunitat"), who: 'pilar', bg: 'vic', codes: ['4.1', '4.2', '4.3', '4.4', '4.5', '4.12', '4.13'],
  blurb: T("Seixanta comerços volen comunicar-se millor entre ells i amb els clients."),
  steps: [
    { t: 'dlg', lines: [['pilar.n', T("Som seixanta botigues i ens comuniquem per un grup de WhatsApp on hi ha de tot: fotos, queixes, bons dies... Ningú llegeix res.")]] },
    { t: 'lesson', id: 'L_comunitats' },
    { t: 'choice', key: 'tm_pilar1', who: 'pilar', prompt: T("Quins canals proposes?"), opts: [
      { t: T("Comunitat de WhatsApp amb canals per temes, un fòrum per a dubtes de digitalització, reunions mensuals per videotrucada i un xat a la web per als clients"), q: 1, fx: good(50) },
      { t: T("Afegir tots els clients al grup de WhatsApp de l'associació"), q: 0, fx: bad(300, T("Afegir clients sense permís va provocar queixes i una advertència de protecció de dades (−300 €).")) },
      { t: T("Tornar a les circulars en paper"), q: 0.5, fx: { rep: 0 } }
    ] },
    { t: 'choice', key: 'tm_pilar2', who: 'pilar', prompt: T("Com ampliareu la xarxa de contactes de l'associació?"), opts: [
      { t: T("Buscar grups actius del sector, participar-hi aportant valor i convidar creadors i periodistes locals a les trobades"), q: 1, fx: good(50, { money: 600, fee: true }) },
      { t: T("Enviar missatges promocionals a tots els grups de Facebook de la comarca"), q: 0, fx: bad(150, T("Van expulsar l'associació de diversos grups per spam (−150 €).")) },
      { t: T("Seguir tothom a Instagram i esperar"), q: 0.5, fx: { money: 100, fee: true } }
    ] },
    { t: 'reward', money: 500 }
  ]
});
M('6.6', {
  title: T("Cim Trail ven des d'Instagram"), who: 'sergi', bg: 'despatx', codes: ['4.8', '4.9', '4.10', '4.11', '4.14', '4.6'],
  blurb: T("El Sergi vol vendre directament a les xarxes i tenir un perfil d'empresa complet."),
  steps: [
    { t: 'dlg', lines: [['sergi.n', T("Ara que mirem les vendes i no els seguidors, vull que Instagram i LinkedIn venguin de veritat. Qui sap, potser fins i tot TikTok.")]] },
    { t: 'lesson', id: 'L_paginaxarxa' },
    { t: 'choice', key: 'tm_sergi1', who: 'sergi', prompt: T("Com prepares les pàgines?"), opts: [
      { t: T("Perfils professionals amb descripció, botó d'acció, catàleg connectat, reels de producte, Meta Business Suite i pàgina de LinkedIn per a botigues distribuïdores"), q: 1, fx: good(50) },
      { t: T("Fer servir el perfil personal del Sergi"), q: 0, fx: { rep: -1, log: T("Va gestionar la marca des d'un perfil personal sense eines professionals.") } },
      { t: T("Només canviar la foto de perfil"), q: 0.5, fx: { rep: 0 } }
    ] },
    { t: 'choice', key: 'tm_sergi2', who: 'sergi', prompt: T("Com veneu a les xarxes?"), opts: [
      { t: T("Instagram Shopping amb etiquetes de producte, condicions de venda clares i atenció per missatge en menys d'una hora"), q: 1, fx: good(50, { money: 700, fee: true }) },
      { t: T("Vendre per missatge privat sense condicions ni factures"), q: 0, fx: bad(400, T("Vendes sense factura ni condicions: problemes fiscals i devolucions (−400 €).")) },
      { t: T("Penjar l'enllaç de la web a la bio i prou"), q: 0.5, fx: { money: 200, fee: true } }
    ] },
    { t: 'reward', money: 600 }
  ]
});
M('6.7', {
  title: T("Els clients com a prescriptors"), who: 'jordi', bg: 'restaurant', codes: ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8'],
  blurb: T("En Jordi vol que les opinions dels clients treballin a favor seu."),
  steps: [
    { t: 'dlg', lines: [['jordi.n', T("Després de la crisi, els clients ens tornen a estimar. Com fem que ho expliquin ells, i no nosaltres?")]] },
    { t: 'lesson', id: 'L_web20' },
    { t: 'choice', key: 'tm_jordi1', who: 'jordi', prompt: T("Quina estratègia 2.0 proposes?"), opts: [
      { t: T("Ressenyes i mapa integrats a la web, convidar a pujar fotos amb una etiqueta, respondre totes les opinions i un club d'ambaixadors"), q: 1, fx: good(50, { money: 700, fee: true }) },
      { t: T("Comprar 200 ressenyes de cinc estrelles"), q: 0, fx: bad(800, T("Google va eliminar les ressenyes falses i va penalitzar la fitxa; el client va reclamar (−800 €).")) },
      { t: T("Respondre només les opinions bones"), q: 0.5, fx: { rep: 0 } }
    ] },
    { t: 'choice', key: 'tm_jordi2', who: 'jordi', prompt: T("Un comparador de restaurants proposa una oferta creuada amb un celler. Com ho valores?"), opts: [
      { t: T("Bé, si el públic és el mateix i es mesura amb un codi propi: els consumidors proactius comparen i aprofiten ofertes creuades"), q: 1, fx: good(40) },
      { t: T("Malament: els comparadors sempre perjudiquen"), q: 0.5, fx: { rep: 0 } },
      { t: T("Acceptar-la sense mesurar res"), q: 0, fx: { rep: -1 } }
    ] },
    { t: 'reward', money: 600 }
  ]
});
M('7.6', {
  title: T("On mira l'usuari i on es perden els diners"), who: 'nuria', bg: 'botiga', codes: ['3.10', '3.9', '3.7', '3.11', '3.8'],
  blurb: T("La Núria ven més que mai, però la caixa no quadra i la web no converteix."),
  steps: [
    { t: 'dlg', lines: [['nuria.n', T("Les vendes pugen, però el compte del banc no. I a la web, molta gent posa fuets al carretó i marxa.")]] },
    { t: 'lesson', id: 'L_zones' },
    { t: 'choice', key: 'tm_nuria1', who: 'nuria', prompt: T("Què analitzes i canvies a la web?"), opts: [
      { t: T("Mapes de calor per veure les zones calentes, l'enviament refrigerat a dalt, compra com a convidat i àrea de client per repetir comandes"), q: 1, fx: good(50) },
      { t: T("Afegir més animacions a la pàgina d'inici"), q: 0, fx: { rep: -1 } },
      { t: T("Fer el logo més gran amb Photoshop"), q: 0.5, fx: { rep: 0 } }
    ] },
    { t: 'choice', key: 'tm_nuria2', who: 'nuria', prompt: T("Per què no quadra la caixa?"), opts: [
      { t: T("Perquè paga estoc i publicitat abans que la passarel·la ingressi els cobraments, i no compta comissions ni devolucions: cal un pla de flux de caixa setmanal"), q: 1, fx: good(50, { money: 800, fee: true }) },
      { t: T("Perquè ven massa"), q: 0, fx: { rep: -1 } },
      { t: T("Perquè cal pujar tots els preus un 30 %"), q: 0, fx: bad(300, T("La pujada de preus va fer caure les vendes i la Núria va reduir la quota (−300 €).")) }
    ] },
    { t: 'reward', money: 700 }
  ]
});
M('7.7', {
  title: T("Osona TV es reinventa"), who: 'xavi', bg: 'despatx', codes: ['1.15', '1.14'],
  blurb: T("La televisió local perd audiència a la TDT i vol créixer a internet."),
  steps: [
    { t: 'dlg', lines: [['xavi.n', T("La gent jove no mira la TDT. Tenim programes bons, però ningú no els troba. I els anunciants locals ja no ens truquen.")]] },
    { t: 'lesson', id: 'L_videotv' },
    { t: 'choice', key: 'tm_xavi1', who: 'xavi', prompt: T("Quina estratègia proposes?"), opts: [
      { t: T("Web TV a la carta i en directe, canal de YouTube, videoblog setmanal amb comerços, peces verticals subtitulades per a xarxes i publicitat interactiva HbbTV i a la TV connectada"), q: 1, fx: good(60, { money: 900, fee: true }) },
      { t: T("Pujar els programes sencers a YouTube sense editar"), q: 0.5, fx: { money: 200, fee: true } },
      { t: T("Tancar la TDT i fer només TikTok"), q: 0, fx: bad(500, T("La televisió va perdre els anunciants de sempre (−500 €).")) }
    ] },
    { t: 'reward', money: 700 }
  ]
});
