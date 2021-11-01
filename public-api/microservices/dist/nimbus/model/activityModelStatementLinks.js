"use strict";
/**
 * TIBCO Nimbus Public REST API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityModelStatementLinks = void 0;
class ActivityModelStatementLinks {
    static getAttributeTypeMap() {
        return ActivityModelStatementLinks.attributeTypeMap;
    }
}
exports.ActivityModelStatementLinks = ActivityModelStatementLinks;
ActivityModelStatementLinks.discriminator = undefined;
ActivityModelStatementLinks.attributeTypeMap = [
    {
        "name": "linkId",
        "baseName": "linkId",
        "type": "number"
    },
    {
        "name": "statementId",
        "baseName": "statementId",
        "type": "number"
    },
    {
        "name": "statementName",
        "baseName": "statementName",
        "type": "string"
    },
    {
        "name": "setName",
        "baseName": "setName",
        "type": "string"
    }
];
//# sourceMappingURL=activityModelStatementLinks.js.map