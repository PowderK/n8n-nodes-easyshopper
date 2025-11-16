# n8n Workflow-Beispiele für EasyShopper

Fertige n8n Workflows zum Kopieren und Einfügen.

## 1. Barcode-Scanner Workflow (mit Duplikaterkennung)

Scannt Barcodes und erhöht automatisch die Anzahl, wenn das Produkt bereits auf der Liste steht.

### Workflow JSON

```json
{
  "name": "EasyShopper - Barcode Scanner",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "barcode-scan",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-1",
      "name": "Webhook: Barcode empfangen",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "getItems"
      },
      "id": "easyshopper-1",
      "name": "Aktuelle Liste abrufen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [460, 300],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "scanBarcode",
        "barcode": "={{ $('Webhook: Barcode empfangen').item.json.body.barcode || $('Webhook: Barcode empfangen').item.json.body.code }}"
      },
      "id": "easyshopper-2",
      "name": "Barcode scannen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [680, 300],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.success }}",
              "value2": "true"
            }
          ]
        }
      },
      "id": "if-1",
      "name": "Produkt gefunden?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"success\": true,\n  \"message\": \"{{ $('Barcode scannen').item.json.product.brand }} {{ $('Barcode scannen').item.json.product.name }} zur Liste hinzugefügt\",\n  \"product\": \"{{ $('Barcode scannen').item.json.product.name }}\",\n  \"price\": \"{{ ($('Barcode scannen').item.json.product.priceDetails.price / 100).toFixed(2) }}€\"\n}"
      },
      "id": "respond-1",
      "name": "Erfolg zurückmelden",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1120, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"success\": false,\n  \"message\": \"Barcode {{ $('Webhook: Barcode empfangen').item.json.body.barcode }} nicht gefunden\"\n}"
      },
      "id": "respond-2",
      "name": "Fehler zurückmelden",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1120, 400]
    }
  ],
  "connections": {
    "Webhook: Barcode empfangen": {
      "main": [
        [
          {
            "node": "Aktuelle Liste abrufen",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Aktuelle Liste abrufen": {
      "main": [
        [
          {
            "node": "Barcode scannen",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Barcode scannen": {
      "main": [
        [
          {
            "node": "Produkt gefunden?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Produkt gefunden?": {
      "main": [
        [
          {
            "node": "Erfolg zurückmelden",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Fehler zurückmelden",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Verwendung

1. In n8n: **Workflows** → **Import from URL/File** → JSON einfügen
2. Credentials konfigurieren
3. Webhook aktivieren
4. Webhook-URL notieren (z.B. `https://dein-n8n.com/webhook/barcode-scan`)

### Scanner-App konfigurieren

**cURL Test:**
```bash
curl -X POST https://dein-n8n.com/webhook/barcode-scan \
  -H "Content-Type: application/json" \
  -d '{"barcode": "4023300901002"}'
```

**iOS Shortcut:**
```
1. Scan QR/Barcode
2. Get Contents of URL
   URL: https://dein-n8n.com/webhook/barcode-scan
   Method: POST
   JSON: {"barcode": "[Barcode Result]"}
3. Show Notification: [Response]
```

---

## 2. Manuelles Einfügen mit Duplikaterkennung

Fügt Produkte manuell hinzu und erhöht die Anzahl bei Duplikaten um 1.

### Workflow JSON

```json
{
  "name": "EasyShopper - Manuell mit Duplikaterkennung",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "add-item",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-1",
      "name": "Webhook: Produkt empfangen",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "getItems"
      },
      "id": "easyshopper-1",
      "name": "Aktuelle Liste abrufen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [460, 300],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "const productName = $('Webhook: Produkt empfangen').item.json.body.productName;\nconst currentList = $('Aktuelle Liste abrufen').item.json.items || [];\n\n// Suche nach existierendem Produkt (case-insensitive)\nconst existingItem = currentList.find(item => \n  item.product?.name?.toLowerCase() === productName.toLowerCase() ||\n  item.tag?.toLowerCase() === productName.toLowerCase()\n);\n\nreturn {\n  json: {\n    productName: productName,\n    quantity: $('Webhook: Produkt empfangen').item.json.body.quantity || 1,\n    note: $('Webhook: Produkt empfangen').item.json.body.note || '',\n    category: $('Webhook: Produkt empfangen').item.json.body.category || 'auto',\n    exists: !!existingItem,\n    existingGuid: existingItem?.shoppingListItemGuid || null,\n    existingQuantity: existingItem?.amount || 0\n  }\n};"
      },
      "id": "code-1",
      "name": "Duplikat prüfen",
      "type": "n8n-nodes-base.code",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.exists }}",
              "value2": true
            }
          ]
        }
      },
      "id": "if-1",
      "name": "Existiert bereits?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "removeItem",
        "itemGuid": "={{ $json.existingGuid }}"
      },
      "id": "easyshopper-2",
      "name": "Altes Item entfernen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [1120, 200],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "addItem",
        "productName": "={{ $('Duplikat prüfen').item.json.productName }}",
        "quantity": "={{ $('Duplikat prüfen').item.json.existingQuantity + $('Duplikat prüfen').item.json.quantity }}",
        "note": "={{ $('Duplikat prüfen').item.json.note }}",
        "category": "={{ $('Duplikat prüfen').item.json.category }}"
      },
      "id": "easyshopper-3",
      "name": "Mit erhöhter Anzahl hinzufügen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [1340, 200],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "addItem",
        "productName": "={{ $json.productName }}",
        "quantity": "={{ $json.quantity }}",
        "note": "={{ $json.note }}",
        "category": "={{ $json.category }}"
      },
      "id": "easyshopper-4",
      "name": "Neues Item hinzufügen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [1120, 400],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"success\": true,\n  \"message\": \"{{ $('Duplikat prüfen').item.json.productName }} hinzugefügt (Anzahl erhöht)\",\n  \"productName\": \"{{ $('Duplikat prüfen').item.json.productName }}\",\n  \"quantity\": {{ $json.quantity }},\n  \"action\": \"updated\"\n}"
      },
      "id": "respond-1",
      "name": "Erfolg (erhöht)",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1560, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"success\": true,\n  \"message\": \"{{ $json.productName }} zur Liste hinzugefügt\",\n  \"productName\": \"{{ $json.productName }}\",\n  \"quantity\": {{ $json.quantity }},\n  \"action\": \"created\"\n}"
      },
      "id": "respond-2",
      "name": "Erfolg (neu)",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1340, 400]
    }
  ],
  "connections": {
    "Webhook: Produkt empfangen": {
      "main": [
        [
          {
            "node": "Aktuelle Liste abrufen",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Aktuelle Liste abrufen": {
      "main": [
        [
          {
            "node": "Duplikat prüfen",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Duplikat prüfen": {
      "main": [
        [
          {
            "node": "Existiert bereits?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Existiert bereits?": {
      "main": [
        [
          {
            "node": "Altes Item entfernen",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Neues Item hinzufügen",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Altes Item entfernen": {
      "main": [
        [
          {
            "node": "Mit erhöhter Anzahl hinzufügen",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Mit erhöhter Anzahl hinzufügen": {
      "main": [
        [
          {
            "node": "Erfolg (erhöht)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Neues Item hinzufügen": {
      "main": [
        [
          {
            "node": "Erfolg (neu)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Verwendung

**cURL Test:**
```bash
# Neues Produkt hinzufügen
curl -X POST https://dein-n8n.com/webhook/add-item \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Milch",
    "quantity": 2,
    "note": "Fettarm",
    "category": "auto"
  }'

# Nochmal das gleiche Produkt (Anzahl wird um 1 erhöht)
curl -X POST https://dein-n8n.com/webhook/add-item \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Milch",
    "quantity": 1
  }'
```

**Request Format:**
```json
{
  "productName": "Milch",           // Pflichtfeld
  "quantity": 2,                    // Optional, Standard: 1
  "note": "Fettarm",                // Optional
  "category": "molkereiprodukte"    // Optional, Standard: "auto"
}
```

---

## 3. Kombinierter Workflow (Barcode + Manuell)

Unterstützt beide Eingabemethoden mit automatischer Duplikaterkennung.

### Workflow JSON

```json
{
  "name": "EasyShopper - Universal (Barcode & Manuell)",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "add-to-list",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "functionCode": "const body = $input.item.json.body;\nconst hasBarcode = !!(body.barcode || body.code);\n\nreturn {\n  json: {\n    mode: hasBarcode ? 'barcode' : 'manual',\n    barcode: body.barcode || body.code || null,\n    productName: body.productName || null,\n    quantity: body.quantity || 1,\n    note: body.note || '',\n    category: body.category || 'auto'\n  }\n};"
      },
      "id": "code-1",
      "name": "Input analysieren",
      "type": "n8n-nodes-base.code",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.mode }}",
              "value2": "barcode"
            }
          ]
        }
      },
      "id": "switch-1",
      "name": "Barcode oder Manuell?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "scanBarcode",
        "barcode": "={{ $('Input analysieren').item.json.barcode }}"
      },
      "id": "easyshopper-1",
      "name": "Barcode scannen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [900, 200],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "getItems"
      },
      "id": "easyshopper-2",
      "name": "Liste für Duplikatcheck",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [900, 400],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "functionCode": "const input = $('Input analysieren').item.json;\nconst currentList = $input.item.json.items || [];\n\nconst existingItem = currentList.find(item => \n  item.product?.name?.toLowerCase() === input.productName.toLowerCase() ||\n  item.tag?.toLowerCase() === input.productName.toLowerCase()\n);\n\nif (existingItem) {\n  return {\n    json: {\n      exists: true,\n      existingGuid: existingItem.shoppingListItemGuid,\n      newQuantity: existingItem.amount + input.quantity,\n      productName: input.productName,\n      note: input.note,\n      category: input.category\n    }\n  };\n}\n\nreturn {\n  json: {\n    exists: false,\n    productName: input.productName,\n    quantity: input.quantity,\n    note: input.note,\n    category: input.category\n  }\n};"
      },
      "id": "code-2",
      "name": "Duplikat prüfen",
      "type": "n8n-nodes-base.code",
      "typeVersion": 1,
      "position": [1120, 400]
    },
    {
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.exists }}",
              "value2": true
            }
          ]
        }
      },
      "id": "if-2",
      "name": "Duplikat?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 1,
      "position": [1340, 400]
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "removeItem",
        "itemGuid": "={{ $json.existingGuid }}"
      },
      "id": "easyshopper-3",
      "name": "Alt entfernen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [1560, 300],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "addItem",
        "productName": "={{ $json.productName }}",
        "quantity": "={{ $json.newQuantity }}",
        "note": "={{ $json.note }}",
        "category": "={{ $json.category }}"
      },
      "id": "easyshopper-4",
      "name": "Mit +1 hinzufügen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [1780, 300],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "resource": "shoppingList",
        "operation": "addItem",
        "productName": "={{ $json.productName }}",
        "quantity": "={{ $json.quantity }}",
        "note": "={{ $json.note }}",
        "category": "={{ $json.category }}"
      },
      "id": "easyshopper-5",
      "name": "Neu hinzufügen",
      "type": "n8n-nodes-easyshopper.easyShopper",
      "typeVersion": 1,
      "position": [1560, 500],
      "credentials": {
        "easyShopperApi": {
          "id": "1",
          "name": "EasyShopper API"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"success\": true,\n  \"message\": \"Produkt via Barcode hinzugefügt\",\n  \"product\": \"{{ $json.product.brand }} {{ $json.product.name }}\",\n  \"price\": \"{{ ($json.product.priceDetails.price / 100).toFixed(2) }}€\"\n}"
      },
      "id": "respond-1",
      "name": "Response Barcode",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1120, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"success\": true,\n  \"message\": \"{{ $json.productName }} (Anzahl erhöht)\",\n  \"quantity\": {{ $json.quantity }}\n}"
      },
      "id": "respond-2",
      "name": "Response Update",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [2000, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={\n  \"success\": true,\n  \"message\": \"{{ $json.productName }} hinzugefügt\",\n  \"quantity\": {{ $json.quantity }}\n}"
      },
      "id": "respond-3",
      "name": "Response Neu",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1780, 500]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Input analysieren"}]]
    },
    "Input analysieren": {
      "main": [[{"node": "Barcode oder Manuell?"}]]
    },
    "Barcode oder Manuell?": {
      "main": [
        [{"node": "Barcode scannen"}],
        [{"node": "Liste für Duplikatcheck"}]
      ]
    },
    "Barcode scannen": {
      "main": [[{"node": "Response Barcode"}]]
    },
    "Liste für Duplikatcheck": {
      "main": [[{"node": "Duplikat prüfen"}]]
    },
    "Duplikat prüfen": {
      "main": [[{"node": "Duplikat?"}]]
    },
    "Duplikat?": {
      "main": [
        [{"node": "Alt entfernen"}],
        [{"node": "Neu hinzufügen"}]
      ]
    },
    "Alt entfernen": {
      "main": [[{"node": "Mit +1 hinzufügen"}]]
    },
    "Mit +1 hinzufügen": {
      "main": [[{"node": "Response Update"}]]
    },
    "Neu hinzufügen": {
      "main": [[{"node": "Response Neu"}]]
    }
  }
}
```

### Verwendung

**Barcode-Scan:**
```bash
curl -X POST https://dein-n8n.com/webhook/add-to-list \
  -H "Content-Type: application/json" \
  -d '{"barcode": "4023300901002"}'
```

**Manuell:**
```bash
curl -X POST https://dein-n8n.com/webhook/add-to-list \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Brot",
    "quantity": 2,
    "note": "Vollkorn"
  }'
```

---

## Tipps

### Duplikaterkennung verbessern

Die Code-Node kann erweitert werden für bessere Duplikaterkennung:

```javascript
// Fuzzy Matching
const similarity = (a, b) => {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1.0;
  return (longer.length - editDistance(longer, shorter)) / longer.length;
};

// Prüfe auf ähnliche Produkte (>80% Übereinstimmung)
const existingItem = currentList.find(item => {
  const itemName = item.product?.name || item.tag || '';
  return similarity(
    itemName.toLowerCase(), 
    productName.toLowerCase()
  ) > 0.8;
});
```

### Notifications hinzufügen

Ergänze eine **Telegram** oder **Pushover** Node nach dem Response:

```
Response Node
↓
Telegram/Pushover Node
Message: "✅ {{ $json.productName }} zur Liste hinzugefügt ({{ $json.quantity }}x)"
```

### Error Handling

Füge **Error Trigger** Nodes hinzu um Fehler zu loggen:

```javascript
// In Code Node
try {
  // Deine Logik
} catch (error) {
  return {
    json: {
      error: true,
      message: error.message,
      timestamp: new Date().toISOString()
    }
  };
}
```
