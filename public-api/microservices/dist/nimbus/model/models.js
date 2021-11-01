"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoidAuth = exports.OAuth = exports.ApiKeyAuth = exports.HttpBearerAuth = exports.HttpBasicAuth = exports.ObjectSerializer = void 0;
__exportStar(require("./activityModel"), exports);
__exportStar(require("./activityModelBubbleText"), exports);
__exportStar(require("./activityModelBubbleTextText"), exports);
__exportStar(require("./activityModelChildDiagrams"), exports);
__exportStar(require("./activityModelCommentary"), exports);
__exportStar(require("./activityModelDiagramLink"), exports);
__exportStar(require("./activityModelPosition"), exports);
__exportStar(require("./activityModelResources"), exports);
__exportStar(require("./activityModelStatementLinks"), exports);
__exportStar(require("./activityModelStyle"), exports);
__exportStar(require("./activityModelStyleBackground"), exports);
__exportStar(require("./activityModelStylePen"), exports);
__exportStar(require("./amxBpmAttachment"), exports);
__exportStar(require("./dataTableAttachment"), exports);
__exportStar(require("./diagramAttachment"), exports);
__exportStar(require("./diagramCollection"), exports);
__exportStar(require("./diagramCollectionControlPanel"), exports);
__exportStar(require("./diagramCollectionControlPanelOwner"), exports);
__exportStar(require("./diagramCollectionDiagrams"), exports);
__exportStar(require("./diagramModel"), exports);
__exportStar(require("./diagramModelControlPanel"), exports);
__exportStar(require("./diagramModelLanguage"), exports);
__exportStar(require("./directFileAttachment"), exports);
__exportStar(require("./docRegistryAttachment"), exports);
__exportStar(require("./emailAttachment"), exports);
__exportStar(require("./excelDataLinkAttachment"), exports);
__exportStar(require("./exceptionSchema"), exports);
__exportStar(require("./flowlineModel"), exports);
__exportStar(require("./flowlineModelConnections"), exports);
__exportStar(require("./flowlineModelConnectionsInternalConnections"), exports);
__exportStar(require("./flowlineModelConnectionsStyle"), exports);
__exportStar(require("./flowlineModelDestObject"), exports);
__exportStar(require("./flowlineModelLinePoints"), exports);
__exportStar(require("./flowlineModelStyle"), exports);
__exportStar(require("./formvineAttachment"), exports);
__exportStar(require("./imageBoxModel"), exports);
__exportStar(require("./imageBoxModelHint"), exports);
__exportStar(require("./imageUploadResult"), exports);
__exportStar(require("./intImageAttachment"), exports);
__exportStar(require("./intWPAttachment"), exports);
__exportStar(require("./languageModel"), exports);
__exportStar(require("./languageModelItems"), exports);
__exportStar(require("./mapCollection"), exports);
__exportStar(require("./mapCollectionBreadcrumbs"), exports);
__exportStar(require("./mapFolderCollection"), exports);
__exportStar(require("./mapFolderModel"), exports);
__exportStar(require("./mapFolderModelAccessRights"), exports);
__exportStar(require("./mapFolderModelAccessRightsSpecific"), exports);
__exportStar(require("./mapFolderModelMaps"), exports);
__exportStar(require("./mapFolderModelSubFolders"), exports);
__exportStar(require("./mapModel"), exports);
__exportStar(require("./mapModelArchives"), exports);
__exportStar(require("./mapModelDraft"), exports);
__exportStar(require("./mapModelDraftOwner"), exports);
__exportStar(require("./menuFuncAttachment"), exports);
__exportStar(require("./oracleAttachment"), exports);
__exportStar(require("./resourceGroupMembers"), exports);
__exportStar(require("./resourceGroupMembersItems"), exports);
__exportStar(require("./resourceGroupModel"), exports);
__exportStar(require("./resourceGroupModelItems"), exports);
__exportStar(require("./resourceModel"), exports);
__exportStar(require("./resourceModelItems"), exports);
__exportStar(require("./sAPAttachment"), exports);
__exportStar(require("./salesforceAttachment"), exports);
__exportStar(require("./scorecardAttachment"), exports);
__exportStar(require("./spotfireAttachment"), exports);
__exportStar(require("./storyboardAttachment"), exports);
__exportStar(require("./textboxModel"), exports);
__exportStar(require("./textboxModelStyle"), exports);
__exportStar(require("./tibbrAttachment"), exports);
__exportStar(require("./uRLAttachment"), exports);
__exportStar(require("./userAccountModel"), exports);
__exportStar(require("./userAccountModelItems"), exports);
const activityModel_1 = require("./activityModel");
const activityModelBubbleText_1 = require("./activityModelBubbleText");
const activityModelBubbleTextText_1 = require("./activityModelBubbleTextText");
const activityModelChildDiagrams_1 = require("./activityModelChildDiagrams");
const activityModelCommentary_1 = require("./activityModelCommentary");
const activityModelDiagramLink_1 = require("./activityModelDiagramLink");
const activityModelPosition_1 = require("./activityModelPosition");
const activityModelResources_1 = require("./activityModelResources");
const activityModelStatementLinks_1 = require("./activityModelStatementLinks");
const activityModelStyle_1 = require("./activityModelStyle");
const activityModelStyleBackground_1 = require("./activityModelStyleBackground");
const activityModelStylePen_1 = require("./activityModelStylePen");
const amxBpmAttachment_1 = require("./amxBpmAttachment");
const dataTableAttachment_1 = require("./dataTableAttachment");
const diagramAttachment_1 = require("./diagramAttachment");
const diagramCollection_1 = require("./diagramCollection");
const diagramCollectionControlPanel_1 = require("./diagramCollectionControlPanel");
const diagramCollectionControlPanelOwner_1 = require("./diagramCollectionControlPanelOwner");
const diagramCollectionDiagrams_1 = require("./diagramCollectionDiagrams");
const diagramModel_1 = require("./diagramModel");
const diagramModelControlPanel_1 = require("./diagramModelControlPanel");
const diagramModelLanguage_1 = require("./diagramModelLanguage");
const directFileAttachment_1 = require("./directFileAttachment");
const docRegistryAttachment_1 = require("./docRegistryAttachment");
const emailAttachment_1 = require("./emailAttachment");
const excelDataLinkAttachment_1 = require("./excelDataLinkAttachment");
const exceptionSchema_1 = require("./exceptionSchema");
const flowlineModel_1 = require("./flowlineModel");
const flowlineModelConnections_1 = require("./flowlineModelConnections");
const flowlineModelConnectionsInternalConnections_1 = require("./flowlineModelConnectionsInternalConnections");
const flowlineModelConnectionsStyle_1 = require("./flowlineModelConnectionsStyle");
const flowlineModelDestObject_1 = require("./flowlineModelDestObject");
const flowlineModelLinePoints_1 = require("./flowlineModelLinePoints");
const flowlineModelStyle_1 = require("./flowlineModelStyle");
const formvineAttachment_1 = require("./formvineAttachment");
const imageBoxModel_1 = require("./imageBoxModel");
const imageBoxModelHint_1 = require("./imageBoxModelHint");
const imageUploadResult_1 = require("./imageUploadResult");
const intImageAttachment_1 = require("./intImageAttachment");
const intWPAttachment_1 = require("./intWPAttachment");
const languageModel_1 = require("./languageModel");
const languageModelItems_1 = require("./languageModelItems");
const mapCollection_1 = require("./mapCollection");
const mapCollectionBreadcrumbs_1 = require("./mapCollectionBreadcrumbs");
const mapFolderCollection_1 = require("./mapFolderCollection");
const mapFolderModel_1 = require("./mapFolderModel");
const mapFolderModelAccessRights_1 = require("./mapFolderModelAccessRights");
const mapFolderModelAccessRightsSpecific_1 = require("./mapFolderModelAccessRightsSpecific");
const mapFolderModelMaps_1 = require("./mapFolderModelMaps");
const mapFolderModelSubFolders_1 = require("./mapFolderModelSubFolders");
const mapModel_1 = require("./mapModel");
const mapModelArchives_1 = require("./mapModelArchives");
const mapModelDraft_1 = require("./mapModelDraft");
const mapModelDraftOwner_1 = require("./mapModelDraftOwner");
const menuFuncAttachment_1 = require("./menuFuncAttachment");
const oracleAttachment_1 = require("./oracleAttachment");
const resourceGroupMembers_1 = require("./resourceGroupMembers");
const resourceGroupMembersItems_1 = require("./resourceGroupMembersItems");
const resourceGroupModel_1 = require("./resourceGroupModel");
const resourceGroupModelItems_1 = require("./resourceGroupModelItems");
const resourceModel_1 = require("./resourceModel");
const resourceModelItems_1 = require("./resourceModelItems");
const sAPAttachment_1 = require("./sAPAttachment");
const salesforceAttachment_1 = require("./salesforceAttachment");
const scorecardAttachment_1 = require("./scorecardAttachment");
const spotfireAttachment_1 = require("./spotfireAttachment");
const storyboardAttachment_1 = require("./storyboardAttachment");
const textboxModel_1 = require("./textboxModel");
const textboxModelStyle_1 = require("./textboxModelStyle");
const tibbrAttachment_1 = require("./tibbrAttachment");
const uRLAttachment_1 = require("./uRLAttachment");
const userAccountModel_1 = require("./userAccountModel");
const userAccountModelItems_1 = require("./userAccountModelItems");
/* tslint:disable:no-unused-variable */
let primitives = [
    "string",
    "boolean",
    "double",
    "integer",
    "long",
    "float",
    "number",
    "any"
];
let enumsMap = {
    "ActivityModel.TagEnum": activityModel_1.ActivityModel.TagEnum,
    "ActivityModel.ObjectTypeEnum": activityModel_1.ActivityModel.ObjectTypeEnum,
    "ActivityModelBubbleTextText.FormatEnum": activityModelBubbleTextText_1.ActivityModelBubbleTextText.FormatEnum,
    "ActivityModelChildDiagrams.TypeEnum": activityModelChildDiagrams_1.ActivityModelChildDiagrams.TypeEnum,
    "ActivityModelResources.StatusEnum": activityModelResources_1.ActivityModelResources.StatusEnum,
    "ActivityModelResources.TypeEnum": activityModelResources_1.ActivityModelResources.TypeEnum,
    "AmxBpmAttachment.TypeEnum": amxBpmAttachment_1.AmxBpmAttachment.TypeEnum,
    "DataTableAttachment.TypeEnum": dataTableAttachment_1.DataTableAttachment.TypeEnum,
    "DiagramAttachment.TypeEnum": diagramAttachment_1.DiagramAttachment.TypeEnum,
    "DiagramCollectionControlPanel.AuthorizationStatusEnum": diagramCollectionControlPanel_1.DiagramCollectionControlPanel.AuthorizationStatusEnum,
    "DiagramModel.ModeEnum": diagramModel_1.DiagramModel.ModeEnum,
    "DiagramModelControlPanel.AuthorizationStatusEnum": diagramModelControlPanel_1.DiagramModelControlPanel.AuthorizationStatusEnum,
    "DirectFileAttachment.TypeEnum": directFileAttachment_1.DirectFileAttachment.TypeEnum,
    "DocRegistryAttachment.TypeEnum": docRegistryAttachment_1.DocRegistryAttachment.TypeEnum,
    "EmailAttachment.TypeEnum": emailAttachment_1.EmailAttachment.TypeEnum,
    "ExcelDataLinkAttachment.TypeEnum": excelDataLinkAttachment_1.ExcelDataLinkAttachment.TypeEnum,
    "FlowlineModel.ObjectTypeEnum": flowlineModel_1.FlowlineModel.ObjectTypeEnum,
    "FlowlineModelConnectionsInternalConnections.IntegrityStatusEnum": flowlineModelConnectionsInternalConnections_1.FlowlineModelConnectionsInternalConnections.IntegrityStatusEnum,
    "FlowlineModelDestObject.EdgeEnum": flowlineModelDestObject_1.FlowlineModelDestObject.EdgeEnum,
    "FormvineAttachment.TypeEnum": formvineAttachment_1.FormvineAttachment.TypeEnum,
    "ImageBoxModel.ObjectTypeEnum": imageBoxModel_1.ImageBoxModel.ObjectTypeEnum,
    "IntImageAttachment.TypeEnum": intImageAttachment_1.IntImageAttachment.TypeEnum,
    "IntWPAttachment.TypeEnum": intWPAttachment_1.IntWPAttachment.TypeEnum,
    "MapFolderModelAccessRights.DefaultEnum": mapFolderModelAccessRights_1.MapFolderModelAccessRights.DefaultEnum,
    "MapFolderModelAccessRightsSpecific.TypeEnum": mapFolderModelAccessRightsSpecific_1.MapFolderModelAccessRightsSpecific.TypeEnum,
    "MapFolderModelAccessRightsSpecific.AccessEnum": mapFolderModelAccessRightsSpecific_1.MapFolderModelAccessRightsSpecific.AccessEnum,
    "MenuFuncAttachment.TypeEnum": menuFuncAttachment_1.MenuFuncAttachment.TypeEnum,
    "OracleAttachment.TypeEnum": oracleAttachment_1.OracleAttachment.TypeEnum,
    "ResourceModel.StatusEnum": resourceModel_1.ResourceModel.StatusEnum,
    "ResourceModel.TypeEnum": resourceModel_1.ResourceModel.TypeEnum,
    "SAPAttachment.TypeEnum": sAPAttachment_1.SAPAttachment.TypeEnum,
    "SalesforceAttachment.TypeEnum": salesforceAttachment_1.SalesforceAttachment.TypeEnum,
    "ScorecardAttachment.TypeEnum": scorecardAttachment_1.ScorecardAttachment.TypeEnum,
    "SpotfireAttachment.TypeEnum": spotfireAttachment_1.SpotfireAttachment.TypeEnum,
    "StoryboardAttachment.TypeEnum": storyboardAttachment_1.StoryboardAttachment.TypeEnum,
    "TextboxModel.ObjectTypeEnum": textboxModel_1.TextboxModel.ObjectTypeEnum,
    "TibbrAttachment.TypeEnum": tibbrAttachment_1.TibbrAttachment.TypeEnum,
    "URLAttachment.TypeEnum": uRLAttachment_1.URLAttachment.TypeEnum,
};
let typeMap = {
    "ActivityModel": activityModel_1.ActivityModel,
    "ActivityModelBubbleText": activityModelBubbleText_1.ActivityModelBubbleText,
    "ActivityModelBubbleTextText": activityModelBubbleTextText_1.ActivityModelBubbleTextText,
    "ActivityModelChildDiagrams": activityModelChildDiagrams_1.ActivityModelChildDiagrams,
    "ActivityModelCommentary": activityModelCommentary_1.ActivityModelCommentary,
    "ActivityModelDiagramLink": activityModelDiagramLink_1.ActivityModelDiagramLink,
    "ActivityModelPosition": activityModelPosition_1.ActivityModelPosition,
    "ActivityModelResources": activityModelResources_1.ActivityModelResources,
    "ActivityModelStatementLinks": activityModelStatementLinks_1.ActivityModelStatementLinks,
    "ActivityModelStyle": activityModelStyle_1.ActivityModelStyle,
    "ActivityModelStyleBackground": activityModelStyleBackground_1.ActivityModelStyleBackground,
    "ActivityModelStylePen": activityModelStylePen_1.ActivityModelStylePen,
    "AmxBpmAttachment": amxBpmAttachment_1.AmxBpmAttachment,
    "DataTableAttachment": dataTableAttachment_1.DataTableAttachment,
    "DiagramAttachment": diagramAttachment_1.DiagramAttachment,
    "DiagramCollection": diagramCollection_1.DiagramCollection,
    "DiagramCollectionControlPanel": diagramCollectionControlPanel_1.DiagramCollectionControlPanel,
    "DiagramCollectionControlPanelOwner": diagramCollectionControlPanelOwner_1.DiagramCollectionControlPanelOwner,
    "DiagramCollectionDiagrams": diagramCollectionDiagrams_1.DiagramCollectionDiagrams,
    "DiagramModel": diagramModel_1.DiagramModel,
    "DiagramModelControlPanel": diagramModelControlPanel_1.DiagramModelControlPanel,
    "DiagramModelLanguage": diagramModelLanguage_1.DiagramModelLanguage,
    "DirectFileAttachment": directFileAttachment_1.DirectFileAttachment,
    "DocRegistryAttachment": docRegistryAttachment_1.DocRegistryAttachment,
    "EmailAttachment": emailAttachment_1.EmailAttachment,
    "ExcelDataLinkAttachment": excelDataLinkAttachment_1.ExcelDataLinkAttachment,
    "ExceptionSchema": exceptionSchema_1.ExceptionSchema,
    "FlowlineModel": flowlineModel_1.FlowlineModel,
    "FlowlineModelConnections": flowlineModelConnections_1.FlowlineModelConnections,
    "FlowlineModelConnectionsInternalConnections": flowlineModelConnectionsInternalConnections_1.FlowlineModelConnectionsInternalConnections,
    "FlowlineModelConnectionsStyle": flowlineModelConnectionsStyle_1.FlowlineModelConnectionsStyle,
    "FlowlineModelDestObject": flowlineModelDestObject_1.FlowlineModelDestObject,
    "FlowlineModelLinePoints": flowlineModelLinePoints_1.FlowlineModelLinePoints,
    "FlowlineModelStyle": flowlineModelStyle_1.FlowlineModelStyle,
    "FormvineAttachment": formvineAttachment_1.FormvineAttachment,
    "ImageBoxModel": imageBoxModel_1.ImageBoxModel,
    "ImageBoxModelHint": imageBoxModelHint_1.ImageBoxModelHint,
    "ImageUploadResult": imageUploadResult_1.ImageUploadResult,
    "IntImageAttachment": intImageAttachment_1.IntImageAttachment,
    "IntWPAttachment": intWPAttachment_1.IntWPAttachment,
    "LanguageModel": languageModel_1.LanguageModel,
    "LanguageModelItems": languageModelItems_1.LanguageModelItems,
    "MapCollection": mapCollection_1.MapCollection,
    "MapCollectionBreadcrumbs": mapCollectionBreadcrumbs_1.MapCollectionBreadcrumbs,
    "MapFolderCollection": mapFolderCollection_1.MapFolderCollection,
    "MapFolderModel": mapFolderModel_1.MapFolderModel,
    "MapFolderModelAccessRights": mapFolderModelAccessRights_1.MapFolderModelAccessRights,
    "MapFolderModelAccessRightsSpecific": mapFolderModelAccessRightsSpecific_1.MapFolderModelAccessRightsSpecific,
    "MapFolderModelMaps": mapFolderModelMaps_1.MapFolderModelMaps,
    "MapFolderModelSubFolders": mapFolderModelSubFolders_1.MapFolderModelSubFolders,
    "MapModel": mapModel_1.MapModel,
    "MapModelArchives": mapModelArchives_1.MapModelArchives,
    "MapModelDraft": mapModelDraft_1.MapModelDraft,
    "MapModelDraftOwner": mapModelDraftOwner_1.MapModelDraftOwner,
    "MenuFuncAttachment": menuFuncAttachment_1.MenuFuncAttachment,
    "OracleAttachment": oracleAttachment_1.OracleAttachment,
    "ResourceGroupMembers": resourceGroupMembers_1.ResourceGroupMembers,
    "ResourceGroupMembersItems": resourceGroupMembersItems_1.ResourceGroupMembersItems,
    "ResourceGroupModel": resourceGroupModel_1.ResourceGroupModel,
    "ResourceGroupModelItems": resourceGroupModelItems_1.ResourceGroupModelItems,
    "ResourceModel": resourceModel_1.ResourceModel,
    "ResourceModelItems": resourceModelItems_1.ResourceModelItems,
    "SAPAttachment": sAPAttachment_1.SAPAttachment,
    "SalesforceAttachment": salesforceAttachment_1.SalesforceAttachment,
    "ScorecardAttachment": scorecardAttachment_1.ScorecardAttachment,
    "SpotfireAttachment": spotfireAttachment_1.SpotfireAttachment,
    "StoryboardAttachment": storyboardAttachment_1.StoryboardAttachment,
    "TextboxModel": textboxModel_1.TextboxModel,
    "TextboxModelStyle": textboxModelStyle_1.TextboxModelStyle,
    "TibbrAttachment": tibbrAttachment_1.TibbrAttachment,
    "URLAttachment": uRLAttachment_1.URLAttachment,
    "UserAccountModel": userAccountModel_1.UserAccountModel,
    "UserAccountModelItems": userAccountModelItems_1.UserAccountModelItems,
};
class ObjectSerializer {
    static findCorrectType(data, expectedType) {
        if (data == undefined) {
            return expectedType;
        }
        else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        }
        else if (expectedType === "Date") {
            return expectedType;
        }
        else {
            if (enumsMap[expectedType]) {
                return expectedType;
            }
            if (!typeMap[expectedType]) {
                return expectedType; // w/e we don't know the type
            }
            // Check the discriminator
            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType; // the type does not have a discriminator. use it.
            }
            else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if (typeMap[discriminatorType]) {
                        return discriminatorType; // use the type given in the discriminator
                    }
                    else {
                        return expectedType; // discriminator did not map to a type
                    }
                }
                else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }
    static serialize(data, type) {
        if (data == undefined) {
            return data;
        }
        else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        }
        else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.serialize(datum, subType));
            }
            return transformedData;
        }
        else if (type === "Date") {
            return data.toISOString();
        }
        else {
            if (enumsMap[type]) {
                return data;
            }
            if (!typeMap[type]) { // in case we dont know the type
                return data;
            }
            // Get the actual type of this object
            type = this.findCorrectType(data, type);
            // get the map for the correct type.
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            let instance = {};
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type);
            }
            return instance;
        }
    }
    static deserialize(data, type) {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        }
        else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        }
        else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.deserialize(datum, subType));
            }
            return transformedData;
        }
        else if (type === "Date") {
            return new Date(data);
        }
        else {
            if (enumsMap[type]) { // is Enum
                return data;
            }
            if (!typeMap[type]) { // dont know the type
                return data;
            }
            let instance = new typeMap[type]();
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.name] = ObjectSerializer.deserialize(data[attributeType.baseName], attributeType.type);
            }
            return instance;
        }
    }
}
exports.ObjectSerializer = ObjectSerializer;
class HttpBasicAuth {
    constructor() {
        this.username = '';
        this.password = '';
    }
    applyToRequest(requestOptions) {
        requestOptions.auth = {
            username: this.username, password: this.password
        };
    }
}
exports.HttpBasicAuth = HttpBasicAuth;
class HttpBearerAuth {
    constructor() {
        this.accessToken = '';
    }
    applyToRequest(requestOptions) {
        if (requestOptions && requestOptions.headers) {
            const accessToken = typeof this.accessToken === 'function'
                ? this.accessToken()
                : this.accessToken;
            requestOptions.headers["Authorization"] = "Bearer " + accessToken;
        }
    }
}
exports.HttpBearerAuth = HttpBearerAuth;
class ApiKeyAuth {
    constructor(location, paramName) {
        this.location = location;
        this.paramName = paramName;
        this.apiKey = '';
    }
    applyToRequest(requestOptions) {
        if (this.location == "query") {
            requestOptions.qs[this.paramName] = this.apiKey;
        }
        else if (this.location == "header" && requestOptions && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        }
        else if (this.location == 'cookie' && requestOptions && requestOptions.headers) {
            if (requestOptions.headers['Cookie']) {
                requestOptions.headers['Cookie'] += '; ' + this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
            else {
                requestOptions.headers['Cookie'] = this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
        }
    }
}
exports.ApiKeyAuth = ApiKeyAuth;
class OAuth {
    constructor() {
        this.accessToken = '';
    }
    applyToRequest(requestOptions) {
        if (requestOptions && requestOptions.headers) {
            requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
        }
    }
}
exports.OAuth = OAuth;
class VoidAuth {
    constructor() {
        this.username = '';
        this.password = '';
    }
    applyToRequest(_) {
        // Do nothing
    }
}
exports.VoidAuth = VoidAuth;
//# sourceMappingURL=models.js.map