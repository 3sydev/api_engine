const apiConstantsJsGlobal = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    globalParams: {
        request: {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-store',
                Expires: '0',
            },
        },
        retry: 0,
        retryCondition: [404, 404, 404],
    },
    endpoints: {
        getResources: {
            path: '/p',
            request: {
                method: 'POST',
            },
            retry: 3,
            retryCondition: [400],
        },
        getResourcesForDefaultsHeaders: {
            path: '/posts',
            retry: 3,
            retryCondition: [400],
        },
        getResourcesIgnoreGlobalParams: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 3,
            ignoreGlobalParams: ['request', 'retry', 'retryCondition'],
        },
        getResourcesMixedGlobalParamsAndEndpointParams: {
            path: '/posts',
            request: {
                method: 'GET',
                headers: {
                    'Custom-Header': 'customeHeader',
                },
            },
        },
        getResourcesMixedEndpointParamsAndCallMethodParams: {
            path: '/posts',
            request: {
                method: 'GET',
                headers: {
                    'Custom-Header': 'customeHeader',
                },
            },
            ignoreGlobalParams: ['request'],
        },
        getResourcesMixedGlobalParamsAndCallMethodParams: {
            path: '/posts',
            request: {
                method: 'GET',
            },
        },
    },
};

export default apiConstantsJsGlobal;
