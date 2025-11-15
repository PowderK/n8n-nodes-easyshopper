# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.1.9] - 2025-11-15

### Added
- **Barcode-Scan Funktionalität**: Neue Operation "Scan Barcode" zum Hinzufügen von Produkten via GTIN/EAN Barcode
  - Automatische Produkterkennung über Barcode-Scan
  - Vollständige Produktinformationen (Name, Marke, Preis, Regalposition)
  - Support für EAN-8, EAN-13, UPC-A und GTIN-14 Barcodes
  - Automatisches Abrufen des storeGuid beim Scannen
- **Notizen-Funktionalität**: Optionale Notizen/Beschreibungen zu Produkten hinzufügen
  - Notizen werden als Array von Objekten gespeichert
  - Format: `[{"type": "text", "text": "..."}]`
- BARCODE_SCAN.md: Umfassende Dokumentation der Barcode-Funktionalität
  - Anwendungsbeispiele und Workflow-Integrationen
  - Real-world Barcode-Beispiele (Langnese Honig, Coca-Cola, Nutella, Milka)
  - Advanced Use Cases (Inventory Management, Price Tracking)

### Changed
- README.md erweitert mit Barcode-Scan Beispielen und Workflows
- Output-Format Dokumentation um Barcode-Response und Notizen-Feld erweitert
- Add Item Operation um optionales Notizen-Feld ergänzt

## [0.1.8] - 2025-11-15

### Added
- API_CATEGORIES.md: Vollständige Dokumentation aller API-Kategorien
  - 27 cgLocalKey Kategorien (API-Kategorien)
  - ~60 cgIcon Kategorien (UI-Icons)
  - Verwendungsbeispiele und Quellangaben

### Changed
- Kategorie-Dropdown von 12 auf 27 echte API-Kategorien erweitert
- detectCategory() Funktion komplett überarbeitet mit 28 Kategoriemustern
- Alle Kategorien basieren jetzt auf tatsächlichen API-Werten aus flow.txt Analyse
- README.md "Verfügbare Kategorien" Sektion aktualisiert

### Fixed
- Kategorienamen korrigiert (obst_und_gemuese statt obst_gemuese, wurst_fleisch statt fleisch_wurst)
- Käse als eigene Kategorie (getrennt von molkereiprodukte)

## [0.1.7] - 2025-11-15

### Changed
- Vereinfachte Credential-Konfiguration (nur Device ID erforderlich)
- Store GUID wird automatisch beim Login abgerufen
- Verbesserte Dokumentation für Device ID Auslesen aus QR-Code

## [0.1.6] - 2025-11-15

### Added
- Auto-Kategorisierung: KI-basierte Produktkategorien-Erkennung
- Kategorie "Auto" Option im Dropdown

## [0.1.5] - 2025-11-15

### Fixed
- API-Endpunkte von v4 auf v5 aktualisiert
- Verbesserte Fehlerbehandlung

## [0.1.4] - 2025-11-15

### Changed
- Verbesserte README.md mit Workflow-Beispielen
- Fehlerbehebung Sektion hinzugefügt

## [0.1.3] - 2025-11-15

### Added
- Clear List Operation
- Kategorie-Unterstützung für Produkte

## [0.1.2] - 2025-11-15

### Fixed
- TypeScript Compilation Errors
- GenericFunctions Import

## [0.1.1] - 2025-11-15

### Added
- Initial Release
- Add Item Operation
- Get Items Operation
- Remove Item Operation
- Basic Authentication

## API Version History

- **v5**: Aktuelle Version (Shopping List Operations, Barcode Scan)
- **v4**: Login/Authentication

## Datenquellen

Die API-Analyse basiert auf mitmproxy Flow-Captures der EasyShopper App:
- Whiz-Cart v4.143.0-144352 (iOS 15.8.5)
- Capture-Datum: 15.11.2025
- Flows: flow.txt, flow2.txt
