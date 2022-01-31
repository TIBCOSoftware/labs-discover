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
import { CaseFolder } from '../model/caseFolder';
import { OrgFolder } from '../model/orgFolder';
import { Status } from '../model/status';

import { ObjectSerializer, Authentication, VoidAuth, Interceptor } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = '/webresource/v1';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum FoldersApiApiKeys {
}

export class FoldersApi {
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

    public setApiKey(key: FoldersApiApiKeys, value: string) {
        (this.authentications as any)[FoldersApiApiKeys[key]].apiKey = value;
    }

    public addInterceptor(interceptor: Interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * The Artifact methods can be used later to add content to the Org Folder.
     * @summary Creates a new, empty Org Folder.
     * @param details The required details for the new Org Folder:  * __name__ (required): Unique name (within the subscription) for the new Org Folder.  * __extRef__ (optional): Reference to associate with the Org Folder. An extRef value can be used to associate multiple Org Folders, and can be used in a $filter parameter when searching for Org Folders.  * __tags__: Not currently used by this method - if specified it will be ignored. 
     */
    public async createOrgFolder (details: Application, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/orgFolders/';
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
            throw new Error('Required parameter details was null or undefined when calling createOrgFolder.');
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
     * Note: This method deletes the Org Folder and all associated Artifacts. It cannot be undone. 
     * @summary Deletes a particular Org Folder.
     * @param folderName Name of the Org Folder to delete.
     */
    public async deleteOrgFolder (folderName: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Status;  }> {
        const localVarPath = this.basePath + '/orgFolders/{folderName}/'
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
            throw new Error('Required parameter folderName was null or undefined when calling deleteOrgFolder.');
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
     * @summary Returns a particular Case Folder.
     * @param folderName The name of the Case Folder to be returned.
     * @param $sandbox The id of the Sandbox that contains the Case Folder.
     */
    public async getFolderByName (folderName: string, $sandbox: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: CaseFolder;  }> {
        const localVarPath = this.basePath + '/caseFolders/{folderName}/'
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
            throw new Error('Required parameter folderName was null or undefined when calling getFolderByName.');
        }

        // verify required parameter '$sandbox' is not null or undefined
        if ($sandbox === null || $sandbox === undefined) {
            throw new Error('Required parameter $sandbox was null or undefined when calling getFolderByName.');
        }

        if ($sandbox !== undefined) {
            localVarQueryParameters['$sandbox'] = ObjectSerializer.serialize($sandbox, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: CaseFolder;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "CaseFolder");
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
     * @summary Returns Case Folders in the specified Sandbox.
     * @param $sandbox The id of the Sandbox that contains the Case Folder.
     * @param $filter A filter expression that defines the Case Folders to be returned. The expression can contain the following operand:  * __name__ (optional): The name of the Case Folder to be returned. Only one name can be used. You can search for partial names by using the contains function.  Supported operator: ‘eq’ Supported function: ‘contains(name,’value’)\&#39;  For example, the following string returns all Case Folders that contain \&#39;order\&#39; in their name:  $filter&#x3D;contains(name,’order’) 
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items. 
     * @param $orderby The order in which results should be sorted, either ascending order using __asc__ or descending order using __desc__, based on one of the following Case Folder properties: name, owner, ownerSub, ownerSandbox, creationDate, lastModifiedDate, lastModifiedBy, publishedVersion, latestVersion.   For example, the following string sorts results in ascending order by name:  $orderby&#x3D;name asc 
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of Case Folders in the result, rather than the Case Folders themselves.   Note: If $count is used, $skip, $top or $orderby cannot be used. 
     */
    public async getFolders ($sandbox: string, $filter?: string, $skip?: string, $top?: string, $orderby?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<CaseFolder>;  }> {
        const localVarPath = this.basePath + '/caseFolders/';
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

        // verify required parameter '$sandbox' is not null or undefined
        if ($sandbox === null || $sandbox === undefined) {
            throw new Error('Required parameter $sandbox was null or undefined when calling getFolders.');
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
            return new Promise<{ response: http.IncomingMessage; body: Array<CaseFolder>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<CaseFolder>");
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
     * @summary Returns a particular Org Folder.
     * @param folderName The name of the Org Folder to be returned.
     */
    public async getOrgFolderByName (folderName: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: OrgFolder;  }> {
        const localVarPath = this.basePath + '/orgFolders/{folderName}/'
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
            throw new Error('Required parameter folderName was null or undefined when calling getOrgFolderByName.');
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
            return new Promise<{ response: http.IncomingMessage; body: OrgFolder;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "OrgFolder");
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
     * @summary Returns Org Folders in the subscription.
     * @param $filter A filter expression that defines the Org Folders to be returned. The expression can contain the following operands:  * __name__ (optional): The name of the Org Folder to be returned. Only one name can be used. You can search for partial names by using the contains function.    Supported operator: ‘eq’   Supported function: ‘contains(name,’value’)\&#39;    For example, the following string returns all Org Folders that contain \&#39;documents\&#39; in their name:      $filter&#x3D;contains(name,’documents’)  * __extRef__ (optional): The extRef associated with the Org Folders to be returned. (An extRef value can be assigned to an Org Folder when it is created.)    Supported operator: ‘eq’   Supported function: ‘contains(extRef,’value’)\&#39;    For example, the following string returns all Org Folders that contain \&#39;app1\&#39; in their extRef:      $filter&#x3D;contains(extRef,’app1’) 
     * @param $skip The number of items to exclude from the results list, counting from the beginning of the list. The value must be 0 or greater. For example, &#x60;$skip&#x3D;80&#x60; results in the first 80 items in the results list being ignored. Subsequent items are returned, starting with the 81st item in the list. 
     * @param $top The maximum number of items to be returned from the results list (with the first item determined by the value of the $skip parameter). The value of $top must be 1 or greater. For example, &#x60;$top&#x3D;20&#x60; returns 20 items from the results list, or all the results if the list contains 20 or fewer items. 
     * @param $orderby The order in which results should be sorted, either ascending order using __asc__ or descending order using __desc__, based on one of the following Org Folder properties: name, owner, ownerSub, ownerSandbox, creationDate, lastModifiedDate, lastModifiedBy, publishedVersion, latestVersion.   For example, the following string sorts results in ascending order by name:    $orderby&#x3D;name asc 
     * @param $count If set to \&#39;TRUE\&#39;, returns the number of Org Folders in the result, rather than the Org Folders themselves.   Note: If $count is used, $skip, $top or $orderby cannot be used. 
     */
    public async getOrgFolders ($filter?: string, $skip?: string, $top?: string, $orderby?: string, $count?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<OrgFolder>;  }> {
        const localVarPath = this.basePath + '/orgFolders/';
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
            return new Promise<{ response: http.IncomingMessage; body: Array<OrgFolder>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<OrgFolder>");
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
