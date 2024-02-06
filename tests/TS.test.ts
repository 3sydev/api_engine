import { APIEngine, ApiParameters, CallResponse } from '../src/index';
import { ErrorStatus, Retries } from '../src/types';
import apiConstantsTs, { resetStatusCodeActionsExecutions, statusCodeActionsExecutions } from './mocks/mock_ts';
import apiConstantsTsGlobal, { resetStatusCodeActionsExecutionsGlobals, statusCodeActionsExecutionsGlobals } from './mocks/mock_ts_globals';
import apiConstantsTsGlobalNoParams from './mocks/mock_ts_globals_no_params';
import apiConstantsTsGlobalSomeParams from './mocks/mock_ts_globals_some_params';
import apiConstantsTsStackTrace from './mocks/mock_ts_stack_trace';
import apiConstantsTsInterceptors, { ResponseInterceptorData, ResponseInterceptorDataMixed, resetResponseInterceptorData, responseInterceptorData } from './mocks/mock_ts_interceptors';
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
            await expect(api.call(apiTypes.getResourcesInvalidUrl)).rejects.toStrictEqual(
                new FetchError('request to https://jsonplaceholder.typicode.comp/ failed, reason: getaddrinfo ENOTFOUND jsonplaceholder.typicode.comp', 'system')
            );
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
        beforeEach(resetStatusCodeActionsExecutionsGlobals);

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
            expect(res.requestApi.request?.headers).toMatchObject<HeaderInit>(apiConstantsTsGlobal.globalParams?.request?.headers!);
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

        test('Global status code action', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutionsGlobals).not.toEqual(expect.arrayContaining([{ statusCode: 404, testId: 'Action global' }]));

            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();

            const res = await api.call(apiTypes.getResourcesGlobalStatusCodeActions);

            expect(res.response.status).toEqual<number>(404);
            expect(statusCodeActionsExecutionsGlobals).toEqual([{ statusCode: 404, testId: 'Action global' }]);
        });

        test('Global error message', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutionsGlobals).not.toEqual(expect.arrayContaining([{ statusCode: 200, testId: 'Action message global' }]));

            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesGlobalErrorMessages);

            expect(res.response.status).toEqual<number>(200);
            expect(statusCodeActionsExecutionsGlobals).toEqual([{ statusCode: 200, testId: 'Action message global' }]);
        });

        test('Global ignored status code and error message', async () => {
            expect.assertions(2);
            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesGlobalIgnoredStatusCodeActionsAndErrorMessages);

            expect(res.response.status).toEqual<number>(200);
            expect(statusCodeActionsExecutionsGlobals).toEqual([]);
        });

        test('Global status code actions overridden from endpoint', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutionsGlobals).not.toEqual(expect.arrayContaining([{ statusCode: 404, testId: 'Action overridden' }]));

            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesGlobalOverrideStatusCodeActions);

            expect(res.response.status).toEqual<number>(404);
            expect(statusCodeActionsExecutionsGlobals).toEqual([{ statusCode: 404, testId: 'Action overridden' }]);
        });

        test('Global error messages overridden from endpoint', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutionsGlobals).not.toEqual(expect.arrayContaining([{ statusCode: 200, testId: 'Action message overridden' }]));

            const api = new APIEngine(apiConstantsTsGlobal);
            const apiTypes = api.getApiTypes();
            const res = await api.call(apiTypes.getResourcesGlobalOverrideErrorMessages);

            expect(res.response.status).toEqual<number>(200);
            expect(statusCodeActionsExecutionsGlobals).toEqual([{ statusCode: 200, testId: 'Action message overridden' }]);
        });
    });

    describe('Actions on status codes', () => {
        beforeEach(resetStatusCodeActionsExecutions);

        test('Action without retries', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 200, testId: 'Action without retries' }]));

            const res = await api.call(apiTypes.getResourcesActionsOnStatusCodes);

            expect(res.response.status).toEqual<number>(200);
            expect(statusCodeActionsExecutions).toEqual(expect.arrayContaining([{ statusCode: 200, testId: 'Action without retries' }]));
        });

        test('Action with retries', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 404, testId: 'Action with retries' }]));

            const res = await api.call(apiTypes.getResourcesActionsOnStatusCodesWithRetries);

            expect(res.response.status).toEqual<number>(404);
            expect(statusCodeActionsExecutions).toEqual([
                { statusCode: 404, testId: 'Action with retries' },
                { statusCode: 404, testId: 'Action with retries' },
                { statusCode: 404, testId: 'Action with retries' },
            ]);
        });

        test('Action with throw Error', async () => {
            expect.assertions(1);
            await expect(api.call(apiTypes.getResourcesActionsOnStatusCodesWithThrow)).rejects.toStrictEqual(new Error('Error on 200 status code action execution'));
        });

        test('Action only on retries', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 404, testId: 'Action only on retries' }]));

            const res = await api.call(apiTypes.getResourcesActionsOnStatusCodesOnlyOnRetries);

            expect(res.response.status).toEqual<number>(404);
            expect(statusCodeActionsExecutions).toEqual([
                { statusCode: 404, testId: 'Action only on retries' },
                { statusCode: 404, testId: 'Action only on retries' },
            ]);
        });

        test('Action with throw Error only on retries', async () => {
            expect.assertions(1);
            await expect(api.call(apiTypes.getResourcesActionsOnStatusCodesOnlyOnRetriesAndThrowError)).rejects.toStrictEqual(new Error('Error on 404 status code action execution'));
        });

        test('Action only on first call', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 404, testId: 'Action only on firstCall' }]));

            const res = await api.call(apiTypes.getResourcesActionsOnStatusCodesOnlyOnFirstCall);

            expect(res.response.status).toEqual<number>(404);
            expect(statusCodeActionsExecutions).toEqual([{ statusCode: 404, testId: 'Action only on firstCall' }]);
        });

        test('Action with throw Error only on first call', async () => {
            expect.assertions(1);
            await expect(api.call(apiTypes.getResourcesActionsOnStatusCodesOnlyOnFirstCallAndThrowError)).rejects.toStrictEqual(new Error('Error on 404 status code action execution'));
        });
    });

    describe('Error messages', () => {
        beforeEach(resetStatusCodeActionsExecutions);

        test('Error message without retries', async () => {
            expect.assertions(4);
            const res = await api.call(apiTypes.getResourcesWithErrorMessage);

            expect(res.response.status).toEqual<number>(404);
            expect(res.retries.quantity).toEqual<number>(0);
            expect(res.retries.conditions).toEqual<number[]>([]);
            expect(res.errorStatus).toEqual<ErrorStatus>({ isInError: true, errorCode: 'ERR', errorMessage: 'Error on GET' });
        });

        test('Error message with retries', async () => {
            expect.assertions(4);
            const res = await api.call(apiTypes.getResourcesWithErrorMessageAndRetries);

            expect(res.response.status).toEqual<number>(404);
            expect(res.retries.quantity).toEqual<number>(2);
            expect(res.retries.conditions).toEqual<number[]>([404, 404]);
            expect(res.errorStatus).toEqual<ErrorStatus>({ isInError: true, errorCode: 'ERR', errorMessage: 'Error on GET with retry' });
        });

        test('Error message not got', async () => {
            expect.assertions(4);
            const res = await api.call(apiTypes.getResourcesWithErrorMessageNotGot);

            expect(res.response.status).toEqual<number>(200);
            expect(res.retries.quantity).toEqual<number>(0);
            expect(res.retries.conditions).toEqual<number[]>([]);
            expect(res.errorStatus).toEqual<ErrorStatus>({ isInError: false, errorCode: '', errorMessage: '' });
        });

        test('Error message not got with retries', async () => {
            expect.assertions(4);
            const res = await api.call(apiTypes.getResourcesWithErrorMessageNotGotWithRetries);

            expect(res.response.status).toEqual<number>(404);
            expect(res.retries.quantity).toEqual<number>(2);
            expect(res.retries.conditions).toEqual<number[]>([404, 404]);
            expect(res.errorStatus).toEqual<ErrorStatus>({ isInError: false, errorCode: '', errorMessage: '' });
        });

        test('Error message action without retries', async () => {
            expect.assertions(6);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 200, testId: 'Error message action without retries' }]));

            const res = await api.call(apiTypes.getResourcesWithErrorMessageAction);

            expect(res.response.status).toEqual<number>(200);
            expect(res.retries.quantity).toEqual<number>(0);
            expect(res.retries.conditions).toEqual<number[]>([]);
            expect(res.errorStatus).toEqual<ErrorStatus>({ isInError: true, errorCode: 'SUCCESS', errorMessage: 'Call succeded' });
            expect(statusCodeActionsExecutions).toEqual([{ statusCode: 200, testId: 'Error message action without retries' }]);
        });

        test('Error message action with retries', async () => {
            expect.assertions(6);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 404, testId: 'Error message action with retries' }]));

            const res = await api.call(apiTypes.getResourcesWithErrorMessageActionAndRetries);

            expect(res.response.status).toEqual<number>(404);
            expect(res.retries.quantity).toEqual<number>(2);
            expect(res.retries.conditions).toEqual<number[]>([404, 404]);
            expect(res.errorStatus).toEqual<ErrorStatus>({ isInError: true, errorCode: 'ERR', errorMessage: 'Call failed' });
            expect(statusCodeActionsExecutions).toEqual([
                { statusCode: 404, testId: 'Error message action with retries' },
                { statusCode: 404, testId: 'Error message action with retries' },
            ]);
        });

        test('Error message action with throw Error without retries', async () => {
            expect.assertions(1);
            await expect(api.call(apiTypes.getResourcesWithErrorMessageActionAndThrowError)).rejects.toStrictEqual(
                new Error('Error executing errorMessage action: Error: Error on 404 error message action')
            );
        });

        test('Error message action with throw Error with retries', async () => {
            expect.assertions(1);
            await expect(api.call(apiTypes.getResourcesWithErrorMessageActionAndRetriesAndThrowError)).rejects.toStrictEqual(
                new Error('Error executing errorMessage action: Error: Error on 404 error message action')
            );
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
                expect(lastStackTraceLog.errorMessage).toStrictEqual(new TypeError('Request with GET/HEAD method cannot have body'));
                expect(lastStackTraceLog.extraProperties).toEqual({});
            }
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
                expect({ ...responseInterceptorData, responseBody: JSON.parse(responseInterceptorData.responseBody.toString()) }).toEqual<ResponseInterceptorDataMixed>({
                    statusCode: 200,
                    responseBody: JSON.parse(
                        '{"userId": 1,"id": 1,"title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body": "quia et suscipit\\nsuscipit recusandae consequuntur expedita et cum\\nreprehenderit molestiae ut ut quas totam\\nnostrum rerum est autem sunt rem eveniet architecto"}'
                    ),
                    retry: 0,
                });
                expect(error).toStrictEqual(new Error('Error on responseInterceptor'));
            }
        });
    });
});
