import { ApiConstants, ApiParameters, ApiTypes } from './src/types';

declare namespace API {
    const apiConstants: ApiConstants;

    function getApiTypes(): ApiTypes;

    function call(type: ApiTypes, parameters?: ApiParameters): Promise<object | undefined>;
}

export default API;
