import { ApiConstants, ApiParameters, ApiType } from './src/types';

declare namespace API {
    const apiConstants: ApiConstants;

    function call(type: ApiType, parameters: ApiParameters): Promise<object | undefined>;
}

export default API;
