import { ApiConstants, ApiParameters, ApiParametersInternal, ApiTypes, CallResponse, Endpoint, PathQueryParameters } from './types';
import fetch, { BodyInit, RequestInit, Response } from 'node-fetch';

export default class API {
    private apiConstants: ApiConstants;
    private apiTypes: ApiTypes;

    constructor(apiConstants: ApiConstants) {
        if (!apiConstants) throw new Error('Error on API constructor: apiConstants not defined.');
        this.apiConstants = apiConstants;
        this.apiTypes = Object.keys(this.apiConstants.endpoints).reduce((o, key) => ({ ...o, [key]: key }), {});
    }

    private getApi = (type: string): Endpoint => {
        const apis = this.apiConstants.endpoints;
        return apis[type];
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
                const requestUrl: string = this.generateUrl(type, internalParameters);

                const requestInit: RequestInit = this.generateRequest(type, parameters);

                const useFetchCall = async (): Promise<Response> => await this.useFetch(requestUrl, requestInit);
                const useFetchResponse = await useFetchCall();
                const retryCondition: boolean = this.retryCondition(type, useFetchResponse.status);

                let result: CallResponse = { response: {} as Response, retries: { quantity: 0, conditions: [] } };
                if (retryCondition) {
                    result = await this.manageRetry(type, useFetchCall);
                } else if (useFetchResponse.ok) {
                    result = { response: useFetchResponse, retries: { quantity: 0, conditions: [] } };
                } else {
                    reject(new Error('Status code !== 2xx: ' + useFetchResponse.status));
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

    private generateUrl = (type: string, parameters: ApiParametersInternal): string => {
        const url = this.apiConstants.baseUrl + this.getApi(type).path;
        return this.setQueryParameters(url, parameters.pathQueryParameters);
    };

    private generateRequest = (type: string, parameters?: ApiParameters): RequestInit => {
        const { headers, body: _body } = parameters || { headers: {}, body: undefined };
        const staticRequest = this.getApi(type).request;
        const staticRequestBody = staticRequest.body;

        const body = _body ? JSON.stringify({ ...JSON.parse(staticRequestBody as string), ...JSON.parse(_body as string) } as BodyInit) : staticRequestBody;

        const request = {
            method: staticRequest.method,
            headers: { ...staticRequest.headers, ...headers },
            body,
        };

        return request;
    };

    private retryCondition = (type: string, statusCode: number): boolean => {
        const conditionsStatus = this.getApi(type).retryCondition;
        const result = conditionsStatus.some((status) => status === statusCode) || false;

        return result;
    };

    private manageRetry = (type: string, useFetchCall: () => Promise<Response>): Promise<CallResponse> => {
        return new Promise(async (resolve, reject) => {
            try {
                let resolved: boolean = false;
                let result: CallResponse = { response: {} as Response, retries: { quantity: 0, conditions: [] } };
                const numberOfRetry = this.getApi(type).retry;
                if (numberOfRetry < 0) throw new Error('"retry" parameter < 0');

                let retriedTimes = 0;
                let retriedConditions = [];

                for (let i = 0; i < numberOfRetry; i++) {
                    if (!resolved) {
                        try {
                            const response = await useFetchCall();
                            retriedTimes++;
                            retriedConditions.push(response.status);
                            result = { response, retries: { quantity: retriedTimes, conditions: retriedConditions } };
                            if (response.ok) {
                                resolved = true;
                            }
                            /* c8 ignore start */
                        } catch (error) {
                            reject(error);
                        }
                        /* c8 ignore end */
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    };
}
