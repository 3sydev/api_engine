import { ApiConstants, ApiParameters, ApiTypes, CallResponseFinal, StackTrace } from './types';
export default class API {
    private apiConstants;
    private apiTypes;
    private stackTraceLog;
    constructor(apiConstants: ApiConstants);
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
