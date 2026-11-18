/* Mercadeja · dades del joc: sectors, segments, tauler, canals, campanyes, cartes i perfils de la IA.
   Totes les xifres en euros. «bd» = demanda base per empresa i ronda (unitats), que depèn del sector:
   així les capacitats i les mides de mercat escalen igual en tots els sectors. */
(function (root) {
  const D = {};

  D.VERSION = '1.0';

  // Sectors: el professor en tria un per partida. Totes les empreses competeixen en el mateix mercat.
  // El marge brut inicial per empresa i ronda és semblant en tots (≈ 15.000 €), perquè l'economia sigui equilibrada.
  D.sectors = {
    alimentacio: { nom: 'Alimentació de proximitat', unitat: 'lot', unitats: 'lots', preuRef: 12, costBase: 6, bd: 2700,
      producte: 'Lots de producte de proximitat (embotits, formatges i fruita de temporada)', icona: 'cistella' },
    moda: { nom: 'Moda sostenible', unitat: 'peça', unitats: 'peces', preuRef: 45, costBase: 22, bd: 700,
      producte: 'Roba feta amb teixits reciclats i producció local', icona: 'samarreta' },
    tecnologia: { nom: 'Tecnologia de consum', unitat: 'aparell', unitats: 'aparells', preuRef: 120, costBase: 60, bd: 270,
      producte: 'Auriculars i altaveus intel·ligents dissenyats a Catalunya', icona: 'xip' },
    turisme: { nom: 'Experiències turístiques', unitat: 'experiència', unitats: 'experiències', preuRef: 60, costBase: 28, bd: 500,
      producte: 'Escapades i activitats per descobrir el territori', icona: 'motxilla' }
  };

  // Empreses fictícies suggerides per sector (els equips poden canviar el nom)
  D.empresesSuggerides = {
    alimentacio: ['Rebost del Ter', 'Horta Viva', 'La Pastera', 'Cistella Plana', 'Fruits de Ponent', 'Gust de Mar'],
    moda: ['Fil i Agulla', 'Teixit Nou', 'Mar de Cotó', 'Llana Clara', 'Retall', 'Costura Verda'],
    tecnologia: ['Ona Sonora', 'Pixelaire', 'Circuit 22', 'Brúixola Tech', 'Llamp Audio', 'Nuvi Labs'],
    turisme: ['Camins i Cims', 'Rutes del Delta', 'Mar Endins', 'Pirineu Actiu', 'Vinyes i Viatges', 'Estels de Nit']
  };

  // Segments del mercat català (fictici). pes = part de la demanda total. e = elasticitat al preu.
  // w = pes de cada component a l'índex d'atractiu: P preu, Q qualitat percebuda, N notorietat, D distribució, S adequació.
  D.segments = {
    preu: { nom: 'Sensibles al preu', curt: 'Preu', pes: 0.40, e: 3.0, w: { P: 0.45, Q: 0.15, N: 0.15, D: 0.20, S: 0.05 },
      desc: 'Busquen el millor preu. Comparen molt i canvien de marca fàcilment.' },
    qualitat: { nom: 'Prioritzen la qualitat', curt: 'Qualitat', pes: 0.24, e: 1.4, w: { P: 0.20, Q: 0.30, N: 0.15, D: 0.20, S: 0.15 },
      desc: 'Paguen més per un producte fiable i un bon servei.' },
    innovadors: { nom: 'Innovadors', curt: 'Innovació', pes: 0.17, e: 1.1, w: { P: 0.15, Q: 0.15, N: 0.20, D: 0.20, S: 0.30 },
      desc: 'Volen novetats i disseny. Els influeixen molt les xarxes.' },
    responsables: { nom: 'Consumidors responsables', curt: 'Sostenibilitat', pes: 0.19, e: 1.4, w: { P: 0.20, Q: 0.15, N: 0.15, D: 0.20, S: 0.30 },
      desc: 'Valoren la sostenibilitat, la proximitat i la reputació de l\'empresa.' }
  };
  D.SEG = Object.keys(D.segments);
  D.ATRACTIU_FORA = 40; // atractiu de «no comprar»: si totes les ofertes són dolentes, part de la demanda es perd

  // Atributs del producte (0–100)
  D.atributs = {
    qualitat: { nom: 'Qualitat', icona: 'estrella', desc: 'Fiabilitat i prestacions.' },
    disseny: { nom: 'Disseny', icona: 'pinzell', desc: 'Aparença i funcionalitat.' },
    innovacio: { nom: 'Innovació', icona: 'bombeta', desc: 'Novetat i diferenciació.' },
    sostenibilitat: { nom: 'Sostenibilitat', icona: 'fulla', desc: 'Impacte ambiental i proximitat.' },
    servei: { nom: 'Servei postvenda', icona: 'auriculars', desc: 'Atenció i suport al client.' }
  };
  D.ATR = Object.keys(D.atributs);
  D.MILLORA_PASSOS = 10;      // punts que suma cada millora
  D.millorarCost = (valor) => Math.round(2500 * (1 + valor / 60) / 100) * 100; // cada vegada més car

  // Canals de distribució. cap = capacitat (multiplicador de bd). cov = cobertura de cada segment (0–100).
  D.canals = {
    botiga: { nom: 'Botiga física', icona: 'botiga', activar: 0, fix: 2000, comissio: 0, cap: 0.8,
      cov: { preu: 40, qualitat: 60, innovadors: 30, responsables: 50 }, desc: 'Proximitat i experiència de compra. Ja la tens.' },
    ecommerce: { nom: 'Comerç electrònic', icona: 'carro', activar: 8000, fix: 1200, comissio: 0.03, cap: 0.7,
      cov: { preu: 50, qualitat: 40, innovadors: 70, responsables: 45 }, desc: 'Botiga en línia pròpia: abast digital a tot Catalunya.' },
    distribuidor: { nom: 'Distribuïdor', icona: 'camio', activar: 6000, fix: 1000, comissio: 0.12, cap: 1.0,
      cov: { preu: 60, qualitat: 45, innovadors: 30, responsables: 35 }, desc: 'Arriba a botigues d\'altres comarques. Es queda un 12 % de les vendes.' },
    supers: { nom: 'Gran superfície', icona: 'edifici', activar: 12000, fix: 1500, comissio: 0.18, cap: 1.6,
      cov: { preu: 90, qualitat: 35, innovadors: 25, responsables: 25 }, desc: 'Molt de volum, sobretot de clients sensibles al preu. Comissió del 18 %.' },
    marketplace: { nom: 'Marketplace', icona: 'mercat', activar: 4000, fix: 600, comissio: 0.15, cap: 0.9,
      cov: { preu: 75, qualitat: 30, innovadors: 60, responsables: 30 }, desc: 'Visibilitat digital ràpida, però amb comissió i molta competència.' },
    directa: { nom: 'Venda directa', icona: 'encaixada', activar: 5000, fix: 1800, comissio: 0, cap: 0.4,
      cov: { preu: 20, qualitat: 70, innovadors: 55, responsables: 70 }, desc: 'Fires, comandes i clients fidels: control total de la relació.' }
  };
  D.CAN = Object.keys(D.canals);
  D.ESCALA = { max: 0.12, des: 0.8, rang: 1.2 }; // economies d'escala: de 0,8 a 2 vegades bd venudes, el cost baixa fins a un 12 %
  D.CAPACITAT_INICIAL = 1.2;  // producció inicial (× bd)
  D.CAPACITAT_AMPLIAR = { cap: 0.5, cost: 12000 };

  // Campanyes de promoció. not = notorietat que sumen (amb rendiments decreixents). seg = segments on tenen més efecte.
  D.campanyes = {
    xarxes: { nom: 'Xarxes socials', icona: 'mobil', cost: 2000, not: 6, seg: ['innovadors', 'preu'], desc: 'Barat i ràpid. Funciona amb públic jove i innovador.' },
    influencers: { nom: 'Influencers', icona: 'estrella', cost: 4000, not: 9, seg: ['innovadors'], desc: 'Molt d\'abast entre innovadors. Cal triar bé el perfil.' },
    digital: { nom: 'Publicitat digital', icona: 'diana', cost: 3500, not: 8, seg: ['preu', 'qualitat'], desc: 'Anuncis segmentats a cercadors i xarxes.' },
    exterior: { nom: 'Publicitat exterior', icona: 'cartell', cost: 5000, not: 10, seg: ['preu', 'qualitat', 'responsables'], desc: 'Cartells i marquesines: notorietat general.' },
    radio: { nom: 'Ràdio', icona: 'radio', cost: 4500, not: 9, seg: ['qualitat', 'responsables'], desc: 'Emissores locals: confiança i públic adult.' },
    televisio: { nom: 'Televisió', icona: 'tele', cost: 12000, not: 22, seg: ['preu', 'qualitat', 'responsables', 'innovadors'], desc: 'Molt d\'abast, però molt cara.' },
    esdeveniments: { nom: 'Esdeveniments', icona: 'festa', cost: 3000, not: 6, rep: 3, seg: ['responsables', 'innovadors'], desc: 'Tastos, presentacions i activitats al territori.' },
    fires: { nom: 'Fires comercials', icona: 'tenda', cost: 3500, not: 7, cob: 10, seg: ['qualitat', 'responsables'], desc: 'Contactes i visibilitat. Amplia la cobertura aquesta ronda.' },
    pdv: { nom: 'Promoció al punt de venda', icona: 'etiqueta', cost: 2500, not: 4, impuls: 8, seg: ['preu'], desc: 'Ofertes i degustacions a la botiga: empeny la compra aquesta ronda.' },
    rp: { nom: 'Relacions públiques', icona: 'diari', cost: 3000, not: 4, rep: 5, seg: ['responsables', 'qualitat'], desc: 'Notícies i col·laboracions: reputació.' }
  };
  D.CAMP = Object.keys(D.campanyes);
  D.NOTORIETAT_INICIAL = 20;
  D.NOTORIETAT_OBLIT = 0.88;  // cada ronda es manté el 88 % de la notorietat
  D.REPUTACIO_INICIAL = 50;

  D.COSTOS_FIXOS_BASE = 3000;   // per ronda: lloguer, personal mínim, subministraments
  D.INGRES_SORTIDA = 3000;      // en passar per la sortida
  D.PRESTEC = { maxim: 50000, interes: 0.03, interesEmergencia: 0.06 };
  D.PREU_MIN = 0.5; D.PREU_MAX = 2.0; // interval de preu permès (× preu de referència)

  // Valor empresarial: com es valora cada actiu (es documenta a la pantalla de finances)
  D.VALORACIO = { propietat: 0.9, millora: 0.6, capacitat: 0.6, canal: 0.4, producte: 0.4, marca: 150 };

  // ---------- Tauler (24 caselles, recorregut horari) ----------
  // Propietats: preu de compra, taxa (la paga qui hi cau si té propietari), manteniment per ronda i avantatge.
  // ben: cobertura extra per segment (cov), capacitat de producció (prod) o de distribució (dist) en × bd, reducció del cost unitari (cost) i notorietat per ronda (not).
  D.tauler = [
    { n: 1, t: 'sortida', nom: 'Inici de negoci', desc: 'Cada cop que hi passes, cobres 3.000 € d\'ingressos fixos.' },
    { n: 2, t: 'prop', id: 'bcn', nom: 'Comerç de Barcelona', zona: 'Barcelona', icona: 'gratacels', preu: 16000, taxa: 4800, mant: 300,
      ben: { cov: { innovadors: 12, qualitat: 12 }, not: 2 }, txt: '+12 cobertura d\'innovadors i qualitat, +2 notorietat per ronda' },
    { n: 3, t: 'oport', nom: 'Oportunitat digital', desc: 'Roba una carta d\'oportunitat.' },
    { n: 4, t: 'prop', id: 'valles', nom: 'Indústria del Vallès', zona: 'Vallès', icona: 'fabrica', preu: 14000, taxa: 4200, mant: 300,
      ben: { prod: 0.3, cost: 0.03 }, txt: '+30 % de capacitat de producció i −3 % de cost unitari' },
    { n: 5, t: 'empresa', nom: 'Carta d\'empresa', desc: 'Roba una carta d\'empresa: oportunitat o crisi.' },
    { n: 6, t: 'prop', id: 'girona', nom: 'Mercat de Girona', zona: 'Girona', icona: 'parada', preu: 9000, taxa: 2700, mant: 200,
      ben: { cov: { qualitat: 10, responsables: 10 } }, txt: '+10 cobertura de qualitat i responsables' },
    { n: 7, t: 'promo', nom: 'Promoció local', desc: 'Pots fer una promoció al barri: 2.000 € per +8 de notorietat.' },
    { n: 8, t: 'prop', id: 'costa', nom: 'Costa Brava', zona: 'Girona', icona: 'platja', preu: 12000, taxa: 3600, mant: 250,
      ben: { cov: { preu: 8, innovadors: 8 }, not: 2, temporada: 'turisme' }, txt: '+8 cobertura de preu i innovadors, +2 notorietat. Més vendes en temporada turística' },
    { n: 9, t: 'mercat', nom: 'Carta de mercat', desc: 'Roba una carta de mercat: canvia la demanda d\'aquesta ronda.' },
    { n: 10, t: 'prop', id: 'ponent', nom: 'Agroalimentació de Ponent', zona: 'Lleida', icona: 'sitja', preu: 10000, taxa: 3000, mant: 200,
      ben: { cost: 0.04 }, txt: '−4 % de cost unitari (proveïdors de proximitat)' },
    { n: 11, t: 'prop', id: 'lleida', nom: 'Logística de Lleida', zona: 'Lleida', icona: 'magatzem', preu: 11000, taxa: 3300, mant: 200,
      ben: { dist: 0.25 }, txt: '+25 % de capacitat de distribució' },
    { n: 12, t: 'imposts', nom: 'Impostos empresarials', desc: 'Pagues el 10 % del benefici de l\'última ronda (mínim 1.000 €).' },
    { n: 13, t: 'consultoria', nom: 'Consultoria de mercat', desc: 'Un estudi de mercat gratuït: veus l\'atractiu de cada empresa per segment.' },
    { n: 14, t: 'prop', id: 'tarragona', nom: 'Comerç de Tarragona', zona: 'Tarragona', icona: 'botiga', preu: 10000, taxa: 3000, mant: 200,
      ben: { cov: { preu: 10, qualitat: 10 } }, txt: '+10 cobertura de preu i qualitat' },
    { n: 15, t: 'oport', nom: 'Innovació industrial', desc: 'Roba una carta d\'oportunitat.' },
    { n: 16, t: 'prop', id: 'penedes', nom: 'Penedès', zona: 'Penedès', icona: 'raim', preu: 9000, taxa: 2700, mant: 200,
      ben: { cov: { responsables: 10, qualitat: 10 } }, txt: '+10 cobertura de responsables i qualitat' },
    { n: 17, t: 'empresa', nom: 'Carta d\'empresa', desc: 'Roba una carta d\'empresa: oportunitat o crisi.' },
    { n: 18, t: 'prop', id: 'ebre', nom: 'Terres de l\'Ebre', zona: 'Ebre', icona: 'delta', preu: 8000, taxa: 2400, mant: 150,
      ben: { cov: { responsables: 12 }, cost: 0.02 }, txt: '+12 cobertura de responsables i −2 % de cost unitari' },
    { n: 19, t: 'fira', nom: 'Fires i mercats', desc: 'Pots muntar una parada: 4.000 € per +10 de notorietat i +10 de cobertura aquesta ronda.' },
    { n: 20, t: 'prop', id: 'pirineus', nom: 'Pirineus', zona: 'Pirineus', icona: 'muntanya', preu: 9000, taxa: 2700, mant: 200,
      ben: { cov: { innovadors: 8, responsables: 8 }, temporada: 'turisme' }, txt: '+8 cobertura d\'innovadors i responsables. Més vendes en temporada turística' },
    { n: 21, t: 'mercat', nom: 'Carta de mercat', desc: 'Roba una carta de mercat: canvia la demanda d\'aquesta ronda.' },
    { n: 22, t: 'oport', nom: 'Economia circular', desc: 'Roba una carta d\'oportunitat.' },
    { n: 23, t: 'prop', id: 'metro', nom: 'Distribució metropolitana', zona: 'Barcelona', icona: 'camio', preu: 15000, taxa: 4500, mant: 300,
      ben: { dist: 0.35, cov: { preu: 8 } }, txt: '+35 % de capacitat de distribució i +8 cobertura de preu' },
    { n: 24, t: 'auditoria', nom: 'Auditoria empresarial', desc: 'Si l\'última ronda vas tenir benefici i la reputació és de 50 o més, cobres 3.000 €. Si no, pagues 2.000 €.' }
  ];
  D.MILLORA_PROP = { cost: 0.6, taxa: 2, benefici: 1.5 };

  // ---------- Cartes ----------
  // Efectes (e): diners, not (notorietat), rep (reputació), atr {atribut: punts}, costMult (× cost unitari, rondes),
  // demanda {segment|tots: multiplicador, rondes}, cap (× bd de producció), cob {segment: punts, rondes}, preuForcat (guerra de preus).
  // Les cartes de mercat (calendari, territorials i competitives) s'apliquen a tothom; les d'empresa, a qui la roba.
  const C = (id, tipus, titol, text, aprenem, e, extra) => Object.assign({ id, tipus, titol, text, aprenem, e }, extra || {});
  D.cartes = [
    // Oportunitat (verd): les roba qui cau a les caselles d'oportunitat o d'empresa
    C('o1', 'oportunitat', 'Ajut a la digitalització', 'La Generalitat subvenciona projectes digitals de petites empreses.', 'Els ajuts públics poden finançar la transformació digital: cal estar atent a les convocatòries.', { diners: 5000, cobSeg: { innovadors: 8 }, rondes: 2 }),
    C('o2', 'oportunitat', 'Fira comercial a Barcelona', 'Et conviden a exposar gratis a una fira sectorial.', 'Les fires generen contactes i notorietat a cost baix si es preparen bé.', { not: 8, cobSeg: { qualitat: 10 }, rondes: 1 }),
    C('o3', 'oportunitat', 'Nou espai al mercat de Girona', 'Un paradista es jubila i et deixa la parada a bon preu.', 'La distribució de proximitat apropa el producte al client responsable.', { cobSeg: { responsables: 12, qualitat: 6 }, rondes: 3 }),
    C('o4', 'oportunitat', 'Segell de producte de proximitat', 'El teu producte obté un segell de qualitat i proximitat.', 'Les certificacions són una prova creïble del posicionament.', { atr: { sostenibilitat: 10 }, rep: 5 }),
    C('o5', 'oportunitat', 'Millora logística al Vallès', 'Un operador logístic t\'ofereix tarifes més baixes.', 'Reduir costos de distribució millora el marge sense tocar el preu.', { costMult: 0.95, rondes: 3 }),
    C('o6', 'oportunitat', 'Acord amb un distribuïdor', 'Un distribuïdor de Tarragona vol el teu producte.', 'Un intermediari amplia la cobertura a canvi d\'una part del marge.', { cap: 0.2, cobSeg: { preu: 10 }, rondes: 3 }),
    C('o7', 'oportunitat', 'Oportunitat d\'exportació', 'Una botiga del sud de França fa una comanda de prova.', 'Internacionalitzar diversifica el risc, però cal adaptar el producte.', { diners: 6000 }),
    C('o8', 'oportunitat', 'Talent de FP', 'Incorpores un alumne en pràctiques que millora l\'atenció al client.', 'Les persones de l\'equip són part del producte quan hi ha servei.', { atr: { servei: 10 } }),
    C('o9', 'oportunitat', 'Disseny guardonat', 'El teu envàs guanya un premi de disseny.', 'El disseny comunica valor i diferencia el producte al lineal.', { atr: { disseny: 10 }, not: 4 }),
    C('o10', 'oportunitat', 'Reutilització d\'envasos', 'Un projecte d\'economia circular et permet reaprofitar envasos.', 'La sostenibilitat pot reduir costos, no només millorar la imatge.', { atr: { sostenibilitat: 8 }, costMult: 0.97, rondes: 3 }),
    C('o11', 'oportunitat', 'Ressenyes excel·lents', 'Els clients publiquen opinions molt bones.', 'La satisfacció dels clients es converteix en reputació i vendes futures.', { rep: 8 }),
    C('o12', 'oportunitat', 'Prototip innovador', 'El laboratori d\'una universitat catalana col·labora amb tu.', 'La col·laboració amb la universitat accelera la innovació.', { atr: { innovacio: 12 } }),
    // Crisi (vermell)
    C('k1', 'crisi', 'Matèries primeres més cares', 'Puja el preu de les matèries primeres.', 'Quan pugen els costos, cal decidir si es repercuteixen al preu o es redueix el marge.', { costMult: 1.10, rondes: 2 }),
    C('k2', 'crisi', 'Retard de distribució', 'Una vaga de transport retarda els enviaments.', 'Diversificar canals redueix la dependència d\'un sol proveïdor.', { capDist: 0.8, rondes: 1 }),
    C('k3', 'crisi', 'Problemes de proveïment', 'Un proveïdor clau falla i redueixes la producció.', 'Tenir proveïdors alternatius és part de la gestió del risc.', { capProd: 0.8, rondes: 1 }),
    C('k4', 'crisi', 'Mala valoració de clients', 'Un client molest publica una ressenya molt negativa.', 'Una queixa mal gestionada pot afectar la reputació de tota la marca.', { rep: -8 }),
    C('k5', 'crisi', 'Incidència de qualitat', 'Un lot surt defectuós i has de retirar-lo.', 'La qualitat és més barata de mantenir que de recuperar.', { diners: -4000, rep: -5, atr: { qualitat: -5 } }),
    C('k6', 'crisi', 'Pèrdua de notorietat', 'Una campanya de la competència t\'eclipsa.', 'La notorietat s\'ha de treballar contínuament: s\'oblida.', { not: -8 }),
    C('k7', 'crisi', 'Factura energètica', 'Els costos energètics es disparen aquest trimestre.', 'Els costos fixos també poden canviar: cal tenir marge de seguretat.', { diners: -3000 }),
    C('k8', 'crisi', 'Crisi de reputació', 'Un mitjà publica una notícia sobre les condicions de treball del sector.', 'La reputació depèn també de com es comporta l\'empresa, no només del producte.', { rep: -10, not: 3 }),
    C('k9', 'crisi', 'Inspecció de consum', 'Una inspecció detecta errors a l\'etiquetatge.', 'Complir la normativa d\'etiquetatge és obligatori i protegeix el consumidor.', { diners: -2500, rep: -3 }),
    C('k10', 'crisi', 'Avaria a la línia de producció', 'Una màquina s\'espatlla en plena temporada.', 'El manteniment preventiu evita aturades costoses.', { diners: -3500, capProd: 0.85, rondes: 1 }),
    // Mercat: calendari i territori (blau) — s'apliquen a tota la ronda
    C('m1', 'calendari', 'Campanya de Nadal', 'Les famílies compren més per a les festes.', 'L\'estacionalitat canvia la demanda: cal preveure capacitat i estoc.', { demanda: { tots: 1.25 }, rondes: 1 }),
    C('m2', 'calendari', 'Rebaixes d\'hivern', 'El mercat es mou per preu.', 'En rebaixes, el segment sensible al preu creix i la resta espera.', { demanda: { preu: 1.35, qualitat: 0.9 }, rondes: 1 }),
    C('m3', 'calendari', 'Sant Jordi', 'Llibres, roses i compres de proximitat als carrers.', 'Les dates culturals són oportunitats per al comerç local.', { demanda: { responsables: 1.3, qualitat: 1.1 }, rondes: 1 }),
    C('m4', 'calendari', 'Temporada de platja', 'Arriben milers de visitants a la costa.', 'El turisme fa créixer la demanda en zones concretes.', { demanda: { tots: 1.1 }, temporada: 'turisme', rondes: 1 }),
    C('m5', 'calendari', 'Inici del curs escolar', 'Les famílies controlen la despesa.', 'Quan els pressupostos són ajustats, el preu pesa més.', { demanda: { preu: 1.15, innovadors: 0.9 }, rondes: 1 }),
    C('m6', 'calendari', 'La Castanyada', 'Tradicions de tardor i producte de temporada.', 'El producte de temporada connecta amb el client local.', { demanda: { responsables: 1.2, qualitat: 1.1 }, rondes: 1 }),
    C('m7', 'territori', 'Setmana del comerç local', 'Els ajuntaments promocionen el comerç de proximitat.', 'Les campanyes institucionals afavoreixen qui té presència local.', { demanda: { responsables: 1.25 }, premiCanal: 'botiga', rondes: 1 }),
    C('m8', 'calendari', 'Black Friday', 'Tothom espera descomptes.', 'Les promocions massives poden atraure volum però erosionen el marge.', { demanda: { preu: 1.4, innovadors: 1.1, responsables: 0.85 }, rondes: 1 }),
    C('m9', 'territori', 'Temporada turística als Pirineus', 'La neu omple les comarques de muntanya.', 'Els territoris turístics tenen pics de demanda.', { demanda: { innovadors: 1.15 }, temporada: 'turisme', rondes: 1 }),
    C('m10', 'territori', 'Fira gastronòmica a Lleida', 'Una gran fira atrau compradors professionals.', 'Les fires sectorials són un canal per arribar a compradors de qualitat.', { demanda: { qualitat: 1.2 }, rondes: 1 }),
    C('m11', 'territori', 'Festes majors d\'estiu', 'Pobles i ciutats celebren la festa major.', 'Els esdeveniments locals augmenten el consum de proximitat.', { demanda: { tots: 1.08, responsables: 1.1 }, rondes: 1 }),
    C('m12', 'territori', 'Campanya de productes de proximitat', 'Una campanya pública demana comprar a prop.', 'La proximitat és un argument de valor per al segment responsable.', { demanda: { responsables: 1.3, preu: 0.95 }, rondes: 1 }),
    // Competitives (lila)
    C('c1', 'competitiva', 'Guerra de preus', 'Un competidor gran abaixa preus i el segment de preu s\'endureix.', 'En una guerra de preus guanya qui té costos més baixos o es diferencia.', { elasticitat: { preu: 1.3 }, rondes: 1 }),
    C('c2', 'competitiva', 'Campanya viral', 'Un vídeo d\'una marca del sector es fa viral.', 'La notorietat dels altres també afecta la teva: el mercat és relatiu.', { notTots: -5 }),
    C('c3', 'competitiva', 'Entrada d\'una nova marca', 'Una marca estrangera entra al mercat català.', 'Un nou competidor reparteix la mateixa demanda entre més empreses.', { fora: 1.25, rondes: 2 }),
    C('c4', 'competitiva', 'Innovació disruptiva', 'Apareix una tecnologia que canvia el sector.', 'Qui no innova pot quedar obsolet: la innovació perd valor si no es renova.', { atrTots: { innovacio: -6 }, demanda: { innovadors: 1.2 }, rondes: 1 }),
    C('c5', 'competitiva', 'Canvi de tendència', 'Els consumidors joves aposten per marques responsables.', 'Les tendències desplacen la demanda entre segments.', { demanda: { responsables: 1.2, preu: 0.9 }, rondes: 2 }),
    C('c6', 'competitiva', 'Producte substitutiu', 'Un producte alternatiu més barat guanya terreny.', 'Els substitutius limiten el preu que pots cobrar.', { demanda: { preu: 0.85, tots: 0.95 }, rondes: 1 }),
    C('c7', 'competitiva', 'Nou canal de distribució', 'Les aplicacions de repartiment a domicili creixen.', 'Els canals digitals guanyen pes: cal ser-hi quan el client hi és.', { premiCanal: 'ecommerce', premiCanal2: 'marketplace', rondes: 2 }),
    C('c8', 'competitiva', 'Clients exigents', 'Les associacions de consumidors publiquen una comparativa de qualitat.', 'Quan el client té informació, la qualitat real pesa més que la publicitat.', { elasticitat: { qualitat: 0.8 }, pesQ: 1.25, rondes: 1 })
  ];
  D.cartesPer = (tipus) => D.cartes.filter(c => tipus.includes(c.tipus));
  D.COLOR_CARTA = { oportunitat: 'verd', crisi: 'vermell', calendari: 'blau', territori: 'blau', competitiva: 'lila' };

  // ---------- Fitxes ----------
  D.fitxes = [
    { id: 'coet', nom: 'Coet', color: '#F5C542' },
    { id: 'diamant', nom: 'Diamant', color: '#4EA5F5' },
    { id: 'llamp', nom: 'Llamp', color: '#E879B9' },
    { id: 'corona', nom: 'Corona', color: '#36B37E' },
    { id: 'torre', nom: 'Torre', color: '#9B7AE8' },
    { id: 'furgoneta', nom: 'Furgoneta', color: '#F29D49' }
  ];

  // ---------- IA ----------
  D.perfilsIA = {
    agressiva: { nom: 'Agressiva', desc: 'Abaixa preus, busca quota i assumeix riscos.', preu: 0.9, atr: ['qualitat'], camp: ['pdv', 'digital', 'exterior'], canals: ['distribuidor', 'marketplace', 'supers'], compra: 0.55 },
    premium: { nom: 'Premium', desc: 'Inverteix en qualitat i servei, i manté preus alts.', preu: 1.15, atr: ['qualitat', 'servei', 'disseny'], camp: ['radio', 'rp', 'fires'], canals: ['directa', 'ecommerce'], compra: 0.35 },
    equilibrada: { nom: 'Equilibrada', desc: 'Reparteix la inversió entre les quatre P i controla el risc.', preu: 1.0, atr: ['qualitat', 'sostenibilitat', 'servei'], camp: ['digital', 'xarxes', 'radio'], canals: ['ecommerce', 'distribuidor'], compra: 0.4 },
    innovadora: { nom: 'Innovadora', desc: 'Aposta per producte i canals digitals.', preu: 1.06, atr: ['innovacio', 'disseny'], camp: ['influencers', 'xarxes', 'esdeveniments'], canals: ['ecommerce', 'marketplace'], compra: 0.4 }
  };
  D.PERFILS = Object.keys(D.perfilsIA);

  // Insígnies (reconeixements finals)
  D.insignies = {
    rendible: { nom: 'Empresa més rendible', icona: 'grafic' },
    quota: { nom: 'Líder del mercat català', icona: 'trofeu' },
    innovadora: { nom: 'Marca més innovadora', icona: 'bombeta' },
    reputacio: { nom: 'Millor reputació', icona: 'estrella' },
    producte: { nom: 'Mestre del producte', icona: 'paquet' },
    preu: { nom: 'Expert en preus', icona: 'etiqueta' },
    distribucio: { nom: 'Rei de la distribució', icona: 'camio' },
    promocio: { nom: 'Campió de la promoció', icona: 'megafon' },
    sostenible: { nom: 'Empresa sostenible', icona: 'fulla' },
    negociador: { nom: 'Millor negociador', icona: 'encaixada' }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = D; else root.MD = D;
})(typeof window !== 'undefined' ? window : globalThis);
