export type ApiTypes = {
    [key: string]: string;
};
export type IgnoreGlobalParam = 'request' | 'retry' | 'retryCondition' | 'stackTraceLogExtraParams' | 'requestInterceptor' | 'responseInterceptor';
export type RequestInterceptor = (endpoint: Endpoint) => Endpoint;
export type ResponseInterceptor = (response: CallResponse) => object | Promise<object> | undefined | null | void;
export type Endpoint = {
    baseUrl?: string;
    path: string;
    request?: RequestInit;
    retry?: number | 0;
    retryCondition?: number[];
    ignoreGlobalParams?: IgnoreGlobalParam[];
    stackTraceLogExtraParams?: object;
    requestInterceptor?: RequestInterceptor;
    responseInterceptor?: ResponseInterceptor;
};
export type EndpointInternal = {
    baseUrl: string;
    path: string;
    request: RequestInit;
    retry: number | 0;
    retryCondition: number[];
    ignoreGlobalParams: IgnoreGlobalParam[];
    stackTraceLogExtraParams: object;
    requestInterceptor: RequestInterceptor;
    responseInterceptor: ResponseInterceptor;
};
export type EndpointGlobal = {
    request?: RequestInit;
    retry?: number | 0;
    retryCondition?: number[];
    stackTraceLogExtraParams?: object;
    requestInterceptor?: RequestInterceptor;
    responseInterceptor?: ResponseInterceptor;
};
export type EndpointGlobalInternal = {
    request: RequestInit;
    retry: number | 0;
    retryCondition: number[];
    stackTraceLogExtraParams: object;
    requestInterceptor: RequestInterceptor;
    responseInterceptor: ResponseInterceptor;
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
export type UseFetchResponse = {
    response: Response;
    responseBody: BodyInit;
};
export type CallResponse = {
    requestApi: EndpointInternal;
    response: Response;
    responseBody: BodyInit;
    retries: Retries;
};
export type CallResponseFinal = {
    requestApi: EndpointInternal;
    response: Response;
    responseBody: BodyInit;
    retries: Retries;
    interceptorResponse: object;
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
export {};
