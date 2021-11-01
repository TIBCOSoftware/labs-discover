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
exports.CaseActionInstance = void 0;
/**
* CaseActionInstance
*/
class CaseActionInstance {
    static getAttributeTypeMap() {
        return CaseActionInstance.attributeTypeMap;
    }
}
exports.CaseActionInstance = CaseActionInstance;
CaseActionInstance.discriminator = undefined;
CaseActionInstance.attributeTypeMap = [
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
        "name": "version",
        "baseName": "version",
        "type": "number"
    },
    {
        "name": "data",
        "baseName": "data",
        "type": "string"
    },
    {
        "name": "applicationId",
        "baseName": "applicationId",
        "type": "string"
    },
    {
        "name": "activityName",
        "baseName": "activityName",
        "type": "string"
    }
];
//# sourceMappingURL=caseActionInstance.js.map