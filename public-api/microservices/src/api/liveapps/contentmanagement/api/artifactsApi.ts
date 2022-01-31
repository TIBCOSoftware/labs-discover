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
import { Artifact } from '../model/artifact';
import { Status } from '../model/status';

import { ObjectSerializer, Authentication, VoidAuth, Interceptor } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = '/webresource/v1';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum ArtifactsApiApiKeys {
}

export class ArtifactsApi {
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

    public setApiKey(key: ArtifactsApiApiKeys, value: string) {
        (this.authentications as any)[ArtifactsApiApiKeys[key]].apiKey = value;
    }

    public addInterceptor(interceptor: Interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * The contents of the request body are used to update an existing Application:  * The latestVersion of the Application is incremented, but the new version is not published. * If an Artifact with the specified artifactName does not already exist in the latestVersion of the Application, the Body contents are used to create a new Artifact with an artifactVersion matching the latestVersion value of the Application. * If an Artifact with the specified artifactName already exists in the latestVersion of the Application, the Body contents are used to create a new version of the Artifact, replacing the existing content. The artifactVersion is updated to the latestVersion of the Application. (Note that the existing version of the Artifact is also retained, and any existing ApplicationVersions that reference that version of the Artifact are not affected.)  Note:  
     * @summary Uploads an Artifact to an existing Application.
     * @param appName The name of the Application to be updated.
     * @param artifactName The full path in the Application to which the Artifact is to be uploaded. Note that:  * Each forward slash character in the path must be URL encoded as \&#39;%2F\&#39;. * You can create a new folder path to the Artifact using this method.  
     * @param binaryData The new content of the Artifact, encoded in application/octet-stream format.
     */
    public async createAppArtifactSingle (appName: string, artifactName: string, binaryData: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/applicationVersions/artifacts/{artifactName}/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)))
            .replace('{' + 'artifactName' + '}', encodeURIComponent(String(artifactName)));
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
            throw new Error('Required parameter appName was null or undefined when calling createAppArtifactSingle.');
        }

        // verify required parameter 'artifactName' is not null or undefined
        if (artifactName === null || artifactName === undefined) {
            throw new Error('Required parameter artifactName was null or undefined when calling createAppArtifactSingle.');
        }

        // verify required parameter 'binaryData' is not null or undefined
        if (binaryData === null || binaryData === undefined) {
            throw new Error('Required parameter binaryData was null or undefined when calling createAppArtifactSingle.');
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
            body: ObjectSerializer.serialize(binaryData, "string")
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
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Status");
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
     * * If an Artifact with the specified artifactName does not already exist in the latestVersion of the Case Folder, the contents of the uploaded file are used to create a new Artifact (with artifactversion=1). * If an Artifact with the specified artifactName already exists in the latestVersion of the Case Folder, the contents of the uploaded file are used to update the existing Artifact (whose artifactversion is incremented by 1). 
     * @summary Uploads a new or updated Artifact to a particular Case Folder.
     * @param folderName The name of the Case Folder to which the Artifact is to be uploaded.
     * @param artifactName The name of the Artifact to be created or updated. Note that this name does not have to match the name of the file being uploaded.
     * @param $sandbox The id of the Sandbox that contains the Case Folder.
     * @param artifactContents The file to be used to update the Artifact.  Note: The file must be specified in the request as a multipart/form-data attachment. 
     * @param description A suitable description for the new or updated Artifact.
     */
    public async createFolderArtifact (folderName: string, artifactName: string, $sandbox: string, artifactContents: RequestFile, description?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/caseFolders/{folderName}/artifacts/{artifactName}/upload/'
            .replace('{' + 'folderName' + '}', encodeURIComponent(String(folderName)))
            .replace('{' + 'artifactName' + '}', encodeURIComponent(String(artifactName)));
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

        // verify required parameter 'folderName' is not null or undefined
        if (folderName === null || folderName === undefined) {
            throw new Error('Required parameter folderName was null or undefined when calling createFolderArtifact.');
        }

        // verify required parameter 'artifactName' is not null or undefined
        if (artifactName === null || artifactName === undefined) {
            throw new Error('Required parameter artifactName was null or undefined when calling createFolderArtifact.');
        }

        // verify required parameter '$sandbox' is not null or undefined
        if ($sandbox === null || $sandbox === undefined) {
            throw new Error('Required parameter $sandbox was null or undefined when calling createFolderArtifact.');
        }

        // verify required parameter 'artifactContents' is not null or undefined
        if (artifactContents === null || artifactContents === undefined) {
            throw new Error('Required parameter artifactContents was null or undefined when calling createFolderArtifact.');
        }

        if ($sandbox !== undefined) {
            localVarQueryParameters['$sandbox'] = ObjectSerializer.serialize($sandbox, "string");
        }

        if (description !== undefined) {
            localVarQueryParameters['description'] = ObjectSerializer.serialize(description, "string");
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        if (artifactContents !== undefined) {
            localVarFormParams['artifactContents'] = artifactContents;
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
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Status");
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
     * * If an Artifact with the specified artifactName does not already exist in the Org Folder, the contents of the uploaded file are used to create a new Artifact (with artifactversion=1). * If an Artifact with the specified artifactName already exists in the Org Folder, the contents of the uploaded file are used to update the existing Artifact (whose artifactversion is incremented by 1). 
     * @summary Uploads a new or updated Artifact to a particular Org Folder.
     * @param folderName The name of the Org Folder to which the Artifact is to be uploaded.
     * @param artifactName The name of the Artifact to be created or updated. Note that this name does not have to match the name of the file being uploaded.
     * @param artifactContents The file to be used to update the Artifact.  Note: The file must be specified in the request as a multipart/form-data attachment. 
     * @param description A suitable description for the new or updated Artifact.
     */
    public async createOrgFolderArtifact (folderName: string, artifactName: string, artifactContents: RequestFile, description?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/orgFolders/{folderName}/artifacts/{artifactName}/upload/'
            .replace('{' + 'folderName' + '}', encodeURIComponent(String(folderName)))
            .replace('{' + 'artifactName' + '}', encodeURIComponent(String(artifactName)));
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

        // verify required parameter 'folderName' is not null or undefined
        if (folderName === null || folderName === undefined) {
            throw new Error('Required parameter folderName was null or undefined when calling createOrgFolderArtifact.');
        }

        // verify required parameter 'artifactName' is not null or undefined
        if (artifactName === null || artifactName === undefined) {
            throw new Error('Required parameter artifactName was null or undefined when calling createOrgFolderArtifact.');
        }

        // verify required parameter 'artifactContents' is not null or undefined
        if (artifactContents === null || artifactContents === undefined) {
            throw new Error('Required parameter artifactContents was null or undefined when calling createOrgFolderArtifact.');
        }

        if (description !== undefined) {
            localVarQueryParameters['description'] = ObjectSerializer.serialize(description, "string");
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        if (artifactContents !== undefined) {
            localVarFormParams['artifactContents'] = artifactContents;
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
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Status");
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
     * A new Version of the Application is created from the current latestVersion and the specified Artifact is deleted from that Version. The new Version is not published.  Existing Versions of the Application that contained the Artifact still do - they are not affected by this method.  Note: Artifacts are automatically purged if they are no longer referenced from any ApplicationVersion. 
     * @summary Deletes an Artifact from the latest Version of a particular Application.
     * @param appName The name of the application from which the Artifact is to be deleted.
     * @param artifactName The name of the Artifact to be deleted.
     */
    public async deleteAppArtifact (appName: string, artifactName: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/applicationVersions/artifacts/{artifactName}/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)))
            .replace('{' + 'artifactName' + '}', encodeURIComponent(String(artifactName)));
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
            throw new Error('Required parameter appName was null or undefined when calling deleteAppArtifact.');
        }

        // verify required parameter 'artifactName' is not null or undefined
        if (artifactName === null || artifactName === undefined) {
            throw new Error('Required parameter artifactName was null or undefined when calling deleteAppArtifact.');
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
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Status");
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
     * This method deletes the latest version of the Artifact from the Case Folder:  * If this is the only version of the Artifact, the Case Folder no longer references it. * If one or more older versions of the Artifact exist, the Case Folder is updated to reference the most recent version instead. 
     * @summary Deletes the latest version of an Artifact from a particular Case Folder.
     * @param folderName The name of the Case Folder that contains the Artifact.
     * @param artifactName The name of the Artifact to be deleted.
     * @param $sandbox The id of the Sandbox that contains the Case Folder.
     */
    public async deleteFolderArtifact (folderName: string, artifactName: string, $sandbox: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/caseFolders/{folderName}/artifacts/{artifactName}/'
            .replace('{' + 'folderName' + '}', encodeURIComponent(String(folderName)))
            .replace('{' + 'artifactName' + '}', encodeURIComponent(String(artifactName)));
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

        // verify required parameter 'folderName' is not null or undefined
        if (folderName === null || folderName === undefined) {
            throw new Error('Required parameter folderName was null or undefined when calling deleteFolderArtifact.');
        }

        // verify required parameter 'artifactName' is not null or undefined
        if (artifactName === null || artifactName === undefined) {
            throw new Error('Required parameter artifactName was null or undefined when calling deleteFolderArtifact.');
        }

        // verify required parameter '$sandbox' is not null or undefined
        if ($sandbox === null || $sandbox === undefined) {
            throw new Error('Required parameter $sandbox was null or undefined when calling deleteFolderArtifact.');
        }

        if ($sandbox !== undefined) {
            localVarQueryParameters['$sandbox'] = ObjectSerializer.serialize($sandbox, "string");
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
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Status");
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
     * This method deletes the latest version of the Artifact from the Org Folder:  * If this is the only version of the Artifact, the Org Folder no longer references it. * If one or more older versions of the Artifact exist, the Org Folder is updated to reference the most recent version instead. 
     * @summary Deletes the latest version of an Artifact from a particular Org Folder.
     * @param folderName The name of the Org Folder that contains the Artifact.
     * @param artifactName The name of the Artifact to be deleted.
     */
    public async deleteOrgFolderArtifact (folderName: string, artifactName: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/orgFolders/{folderName}/artifacts/{artifactName}/'
            .replace('{' + 'folderName' + '}', encodeURIComponent(String(folderName)))
            .replace('{' + 'artifactName' + '}', encodeURIComponent(String(artifactName)));
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

        // verify required parameter 'folderName' is not null or undefined
        if (folderName === null || folderName === undefined) {
            throw new Error('Required parameter folderName was null or undefined when calling deleteOrgFolderArtifact.');
        }

        // verify required parameter 'artifactName' is not null or undefined
        if (artifactName === null || artifactName === undefined) {
            throw new Error('Required parameter artifactName was null or undefined when calling deleteOrgFolderArtifact.');
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
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Status");
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
     * @summary Returns Artifacts for a particular Version of an Application.
     * @param appName The name of the Application for which Artifacts are to be returned.
     * @param version The Version of the Application for which Artifacts are to be returned.
     * @param $filter A filter expression that defines the Artifacts to be returned. The expression can contain the following operand:  * __name__ (optional): The name of the Artifact to be returned. Only one name can be used. You can search for partial names by using the contains function.    Supported operator: ‘eq’   Supported function: ‘contains(name,’value’)\&#39;      For example, the following string returns all Artifacts that contain ‘json’ in their name:      $filter&#x3D;contains(name,\&#39;json\&#39;) 
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items. 
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of Artifacts in the result, rather than the Artifacts themselves.   Note: If $count is used, $skip or $top cannot be used. 
     */
    public async getAppArtifacts (appName: string, version: string, $filter?: string, $skip?: string, $top?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/applicationVersions/{version}/artifacts/'
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
            throw new Error('Required parameter appName was null or undefined when calling getAppArtifacts.');
        }

        // verify required parameter 'version' is not null or undefined
        if (version === null || version === undefined) {
            throw new Error('Required parameter version was null or undefined when calling getAppArtifacts.');
        }

        if ($filter !== undefined) {
            localVarQueryParameters['$filter'] = ObjectSerializer.serialize($filter, "string");
        }

        if ($skip !== undefined) {
            localVarQueryParameters['$skip'] = ObjectSerializer.serialize($skip, "string");
        }

        if ($top !== undefined) {
            localVarQueryParameters['$top'] = ObjectSerializer.serialize($top, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<Artifact>");
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
     * This method lists both the latest version and all the archived versions of the Artifact.
     * @summary Returns all existing versions of a particular Artifact in a Case Folder.
     * @param folderName The name of the Case Folder that contains the Artifact.
     * @param artifactName The name of the Artifact for which versions should be returned.
     * @param $sandbox The id of the Sandbox that contains the Case Folder.
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items. 
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of versions of the specified Artifact in the result, rather than the versions themselves.   Note: If $count is used, $skip or $top cannot be used. 
     */
    public async getFolderArtifactVersions (folderName: string, artifactName: string, $sandbox: string, $skip?: string, $top?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }> {
        const localVarPath = this.basePath + '/caseFolders/{folderName}/artifacts/{artifactName}/artifactVersions'
            .replace('{' + 'folderName' + '}', encodeURIComponent(String(folderName)))
            .replace('{' + 'artifactName' + '}', encodeURIComponent(String(artifactName)));
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

        // verify required parameter 'folderName' is not null or undefined
        if (folderName === null || folderName === undefined) {
            throw new Error('Required parameter folderName was null or undefined when calling getFolderArtifactVersions.');
        }

        // verify required parameter 'artifactName' is not null or undefined
        if (artifactName === null || artifactName === undefined) {
            throw new Error('Required parameter artifactName was null or undefined when calling getFolderArtifactVersions.');
        }

        // verify required parameter '$sandbox' is not null or undefined
        if ($sandbox === null || $sandbox === undefined) {
            throw new Error('Required parameter $sandbox was null or undefined when calling getFolderArtifactVersions.');
        }

        if ($sandbox !== undefined) {
            localVarQueryParameters['$sandbox'] = ObjectSerializer.serialize($sandbox, "string");
        }

        if ($skip !== undefined) {
            localVarQueryParameters['$skip'] = ObjectSerializer.serialize($skip, "string");
        }

        if ($top !== undefined) {
            localVarQueryParameters['$top'] = ObjectSerializer.serialize($top, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<Artifact>");
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
     * The latest version of each Artifact is returned. (The latest version is the one with the highest artifactVersion.)
     * @summary Returns Artifacts for a particular Case Folder.
     * @param folderName The name of the Case Folder for which Artifacts are to be returned.
     * @param $sandbox The id of the Sandbox containing the Case Folder.
     * @param $filter A filter expression that defines the Artifacts to be returned. The expression can contain the following operand:   * __name__ (optional): The name of the Artifact to be returned. Only one name can be used. You can search for partial names by using the contains function.  Supported operator: ‘eq’ Supported function: ‘contains(name,’html’)\&#39;  For example, the following string returns all Artifacts that contain ‘html’ in their name:  $filter&#x3D;contains(name,’order’) 
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items. 
     * @param $orderby The order in which results should be sorted, either ascending order using __asc__ or descending order using __desc__, based on one of the following Case Folder properties: name, owner, ownerSub, ownerSandbox, creationDate, lastModifiedDate, lastModifiedBy, publishedVersion, latestVersion.   For example, the following string sorts results in ascending order by name:  $orderby&#x3D;name asc 
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of Artifacts in the result, rather than the Artifacts themselves.   Note: If $count is used, $skip, $top or $orderby cannot be used. 
     */
    public async getFolderArtifacts (folderName: string, $sandbox: string, $filter?: string, $skip?: string, $top?: string, $orderby?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }> {
        const localVarPath = this.basePath + '/caseFolders/{folderName}/artifacts/'
            .replace('{' + 'folderName' + '}', encodeURIComponent(String(folderName)));
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

        // verify required parameter 'folderName' is not null or undefined
        if (folderName === null || folderName === undefined) {
            throw new Error('Required parameter folderName was null or undefined when calling getFolderArtifacts.');
        }

        // verify required parameter '$sandbox' is not null or undefined
        if ($sandbox === null || $sandbox === undefined) {
            throw new Error('Required parameter $sandbox was null or undefined when calling getFolderArtifacts.');
        }

        if ($sandbox !== undefined) {
            localVarQueryParameters['$sandbox'] = ObjectSerializer.serialize($sandbox, "string");
        }

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
            return new Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<Artifact>");
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
     * This method lists both the latest version and all the archived versions of the Artifact.
     * @summary Returns all existing versions of a particular Artifact in an Org Folder.
     * @param folderName The name of the Org Folder that contains the Artifact.
     * @param artifactName The name of the Artifact for which versions should be returned.
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items. 
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of versions of the specified Artifact in the result, rather than the versions themselves.   Note: If $count is used, $skip or $top cannot be used. 
     */
    public async getOrgFolderArtifactVersions (folderName: string, artifactName: string, $skip?: string, $top?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }> {
        const localVarPath = this.basePath + '/orgFolders/{folderName}/artifacts/{artifactName}/artifactVersions'
            .replace('{' + 'folderName' + '}', encodeURIComponent(String(folderName)))
            .replace('{' + 'artifactName' + '}', encodeURIComponent(String(artifactName)));
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

        // verify required parameter 'folderName' is not null or undefined
        if (folderName === null || folderName === undefined) {
            throw new Error('Required parameter folderName was null or undefined when calling getOrgFolderArtifactVersions.');
        }

        // verify required parameter 'artifactName' is not null or undefined
        if (artifactName === null || artifactName === undefined) {
            throw new Error('Required parameter artifactName was null or undefined when calling getOrgFolderArtifactVersions.');
        }

        if ($skip !== undefined) {
            localVarQueryParameters['$skip'] = ObjectSerializer.serialize($skip, "string");
        }

        if ($top !== undefined) {
            localVarQueryParameters['$top'] = ObjectSerializer.serialize($top, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<Artifact>");
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
     * The latest version of each Artifact is returned. (The latest version is the one with the highest artifactVersion.)
     * @summary Returns Artifacts for a particular Org Folder.
     * @param folderName The name of the Org Folder for which Artifacts are to be returned.
     * @param $filter A filter expression that defines the Artifacts to be returned. The expression can contain the following operand:   * __name__ (optional): The name of the Artifact to be returned. Only one name can be used. You can search for partial names by using the contains function.    Supported operator: ‘eq’   Supported function: ‘contains(name,’html’)\&#39;    For example, the following string returns all Artifacts that contain ‘html’ in their name:      $filter&#x3D;contains(name,’order’) 
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items. 
     * @param $orderby The order in which results should be sorted, either ascending order using __asc__ or descending order using __desc__, based on one of the following Org Folder properties: name, owner, ownerSub, ownerSandbox, creationDate, lastModifiedDate, lastModifiedBy, publishedVersion, latestVersion.   For example, the following string sorts results in ascending order by name:    $orderby&#x3D;name asc 
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of Artifacts in the result, rather than the Artifacts themselves.   Note: If $count is used, $skip, $top or $orderby cannot be used. 
     */
    public async getOrgFolderArtifacts (folderName: string, $filter?: string, $skip?: string, $top?: string, $orderby?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }> {
        const localVarPath = this.basePath + '/orgFolders/{folderName}/artifacts/'
            .replace('{' + 'folderName' + '}', encodeURIComponent(String(folderName)));
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

        // verify required parameter 'folderName' is not null or undefined
        if (folderName === null || folderName === undefined) {
            throw new Error('Required parameter folderName was null or undefined when calling getOrgFolderArtifacts.');
        }

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
            return new Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<Artifact>");
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
     * @summary Lists Artifacts for a particular Version of a System Application.
     * @param appName The name of the System Application for which Artifacts are to be returned.
     * @param version The Version of the System Application for which Artifacts are to be returned.
     * @param $filter A filter expression that defines the Artifacts to be returned. The expression can contain the following operand:  * __name__ (optional): The name of the Artifact to be returned. Only one name can be used. You can search for partial names by using the contains function.  Supported operator: ‘eq’ Supported function: ‘contains(name,’value’)\&#39;  For example, the following string returns all Artifacts that contain ‘json’ in their name:  $filter&#x3D;contains(name,’json’) 
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items. 
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of Artifacts in the result, rather than the Artifacts themselves.   Note: If $count is used, $skip or $top cannot be used. 
     */
    public async getSysAppArtifacts (appName: string, version: string, $filter?: string, $skip?: string, $top?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }> {
        const localVarPath = this.basePath + '/systemApplications/{appName}/applicationVersions/{version}/artifacts/'
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
            throw new Error('Required parameter appName was null or undefined when calling getSysAppArtifacts.');
        }

        // verify required parameter 'version' is not null or undefined
        if (version === null || version === undefined) {
            throw new Error('Required parameter version was null or undefined when calling getSysAppArtifacts.');
        }

        if ($filter !== undefined) {
            localVarQueryParameters['$filter'] = ObjectSerializer.serialize($filter, "string");
        }

        if ($skip !== undefined) {
            localVarQueryParameters['$skip'] = ObjectSerializer.serialize($skip, "string");
        }

        if ($top !== undefined) {
            localVarQueryParameters['$top'] = ObjectSerializer.serialize($top, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: Array<Artifact>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<Artifact>");
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
     * A new Version of the Application is created from the current latestVersion and the specified Artifact is renamed in that Version. The new Version is not published.  Existing Versions of the Application that contained the Artifact still retain the Artifact\'s original name - they are not affected by this method.  Note: This method can also be used to rename existing folders. Any Artifacts in the affected path are moved and made accessible via the updated path name. To rename a directory you must include a trailing space on the path in both the appName and details parameters of the request. For example, to rename a path \'dir1/dir2\' as \'dir1/newdir\':  * Specify the appName as \'dir1%2fdir2%2f\'.  * Specify the details parameter as: {\"name\": \"dir1/newdir/\"} 
     * @summary Renames an existing Artifact in a particular Application.
     * @param appName The name of the Application containing the Artifact that is to be renamed.
     * @param artifactName The full Application path of the Artifact to be renamed. Each forward slash character in the path must be URL encoded as \&#39;%2F’. 
     * @param details The following values, specified in application/json format:  * __name__ (required): The new name of the Artifact. * __description__ (optional): A suitable description.  For example:  { \&quot;name\&quot;: \&quot;sample1.html\&quot;, \&quot;description\&quot;: \&quot;Renamed to fix issue\&quot; } 
     */
    public async renameAppArtifact (appName: string, artifactName: string, details: Artifact, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/applications/{appName}/applicationVersions/artifacts/{artifactName}/'
            .replace('{' + 'appName' + '}', encodeURIComponent(String(appName)))
            .replace('{' + 'artifactName' + '}', encodeURIComponent(String(artifactName)));
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
            throw new Error('Required parameter appName was null or undefined when calling renameAppArtifact.');
        }

        // verify required parameter 'artifactName' is not null or undefined
        if (artifactName === null || artifactName === undefined) {
            throw new Error('Required parameter artifactName was null or undefined when calling renameAppArtifact.');
        }

        // verify required parameter 'details' is not null or undefined
        if (details === null || details === undefined) {
            throw new Error('Required parameter details was null or undefined when calling renameAppArtifact.');
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
            body: ObjectSerializer.serialize(details, "Artifact")
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
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Status");
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
