# Agència Digital — joc de màrqueting d'estètica anime

Un joc narratiu en català en què el jugador crea el seu personatge (nom, tractament i aspecte) i torna a Vic i munta una agència de màrqueting digital. Segueix el guió de campanya «Agència Digital» (versió 1.0): 8 etapes, 37 capítols, 32 lliçons i 5 finals.

Es juga des del navegador i es pot instal·lar com a app (PWA) al mòbil o a l'ordinador. Funciona sense connexió un cop carregat.

- **URL:** https://agenciadigitalosona.netlify.app (lloc de Netlify propi, independent de qualsevol altra web).
- **Instal·lar com a app:** a Android/Chrome/Edge surt el botó «📲 Instal·lar com a app». A l'iPhone/iPad: Safari → Compartir → «Afegeix a la pantalla d'inici».
- **Partida:** es desa automàticament al dispositiu. Per passar-la d'un dispositiu a un altre (web ↔ app), fes servir Empresa → Exportar / Importar partida.

## Idiomes

El joc i el panell del professor es poden fer servir en **català, castellà i anglès** (selector a la pantalla inicial, a la pestanya Empresa i al panell del professor). Per defecte s'usa l'idioma del navegador.

- El text original és en català dins dels fitxers de dades i de la interfície, embolcallat amb `T('…')`.
- `js/i18n.js` busca la traducció pel hash del text català als diccionaris `js/i18n-es.js` i `js/i18n-en.js`. Si una frase no té traducció, es mostra en català.
- Si canvies o afegeixes un text en català, cal afegir-ne la traducció als diccionaris (la clau és `T.hash('text català')`).

## Personatge i resultats per al professorat

- **Creació del personatge:** en començar, l'alumne tria nom, cognom, tractament (masculí «en», femení «la» o neutre sense article), un dels 14 pentinats, el color dels cabells i dels ulls (amb mostres o qualsevol color amb el selector 🎨), el to de pell, el color de la roba (o «Auto», que canvia amb el rang) i diversos complements combinables (ulleres, gorra, boina, diadema, llaç, auriculars, arracades, bufanda, pigues, barba). El nom i el tractament substitueixen «Pau» a tot el guió (marcadors `{nom}`, `{nomc}`, `{en}`, `{En}`, `{den}` i `{g:masculí|femení|neutre}` als fitxers de dades). Es pot canviar després des de la pestanya del personatge.
- **Codi de classe:** si l'alumne escriu el codi que li dona el professor, els resultats s'envien automàticament cada vegada que acaba un capítol o una lliçó (funció `netlify/functions/joc-resultats.js`, desada a Netlify Blobs). Sense connexió, pot descarregar un fitxer de resultats des de la pestanya Empresa.
- **Panell del professor:** `/professor.html`. Amb la contrasenya, mostra els alumnes (filtrables per classe), el detall de cada un (lliçons amb primer intent, millor resultat i intents; habilitats; decisions clau) i exporta-ho tot a un CSV per a Excel amb una columna per lliçó. També accepta els fitxers que hagin descarregat els alumnes.
- **Temari:** cada lliçó, missió, projecte, nivell del taller web i acció del món està etiquetat amb els punts del temari que treballa (1.1–5.9; vegeu [TEMARI.md](TEMARI.md)). Els punts amb tecnologies antiquades (TDT, IRC, web 2.0, FTP...) es treballen amb les eines actuals (TV connectada, chatbots d'IA, contingut dels usuaris, publicació amb Git...), i la Biblioteca ho explica a «Com es treballa avui». L'alumne veu els punts treballats a la Biblioteca. El CSV general afegeix una columna de percentatge per punt i el codi del punt a cada columna de projecte, web, lliçó i decisió; el botó **CSV per punts del temari** exporta una fila per alumne, punt i contingut (bloc, punt, títol, tipus de contingut, contingut, resultat i puntuació).
- **Contrasenya:** variable d'entorn `TEACHER_PASSWORD` del lloc de Netlify (obligatòria perquè funcioni el panell).
- **Dades personals:** només s'envia el nom i cognom que escrigui l'alumne i els resultats del joc. No es demana correu ni cap altra dada.

## Classe: rànquing i mercat entre agències

Pestanya 🏆 **Classe** (també a la Cambra de Comerç de Vic i a l'ordinador del despatx). Cal el codi de classe.

- **Rànquing** de la classe per punts globals, reputació, liquiditat, projectes, nivell o capítols. Mostra el nom i la inicial del cognom, l'agència i la seva especialitat (habilitat més alta).
- **Mercat:** cada agència juga en el seu propi món, però pot proposar tractes a una altra: contractar-li un servei (vídeo, web, anuncis, analítica, traducció...) o oferir-n'hi un. El preu es negocia amb fins a quatre contraofertes; els tractes caduquen en 7 dies. En tancar-se, qui contracta paga i guanya reputació (més si l'altra agència és especialista en el servei) i qui fa la feina cobra i guanya experiència.
- **Recomanacions:** cada alumne en pot fer 3; l'agència recomanada guanya reputació.
- El professorat veu tots els tractes i recomanacions de la classe al panell (secció «Mercat entre agències»).
- Funció `netlify/functions/joc-classe.js`; dades a Netlify Blobs (`joc-mercat`). Als companys no se'ls mostra mai l'identificador secret de cada alumne.

## Món explorable (estil RPG)

En sortir d'una missió, l'alumne es mou per **Vic** en vista zenital (fletxes o WASD, tocar el mapa o la creu de control al mòbil; A/Espai per parlar i mirar, B per a la llibreta, Esc per al menú). Pot entrar al despatx, al forn de la Carme, a la cansaladeria, al súper, al bar, a la merceria, a Cim Trail, al recinte firal i, en bus, a Tona (Can Jordi) i al polígon de Gurb (Mecanitzats Bellmunt).

- **Missions:** el capítol següent apareix marcat amb ❗ o ✦ (amb una fletxa si és fora de la pantalla); en parlar-hi comença l'escena cara a cara. Els projectes pendents es marquen amb 📋.
- **Pistes:** mirant coses dels negocis i parlant amb la gent es descobreix informació útil (la fitxa de Google errònia, la lleixa plena a la tarda, el súper nou, el polígon de Tona...). A les investigacions dels capítols ja surt com a sabuda i no gasta temps.
- **Botiguers amb ❗:** petits encàrrecs de consultoria; les bones recomanacions es cobren i les dolentes fan perdre diners.
- **Accions de màrqueting reals:** corregir la fitxa de Google del forn, fer fotos de producte, repartir cupons a la sortida de l'escola (minijoc de 40 s), demanar ressenyes a Can Jordi i dissenyar el cartell de la cansaladeria.
- **Despatx:** l'ordinador obre campanya, projectes, millores, taller i finances; el prestatge, la biblioteca; el telèfon, els projectes; la pissarra, la llibreta.
- Codi a `js/world.js` (mapes, art en píxel generat amb codi i contingut del món).

## Millores de l'agència

A Empresa → 🛒 **Millores**: eines (Canva Pro, analítica, CRM, gestor de projectes, certificacions), equip (becari, videògraf, comercial), publicitat de l'agència (fitxa de Google, web, LinkedIn, patrocini) i local (rètol, cafetera, ordinador, despatx renovat). Tenen cost inicial i, sovint, quota mensual. Les bonificacions d'habilitat compten a les missions (desbloquegen opcions i milloren els resultats de les campanyes); d'altres pugen els honoraris, els ingressos dels clients recurrents, l'experiència o la reputació. Les millores es veuen al despatx del món. Dades a `js/data-upgrades.js`.

## Economia exigent i fallida

- **Tests de les lliçons:** cada lliçó té 5 preguntes (3 de concepte i 2 de casos reals d'empreses: Kodak, Zara, Amazon, Patagonia, KFC...). Cada pregunta té 4 opcions semblants, en ordre aleatori. Cada resposta incorrecta costa diners (30 € a l'etapa 1 i 20 € més a cada etapa), també als tests del món: estudiar té un cost.

Els errors econòmics costen diners: treballar gratis, acceptar feines sense capacitat, comprar bases de dades, campanyes fallides (compensació al client), préstecs amb interessos... Si la liquiditat (diners + reserva) queda en negatiu, **l'agència fa fallida** i cal començar de zero (es conserven el personatge, el codi de classe, els projectes reals i les webs del Taller). El professorat veu el nombre de fallides de cada alumne.

## Progressió: 100 nivells

- El personatge pot pujar fins al **nivell 100**, però a poc a poc: cada nivell costa 266 + 6 × nivell EXP. En acabar cada etapa s'arriba al nivell que demana la següent (1, 5, 13, 20, 27, 35, 42 i 50). Fent tota la campanya, els projectes i les webs s'arriba al voltant del nivell 55-60 (uns 70 amb bonificacions d'experiència): el 100 és un repte.
- Cada nivell dona **5 punts d'habilitat** (495 en total). Cada habilitat té **100 nivells**; la història les llegeix en una escala de 0 a 5 (cada 20 nivells, 1 punt), i les bonificacions (honoraris, despeses, qualitat) creixen nivell a nivell.
- Els Comerçmons pugen fins al nivell 50 (la seva experiència és independent de la del personatge).
- Les partides començades es converteixen soles quan l'alumne torna a obrir el joc (també les desades al núvol i les importades): es recalcula el nivell amb la mateixa experiència total i les habilitats passen a l'escala de 100 mantenint el percentatge. El resum s'envia al professor de seguida.

## Comptes dels alumnes (usuari i contrasenya)

- Cada alumne **crea un compte** la primera vegada (nom, usuari, contrasenya i codi de grup) i després **entra amb usuari i contrasenya** des de qualsevol dispositiu.
- La partida es **desa al núvol** automàticament (i també al dispositiu). Si juga en un altre ordinador o mòbil, continua on ho havia deixat.
- El **grup** el tria l'alumne en crear el compte, però a partir d'aquí només el pot canviar el professor: panell del professor → **👥 Comptes dels alumnes** → «Canviar grup». Els resultats i les revisions dels projectes passen al grup nou, i el joc de l'alumne s'actualitza sol.
- Si un alumne oblida la contrasenya, el professor li'n posa una de nova des del mateix panell (les sessions obertes es tanquen).
- Contrasenyes desades amb scrypt; sessions signades amb HMAC (variable `SESSION_SECRET` opcional; si no hi és, es deriva de `TEACHER_PASSWORD`). Funció: `netlify/functions/joc-compte.js`, magatzems Blobs `joc-comptes` i `joc-partides`.

## Món ampliat, combats i agències rivals

- **Món més gran:** a més de Vic, Tona, Gurb i el recinte firal, hi ha el **Parc de la Devesa** (caminant pel passeig del riu cap a l'oest), el **Montseny** (bus, etapa 2), **Barcelona · districte digital** (tren des de l'estació de Vic, etapa 4) i el **Port de Barcelona** (caminant des de Barcelona, etapa 6).
- **Hàbitats:** cada espècie viu en una o dues zones (`js/data-mon-world.js`). Els Comerçmons es veuen passejant per l'herba alta i canvien cada 15 minuts: mai surten tots alhora. Els llegendaris només apareixen en llocs especials quan ja compleixes les condicions.
- **Capturar:** un Comerçmon només s'uneix a l'agència si ja confia en tu (les mateixes condicions de progrés d'abans), li guanyes un combat i encertes el repte de coneixement. Si encara no confia en tu, fuig però queda registrat com a vist a la Comerçdex, amb el lloc on viu.
- **Combats per torns** (`js/cm-battle.js`): fins a 3 Comerçmons per bàndol (l'equip actiu), atacs del catàleg amb energia i recuperació, avantatges d'element i canvis. Els **atacs especials demanen respondre una pregunta** de les lliçons: si l'encertes, fan un 20 % més; si no, l'atac no surt. El motor és determinista (llavor pròpia) perquè el servidor pugui tornar a jugar els combats en la fase de PvP.
- **Entrenadors:** personatges del joc (Júlia, Toni, Quim, Jordi, Miquel, Laia, Sergi, Marta, Amélie i Ramon) accepten combats d'entrenament amb equips que s'adapten al teu nivell. La primera victòria del dia contra cada entrenador dona experiència extra; com a màxim 12 combats al dia donen experiència.
- **Agències rivals (reptes finals):** 8 agències de màrqueting professionals (Arrel Branding, Ona Social, Vidal & Co., Engranatge B2B, Cim Creatiu, Clic & Data, Port Global i Zenit Group). Cada una s'obre en superar una etapa, té dos combats seguits i **demana un equip amb habilitats concretes** (elements amb avantatge, famílies, habilitats passives, rareses o nivell). Guanyar-les dona un segell i un premi en diners validat pel servidor (una sola vegada per agència).
- **Equilibri:** cada espècie i forma té un petit ajust de dany calculat amb simulacions perquè cap domini (`tests/combat.test.js` ho comprova).

## Economia validada al servidor, impostos i guardiola de la classe (pendent d'activar)

> **Estat:** el codi és a `economia-servidor/` i **no es desplega**, perquè Netlify Database requereix un pla amb crèdits i feia fallar el desplegament. Mentrestant el joc funciona igual, amb els diners calculats al navegador i sense impostos. Per activar-la, vegeu `economia-servidor/README.md`.

Tots els diners del joc (una sola moneda: els euros de l'agència) es validen al servidor amb **Netlify Database** (Postgres):

- Cada cobrament o despesa s'envia a la funció `joc-economia` amb una clau d'idempotència: si arriba dues vegades, només compta una.
- El servidor comprova els límits: un encàrrec, un tracte del mercat o un botiguer només es cobren una vegada; els projectes i les webs només es poden cobrar si hi ha una nota aprovada al servidor, i com a màxim el que correspon a aquella nota; hi ha límits per capítol, per setmana de clients i diaris.
- Els moviments es desen en un **llibre comptable que no es pot modificar ni esborrar** (ho impedeix la base de dades). El saldo es pot recalcular sempre a partir del llibre (auditoria al panell del professor).
- Cada ingrés paga un **impost** (per defecte un 5 %; el professor pot definir trams marginals de fins a un 50 %). Els impostos van a la **guardiola comuna de la classe**, que es repartirà en concursos de coneixements (guanya qui encerta més preguntes, mai a l'atzar).
- Els alumnes nous queden **pendents de validar**: poden jugar, però les operacions no compten fins que el professor els valida al panell (o activa la validació automàtica).
- Si el saldo del servidor i el del joc no coincideixen, mana el del servidor.

Al panell del professor, amb un codi de classe, apareix la secció **🏦 Economia de la classe**: validar o bloquejar alumnes, configurar impostos i capital inicial, veure la guardiola, el llibre comptable de cada alumne, les operacions rebutjades (amb el motiu) i el registre de canvis del professorat.

> Les partides començades abans d'aquesta versió s'han de tornar a començar perquè el saldo quedi validat des del principi.

## Correcció automàtica dels projectes (IA)

Quan l'alumne entrega un projecte, la funció `netlify/functions/joc-correccio-background.js` descarrega el document (Google Docs, Slides, Sheets, fitxers de Drive, PDF, imatges o webs públiques), el fa corregir a Claude amb la **rúbrica** del projecte (cada criteri de 0 a 3 punts; nota sobre 10; s'aprova amb un 5) i desa la nota, el nivell de cada criteri i la retroacció. L'alumne la veu al joc en pocs minuts i, si aprova, pot continuar. **El professor sempre la pot modificar** des del panell (llista «Corregits automàticament», on pot validar-la o canviar nivells, nota i comentaris). Si el document és privat, és una carpeta o no es pot llegir, el projecte queda pendent del professor i l'alumne en veu el motiu.

- Fa servir el **Netlify AI Gateway** (cal un pla de Netlify basat en crèdits i almenys un desplegament de producció) o, si ho prefereixes, la variable d'entorn `ANTHROPIC_API_KEY` amb una clau pròpia.
- Si la IA no està disponible, tot continua funcionant amb revisió manual del professor.

## Projectes reals (obligatoris, revisats pel professorat)

Pestanya 📋 **Projectes**: 17 lliuraments de feina real repartits per tota la campanya (pla de màrqueting i campanya amb anuncis del forn, SEO local, campanya B2B, botiga en línia i correus, quadre de comandament, pitch, proposta comercial, calendari de continguts, sistema de treball, auditoria, gestió de crisi, informe executiu, manual de marca, llançament a França, pla d'IA i portafoli final).

- Cada projecte s'activa en acabar un capítol i **cal entregar-lo per jugar el capítol següent**, però no cal esperar la revisió: la IA el corregeix en pocs minuts i el professor en valida o canvia la nota quan vol. Si la IA o el professor demanen canvis, l'alumne rep un avís (al món, a la campanya i a la pestanya Projectes) i el torna a entregar sense quedar-se aturat. La recompensa del client arriba quan el projecte s'aprova. Si el servei d'IA falla, el joc torna a demanar la correcció automàticament.
- L'alumne fa el document de veritat (Google Docs, Slides, Canva, eines d'anuncis...), l'entrega amb l'enllaç, marca les seccions, escriu un resum i indica l'ús d'IA. Cal el codi de classe.
- **Guia completa** a `/guia.html` (també imprimible): què ha de contenir cada projecte, passos, eines, criteris d'avaluació, consells i plantilla per copiar.
- **Professorat:** al panell apareix «Projectes per revisar». Cada revisió mostra l'enllaç, el resum, els criteris d'avaluació (els que no es marquen s'afegeixen als comentaris), comentaris i nota opcional de 0 a 10. Es pot aprovar o demanar canvis; l'alumne ho veu al joc i ho pot tornar a entregar. Els estats i les notes surten al CSV.
- Contingut a `js/data-projects.js`; revisions a Netlify Blobs (`joc-revisions`).

## Taller web (opcional)

Pestanya 🛠️ **Taller**: un curs a part on l'alumne aprèn a crear webs professionals per als clients de l'agència. No és obligatori: la campanya avança igual sense fer-lo, però cada web entregada dona EXP, diners, reputació i confiança.

- **Plataformes:** Wix, WordPress, Webflow, Shopify i Codi + IA (HTML/CSS/JS publicat a Netlify, GitHub Pages o Vercel). L'alumne en tria una o diverses i ho pot canviar quan vulgui; cada nivell mostra la guia pas a pas de les plataformes triades.
- **8 nivells de complexitat creixent:** landing de la fleca → web del restaurant amb reserves i SEO → web corporativa B2B → botiga en línia → landing de conversió amb analítica i UTM → web de marca de l'agència (portafoli, accessibilitat, rendiment) → web multilingüe per a França (hreflang, galetes) → projecte final de scrollytelling. Cada nivell inclou conceptes, una pauta d'animació i un consell professional.
- **Entrega:** l'alumne enganxa l'enllaç públic de la web, marca els requisits del client, explica com l'ha feta (i opcionalment deixa una nota, p. ex. la contrasenya de la botiga). Entregar un nivell desbloqueja el següent. El joc comprova si l'enllaç respon; si no, l'alumne pot entregar igualment i el professor ho veu marcat amb ⚠️.
- **Professorat:** columna «Webs» a la taula, apartat «Taller web» al detall de cada alumne amb tots els enllaços clicables i les reflexions, i columnes per nivell (plataforma i enllaç) al CSV.
- Contingut a `js/data-web.js` (`GD.webPlatforms`, `GD.webLevels`).

## Què hi ha al joc

> Els encàrrecs lliures (pestanya 📨 Encàrrecs) s'han tret del joc: l'experiència i els diners venen de la campanya, els projectes reals, el Taller, els botiguers i el món.


| Sistema | On és |
|---|---|
| Campanya de 8 etapes amb gating per nivell (1, 4, 7, 11, 15, 19, 23, 27) | `js/data-story1.js` (etapes 1–2), `js/data-story2.js` (3–5), `js/data-story3.js` (6–8) |
| Estructura de missió: narració → investigació → lliçó → decisió → resultats simulats → recompensa | Tipus de pas `dlg`, `invest`, `lesson`, `choice`/`budget`/`multi`, `sim`, `reward` a `js/game.js` |
| Biblioteca de lliçons amb exercicis, retroacció i repàs | `js/data-lessons.js` |
| Temari: punts 1.1–5.9, etiquetes de cada contingut, 21 lliçons i 14 missions del temari (dues per etapa, de 1.6–1.7 a 7.6–7.7) | `js/data-temari.js`, [TEMARI.md](TEMARI.md) |
| Millora del personatge: nivells 1–30, EXP, punts d'habilitat (5 habilitats × 5 nivells), rangs i vestuari que evoluciona | `js/game.js` (SKILLS, RANKS) i `js/art.js` (PAU_OUTFITS) |
| Variables persistents: reputació, confiança per personatge, coneixement per àrea, liquiditat, reserva, clients recurrents, equip, historial de decisions | estat `S` a `js/game.js` |
| Economia setmanal: quotes recurrents, lloguer, eines i sous; els pressupostos dels clients no compten com a ingressos | `advanceWeeks()` a `js/game.js` |
| 5 finals segons la decisió final i l'estat de l'empresa | `GD.computeEnding` i `GD.endings` a `js/data-story3.js` |
| Retrats anime i escenaris generats en SVG (sense imatges externes) | `js/art.js` |

Totes les empreses, els personatges i els resultats de les campanyes són ficticis i simulats.

## Publicació a Netlify

1. Netlify → **Add new project → Import an existing project → GitHub** → repositori `agenciadigital`.
2. **Branch to deploy:** `main` (deixa la resta com està: `netlify.toml` ja diu que es publica l'arrel i on és la funció).
3. **Project name:** `agenciadigitalosona` → l’adreça és `https://agenciadigitalosona.netlify.app`.
4. **Environment variables:** afegeix `TEACHER_PASSWORD` amb la contrasenya del professorat i torna a desplegar.

Netlify Blobs (on es desen els resultats) s'activa sol, no cal configurar res més.

**Base de dades de l'economia:** de moment no s'utilitza (vegeu `economia-servidor/README.md`).

## Desenvolupament

No hi ha cap pas de compilació: són fitxers estàtics. Per provar-lo en local:

```sh
python3 -m http.server 8000
# obre http://localhost:8000/ (el panell del professor necessita `netlify dev`)
```

Tests (necessiten `npm install`):

```sh
node tests/comercmons.test.js         # catàleg i equilibri dels Comerçmons
node tests/combat.test.js             # motor de combat, hàbitats, entrenadors i agències rivals
(cd economia-servidor && npm install && npm test)   # economia validada al servidor (Postgres local)
```

Si canvies fitxers del joc, puja la versió de `CACHE` a `sw.js` perquè les apps instal·lades descarreguin la versió nova.

## Comerçmons i Comerçdex

Criatures col·leccionables del món del comerç i el màrqueting (pestanya 🐾 **Comerçdex**).

- **Catàleg** (`js/data-comercmons.js`): 37 espècies de la generació 1 (12 inicials del document de disseny, 21 més i 4 llegendaris empresarials: Monopolion, Disruptor, Globàlia i Líderax), amb 94 formes. Cada espècie té família, especialitat, element, raresa, perfil d'estadístiques, habilitat passiva, atacs (cost, potència, precisió i recuperació), evolucions amb nivell i condicions, condició de captura, descripció, personalitat i utilitat.
- **Equilibri**: totes les espècies sumen les mateixes estadístiques a la forma final, repartides segons el perfil (atacant, resistent, ràpid, estratega, suport, equilibrat). La raresa dona passives i atacs més potents, no força bruta. Cada element és fort contra dos i feble contra dos. `node tests/comercmons.test.js` comprova que cap espècie no superi una altra en totes les estadístiques.
- **Captura**: depèn del progrés real (capítols, lliçons, projectes, webs, botiguers, nivell, setmanes i **dies diferents de joc**) i d'un repte de coneixement. Si falles, el Comerçmon torna d'aquí a una hora. Els rars, èpics i llegendaris demanen diversos dies de joc.
- **Equip** de 3: les passives donen bonificacions a l'experiència, els clients recurrents, els projectes, les missions, els botiguers, el cost dels tests, les despeses o la reputació (límit del 25 % per tipus). Hi ha 12 sinergies de parella i bonificacions per família o per elements diferents.
- **Nivells i evolució**: fins al nivell 50; els de l'equip reben el 40 % de l'experiència del jugador i poden fer un entrenament diari. Algunes evolucions demanen condicions especials.
- **Il·lustracions** (`js/art-comercmons.js`): SVG generat amb una mateixa línia artística a partir de la descripció `look` de cada forma.
- **Noves generacions**: crea un fitxer que cridi `GD.cmRegister([...])` amb el mateix format i afegeix-lo a `index.html` i `sw.js`.
- **Pendent**: validació al servidor (captures, evolucions i recompenses), combats entre jugadors, tornejos, missions diàries, impostos, guardiola i concursos. Necessiten una base de dades transaccional (veure la proposta d'arquitectura).

