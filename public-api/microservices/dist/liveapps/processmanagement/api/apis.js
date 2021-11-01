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
__exportStar(require("./instanceStatesApi"), exports);
const instanceStatesApi_1 = require("./instanceStatesApi");
__exportStar(require("./instancesApi"), exports);
const instancesApi_1 = require("./instancesApi");
__exportStar(require("./processesApi"), exports);
const processesApi_1 = require("./processesApi");
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
exports.APIS = [instanceStatesApi_1.InstanceStatesApi, instancesApi_1.InstancesApi, processesApi_1.ProcessesApi];
//# sourceMappingURL=apis.js.map