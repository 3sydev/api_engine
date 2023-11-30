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
        getResource: {
            path: '/posts/{id}',
            request: {
                method: 'GET',
            },
            retry: 0,
            retryCondition: [],
        },
    },
};

export default apiConstantsTs;
