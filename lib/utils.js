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
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureJsonParse = exports.mergeResponseInterceptorsMethods = exports.mergeRequestInterceptorsMethods = void 0;
var mergeRequestInterceptorsMethods = function (methods) {
    return function (endpoint) {
        return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
            var finalEndpoint, _i, methods_1, method, _endpoint, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        finalEndpoint = endpoint;
                        _i = 0, methods_1 = methods;
                        _a.label = 1;
                    case 1:
                        if (!(_i < methods_1.length)) return [3 /*break*/, 4];
                        method = methods_1[_i];
                        return [4 /*yield*/, method(finalEndpoint)];
                    case 2:
                        _endpoint = _a.sent();
                        finalEndpoint = __assign(__assign({}, finalEndpoint), _endpoint);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        resolve(finalEndpoint);
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        reject(error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    };
};
exports.mergeRequestInterceptorsMethods = mergeRequestInterceptorsMethods;
var mergeResponseInterceptorsMethods = function (methods) {
    return function (response) {
        return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
            var finalInterceptorResponse, _i, methods_2, method, interceptorResponse, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        finalInterceptorResponse = {};
                        _i = 0, methods_2 = methods;
                        _a.label = 1;
                    case 1:
                        if (!(_i < methods_2.length)) return [3 /*break*/, 4];
                        method = methods_2[_i];
                        return [4 /*yield*/, method(response)];
                    case 2:
                        interceptorResponse = _a.sent();
                        finalInterceptorResponse = __assign(__assign({}, finalInterceptorResponse), (interceptorResponse || {}));
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        resolve(finalInterceptorResponse);
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        reject(error_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
    };
};
exports.mergeResponseInterceptorsMethods = mergeResponseInterceptorsMethods;
var secureJsonParse = function (value) {
    try {
        var parsedValue = JSON.parse(value);
        return parsedValue;
    }
    catch (e) {
        return value;
    }
};
exports.secureJsonParse = secureJsonParse;
