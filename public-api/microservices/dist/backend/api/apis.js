"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIS = exports.HttpError = void 0;
__exportStar(require("./assetsStorageOperationsApi"), exports);
const assetsStorageOperationsApi_1 = require("./assetsStorageOperationsApi");
__exportStar(require("./filesOperationsApi"), exports);
const filesOperationsApi_1 = require("./filesOperationsApi");
__exportStar(require("./loginApi"), exports);
const loginApi_1 = require("./loginApi");
__exportStar(require("./metricsApi"), exports);
const metricsApi_1 = require("./metricsApi");
__exportStar(require("./miningDataApi"), exports);
const miningDataApi_1 = require("./miningDataApi");
__exportStar(require("./sparkOneTimeJobApi"), exports);
const sparkOneTimeJobApi_1 = require("./sparkOneTimeJobApi");
__exportStar(require("./sparkPreviewJobApi"), exports);
const sparkPreviewJobApi_1 = require("./sparkPreviewJobApi");
__exportStar(require("./sparkScheduledJobApi"), exports);
const sparkScheduledJobApi_1 = require("./sparkScheduledJobApi");
__exportStar(require("./tibcoDataVirtualizationApi"), exports);
const tibcoDataVirtualizationApi_1 = require("./tibcoDataVirtualizationApi");
class HttpError extends Error {
    constructor(response, body, statusCode) {
        super('HTTP request failed');
        this.response = response;
        this.body = body;
        this.statusCode = statusCode;
        this.name = 'HttpError';
    }
}
exports.HttpError = HttpError;
exports.APIS = [assetsStorageOperationsApi_1.AssetsStorageOperationsApi, filesOperationsApi_1.FilesOperationsApi, loginApi_1.LoginApi, metricsApi_1.MetricsApi, miningDataApi_1.MiningDataApi, sparkOneTimeJobApi_1.SparkOneTimeJobApi, sparkPreviewJobApi_1.SparkPreviewJobApi, sparkScheduledJobApi_1.SparkScheduledJobApi, tibcoDataVirtualizationApi_1.TibcoDataVirtualizationApi];
//# sourceMappingURL=apis.js.map