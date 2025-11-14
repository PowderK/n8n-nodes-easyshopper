#!/bin/bash

echo "🔨 Building EasyShopper n8n Node..."

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf dist/

# TypeScript compilation
echo -e "${YELLOW}📝 Compiling TypeScript...${NC}"
npx tsc

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript compilation failed${NC}"
    exit 1
fi

# Copy assets (icons, etc.)
echo -e "${YELLOW}📋 Copying assets...${NC}"
npx gulp build:icons

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Asset copying failed${NC}"
    exit 1
fi

# Run linting
echo -e "${YELLOW}🔍 Running linter...${NC}"
npm run lint

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Linting issues found, but continuing...${NC}"
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "📦 Package ready for:"
echo "  • npm publish (for community nodes)"
echo "  • npm link (for local development)"
echo "  • Direct installation in n8n"