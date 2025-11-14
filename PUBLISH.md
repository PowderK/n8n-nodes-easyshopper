# 🎯 Veröffentlichungs-Anleitung

## ✅ Sicherheitsprüfung abgeschlossen

**Alle sensiblen Daten wurden entfernt:**
- ✅ Keine Device IDs im Code
- ✅ Keine API Credentials
- ✅ Keine Tokens oder Bearer-Authentifizierung
- ✅ Nur Platzhalter und Beispiele in der Dokumentation

## 📦 Package ist bereit zur Veröffentlichung

**Package Details:**
- Name: `n8n-nodes-easyshopper`
- Version: `0.1.0`
- Größe: ~13 KB (gepackt)
- Dateien: 21 Dateien inkl. TypeScript Definitionen

## 🚀 Veröffentlichungs-Schritte

### 1. npm Account einrichten (einmalig)

Falls du noch keinen npm Account hast:

```bash
# Registriere dich auf https://www.npmjs.com/signup
# Oder direkt in der CLI:
npm adduser
```

Eingaben:
- **Username**: Dein npm Username
- **Password**: Dein Passwort
- **Email**: Deine E-Mail (wird öffentlich sichtbar)
- **2FA Code**: Falls aktiviert (empfohlen!)

### 2. npm Login

```bash
npm login
```

Verifiziere Login:
```bash
npm whoami
# Sollte deinen Username ausgeben
```

### 3. Package-Name prüfen

```bash
# Prüfe ob Name verfügbar ist
npm view n8n-nodes-easyshopper
# 404 = verfügbar ✅
# Andere Response = bereits vergeben ❌
```

**Falls Name bereits vergeben:**
- Option A: Scoped Package verwenden: `@dein-username/n8n-nodes-easyshopper`
- Option B: Anderen Namen wählen: `n8n-nodes-easyshopper-de`

### 4. Veröffentlichen

**Automatisch (empfohlen):**
```bash
./publish.sh
```

Das Script führt aus:
1. ✅ Sicherheitsprüfung
2. ✅ Login-Verifizierung
3. ✅ Package-Name Check
4. ✅ Dry-Run Test
5. ✅ Interaktive Bestätigung
6. 🚀 Publish

**Manuell:**
```bash
# 1. Sicherheitsprüfung
./pre-publish-check.sh

# 2. Build
npm run build

# 3. Dry-Run
npm publish --dry-run --access public

# 4. Echtes Publish
npm publish --access public
```

## 📋 Nach dem Publish

### 1. Verifizierung

```bash
# Prüfe ob Package live ist
npm view n8n-nodes-easyshopper

# Öffne npm-Seite
open https://www.npmjs.com/package/n8n-nodes-easyshopper
```

### 2. Installation testen

```bash
# Teste Installation
npm install -g n8n
n8n start

# In n8n UI:
# Settings → Community Nodes → Install
# Package: n8n-nodes-easyshopper
```

### 3. GitHub Repository (optional aber empfohlen)

```bash
# Erstelle Repository auf github.com
# Dann:
git remote add origin https://github.com/DEIN-USERNAME/n8n-nodes-easyshopper.git
git push -u origin main

# Aktualisiere package.json mit korrekter URL
# Dann neue Version publishen
```

### 4. README Badge hinzufügen

Füge zu README.md hinzu:
```markdown
[![npm version](https://img.shields.io/npm/v/n8n-nodes-easyshopper.svg)](https://www.npmjs.com/package/n8n-nodes-easyshopper)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-easyshopper.svg)](https://www.npmjs.com/package/n8n-nodes-easyshopper)
```

## 🔄 Updates veröffentlichen

### Neue Version vorbereiten

```bash
# Patch (0.1.0 → 0.1.1) - Bugfixes
npm version patch

# Minor (0.1.1 → 0.2.0) - Neue Features
npm version minor

# Major (0.2.0 → 1.0.0) - Breaking Changes
npm version major
```

### Veröffentlichen

```bash
npm publish --access public
```

## ❌ Package zurückziehen (Notfall)

**Innerhalb 72 Stunden:**
```bash
npm unpublish n8n-nodes-easyshopper@0.1.0
```

**Nach 72 Stunden:**
```bash
# Nur deprecaten möglich
npm deprecate n8n-nodes-easyshopper@0.1.0 "Deprecated, use version X.X.X"
```

## 🆘 Troubleshooting

### "ENEEDAUTH"
```bash
npm login
```

### "Package name already exists"
```bash
# Verwende Scoped Package
# Ändere in package.json:
"name": "@dein-username/n8n-nodes-easyshopper"

# Publish mit:
npm publish --access public
```

### "403 Forbidden"
```bash
# Stelle sicher dass du Besitzer/Maintainer bist
npm owner ls n8n-nodes-easyshopper
```

### "Validation failed"
```bash
# Prüfe package.json
npm run lint
npm run build
```

## 📊 Monitoring

### Package-Statistiken
- **Downloads**: https://npm-stat.com/charts.html?package=n8n-nodes-easyshopper
- **Dependents**: https://www.npmjs.com/package/n8n-nodes-easyshopper?activeTab=dependents

### n8n Community
- Teile auf n8n Forum: https://community.n8n.io/
- n8n Discord: https://discord.gg/n8n

## ✅ Checkliste vor Publish

- [ ] Alle sensiblen Daten entfernt
- [ ] Build erfolgreich (`npm run build`)
- [ ] Tests bestanden (`npm run lint`)
- [ ] README.md vollständig
- [ ] LICENSE vorhanden
- [ ] CREDENTIALS_GUIDE.md erstellt
- [ ] package.json korrekt konfiguriert
- [ ] npm login erfolgreich
- [ ] Dry-Run erfolgreich
- [ ] Git committed

## 🎉 Fertig!

Nach erfolgreichem Publish ist dein Community Node:
- ✅ Auf npmjs.org verfügbar
- ✅ In n8n installierbar
- ✅ Von der Community nutzbar

---

**Viel Erfolg! 🚀**
