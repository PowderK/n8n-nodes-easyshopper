# n8n-nodes-easyshopper

Eine n8n Community Node für die Integration mit der EasyShopper API zum Verwalten von Einkaufslisten.

## Features

- ✅ **Produkte hinzufügen** - Füge Artikel zu deiner EasyShopper Einkaufsliste hinzu
- 📋 **Liste abrufen** - Hole alle Artikel aus deiner Einkaufsliste
- 🗑️ **Artikel entfernen** - Entferne spezifische Artikel von der Liste
- 🧹 **Liste leeren** - Lösche alle Artikel auf einmal
- 🤖 **Auto-Kategorisierung** - KI-basierte Produktkategorien-Erkennung
- 🔐 **Device-basierte Authentifizierung** - Sichere API-Verbindung

## Installation

### Community Nodes (Empfohlen)

1. Gehe zu **Settings > Community Nodes** in deiner n8n-Installation
2. Klicke auf **Install a community node**
3. Gebe ein: `n8n-nodes-easyshopper`
4. Klicke **Install**

### Manuelle Installation

1. Navigiere zu deinem n8n-Installationsverzeichnis
2. Führe aus: `npm install n8n-nodes-easyshopper`
3. Starte n8n neu

## Konfiguration

### 1. Credentials einrichten

1. Gehe zu **Credentials** in n8n
2. Klicke **Create New**
3. Wähle **EasyShopper API**
4. Fülle die folgenden Felder aus:
   - **Device ID**: Deine EasyShopper Device ID (UUID-Format)
   - **API Credentials**: Deine API-Credentials im Format `clientId:deviceId`
   - **Base URL**: `https://api.es-prod.whiz-cart.com` (Standard)

### 2. Credentials aus bestehender Installation extrahieren

2. Credentials aus deiner EasyShopper-Installation:

```bash
# Extrahiere deine persönlichen Credentials aus der App
# Diese findest du in den Netzwerk-Requests der EasyShopper App
# Oder nutze ein Tool wie mitmproxy/Charles Proxy
```

## Verwendung

### Grundlegende Operationen

#### Produkt hinzufügen
```
Resource: Shopping List
Operation: Add Item
Product Name: "Milch"
Quantity: 2
Category: Auto (AI Detection)
```

#### Einkaufsliste abrufen
```
Resource: Shopping List
Operation: Get Items
```

#### Artikel entfernen
```
Resource: Shopping List
Operation: Remove Item
Item GUID: "cc456584-c144-44f7-afb7-aca9fdb15b09"
```

### Workflow-Beispiele

#### 1. Wöchentliche Einkaufsliste
```
Schedule Trigger (weekly)
↓
EasyShopper: Clear List
↓
Set Node (Grundeinkäufe)
↓
EasyShopper: Add Item (Loop)
```

#### 2. E-Mail zu Einkaufsliste
```
Email Trigger
↓
Extract Text (Produktnamen)
↓
Split In Batches
↓
EasyShopper: Add Item
```

#### 3. Slack Integration
```
Slack Trigger (/einkauf Brot)
↓
EasyShopper: Add Item
↓
Slack: Send Confirmation
```

## Verfügbare Kategorien

- **Auto (AI Detection)** - Automatische Kategorien-Erkennung
- **Obst & Gemüse** - `obst_gemuese`
- **Fleisch & Wurst** - `fleisch_wurst`
- **Fisch & Meeresfrüchte** - `fisch_meeresfruechte`
- **Molkereiprodukte** - `molkereiprodukte`
- **Brot & Backwaren** - `brot_backwaren`
- **Getränke** - `getraenke`
- **Süßwaren** - `suessigkeiten_snacks`
- **Tiefkühlprodukte** - `tiefkuehlprodukte`
- **Konserven** - `konserven_fertiggerichte`
- **Grundnahrungsmittel** - `grundnahrungsmittel`
- **Diverse Non-Food** - `diverse_nonfood`

## Output-Format

### Add Item Response
```json
{
  "success": true,
  "productName": "Milch",
  "quantity": 1,
  "category": "molkereiprodukte",
  "itemGuid": "cc456584-c144-44f7-afb7-aca9fdb15b09",
  "response": { /* Vollständige API-Response */ }
}
```

### Get Items Response
```json
{
  "success": true,
  "itemsCount": 3,
  "items": [
    {
      "guid": "cc456584-c144-44f7-afb7-aca9fdb15b09",
      "productName": "Milch",
      "quantity": 1,
      "category": "molkereiprodukte"
    }
  ],
  "response": { /* Vollständige API-Response */ }
}
```

## Fehlerbehebung

### Häufige Probleme

1. **Authentication failed**
   - Überprüfe Device ID und API Credentials
   - Stelle sicher, dass das Format `clientId:deviceId` korrekt ist

2. **Invalid Device ID**
   - Device ID muss im UUID-Format vorliegen
   - Beispiel: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

3. **API Rate Limits**
   - Verwende Delay-Nodes zwischen Requests
   - Implementiere Retry-Logic bei 429-Fehlern

### Debug-Modus

Aktiviere n8n Debug-Modus für detaillierte Logs:
```bash
N8N_LOG_LEVEL=debug n8n start
```

## Entwicklung

### Local Development

```bash
# Repository klonen
git clone <repository>
cd n8n-nodes-easyshopper

# Dependencies installieren
npm install

# TypeScript kompilieren
npm run build

# In n8n linken
npm link
cd /path/to/n8n
npm link n8n-nodes-easyshopper
```

### Testing

```bash
# Linting
npm run lint

# Formatting
npm run format

# Build
npm run build
```

## Kompatibilität

- **n8n Version**: >= 0.198.0
- **Node.js**: >= 16.0.0
- **EasyShopper API**: v4/v5

## Support

Für Fragen und Support:

1. Überprüfe die [Dokumentation](README.md)
2. Schaue in die [Issues](../../issues)
3. Erstelle ein neues Issue mit detaillierter Beschreibung

## Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei.

---

**Hinweis**: Dieses Package ist ein Community Node und wird nicht offiziell von n8n oder EasyShopper unterstützt.