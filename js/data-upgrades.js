/* Agència Digital — millores de l'agència: eines, equip, publicitat pròpia i local.
   Cada millora té un cost inicial i, sovint, una quota mensual. Les bonificacions d'habilitat compten a les missions
   (opcions bloquejades, resultats de les campanyes), i la resta milloren honoraris, encàrrecs, experiència o reputació. */
window.GD = window.GD || {};

GD.upgradeCats = [
  { id: 'eines', i: '🧰', n: T("Eines") },
  { id: 'equip', i: '👥', n: T("Equip") },
  { id: 'publicitat', i: '📣', n: T("Publicitat de l'agència") },
  { id: 'local', i: '🏢', n: T("Local i equipament") }
];

// bonus: { skill: { habilitat: punts }, fee: % honoraris, gig: % encàrrecs, xp: % experiència } · rep: reputació en comprar-la
GD.upgrades = [
  { id: 'canva', cat: 'eines', i: '🎨', n: T("Canva Pro i banc d'imatges"), d: T("Plantilles, marca coherent i imatges amb llicència per a les peces dels clients."), use: T("Opcions creatives i millors resultats a les campanyes amb anuncis."), price: 120, monthly: 15, bonus: { skill: { creativitat: 1 } } },
  { id: 'analytics', cat: 'eines', i: '📊', n: T("Analítica professional (GA4, Looker Studio i formació)"), d: T("Quadres de comandament automàtics i mesura de conversions per a cada client."), use: T("Desbloqueja opcions d'analítica a les etapes 3, 5 i 6 i millora els informes."), price: 400, monthly: 30, bonus: { skill: { analitica: 1 } } },
  { id: 'crm', cat: 'eines', i: '📇', n: T("CRM per gestionar clients i contactes"), d: T("Seguiment de propostes, recordatoris i historial de cada client."), use: T("Més honoraris en negociar i opcions comercials a les missions."), price: 300, monthly: 45, stage: 2, bonus: { skill: { comercial: 1 }, fee: 5 } },
  { id: 'gestio', cat: 'eines', i: '🗂️', n: T("Gestor de projectes i automatitzacions"), d: T("Tauler de tasques, plantilles i informes que s'envien sols."), use: T("Opcions de gestió a les etapes 4 i 5: menys errors quan hi ha molta feina."), price: 250, monthly: 40, stage: 3, bonus: { skill: { gestio: 1 } } },
  { id: 'formacio', cat: 'eines', i: '🎓', n: T("Certificacions de Google Ads i Meta"), d: T("Cursos oficials i examen. Una tarda a la setmana durant un mes."), use: T("Millora l'estratègia de les campanyes i l'experiència que guanyes."), price: 350, monthly: 0, stage: 2, bonus: { skill: { estrategia: 1 }, xp: 10 } },
  { id: 'becari', cat: 'equip', i: '🧑‍🎓', n: T("Becari o becària en pràctiques"), d: T("Ajuda amb xarxes, informes i tasques del dia a dia. Cal dedicar-li temps a formar-lo."), use: T("Més encàrrecs ben pagats i més capacitat de gestió."), price: 0, monthly: 450, stage: 2, bonus: { skill: { gestio: 1 }, gig: 15 } },
  { id: 'video', cat: 'equip', i: '🎥', n: T("Videògraf freelance a demanda"), d: T("Vídeos curts i fotos professionals quan un client els necessita."), use: T("Peces creatives de més qualitat a les campanyes."), price: 200, monthly: 150, stage: 3, bonus: { skill: { creativitat: 1 }, gig: 5 } },
  { id: 'comercial', cat: 'equip', i: '🤝', n: T("Comercial a temps parcial"), d: T("Busca clients nous i prepara propostes. Cobra un fix més comissió."), use: T("Honoraris més alts i opcions comercials a les missions."), price: 0, monthly: 900, stage: 4, bonus: { skill: { comercial: 1 }, fee: 10 } },
  { id: 'fitxaAg', cat: 'publicitat', i: '📍', n: T("Fitxa de Google i ressenyes de l'agència"), d: T("Perfil complet, fotos de l'equip i ressenyes dels primers clients."), use: T("Més reputació i més encàrrecs de negocis locals."), price: 50, monthly: 0, rep: 2, bonus: { gig: 5 } },
  { id: 'webAg', cat: 'publicitat', i: '🌐', n: T("Web pròpia amb casos d'èxit"), d: T("La teva millor carta de presentació: serveis clars i resultats reals."), use: T("Reputació i encàrrecs més ben pagats."), price: 600, monthly: 20, rep: 3, bonus: { gig: 10 } },
  { id: 'linkedin', cat: 'publicitat', i: '💼', n: T("Campanya de LinkedIn per captar empreses"), d: T("Anuncis i contingut per arribar a directors de màrqueting d'Osona."), use: T("Reputació i honoraris més alts amb clients grans."), price: 900, monthly: 0, stage: 3, rep: 4, bonus: { fee: 5 } },
  { id: 'patrocini', cat: 'publicitat', i: '🏀', n: T("Patrocini de l'equip de bàsquet de Vic"), d: T("Logo a la samarreta i presència als partits del pavelló."), use: T("Gran impuls de reputació local."), price: 1500, monthly: 0, stage: 4, rep: 6, bonus: {} },
  { id: 'rotul', cat: 'local', i: '🪧', n: T("Rètol a la façana del despatx"), d: T("Que els veïns sàpiguen que a Vic hi ha una agència de màrqueting."), use: T("Una mica de reputació i clients que entren pel carrer."), price: 250, monthly: 0, rep: 1, bonus: { gig: 5 } },
  { id: 'cafe', cat: 'local', i: '☕', n: T("Bona cafetera i racó per als clients"), d: T("Les reunions surten millor amb un bon cafè."), use: T("Els clients confien una mica més en tu."), price: 90, monthly: 10, rep: 1, bonus: {} },
  { id: 'ordinador', cat: 'local', i: '💻', n: T("Portàtil potent i segon monitor"), d: T("Edició de vídeo, quadres de comandament i deu pestanyes obertes sense patir."), use: T("Treballes més de pressa: guanyes més experiència."), price: 900, monthly: 0, bonus: { xp: 10 } },
  { id: 'mobles', cat: 'local', i: '🛋️', n: T("Despatx renovat amb sala de reunions"), d: T("Un espai professional per rebre clients grans."), use: T("Honoraris més alts: els clients grans valoren la imatge."), price: 1200, monthly: 0, stage: 3, rep: 2, bonus: { fee: 5 } }
];
GD.upgradeById = (id) => GD.upgrades.find(u => u.id === id);
