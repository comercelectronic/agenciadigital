/* Agència Digital — COMERÇMONS: criatures col·leccionables del món del comerç i el màrqueting.
   Aquest fitxer és el catàleg (generació 1). Per afegir una generació nova, crea un fitxer data-comercmons-g2.js
   que cridi GD.cmRegister([...espècies]) amb el mateix format: no cal tocar el joc.
   El mateix fitxer el carreguen les funcions del servidor per validar captures, evolucions i combats.

   Format d'una espècie:
   { id, num, gen, family, specialty, type, rarity, arch, tweak:[stat+, stat−], desc, personality, utility,
     passive:{ name, combat, kind, v }, capture:{ cond, text }, starter?, synergy?,
     forms:[{ name, lvl, cond?, desc, look:{...}, attacks:[...] }] }
   - stats: atac, defensa, velocitat, energia, intel·ligència (atk, def, vel, ene, int)
   - arch (arquetip): reparteix les estadístiques; tots sumen el mateix, així cap espècie és millor en tot
   - passive.kind: on ajuda dins del joc (xp, gig = clients recurrents, proj, chapter, world, quizcost, costs, monxp, rep) i v = % a la 1a forma
   - attacks: { n, cat: ofensiu|defensiu|estrategic|especial, cost (energia), pow (potència), acc (precisió %), cd (torns de recuperació), fx (efecte) } */
window.GD = window.GD || {};

GD.CM = {
  MAX_LEVEL: 50,          // nivell màxim d'un Comerçmon (configurable)
  TEAM_SIZE: 3,           // Comerçmons actius per a les activitats
  BATTLE_SIZE: 5,         // Comerçmons per als combats (fase de combats)
  XP_SHARE: 0.4,          // part de l'experiència del jugador que reben els Comerçmons de l'equip
  TRAIN_XP: 90,           // experiència de l'entrenament diari (un per Comerçmon i dia)
  BONUS_CAP: 25,          // límit (%) de bonificació per a cada tipus d'activitat
  FORM_MULT: [1, 1.5, 2], // la bonificació passiva creix amb cada evolució
  // Multiplicador d'estadístiques de cada forma segons quantes formes té l'espècie (la forma final sempre val 1,8)
  STAT_MULT: { 1: [1.8], 2: [1.25, 1.8], 3: [1, 1.4, 1.8], 4: [1, 1.25, 1.5, 1.8], 5: [1, 1.2, 1.4, 1.6, 1.8] },
  ESCAPE_MS: 60 * 60 * 1000 // si falles el repte de captura, el Comerçmon torna d'aquí a una hora
};
// Experiència per passar del nivell l al l+1
GD.cmXpNeed = (l) => 30 + 8 * l;

GD.cmTypes = {
  foc:      { n: T('Foc'),      i: '🔥', c: '#ef6a3a', c2: '#ffcf5a' },
  aigua:    { n: T('Aigua'),    i: '💧', c: '#3a8fe0', c2: '#9fe3ff' },
  natura:   { n: T('Natura'),   i: '🌿', c: '#4bb35f', c2: '#c8f28c' },
  terra:    { n: T('Terra'),    i: '🪨', c: '#b07a45', c2: '#e8c690' },
  electric: { n: T('Elèctric'), i: '⚡', c: '#f2c21b', c2: '#fff59a' },
  aire:     { n: T('Aire'),     i: '🌬️', c: '#7fc7d9', c2: '#e6fbff' },
  magic:    { n: T('Màgic'),    i: '✨', c: '#b06ad9', c2: '#f2c8ff' },
  ombra:    { n: T('Ombra'),    i: '🌑', c: '#4b4470', c2: '#9a8fd1' },
  llum:     { n: T('Llum'),     i: '☀️', c: '#f5b942', c2: '#fff4c4' },
  metall:   { n: T('Metall'),   i: '⚙️', c: '#8a97a8', c2: '#dce4ee' }
};
// Avantatges: cada element és fort contra dos i feble contra dos (cap element domina)
GD.cmStrong = {
  foc: ['natura', 'metall'], aigua: ['foc', 'terra'], natura: ['aigua', 'terra'], terra: ['foc', 'electric'],
  electric: ['aigua', 'aire'], aire: ['natura', 'ombra'], metall: ['aire', 'magic'], magic: ['llum', 'electric'],
  ombra: ['magic', 'llum'], llum: ['ombra', 'metall']
};
GD.cmEff = (atk, def) => GD.cmStrong[atk] && GD.cmStrong[atk].includes(def) ? 1.25 : GD.cmStrong[def] && GD.cmStrong[def].includes(atk) ? 0.8 : 1;

GD.cmFamilies = {
  mkt:   { n: T('Màrqueting'), i: '🎯', d: T('Estratègia, investigació de mercat, segmentació, posicionament i branding.') },
  vend:  { n: T('Vendes'), i: '🤝', d: T('Captació, negociació, tancament, fidelització i atenció al client.') },
  com:   { n: T('Publicitat i comunicació'), i: '📣', d: T('Publicitat digital, xarxes, continguts, copywriting i comunicació corporativa.') },
  emp:   { n: T('Comerç i empresa'), i: '🏪', d: T('Gestió, finances, emprenedoria, logística i comerç electrònic.') },
  crea:  { n: T('Creativitat i innovació'), i: '💡', d: T('Disseny, creativitat, innovació, coneixement i resolució de problemes.') },
  lleg:  { n: T('Llegendaris empresarials'), i: '👑', d: T('Grans conceptes del món dels negocis. Molt difícils d\'aconseguir.') }
};
// Equilibri: totes les espècies sumen les mateixes estadístiques a la forma final. La raresa no dona més força bruta,
// sinó habilitats passives més potents, atacs especials i condicions de captura més exigents.
GD.cmRarities = {
  comu:   { n: T('Comú'), c: '#8a97a8' },
  pococ:  { n: T('Poc comú'), c: '#3fae6a' },
  rar:    { n: T('Rar'), c: '#3a8fe0' },
  epic:   { n: T('Èpic'), c: '#a35ae0' },
  lleg:   { n: T('Llegendari'), c: '#f2a516' }
};
GD.CM.STAT_TOTAL = 310;
// Arquetips: tots sumen 5,0 (repartiment diferent de les mateixes forces)
GD.cmArch = {
  atacant:   { n: T('Atacant'),     atk: 1.3,  def: 0.8,  vel: 1.1,  ene: 0.9,  int: 0.9 },
  tanc:      { n: T('Resistent'),   atk: 0.85, def: 1.35, vel: 0.7,  ene: 1.1,  int: 1.0 },
  rapid:     { n: T('Ràpid'),       atk: 1.0,  def: 0.8,  vel: 1.4,  ene: 0.9,  int: 0.9 },
  estrateg:  { n: T('Estratega'),   atk: 0.8,  def: 0.95, vel: 0.95, ene: 1.0,  int: 1.3 },
  suport:    { n: T('Suport'),      atk: 0.75, def: 1.1,  vel: 0.9,  ene: 1.35, int: 0.9 },
  equilibrat:{ n: T('Equilibrat'),  atk: 1.0,  def: 1.0,  vel: 1.0,  ene: 1.0,  int: 1.0 }
};
GD.cmStatNames = { atk: T('Atac'), def: T('Defensa'), vel: T('Velocitat'), ene: T('Energia'), int: T('Intel·ligència') };
GD.cmAttackCats = { ofensiu: T('Ofensiu'), defensiu: T('Defensiu'), estrategic: T('Estratègic'), especial: T('Especial') };
// On ajuden les habilitats passives dins del joc
GD.cmKinds = {
  xp: T('experiència del jugador'), gig: T('ingressos dels clients recurrents'), proj: T('pagament de projectes i webs'), chapter: T('diners de les missions de la campanya'),
  world: T('diners dels botiguers de Vic'), quizcost: T('cost de les respostes incorrectes'), costs: T('despeses setmanals'),
  monxp: T('experiència dels Comerçmons'), rep: T('reputació guanyada')
};

/* ---------- Estadístiques ---------- */
// Estadístiques d'una espècie en una forma i un nivell (les mateixes fórmules al joc i al servidor)
GD.cmStats = (sp, form, level) => {
  const a = GD.cmArch[sp.arch], base = GD.CM.STAT_TOTAL / 5;
  const fm = GD.CM.STAT_MULT[sp.forms.length][form];
  const lv = 1 + ((level || 1) - 1) / 49;   // del nivell 1 al 50 les estadístiques es dupliquen
  const out = {};
  for (const k of ['atk', 'def', 'vel', 'ene', 'int']) {
    let v = base * a[k];
    if (sp.tweak && sp.tweak[0] === k) v *= 1.1;
    if (sp.tweak && sp.tweak[1] === k) v *= 0.9;
    out[k] = Math.round(v * fm * lv / 6);
  }
  return out;
};
// La passiva creix amb cada evolució (la forma final d'una espècie de 2 formes equival a la 3a d'una de 3)
// (×1 a la primera forma i ×2 a la final, repartit entre les formes del mig)
GD.cmPassive = (sp, form) => { const n = sp.forms.length; const m = n === 1 ? 2 : 1 + form / (n - 1); return Math.round(sp.passive.v * m * 10) / 10; };

/* ---------- Registre ---------- */
GD.cmSpecies = [];
GD.cmById = (id) => GD.cmSpecies.find(s => s.id === id);
GD.cmRegister = (list) => {
  list.forEach(s => {
    if (GD.cmById(s.id)) return;
    s.gen = s.gen || 1;
    GD.cmSpecies.push(s);
  });
  GD.cmSpecies.sort((a, b) => a.gen - b.gen || a.num - b.num);
};

// Atac (format curt): A(nom, categoria, cost, potència, precisió, recuperació, efecte)
const A = (n, cat, cost, pow, acc, cd, fx) => ({ n, cat, cost, pow, acc, cd, fx });

/* ================= GENERACIÓ 1 ================= */
GD.cmRegister([
  /* ---------- Els 12 primers ---------- */
  {
    id: 'publifoc', num: 1, family: 'com', specialty: T('Publicitat i captació'), type: 'foc', rarity: 'comu', arch: 'atacant', tweak: ['atk', 'def'], starter: true,
    desc: T('Neix de la guspira d\'una bona idea publicitària. Quan algú l\'ignora, la seva flama creix fins que tothom el mira.'),
    personality: T('Exagerat, sorollós i encantador. Viu per sortir a la portada.'),
    utility: T('Augmenta els diners de les missions de la campanya: les bones campanyes es noten a la caixa.'),
    passive: { name: T('Impacte viral'), combat: T('El primer atac de cada combat fa un 15 % més de dany.'), kind: 'chapter', v: 4 },
    capture: { cond: { starter: 1 }, text: T('Un dels tres Comerçmons inicials: el tries quan obres la Comerçdex per primera vegada.') },
    forms: [
      { name: 'Publifoc', lvl: 1, desc: T('Una flameta amb megàfon que crida eslògans sense parar.'),
        look: { body: 'blob', head: 'round', ears: 'flame', tail: 'flame', acc: 'megaphone', eyes: 'big', mouth: 'open', pattern: 'belly' },
        attacks: [A(T('Espot explosiu'), 'ofensiu', 30, 70, 90, 1, T('Dany elevat.')), A(T('Pluja d\'anuncis'), 'ofensiu', 35, 40, 95, 2, T('Ataca tots els rivals.')), A(T('Campanya llampec'), 'estrategic', 15, 0, 100, 2, T('+20 % de velocitat durant 3 torns.'))] },
      { name: 'Anuncifènix', lvl: 16, desc: T('Ha après que un anunci renaix de les cendres si es torna a llançar millor.'),
        look: { body: 'bird', head: 'crest', ears: 'flame', tail: 'flame', wings: 'feather', acc: 'megaphone', eyes: 'sharp', mouth: 'smile', pattern: 'belly' },
        attacks: [A(T('Renaixement de campanya'), 'especial', 40, 0, 100, 4, T('Recupera el 35 % de l\'energia quan baixa del 30 %.'))] },
      { name: 'Viralord', lvl: 36, desc: T('Senyor de la viralitat: quan bat les ales, milions de pantalles s\'encenen.'),
        look: { body: 'dragon', head: 'crest', ears: 'flame', tail: 'flame', wings: 'feather', acc: 'megaphone', eyes: 'sharp', mouth: 'fang', pattern: 'belly', crown: 'flames', aura: 1 },
        attacks: [A(T('Tendència global'), 'ofensiu', 50, 95, 85, 3, T('Dany molt elevat a tots els rivals.'))] }
    ]
  },
  {
    id: 'analitopus', num: 2, family: 'mkt', specialty: T('Analítica i investigació de mercat'), type: 'aigua', rarity: 'pococ', arch: 'estrateg', tweak: ['int', 'vel'],
    desc: T('Cada tentacle porta un indicador diferent. Si un número no quadra, s\'enfosqueix com un núvol de tinta.'),
    personality: T('Calmat, meticulós i una mica pedant. No es creu res sense dades.'),
    utility: T('Rebaixa el cost de les respostes incorrectes dels tests: aprens dels errors sense arruïnar-te.'),
    passive: { name: T('Big Data'), combat: T('Veu les estadístiques del rival i els seus atacs fallen menys contra ell.'), kind: 'quizcost', v: 8 },
    capture: { cond: { lessons: 4, area: ['analitica', 1] }, text: T('Supera 4 lliçons, com a mínim una d\'analítica.') },
    forms: [
      { name: 'Analitopus', lvl: 1, desc: T('Un pop menut amb ulleres que mesura tot el que toca.'),
        look: { body: 'octo', head: 'round', eyes: 'glasses', mouth: 'smile', acc: 'chart', pattern: 'spots' },
        attacks: [A(T('Dada crítica'), 'estrategic', 15, 0, 100, 2, T('Revela una debilitat: el rival rep un 20 % més de dany durant 2 torns.')), A(T('Gràfic tsunami'), 'ofensiu', 35, 50, 90, 2, T('Dany en àrea.')), A(T('Predicció perfecta'), 'defensiu', 20, 0, 100, 3, T('Esquiva el següent atac.'))] },
      { name: 'Datakraken', lvl: 18, desc: T('Els seus tentacles arriben a totes les bases de dades del port.'),
        look: { body: 'octo', head: 'round', eyes: 'glasses', mouth: 'fang', acc: 'chart', pattern: 'spots', horns: 'small' },
        attacks: [A(T('Segmentació profunda'), 'estrategic', 25, 0, 100, 3, T('Redueix un 25 % la defensa del rival amb més vida.'))] },
      { name: 'Megadata', lvl: 38, desc: T('Un oceà de dades amb consciència pròpia. Diuen que preveu les tendències abans que passin.'),
        look: { body: 'octo', head: 'round', eyes: 'glasses', mouth: 'smile', acc: 'chart', pattern: 'spots', horns: 'big', crown: 'orbit', aura: 1 },
        attacks: [A(T('Model predictiu'), 'especial', 45, 80, 100, 3, T('No falla mai i ignora les esquives.'))] }
    ]
  },
  {
    id: 'brandalia', num: 3, family: 'mkt', specialty: T('Branding i posicionament'), type: 'natura', rarity: 'pococ', arch: 'tanc', tweak: ['def', 'atk'],
    desc: T('Una flor que només s\'obre quan sap exactament qui és. La seva aroma fa que la recordis sempre.'),
    personality: T('Elegant, coherent i orgullosa. Detesta les modes passatgeres.'),
    utility: T('Fa créixer la reputació que guanyes a la campanya.'),
    passive: { name: T('Marca reconeguda'), combat: T('L\'equip rep un 10 % menys de dany.'), kind: 'rep', v: 8 },
    capture: { cond: { ch: '1.4' }, text: T('Completa el capítol 1.4 de la campanya.') },
    forms: [
      { name: 'Brandàlia', lvl: 1, desc: T('Un capoll amb un logotip gravat als pètals.'),
        look: { body: 'blob', head: 'round', ears: 'leaf', tail: 'leaf', acc: 'badge', eyes: 'big', mouth: 'smile', pattern: 'belly' },
        attacks: [A(T('Logo protector'), 'defensiu', 20, 0, 100, 2, T('Escut que absorbeix el 30 % del dany durant 2 torns.')), A(T('Rebranding'), 'estrategic', 20, 0, 95, 2, T('Redueix un 20 % l\'atac del rival.')), A(T('Identitat única'), 'estrategic', 30, 0, 100, 4, T('+10 % a totes les estadístiques pròpies.'))] },
      { name: 'Brandrake', lvl: 17, desc: T('Ha florit en un drac vegetal que protegeix el seu territori de marca.'),
        look: { body: 'dragon', head: 'round', ears: 'leaf', tail: 'leaf', acc: 'badge', eyes: 'big', mouth: 'smile', pattern: 'belly', horns: 'leaf' },
        attacks: [A(T('Arrels de confiança'), 'defensiu', 25, 0, 100, 3, T('Recupera vida cada torn durant 3 torns.'))] },
      { name: 'Brandrex', lvl: 37, desc: T('Una marca tan forta que el seu rugit és un eslògan que tothom coneix.'),
        look: { body: 'dragon', head: 'round', ears: 'leaf', tail: 'leaf', wings: 'leaf', acc: 'badge', eyes: 'sharp', mouth: 'fang', pattern: 'belly', horns: 'leaf', crown: 'laurel', aura: 1 },
        attacks: [A(T('Lovemark'), 'especial', 45, 75, 95, 3, T('Dany i l\'equip guanya un 15 % de defensa.'))] }
    ]
  },
  {
    id: 'financrac', num: 4, family: 'emp', specialty: T('Finances i gestió empresarial'), type: 'terra', rarity: 'pococ', arch: 'tanc', tweak: ['ene', 'vel'],
    desc: T('Una closca dura com un balanç ben quadrat. A dins hi guarda monedes que creixen amb el temps.'),
    personality: T('Prudent, estalviador i desconfiat amb les despeses. Sempre pregunta pel ROI.'),
    utility: T('Redueix les despeses setmanals de l\'agència.'),
    passive: { name: T('Interès compost'), combat: T('Recupera un 5 % d\'energia cada torn.'), kind: 'costs', v: 3 },
    capture: { cond: { week: 12 }, text: T('Mantén l\'agència oberta durant 12 setmanes de joc.') },
    forms: [
      { name: 'Financrac', lvl: 1, desc: T('Un cranc amb closca de guardiola.'),
        look: { body: 'crab', head: 'round', eyes: 'small', mouth: 'smile', acc: 'coin', pattern: 'shell' },
        attacks: [A(T('Cop de capital'), 'ofensiu', 25, 0, 95, 1, T('Dany segons l\'energia que li queda.')), A(T('Escut fiscal'), 'defensiu', 20, 0, 100, 2, T('Redueix un 40 % el dany rebut el torn següent.')), A(T('Inversió mestra'), 'especial', 10, 0, 100, 3, T('Recupera el 30 % de l\'energia.'))] },
      { name: 'Capitaldrac', lvl: 18, desc: T('Ara la closca és una cambra cuirassada amb ulls.'),
        look: { body: 'crab', head: 'round', eyes: 'sharp', mouth: 'fang', acc: 'coin', pattern: 'shell', horns: 'small' },
        attacks: [A(T('Dividend'), 'especial', 25, 0, 100, 3, T('Reparteix un 15 % d\'energia a tot l\'equip.'))] },
      { name: 'Multicapital', lvl: 38, desc: T('Un conglomerat amb potes. On camina, els números passen a negre.'),
        look: { body: 'crab', head: 'round', eyes: 'sharp', mouth: 'fang', acc: 'coin', pattern: 'shell', horns: 'big', crown: 'coins', aura: 1 },
        attacks: [A(T('OPA hostil'), 'ofensiu', 50, 85, 85, 3, T('Dany elevat i roba el 10 % de l\'energia del rival.'))] }
    ]
  },
  {
    id: 'socialbee', num: 5, family: 'com', specialty: T('Xarxes socials i comunitats'), type: 'electric', rarity: 'comu', arch: 'rapid', tweak: ['vel', 'def'], starter: true,
    desc: T('Brunzeix de perfil en perfil pol·linitzant converses. On passa, apareixen comunitats.'),
    personality: T('Hiperactiva, simpàtica i incapaç d\'estar-se quieta. Contesta els missatges en segons.'),
    utility: T('Augmenta l\'experiència que guanyes.'),
    passive: { name: T('Engagement'), combat: T('Actua primer si la velocitat empata.'), kind: 'xp', v: 3 },
    capture: { cond: { starter: 1 }, text: T('Un dels tres Comerçmons inicials.') },
    forms: [
      { name: 'Socialbee', lvl: 1, desc: T('Una abella amb antena de wifi.'),
        look: { body: 'bug', head: 'round', ears: 'antenna', wings: 'insect', acc: 'heart', eyes: 'big', mouth: 'smile', pattern: 'stripes' },
        attacks: [A(T('Pluja de likes'), 'ofensiu', 15, 35, 100, 0, T('Atac ràpid que sempre actua primer.')), A(T('Tendència viral'), 'estrategic', 15, 0, 100, 2, T('+25 % de velocitat durant 3 torns.')), A(T('Hashtag elèctric'), 'especial', 25, 30, 85, 3, T('Paralitza el rival un torn.'))] },
      { name: 'Influenzap', lvl: 15, desc: T('Ara té un eixam de seguidors que l\'imiten.'),
        look: { body: 'bug', head: 'round', ears: 'antenna', wings: 'insect', acc: 'phone', eyes: 'sharp', mouth: 'smile', pattern: 'stripes', crown: 'bolt' },
        attacks: [A(T('Directe en viu'), 'ofensiu', 30, 55, 95, 1, T('Dany i +10 % de velocitat.'))] },
      { name: 'Megainflu', lvl: 34, desc: T('Reina d\'un rusc digital de milions de membres.'),
        look: { body: 'bug', head: 'round', ears: 'antenna', wings: 'insect', acc: 'phone', eyes: 'sharp', mouth: 'open', pattern: 'stripes', crown: 'tiara', aura: 1 },
        attacks: [A(T('Comunitat fidel'), 'especial', 45, 0, 100, 4, T('Tot l\'equip actua primer el torn següent.'))] }
    ]
  },
  {
    id: 'vendifox', num: 6, family: 'vend', specialty: T('Negociació i tancament de vendes'), type: 'foc', rarity: 'comu', arch: 'atacant', tweak: ['int', 'ene'], starter: true,
    desc: T('Llegeix les objeccions dels clients abans que les diguin. La cua s\'encén quan tanca una venda.'),
    personality: T('Xerraire, segur de si mateix i amb respostes per a tot. Una mica massa insistent.'),
    utility: T('Augmenta els ingressos dels clients recurrents.'),
    passive: { name: T('Tancament perfecte'), combat: T('Fa un 20 % més de dany als rivals amb menys de la meitat de vida.'), kind: 'gig', v: 5 },
    capture: { cond: { starter: 1 }, text: T('Un dels tres Comerçmons inicials.') },
    forms: [
      { name: 'Vendifox', lvl: 1, desc: T('Una guineu amb corbata i cua de flama.'),
        look: { body: 'fox', head: 'fox', ears: 'pointy', tail: 'flame', acc: 'tie', eyes: 'sharp', mouth: 'smile', pattern: 'belly' },
        attacks: [A(T('Oferta irresistible'), 'ofensiu', 30, 65, 90, 1, T('Dany elevat.')), A(T('Contraoferta'), 'defensiu', 20, 0, 100, 2, T('Retorna el 40 % del dany rebut aquest torn.')), A(T('Tancament mestre'), 'especial', 40, 85, 80, 3, T('Cop especial: el doble de dany si el rival té menys del 30 % de vida.'))] },
      { name: 'Negocifox', lvl: 16, desc: T('La seva cartera de clients és tan llarga com la seva cua.'),
        look: { body: 'fox', head: 'fox', ears: 'pointy', tail: 'flame', acc: 'briefcase', eyes: 'sharp', mouth: 'smile', pattern: 'belly', tails: 3 },
        attacks: [A(T('Venda creuada'), 'ofensiu', 30, 45, 95, 2, T('Dany a dos rivals.'))] },
      { name: 'Venditàrium', lvl: 36, desc: T('Una guineu de nou cues: cadascuna és un canal de venda.'),
        look: { body: 'fox', head: 'fox', ears: 'pointy', tail: 'flame', acc: 'briefcase', eyes: 'sharp', mouth: 'fang', pattern: 'belly', tails: 9, crown: 'flames', aura: 1 },
        attacks: [A(T('Omnicanal'), 'especial', 50, 90, 90, 3, T('Dany a tots els rivals.'))] }
    ]
  },
  {
    id: 'sabionet', num: 7, family: 'crea', specialty: T('Formació i coneixement empresarial'), type: 'aire', rarity: 'comu', arch: 'estrateg', tweak: ['int', 'atk'],
    desc: T('Un mussol de paper que s\'alimenta de llibres. Quan aprèn una cosa nova, li surt una ploma.'),
    personality: T('Curiós, pacient i una mica despistat. Sempre té una dada interessant a punt.'),
    utility: T('Augmenta l\'experiència que guanyen els Comerçmons de l\'equip.'),
    passive: { name: T('Ment privilegiada'), combat: T('Les habilitats estratègiques duren un torn més.'), kind: 'monxp', v: 6 },
    capture: { cond: { lessons: 3 }, text: T('Supera 3 lliçons de la biblioteca.') },
    forms: [
      { name: 'Sabionet', lvl: 1, desc: T('Un mussolet amb ulleres i un llibre sota l\'ala.'),
        look: { body: 'bird', head: 'owl', ears: 'tuft', wings: 'feather', acc: 'book', eyes: 'glasses', mouth: 'beak', pattern: 'belly' },
        attacks: [A(T('Pluja d\'idees'), 'ofensiu', 25, 25, 95, 1, T('Tres cops petits.')), A(T('Masterclass'), 'estrategic', 20, 0, 95, 2, T('Redueix un 15 % totes les estadístiques del rival.')), A(T('Examen sorpresa'), 'ofensiu', 25, 45, 90, 2, T('Dany doble si el rival està debilitat.'))] },
      { name: 'Intel·ligentus', lvl: 15, desc: T('Ara porta birret i dóna classes a les branques del bosc.'),
        look: { body: 'bird', head: 'owl', ears: 'tuft', wings: 'feather', acc: 'book', eyes: 'glasses', mouth: 'beak', pattern: 'belly', crown: 'cap' },
        attacks: [A(T('Cas pràctic'), 'estrategic', 25, 0, 100, 3, T('Un aliat aprèn: +20 % d\'intel·ligència durant 3 torns.'))] },
      { name: 'Geniusmon', lvl: 35, desc: T('Una biblioteca amb ales. Coneix totes les respostes… i les preguntes.'),
        look: { body: 'bird', head: 'owl', ears: 'tuft', wings: 'feather', acc: 'book', eyes: 'glasses', mouth: 'beak', pattern: 'belly', crown: 'orbit', aura: 1 },
        attacks: [A(T('Eureka'), 'especial', 45, 70, 100, 3, T('Dany basat en la intel·ligència; no falla.'))] }
    ]
  },
  {
    id: 'creativola', num: 8, family: 'crea', specialty: T('Disseny i creativitat'), type: 'magic', rarity: 'pococ', arch: 'rapid', tweak: ['int', 'def'],
    desc: T('Les ales canvien de color segons l\'humor. Si li dius «fes-ho més gran», et pinta un elefant.'),
    personality: T('Somiadora, sensible i imprevisible. Odia els briefings mal fets.'),
    utility: T('Augmenta el pagament dels projectes i les webs.'),
    passive: { name: T('Inspiració'), combat: T('Un 15 % de probabilitat que l\'atac del rival falli per confusió.'), kind: 'proj', v: 4 },
    capture: { cond: { proj: 1 }, text: T('Aconsegueix que t\'aprovin un projecte real.') },
    forms: [
      { name: 'Creativola', lvl: 1, desc: T('Una papallona amb un pinzell per antena.'),
        look: { body: 'bug', head: 'round', ears: 'brush', wings: 'butterfly', acc: 'palette', eyes: 'big', mouth: 'smile', pattern: 'spots' },
        attacks: [A(T('Pluja de colors'), 'ofensiu', 25, 25, 95, 1, T('Dany múltiple (tres cops).')), A(T('Idea brillant'), 'estrategic', 15, 0, 100, 2, T('+25 % d\'atac durant 3 torns.')), A(T('Il·lusió creativa'), 'especial', 25, 0, 85, 3, T('Confon el rival dos torns.'))] },
      { name: 'Artimàgia', lvl: 17, desc: T('Pinta mentre vola i el que pinta pren vida.'),
        look: { body: 'bug', head: 'round', ears: 'brush', wings: 'butterfly', acc: 'palette', eyes: 'sharp', mouth: 'smile', pattern: 'spots', crown: 'star' },
        attacks: [A(T('Moodboard'), 'estrategic', 25, 0, 100, 3, T('L\'equip guanya un 15 % d\'atac.'))] },
      { name: 'Creativus', lvl: 36, desc: T('Una galeria d\'art voladora. Els seus colors no existeixen a cap carta.'),
        look: { body: 'bug', head: 'round', ears: 'brush', wings: 'butterfly', acc: 'palette', eyes: 'sharp', mouth: 'open', pattern: 'spots', crown: 'star', aura: 1 },
        attacks: [A(T('Obra mestra'), 'especial', 50, 90, 85, 3, T('Dany molt elevat i confusió.'))] }
    ]
  },
  {
    id: 'seolop', num: 9, family: 'mkt', specialty: T('Posicionament als cercadors (SEO)'), type: 'ombra', rarity: 'rar', arch: 'rapid', tweak: ['atk', 'ene'],
    desc: T('Caça paraules clau a la nit. Els seus ulls brillen com un primer resultat de cerca.'),
    personality: T('Pacient, silenciós i molt constant. Sap que les coses bones triguen.'),
    utility: T('Augmenta el pagament dels projectes i les webs.'),
    passive: { name: T('Primera posició'), combat: T('Els seus atacs tenen un 10 % més de precisió.'), kind: 'proj', v: 5 },
    capture: { cond: { area: ['seo', 2], web: 1 }, text: T('Supera 2 lliçons de SEO i entrega una web al Taller.') },
    forms: [
      { name: 'Seolop', lvl: 1, desc: T('Un llobató amb lupa que olora les cerques.'),
        look: { body: 'fox', head: 'wolf', ears: 'pointy', tail: 'bushy', acc: 'magnifier', eyes: 'sharp', mouth: 'smile', pattern: 'mask' },
        attacks: [A(T('Paraula clau'), 'ofensiu', 20, 55, 100, 1, T('Cop precís que no falla.')), A(T('Algoritme fosc'), 'estrategic', 20, 0, 90, 2, T('Redueix un 20 % la precisió del rival.')), A(T('Rànquing suprem'), 'especial', 45, 90, 85, 4, T('Atac especial potent.'))] },
      { name: 'Rankwolf', lvl: 20, desc: T('Lidera una llopada d\'enllaços de qualitat.'),
        look: { body: 'fox', head: 'wolf', ears: 'pointy', tail: 'bushy', acc: 'magnifier', eyes: 'sharp', mouth: 'fang', pattern: 'mask', mane: 1 },
        attacks: [A(T('Enllaç d\'autoritat'), 'estrategic', 25, 0, 100, 3, T('L\'aliat amb menys vida guanya un 20 % de defensa.'))] },
      { name: 'Googolup', lvl: 40, desc: T('Udola i el web sencer es reordena. Ningú sap com funciona el seu algoritme.'),
        look: { body: 'fox', head: 'wolf', ears: 'pointy', tail: 'bushy', acc: 'magnifier', eyes: 'sharp', mouth: 'fang', pattern: 'mask', mane: 1, crown: 'moon', aura: 1 },
        attacks: [A(T('Actualització del nucli'), 'especial', 55, 70, 100, 4, T('Dany a tots i reinicia les millores dels rivals.'))] }
    ]
  },
  {
    id: 'logistort', num: 10, family: 'emp', specialty: T('Logística, distribució i operacions'), type: 'terra', rarity: 'comu', arch: 'tanc', tweak: ['def', 'int'],
    desc: T('Una tortuga amb un magatzem a la closca. Lenta però mai no perd un paquet.'),
    personality: T('Ordenada, fiable i tossuda. Té un pla B per a cada retard.'),
    utility: T('Redueix les despeses setmanals de l\'agència.'),
    passive: { name: T('Cadena eficient'), combat: T('Els seus atacs tenen un torn menys de recuperació.'), kind: 'costs', v: 3 },
    capture: { cond: { lessons: 5 }, text: T('Supera 5 lliçons de la biblioteca.') },
    forms: [
      { name: 'Logistort', lvl: 1, desc: T('Una tortugueta amb una caixa de cartó per closca.'),
        look: { body: 'turtle', head: 'round', eyes: 'small', mouth: 'smile', acc: 'box', pattern: 'shell' },
        attacks: [A(T('Transport pesant'), 'ofensiu', 30, 65, 90, 2, T('Atac fort.')), A(T('Lliurament exprés'), 'ofensiu', 15, 30, 100, 0, T('Atac ràpid.')), A(T('Magatzem blindat'), 'defensiu', 20, 0, 100, 2, T('+30 % de defensa durant 3 torns.'))] },
      { name: 'Distribruc', lvl: 16, desc: T('La closca s\'ha convertit en un centre de distribució amb rodes.'),
        look: { body: 'turtle', head: 'round', eyes: 'sharp', mouth: 'smile', acc: 'truck', pattern: 'shell', horns: 'small' },
        attacks: [A(T('Just a temps'), 'estrategic', 20, 0, 100, 3, T('Un aliat recupera la recuperació dels seus atacs.'))] },
      { name: 'Logistitan', lvl: 36, desc: T('Un port de mercaderies caminant. On posa la pota, hi neix una ruta.'),
        look: { body: 'turtle', head: 'round', eyes: 'sharp', mouth: 'fang', acc: 'truck', pattern: 'shell', horns: 'big', crown: 'gear', aura: 1 },
        attacks: [A(T('Última milla'), 'especial', 45, 80, 95, 3, T('Dany elevat que ignora els escuts.'))] }
    ]
  },
  {
    id: 'comunivol', num: 11, family: 'com', specialty: T('Comunicació i relacions públiques'), type: 'aire', rarity: 'pococ', arch: 'suport', tweak: ['int', 'atk'],
    desc: T('Vola de micròfon en micròfon i fa que els missatges arribin clars a tothom.'),
    personality: T('Diplomàtic, amable i molt bon oient. Sempre troba les paraules.'),
    utility: T('Fa créixer la reputació que guanyes.'),
    passive: { name: T('Missatge clar'), combat: T('L\'equip resisteix millor la confusió i la paràlisi.'), kind: 'rep', v: 6 },
    capture: { cond: { world: 2 }, text: T('Ajuda 2 botiguers de Vic al mapa.') },
    forms: [
      { name: 'Comunivol', lvl: 1, desc: T('Un ocellet amb un micròfon al pit.'),
        look: { body: 'bird', head: 'round', ears: 'crest', wings: 'feather', acc: 'mic', eyes: 'big', mouth: 'beak', pattern: 'belly' },
        attacks: [A(T('Missatge directe'), 'ofensiu', 20, 50, 100, 1, T('Dany precís.')), A(T('Onda comunicativa'), 'especial', 25, 20, 85, 3, T('Confon el rival.')), A(T('Discurs magistral'), 'estrategic', 30, 0, 100, 4, T('+15 % d\'atac i defensa a tot l\'equip.'))] },
      { name: 'Portaveum', lvl: 17, desc: T('Portaveu oficial del bosc. Les seves roda de premsa són llegendàries.'),
        look: { body: 'bird', head: 'round', ears: 'crest', wings: 'feather', acc: 'mic', eyes: 'sharp', mouth: 'beak', pattern: 'belly', crown: 'cap' },
        attacks: [A(T('Nota de premsa'), 'defensiu', 25, 0, 100, 3, T('Treu els efectes negatius de l\'equip.'))] },
      { name: 'Comunidrac', lvl: 37, desc: T('Un drac de vent que porta el missatge de la marca a tot el món.'),
        look: { body: 'dragon', head: 'round', ears: 'crest', wings: 'feather', acc: 'mic', eyes: 'sharp', mouth: 'open', pattern: 'belly', crown: 'laurel', aura: 1 },
        attacks: [A(T('Gestió de crisi'), 'especial', 50, 0, 100, 5, T('L\'equip recupera el 25 % de la vida.'))] }
    ]
  },
  {
    id: 'estratego', num: 12, family: 'lleg', specialty: T('Direcció i estratègia empresarial'), type: 'llum', rarity: 'lleg', arch: 'equilibrat', tweak: ['int', 'vel'],
    desc: T('Mou les peces del mercat com en una partida d\'escacs. Diuen que va veure venir totes les crisis.'),
    personality: T('Serè, visionari i reservat. Parla poc, però cada frase és un pla.'),
    utility: T('Bonificació equilibrada: experiència del jugador i dels Comerçmons.'),
    passive: { name: T('Visió global'), combat: T('Tot l\'equip guanya un 5 % a totes les estadístiques.'), kind: 'xp', v: 4 },
    capture: { cond: { stage: 6, days: 20, dex: 15 }, text: T('Supera l\'etapa 6 de la campanya, juga 20 dies diferents i captura 15 Comerçmons.') },
    forms: [
      { name: 'Estrategó', lvl: 1, desc: T('Un cavall d\'escacs de llum amb capa de director.'),
        look: { body: 'horse', head: 'horse', ears: 'pointy', tail: 'mane', acc: 'chess', eyes: 'sharp', mouth: 'smile', pattern: 'belly', crown: 'crown' },
        attacks: [A(T('Pla mestre'), 'estrategic', 25, 0, 100, 3, T('+20 % a totes les estadístiques pròpies.')), A(T('Escac empresarial'), 'estrategic', 25, 0, 95, 2, T('Debilita el rival: −20 % d\'atac i defensa.')), A(T('Dominació del mercat'), 'especial', 55, 100, 90, 4, T('Atac llegendari a tots els rivals.'))] },
      { name: 'Imperator', lvl: 30, cond: { proj: 8 }, desc: T('Ara dirigeix un exèrcit de consultors de llum.'),
        look: { body: 'horse', head: 'horse', ears: 'pointy', tail: 'mane', wings: 'feather', acc: 'chess', eyes: 'sharp', mouth: 'smile', pattern: 'belly', crown: 'crown', aura: 1 },
        attacks: [A(T('Visió a cinc anys'), 'estrategic', 35, 0, 100, 5, T('L\'equip coneix el pròxim atac del rival i el pot esquivar.'))] },
      { name: 'Megaconsultor', lvl: 45, cond: { days: 40 }, desc: T('L\'estratègia feta criatura. Només apareix a qui ha demostrat constància durant mesos.'),
        look: { body: 'horse', head: 'horse', ears: 'pointy', tail: 'mane', wings: 'feather', acc: 'chess', eyes: 'sharp', mouth: 'smile', pattern: 'belly', crown: 'orbit', aura: 2 },
        attacks: [A(T('Escac i mat'), 'especial', 60, 120, 90, 5, T('Atac definitiu que ignora defenses.'))] }
    ]
  },

  /* ---------- Màrqueting ---------- */
  {
    id: 'segmentiu', num: 13, family: 'mkt', specialty: T('Segmentació de públics'), type: 'magic', rarity: 'rar', arch: 'estrateg', tweak: ['vel', 'def'],
    desc: T('Un prisma viu que divideix la llum en públics de colors. Cada cara mira un segment diferent.'),
    personality: T('Analític i perfeccionista. No suporta la frase «el nostre públic és tothom».'),
    utility: T('Augmenta l\'experiència que guanyes.'),
    passive: { name: T('Públic objectiu'), combat: T('Fa un 20 % més de dany a un tipus triat a l\'inici del combat.'), kind: 'xp', v: 3 },
    capture: { cond: { area: ['mercat', 2], level: 12 }, text: T('Supera 2 lliçons d\'investigació de mercat i arriba al nivell 12.') },
    forms: [
      { name: 'Segmentiu', lvl: 1, desc: T('Un cristall amb potes que fa arcs de Sant Martí.'),
        look: { body: 'crystal', head: 'crystal', eyes: 'big', mouth: 'smile', acc: 'pie', pattern: 'facets' },
        attacks: [A(T('Raig segmentat'), 'ofensiu', 25, 50, 95, 1, T('Dany extra contra el tipus marcat.')), A(T('Buyer persona'), 'estrategic', 20, 0, 100, 2, T('Marca un rival: el seu tipus queda revelat.')), A(T('Nínxol'), 'defensiu', 20, 0, 100, 3, T('Només el pot atacar un rival el torn següent.'))] },
      { name: 'Prismàrket', lvl: 22, desc: T('Ara projecta mapes de públics al cel.'),
        look: { body: 'crystal', head: 'crystal', eyes: 'sharp', mouth: 'smile', acc: 'pie', pattern: 'facets', crown: 'star' },
        attacks: [A(T('Microsegment'), 'especial', 40, 80, 90, 3, T('Dany doble contra el tipus marcat.'))] }
    ]
  },
  {
    id: 'posicionix', num: 14, family: 'mkt', specialty: T('Posicionament i diferenciació'), type: 'metall', rarity: 'rar', arch: 'tanc', tweak: ['atk', 'ene'],
    desc: T('Un escarabat amb una brúixola a l\'esquena que sempre assenyala el lloc lliure del mercat.'),
    personality: T('Decidit i diferent. Si tothom va a la dreta, ell busca un camí nou.'),
    utility: T('Augmenta els diners de les missions de la campanya.'),
    passive: { name: T('Oceà blau'), combat: T('Rep un 25 % menys de dany dels atacs que afecten tot l\'equip.'), kind: 'chapter', v: 4 },
    capture: { cond: { ch: '3.2' }, text: T('Completa el capítol 3.2 de la campanya.') },
    forms: [
      { name: 'Posicionix', lvl: 1, desc: T('Un escarabat metàl·lic amb brúixola.'),
        look: { body: 'beetle', head: 'round', ears: 'antenna', eyes: 'big', mouth: 'smile', acc: 'compass', pattern: 'shell' },
        attacks: [A(T('Proposta de valor'), 'ofensiu', 25, 55, 95, 1, T('Dany sòlid.')), A(T('Diferenciació'), 'defensiu', 20, 0, 100, 2, T('Immune als efectes del rival 2 torns.')), A(T('Mapa perceptual'), 'estrategic', 20, 0, 100, 3, T('Revela les estadístiques de tots els rivals.'))] },
      { name: 'Nordicorn', lvl: 20, desc: T('Ha desenvolupat una banya-brúixola que no s\'equivoca mai.'),
        look: { body: 'beetle', head: 'round', ears: 'antenna', eyes: 'sharp', mouth: 'smile', acc: 'compass', pattern: 'shell', horns: 'unicorn' },
        attacks: [A(T('Reposicionament'), 'especial', 35, 70, 90, 3, T('Dany i canvia el seu tipus al més eficaç.'))] },
      { name: 'Cartògraf', lvl: 40, desc: T('Un tanc cartogràfic que dibuixa mercats que encara no existeixen.'),
        look: { body: 'beetle', head: 'round', ears: 'antenna', eyes: 'sharp', mouth: 'fang', acc: 'compass', pattern: 'shell', horns: 'unicorn', wings: 'insect', crown: 'gear', aura: 1 },
        attacks: [A(T('Categoria pròpia'), 'especial', 50, 95, 90, 4, T('Dany molt alt; ignora debilitats de tipus.'))] }
    ]
  },
  {
    id: 'enquestola', num: 15, family: 'mkt', specialty: T('Enquestes i investigació qualitativa'), type: 'aire', rarity: 'comu', arch: 'suport', tweak: ['int', 'vel'],
    desc: T('Una òliba que fa preguntes a tothom. Té un portapapers sota l\'ala i mai no interromp.'),
    personality: T('Atenta, respectuosa i molt observadora. Escolta més que parla.'),
    utility: T('Rebaixa el cost de les respostes incorrectes dels tests.'),
    passive: { name: T('Escolta activa'), combat: T('Recupera un 3 % de vida cada torn.'), kind: 'quizcost', v: 6 },
    capture: { cond: { ch: '1.2' }, text: T('Completa el capítol 1.2: investiga abans de proposar.') },
    forms: [
      { name: 'Enquestola', lvl: 1, desc: T('Una òliba petita amb un portapapers.'),
        look: { body: 'bird', head: 'owl', ears: 'tuft', wings: 'feather', acc: 'clipboard', eyes: 'big', mouth: 'beak', pattern: 'belly' },
        attacks: [A(T('Pregunta oberta'), 'estrategic', 15, 0, 100, 1, T('Revela l\'atac que farà el rival.')), A(T('Focus group'), 'defensiu', 25, 0, 100, 3, T('L\'equip recupera un 15 % de vida.')), A(T('Mostra representativa'), 'ofensiu', 20, 45, 95, 1, T('Dany estable.'))] },
      { name: 'Entrevistòliba', lvl: 14, desc: T('Ara fa entrevistes en profunditat i grava totes les respostes.'),
        look: { body: 'bird', head: 'owl', ears: 'tuft', wings: 'feather', acc: 'clipboard', eyes: 'glasses', mouth: 'beak', pattern: 'belly' },
        attacks: [A(T('Insight'), 'especial', 30, 60, 100, 3, T('Dany que no falla i augmenta la intel·ligència.'))] },
      { name: 'Oracleta', lvl: 32, desc: T('Escolta milers de veus alhora i en treu la veritat del mercat.'),
        look: { body: 'bird', head: 'owl', ears: 'tuft', wings: 'feather', acc: 'clipboard', eyes: 'glasses', mouth: 'beak', pattern: 'belly', crown: 'orbit', aura: 1 },
        attacks: [A(T('Veu del client'), 'especial', 45, 0, 100, 4, T('L\'equip recupera vida i energia.'))] }
    ]
  },
  {
    id: 'preuxi', num: 16, family: 'mkt', specialty: T('Política de preus i marges'), type: 'metall', rarity: 'pococ', arch: 'estrateg', tweak: ['def', 'vel'],
    desc: T('Un cranc-balança que pesa cada preu amb les pinces. Si el marge és dolent, fa soroll de calaix buit.'),
    personality: T('Precís, exigent i bon calculador. No regala mai res.'),
    utility: T('Augmenta els ingressos dels clients recurrents.'),
    passive: { name: T('Marge sa'), combat: T('Els seus atacs costen un 10 % menys d\'energia.'), kind: 'gig', v: 4 },
    capture: { cond: { area: ['mercat', 1], level: 9 }, text: T('Supera una lliçó d\'investigació de mercat i arriba al nivell 9.') },
    forms: [
      { name: 'Preuxí', lvl: 1, desc: T('Una balança amb potes i dues pinces.'),
        look: { body: 'crab', head: 'round', eyes: 'small', mouth: 'smile', acc: 'scale', pattern: 'shell' },
        attacks: [A(T('Preu psicològic'), 'ofensiu', 20, 45, 95, 1, T('Dany que costa poca energia.')), A(T('Descompte encadenat'), 'estrategic', 20, 0, 95, 2, T('Redueix un 15 % la defensa del rival dues vegades.')), A(T('Punt d\'equilibri'), 'defensiu', 20, 0, 100, 3, T('Iguala la vida amb la del rival si és més baixa.'))] },
      { name: 'Margenyac', lvl: 18, desc: T('Les seves pinces ara són calculadores.'),
        look: { body: 'crab', head: 'round', eyes: 'glasses', mouth: 'smile', acc: 'scale', pattern: 'shell', horns: 'small' },
        attacks: [A(T('Preu dinàmic'), 'especial', 35, 70, 90, 3, T('El dany creix si el rival té més vida.'))] }
    ]
  },

  /* ---------- Vendes ---------- */
  {
    id: 'imanto', num: 17, family: 'vend', specialty: T('Captació de clients'), type: 'electric', rarity: 'comu', arch: 'rapid', tweak: ['atk', 'int'],
    desc: T('Un eriçó amb punxes d\'imant: atrau clients potencials allà on va.'),
    personality: T('Optimista i persistent. Fa trenta trucades i no es cansa.'),
    utility: T('Augmenta els ingressos dels clients recurrents.'),
    passive: { name: T('Atracció'), combat: T('Els rivals l\'ataquen més sovint i protegeix els aliats febles.'), kind: 'gig', v: 4 },
    capture: { cond: { ch: '1.5' }, text: T('Completa el capítol 1.5 de la campanya.') },
    forms: [
      { name: 'Imantó', lvl: 1, desc: T('Un eriçó amb punxes magnètiques.'),
        look: { body: 'blob', head: 'round', ears: 'spikes', eyes: 'big', mouth: 'smile', acc: 'magnet', pattern: 'belly' },
        attacks: [A(T('Lead magnet'), 'estrategic', 15, 0, 100, 2, T('Atrau els atacs rivals cap a ell.')), A(T('Trucada en fred'), 'ofensiu', 20, 45, 85, 1, T('Dany ràpid.')), A(T('Embut de vendes'), 'ofensiu', 30, 60, 90, 2, T('Dany que creix cada torn seguit.'))] },
      { name: 'Captaspina', lvl: 15, desc: T('Ara atrau clients des de l\'altra punta de la comarca.'),
        look: { body: 'blob', head: 'round', ears: 'spikes', eyes: 'sharp', mouth: 'smile', acc: 'magnet', pattern: 'belly', tail: 'bolt' },
        attacks: [A(T('Prospecció'), 'estrategic', 20, 0, 100, 3, T('Revela el rival amb menys defensa.'))] },
      { name: 'Magnetàurus', lvl: 34, desc: T('Un camp magnètic amb potes: les ofertes s\'hi enganxen soles.'),
        look: { body: 'beast', head: 'round', ears: 'spikes', eyes: 'sharp', mouth: 'fang', acc: 'magnet', pattern: 'belly', tail: 'bolt', horns: 'big', aura: 1 },
        attacks: [A(T('Pipeline ple'), 'especial', 45, 85, 90, 3, T('Dany elevat a dos rivals.'))] }
    ]
  },
  {
    id: 'pactoru', num: 18, family: 'vend', specialty: T('Negociació B2B'), type: 'terra', rarity: 'epic', arch: 'tanc', tweak: ['int', 'vel'],
    desc: T('Un bou tranquil que mai no cedeix sense rebre alguna cosa a canvi. Les seves banyes són dues signatures.'),
    personality: T('Ferm, pacient i just. Pensa en acords on guanyin les dues parts.'),
    utility: T('Augmenta el pagament dels projectes i les webs.'),
    passive: { name: T('Guanyar-guanyar'), combat: T('Quan rep dany, un aliat recupera energia.'), kind: 'proj', v: 5 },
    capture: { cond: { ch: '2.2', proj: 3, days: 6 }, text: T('Completa el capítol 2.2, aconsegueix 3 projectes aprovats i juga 6 dies diferents.') },
    forms: [
      { name: 'Pactoru', lvl: 1, desc: T('Un vedell robust amb un contracte entre les banyes.'),
        look: { body: 'beast', head: 'bull', ears: 'round', tail: 'tuft', horns: 'bull', acc: 'contract', eyes: 'small', mouth: 'smile', pattern: 'belly' },
        attacks: [A(T('Contraproposta'), 'defensiu', 20, 0, 100, 2, T('Retorna el 50 % del dany.')), A(T('Embestida comercial'), 'ofensiu', 30, 65, 90, 2, T('Dany elevat.')), A(T('Alternativa BATNA'), 'estrategic', 20, 0, 100, 3, T('Si rep un cop crític, no perd vida.'))] },
      { name: 'Acordàurus', lvl: 24, desc: T('Ha tancat acords amb fàbriques de tot el país.'),
        look: { body: 'beast', head: 'bull', ears: 'round', tail: 'tuft', horns: 'bull', acc: 'contract', eyes: 'sharp', mouth: 'fang', pattern: 'belly', crown: 'laurel' },
        attacks: [A(T('Tancament per escrit'), 'especial', 40, 80, 95, 3, T('Dany i el rival no pot canviar d\'atac 1 torn.'))] },
      { name: 'Conveniàrca', lvl: 42, desc: T('Un patriarca de les negociacions. On ell s\'asseu, hi ha acord.'),
        look: { body: 'beast', head: 'bull', ears: 'round', tail: 'tuft', horns: 'big', acc: 'contract', eyes: 'sharp', mouth: 'fang', pattern: 'belly', crown: 'crown', aura: 1 },
        attacks: [A(T('Aliança estratègica'), 'especial', 50, 0, 100, 5, T('Tot l\'equip comparteix la defensa més alta.'))] }
    ]
  },
  {
    id: 'fideli', num: 19, family: 'vend', specialty: T('Fidelització de clients'), type: 'llum', rarity: 'rar', arch: 'suport', tweak: ['def', 'atk'],
    desc: T('Un cadellet que mai no oblida un client. Porta una targeta de punts al collar.'),
    personality: T('Lleial, alegre i afectuós. Recorda els aniversaris de tothom.'),
    utility: T('Fa créixer la reputació que guanyes.'),
    passive: { name: T('Client per a sempre'), combat: T('El primer cop que un aliat cau, torna amb un 20 % de vida.'), kind: 'rep', v: 6 },
    capture: { cond: { area: ['email', 2], week: 20 }, text: T('Supera 2 lliçons de correu i CRM i arriba a la setmana 20.') },
    forms: [
      { name: 'Fidelí', lvl: 1, desc: T('Un gosset amb una targeta de fidelitat.'),
        look: { body: 'fox', head: 'dog', ears: 'floppy', tail: 'wag', acc: 'card', eyes: 'big', mouth: 'open', pattern: 'belly' },
        attacks: [A(T('Programa de punts'), 'defensiu', 20, 0, 100, 2, T('Un aliat recupera un 20 % de vida.')), A(T('Mordisqueig amable'), 'ofensiu', 15, 35, 100, 0, T('Dany petit.')), A(T('Postvenda'), 'estrategic', 25, 0, 100, 3, T('Treu un efecte negatiu i protegeix 1 torn.'))] },
      { name: 'Lleialdog', lvl: 20, desc: T('Ara és el guardià del club de clients.'),
        look: { body: 'fox', head: 'dog', ears: 'floppy', tail: 'wag', acc: 'card', eyes: 'sharp', mouth: 'smile', pattern: 'belly', crown: 'cap' },
        attacks: [A(T('Club VIP'), 'especial', 35, 0, 100, 4, T('L\'equip guanya un 20 % de defensa durant 3 torns.'))] },
      { name: 'Eternàlia', lvl: 40, desc: T('La lleialtat feta llum: els clients que toca no marxen mai.'),
        look: { body: 'beast', head: 'dog', ears: 'floppy', tail: 'wag', wings: 'feather', acc: 'card', eyes: 'sharp', mouth: 'smile', pattern: 'belly', crown: 'halo', aura: 1 },
        attacks: [A(T('Lifetime value'), 'especial', 50, 70, 100, 4, T('Dany i cura igual al dany causat.'))] }
    ]
  },
  {
    id: 'ateneta', num: 20, family: 'vend', specialty: T('Atenció al client'), type: 'aigua', rarity: 'comu', arch: 'suport', tweak: ['ene', 'atk'],
    desc: T('Una llúdriga que respon totes les consultes amb un somriure. Té una centraleta a la panxa.'),
    personality: T('Pacient, amable i resolutiva. Les queixes la fan créixer.'),
    utility: T('Augmenta els diners que et donen els botiguers de Vic.'),
    passive: { name: T('Queixa resolta'), combat: T('Quan rep un atac crític, recupera energia.'), kind: 'world', v: 6 },
    capture: { cond: { world: 1 }, text: T('Ajuda el teu primer botiguer de Vic.') },
    forms: [
      { name: 'Ateneta', lvl: 1, desc: T('Una llúdriga amb auriculars.'),
        look: { body: 'blob', head: 'otter', ears: 'round', tail: 'otter', acc: 'headset', eyes: 'big', mouth: 'smile', pattern: 'belly' },
        attacks: [A(T('Escolta empàtica'), 'defensiu', 15, 0, 100, 1, T('Redueix el dany rebut un 25 %.')), A(T('Resposta ràpida'), 'ofensiu', 15, 35, 100, 0, T('Atac ràpid.')), A(T('Solució al primer contacte'), 'estrategic', 25, 0, 100, 3, T('Un aliat recupera un 25 % de vida.'))] },
      { name: 'Centraleta', lvl: 14, desc: T('Atén deu trucades alhora sense perdre la calma.'),
        look: { body: 'blob', head: 'otter', ears: 'round', tail: 'otter', acc: 'headset', eyes: 'sharp', mouth: 'smile', pattern: 'belly', crown: 'cap' },
        attacks: [A(T('Omnicanal suport'), 'especial', 30, 0, 100, 3, T('Recupera vida a tots els aliats.'))] }
    ]
  },
  {
    id: 'aparadorix', num: 21, family: 'vend', specialty: T('Dinamització del punt de venda'), type: 'llum', rarity: 'pococ', arch: 'equilibrat', tweak: ['atk', 'int'],
    desc: T('Viu dins dels aparadors i els encén perquè la gent s\'aturi a mirar. Coneix totes les zones calentes de la botiga.'),
    personality: T('Coqueta, detallista i molt teatral. Canvia el decorat cada setmana.'),
    utility: T('Augmenta els diners que et donen els botiguers de Vic.'),
    passive: { name: T('Zona calenta'), combat: T('El primer torn, tot l\'equip té un 10 % més de precisió.'), kind: 'world', v: 5 },
    capture: { cond: { world: 4 }, text: T('Ajuda 4 botiguers de Vic al mapa.') },
    forms: [
      { name: 'Aparadorix', lvl: 1, desc: T('Una lluerna amb un cartell de rebaixes.'),
        look: { body: 'blob', head: 'round', ears: 'antenna', eyes: 'big', mouth: 'smile', acc: 'sign', pattern: 'glow', tail: 'glow' },
        attacks: [A(T('Aparador temàtic'), 'estrategic', 20, 0, 100, 2, T('Atrau l\'atenció: un rival perd el torn amb un 30 % de probabilitat.')), A(T('Il·luminació d\'impacte'), 'ofensiu', 25, 50, 95, 1, T('Dany i redueix la precisió rival.')), A(T('Producte ganxo'), 'ofensiu', 20, 40, 100, 1, T('Dany que no falla.'))] },
      { name: 'Vitrinàlia', lvl: 17, desc: T('Ara és un aparador sencer que respira llum.'),
        look: { body: 'blob', head: 'round', ears: 'antenna', eyes: 'sharp', mouth: 'smile', acc: 'sign', pattern: 'glow', tail: 'glow', wings: 'butterfly' },
        attacks: [A(T('Merchandising'), 'especial', 30, 0, 100, 3, T('L\'equip guanya un 15 % de velocitat.'))] },
      { name: 'Escaparatrix', lvl: 36, desc: T('Una reina de l\'espectacle comercial. Ningú passa de llarg davant seu.'),
        look: { body: 'blob', head: 'round', ears: 'antenna', eyes: 'sharp', mouth: 'open', acc: 'sign', pattern: 'glow', tail: 'glow', wings: 'butterfly', crown: 'tiara', aura: 1 },
        attacks: [A(T('Gran obertura'), 'especial', 45, 80, 90, 3, T('Dany a tots i enlluerna.'))] }
    ]
  },

  /* ---------- Publicitat i comunicació ---------- */
  {
    id: 'copiuma', num: 22, family: 'com', specialty: T('Copywriting'), type: 'aire', rarity: 'comu', arch: 'atacant', tweak: ['int', 'def'],
    desc: T('Un ocell-ploma que escriu titulars al cel. Cada lletra que deixa enrere és un ganxo.'),
    personality: T('Enginyós i juganer. Sempre troba un joc de paraules.'),
    utility: T('Augmenta el pagament dels projectes i les webs.'),
    passive: { name: T('Titular ganxo'), combat: T('Els cops crítics fan un 25 % més de dany.'), kind: 'proj', v: 3 },
    capture: { cond: { area: ['marca', 1], lessons: 6 }, text: T('Supera 6 lliçons, una de marca i creativitat.') },
    forms: [
      { name: 'Copiuma', lvl: 1, desc: T('Un ocellet amb una ploma estilogràfica per cua.'),
        look: { body: 'bird', head: 'round', ears: 'crest', wings: 'feather', tail: 'quill', acc: 'pen', eyes: 'big', mouth: 'beak', pattern: 'belly' },
        attacks: [A(T('Titular'), 'ofensiu', 20, 50, 90, 1, T('Dany amb més probabilitat de crític.')), A(T('Crida a l\'acció'), 'estrategic', 15, 0, 100, 2, T('Un aliat actua tot seguit.')), A(T('Storytelling'), 'ofensiu', 30, 55, 95, 2, T('Dany que creix si l\'atac anterior va encertar.'))] },
      { name: 'Eslogànix', lvl: 15, desc: T('Ara escriu eslògans que la gent tararareja.'),
        look: { body: 'bird', head: 'round', ears: 'crest', wings: 'feather', tail: 'quill', acc: 'pen', eyes: 'sharp', mouth: 'beak', pattern: 'belly', crown: 'star' },
        attacks: [A(T('Claim inoblidable'), 'especial', 35, 75, 90, 3, T('Dany i confon el rival.'))] },
      { name: 'Retòrix', lvl: 34, desc: T('Mestre de les paraules: un sol vers seu ven milers d\'unitats.'),
        look: { body: 'dragon', head: 'round', ears: 'crest', wings: 'feather', tail: 'quill', acc: 'pen', eyes: 'sharp', mouth: 'open', pattern: 'belly', crown: 'laurel', aura: 1 },
        attacks: [A(T('Manifest de marca'), 'especial', 50, 90, 90, 3, T('Dany a tots els rivals.'))] }
    ]
  },
  {
    id: 'videolot', num: 23, family: 'com', specialty: T('Vídeo i creació de continguts'), type: 'electric', rarity: 'rar', arch: 'rapid', tweak: ['atk', 'ene'],
    desc: T('Un llangardaix amb ulls de càmera. Grava en vertical i edita mentre corre.'),
    personality: T('Inquiet, creatiu i obsessionat amb els primers tres segons.'),
    utility: T('Augmenta l\'experiència que guanyes.'),
    passive: { name: T('Ganxo de 3 segons'), combat: T('El primer torn sempre actua el primer.'), kind: 'xp', v: 3 },
    capture: { cond: { area: ['xarxes', 2], ch: '4.2' }, text: T('Supera 2 lliçons de xarxes i completa el capítol 4.2.') },
    forms: [
      { name: 'Videolot', lvl: 1, desc: T('Un llangardaix amb una càmera al cap.'),
        look: { body: 'lizard', head: 'round', ears: 'none', tail: 'lizard', acc: 'camera', eyes: 'camera', mouth: 'smile', pattern: 'stripes' },
        attacks: [A(T('Short vertical'), 'ofensiu', 15, 40, 100, 0, T('Atac molt ràpid.')), A(T('Muntatge ràpid'), 'ofensiu', 25, 25, 95, 1, T('Dos cops seguits.')), A(T('Subtítols'), 'estrategic', 15, 0, 100, 2, T('L\'equip guanya precisió.'))] },
      { name: 'Streamander', lvl: 21, desc: T('Fa directes de dues hores i ningú no marxa.'),
        look: { body: 'lizard', head: 'round', ears: 'none', tail: 'lizard', acc: 'camera', eyes: 'camera', mouth: 'open', pattern: 'stripes', crown: 'bolt', wings: 'bat' },
        attacks: [A(T('Directe viral'), 'especial', 40, 80, 90, 3, T('Dany a tots els rivals.'))] }
    ]
  },
  {
    id: 'bustiola', num: 24, family: 'com', specialty: T('Email màrqueting i newsletters'), type: 'aigua', rarity: 'pococ', arch: 'suport', tweak: ['vel', 'def'],
    desc: T('Una medusa que porta cartes dins de la campana. Només visita qui l\'ha convidat.'),
    personality: T('Respectuosa, puntual i discreta. Odia l\'spam.'),
    utility: T('Augmenta l\'experiència que guanyen els Comerçmons de l\'equip.'),
    passive: { name: T('Doble opt-in'), combat: T('Immune a la confusió.'), kind: 'monxp', v: 6 },
    capture: { cond: { area: ['email', 1], ch: '1.4' }, text: T('Supera una lliçó de correu i CRM i completa el capítol 1.4.') },
    forms: [
      { name: 'Bustiola', lvl: 1, desc: T('Una medusa amb un sobre a dins.'),
        look: { body: 'jelly', head: 'jelly', eyes: 'big', mouth: 'smile', acc: 'letter', pattern: 'glow' },
        attacks: [A(T('Butlletí'), 'ofensiu', 20, 40, 100, 1, T('Dany que no falla.')), A(T('Automatització'), 'estrategic', 25, 0, 100, 3, T('Repeteix l\'atac anterior d\'un aliat.')), A(T('Segmentació de llista'), 'defensiu', 20, 0, 100, 2, T('L\'aliat més feble rep un 30 % menys de dany.'))] },
      { name: 'Newsmedusa', lvl: 18, desc: T('Ara envia milers de cartes personalitzades alhora.'),
        look: { body: 'jelly', head: 'jelly', eyes: 'sharp', mouth: 'smile', acc: 'letter', pattern: 'glow', crown: 'orbit' },
        attacks: [A(T('Taxa d\'obertura'), 'especial', 35, 0, 100, 3, T('L\'equip recupera un 20 % d\'energia.'))] }
    ]
  },
  {
    id: 'ressenyol', num: 25, family: 'com', specialty: T('Reputació en línia i ressenyes'), type: 'llum', rarity: 'rar', arch: 'tanc', tweak: ['int', 'atk'],
    desc: T('Un cargol amb una closca d\'estrelles. Cada ressenya bona li afegeix una estrella brillant.'),
    personality: T('Paciència infinita i molta memòria. Respon totes les opinions, també les dolentes.'),
    utility: T('Fa créixer la reputació que guanyes.'),
    passive: { name: T('Cinc estrelles'), combat: T('Recupera vida quan un aliat fa un crític.'), kind: 'rep', v: 7 },
    capture: { cond: { ch: '5.2' }, text: T('Supera el capítol 5.2: la crisi de reputació.') },
    forms: [
      { name: 'Ressenyol', lvl: 1, desc: T('Un cargol amb estrelles a la closca.'),
        look: { body: 'snail', head: 'round', ears: 'antenna', eyes: 'big', mouth: 'smile', acc: 'stars', pattern: 'shell' },
        attacks: [A(T('Resposta pública'), 'defensiu', 20, 0, 100, 2, T('Converteix el 30 % del dany en vida.')), A(T('Prova social'), 'estrategic', 20, 0, 100, 2, T('L\'equip guanya un 10 % d\'atac per cada aliat en peu.')), A(T('Crítica constructiva'), 'ofensiu', 25, 50, 95, 1, T('Dany estable.'))] },
      { name: 'Estrellacol', lvl: 22, desc: T('La seva closca és una constel·lació d\'opinions positives.'),
        look: { body: 'snail', head: 'round', ears: 'antenna', eyes: 'sharp', mouth: 'smile', acc: 'stars', pattern: 'shell', crown: 'halo', aura: 1 },
        attacks: [A(T('Reputació blindada'), 'especial', 40, 0, 100, 4, T('L\'equip ignora el proper atac crític.'))] }
    ]
  },

  /* ---------- Comerç i empresa ---------- */
  {
    id: 'clicarro', num: 26, family: 'emp', specialty: T('Comerç electrònic'), type: 'electric', rarity: 'pococ', arch: 'equilibrat', tweak: ['vel', 'int'],
    desc: T('Un carretó de la compra amb ànima de gos. S\'omple de productes i corre fins al checkout.'),
    personality: T('Alegre, eficaç i una mica ansiós amb els carretons abandonats.'),
    utility: T('Augmenta el pagament dels projectes i les webs.'),
    passive: { name: T('Checkout ràpid'), combat: T('Recupera energia quan derrota un rival.'), kind: 'proj', v: 4 },
    capture: { cond: { ch: '2.3' }, text: T('Completa el capítol 2.3: la botiga en línia.') },
    forms: [
      { name: 'Clicarró', lvl: 1, desc: T('Un carretó de la compra amb orelles.'),
        look: { body: 'cart', head: 'round', ears: 'pointy', eyes: 'big', mouth: 'open', acc: 'bag', pattern: 'none' },
        attacks: [A(T('Un clic'), 'ofensiu', 15, 35, 100, 0, T('Atac ràpid.')), A(T('Carretó abandonat'), 'estrategic', 20, 0, 90, 2, T('El rival perd un 20 % d\'energia.')), A(T('Enviament gratuït'), 'defensiu', 20, 0, 100, 2, T('L\'equip recupera un 10 % de vida.'))] },
      { name: 'Ecomarketàrrec', lvl: 17, desc: T('Un magatzem digital amb rodes.'),
        look: { body: 'cart', head: 'round', ears: 'pointy', eyes: 'sharp', mouth: 'smile', acc: 'bag', pattern: 'none', crown: 'bolt' },
        attacks: [A(T('Marketplace'), 'ofensiu', 35, 65, 90, 2, T('Dany a dos rivals.'))] },
      { name: 'Megacheckout', lvl: 36, desc: T('Una botiga infinita que mai no tanca.'),
        look: { body: 'cart', head: 'round', ears: 'pointy', eyes: 'sharp', mouth: 'fang', acc: 'bag', pattern: 'none', crown: 'gear', wings: 'bat', aura: 1 },
        attacks: [A(T('Black Friday'), 'especial', 55, 90, 85, 4, T('Dany enorme; després perd velocitat 2 torns.'))] }
    ]
  },
  {
    id: 'estocadillo', num: 27, family: 'emp', specialty: T('Gestió d\'estoc i magatzem'), type: 'metall', rarity: 'comu', arch: 'tanc', tweak: ['def', 'vel'],
    desc: T('Un armadillo que s\'enrotlla com una caixa perfectament etiquetada.'),
    personality: T('Metòdic i reservat. Compta les coses dues vegades.'),
    utility: T('Redueix les despeses setmanals de l\'agència.'),
    passive: { name: T('Punt de comanda'), combat: T('Quan baixa del 30 % de vida, la defensa puja un 30 %.'), kind: 'costs', v: 2 },
    capture: { cond: { week: 6 }, text: T('Arriba a la setmana 6 de joc.') },
    forms: [
      { name: 'Estocadillo', lvl: 1, desc: T('Un armadillo amb etiquetes de codi de barres.'),
        look: { body: 'turtle', head: 'armadillo', ears: 'round', eyes: 'small', mouth: 'smile', acc: 'barcode', pattern: 'bands' },
        attacks: [A(T('Enrotllar-se'), 'defensiu', 15, 0, 100, 2, T('Redueix el dany a la meitat 1 torn.')), A(T('Inventari'), 'estrategic', 20, 0, 100, 3, T('Revela els atacs del rival.')), A(T('Palet volador'), 'ofensiu', 25, 50, 90, 1, T('Dany.'))] },
      { name: 'Magatzèmbol', lvl: 16, desc: T('Ara és un magatzem automàtic que rodola.'),
        look: { body: 'turtle', head: 'armadillo', ears: 'round', eyes: 'sharp', mouth: 'smile', acc: 'barcode', pattern: 'bands', horns: 'small' },
        attacks: [A(T('Rotació d\'estoc'), 'especial', 35, 60, 95, 3, T('Dany i canvia de posició amb un aliat.'))] }
    ]
  },
  {
    id: 'startupi', num: 28, family: 'emp', specialty: T('Emprenedoria'), type: 'foc', rarity: 'rar', arch: 'atacant', tweak: ['vel', 'def'],
    desc: T('Un esquirol amb motxilla-coet. Té cent idees al dia i en llança una.'),
    personality: T('Valent, impacient i somiador. Cau, s\'aixeca i torna a provar.'),
    utility: T('Augmenta els diners de les missions de la campanya.'),
    passive: { name: T('Pivotar'), combat: T('Quan falla un atac, el següent fa un 30 % més de dany.'), kind: 'chapter', v: 5 },
    capture: { cond: { ch: '3.1', level: 19 }, text: T('Completa el capítol 3.1 i arriba al nivell 19.') },
    forms: [
      { name: 'Startupí', lvl: 1, desc: T('Un esquirol amb un coet a l\'esquena.'),
        look: { body: 'blob', head: 'squirrel', ears: 'tuft', tail: 'bushy', acc: 'rocket', eyes: 'big', mouth: 'open', pattern: 'belly' },
        attacks: [A(T('MVP'), 'ofensiu', 20, 45, 90, 1, T('Dany ràpid.')), A(T('Ronda de finançament'), 'especial', 25, 0, 100, 4, T('Recupera tota l\'energia.')), A(T('Pivot'), 'estrategic', 15, 0, 100, 2, T('Canvia el seu tipus pel d\'un aliat.'))] },
      { name: 'Escalarat', lvl: 22, desc: T('L\'esquirol ha escalat: ara té oficina a dalt d\'un arbre gegant.'),
        look: { body: 'blob', head: 'squirrel', ears: 'tuft', tail: 'bushy', acc: 'rocket', eyes: 'sharp', mouth: 'smile', pattern: 'belly', crown: 'flames' },
        attacks: [A(T('Creixement exponencial'), 'ofensiu', 35, 30, 95, 2, T('Dany que es duplica cada vegada que l\'usa.'))] },
      { name: 'Unicornut', lvl: 40, desc: T('Una empresa valorada en mil milions amb cua d\'esquirol.'),
        look: { body: 'horse', head: 'squirrel', ears: 'tuft', tail: 'bushy', acc: 'rocket', eyes: 'sharp', mouth: 'smile', pattern: 'belly', horns: 'unicorn', wings: 'feather', aura: 1 },
        attacks: [A(T('Sortida a borsa'), 'especial', 55, 100, 85, 5, T('Dany enorme a tots els rivals.'))] }
    ]
  },
  {
    id: 'facturo', num: 29, family: 'emp', specialty: T('Comptabilitat i facturació'), type: 'natura', rarity: 'comu', arch: 'estrateg', tweak: ['def', 'atk'],
    desc: T('Un castor que construeix preses amb factures ben arxivades. Mai no se li escapa un euro.'),
    personality: T('Treballador, ordenat i rigorós. Li encanten els fulls de càlcul.'),
    utility: T('Rebaixa el cost de les respostes incorrectes dels tests.'),
    passive: { name: T('Llibre major'), combat: T('L\'equip veu quanta energia li queda a cada rival.'), kind: 'quizcost', v: 6 },
    capture: { cond: { area: ['direccio', 1], lessons: 8 }, text: T('Supera 8 lliçons, una de direcció empresarial.') },
    forms: [
      { name: 'Facturó', lvl: 1, desc: T('Un castor amb ulleres i calculadora.'),
        look: { body: 'blob', head: 'beaver', ears: 'round', tail: 'beaver', acc: 'calculator', eyes: 'glasses', mouth: 'teeth', pattern: 'belly' },
        attacks: [A(T('Quadrar comptes'), 'estrategic', 15, 0, 100, 2, T('Iguala l\'energia de l\'equip.')), A(T('Factura vençuda'), 'ofensiu', 25, 50, 95, 1, T('Dany que creix cada torn del combat.')), A(T('Presa d\'arxius'), 'defensiu', 25, 0, 100, 3, T('Escut del 30 % per a tot l\'equip 1 torn.'))] },
      { name: 'Balançot', lvl: 16, desc: T('Ara construeix balanços que aguanten qualsevol riuada.'),
        look: { body: 'blob', head: 'beaver', ears: 'round', tail: 'beaver', acc: 'calculator', eyes: 'glasses', mouth: 'teeth', pattern: 'belly', crown: 'cap' },
        attacks: [A(T('Auditoria'), 'especial', 35, 60, 100, 3, T('Dany que no falla i treu les millores del rival.'))] },
      { name: 'Tresorèrix', lvl: 35, desc: T('Guardià del tresor del bosc: els comptes sempre quadren al cèntim.'),
        look: { body: 'beast', head: 'beaver', ears: 'round', tail: 'beaver', acc: 'calculator', eyes: 'glasses', mouth: 'teeth', pattern: 'belly', crown: 'coins', aura: 1 },
        attacks: [A(T('Tancament d\'exercici'), 'especial', 45, 80, 95, 3, T('Dany segons els torns passats.'))] }
    ]
  },
  {
    id: 'exportas', num: 30, family: 'emp', specialty: T('Comerç internacional'), type: 'aire', rarity: 'epic', arch: 'rapid', tweak: ['int', 'def'],
    desc: T('Un albatros que creua oceans amb un passaport a la bossa. Parla deu idiomes.'),
    personality: T('Aventurer, curiós i adaptable. Es fa amic de tothom a cada port.'),
    utility: T('Augmenta els diners de les missions de la campanya.'),
    passive: { name: T('Localització'), combat: T('Mai no rep dany extra per debilitat de tipus.'), kind: 'chapter', v: 5 },
    capture: { cond: { ch: '7.2', days: 10 }, text: T('Completa el capítol 7.2 (França) i juga 10 dies diferents.') },
    forms: [
      { name: 'Exportàs', lvl: 1, desc: T('Un albatros jove amb una motxilla de viatge.'),
        look: { body: 'bird', head: 'round', ears: 'none', wings: 'feather', acc: 'passport', eyes: 'big', mouth: 'beak', pattern: 'belly' },
        attacks: [A(T('Incoterm'), 'estrategic', 20, 0, 100, 2, T('Decideix qui paga el dany: redueix un 30 % el proper atac rebut.')), A(T('Vol transoceànic'), 'ofensiu', 30, 60, 90, 2, T('Dany i actua primer.')), A(T('Duana'), 'defensiu', 20, 0, 100, 3, T('Bloqueja el proper atac especial rival.'))] },
      { name: 'Glòbatros', lvl: 26, desc: T('Té rutes a tots els continents.'),
        look: { body: 'bird', head: 'round', ears: 'none', wings: 'feather', acc: 'globe', eyes: 'sharp', mouth: 'beak', pattern: 'belly', crown: 'orbit', aura: 1 },
        attacks: [A(T('Expansió'), 'especial', 45, 80, 90, 3, T('Dany a tots els rivals.'))] }
    ]
  },

  /* ---------- Creativitat i innovació ---------- */
  {
    id: 'pinzellet', num: 31, family: 'crea', specialty: T('Disseny gràfic'), type: 'magic', rarity: 'comu', arch: 'equilibrat', tweak: ['atk', 'ene'],
    desc: T('Un furó amb la cua en forma de pinzell. Deixa traços de color allà on salta.'),
    personality: T('Juganer, sensible i detallista amb els espais en blanc.'),
    utility: T('Augmenta el pagament dels projectes i les webs.'),
    passive: { name: T('Retícula'), combat: T('Els seus escuts duren un torn més.'), kind: 'proj', v: 3 },
    capture: { cond: { web: 1 }, text: T('Entrega la teva primera web al Taller.') },
    forms: [
      { name: 'Pinzellet', lvl: 1, desc: T('Un furó amb un pinzell per cua.'),
        look: { body: 'fox', head: 'ferret', ears: 'round', tail: 'brush', acc: 'palette', eyes: 'big', mouth: 'smile', pattern: 'mask' },
        attacks: [A(T('Traç ràpid'), 'ofensiu', 15, 35, 100, 0, T('Atac ràpid.')), A(T('Contrast'), 'estrategic', 20, 0, 95, 2, T('El rival perd un 15 % de defensa.')), A(T('Espai en blanc'), 'defensiu', 20, 0, 100, 2, T('Esquiva el proper atac amb un 50 %.'))] },
      { name: 'Tipogràfur', lvl: 16, desc: T('Ara dibuixa lletres que es mouen soles.'),
        look: { body: 'fox', head: 'ferret', ears: 'round', tail: 'brush', acc: 'palette', eyes: 'sharp', mouth: 'smile', pattern: 'mask', crown: 'star' },
        attacks: [A(T('Composició'), 'especial', 35, 65, 95, 3, T('Dany i l\'equip guanya precisió.'))] },
      { name: 'Il·lustràlia', lvl: 35, desc: T('Una artista llegendària del bosc. Els seus murals expliquen històries.'),
        look: { body: 'beast', head: 'ferret', ears: 'round', tail: 'brush', acc: 'palette', eyes: 'sharp', mouth: 'smile', pattern: 'mask', wings: 'butterfly', crown: 'star', aura: 1 },
        attacks: [A(T('Mural'), 'especial', 45, 85, 90, 3, T('Dany a tots els rivals.'))] }
    ]
  },
  {
    id: 'innovolt', num: 32, family: 'crea', specialty: T('Innovació'), type: 'electric', rarity: 'epic', arch: 'estrateg', tweak: ['atk', 'def'],
    desc: T('Una bombeta viva que s\'encén amb cada idea nova. Quan en té una de molt bona, fa curtcircuit.'),
    personality: T('Brillant, inquieta i una mica caòtica. Pregunta sempre «i si…?».'),
    utility: T('Augmenta l\'experiència que guanyen els Comerçmons de l\'equip.'),
    passive: { name: T('I si…?'), combat: T('Cada 3 torns, un atac aleatori seu es potencia un 50 %.'), kind: 'monxp', v: 8 },
    capture: { cond: { ch: '7.5', days: 12, dex: 10 }, text: T('Completa el capítol 7.5 (IA i automatització), juga 12 dies diferents i captura 10 Comerçmons.') },
    forms: [
      { name: 'Innovolt', lvl: 1, desc: T('Una bombeta amb braços i ulls brillants.'),
        look: { body: 'bulb', head: 'bulb', eyes: 'big', mouth: 'open', acc: 'gear', pattern: 'glow' },
        attacks: [A(T('Pluja creativa'), 'ofensiu', 25, 30, 95, 1, T('Dos cops amb efecte aleatori.')), A(T('Prototip'), 'estrategic', 20, 0, 100, 2, T('Prova un atac de l\'aliat sense cost.')), A(T('Curtcircuit'), 'especial', 35, 75, 80, 3, T('Dany elevat i paràlisi; es fa mal a si mateix.'))] },
      { name: 'Patentrix', lvl: 26, desc: T('Ha registrat cent patents en un any.'),
        look: { body: 'bulb', head: 'bulb', eyes: 'sharp', mouth: 'smile', acc: 'gear', pattern: 'glow', crown: 'bolt', aura: 1 },
        attacks: [A(T('Innovació oberta'), 'especial', 45, 0, 100, 4, T('Tot l\'equip copia la millor estadística de l\'aliat més fort.'))] }
    ]
  },
  {
    id: 'puzzlet', num: 33, family: 'crea', specialty: T('Resolució de problemes'), type: 'metall', rarity: 'rar', arch: 'estrateg', tweak: ['def', 'vel'],
    desc: T('Un robot fet de peces de trencaclosques. Desmunta els problemes i els torna a muntar resolts.'),
    personality: T('Lògic, tranquil i tossut. No descansa fins que tot encaixa.'),
    utility: T('Rebaixa el cost de les respostes incorrectes dels tests.'),
    passive: { name: T('Peça clau'), combat: T('Els efectes negatius que rep duren un torn menys.'), kind: 'quizcost', v: 8 },
    capture: { cond: { lessons: 15, level: 16 }, text: T('Supera 15 lliçons i arriba al nivell 16.') },
    forms: [
      { name: 'Puzzlet', lvl: 1, desc: T('Un robotet de peces de colors.'),
        look: { body: 'robot', head: 'robot', ears: 'antenna', eyes: 'robot', mouth: 'smile', acc: 'puzzle', pattern: 'panels' },
        attacks: [A(T('Diagnòstic'), 'estrategic', 15, 0, 100, 2, T('Revela la debilitat de tipus del rival.')), A(T('Peça encaixada'), 'ofensiu', 25, 55, 95, 1, T('Dany extra si el rival està marcat.')), A(T('Pla B'), 'defensiu', 20, 0, 100, 3, T('Si cau, torna amb un 15 % de vida.'))] },
      { name: 'Solucionàtor', lvl: 21, desc: T('Ara resol problemes que encara no ha tingut ningú.'),
        look: { body: 'robot', head: 'robot', ears: 'antenna', eyes: 'robot', mouth: 'smile', acc: 'puzzle', pattern: 'panels', crown: 'gear' },
        attacks: [A(T('Pensament lateral'), 'especial', 35, 70, 100, 3, T('Dany que ignora la defensa.'))] },
      { name: 'Megaenigmus', lvl: 40, desc: T('Un trencaclosques de mil peces que pensa més ràpid que un ordinador.'),
        look: { body: 'robot', head: 'robot', ears: 'antenna', eyes: 'robot', mouth: 'smile', acc: 'puzzle', pattern: 'panels', crown: 'orbit', wings: 'insect', aura: 1 },
        attacks: [A(T('Solució definitiva'), 'especial', 50, 0, 100, 5, T('Treu tots els efectes negatius de l\'equip i hi dona un escut.'))] }
    ]
  },

  /* ---------- Llegendaris empresarials ---------- */
  {
    id: 'monopolion', num: 34, family: 'lleg', specialty: T('Monopoli'), type: 'ombra', rarity: 'lleg', arch: 'tanc', tweak: ['atk', 'vel'],
    desc: T('Un lleó d\'ombra assegut damunt d\'un tauler de joc. Quan rugeix, la competència desapareix… i els clients es queden sense alternatives.'),
    personality: T('Imponent, poderós i perillós. Recorda per què existeixen les lleis de la competència.'),
    utility: T('Augmenta els ingressos dels clients recurrents, però el seu poder té límits: no es pot combinar amb un altre llegendari a l\'equip.'),
    passive: { name: T('Barreres d\'entrada'), combat: T('Els rivals no poden canviar de Comerçmon mentre ell és al camp.'), kind: 'gig', v: 7 },
    capture: { cond: { stage: 7, days: 25, dex: 20 }, text: T('Supera l\'etapa 7, juga 25 dies diferents i captura 20 Comerçmons.') },
    forms: [
      { name: 'Monopolion', lvl: 1, desc: T('Un lleó negre amb corona de cases i hotels.'),
        look: { body: 'beast', head: 'lion', ears: 'round', tail: 'tuft', acc: 'board', eyes: 'sharp', mouth: 'fang', pattern: 'belly', mane: 1, crown: 'crown', aura: 2 },
        attacks: [A(T('Absorció'), 'especial', 40, 60, 95, 3, T('Roba les millores del rival.')), A(T('Preu abusiu'), 'ofensiu', 35, 85, 85, 2, T('Dany molt elevat.')), A(T('Autoritat de la competència'), 'defensiu', 0, 0, 100, 6, T('Quan el fan servir contra ell, perd el 30 % de la vida: el monopoli també té riscos.'))] }
    ]
  },
  {
    id: 'disruptor', num: 35, family: 'lleg', specialty: T('Innovació disruptiva'), type: 'electric', rarity: 'lleg', arch: 'rapid', tweak: ['int', 'def'],
    desc: T('Un llamp en forma de drac que trenca els mercats establerts. On passa, res no torna a ser com abans.'),
    personality: T('Rebel, imprevisible i genial. Fa preguntes que ningú no s\'havia atrevit a fer.'),
    utility: T('Augmenta l\'experiència que guanyes.'),
    passive: { name: T('Canvi de paradigma'), combat: T('Inverteix els avantatges de tipus durant el primer torn.'), kind: 'xp', v: 6 },
    capture: { cond: { stage: 7, web: 6, days: 25 }, text: T('Supera l\'etapa 7, entrega 6 webs al Taller i juga 25 dies diferents.') },
    forms: [
      { name: 'Disruptor', lvl: 1, desc: T('Un drac de llamps amb ulls de circuit.'),
        look: { body: 'dragon', head: 'round', ears: 'pointy', tail: 'bolt', wings: 'bat', acc: 'gear', eyes: 'sharp', mouth: 'fang', pattern: 'stripes', horns: 'big', crown: 'bolt', aura: 2 },
        attacks: [A(T('Ruptura'), 'ofensiu', 30, 80, 90, 1, T('Dany elevat i actua primer.')), A(T('Nou model de negoci'), 'estrategic', 25, 0, 100, 3, T('Canvia les regles: totes les millores del combat desapareixen.')), A(T('Destrucció creativa'), 'especial', 55, 110, 80, 4, T('Dany enorme a tots; perd defensa 2 torns.'))] }
    ]
  },
  {
    id: 'globalia', num: 36, family: 'lleg', specialty: T('Expansió internacional'), type: 'aire', rarity: 'lleg', arch: 'suport', tweak: ['atk', 'int'],
    desc: T('Una balena celestial que neda entre núvols portant ciutats a l\'esquena. Connecta mercats de tot el món.'),
    personality: T('Serena, generosa i antiquíssima. Ha vist néixer i morir mil imperis comercials.'),
    utility: T('Augmenta els diners de les missions de la campanya.'),
    passive: { name: T('Sense fronteres'), combat: T('L\'equip no té debilitats de tipus.'), kind: 'chapter', v: 7 },
    capture: { cond: { stage: 8, days: 30, dex: 25 }, text: T('Completa tota la campanya, juga 30 dies diferents i captura 25 Comerçmons.') },
    forms: [
      { name: 'Globàlia', lvl: 1, desc: T('Una balena de núvols amb un mapamundi a la pell.'),
        look: { body: 'whale', head: 'whale', eyes: 'small', mouth: 'smile', acc: 'globe', pattern: 'map', crown: 'orbit', aura: 2 },
        attacks: [A(T('Corrent global'), 'defensiu', 30, 0, 100, 3, T('L\'equip recupera un 25 % de vida.')), A(T('Ruta de la seda'), 'estrategic', 30, 0, 100, 3, T('L\'equip comparteix l\'energia.')), A(T('Onada mundial'), 'especial', 55, 95, 90, 4, T('Dany a tots els rivals.'))] }
    ]
  },
  {
    id: 'liderax', num: 37, family: 'lleg', specialty: T('Lideratge de mercat'), type: 'llum', rarity: 'lleg', arch: 'atacant', tweak: ['def', 'ene'],
    desc: T('Una àguila daurada que vola sempre al capdavant de l\'estol. Les altres marques la segueixen sense adonar-se\'n.'),
    personality: T('Inspiradora, exigent i justa. Lidera amb l\'exemple.'),
    utility: T('Fa créixer la reputació que guanyes.'),
    passive: { name: T('Quota de mercat'), combat: T('Cada aliat guanya un 5 % d\'atac per cada rival derrotat.'), kind: 'rep', v: 10 },
    capture: { cond: { stage: 8, proj: 15, days: 30 }, text: T('Completa tota la campanya, aconsegueix 15 projectes aprovats i juga 30 dies diferents.') },
    forms: [
      { name: 'Líderax', lvl: 1, desc: T('Una àguila de llum amb corona de llorer.'),
        look: { body: 'bird', head: 'eagle', ears: 'crest', wings: 'feather', acc: 'trophy', eyes: 'sharp', mouth: 'beak', pattern: 'belly', crown: 'laurel', aura: 2 },
        attacks: [A(T('Lideratge'), 'estrategic', 25, 0, 100, 3, T('L\'equip guanya un 20 % d\'atac.')), A(T('Picat del líder'), 'ofensiu', 30, 80, 90, 1, T('Dany elevat.')), A(T('Referent del sector'), 'especial', 55, 105, 90, 4, T('Dany enorme; l\'equip recupera energia.'))] }
    ]
  }
]);

/* ---------- Sinergies ---------- */
// Parelles: si les dues espècies són a l'equip actiu, s'activa la bonificació (kind/v igual que les passives)
GD.cmSynergies = [
  { ids: ['publifoc', 'socialbee'], n: T('Campanya viral'), d: T('Bonificació d\'experiència.'), kind: 'xp', v: 5 },
  { ids: ['brandalia', 'creativola'], n: T('Identitat suprema'), d: T('Més defensa en combat i més reputació.'), kind: 'rep', v: 8 },
  { ids: ['analitopus', 'seolop'], n: T('Domini digital'), d: T('Més precisió en combat i tests més barats.'), kind: 'quizcost', v: 10 },
  { ids: ['vendifox', 'financrac'], n: T('Negoci perfecte'), d: T('Bonificació econòmica amb els clients recurrents.'), kind: 'gig', v: 8 },
  { ids: ['sabionet', 'estratego'], n: T('Ment empresarial'), d: T('Avantatge estratègic: més experiència per als Comerçmons.'), kind: 'monxp', v: 12 },
  { ids: ['imanto', 'fideli'], n: T('Embut complet'), d: T('Captar i fidelitzar: més ingressos dels clients recurrents.'), kind: 'gig', v: 6 },
  { ids: ['clicarro', 'logistort'], n: T('Comanda perfecta'), d: T('Botiga i logística coordinades: més pagament de projectes.'), kind: 'proj', v: 6 },
  { ids: ['copiuma', 'videolot'], n: T('Contingut que enganxa'), d: T('Text i vídeo junts: més experiència.'), kind: 'xp', v: 5 },
  { ids: ['aparadorix', 'ateneta'], n: T('Botiga de deu'), d: T('Aparador i atenció: més diners dels botiguers.'), kind: 'world', v: 8 },
  { ids: ['enquestola', 'segmentiu'], n: T('Investigació completa'), d: T('Escoltar i segmentar: tests més barats.'), kind: 'quizcost', v: 8 },
  { ids: ['startupi', 'innovolt'], n: T('Laboratori d\'idees'), d: T('Més diners de la campanya.'), kind: 'chapter', v: 6 },
  { ids: ['exportas', 'globalia'], n: T('Ruta mundial'), d: T('Més diners de la campanya.'), kind: 'chapter', v: 8 }
];
// Bonificacions d'equip: tres de la mateixa família o tres elements diferents
GD.cmTeamBonus = [
  { id: 'familia', n: T('Departament complet'), d: T('Tres Comerçmons de la mateixa família: +5 % a la seva especialitat.'), v: 5 },
  { id: 'elements', n: T('Equip equilibrat'), d: T('Tres elements diferents: +5 % d\'experiència per als Comerçmons.'), kind: 'monxp', v: 5 }
];
// Especialitat principal de cada família (per a la bonificació «Departament complet»)
GD.cmFamilyKind = { mkt: 'quizcost', vend: 'gig', com: 'xp', emp: 'costs', crea: 'proj', lleg: 'rep' };

/* ================= EVOLUCIONS AMPLIADES =================
   Cada espècie guanya dues formes noves al final de la seva línia evolutiva (de 3 a 5 formes, de 2 a 4 i els
   llegendaris d'1 a 3). Els nivells d'evolució es reparteixen fins al 50 i l'aspecte de les formes noves parteix
   de l'última forma anterior (capa, gemma, corona i una aura cada cop més intensa). */
(function () {
  const E = {
    publifoc: [['Hypebrasa', T('Una tempesta de foc que converteix qualsevol llançament en un esdeveniment.'), A(T('Llançament mundial'), 'ofensiu', 45, 95, 90, 3, T('Dany molt elevat.'))],
      ['Omnifènix', T('Quan s\'encén, totes les pantalles del món emeten el seu anunci alhora.'), A(T('Prime time'), 'especial', 60, 115, 90, 4, T('Dany enorme a tots els rivals.'))]],
    analitopus: [['Oceanalític', T('Llegeix els corrents de dades com si fossin onades.'), A(T('Marea de dades'), 'estrategic', 30, 0, 100, 3, T('El rival rep un 25 % més de dany durant 2 torns.'))],
      ['Leviadata', T('Un leviatan de dades que preveu el mercat abans que es mogui.'), A(T('Big Bang de dades'), 'especial', 60, 115, 100, 4, T('Dany enorme que no falla mai.'))]],
    brandalia: [['Brandsequoia', T('Una marca tan arrelada que fa segles que ningú no la mou.'), A(T('Arrels profundes'), 'defensiu', 30, 0, 100, 3, T('Escut que absorbeix el 40 % del dany durant 2 torns.'))],
      ['Iconàlia', T('Ja no és una marca: és una icona que tothom reconeix d\'una sola mirada.'), A(T('Marca icònica'), 'especial', 55, 110, 95, 4, T('Dany molt elevat i l\'equip guanya un 20 % de defensa.'))]],
    financrac: [['Fondcrac', T('Gestiona un fons d\'inversió des de la seva closca blindada.'), A(T('Rendibilitat'), 'estrategic', 30, 0, 100, 3, T('Recupera el 40 % de l\'energia.'))],
      ['Capitalíssim', T('Un imperi financer amb potes: on posa la pinça, el valor es multiplica.'), A(T('Fusió total'), 'especial', 60, 110, 90, 4, T('Dany molt elevat i roba el 15 % de l\'energia del rival.'))]],
    socialbee: [['Trendirusc', T('Un rusc vivent que marca la tendència del dia a tot el planeta.'), A(T('Trending topic'), 'ofensiu', 40, 85, 95, 2, T('Dany i +20 % de velocitat.'))],
      ['Hiperreina', T('La reina de totes les xarxes: un sol brunzit i milions de persones la segueixen.'), A(T('Tempesta viral'), 'especial', 60, 110, 90, 4, T('Dany enorme a tots els rivals.'))]],
    vendifox: [['Tancatòrium', T('Cap objecció li resisteix: les respon totes abans que es formulin.'), A(T('Objecció resolta'), 'ofensiu', 45, 90, 95, 3, T('Dany doble si el rival té menys del 30 % de vida.'))],
      ['Megavendix', T('La guineu que va vendre la lluna... i va fidelitzar el sol.'), A(T('Venda del segle'), 'especial', 60, 115, 90, 4, T('Dany molt elevat que no falla mai.'))]],
    sabionet: [['Doctorònix', T('Un mussol doctorat en totes les disciplines del negoci.'), A(T('Tesi doctoral'), 'estrategic', 30, 0, 100, 3, T('Redueix un 25 % totes les estadístiques del rival.'))],
      ['Sapientíssim', T('Diuen que guarda a les ales tot el coneixement de la humanitat.'), A(T('Saviesa infinita'), 'especial', 55, 110, 100, 4, T('Dany basat en la intel·ligència; no falla.'))]],
    creativola: [['Inspiràlia', T('Les seves ales pinten l\'aire amb idees que ningú no havia imaginat.'), A(T('Pluja d\'idees màgica'), 'estrategic', 30, 0, 100, 3, T('+30 % d\'atac durant 3 torns.'))],
      ['Musàlia', T('La musa de tots els creatius: on vola, neixen campanyes llegendàries.'), A(T('Idea genial'), 'especial', 60, 115, 90, 4, T('Dany enorme i confusió.'))]],
    seolop: [['Indexllop', T('Rastreja cada racó d\'internet abans que els cercadors.'), A(T('Indexació total'), 'ofensiu', 40, 85, 100, 2, T('Dany precís que no falla.'))],
      ['Rànquimus', T('Sempre el primer resultat, en qualsevol cerca i en qualsevol idioma.'), A(T('Primera posició'), 'especial', 60, 115, 95, 4, T('Dany molt elevat.'))]],
    logistort: [['Hubtità', T('Un centre logístic sencer que camina sobre quatre potes.'), A(T('Xarxa de distribució'), 'defensiu', 30, 0, 100, 3, T('Escut que absorbeix el 40 % del dany durant 2 torns.'))],
      ['Logisàurus', T('Entrega qualsevol cosa a qualsevol lloc del món abans que la demanin.'), A(T('Entrega instantània'), 'especial', 60, 110, 95, 4, T('Dany molt elevat que sempre actua primer.'))]],
    comunivol: [['Mediàguila', T('Totes les redaccions esperen la seva roda de premsa.'), A(T('Roda de premsa'), 'estrategic', 30, 0, 100, 3, T('Redueix un 25 % l\'atac del rival.'))],
      ['Comunicòsmic', T('El seu missatge arriba a tots els racons del planeta alhora.'), A(T('Missatge universal'), 'especial', 55, 105, 95, 4, T('Dany molt elevat a tots els rivals.'))]],
    estratego: [['Visionari', T('Veu deu jugades per endavant en qualsevol tauler de negocis.'), A(T('Visió de futur'), 'estrategic', 35, 0, 100, 3, T('+20 % a totes les estadístiques pròpies.'))],
      ['Estratègum', T('La llegenda diu que va dissenyar l\'estratègia de totes les grans empreses.'), A(T('Pla perfecte'), 'especial', 65, 125, 100, 4, T('Dany enorme que no falla mai.'))]],
    segmentiu: [['Nínxolum', T('Troba el públic perfecte fins i tot dins d\'un mercat petitíssim.'), A(T('Públic objectiu'), 'ofensiu', 40, 85, 95, 2, T('Dany elevat.'))],
      ['Personàlix', T('Coneix cada client pel nom, pels gustos i per l\'hora preferida de compra.'), A(T('Hiperpersonalització'), 'especial', 55, 110, 100, 4, T('Dany molt elevat que no falla mai.'))]],
    posicionix: [['Diferencial', T('Brilla tant que la competència desapareix al seu costat.'), A(T('Avantatge competitiu'), 'defensiu', 30, 0, 100, 3, T('Escut que absorbeix el 40 % del dany durant 2 torns.'))],
      ['Diamantix', T('Una marca de metall precís: única, inimitable i impossible de copiar.'), A(T('Proposta única'), 'especial', 60, 110, 95, 4, T('Dany molt elevat.'))]],
    enquestola: [['Mostràlia', T('Pregunta a milers de persones en un sol vol i entén què volen.'), A(T('Mostra perfecta'), 'estrategic', 30, 0, 100, 3, T('El rival rep un 25 % més de dany durant 2 torns.'))],
      ['Insightòria', T('Descobreix desitjos que els clients encara no saben que tenen.'), A(T('Gran descobriment'), 'especial', 55, 105, 100, 4, T('Dany molt elevat que no falla mai.'))]],
    preuxi: [['Rendibilux', T('Calcula el preu just en mil·lisegons i mai no perd marge.'), A(T('Marge òptim'), 'estrategic', 30, 0, 100, 3, T('Recupera el 40 % de l\'energia.'))],
      ['Valorius', T('Ha entès que el preu és el que pagues i el valor, el que t\'emportes.'), A(T('Preu de valor'), 'especial', 55, 105, 95, 4, T('Dany molt elevat i roba el 15 % de l\'energia del rival.'))]],
    imanto: [['Leadmagnus', T('Atreu clients potencials de tota la comarca com un imant gegant.'), A(T('Camp magnètic'), 'ofensiu', 40, 85, 95, 2, T('Dany i paralitza el rival un torn.'))],
      ['Captàstron', T('Una estrella de captació: la seva gravetat atrau mercats sencers.'), A(T('Gravetat comercial'), 'especial', 60, 110, 90, 4, T('Dany enorme a tots els rivals.'))]],
    pactoru: [['Tractàurus', T('Signa acords amb una petjada que fa tremolar les sales de reunions.'), A(T('Contracte marc'), 'defensiu', 30, 0, 100, 3, T('Retorna el 50 % del dany rebut aquest torn.'))],
      ['Pactòlit', T('Un acord de pedra: ningú no ha trencat mai cap tracte seu.'), A(T('Acord indestructible'), 'especial', 60, 110, 95, 4, T('Dany molt elevat i l\'equip guanya un 20 % de defensa.'))]],
    fideli: [['Fidelàngel', T('Els clients que l\'han conegut ja no volen cap altra marca.'), A(T('Programa VIP'), 'defensiu', 30, 0, 100, 3, T('Recupera el 35 % de la vida.'))],
      ['Eternòfil', T('La lleialtat feta llum: els seus clients el segueixen tota la vida.'), A(T('Fidelitat eterna'), 'especial', 55, 105, 95, 4, T('Dany molt elevat i cura igual al dany causat.'))]],
    ateneta: [['Omniatenta', T('Respon per telèfon, xat i correu alhora sense perdre el somriure.'), A(T('Resposta empàtica'), 'defensiu', 25, 0, 100, 3, T('Recupera el 35 % de la vida.'))],
      ['Clientària', T('Converteix cada queixa en una experiència memorable.'), A(T('Experiència de client'), 'especial', 55, 100, 100, 4, T('Dany elevat que no falla mai.'))]],
    aparadorix: [['Showroomix', T('Cada aparador seu és una obra d\'art que atura el carrer.'), A(T('Aparador viu'), 'estrategic', 30, 0, 100, 3, T('+25 % d\'atac durant 3 torns.'))],
      ['Flagshipàlia', T('La botiga insígnia de totes les botigues: la gent hi fa cua per entrar.'), A(T('Inauguració estel·lar'), 'especial', 60, 110, 90, 4, T('Dany enorme a tots els rivals.'))]],
    copiuma: [['Titulàrium', T('Els seus titulars s\'enganxen al cap durant dies.'), A(T('Titular irresistible'), 'ofensiu', 40, 90, 95, 2, T('Dany elevat.'))],
      ['Narratòrix', T('Explica històries que fan riure, plorar... i comprar.'), A(T('Relat inoblidable'), 'especial', 55, 110, 95, 4, T('Dany molt elevat i confusió.'))]],
    videolot: [['Viralnauta', T('Grava, edita i publica en el temps que dura un llamp.'), A(T('Muntatge exprés'), 'ofensiu', 40, 85, 95, 2, T('Dany i +20 % de velocitat.'))],
      ['Cinemàxim', T('Les seves superproduccions fan bategar milions de pantalles.'), A(T('Estrena mundial'), 'especial', 60, 110, 90, 4, T('Dany enorme a tots els rivals.'))]],
    bustiola: [['Automedusa', T('Envia el missatge perfecte a cada persona en el moment exacte.'), A(T('Seqüència automàtica'), 'estrategic', 30, 0, 100, 3, T('Recupera el 40 % de l\'energia.'))],
      ['Inboxeana', T('Un oceà de correus que tothom obre amb ganes.'), A(T('Bústia plena'), 'especial', 55, 100, 100, 4, T('Dany elevat que no falla mai.'))]],
    ressenyol: [['Cincestrelles', T('Només acumula ressenyes de cinc estrelles... i sap per què.'), A(T('Valoració perfecta'), 'defensiu', 30, 0, 100, 3, T('Escut que absorbeix el 40 % del dany durant 2 torns.'))],
      ['Reputàlia', T('La seva reputació brilla tant que ningú no gosa criticar-la.'), A(T('Prova social total'), 'especial', 55, 100, 95, 4, T('Dany elevat i l\'equip guanya un 20 % de defensa.'))]],
    clicarro: [['Marketplàxer', T('Un mercat sencer sobre rodes que ven a tot el món les 24 hores.'), A(T('Carretó ple'), 'ofensiu', 40, 85, 95, 2, T('Dany elevat.'))],
      ['Hipercheckout', T('Un sol clic i la comanda ja és a casa.'), A(T('Compra en un clic'), 'especial', 60, 110, 95, 4, T('Dany molt elevat que sempre actua primer.'))]],
    estocadillo: [['Inventàrium', T('Sap on és cada caixa del magatzem sense mirar.'), A(T('Inventari perfecte'), 'defensiu', 30, 0, 100, 3, T('Escut que absorbeix el 40 % del dany durant 2 torns.'))],
      ['Automagatzem', T('Un magatzem automàtic que no s\'equivoca mai.'), A(T('Estoc just a temps'), 'especial', 55, 100, 95, 4, T('Dany elevat.'))]],
    startupi: [['Escalàxia', T('Creix tan de pressa que els inversors fan cua a la porta.'), A(T('Ronda sèrie B'), 'estrategic', 30, 0, 100, 3, T('+30 % d\'atac durant 3 torns.'))],
      ['Decacornut', T('Ha passat d\'un garatge a valer deu mil milions.'), A(T('Expansió exponencial'), 'especial', 60, 115, 90, 4, T('Dany enorme a tots els rivals.'))]],
    facturo: [['Auditòrix', T('Revisa cada número i troba l\'error abans que existeixi.'), A(T('Auditoria completa'), 'estrategic', 30, 0, 100, 3, T('Redueix un 25 % la defensa del rival.'))],
      ['Tresorus', T('Un bosc de comptes ben quadrats que dona fruits cada trimestre.'), A(T('Beneficis'), 'especial', 55, 105, 95, 4, T('Dany molt elevat.'))]],
    exportas: [['Aranzelau', T('Coneix totes les normes de tots els ports del món.'), A(T('Despatx de duanes'), 'defensiu', 30, 0, 100, 3, T('Escut que absorbeix el 40 % del dany durant 2 torns.'))],
      ['Mundialbatros', T('Vola d\'un continent a l\'altre obrint mercats a cada escala.'), A(T('Obertura de mercats'), 'especial', 60, 110, 90, 4, T('Dany enorme a tots els rivals.'))]],
    pinzellet: [['Grafitàlia', T('Converteix qualsevol paret en una campanya.'), A(T('Grafit gegant'), 'ofensiu', 40, 85, 95, 2, T('Dany elevat.'))],
      ['Pantonix', T('Domina tots els colors que existeixen i alguns que encara no.'), A(T('Paleta infinita'), 'especial', 55, 110, 95, 4, T('Dany molt elevat i confusió.'))]],
    innovolt: [['Prototità', T('Fa un prototip nou cada matí i el prova cada tarda.'), A(T('Prototip ràpid'), 'estrategic', 30, 0, 100, 3, T('+25 % d\'atac durant 3 torns.'))],
      ['Futurvolt', T('Ve del futur per explicar-nos com comprarem d\'aquí a vint anys.'), A(T('Salt tecnològic'), 'especial', 60, 115, 90, 4, T('Dany enorme i paralitza el rival.'))]],
    puzzlet: [['Enigmàtic', T('No hi ha problema que no pugui desmuntar peça a peça.'), A(T('Anàlisi de causes'), 'estrategic', 30, 0, 100, 3, T('El rival rep un 25 % més de dany durant 2 torns.'))],
      ['Resolutòrium', T('Ha resolt tots els trencaclosques del món i ara en crea de nous.'), A(T('Solució mestra'), 'especial', 55, 110, 100, 4, T('Dany molt elevat que no falla mai.'))]],
    monopolion: [['Oligopolion', T('Ja no està sol: controla el mercat amb dos o tres còmplices.'), A(T('Barrera d\'entrada'), 'defensiu', 35, 0, 100, 3, T('Escut que absorbeix el 40 % del dany durant 2 torns.'))],
      ['Hegemonion', T('Una ombra que cobreix sectors sencers... fins que arriba la competència.'), A(T('Domini absolut'), 'especial', 65, 120, 90, 4, T('Dany enorme a tots els rivals.'))]],
    disruptor: [['Disruptàlix', T('Cada cop que apareix, un sector sencer canvia per sempre.'), A(T('Canvi de paradigma'), 'estrategic', 35, 0, 100, 3, T('Redueix un 25 % totes les estadístiques del rival.'))],
      ['Revolutrix', T('La revolució digital feta criatura.'), A(T('Revolució'), 'especial', 65, 125, 90, 4, T('Dany enorme que sempre actua primer.'))]],
    globalia: [['Multinàcia', T('Té seus a tots els continents i parla totes les llengües.'), A(T('Xarxa global'), 'defensiu', 35, 0, 100, 3, T('Recupera el 35 % de la vida.'))],
      ['Planetària', T('Abraça el planeta sencer: on hi ha un client, hi és ella.'), A(T('Mercat mundial'), 'especial', 65, 120, 95, 4, T('Dany enorme a tots els rivals.'))]],
    liderax: [['Liderànim', T('Inspira equips sencers només amb la seva presència.'), A(T('Lideratge inspirador'), 'estrategic', 35, 0, 100, 3, T('+20 % a totes les estadístiques pròpies.'))],
      ['Megalíder', T('El número u indiscutible: el mercat sencer mira què fa.'), A(T('Número u'), 'especial', 65, 125, 95, 4, T('Dany enorme que no falla mai.'))]]
  };
  // Nous nivells d'evolució repartits fins al 50 (es manté l'ordre i, si n'hi havia, les condicions especials)
  function levels(sp) {
    const o = sp.forms.map(f => f.lvl), n = o.length;
    if (n >= 3) { const a = Math.max(8, o[1] - 4), b = Math.max(a + 8, Math.round(o[2] * 0.7)), c = b + 10; return [1, a, b, c, Math.min(49, c + 10)]; }
    if (n === 2) { const a = Math.max(8, o[1] - 2), b = a + 12; return [1, a, b, Math.min(49, b + 12)]; }
    return [1, 36, 46];
  }
  const CROWN_UP = { none: 'star', star: 'halo', halo: 'orbit', orbit: 'halo' };
  GD.cmSpecies.forEach(sp => {
    const extra = E[sp.id]; if (!extra || sp.forms.length >= 5 || sp.evoExtended) return;
    const lv = levels(sp);
    const base = sp.forms[sp.forms.length - 1].look || {};
    extra.forEach(([name, desc, atk], k) => {
      const look = Object.assign({}, base, k === 0
        ? { cape: 1, aura: Math.max(2, base.aura || 0), crown: base.crown || 'star' }
        : { cape: 1, gem: 1, aura: 3, crown: CROWN_UP[base.crown || 'none'] || 'halo', eyes: base.eyes === 'glasses' || base.eyes === 'robot' ? base.eyes : 'sharp' });
      sp.forms.push({ name, lvl: 0, desc, look, attacks: [atk] });
    });
    sp.forms.forEach((f, i) => { f.lvl = lv[i]; });
    sp.evoExtended = true;
  });
})();
