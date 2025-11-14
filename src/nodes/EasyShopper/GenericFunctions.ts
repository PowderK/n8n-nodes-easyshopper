import {
	IExecuteFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	NodeApiError,
} from 'n8n-workflow';

/**
 * Make an API request to EasyShopper
 */
export async function easyShopperApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: any = {},
): Promise<any> {
	const credentials = await this.getCredentials('easyShopperApi');

	if (credentials === undefined) {
		throw new NodeApiError(this.getNode(), {
			message: 'No credentials got returned!',
		});
	}

	// First, try to get existing token or login to get new one
	let authToken: string | undefined;
	let storeGuid: string | undefined;

	// If this is not a login request, we need to authenticate first
	if (!endpoint.includes('/login')) {
			try {
				// Try to login and get token
				// Client ID is app-wide constant, Device ID is user-specific
				const clientId = 'f1f98e3c-b86d-47f7-ada5-83dd0250c2b6';
				const authString = `${clientId}:${credentials.deviceId}`;
				const loginOptions: IRequestOptions = {
					headers: {
						'Authorization': `Basic ${Buffer.from(authString).toString('base64')}`,
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'x-subscription-key': '4a8bbd6458444086b7f51ca8b5a89ca9',
						'User-Agent': 'Whiz-Cart/4.143.0-144352; (ios 15.8.5)',
						'Accept-Language': 'de-DE,de;q=0.9',
					},
				method: 'POST',
				body: {
					uniqueDeviceId: credentials.deviceId,
				},
				uri: `${credentials.baseUrl}/mobile-backend/api/v4/login`,
				json: true,
			};

			const loginResponse = await this.helpers.request(loginOptions);
			if (loginResponse && loginResponse.authenticationToken) {
				authToken = loginResponse.authenticationToken;
				storeGuid = loginResponse.storeGuid;
			} else {
				throw new NodeApiError(this.getNode(), {
					message: 'Authentication failed - no token received',
					response: loginResponse,
				});
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown authentication error';
			throw new NodeApiError(this.getNode(), {
				message: `Authentication failed: ${errorMessage}`,
			});
		}
	}

	const options: IRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'x-subscription-key': '4a8bbd6458444086b7f51ca8b5a89ca9',
			'User-Agent': 'Whiz-Cart/4.143.0-144352; (ios 15.8.5)',
			'Accept-Language': 'de-DE,de;q=0.9',
		},
		method,
		body,
		qs: query,
		uri: `${credentials.baseUrl}${endpoint}`,
		json: true,
	};

	// Add authentication header based on endpoint
	if (endpoint.includes('/login')) {
		// For login, use Basic auth with app-wide Client ID
		const clientId = 'f1f98e3c-b86d-47f7-ada5-83dd0250c2b6';
		const authString = `${clientId}:${credentials.deviceId}`;
		options.headers!['Authorization'] = `Basic ${Buffer.from(authString).toString('base64')}`;
	} else {
		// For other endpoints, use Bearer token
		if (authToken) {
			options.headers!['Authorization'] = `Bearer ${authToken}`;
		} else {
			throw new NodeApiError(this.getNode(), {
				message: 'No authentication token available',
			});
		}
	}

	try {
		const response = await this.helpers.request(options);
		return response;
	} catch (error: any) {
		if (error?.response?.body) {
			const errorMessage = error.response.body.message || error.response.body.error || (error instanceof Error ? error.message : 'API Error');
			throw new NodeApiError(this.getNode(), {
				message: `EasyShopper API Error: ${errorMessage}`,
				description: `Status: ${error.response.statusCode}`,
				httpCode: error.response.statusCode.toString(),
			});
		}
		const errorMessage = error instanceof Error ? error.message : 'Request failed';
		throw new NodeApiError(this.getNode(), {
			message: `EasyShopper API request failed: ${errorMessage}`,
		});
	}
}

/**
 * Make an API request to EasyShopper and return all items
 */
export async function easyShopperApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: any = {},
	query: any = {},
): Promise<any[]> {
	const returnData: any[] = [];

	let responseData;

	do {
		responseData = await easyShopperApiRequest.call(this, method, endpoint, body, query);
		if (Array.isArray(responseData)) {
			returnData.push.apply(returnData, responseData);
		} else if (responseData.items && Array.isArray(responseData.items)) {
			returnData.push.apply(returnData, responseData.items);
		} else {
			returnData.push(responseData);
		}

		// Handle pagination if the API supports it
		if (responseData.nextPageToken) {
			query.pageToken = responseData.nextPageToken;
		} else {
			break;
		}
	} while (responseData.nextPageToken);

	return returnData;
}

/**
 * Get Store GUID by logging in
 */
export async function getStoreGuid(
	this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<string> {
	const credentials = await this.getCredentials('easyShopperApi');

	if (credentials === undefined) {
		throw new NodeApiError(this.getNode(), {
			message: 'No credentials got returned!',
		});
	}

	try {
		const clientId = 'f1f98e3c-b86d-47f7-ada5-83dd0250c2b6';
		const authString = `${clientId}:${credentials.deviceId}`;
		const loginOptions: IRequestOptions = {
			headers: {
				'Authorization': `Basic ${Buffer.from(authString).toString('base64')}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'x-subscription-key': '4a8bbd6458444086b7f51ca8b5a89ca9',
				'User-Agent': 'Whiz-Cart/4.143.0-144352; (ios 15.8.5)',
				'Accept-Language': 'de-DE,de;q=0.9',
			},
			method: 'POST',
			body: {
				uniqueDeviceId: credentials.deviceId,
			},
			uri: `${credentials.baseUrl}/mobile-backend/api/v4/login`,
			json: true,
		};

		const loginResponse = await this.helpers.request(loginOptions);
		if (loginResponse && loginResponse.storeGuid) {
			return loginResponse.storeGuid;
		} else {
			throw new NodeApiError(this.getNode(), {
				message: 'Could not get store GUID from login response',
				response: loginResponse,
			});
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		throw new NodeApiError(this.getNode(), {
			message: `Failed to get store GUID: ${errorMessage}`,
		});
	}
}
