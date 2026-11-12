/* Agència Digital — Calendari d'entregues de cada grup
   Cada data és el darrer dia per entregar (fins a les 23:59 d'aquell dia, hora del dispositiu).
   Les claus són els identificadors de les tasques: projectes (GD.projects) i webs del Taller («web-N»).
   Per canviar una data, edita-la aquí (format AAAA-MM-DD). Per afegir un grup, copia'n un i canvia el codi.
   S'han saltat les vacances de Nadal (21/12–7/1) i de Setmana Santa (22/3–2/4), i el festiu del 8/12. */
window.GD = window.GD || {};

GD.entregues = {
  'CM10-2B': {
    'pla-forn': '2026-11-17',
    'campanya-forn': '2026-11-17',
    'web-1': '2026-11-17',
    'local-jordi': '2026-12-01',
    'web-2': '2026-12-09',
    'b2b-miquel': '2026-12-15',
    'web-3': '2027-01-12',
    'ecommerce-nuria': '2027-01-19',
    'web-4': '2027-01-26',
    'kpi-sergi': '2027-02-02',
    'web-5': '2027-02-09',
    'pitch-coop': '2027-02-16',
    'proposta-quim': '2027-02-23',
    'continguts-berta': '2027-03-02',
    'processos-julia': '2027-03-09',
    'auditoria-nuria': '2027-03-16',
    'crisi-jordi': '2027-04-06',
    'informe-marta': '2027-04-13',
    'marca-agencia': '2027-04-20',
    'web-6': '2027-04-27',
    'franca-amelie': '2027-05-04',
    'web-7': '2027-05-11',
    'ia-berta': '2027-05-18',
    'portafoli-final': '2027-06-01',
    'web-8': '2027-06-08'
  },
  'CM10-2A': {
    'pla-forn': '2026-11-18',
    'campanya-forn': '2026-11-18',
    'web-1': '2026-11-18',
    'local-jordi': '2026-12-02',
    'web-2': '2026-12-09',
    'b2b-miquel': '2026-12-16',
    'web-3': '2027-01-13',
    'ecommerce-nuria': '2027-01-20',
    'web-4': '2027-01-27',
    'kpi-sergi': '2027-02-03',
    'web-5': '2027-02-10',
    'pitch-coop': '2027-02-17',
    'proposta-quim': '2027-02-24',
    'continguts-berta': '2027-03-03',
    'processos-julia': '2027-03-10',
    'auditoria-nuria': '2027-03-17',
    'crisi-jordi': '2027-04-07',
    'informe-marta': '2027-04-14',
    'marca-agencia': '2027-04-21',
    'web-6': '2027-04-28',
    'franca-amelie': '2027-05-05',
    'web-7': '2027-05-12',
    'ia-berta': '2027-05-19',
    'portafoli-final': '2027-06-02',
    'web-8': '2027-06-09'
  },
  'CM20-2': {
    'pla-forn': '2026-11-12',
    'campanya-forn': '2026-11-12',
    'web-1': '2026-11-19',
    'local-jordi': '2026-12-03',
    'web-2': '2026-12-10',
    'b2b-miquel': '2026-12-17',
    'web-3': '2027-01-14',
    'ecommerce-nuria': '2027-01-21',
    'web-4': '2027-01-28',
    'kpi-sergi': '2027-02-04',
    'web-5': '2027-02-11',
    'pitch-coop': '2027-02-18',
    'proposta-quim': '2027-02-25',
    'continguts-berta': '2027-03-04',
    'processos-julia': '2027-03-11',
    'auditoria-nuria': '2027-03-18',
    'crisi-jordi': '2027-04-08',
    'informe-marta': '2027-04-15',
    'marca-agencia': '2027-04-22',
    'web-6': '2027-04-29',
    'franca-amelie': '2027-05-06',
    'web-7': '2027-05-13',
    'ia-berta': '2027-05-20',
    'portafoli-final': '2027-06-03',
    'web-8': '2027-06-10'
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
