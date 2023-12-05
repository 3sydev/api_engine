export let statusCodeActionsExecutions = [];

export const resetStatusCodeActionsExecutions = () => (statusCodeActionsExecutions = []);

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
        getResourcesActionsOnStatusCodes: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            statusCodesActions: [{ statusCode: 200, action: () => statusCodeActionsExecutions.push({ statusCode: 200, testId: 'Action without retries' }) }],
        },
        getResourcesActionsOnStatusCodesWithRetries: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 2,
            retryCondition: [404],
            statusCodesActions: [{ statusCode: 404, action: () => statusCodeActionsExecutions.push({ statusCode: 404, testId: 'Action with retries' }) }],
        },
        getResourcesActionsOnStatusCodesWithThrow: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            statusCodesActions: [
                {
                    statusCode: 200,
                    action: () => {
                        throw new Error('Error on 200 status code action execution');
                    },
                },
            ],
        },
        getResourcesActionsOnStatusCodesOnlyOnRetries: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 2,
            retryCondition: [404],
            statusCodesActions: [
                {
                    statusCode: 404,
                    action: () => statusCodeActionsExecutions.push({ statusCode: 404, testId: 'Action only on retries' }),
                    executeOnlyOn: 'retry',
                },
            ],
        },
        getResourcesActionsOnStatusCodesOnlyOnRetriesAndThrowError: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 2,
            retryCondition: [404],
            statusCodesActions: [
                {
                    statusCode: 404,
                    action: () => {
                        throw new Error('Error on 404 status code action execution');
                    },
                    executeOnlyOn: 'retry',
                },
            ],
        },
        getResourcesActionsOnStatusCodesOnlyOnFirstCall: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 2,
            retryCondition: [404],
            statusCodesActions: [
                {
                    statusCode: 404,
                    action: () => statusCodeActionsExecutions.push({ statusCode: 404, testId: 'Action only on firstCall' }),
                    executeOnlyOn: 'firstCall',
                },
            ],
        },
        getResourcesActionsOnStatusCodesOnlyOnFirstCallAndThrowError: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 2,
            retryCondition: [404],
            statusCodesActions: [
                {
                    statusCode: 404,
                    action: () => {
                        throw new Error('Error on 404 status code action execution');
                    },
                    executeOnlyOn: 'firstCall',
                },
            ],
        },
        getResourcesWithErrorMessage: {
            path: '/p',
            request: {
                method: 'GET',
            },
            errorMessages: [{ statusCode: 404, errorCode: 'ERR', errorMessage: 'Error on GET' }],
        },
        getResourcesWithErrorMessageAndRetries: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 2,
            retryCondition: [404],
            errorMessages: [{ statusCode: 404, errorCode: 'ERR', errorMessage: 'Error on GET with retry' }],
        },
        getResourcesWithErrorMessageNotGot: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            errorMessages: [{ statusCode: 404, errorCode: 'ERR', errorMessage: 'Error on GET' }],
        },
        getResourcesWithErrorMessageNotGotWithRetries: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 2,
            retryCondition: [404],
            errorMessages: [{ statusCode: 400, errorCode: 'ERR', errorMessage: 'Error on GET' }],
        },
        getResourcesWithErrorMessageAction: {
            path: '/posts',
            request: {
                method: 'GET',
            },
            errorMessages: [
                {
                    statusCode: 200,
                    errorCode: 'SUCCESS',
                    errorMessage: 'Call succeded',
                    action: () => statusCodeActionsExecutions.push({ statusCode: 200, testId: 'Error message action without retries' }),
                },
            ],
        },
        getResourcesWithErrorMessageActionAndRetries: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 2,
            retryCondition: [404],
            errorMessages: [
                {
                    statusCode: 404,
                    errorCode: 'ERR',
                    errorMessage: 'Call failed',
                    action: () => statusCodeActionsExecutions.push({ statusCode: 404, testId: 'Error message action with retries' }),
                },
            ],
        },
        getResourcesWithErrorMessageActionAndThrowError: {
            path: '/p',
            request: {
                method: 'GET',
            },
            errorMessages: [
                {
                    statusCode: 404,
                    errorCode: 'ERR',
                    errorMessage: 'Call failed',
                    action: () => {
                        throw new Error('Error on 404 error message action');
                    },
                },
            ],
        },
        getResourcesWithErrorMessageActionAndRetriesAndThrowError: {
            path: '/p',
            request: {
                method: 'GET',
            },
            retry: 2,
            retryCondition: [404],
            errorMessages: [
                {
                    statusCode: 404,
                    errorCode: 'ERR',
                    errorMessage: 'Call failed',
                    action: () => {
                        throw new Error('Error on 404 error message action');
                    },
                },
            ],
        },
    },
};

export default apiConstantsJs;
