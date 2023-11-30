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

type Parameter = {
    name: string;
    value: string;
};

export type PathQueryParameters = Parameter[];

export type ApiParameters = {
    pathQueryParameters?: PathQueryParameters;
    headers?: object;
    body?: object;
};

export type RequestInitParams = {
    method: string | undefined;
    headers: HeadersInit | undefined;
    body: string;
};

export type UseFetch = {
    statusCode: number;
    isOk: boolean;
    responseJson: object | undefined | unknown;
};
