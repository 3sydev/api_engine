import { ApiConstants, ApiParameters, ApiTypes, CallResponse } from './types';
export default class API {
    private apiConstants;
    private apiTypes;
    constructor(apiConstants: ApiConstants);
    private getApi;
    private useFetch;
    getApiTypes: () => ApiTypes;
    call: (type: string, parameters?: ApiParameters) => Promise<CallResponse>;
    private setQueryParameters;
    private generateUrl;
    private generateRequest;
    private executeActionOnStatusCode;
    private retryCondition;
    private manageRetry;
    private generateErrorStatus;
}
