import API from './src/API';
import { ApiConstants, ApiParameters, ApiTypes, CallRespose } from './src/types';

export type ApiParametersType = ApiParameters;
export type ApiConstantsType = ApiConstants;

export default class APIInterface {
    apiConstants: ApiConstants;
    api: API;

    constructor(apiConstants: ApiConstants) {
        this.apiConstants = apiConstants;
        this.api = new API(this.apiConstants);
    }

    getApiTypes = (): ApiTypes => this.api.getApiTypes();

    call = (type: string, parameters?: ApiParameters): Promise<CallRespose> => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.api.call(type, parameters);
                resolve(res);
            } catch (error) {
                reject(error);
            }
        });
    };
}
