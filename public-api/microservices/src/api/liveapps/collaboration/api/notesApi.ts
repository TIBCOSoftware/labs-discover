/**
 * Note Manager Service
 * The TIBCO Cloud(TM) Live Apps Note Manager Service allows users of an application to use Notes to collaborate around a _Related Item_. The Related Item can be any element of the application you choose, for example, a case, person, work item, trouble ticket, and so on.  Each Note that is posted is associated with a single Related Item, which is identified by a unique Related Item type and ID.  Notes are conceptually organized under Collections, Topics, and Threads:  - A __Collection__ is a name used to group Topics together.  See $relatedItemCollection.  - A __Topic__ represents all of the Notes activity for a given Related Item. The Topic is used to track all activity associated with the Related Item. Each Topic can have one or more Threads. A Topic is automatically deleted if the last Thread on a Topic is deleted.  A Topic can also be explicitly deleted (see Topic Lifecycle below), which deletes any Threads or Notifications set to life-cycle with the Related Item associated with the Topic.  - A __Thread__ represents all of the Notes activity for a given top-level Note. A top-level Note is a Note that is posted directly to a Related Item and not in reply to another Note. All of the reply Notes to this top-level Note and subsequent descendant Notes are part of this Thread.  A Thread is automatically deleted if the top-level Note is deleted.  This forms a hierarchy that can be represented like this:  - Related Item 1 (Topic 1)     - Top-level Note 1.1 (Thread 1.1)         - Reply Note 1.1.1             - Reply to reply 1.1.1.1             - ... etc.         - Reply Note 1.1.2     - Top-level Note 1.2 (Thread 1.2)         - Reply Note 1.2.1         - ... etc. - Related Item 2 (Topic 2)     - Top-level Note 2.1 (Thread 2.1)         - Reply Note 2.1.1     - Top-level Note 2.2 (Thread 2.2)         - Reply Note 2.2.1         - Reply Note 2.2.2         - ... etc.  - See the GET /notes description for additional details on hierarchy usage and options for paging large lists of Notes.  A Note consists of a title and optionally some simple free text.  Any User can create a top-level Note. A User can always edit or delete their own Notes (that is, Notes they created). The one exception to this is setting the Note isHidden property. The Note isHidden property cannot be changed by the Note creator unless they also have a ThreadRole of OWNER or MODERATOR. The title and text of a Note can only be modified by the User who created the Note.  If a parent Note is deleted, all reply Notes are implicitly deleted, regardless of who created the reply Notes.  A Note can optionally contain Attributes, which can be used by the client application to classify or give further meaning to the Note. These Attributes are not modelled, therefore it is up to the client application to project the appropriate meaning. An example usage might be to specify metadata in a Note Attribute that provides \'location\' information related to a work process or document, which could be used by the client application to display a Note in a specific context.  When a new Thread is created, an optional list of Collection name values can be specified (see ThreadNote.relatedItemCollection).  This is used to associate the Thread\'s Topic to the given Collection names.  Notifications can optionally be specified for Collections, Topics, and Threads so that a notice is sent when a Note is added, and optionally when a Note is updated or deleted.  Notifications apply to Users directly or through Group membership.  If Notifications include a User more than once for a given notice event, only a single Notification is sent.  To receive a Notification, a User must have a Role that allows viewing the Notes in the Thread.  The notifications property of a ThreadNote can optionally be set when a Thread is created.  If notifications are not set in the ThreadNote, no Notifications are sent on the Thread until Notifications are added using another request.  __Note Types__ When a Note is created, it must be given one of the following types:  - ISSUE - RESOLUTION - QUESTION - ANSWER - INFORMATIONAL  Once a Note is created, its type can\'t be changed.  A top-level Note must be an ISSUE, QUESTION, or INFORMATIONAL type.  A RESOLUTION Note can only reply to an ISSUE Note and an ANSWER Note can only reply to a QUESTION Note.  An ISSUE, QUESTION, or INFORMATIONAL type Note can be a reply to any other Note.  An INFORMATIONAL Note is a general comment that does not have any specific reply type.  __Note Status__ Depending on the type of Note, and its current state, each Note has one of the following status values:  - UNRESOLVED - UNANSWERED - RESOLVED - ANSWERED - ACCEPTED - UNACCEPTED - UNCLASSIFIED  This value is set by the service to indicate the current status of each Note.  These are set as follows:  - ISSUE Notes:     - These initially have a status of UNRESOLVED.     - When a RESOLUTION reply Note is accepted, the status is changed to RESOLVED.     - If a previously accepted RESOLUTION reply Note is unaccepted, the status is changed back to UNRESOLVED.  - QUESTION Notes:     - These initially have a status of UNANSWERED.     - When an ANSWER reply Note is accepted, the status is changed to ANSWERED.     - If a previously accepted ANSWER reply Note is unaccepted, the status is changed back to UNANSWERED.  - RESOLUTION and ANSWER Notes:     - These initially have a status of UNACCEPTED.     - When a RESOLUTION or ANSWER reply Note is accepted by an ISSUE or QUESTION Note (respectively), the status is changed to ACCEPTED.     - If a previously accepted RESOLUTION or ANSWER reply Note is unaccepted, the status is changed back to UNACCEPTED.  - INFORMATIONAL Notes:     - These have a status of UNCLASSIFIED, which does not change.  __Thread Roles__ Roles can optionally be assigned to a Thread to add or limit specific access to Notes in a Thread. The ThreadRole types are summarized below:  __Cumulative Roles:__  The following four Roles are cumulative, with each successive Role adding more access to what is granted by the previous Role.  - A VIEWER can:      - View Notes or the Thread     - Receive Notifications     - Add, modify, or remove Notifications for themselves on a Collection, Topic, or Thread  - A REPLIER has VIEWER access and can also:      - Add a reply Note  - A MODERATOR has REPLIER access and can also:      - Hide or unhide a Note     - Accept or unaccept a reply     - Set notificationUrl and notificationLabel values     - Lock or unlock the Thread     - Add, modify, or remove Thread Notifications and Roles  - An OWNER has MODERATOR access and can also:      - Edit Note Attributes     - Delete Notes     - Delete Threads (see THREAD_DELETER Role)     - Update the relatedItemCollection value of a Topic (see COLLECTION_MODERATOR Role)  __Non-Cumulative Roles:__  The following Roles are not cumulative, but grant specific types of access.  - A THREAD_DELETER can:    - Delete Threads      A Thread is deleted when:      - The top-level Note for a Thread is deleted.     - The Topic a Thread belongs to is deleted.     - A Topic is deleted that matches the Related Item that a Thread is lifecycled with.  - A THREAD_VIEWER can:    - View Threads      This allows the User to view the Thread but not the Notes in the Thread.  - A COLLECTION_MODERATOR can:    - Update the relatedItemCollection value of a Topic      This allows the User to update the relatedItemCollection value of a Topic using the PUT /topics request.  The User must have COLLECTION_MODERATOR access to all of the Threads that are under a Topic to perform this request.  A Role can be assigned to a specific User or to a Group (Groups are set up using TIBCO(R) Live Apps Group Administration).  Roles can be assigned at the time a Thread is created (a new top-level Note is added) by setting the ThreadNote roles property.  Roles can also be added, modified, or deleted after the Thread is created by updating the roles property of a Thread.  - If the ThreadNote roles property is not set (null or omitted) when a Thread is created, a REPLIER Role for the \'System: ALL_USERS\' Group is automatically created, which gives all users the ability to view or reply to a Note. - If the ThreadNote roles property is set to an empty Array when a Thread is created, then no Roles are assigned for the Thread. - The User who creates a Thread is implicitly assigned an OWNER Role for that Thread.  A User that is a member of the \'System: ADMINISTRATOR\' Group is implicitly assigned an OWNER Role for all Threads.  This is an inherent behavior that cannot be modified.  If a User possesses multiple Roles, access is granted based on the least restrictive Role.  __Topic Lifecycle__  Topics that are created for Related Item Types that are specific to Live Apps internal use (\'LIVEAPPS_\', \'DT_\', or \'RT_\') are automatically deleted when the associated Related Item is deleted from the system.  For custom-defined Related Item Types, the DELETE /topics request can be used to delete a Topic for a specific Related Item.  Additionally, Threads and Collection Notifications can be associated with a Related Item so that they are also deleted when the associated Topic is deleted using the DELETE /topics request.  This is set on a Thread using the lifecycledWithType and lifecycledWithId properties of a ThreadNote (for a new Thread using POST /notes) or a Thread (for updating an existing Thread using PUT /threads).  This is set for a Collection Notification using the NotifyCollection lifecycledWithType and lifecycledWithId properties.  Note that Threads and Collection Notifications are only life-cycled when an explicit DELETE /topics request is made, and are not effected by a Topic that is automatically deleted as a result of being empty.  When a Topic is deleted, all Threads and Notes under that Topic are deleted.  When a life-cycled Thread is deleted, all Notes under that Thread are deleted.  No Notifications are sent when Notes are deleted as a result of a Topic or Thread being deleted by one of the DELETE /topics requests.  See the description under DELETE /topics for details on how the lifecycledWithType and lifecycledWithId properties are applied.  
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
import { Note } from '../model/note';
import { ThreadNote } from '../model/threadNote';

import { ObjectSerializer, Authentication, VoidAuth, Interceptor } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = '/collaboration/v1';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum NotesApiApiKeys {
}

export class NotesApi {
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

    public setApiKey(key: NotesApiApiKeys, value: string) {
        (this.authentications as any)[NotesApiApiKeys[key]].apiKey = value;
    }

    public addInterceptor(interceptor: Interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * Creates a new top-level Note and Thread for the Related Item specified.  <br>A top-level Note is a Note that is posted directly to a Related Item and not in reply to another Note.  <br>When Notifications are specified on a ThreadNote, these are inherently creating Thread Notifications, and notifyCollection, topicId, and threadId must be omitted or null.  <br>For notes that need to restrict who can view the note content, you should set the role for the note to VIEWER at the time the top-level note is created (in the ThreadNote payload of this request).  If Notifications are currently set on the Topic or a Collection associated with the Topic, these notifications are sent based on initial Roles set with the top-level Note when created.  If no VIEWER Role is set then by default there are no VIEWER restrictions to sending these notifications.  If you wait to set the role at a later time, a User may view the Note or receive notifications before you submit the request to restrict access.  <br>__Note__ - Do not set the __id__ value.  This is generated by the service and returned in the response.  Also, __replyAcceptedId__ does not apply, as no reply Note can yet exist for the Note being created. 
     * @summary Creates a top-level Note.
     * @param threadNote The ThreadNote to be added.
     */
    public async createNote (threadNote: ThreadNote, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: string;  }> {
        const localVarPath = this.basePath + '/notes';
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

        // verify required parameter 'threadNote' is not null or undefined
        if (threadNote === null || threadNote === undefined) {
            throw new Error('Required parameter threadNote was null or undefined when calling createNote.');
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
            body: ObjectSerializer.serialize(threadNote, "ThreadNote")
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
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "string");
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
     * Creates a new Note that is in reply to the Note matching the given ID. 
     * @summary Creates a reply Note.
     * @param noteId The identifier for a Note.
     * @param note The Note to be added.
     */
    public async createReplyNote (noteId: string, note: Note, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: string;  }> {
        const localVarPath = this.basePath + '/notes/{noteId}'
            .replace('{' + 'noteId' + '}', encodeURIComponent(String(noteId)));
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

        // verify required parameter 'noteId' is not null or undefined
        if (noteId === null || noteId === undefined) {
            throw new Error('Required parameter noteId was null or undefined when calling createReplyNote.');
        }

        // verify required parameter 'note' is not null or undefined
        if (note === null || note === undefined) {
            throw new Error('Required parameter note was null or undefined when calling createReplyNote.');
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
            body: ObjectSerializer.serialize(note, "Note")
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
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "string");
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
     * Deletes the Note matching the given ID.  The User must have delete access to the Note (the User\'s own Notes, and Notes in a Thread for which the User has at least an OWNER Role), or an error is returned.
     * @summary Deletes a Note.
     * @param noteId The identifier for a Note.
     */
    public async deleteNote (noteId: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body?: any;  }> {
        const localVarPath = this.basePath + '/notes/{noteId}'
            .replace('{' + 'noteId' + '}', encodeURIComponent(String(noteId)));
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

        // verify required parameter 'noteId' is not null or undefined
        if (noteId === null || noteId === undefined) {
            throw new Error('Required parameter noteId was null or undefined when calling deleteNote.');
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
     * Deletes Notes determined by the $filter query parameter, which is required.  The $filter is applied to only those Notes to which the User has delete access (the User\'s own Notes, and Notes in a Thread for which the User has at least an OWNER Role).
     * @summary Deletes Notes.
     * @param $filter The filter query option enables specific queries to be defined, based on inherent Note properties (title, type, id, relatedItemType, relatedItemId, relatedItemCollection, topicId, threadId, parentId, status, isHidden, level, notificationLabel, createdById, createdByName, createdDate, modifiedById, modifiedByName, modifiedDate, replyDate, replyCount, replyAcceptedId) or any Attributes defined for the Note, that returns the required set of items.  The Attribute names on the Note are qualified in the filter expression with the \&#39;attributes/\&#39; prefix, that is, attributes/attrName eq \&#39;value\&#39;.  &lt;br&gt;Both Note title and Attribute name are case-sensitive (a filter with title eq \&#39;Case Example\&#39; or attributes/attrName eq \&#39;Case Example\&#39; would match \&#39;Case Example\&#39; but not \&#39;case example\&#39;). (To perform case in-sensitive filtering, use the tolower and toupper functions (for more information, see the _Filtering and Sorting_ Key Concepts page).  &lt;br&gt;Non-hierarchical queries can include any of the Note properties in the $filter.  Hierarchical queries cannot include certain properties in the $filter, as indicated in the table below:  | Specified by                        | Excluded properties                                                                       | | ----------------------------------- |:-----------------------------------------------------------------------------------------:| | $relatedItemType and $relatedItemId | relatedItemType, relatedItemId, relatedItemCollection, topicId, parentId, level           | | $relatedItemCollection              | relatedItemCollection, parentId, level                                                    | | $repliesToId                        | relatedItemType, relatedItemId, relatedItemCollection, topicId, threadId, parentId, level |   &lt;br&gt;If the filter does not explicitly contain a filter clause for type, then by default, Notes of all types are returned.  A special filter property \&#39;isCreatedByMe\&#39; allows filtering based on the current User having created a Note.  This is set true or false (isCreatedByMe eq true).  For more information, see the _Filtering and Sorting_ Key Concepts page. 
     */
    public async deleteNotes ($filter?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body?: any;  }> {
        const localVarPath = this.basePath + '/notes';
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

        if ($filter !== undefined) {
            localVarQueryParameters['$filter'] = ObjectSerializer.serialize($filter, "string");
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
     * Returns the Note matching the given ID.
     * @summary Gets a Note.
     * @param noteId The identifier for a Note.
     */
    public async getNote (noteId: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Note;  }> {
        const localVarPath = this.basePath + '/notes/{noteId}'
            .replace('{' + 'noteId' + '}', encodeURIComponent(String(noteId)));
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

        // verify required parameter 'noteId' is not null or undefined
        if (noteId === null || noteId === undefined) {
            throw new Error('Required parameter noteId was null or undefined when calling getNote.');
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
            return new Promise<{ response: http.IncomingMessage; body: Note;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Note");
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
     * Returns Notes determined by the supplied query parameters.  The $filter parameter can be used to qualify which Notes are returned (for more information, see the _Filtering and Sorting_ Key Concepts page.  <br>Notes can be returned in either of two ordered forms:  - In an order that represents the hierarchy as a tree. - As a non-hierarchical list of Notes.  In each case, the Notes are returned in a flat array (there is no nesting of Notes).  The hierarchy is represented by the ordering of the Notes in the array.  <br>The three query parameter options shown below return Notes in an order that represents the hierarchy as a tree:  - $relatedItemType and $relatedItemId - When specified, returns a hierarchy of Notes matching the given Related Item Type and ID. - $relatedItemCollection - When specified, returns a hierarchy of Notes matching the Related Items associated with the relatedItemCollection values. - $repliesToId - When specified, returns a hierarchy of Notes descending from the Note matching the given repliesToId.  Otherwise, Notes are returned as a non-hierarchical list of Notes and the $filter parameter is applied to all Notes.  <br>Details for the hierarchical options are listed below:  Getting Notes for a Related Item or a Related Item Collection in Hierarchical Order --- When $relatedItemType and $relatedItemId are set, this returns a hierarchy of Notes matching the Related Item specified in the path parameters and determined by any additional query parameters.  Similarly, when $relatedItemCollection is set, this returns a hierarchy of Notes matching the Related Items associated with the relatedItemCollection value and determined by any additional query parameters.  Notes are returned in an order that represents the hierarchy as a tree.  The Note.level value indicates its nested position.  <br>As an example, the following JSON response (a flat array of Notes):      [       {\"title\":\"Top-level Note A\", \"level\":1, ...},       {\"title\":\"Reply Note A.a\", \"level\":2, ...},       {\"title\":\"Reply Note A.b\", \"level\":2, ...},       {\"title\":\"Reply Note A.b.a\", \"level\":3, ...},       {\"title\":\"Reply Note A.c\", \"level\":2, ...},       {\"title\":\"Top-level Note B\", \"level\":1, ...},       {\"title\":\"Reply Note B.a\", \"level\":2, ...},       {\"title\":\"Reply Note B.a.a\", \"level\":3, ...},       {\"title\":\"Reply Note B.b\", \"level\":2, ...}     ]  would represent a hierarchy like this:  - Top-level Note A     - Reply Note A.a     - Reply Note A.b         - Reply Note A.b.a     - Reply Note A.c - Top-level Note B     - Reply Note B.a         - Reply Note B.a.a     - Reply Note B.b  The $filter parameter is applied only to the top-level Notes (Note.level = 1) and can be used to qualify which top-level Notes are returned.  These Notes, and all Notes descending from these, are returned in hierarchical order.  Notes at the same level are sorted as specified by the $orderby query parameter.  The hierarchical level can be limited with the $level query parameter.  Getting Reply Notes in Hierarchical Order ---  When $repliesToId is set, this returns a hierarchy of Notes descending from the Note matching the given repliesToId and determined by the supplied query parameters.  Notes are returned in an order that represents the hierarchy as a tree.  The Note.level value indicates its nested position.  <br>As an example, the following JSON response (a flat array of Notes):      [       {\"title\":\"Reply to noteId - A\", \"level\":n, ...},       {\"title\":\"Reply Note A.a\", \"level\":n+1, ...},       {\"title\":\"Reply Note A.b\", \"level\":n+1, ...},       {\"title\":\"Reply Note A.b.a\", \"level\":n+2, ...},       {\"title\":\"Reply Note A.c\", \"level\":n+1, ...},       {\"title\":\"Reply to noteId - B\", \"level\":n, ...},       {\"title\":\"Reply Note B.a\", \"level\":n+1, ...},       {\"title\":\"Reply Note B.a.a\", \"level\":n+2, ...},       {\"title\":\"Reply Note B.b\", \"level\":n+1, ...}     ]  would represent a hierarchy like this:  - Reply to noteId - A     - Reply Note A.a     - Reply Note A.b         - Reply Note A.b.a     - Reply Note A.c - Reply to noteId - B     - Reply Note B.a         - Reply Note B.a.a     - Reply Note B.b  The $filter parameter is applied only to the direct reply Notes to the Note matching the given repliesToId and can be used to qualify which of these reply Notes are returned.  These Notes and all Notes descending from these are returned in hierarchical order.  Notes at the same level are sorted as specified by the $orderby query parameter.  The hierarchical level can be limited with the $level query parameter.  Paging Hierarchical Notes ---  Paging can be used to limit the amount of data returned by each request when dealing with a large number of Notes.  The $skip and $top query parameters can be used for this.  The $count=true query parameter might be used in an initial request to determine if paging is required.  <br>For hierarchical queries, the appropriate requests to use depends on how the Notes are displayed.  Two possible options are described here:  - Paging a fully expanded hierarchy:  In this scenario, the Notes retrieved are displayed in a fully expanded tree view and this view is then paged:   <br>   - Use $skip and $top applied to any of the hierarchical requests.   <br> - Expanding and paging each level in the hierarchy:  For this scenario, the initial view shows only the top-level Notes.  Any reply Notes are then retrieved as needed to expand the view to include replies.  Each level in the hierarchy is paged on its own.    <br>- First GET the top-level Notes and use $skip and $top to page this top level:   <br>   - Use $relatedItemType and $relatedItemId with $level=1   - Or use $relatedItemCollection with $level=1   - Or use a non-hierarchical list with $filter set with level=1 and other filter values as needed.  Note that in the $filter expression the level refers to the Note.level property.  The $level query parameter has a distinctly different usage.  See the $level parameter description below.    <br>- Then expand each sub-level:   <br>   - Use $repliesToId with $level=1 and use $skip and $top to page this level.  When paging it is possible that Notes are added, deleted, or modified between page requests.  This can result in overlaps or omissions of Notes from one page request to the next in some cases.  When current data is required during paging, the GET /lastAccessChanges request and the isDescendantNewOrModified property of a specific Note can be used to check for such changes and update the page requests if needed.  
     * @summary Gets Notes.
     * @param $skip Skips the specified number of items from the beginning of the list that would normally be returned.  These skipped items are not included in the result. - For example, \&#39;$skip&#x3D;80\&#39; will not return the first 80 items that would otherwise be returned from the REST call.  Subsequent items are returned, starting with the 81st item in the list.  The value must be 0 or greater.  An empty string is ignored. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $skip can change from one call to the next. 
     * @param $top Returns only this number of items from the start of the list that would be returned (subject to any use of $skip). - For example, \&#39;$top&#x3D;20\&#39; results in only the first 20 items from the list being returned.  The value must be 1 or greater and less than or equal to a maximum value of 500.  If not specified (or set to an empty string), a default value of 50 is used.  The maximum and default values do not apply when $count is set to true. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $top can change from one call to the next. 
     * @param $filter The filter query option enables specific queries to be defined, based on inherent Note properties (title, type, id, relatedItemType, relatedItemId, relatedItemCollection, topicId, threadId, parentId, status, isHidden, level, notificationLabel, createdById, createdByName, createdDate, modifiedById, modifiedByName, modifiedDate, replyDate, replyCount, replyAcceptedId) or any Attributes defined for the Note, that returns the required set of items.  The Attribute names on the Note are qualified in the filter expression with the \&#39;attributes/\&#39; prefix, that is, attributes/attrName eq \&#39;value\&#39;.  &lt;br&gt;Both Note title and Attribute name are case-sensitive (a filter with title eq \&#39;Case Example\&#39; or attributes/attrName eq \&#39;Case Example\&#39; would match \&#39;Case Example\&#39; but not \&#39;case example\&#39;). (To perform case in-sensitive filtering, use the tolower and toupper functions (for more information, see the _Filtering and Sorting_ Key Concepts page).  &lt;br&gt;Non-hierarchical queries can include any of the Note properties in the $filter.  Hierarchical queries cannot include certain properties in the $filter, as indicated in the table below:  | Specified by                        | Excluded properties                                                                       | | ----------------------------------- |:-----------------------------------------------------------------------------------------:| | $relatedItemType and $relatedItemId | relatedItemType, relatedItemId, relatedItemCollection, topicId, parentId, level           | | $relatedItemCollection              | relatedItemCollection, parentId, level                                                    | | $repliesToId                        | relatedItemType, relatedItemId, relatedItemCollection, topicId, threadId, parentId, level |   &lt;br&gt;If the filter does not explicitly contain a filter clause for type, then by default, Notes of all types are returned.  A special filter property \&#39;isCreatedByMe\&#39; allows filtering based on the current User having created a Note.  This is set true or false (isCreatedByMe eq true).  For more information, see the _Filtering and Sorting_ Key Concepts page. 
     * @param $orderby This query option is used to request items in either ascending order using __asc__ or descending order using __desc__, based on one of the Note properties (title, type, id, relatedItemType, relatedItemId, relatedItemCollection, topicId, threadId, parentId, status, isHidden, level, notificationLabel, createdById, createdByName, createdDate, modifiedById, modifiedByName, modifiedDate, replyDate, replyCount, replyAcceptedId).  For a hierarchical query ($relatedItemType and $relatedItemId, $relatedItemCollection, or $repliesToId are set), this query option is used to sort items in a hierarchy that are siblings at the same level (having the same parentId) in either ascending order using __asc__ or descending order using __desc__, based on one of the Note properties, excluding the properties indicated by the following table:  | Specified by                        | Excluded properties                                                                       | | ----------------------------------- |:-----------------------------------------------------------------------------------------:| | $relatedItemType and $relatedItemId | relatedItemType, relatedItemId, relatedItemCollection, topicId, parentId, level           | | $relatedItemCollection              | relatedItemCollection, parentId, level                                                    | | $repliesToId                        | relatedItemType, relatedItemId, relatedItemCollection, topicId, threadId, parentId, level |  &lt;br&gt;The default order is by createdDate ASC.  For more information, see the _Filtering and Sorting_ Key Concepts page. 
     * @param $search The $search value restricts the result to include only those Notes containing the specified search value (case sensitively).  This performs a textual search on the string of the Note text.  For example, \&#39;$search&#x3D;Scottsdale\&#39; returns Notes where the sub-string \&#39;Scottsdale\&#39; is located somewhere within the string of the Note text property.
     * @param $select This query option allows the selection of specific property values from the Note to be returned.  Other property values not included in the $select list will be returned as null.  The property names are specified as a comma-separated string that can contain any of [\&#39;title\&#39;, \&#39;type\&#39;, \&#39;text\&#39;, \&#39;notificationUrl\&#39;, \&#39;notificationLabel\&#39;, \&#39;attributes\&#39;, \&#39;id\&#39;, \&#39;relatedItemType\&#39;, \&#39;relatedItemId\&#39;, \&#39;relatedItemCollection\&#39;, \&#39;topicId\&#39;, \&#39;threadId\&#39;, \&#39;parentId\&#39;, \&#39;status\&#39;, \&#39;level\&#39;, \&#39;createdById\&#39;, \&#39;createdByName\&#39;, \&#39;createdDate\&#39;, \&#39;modifiedById\&#39;, \&#39;modifiedByName\&#39;, \&#39;modifiedDate\&#39;, \&#39;replyDate\&#39;, \&#39;replyCount\&#39;, \&#39;replyAcceptedId\&#39;, \&#39;isNew\&#39;, \&#39;isModified\&#39;, \&#39;isDescendantNewOrModified\&#39;, \&#39;descendantModifiedDate\&#39;, \&#39;thread\&#39;].  For example, \&#39;$select&#x3D;text,type,id\&#39; results in only the text, type, and id property values being returned. All of the other properties are returned with a null value in place of the actual property value.
     * @param $count Return a simple number only, this being the count of the items that would be returned from the request if the count query option was not present.  Note that the assigned value for $count is true, that is, the correct use of the count query option is \&#39;$count&#x3D;true\&#39;.  If \&#39;$count&#x3D;false\&#39; is used, then this will have no effect.  It is recognized that $count is an expensive method and should not be used by clients without consideration.
     * @param $relatedItemType The type for a Related Item. - This must be a non-zero length value (limited to 100 characters in length) and must be specified together with relatedItemId. - Any UTF-8 characters can be used. - The value is treated as case sensitive and white space is significant (not ignored). 
     * @param $relatedItemId The ID of a Related Item. - This must be a non-zero length value (limited to 100 characters in length) and must be specified together with relatedItemType. - Any UTF-8 characters can be used. - The value is treated as case sensitive and white space is significant (not ignored). 
     * @param $relatedItemCollection The Related Item Collection values for which Notes are returned in a hierarchical order. - This must not be set if $relatedItemType and $relatedItemId or $repliesToId are set. - Each name value must be a non-zero length value (limited to 100 characters in length). - Any UTF-8 characters can be used. - The name values are treated as case sensitive and white space is significant (not ignored).  Multiple collection name values can be specified using an ampersand character \&#39;&amp;\&#39; between each $relatedItemCollection&#x3D;nameValue expression.  For example, to set two collection names [\&#39;colName1\&#39;, \&#39;colName2\&#39;] use: - $relatedItemCollection&#x3D;colName1&amp;$relatedItemCollection&#x3D;colName2 
     * @param $repliesToId The ID of a Note for which the reply Notes are returned in a hierarchical order.  This must not be set if $relatedItemType and $relatedItemId or $relatedItemCollection are set.
     * @param $level Limits the hierarchical level returned by the request.  This applies only for hierarchical queries (when $relatedItemType and $relatedItemId, $relatedItemCollection, or $repliesToId are set) and returns an error otherwise.  The value must be 1 or greater.  An empty string is ignored.  For example \&#39;$level&#x3D;1\&#39; would limit the results to include only top-level Notes (or Notes that are a direct reply to the given $repliesToId if set), \&#39;$level&#x3D;2\&#39; would limit the results to include the first level of Notes and the first level of subsequent reply Notes.  The default level is unlimited.
     */
    public async getNotes ($skip?: string, $top?: string, $filter?: string, $orderby?: string, $search?: string, $select?: string, $count?: string, $relatedItemType?: string, $relatedItemId?: string, $relatedItemCollection?: Array<string>, $repliesToId?: string, $level?: string, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<Note>;  }> {
        const localVarPath = this.basePath + '/notes';
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

        if ($skip !== undefined) {
            localVarQueryParameters['$skip'] = ObjectSerializer.serialize($skip, "string");
        }

        if ($top !== undefined) {
            localVarQueryParameters['$top'] = ObjectSerializer.serialize($top, "string");
        }

        if ($filter !== undefined) {
            localVarQueryParameters['$filter'] = ObjectSerializer.serialize($filter, "string");
        }

        if ($orderby !== undefined) {
            localVarQueryParameters['$orderby'] = ObjectSerializer.serialize($orderby, "string");
        }

        if ($search !== undefined) {
            localVarQueryParameters['$search'] = ObjectSerializer.serialize($search, "string");
        }

        if ($select !== undefined) {
            localVarQueryParameters['$select'] = ObjectSerializer.serialize($select, "string");
        }

        if ($count !== undefined) {
            localVarQueryParameters['$count'] = ObjectSerializer.serialize($count, "string");
        }

        if ($relatedItemType !== undefined) {
            localVarQueryParameters['$relatedItemType'] = ObjectSerializer.serialize($relatedItemType, "string");
        }

        if ($relatedItemId !== undefined) {
            localVarQueryParameters['$relatedItemId'] = ObjectSerializer.serialize($relatedItemId, "string");
        }

        if ($relatedItemCollection !== undefined) {
            localVarQueryParameters['$relatedItemCollection'] = ObjectSerializer.serialize($relatedItemCollection, "Array<string>");
        }

        if ($repliesToId !== undefined) {
            localVarQueryParameters['$repliesToId'] = ObjectSerializer.serialize($repliesToId, "string");
        }

        if ($level !== undefined) {
            localVarQueryParameters['$level'] = ObjectSerializer.serialize($level, "string");
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
            return new Promise<{ response: http.IncomingMessage; body: Array<Note>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<Note>");
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
     * Updates the Note matching the given ID.  Any Attributes that exist at the time of update are replaced with the contents of the update. <br>The id property of the payload must match the noteId specified on the URL. 
     * @summary Updates a Note.
     * @param noteId The identifier for a Note.
     * @param note The Note to be updated.
     */
    public async updateNote (noteId: string, note: Note, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Note;  }> {
        const localVarPath = this.basePath + '/notes/{noteId}'
            .replace('{' + 'noteId' + '}', encodeURIComponent(String(noteId)));
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

        // verify required parameter 'noteId' is not null or undefined
        if (noteId === null || noteId === undefined) {
            throw new Error('Required parameter noteId was null or undefined when calling updateNote.');
        }

        // verify required parameter 'note' is not null or undefined
        if (note === null || note === undefined) {
            throw new Error('Required parameter note was null or undefined when calling updateNote.');
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
            body: ObjectSerializer.serialize(note, "Note")
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
            return new Promise<{ response: http.IncomingMessage; body: Note;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Note");
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
     * Updates Notes.  Either all Notes are updated, or no Notes are updated if an error occurs.
     * @summary Updates Notes.
     * @param notes The Notes to be updated (containing at least one).
     */
    public async updateNotes (notes: Array<Note>, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: Array<Note>;  }> {
        const localVarPath = this.basePath + '/notes';
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

        // verify required parameter 'notes' is not null or undefined
        if (notes === null || notes === undefined) {
            throw new Error('Required parameter notes was null or undefined when calling updateNotes.');
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
            body: ObjectSerializer.serialize(notes, "Array<Note>")
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
            return new Promise<{ response: http.IncomingMessage; body: Array<Note>;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "Array<Note>");
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
