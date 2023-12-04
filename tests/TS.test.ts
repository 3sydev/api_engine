import APIEngine, { ApiParametersType, ApiCallResponseType } from '../index';
import { Retries } from '../src/types';
import apiConstantsTs from './mocks/mock_ts';
import apiConstantsTsGlobal from './mocks/mock_ts_globals';
import apiConstantsTsGlobalNoParams from './mocks/mock_ts_globals_no_params';
import apiConstantsTsGlobalSomeParams from './mocks/mock_ts_globals_some_params';
import { FetchError, HeaderInit } from 'node-fetch';

const api = new APIEngine(apiConstantsTs);
const apiTypes = api.getApiTypes();

describe('TypeScript tests', () => {
    describe('Initialization tests', () => {
        test('Init with apiConstants', () => {
            const api = new APIEngine(apiConstantsTs);
            expect(api).toBeTruthy();
        });

        test('Api type not defined', async () => {
            const api = new APIEngine(apiConstantsTs);
            const apiTypes = api.getApiTypes();

            await expect(api.call(apiTypes.invalidApiType)).rejects.toStrictEqual(new Error('Api type not defined'));
        });
    });

    describe('Simple REST API calls', () => {
        test('OK call', async () => {
            expect.assertions(1);
            const res = await api.call(apiTypes.getResources);
            expect(res.response.status).toEqual<number>(200);
        });

        test('KO call', async () => {
            expect.assertions(1);
            const res = await api.call(apiTypes.getResourcesKO);
            expect(res.response.status).toEqual<number>(404);
        });
    });

    describe('Fetch KO', () => {
        test('Not valid URL', async () => {
            await expect(api.call(apiTypes.getResourcesInvalidUrl)).rejects.toStrictEqual(
                new FetchError('request to https://jsonplaceholder.typicode.comp/ failed, reason: getaddrinfo ENOTFOUND jsonplaceholder.typicode.comp', 'system')
            );
        });
    });

    describe('With parameters REST API calls', () => {
        test('Path parameter call OK', async () => {
            expect.assertions(1);
            const parameters: ApiParametersType = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };
            const res = await api.call(apiTypes.getResources, parameters);
            expect(res.response.status).toEqual<number>(200);
        });

        test('Path parameter call KO', async () => {
            expect.assertions(1);
            const parameters: ApiParametersType = {
                pathQueryParameters: [{ name: 'id', value: 'sdvfevdc' }],
            };
            const res = await api.call(apiTypes.getResource, parameters);
            expect(res.response.status).toEqual<number>(404);
        });

        test('Query parameter call OK', async () => {
            expect.assertions(1);
            const parameters: ApiParametersType = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };
            const res = await api.call(apiTypes.getUserResources, parameters);
            expect(res.response.status).toEqual<number>(200);
        });

        test('Query parameter call KO', async () => {
            expect.assertions(1);
            const parameters: ApiParametersType = {
                pathQueryParameters: [{ name: 'sdcsdvsdv', value: 'sdvfevdc' }],
            };
            const res = await api.call(apiTypes.getUserResourcesKO, parameters);
            expect(res.response.status).toEqual<number>(404);
        });

        test('Mist parameters call OK', async () => {
            expect.assertions(1);
            const parameters: ApiParametersType = {
                pathQueryParameters: [
                    { name: 'route', value: 'posts' },
                    { name: 'id', value: '1' },
                ],
            };
            const res = await api.call(apiTypes.getUserResourcesWithCustomRoute, parameters);
            expect(res.response.status).toEqual<number>(200);
        });

        test('Mist parameters call KO', async () => {
            expect.assertions(1);
            const parameters: ApiParametersType = {
                pathQueryParameters: [
                    { name: 'route', value: 'erfcekrnc' },
                    { name: 'id', value: 'dfvnodiefc' },
                ],
            };
            const res = await api.call(apiTypes.getUserResourcesWithCustomRoute, parameters);
            expect(res.response.status).toEqual<number>(404);
        });
    });

    describe('With headers and body REST API calls', () => {
        test('Static headers and body call OK', async () => {
            expect.assertions(1);
            const res = await api.call(apiTypes.createResource);
            expect(res.response.status).toEqual<number>(201);
        });

        test('Static headers and body call KO', async () => {
            expect.assertions(1);
            const res = await api.call(apiTypes.createResourceKO);
            expect(res.response.status).toEqual<number>(404);
        });

        test('Dinamic headers and body call OK', async () => {
            expect.assertions(1);
            const parameters: ApiParametersType = {
                pathQueryParameters: [
                    { name: 'route', value: 'posts' },
                    { name: 'id', value: '1' },
                ],
                headers: {
                    Accept: 'application/json',
                },
                body: JSON.stringify({ title: 'foo' }),
            };
            const res = await api.call(apiTypes.createResourceWithDinamicHeaderAndBody, parameters);
            expect(res.response.status).toEqual<number>(201);
        });

        test('Dinamic headers and body call KO', async () => {
            expect.assertions(1);
            const parameters: ApiParametersType = {
                pathQueryParameters: [
                    { name: 'route', value: 'erfcekrnc' },
                    { name: 'id', value: 'dfvnodiefc' },
                ],
                headers: {
                    Accept: 'application/json',
                },
                body: JSON.stringify({ test: 'test' }),
            };
            const res = await api.call(apiTypes.createResourceKO, parameters);
            expect(res.response.status).toEqual<number>(404);
        });
    });

    describe('With retries', () => {
        test('Retry OK', async () => {
            expect.assertions(2);
            const res = await api.call(apiTypes.getResourcesWithRetryOK);
            expect(res.response.status).toEqual<number>(200);
            expect(res.retries).toEqual<ApiCallResponseType>(expect.objectContaining<Retries>({ quantity: 1, conditions: [200] }));
        });

        test('Retry KO', async () => {
            expect.assertions(2);
            const res = await api.call(apiTypes.getResourcesWithRetryKO);
            expect(res.response.status).toEqual<number>(404);
            expect(res.retries).toEqual<ApiCallResponseType>(expect.objectContaining<Retries>({ quantity: 3, conditions: [404, 404, 404] }));
        });
    });

    describe('Missing parameters', () => {
        test('"retry" < 0', async () => {
            await expect(api.call(apiTypes.getResourcesInvalidRetry)).rejects.toStrictEqual(new Error('"retry" parameter < 0'));
        });

        test('Empty "pathQueryParameters"', async () => {
            expect.assertions(1);
            const parameters: ApiParametersType = {
                headers: {
                    Accept: 'application/json',
                },
            };
            const res = await api.call(apiTypes.getResources, parameters);
            expect(res.response.status).toEqual<number>(200);
        });
    });

    describe('Global parameters', () => {
        test('All parameters', async () => {
            expect.assertions(5);
            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual<number>(404);
            expect(res.response.url).toEqual<string>(apiConstantsTsGlobal.baseUrl + apiConstantsTsGlobal.endpoints.getResources.path);
            expect(res.requestApi.request?.method).toEqual<string>(apiConstantsTsGlobal.endpoints.getResources.request?.method!);
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobal.endpoints.getResources.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([404, 404, 404, 400]);
        });

        test('Some parameters', async () => {
            expect.assertions(5);
            const api = new APIEngine(apiConstantsTsGlobalSomeParams);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual<number>(404);
            expect(res.response.url).toEqual<string>(apiConstantsTsGlobalSomeParams.baseUrl + apiConstantsTsGlobalSomeParams.endpoints.getResources.path);
            expect(res.requestApi.request?.method).toEqual<string>(apiConstantsTsGlobalSomeParams.endpoints.getResources.request?.method!);
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobalSomeParams.endpoints.getResources.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([400]);
        });

        test('Empty global parameters', async () => {
            expect.assertions(5);
            const api = new APIEngine(apiConstantsTsGlobalNoParams);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual<number>(404);
            expect(res.response.url).toEqual<string>(apiConstantsTsGlobalNoParams.baseUrl + apiConstantsTsGlobalNoParams.endpoints.getResources.path);
            expect(res.requestApi.request?.method).toEqual<string>(apiConstantsTsGlobalNoParams.endpoints.getResources.request?.method!);
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobalNoParams.endpoints.getResources.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([400]);
        });

        test('Empty request parameter', async () => {
            const api = new APIEngine(apiConstantsTsGlobalNoParams);
            const apiTypes = api.getApiTypes();

            await expect(api.call(apiTypes.getResourcesNoRequest)).rejects.toStrictEqual(new Error('Request parameter not defined'));
        });

        test('Defaults headers on global parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesForDefaultsHeaders);

            expect(res.response.status).toEqual<number>(200);
            expect(res.response.url).toEqual<string>(apiConstantsTsGlobal.baseUrl + apiConstantsTsGlobal.endpoints.getResourcesForDefaultsHeaders.path);
            expect(res.requestApi.request?.method).toEqual<string>(apiConstantsTsGlobal.globalParams?.request?.method!);
            expect(res.requestApi.request?.headers).toMatchObject<HeaderInit>(apiConstantsTsGlobal.globalParams?.request?.headers!);
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobal.endpoints.getResourcesForDefaultsHeaders.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([404, 404, 404, 400]);
        });
    });
});
