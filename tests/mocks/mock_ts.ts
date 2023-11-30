import { ApiConstantsType } from '../..';

const apiConstantsTs: ApiConstantsType = {
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
        getUserResourcesWithCustomRoute: {
            path: '/{route}?userId={id}',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
    },
};

export default apiConstantsTs;
