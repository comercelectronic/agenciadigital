# Agència Digital — joc de màrqueting d'estètica anime

Un joc narratiu en català en què el jugador crea el seu personatge (nom, tractament i aspecte) i torna a Vic i munta una agència de màrqueting digital. Segueix el guió de campanya «Agència Digital» (versió 1.0): 8 etapes, 37 capítols, 32 lliçons, 13 encàrrecs repetibles i 5 finals.

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
- **Codi de classe:** si l'alumne escriu el codi que li dona el professor, els resultats s'envien automàticament cada vegada que acaba un capítol, un encàrrec o una lliçó (funció `netlify/functions/joc-resultats.js`, desada a Netlify Blobs). Sense connexió, pot descarregar un fitxer de resultats des de la pestanya Empresa.
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
- **Despatx:** l'ordinador obre campanya, projectes, millores, taller i finances; el prestatge, la biblioteca; el telèfon, els encàrrecs; la pissarra, la llibreta.
- Codi a `js/world.js` (mapes, art en píxel generat amb codi i contingut del món).

## Millores de l'agència

A Empresa → 🛒 **Millores**: eines (Canva Pro, analítica, CRM, gestor de projectes, certificacions), equip (becari, videògraf, comercial), publicitat de l'agència (fitxa de Google, web, LinkedIn, patrocini) i local (rètol, cafetera, ordinador, despatx renovat). Tenen cost inicial i, sovint, quota mensual. Les bonificacions d'habilitat compten a les missions (desbloquegen opcions i milloren els resultats de les campanyes); d'altres pugen els honoraris, els encàrrecs, l'experiència o la reputació. Les millores es veuen al despatx del món. Dades a `js/data-upgrades.js`.

## Economia exigent i fallida

- **Tests de les lliçons:** cada lliçó té 5 preguntes (3 de concepte i 2 de casos reals d'empreses: Kodak, Zara, Amazon, Patagonia, KFC...). Cada pregunta té 4 opcions semblants, en ordre aleatori. Cada resposta incorrecta costa diners (30 € a l'etapa 1 i 20 € més a cada etapa), també a les preguntes de repàs dels encàrrecs i als tests del món: estudiar té un cost.

Els errors econòmics costen diners: treballar gratis, acceptar feines sense capacitat, comprar bases de dades, campanyes fallides (compensació al client), encàrrecs mal resolts (devolució), préstecs amb interessos... Si la liquiditat (diners + reserva) queda en negatiu, **l'agència fa fallida** i cal començar de zero (es conserven el personatge, el codi de classe, els projectes reals i les webs del Taller). El professorat veu el nombre de fallides de cada alumne.

## Correcció automàtica dels projectes (IA)

Quan l'alumne entrega un projecte, la funció `netlify/functions/joc-correccio-background.js` descarrega el document (Google Docs, Slides, Sheets, fitxers de Drive, PDF, imatges o webs públiques), el fa corregir a Claude amb la **rúbrica** del projecte (cada criteri de 0 a 3 punts; nota sobre 10; s'aprova amb un 5) i desa la nota, el nivell de cada criteri i la retroacció. L'alumne la veu al joc en pocs minuts i, si aprova, pot continuar. **El professor sempre la pot modificar** des del panell (llista «Corregits automàticament», on pot validar-la o canviar nivells, nota i comentaris). Si el document és privat, és una carpeta o no es pot llegir, el projecte queda pendent del professor i l'alumne en veu el motiu.

- Fa servir el **Netlify AI Gateway** (cal un pla de Netlify basat en crèdits i almenys un desplegament de producció) o, si ho prefereixes, la variable d'entorn `ANTHROPIC_API_KEY` amb una clau pròpia.
- Si la IA no està disponible, tot continua funcionant amb revisió manual del professor.

## Projectes reals (obligatoris, revisats pel professorat)

Pestanya 📋 **Projectes**: 17 lliuraments de feina real repartits per tota la campanya (pla de màrqueting i campanya amb anuncis del forn, SEO local, campanya B2B, botiga en línia i correus, quadre de comandament, pitch, proposta comercial, calendari de continguts, sistema de treball, auditoria, gestió de crisi, informe executiu, manual de marca, llançament a França, pla d'IA i portafoli final).

- Cada projecte s'activa en acabar un capítol i **bloqueja el capítol següent fins que el professor l'aprova**. Mentrestant, l'alumne pot fer encàrrecs, lliçons i el Taller web.
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

| Sistema | On és |
|---|---|
| Campanya de 8 etapes amb gating per nivell (1, 4, 7, 11, 15, 19, 23, 27) | `js/data-story1.js` (etapes 1–2), `js/data-story2.js` (3–5), `js/data-story3.js` (6–8) |
| Estructura de missió: narració → investigació → lliçó → decisió → resultats simulats → recompensa | Tipus de pas `dlg`, `invest`, `lesson`, `choice`/`budget`/`multi`, `sim`, `reward` a `js/game.js` |
| Biblioteca de lliçons amb exercicis, retroacció i repàs | `js/data-lessons.js` |
| Temari: punts 1.1–5.9, etiquetes de cada contingut, 21 lliçons i 14 missions del temari (dues per etapa, de 1.6–1.7 a 7.6–7.7) | `js/data-temari.js`, [TEMARI.md](TEMARI.md) |
| Millora del personatge: nivells 1–30, EXP, punts d'habilitat (5 habilitats × 5 nivells), rangs i vestuari que evoluciona | `js/game.js` (SKILLS, RANKS) i `js/art.js` (PAU_OUTFITS) |
| Variables persistents: reputació, confiança per personatge, coneixement per àrea, liquiditat, reserva, clients recurrents, equip, historial de decisions | estat `S` a `js/game.js` |
| Economia setmanal: quotes recurrents, lloguer, eines i sous; els pressupostos dels clients no compten com a ingressos | `advanceWeeks()` a `js/game.js` |
| Encàrrecs lliures repetibles (EXP i diners extra, amb preguntes de repàs) | `GD.gigs` a `js/data-story3.js` |
| 5 finals segons la decisió final i l'estat de l'empresa | `GD.computeEnding` i `GD.endings` a `js/data-story3.js` |
| Retrats anime i escenaris generats en SVG (sense imatges externes) | `js/art.js` |

Totes les empreses, els personatges i els resultats de les campanyes són ficticis i simulats.

## Publicació a Netlify

1. Netlify → **Add new project → Import an existing project → GitHub** → repositori `agenciadigital`.
2. **Branch to deploy:** `main` (deixa la resta com està: `netlify.toml` ja diu que es publica l'arrel i on és la funció).
3. **Project name:** `agenciadigitalosona` → l’adreça és `https://agenciadigitalosona.netlify.app`.
4. **Environment variables:** afegeix `TEACHER_PASSWORD` amb la contrasenya del professorat i torna a desplegar.

Netlify Blobs (on es desen els resultats) s'activa sol, no cal configurar res més.

## Desenvolupament

No hi ha cap pas de compilació: són fitxers estàtics. Per provar-lo en local:

```sh
python3 -m http.server 8000
# obre http://localhost:8000/ (el panell del professor necessita `netlify dev`)
```

Si canvies fitxers del joc, puja la versió de `CACHE` a `sw.js` perquè les apps instal·lades descarreguin la versió nova.
