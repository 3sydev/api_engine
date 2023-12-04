import { ApiConstantsType } from '../../index';

const apiConstantsTsGlobal: ApiConstantsType = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    globalParams: {
        request: {
            method: 'GET',
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
    },
};

export default apiConstantsTsGlobal;
