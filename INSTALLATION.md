# 🚀 EasyShopper n8n Node - Installation & Setup Guide

## 📋 Überblick

Diese n8n Custom Node ermöglicht es, EasyShopper direkt in n8n-Workflows zu integrieren für vollautomatisierte Einkaufslisten-Verwaltung.

## 🏗️ Installation

### Option 1: NPM Package (Empfohlen für Produktion)

```bash
# In deinem n8n-Verzeichnis
npm install n8n-nodes-easyshopper

# n8n neu starten
npm start
```

### Option 2: Lokale Entwicklung/Test

```bash
# Repository klonen und bauen
git clone <repository>
cd n8n-nodes-easyshopper
npm install
npm run build

# Node in n8n verlinken
npm link
cd /path/to/your/n8n
npm link n8n-nodes-easyshopper

# n8n mit Development-Modus starten
N8N_CUSTOM_EXTENSIONS=/path/to/n8n-nodes-easyshopper npm start
```

### Option 3: Community Nodes (wenn veröffentlicht)

1. Öffne n8n Web Interface
2. Gehe zu **Settings** → **Community Nodes**
3. Klicke **Install a community node**
4. Gebe ein: `n8n-nodes-easyshopper`
5. Klicke **Install**

## 🔐 Credentials Setup

### 1. EasyShopper API Credentials erstellen

1. In n8n: **Credentials** → **Create New** → **EasyShopper API**
2. Fülle folgende Felder aus:

```
Device ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
API Credentials: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Base URL: https://api.es-prod.whiz-cart.com
```

### 2. Eigene Credentials extrahieren

Falls du andere Credentials verwenden möchtest:

```bash
# Aus unserem Python-Script
cd /Users/benni/EasyShopper
./shop validate  # Zeigt aktuelle Credentials
```

## 🎯 Quick Start - Erstes Workflow

### Simple "Produkt hinzufügen" Workflow

1. **Neuen Workflow erstellen**
2. **Manual Trigger** hinzufügen
3. **EasyShopper Node** hinzufügen:
   - Resource: `Shopping List`
   - Operation: `Add Item`
   - Product Name: `Testprodukt`
   - Quantity: `1`
   - Category: `Auto (AI Detection)`
4. **Credentials** auswählen
5. **Execute** klicken

### Expected Output:
```json
{
  "success": true,
  "productName": "Testprodukt",
  "quantity": 1,
  "category": "diverse_nonfood",
  "itemGuid": "cc456584-c144-44f7-afb7-aca9fdb15b09"
}
```

## 🛠️ Verfügbare Operationen

### Shopping List Management

| Operation | Description | Parameters |
|-----------|-------------|------------|
| **Add Item** | Fügt Produkt zur Liste hinzu | productName, quantity, category |
| **Get Items** | Holt alle Listeneinträge | - |
| **Remove Item** | Entfernt spezifischen Eintrag | itemGuid |
| **Clear List** | Löscht komplette Liste | - |

### Authentication

| Operation | Description | Parameters |
|-----------|-------------|------------|
| **Login** | Authentifizierung testen | - |

## 🤖 Automatisierung-Beispiele

### 1. Wöchentliche Grundeinkäufe
```
Schedule Trigger (Montags 9:00)
↓
EasyShopper: Clear List
↓
Set Node: ["Milch", "Brot", "Eier"]
↓
Split in Batches
↓
EasyShopper: Add Item (Loop)
```

### 2. E-Mail zu Einkaufsliste
```
Email Trigger (Betreff: "Einkauf")
↓
Extract (Regex: Produktnamen)
↓
EasyShopper: Add Item
↓
Send Confirmation Email
```

### 3. Slack Integration
```
Webhook (/einkauf Command)
↓
Parse Command Text
↓
EasyShopper: Add Item
↓
Slack Response
```

## 🏷️ Kategorien System

Die Node unterstützt automatische Kategorie-Erkennung:

| Input | Auto-Detection | Kategorie |
|-------|----------------|-----------|
| `Milch` | ✅ | `molkereiprodukte` |
| `Brot` | ✅ | `brot_backwaren` |
| `Banane` | ✅ | `obst_gemuese` |
| `Schokolade` | ✅ | `suessigkeiten_snacks` |

## 🔍 Debugging & Troubleshooting

### Debug-Modus aktivieren
```bash
N8N_LOG_LEVEL=debug npm start
```

### Häufige Probleme

**1. "Authentication failed"**
```bash
# Credentials testen
curl -X POST https://api.es-prod.whiz-cart.com/mobile-backend/api/v4/login \
  -H "Authorization: Basic [BASE64_ENCODED_CREDENTIALS]" \
  -H "Content-Type: application/json" \
  -d '{"uniqueDeviceId":"[YOUR_DEVICE_ID]"}'
```

**2. Node nicht verfügbar**
```bash
# Prüfe n8n Custom Extensions
echo $N8N_CUSTOM_EXTENSIONS
ls -la node_modules/n8n-nodes-easyshopper/
```

**3. TypeScript Errors**
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📊 Performance & Limits

- **Rate Limiting**: Maximal 60 Requests/Minute
- **Batch Processing**: Empfohlen für >10 Produkte
- **Error Handling**: Automatische Retry bei 5xx Fehlern
- **Token Management**: Automatische Refresh bei Ablauf

## 🔄 Updates & Wartung

### Package Updates
```bash
npm update n8n-nodes-easyshopper
```

### Development Updates
```bash
git pull origin main
npm install
npm run build
```

## 📝 Integration Examples

### Mit bestehenden Tools kombinieren

**1. Todoist → EasyShopper**
```
Todoist Trigger (Label: #einkauf)
↓ 
Extract Task Title
↓
EasyShopper: Add Item
```

**2. Google Sheets → EasyShopper**
```
Google Sheets Trigger (New Row)
↓
Loop through Products
↓
EasyShopper: Add Item
```

**3. Home Assistant → EasyShopper**
```
Webhook (Smart Home Sensor)
↓
Parse Product (Voice Command)
↓
EasyShopper: Add Item
```

## 🚀 Production Deployment

### Docker Environment
```dockerfile
FROM n8nio/n8n:latest
RUN npm install -g n8n-nodes-easyshopper
```

### Environment Variables
```bash
# .env
N8N_CUSTOM_EXTENSIONS=/app/custom-nodes
EASYSHOPPER_DEFAULT_DEVICE_ID=[YOUR_DEVICE_ID]
```

### Backup & Recovery
```bash
# Backup Credentials
n8n export:credentials --output=./backup/
# Backup Workflows
n8n export:workflow --output=./backup/
```

---

## 📞 Support

- **Issues**: [GitHub Issues](../../issues)
- **Documentation**: [README.md](README.md)
- **Examples**: [examples/](examples/)

## 📄 License

MIT License - siehe [LICENSE](LICENSE)