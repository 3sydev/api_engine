import { BodyInit, Headers, HeadersInit, RequestInit, Response } from 'node-fetch';

export type ApiTypes = {
    [key: string]: string;
};

export type IgnoreGlobalParam = 'request' | 'retry' | 'retryCondition' | 'statusCodesActions' | 'errorMessages' | 'stackTraceLogExtraParams';

export type StatusCodeAction = {
    statusCode: number;
    action: Function;
    executeOnlyOn?: 'firstCall' | 'retry';
};

export type ErrorMessage = {
    statusCode: number;
    errorCode: string;
    errorMessage: string;
    action?: Function;
};

type Endpoint = {
    path: string;
    request?: RequestInit;
    retry?: number | 0;
    retryCondition?: number[];
    ignoreGlobalParams?: IgnoreGlobalParam[];
    statusCodesActions?: StatusCodeAction[];
    errorMessages?: ErrorMessage[];
    stackTraceLogExtraParams?: object;
};

export type EndpointInternal = {
    path: string;
    request: RequestInit;
    retry: number | 0;
    retryCondition: number[];
    ignoreGlobalParams: IgnoreGlobalParam[];
    statusCodesActions: StatusCodeAction[];
    errorMessages: ErrorMessage[];
    stackTraceLogExtraParams: object;
};

export type EndpointGlobal = {
    request?: RequestInit;
    retry?: number | 0;
    retryCondition?: number[];
    statusCodesActions?: StatusCodeAction[];
    errorMessages?: ErrorMessage[];
    stackTraceLogExtraParams?: object;
};

export type EndpointGlobalInternal = {
    request: RequestInit;
    retry: number | 0;
    retryCondition: number[];
    statusCodesActions: StatusCodeAction[];
    errorMessages: ErrorMessage[];
    stackTraceLogExtraParams: object;
};

type Endpoints = {
    [key: string]: Endpoint;
};

type EndpointsInternal = {
    [key: string]: EndpointInternal;
};

export type ApiConstants = {
    baseUrl: string;
    globalParams?: EndpointGlobal;
    endpoints: Endpoints;
};

export type ApiConstantsInternal = {
    baseUrl: string;
    globalParams: EndpointGlobalInternal;
    endpoints: EndpointsInternal;
};

type Parameter = {
    name: string;
    value: string;
};

export type PathQueryParameters = Parameter[];

export type ApiParameters = {
    pathQueryParameters?: PathQueryParameters;
    headers?: HeadersInit;
    body?: BodyInit;
};

export type ApiParametersInternal = {
    pathQueryParameters: PathQueryParameters;
    headers: HeadersInit;
    body: BodyInit;
};

export type Retries = {
    quantity: number;
    conditions: number[];
};

export type ErrorStatus = {
    isInError: boolean;
    errorCode: string;
    errorMessage: string;
};

export type CallResponse = {
    requestApi: EndpointInternal;
    response: Response;
    retries: Retries;
    errorStatus: ErrorStatus;
};

export type StackTrace = {
    startTimestamp: string;
    endTimestamp: string;
    requestUrl: string;
    requestHeaders: HeadersInit;
    responseHeaders: Headers;
    requestBody: BodyInit;
    responseBody: BodyInit;
    responseStatusCode: number;
    errorMessage: string | unknown;
    extraProperties: object;
};
