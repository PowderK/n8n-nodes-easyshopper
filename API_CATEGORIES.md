# EasyShopper API Kategorien

Diese Datei dokumentiert alle verfügbaren Kategorien in der EasyShopper/Whiz-Cart API basierend auf der Analyse der API-Flows.

## cgLocalKey Kategorien (API-Parameter)

Diese Werte werden in der API als `cgLocalKey` verwendet und repräsentieren die Hauptkategorien:

1. **babykost** - Babynahrung und Babybedarf
2. **brot_kuchen** - Brot, Brötchen, Kuchen
3. **brotaufstrich** - Marmelade, Honig, Nutella
4. **diverse_nonfood** - Diverse Non-Food-Artikel
5. **feinkost** - Delikatessen, Oliven, Antipasti
6. **fette_eier** - Öle, Butter, Margarine, Eier
7. **fisch** - Fisch und Meeresfrüchte
8. **freizeit** - Spielwaren, Bücher, Hobbys
9. **garten** - Pflanzen, Blumen, Gartenbedarf
10. **gebaeck** - Kekse, Gebäck, Süßgebäck
11. **genussmittel** - Alkohol, Tabakwaren
12. **getraenke** - Wasser, Säfte, Softdrinks
13. **haushalt** - Papierprodukte, Haushaltswaren
14. **hygiene** - Shampoo, Seife, Körperpflege
15. **kaese** - Käsetheke und verpackter Käse
16. **kaffee_tee_kakao** - Kaffee, Tee, Kakao
17. **knabbereien** - Chips, Nüsse, Snacks
18. **konserven** - Konserven, Dosenwaren
19. **molkereiprodukte** - Milch, Joghurt, Quark
20. **nahrungsmittel** - Nudeln, Reis, Mehl, Grundnahrungsmittel
21. **obst_und_gemuese** - Obst und Gemüse
22. **reinigungsmittel** - Putzmittel, Spülmittel
23. **suesswaren** - Schokolade, Bonbons
24. **tiefkuehlkost** - Tiefkühlprodukte
25. **tierbedarf** - Tiernahrung und Tierzubehör
26. **wuerzmittel** - Gewürze, Soßen, Ketchup
27. **wurst_fleisch** - Wurst und Fleisch

## cgIcon Kategorien (UI-Icons)

Diese Werte werden für die Darstellung in der App verwendet (granularer als cgLocalKey):

- **alkoholfreie_getraenke** - Alkoholfreie Getränke
- **babykost** - Babynahrung
- **bier** - Bier
- **blumen_pflanzen** - Blumen und Pflanzen
- **bottle** - Flaschen/Leergut
- **brot_kuchen_sb** - Brot & Kuchen (Selbstbedienung)
- **brot_und_kuchen_in_bedienung** - Brot & Kuchen (Bedientheke)
- **camping_grillzubehoer** - Camping & Grillzubehör
- **crate** - Kisten/Leergut
- **diverse_nonfood** - Diverse Non-Food
- **elektro_gluehlampen** - Elektro & Glühlampen
- **feingebaeck** - Feingebäck
- **feinkost** - Feinkost
- **fertiggerichte** - Fertiggerichte
- **fette_eier** - Fette & Eier
- **fischkonserven** - Fischkonserven
- **foto** - Foto
- **frischepack_kaese** - Käse (Frischepack)
- **frischfleisch** - Frischfleisch
- **gefluegel_wild_frisch** - Geflügel & Wild (frisch)
- **geschenkartikel** - Geschenkartikel
- **hausbedarf_buersen_besen** - Hausbedarf (Bürsten, Besen)
- **heimwerkerbedarf** - Heimwerkerbedarf
- **hygiene** - Hygiene
- **kaeseshop** - Käse (Bedientheke)
- **kaffee_tee_kakao** - Kaffee, Tee, Kakao
- **konfituere_honig** - Konfitüre & Honig
- **kosmetik** - Kosmetik
- **leergut** - Leergut
- **margarine** - Margarine
- **mehl_salz_zucker** - Mehl, Salz, Zucker
- **milchkonserven** - Milchkonserven
- **molkereiprodukte** - Molkereiprodukte
- **naehrmittel** - Nährmittel
- **obst_und_gemuese** - Obst & Gemüse
- **obstkonserven** - Obstkonserven
- **papierwaren** - Papierwaren
- **reform_und_diaetkost** - Reform & Diätkost
- **reinigungsmittel** - Reinigungsmittel
- **rundfunk_fernsehen** - Rundfunk & Fernsehen
- **salate_fisch_fk** - Salate & Fisch (Frischetheke)
- **sb_fleisch** - Fleisch (Selbstbedienung)
- **schokolade** - Schokolade
- **seife** - Seife
- **speiseeis** - Speiseeis
- **spielwaren** - Spielwaren
- **spirituosen** - Spirituosen
- **spuelmittel** - Spülmittel
- **suesswaren** - Süßwaren
- **tabakwaren** - Tabakwaren
- **teigwaren** - Teigwaren
- **tiefkuehlkost** - Tiefkühlkost
- **tierbedarf** - Tierbedarf
- **tiernahrung** - Tiernahrung
- **wein_sekt** - Wein & Sekt
- **wuerzmittel** - Würzmittel
- **wurst_in_selbstbedienung** - Wurst (Selbstbedienung)
- **wurstwaren_in_bedienung** - Wurstwaren (Bedientheke)

## Verwendung in der API

### Artikel hinzufügen

```json
{
  "amount": 1,
  "cgIcon": "kaeseshop",
  "cgLocalKey": "kaese",
  "product": {
    "cgIcon": "kaeseshop",
    "cgLocalKey": "kaese",
    "name": "Käse"
  },
  "tag": "Käse",
  "groupName": "kaese"
}
```

**Wichtig:** 
- Der `cgLocalKey`-Wert wird für die Gruppierung verwendet (27 Hauptkategorien)
- Der `cgIcon`-Wert steuert das Icon in der App (detaillierter, ~60 Icons)
- In unserem n8n-Node verwenden wir die gleichen Werte für beide Felder der Einfachheit halber

## Auto-Detection

Die Auto-Detection-Funktion im n8n-Node verwendet Regex-Pattern-Matching um Produktnamen automatisch den richtigen `cgLocalKey`-Kategorien zuzuordnen. Dies funktioniert am besten für deutsche Produktnamen.

Beispiele:
- "Käse" → `kaese`
- "Brot" → `brot_kuchen`
- "Milch" → `molkereiprodukte`
- "Wurst" → `wurst_fleisch`
- "Apfel" → `obst_und_gemuese`

## Quelle

Diese Kategorien wurden durch Analyse der mitmproxy-Flows der EasyShopper/Whiz-Cart App (Version 4.143.0-144352) ermittelt.
