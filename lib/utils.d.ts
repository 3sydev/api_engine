import { RequestInterceptor, ResponseInterceptor } from './types';
type MergeRequestInterceptorsMethods = (methods: RequestInterceptor[]) => RequestInterceptor;
type MergeResponseInterceptorsMethods = (methods: ResponseInterceptor[]) => ResponseInterceptor;
export declare const mergeRequestInterceptorsMethods: MergeRequestInterceptorsMethods;
export declare const mergeResponseInterceptorsMethods: MergeResponseInterceptorsMethods;
export {};
