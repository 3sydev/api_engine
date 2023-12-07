import { ApiConstants } from '../../src';

export let statusCodeActionsExecutionsGlobals: { statusCode: number; testId: string }[] = [];

export const resetStatusCodeActionsExecutionsGlobals = () => (statusCodeActionsExecutionsGlobals = []);

const apiConstantsTsGlobal: ApiConstants = {
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
        statusCodesActions: [
            {
                statusCode: 404,
                action: () => statusCodeActionsExecutionsGlobals.push({ statusCode: 404, testId: 'Action global' }),
            },
        ],
        errorMessages: [
            {
                statusCode: 200,
                errorCode: 'SUCCESS',
                errorMessage: 'Call succeded',
                action: () => statusCodeActionsExecutionsGlobals.push({ statusCode: 200, testId: 'Action message global' }),
            },
        ],
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
        getResourcesGlobalStatusCodeActions: {
            path: '/p',
            request: {
                method: 'GET',
            },
            ignoreGlobalParams: ['retry', 'retryCondition'],
        },
        getResourcesGlobalErrorMessages: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            ignoreGlobalParams: ['retry', 'retryCondition'],
        },
        getResourcesGlobalIgnoredStatusCodeActionsAndErrorMessages: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            ignoreGlobalParams: ['retry', 'retryCondition', 'statusCodesActions', 'errorMessages'],
        },
        getResourcesGlobalOverrideStatusCodeActions: {
            path: '/p',
            request: {
                method: 'GET',
            },
            ignoreGlobalParams: ['retry', 'retryCondition'],
            statusCodesActions: [
                {
                    statusCode: 404,
                    action: () => statusCodeActionsExecutionsGlobals.push({ statusCode: 404, testId: 'Action overridden' }),
                },
            ],
        },
        getResourcesGlobalOverrideErrorMessages: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            ignoreGlobalParams: ['retry', 'retryCondition'],
            errorMessages: [
                {
                    statusCode: 200,
                    errorCode: 'SUCCESS',
                    errorMessage: 'Call succeded',
                    action: () => statusCodeActionsExecutionsGlobals.push({ statusCode: 200, testId: 'Action message overridden' }),
                },
            ],
        },
    },
};

export default apiConstantsTsGlobal;
