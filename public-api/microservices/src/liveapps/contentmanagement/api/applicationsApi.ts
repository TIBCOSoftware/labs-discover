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
import { Application } from '../model/application';
import { Status } from '../model/status';
import { SystemApplication } from '../model/systemApplication';

import { ObjectSerializer, Authentication, VoidAuth, Interceptor } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = 'http://localhost/webresource/v1';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum ApplicationsApiApiKeys {
}

export class ApplicationsApi {
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

    public setApiKey(key: ApplicationsApiApiKeys, value: string) {
        (this.authentications as any)[ApplicationsApiApiKeys[key]].apiKey = value;
    }

    public addInterceptor(interceptor: Interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * The publishedVersion and latestVersion of the new Application are \"1\", irrespective of the version numbers in the Application being copied.   Each Artifact belonging to the existing Application is also copied. The new copy of each Artifact has the same artifactName as the original, but has a new, unique id and an artifactVersion of \"1\", irrespective of the version number of the original Artifact.  
     * @summary Creates a new copy of an existing Application.
     * @param appName The name of the Application to be copied.
     * @param details The required details for the new copy of the Application:  * __name__ (required): Unique name for the new Application.  * __tags__: Not currently used by this method - if specified it will be ignored.           
     */
    public async copyApp (appName: string, details: Application, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/'
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
            throw new Error('Required parameter appName was null or undefined when calling copyApp.');
        }

        // verify required parameter 'details' is not null or undefined
        if (details === null || details === undefined) {
            throw new Error('Required parameter details was null or undefined when calling copyApp.');
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
            body: ObjectSerializer.serialize(details, "Application")
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
     * The publishedVersion and latestVersion of the new System Application are \"1\", irrespective of the version numbers in the System Application being copied.  Each Artifact belonging to the existing System Application is also copied. The new copy of each Artifact has the same artifactName as the original, but has a new, unique id and an artifactVersion of \"1\", irrespective of the version number of the original Artifact.  Note: This method is only supported for System Applications that have a \'TEMPLATE\' tag. 
     * @summary Creates a new copy of an existing System Application.
     * @param appName The name of the System Application to be copied.
     * @param details The required details for the new copy of the System Application:  * __name__ (required): Unique name for the new System Application.  * __tags__: Not currently used by this method - if specified it will be ignored. 
     */
    public async copySysApp (appName: string, details: SystemApplication, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/systemApplications/{appName}/'
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
            throw new Error('Required parameter appName was null or undefined when calling copySysApp.');
        }

        // verify required parameter 'details' is not null or undefined
        if (details === null || details === undefined) {
            throw new Error('Required parameter details was null or undefined when calling copySysApp.');
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
            body: ObjectSerializer.serialize(details, "SystemApplication")
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
     * The contents of the archive file are used to either create a new Application, or to update an existing Application by replacing the existing contents.  If the specified appName does not already exist, the Application is created and published as a new Application (with latestVersion and publishedVersion of \"1\"). Each included Artifact has an artifactVersion of \"1\"  If an Application with the specified appName already exists:  * The latestVersion of the Application is incremented. * Each existing Artifact in the latestversion of the Application is deleted. * Each folder and file in the archive is added as a new Artifact (with an artifactVersion matching the latestVersion value of the Application). * The latestVersion of the Application is published. 
     * @summary Uploads and publishes a new or updated Application from an archive file.
     * @param appName The name of the Application to be created or updated.
     * @param appContents The archive file (_appName_.zip) to be used to create or update the Application.    Note: The archive file must be specified in the request as a multipart/form-data attachment. 
     */
    public async createApp (appName: string, appContents: RequestFile, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/upload/'
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
            throw new Error('Required parameter appName was null or undefined when calling createApp.');
        }

        // verify required parameter 'appContents' is not null or undefined
        if (appContents === null || appContents === undefined) {
            throw new Error('Required parameter appContents was null or undefined when calling createApp.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        if (appContents !== undefined) {
            localVarFormParams['appContents'] = appContents;
        }
        localVarUseFormData = true;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'POST',
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
     * The contents of the archive file are used to update an existing Application:  * The latestVersion of the Application is incremented, but the new version is not published.  * The folder structure in the archive file is merged with the existing Application. * Each file in the archive that does not already exist in the latestVersion of the Application is added as a new Artifact (with an artifactVersion matching the latestVersion value of the Application). * Each file in the archive that does already exist in the latestVersion of the Application is merged with the existing Artifact. If the contents are updated, the artifactVersion is updated to the latestVersion of the Application. 
     * @summary Uploads new or updated Artifacts to an existing Application from an archive file.
     * @param appName The name of the Application to be updated.
     * @param artifactContents The archive file (appName.zip) to be used to update the Application.  Note: The archive file must be specified in the request as a multipart/form-data attachment. 
     */
    public async createAppArtifact (appName: string, artifactContents: RequestFile, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/upload/'
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
            throw new Error('Required parameter appName was null or undefined when calling createAppArtifact.');
        }

        // verify required parameter 'artifactContents' is not null or undefined
        if (artifactContents === null || artifactContents === undefined) {
            throw new Error('Required parameter artifactContents was null or undefined when calling createAppArtifact.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        if (artifactContents !== undefined) {
            localVarFormParams['artifactContents'] = artifactContents;
        }
        localVarUseFormData = true;

        let localVarRequestOptions: localVarRequest.Options = {
            method: 'PATCH',
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
     * The Artifact methods can be used later to add content to the Application.
     * @summary Creates a new, empty Application.
     * @param details The required details for the new Application:  * __name__ (required): Unique name for the new Application  * __tags__: Not currently used by this method - if specified it will be ignored. 
     */
    public async createEmptyApp (details: Application, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/';
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

        // verify required parameter 'details' is not null or undefined
        if (details === null || details === undefined) {
            throw new Error('Required parameter details was null or undefined when calling createEmptyApp.');
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
            body: ObjectSerializer.serialize(details, "Application")
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
     * Note: This method deletes ALL versions of the specified Application. Also, it cannot be undone. 
     * @summary Deletes a particular Application.
     * @param appName Name of the Application to delete.
     */
    public async deleteApp (appName: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/'
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
            throw new Error('Required parameter appName was null or undefined when calling deleteApp.');
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
     * The latestVersion of the specified Application is exported as an archive file (_appName_.zip).
     * @summary Exports the latest version of an Application to an archive file.
     * @param appName The name of the Application to be exported.
     */
    public async exportApp (appName: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body?: any;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/export/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)));
        let localVarQueryParameters: any = {};
        let localVarHeaderParams: any = (<any>Object).assign({}, this._defaultHeaders);
        const produces = ['application/octet-stream'];
        // give precedence to 'application/json'
        if (produces.indexOf('application/json') >= 0) {
            localVarHeaderParams.Accept = 'application/json';
        } else {
            localVarHeaderParams.Accept = produces.join(',');
        }
        let localVarFormParams: any = {};

        // verify required parameter 'appName' is not null or undefined
        if (appName === null || appName === undefined) {
            throw new Error('Required parameter appName was null or undefined when calling exportApp.');
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
     * 
     * @summary Returns Applications that match the specified query parameters.
     * @param $filter A filter expression that defines the Applications to be returned. The expression can contain the following operands:      * __name__ (optional): The name of the Application to be returned. Only one name can be used. You can search for partial names by using the contains function.        Supported operator: \&#39;eq\&#39;     Supported function: \&#39;contains(name,\&#39;value\&#39;)\&#39;      * __tags/name__ (optional): The name of the tag attribute for which Applications should be returned.        Supported operator: \&#39;eq\&#39;      For example, the following string returns all Applications that contain \&#39;app\&#39; in their name and that have the tag \&#39;MOBILE\&#39;:        $filter&#x3D;contains(name,\&#39;app\&#39;) and tags/name eq \&#39;MOBILE\&#39;  
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be in the range 1 to 200. For example, &#x60;$top&#x3D;50&#x60; returns 50 items from the results list, or all the results if the list contains 50 or fewer items. If $top is omitted, a default value of 20 is used. 
     * @param $orderby The order in which results should be sorted, either ascending order using __asc__ or descending order using __desc__, based on one of the following Application properties: name, owner, ownerSub, ownerSandbox, creationDate, lastModifiedDate, lastModifiedBy, publishedVersion, latestVersion.   For example, the following string sorts results in ascending order by name:  $orderby&#x3D;name asc 
     * @param $select Whether the descriptor attribute for each returned Application should be included in the returned information. (The descriptor attribute contains the name/value pairs defined in the Application\&#39;s _appName_.app.desc.json file, if it has one.) The only valid value is:  * __summary__: Excludes the descriptor attribute from the returned information.  For example:  $select&#x3D;summary  If $select is not specified, the descriptor attribute is included in the returned information.  
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of Applications in the result, rather than the Applications themselves.    Note: If $count is used, $skip, $top, $orderby or $select cannot be used. 
     */
    public async getApps ($filter?: string, $skip?: string, $top?: string, $orderby?: string, $select?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<Application>;  }> {
        const localVarPath = this.basePath + '/applications/';
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

        if ($filter !== undefined) {
            localVarQueryParameters['$filter'] = ObjectSerializer.serialize($filter, "string");
        }

        if ($skip !== undefined) {
            localVarQueryParameters['$skip'] = ObjectSerializer.serialize($skip, "string");
        }

        if ($top !== undefined) {
            localVarQueryParameters['$top'] = ObjectSerializer.serialize($top, "string");
        }

        if ($orderby !== undefined) {
            localVarQueryParameters['$orderby'] = ObjectSerializer.serialize($orderby, "string");
        }

        if ($select !== undefined) {
            localVarQueryParameters['$select'] = ObjectSerializer.serialize($select, "string");
        }

        if ($count !== undefined) {
            localVarQueryParameters['$count'] = ObjectSerializer.serialize($count, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: Array<Application>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Array<Application>");
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
     * @summary Returns information matching the specified query parameters about a particular Application.
     * @param appName The name of the required Application.
     * @param $select Whether the descriptor attribute for the Application should be included in the returned information. (The descriptor attribute contains the name/value pairs defined in the Application\&#39;s _appName_.app.desc.json file, if it has one.) The only valid value is:  * __summary__: Excludes the descriptor attribute from the returned information.  For example:  $select&#x3D;summary  If $select is not specified, the descriptor attribute is included in the returned information. 
     */
    public async getAppsByName (appName: string, $select?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Application;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/'
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
            throw new Error('Required parameter appName was null or undefined when calling getAppsByName.');
        }

        if ($select !== undefined) {
            localVarQueryParameters['$select'] = ObjectSerializer.serialize($select, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: Application;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Application");
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
     * @summary Returns published System Applications that match the specified query parameters.
     * @param $filter A filter expression that defines the System Applications to be returned. The expression can contain the following operands:      * __name__ (optional): The name of the System Application to be returned. Only one name can be used. You can search for partial names by using the contains function.        Supported operator: \&#39;eq\&#39;     Supported function: \&#39;contains(name,\&#39;value\&#39;)\&#39;      * __tags/name__ (optional): The name of the tag attribute for which System Applications should be returned.        Supported operator: \&#39;eq\&#39;      For example, the following string returns all System Applications that contain \&#39;app\&#39; in their name and that have the tag \&#39;MOBILE\&#39;:        $filter&#x3D;contains(name,\&#39;app\&#39;) and tags/name eq \&#39;MOBILE\&#39; 
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items. 
     * @param $orderby The order in which results should be sorted, either ascending order using __asc__ or descending order using __desc__, based on one of the following System Application properties: name, owner, ownerSub, ownerSandbox, creationDate, lastModifiedDate, lastModifiedBy, publishedVersion, latestVersion.   For example, the following string sorts results in ascending order by name:  $orderby&#x3D;name asc 
     * @param $select Whether the descriptor attribute for each returned System Application should be included in the returned information. (The descriptor attribute contains the name/value pairs defined in the System Application\&#39;s _appName_.app.desc.json file, if it has one.) The only valid value is:  * __summary__: Excludes the descriptor attribute from the returned information.  For example:  $select&#x3D;summary  If $select is not specified the descriptor attribute is included in the returned information. 
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of System Applications in the result, rather than the System Applications themselves.   Note: If $count is used, $skip, $top, $orderby or $select cannot be used. 
     */
    public async getSysApps ($filter?: string, $skip?: string, $top?: string, $orderby?: string, $select?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<SystemApplication>;  }> {
        const localVarPath = this.basePath + '/systemApplications/';
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

        if ($filter !== undefined) {
            localVarQueryParameters['$filter'] = ObjectSerializer.serialize($filter, "string");
        }

        if ($skip !== undefined) {
            localVarQueryParameters['$skip'] = ObjectSerializer.serialize($skip, "string");
        }

        if ($top !== undefined) {
            localVarQueryParameters['$top'] = ObjectSerializer.serialize($top, "string");
        }

        if ($orderby !== undefined) {
            localVarQueryParameters['$orderby'] = ObjectSerializer.serialize($orderby, "string");
        }

        if ($select !== undefined) {
            localVarQueryParameters['$select'] = ObjectSerializer.serialize($select, "string");
        }

        if ($count !== undefined) {
            localVarQueryParameters['$count'] = ObjectSerializer.serialize($count, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: Array<SystemApplication>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "Array<SystemApplication>");
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
     * @summary Returns information matching the specified query parameters about a particular System Application.
     * @param appName The name of the required System Application.
     * @param $select Whether the descriptor attribute for the Application should be included in the returned information. (The descriptor attribute contains the name/value pairs defined in the Application\&#39;s _appName_.app.desc.json file, if it has one.) The only valid value is:  * __summary__: Excludes the descriptor attribute from the returned information.  For example:  $select&#x3D;summary  If $select is not specified the descriptor attribute is included in the returned information. 
     */
    public async getSysAppsByName (appName: string, $select?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: SystemApplication;  }> {
        const localVarPath = this.basePath + '/systemApplications/{appName}/'
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
            throw new Error('Required parameter appName was null or undefined when calling getSysAppsByName.');
        }

        if ($select !== undefined) {
            localVarQueryParameters['$select'] = ObjectSerializer.serialize($select, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: SystemApplication;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "SystemApplication");
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
     * The Application\'s publishedVersion is set to the same value as the latestVersion and all Artifacts associated with the latestVersion are associated with the publishedVersion. The publishedVersion is the one that is available to all Users. 
     * @summary Publishes the latest Version of an Application.
     * @param appName The name of the Application to be published.
     */
    public async publishApp (appName: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/'
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
            throw new Error('Required parameter appName was null or undefined when calling publishApp.');
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
}
