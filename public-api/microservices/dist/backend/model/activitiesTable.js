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
exports.ActivitiesTable = void 0;
class ActivitiesTable {
    static getAttributeTypeMap() {
        return ActivitiesTable.attributeTypeMap;
    }
}
exports.ActivitiesTable = ActivitiesTable;
ActivitiesTable.discriminator = undefined;
ActivitiesTable.attributeTypeMap = [
    {
        "name": "analysisId",
        "baseName": "analysisId",
        "type": "string"
    },
    {
        "name": "activityName",
        "baseName": "activityName",
        "type": "string"
    },
    {
        "name": "id",
        "baseName": "id",
        "type": "object"
    },
    {
        "name": "totalOccurrences",
        "baseName": "totalOccurrences",
        "type": "object"
    },
    {
        "name": "totalFirst",
        "baseName": "totalFirst",
        "type": "object"
    },
    {
        "name": "totalLast",
        "baseName": "totalLast",
        "type": "object"
    },
    {
        "name": "isend",
        "baseName": "isend",
        "type": "object"
    },
    {
        "name": "isstart",
        "baseName": "isstart",
        "type": "object"
    }
];
//# sourceMappingURL=activitiesTable.js.map