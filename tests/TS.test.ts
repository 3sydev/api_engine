import { APIEngine, ApiParameters, CallResponse } from '../src/index';
import { Retries, StackTrace, StackTraceCallback } from '../src/types';
import apiConstantsTs from './mocks/mock_ts';
import apiConstantsTsGlobal from './mocks/mock_ts_globals';
import apiConstantsTsGlobalNoParams from './mocks/mock_ts_globals_no_params';
import apiConstantsTsGlobalSomeParams from './mocks/mock_ts_globals_some_params';
import apiConstantsTsStackTrace from './mocks/mock_ts_stack_trace';
import apiConstantsTsInterceptors, { ResponseInterceptorData, ResponseInterceptorDataMixed, resetResponseInterceptorData, responseInterceptorData } from './mocks/mock_ts_interceptors';

const api = new APIEngine(apiConstantsTs);
const apiTypes = api.getApiTypes();

describe('TypeScript tests', () => {
    describe('Initialization tests', () => {
        test('Init with apiConstants', () => {
            const api = new APIEngine(apiConstantsTs);
            expect(api).toBeTruthy();
        });

        test('Api type not defined', async () => {
            expect.assertions(1);
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
            expect.assertions(1);
            await expect(api.call(apiTypes.getResourcesInvalidUrl)).rejects.toBeDefined();
        });
    });

    describe('With parameters REST API calls', () => {
        test('Path parameter call OK', async () => {
            expect.assertions(1);
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };
            const res = await api.call(apiTypes.getResources, parameters);
            expect(res.response.status).toEqual<number>(200);
        });

        test('Path parameter call KO', async () => {
            expect.assertions(1);
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'id', value: 'sdvfevdc' }],
            };
            const res = await api.call(apiTypes.getResource, parameters);
            expect(res.response.status).toEqual<number>(404);
        });

        test('Query parameter call OK', async () => {
            expect.assertions(1);
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };
            const res = await api.call(apiTypes.getUserResources, parameters);
            expect(res.response.status).toEqual<number>(200);
        });

        test('Query parameter call KO', async () => {
            expect.assertions(1);
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'sdcsdvsdv', value: 'sdvfevdc' }],
            };
            const res = await api.call(apiTypes.getUserResourcesKO, parameters);
            expect(res.response.status).toEqual<number>(404);
        });

        test('Mist parameters call OK', async () => {
            expect.assertions(1);
            const parameters: ApiParameters = {
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
            const parameters: ApiParameters = {
                pathQueryParameters: [
                    { name: 'route', value: 'erfcekrnc' },
                    { name: 'id', value: 'dfvnodiefc' },
                ],
            };
            const res = await api.call(apiTypes.getUserResourcesWithCustomRoute, parameters);
            expect(res.response.status).toEqual<number>(404);
        });

        test('Empty query parameter removed from URL', async () => {
            expect.assertions(2);
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'id', value: '' }],
            };
            const res = await api.call(apiTypes.getUserResources, parameters);
            expect(res.response.status).toEqual<number>(200);
            expect(res.response.url).toEqual<string>(apiConstantsTs.baseUrl + '/posts');
        });

        test('Empty path parameter removed from URL', async () => {
            expect.assertions(2);
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'id', value: '' }],
            };
            const res = await api.call(apiTypes.getResource, parameters);
            expect(res.response.status).toEqual<number>(200);
            expect(res.response.url).toMatch(new RegExp(`${apiConstantsTs.baseUrl}/posts/?$`));
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
            const parameters: ApiParameters = {
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
            const parameters: ApiParameters = {
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
            expect(res.retries).toEqual<CallResponse>(expect.objectContaining<Retries>({ quantity: 1, conditions: [200] }));
        });

        test('Retry KO', async () => {
            expect.assertions(2);
            const res = await api.call(apiTypes.getResourcesWithRetryKO);
            expect(res.response.status).toEqual<number>(404);
            expect(res.retries).toEqual<CallResponse>(expect.objectContaining<Retries>({ quantity: 3, conditions: [404, 404, 404] }));
        });
    });

    describe('Missing parameters', () => {
        test('"retry" < 1', async () => {
            expect.assertions(1);
            await expect(api.call(apiTypes.getResourcesInvalidRetry)).rejects.toStrictEqual(new Error('"retry" parameter < 1'));
        });

        test('Empty "pathQueryParameters"', async () => {
            expect.assertions(1);
            const parameters: ApiParameters = {
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
            expect.assertions(1);
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
            expect(res.requestApi.request?.headers).toMatchObject<HeadersInit>(apiConstantsTsGlobal.globalParams?.request?.headers!);
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobal.endpoints.getResourcesForDefaultsHeaders.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([404, 404, 404, 400]);
        });

        test('Ignore global parameter', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesIgnoreGlobalParams);

            expect(res.response.status).toEqual<number>(200);
            expect(res.response.url).toEqual<string>(apiConstantsTsGlobal.baseUrl + apiConstantsTsGlobal.endpoints.getResourcesIgnoreGlobalParams.path);
            expect(res.requestApi.request?.method).toEqual<string>(apiConstantsTsGlobal.endpoints.getResourcesIgnoreGlobalParams.request?.method!);
            expect(res.requestApi.request?.headers).toEqual(undefined);
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobal.endpoints.getResourcesIgnoreGlobalParams.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([]);
        });

        test('Mixed global parameters and endpoint parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesMixedGlobalParamsAndEndpointParams);

            expect(res.response.status).toEqual<number>(200);
            expect(res.response.url).toEqual<string>(apiConstantsTsGlobal.baseUrl + apiConstantsTsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.path);
            expect(res.requestApi.request?.method).toEqual<string>(apiConstantsTsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.request?.method!);
            expect(res.requestApi.request?.headers).toEqual({
                'Cache-Control': 'no-store',
                Expires: '0',
                'Custom-Header': 'customeHeader',
            });
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([404, 404, 404]);
        });

        test('Mixed global parameters, endpoint and call method parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesMixedGlobalParamsAndEndpointParams, { headers: { Test: 'Test' } });

            expect(res.response.status).toEqual<number>(200);
            expect(res.response.url).toEqual<string>(apiConstantsTsGlobal.baseUrl + apiConstantsTsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.path);
            expect(res.requestApi.request?.method).toEqual<string>(apiConstantsTsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.request?.method!);
            expect(res.requestApi.request?.headers).toEqual({
                'Cache-Control': 'no-store',
                Expires: '0',
                'Custom-Header': 'customeHeader',
                Test: 'Test',
            });
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([404, 404, 404]);
        });

        test('Mixed endpoint and call method parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesMixedEndpointParamsAndCallMethodParams, { headers: { Test: 'Test' } });

            expect(res.response.status).toEqual<number>(200);
            expect(res.response.url).toEqual<string>(apiConstantsTsGlobal.baseUrl + apiConstantsTsGlobal.endpoints.getResourcesMixedEndpointParamsAndCallMethodParams.path);
            expect(res.requestApi.request?.method).toEqual<string>(apiConstantsTsGlobal.endpoints.getResourcesMixedEndpointParamsAndCallMethodParams.request?.method!);
            expect(res.requestApi.request?.headers).toEqual({ 'Custom-Header': 'customeHeader', Test: 'Test' });
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobal.endpoints.getResourcesMixedEndpointParamsAndCallMethodParams.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([404, 404, 404]);
        });

        test('Mixed global and call method parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesMixedGlobalParamsAndCallMethodParams, { headers: { Test: 'Test' } });

            expect(res.response.status).toEqual<number>(200);
            expect(res.response.url).toEqual<string>(apiConstantsTsGlobal.baseUrl + apiConstantsTsGlobal.endpoints.getResourcesMixedGlobalParamsAndCallMethodParams.path);
            expect(res.requestApi.request?.method).toEqual<string>(apiConstantsTsGlobal.endpoints.getResourcesMixedGlobalParamsAndCallMethodParams.request?.method!);
            expect(res.requestApi.request?.headers).toEqual({ 'Cache-Control': 'no-store', Expires: '0', Test: 'Test' });
            expect(res.requestApi.retry).toEqual<number>(apiConstantsTsGlobal.endpoints.getResourcesMixedGlobalParamsAndCallMethodParams.retry!);
            expect(res.requestApi.retryCondition).toEqual<number[]>([404, 404, 404]);
        });
    });

    describe('Stack Trace tests', () => {
        test('No extra params', async () => {
            expect.assertions(11);

            const api = new APIEngine(apiConstantsTsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual<number>(200);
            const stackTraceLog = api.getStackTraceLog();
            const lastStackTraceLog = stackTraceLog[stackTraceLog.length - 1];
            expect(lastStackTraceLog.startTimestamp).toBeTruthy();
            expect(lastStackTraceLog.endTimestamp).toBeTruthy();
            expect(lastStackTraceLog.requestUrl).toEqual(res.response.url);
            expect(lastStackTraceLog.requestHeaders).toEqual(res.requestApi.request.headers || {});
            expect(lastStackTraceLog.responseHeaders).toEqual(res.response.headers);
            expect(lastStackTraceLog.requestBody).toEqual(res.requestApi.request.body || '');
            expect(lastStackTraceLog.responseBody).toEqual(res.responseBody);
            expect(lastStackTraceLog.responseStatusCode).toEqual(res.response.status);
            expect(lastStackTraceLog.errorMessage).toBeUndefined();
            expect(lastStackTraceLog.extraProperties).toEqual({});
        });

        test('Only global extra params', async () => {
            expect.assertions(11);

            const api = new APIEngine(apiConstantsTsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyGlobalExtraParams);

            expect(res.response.status).toEqual<number>(200);
            const stackTraceLog = api.getStackTraceLog();
            const lastStackTraceLog = stackTraceLog[stackTraceLog.length - 1];
            expect(lastStackTraceLog.startTimestamp).toBeTruthy();
            expect(lastStackTraceLog.endTimestamp).toBeTruthy();
            expect(lastStackTraceLog.requestUrl).toEqual(res.response.url);
            expect(lastStackTraceLog.requestHeaders).toEqual(res.requestApi.request.headers || {});
            expect(lastStackTraceLog.responseHeaders).toEqual(res.response.headers);
            expect(lastStackTraceLog.requestBody).toEqual(res.requestApi.request.body || '');
            expect(lastStackTraceLog.responseBody).toEqual(res.responseBody);
            expect(lastStackTraceLog.responseStatusCode).toEqual(res.response.status);
            expect(lastStackTraceLog.errorMessage).toBeUndefined();
            expect(lastStackTraceLog.extraProperties).toEqual({
                text: 'Text',
                number: 1,
            });
        });

        test('Only endpoint extra params', async () => {
            expect.assertions(11);

            const api = new APIEngine(apiConstantsTsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyEndpointExtraParams);

            expect(res.response.status).toEqual<number>(200);
            const stackTraceLog = api.getStackTraceLog();
            const lastStackTraceLog = stackTraceLog[stackTraceLog.length - 1];
            expect(lastStackTraceLog.startTimestamp).toBeTruthy();
            expect(lastStackTraceLog.endTimestamp).toBeTruthy();
            expect(lastStackTraceLog.requestUrl).toEqual(res.response.url);
            expect(lastStackTraceLog.requestHeaders).toEqual(res.requestApi.request.headers || {});
            expect(lastStackTraceLog.responseHeaders).toEqual(res.response.headers);
            expect(lastStackTraceLog.requestBody).toEqual(res.requestApi.request.body || '');
            expect(lastStackTraceLog.responseBody).toEqual(res.responseBody);
            expect(lastStackTraceLog.responseStatusCode).toEqual(res.response.status);
            expect(lastStackTraceLog.errorMessage).toBeUndefined();
            expect(lastStackTraceLog.extraProperties).toEqual({
                text1: 'Text1',
                number: 2,
            });
        });

        test('Global and endpoint extra params', async () => {
            expect.assertions(11);

            const api = new APIEngine(apiConstantsTsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyGlobalAndEndpointExtraParams);

            expect(res.response.status).toEqual<number>(200);
            const stackTraceLog = api.getStackTraceLog();
            const lastStackTraceLog = stackTraceLog[stackTraceLog.length - 1];
            expect(lastStackTraceLog.startTimestamp).toBeTruthy();
            expect(lastStackTraceLog.endTimestamp).toBeTruthy();
            expect(lastStackTraceLog.requestUrl).toEqual(res.response.url);
            expect(lastStackTraceLog.requestHeaders).toEqual(res.requestApi.request.headers || {});
            expect(lastStackTraceLog.responseHeaders).toEqual(res.response.headers);
            expect(lastStackTraceLog.requestBody).toEqual(res.requestApi.request.body || '');
            expect(lastStackTraceLog.responseBody).toEqual(res.responseBody);
            expect(lastStackTraceLog.responseStatusCode).toEqual(res.response.status);
            expect(lastStackTraceLog.errorMessage).toBeUndefined();
            expect(lastStackTraceLog.extraProperties).toEqual({
                text: 'Text',
                number: 1,
                text1: 'Text1',
                number1: 2,
            });
        });

        test('With request and response body', async () => {
            expect.assertions(11);

            const api = new APIEngine(apiConstantsTsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesRequestBody);

            expect(res.response.status).toEqual<number>(201);
            const stackTraceLog = api.getStackTraceLog();
            const lastStackTraceLog = stackTraceLog[stackTraceLog.length - 1];
            expect(lastStackTraceLog.startTimestamp).toBeTruthy();
            expect(lastStackTraceLog.endTimestamp).toBeTruthy();
            expect(lastStackTraceLog.requestUrl).toEqual(res.response.url);
            expect(lastStackTraceLog.requestHeaders).toEqual(res.requestApi.request.headers || {});
            expect(lastStackTraceLog.responseHeaders).toEqual(res.response.headers);
            expect(lastStackTraceLog.requestBody).toEqual(res.requestApi.request.body || '');
            expect(lastStackTraceLog.responseBody).toEqual(res.responseBody);
            expect(lastStackTraceLog.responseStatusCode).toEqual(res.response.status);
            expect(lastStackTraceLog.errorMessage).toBeUndefined();
            expect(lastStackTraceLog.extraProperties).toEqual({});
        });

        test('With response error', async () => {
            expect.assertions(10);

            const api = new APIEngine(apiConstantsTsStackTrace);
            const apiTypes = api.getApiTypes();

            try {
                await api.call(apiTypes.getResourcesError);
            } catch (error) {
                const stackTraceLog = api.getStackTraceLog();
                const lastStackTraceLog = stackTraceLog[stackTraceLog.length - 1];
                expect(lastStackTraceLog.startTimestamp).toBeTruthy();
                expect(lastStackTraceLog.endTimestamp).toBeTruthy();
                expect(lastStackTraceLog.requestUrl).toEqual('https://jsonplaceholder.typicode.com/posts');
                expect(lastStackTraceLog.requestHeaders).toEqual({});
                expect(lastStackTraceLog.responseHeaders).toBeDefined();
                expect(lastStackTraceLog.requestBody).toEqual('{"test":"Test"}');
                expect(lastStackTraceLog.responseBody).toEqual('');
                expect(lastStackTraceLog.responseStatusCode).toEqual(200);
                expect(lastStackTraceLog.errorMessage).toBeDefined();
                expect(lastStackTraceLog.extraProperties).toEqual({});
            }
        });

        test('With stackTraceLogCallback', async () => {
            expect.assertions(11);

            let stackTrace: StackTrace[] = [];

            const stackTraceLogCallback: StackTraceCallback = (stackTraceLog: StackTrace) => {
                stackTrace.push(stackTraceLog);
            };

            const api = new APIEngine(apiConstantsTsStackTrace, stackTraceLogCallback);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual<number>(200);
            const lastStackTraceLog = stackTrace[stackTrace.length - 1];
            expect(lastStackTraceLog.startTimestamp).toBeTruthy();
            expect(lastStackTraceLog.endTimestamp).toBeTruthy();
            expect(lastStackTraceLog.requestUrl).toEqual(res.response.url);
            expect(lastStackTraceLog.requestHeaders).toEqual(res.requestApi.request.headers || {});
            expect(lastStackTraceLog.responseHeaders).toEqual(res.response.headers);
            expect(lastStackTraceLog.requestBody).toEqual(res.requestApi.request.body || '');
            expect(lastStackTraceLog.responseBody).toEqual(res.responseBody);
            expect(lastStackTraceLog.responseStatusCode).toEqual(res.response.status);
            expect(lastStackTraceLog.errorMessage).toBeUndefined();
            expect(lastStackTraceLog.extraProperties).toEqual({});
        });
    });

    describe('Interceptors tests', () => {
        beforeEach(resetResponseInterceptorData);

        test('Only global interceptors', async () => {
            expect.assertions(4);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyGlobalInterceptors);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(responseInterceptorData).toEqual<ResponseInterceptorData>({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('Only endpoint interceptors', async () => {
            expect.assertions(4);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyEndpointInterceptors);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(responseInterceptorData).toEqual<ResponseInterceptorData>({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('Global and endpoint interceptors', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesGlobalAndEndpointInterceptors);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(1);
            expect(responseInterceptorData).toEqual<ResponseInterceptorDataMixed>({ statusCode: res.response.status, responseBody: res.responseBody, retry: res.requestApi.retry });
        });

        test('With throw error on responseInterceptor', async () => {
            expect.assertions(2);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();

            try {
                await api.call(apiTypes.getResourcesWithErrorInterceptors);
            } catch (error) {
                expect({ ...responseInterceptorData, responseBody: responseInterceptorData.responseBody }).toEqual<ResponseInterceptorDataMixed>({
                    statusCode: 200,
                    responseBody: JSON.parse(
                        '{"userId": 1,"id": 1,"title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body": "quia et suscipit\\nsuscipit recusandae consequuntur expedita et cum\\nreprehenderit molestiae ut ut quas totam\\nnostrum rerum est autem sunt rem eveniet architecto"}'
                    ),
                    retry: 0,
                });
                expect(error).toStrictEqual(new Error('Error on responseInterceptor'));
            }
        });

        test('With interceptorResponse no Promise and no global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorResponse);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status });
        });

        test('With interceptorResponse Promise and no global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorResponseAndPromise);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status });
        });

        test('With interceptorResponse Promise reject', async () => {
            expect.assertions(1);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();

            try {
                await api.call(apiTypes.getResourcesWithInterceptorResponseAndPromiseReject);
            } catch (error) {
                expect(error).toStrictEqual(new Error('Reject Promise from interceptorResponse'));
            }
        });

        test('With interceptorResponse no Promise and global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorResponseAndGlobal);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody, extraParam: 'Extra from endpoint responseInterceptor' });
        });

        test('With interceptorResponse Promise and global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorResponseAndPromiseAndGlobal);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody, extraParam: 'Extra from endpoint responseInterceptor' });
        });

        test('With interceptorRequest no Promise and global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorRequestAndGlobal);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('With interceptorRequest Promise and global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorRequestAndPromiseAndGlobal);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('With interceptorRequest no Promise and no global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorRequest);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('With interceptorRequest Promise and no global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorRequestAndPromise);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('With interceptorRequest Promise reject', async () => {
            expect.assertions(1);

            const api = new APIEngine(apiConstantsTsInterceptors);
            const apiTypes = api.getApiTypes();

            try {
                await api.call(apiTypes.getResourcesWithInterceptorRequestAndPromiseReject);
            } catch (error) {
                expect(error).toStrictEqual(new Error('Reject Promise from interceptorRequest'));
            }
        });
    });

    describe('Read two times the response body data', () => {
        test('Second read of response body data', async () => {
            expect.assertions(3);

            const api = new APIEngine(apiConstantsTsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual<number>(200);
            const stackTraceLog = api.getStackTraceLog();
            const lastStackTraceLog = stackTraceLog[stackTraceLog.length - 1];
            expect(lastStackTraceLog.responseBody).toEqual(res.responseBody);
            expect(await res.response.json()).toEqual(res.responseBody);
        });
    });

    describe('Base URL specific tests', () => {
        test('Overwrite base url from endpoint', async () => {
            expect.assertions(5);

            const res = await api.call(apiTypes.getResourcesOverwriteBaseUrl);

            expect(res.response.status).toEqual<number>(200);
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts');
            expect(res.requestApi.baseUrl).toEqual('https://jsonplaceholder');
            expect(res.requestApi.path).toEqual('.typicode.com/posts');
            expect(await res.response.json()).toEqual(res.responseBody);
        });
    });

    describe('Response body tests', () => {
        test('Only text on response body tests', async () => {
            expect.assertions(2);

            const res = await api.call(apiTypes.onlyTextResponse);

            expect(res.response.status).toEqual<number>(200);
            expect(await res.response.text()).toEqual(res.responseBody);
        });
    });

    describe('Extra params tests', () => {
        test('Request api extra params', async () => {
            expect.assertions(2);

            const res = await api.call(apiTypes.extraParamsResponse);

            expect(res.response.status).toEqual<number>(200);
            expect(res.requestApi.extraParams).toEqual({ firstParam: 'firstParam', secondParam: 2 });
        });
    });

    describe('Path query parameters encode option', () => {
        const createApi = (path: string) =>
            new APIEngine({
                baseUrl: 'https://jsonplaceholder.typicode.com',
                endpoints: { test: { path, request: { method: 'GET' }, retry: 0, retryCondition: [] } },
            });

        test('Default encoding when encode omitted', async () => {
            const api = createApi('/posts{query}');
            const res = await api.call('test', {
                pathQueryParameters: [{ name: 'query', value: '?a=1&b=2' }],
            });
            expect(res.response.url).toBe('https://jsonplaceholder.typicode.com/posts%3Fa%3D1%26b%3D2');
        });

        test('Explicit encode true encodes value', async () => {
            const api = createApi('/posts{query}');
            const res = await api.call('test', {
                pathQueryParameters: [{ name: 'query', value: '?a=1&b=2', encode: true }],
            });
            expect(res.response.url).toBe('https://jsonplaceholder.typicode.com/posts%3Fa%3D1%26b%3D2');
        });

        test('encode:false injects raw value', async () => {
            const api = createApi('/posts{query}');
            const res = await api.call('test', {
                pathQueryParameters: [
                    {
                        name: 'query',
                        value: '?errors=SENT&page=1&products_per_page=20',
                        encode: false,
                    },
                ],
            });
            expect(res.response.url).toBe(
                'https://jsonplaceholder.typicode.com/posts?errors=SENT&page=1&products_per_page=20'
            );
        });

        test('Placeholder with empty value removed and URL clean', async () => {
            const api = createApi('/posts?keyword={keyword}&page={page}');
            const res = await api.call('test', {
                pathQueryParameters: [
                    { name: 'keyword', value: '' },
                    { name: 'page', value: '1' },
                ],
            });
            expect(res.response.url).toBe('https://jsonplaceholder.typicode.com/posts?page=1');
        });

        test('Null parameter in middle removed and URL clean', async () => {
            const api = createApi('/posts?category={category}&keyword={keyword}&page={page}');
            const res = await api.call('test', {
                pathQueryParameters: [
                    { name: 'category', value: 'news' },
                    { name: 'keyword', value: null },
                    { name: 'page', value: '1' },
                ],
            });
            expect(res.response.url).toBe('https://jsonplaceholder.typicode.com/posts?category=news&page=1');
        });

        test('Mixed encode true and false', async () => {
            const api = createApi('/posts?keyword={keyword}{query}');
            const res = await api.call('test', {
                pathQueryParameters: [
                    { name: 'keyword', value: 'hello world' },
                    { name: 'query', value: '&errors=SENT&page=1', encode: false },
                ],
            });
            expect(res.response.url).toBe(
                'https://jsonplaceholder.typicode.com/posts?keyword=hello%20world&errors=SENT&page=1'
            );
        });

        test('Path already ends with ? and raw starts with ?', async () => {
            const api = createApi('/posts?{query}');
            const res = await api.call('test', {
                pathQueryParameters: [{ name: 'query', value: '?a=1&b=2', encode: false }],
            });
            expect(res.response.url).toBe('https://jsonplaceholder.typicode.com/posts?a=1&b=2');
        });

        test('Array value with encode false', async () => {
            const api = createApi('/posts?tags={tags}');
            const res = await api.call('test', {
                pathQueryParameters: [{ name: 'tags', value: ['a', 'b', 'c'], encode: false }],
            });
            expect(res.response.url).toBe('https://jsonplaceholder.typicode.com/posts?tags=a,b,c');
        });

        test('Parameter without placeholder is ignored', async () => {
            const api = createApi('/posts');
            const res = await api.call('test', {
                pathQueryParameters: [{ name: 'missing', value: '1' }],
            });
            expect(res.response.url).toBe('https://jsonplaceholder.typicode.com/posts');
        });
    });
});
