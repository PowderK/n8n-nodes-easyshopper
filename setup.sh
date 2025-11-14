#!/bin/bash

echo "📚 EasyShopper n8n Node Setup"
echo "================================="

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📄 Installiere Dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies erfolgreich installiert${NC}"
else
    echo -e "${RED}❌ Fehler bei der Installation der Dependencies${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🔨 Kompiliere TypeScript...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build erfolgreich abgeschlossen${NC}"
else
    echo -e "${RED}❌ Fehler beim Build${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🔍 Führe Linting durch...${NC}"
npm run lint

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Code-Quality prüfung bestanden${NC}"
else
    echo -e "${YELLOW}⚠️ Linting-Warnungen gefunden, aber Build fortgesetzt${NC}"
fi

echo -e "\n${GREEN}🎉 Setup abgeschlossen!${NC}"
echo -e "\n${YELLOW}Nächste Schritte:${NC}"
echo "1. Installiere die Node in n8n:"
echo "   - Gehe zu Settings > Community Nodes"
echo "   - Installiere: n8n-nodes-easyshopper"
echo ""
echo "2. Oder verlinke lokal für Development:"
echo "   npm link"
echo "   cd /path/to/n8n && npm link n8n-nodes-easyshopper"
echo ""
echo "3. Konfiguriere Credentials:"
echo "   - Device ID: [Deine EasyShopper Device ID]"
echo "   - API Credentials: [Client-ID]:[Device-ID]"
echo "   - Siehe README.md für Anleitung zum Extrahieren"