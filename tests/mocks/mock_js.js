const apiConstantsJs = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    endpoints: {
        getResources: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
        getResourcesKO: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
        getResourcesInvalidUrl: {
            path: 'p',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
        getResource: {
            path: '/posts/{id}',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
        getUserResources: {
            path: '/posts?userId={id}',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
        getUserResourcesKO: {
            path: '/poss?efce={id}',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
        getUserResourcesWithCustomRoute: {
            path: '/{route}?userId={id}',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
        createResource: {
            path: '/posts',
            request: {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    title: 'foo',
                    body: 'bar',
                    userId: 1,
                }),
            },
            retry: 0,
            retryCondition: [],
        },
        createResourceKO: {
            path: '/p',
            request: {
                method: 'POST',
                headers: {
                    'Content-sdcjndsc': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    title: 'foo',
                    body: 'bar',
                    userId: 1,
                }),
            },
            retry: 0,
            retryCondition: [],
        },
        createResourceWithDinamicHeaderAndBody: {
            path: '/posts',
            request: {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify({
                    body: 'bar',
                    userId: 1,
                }),
            },
            retry: 0,
            retryCondition: [],
        },
        getResourcesWithRetryOK: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: 3,
            retryCondition: [400, 404, 200],
        },
        getResourcesWithRetryKO: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 3,
            retryCondition: [400, 404],
        },
        getResourcesInvalidRetry: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            retry: -1,
            retryCondition: [400, 404, 200],
        },
        getResourcesOverwriteBaseUrl: {
            baseUrl: 'https://jsonplaceholder',
            path: '.typicode.com/posts',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
    },
};

export default apiConstantsJs;
