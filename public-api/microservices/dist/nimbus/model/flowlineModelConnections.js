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
exports.FlowlineModelConnections = void 0;
class FlowlineModelConnections {
    static getAttributeTypeMap() {
        return FlowlineModelConnections.attributeTypeMap;
    }
}
exports.FlowlineModelConnections = FlowlineModelConnections;
FlowlineModelConnections.discriminator = undefined;
FlowlineModelConnections.attributeTypeMap = [
    {
        "name": "externallyConnected",
        "baseName": "externallyConnected",
        "type": "boolean"
    },
    {
        "name": "internalConnections",
        "baseName": "internalConnections",
        "type": "Array<FlowlineModelConnectionsInternalConnections>"
    },
    {
        "name": "style",
        "baseName": "style",
        "type": "FlowlineModelConnectionsStyle"
    }
];
//# sourceMappingURL=flowlineModelConnections.js.map