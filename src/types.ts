export enum ApiType {
    LogIn = 'logIn',
    LogOut = 'logOut',
}

export type Endpoint = {
    type: ApiType;
    path: string;
    method: string;
    headers: HeadersInit;
    body: object | null;
    retry: number | 0;
    retryCondition: number[];
};

type Endpoints = {
    logIn: Endpoint;
    logOut: Endpoint;
};

export type ApiConstants = {
    baseUrl: string;
    endpoints: Endpoints;
};

type QueryParameter = {
    name: string;
    value: string;
};

export type QueryParameters = QueryParameter[];

export type ApiParameters = {
    queryParameters: QueryParameters;
    headers: object;
    body: object;
};

export type RequestInitParams = {
    method: string | undefined;
    headers: HeadersInit | undefined;
    body: string;
};

export type UseFetch = {
    statusCode: number;
    responseJson: object | undefined;
};
