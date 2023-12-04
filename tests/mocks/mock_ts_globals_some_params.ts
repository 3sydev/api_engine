import { ApiConstantsType } from '../../index';

const apiConstantsTsGlobalSomeParams: ApiConstantsType = {
    baseUrl: 'https://jsonplaceholder.typicode.com',
    globalParams: {
        retry: 5,
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

export default apiConstantsTsGlobalSomeParams;
