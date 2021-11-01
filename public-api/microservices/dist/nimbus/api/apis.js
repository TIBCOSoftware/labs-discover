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
__exportStar(require("./diagramImagesApi"), exports);
const diagramImagesApi_1 = require("./diagramImagesApi");
__exportStar(require("./diagramsApi"), exports);
const diagramsApi_1 = require("./diagramsApi");
__exportStar(require("./languagesApi"), exports);
const languagesApi_1 = require("./languagesApi");
__exportStar(require("./mapFoldersApi"), exports);
const mapFoldersApi_1 = require("./mapFoldersApi");
__exportStar(require("./mapsApi"), exports);
const mapsApi_1 = require("./mapsApi");
__exportStar(require("./resourceGroupsApi"), exports);
const resourceGroupsApi_1 = require("./resourceGroupsApi");
__exportStar(require("./resourcesApi"), exports);
const resourcesApi_1 = require("./resourcesApi");
__exportStar(require("./userAccountsApi"), exports);
const userAccountsApi_1 = require("./userAccountsApi");
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
exports.APIS = [diagramImagesApi_1.DiagramImagesApi, diagramsApi_1.DiagramsApi, languagesApi_1.LanguagesApi, mapFoldersApi_1.MapFoldersApi, mapsApi_1.MapsApi, resourceGroupsApi_1.ResourceGroupsApi, resourcesApi_1.ResourcesApi, userAccountsApi_1.UserAccountsApi];
//# sourceMappingURL=apis.js.map