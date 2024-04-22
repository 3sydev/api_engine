"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var lodash_1 = require("lodash");
var defaultRequestApi = {
    baseUrl: '',
    path: '',
    request: {},
    retry: 0,
    retryCondition: [],
    ignoreGlobalParams: [],
    stackTraceLogExtraParams: {},
    requestInterceptor: function (endpoint) { return endpoint; },
    responseInterceptor: function () { },
};
var defaultResponse = {
    requestApi: defaultRequestApi,
    response: {},
    responseBody: '',
    retries: { quantity: 0, conditions: [] },
};
var API = /** @class */ (function () {
    function API(apiConstants) {
        var _this = this;
        var _a, _b, _c, _d, _e, _f;
        this.stackTraceLog = [];
        //generate new api based on requestInterceptor
        this.generateApiBasedOnRequestInterceptor = function (api) {
            var globals = _this.apiConstants.globalParams;
            var ignoreGlobalParams = api.ignoreGlobalParams;
            var newApi = __assign(__assign({}, api), (ignoreGlobalParams.includes('requestInterceptor') ? api.requestInterceptor(api) : (0, utils_1.mergeRequestInterceptorsMethods)([globals.requestInterceptor, api.requestInterceptor])(api)));
            return newApi;
        };
        //returns endpoint from property string as EndpointInternal type
        this.getApi = function (type, parameters) {
            var apis = _this.apiConstants.endpoints;
            var globals = _this.apiConstants.globalParams;
            var _api = apis[type];
            if (!_api)
                throw new Error('Api type not defined');
            //overwrite api with requestInterceptor
            var api = _this.generateApiBasedOnRequestInterceptor(_api);
            if (Object.keys(api.request).length === 0 && Object.keys(globals.request).length === 0)
                throw new Error('Request parameter not defined');
            var ignoreGlobalParams = api.ignoreGlobalParams;
            var parametersRequest = {
                headers: JSON.stringify(parameters.headers) === '{}' ? undefined : parameters.headers,
                body: JSON.stringify(parameters.body) === '{}' ? undefined : parameters.body,
            };
            var result = {
                baseUrl: api.baseUrl,
                path: api.path,
                request: ignoreGlobalParams.includes('request') ? (0, lodash_1.merge)({}, api.request, parametersRequest) : (0, lodash_1.merge)({}, globals.request, api.request, parametersRequest),
                retry: ignoreGlobalParams.includes('retry') ? api.retry : api.retry || globals.retry || 0,
                retryCondition: ignoreGlobalParams.includes('retryCondition') ? api.retryCondition : __spreadArray(__spreadArray([], globals.retryCondition, true), api.retryCondition, true),
                ignoreGlobalParams: ignoreGlobalParams,
                stackTraceLogExtraParams: ignoreGlobalParams.includes('stackTraceLogExtraParams')
                    ? api.stackTraceLogExtraParams
                    : (0, lodash_1.merge)({}, globals.stackTraceLogExtraParams, api.stackTraceLogExtraParams),
                requestInterceptor: ignoreGlobalParams.includes('requestInterceptor') ? api.requestInterceptor : (0, utils_1.mergeRequestInterceptorsMethods)([globals.requestInterceptor, api.requestInterceptor]),
                responseInterceptor: ignoreGlobalParams.includes('responseInterceptor')
                    ? api.responseInterceptor
                    : (0, utils_1.mergeResponseInterceptorsMethods)([globals.responseInterceptor, api.responseInterceptor]),
            };
            return result;
        };
        //generate stack trace call log
        this.generateStackTraceCallLog = function (requestUrl, requestInit, startTimestamp, response, responseBody, errorMessage, stackTraceLogExtraParams) {
            var stackTrace = {
                startTimestamp: startTimestamp,
                endTimestamp: new Date().toISOString(),
                requestUrl: requestUrl,
                requestHeaders: requestInit.headers || {},
                responseHeaders: response.headers,
                requestBody: requestInit.body || '',
                responseBody: responseBody || '',
                responseStatusCode: response.status,
                errorMessage: errorMessage,
                extraProperties: stackTraceLogExtraParams,
            };
            return stackTrace;
        };
        //Execute fetch method and returns Promise as Fetch Respose type
        this.useFetch = function (requestUrl, requestApi) {
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var startTimestamp, response, responseBody, errorMessage, responseClone, _a, error_1, error_2, stackTrace;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            startTimestamp = new Date().toISOString();
                            response = new Response();
                            responseBody = '';
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 8, 9, 10]);
                            return [4 /*yield*/, fetch(requestUrl, requestApi.request)];
                        case 2:
                            response = _b.sent();
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, 6, 7]);
                            responseClone = response.clone();
                            _a = utils_1.secureJsonParse;
                            return [4 /*yield*/, responseClone.text()];
                        case 4:
                            responseBody = _a.apply(void 0, [_b.sent()]);
                            return [3 /*break*/, 7];
                        case 5:
                            error_1 = _b.sent();
                            console.warn('error getting response body for stack trace log:', error_1);
                            return [3 /*break*/, 7];
                        case 6:
                            resolve({ response: response, responseBody: responseBody });
                            return [7 /*endfinally*/];
                        case 7: return [3 /*break*/, 10];
                        case 8:
                            error_2 = _b.sent();
                            errorMessage = error_2;
                            reject(error_2);
                            return [3 /*break*/, 10];
                        case 9:
                            stackTrace = this.generateStackTraceCallLog(requestUrl, requestApi.request, startTimestamp, response, responseBody, errorMessage, requestApi.stackTraceLogExtraParams);
                            //push stack trace call log
                            this.stackTraceLog.push(stackTrace);
                            return [7 /*endfinally*/];
                        case 10: return [2 /*return*/];
                    }
                });
            }); });
        };
        //returns apiTypes outside the API class
        this.getApiTypes = function () { return _this.apiTypes; };
        //returns stackTraceLog outside the API class
        this.getStackTraceLog = function () { return _this.stackTraceLog; };
        //execute Fetch call for REST API, from all params and configurations and returns Promise with CallResponse type
        this.call = function (type, parameters) {
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var defaultParameters, internalParameters, requestApi_1, requestUrl_1, useFetchCall, _a, response, responseBody, retryCondition, result, interceptorResponse, finalResult, error_3;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 6, , 7]);
                            defaultParameters = { pathQueryParameters: [{ name: '', value: '' }], headers: {}, body: {} };
                            internalParameters = {
                                pathQueryParameters: (parameters === null || parameters === void 0 ? void 0 : parameters.pathQueryParameters) || defaultParameters.pathQueryParameters,
                                headers: (parameters === null || parameters === void 0 ? void 0 : parameters.headers) || defaultParameters.headers,
                                body: (parameters === null || parameters === void 0 ? void 0 : parameters.body) || defaultParameters.body,
                            };
                            requestApi_1 = this.getApi(type, internalParameters);
                            requestUrl_1 = this.generateUrl(requestApi_1, internalParameters);
                            useFetchCall = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.useFetch(requestUrl_1, requestApi_1)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); };
                            return [4 /*yield*/, useFetchCall()];
                        case 1:
                            _a = _b.sent(), response = _a.response, responseBody = _a.responseBody;
                            retryCondition = this.retryCondition(requestApi_1, response.status);
                            result = defaultResponse;
                            if (!retryCondition) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.manageRetry(requestApi_1, useFetchCall)];
                        case 2:
                            //if there's retryCondition will start the retries
                            result = _b.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            //else will be set the result with first useFetch call data
                            result = {
                                requestApi: requestApi_1,
                                response: response,
                                responseBody: responseBody,
                                retries: { quantity: 0, conditions: [] },
                            };
                            _b.label = 4;
                        case 4: return [4 /*yield*/, requestApi_1.responseInterceptor(result)];
                        case 5:
                            interceptorResponse = _b.sent();
                            finalResult = __assign(__assign({}, result), { interceptorResponse: interceptorResponse || {} });
                            //resolve without errors
                            resolve(finalResult);
                            return [3 /*break*/, 7];
                        case 6:
                            error_3 = _b.sent();
                            //resolve with errors
                            reject(error_3);
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
        };
        //set query paramenters to url
        this.setQueryParameters = function (url, queryParameters) {
            var newUrl = url;
            for (var _i = 0, queryParameters_1 = queryParameters; _i < queryParameters_1.length; _i++) {
                var parameter = queryParameters_1[_i];
                newUrl = newUrl.replace("{".concat(parameter.name, "}"), encodeURIComponent(parameter.value));
            }
            return newUrl;
        };
        //generate url with path and query parameters
        this.generateUrl = function (requestApi, parameters) {
            var url = requestApi.baseUrl + requestApi.path;
            return _this.setQueryParameters(url, parameters.pathQueryParameters);
        };
        //check if is a valid status code to make retries
        this.retryCondition = function (requestApi, statusCode) {
            var conditionsStatus = requestApi.retryCondition;
            var result = conditionsStatus.some(function (status) { return status === statusCode; }) || false;
            return result;
        };
        //handle retries with iteration of the quantity configured, the loop ends if the status code is ok
        this.manageRetry = function (requestApi, useFetchCall) {
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var resolved, result, numberOfRetry, retriedTimes, retriedConditions, i, _a, response, responseBody, error_4, error_5;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 7, , 8]);
                            resolved = false;
                            result = defaultResponse;
                            numberOfRetry = requestApi.retry;
                            if (numberOfRetry < 1)
                                throw new Error('"retry" parameter < 1');
                            retriedTimes = 0;
                            retriedConditions = [];
                            i = 0;
                            _b.label = 1;
                        case 1:
                            if (!(i < numberOfRetry)) return [3 /*break*/, 6];
                            if (!!resolved) return [3 /*break*/, 5];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, useFetchCall()];
                        case 3:
                            _a = _b.sent(), response = _a.response, responseBody = _a.responseBody;
                            retriedTimes++;
                            retriedConditions.push(response.status);
                            result = {
                                requestApi: requestApi,
                                response: response,
                                responseBody: responseBody,
                                retries: { quantity: retriedTimes, conditions: retriedConditions },
                            };
                            if (response.ok) {
                                resolved = true;
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            error_4 = _b.sent();
                            reject(error_4);
                            return [3 /*break*/, 5];
                        case 5:
                            i++;
                            return [3 /*break*/, 1];
                        case 6:
                            resolve(result);
                            return [3 /*break*/, 8];
                        case 7:
                            error_5 = _b.sent();
                            reject(error_5);
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
        };
        //throw Error if apiConstants is not defined
        if (!apiConstants)
            throw new Error('Error on API constructor: apiConstants not defined.');
        //remap endpoints as EndpointInternal type
        Object.keys(apiConstants.endpoints).forEach(function (key) {
            var endpoints = apiConstants.endpoints;
            var endpoint = apiConstants.endpoints[key];
            endpoints[key] = {
                baseUrl: endpoint.baseUrl || apiConstants.baseUrl,
                path: endpoint.path,
                request: endpoint.request || {},
                retry: endpoint.retry || 0,
                retryCondition: endpoint.retryCondition || [],
                ignoreGlobalParams: endpoint.ignoreGlobalParams || [],
                stackTraceLogExtraParams: endpoint.stackTraceLogExtraParams || {},
                requestInterceptor: endpoint.requestInterceptor || (function (endpoint) { return endpoint; }),
                responseInterceptor: endpoint.responseInterceptor || (function () { }),
            };
        });
        //remap globalParams as EndpointGlobalInternal type
        var internalGlobalParams = {
            request: ((_a = apiConstants.globalParams) === null || _a === void 0 ? void 0 : _a.request) || {},
            retry: ((_b = apiConstants.globalParams) === null || _b === void 0 ? void 0 : _b.retry) || 0,
            retryCondition: ((_c = apiConstants.globalParams) === null || _c === void 0 ? void 0 : _c.retryCondition) || [],
            stackTraceLogExtraParams: ((_d = apiConstants.globalParams) === null || _d === void 0 ? void 0 : _d.stackTraceLogExtraParams) || {},
            requestInterceptor: ((_e = apiConstants.globalParams) === null || _e === void 0 ? void 0 : _e.requestInterceptor) || (function (endpoint) { return endpoint; }),
            responseInterceptor: ((_f = apiConstants.globalParams) === null || _f === void 0 ? void 0 : _f.responseInterceptor) || (function () { }),
        };
        //initialize apiConstants as ApiConstantsInternal type
        this.apiConstants = __assign(__assign({}, apiConstants), { globalParams: internalGlobalParams });
        //initialize apiTypes to return array of strings of all endpoints object properties
        this.apiTypes = Object.keys(this.apiConstants.endpoints).reduce(function (o, key) {
            var _a;
            return (__assign(__assign({}, o), (_a = {}, _a[key] = key, _a)));
        }, {});
    }
    return API;
}());
exports.default = API;
