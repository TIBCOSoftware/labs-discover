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


import localVarRequest from 'request';
import http from 'http';

/* tslint:disable:no-unused-locals */
import { StateAttribute } from '../model/stateAttribute';

import { ObjectSerializer, Authentication, VoidAuth, Interceptor } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = 'http://localhost/clientstate/v1';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum AttributesApiApiKeys {
}

export class AttributesApi {
    protected _basePath = defaultBasePath;
    protected _defaultHeaders : any = {};
    protected _useQuerystring : boolean = false;

    protected authentications = {
        'default': <Authentication>new VoidAuth(),
    }

    protected interceptors: Interceptor[] = [];

    constructor(basePath?: string);
    constructor(basePathOrUsername: string, password?: string, basePath?: string) {
        if (password) {
            if (basePath) {
                this.basePath = basePath;
            }
        } else {
            if (basePathOrUsername) {
                this.basePath = basePathOrUsername
            }
        }
    }

    set useQuerystring(value: boolean) {
        this._useQuerystring = value;
    }

    set basePath(basePath: string) {
        this._basePath = basePath;
    }

    set defaultHeaders(defaultHeaders: any) {
        this._defaultHeaders = defaultHeaders;
    }

    get defaultHeaders() {
        return this._defaultHeaders;
    }

    get basePath() {
        return this._basePath;
    }

    public setDefaultAuthentication(auth: Authentication) {
        this.authentications.default = auth;
    }

    public setApiKey(key: AttributesApiApiKeys, value: string) {
        (this.authentications as any)[AttributesApiApiKeys[key]].apiKey = value;
    }

    public addInterceptor(interceptor: Interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * Creates a new StateAttribute for a State.
     * @summary Creates a StateAttribute.
     * @param id The identifier for a State.
     * @param attribute The StateAttribute to be added.
     */
    public async createAttribute (id: string, attribute: StateAttribute, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: string;  }> {
        const localVarPath = this.basePath + '/states/{id}/attributes'
            .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json', 'text/plain'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling createAttribute.');
        }

        // verify required parameter 'attribute' is not null or undefined
        if (attribute === null || attribute === undefined) {
            throw new Error('Required parameter attribute was null or undefined when calling createAttribute.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'POST',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
            body: ObjectSerializer.serialize(attribute, "StateAttribute")
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
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<{ response: http.IncomingMessage; body: string;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "string");
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve({ response: response, body: body });
                        } else {
                            reject(new HttpError(response, body, response.statusCode));
                        }
                    }
                });
            });
        });
    }
    /**
     * Deletes the StateAttribute matching the given id.
     * @summary Deletes a StateAttribute.
     * @param id The identifier for a StateAttribute.
     */
    public async deleteAttribute (id: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body?: any;  }> {
        const localVarPath = this.basePath + '/stateAttributes/{id}'
            .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json', 'text/plain'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling deleteAttribute.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
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
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<{ response: http.IncomingMessage; body?: any;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve({ response: response, body: body });
                        } else {
                            reject(new HttpError(response, body, response.statusCode));
                        }
                    }
                });
            });
        });
    }
    /**
     * Returns the StateAttribute matching the given id.
     * @summary Gets StateAttribute.
     * @param id The identifier for a StateAttribute.
     */
    public async getAttribute (id: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: StateAttribute;  }> {
        const localVarPath = this.basePath + '/stateAttributes/{id}'
            .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json', 'text/plain'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling getAttribute.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
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
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<{ response: http.IncomingMessage; body: StateAttribute;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "StateAttribute");
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve({ response: response, body: body });
                        } else {
                            reject(new HttpError(response, body, response.statusCode));
                        }
                    }
                });
            });
        });
    }
    /**
     * Returns StateAttributes from the State matching the id.
     * @summary Gets StateAttributes.
     * @param id The identifier for a State.
     */
    public async getAttributes (id: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<StateAttribute>;  }> {
        const localVarPath = this.basePath + '/states/{id}/attributes'
            .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json', 'text/plain'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling getAttributes.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
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
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<{ response: http.IncomingMessage; body: Array<StateAttribute>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Array<StateAttribute>");
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve({ response: response, body: body });
                        } else {
                            reject(new HttpError(response, body, response.statusCode));
                        }
                    }
                });
            });
        });
    }
    /**
     * Updates the StateAttribute matching the given id.
     * @summary Updates StateAttribute.
     * @param id The identifier for a StateAttribute.
     * @param attribute The StateAttribute to be updated.
     */
    public async updateAttribute (id: string, attribute: StateAttribute, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: StateAttribute;  }> {
        const localVarPath = this.basePath + '/stateAttributes/{id}'
            .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json', 'text/plain'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling updateAttribute.');
        }

        // verify required parameter 'attribute' is not null or undefined
        if (attribute === null || attribute === undefined) {
            throw new Error('Required parameter attribute was null or undefined when calling updateAttribute.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'PUT',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
            body: ObjectSerializer.serialize(attribute, "StateAttribute")
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
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<{ response: http.IncomingMessage; body: StateAttribute;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "StateAttribute");
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve({ response: response, body: body });
                        } else {
                            reject(new HttpError(response, body, response.statusCode));
                        }
                    }
                });
            });
        });
    }
    /**
     * Updates the StateAttributes for a State.  All StateAttributes will be updated or none if an error occurs.
     * @summary Updates StateAttributes.
     * @param id The identifier for a State.
     * @param attributes The attributes to be updated (containing at least one).
     */
    public async updateAttributes (id: string, attributes: Array<StateAttribute>, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<StateAttribute>;  }> {
        const localVarPath = this.basePath + '/states/{id}/attributes'
            .replace('{' + 'id' + '}', encodeURIComponent(String(id)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json', 'text/plain'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'id' is not null or undefined
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling updateAttributes.');
        }

        // verify required parameter 'attributes' is not null or undefined
        if (attributes === null || attributes === undefined) {
            throw new Error('Required parameter attributes was null or undefined when calling updateAttributes.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'PUT',
            qs: localVarQueryParameters,
            headers: localVarHeaderParams,
            uri: localVarPath,
            useQuerystring: this._useQuerystring,
            json: true,
            body: ObjectSerializer.serialize(attributes, "Array<StateAttribute>")
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
                    (<any>localVarRequestOptions).formData = localVarFormParams;
                } else {
                    localVarRequestOptions.form = localVarFormParams;
                }
            }
            return new Promise<{ response: http.IncomingMessage; body: Array<StateAttribute>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Array<StateAttribute>");
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            resolve({ response: response, body: body });
                        } else {
                            reject(new HttpError(response, body, response.statusCode));
                        }
                    }
                });
            });
        });
    }
}
