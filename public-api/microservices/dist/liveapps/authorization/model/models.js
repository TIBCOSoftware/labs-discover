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
__exportStar(require("./claims"), exports);
__exportStar(require("./claimsGroup"), exports);
__exportStar(require("./claimsSandbox"), exports);
__exportStar(require("./claimsValues"), exports);
__exportStar(require("./errorAttribute"), exports);
__exportStar(require("./group"), exports);
__exportStar(require("./groupAllOf"), exports);
__exportStar(require("./groupDetails"), exports);
__exportStar(require("./modelError"), exports);
__exportStar(require("./parameter"), exports);
__exportStar(require("./sandbox"), exports);
__exportStar(require("./sandboxAllOf"), exports);
__exportStar(require("./sandboxContent"), exports);
__exportStar(require("./user"), exports);
__exportStar(require("./userAllOf"), exports);
__exportStar(require("./userDetails"), exports);
__exportStar(require("./userGroupMapping"), exports);
__exportStar(require("./userGroupMappingAllOf"), exports);
__exportStar(require("./userGroupMappingContent"), exports);
__exportStar(require("./userRule"), exports);
__exportStar(require("./userRuleContent"), exports);
__exportStar(require("./userRuleList"), exports);
__exportStar(require("./userRuleListAllOf"), exports);
const claims_1 = require("./claims");
const claimsGroup_1 = require("./claimsGroup");
const claimsSandbox_1 = require("./claimsSandbox");
const claimsValues_1 = require("./claimsValues");
const errorAttribute_1 = require("./errorAttribute");
const group_1 = require("./group");
const groupAllOf_1 = require("./groupAllOf");
const groupDetails_1 = require("./groupDetails");
const modelError_1 = require("./modelError");
const parameter_1 = require("./parameter");
const sandbox_1 = require("./sandbox");
const sandboxAllOf_1 = require("./sandboxAllOf");
const sandboxContent_1 = require("./sandboxContent");
const user_1 = require("./user");
const userAllOf_1 = require("./userAllOf");
const userDetails_1 = require("./userDetails");
const userGroupMapping_1 = require("./userGroupMapping");
const userGroupMappingAllOf_1 = require("./userGroupMappingAllOf");
const userGroupMappingContent_1 = require("./userGroupMappingContent");
const userRule_1 = require("./userRule");
const userRuleContent_1 = require("./userRuleContent");
const userRuleList_1 = require("./userRuleList");
const userRuleListAllOf_1 = require("./userRuleListAllOf");
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
    "ClaimsGroup.TypeEnum": claimsGroup_1.ClaimsGroup.TypeEnum,
    "ClaimsSandbox.TypeEnum": claimsSandbox_1.ClaimsSandbox.TypeEnum,
    "Group.TypeEnum": group_1.Group.TypeEnum,
    "GroupDetails.TypeEnum": groupDetails_1.GroupDetails.TypeEnum,
    "Sandbox.TypeEnum": sandbox_1.Sandbox.TypeEnum,
    "SandboxContent.TypeEnum": sandboxContent_1.SandboxContent.TypeEnum,
    "User.TypeEnum": user_1.User.TypeEnum,
    "UserDetails.TypeEnum": userDetails_1.UserDetails.TypeEnum,
};
let typeMap = {
    "Claims": claims_1.Claims,
    "ClaimsGroup": claimsGroup_1.ClaimsGroup,
    "ClaimsSandbox": claimsSandbox_1.ClaimsSandbox,
    "ClaimsValues": claimsValues_1.ClaimsValues,
    "ErrorAttribute": errorAttribute_1.ErrorAttribute,
    "Group": group_1.Group,
    "GroupAllOf": groupAllOf_1.GroupAllOf,
    "GroupDetails": groupDetails_1.GroupDetails,
    "ModelError": modelError_1.ModelError,
    "Parameter": parameter_1.Parameter,
    "Sandbox": sandbox_1.Sandbox,
    "SandboxAllOf": sandboxAllOf_1.SandboxAllOf,
    "SandboxContent": sandboxContent_1.SandboxContent,
    "User": user_1.User,
    "UserAllOf": userAllOf_1.UserAllOf,
    "UserDetails": userDetails_1.UserDetails,
    "UserGroupMapping": userGroupMapping_1.UserGroupMapping,
    "UserGroupMappingAllOf": userGroupMappingAllOf_1.UserGroupMappingAllOf,
    "UserGroupMappingContent": userGroupMappingContent_1.UserGroupMappingContent,
    "UserRule": userRule_1.UserRule,
    "UserRuleContent": userRuleContent_1.UserRuleContent,
    "UserRuleList": userRuleList_1.UserRuleList,
    "UserRuleListAllOf": userRuleListAllOf_1.UserRuleListAllOf,
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