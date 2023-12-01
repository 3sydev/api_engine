import { ApiConstants, ApiParameters, ApiTypes, Endpoint, PathQueryParameters, UseFetch } from './types';
import fetch, { BodyInit, RequestInit } from 'node-fetch';

export default class API {
    private apiConstants: ApiConstants;
    private apiTypes: ApiTypes;

    constructor(apiConstants: ApiConstants) {
        if (!apiConstants) throw new Error('Error on API constructor: apiConstants not defined.');
        this.apiConstants = apiConstants;
        this.apiTypes = Object.keys(this.apiConstants.endpoints)?.reduce((o, key) => ({ ...o, [key]: key }), {});
    }

    private getApi = (type: string): Endpoint => {
        const apis = this.apiConstants.endpoints;
        return apis[type];
    };

    private useFetch = (requestUrl: string, requestInit: RequestInit): Promise<UseFetch> => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(requestUrl, requestInit);
                const responseJson = await response.json();

                resolve({
                    statusCode: response.status,
                    isOk: response.ok,
                    responseJson,
                });
            } catch (error) {
                reject(error);
            }
        });
    };

    getApiTypes = (): ApiTypes => this.apiTypes;

    call = (type: string, parameters?: ApiParameters): Promise<object | undefined | unknown> => {
        return new Promise(async (resolve, reject) => {
            try {
                const defaultParameters: ApiParameters = { pathQueryParameters: [{ name: '', value: '' }], headers: {}, body: {} as BodyInit };
                const requestUrl: string = this.generateUrl(type, parameters || defaultParameters);

                const requestInit: RequestInit = this.generateRequest(type, parameters);

                const useFetchCall = async () => await this.useFetch(requestUrl, requestInit);
                const useFetchResponse = await useFetchCall();
                const retryCondition: boolean = this.retryCondition(type, useFetchResponse.statusCode);

                let result: object | undefined | unknown;
                if (retryCondition) {
                    result = await this.manageRetry(type, useFetchCall);
                } else if (useFetchResponse?.isOk) {
                    result = useFetchResponse?.responseJson;
                } else {
                    reject(new Error('Status code !== 2xx: ' + useFetchResponse?.statusCode));
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    };

    private setQueryParameters = (url: string, queryParameters: PathQueryParameters | undefined): string => {
        if (!queryParameters) return url;

        let newUrl = url;

        for (let parameter of queryParameters) {
            newUrl = newUrl?.replace(`{${parameter.name}}`, encodeURIComponent(parameter.value));
        }

        return newUrl;
    };

    private generateUrl = (type: string, parameters: ApiParameters): string => {
        const url = this.apiConstants.baseUrl + this.getApi(type).path;
        return this.setQueryParameters(url, parameters?.pathQueryParameters);
    };

    private generateRequest = (type: string, parameters?: ApiParameters): RequestInit => {
        const { headers, body: _body } = parameters || { headers: {}, body: undefined };
        const staticRequest = this.getApi(type).request;
        const staticRequestBody = staticRequest?.body;

        const body = _body ? JSON.stringify({ ...JSON.parse(staticRequestBody as string), ...JSON.parse(_body as string) } as BodyInit) : staticRequestBody;

        const request = {
            method: staticRequest.method,
            headers: { ...staticRequest.headers, ...headers },
            body,
        };

        return request;
    };

    private retryCondition = (type: string, statusCode: number): boolean => {
        const conditionsStatus = this.getApi(type)?.retryCondition;
        const result = conditionsStatus?.some((status) => status === statusCode) || false;

        return result;
    };

    private manageRetry = (type: string, useFetchCall: Function): Promise<object | undefined | unknown> => {
        return new Promise(async (resolve, reject) => {
            try {
                let resolved: boolean = false;
                let result: UseFetch = {
                    statusCode: 0,
                    isOk: false,
                    responseJson: undefined,
                };
                const numberOfRetry = this.getApi(type)?.retry;

                for (let _ = 0; numberOfRetry; _++) {
                    if (!resolved) {
                        result = await useFetchCall();
                        resolved = true;
                    }
                }

                resolve(result.responseJson);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    };
}
