"use strict";
/**
 * TIBCO DISCOVER backend microservice
 * Api Layer for the backend of Project Discover
 *
 * The version of the OpenAPI document: 1.0
 * Contact: fcenedes@tibco.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionPerformedFiles = void 0;
class ActionPerformedFiles {
    static getAttributeTypeMap() {
        return ActionPerformedFiles.attributeTypeMap;
    }
}
exports.ActionPerformedFiles = ActionPerformedFiles;
ActionPerformedFiles.discriminator = undefined;
ActionPerformedFiles.attributeTypeMap = [
    {
        "name": "message",
        "baseName": "message",
        "type": "string"
    },
    {
        "name": "file",
        "baseName": "file",
        "type": "string"
    },
    {
        "name": "code",
        "baseName": "code",
        "type": "number"
    }
];
//# sourceMappingURL=actionPerformedFiles.js.map