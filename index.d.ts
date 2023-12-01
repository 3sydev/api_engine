import API from './src/API';
import { ApiConstants, ApiParameters, ApiTypes, CallResponse } from './src/types';

export declare type ApiConstantsType = ApiConstants;
export declare type ApiParametersType = ApiParameters;
export declare type ApiCallResponseType = CallResponse;

declare class APIEngine {
    apiConstants: ApiConstants;
    api: API;

    constructor(apiConstants: ApiConstants);

    getApiTypes(): ApiTypes;
    call(type: string, parameters?: ApiParameters): Promise<CallResponse>;
}

export default APIEngine;
