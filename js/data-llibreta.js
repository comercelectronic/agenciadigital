/* Agència Digital — Llibreta de clients: el que expliquen els clients i el que cal per a cada projecte i web.
   Es genera amb un script; cada secció s'apunta quan s'acaba el capítol (c) o s'obre el nivell del Taller web (w). */
window.GD = window.GD || {};

GD.llibreta = [
  { id: "carme", who: "carme", name: T("Forn de la Carme"), place: T("Carme · forn tradicional de barri a Vic"), ch: ["1.2", "1.3", "1.4", "2.5"], tasks: ["pla-forn", "campanya-forn", "web-1"], sec: [
    { c: "1.2", h: T("El negoci"), items: [
      T("Forn tradicional de barri a Vic. La Carme fa 30 anys que pasta."),
      T("Horari real: de 7 a 20 h (també a la tarda)."),
      T("Productes: pa, coca de vidre, pa de motlle i coques de llardons (aquestes s'esgoten sempre)."),
      T("Clients: gent gran del barri al matí; famílies de l'escola del costat a la tarda (cada cop menys)."),
      T("No vol ser «influencer»: no vol pagar fotos boniques si no ven ni una barra més. La meitat de les clientes tenen uns 70 anys."),
      T("Pressupost: 300 € com a màxim (diners de la clienta) i vol saber on va cada cèntim.")
    ] },
    { c: "1.2", h: T("Entrevista: el problema i les causes"), items: [
      T("Dimarts i dimecres de 16 a 19 h sobra producte. Al matí ho ven tot."),
      T("A la tarda sobren sobretot coca de vidre i pa de motlle."),
      T("La fitxa de Google diu «Obert de 7 a 14 h»: tothom creu que a la tarda és tancat. Només té dues ressenyes del 2019."),
      T("L'escola del costat ara surt a les 16:30 (abans sortia a les 17 h)."),
      T("Han obert un supermercat amb forn a la carretera."),
      T("Problema real: a la tarda entra menys gent perquè creu que és tancat i les famílies ja no hi passen a l'hora de berenar."),
      T("Què és un èxit per a la Carme: no haver de llençar pa els dimarts i que torni a entrar gent a la tarda.")
    ] },
    { c: "1.2", h: T("Objectiu acordat"), items: [
      T("Augmentar un 15 % les vendes de dimarts i dimecres de 16 a 19 h en 4 setmanes, comparant amb el mes anterior. Ho comprovarà amb la caixa.")
    ] },
    { c: "1.3", h: T("Per al pla de màrqueting"), items: [
      T("Ho vol per escrit, per ensenyar-ho al seu fill: què farem, per què, quant costa i com sabrà si ha funcionat."),
      T("Clar i sense paraulotes de màrqueting."),
      T("Els 300 € són per a la campanya. Els honoraris de l'agència van a part.")
    ] },
    { c: "1.4", h: T("Per a la campanya «Berenar de tarda»"), items: [
      T("Vol veure els anuncis de veritat abans que surtin."),
      T("Vol un cartell per a la sortida de l'escola: la gent gran no mira el mòbil."),
      T("Idea d'oferta: coca de vidre i suc a preu tancat, per aprofitar el que sobra a la tarda."),
      T("A la campanya del joc, els cupons i la fitxa de Google van portar gent a la botiga; els anuncis de xarxes van tenir moltes impressions però poques visites.")
    ] },
    { w: "1", h: T("Per a la web (Taller, nivell 1)"), items: [
      T("La gent li pregunta si té web. No vol res complicat: una sola pàgina."),
      T("Ha de sortir: l'horari (de 7 a 20 h), on és, un botó per trucar, fotos del pa i l'oferta del berenar."),
      T("Nom: Forn de la Carme, a Vic. Ha de funcionar bé al mòbil.")
    ] }
  ] },
  { id: "toni", who: "toni", name: T("Gimnàs Osona Fit"), place: T("Toni · gimnàs a Osona"), ch: ["1.5"], tasks: [], sec: [
    { c: "1.5", h: T("El que va passar"), items: [
      T("Volia anuncis immediatament: 600 € per a la campanya i 400 € per muntar-la."),
      T("L'objectiu real eren inscripcions al gimnàs, no m'agrada."),
      T("Lliçó: abans de muntar una campanya, cal definir l'objectiu i com es mesuraran les conversions.")
    ] }
  ] },
  { id: "jordi", who: "jordi", name: T("Can Jordi"), place: T("Jordi · restaurant a Tona"), ch: ["2.1", "5.2"], tasks: ["local-jordi", "web-2", "crisi-jordi"], sec: [
    { c: "2.1", h: T("El negoci"), items: [
      T("Restaurant a Tona. El cap de setmana s'omple amb famílies que pugen de Barcelona."),
      T("Fitxa de Google: 4,6 estrelles i 210 ressenyes."),
      T("Xarxes: 1.900 seguidors, la majoria de Barcelona. Publica fotos dels plats del cap de setmana."),
      T("Marge per menú: uns 6 €. Amb un 50 % de descompte, es perden 2,50 € per menú.")
    ] },
    { c: "2.1", h: T("Entrevista: el problema"), items: [
      T("Dilluns i dimarts el menjador és mig buit (al voltant del 25 % d'ocupació)."),
      T("La fitxa de Google no diu que hi ha menú de migdia entre setmana, no té botó per reservar i cap ressenya té resposta."),
      T("Hi ha un polígon industrial a 3 minuts amb centenars de treballadors que no saben que fan menú."),
      T("Reserves només per telèfon, i al migdia ningú no l'agafa perquè són a la cuina."),
      T("En Jordi volia publicar un plat cada dia a les xarxes, però els seguidors de Barcelona no vindran a dinar un dilluns a Tona.")
    ] },
    { c: "2.1", h: T("Per al projecte de SEO local i ressenyes"), items: [
      T("A Google surt per sota de tres restaurants que, segons ell, cuinen pitjor."),
      T("Vol saber exactament què ha de canviar a la fitxa, què ha de publicar i com respon les ressenyes."),
      T("La promoció ha de ser per al públic local (el polígon, els veïns), no per als seguidors de Barcelona.")
    ] },
    { w: "2", h: T("Per a la web (Taller, nivell 2)"), items: [
      T("Vol carta, menú del dia, fotos i que la gent pugui reservar sense trucar."),
      T("Ha de sortir a cerques com «restaurant Tona menú migdia».")
    ] },
    { c: "5.2", h: T("La crisi de reputació"), items: [
      T("Ha canviat la carta: ha tret els canelons de la iàia, ha apujat els preus un 20 % i hi ha un cambrer nou poc amable."),
      T("En una setmana, 23 ressenyes d'una estrella. Un perfil local amb 30.000 seguidors en parla."),
      T("En Jordi vol esborrar-ho tot i denunciar les ressenyes. Esborrar faria la crisi més gran.")
    ] }
  ] },
  { id: "miquel", who: "miquel", name: T("Mecanitzats Bellmunt"), place: T("Miquel · fàbrica al polígon de Gurb"), ch: ["2.2", "6.5"], tasks: ["b2b-miquel", "web-3"], sec: [
    { c: "2.2", h: T("El negoci"), items: [
      T("Fabriquen components de precisió per a maquinària. Tercera generació."),
      T("La web la va fer el seu nebot el 2011. Els comercials viuen de les fires i dels contactes de sempre."),
      T("No vol seguidors ni m'agrada: vol que el truquin compradors d'empreses que necessiten peces.")
    ] },
    { c: "2.2", h: T("Client ideal i números"), items: [
      T("Client ideal: fabricants de maquinària agrícola i alimentària de Catalunya i l'Aragó."),
      T("Decideixen els enginyers de producte i els responsables de compres. Tarden de 3 a 6 mesos a comprar."),
      T("Un client nou factura uns 25.000 € l'any, amb un 20 % de marge."),
      T("Pressupost de campanya: 3.000 € en 3 mesos (diners del client)."),
      T("Contacte qualificat: empresa del sector, amb una necessitat concreta i volum mínim. El comercial truca en menys de 24 h."),
      T("«Si em portes un informe de m'agrada, no cal que tornis. Els números que importen són comandes.»")
    ] },
    { w: "3", h: T("Per a la web (Taller, nivell 3)"), items: [
      T("La web del 2011 «fa vergonya»: en vol una de seriosa."),
      T("Pàgines de productes amb fitxes tècniques i un formulari que digui si qui escriu és un comprador de debò.")
    ] },
    { c: "6.5", h: T("Retenció"), items: [
      T("Diu que els informes són iguals cada mes i que Vidal & Co. l'ha trucat per oferir-li els seus serveis."),
      T("L'agència li ha portat 9 clients, amb 210.000 € de marge previst i un CAC mitjà d'1.300 €.")
    ] }
  ] },
  { id: "nuria", who: "nuria", name: T("Cansaladeria Núria"), place: T("Núria · cansaladeria al Mercadal de Vic"), ch: ["2.3", "5.1"], tasks: ["ecommerce-nuria", "web-4", "auditoria-nuria"], sec: [
    { c: "2.3", h: T("El negoci"), items: [
      T("Cansaladeria al Mercadal de Vic: el fuet de Vic de tota la vida."),
      T("Els clients que s'han mudat a Barcelona o a Girona el troben a faltar: vol vendre per internet."),
      T("Ella creu que n'hi ha prou amb «una web bonica amb fotos», però són productes que s'han de conservar en fred.")
    ] },
    { c: "2.3", h: T("Prova amb usuaris i números"), items: [
      T("De 10 usuaris, 9 afegeixen un producte al carretó i només 3 acaben la compra."),
      T("Motius d'abandonament: l'enviament de 9,90 € apareix per sorpresa al final, el pagament tarda 7 segons al mòbil i cal crear un compte."),
      T("Tiquet mitjà: 38 €. Marge per comanda: uns 7,50 € amb botiga pròpia (4,20 € en un marketplace)."),
      T("Ha d'explicar que el fuet arriba fresc i què passa amb els carretons abandonats: vol fitxes de producte ben fetes i correus automàtics.")
    ] },
    { w: "4", h: T("Per a la web (Taller, nivell 4)"), items: [
      T("Ja té clients de tot Catalunya: vol una botiga en línia de veritat, amb carretó i pagament."),
      T("Ha de quedar molt clar com funciona l'enviament en fred i quant costa abans de pagar.")
    ] },
    { c: "5.1", h: T("La campanya de Nadal que va fallar"), items: [
      T("2.000 € d'anuncis en 10 dies. La plataforma diu zero vendes i la Núria amenaça de cancel·lar el contracte."),
      T("La botiga sí que té 31 comandes, totes des d'ordinador i cap des del mòbil."),
      T("En actualitzar la web es va esborrar l'etiqueta de compra: la plataforma no veu les vendes."),
      T("El botó «Pagar» no respon en Android, i el 60 % del trànsit ve d'Android."),
      T("La segmentació (Catalunya, gastronomia) és correcta i els anuncis tenen un CTR del 2,8 %, que és bo.")
    ] }
  ] },
  { id: "sergi", who: "sergi", name: T("Cim Trail"), place: T("Sergi · roba de muntanya feta a Osona"), ch: ["2.4", "4.4", "5.3"], tasks: ["kpi-sergi", "web-5"], sec: [
    { c: "2.4", h: T("La campanya dels seguidors"), items: [
      T("Marca de roba de muntanya feta a Osona, amb botiga en línia."),
      T("L'última campanya: 8.000 seguidors nous en un mes. En Sergi la considerava un èxit."),
      T("El 72 % dels nous seguidors són de fora de l'Estat i van entrar pel sorteig d'un mòbil."),
      T("Visites des d'Instagram: 640. Vendes atribuïbles: 9. Vendes del mes: igual que l'any anterior."),
      T("Vol saber què ha de mirar cada setmana i tenir una pantalla per veure d'un cop d'ull si va bé.")
    ] },
    { w: "5", h: T("Per a la web (Taller, nivell 5)"), items: [
      T("Llança la col·lecció d'hivern i vol una pàgina de campanya amb un codi de descompte."),
      T("Aquest cop vol saber exactament quanta gent compra des d'Instagram.")
    ] },
    { c: "4.4", h: T("La base de correus"), items: [
      T("Volia comprar una base de 20.000 correus d'empreses per 200 €. Sense consentiment és un risc legal i el domini acaba marcat com a correu brossa.")
    ] },
    { c: "5.3", h: T("Les dades no quadren"), items: [
      T("Meta s'atribueix 120 vendes, Google 90 i el correu 40: en total, 250. Però la botiga n'ha fet 160."),
      T("En Sergi vol retallar el canal que funcioni pitjor. Les vendes reals de la botiga són la referència.")
    ] }
  ] },
  { id: "laia", who: "laia", name: T("Vidal & Co. (competència)"), place: T("Laia Vidal · agència de Barcelona"), ch: ["3.1", "3.2"], tasks: ["pitch-coop"], sec: [
    { c: "3.2", h: T("La competència i el concurs"), items: [
      T("Vidal & Co. és una agència de Barcelona amb un equip de cinc especialistes (SEO, publicitat, vídeo i comerç electrònic) i clients a tot l'Estat."),
      T("Al concurs de la cooperativa agrícola va presentar quaranta diapositives i vídeos."),
      T("No pots competir en tot: has de trobar on et diferencies (per exemple, coneixement local, proximitat, resposta ràpida o resultats mesurables)."),
      T("Prometre resultats impossibles («doblar les vendes en un mes») és irresponsable."),
      T("Per al pitch has d'analitzar agències competidores reals i explicar en 10 minuts on ets diferent.")
    ] }
  ] },
  { id: "quim", who: "quim", name: T("Soler Motor"), place: T("Quim Soler · cotxes de segona mà i recanvis a Manlleu"), ch: ["3.3", "5.4"], tasks: ["proposta-quim"], sec: [
    { c: "3.3", h: T("La petició"), items: [
      T("Cotxes de segona mà i recanvis, amb tres naus a Manlleu."),
      T("Vol «tot el digital»: web, xarxes, anuncis, vídeos, correus… i «alguna coseta més» que ja anirà dient."),
      T("Ofereix 1.500 € al mes i vol començar l'endemà.")
    ] },
    { c: "3.3", h: T("Els números de l'abast"), items: [
      T("«Tot el digital» són unes 70 h al mes. Amb un cost intern de 25 €/h, costa 1.750 € al mes: un marge del −17 %."),
      T("Opcions raonables: 4 serveis definits, 2 revisions per peça i 40 h/mes per 1.500 €, o tot l'abast detallat per 2.400 €/mes."),
      T("Si l'abast no queda escrit, acabarà demanant vídeos de TikTok i logos extra dins del mateix preu.")
    ] },
    { c: "5.4", h: T("Pagaments"), items: [
      T("Va deixar de pagar dues quotes: 3.000 €. Cal un calendari de pagament i aturar la feina nova fins que es compleixi.")
    ] }
  ] },
  { id: "agencia", who: "julia", name: T("La teva agència"), place: T("Júlia i Berta · l'equip de l'agència"), ch: ["4.1", "4.2", "4.3", "4.4", "4.5", "6.4", "7.3", "7.5"], tasks: ["continguts-berta", "processos-julia", "marca-agencia", "ia-berta", "portafoli-final", "web-6"], sec: [
    { c: "4.2", h: T("L'equip"), items: [
      T("Júlia Serra: analista de dades, cinc anys en una consultora de Barcelona."),
      T("Berta Puig: directora creativa, venia d'una agència de publicitat de Barcelona."),
      T("Equilibri a buscar: el que és bonic i el que funciona. Brief per a cada campanya i proves A/B quan hi hagi dubtes.")
    ] },
    { c: "4.3", h: T("Per al sistema de treball"), items: [
      T("Els clients envien peticions per WhatsApp, correu i telèfon, i ningú no sap qui fa què."),
      T("Errors recents: una factura amb el nom d'un altre client i una campanya publicada amb el preu antic."),
      T("Quim va canviar l'encàrrec tres vegades en una setmana."),
      T("La Júlia vol una plantilla de brief, un tauler on es vegi qui fa què i un flux d'aprovació clar.")
    ] },
    { c: "4.2", h: T("Per al calendari editorial"), items: [
      T("Cal publicar cada setmana per a tres clients: no es pot improvisar cada dilluns."),
      T("Tria un client del joc (la Carme, en Jordi, la Núria, en Sergi…) i fes servir el que saps d'ell a aquesta llibreta.")
    ] },
    { c: "4.4", h: T("Hores i automatització"), items: [
      T("Es dediquen 30 hores al mes a preparar informes i 15 a classificar contactes a mà."),
      T("Primer cal saber què és repetitiu i què necessita criteri humà.")
    ] },
    { c: "6.4", h: T("Per al manual de marca"), items: [
      T("«Si no sabem qui som, cada client ens farà ser una cosa diferent.»"),
      T("El manual ha de dir qui som, com parlem, com ens veiem i què no farem mai. Fes servir el camí i les decisions que has pres al joc.")
    ] },
    { w: "6", h: T("Per a la web de l'agència (Taller, nivell 6)"), items: [
      T("La web de l'agència és una plantilla de fa anys. Ha de ser la millor carta de presentació per aconseguir clients grans."),
      T("Portfolio amb casos dels clients del joc: problema, solució i resultats.")
    ] },
    { c: "7.5", h: T("Per al pla d'IA"), items: [
      T("Hi ha agències que ofereixen 100 publicacions al mes per 300 € fetes amb IA, i els clients pregunten."),
      T("La IA fa més ràpid, però pot inventar dades i cometre errors greus: cal supervisió humana, transparència i no posar-hi dades personals.")
    ] },
    { c: "8.1", h: T("Per al portafoli final"), items: [
      T("Recull els millors projectes aprovats, amb els comentaris del professor incorporats."),
      T("Cada cas: repte, què vas fer, resultat i què vas aprendre. Les xifres de cada client són en aquesta llibreta.")
    ] }
  ] },
  { id: "marta", who: "marta", name: T("Làctics de la Plana"), place: T("Marta Coll · directora de màrqueting"), ch: ["6.2"], tasks: ["informe-marta", "web-8"], sec: [
    { c: "6.2", h: T("El client gran"), items: [
      T("Volen una agència per a tot l'any: llançament de iogurts, botiga en línia i campanyes. Uns 6.000 € al mes d'honoraris."),
      T("Exigeixen informes mensuals al comitè, tres nivells d'aprovació i coordinació amb els equips de vendes i de qualitat."),
      T("«Si no hi ha informe, no ha passat.» El director general en llegeix una pàgina, no més."),
      T("Vol un informe mensual seriós: resultats, què hem après i què recomanem.")
    ] },
    { w: "8", h: T("Per a la web de llançament (Taller, nivell 8)"), items: [
      T("Llancen el nou iogurt de la Plana a tot Catalunya."),
      T("Vol una web que expliqui la història del producte mentre es fa scroll i que mesuri cada pas de l'embut.")
    ] }
  ] },
  { id: "amelie", who: "amelie", name: T("Cosmètica del Montseny"), place: T("Amélie · responsable del mercat francès"), ch: ["7.1", "7.2"], tasks: ["franca-amelie", "web-7"], sec: [
    { c: "7.1", h: T("El mercat francès"), items: [
      T("Volen vendre els seus sabons i cremes a França. La direcció pensava només a traduir la web i els anuncis."),
      T("Els francesos cerquen «cosmétique naturelle certifiée bio» i «savon saponifié à froid». La traducció literal del català gairebé no té cerques."),
      T("Competència: moltes marques franceses petites, totes amb certificació, amb preus un 10–15 % més alts."),
      T("Esperen l'entrega en 48–72 h i devolució gratuïta. Ara trigarien 6 dies."),
      T("Valoren les certificacions i els ingredients més que l'origen (el Montseny els importa menys).")
    ] },
    { c: "7.2", h: T("La prova i el pla"), items: [
      T("Opció prudent: una prova petita de 3.000 € entre França i Bèlgica, amb un criteri d'èxit definit abans de començar."),
      T("Amb poques vendes, les diferències entre països poden ser atzar: cal ampliar la prova abans de decidir."),
      T("La direcció vol veure el pla abans d'invertir, en un format que també entengui l'equip de França.")
    ] },
    { w: "7", h: T("Per a la web (Taller, nivell 7)"), items: [
      T("La campanya ha d'aterrar en una web en francès de veritat, no en una traducció automàtica."),
      T("Ha de complir les normes europees de cookies.")
    ] }
  ] }
];
GD.llibretaOf = (who) => GD.llibreta.find(c => c.who === who || (c.id === 'agencia' && (who === 'berta' || who === 'julia')));
