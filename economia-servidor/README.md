# Economia validada al servidor (pendent d'activar)

Aquesta carpeta conté la funció `joc-economia`, la lògica (`lib/`), les migracions de la base de dades (`database/migrations/`) i els tests. **No es desplega**: Netlify només publica `netlify/functions/`, i el joc funciona igual sense aquesta part (els diners es calculen al navegador). El panell del professor té la secció «Economia de la classe», que només funciona quan això està activat.

## Per què és fora del desplegament
Netlify Database només està disponible en un pla basat en crèdits. Amb `@netlify/database` a l'arrel del projecte, el desplegament falla si el pla no ho permet (va passar amb el commit `7af9af6`).

## Activar-la
1. Passa el compte de Netlify a un pla amb crèdits (o comprova que el teu l'inclou).
2. A l'arrel del projecte:
   ```sh
   git mv economia-servidor/functions/joc-economia.mjs netlify/functions/
   git mv economia-servidor/lib netlify/lib
   git mv economia-servidor/database netlify/database
   ```
   i afegeix `"@netlify/database": "^2.0.3"` a les `dependencies` del `package.json` de l'arrel (els imports de la funció ja són correctes un cop moguda: `../lib` i `../../js`).
3. Fes commit i push: Netlify crearà la base de dades i aplicarà les migracions.

## Tests
```sh
cd economia-servidor && npm install && npm test
```
