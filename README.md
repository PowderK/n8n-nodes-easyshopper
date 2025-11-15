# n8n-nodes-easyshopper

Eine n8n Community Node für die Integration mit der EasyShopper API zum Verwalten von Einkaufslisten.

## Features

- ✅ **Produkte hinzufügen** - Füge Artikel zu deiner EasyShopper Einkaufsliste hinzu
- 📝 **Notizen hinzufügen** - Füge optionale Notizen/Beschreibungen zu Produkten hinzu
- 📷 **Barcode scannen** - Scanne GTIN/EAN Barcodes und füge Produkte direkt hinzu
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

### 1. Device ID aus der App auslesen

1. Öffne die **EasyShopper App** auf deinem Smartphone
2. Gehe zum **Start-Bildschirm** der App
3. Dort findest du einen **QR-Code/Barcode**
4. Scanne den Code mit einem QR-Code-Reader oder mache einen Screenshot

**QR-Code Format:**
```
w4c;xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx;;;de;;;0
```

**Benötigte Daten:**
- Der **zweite Wert** nach dem ersten Semikolon ist deine **Device ID**
- Im obigen Beispiel: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Format: UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

### 2. Credentials in n8n einrichten

1. Gehe zu **Credentials** in n8n
2. Klicke **Create New**
3. Wähle **EasyShopper API**
4. Fülle die folgenden Felder aus:
   - **Device ID**: Die UUID aus dem QR-Code (zweiter Wert)
   - **Base URL**: `https://api.es-prod.whiz-cart.com` (Standard)

✅ Fertig! Der Store GUID wird automatisch beim Login abgerufen.

## Verwendung

### Grundlegende Operationen

#### Produkt hinzufügen
```
Resource: Shopping List
Operation: Add Item
Product Name: "Milch"
Quantity: 2
Category: Auto (AI Detection)
Note: "Fettarm" (optional)
```

#### Barcode scannen
```
Resource: Shopping List
Operation: Scan Barcode
Barcode (GTIN/EAN): "4023300901002"
```
Das Produkt wird automatisch erkannt und zur Liste hinzugefügt. Die API liefert alle Produktdetails inklusive:
- Produktname und Marke
- Kategorie (automatisch zugewiesen)
- Preis
- Produktbild (falls verfügbar)
- Regalposition im Laden

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

#### 1. Barcode-Scanner zu Einkaufsliste
```
Webhook (Barcode aus Scanner-App)
↓
EasyShopper: Scan Barcode
↓
Notification: "Produkt hinzugefügt"
```

#### 2. Wöchentliche Einkaufsliste
```
Schedule Trigger (weekly)
↓
EasyShopper: Clear List
↓
Set Node (Grundeinkäufe)
↓
EasyShopper: Add Item (Loop)
```

#### 3. E-Mail zu Einkaufsliste
```
Email Trigger
↓
Extract Text (Produktnamen)
↓
Split In Batches
↓
EasyShopper: Add Item
```

#### 4. Slack Integration
```
Slack Trigger (/einkauf Brot)
↓
EasyShopper: Add Item
↓
Slack: Send Confirmation
```

## Verfügbare Kategorien

- **Auto (AI Detection)** - Automatische Kategorien-Erkennung durch die App
- **Babykost** - `babykost`
- **Brot & Kuchen** - `brot_kuchen`
- **Brotaufstrich** - `brotaufstrich`
- **Diverse Non-Food** - `diverse_nonfood`
- **Feinkost** - `feinkost`
- **Fette & Eier** - `fette_eier`
- **Fisch** - `fisch`
- **Freizeit** - `freizeit`
- **Garten** - `garten`
- **Gebäck** - `gebaeck`
- **Genussmittel** - `genussmittel`
- **Getränke** - `getraenke`
- **Haushalt** - `haushalt`
- **Hygiene** - `hygiene`
- **Käse** - `kaese`
- **Kaffee, Tee & Kakao** - `kaffee_tee_kakao`
- **Knabbereien** - `knabbereien`
- **Konserven** - `konserven`
- **Molkereiprodukte** - `molkereiprodukte`
- **Nahrungsmittel** - `nahrungsmittel`
- **Obst & Gemüse** - `obst_und_gemuese`
- **Reinigungsmittel** - `reinigungsmittel`
- **Süßwaren** - `suesswaren`
- **Tiefkühlkost** - `tiefkuehlkost`
- **Tierbedarf** - `tierbedarf`
- **Würzmittel** - `wuerzmittel`
- **Wurst & Fleisch** - `wurst_fleisch`

## Output-Format

### Add Item Response
```json
{
  "success": true,
  "productName": "Milch",
  "quantity": 1,
  "category": "molkereiprodukte",
  "note": "Fettarm",
  "itemGuid": "cc456584-c144-44f7-afb7-aca9fdb15b09",
  "response": { /* Vollständige API-Response */ }
}
```

### Scan Barcode Response
```json
{
  "success": true,
  "barcodeType": "product",
  "barcode": "4023300901002",
  "storeGuid": "682ef075-b1c1-472a-9924-d25748d95ee7",
  "product": {
    "shoppingListItemGuid": "0a0dd671-55e0-4a58-b9e6-2cb2526a38c1",
    "itemId": "1419949009-ST",
    "gtin": "4023300901002",
    "brand": "Langnese Flotte Biene",
    "name": "Obstblütenhonig 250g",
    "amount": 1,
    "cgIcon": "konfituere_honig",
    "cgLocalKey": "brotaufstrich",
    "product": {
      "positions": [
        {
          "shelf": 1204,
          "x": 38.71525,
          "y": -2.9666875
        }
      ],
      "weight": 284,
      "hasImage": true,
      "labels": ["Aufstrich", "Brotaufstrich", "Feinkost", "Honig"]
    },
    "priceDetails": {
      "price": 349,
      "original": 349
    }
  },
  "itemGuid": "0a0dd671-55e0-4a58-b9e6-2cb2526a38c1",
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
   - Überprüfe Device ID
   - Stelle sicher, dass die UUID aus dem QR-Code korrekt übernommen wurde

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
git clone https://github.com/PowderK/n8n-nodes-easyshopper.git
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

1. Überprüfe die [Dokumentation](https://github.com/PowderK/n8n-nodes-easyshopper#readme)
2. Schaue in die [Issues](https://github.com/PowderK/n8n-nodes-easyshopper/issues)
3. Erstelle ein neues Issue mit detaillierter Beschreibung

## Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei.

---

**Hinweis**: Dieses Package ist ein Community Node und wird nicht offiziell von n8n oder EasyShopper unterstützt.