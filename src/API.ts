import {
    ApiConstants,
    ApiConstantsInternal,
    ApiParameters,
    ApiParametersInternal,
    ApiTypes,
    CallResponse,
    CallResponseFinal,
    Endpoint,
    EndpointGlobalInternal,
    EndpointInternal,
    IgnoreGlobalParam,
    PathQueryParameters,
    StackTrace,
    UseFetchResponse,
} from './types';
import { mergeRequestInterceptorsMethods, mergeResponseInterceptorsMethods, secureJsonParse } from './utils';
import { merge } from 'lodash';

const defaultRequestApi: EndpointInternal = {
    baseUrl: '',
    path: '',
    request: {},
    retry: 0,
    retryCondition: [],
    ignoreGlobalParams: [],
    stackTraceLogExtraParams: {},
    requestInterceptor: (endpoint: Endpoint) => endpoint,
    responseInterceptor: () => {},
};
const defaultResponse: CallResponse = {
    requestApi: defaultRequestApi,
    response: {} as Response,
    responseBody: '',
    retries: { quantity: 0, conditions: [] },
};
export default class API {
    private apiConstants: ApiConstantsInternal;
    private apiTypes: ApiTypes;
    private stackTraceLog: StackTrace[] = [];

    constructor(apiConstants: ApiConstants) {
        //throw Error if apiConstants is not defined
        if (!apiConstants) throw new Error('Error on API constructor: apiConstants not defined.');
        //remap endpoints as EndpointInternal type
        Object.keys(apiConstants.endpoints).forEach((key) => {
            const endpoints = apiConstants.endpoints;
            const endpoint = apiConstants.endpoints[key];
            endpoints[key] = {
                baseUrl: endpoint.baseUrl || apiConstants.baseUrl,
                path: endpoint.path,
                request: endpoint.request || {},
                retry: endpoint.retry || 0,
                retryCondition: endpoint.retryCondition || [],
                ignoreGlobalParams: endpoint.ignoreGlobalParams || [],
                stackTraceLogExtraParams: endpoint.stackTraceLogExtraParams || {},
                requestInterceptor: endpoint.requestInterceptor || ((endpoint: Endpoint) => endpoint),
                responseInterceptor: endpoint.responseInterceptor || (() => {}),
            } as EndpointInternal;
        });
        //remap globalParams as EndpointGlobalInternal type
        const internalGlobalParams: EndpointGlobalInternal = {
            request: apiConstants.globalParams?.request || {},
            retry: apiConstants.globalParams?.retry || 0,
            retryCondition: apiConstants.globalParams?.retryCondition || [],
            stackTraceLogExtraParams: apiConstants.globalParams?.stackTraceLogExtraParams || {},
            requestInterceptor: apiConstants.globalParams?.requestInterceptor || ((endpoint: Endpoint) => endpoint),
            responseInterceptor: apiConstants.globalParams?.responseInterceptor || (() => {}),
        };
        //initialize apiConstants as ApiConstantsInternal type
        this.apiConstants = { ...(apiConstants as ApiConstantsInternal), globalParams: internalGlobalParams };
        //initialize apiTypes to return array of strings of all endpoints object properties
        this.apiTypes = Object.keys(this.apiConstants.endpoints).reduce((o, key) => ({ ...o, [key]: key }), {});
    }

    //generate new api based on requestInterceptor
    private generateApiBasedOnRequestInterceptor = (api: EndpointInternal): Promise<EndpointInternal> => {
        return new Promise(async (resolve, reject) => {
            try {
                const globals = this.apiConstants.globalParams;
                const ignoreGlobalParams: IgnoreGlobalParam[] = api.ignoreGlobalParams;

                const newApi = {
                    ...api,
                    ...(ignoreGlobalParams.includes('requestInterceptor')
                        ? await api.requestInterceptor(api)
                        : await mergeRequestInterceptorsMethods([globals.requestInterceptor, api.requestInterceptor])(api)),
                };

                resolve(newApi);
            } catch (error) {
                reject(error);
            }
        });
    };

    //returns endpoint from property string as EndpointInternal type
    private getApi = (type: string, parameters: ApiParametersInternal): Promise<EndpointInternal> => {
        return new Promise(async (resolve, reject) => {
            try {
                const apis = this.apiConstants.endpoints;
                const globals = this.apiConstants.globalParams;

                const _api = apis[type];

                if (!_api) throw new Error('Api type not defined');

                //overwrite api with requestInterceptor
                const api = await this.generateApiBasedOnRequestInterceptor(_api);

                if (Object.keys(api.request).length === 0 && Object.keys(globals.request).length === 0) throw new Error('Request parameter not defined');

                const ignoreGlobalParams: IgnoreGlobalParam[] = api.ignoreGlobalParams;

                const parametersRequest = {
                    headers: JSON.stringify(parameters.headers) === '{}' ? undefined : parameters.headers,
                    body: JSON.stringify(parameters.body) === '{}' ? undefined : parameters.body,
                };

                const result: EndpointInternal = {
                    baseUrl: api.baseUrl,
                    path: api.path,
                    request: ignoreGlobalParams.includes('request') ? merge({}, api.request, parametersRequest) : merge({}, globals.request, api.request, parametersRequest),
                    retry: ignoreGlobalParams.includes('retry') ? api.retry : api.retry || globals.retry || 0,
                    retryCondition: ignoreGlobalParams.includes('retryCondition') ? api.retryCondition : [...globals.retryCondition, ...api.retryCondition],
                    ignoreGlobalParams: ignoreGlobalParams,
                    stackTraceLogExtraParams: ignoreGlobalParams.includes('stackTraceLogExtraParams')
                        ? api.stackTraceLogExtraParams
                        : merge({}, globals.stackTraceLogExtraParams, api.stackTraceLogExtraParams),
                    requestInterceptor: ignoreGlobalParams.includes('requestInterceptor')
                        ? api.requestInterceptor
                        : mergeRequestInterceptorsMethods([globals.requestInterceptor, api.requestInterceptor]),
                    responseInterceptor: ignoreGlobalParams.includes('responseInterceptor')
                        ? api.responseInterceptor
                        : mergeResponseInterceptorsMethods([globals.responseInterceptor, api.responseInterceptor]),
                };

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    };

    //generate stack trace call log
    private generateStackTraceCallLog = (
        requestUrl: string,
        requestInit: RequestInit,
        startTimestamp: string,
        response: Response,
        responseBody: BodyInit,
        errorMessage: unknown,
        stackTraceLogExtraParams: object
    ): StackTrace => {
        const stackTrace: StackTrace = {
            startTimestamp,
            endTimestamp: new Date().toISOString(),
            requestUrl,
            requestHeaders: requestInit.headers || {},
            responseHeaders: response.headers,
            requestBody: requestInit.body || '',
            responseBody: responseBody || '',
            responseStatusCode: response.status,
            errorMessage,
            extraProperties: stackTraceLogExtraParams,
        };
        return stackTrace;
    };

    //Execute fetch method and returns Promise as Fetch Respose type
    private useFetch = (requestUrl: string, requestApi: EndpointInternal): Promise<UseFetchResponse> => {
        return new Promise(async (resolve, reject) => {
            const startTimestamp: string = new Date().toISOString();
            let response: Response = new Response();
            let responseBody: BodyInit = '';
            let errorMessage;

            try {
                response = await fetch(requestUrl, requestApi.request);
                try {
                    //create a clone to leave the response.bodyUsed property to false, so the methods "response.text()", "response.json()", "response.arrayBuffer()", "response.formData()" and "response.blob()" can be used
                    const responseClone = response.clone();
                    responseBody = secureJsonParse(await responseClone.text());
                } catch (error) {
                    console.warn('error getting response body for stack trace log:', error);
                } finally {
                    resolve({ response, responseBody });
                }
            } catch (error) {
                errorMessage = error;
                reject(error);
            } finally {
                //generate stack trace call log
                const stackTrace: StackTrace = this.generateStackTraceCallLog(
                    requestUrl,
                    requestApi.request,
                    startTimestamp,
                    response,
                    responseBody,
                    errorMessage,
                    requestApi.stackTraceLogExtraParams
                );
                //push stack trace call log
                this.stackTraceLog.push(stackTrace);
            }
        });
    };

    //returns apiTypes outside the API class
    getApiTypes = (): ApiTypes => this.apiTypes;

    //returns stackTraceLog outside the API class
    getStackTraceLog = (): StackTrace[] => this.stackTraceLog;

    //execute Fetch call for REST API, from all params and configurations and returns Promise with CallResponse type
    call = (type: string, parameters?: ApiParameters): Promise<CallResponseFinal> => {
        return new Promise(async (resolve, reject) => {
            try {
                //define default parameters to use if parameters weren't passed
                const defaultParameters: ApiParametersInternal = { pathQueryParameters: [{ name: '', value: '' }], headers: {}, body: {} as BodyInit };
                //define internal parameters to use in all methods
                const internalParameters: ApiParametersInternal = {
                    pathQueryParameters: parameters?.pathQueryParameters || defaultParameters.pathQueryParameters,
                    headers: parameters?.headers || defaultParameters.headers,
                    body: parameters?.body || defaultParameters.body,
                };

                //endpoint got from property string as EndpointInternal type
                const requestApi: EndpointInternal = await this.getApi(type, internalParameters);
                //url generated with path and query parameters
                const requestUrl: string = this.generateUrl(requestApi, internalParameters);

                //definition of useFetch method already configured with parameters to use in retries iterations
                const useFetchCall = async (): Promise<UseFetchResponse> => await this.useFetch(requestUrl, requestApi);
                //useFetch first call
                const { response, responseBody } = await useFetchCall();

                //check if there's condition to make retries
                const retryCondition: boolean = this.retryCondition(requestApi, response.status);

                //initialization of result as CallResponse
                let result: CallResponse = defaultResponse;
                if (retryCondition) {
                    //if there's retryCondition will start the retries
                    result = await this.manageRetry(requestApi, useFetchCall);
                } else {
                    //else will be set the result with first useFetch call data
                    result = {
                        requestApi,
                        response,
                        responseBody,
                        retries: { quantity: 0, conditions: [] },
                    };
                }
                //get responseInterceptor result
                const interceptorResponse = await requestApi.responseInterceptor(result);

                //merge responseInterceptor result with result
                const finalResult: CallResponseFinal = { ...result, interceptorResponse: interceptorResponse };

                //resolve without errors
                resolve(finalResult);
            } catch (error) {
                //resolve with errors
                reject(error);
            }
        });
    };

    //set query paramenters to url
    private setQueryParameters = (url: string, queryParameters: PathQueryParameters): string => {
        let newUrl = url;

        for (let parameter of queryParameters) {
            newUrl = newUrl.replace(`{${parameter.name}}`, encodeURIComponent(parameter.value));
        }

        return newUrl;
    };

    //generate url with path and query parameters
    private generateUrl = (requestApi: EndpointInternal, parameters: ApiParametersInternal): string => {
        const url = requestApi.baseUrl + requestApi.path;
        return this.setQueryParameters(url, parameters.pathQueryParameters);
    };

    //check if is a valid status code to make retries
    private retryCondition = (requestApi: EndpointInternal, statusCode: number): boolean => {
        const conditionsStatus = requestApi.retryCondition;
        const result = conditionsStatus.some((status) => status === statusCode) || false;

        return result;
    };

    //handle retries with iteration of the quantity configured, the loop ends if the status code is ok
    private manageRetry = (requestApi: EndpointInternal, useFetchCall: () => Promise<UseFetchResponse>): Promise<CallResponse> => {
        return new Promise(async (resolve, reject) => {
            try {
                let resolved: boolean = false;
                let result: CallResponse = defaultResponse;
                const numberOfRetry = requestApi.retry;
                if (numberOfRetry < 1) throw new Error('"retry" parameter < 1');

                let retriedTimes = 0;
                let retriedConditions = [];

                for (let i = 0; i < numberOfRetry; i++) {
                    if (!resolved) {
                        try {
                            const { response, responseBody } = await useFetchCall();
                            retriedTimes++;
                            retriedConditions.push(response.status);

                            result = {
                                requestApi,
                                response,
                                responseBody,
                                retries: { quantity: retriedTimes, conditions: retriedConditions },
                            };
                            if (response.ok) {
                                resolved = true;
                            }
                        } catch (error) {
                            reject(error);
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    };
}
