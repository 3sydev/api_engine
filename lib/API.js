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
var node_fetch_1 = require("node-fetch");
var API = /** @class */ (function () {
    function API(apiConstants) {
        var _this = this;
        var _a, _b, _c, _d, _e;
        //returns endpoint from property string as EndpointInternal type
        this.getApi = function (type) {
            var apis = _this.apiConstants.endpoints;
            var globals = _this.apiConstants.globalParams;
            var api = apis[type];
            if (!api)
                throw new Error('Api type not defined');
            if (Object.keys(api.request).length === 0 && Object.keys(globals.request).length === 0)
                throw new Error('Request parameter not defined');
            var ignoreGlobalParams = api.ignoreGlobalParams;
            var result = {
                path: api.path,
                request: ignoreGlobalParams.includes('request') ? api.request : __assign(__assign({}, globals.request), api.request),
                retry: ignoreGlobalParams.includes('retry') ? api.retry : api.retry || globals.retry || 0,
                retryCondition: ignoreGlobalParams.includes('retryCondition') ? api.retryCondition : __spreadArray(__spreadArray([], globals.retryCondition, true), api.retryCondition, true),
                ignoreGlobalParams: ignoreGlobalParams,
                statusCodesActions: ignoreGlobalParams.includes('statusCodesActions') ? api.statusCodesActions : __spreadArray(__spreadArray([], globals.statusCodesActions, true), api.statusCodesActions, true),
                errorMessages: ignoreGlobalParams.includes('errorMessages') ? api.errorMessages : __spreadArray(__spreadArray([], globals.errorMessages, true), api.errorMessages, true),
            };
            return result;
        };
        //Execute fetch method and returns Promise as Fetch Respose type
        this.useFetch = function (requestUrl, requestInit) {
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var response, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, (0, node_fetch_1.default)(requestUrl, requestInit)];
                        case 1:
                            response = _a.sent();
                            resolve(response);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            reject(error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
        };
        //returns apiTypes outside the API class
        this.getApiTypes = function () { return _this.apiTypes; };
        //execute Fetch call for REST API, from all params and configurations and returns Promise with CallResponse type
        this.call = function (type, parameters) {
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var defaultParameters, internalParameters, requestApi, requestUrl_1, requestInit_1, useFetchCall, useFetchResponse, retryCondition, result, error_2;
                var _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 7, , 8]);
                            defaultParameters = { pathQueryParameters: [{ name: '', value: '' }], headers: {}, body: {} };
                            internalParameters = {
                                pathQueryParameters: (parameters === null || parameters === void 0 ? void 0 : parameters.pathQueryParameters) || defaultParameters.pathQueryParameters,
                                headers: (parameters === null || parameters === void 0 ? void 0 : parameters.headers) || defaultParameters.headers,
                                body: (parameters === null || parameters === void 0 ? void 0 : parameters.body) || defaultParameters.body,
                            };
                            requestApi = this.getApi(type);
                            requestUrl_1 = this.generateUrl(requestApi, internalParameters);
                            requestInit_1 = this.generateRequest(requestApi, parameters);
                            useFetchCall = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.useFetch(requestUrl_1, requestInit_1)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); };
                            return [4 /*yield*/, useFetchCall()];
                        case 1:
                            useFetchResponse = _b.sent();
                            //execute actions by status code received from useFetch call
                            return [4 /*yield*/, this.executeActionOnStatusCode(requestApi, useFetchResponse.status)];
                        case 2:
                            //execute actions by status code received from useFetch call
                            _b.sent();
                            retryCondition = this.retryCondition(requestApi, useFetchResponse.status);
                            result = {
                                requestApi: { path: '', request: {}, retry: 0, retryCondition: [], ignoreGlobalParams: [], statusCodesActions: [], errorMessages: [] },
                                response: {},
                                retries: { quantity: 0, conditions: [] },
                                errorStatus: { isInError: false, errorCode: '', errorMessage: '' },
                            };
                            if (!retryCondition) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.manageRetry(requestApi, useFetchCall)];
                        case 3:
                            //if there's retryCondition will start the retries
                            result = _b.sent();
                            return [3 /*break*/, 6];
                        case 4:
                            _a = { requestApi: requestApi, response: useFetchResponse, retries: { quantity: 0, conditions: [] } };
                            return [4 /*yield*/, this.generateErrorStatus(requestApi, useFetchResponse.status)];
                        case 5:
                            //else will be set the result with first useFetch call data
                            result = (_a.errorStatus = _b.sent(), _a);
                            _b.label = 6;
                        case 6:
                            //resolve without errors
                            resolve(result);
                            return [3 /*break*/, 8];
                        case 7:
                            error_2 = _b.sent();
                            //resolve with errors
                            reject(error_2);
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
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
            var url = _this.apiConstants.baseUrl + requestApi.path;
            return _this.setQueryParameters(url, parameters.pathQueryParameters);
        };
        //generate request for Fetch method as RequestInit type
        this.generateRequest = function (requestApi, parameters) {
            var _a = parameters || { headers: {}, body: undefined }, headers = _a.headers, _body = _a.body;
            var staticRequest = requestApi.request;
            var staticRequestBody = staticRequest.body;
            var body = _body ? JSON.stringify(__assign(__assign({}, JSON.parse(staticRequestBody)), JSON.parse(_body))) : staticRequestBody;
            var request = {
                method: staticRequest.method,
                headers: __assign(__assign({}, staticRequest.headers), headers),
                body: body,
            };
            return request;
        };
        //if found, execute action by status code
        this.executeActionOnStatusCode = function (requestApi, statusCode, isRetry) {
            if (isRetry === void 0) { isRetry = false; }
            return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                            var item, action, executeOnlyOn, error_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        item = requestApi.statusCodesActions.find(function (action) { return action.statusCode === statusCode; });
                                        action = item === null || item === void 0 ? void 0 : item.action;
                                        executeOnlyOn = item === null || item === void 0 ? void 0 : item.executeOnlyOn;
                                        if (!(action && (!executeOnlyOn || (executeOnlyOn === 'firstCall' && !isRetry) || (executeOnlyOn === 'retry' && isRetry)))) return [3 /*break*/, 2];
                                        return [4 /*yield*/, action()];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        resolve();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_3 = _a.sent();
                                        reject(error_3);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })];
                });
            });
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
                var resolved, result, numberOfRetry, retriedTimes, retriedConditions, i, response, error_4, error_5;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 9, , 10]);
                            resolved = false;
                            result = {
                                requestApi: { path: '', request: {}, retry: 0, retryCondition: [], ignoreGlobalParams: [], statusCodesActions: [], errorMessages: [] },
                                response: {},
                                retries: { quantity: 0, conditions: [] },
                                errorStatus: { isInError: false, errorCode: '', errorMessage: '' },
                            };
                            numberOfRetry = requestApi.retry;
                            if (numberOfRetry < 1)
                                throw new Error('"retry" parameter < 1');
                            retriedTimes = 0;
                            retriedConditions = [];
                            i = 0;
                            _b.label = 1;
                        case 1:
                            if (!(i < numberOfRetry)) return [3 /*break*/, 8];
                            if (!!resolved) return [3 /*break*/, 7];
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 6, , 7]);
                            return [4 /*yield*/, useFetchCall()];
                        case 3:
                            response = _b.sent();
                            retriedTimes++;
                            retriedConditions.push(response.status);
                            return [4 /*yield*/, this.executeActionOnStatusCode(requestApi, response.status, true)];
                        case 4:
                            _b.sent();
                            _a = {
                                requestApi: requestApi,
                                response: response,
                                retries: { quantity: retriedTimes, conditions: retriedConditions }
                            };
                            return [4 /*yield*/, this.generateErrorStatus(requestApi, response.status)];
                        case 5:
                            result = (_a.errorStatus = _b.sent(),
                                _a);
                            if (response.ok) {
                                resolved = true;
                            }
                            return [3 /*break*/, 7];
                        case 6:
                            error_4 = _b.sent();
                            reject(error_4);
                            return [3 /*break*/, 7];
                        case 7:
                            i++;
                            return [3 /*break*/, 1];
                        case 8:
                            resolve(result);
                            return [3 /*break*/, 10];
                        case 9:
                            error_5 = _b.sent();
                            reject(error_5);
                            return [3 /*break*/, 10];
                        case 10: return [2 /*return*/];
                    }
                });
            }); });
        };
        //generate error status as ErrorStatus type if is found in response
        this.generateErrorStatus = function (requestApi, statusCode) {
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var item, isInError, errorCode, errorMessage, action, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            item = requestApi.errorMessages.find(function (error) { return error.statusCode === statusCode; });
                            isInError = item ? true : false;
                            errorCode = (item === null || item === void 0 ? void 0 : item.errorCode) || '';
                            errorMessage = (item === null || item === void 0 ? void 0 : item.errorMessage) || '';
                            action = (item === null || item === void 0 ? void 0 : item.action) || function () { };
                            return [4 /*yield*/, action()];
                        case 1:
                            _a.sent();
                            resolve({ isInError: isInError, errorCode: errorCode, errorMessage: errorMessage });
                            return [3 /*break*/, 3];
                        case 2:
                            error_6 = _a.sent();
                            reject(new Error("Error executing errorMessage action: ".concat(error_6)));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
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
                path: endpoint.path,
                request: endpoint.request || {},
                retry: endpoint.retry || 0,
                retryCondition: endpoint.retryCondition || [],
                ignoreGlobalParams: endpoint.ignoreGlobalParams || [],
                statusCodesActions: endpoint.statusCodesActions || [],
                errorMessages: endpoint.errorMessages || [],
            };
        });
        //remap globalParams as EndpointGlobalInternal type
        var internalGlobalParams = {
            request: ((_a = apiConstants.globalParams) === null || _a === void 0 ? void 0 : _a.request) || {},
            retry: ((_b = apiConstants.globalParams) === null || _b === void 0 ? void 0 : _b.retry) || 0,
            retryCondition: ((_c = apiConstants.globalParams) === null || _c === void 0 ? void 0 : _c.retryCondition) || [],
            statusCodesActions: ((_d = apiConstants.globalParams) === null || _d === void 0 ? void 0 : _d.statusCodesActions) || [],
            errorMessages: ((_e = apiConstants.globalParams) === null || _e === void 0 ? void 0 : _e.errorMessages) || [],
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
