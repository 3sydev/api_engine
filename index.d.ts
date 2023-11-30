import { ApiConstants, ApiParameters, ApiType, Endpoint, QueryParameters, RequestInitParams, UseFetch } from './src/types';

export declare namespace API {
    const apiConstants: ApiConstants;

    function call(type: ApiType, parameters: ApiParameters): Promise<object | undefined>;
}
