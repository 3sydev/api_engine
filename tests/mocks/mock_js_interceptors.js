export let responseInterceptorData = { statusCode: 0, responseBody: '' };
export const resetResponseInterceptorData = () => (responseInterceptorData = { statusCode: 0, responseBody: '' });

const apiConstantsJsInterceptors = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    globalParams: {
        requestInterceptor: (endpoint) => {
            const newEndpoint = { ...endpoint, path: '/posts/1' };
            return newEndpoint;
        },
        responseInterceptor: (response) => {
            responseInterceptorData = { statusCode: response.response.status, responseBody: response.responseBody };
            return;
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
    },
};

export default apiConstantsJsInterceptors;
