import { ApiConstants, ApiParameters, ApiTypes, CallResponseFinal, StackTrace, StackTraceCallback } from './types';
export default class API {
    private apiConstants;
    private apiTypes;
    private stackTraceLog;
    private stackTraceLogCallback;
    constructor(apiConstants: ApiConstants, stackTraceLogCallback?: StackTraceCallback);
    private generateApiBasedOnRequestInterceptor;
    private getApi;
    private generateStackTraceCallLog;
    private useFetch;
    getApiTypes: () => ApiTypes;
    getStackTraceLog: () => StackTrace[];
    call: (type: string, parameters?: ApiParameters) => Promise<CallResponseFinal>;
    private setQueryParameters;
    private generateUrl;
    private retryCondition;
    private manageRetry;
}
