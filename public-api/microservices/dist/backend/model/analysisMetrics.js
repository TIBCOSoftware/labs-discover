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
exports.AnalysisMetrics = void 0;
class AnalysisMetrics {
    static getAttributeTypeMap() {
        return AnalysisMetrics.attributeTypeMap;
    }
}
exports.AnalysisMetrics = AnalysisMetrics;
AnalysisMetrics.discriminator = undefined;
AnalysisMetrics.attributeTypeMap = [
    {
        "name": "numEvents",
        "baseName": "numEvents",
        "type": "number"
    },
    {
        "name": "numCases",
        "baseName": "numCases",
        "type": "number"
    },
    {
        "name": "numActivities",
        "baseName": "numActivities",
        "type": "number"
    },
    {
        "name": "avgTime",
        "baseName": "avgTime",
        "type": "number"
    },
    {
        "name": "medianTime",
        "baseName": "medianTime",
        "type": "number"
    },
    {
        "name": "minTime",
        "baseName": "minTime",
        "type": "number"
    },
    {
        "name": "maxTime",
        "baseName": "maxTime",
        "type": "number"
    },
    {
        "name": "numVariants",
        "baseName": "numVariants",
        "type": "number"
    },
    {
        "name": "maxActivities",
        "baseName": "maxActivities",
        "type": "number"
    },
    {
        "name": "minActivities",
        "baseName": "minActivities",
        "type": "number"
    },
    {
        "name": "avgActivities",
        "baseName": "avgActivities",
        "type": "number"
    },
    {
        "name": "numResources",
        "baseName": "numResources",
        "type": "number"
    },
    {
        "name": "avgResourcesPerCase",
        "baseName": "avgResourcesPerCase",
        "type": "number"
    },
    {
        "name": "maxResourcesPerCase",
        "baseName": "maxResourcesPerCase",
        "type": "number"
    },
    {
        "name": "minResourcesPerCase",
        "baseName": "minResourcesPerCase",
        "type": "number"
    },
    {
        "name": "minTimestamp",
        "baseName": "minTimestamp",
        "type": "string"
    },
    {
        "name": "maxTimestamp",
        "baseName": "maxTimestamp",
        "type": "string"
    }
];
//# sourceMappingURL=analysisMetrics.js.map