import { BodyInit } from 'node-fetch';
import { ApiConstants } from '../../src';

export type ResponseInterceptorData = { statusCode: number; responseBody: BodyInit };
export type ResponseInterceptorDataMixed = { statusCode: number; responseBody: BodyInit; retry: number };
export let responseInterceptorData: ResponseInterceptorData | ResponseInterceptorDataMixed = { statusCode: 0, responseBody: '' };
export const resetResponseInterceptorData = () => (responseInterceptorData = { statusCode: 0, responseBody: '' });

const apiConstantsTsInterceptors: ApiConstants = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    globalParams: {
        requestInterceptor: (endpoint) => {
            const newEndpoint = { ...endpoint, path: '/posts/1' };
            return newEndpoint;
        },
        responseInterceptor: (response) => {
            const newData = { statusCode: response.response.status, responseBody: response.responseBody };
            responseInterceptorData = newData;
            return newData;
        },
    },
    endpoints: {
        getResourcesOnlyGlobalInterceptors: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
        getResourcesOnlyEndpointInterceptors: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            ignoreGlobalParams: ['requestInterceptor', 'responseInterceptor'],
            requestInterceptor: (endpoint) => {
                const newEndpoint = { ...endpoint, path: '/posts/2' };
                return newEndpoint;
            },
            responseInterceptor: (response) => {
                responseInterceptorData = { statusCode: response.response.status, responseBody: response.responseBody };
                return;
            },
        },
        getResourcesGlobalAndEndpointInterceptors: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            requestInterceptor: (endpoint) => {
                const newEndpoint = { ...endpoint, retry: 1 };
                return newEndpoint;
            },
            responseInterceptor: (response) => {
                responseInterceptorData = { statusCode: response.response.status, responseBody: response.responseBody, retry: response.requestApi.retry };
                return;
            },
        },
        getResourcesWithErrorInterceptors: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            responseInterceptor: (response) => {
                responseInterceptorData = { statusCode: response.response.status, responseBody: response.responseBody, retry: response.requestApi.retry };
                throw new Error('Error on responseInterceptor');
            },
        },
        getResourcesWithInterceptorResponse: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            ignoreGlobalParams: ['responseInterceptor'],
            responseInterceptor: (response) => {
                return { statusCode: response.response.status };
            },
        },
        getResourcesWithInterceptorResponseAndPromise: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            ignoreGlobalParams: ['responseInterceptor'],
            responseInterceptor: (response) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({ statusCode: response.response.status });
                    }, 1000);
                });
            },
        },
        getResourcesWithInterceptorResponseAndPromiseReject: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            ignoreGlobalParams: ['responseInterceptor'],
            responseInterceptor: (response) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            throw new Error('Reject Promise from interceptorResponse');
                        } catch (error) {
                            reject(error);
                        }
                    }, 1000);
                });
            },
        },
        getResourcesWithInterceptorResponseAndGlobal: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            responseInterceptor: () => {
                return { extraParam: 'Extra from endpoint responseInterceptor' };
            },
        },
        getResourcesWithInterceptorResponseAndPromiseAndGlobal: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            responseInterceptor: () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({ extraParam: 'Extra from endpoint responseInterceptor' });
                    }, 1000);
                });
            },
        },
    },
};

export default apiConstantsTsInterceptors;
