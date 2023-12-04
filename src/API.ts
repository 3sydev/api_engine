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
    StatusCodeAction,
} from './types';
import fetch, { BodyInit, RequestInit, Response } from 'node-fetch';

export default class API {
    private apiConstants: ApiConstantsInternal;
    private apiTypes: ApiTypes;

    constructor(apiConstants: ApiConstants) {
        if (!apiConstants) throw new Error('Error on API constructor: apiConstants not defined.');
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
        const internalGlobalParams: EndpointGlobalInternal = {
            request: apiConstants.globalParams?.request || {},
            retry: apiConstants.globalParams?.retry || 0,
            retryCondition: apiConstants.globalParams?.retryCondition || [],
        };
        this.apiConstants = { ...(apiConstants as ApiConstantsInternal), globalParams: internalGlobalParams };
        this.apiTypes = Object.keys(this.apiConstants.endpoints).reduce((o, key) => ({ ...o, [key]: key }), {});
    }

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
            statusCodesActions: api.statusCodesActions,
            errorMessages: api.errorMessages,
        };

        return result;
    };

    private useFetch = (requestUrl: string, requestInit: RequestInit): Promise<Response> => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(requestUrl, requestInit);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    };

    getApiTypes = (): ApiTypes => this.apiTypes;

    call = (type: string, parameters?: ApiParameters): Promise<CallResponse> => {
        return new Promise(async (resolve, reject) => {
            try {
                const defaultParameters: ApiParametersInternal = { pathQueryParameters: [{ name: '', value: '' }], headers: {}, body: {} as BodyInit };
                const internalParameters: ApiParametersInternal = {
                    pathQueryParameters: parameters?.pathQueryParameters || defaultParameters.pathQueryParameters,
                    headers: parameters?.headers || defaultParameters.headers,
                    body: parameters?.body || defaultParameters.body,
                };

                const requestApi: EndpointInternal = this.getApi(type);
                const requestUrl: string = this.generateUrl(requestApi, internalParameters);

                const requestInit: RequestInit = this.generateRequest(requestApi, parameters);

                const useFetchCall = async (): Promise<Response> => await this.useFetch(requestUrl, requestInit);
                const useFetchResponse = await useFetchCall();

                await this.executeActionOnStatusCode(requestApi, useFetchResponse.status);

                const retryCondition: boolean = this.retryCondition(requestApi, useFetchResponse.status);

                let result: CallResponse = {
                    requestApi: { path: '', request: {}, retry: 0, retryCondition: [], ignoreGlobalParams: [], statusCodesActions: [], errorMessages: [] },
                    response: {} as Response,
                    retries: { quantity: 0, conditions: [] },
                    errorStatus: { isInError: false, errorCode: '', errorMessage: '' },
                };
                if (retryCondition) {
                    result = await this.manageRetry(requestApi, useFetchCall);
                } else {
                    result = { requestApi, response: useFetchResponse, retries: { quantity: 0, conditions: [] }, errorStatus: this.generateErrorStatus(requestApi, useFetchResponse.status) };
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    };

    private setQueryParameters = (url: string, queryParameters: PathQueryParameters): string => {
        let newUrl = url;

        for (let parameter of queryParameters) {
            newUrl = newUrl.replace(`{${parameter.name}}`, encodeURIComponent(parameter.value));
        }

        return newUrl;
    };

    private generateUrl = (requestApi: EndpointInternal, parameters: ApiParametersInternal): string => {
        const url = this.apiConstants.baseUrl + requestApi.path;
        return this.setQueryParameters(url, parameters.pathQueryParameters);
    };

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

    private retryCondition = (requestApi: EndpointInternal, statusCode: number): boolean => {
        const conditionsStatus = requestApi.retryCondition;
        const result = conditionsStatus.some((status) => status === statusCode) || false;

        return result;
    };

    private manageRetry = (requestApi: EndpointInternal, useFetchCall: () => Promise<Response>): Promise<CallResponse> => {
        return new Promise(async (resolve, reject) => {
            try {
                let resolved: boolean = false;
                let result: CallResponse = {
                    requestApi: { path: '', request: {}, retry: 0, retryCondition: [], ignoreGlobalParams: [], statusCodesActions: [], errorMessages: [] },
                    response: {} as Response,
                    retries: { quantity: 0, conditions: [] },
                    errorStatus: { isInError: false, errorCode: '', errorMessage: '' },
                };
                const numberOfRetry = requestApi.retry;
                if (numberOfRetry < 0) throw new Error('"retry" parameter < 0');

                let retriedTimes = 0;
                let retriedConditions = [];

                for (let i = 0; i < numberOfRetry; i++) {
                    if (!resolved) {
                        try {
                            const response = await useFetchCall();
                            retriedTimes++;
                            retriedConditions.push(response.status);

                            await this.executeActionOnStatusCode(requestApi, response.status, true);

                            result = {
                                requestApi,
                                response,
                                retries: { quantity: retriedTimes, conditions: retriedConditions },
                                errorStatus: this.generateErrorStatus(requestApi, response.status),
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

    private generateErrorStatus = (requestApi: EndpointInternal, statusCode: number): ErrorStatus => {
        const item: ErrorMessage | undefined = requestApi.errorMessages.find((error) => error.statusCode === statusCode);

        const isInError: boolean = item ? true : false;
        const errorCode: string = item?.errorCode || '';
        const errorMessage: string = item?.errorMessage || '';

        return { isInError, errorCode, errorMessage };
    };
}
