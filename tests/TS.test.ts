import API from '../index';
import { ApiParameters, CallRespose, Retries } from '../src/types';
import apiConstantsTs from './mocks/mock_ts';
import { FetchError } from 'node-fetch';

describe('TypeScript tests', () => {
    describe('Initialization tests', () => {
        test('Init with apiConstants', () => {
            const api = new API(apiConstantsTs);
            expect(api).toBeTruthy();
        });
    });

    describe('Simple REST API calls', () => {
        test('OK call', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();

            try {
                const res = await api.call(apiTypes.getResources);
                expect(res).toBeTruthy();
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('KO call', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();

            try {
                const res = await api.call(apiTypes.getResourcesKO);
                expect(res).toBeUndefined();
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 2xx: 404'));
            }
        });
    });

    describe('Fetch KO', () => {
        test('Not valid URL', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();

            try {
                const res = await api.call(apiTypes.getResourcesInvalidUrl);
                expect(res).toBeUndefined();
            } catch (error) {
                expect(error).toStrictEqual(new FetchError('request to https://jsonplaceholder.typicode.comp/ failed, reason: getaddrinfo ENOTFOUND jsonplaceholder.typicode.comp', 'system'));
            }
        });
    });

    describe('With parameters REST API calls', () => {
        test('Path parameter call OK', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };

            try {
                const res = await api.call(apiTypes.getResource, parameters);

                expect(res).toBeTruthy();
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('Path parameter call KO', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'id', value: 'sdvfevdc' }],
            };

            try {
                const res = await api.call(apiTypes.getResource, parameters);
                expect(res).toBeUndefined();
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 2xx: 404'));
            }
        });

        test('Query parameter call OK', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };

            try {
                const res = await api.call(apiTypes.getUserResources, parameters);

                expect(res).toBeTruthy();
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('Query parameter call KO', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();
            const parameters: ApiParameters = {
                pathQueryParameters: [{ name: 'sdcsdvsdv', value: 'sdvfevdc' }],
            };

            try {
                const res = await api.call(apiTypes.getUserResourcesKO, parameters);
                expect(res).toBeUndefined();
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 2xx: 404'));
            }
        });

        test('Mist parameters call OK', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();
            const parameters: ApiParameters = {
                pathQueryParameters: [
                    { name: 'route', value: 'posts' },
                    { name: 'id', value: '1' },
                ],
            };

            try {
                const res = await api.call(apiTypes.getUserResourcesWithCustomRoute, parameters);

                expect(res).toBeTruthy();
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('Mist parameters call KO', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();
            const parameters: ApiParameters = {
                pathQueryParameters: [
                    { name: 'route', value: 'erfcekrnc' },
                    { name: 'id', value: 'dfvnodiefc' },
                ],
            };

            try {
                const res = await api.call(apiTypes.getUserResourcesWithCustomRoute, parameters);
                expect(res).toBeUndefined();
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 2xx: 404'));
            }
        });
    });

    describe('With headers and body REST API calls', () => {
        test('Static headers and body call OK', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();

            try {
                const res = await api.call(apiTypes.createResource);

                expect(res).toBeTruthy();
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('Static headers and body call KO', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();

            try {
                const res = await api.call(apiTypes.createResourceKO);
                expect(res).toBeUndefined();
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 2xx: 404'));
            }
        });

        test('Dinamic headers and body call OK', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();
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

            try {
                const res = await api.call(apiTypes.createResourceWithDinamicHeaderAndBody, parameters);

                expect(res).toBeTruthy();
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('Dinamic headers and body call KO', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();
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

            try {
                const res = await api.call(apiTypes.createResourceKO, parameters);
                expect(res).toBeUndefined();
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 2xx: 404'));
            }
        });
    });

    describe('With retries', () => {
        test('Retry OK', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();

            try {
                const res = await api.call(apiTypes.getResourcesWithRetryOK);

                expect(res.retries).toEqual<CallRespose>(expect.objectContaining<Retries>({ quantity: 1, conditions: [200] }));
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });

        test('Retry KO', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();

            try {
                const res = await api.call(apiTypes.getResourcesWithRetryKO);

                expect(res.retries).toEqual<CallRespose>(expect.objectContaining<Retries>({ quantity: 3, conditions: [404, 404, 404] }));
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });
    });

    describe('Missing parameters', () => {
        test('"retry" < 0', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();

            try {
                const res = await api.call(apiTypes.getResourcesInvalidRetry);

                expect(res).toBeUndefined();
            } catch (error) {
                expect(error).toStrictEqual(new Error('"retry" parameter < 0'));
            }
        });

        test('Empty "pathQueryParameters"', async () => {
            const api = new API(apiConstantsTs);
            const apiTypes = api.getApiTypes();
            const parameters: ApiParameters = {
                headers: {
                    Accept: 'application/json',
                },
            };

            try {
                const res = await api.call(apiTypes.getResources, parameters);

                expect(res).toBeTruthy();
            } catch (error) {
                expect(error).toBeUndefined();
            }
        });
    });
});
