import { ApiConstants, ApiParameters, ApiTypes, CallResponse } from './types';
export declare class APIEngine {
    private apiConstants;
    private api;
    constructor(apiConstants: ApiConstants);
    getApiTypes: () => ApiTypes;
    call: (type: string, parameters?: ApiParameters) => Promise<CallResponse>;
}
