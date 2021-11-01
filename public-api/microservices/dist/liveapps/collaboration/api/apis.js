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
__exportStar(require("./lastAccessChangesApi"), exports);
const lastAccessChangesApi_1 = require("./lastAccessChangesApi");
__exportStar(require("./notesApi"), exports);
const notesApi_1 = require("./notesApi");
__exportStar(require("./notificationsApi"), exports);
const notificationsApi_1 = require("./notificationsApi");
__exportStar(require("./rolesApi"), exports);
const rolesApi_1 = require("./rolesApi");
__exportStar(require("./threadsApi"), exports);
const threadsApi_1 = require("./threadsApi");
__exportStar(require("./topicsApi"), exports);
const topicsApi_1 = require("./topicsApi");
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
exports.APIS = [attributesApi_1.AttributesApi, lastAccessChangesApi_1.LastAccessChangesApi, notesApi_1.NotesApi, notificationsApi_1.NotificationsApi, rolesApi_1.RolesApi, threadsApi_1.ThreadsApi, topicsApi_1.TopicsApi];
//# sourceMappingURL=apis.js.map