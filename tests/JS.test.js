import API from '../index';
import apiConstantsJs from './mocks/mock_js';

describe('JavaScript tests', () => {
    describe('Initialization tests', () => {
        test('Init without apiConstants', () => {
            expect(() => new API()).toThrow('Error on API constructor: apiConstants not defined.');
        });

        test('Init with apiConstants', () => {
            const api = new API(apiConstantsJs);
            expect(api).toBeTruthy();
        });
    });
});
