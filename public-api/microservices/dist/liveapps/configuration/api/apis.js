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
__exportStar(require("./attributesApi"), exports);
const attributesApi_1 = require("./attributesApi");
__exportStar(require("./linksApi"), exports);
const linksApi_1 = require("./linksApi");
__exportStar(require("./rolesApi"), exports);
const rolesApi_1 = require("./rolesApi");
__exportStar(require("./statesApi"), exports);
const statesApi_1 = require("./statesApi");
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
exports.APIS = [attributesApi_1.AttributesApi, linksApi_1.LinksApi, rolesApi_1.RolesApi, statesApi_1.StatesApi];
//# sourceMappingURL=apis.js.map