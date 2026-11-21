/* Agència Digital — Calendari d'entregues de cada grup
   Cada data és el darrer dia per entregar (fins a les 23:59 d'aquell dia, hora del dispositiu).
   Les claus són els identificadors de les tasques: projectes (GD.projects) i webs del Taller («web-N»).
   Per canviar una data, edita-la aquí (format AAAA-MM-DD). Per afegir un grup, copia'n un i canvia el codi.
   Calendari intensiu: dues entregues per setmana (projecte i web del mateix client, o dues webs) i s'acaba a finals de gener.
   CM10-2B i CM10-2A van al mateix ritme (mateixes dates des del 27/11); CM20-2, els dijous.
   Can Jordi es lliura la setmana del 23/11 perquè l'alumnat avanci la campanya fins al capítol 2.2 (Bellmunt, 1/12).
   S'han saltat les vacances de Nadal (21/12–7/1) i el festiu del 8/12. */
window.GD = window.GD || {};

GD.entregues = {
  'CM10-2B': {
    'pla-forn': '2026-11-17',
    'campanya-forn': '2026-11-17',
    'web-1': '2026-11-17',
    'local-jordi': '2026-11-27',
    'b2b-miquel': '2026-12-01',
    'web-2': '2026-12-09',
    'web-3': '2026-12-09',
    'web-4': '2026-12-15',
    'continguts-berta': '2026-12-15',
    'web-5': '2027-01-12',
    'web-6': '2027-01-12',
    'franca-amelie': '2027-01-19',
    'web-7': '2027-01-19',
    'web-8': '2027-01-26'
  },
  'CM10-2A': {
    'pla-forn': '2026-11-24',
    'campanya-forn': '2026-11-24',
    'web-1': '2026-11-24',
    'local-jordi': '2026-11-27',
    'b2b-miquel': '2026-12-01',
    'web-2': '2026-12-09',
    'web-3': '2026-12-09',
    'web-4': '2026-12-15',
    'continguts-berta': '2026-12-15',
    'web-5': '2027-01-12',
    'web-6': '2027-01-12',
    'franca-amelie': '2027-01-19',
    'web-7': '2027-01-19',
    'web-8': '2027-01-26'
  },
  'CM20-2': {
    'pla-forn': '2026-11-12',
    'campanya-forn': '2026-11-12',
    'web-1': '2026-11-19',
    'local-jordi': '2026-11-26',
    'b2b-miquel': '2026-12-03',
    'web-2': '2026-12-10',
    'web-3': '2026-12-10',
    'web-4': '2026-12-17',
    'continguts-berta': '2026-12-17',
    'web-5': '2027-01-14',
    'web-6': '2027-01-14',
    'franca-amelie': '2027-01-21',
    'web-7': '2027-01-21',
    'web-8': '2027-01-28'
  }
};

/* Què passa si no s'entrega a temps (s'aplica un sol cop per tasca, quan passa la data):
   - el client reclama una indemnització: finePct % del pagament màxim de la tasca (com a mínim fineMin €);
   - la confiança del client baixa (trust) i també la reputació de l'agència (rep);
   - si s'entrega més tard, el client només paga latePayPct % del que tocaria segons la nota. */
GD.ENTREGA = { finePct: 20, fineMin: 100, trust: -2, rep: -2, latePayPct: 50 };

// Data límit (final del dia) d'una tasca per a un grup, o null si el grup no en té
GD.dueDate = (classe, task) => {
  const g = GD.entregues[classe], d = g && g[task];
  if (!d) return null;
  const [y, m, dd] = d.split("-").map(Number);
  return new Date(y, m - 1, dd, 23, 59, 59);
};
