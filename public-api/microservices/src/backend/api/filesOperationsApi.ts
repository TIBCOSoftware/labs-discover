/**
 * TIBCO DISCOVER backend microservice
 * Api Layer for the backend of Project Discover
 *
 * The version of the OpenAPI document: 1.0
 * Contact: fcenedes@tibco.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import localVarRequest from 'request';
import http from 'http';

/* tslint:disable:no-unused-locals */
import { ActionPerformedFiles } from '../model/actionPerformedFiles';
import { ActionPerformedFilesPreview } from '../model/actionPerformedFilesPreview';
import { RedisContent } from '../model/redisContent';
import { S3Content } from '../model/s3Content';

import { ObjectSerializer, Authentication, VoidAuth, Interceptor } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = 'https://discover.labs.tibcocloud.com';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum FilesOperationsApiApiKeys {
}

export class FilesOperationsApi {
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

    public setApiKey(key: FilesOperationsApiApiKeys, value: string) {
        (this.authentications as any)[FilesOperationsApiApiKeys[key]].apiKey = value;
    }

    public addInterceptor(interceptor: Interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * Delete the specified file on storage
     * @summary Delete the specified file on storage
     * @param orgid Organization Id
     * @param filename FileName to be deleted
     */
    public async deleteRouteSegment (orgid: string, filename: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: ActionPerformedFiles;  }> {
        const localVarPath = this.basePath + '/files/{orgid}/{filename}'
            .replace('{' + 'orgid' + '}', encodeURIComponent(String(orgid)))
            .replace('{' + 'filename' + '}', encodeURIComponent(String(filename)));
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

        // verify required parameter 'orgid' is not null or undefined
        if (orgid === null || orgid === undefined) {
            throw new Error('Required parameter orgid was null or undefined when calling deleteRouteSegment.');
        }

        // verify required parameter 'filename' is not null or undefined
        if (filename === null || filename === undefined) {
            throw new Error('Required parameter filename was null or undefined when calling deleteRouteSegment.');
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
            return new Promise<{ response: http.IncomingMessage; body: ActionPerformedFiles;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "ActionPerformedFiles");
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
     * Return list of files stored in this org
     * @summary Return list of files stored in this org
     * @param orgid Organization Id
     * @param filename filename to preview (original name)
     */
    public async getPreviewRoute (orgid: string, filename: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: ActionPerformedFilesPreview;  }> {
        const localVarPath = this.basePath + '/files/preview/{orgid}/{filename}'
            .replace('{' + 'orgid' + '}', encodeURIComponent(String(orgid)))
            .replace('{' + 'filename' + '}', encodeURIComponent(String(filename)));
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

        // verify required parameter 'orgid' is not null or undefined
        if (orgid === null || orgid === undefined) {
            throw new Error('Required parameter orgid was null or undefined when calling getPreviewRoute.');
        }

        // verify required parameter 'filename' is not null or undefined
        if (filename === null || filename === undefined) {
            throw new Error('Required parameter filename was null or undefined when calling getPreviewRoute.');
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
            return new Promise<{ response: http.IncomingMessage; body: ActionPerformedFilesPreview;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "ActionPerformedFilesPreview");
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
     * Return list of files stored in this org
     * @summary Return list of files stored in this org
     * @param orgid Organization Id
     */
    public async getRouteFile (orgid: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: S3Content;  }> {
        const localVarPath = this.basePath + '/files/V1/{orgid}'
            .replace('{' + 'orgid' + '}', encodeURIComponent(String(orgid)));
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

        // verify required parameter 'orgid' is not null or undefined
        if (orgid === null || orgid === undefined) {
            throw new Error('Required parameter orgid was null or undefined when calling getRouteFile.');
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
            return new Promise<{ response: http.IncomingMessage; body: S3Content;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "S3Content");
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
     * Return list of files stored in this org
     * @summary Return list of files stored in this org
     * @param orgid Organization Id
     */
    public async getRouteFileV2 (orgid: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: RedisContent;  }> {
        const localVarPath = this.basePath + '/files/{orgid}'
            .replace('{' + 'orgid' + '}', encodeURIComponent(String(orgid)));
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

        // verify required parameter 'orgid' is not null or undefined
        if (orgid === null || orgid === undefined) {
            throw new Error('Required parameter orgid was null or undefined when calling getRouteFileV2.');
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
            return new Promise<{ response: http.IncomingMessage; body: RedisContent;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "RedisContent");
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
     * Upload files to backend storage
     * @summary Upload files to backend storage
     * @param orgid Organization Id
     * @param newline 
     * @param separator 
     * @param quoteChar 
     * @param encoding 
     * @param escapeChar 
     * @param csv 
     */
    public async postRouteFile (orgid: string, newline: string, separator: string, quoteChar: string, encoding: string, escapeChar: string, csv: RequestFile, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: ActionPerformedFiles;  }> {
        const localVarPath = this.basePath + '/files/{orgid}'
            .replace('{' + 'orgid' + '}', encodeURIComponent(String(orgid)));
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

        // verify required parameter 'orgid' is not null or undefined
        if (orgid === null || orgid === undefined) {
            throw new Error('Required parameter orgid was null or undefined when calling postRouteFile.');
        }

        // verify required parameter 'newline' is not null or undefined
        if (newline === null || newline === undefined) {
            throw new Error('Required parameter newline was null or undefined when calling postRouteFile.');
        }

        // verify required parameter 'separator' is not null or undefined
        if (separator === null || separator === undefined) {
            throw new Error('Required parameter separator was null or undefined when calling postRouteFile.');
        }

        // verify required parameter 'quoteChar' is not null or undefined
        if (quoteChar === null || quoteChar === undefined) {
            throw new Error('Required parameter quoteChar was null or undefined when calling postRouteFile.');
        }

        // verify required parameter 'encoding' is not null or undefined
        if (encoding === null || encoding === undefined) {
            throw new Error('Required parameter encoding was null or undefined when calling postRouteFile.');
        }

        // verify required parameter 'escapeChar' is not null or undefined
        if (escapeChar === null || escapeChar === undefined) {
            throw new Error('Required parameter escapeChar was null or undefined when calling postRouteFile.');
        }

        // verify required parameter 'csv' is not null or undefined
        if (csv === null || csv === undefined) {
            throw new Error('Required parameter csv was null or undefined when calling postRouteFile.');
        }

        (<any>Object).assign(localVarHeaderParams, options.headers);

        let localVarUseFormData = false;

        if (newline !== undefined) {
            localVarFormParams['newline'] = ObjectSerializer.serialize(newline, "string");
        }

        if (separator !== undefined) {
            localVarFormParams['separator'] = ObjectSerializer.serialize(separator, "string");
        }

        if (quoteChar !== undefined) {
            localVarFormParams['quoteChar'] = ObjectSerializer.serialize(quoteChar, "string");
        }

        if (encoding !== undefined) {
            localVarFormParams['encoding'] = ObjectSerializer.serialize(encoding, "string");
        }

        if (escapeChar !== undefined) {
            localVarFormParams['escapeChar'] = ObjectSerializer.serialize(escapeChar, "string");
        }

        if (csv !== undefined) {
            localVarFormParams['csv'] = csv;
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
            return new Promise<{ response: http.IncomingMessage; body: ActionPerformedFiles;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        body = ObjectSerializer.deserialize(body, "ActionPerformedFiles");
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
