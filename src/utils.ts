import { ErrorMessage, StatusCodeAction } from './types';

export const generateGlobalArrayWithOverrides = (globalArray: (StatusCodeAction | ErrorMessage)[], endpointArray: (StatusCodeAction | ErrorMessage)[]): (StatusCodeAction | ErrorMessage)[] => {
    const newGlobalArray: (StatusCodeAction | ErrorMessage)[] = globalArray.filter((global) => !endpointArray.some((endpoint) => endpoint.statusCode === global.statusCode));
    return [...newGlobalArray, ...endpointArray];
};
