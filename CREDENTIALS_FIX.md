# 🔧 n8n Credentials Test Fix

## Problem behoben ✅

Das Problem "Authorization failed - please check your credentials" wurde behoben.

**Ursache:** Die EasyShopper API prüft den User-Agent Header und lehnt Requests ohne korrekten User-Agent ab.

**Lösung:** Alle erforderlichen Header wurden hinzugefügt:
- ✅ `User-Agent: Whiz-Cart/4.143.0-144352; (ios 15.8.5)`
- ✅ `x-subscription-key: 4a8bbd6458444086b7f51ca8b5a89ca9`
- ✅ `Accept-Language: de-DE,de;q=0.9`

## 📋 Credentials-Konfiguration

Verwende diese Werte in n8n:

### Device ID
```
d7b5ef17-d378-4ea0-b541-3a41255baa2a
```

### API Credentials
```
f1f98e3c-b86d-47f7-ada5-83dd0250c2b6:d7b5ef17-d378-4ea0-b541-3a41255baa2a
```

### Base URL
```
https://api.es-prod.whiz-cart.com
```

## 🚀 Installation & Test

### 1. Installiere/Update die Node

Falls du n8n bereits hast:

```bash
cd /Users/benni/EasyShopper/n8n-nodes-easyshopper

# Rebuild
npm run build

# Falls verlinkt, update in n8n
# (n8n neu starten nach Update)
```

### 2. Credentials in n8n konfigurieren

1. Öffne n8n
2. Gehe zu **Credentials**
3. Erstelle neue **EasyShopper API** Credentials
4. Fülle aus:
   - **Device ID**: `d7b5ef17-d378-4ea0-b541-3a41255baa2a`
   - **API Credentials**: `f1f98e3c-b86d-47f7-ada5-83dd0250c2b6:d7b5ef17-d378-4ea0-b541-3a41255baa2a`
   - **Base URL**: `https://api.es-prod.whiz-cart.com`
5. Klicke **Test Connection**

### 3. Erwartetes Ergebnis

Der Test sollte nun **erfolgreich** sein ✅

## 🧪 Manuelle Verification

Teste die Credentials mit curl:

```bash
curl -X POST https://api.es-prod.whiz-cart.com/mobile-backend/api/v4/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "x-subscription-key: 4a8bbd6458444086b7f51ca8b5a89ca9" \
  -H "User-Agent: Whiz-Cart/4.143.0-144352; (ios 15.8.5)" \
  -u "f1f98e3c-b86d-47f7-ada5-83dd0250c2b6:d7b5ef17-d378-4ea0-b541-3a41255baa2a" \
  -d '{"uniqueDeviceId":"d7b5ef17-d378-4ea0-b541-3a41255baa2a"}'
```

**Erfolgreiche Response enthält:**
```json
{
  "authenticationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "deviceId": "d7b5ef17-d378-4ea0-b541-3a41255baa2a",
  "storeGuid": "682ef075-b1c1-472a-9924-d25748d95ee7",
  ...
}
```

## 🔍 Troubleshooting

### "Unrecognized user agent"

**Problem:** User-Agent Header fehlt oder ist falsch

**Lösung:** Stelle sicher dass die aktualisierte Version der Node verwendet wird:
```bash
cd /Users/benni/EasyShopper/n8n-nodes-easyshopper
npm run build
# n8n neu starten
```

### Credentials Test schlägt weiterhin fehl

**Prüfe:**

1. **Credentials korrekt eingegeben?**
   - Device ID ist UUID-Format
   - API Credentials enthält beide Teile (clientId:deviceId)
   - Keine Leerzeichen am Anfang/Ende

2. **Node aktuell?**
   ```bash
   # Prüfe ob User-Agent im Build ist
   grep "User-Agent" dist/nodes/EasyShopper/GenericFunctions.js
   ```

3. **n8n neu gestartet?**
   - Nach Code-Änderungen immer n8n neu starten

### Test erfolgreich, aber Operations schlagen fehl

**Prüfe die Node-Operation:**
- Shopping List Operations benötigen gültige Store GUID
- Token wird automatisch bei jedem Request erneuert

## 📊 Was wurde geändert?

### Credentials Test (EasyShopperApi.credentials.ts)
```typescript
// Vorher: Fehlendes User-Agent
headers: {
  'Content-Type': 'application/json',
}

// Nachher: Alle erforderlichen Header
headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'x-subscription-key': '4a8bbd6458444086b7f51ca8b5a89ca9',
  'User-Agent': 'Whiz-Cart/4.143.0-144352; (ios 15.8.5)',
  'Accept-Language': 'de-DE,de;q=0.9',
}
```

### Generic Functions (GenericFunctions.ts)
```typescript
// Login und alle API-Requests verwenden jetzt korrekte Header
const loginOptions: IRequestOptions = {
  headers: {
    'x-subscription-key': '4a8bbd6458444086b7f51ca8b5a89ca9',
    'User-Agent': 'Whiz-Cart/4.143.0-144352; (ios 15.8.5)',
    // ...
  }
}
```

## ✅ Verification Checklist

- [x] User-Agent Header hinzugefügt
- [x] x-subscription-key Header hinzugefügt
- [x] Credentials Test verwendet Basic Auth korrekt
- [x] curl Test erfolgreich
- [x] TypeScript kompiliert ohne Fehler
- [x] dist/ enthält aktualisierte Dateien

---

**Die Node sollte jetzt in n8n funktionieren!** 🎉
