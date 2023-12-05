import APIEngine from '../index';
import apiConstantsJs, { resetStatusCodeActionsExecutions, statusCodeActionsExecutions } from './mocks/mock_js';
import apiConstantsJsGlobal from './mocks/mock_js_globals';
import apiConstantsJsGlobalNoParams from './mocks/mock_js_globals_no_params';
import apiConstantsJsGlobalSomeParams from './mocks/mock_js_globals_some_params';
import { FetchError } from 'node-fetch';

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
            await expect(api.call(apiTypes.getResourcesInvalidUrl)).rejects.toStrictEqual(
                new FetchError('request to https://jsonplaceholder.typicode.comp/ failed, reason: getaddrinfo ENOTFOUND jsonplaceholder.typicode.comp', 'system')
            );
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
        test('"retry" < 0', async () => {
            expect.assertions(1);
            await expect(api.call(apiTypes.getResourcesInvalidRetry)).rejects.toStrictEqual(new Error('"retry" parameter < 0'));
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
    });

    describe('Actions on status codes', () => {
        beforeEach(resetStatusCodeActionsExecutions);

        test('Action without retries', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 200, testId: 'Action without retries' }]));

            const res = await api.call(apiTypes.getResourcesActionsOnStatusCodes);

            expect(res.response.status).toEqual(200);
            expect(statusCodeActionsExecutions).toEqual(expect.arrayContaining([{ statusCode: 200, testId: 'Action without retries' }]));
        });

        test('Action with retries', async () => {
            expect.assertions(3);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 404, testId: 'Action with retries' }]));

            const res = await api.call(apiTypes.getResourcesActionsOnStatusCodesWithRetries);

            expect(res.response.status).toEqual(404);
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

            expect(res.response.status).toEqual(404);
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

            expect(res.response.status).toEqual(404);
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

            expect(res.response.status).toEqual(404);
            expect(res.retries.quantity).toEqual(0);
            expect(res.retries.conditions).toEqual([]);
            expect(res.errorStatus).toEqual({ isInError: true, errorCode: 'ERR', errorMessage: 'Error on GET' });
        });

        test('Error message with retries', async () => {
            expect.assertions(4);
            const res = await api.call(apiTypes.getResourcesWithErrorMessageAndRetries);

            expect(res.response.status).toEqual(404);
            expect(res.retries.quantity).toEqual(2);
            expect(res.retries.conditions).toEqual([404, 404]);
            expect(res.errorStatus).toEqual({ isInError: true, errorCode: 'ERR', errorMessage: 'Error on GET with retry' });
        });

        test('Error message not got', async () => {
            expect.assertions(4);
            const res = await api.call(apiTypes.getResourcesWithErrorMessageNotGot);

            expect(res.response.status).toEqual(200);
            expect(res.retries.quantity).toEqual(0);
            expect(res.retries.conditions).toEqual([]);
            expect(res.errorStatus).toEqual({ isInError: false, errorCode: '', errorMessage: '' });
        });

        test('Error message not got with retries', async () => {
            expect.assertions(4);
            const res = await api.call(apiTypes.getResourcesWithErrorMessageNotGotWithRetries);

            expect(res.response.status).toEqual(404);
            expect(res.retries.quantity).toEqual(2);
            expect(res.retries.conditions).toEqual([404, 404]);
            expect(res.errorStatus).toEqual({ isInError: false, errorCode: '', errorMessage: '' });
        });

        test('Error message action without retries', async () => {
            expect.assertions(6);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 200, testId: 'Error message action without retries' }]));

            const res = await api.call(apiTypes.getResourcesWithErrorMessageAction);

            expect(res.response.status).toEqual(200);
            expect(res.retries.quantity).toEqual(0);
            expect(res.retries.conditions).toEqual([]);
            expect(res.errorStatus).toEqual({ isInError: true, errorCode: 'SUCCESS', errorMessage: 'Call succeded' });
            expect(statusCodeActionsExecutions).toEqual([{ statusCode: 200, testId: 'Error message action without retries' }]);
        });

        test('Error message action with retries', async () => {
            expect.assertions(6);

            expect(statusCodeActionsExecutions).not.toEqual(expect.arrayContaining([{ statusCode: 404, testId: 'Error message action with retries' }]));

            const res = await api.call(apiTypes.getResourcesWithErrorMessageActionAndRetries);

            expect(res.response.status).toEqual(404);
            expect(res.retries.quantity).toEqual(2);
            expect(res.retries.conditions).toEqual([404, 404]);
            expect(res.errorStatus).toEqual({ isInError: true, errorCode: 'ERR', errorMessage: 'Call failed' });
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
});
