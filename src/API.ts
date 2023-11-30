import { ApiConstants, ApiParameters, ApiType, Endpoint, QueryParameters, RequestInitParams, UseFetch } from './types';

export default class API {
    apiConstants: ApiConstants;

    constructor(apiConstants: ApiConstants) {
        this.apiConstants = apiConstants;
    }

    private getApi = (type: ApiType): Endpoint | undefined => {
        const apis = this.apiConstants.endpoints;
        return apis[type];
    };

    private useFetch = (requestUrl: string, requestInit: RequestInitParams): Promise<UseFetch> => {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(requestUrl, requestInit);
                const responseJson = await response.json();

                resolve({
                    statusCode: response.status,
                    responseJson,
                });
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    };

    call = (type: ApiType, parameters: ApiParameters): Promise<object | undefined> => {
        return new Promise(async (resolve, reject) => {
            try {
                const requestUrl: string = this.generateUrl(type, parameters);
                const method: string | undefined = this.generateMethod(type);
                const headers: HeadersInit | undefined = this.generateHeaders(type);
                const body: object | null | undefined = this.generateBody(type);

                const requestInit = {
                    method,
                    headers,
                    body: JSON.stringify(body),
                };
                const useFetchCall = async () => await this.useFetch(requestUrl, requestInit);
                const useFetchResponse = await useFetchCall();
                const retryCondition: boolean = this.retryCondition(type, useFetchResponse.statusCode);

                let result: object | undefined;
                if (retryCondition) {
                    result = await this.manageRetry(type, useFetchCall);
                } else if (useFetchResponse?.statusCode === 200) {
                    result = useFetchResponse?.responseJson;
                } else {
                    reject(new Error('Status code !== 200: ' + useFetchResponse?.statusCode));
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    };

    private setQueryParameters = (url: string, queryParameters: QueryParameters): string => {
        let newUrl = url;

        for (let parameter of queryParameters) {
            newUrl?.replace(`{${parameter.name}}`, encodeURIComponent(parameter.value));
        }

        return newUrl;
    };

    private generateUrl = (type: ApiType, parameters: ApiParameters): string => {
        const url = this.apiConstants.baseUrl + this.getApi(type);
        return this.setQueryParameters(url, parameters.queryParameters);
    };

    private generateMethod = (type: ApiType): string | undefined => {
        return this.getApi(type)?.method;
    };

    private generateHeaders = (type: ApiType): HeadersInit | undefined => {
        return this.getApi(type)?.headers;
    };

    private generateBody = (type: ApiType): object | null | undefined => {
        return this.getApi(type)?.body;
    };

    private retryCondition = (type: ApiType, statusCode: number): boolean => {
        const conditionsStatus = this.getApi(type)?.retryCondition;
        const result = conditionsStatus?.some((status) => status === statusCode) || false;

        return result;
    };

    private manageRetry = (type: ApiType, useFetchCall: Function): Promise<object | undefined> => {
        return new Promise(async (resolve, reject) => {
            try {
                let resolved: boolean = false;
                let result: UseFetch = {
                    statusCode: 0,
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
