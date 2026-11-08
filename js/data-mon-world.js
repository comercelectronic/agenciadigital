/* Agència Digital — COMERÇMONS al món: zones, hàbitats, entrenadors i agències rivals (els reptes finals).
   Fitxer de dades compartit pel joc i, més endavant, pel servidor (validació de combats i segells). */
window.GD = window.GD || {};

// Zones del món on viuen Comerçmons. unlock: text de quan s'obre (la lògica és al món)
GD.cmZones = {
  devesa:    { n: T('Parc de la Devesa'), i: '🌳', d: T('El parc del riu, a tocar de Vic. Sempre obert: hi surt el passeig del riu cap a l\'oest.') },
  vic:       { n: T('Vic · Plaça Major'), i: '🏙️', d: T('Entre les parades i els jardins de la plaça.') },
  tona:      { n: T('Tona'), i: '🍽️', d: T('S\'hi arriba amb bus quan coneixes Can Jordi.') },
  gurb:      { n: T('Polígon de Gurb'), i: '🏭', d: T('S\'hi arriba amb bus quan coneixes Mecanitzats Bellmunt.') },
  fira:      { n: T('Recinte firal'), i: '🎪', d: T('Obre a partir de l\'etapa 3.') },
  montseny:  { n: T('Montseny'), i: '⛰️', d: T('Amb bus des de Vic quan superes l\'etapa 2.') },
  barcelona: { n: T('Barcelona · districte digital'), i: '🌆', d: T('Amb tren des de l\'estació de Vic quan superes l\'etapa 4.') },
  port:      { n: T('Port de Barcelona'), i: '⚓', d: T('Caminant des de Barcelona quan superes l\'etapa 6.') }
};

// On es pot trobar cada espècie (la primera zona és la principal). Els inicials que no has triat surten a partir de l'etapa 2.
GD.cmHabitat = {
  analitopus: ['devesa', 'port'], brandalia: ['devesa'], sabionet: ['devesa', 'montseny'], comunivol: ['devesa', 'montseny'],
  facturo: ['devesa'], bustiola: ['devesa', 'port'], enquestola: ['devesa'],
  ateneta: ['vic'], aparadorix: ['vic'], copiuma: ['vic'], pinzellet: ['vic'], creativola: ['vic'], vendifox: ['vic'],
  imanto: ['tona'], logistort: ['tona'], estocadillo: ['tona'], socialbee: ['tona'],
  financrac: ['gurb'], preuxi: ['gurb'], pactoru: ['gurb'], clicarro: ['gurb'],
  startupi: ['fira'], posicionix: ['fira'], segmentiu: ['fira'], publifoc: ['fira'],
  puzzlet: ['montseny'], fideli: ['montseny'], seolop: ['montseny'], estratego: ['montseny'], liderax: ['montseny'],
  videolot: ['barcelona'], ressenyol: ['barcelona'], innovolt: ['barcelona'], monopolion: ['barcelona'], disruptor: ['barcelona'],
  exportas: ['port'], globalia: ['port']
};
GD.cmZonesOf = (id) => GD.cmHabitat[id] || [];
GD.cmSpeciesIn = (zone) => GD.cmSpecies.filter(sp => GD.cmZonesOf(sp.id).includes(zone));

// Nivell d'un Comerçmon salvatge: segueix el teu equip però no baixa del mínim de cada raresa
GD.cmWildMin = { comu: 1, pococ: 2, rar: 6, epic: 14, lleg: 32 };

/* ---------- Entrenadors: personatges del joc que accepten combats d'entrenament ----------
   Els seus Comerçmons s'adapten al nivell del teu equip. Una victòria al dia per entrenador dona experiència. */
GD.cmTrainers = [
  { id: 'julia', map: 'devesa', team: ['brandalia', 'sabionet'], d: 0, line: T('Faig fotos del parc per al meu Instagram. Un combat ràpid per escalfar?') },
  { id: 'toni', map: 'devesa', team: ['logistort', 'enquestola', 'facturo'], d: 1, line: T('Cada matí repasso les comandes al parc. Vols practicar?') },
  { id: 'quim', map: 'vic', team: ['copiuma', 'pinzellet'], d: 1, line: T('Els meus Comerçmons escriuen millor que jo. Ho comprovem?') },
  { id: 'jordi', map: 'tona', team: ['ateneta', 'imanto', 'facturo'], d: 1, line: T('Entre servei i servei tinc deu minuts. Un combat?') },
  { id: 'miquel', map: 'gurb', team: ['financrac', 'estocadillo', 'logistort'], d: 2, line: T('A la fàbrica tot es mesura. Veurem com rendeixen els teus Comerçmons.') },
  { id: 'laia', map: 'fira', team: ['segmentiu', 'posicionix', 'vendifox'], d: 3, line: T('La competència també s\'entrena. Vols veure de què és capaç la meva agència?') },
  { id: 'sergi', map: 'montseny', team: ['fideli', 'puzzlet', 'comunivol'], d: 2, line: T('Aquí dalt l\'aire és més pur i els combats, més durs. Som-hi?') },
  { id: 'marta', map: 'barcelona', team: ['videolot', 'clicarro', 'seolop'], d: 3, line: T('A Barcelona no s\'atura ningú. Un combat entre reunions?') },
  { id: 'amelie', map: 'barcelona', team: ['exportas', 'ressenyol', 'creativola'], d: 3, line: T('J\'adore els Comerçmons! Un combat a la francesa?') },
  { id: 'ramon', map: 'port', team: ['bustiola', 'exportas', 'financrac'], d: 3, line: T('Al port els contenidors no esperen. Ni jo tampoc. Combat?') }
];

/* ---------- Agències rivals: els grans reptes ----------
   Cada agència professional té dos combats (un executiu i la direcció) i demana portar Comerçmons amb habilitats concretes.
   req: condicions sobre l'EQUIP ACTIU (fins a 3 Comerçmons):
     { lvl }                        un Comerçmon com a mínim d'aquest nivell
     { types: [...], lvl }          un Comerçmon d'algun d'aquests elements (i nivell)
     { family, lvl? }               un Comerçmon d'aquesta família
     { kind }                       un Comerçmon amb aquesta habilitat passiva dins de l'agència
     { count, lvl }                 aquest nombre de Comerçmons amb aquest nivell
     { rarity: [...] }              un Comerçmon d'alguna d'aquestes rareses
     { distinct, lvl }              aquest nombre d'elements diferents, tots amb aquest nivell */
GD.cmGyms = [
  { id: 'g1', n: T('Arrel Branding'), i: '🌱', map: 'devesa', stage: 1, prize: 600, badge: T('Segell de l\'Arrel'),
    spec: T('Branding i posicionament de marques locals'), types: ['natura', 'llum'],
    req: [{ lvl: 10 }, { types: ['foc', 'aire', 'ombra'] }],
    hint: T('Les seves marques són de Natura i Llum: el Foc i l\'Aire cremen i bufen la Natura, i l\'Ombra apaga la Llum.'),
    staff: [
      { n: T('Pol, executiu de comptes'), who: 'client', team: [['brandalia', 9], ['facturo', 9]] },
      { n: T('Clara Arrel, directora'), who: 'julia', team: [['facturo', 11], ['aparadorix', 11], ['brandalia', 13]] }
    ] },
  { id: 'g2', n: T('Ona Social'), i: '📱', map: 'tona', stage: 2, prize: 900, badge: T('Segell de l\'Ona'),
    spec: T('Xarxes socials, comunitats i influència'), types: ['electric', 'aire'],
    req: [{ types: ['terra', 'metall'], lvl: 14 }, { kind: 'xp' }],
    hint: T('Elèctric i Aire: la Terra para els llamps i el Metall talla el vent. També cal un Comerçmon que faci créixer l\'experiència (habilitat passiva).'),
    staff: [
      { n: T('Iu, community manager'), who: 'client', team: [['socialbee', 13], ['copiuma', 13]] },
      { n: T('Gal·la Ona, directora'), who: 'berta', team: [['comunivol', 15], ['imanto', 15], ['videolot', 17]] }
    ] },
  { id: 'g3', n: T('Vidal & Co.'), i: '🏢', map: 'fira', stage: 3, prize: 1300, badge: T('Segell de Vidal'),
    spec: T('Vendes agressives i captació a gran escala'), types: ['foc', 'terra'],
    req: [{ types: ['aigua', 'natura'], lvl: 18 }, { family: 'vend' }],
    hint: T('Foc i Terra: l\'Aigua i la Natura hi tenen avantatge. I per guanyar una agència de vendes cal portar algú de la família Vendes.'),
    staff: [
      { n: T('Executiva de Vidal & Co.'), who: 'client', team: [['startupi', 17], ['logistort', 17]] },
      { n: T('Sr. Vidal, director general'), who: 'ramon', team: [['pactoru', 19], ['publifoc', 19], ['vendifox', 21]] }
    ] },
  { id: 'g4', n: T('Engranatge B2B'), i: '⚙️', map: 'gurb', stage: 4, prize: 1800, badge: T('Segell de l\'Engranatge'),
    spec: T('Màrqueting industrial i vendes entre empreses'), types: ['metall', 'terra'],
    req: [{ types: ['foc', 'aigua'], lvl: 23 }, { count: 3, lvl: 18 }],
    hint: T('Metall i Terra: el Foc fon el metall i l\'Aigua erosiona la terra. Cal un equip complet de nivell 18 o més.'),
    staff: [
      { n: T('Enginyera de vendes'), who: 'client', team: [['estocadillo', 22], ['preuxi', 22]] },
      { n: T('Bernat Engranatge, director'), who: 'miquel', team: [['financrac', 24], ['logistort', 24], ['posicionix', 26]] }
    ] },
  { id: 'g5', n: T('Cim Creatiu'), i: '🎨', map: 'montseny', stage: 5, prize: 2400, badge: T('Segell del Cim'),
    spec: T('Creativitat, disseny i innovació'), types: ['magic', 'electric'],
    req: [{ types: ['ombra', 'metall', 'terra'], lvl: 28 }, { family: 'crea' }],
    hint: T('Màgic i Elèctric: l\'Ombra i el Metall frenen la màgia i la Terra absorbeix els llamps. Porta un creatiu propi.'),
    staff: [
      { n: T('Directora d\'art'), who: 'amelie', team: [['pinzellet', 27], ['creativola', 27]] },
      { n: T('Oriol Cim, director creatiu'), who: 'toni', team: [['segmentiu', 29], ['innovolt', 29], ['creativola', 31]] }
    ] },
  { id: 'g6', n: T('Clic & Data'), i: '📊', map: 'barcelona', stage: 6, prize: 3200, badge: T('Segell de les Dades'),
    spec: T('Analítica, SEO i automatització'), types: ['aigua', 'ombra'],
    req: [{ types: ['natura', 'electric', 'llum', 'aire'], lvl: 33 }, { family: 'mkt', lvl: 30 }],
    hint: T('Aigua i Ombra: la Natura i l\'Elèctric dominen l\'aigua; la Llum i l\'Aire dissipen l\'ombra. Necessites un Comerçmon de Màrqueting fort.'),
    staff: [
      { n: T('Analista sènior'), who: 'client', team: [['analitopus', 32], ['bustiola', 32]] },
      { n: T('Dra. Data, directora'), who: 'marta', team: [['ateneta', 34], ['analitopus', 34], ['seolop', 36]] }
    ] },
  { id: 'g7', n: T('Port Global'), i: '🚢', map: 'port', stage: 7, prize: 4200, badge: T('Segell del Port'),
    spec: T('Màrqueting internacional i exportació'), types: ['aire', 'aigua'],
    req: [{ types: ['electric', 'metall'], lvl: 38 }, { rarity: ['rar', 'epic', 'lleg'] }],
    hint: T('Aire i Aigua: l\'Elèctric domina tots dos i el Metall talla el vent. Porta un Comerçmon rar o més.'),
    staff: [
      { n: T('Responsable d\'exportació'), who: 'client', team: [['bustiola', 37], ['comunivol', 37]] },
      { n: T('Capitana Global, directora'), who: 'amelie', team: [['enquestola', 39], ['analitopus', 39], ['exportas', 41]] }
    ] },
  { id: 'g8', n: T('Zenit Group'), i: '🏙️', map: 'barcelona', stage: 7, final: true, prize: 6000, badge: T('Segell del Zenit'),
    spec: T('L\'agència més gran del país: de tot i al màxim nivell'), types: ['llum', 'ombra', 'electric'],
    req: [{ count: 3, lvl: 42 }, { distinct: 3, lvl: 42 }],
    hint: T('L\'equip del Zenit ho barreja tot. Necessites tres Comerçmons de nivell 42 o més i d\'elements diferents.'),
    staff: [
      { n: T('Sòcia directora'), who: 'marta', team: [['videolot', 43], ['ressenyol', 43], ['clicarro', 43]] },
      { n: T('Max Zenit, conseller delegat'), who: 'ramon', team: [['seolop', 45], ['innovolt', 46], ['posicionix', 48]] }
    ] }
];
GD.cmGymById = (id) => GD.cmGyms.find(g => g.id === id);

// Comprova els requisits d'una agència amb l'equip actiu: team = [{ id, lvl, form }]
GD.cmGymReq = (g, team) => {
  const sp = (m) => GD.cmById(m.id);
  const lv = (r) => (m) => !r.lvl || m.lvl >= r.lvl;
  const lvTxt = (r) => r.lvl ? T(' de nivell {0} o més', [r.lvl]) : '';
  return g.req.map(r => {
    let ok, label;
    if (r.types) { ok = team.some(m => r.types.includes(sp(m).type) && lv(r)(m)); label = T('Un Comerçmon {0}{1}', [r.types.map(t => GD.cmTypes[t].i + ' ' + GD.cmTypes[t].n).join(T(' o ')), lvTxt(r)]); }
    else if (r.family) { ok = team.some(m => sp(m).family === r.family && lv(r)(m)); label = T('Un Comerçmon de la família {0}{1}', [GD.cmFamilies[r.family].i + ' ' + GD.cmFamilies[r.family].n, lvTxt(r)]); }
    else if (r.kind) { ok = team.some(m => sp(m).passive.kind === r.kind); label = T('Un Comerçmon amb habilitat passiva de {0}', [GD.cmKinds[r.kind]]); }
    else if (r.rarity) { ok = team.some(m => r.rarity.includes(sp(m).rarity)); label = T('Un Comerçmon {0}', [r.rarity.map(x => GD.cmRarities[x].n).join(T(' o '))]); }
    else if (r.distinct) { const ty = new Set(team.filter(lv(r)).map(m => sp(m).type)); ok = ty.size >= r.distinct; label = T('{0} elements diferents{1}', [r.distinct, lvTxt(r)]); }
    else if (r.count) { ok = team.filter(lv(r)).length >= r.count; label = T('{0} Comerçmons a l\'equip{1}', [r.count, lvTxt(r)]); }
    else { ok = team.some(lv(r)); label = T('Un Comerçmon{0}', [lvTxt(r)]); }
    return { ok, label };
  });
};
