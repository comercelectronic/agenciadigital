/* Agència Digital — Calendari d'entregues de cada grup
   Cada data és el darrer dia per entregar (fins a les 23:59 d'aquell dia, hora del dispositiu).
   Les claus són els identificadors de les tasques: projectes (GD.projects) i webs del Taller («web-N»).
   Per canviar una data, edita-la aquí (format AAAA-MM-DD). Per afegir un grup, copia'n un i canvia el codi.
   Calendari compactat: s'acaba la setmana del 15 de març. Algunes setmanes tenen dues entregues (sovint un projecte
   i la web del mateix client). S'han saltat les vacances de Nadal (21/12–7/1) i el festiu del 8/12. */
window.GD = window.GD || {};

GD.entregues = {
  'CM10-2B': {
    'pla-forn': '2026-11-17',
    'campanya-forn': '2026-11-17',
    'web-1': '2026-11-17',
    'local-jordi': '2026-12-01',
    'b2b-miquel': '2026-12-09',
    'web-2': '2026-12-09',
    'ecommerce-nuria': '2026-12-15',
    'web-3': '2026-12-15',
    'kpi-sergi': '2027-01-12',
    'pitch-coop': '2027-01-19',
    'web-4': '2027-01-19',
    'proposta-quim': '2027-01-26',
    'web-5': '2027-01-26',
    'continguts-berta': '2027-02-02',
    'processos-julia': '2027-02-02',
    'auditoria-nuria': '2027-02-09',
    'crisi-jordi': '2027-02-16',
    'informe-marta': '2027-02-16',
    'marca-agencia': '2027-02-23',
    'web-6': '2027-02-23',
    'franca-amelie': '2027-03-02',
    'web-7': '2027-03-02',
    'ia-berta': '2027-03-09',
    'portafoli-final': '2027-03-16',
    'web-8': '2027-03-16'
  },
  'CM10-2A': {
    'pla-forn': '2026-11-18',
    'campanya-forn': '2026-11-18',
    'web-1': '2026-11-18',
    'local-jordi': '2026-12-02',
    'b2b-miquel': '2026-12-09',
    'web-2': '2026-12-09',
    'ecommerce-nuria': '2026-12-16',
    'web-3': '2026-12-16',
    'kpi-sergi': '2027-01-13',
    'pitch-coop': '2027-01-20',
    'web-4': '2027-01-20',
    'proposta-quim': '2027-01-27',
    'web-5': '2027-01-27',
    'continguts-berta': '2027-02-03',
    'processos-julia': '2027-02-03',
    'auditoria-nuria': '2027-02-10',
    'crisi-jordi': '2027-02-17',
    'informe-marta': '2027-02-17',
    'marca-agencia': '2027-02-24',
    'web-6': '2027-02-24',
    'franca-amelie': '2027-03-03',
    'web-7': '2027-03-03',
    'ia-berta': '2027-03-10',
    'portafoli-final': '2027-03-17',
    'web-8': '2027-03-17'
  },
  'CM20-2': {
    'pla-forn': '2026-11-12',
    'campanya-forn': '2026-11-12',
    'web-1': '2026-11-19',
    'local-jordi': '2026-12-03',
    'b2b-miquel': '2026-12-10',
    'web-2': '2026-12-10',
    'ecommerce-nuria': '2026-12-17',
    'web-3': '2026-12-17',
    'kpi-sergi': '2027-01-14',
    'pitch-coop': '2027-01-21',
    'web-4': '2027-01-21',
    'proposta-quim': '2027-01-28',
    'web-5': '2027-01-28',
    'continguts-berta': '2027-02-04',
    'processos-julia': '2027-02-04',
    'auditoria-nuria': '2027-02-11',
    'crisi-jordi': '2027-02-18',
    'informe-marta': '2027-02-18',
    'marca-agencia': '2027-02-25',
    'web-6': '2027-02-25',
    'franca-amelie': '2027-03-04',
    'web-7': '2027-03-04',
    'ia-berta': '2027-03-11',
    'portafoli-final': '2027-03-18',
    'web-8': '2027-03-18'
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
