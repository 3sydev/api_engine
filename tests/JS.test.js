import { APIEngine } from '../src/index';
import apiConstantsJs from './mocks/mock_js';
import apiConstantsJsGlobal from './mocks/mock_js_globals';
import apiConstantsJsGlobalNoParams from './mocks/mock_js_globals_no_params';
import apiConstantsJsGlobalSomeParams from './mocks/mock_js_globals_some_params';
import apiConstantsJsStackTrace from './mocks/mock_js_stack_trace';
import apiConstantsJsInterceptors, { responseInterceptorData, resetResponseInterceptorData } from './mocks/mock_js_interceptors';

const api = new APIEngine(apiConstantsJs);
const apiTypes = api.getApiTypes();

describe('JavaScript tests', () => {
    describe('Initialization tests', () => {
        test('Init without apiConstants', () => {
            expect(() => new APIEngine()).toThrow('Error on API constructor: apiConstants not defined.');
        });

        test('Init with apiConstants', () => {
            const api = new APIEngine(apiConstantsJs);
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
            expect(res.response.status).toEqual(200);
        });

        test('KO call', async () => {
            expect.assertions(1);
            const res = await api.call(apiTypes.getResourcesKO);
            expect(res.response.status).toEqual(404);
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
            const parameters = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };
            const res = await api.call(apiTypes.getResources, parameters);
            expect(res.response.status).toEqual(200);
        });

        test('Path parameter call KO', async () => {
            expect.assertions(1);
            const parameters = {
                pathQueryParameters: [{ name: 'id', value: 'sdvfevdc' }],
            };
            const res = await api.call(apiTypes.getResource, parameters);
            expect(res.response.status).toEqual(404);
        });

        test('Query parameter call OK', async () => {
            expect.assertions(1);
            const parameters = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };
            const res = await api.call(apiTypes.getUserResources, parameters);
            expect(res.response.status).toEqual(200);
        });

        test('Query parameter call KO', async () => {
            expect.assertions(1);
            const parameters = {
                pathQueryParameters: [{ name: 'sdcsdvsdv', value: 'sdvfevdc' }],
            };
            const res = await api.call(apiTypes.getUserResourcesKO, parameters);
            expect(res.response.status).toEqual(404);
        });

        test('Mist parameters call OK', async () => {
            expect.assertions(1);
            const parameters = {
                pathQueryParameters: [
                    { name: 'route', value: 'posts' },
                    { name: 'id', value: '1' },
                ],
            };
            const res = await api.call(apiTypes.getUserResourcesWithCustomRoute, parameters);
            expect(res.response.status).toEqual(200);
        });

        test('Mist parameters call KO', async () => {
            expect.assertions(1);
            const parameters = {
                pathQueryParameters: [
                    { name: 'route', value: 'erfcekrnc' },
                    { name: 'id', value: 'dfvnodiefc' },
                ],
            };
            const res = await api.call(apiTypes.getUserResourcesWithCustomRoute, parameters);
            expect(res.response.status).toEqual(404);
        });
    });

    describe('With headers and body REST API calls', () => {
        test('Static headers and body call OK', async () => {
            expect.assertions(1);
            const res = await api.call(apiTypes.createResource);
            expect(res.response.status).toEqual(201);
        });

        test('Static headers and body call KO', async () => {
            expect.assertions(1);
            const res = await api.call(apiTypes.createResourceKO);
            expect(res.response.status).toEqual(404);
        });

        test('Dinamic headers and body call OK', async () => {
            expect.assertions(1);
            const parameters = {
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
            expect(res.response.status).toEqual(201);
        });

        test('Dinamic headers and body call KO', async () => {
            expect.assertions(1);
            const parameters = {
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
            expect(res.response.status).toEqual(404);
        });
    });

    describe('With retries', () => {
        test('Retry OK', async () => {
            expect.assertions(2);
            const res = await api.call(apiTypes.getResourcesWithRetryOK);
            expect(res.response.status).toEqual(200);
            expect(res.retries).toEqual(expect.objectContaining({ quantity: 1, conditions: [200] }));
        });

        test('Retry KO', async () => {
            expect.assertions(2);
            const res = await api.call(apiTypes.getResourcesWithRetryKO);
            expect(res.response.status).toEqual(404);
            expect(res.retries).toEqual(expect.objectContaining({ quantity: 3, conditions: [404, 404, 404] }));
        });
    });

    describe('Missing parameters', () => {
        test('"retry" < 1', async () => {
            expect.assertions(1);
            await expect(api.call(apiTypes.getResourcesInvalidRetry)).rejects.toStrictEqual(new Error('"retry" parameter < 1'));
        });

        test('Empty "pathQueryParameters"', async () => {
            expect.assertions(1);
            const parameters = {
                headers: {
                    Accept: 'application/json',
                },
            };
            const res = await api.call(apiTypes.getResources, parameters);
            expect(res.response.status).toEqual(200);
        });
    });

    describe('Global parameters', () => {
        test('All parameters', async () => {
            expect.assertions(5);
            const api = new APIEngine(apiConstantsJsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual(404);
            expect(res.response.url).toEqual(apiConstantsJsGlobal.baseUrl + apiConstantsJsGlobal.endpoints.getResources.path);
            expect(res.requestApi.request?.method).toEqual(apiConstantsJsGlobal.endpoints.getResources.request?.method);
            expect(res.requestApi.retry).toEqual(apiConstantsJsGlobal.endpoints.getResources.retry);
            expect(res.requestApi.retryCondition).toEqual([404, 404, 404, 400]);
        });

        test('Some parameters', async () => {
            expect.assertions(5);
            const api = new APIEngine(apiConstantsJsGlobalSomeParams);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual(404);
            expect(res.response.url).toEqual(apiConstantsJsGlobalSomeParams.baseUrl + apiConstantsJsGlobalSomeParams.endpoints.getResources.path);
            expect(res.requestApi.request?.method).toEqual(apiConstantsJsGlobalSomeParams.endpoints.getResources.request?.method);
            expect(res.requestApi.retry).toEqual(apiConstantsJsGlobalSomeParams.endpoints.getResources.retry);
            expect(res.requestApi.retryCondition).toEqual([400]);
        });

        test('Empty global parameters', async () => {
            expect.assertions(5);
            const api = new APIEngine(apiConstantsJsGlobalNoParams);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual(404);
            expect(res.response.url).toEqual(apiConstantsJsGlobalNoParams.baseUrl + apiConstantsJsGlobalNoParams.endpoints.getResources.path);
            expect(res.requestApi.request?.method).toEqual(apiConstantsJsGlobalNoParams.endpoints.getResources.request?.method);
            expect(res.requestApi.retry).toEqual(apiConstantsJsGlobalNoParams.endpoints.getResources.retry);
            expect(res.requestApi.retryCondition).toEqual([400]);
        });

        test('Empty request parameter', async () => {
            expect.assertions(1);
            const api = new APIEngine(apiConstantsJsGlobalNoParams);
            const apiTypes = api.getApiTypes();

            await expect(api.call(apiTypes.getResourcesNoRequest)).rejects.toStrictEqual(new Error('Request parameter not defined'));
        });

        test('Defaults headers on global parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsJsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesForDefaultsHeaders);

            expect(res.response.status).toEqual(200);
            expect(res.response.url).toEqual(apiConstantsJsGlobal.baseUrl + apiConstantsJsGlobal.endpoints.getResourcesForDefaultsHeaders.path);
            expect(res.requestApi.request?.method).toEqual(apiConstantsJsGlobal.globalParams?.request?.method);
            expect(res.requestApi.request?.headers).toMatchObject(apiConstantsJsGlobal.globalParams?.request?.headers);
            expect(res.requestApi.retry).toEqual(apiConstantsJsGlobal.endpoints.getResourcesForDefaultsHeaders.retry);
            expect(res.requestApi.retryCondition).toEqual([404, 404, 404, 400]);
        });

        test('Ignore global parameter', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsJsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesIgnoreGlobalParams);

            expect(res.response.status).toEqual(200);
            expect(res.response.url).toEqual(apiConstantsJsGlobal.baseUrl + apiConstantsJsGlobal.endpoints.getResourcesIgnoreGlobalParams.path);
            expect(res.requestApi.request?.method).toEqual(apiConstantsJsGlobal.endpoints.getResourcesIgnoreGlobalParams.request?.method);
            expect(res.requestApi.request?.headers).toEqual(undefined);
            expect(res.requestApi.retry).toEqual(apiConstantsJsGlobal.endpoints.getResourcesIgnoreGlobalParams.retry);
            expect(res.requestApi.retryCondition).toEqual([]);
        });

        test('Mixed global parameters and endpoint parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsJsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesMixedGlobalParamsAndEndpointParams);

            expect(res.response.status).toEqual(200);
            expect(res.response.url).toEqual(apiConstantsJsGlobal.baseUrl + apiConstantsJsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.path);
            expect(res.requestApi.request?.method).toEqual(apiConstantsJsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.request?.method);
            expect(res.requestApi.request?.headers).toEqual({
                'Cache-Control': 'no-store',
                Expires: '0',
                'Custom-Header': 'customeHeader',
            });
            expect(res.requestApi.retry).toEqual(apiConstantsJsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.retry);
            expect(res.requestApi.retryCondition).toEqual([404, 404, 404]);
        });

        test('Mixed global parameters, endpoint and call method parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsJsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesMixedGlobalParamsAndEndpointParams, { headers: { Test: 'Test' } });

            expect(res.response.status).toEqual(200);
            expect(res.response.url).toEqual(apiConstantsJsGlobal.baseUrl + apiConstantsJsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.path);
            expect(res.requestApi.request?.method).toEqual(apiConstantsJsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.request?.method);
            expect(res.requestApi.request?.headers).toEqual({
                'Cache-Control': 'no-store',
                Expires: '0',
                'Custom-Header': 'customeHeader',
                Test: 'Test',
            });
            expect(res.requestApi.retry).toEqual(apiConstantsJsGlobal.endpoints.getResourcesMixedGlobalParamsAndEndpointParams.retry);
            expect(res.requestApi.retryCondition).toEqual([404, 404, 404]);
        });

        test('Mixed endpoint and call method parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsJsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesMixedEndpointParamsAndCallMethodParams, { headers: { Test: 'Test' } });

            expect(res.response.status).toEqual(200);
            expect(res.response.url).toEqual(apiConstantsJsGlobal.baseUrl + apiConstantsJsGlobal.endpoints.getResourcesMixedEndpointParamsAndCallMethodParams.path);
            expect(res.requestApi.request?.method).toEqual(apiConstantsJsGlobal.endpoints.getResourcesMixedEndpointParamsAndCallMethodParams.request?.method);
            expect(res.requestApi.request?.headers).toEqual({ 'Custom-Header': 'customeHeader', Test: 'Test' });
            expect(res.requestApi.retry).toEqual(apiConstantsJsGlobal.endpoints.getResourcesMixedEndpointParamsAndCallMethodParams.retry);
            expect(res.requestApi.retryCondition).toEqual([404, 404, 404]);
        });

        test('Mixed global and call method parameters', async () => {
            expect.assertions(6);
            const api = new APIEngine(apiConstantsJsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesMixedGlobalParamsAndCallMethodParams, { headers: { Test: 'Test' } });

            expect(res.response.status).toEqual(200);
            expect(res.response.url).toEqual(apiConstantsJsGlobal.baseUrl + apiConstantsJsGlobal.endpoints.getResourcesMixedGlobalParamsAndCallMethodParams.path);
            expect(res.requestApi.request?.method).toEqual(apiConstantsJsGlobal.endpoints.getResourcesMixedGlobalParamsAndCallMethodParams.request?.method);
            expect(res.requestApi.request?.headers).toEqual({ 'Cache-Control': 'no-store', Expires: '0', Test: 'Test' });
            expect(res.requestApi.retry).toEqual(apiConstantsJsGlobal.endpoints.getResourcesMixedGlobalParamsAndCallMethodParams.retry);
            expect(res.requestApi.retryCondition).toEqual([404, 404, 404]);
        });
    });

    describe('Stack Trace tests', () => {
        test('No extra params', async () => {
            expect.assertions(11);

            const api = new APIEngine(apiConstantsJsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual(200);
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

            const api = new APIEngine(apiConstantsJsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyGlobalExtraParams);

            expect(res.response.status).toEqual(200);
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

            const api = new APIEngine(apiConstantsJsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyEndpointExtraParams);

            expect(res.response.status).toEqual(200);
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

            const api = new APIEngine(apiConstantsJsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyGlobalAndEndpointExtraParams);

            expect(res.response.status).toEqual(200);
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

            const api = new APIEngine(apiConstantsJsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesRequestBody);

            expect(res.response.status).toEqual(201);
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

            const api = new APIEngine(apiConstantsJsStackTrace);
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
    });

    describe('Interceptors tests', () => {
        beforeEach(resetResponseInterceptorData);

        test('Only global interceptors', async () => {
            expect.assertions(4);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyGlobalInterceptors);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(responseInterceptorData).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('Only endpoint interceptors', async () => {
            expect.assertions(4);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesOnlyEndpointInterceptors);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(responseInterceptorData).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('Global and endpoint interceptors', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesGlobalAndEndpointInterceptors);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(1);
            expect(responseInterceptorData).toEqual({ statusCode: res.response.status, responseBody: res.responseBody, retry: res.requestApi.retry });
        });

        test('With throw error on responseInterceptor', async () => {
            expect.assertions(2);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();

            try {
                await api.call(apiTypes.getResourcesWithErrorInterceptors);
            } catch (error) {
                expect({ ...responseInterceptorData, responseBody: responseInterceptorData.responseBody }).toEqual({
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

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorResponse);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status });
        });

        test('With interceptorResponse Promise and no global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorResponseAndPromise);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status });
        });

        test('With interceptorResponse Promise reject', async () => {
            expect.assertions(1);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();

            try {
                await api.call(apiTypes.getResourcesWithInterceptorResponseAndPromiseReject);
            } catch (error) {
                expect(error).toStrictEqual(new Error('Reject Promise from interceptorResponse'));
            }
        });

        test('With interceptorResponse no Promise and global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorResponseAndGlobal);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody, extraParam: 'Extra from endpoint responseInterceptor' });
        });

        test('With interceptorResponse Promise and global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorResponseAndPromiseAndGlobal);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/1');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/1');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody, extraParam: 'Extra from endpoint responseInterceptor' });
        });

        test('With interceptorRequest no Promise and global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorRequestAndGlobal);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('With interceptorRequest Promise and global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorRequestAndPromiseAndGlobal);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('With interceptorRequest no Promise and no global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorRequest);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('With interceptorRequest Promise and no global', async () => {
            expect.assertions(5);

            const api = new APIEngine(apiConstantsJsInterceptors);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesWithInterceptorRequestAndPromise);

            expect(res.response.status).toEqual(200);
            expect(res.requestApi.path).toEqual('/posts/2');
            expect(res.response.url).toEqual('https://jsonplaceholder.typicode.com/posts/2');
            expect(res.requestApi.retry).toEqual(0);
            expect(res.interceptorResponse).toEqual({ statusCode: res.response.status, responseBody: res.responseBody });
        });

        test('With interceptorRequest Promise reject', async () => {
            expect.assertions(1);

            const api = new APIEngine(apiConstantsJsInterceptors);
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

            const api = new APIEngine(apiConstantsJsStackTrace);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResources);

            expect(res.response.status).toEqual(200);
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

            expect(res.response.status).toEqual(200);
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

            expect(res.response.status).toEqual(200);
            expect(await res.response.text()).toEqual(res.responseBody);
        });
    });
});
