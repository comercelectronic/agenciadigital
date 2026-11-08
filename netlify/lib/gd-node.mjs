// Permet carregar al servidor els fitxers de dades del joc (pensats per al navegador): defineix window i T()
globalThis.window = globalThis;
if (!globalThis.T) globalThis.T = (s, a) => (a ? String(s).replace(/\{(\d+)\}/g, (m, i) => a[i]) : s);
