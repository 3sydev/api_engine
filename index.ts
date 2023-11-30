import API from './src/API';
import { ApiConstants, ApiParameters, ApiType } from './src/types';

export default class APIInterface {
    apiConstants: ApiConstants;
    api: API;

    constructor(apiConstants: ApiConstants) {
        this.apiConstants = apiConstants;
        this.api = new API(this.apiConstants);
    }

    call = (type: ApiType, parameters: ApiParameters) => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.api.call(type, parameters);
                resolve(res);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    };
}
