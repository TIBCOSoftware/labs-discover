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
exports.DiagramCollectionControlPanel = void 0;
class DiagramCollectionControlPanel {
    static getAttributeTypeMap() {
        return DiagramCollectionControlPanel.attributeTypeMap;
    }
}
exports.DiagramCollectionControlPanel = DiagramCollectionControlPanel;
DiagramCollectionControlPanel.discriminator = undefined;
DiagramCollectionControlPanel.attributeTypeMap = [
    {
        "name": "owner",
        "baseName": "owner",
        "type": "DiagramCollectionControlPanelOwner"
    },
    {
        "name": "author",
        "baseName": "author",
        "type": "DiagramCollectionControlPanelOwner"
    },
    {
        "name": "version",
        "baseName": "version",
        "type": "string"
    },
    {
        "name": "title",
        "baseName": "title",
        "type": "string"
    },
    {
        "name": "description",
        "baseName": "description",
        "type": "string"
    },
    {
        "name": "authorizationStatus",
        "baseName": "authorizationStatus",
        "type": "DiagramCollectionControlPanel.AuthorizationStatusEnum"
    },
    {
        "name": "lockTitle",
        "baseName": "lockTitle",
        "type": "boolean"
    }
];
(function (DiagramCollectionControlPanel) {
    let AuthorizationStatusEnum;
    (function (AuthorizationStatusEnum) {
        AuthorizationStatusEnum[AuthorizationStatusEnum["UpdatePending"] = 'updatePending'] = "UpdatePending";
        AuthorizationStatusEnum[AuthorizationStatusEnum["AuthorizationPending"] = 'authorizationPending'] = "AuthorizationPending";
        AuthorizationStatusEnum[AuthorizationStatusEnum["PromotionReady"] = 'promotionReady'] = "PromotionReady";
        AuthorizationStatusEnum[AuthorizationStatusEnum["DraftLocked"] = 'draftLocked'] = "DraftLocked";
        AuthorizationStatusEnum[AuthorizationStatusEnum["Authorized"] = 'authorized'] = "Authorized";
    })(AuthorizationStatusEnum = DiagramCollectionControlPanel.AuthorizationStatusEnum || (DiagramCollectionControlPanel.AuthorizationStatusEnum = {}));
})(DiagramCollectionControlPanel = exports.DiagramCollectionControlPanel || (exports.DiagramCollectionControlPanel = {}));
//# sourceMappingURL=diagramCollectionControlPanel.js.map