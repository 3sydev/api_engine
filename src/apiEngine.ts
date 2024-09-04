import API from './API';
import { ApiConstants, ApiParameters, ApiTypes, CallResponseFinal, StackTrace, StackTraceCallback } from './types';

export class APIEngine {
    private apiConstants: ApiConstants;
    private stackTraceLogCallback: StackTraceCallback | undefined;
    private api: API;

    constructor(apiConstants: ApiConstants, stackTraceLogCallback?: StackTraceCallback) {
        this.apiConstants = apiConstants;
        this.stackTraceLogCallback = stackTraceLogCallback;
        this.api = new API(this.apiConstants, this.stackTraceLogCallback);
    }

    getApiTypes = (): ApiTypes => this.api.getApiTypes();
    call = (type: string, parameters?: ApiParameters): Promise<CallResponseFinal> => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await this.api.call(type, parameters);
                resolve(res);
            } catch (error) {
                reject(error);
            }
        });
    };
    getStackTraceLog = (): StackTrace[] => this.api.getStackTraceLog();
}
