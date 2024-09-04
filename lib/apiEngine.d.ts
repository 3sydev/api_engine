import { ApiConstants, ApiParameters, ApiTypes, CallResponseFinal, StackTrace, StackTraceCallback } from './types';
export declare class APIEngine {
    private apiConstants;
    private stackTraceLogCallback;
    private api;
    constructor(apiConstants: ApiConstants, stackTraceLogCallback?: StackTraceCallback);
    getApiTypes: () => ApiTypes;
    call: (type: string, parameters?: ApiParameters) => Promise<CallResponseFinal>;
    getStackTraceLog: () => StackTrace[];
}
