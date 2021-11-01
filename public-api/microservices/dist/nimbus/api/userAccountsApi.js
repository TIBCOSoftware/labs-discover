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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAccountsApi = exports.UserAccountsApiApiKeys = void 0;
const request_1 = __importDefault(require("request"));
const models_1 = require("../model/models");
const models_2 = require("../model/models");
const apis_1 = require("./apis");
let defaultBasePath = 'https://nimbus.tenant-integration.tcie.pro/01FJBTV4SKXGQVB9ENR654CSFX/ctrlwebisapi.dll';
// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================
var UserAccountsApiApiKeys;
(function (UserAccountsApiApiKeys) {
    UserAccountsApiApiKeys[UserAccountsApiApiKeys["ApiKeyAuth"] = 0] = "ApiKeyAuth";
})(UserAccountsApiApiKeys = exports.UserAccountsApiApiKeys || (exports.UserAccountsApiApiKeys = {}));
class UserAccountsApi {
    constructor(basePathOrUsername, password, basePath) {
        this._basePath = defaultBasePath;
        this._defaultHeaders = {};
        this._useQuerystring = false;
        this.authentications = {
            'default': new models_1.VoidAuth(),
            'ApiKeyAuth': new models_2.ApiKeyAuth('header', 'Authorization'),
        };
        this.interceptors = [];
        if (password) {
            if (basePath) {
                this.basePath = basePath;
            }
        }
        else {
            if (basePathOrUsername) {
                this.basePath = basePathOrUsername;
            }
        }
    }
    set useQuerystring(value) {
        this._useQuerystring = value;
    }
    set basePath(basePath) {
        this._basePath = basePath;
    }
    set defaultHeaders(defaultHeaders) {
        this._defaultHeaders = defaultHeaders;
    }
    get defaultHeaders() {
        return this._defaultHeaders;
    }
    get basePath() {
        return this._basePath;
    }
    setDefaultAuthentication(auth) {
        this.authentications.default = auth;
    }
    setApiKey(key, value) {
        this.authentications[UserAccountsApiApiKeys[key]].apiKey = value;
    }
    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }
    /**
     *
     * @summary Fetch the user account details for the logged on user.
     */
    getMe(options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/api/v1/user-accounts/me';
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            Object.assign(localVarHeaderParams, options.headers);
            let localVarUseFormData = false;
            let localVarRequestOptions = {
                method: 'GET',
                qs: localVarQueryParameters,
                headers: localVarHeaderParams,
                uri: localVarPath,
                useQuerystring: this._useQuerystring,
                json: true,
            };
            let authenticationPromise = Promise.resolve();
            if (this.authentications.ApiKeyAuth.apiKey) {
                authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuth.applyToRequest(localVarRequestOptions));
            }
            authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
            let interceptorPromise = authenticationPromise;
            for (const interceptor of this.interceptors) {
                interceptorPromise = interceptorPromise.then(() => interceptor(localVarRequestOptions));
            }
            return interceptorPromise.then(() => {
                if (Object.keys(localVarFormParams).length) {
                    if (localVarUseFormData) {
                        localVarRequestOptions.formData = localVarFormParams;
                    }
                    else {
                        localVarRequestOptions.form = localVarFormParams;
                    }
                }
                return new Promise((resolve, reject) => {
                    request_1.default(localVarRequestOptions, (error, response, body) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            body = models_1.ObjectSerializer.deserialize(body, "UserAccountModel");
                            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                                resolve({ response: response, body: body });
                            }
                            else {
                                reject(new apis_1.HttpError(response, body, response.statusCode));
                            }
                        }
                    });
                });
            });
        });
    }
    /**
     *
     * @summary Fetch a specific user account by its id value.
     * @param userId Integer id of user account to use.
     */
    getUserAccount(userId, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/api/v1/user-accounts/{UserId}'
                .replace('{' + 'UserId' + '}', encodeURIComponent(String(userId)));
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            // verify required parameter 'userId' is not null or undefined
            if (userId === null || userId === undefined) {
                throw new Error('Required parameter userId was null or undefined when calling getUserAccount.');
            }
            Object.assign(localVarHeaderParams, options.headers);
            let localVarUseFormData = false;
            let localVarRequestOptions = {
                method: 'GET',
                qs: localVarQueryParameters,
                headers: localVarHeaderParams,
                uri: localVarPath,
                useQuerystring: this._useQuerystring,
                json: true,
            };
            let authenticationPromise = Promise.resolve();
            if (this.authentications.ApiKeyAuth.apiKey) {
                authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuth.applyToRequest(localVarRequestOptions));
            }
            authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
            let interceptorPromise = authenticationPromise;
            for (const interceptor of this.interceptors) {
                interceptorPromise = interceptorPromise.then(() => interceptor(localVarRequestOptions));
            }
            return interceptorPromise.then(() => {
                if (Object.keys(localVarFormParams).length) {
                    if (localVarUseFormData) {
                        localVarRequestOptions.formData = localVarFormParams;
                    }
                    else {
                        localVarRequestOptions.form = localVarFormParams;
                    }
                }
                return new Promise((resolve, reject) => {
                    request_1.default(localVarRequestOptions, (error, response, body) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            body = models_1.ObjectSerializer.deserialize(body, "UserAccountModel");
                            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                                resolve({ response: response, body: body });
                            }
                            else {
                                reject(new apis_1.HttpError(response, body, response.statusCode));
                            }
                        }
                    });
                });
            });
        });
    }
    /**
     * Find matching user accounts by specifiying a name to search for. This will search in the first name, last name, email address and account name. You can also specify an optional role to search for.
     * @summary Query user accounts by name or role.
     * @param name Specify text to search for in the first name, last name, email address and account name fields.
     * @param skip Used for pagination. Specify the number of records to skip when retrieving user account records.
     * @param top Used for pagination. Specify the number of records to include the response.
     * @param role Specify which role the users should be able to perform. Cannot be used with the \&quot;userType\&quot; query parameter.
     * @param userType Specify which account type to search for. Cannot be used with the \&quot;role\&quot; query parameter.
     * @param sortOrder Specify the order in which to return user account details.
     */
    getUserAccounts(name, skip, top, role, userType, sortOrder, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/api/v1/user-accounts';
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            if (name !== undefined) {
                localVarQueryParameters['name'] = models_1.ObjectSerializer.serialize(name, "string");
            }
            if (skip !== undefined) {
                localVarQueryParameters['skip'] = models_1.ObjectSerializer.serialize(skip, "number");
            }
            if (top !== undefined) {
                localVarQueryParameters['top'] = models_1.ObjectSerializer.serialize(top, "number");
            }
            if (role !== undefined) {
                localVarQueryParameters['role'] = models_1.ObjectSerializer.serialize(role, "'Any' | 'ContentAuthor' | 'ContentOwner' | 'ContentAuthorizer' | 'ContentReviewer' | 'StmtSetOwner' | 'StmtManager' | 'AuditManager' | 'StoryboardOwner' | 'StoryboardAuthor' | 'ActionOwner' | 'ActionAssignee' | 'ActionEditor' | 'ActionViewer' | 'ScorecardOwner'");
            }
            if (userType !== undefined) {
                localVarQueryParameters['userType'] = models_1.ObjectSerializer.serialize(userType, "'Administrator' | 'Author' | 'Contributor' | 'Unassigned'");
            }
            if (sortOrder !== undefined) {
                localVarQueryParameters['sortOrder'] = models_1.ObjectSerializer.serialize(sortOrder, "'LastName' | 'FirstName' | 'AccountName'");
            }
            Object.assign(localVarHeaderParams, options.headers);
            let localVarUseFormData = false;
            let localVarRequestOptions = {
                method: 'GET',
                qs: localVarQueryParameters,
                headers: localVarHeaderParams,
                uri: localVarPath,
                useQuerystring: this._useQuerystring,
                json: true,
            };
            let authenticationPromise = Promise.resolve();
            if (this.authentications.ApiKeyAuth.apiKey) {
                authenticationPromise = authenticationPromise.then(() => this.authentications.ApiKeyAuth.applyToRequest(localVarRequestOptions));
            }
            authenticationPromise = authenticationPromise.then(() => this.authentications.default.applyToRequest(localVarRequestOptions));
            let interceptorPromise = authenticationPromise;
            for (const interceptor of this.interceptors) {
                interceptorPromise = interceptorPromise.then(() => interceptor(localVarRequestOptions));
            }
            return interceptorPromise.then(() => {
                if (Object.keys(localVarFormParams).length) {
                    if (localVarUseFormData) {
                        localVarRequestOptions.formData = localVarFormParams;
                    }
                    else {
                        localVarRequestOptions.form = localVarFormParams;
                    }
                }
                return new Promise((resolve, reject) => {
                    request_1.default(localVarRequestOptions, (error, response, body) => {
                        if (error) {
                            reject(error);
                        }
                        else {
                            body = models_1.ObjectSerializer.deserialize(body, "UserAccountModelItems");
                            if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                                resolve({ response: response, body: body });
                            }
                            else {
                                reject(new apis_1.HttpError(response, body, response.statusCode));
                            }
                        }
                    });
                });
            });
        });
    }
}
exports.UserAccountsApi = UserAccountsApi;
//# sourceMappingURL=userAccountsApi.js.map