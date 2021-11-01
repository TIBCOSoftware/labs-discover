"use strict";
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
exports.ThreadsApi = exports.ThreadsApiApiKeys = void 0;
const request_1 = __importDefault(require("request"));
const models_1 = require("../model/models");
const apis_1 = require("./apis");
let defaultBasePath = 'http://localhost/collaboration/v1';
// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================
var ThreadsApiApiKeys;
(function (ThreadsApiApiKeys) {
})(ThreadsApiApiKeys = exports.ThreadsApiApiKeys || (exports.ThreadsApiApiKeys = {}));
class ThreadsApi {
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
        this.authentications[ThreadsApiApiKeys[key]].apiKey = value;
    }
    addInterceptor(interceptor) {
        this.interceptors.push(interceptor);
    }
    /**
     * Returns the Thread matching the given ID. - The User must have at least a VIEWER or a THREAD_VIEWER Role for this Thread.
     * @summary Gets a Thread.
     * @param threadId The identifier for a Thread.
     */
    getThread(threadId, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/threads/{threadId}'
                .replace('{' + 'threadId' + '}', encodeURIComponent(String(threadId)));
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
            // verify required parameter 'threadId' is not null or undefined
            if (threadId === null || threadId === undefined) {
                throw new Error('Required parameter threadId was null or undefined when calling getThread.');
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
                            body = models_1.ObjectSerializer.deserialize(body, "Thread");
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
     * Returns Threads determined by the supplied query parameters.  The $filter parameter can be used to qualify which Threads are returned (for more information, see the _Filtering and Sorting_ Key Concepts page). - The User must have at least a VIEWER or a THREAD_VIEWER Role for this Thread.
     * @summary Gets Threads.
     * @param $skip Skips the specified number of items from the beginning of the list that would normally be returned.  These skipped items are not included in the result. - For example, \&#39;$skip&#x3D;80\&#39; will not return the first 80 items that would otherwise be returned from the REST call.  Subsequent items are returned, starting with the 81st item in the list.  The value must be 0 or greater.  An empty string is ignored. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $skip can change from one call to the next.
     * @param $top Returns only this number of items from the start of the list that would be returned (subject to any use of $skip). - For example, \&#39;$top&#x3D;20\&#39; results in only the first 20 items from the list being returned.  The value must be 1 or greater and less than or equal to a maximum value of 500.  If not specified (or set to an empty string), a default value of 50 is used.  The maximum and default values do not apply when $count is set to true. &lt;br&gt;Note that the GET request is stateless from one request to another and so the underlying set of items in the list effected by $top can change from one call to the next.
     * @param $filter The filter query option enables specific queries to be defined, based on inherent Thread properties (id, relatedItemType, relatedItemId, relatedItemCollection, topicId, topLevelNoteId, status, isLocked, lifecycledWithType, lifecycledWithId, createdById, createdByName, createdDate, modifiedById, modifiedByName, modifiedDate, actionDate, totalCount, issueNoteCount, resolutionNoteCount, questionNoteCount, answerNoteCount, informationalNoteCount, unresolvedStatusCount, unansweredStatusCount, resolvedStatusCount, answeredStatusCount, acceptedStatusCount, unacceptedStatusCount, unclassifiedStatusCount, isOrphaned, isAbandoned), or Roles assigned (roleEntityType, roleEntityId, roleType) that will return the required set of items.  A special filter property \&#39;isCreatedByMe\&#39; allows filtering based on the current User having created a Thread.  This is set true or false (isCreatedByMe eq true).  For more information, see the _Filtering and Sorting_ Key Concepts page.
     * @param $orderby This query option is used to request items in either ascending order using __asc__ or descending order using __desc__, based on one of the Thread properties (id, relatedItemType, relatedItemId, relatedItemCollection, topicId, topLevelNoteId, status, isLocked, lifecycledWithType, lifecycledWithId, createdById, createdByName, createdDate, modifiedById, modifiedByName, modifiedDate, actionDate, totalCount, issueNoteCount, resolutionNoteCount, questionNoteCount, answerNoteCount, informationalNoteCount, unresolvedStatusCount, unansweredStatusCount, resolvedStatusCount, answeredStatusCount, acceptedStatusCount, unacceptedStatusCount, unclassifiedStatusCount, isOrphaned, isAbandoned).  The default order is by createdDate ASC.  For more information, see the _Filtering and Sorting_ Key Concepts page.
     * @param $select This query option allows the selection of specific property values from the Thread to be returned.  Other property values not included in the $select list will be returned as null.  The property names are specified as a comma-separated string that can contain any of [\&#39;id\&#39;, \&#39;relatedItemType\&#39;, \&#39;relatedItemId\&#39;, \&#39;relatedItemCollection\&#39;, \&#39;topicId\&#39;, \&#39;topLevelNoteId\&#39;, \&#39;status\&#39;, \&#39;isLocked\&#39;, \&#39;lifecycledWithType\&#39;, \&#39;lifecycledWithId\&#39;, \&#39;createdById\&#39;, \&#39;createdByName\&#39;, \&#39;createdDate\&#39;, \&#39;modifiedById\&#39;, \&#39;modifiedByName\&#39;, \&#39;modifiedDate\&#39;, \&#39;actionDate\&#39;, \&#39;actionId\&#39;, \&#39;actionType\&#39;, \&#39;roles\&#39;, \&#39;totalCount\&#39;, \&#39;issueNoteCount\&#39;, \&#39;resolutionNoteCount\&#39;, \&#39;questionNoteCount\&#39;, \&#39;answerNoteCount\&#39;, \&#39;informationalNoteCount\&#39;, \&#39;unresolvedStatusCount\&#39;, \&#39;unansweredStatusCount\&#39;, \&#39;resolvedStatusCount\&#39;, \&#39;answeredStatusCount\&#39;, \&#39;acceptedStatusCount\&#39;, \&#39;unacceptedStatusCount\&#39;, \&#39;unclassifiedStatusCount\&#39;, \&#39;isOrphaned\&#39;, \&#39;isAbandoned\&#39;].  For example, \&#39;$select&#x3D;actionDate,actionType\&#39; results in only the actionDate and actionType property values being returned. All of the other properties are returned with a null value in place of the actual property value.
     * @param $count Return a simple number only, this being the count of the items that would be returned from the request if the count query option was not present.  Note that the assigned value for $count is true, that is, the correct use of the count query option is \&#39;$count&#x3D;true\&#39;.  If \&#39;$count&#x3D;false\&#39; is used, then this will have no effect.  It is recognized that $count is an expensive method and should not be used by clients without consideration.
     */
    getThreads($skip, $top, $filter, $orderby, $select, $count, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/threads';
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
                            body = models_1.ObjectSerializer.deserialize(body, "Array<Thread>");
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
     * Updates the Thread matching the given ID.  This request is used to update a Thread with one of these changes: - set or clear the isLocked flag - set or clear the lifecycledWithType and lifecycledWithId values - add, update, or delete the roles set for this Thread  The Thread isLocked value can be set to allow or prevent further replies on this Thread.  When isLocked is set true, no new reply Notes are permitted for this Thread, but existing Notes can still be updated or deleted. - The User must have at least a MODERATOR Role for this Thread to set isLocked.  The Thread lifecycledWithType and lifecycledWithId values can be set to identify the Topic that this Thread is life-cycled with.  To clear a previously set value, set both properties to an empty String (zero length value).  Otherwise, set both properties to a non-zero length value (limited to 100 characters in length). - Only the Thread creator or an OWNER can change the lifecycledWithType and lifecycledWithId values.  When updating the Thread roles, new Roles are added, existing Roles are updated, and omitted Roles are deleted.  Either all ThreadRoles are updated, or none of them are updated if an error occurs. - The User must have at least a MODERATOR Role for this Thread to set roles. - Only the Thread creator or an OWNER can add, update, or delete an OWNER, THREAD_DELETER, or COLLECTION_MODERATOR Role.  The id property of the payload must match the threadId specified on the URL.
     * @summary Updates a Thread.
     * @param threadId The identifier for a Thread.
     * @param thread The Thread to be updated.
     */
    updateThread(threadId, thread, options = { headers: {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const localVarPath = this.basePath + '/threads/{threadId}'
                .replace('{' + 'threadId' + '}', encodeURIComponent(String(threadId)));
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
            // verify required parameter 'threadId' is not null or undefined
            if (threadId === null || threadId === undefined) {
                throw new Error('Required parameter threadId was null or undefined when calling updateThread.');
            }
            // verify required parameter 'thread' is not null or undefined
            if (thread === null || thread === undefined) {
                throw new Error('Required parameter thread was null or undefined when calling updateThread.');
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
                body: models_1.ObjectSerializer.serialize(thread, "Thread")
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
}
exports.ThreadsApi = ThreadsApi;
//# sourceMappingURL=threadsApi.js.map