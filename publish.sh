#!/bin/bash

set -e

echo "🚀 n8n-nodes-easyshopper Veröffentlichung"
echo "=========================================="
echo ""

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Pre-Publish Check
echo -e "${BLUE}📋 Schritt 1: Pre-Publish Sicherheitsprüfung${NC}"
./pre-publish-check.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Pre-Publish Check fehlgeschlagen${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Schritt 2: npm Login prüfen${NC}"

# Prüfe npm Login
if ! npm whoami > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Du bist nicht bei npm eingeloggt${NC}"
    echo ""
    echo "Bitte führe aus:"
    echo "  npm login"
    echo ""
    echo "Schritte:"
    echo "1. Username eingeben"
    echo "2. Password eingeben"
    echo "3. Email eingeben"
    echo "4. 2FA Code (falls aktiviert)"
    echo ""
    read -p "Drücke ENTER nachdem du dich eingeloggt hast..."
    
    if ! npm whoami > /dev/null 2>&1; then
        echo -e "${RED}❌ npm Login fehlgeschlagen${NC}"
        exit 1
    fi
fi

NPM_USER=$(npm whoami)
echo -e "${GREEN}✅ Eingeloggt als: $NPM_USER${NC}"

echo ""
echo -e "${BLUE}📋 Schritt 3: Package Name Verfügbarkeit prüfen${NC}"

# Prüfe ob Package-Name verfügbar ist
if npm view n8n-nodes-easyshopper > /dev/null 2>&1; then
    CURRENT_VERSION=$(npm view n8n-nodes-easyshopper version)
    echo -e "${YELLOW}⚠️  Package existiert bereits (Version: $CURRENT_VERSION)${NC}"
    echo "Du versuchst zu veröffentlichen: 0.1.0"
    echo ""
    echo "Optionen:"
    echo "1. Version in package.json erhöhen (z.B. auf 0.1.1)"
    echo "2. Anderen Package-Namen verwenden"
    echo ""
    read -p "Fortfahren? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Package-Name 'n8n-nodes-easyshopper' ist verfügbar${NC}"
fi

echo ""
echo -e "${BLUE}📋 Schritt 4: Finale Dry-Run${NC}"
npm publish --dry-run --access public

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Dry-Run fehlgeschlagen${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Dry-Run erfolgreich!${NC}"
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  ACHTUNG: Bereit für ECHTES Publish!${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════${NC}"
echo ""
echo "Package: n8n-nodes-easyshopper@0.1.0"
echo "User: $NPM_USER"
echo "Registry: https://registry.npmjs.org/"
echo ""
echo "Nach dem Publish:"
echo "  ✓ Package ist öffentlich verfügbar"
echo "  ✓ Kann nicht mehr gelöscht werden (nur innerhalb 72h)"
echo "  ✓ In n8n installierbar via Community Nodes"
echo ""
read -p "🚀 Jetzt veröffentlichen? (yes/NO) " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Abgebrochen.${NC}"
    echo ""
    echo "Zum manuellen Publish später:"
    echo "  npm publish --access public"
    exit 0
fi

echo ""
echo -e "${BLUE}📦 Veröffentliche Package...${NC}"

npm publish --access public

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 Erfolgreich veröffentlicht!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════${NC}"
    echo ""
    echo "📦 Package: https://www.npmjs.com/package/n8n-nodes-easyshopper"
    echo ""
    echo "Installation in n8n:"
    echo "  1. Settings → Community Nodes"
    echo "  2. Install a community node"
    echo "  3. Package: n8n-nodes-easyshopper"
    echo ""
    echo "Nächste Schritte:"
    echo "  • GitHub Repository erstellen und pushen"
    echo "  • README mit Badge aktualisieren"
    echo "  • n8n Community informieren"
    echo ""
else
    echo -e "${RED}❌ Veröffentlichung fehlgeschlagen${NC}"
    exit 1
fi
