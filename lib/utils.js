"use strict";
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
exports.generateGlobalArrayWithOverrides = void 0;
var generateGlobalArrayWithOverrides = function (globalArray, endpointArray) {
    var newGlobalArray = globalArray.filter(function (global) { return !endpointArray.some(function (endpoint) { return endpoint.statusCode === global.statusCode; }); });
    return __spreadArray(__spreadArray([], newGlobalArray, true), endpointArray, true);
};
exports.generateGlobalArrayWithOverrides = generateGlobalArrayWithOverrides;
