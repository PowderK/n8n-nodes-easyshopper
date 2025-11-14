#!/bin/bash

set -e

echo "🔍 Pre-Publish Sicherheitsprüfung für n8n-nodes-easyshopper"
echo "============================================================"

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Sensible Daten die NICHT veröffentlicht werden dürfen
# Note: Client-ID (f1f98e3c-b86d-47f7-ada5-83dd0250c2b6) ist app-weit und kann veröffentlicht werden
SENSITIVE_PATTERNS=(
    "d7b5ef17-d378-4ea0-b541-3a41255baa2a"
    "ZjFmOThlM2MtYjg2ZC00N2Y3LWFkYTUtODNkZDAyNTBjMmI2"
    "682ef075-b1c1-472a-9924-d25748d95ee7"
    "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik"
)

echo ""
echo "🔐 Prüfe auf sensible Daten..."

FOUND_SENSITIVE=0

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if grep -r "$pattern" src/ README.md LICENSE CREDENTIALS_GUIDE.md 2>/dev/null; then
        echo -e "${RED}❌ WARNUNG: Sensible Daten gefunden: $pattern${NC}"
        FOUND_SENSITIVE=1
    fi
done

if [ $FOUND_SENSITIVE -eq 1 ]; then
    echo -e "${RED}❌ ABBRUCH: Sensible Daten gefunden! Bitte entfernen.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Keine sensiblen Daten gefunden${NC}"

# Prüfe dist/ Verzeichnis
echo ""
echo "📦 Prüfe Build-Artefakte..."

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist/ Verzeichnis fehlt${NC}"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo -e "${RED}❌ dist/index.js fehlt${NC}"
    exit 1
fi

if [ ! -f "dist/nodes/EasyShopper/EasyShopper.node.js" ]; then
    echo -e "${RED}❌ Node-Datei fehlt${NC}"
    exit 1
fi

if [ ! -f "dist/credentials/EasyShopperApi.credentials.js" ]; then
    echo -e "${RED}❌ Credentials-Datei fehlt${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Alle erforderlichen Dateien vorhanden${NC}"

# Prüfe package.json
echo ""
echo "📋 Prüfe package.json..."

if ! grep -q '"n8n-community-node-package"' package.json; then
    echo -e "${YELLOW}⚠️  Warnung: 'n8n-community-node-package' keyword fehlt${NC}"
fi

if ! grep -q '"n8n":' package.json; then
    echo -e "${RED}❌ n8n Konfiguration fehlt in package.json${NC}"
    exit 1
fi

echo -e "${GREEN}✅ package.json korrekt${NC}"

# Zeige Package-Inhalt
echo ""
echo "📦 Package-Inhalt (Dry-Run):"
npm pack --dry-run 2>&1 | grep -E "dist/|README|LICENSE|CREDENTIALS"

echo ""
echo -e "${GREEN}✅ Pre-Publish Check erfolgreich!${NC}"
echo ""
echo "Nächste Schritte:"
echo "1. npm login (falls noch nicht eingeloggt)"
echo "2. npm publish --dry-run (finaler Test)"
echo "3. npm publish --access public (echtes Publish)"
