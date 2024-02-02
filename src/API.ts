import {
    ApiConstants,
    ApiConstantsInternal,
    ApiParameters,
    ApiParametersInternal,
    ApiTypes,
    CallResponse,
    EndpointGlobalInternal,
    EndpointInternal,
    ErrorMessage,
    ErrorStatus,
    IgnoreGlobalParam,
    PathQueryParameters,
    StackTrace,
    StatusCodeAction,
    UseFetchResponse,
} from './types';
import fetch, { BodyInit, RequestInit, Response } from 'node-fetch';
import { generateGlobalArrayWithOverrides } from './utils';

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
                path: endpoint.path,
                request: endpoint.request || {},
                retry: endpoint.retry || 0,
                retryCondition: endpoint.retryCondition || [],
                ignoreGlobalParams: endpoint.ignoreGlobalParams || [],
                statusCodesActions: endpoint.statusCodesActions || [],
                errorMessages: endpoint.errorMessages || [],
            } as EndpointInternal;
        });
        //remap globalParams as EndpointGlobalInternal type
        const internalGlobalParams: EndpointGlobalInternal = {
            request: apiConstants.globalParams?.request || {},
            retry: apiConstants.globalParams?.retry || 0,
            retryCondition: apiConstants.globalParams?.retryCondition || [],
            statusCodesActions: apiConstants.globalParams?.statusCodesActions || [],
            errorMessages: apiConstants.globalParams?.errorMessages || [],
            stackTraceLogExtraParams: apiConstants.globalParams?.stackTraceLogExtraParams || {},
        };
        //initialize apiConstants as ApiConstantsInternal type
        this.apiConstants = { ...(apiConstants as ApiConstantsInternal), globalParams: internalGlobalParams };
        //initialize apiTypes to return array of strings of all endpoints object properties
        this.apiTypes = Object.keys(this.apiConstants.endpoints).reduce((o, key) => ({ ...o, [key]: key }), {});
    }

    //returns endpoint from property string as EndpointInternal type
    private getApi = (type: string): EndpointInternal => {
        const apis = this.apiConstants.endpoints;
        const globals = this.apiConstants.globalParams;
        const api = apis[type];

        if (!api) throw new Error('Api type not defined');
        if (Object.keys(api.request).length === 0 && Object.keys(globals.request).length === 0) throw new Error('Request parameter not defined');

        const ignoreGlobalParams: IgnoreGlobalParam[] = api.ignoreGlobalParams;

        const result: EndpointInternal = {
            path: api.path,
            request: ignoreGlobalParams.includes('request') ? api.request : { ...globals.request, ...api.request },
            retry: ignoreGlobalParams.includes('retry') ? api.retry : api.retry || globals.retry || 0,
            retryCondition: ignoreGlobalParams.includes('retryCondition') ? api.retryCondition : [...globals.retryCondition, ...api.retryCondition],
            ignoreGlobalParams: ignoreGlobalParams,
            statusCodesActions: ignoreGlobalParams.includes('statusCodesActions')
                ? api.statusCodesActions
                : (generateGlobalArrayWithOverrides(globals.statusCodesActions, api.statusCodesActions) as StatusCodeAction[]),
            errorMessages: ignoreGlobalParams.includes('errorMessages') ? api.errorMessages : (generateGlobalArrayWithOverrides(globals.errorMessages, api.errorMessages) as ErrorMessage[]),
            stackTraceLogExtraParams: ignoreGlobalParams.includes('stackTraceLogExtraParams') ? api.stackTraceLogExtraParams : { ...globals.stackTraceLogExtraParams, ...api.stackTraceLogExtraParams },
        };

        return result;
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
            requestHeaders: requestInit?.headers || {},
            responseHeaders: response?.headers || {},
            requestBody: requestInit?.body || '',
            responseBody: responseBody || '',
            responseStatusCode: response.status,
            errorMessage,
            extraProperties: stackTraceLogExtraParams,
        };
        return stackTrace;
    };

    //Execute fetch method and returns Promise as Fetch Respose type
    private useFetch = (requestUrl: string, requestInit: RequestInit, requestApi: EndpointInternal): Promise<UseFetchResponse> => {
        return new Promise(async (resolve, reject) => {
            const startTimestamp: string = new Date().toISOString();
            let response: Response = new Response();
            let responseBody: BodyInit = '';
            let errorMessage;

            try {
                response = await fetch(requestUrl, requestInit);
                try {
                    responseBody = await response.text();
                } catch (error) {
                    console.warn('error getting response body for request:', error);
                } finally {
                    resolve({ response, responseBody });
                }
            } catch (error) {
                errorMessage = error;
                reject(error);
            } finally {
                //generate stack trace call log
                const stackTrace: StackTrace = this.generateStackTraceCallLog(requestUrl, requestInit, startTimestamp, response, responseBody, errorMessage, requestApi.stackTraceLogExtraParams);
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
    call = (type: string, parameters?: ApiParameters): Promise<CallResponse> => {
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
                const requestApi: EndpointInternal = this.getApi(type);
                //url generated with path and query parameters
                const requestUrl: string = this.generateUrl(requestApi, internalParameters);

                //request object geenrated with apiConstants and parameters request properties
                const requestInit: RequestInit = this.generateRequest(requestApi, parameters);

                //definition of useFetch method already configured with parameters to use in retries iterations
                const useFetchCall = async (): Promise<UseFetchResponse> => await this.useFetch(requestUrl, requestInit, requestApi);
                //useFetch first call
                const { response, responseBody } = await useFetchCall();

                //execute actions by status code received from useFetch call
                await this.executeActionOnStatusCode(requestApi, response.status);

                //check if there's condition to make retries
                const retryCondition: boolean = this.retryCondition(requestApi, response.status);

                //initialization of result as CallResponse
                let result: CallResponse = {
                    requestApi: { path: '', request: {}, retry: 0, retryCondition: [], ignoreGlobalParams: [], statusCodesActions: [], errorMessages: [], stackTraceLogExtraParams: {} },
                    response: {} as Response,
                    responseBody: '',
                    retries: { quantity: 0, conditions: [] },
                    errorStatus: { isInError: false, errorCode: '', errorMessage: '' },
                };
                if (retryCondition) {
                    //if there's retryCondition will start the retries
                    result = await this.manageRetry(requestApi, useFetchCall);
                } else {
                    //else will be set the result with first useFetch call data
                    result = {
                        requestApi,
                        response: response,
                        responseBody: responseBody,
                        retries: { quantity: 0, conditions: [] },
                        errorStatus: await this.generateErrorStatus(requestApi, response.status),
                    };
                }

                //resolve without errors
                resolve(result);
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
        const url = this.apiConstants.baseUrl + requestApi.path;
        return this.setQueryParameters(url, parameters.pathQueryParameters);
    };

    //generate request for Fetch method as RequestInit type
    private generateRequest = (requestApi: EndpointInternal, parameters?: ApiParameters): RequestInit => {
        const { headers, body: _body } = parameters || { headers: {}, body: undefined };
        const staticRequest = requestApi.request;
        const staticRequestBody = staticRequest.body;

        const body = _body ? JSON.stringify({ ...JSON.parse(staticRequestBody as string), ...JSON.parse(_body as string) } as BodyInit) : staticRequestBody;

        const request = {
            method: staticRequest.method,
            headers: { ...staticRequest.headers, ...headers },
            body,
        };

        return request;
    };

    //if found, execute action by status code
    private executeActionOnStatusCode = async (requestApi: EndpointInternal, statusCode: number, isRetry: boolean = false): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                const item: StatusCodeAction | undefined = requestApi.statusCodesActions.find((action) => action.statusCode === statusCode);
                const action: Function | undefined = item?.action;
                const executeOnlyOn: 'firstCall' | 'retry' | undefined = item?.executeOnlyOn;

                if (action && (!executeOnlyOn || (executeOnlyOn === 'firstCall' && !isRetry) || (executeOnlyOn === 'retry' && isRetry))) await action();

                resolve();
            } catch (error) {
                reject(error);
            }
        });
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
                let result: CallResponse = {
                    requestApi: { path: '', request: {}, retry: 0, retryCondition: [], ignoreGlobalParams: [], statusCodesActions: [], errorMessages: [], stackTraceLogExtraParams: {} },
                    response: {} as Response,
                    responseBody: '',
                    retries: { quantity: 0, conditions: [] },
                    errorStatus: { isInError: false, errorCode: '', errorMessage: '' },
                };
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

                            await this.executeActionOnStatusCode(requestApi, response.status, true);

                            result = {
                                requestApi,
                                response,
                                responseBody,
                                retries: { quantity: retriedTimes, conditions: retriedConditions },
                                errorStatus: await this.generateErrorStatus(requestApi, response.status),
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

    //generate error status as ErrorStatus type if is found in response
    private generateErrorStatus = (requestApi: EndpointInternal, statusCode: number): Promise<ErrorStatus> => {
        return new Promise(async (resolve, reject) => {
            try {
                const item: ErrorMessage | undefined = requestApi.errorMessages.find((error) => error.statusCode === statusCode);

                const isInError: boolean = item ? true : false;
                const errorCode: string = item?.errorCode || '';
                const errorMessage: string = item?.errorMessage || '';
                const action: Function = item?.action || function () {};

                await action();

                resolve({ isInError, errorCode, errorMessage });
            } catch (error) {
                reject(new Error(`Error executing errorMessage action: ${error}`));
            }
        });
    };
}
