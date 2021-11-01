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
exports.FlowlineModel = void 0;
class FlowlineModel {
    static getAttributeTypeMap() {
        return FlowlineModel.attributeTypeMap;
    }
}
exports.FlowlineModel = FlowlineModel;
FlowlineModel.discriminator = undefined;
FlowlineModel.attributeTypeMap = [
    {
        "name": "commentary",
        "baseName": "commentary",
        "type": "ActivityModelCommentary"
    },
    {
        "name": "connections",
        "baseName": "connections",
        "type": "FlowlineModelConnections"
    },
    {
        "name": "destObject",
        "baseName": "destObject",
        "type": "FlowlineModelDestObject"
    },
    {
        "name": "flowlineId",
        "baseName": "flowlineId",
        "type": "string"
    },
    {
        "name": "linePoints",
        "baseName": "linePoints",
        "type": "Array<FlowlineModelLinePoints>"
    },
    {
        "name": "sourceObject",
        "baseName": "sourceObject",
        "type": "FlowlineModelDestObject"
    },
    {
        "name": "straight",
        "baseName": "straight",
        "type": "boolean"
    },
    {
        "name": "style",
        "baseName": "style",
        "type": "FlowlineModelStyle"
    },
    {
        "name": "text",
        "baseName": "text",
        "type": "ActivityModelBubbleTextText"
    },
    {
        "name": "textPosition",
        "baseName": "textPosition",
        "type": "ActivityModelPosition"
    },
    {
        "name": "attachments",
        "baseName": "attachments",
        "type": "Array<EmailAttachment | TibbrAttachment | ExcelDataLinkAttachment | DataTableAttachment | DirectFileAttachment | AmxBpmAttachment | SAPAttachment | ScorecardAttachment | IntImageAttachment | FormvineAttachment | MenuFuncAttachment | SpotfireAttachment | StoryboardAttachment | IntWPAttachment | DiagramAttachment | SalesforceAttachment | OracleAttachment | DocRegistryAttachment | URLAttachment>"
    },
    {
        "name": "objectId",
        "baseName": "objectId",
        "type": "string"
    },
    {
        "name": "position",
        "baseName": "position",
        "type": "ActivityModelPosition"
    },
    {
        "name": "objectType",
        "baseName": "objectType",
        "type": "FlowlineModel.ObjectTypeEnum"
    }
];
(function (FlowlineModel) {
    let ObjectTypeEnum;
    (function (ObjectTypeEnum) {
        ObjectTypeEnum[ObjectTypeEnum["Line"] = 'line'] = "Line";
    })(ObjectTypeEnum = FlowlineModel.ObjectTypeEnum || (FlowlineModel.ObjectTypeEnum = {}));
})(FlowlineModel = exports.FlowlineModel || (exports.FlowlineModel = {}));
//# sourceMappingURL=flowlineModel.js.map