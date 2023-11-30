import API from '../index';
import { ApiParameters } from '../src/types';
import apiConstantsTs from './mocks/mock_ts';

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
                await api.call(apiTypes.getResourcesKO);
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 200: 404'));
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
                await api.call(apiTypes.getResource, parameters);
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 200: 404'));
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
                pathQueryParameters: [{ name: 'id', value: 'sdvfevdc' }],
            };

            try {
                await api.call(apiTypes.getUserResources, parameters);
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 200: 404'));
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
                await api.call(apiTypes.getUserResourcesWithCustomRoute, parameters);
            } catch (error) {
                expect(error).toStrictEqual(new Error('Status code !== 200: 404'));
            }
        });
    });
});
