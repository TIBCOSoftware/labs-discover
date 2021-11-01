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
__exportStar(require("./applicationVersionsApi"), exports);
const applicationVersionsApi_1 = require("./applicationVersionsApi");
__exportStar(require("./applicationsApi"), exports);
const applicationsApi_1 = require("./applicationsApi");
__exportStar(require("./artifactsApi"), exports);
const artifactsApi_1 = require("./artifactsApi");
__exportStar(require("./foldersApi"), exports);
const foldersApi_1 = require("./foldersApi");
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
exports.APIS = [applicationVersionsApi_1.ApplicationVersionsApi, applicationsApi_1.ApplicationsApi, artifactsApi_1.ArtifactsApi, foldersApi_1.FoldersApi];
//# sourceMappingURL=apis.js.map