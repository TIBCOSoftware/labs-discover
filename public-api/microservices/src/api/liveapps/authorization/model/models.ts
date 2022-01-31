import localVarRequest from 'request';

export * from './claims';
export * from './claimsGroup';
export * from './claimsSandbox';
export * from './claimsValues';
export * from './errorAttribute';
export * from './group';
export * from './groupAllOf';
export * from './groupDetails';
export * from './modelError';
export * from './parameter';
export * from './sandbox';
export * from './sandboxAllOf';
export * from './sandboxContent';
export * from './user';
export * from './userAllOf';
export * from './userDetails';
export * from './userGroupMapping';
export * from './userGroupMappingAllOf';
export * from './userGroupMappingContent';
export * from './userRule';
export * from './userRuleContent';
export * from './userRuleList';
export * from './userRuleListAllOf';

import * as fs from 'fs';

export interface RequestDetailedFile {
    value: Buffer;
    options?: {
        filename?: string;
        contentType?: string;
    }
}

export type RequestFile = string | Buffer | fs.ReadStream | RequestDetailedFile;


import { Claims } from './claims';
import { ClaimsGroup } from './claimsGroup';
import { ClaimsSandbox } from './claimsSandbox';
import { ClaimsValues } from './claimsValues';
import { ErrorAttribute } from './errorAttribute';
import { Group } from './group';
import { GroupAllOf } from './groupAllOf';
import { GroupDetails } from './groupDetails';
import { ModelError } from './modelError';
import { Parameter } from './parameter';
import { Sandbox } from './sandbox';
import { SandboxAllOf } from './sandboxAllOf';
import { SandboxContent } from './sandboxContent';
import { User } from './user';
import { UserAllOf } from './userAllOf';
import { UserDetails } from './userDetails';
import { UserGroupMapping } from './userGroupMapping';
import { UserGroupMappingAllOf } from './userGroupMappingAllOf';
import { UserGroupMappingContent } from './userGroupMappingContent';
import { UserRule } from './userRule';
import { UserRuleContent } from './userRuleContent';
import { UserRuleList } from './userRuleList';
import { UserRuleListAllOf } from './userRuleListAllOf';

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
        "ClaimsGroup.TypeEnum": ClaimsGroup.TypeEnum,
        "ClaimsSandbox.TypeEnum": ClaimsSandbox.TypeEnum,
        "Group.TypeEnum": Group.TypeEnum,
        "GroupDetails.TypeEnum": GroupDetails.TypeEnum,
        "Sandbox.TypeEnum": Sandbox.TypeEnum,
        "SandboxContent.TypeEnum": SandboxContent.TypeEnum,
        "User.TypeEnum": User.TypeEnum,
        "UserDetails.TypeEnum": UserDetails.TypeEnum,
}

let typeMap: {[index: string]: any} = {
    "Claims": Claims,
    "ClaimsGroup": ClaimsGroup,
    "ClaimsSandbox": ClaimsSandbox,
    "ClaimsValues": ClaimsValues,
    "ErrorAttribute": ErrorAttribute,
    "Group": Group,
    "GroupAllOf": GroupAllOf,
    "GroupDetails": GroupDetails,
    "ModelError": ModelError,
    "Parameter": Parameter,
    "Sandbox": Sandbox,
    "SandboxAllOf": SandboxAllOf,
    "SandboxContent": SandboxContent,
    "User": User,
    "UserAllOf": UserAllOf,
    "UserDetails": UserDetails,
    "UserGroupMapping": UserGroupMapping,
    "UserGroupMappingAllOf": UserGroupMappingAllOf,
    "UserGroupMappingContent": UserGroupMappingContent,
    "UserRule": UserRule,
    "UserRuleContent": UserRuleContent,
    "UserRuleList": UserRuleList,
    "UserRuleListAllOf": UserRuleListAllOf,
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
