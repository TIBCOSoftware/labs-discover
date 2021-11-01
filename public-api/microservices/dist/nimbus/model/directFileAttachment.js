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
exports.DirectFileAttachment = void 0;
class DirectFileAttachment {
    static getAttributeTypeMap() {
        return DirectFileAttachment.attributeTypeMap;
    }
}
exports.DirectFileAttachment = DirectFileAttachment;
DirectFileAttachment.discriminator = undefined;
DirectFileAttachment.attributeTypeMap = [
    {
        "name": "filename",
        "baseName": "filename",
        "type": "string"
    },
    {
        "name": "id",
        "baseName": "id",
        "type": "string"
    },
    {
        "name": "title",
        "baseName": "title",
        "type": "string"
    },
    {
        "name": "type",
        "baseName": "type",
        "type": "DirectFileAttachment.TypeEnum"
    }
];
(function (DirectFileAttachment) {
    let TypeEnum;
    (function (TypeEnum) {
        TypeEnum[TypeEnum["DirectFile"] = 'directFile'] = "DirectFile";
    })(TypeEnum = DirectFileAttachment.TypeEnum || (DirectFileAttachment.TypeEnum = {}));
})(DirectFileAttachment = exports.DirectFileAttachment || (exports.DirectFileAttachment = {}));
//# sourceMappingURL=directFileAttachment.js.map