const apiConstantsJsStackTrace = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    globalParams: {
        stackTraceLogExtraParams: {
            text: 'Text',
            number: 1,
        },
    },
    endpoints: {
        getResources: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            ignoreGlobalParams: ['stackTraceLogExtraParams'],
        },
        getResourcesOnlyGlobalExtraParams: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
        getResourcesOnlyEndpointExtraParams: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            ignoreGlobalParams: ['stackTraceLogExtraParams'],
            stackTraceLogExtraParams: {
                text1: 'Text1',
                number: 2,
            },
        },
        getResourcesOnlyGlobalAndEndpointExtraParams: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
            stackTraceLogExtraParams: {
                text1: 'Text1',
                number1: 2,
            },
        },
        getResourcesRequestBody: {
            path: '/posts',
            request: {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    test: 'Test',
                }),
            },
            retry: 0,
            retryCondition: [],
            ignoreGlobalParams: ['stackTraceLogExtraParams'],
        },
        getResourcesError: {
            path: '/posts',
            request: {
                method: 'GET',
                body: JSON.stringify({
                    test: 'Test',
                }),
            },
            retry: 0,
            retryCondition: [],
            ignoreGlobalParams: ['stackTraceLogExtraParams'],
        },
    },
};

export default apiConstantsJsStackTrace;
