import { ErrorMessage, StatusCodeAction, RequestInterceptor, ResponseInterceptor, Endpoint, CallResponse } from './types';

export const generateGlobalArrayWithOverrides = (globalArray: (StatusCodeAction | ErrorMessage)[], endpointArray: (StatusCodeAction | ErrorMessage)[]): (StatusCodeAction | ErrorMessage)[] => {
    const newGlobalArray: (StatusCodeAction | ErrorMessage)[] = globalArray.filter((global) => !endpointArray.some((endpoint) => endpoint.statusCode === global.statusCode));
    return [...newGlobalArray, ...endpointArray];
};

type MergeRequestInterceptorsMethods = (methods: RequestInterceptor[]) => RequestInterceptor;
type MergeResponseInterceptorsMethods = (methods: ResponseInterceptor[]) => ResponseInterceptor;

export const mergeRequestInterceptorsMethods: MergeRequestInterceptorsMethods = (methods) => {
    return (endpoint: Endpoint): Endpoint => {
        let finalEndpoint: Endpoint = endpoint;

        methods.forEach((method) => {
            const _endpoint = method(finalEndpoint);
            finalEndpoint = { ...finalEndpoint, ..._endpoint };
        });
        return finalEndpoint;
    };
};

export const mergeResponseInterceptorsMethods: MergeResponseInterceptorsMethods = (methods) => {
    return (response: CallResponse) => {
        methods.forEach((method) => {
            method(response);
        });
    };
};
