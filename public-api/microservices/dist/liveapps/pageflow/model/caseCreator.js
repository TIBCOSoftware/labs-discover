"use strict";
/**
 * UP API
 * UP for Cloud BPM
 *
 * The version of the OpenAPI document: 1.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaseCreator = void 0;
/**
* CaseCreator
*/
class CaseCreator {
    static getAttributeTypeMap() {
        return CaseCreator.attributeTypeMap;
    }
}
exports.CaseCreator = CaseCreator;
CaseCreator.discriminator = undefined;
CaseCreator.attributeTypeMap = [
    {
        "name": "id",
        "baseName": "id",
        "type": "string"
    },
    {
        "name": "name",
        "baseName": "name",
        "type": "string"
    },
    {
        "name": "label",
        "baseName": "label",
        "type": "string"
    },
    {
        "name": "version",
        "baseName": "version",
        "type": "number"
    },
    {
        "name": "applicationId",
        "baseName": "applicationId",
        "type": "string"
    },
    {
        "name": "applicationName",
        "baseName": "applicationName",
        "type": "string"
    },
    {
        "name": "activityId",
        "baseName": "activityId",
        "type": "string"
    },
    {
        "name": "activityName",
        "baseName": "activityName",
        "type": "string"
    }
];
//# sourceMappingURL=caseCreator.js.map