const apiConstantsJsGlobalNoParams = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    endpoints: {
        getResources: {
            path: '/p',
            request: {
                method: 'POST',
            },
            retry: 3,
            retryCondition: [400],
        },
        getResourcesNoRequest: {
            path: '/p',
            retry: 3,
            retryCondition: [400],
        },
    },
};

export default apiConstantsJsGlobalNoParams;
