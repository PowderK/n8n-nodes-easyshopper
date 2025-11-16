import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { easyShopperApiRequest, easyShopperApiRequestAllItems, getStoreGuid } from './GenericFunctions';

export class EasyShopper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EasyShopper',
		name: 'easyShopper',
		icon: 'file:easyshopper.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with EasyShopper API for shopping list management',
		defaults: {
			name: 'EasyShopper',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'easyShopperApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Shopping List',
						value: 'shoppingList',
					},
					{
						name: 'Authentication',
						value: 'auth',
					},
				],
				default: 'shoppingList',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['shoppingList'],
					},
				},
				options: [
					{
						name: 'Add Item',
						value: 'addItem',
						description: 'Add an item to the shopping list',
						action: 'Add an item to shopping list',
					},
					{
						name: 'Scan Barcode',
						value: 'scanBarcode',
						description: 'Add product by scanning barcode (GTIN/EAN)',
						action: 'Scan barcode and add to shopping list',
					},
					{
						name: 'Get Items',
						value: 'getItems',
						description: 'Get all items from the shopping list',
						action: 'Get shopping list items',
					},
					{
						name: 'Remove Item',
						value: 'removeItem',
						description: 'Remove an item from the shopping list',
						action: 'Remove item from shopping list',
					},
					{
						name: 'Clear List',
						value: 'clearList',
						description: 'Clear all items from the shopping list',
						action: 'Clear shopping list',
					},
				],
				default: 'addItem',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['auth'],
					},
				},
				options: [
					{
						name: 'Login',
						value: 'login',
						description: 'Authenticate with EasyShopper API',
						action: 'Login to EasyShopper',
					},
				],
				default: 'login',
			},
			// Shopping List Parameters
			{
				displayName: 'Barcode (GTIN/EAN)',
				name: 'barcode',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['shoppingList'],
						operation: ['scanBarcode'],
					},
				},
				default: '',
				placeholder: '4023300901002',
				description: 'GTIN/EAN barcode number of the product',
				required: true,
			},
			{
				displayName: 'Product Name',
				name: 'productName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['shoppingList'],
						operation: ['addItem'],
					},
				},
				default: '',
				placeholder: 'Brot, Milch, Käse...',
				description: 'Name of the product to add to shopping list',
				required: true,
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['shoppingList'],
						operation: ['addItem'],
					},
				},
				default: 1,
				description: 'Quantity of the product',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['shoppingList'],
						operation: ['addItem'],
					},
				},
				default: '',
				placeholder: 'Optional note/description',
				description: 'Optional note or description for the product',
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['shoppingList'],
						operation: ['addItem'],
					},
				},
				options: [
					{ name: 'Auto (AI Detection)', value: 'auto' },
					{ name: 'Babykost', value: 'babykost' },
					{ name: 'Brot & Kuchen', value: 'brot_kuchen' },
					{ name: 'Brotaufstrich', value: 'brotaufstrich' },
					{ name: 'Diverse Non-Food', value: 'diverse_nonfood' },
					{ name: 'Feinkost', value: 'feinkost' },
					{ name: 'Fette & Eier', value: 'fette_eier' },
					{ name: 'Fisch', value: 'fisch' },
					{ name: 'Freizeit', value: 'freizeit' },
					{ name: 'Garten', value: 'garten' },
					{ name: 'Gebäck', value: 'gebaeck' },
					{ name: 'Genussmittel', value: 'genussmittel' },
					{ name: 'Getränke', value: 'getraenke' },
					{ name: 'Haushalt', value: 'haushalt' },
					{ name: 'Hygiene', value: 'hygiene' },
					{ name: 'Käse', value: 'kaese' },
					{ name: 'Kaffee, Tee & Kakao', value: 'kaffee_tee_kakao' },
					{ name: 'Knabbereien', value: 'knabbereien' },
					{ name: 'Konserven', value: 'konserven' },
					{ name: 'Molkereiprodukte', value: 'molkereiprodukte' },
					{ name: 'Nahrungsmittel', value: 'nahrungsmittel' },
					{ name: 'Obst & Gemüse', value: 'obst_und_gemuese' },
					{ name: 'Reinigungsmittel', value: 'reinigungsmittel' },
					{ name: 'Süßwaren', value: 'suesswaren' },
					{ name: 'Tiefkühlkost', value: 'tiefkuehlkost' },
					{ name: 'Tierbedarf', value: 'tierbedarf' },
					{ name: 'Würzmittel', value: 'wuerzmittel' },
					{ name: 'Wurst & Fleisch', value: 'wurst_fleisch' },
				],
				default: 'auto',
				description: 'Product category (auto-detection uses AI)',
			},
			{
				displayName: 'Item GUID',
				name: 'itemGuid',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['shoppingList'],
						operation: ['removeItem'],
					},
				},
				default: '',
				description: 'GUID of the item to remove',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'shoppingList') {
			if (operation === 'addItem') {
				const productName = this.getNodeParameter('productName', i) as string;
				const quantity = this.getNodeParameter('quantity', i) as number;
				const category = this.getNodeParameter('category', i) as string;
				const noteRaw = this.getNodeParameter('note', i, '') as string;
				
				const note = noteRaw ? noteRaw.trim() : '';
					let finalCategory = category;
					if (category === 'auto') {
						finalCategory = EasyShopper.detectCategory(productName);
					}

					// Get Store GUID from login
					const storeGuid = await getStoreGuid.call(this);

					const body: any = {
						amount: quantity,
						cgIcon: finalCategory,
						cgLocalKey: finalCategory,
						product: {
							cgIcon: finalCategory,
							cgLocalKey: finalCategory,
							name: productName,
						},
						tag: productName,
						groupName: finalCategory,
					};

					// Add note if provided (and not empty)
					if (note.length > 0) {
						body.notes = [{
							type: 'text',
							text: note,
						}];
					}					const responseData = await easyShopperApiRequest.call(this, 'POST', `/mobile-backend/api/v5/shoppingList/addOrUpdate/${storeGuid}`, body);
					returnData.push({
						json: {
							success: true,
							productName,
							quantity,
							category: finalCategory,
							note: note || undefined,
							itemGuid: responseData.itemGuid,
							response: responseData,
						},
					});			} else if (operation === 'scanBarcode') {
					const barcode = this.getNodeParameter('barcode', i) as string;
					
					// Get store GUID from login
					const storeGuid = await getStoreGuid.call(this);

					// Scan barcode and get product
					const responseData = await easyShopperApiRequest.call(
						this,
						'GET',
						`/mobile-backend/api/v5/scan/shoppingList/${storeGuid}/${barcode}`
					);

					returnData.push({
						json: {
							success: true,
							barcodeType: responseData.barcodeType,
							barcode,
							storeGuid,
							product: responseData.data,
							itemGuid: responseData.data?.shoppingListItemGuid,
							response: responseData,
						},
					});

			} else if (operation === 'getItems') {
				const responseData = await easyShopperApiRequest.call(this, 'GET', '/mobile-backend/api/v5/shoppingList/get/');
					returnData.push({
						json: {
							success: true,
							itemsCount: responseData.items ? responseData.items.length : 0,
							items: responseData.items || [],
							response: responseData,
						},
					});					} else if (operation === 'removeItem') {
						const itemGuid = this.getNodeParameter('itemGuid', i) as string;
						// Get Store GUID from login
						const storeGuid = await getStoreGuid.call(this);

						// To remove an item, we use addOrUpdate with amount: 0 and include the shoppingListItemGuid
						const body = {
							shoppingListItemGuid: itemGuid,
							amount: 0,
						};

						const responseData = await easyShopperApiRequest.call(this, 'POST', `/mobile-backend/api/v5/shoppingList/addOrUpdate/${storeGuid}`, body);
						returnData.push({
							json: {
								success: true,
								removed: true,
								itemGuid,
								response: responseData,
							},
						});

					} else if (operation === 'clearList') {
						// Get Store GUID from login
						const storeGuid = await getStoreGuid.call(this);

						// First get all items
						const listData = await easyShopperApiRequest.call(this, 'GET', '/mobile-backend/api/v5/shoppingList/get/');
						const items = listData || [];

						// Delete each item by setting amount to 0
						const deletePromises = items.map((item: any) => 
							easyShopperApiRequest.call(this, 'POST', `/mobile-backend/api/v5/shoppingList/addOrUpdate/${storeGuid}`, {
								shoppingListItemGuid: item.shoppingListItemGuid,
								amount: 0,
							})
						);

						await Promise.all(deletePromises);

						returnData.push({
							json: {
								success: true,
								cleared: true,
								itemsDeleted: items.length,
							},
						});
					}

				} else if (resource === 'auth') {
					if (operation === 'login') {
						const credentials = await this.getCredentials('easyShopperApi');
						const body = {
							uniqueDeviceId: credentials.deviceId,
						};

						const responseData = await easyShopperApiRequest.call(this, 'POST', '/mobile-backend/api/v4/login', body);
						returnData.push({
							json: {
								success: true,
								authenticated: true,
								token: responseData.authenticationToken,
								storeGuid: responseData.storeGuid,
								deviceId: credentials.deviceId,
								response: responseData,
							},
						});
					}
				}

			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: errorMessage,
							resource,
							operation,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	/**
	 * Auto-detect product category based on product name
	 */
	static detectCategory(productName: string): string {
		const name = productName.toLowerCase();

		// Obst & Gemüse
		if (/\b(apfel|banane|orange|tomate|gurke|karotte|salat|zwiebel|kartoffel|obst|gemüse|erdbeere|kirsche|birne|pflaume)\b/.test(name)) {
			return 'obst_und_gemuese';
		}

		// Wurst & Fleisch
		if (/\b(fleisch|wurst|schinken|salami|hähnchen|schwein|rind|hackfleisch|geflügel|steak|bratwurst)\b/.test(name)) {
			return 'wurst_fleisch';
		}

		// Fisch
		if (/\b(fisch|lachs|thunfisch|forelle|hering|garnele|muschel|meeresfrüchte|kabeljau)\b/.test(name)) {
			return 'fisch';
		}

		// Käse
		if (/\b(käse|emmentaler|gouda|cheddar|mozzarella|parmesan|frischkäse)\b/.test(name)) {
			return 'kaese';
		}

		// Molkereiprodukte
		if (/\b(milch|joghurt|butter|quark|sahne|creme|fraiche)\b/.test(name)) {
			return 'molkereiprodukte';
		}

		// Fette & Eier
		if (/\b(ei|eier|öl|olivenöl|sonnenblumenöl|margarine|fett)\b/.test(name)) {
			return 'fette_eier';
		}

		// Brot & Kuchen
		if (/\b(brot|brötchen|kuchen|gebäck|toast|baguette|ciabatta|croissant)\b/.test(name)) {
			return 'brot_kuchen';
		}

		// Gebäck
		if (/\b(keks|cookie|muffin|donut|berliner|teilchen)\b/.test(name)) {
			return 'gebaeck';
		}

		// Brotaufstrich
		if (/\b(marmelade|nutella|honig|aufstrich|konfitüre|gelee)\b/.test(name)) {
			return 'brotaufstrich';
		}

		// Getränke
		if (/\b(wasser|saft|cola|limonade|getränk|mineralwasser|sprudel)\b/.test(name)) {
			return 'getraenke';
		}

		// Kaffee, Tee & Kakao
		if (/\b(kaffee|tee|kakao|espresso|cappuccino|latte|chai)\b/.test(name)) {
			return 'kaffee_tee_kakao';
		}

		// Genussmittel (Alkohol, Tabak)
		if (/\b(bier|wein|schnaps|wodka|rum|whisky|zigarette|tabak|sekt|champagner)\b/.test(name)) {
			return 'genussmittel';
		}

		// Süßwaren
		if (/\b(schokolade|bonbon|gummi|süß|süßigkeit|praline|riegel)\b/.test(name)) {
			return 'suesswaren';
		}

		// Knabbereien
		if (/\b(chips|cracker|salzstange|erdnuss|nuss|knabber|popcorn)\b/.test(name)) {
			return 'knabbereien';
		}

		// Tiefkühlkost
		if (/\b(tiefkühl|gefror|eis|eiscreme|tk|pizza)\b/.test(name)) {
			return 'tiefkuehlkost';
		}

		// Konserven
		if (/\b(dose|konserve|eingekocht|eingemacht|bohnen|erbsen|mais)\b/.test(name)) {
			return 'konserven';
		}

		// Nahrungsmittel (Nudeln, Reis, Mehl)
		if (/\b(nudel|pasta|reis|mehl|müsli|cornflakes|haferflocken|grieß)\b/.test(name)) {
			return 'nahrungsmittel';
		}

		// Würzmittel
		if (/\b(salz|pfeffer|gewürz|ketchup|senf|mayo|mayonnaise|essig|soße|sauce)\b/.test(name)) {
			return 'wuerzmittel';
		}

		// Feinkost
		if (/\b(oliven|antipasti|pesto|delikatesse|feinkost|caviar)\b/.test(name)) {
			return 'feinkost';
		}

		// Babykost
		if (/\b(baby|säugling|milchpulver|brei|gläschen|windel|schnuller)\b/.test(name)) {
			return 'babykost';
		}

		// Tierbedarf
		if (/\b(hund|katze|tier|futter|katzenstreu|leckerli|spielzeug)\b/.test(name)) {
			return 'tierbedarf';
		}

		// Hygiene
		if (/\b(shampoo|seife|duschgel|zahnpasta|deo|deodorant|hygiene|rasier|creme)\b/.test(name)) {
			return 'hygiene';
		}

		// Reinigungsmittel
		if (/\b(putzen|reinig|spülmittel|waschmittel|weichspüler|schwamm|lappen)\b/.test(name)) {
			return 'reinigungsmittel';
		}

		// Haushalt
		if (/\b(papier|toilettenpapier|küchenpapier|serviette|tüte|müllbeutel|alufolie|frischhaltefolie)\b/.test(name)) {
			return 'haushalt';
		}

		// Garten
		if (/\b(garten|blume|pflanze|erde|dünger|samen|saat|topf)\b/.test(name)) {
			return 'garten';
		}

		// Freizeit
		if (/\b(spiel|spielzeug|buch|zeitschrift|hobby|basteln)\b/.test(name)) {
			return 'freizeit';
		}

		// Default
		return 'diverse_nonfood';
	}
}