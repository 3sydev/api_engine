import { ApiConstants, ApiParameters, ApiTypes, CallResponseFinal, StackTrace } from './types';
export declare class APIEngine {
    private apiConstants;
    private api;
    constructor(apiConstants: ApiConstants);
    getApiTypes: () => ApiTypes;
    call: (type: string, parameters?: ApiParameters) => Promise<CallResponseFinal>;
    getStackTraceLog: () => StackTrace[];
}
