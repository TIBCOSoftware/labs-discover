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
exports.PublishedViews = void 0;
class PublishedViews {
    static getAttributeTypeMap() {
        return PublishedViews.attributeTypeMap;
    }
}
exports.PublishedViews = PublishedViews;
PublishedViews.discriminator = undefined;
PublishedViews.attributeTypeMap = [
    {
        "name": "DatasetName",
        "baseName": "DatasetName",
        "type": "string"
    },
    {
        "name": "Annotation",
        "baseName": "Annotation",
        "type": "string"
    },
    {
        "name": "DatasetPath",
        "baseName": "DatasetPath",
        "type": "string"
    },
    {
        "name": "CreationTime",
        "baseName": "CreationTime",
        "type": "number"
    },
    {
        "name": "ModificationTime",
        "baseName": "ModificationTime",
        "type": "number"
    }
];
//# sourceMappingURL=publishedViews.js.map