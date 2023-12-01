import { ApiConstants, ApiParameters, ApiTypes, CallRespose } from './src/types';

declare namespace API {
    const apiConstants: ApiConstants;

    function getApiTypes(): ApiTypes;

    function call(type: string, parameters?: ApiParameters): Promise<CallRespose>;
}

export default API;
