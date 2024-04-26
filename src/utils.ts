import { RequestInterceptor, ResponseInterceptor, Endpoint, CallResponse } from './types';

type MergeRequestInterceptorsMethods = (methods: RequestInterceptor[]) => RequestInterceptor;
type MergeResponseInterceptorsMethods = (methods: ResponseInterceptor[]) => ResponseInterceptor;

export const mergeRequestInterceptorsMethods: MergeRequestInterceptorsMethods = (methods) => {
    return (endpoint: Endpoint): Promise<Endpoint> => {
        return new Promise(async (resolve, reject) => {
            try {
                let finalEndpoint: Endpoint = endpoint;

                for (const method of methods) {
                    const _endpoint = await method(finalEndpoint);
                    finalEndpoint = { ...finalEndpoint, ..._endpoint };
                }

                resolve(finalEndpoint);
            } catch (error) {
                reject(error);
            }
        });
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

export const secureJsonParse = (value: string): BodyInit => {
    try {
        const parsedValue = JSON.parse(value);
        return parsedValue;
    } catch (e) {
        return value;
    }
};
