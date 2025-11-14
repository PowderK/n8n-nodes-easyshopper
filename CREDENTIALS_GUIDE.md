# 🔐 EasyShopper Credentials Anleitung

## Wichtiger Hinweis

⚠️ **Die Credentials sind persönlich und dürfen NICHT geteilt werden!**

Dieser Guide zeigt, wie du deine eigenen EasyShopper API-Credentials erhältst.

## Methode 1: Mit mitmproxy (Empfohlen)

### 1. mitmproxy installieren
```bash
# macOS
brew install mitmproxy

# Oder via pip
pip install mitmproxy
```

### 2. Proxy auf deinem Smartphone einrichten

**iOS:**
1. Einstellungen → WLAN → Dein Netzwerk → (i) Symbol
2. Scrolle zu "HTTP-Proxy" → Manuell
3. Server: IP deines Computers (z.B. `192.168.1.100`)
4. Port: `8080`

**Android:**
1. Einstellungen → Netzwerk & Internet → WLAN
2. Lange auf dein Netzwerk drücken → Netzwerk ändern
3. Erweiterte Optionen → Proxy → Manuell
4. Hostname: IP deines Computers
5. Port: `8080`

### 3. HTTPS Zertifikat installieren

```bash
# mitmproxy starten
mitmproxy

# Auf dem Smartphone Browser öffnen und navigieren zu:
# http://mitm.it
# Zertifikat für dein OS herunterladen und installieren
```

### 4. EasyShopper Login überwachen

```bash
# mitmproxy mit Filter starten
mitmproxy --set flow_detail=2
```

1. Öffne EasyShopper App auf deinem Smartphone
2. App neu starten (Force Close)
3. In mitmproxy nach `login` Request suchen
4. Notiere:
   - **Authorization Header** (enthält Basic Auth)
   - **uniqueDeviceId** aus Request Body

### 5. Credentials extrahieren

Im mitmproxy:
- Finde den `POST /mobile-backend/api/v4/login` Request
- Header: `Authorization: Basic [BASE64_STRING]`
- Body: `{"uniqueDeviceId": "[DEVICE_ID]"}`

Dekodiere Base64:
```bash
echo "BASE64_STRING" | base64 -d
# Ausgabe: clientId:deviceId
```

## Methode 2: Mit Charles Proxy

### 1. Charles Proxy installieren
- Download: https://www.charlesproxy.com/
- 30 Tage Trial verfügbar

### 2. SSL Proxying einrichten
1. Proxy → SSL Proxying Settings → Enable SSL Proxying
2. Add: `api.es-prod.whiz-cart.com`
3. Help → SSL Proxying → Install Charles Root Certificate on Mobile Device

### 3. Smartphone konfigurieren
- Proxy auf Computer IP und Port `8888` setzen
- Zertifikat installieren (siehe Charles Anleitung)

### 4. EasyShopper Traffic aufzeichnen
1. EasyShopper App öffnen/neu starten
2. In Charles nach `login` Request filtern
3. Authorization Header und Device ID extrahieren

## Methode 3: Aus bestehendem Python Script

Falls du bereits das Python-Script verwendest:

```bash
cd /path/to/EasyShopper
cat easy_shopper_script.py | grep -E "device_id|api_credentials"
```

## Credentials in n8n konfigurieren

Nachdem du deine Credentials extrahiert hast:

1. **Device ID**: Die UUID aus dem Request Body
   - Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

2. **API Credentials**: Dekodierte Base64 aus Authorization Header
   - Format: `clientId:deviceId`

3. **Base URL**: (Standard)
   - `https://api.es-prod.whiz-cart.com`

## Sicherheitshinweise

🔒 **Wichtig:**
- Teile deine Credentials NIEMALS öffentlich
- Committe sie NICHT in Git Repositories
- Speichere sie sicher (z.B. in einem Passwort-Manager)
- Jede App-Installation hat eigene Credentials

## Troubleshooting

### "SSL Certificate Error"
- Stelle sicher, dass das Proxy-Zertifikat korrekt installiert ist
- iOS: Einstellungen → Allgemein → Info → Zertifikat-Vertrauen
- Android: Vertrauenswürdige Zertifikate überprüfen

### "Keine Login-Requests sichtbar"
- App komplett schließen (Force Close)
- Proxy-Einstellungen überprüfen
- Firewall könnte Traffic blockieren

### "Base64 Decoding fehlgeschlagen"
- Kopiere nur den String nach "Basic "
- Entferne Leerzeichen am Anfang/Ende
- Verwende: `echo "STRING" | base64 -d`

## Support

Bei Problemen:
1. Überprüfe Proxy-Konfiguration
2. Stelle sicher, dass HTTPS Interception funktioniert
3. App-Cache leeren und neu starten
4. Prüfe ob Traffic überhaupt durch Proxy läuft

---

**Datenschutz:** Diese Anleitung dient nur zur Konfiguration deiner eigenen App-Instanz. Respektiere die Nutzungsbedingungen von EasyShopper.
