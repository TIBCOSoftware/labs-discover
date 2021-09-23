/**
 * Web Resource Provisioner Service
 * The TIBCO Cloud(TM) Live Apps Web Resource Provisioner Service manages Applications and related resources in the TIBCO(R) Live Apps subscription.   Applications, in the context of the Web Resource Provisioner Service, are user interface applications that are served to a browser client to provide end-user functionality. Note that:  * Applications must consist entirely of static resources (such as HTML, CSS, Javascript, XML and JSON) which are served to the browser that hosts the Application. Applications must not include servlets or client-side executables, such as applets or .NET libraries.  * Applications are _not_ the applications that Users create in Live Apps Designer, manage in Live Apps Application Manager and use in Live Apps Case Manager. Those applications cannot be accessed or managed using the Web Resource Provisioner Service.  There are four different types of Application:  * __Applications__: These are customer-developed applications that provide custom functionality and solutions to specific business requirements.     * __System Applications__: These are TIBCO-developed applications that provide standard functionality available as part of a Live Apps subscription. For example, Live Apps Designer, Live Apps Application Manager and Live Apps Case Manager are System Applications.        * __Case Folders__: These are used to store Artifacts - such as document and image files - which are part of a Case.  * __Org Folders__: These are used to store Artifacts - such as document and images files - which can be accessed from within the subscription (for example, from another customer-developed Application).  Other resources managed by the Web Resource Provisioner Service are:  * __ApplicationVersions__: The ApplicationVersion (also referred to as simply Version) is a snapshot of the state of the Application and the Artifacts that it contains. Whenever a change is made to an Application, a new version is created and the Application\'s latestVersion property is incremented. The Application\'s publishedVersion property defines the version that is currently available to all Users in the subscription.  * __Artifacts__: Artifacts are the files and folders that make up an Application or System Application. Case Folders only include files.   __Application Lifecycle and Management__  Web Resource Provisioner Service methods allow you to manage Applications in your subscription. You can:  * Create a new Application, in several ways:   * Create an empty Application.   * Upload an archive file of an externally created application.   * Copy an existing Application.   * Copy an existing System Application that has been defined as a template.   * Export an Application to an external archive, for subsequent upload.  * Modify and test Application content:   * Upload new or updated Artifacts, either individually or from an archive.   * Rename or delete existing Artifacts.   * Revert an Application to a different version.      You can access and test the latestVersion of an Application by prefixing the Application\'s name in the URI with two underscore characters, followed by TEST, followed by two underscore characters, followed by a forward slash character.     * Publish an Application so that it is available to Users:    * Publish the Application when you create it.    * Publish the latestversion of the Application at any time.    The publishedVersion of an Application is available to every User in a subscription via its URI.     * Delete an Application, or a specific ApplicationVersion, that is no longer required.  __Application Descriptor File__  Applications and System Applications can include a descriptor file, containing name/value pairs that can be used to provide any desired custom information about the Application. For example: * to associate an image with the Application. * to define the Application\'s home page. * to define the location of a configuration file for the Application.  The descriptor file name must be {appName}.app.desc.json. The file must reside in the Application\'s top-level folder. The contents of the descriptor file can be accessed using the Application\'s \'descriptor\' property.  Case Folders do not have descriptor files.   __Access Permissions__  Access to the methods listed below is restricted. The call must be made using the credentials of a User who is a member of either the ADMINISTRATOR or APPLICATION_DEVELOPER subscription Group. A call made using any other credentials will fail with a \"WR_AUTHERROR\" error:  * The GET /applications/{appName}/export method * All POST, PUT, PATCH and DELETE methods, except for the following methods - access to these is not restricted:    * POST /caseFolders/{folderName}/artifacts/{artifactName}/upload   * DELETE /caseFolders/{folderName}/artifacts/{artifactName}   * POST /orgFolders/{folderName}/artifacts/{artifactName}/upload   * DELETE /orgFolders/{folderName}/artifacts/{artifactName}   __Case Folder Management__  A Case Folder is created automatically when a Case is created: * A Case Folder\'s name is the Case reference of the Case. * A Case Folder only has a single version. This never changes. * Multiple Artifacts, and multiple versions of an Artifact, can be stored in a Case Folder.    Web Resource Provisioner Service methods allow you to manage the content of a Case Folder, by: * uploading new Artifacts or new versions of existing Artifacts. * deleting the latest version of an Artifact.   __Org Folder Management__  Web Resource Provisioner Service methods allow you to manage Org Folders and their contents in your subscription. You can: * create a new Org folder. * upload new Artifacts or new versions of existing Artifacts. * delete the latest version of an Artifact. * delete an Org Folder that is no longer required.  Note that: * An Org Folder\'s name must be unique in the subscription. * An Org Folder only has a single version. This never changes. * Multiple Artifacts, and multiple versions of an Artifact, can be stored in an Org Folder.   __Subscription Limits on Applications__  The following Live Apps subscription Parameters enforce limits on the maximum number and size of Applications allowed in a subscription:  * __webAppStorage__: The maximum total size (in bytes) of all Applications in the subscription. The default value is 0 (meaning unlimited). An Application\'s size is calculated as the total size of each unique Artifact in all Versions of the Application. Multiple uploads of the same Artifact do not increase the size. * __webAppLimit__: The maximum number of Applications permitted in the subscription. The default value is  10 * __webAppArchiveSize__: The maximum size (in bytes) of a single, exploded archive. The default value is 300000000. If you want to use an Application that exceeds the webAppArchiveSize, you must split it into different archives and upload each one separately.  NOTE: These limits apply only to customer-developed Applications. System Applications and Case Folders are not counted.  You can use the GET /parameters method from the Authorization Service to find the values of these Parameters defined for your subscription.  __Subscription Limit on Artifacts in Case Folders and Org Folders__  The following Live Apps subscription Parameter enforces a limit on the maximum total size of Artifacts allowed in a subscription:  * __documentStorage__: The maximum total size (in bytes) of all Artifacts in Case Folders and Org Folders. The total size is calculated as the total size of all the versions of each Artifact stored.   __Application Resource Endpoints__  The publishedVersion of a customer-developed Application, or a component file within that Application, can be served to a web browser using the endpoint: .../webresource/apps/{appName}/{artifactName}. For example, my-test-system/webresource/apps/myUserApp/index.html.  Note that:       * To serve the latestVersion of an Application, prefix the Application\'s name in the URI with two underscore characters, followed by TEST, followed by two underscore characters, followed by a forward slash character.  * You cannot serve System Applications or their component files using this endpoint format.   __Case Folder and Org Folder Resource Endpoints__  A file Artifact in a Case Folder or an Org Folder can be served to a web browser via the following endpoints:  * For a Case Folder, use: .../webresource/folders/{folderName}/{sandbox}/{artifactName}?$version={versionNumber}.    * For an Org Folder, use: .../webresource/orgFolders/{folderName}/{artifactName}?$version={versionNumber}.    If $version is omitted the latest version is served.     __Default and Maximum Values for the $top Parameter__  If $top is not specified a default of 20 is used.   The maximum allowed size for $top is 200. 
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
import { ApplicationVersion } from '../model/applicationVersion';
import { Status } from '../model/status';

import { ObjectSerializer, Authentication, VoidAuth, Interceptor } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = 'http://localhost/webresource/v1';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum ApplicationVersionsApiApiKeys {
}

export class ApplicationVersionsApi {
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

    public setApiKey(key: ApplicationVersionsApiApiKeys, value: string) {
        (this.authentications as any)[ApplicationVersionsApiApiKeys[key]].apiKey = value;
    }

    public addInterceptor(interceptor: Interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * 
     * @summary Deletes a particular Version of an Application.
     * @param appName The name of the Application from which a Version is to be deleted.
     * @param version The Version to be deleted.
     */
    public async deleteAppVersion (appName: string, version: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/applicationVersions/{version}/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)))
            .replace('{' + 'version' + '}', encodeURIComponent(String(version)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'appName' is not null or undefined
        if (appName === null || appName === undefined) {
            throw new Error('Required parameter appName was null or undefined when calling deleteAppVersion.');
        }

        // verify required parameter 'version' is not null or undefined
        if (version === null || version === undefined) {
            throw new Error('Required parameter version was null or undefined when calling deleteAppVersion.');
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
            return new Promise<{ response: http.IncomingMessage; body: Status;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Status");
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
     * Returns the ApplicationVersion matching the specified query parameters.
     * @summary Returns a particular version of an Application.
     * @param appName Name of the Application for which the ApplicationVersion should be returned.
     * @param version The ApplicationVersion to be returned.
     */
    public async getAppVersion (appName: string, version: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: ApplicationVersion;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/applicationVersions/{version}/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)))
            .replace('{' + 'version' + '}', encodeURIComponent(String(version)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'appName' is not null or undefined
        if (appName === null || appName === undefined) {
            throw new Error('Required parameter appName was null or undefined when calling getAppVersion.');
        }

        // verify required parameter 'version' is not null or undefined
        if (version === null || version === undefined) {
            throw new Error('Required parameter version was null or undefined when calling getAppVersion.');
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
            return new Promise<{ response: http.IncomingMessage; body: ApplicationVersion;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "ApplicationVersion");
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
     * 
     * @summary Returns ApplicationVersions for the specified Application.
     * @param appName Name of the Application for which ApplicationVersions should be returned.
     */
    public async getAppVersions (appName: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<ApplicationVersion>;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/applicationVersions/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'appName' is not null or undefined
        if (appName === null || appName === undefined) {
            throw new Error('Required parameter appName was null or undefined when calling getAppVersions.');
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
            return new Promise<{ response: http.IncomingMessage; body: Array<ApplicationVersion>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Array<ApplicationVersion>");
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
     * Returns the ApplicationVersion matching the specified query parameters.
     * @summary Returns a particular version of a System Application.
     * @param appName Name of the System Application for which the ApplicationVersion should be returned.
     * @param version The ApplicationVersion to be returned.
     */
    public async getSysAppVersion (appName: string, version: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: ApplicationVersion;  }> {
        const localVarPath = this.basePath + '/systemApplications/{appName}/applicationVersions/{version}/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)))
            .replace('{' + 'version' + '}', encodeURIComponent(String(version)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'appName' is not null or undefined
        if (appName === null || appName === undefined) {
            throw new Error('Required parameter appName was null or undefined when calling getSysAppVersion.');
        }

        // verify required parameter 'version' is not null or undefined
        if (version === null || version === undefined) {
            throw new Error('Required parameter version was null or undefined when calling getSysAppVersion.');
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
            return new Promise<{ response: http.IncomingMessage; body: ApplicationVersion;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "ApplicationVersion");
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
     * 
     * @summary Returns ApplicationVersions for the specified System Application.
     * @param appName Name of the System Application for which ApplicationVersions should be returned.
     */
    public async getSysAppVersions (appName: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<ApplicationVersion>;  }> {
        const localVarPath = this.basePath + '/systemApplications/{appName}/applicationVersions/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'appName' is not null or undefined
        if (appName === null || appName === undefined) {
            throw new Error('Required parameter appName was null or undefined when calling getSysAppVersions.');
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
            return new Promise<{ response: http.IncomingMessage; body: Array<ApplicationVersion>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Array<ApplicationVersion>");
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
     * This method reverts the latest Version of an Application to a new Version, based on an existing Version:  * A new ApplicationVersion is created, as a copy of the specified existing Version. * The latestVersion is set to the new Version.  Note: The new/reverted Version is not published. The Application\'s publishedVersion is not affected by this method.  For example, suppose an Application currently has publishedVersion=9 and latestversion=11. If this method is used to revert the Application to Version 7: * Version 12 of the Application is created, as a copy of Version 7. * The latestVersion is now 12. * The publishedVersion remains at 9. 
     * @summary Reverts an Application to a different Version.
     * @param appName The name of the Application to be reverted.
     * @param version The existing Version of the Application from which the new Version should be created.
     */
    public async revertApp (appName: string, version: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/applicationVersions/{version}/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)))
            .replace('{' + 'version' + '}', encodeURIComponent(String(version)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'appName' is not null or undefined
        if (appName === null || appName === undefined) {
            throw new Error('Required parameter appName was null or undefined when calling revertApp.');
        }

        // verify required parameter 'version' is not null or undefined
        if (version === null || version === undefined) {
            throw new Error('Required parameter version was null or undefined when calling revertApp.');
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
            return new Promise<{ response: http.IncomingMessage; body: Status;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Status");
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
     * A new Version of the Application is created, containing the updated label. Existing Versions retain their existing labels. 
     * @summary Updates the label for the specified Application.
     * @param appName The name of the Application whose label is to be updated.
     * @param details The following values, specified in application/json format:  * __name__ (optional): if specified, this value is ignored. * __permissions__ (required): This value is ignored.  * __label__ (required): The new label for the Application.  For example:  { \&quot;permissions\&quot;: 0, \&quot;label\&quot;: \&quot;string\&quot; } 
     */
    public async updateAppVersion (appName: string, details: ApplicationVersion, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/applicationVersions/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/json'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'appName' is not null or undefined
        if (appName === null || appName === undefined) {
            throw new Error('Required parameter appName was null or undefined when calling updateAppVersion.');
        }

        // verify required parameter 'details' is not null or undefined
        if (details === null || details === undefined) {
            throw new Error('Required parameter details was null or undefined when calling updateAppVersion.');
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
            body: ObjectSerializer.serialize(details, "ApplicationVersion")
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
            return new Promise<{ response: http.IncomingMessage; body: Status;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Status");
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
