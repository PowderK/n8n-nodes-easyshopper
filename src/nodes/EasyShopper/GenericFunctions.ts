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

	// If this is not a login request, we need to authenticate first
	if (!endpoint.includes('/login')) {
		try {
			// Try to login and get token
			const loginOptions: IRequestOptions = {
				headers: {
					'Authorization': `Basic ${Buffer.from(credentials.apiCredentials as string).toString('base64')}`,
					'Content-Type': 'application/json',
					'Accept': 'application/json',
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
		},
		method,
		body,
		qs: query,
		uri: `${credentials.baseUrl}${endpoint}`,
		json: true,
	};

	// Add authentication header based on endpoint
	if (endpoint.includes('/login')) {
		// For login, use Basic auth
		options.headers!['Authorization'] = `Basic ${Buffer.from(credentials.apiCredentials as string).toString('base64')}`;
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