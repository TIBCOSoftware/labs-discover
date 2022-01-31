import localVarRequest from 'request';

export * from './activityModel';
export * from './activityModelBubbleText';
export * from './activityModelBubbleTextText';
export * from './activityModelChildDiagrams';
export * from './activityModelCommentary';
export * from './activityModelDiagramLink';
export * from './activityModelPosition';
export * from './activityModelResources';
export * from './activityModelStatementLinks';
export * from './activityModelStyle';
export * from './activityModelStyleBackground';
export * from './activityModelStylePen';
export * from './amxBpmAttachment';
export * from './dataTableAttachment';
export * from './diagramAttachment';
export * from './diagramCollection';
export * from './diagramCollectionControlPanel';
export * from './diagramCollectionControlPanelOwner';
export * from './diagramCollectionDiagrams';
export * from './diagramModel';
export * from './diagramModelControlPanel';
export * from './diagramModelLanguage';
export * from './directFileAttachment';
export * from './docRegistryAttachment';
export * from './emailAttachment';
export * from './excelDataLinkAttachment';
export * from './exceptionSchema';
export * from './flowlineModel';
export * from './flowlineModelConnections';
export * from './flowlineModelConnectionsInternalConnections';
export * from './flowlineModelConnectionsStyle';
export * from './flowlineModelDestObject';
export * from './flowlineModelLinePoints';
export * from './flowlineModelStyle';
export * from './formvineAttachment';
export * from './imageBoxModel';
export * from './imageBoxModelHint';
export * from './imageUploadResult';
export * from './intImageAttachment';
export * from './intWPAttachment';
export * from './languageModel';
export * from './languageModelItems';
export * from './mapCollection';
export * from './mapCollectionBreadcrumbs';
export * from './mapFolderCollection';
export * from './mapFolderModel';
export * from './mapFolderModelAccessRights';
export * from './mapFolderModelAccessRightsSpecific';
export * from './mapFolderModelMaps';
export * from './mapFolderModelSubFolders';
export * from './mapModel';
export * from './mapModelArchives';
export * from './mapModelDraft';
export * from './mapModelDraftOwner';
export * from './menuFuncAttachment';
export * from './oracleAttachment';
export * from './resourceGroupMembers';
export * from './resourceGroupMembersItems';
export * from './resourceGroupModel';
export * from './resourceGroupModelItems';
export * from './resourceModel';
export * from './resourceModelItems';
export * from './sAPAttachment';
export * from './salesforceAttachment';
export * from './scorecardAttachment';
export * from './spotfireAttachment';
export * from './storyboardAttachment';
export * from './textboxModel';
export * from './textboxModelStyle';
export * from './tibbrAttachment';
export * from './uRLAttachment';
export * from './userAccountModel';
export * from './userAccountModelItems';

import * as fs from 'fs';

export interface RequestDetailedFile {
    value: Buffer;
    options?: {
        filename?: string;
        contentType?: string;
    }
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;


import { ActivityModel } from './activityModel';
import { ActivityModelBubbleText } from './activityModelBubbleText';
import { ActivityModelBubbleTextText } from './activityModelBubbleTextText';
import { ActivityModelChildDiagrams } from './activityModelChildDiagrams';
import { ActivityModelCommentary } from './activityModelCommentary';
import { ActivityModelDiagramLink } from './activityModelDiagramLink';
import { ActivityModelPosition } from './activityModelPosition';
import { ActivityModelResources } from './activityModelResources';
import { ActivityModelStatementLinks } from './activityModelStatementLinks';
import { ActivityModelStyle } from './activityModelStyle';
import { ActivityModelStyleBackground } from './activityModelStyleBackground';
import { ActivityModelStylePen } from './activityModelStylePen';
import { AmxBpmAttachment } from './amxBpmAttachment';
import { DataTableAttachment } from './dataTableAttachment';
import { DiagramAttachment } from './diagramAttachment';
import { DiagramCollection } from './diagramCollection';
import { DiagramCollectionControlPanel } from './diagramCollectionControlPanel';
import { DiagramCollectionControlPanelOwner } from './diagramCollectionControlPanelOwner';
import { DiagramCollectionDiagrams } from './diagramCollectionDiagrams';
import { DiagramModel } from './diagramModel';
import { DiagramModelControlPanel } from './diagramModelControlPanel';
import { DiagramModelLanguage } from './diagramModelLanguage';
import { DirectFileAttachment } from './directFileAttachment';
import { DocRegistryAttachment } from './docRegistryAttachment';
import { EmailAttachment } from './emailAttachment';
import { ExcelDataLinkAttachment } from './excelDataLinkAttachment';
import { ExceptionSchema } from './exceptionSchema';
import { FlowlineModel } from './flowlineModel';
import { FlowlineModelConnections } from './flowlineModelConnections';
import { FlowlineModelConnectionsInternalConnections } from './flowlineModelConnectionsInternalConnections';
import { FlowlineModelConnectionsStyle } from './flowlineModelConnectionsStyle';
import { FlowlineModelDestObject } from './flowlineModelDestObject';
import { FlowlineModelLinePoints } from './flowlineModelLinePoints';
import { FlowlineModelStyle } from './flowlineModelStyle';
import { FormvineAttachment } from './formvineAttachment';
import { ImageBoxModel } from './imageBoxModel';
import { ImageBoxModelHint } from './imageBoxModelHint';
import { ImageUploadResult } from './imageUploadResult';
import { IntImageAttachment } from './intImageAttachment';
import { IntWPAttachment } from './intWPAttachment';
import { LanguageModel } from './languageModel';
import { LanguageModelItems } from './languageModelItems';
import { MapCollection } from './mapCollection';
import { MapCollectionBreadcrumbs } from './mapCollectionBreadcrumbs';
import { MapFolderCollection } from './mapFolderCollection';
import { MapFolderModel } from './mapFolderModel';
import { MapFolderModelAccessRights } from './mapFolderModelAccessRights';
import { MapFolderModelAccessRightsSpecific } from './mapFolderModelAccessRightsSpecific';
import { MapFolderModelMaps } from './mapFolderModelMaps';
import { MapFolderModelSubFolders } from './mapFolderModelSubFolders';
import { MapModel } from './mapModel';
import { MapModelArchives } from './mapModelArchives';
import { MapModelDraft } from './mapModelDraft';
import { MapModelDraftOwner } from './mapModelDraftOwner';
import { MenuFuncAttachment } from './menuFuncAttachment';
import { OracleAttachment } from './oracleAttachment';
import { ResourceGroupMembers } from './resourceGroupMembers';
import { ResourceGroupMembersItems } from './resourceGroupMembersItems';
import { ResourceGroupModel } from './resourceGroupModel';
import { ResourceGroupModelItems } from './resourceGroupModelItems';
import { ResourceModel } from './resourceModel';
import { ResourceModelItems } from './resourceModelItems';
import { SAPAttachment } from './sAPAttachment';
import { SalesforceAttachment } from './salesforceAttachment';
import { ScorecardAttachment } from './scorecardAttachment';
import { SpotfireAttachment } from './spotfireAttachment';
import { StoryboardAttachment } from './storyboardAttachment';
import { TextboxModel } from './textboxModel';
import { TextboxModelStyle } from './textboxModelStyle';
import { TibbrAttachment } from './tibbrAttachment';
import { URLAttachment } from './uRLAttachment';
import { UserAccountModel } from './userAccountModel';
import { UserAccountModelItems } from './userAccountModelItems';

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

let enumsMap: {[index: string]: any} = {
        "ActivityModel.TagEnum": ActivityModel.TagEnum,
        "ActivityModel.ObjectTypeEnum": ActivityModel.ObjectTypeEnum,
        "ActivityModelBubbleTextText.FormatEnum": ActivityModelBubbleTextText.FormatEnum,
        "ActivityModelChildDiagrams.TypeEnum": ActivityModelChildDiagrams.TypeEnum,
        "ActivityModelResources.StatusEnum": ActivityModelResources.StatusEnum,
        "ActivityModelResources.TypeEnum": ActivityModelResources.TypeEnum,
        "AmxBpmAttachment.TypeEnum": AmxBpmAttachment.TypeEnum,
        "DataTableAttachment.TypeEnum": DataTableAttachment.TypeEnum,
        "DiagramAttachment.TypeEnum": DiagramAttachment.TypeEnum,
        "DiagramCollectionControlPanel.AuthorizationStatusEnum": DiagramCollectionControlPanel.AuthorizationStatusEnum,
        "DiagramModel.ModeEnum": DiagramModel.ModeEnum,
        "DiagramModelControlPanel.AuthorizationStatusEnum": DiagramModelControlPanel.AuthorizationStatusEnum,
        "DirectFileAttachment.TypeEnum": DirectFileAttachment.TypeEnum,
        "DocRegistryAttachment.TypeEnum": DocRegistryAttachment.TypeEnum,
        "EmailAttachment.TypeEnum": EmailAttachment.TypeEnum,
        "ExcelDataLinkAttachment.TypeEnum": ExcelDataLinkAttachment.TypeEnum,
        "FlowlineModel.ObjectTypeEnum": FlowlineModel.ObjectTypeEnum,
        "FlowlineModelConnectionsInternalConnections.IntegrityStatusEnum": FlowlineModelConnectionsInternalConnections.IntegrityStatusEnum,
        "FlowlineModelDestObject.EdgeEnum": FlowlineModelDestObject.EdgeEnum,
        "FormvineAttachment.TypeEnum": FormvineAttachment.TypeEnum,
        "ImageBoxModel.ObjectTypeEnum": ImageBoxModel.ObjectTypeEnum,
        "IntImageAttachment.TypeEnum": IntImageAttachment.TypeEnum,
        "IntWPAttachment.TypeEnum": IntWPAttachment.TypeEnum,
        "MapFolderModelAccessRights.DefaultEnum": MapFolderModelAccessRights.DefaultEnum,
        "MapFolderModelAccessRightsSpecific.TypeEnum": MapFolderModelAccessRightsSpecific.TypeEnum,
        "MapFolderModelAccessRightsSpecific.AccessEnum": MapFolderModelAccessRightsSpecific.AccessEnum,
        "MenuFuncAttachment.TypeEnum": MenuFuncAttachment.TypeEnum,
        "OracleAttachment.TypeEnum": OracleAttachment.TypeEnum,
        "ResourceModel.StatusEnum": ResourceModel.StatusEnum,
        "ResourceModel.TypeEnum": ResourceModel.TypeEnum,
        "SAPAttachment.TypeEnum": SAPAttachment.TypeEnum,
        "SalesforceAttachment.TypeEnum": SalesforceAttachment.TypeEnum,
        "ScorecardAttachment.TypeEnum": ScorecardAttachment.TypeEnum,
        "SpotfireAttachment.TypeEnum": SpotfireAttachment.TypeEnum,
        "StoryboardAttachment.TypeEnum": StoryboardAttachment.TypeEnum,
        "TextboxModel.ObjectTypeEnum": TextboxModel.ObjectTypeEnum,
        "TibbrAttachment.TypeEnum": TibbrAttachment.TypeEnum,
        "URLAttachment.TypeEnum": URLAttachment.TypeEnum,
}

let typeMap: {[index: string]: any} = {
    "ActivityModel": ActivityModel,
    "ActivityModelBubbleText": ActivityModelBubbleText,
    "ActivityModelBubbleTextText": ActivityModelBubbleTextText,
    "ActivityModelChildDiagrams": ActivityModelChildDiagrams,
    "ActivityModelCommentary": ActivityModelCommentary,
    "ActivityModelDiagramLink": ActivityModelDiagramLink,
    "ActivityModelPosition": ActivityModelPosition,
    "ActivityModelResources": ActivityModelResources,
    "ActivityModelStatementLinks": ActivityModelStatementLinks,
    "ActivityModelStyle": ActivityModelStyle,
    "ActivityModelStyleBackground": ActivityModelStyleBackground,
    "ActivityModelStylePen": ActivityModelStylePen,
    "AmxBpmAttachment": AmxBpmAttachment,
    "DataTableAttachment": DataTableAttachment,
    "DiagramAttachment": DiagramAttachment,
    "DiagramCollection": DiagramCollection,
    "DiagramCollectionControlPanel": DiagramCollectionControlPanel,
    "DiagramCollectionControlPanelOwner": DiagramCollectionControlPanelOwner,
    "DiagramCollectionDiagrams": DiagramCollectionDiagrams,
    "DiagramModel": DiagramModel,
    "DiagramModelControlPanel": DiagramModelControlPanel,
    "DiagramModelLanguage": DiagramModelLanguage,
    "DirectFileAttachment": DirectFileAttachment,
    "DocRegistryAttachment": DocRegistryAttachment,
    "EmailAttachment": EmailAttachment,
    "ExcelDataLinkAttachment": ExcelDataLinkAttachment,
    "ExceptionSchema": ExceptionSchema,
    "FlowlineModel": FlowlineModel,
    "FlowlineModelConnections": FlowlineModelConnections,
    "FlowlineModelConnectionsInternalConnections": FlowlineModelConnectionsInternalConnections,
    "FlowlineModelConnectionsStyle": FlowlineModelConnectionsStyle,
    "FlowlineModelDestObject": FlowlineModelDestObject,
    "FlowlineModelLinePoints": FlowlineModelLinePoints,
    "FlowlineModelStyle": FlowlineModelStyle,
    "FormvineAttachment": FormvineAttachment,
    "ImageBoxModel": ImageBoxModel,
    "ImageBoxModelHint": ImageBoxModelHint,
    "ImageUploadResult": ImageUploadResult,
    "IntImageAttachment": IntImageAttachment,
    "IntWPAttachment": IntWPAttachment,
    "LanguageModel": LanguageModel,
    "LanguageModelItems": LanguageModelItems,
    "MapCollection": MapCollection,
    "MapCollectionBreadcrumbs": MapCollectionBreadcrumbs,
    "MapFolderCollection": MapFolderCollection,
    "MapFolderModel": MapFolderModel,
    "MapFolderModelAccessRights": MapFolderModelAccessRights,
    "MapFolderModelAccessRightsSpecific": MapFolderModelAccessRightsSpecific,
    "MapFolderModelMaps": MapFolderModelMaps,
    "MapFolderModelSubFolders": MapFolderModelSubFolders,
    "MapModel": MapModel,
    "MapModelArchives": MapModelArchives,
    "MapModelDraft": MapModelDraft,
    "MapModelDraftOwner": MapModelDraftOwner,
    "MenuFuncAttachment": MenuFuncAttachment,
    "OracleAttachment": OracleAttachment,
    "ResourceGroupMembers": ResourceGroupMembers,
    "ResourceGroupMembersItems": ResourceGroupMembersItems,
    "ResourceGroupModel": ResourceGroupModel,
    "ResourceGroupModelItems": ResourceGroupModelItems,
    "ResourceModel": ResourceModel,
    "ResourceModelItems": ResourceModelItems,
    "SAPAttachment": SAPAttachment,
    "SalesforceAttachment": SalesforceAttachment,
    "ScorecardAttachment": ScorecardAttachment,
    "SpotfireAttachment": SpotfireAttachment,
    "StoryboardAttachment": StoryboardAttachment,
    "TextboxModel": TextboxModel,
    "TextboxModelStyle": TextboxModelStyle,
    "TibbrAttachment": TibbrAttachment,
    "URLAttachment": URLAttachment,
    "UserAccountModel": UserAccountModel,
    "UserAccountModelItems": UserAccountModelItems,
}

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === "Date") {
            return expectedType;
        } else {
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
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if(typeMap[discriminatorType]){
                        return discriminatorType; // use the type given in the discriminator
                    } else {
                        return expectedType; // discriminator did not map to a type
                    }
                } else {
                    return expectedType; // discriminator was not present (or an empty string)
                }
            }
        }
    }

    public static serialize(data: any, type: string) {
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.serialize(datum, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return data.toISOString();
        } else {
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
            let instance: {[index: string]: any} = {};
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type);
            }
            return instance;
        }
    }

    public static deserialize(data: any, type: string) {
        // polymorphism may change the actual type.
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) { // string.startsWith pre es6
            let subType: string = type.replace("Array<", ""); // Array<Type> => Type>
            subType = subType.substring(0, subType.length - 1); // Type> => Type
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.deserialize(datum, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return new Date(data);
        } else {
            if (enumsMap[type]) {// is Enum
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

export interface Authentication {
    /**
    * Apply authentication settings to header and query params.
    */
    applyToRequest(requestOptions: localVarRequest.Options): Promise<void> | void;
}

export class HttpBasicAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        requestOptions.auth = {
            username: this.username, password: this.password
        }
    }
}

export class HttpBearerAuth implements Authentication {
    public accessToken: string | (() => string) = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            const accessToken = typeof this.accessToken === 'function'
                            ? this.accessToken()
                            : this.accessToken;
            requestOptions.headers["Authorization"] = "Bearer " + accessToken;
        }
    }
}

export class ApiKeyAuth implements Authentication {
    public apiKey: string = '';

    constructor(private location: string, private paramName: string) {
    }

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (this.location == "query") {
            (<any>requestOptions.qs)[this.paramName] = this.apiKey;
        } else if (this.location == "header" && requestOptions && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        } else if (this.location == 'cookie' && requestOptions && requestOptions.headers) {
            if (requestOptions.headers['Cookie']) {
                requestOptions.headers['Cookie'] += '; ' + this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
            else {
                requestOptions.headers['Cookie'] = this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
        }
    }
}

export class OAuth implements Authentication {
    public accessToken: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
        }
    }
}

export class VoidAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(_: localVarRequest.Options): void {
        // Do nothing
    }
}

export type Interceptor = (requestOptions: localVarRequest.Options) => (Promise<void> | void);
