import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EasyShopperApi implements ICredentialType {
	name = 'easyShopperApi';
	displayName = 'EasyShopper API';
	documentationUrl = 'https://easyshopper.app';
	properties: INodeProperties[] = [
		{
			displayName: 'Device ID',
			name: 'deviceId',
			type: 'string',
			default: '',
			description: 'Your EasyShopper device ID (UUID format)',
			required: true,
		},
		{
			displayName: 'API Credentials',
			name: 'apiCredentials',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your EasyShopper API credentials (format: clientId:deviceId)',
			required: true,
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.es-prod.whiz-cart.com',
			description: 'EasyShopper API base URL',
			required: true,
		},
	];

	// Test the connection
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/mobile-backend/api/v4/login',
			method: 'POST',
			headers: {
				'Authorization': '=Basic {{Buffer.from($credentials.apiCredentials).toString("base64")}}',
				'Content-Type': 'application/json',
			},
			body: {
				uniqueDeviceId: '={{$credentials.deviceId}}',
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'authenticationToken',
					value: true,
					message: 'Invalid credentials or device ID',
				},
			},
		],
	};
}