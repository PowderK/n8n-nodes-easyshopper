import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { easyShopperApiRequest, easyShopperApiRequestAllItems } from './GenericFunctions';

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
					{ name: 'Obst & Gemüse', value: 'obst_gemuese' },
					{ name: 'Fleisch & Wurst', value: 'fleisch_wurst' },
					{ name: 'Fisch & Meeresfrüchte', value: 'fisch_meeresfruechte' },
					{ name: 'Molkereiprodukte', value: 'molkereiprodukte' },
					{ name: 'Brot & Backwaren', value: 'brot_backwaren' },
					{ name: 'Getränke', value: 'getraenke' },
					{ name: 'Süßwaren', value: 'suessigkeiten_snacks' },
					{ name: 'Tiefkühlprodukte', value: 'tiefkuehlprodukte' },
					{ name: 'Konserven', value: 'konserven_fertiggerichte' },
					{ name: 'Grundnahrungsmittel', value: 'grundnahrungsmittel' },
					{ name: 'Diverse Non-Food', value: 'diverse_nonfood' },
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
					const note = this.getNodeParameter('note', i) as string;

					// Auto-detect category if needed
					let finalCategory = category;
					if (category === 'auto') {
						finalCategory = EasyShopper.detectCategory(productName);
					}

					const body: any = {
						productName,
						quantity,
						category: finalCategory,
					};

					// Add note if provided
					if (note) {
						body.notes = [{
							type: 'text',
							text: note,
						}];
					}

					const responseData = await easyShopperApiRequest.call(this, 'POST', '/mobile-backend/api/v5/shoppinglist/addItem', body);
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
						});

					} else if (operation === 'scanBarcode') {
						const barcode = this.getNodeParameter('barcode', i) as string;
						const credentials = await this.getCredentials('easyShopperApi');
						
						// Get store GUID first (from login or cached credentials)
						let storeGuid = '';
						try {
							const loginBody = {
								uniqueDeviceId: credentials.deviceId,
							};
							const loginResponse = await easyShopperApiRequest.call(this, 'POST', '/mobile-backend/api/v4/login', loginBody);
							storeGuid = loginResponse.storeGuid;
						} catch (error) {
							throw new NodeOperationError(this.getNode(), 'Failed to get store GUID for barcode scan');
						}

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
						const responseData = await easyShopperApiRequest.call(this, 'GET', '/mobile-backend/api/v5/shoppinglist');
						returnData.push({
							json: {
								success: true,
								itemsCount: responseData.items ? responseData.items.length : 0,
								items: responseData.items || [],
								response: responseData,
							},
						});

					} else if (operation === 'removeItem') {
						const itemGuid = this.getNodeParameter('itemGuid', i) as string;
						const responseData = await easyShopperApiRequest.call(this, 'DELETE', `/mobile-backend/api/v5/shoppinglist/${itemGuid}`);
						returnData.push({
							json: {
								success: true,
								removed: true,
								itemGuid,
								response: responseData,
							},
						});

					} else if (operation === 'clearList') {
						const responseData = await easyShopperApiRequest.call(this, 'DELETE', '/mobile-backend/api/v5/shoppinglist/clear');
						returnData.push({
							json: {
								success: true,
								cleared: true,
								response: responseData,
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
		if (/\b(apfel|banane|orange|tomate|gurke|karotte|salat|zwiebel|kartoffel|obst|gemüse)\b/.test(name)) {
			return 'obst_gemuese';
		}

		// Fleisch & Wurst
		if (/\b(fleisch|wurst|schinken|salami|hähnchen|schwein|rind|hackfleisch)\b/.test(name)) {
			return 'fleisch_wurst';
		}

		// Molkereiprodukte
		if (/\b(milch|käse|joghurt|butter|quark|sahne|frischkäse)\b/.test(name)) {
			return 'molkereiprodukte';
		}

		// Brot & Backwaren
		if (/\b(brot|brötchen|kuchen|keks|gebäck|toast)\b/.test(name)) {
			return 'brot_backwaren';
		}

		// Getränke
		if (/\b(wasser|saft|bier|wein|cola|limonade|tee|kaffee|getränk)\b/.test(name)) {
			return 'getraenke';
		}

		// Süßwaren
		if (/\b(schokolade|bonbon|gummi|eis|süß|zucker|honig)\b/.test(name)) {
			return 'suessigkeiten_snacks';
		}

		// Default
		return 'diverse_nonfood';
	}
}