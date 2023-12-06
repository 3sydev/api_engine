import API from './API';
import { ApiConstants, ApiParameters, ApiTypes, CallResponse } from './types';

export class APIEngine {
    private apiConstants: ApiConstants;
    private api: API;

    constructor(apiConstants: ApiConstants) {
        this.apiConstants = apiConstants;
        this.api = new API(this.apiConstants);
    }

    getApiTypes = (): ApiTypes => this.api.getApiTypes();
    call = (type: string, parameters?: ApiParameters): Promise<CallResponse> => {
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
