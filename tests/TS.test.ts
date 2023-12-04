import APIEngine, { ApiParametersType, ApiCallResponseType } from '../index';
import { Retries } from '../src/types';
import apiConstantsTs from './mocks/mock_ts';
import { FetchError } from 'node-fetch';

const api = new APIEngine(apiConstantsTs);
const apiTypes = api.getApiTypes();

describe('TypeScript tests', () => {
    describe('Initialization tests', () => {
        test('Init with apiConstants', () => {
            const api = new APIEngine(apiConstantsTs);
            expect(api).toBeTruthy();
        });
    });

    describe('Simple REST API calls', () => {
        test('OK call', async () => {
            await expect(api.call(apiTypes.getResources)).resolves.toBeTruthy();
        });

        test('KO call', async () => {
            await expect(api.call(apiTypes.getResourcesKO)).rejects.toStrictEqual(new Error('Status code !== 2xx: 404'));
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
            const parameters: ApiParametersType = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };
            await expect(api.call(apiTypes.getResources, parameters)).resolves.toBeTruthy();
        });

        test('Path parameter call KO', async () => {
            const parameters: ApiParametersType = {
                pathQueryParameters: [{ name: 'id', value: 'sdvfevdc' }],
            };
            await expect(api.call(apiTypes.getResource, parameters)).rejects.toStrictEqual(new Error('Status code !== 2xx: 404'));
        });

        test('Query parameter call OK', async () => {
            const parameters: ApiParametersType = {
                pathQueryParameters: [{ name: 'id', value: '1' }],
            };
            await expect(api.call(apiTypes.getUserResources, parameters)).resolves.toBeTruthy();
        });

        test('Query parameter call KO', async () => {
            const parameters: ApiParametersType = {
                pathQueryParameters: [{ name: 'sdcsdvsdv', value: 'sdvfevdc' }],
            };
            await expect(api.call(apiTypes.getUserResourcesKO, parameters)).rejects.toStrictEqual(new Error('Status code !== 2xx: 404'));
        });

        test('Mist parameters call OK', async () => {
            const parameters: ApiParametersType = {
                pathQueryParameters: [
                    { name: 'route', value: 'posts' },
                    { name: 'id', value: '1' },
                ],
            };
            await expect(api.call(apiTypes.getUserResourcesWithCustomRoute, parameters)).resolves.toBeTruthy();
        });

        test('Mist parameters call KO', async () => {
            const parameters: ApiParametersType = {
                pathQueryParameters: [
                    { name: 'route', value: 'erfcekrnc' },
                    { name: 'id', value: 'dfvnodiefc' },
                ],
            };
            await expect(api.call(apiTypes.getUserResourcesWithCustomRoute, parameters)).rejects.toStrictEqual(new Error('Status code !== 2xx: 404'));
        });
    });

    describe('With headers and body REST API calls', () => {
        test('Static headers and body call OK', async () => {
            await expect(api.call(apiTypes.createResource)).resolves.toBeTruthy();
        });

        test('Static headers and body call KO', async () => {
            await expect(api.call(apiTypes.createResourceKO)).rejects.toStrictEqual(new Error('Status code !== 2xx: 404'));
        });

        test('Dinamic headers and body call OK', async () => {
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
            await expect(api.call(apiTypes.createResourceWithDinamicHeaderAndBody, parameters)).resolves.toBeTruthy();
        });

        test('Dinamic headers and body call KO', async () => {
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
            await expect(api.call(apiTypes.createResourceKO, parameters)).rejects.toStrictEqual(new Error('Status code !== 2xx: 404'));
        });
    });

    describe('With retries', () => {
        test('Retry OK', async () => {
            expect.assertions(1);
            const res = await api.call(apiTypes.getResourcesWithRetryOK);
            expect(res.retries).toEqual<ApiCallResponseType>(expect.objectContaining<Retries>({ quantity: 1, conditions: [200] }));
        });

        test('Retry KO', async () => {
            expect.assertions(1);
            const res = await api.call(apiTypes.getResourcesWithRetryKO);
            expect(res.retries).toEqual<ApiCallResponseType>(expect.objectContaining<Retries>({ quantity: 3, conditions: [404, 404, 404] }));
        });
    });

    describe('Missing parameters', () => {
        test('"retry" < 0', async () => {
            await expect(api.call(apiTypes.getResourcesInvalidRetry)).rejects.toStrictEqual(new Error('"retry" parameter < 0'));
        });

        test('Empty "pathQueryParameters"', async () => {
            const parameters: ApiParametersType = {
                headers: {
                    Accept: 'application/json',
                },
            };
            await expect(api.call(apiTypes.getResources, parameters)).resolves.toBeTruthy();
        });
    });
});
