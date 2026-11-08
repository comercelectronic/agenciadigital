#!/bin/sh
# Copia el joc (fitxers estàtics) a la web d'ecoynexo.com perquè es serveixi des d'allà: ecoynexo.com/jocs/agencia-digital/
# Ús: scripts/publicar-ecoynexo.sh [carpeta del repositori econexo]   (per defecte ../econexo)
set -e
ARREL="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$ARREL/../econexo}/public/jocs/agencia-digital"
mkdir -p "$DEST"
rm -rf "$DEST/js" "$DEST/icons"
cp -r "$ARREL/js" "$ARREL/icons" "$DEST/"
cp "$ARREL/index.html" "$ARREL/professor.html" "$ARREL/guia.html" "$ARREL/style.css" "$ARREL/manifest.webmanifest" "$ARREL/sw.js" "$DEST/"
echo "Joc copiat a $DEST"
