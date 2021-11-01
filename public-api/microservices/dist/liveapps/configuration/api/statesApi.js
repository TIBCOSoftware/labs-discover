"use strict";
/**
 * Shared Client State Service
 * The TIBCO Cloud(TM) Live Apps Shared Client State Service provides a mechanism for storing and publishing UI state information (such as client-specific customization parameters and views of the various managed objects within TIBCO(R) Live Apps -- cases, events, and so on) that can be used across different UI sessions for the same user, and also shared between users.  The actual State content that is passed in the body when a State is created is a JSON string that is opaque to the Shared Client Service. It is up to the client application to define its meaning.  When a State is created, it can be qualified with the following properties:   - _name_ is the name of the State (for example, \"defaultLanguage\").   - _scope_ is an optional means to further qualify the State. A client may want to scope State so that it applies only to a specific application, a particular customer, and so on.  To facilitate this, the State object contains an optional scope attribute, the value of which could be the ID for the application to which the State applies, or any other value useful to the client for scoping the State.  Then when the client gets the State related to the particular application, it would specify a filter of scope eq \'the application ID\'.   - _sandboxId_ provides another level of scoping. The sandboxId defaults to the production sandbox.  There are three types of State that may be created and used by client applications:  - __PRIVATE State__ - This is a State created by the client that is only applicable to the user that creates it.  Only the creating user can read, update, and delete a PRIVATE State (other than automatic cleanup by the service if the user, sandbox or subscription is deleted).  This type of State is used to store user-specific, named configuration for the creating user.  Some examples of PRIVATE State are the default language for a user, the color scheme/theme the user has chosen to use, persisted layout options in the UI (such as splitter locations), or private views.    Each combination of name/scope/sandboxId must be unique for each user in the subscription.    If a user is deleted from the subscription, all PRIVATE State for that user is automatically deleted by the service.  - __PUBLIC State__ - This type of State can be read by all users in the subscription, but can be updated or deleted only by users with OWNER or AUTHOR roles (for more information about roles, see below).    PUBLIC State is useful for client configuration that is visible to all users, possibly across multiple applications.  There can be at most one instance of any particular name/scope/sandboxId combination of PUBLIC State.  Examples of PUBLIC State are things like Session Monitor configuration or system default language.    A user must be in the Administrators group to create PUBLIC State.  - __SHARED State__ - This type of State is shared with other users via the Role [RECIPIENT, AUTHOR, or OWNER] defined on the State (for more information, see \"StateRole\" below).     There can be at most one instance of any particular name/scope/sandboxId combination of SHARED State.  Examples of this type of state are things like work views, event views and case views.  An OWNER creates the state that centrally defines the view and then assigns read access to other users via RECIPIENT role, which is a reference to a group in the Organization Model.     Note that a user may be an OWNER or AUTHOR, but not necessarily a RECIPIENT.  OWNERs and AUTHORs can, of course, read the state in the context of being an OWNER or an AUTHOR.  But if the API is used to get only States in which they are a RECIPIENT, the State is not returned if they are only an AUTHOR/OWNER, but not a RECIPIENT.  This means a user could have access to a view definition, but not necessarily get that view in their list of views when they log into the client.  This is useful for differentiating views for administrative purposes, as opposed to typical end-user views.  The REST API can be used to get State based on Role type.     All users are allowed to create SHARED State.  __StateAttribute__ An Attribute can be assigned to a State to further qualify it. The State Attribute can then be used to filter or sort State when getting or deleting State using the API.  For example, the client may store State with an Attribute called \"viewType\".  When storing State for a work view, the client would specify a value of \"Work View\" for this Attribute, and when storing state for a case view, it would specify a value of \"Case View\" for this Attribute.  Then if the client wants to get view definitions for just case views, it could get State and specify a filter of attributes/viewType eq \'Case View\'.  State Attributes are not modeled.  They are created by the client in an ad hoc fashion when needed.  The meaning of an Attribute is managed by the client.  Attribute values can only be of string type.  __StateRole__ The StateRole is used to control access to PUBLIC and SHARED State, as described below. Users with:    - RECIPIENT Role can only read the State.   - AUTHOR Role can read and update the State.   - OWNER Role can read, update, and delete the State.  The current User\'s memberships in the Organization Model determine what roles the user has, and therefore, the access the user has to a given State. The user who creates a State implicitly has a role of OWNER.  A User that is a member of the \'System: ADMINISTRATOR\' Group is implicitly assigned an OWNER Role for all PUBLIC and SHARED State.  This is an inherent behavior that cannot be modified.  There is no concept of Roles for PRIVATE State, as it is inherently owned and completely private to the creating user.  __StateLink__ A StateLink is an association that links one State to another.  Attributes can be assigned to a StateLink to qualify the nature of the association.
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: liveapps@tibco.com
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
exports.StatesApi = exports.StatesApiApiKeys = void 0;
const request_1 = __importDefault(require("request"));
const models_1 = require("../model/models");
const apis_1 = require("./apis");
let defaultBasePath = 'http://localhost/clientstate/v1';
// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================
var StatesApiApiKeys;
(function (StatesApiApiKeys) {
})(StatesApiApiKeys = exports.StatesApiApiKeys || (exports.StatesApiApiKeys = {}));
class StatesApi {
    constructor(basePathOrUsername, password, basePath) {
        this._basePath = defaultBasePath;
        this._defaultHeaders = {};
        this._useQuerystring = false;
        this.authentications = {
            'default': new models_1.VoidAuth(),
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
        this.authentications[StatesApiApiKeys[key]].apiKey = value;
    }
    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }
    /**
     * Creates a new State.  A State can be one of three different types: PRIVATE, PUBLIC or SHARED.  Once a State is created, its type cannot be changed.  - A PRIVATE State is accessible only to the creating user who inherently has create, read, update, and delete access to the State.  No other user can access this State.  Each user can have their own instance of a particular named State.  When a user is deleted from a subscription, the service will automatically delete all PRIVATE State for that user.  - A PUBLIC State is inherently readable by all users and can be updated/deleted only by users who have an appropriate AUTHOR or OWNER role defined.  - A SHARED State is shared with other users via the explicit OWNER/AUTHOR/RECIPIENT roles defined on the State.  <br>See the StateRole description for details on user access to PUBLIC and SHARED States.  <br>State names have a uniqueness constraint.  For PRIVATE State, the name must be unique per user, sandboxId, and scope.  For PUBLIC and SHARED State, the name must be unique per type, sandboxId, and scope.  State names are case-sensitive for uniqueness and filtering (see $filter parameter).  <br>A State can be optionally linked to other States.  <br>A State can optionally contain attributes that can be used by the client application to classify or give further meaning to the State.  These attributes are not modelled, therefore it is up to the client application to project the appropriate meaning.  Attribute names can be any combination of: letters, numbers, and the following four special characters: - (dash), _ (underscore), . (dot), $ (dollar).  Attribute names are case-sensitive for uniqueness and filtering.  Attributes can be used to filter States (see $filter parameter).  <br>A user must be in the Administrators group in order to create a PUBLIC State.  All users can create PRIVATE and SHARED State.
     * @summary Creates a State.
     * @param state The State to be added.
     */
    createState(state, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/states';
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json', 'text/plain'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            // verify required parameter 'state' is not null or undefined
            if (state === null || state === undefined) {
                throw new Error('Required parameter state was null or undefined when calling createState.');
            }
            Object.assign(localVarHeaderParams, options.headers);
            let localVarUseFormData = false;
            let localVarRequestOptions = {
                method: 'POST',
                qs: localVarQueryParameters,
                headers: localVarHeaderParams,
                uri: localVarPath,
                useQuerystring: this._useQuerystring,
                json: true,
                body: models_1.ObjectSerializer.serialize(state, "State")
            };
            let authenticationPromise = Promise.resolve();
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
                            body = models_1.ObjectSerializer.deserialize(body, "string");
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
     * Deletes the State matching the given id.
     * @summary Deletes a State.
     * @param id The identifier for a State.
     */
    deleteState(id, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/states/{id}'
                .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json', 'text/plain'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new Error('Required parameter id was null or undefined when calling deleteState.');
            }
            Object.assign(localVarHeaderParams, options.headers);
            let localVarUseFormData = false;
            let localVarRequestOptions = {
                method: 'DELETE',
                qs: localVarQueryParameters,
                headers: localVarHeaderParams,
                uri: localVarPath,
                useQuerystring: this._useQuerystring,
                json: true,
            };
            let authenticationPromise = Promise.resolve();
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
     * Deletes States determined by the $filter query parameter, which is required.  For rules about which users can delete a State, see the description for StateRole and POST /states.
     * @summary Deletes States.
     * @param $filter The filter query option is used to define specific queries, based on inherent State properties (id, name, description, type, sandboxId, scope, createdDate, createdByName, createdById, modifiedDate, modifiedByName, modifiedById, isOrphaned, isAbandoned), roles assigned (roleEntityId, roleType), or any attributes defined for the State, that will return the required set of items.  Attribute names on the State are qualified in the filter expression with the \&#39;attributes/\&#39; prefix, that is, attributes/attrName eq \&#39;value\&#39;.  Both State name and Attribute name are case-sensitive (a filter with name eq \&#39;Case Example\&#39; or attributes/attrName eq \&#39;Case Example\&#39; matches \&#39;Case Example\&#39;, but not \&#39;case example\&#39;).  If the filter does not explicitly contain a filter clause for roleType, by default, only State items for the RECIPIENT roleType are returned.  If the filter does not explicitly contain a filter clause for type, by default, States of all types are returned.  For more information, see the _Filtering and Sorting_ Key Concepts page.
     */
    deleteStates($filter, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/states';
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json', 'text/plain'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            if ($filter !== undefined) {
                localVarQueryParameters['$filter'] = models_1.ObjectSerializer.serialize($filter, "string");
            }
            Object.assign(localVarHeaderParams, options.headers);
            let localVarUseFormData = false;
            let localVarRequestOptions = {
                method: 'DELETE',
                qs: localVarQueryParameters,
                headers: localVarHeaderParams,
                uri: localVarPath,
                useQuerystring: this._useQuerystring,
                json: true,
            };
            let authenticationPromise = Promise.resolve();
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
     * Returns States that are linked from the State matching the id and determined by the supplied query parameters.
     * @summary Gets linked-from States.
     * @param id The identifier for a State.
     * @param $skip Skips the specified number of items from the beginning of the list that would normally be returned.  These skipped items are not included in the result. - For example, \&#39;$skip&#x3D;80\&#39; will not return the first 80 items that would otherwise be returned from the REST call.  Subsequent items are returned, starting with the 81st item in the list.  The value must be 0 or greater.  An empty string is ignored. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $skip can change from one call to the next.
     * @param $top Returns only this number of items from the start of the list that would be returned (subject to any use of $skip). - For example, \&#39;$top&#x3D;20\&#39; results in only the first 20 items from the list being returned.  The value must be 1 or greater and less than or equal to a maximum value of 500.  If not specified (or set to an empty string), a default value of 50 is used.  The maximum and default values do not apply when $count is set to true. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $top can change from one call to the next.
     * @param $filter The filter query option is used to define specific queries, based on inherent State properties (id, name, description, type, sandboxId, scope, createdDate, createdByName, createdById, modifiedDate, modifiedByName, modifiedById, isOrphaned, isAbandoned), roles assigned (roleEntityId, roleType), or any attributes defined for the State, that will return the required set of items.  Attribute names on the State are qualified in the filter expression with the \&#39;attributes/\&#39; prefix, that is, attributes/attrName eq \&#39;value\&#39;.  Both State name and Attribute name are case-sensitive (a filter with name eq \&#39;Case Example\&#39; or attributes/attrName eq \&#39;Case Example\&#39; matches \&#39;Case Example\&#39;, but not \&#39;case example\&#39;).  If the filter does not explicitly contain a filter clause for roleType, by default, only State items for the RECIPIENT roleType are returned.  If the filter does not explicitly contain a filter clause for type, by default, States of all types are returned.  For more information, see the _Filtering and Sorting_ Key Concepts page.
     * @param $orderby This query option is used to request items in either ascending order using __asc__ or descending order using __desc__, based on one of the resource properties (id, name, description, type, sandboxId, scope, createdDate, createdByName, createdById, modifiedDate, modifiedByName, modifiedById, isOrphaned, isAbandoned).  If neither __asc__ nor __desc__ is specified, ascending order is used.  For example, if \&#39;$orderby&#x3D;name desc\&#39; is used, assuming that name is a string, the returned items are sorted in reverse alphabetical order according to the name property.  To sort on multiple properties, use a comma-separated list, for example, \&#39;$orderby&#x3D;type asc, name desc\&#39; first sorts against type, and then for each type, sorts that set of returned items according to the reverse alphabetical order of the name property.  The default order is by name ASC. For more information, see the _Filtering and Sorting_ Key Concepts page.
     * @param $search The $search query restricts the result to include only those States matching the specified search expression.  This performs a textual search on the JSON string of the StateContent.  For example, \&#39;$search&#x3D;Scottsdale\&#39; returns States where the sub-string \&#39;Scottsdale\&#39; is located somewhere within the JSON string of the State content property.
     * @param $select This query option is used to specify the specific property values from the State to be returned.  Other property values not included in the $select list are returned as null.  The property names are specified as a comma-separated string that can contain any of [\&quot;name\&quot;, \&quot;content\&quot;, \&quot;type\&quot;, \&quot;description\&quot;, \&quot;attributes\&quot;, \&quot;roles\&quot;, \&quot;links\&quot;, \&quot;id\&quot;, \&quot;sandboxId\&quot;, \&quot;scope\&quot;, \&quot;createdById\&quot;, \&quot;createdByName\&quot;, \&quot;createdDate\&quot;, \&quot;modifiedById\&quot;, \&quot;modifiedByName\&quot;, \&quot;modifiedDate\&quot;, \&quot;isOrphaned\&quot;, \&quot;isAbandoned\&quot;].  For example, \&#39;$select&#x3D;content,type,id\&#39; results in only the content, type and id property values being returned.
     * @param $count Return a simple number only, this being the count of the items that would be returned from the request if the count query option was not present.  Note that the assigned value for $count is true, that is, the correct use of the count query option is \&#39;$count&#x3D;true\&#39;.  If \&#39;$count&#x3D;false\&#39; is used, this has no effect.  It is recognized that $count is an expensive operation and should not be used by clients without consideration.
     */
    getLinkedFromStates(id, $skip, $top, $filter, $orderby, $search, $select, $count, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/states/{id}/linkedFromStates'
                .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json', 'text/plain'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new Error('Required parameter id was null or undefined when calling getLinkedFromStates.');
            }
            if ($skip !== undefined) {
                localVarQueryParameters['$skip'] = models_1.ObjectSerializer.serialize($skip, "string");
            }
            if ($top !== undefined) {
                localVarQueryParameters['$top'] = models_1.ObjectSerializer.serialize($top, "string");
            }
            if ($filter !== undefined) {
                localVarQueryParameters['$filter'] = models_1.ObjectSerializer.serialize($filter, "string");
            }
            if ($orderby !== undefined) {
                localVarQueryParameters['$orderby'] = models_1.ObjectSerializer.serialize($orderby, "string");
            }
            if ($search !== undefined) {
                localVarQueryParameters['$search'] = models_1.ObjectSerializer.serialize($search, "string");
            }
            if ($select !== undefined) {
                localVarQueryParameters['$select'] = models_1.ObjectSerializer.serialize($select, "string");
            }
            if ($count !== undefined) {
                localVarQueryParameters['$count'] = models_1.ObjectSerializer.serialize($count, "string");
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
                            body = models_1.ObjectSerializer.deserialize(body, "Array<State>");
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
     * Returns States that have a link to the State matching the id and determined by the supplied query parameters.
     * @summary Gets linked-to States.
     * @param id The identifier for a State.
     * @param $skip Skips the specified number of items from the beginning of the list that would normally be returned.  These skipped items are not included in the result. - For example, \&#39;$skip&#x3D;80\&#39; will not return the first 80 items that would otherwise be returned from the REST call.  Subsequent items are returned, starting with the 81st item in the list.  The value must be 0 or greater.  An empty string is ignored. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $skip can change from one call to the next.
     * @param $top Returns only this number of items from the start of the list that would be returned (subject to any use of $skip). - For example, \&#39;$top&#x3D;20\&#39; results in only the first 20 items from the list being returned.  The value must be 1 or greater and less than or equal to a maximum value of 500.  If not specified (or set to an empty string), a default value of 50 is used.  The maximum and default values do not apply when $count is set to true. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $top can change from one call to the next.
     * @param $filter The filter query option is used to define specific queries, based on inherent State properties (id, name, description, type, sandboxId, scope, createdDate, createdByName, createdById, modifiedDate, modifiedByName, modifiedById, isOrphaned, isAbandoned), roles assigned (roleEntityId, roleType), or any attributes defined for the State, that will return the required set of items.  Attribute names on the State are qualified in the filter expression with the \&#39;attributes/\&#39; prefix, that is, attributes/attrName eq \&#39;value\&#39;.  Both State name and Attribute name are case-sensitive (a filter with name eq \&#39;Case Example\&#39; or attributes/attrName eq \&#39;Case Example\&#39; matches \&#39;Case Example\&#39;, but not \&#39;case example\&#39;).  If the filter does not explicitly contain a filter clause for roleType, by default, only State items for the RECIPIENT roleType are returned.  If the filter does not explicitly contain a filter clause for type, by default, States of all types are returned.  For more information, see the _Filtering and Sorting_ Key Concepts page.
     * @param $orderby This query option is used to request items in either ascending order using __asc__ or descending order using __desc__, based on one of the resource properties (id, name, description, type, sandboxId, scope, createdDate, createdByName, createdById, modifiedDate, modifiedByName, modifiedById, isOrphaned, isAbandoned).  If neither __asc__ nor __desc__ is specified, ascending order is used.  For example, if \&#39;$orderby&#x3D;name desc\&#39; is used, assuming that name is a string, the returned items are sorted in reverse alphabetical order according to the name property.  To sort on multiple properties, use a comma-separated list, for example, \&#39;$orderby&#x3D;type asc, name desc\&#39; first sorts against type, and then for each type, sorts that set of returned items according to the reverse alphabetical order of the name property.  The default order is by name ASC. For more information, see the _Filtering and Sorting_ Key Concepts page.
     * @param $search The $search query restricts the result to include only those States matching the specified search expression.  This performs a textual search on the JSON string of the StateContent.  For example, \&#39;$search&#x3D;Scottsdale\&#39; returns States where the sub-string \&#39;Scottsdale\&#39; is located somewhere within the JSON string of the State content property.
     * @param $select This query option is used to specify the specific property values from the State to be returned.  Other property values not included in the $select list are returned as null.  The property names are specified as a comma-separated string that can contain any of [\&quot;name\&quot;, \&quot;content\&quot;, \&quot;type\&quot;, \&quot;description\&quot;, \&quot;attributes\&quot;, \&quot;roles\&quot;, \&quot;links\&quot;, \&quot;id\&quot;, \&quot;sandboxId\&quot;, \&quot;scope\&quot;, \&quot;createdById\&quot;, \&quot;createdByName\&quot;, \&quot;createdDate\&quot;, \&quot;modifiedById\&quot;, \&quot;modifiedByName\&quot;, \&quot;modifiedDate\&quot;, \&quot;isOrphaned\&quot;, \&quot;isAbandoned\&quot;].  For example, \&#39;$select&#x3D;content,type,id\&#39; results in only the content, type and id property values being returned.
     * @param $count Return a simple number only, this being the count of the items that would be returned from the request if the count query option was not present.  Note that the assigned value for $count is true, that is, the correct use of the count query option is \&#39;$count&#x3D;true\&#39;.  If \&#39;$count&#x3D;false\&#39; is used, this has no effect.  It is recognized that $count is an expensive operation and should not be used by clients without consideration.
     */
    getLinkedToStates(id, $skip, $top, $filter, $orderby, $search, $select, $count, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/states/{id}/linkedToStates'
                .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json', 'text/plain'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new Error('Required parameter id was null or undefined when calling getLinkedToStates.');
            }
            if ($skip !== undefined) {
                localVarQueryParameters['$skip'] = models_1.ObjectSerializer.serialize($skip, "string");
            }
            if ($top !== undefined) {
                localVarQueryParameters['$top'] = models_1.ObjectSerializer.serialize($top, "string");
            }
            if ($filter !== undefined) {
                localVarQueryParameters['$filter'] = models_1.ObjectSerializer.serialize($filter, "string");
            }
            if ($orderby !== undefined) {
                localVarQueryParameters['$orderby'] = models_1.ObjectSerializer.serialize($orderby, "string");
            }
            if ($search !== undefined) {
                localVarQueryParameters['$search'] = models_1.ObjectSerializer.serialize($search, "string");
            }
            if ($select !== undefined) {
                localVarQueryParameters['$select'] = models_1.ObjectSerializer.serialize($select, "string");
            }
            if ($count !== undefined) {
                localVarQueryParameters['$count'] = models_1.ObjectSerializer.serialize($count, "string");
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
                            body = models_1.ObjectSerializer.deserialize(body, "Array<State>");
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
     * Returns the State matching the given id.
     * @summary Gets a State.
     * @param id The identifier for a State.
     */
    getState(id, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/states/{id}'
                .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json', 'text/plain'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new Error('Required parameter id was null or undefined when calling getState.');
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
                            body = models_1.ObjectSerializer.deserialize(body, "State");
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
     * Returns States determined by the supplied query parameters.  By default, all PRIVATE and PUBLIC States are returned, along with SHARED States for which the user has a RECIPIENT role.  The $filter parameter can be used to further qualify which States are returned.  SHARED States are accessible only if the user has a role as OWNER, AUTHOR or RECIPIENT.
     * @summary Gets States.
     * @param $skip Skips the specified number of items from the beginning of the list that would normally be returned.  These skipped items are not included in the result. - For example, \&#39;$skip&#x3D;80\&#39; will not return the first 80 items that would otherwise be returned from the REST call.  Subsequent items are returned, starting with the 81st item in the list.  The value must be 0 or greater.  An empty string is ignored. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $skip can change from one call to the next.
     * @param $top Returns only this number of items from the start of the list that would be returned (subject to any use of $skip). - For example, \&#39;$top&#x3D;20\&#39; results in only the first 20 items from the list being returned.  The value must be 1 or greater and less than or equal to a maximum value of 500.  If not specified (or set to an empty string), a default value of 50 is used.  The maximum and default values do not apply when $count is set to true. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $top can change from one call to the next.
     * @param $filter The filter query option is used to define specific queries, based on inherent State properties (id, name, description, type, sandboxId, scope, createdDate, createdByName, createdById, modifiedDate, modifiedByName, modifiedById, isOrphaned, isAbandoned), roles assigned (roleEntityId, roleType), or any attributes defined for the State, that will return the required set of items.  Attribute names on the State are qualified in the filter expression with the \&#39;attributes/\&#39; prefix, that is, attributes/attrName eq \&#39;value\&#39;.  Both State name and Attribute name are case-sensitive (a filter with name eq \&#39;Case Example\&#39; or attributes/attrName eq \&#39;Case Example\&#39; matches \&#39;Case Example\&#39;, but not \&#39;case example\&#39;).  If the filter does not explicitly contain a filter clause for roleType, by default, only State items for the RECIPIENT roleType are returned.  If the filter does not explicitly contain a filter clause for type, by default, States of all types are returned.  For more information, see the _Filtering and Sorting_ Key Concepts page.
     * @param $orderby This query option is used to request items in either ascending order using __asc__ or descending order using __desc__, based on one of the resource properties (id, name, description, type, sandboxId, scope, createdDate, createdByName, createdById, modifiedDate, modifiedByName, modifiedById, isOrphaned, isAbandoned).  If neither __asc__ nor __desc__ is specified, ascending order is used.  For example, if \&#39;$orderby&#x3D;name desc\&#39; is used, assuming that name is a string, the returned items are sorted in reverse alphabetical order according to the name property.  To sort on multiple properties, use a comma-separated list, for example, \&#39;$orderby&#x3D;type asc, name desc\&#39; first sorts against type, and then for each type, sorts that set of returned items according to the reverse alphabetical order of the name property.  The default order is by name ASC. For more information, see the _Filtering and Sorting_ Key Concepts page.
     * @param $search The $search query restricts the result to include only those States matching the specified search expression.  This performs a textual search on the JSON string of the StateContent.  For example, \&#39;$search&#x3D;Scottsdale\&#39; returns States where the sub-string \&#39;Scottsdale\&#39; is located somewhere within the JSON string of the State content property.
     * @param $select This query option is used to specify the specific property values from the State to be returned.  Other property values not included in the $select list are returned as null.  The property names are specified as a comma-separated string that can contain any of [\&quot;name\&quot;, \&quot;content\&quot;, \&quot;type\&quot;, \&quot;description\&quot;, \&quot;attributes\&quot;, \&quot;roles\&quot;, \&quot;links\&quot;, \&quot;id\&quot;, \&quot;sandboxId\&quot;, \&quot;scope\&quot;, \&quot;createdById\&quot;, \&quot;createdByName\&quot;, \&quot;createdDate\&quot;, \&quot;modifiedById\&quot;, \&quot;modifiedByName\&quot;, \&quot;modifiedDate\&quot;, \&quot;isOrphaned\&quot;, \&quot;isAbandoned\&quot;].  For example, \&#39;$select&#x3D;content,type,id\&#39; results in only the content, type and id property values being returned.
     * @param $count Return a simple number only, this being the count of the items that would be returned from the request if the count query option was not present.  Note that the assigned value for $count is true, that is, the correct use of the count query option is \&#39;$count&#x3D;true\&#39;.  If \&#39;$count&#x3D;false\&#39; is used, this has no effect.  It is recognized that $count is an expensive operation and should not be used by clients without consideration.
     */
    getStates($skip, $top, $filter, $orderby, $search, $select, $count, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/states';
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json', 'text/plain'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            if ($skip !== undefined) {
                localVarQueryParameters['$skip'] = models_1.ObjectSerializer.serialize($skip, "string");
            }
            if ($top !== undefined) {
                localVarQueryParameters['$top'] = models_1.ObjectSerializer.serialize($top, "string");
            }
            if ($filter !== undefined) {
                localVarQueryParameters['$filter'] = models_1.ObjectSerializer.serialize($filter, "string");
            }
            if ($orderby !== undefined) {
                localVarQueryParameters['$orderby'] = models_1.ObjectSerializer.serialize($orderby, "string");
            }
            if ($search !== undefined) {
                localVarQueryParameters['$search'] = models_1.ObjectSerializer.serialize($search, "string");
            }
            if ($select !== undefined) {
                localVarQueryParameters['$select'] = models_1.ObjectSerializer.serialize($select, "string");
            }
            if ($count !== undefined) {
                localVarQueryParameters['$count'] = models_1.ObjectSerializer.serialize($count, "string");
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
                            body = models_1.ObjectSerializer.deserialize(body, "Array<State>");
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
     * Updates the State matching the given id.  Any attributes, roles and links that exist at the time of update are replaced with the contents of the update.
     * @summary Updates State.
     * @param id The identifier for a State.
     * @param state The State to be updated.
     */
    updateState(id, state, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/states/{id}'
                .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json', 'text/plain'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            // verify required parameter 'id' is not null or undefined
            if (id === null || id === undefined) {
                throw new Error('Required parameter id was null or undefined when calling updateState.');
            }
            // verify required parameter 'state' is not null or undefined
            if (state === null || state === undefined) {
                throw new Error('Required parameter state was null or undefined when calling updateState.');
            }
            Object.assign(localVarHeaderParams, options.headers);
            let localVarUseFormData = false;
            let localVarRequestOptions = {
                method: 'PUT',
                qs: localVarQueryParameters,
                headers: localVarHeaderParams,
                uri: localVarPath,
                useQuerystring: this._useQuerystring,
                json: true,
                body: models_1.ObjectSerializer.serialize(state, "State")
            };
            let authenticationPromise = Promise.resolve();
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
                            body = models_1.ObjectSerializer.deserialize(body, "State");
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
     * Updates the States.  Either all States are updated, or none are updated if an error occurs.  For rules about which users can update a State, see the description for POST /states.
     * @summary Updates States.
     * @param states The States to be updated (containing at least one).
     */
    updateStates(states, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/states';
            let localVarQueryParameters = {};
            let localVarHeaderParams = Object.assign({}, this._defaultHeaders);
            const produces = ['application/json', 'text/plain'];
            // give precedence to 'application/json'
            if (produces.indexOf('application/json') >= 0) {
                localVarHeaderParams.Accept = 'application/json';
            }
            else {
                localVarHeaderParams.Accept = produces.join(',');
            }
            let localVarFormParams = {};
            // verify required parameter 'states' is not null or undefined
            if (states === null || states === undefined) {
                throw new Error('Required parameter states was null or undefined when calling updateStates.');
            }
            Object.assign(localVarHeaderParams, options.headers);
            let localVarUseFormData = false;
            let localVarRequestOptions = {
                method: 'PUT',
                qs: localVarQueryParameters,
                headers: localVarHeaderParams,
                uri: localVarPath,
                useQuerystring: this._useQuerystring,
                json: true,
                body: models_1.ObjectSerializer.serialize(states, "Array<State>")
            };
            let authenticationPromise = Promise.resolve();
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
                            body = models_1.ObjectSerializer.deserialize(body, "Array<State>");
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
exports.StatesApi = StatesApi;
//# sourceMappingURL=statesApi.js.map