import { RequestInit } from 'node-fetch';

export type ApiTypes = {
    [key: string]: string;
};

export type Endpoint = {
    path: string;
    request: RequestInit;
    retry: number | 0;
    retryCondition: number[];
};

type Endpoints = {
    [key: string]: Endpoint;
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
    responseJson: object | undefined | unknown;
};
