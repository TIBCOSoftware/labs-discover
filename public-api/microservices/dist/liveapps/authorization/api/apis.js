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
__exportStar(require("./claimsApi"), exports);
const claimsApi_1 = require("./claimsApi");
__exportStar(require("./groupsApi"), exports);
const groupsApi_1 = require("./groupsApi");
__exportStar(require("./mappingsApi"), exports);
const mappingsApi_1 = require("./mappingsApi");
__exportStar(require("./parametersApi"), exports);
const parametersApi_1 = require("./parametersApi");
__exportStar(require("./sandboxesApi"), exports);
const sandboxesApi_1 = require("./sandboxesApi");
__exportStar(require("./userRulesApi"), exports);
const userRulesApi_1 = require("./userRulesApi");
__exportStar(require("./usersApi"), exports);
const usersApi_1 = require("./usersApi");
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
exports.APIS = [claimsApi_1.ClaimsApi, groupsApi_1.GroupsApi, mappingsApi_1.MappingsApi, parametersApi_1.ParametersApi, sandboxesApi_1.SandboxesApi, userRulesApi_1.UserRulesApi, usersApi_1.UsersApi];
//# sourceMappingURL=apis.js.map