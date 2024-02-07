import { RequestInterceptor, ResponseInterceptor, Endpoint, CallResponse } from './types';

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
    return (response: CallResponse): Promise<object> => {
        return new Promise(async (resolve, reject) => {
            try {
                let finalInterceptorResponse: object = {};

                for (const method of methods) {
                    const interceptorResponse = await method(response);
                    finalInterceptorResponse = { ...finalInterceptorResponse, ...(interceptorResponse || {}) };
                }

                resolve(finalInterceptorResponse);
            } catch (error) {
                reject(error);
            }
        });
    };
};
