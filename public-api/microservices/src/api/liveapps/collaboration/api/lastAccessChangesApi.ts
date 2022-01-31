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
import { LastAccessChange } from '../model/lastAccessChange';

import { ObjectSerializer, Authentication, VoidAuth, Interceptor } from '../model/models';

import { HttpError, RequestFile } from './apis';

let defaultBasePath = '/collaboration/v1';

// ===============================================
// This file is autogenerated - Please do not edit
// ===============================================

export enum LastAccessChangesApiApiKeys {
}

export class LastAccessChangesApi {
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

    public setApiKey(key: LastAccessChangesApiApiKeys, value: string) {
        (this.authentications as any)[LastAccessChangesApiApiKeys[key]].apiKey = value;
    }

    public addInterceptor(interceptor: Interceptor) {
        this.interceptors.push(interceptor);
    }

    /**
     * Returns the LastAccessChange determined by the supplied query parameters.  A LastAccessChange provides information used to determine if a Topic or Collection has new or modified content.  A User\'s last access is tracked by the service when one of the following methods is called:    - Topic:        GET /notes with $relatedItemType and $relatedItemId   - Collection:   GET /notes with $relatedItemCollection  The LastAccessChange can be returned for either a Collection or a Topic:    - For a Collection, specify the following query parameter:     - $relatedItemCollection - The Related Item Collection values for which to get the LastAccessChange.   - For a Topic, specify the following query parameters:     - $relatedItemType - The type of Related Item for the Topic to get the LastAccessChange.     - $relatedItemId - The ID of the Related Item for the Topic to get the LastAccessChange.  Specify either $relatedItemCollection or both $relatedItemType and $relatedItemId.  <br>If a Topic does not exist for the given $relatedItemType and $relatedItemId, or no Topics exist for the given $relatedItemCollection, the LastAccessChange is returned as {\"changedSinceDate\": null,\"newCount\": 0,\"modifiedCount\": 0,\"deletedCount\": 0}.  <br>In the case of a Collection, a Note is only considered to be new/modified if the last time the User fetched Notes for the Topic containing the Note is older than the createdDate/modifiedDate of the Note, regardless of whether the User fetched Notes in the Topic directly or indirectly via a Collection.  In other words, if a Note is new and is fetched directly via a Topic, and then you fetch Notes for a Collection that contains that Topic, the Note is not new as it was previously fetched.  Conversely, if a Note is new and is fetched via a Collection that contains the Topic containing that Note, and then you fetch Notes directly for the Topic containing the Note, the Note is not new as it was previously fetched via the Collection.  
     * @summary Gets LastAccessChange.
     * @param $relatedItemType The type for a Related Item. - This must be a non-zero length value (limited to 100 characters in length) and must be specified together with relatedItemId. - Any UTF-8 characters can be used. - The value is treated as case sensitive and white space is significant (not ignored). 
     * @param $relatedItemId The ID of a Related Item. - This must be a non-zero length value (limited to 100 characters in length) and must be specified together with relatedItemType. - Any UTF-8 characters can be used. - The value is treated as case sensitive and white space is significant (not ignored). 
     * @param $relatedItemCollection The Related Item Collection values for which to get the LastAccessChange. - This must not be set if $relatedItemType and $relatedItemId or $repliesToId are set. - Each name value must be a non-zero length value (limited to 100 characters in length). - Any UTF-8 characters can be used. - The name values are treated as case sensitive and white space is significant (not ignored).  Multiple collection name values can be specified using an ampersand character \&#39;&amp;\&#39; between each $relatedItemCollection&#x3D;nameValue expression.  For example, to set two collection names [\&#39;colName1\&#39;, \&#39;colName2\&#39;] use: - $relatedItemCollection&#x3D;colName1&amp;$relatedItemCollection&#x3D;colName2 
     */
    public async getLastAccessChange ($relatedItemType?: string, $relatedItemId?: string, $relatedItemCollection?: Array<string>, options: {headers: {[name: string]: string}} = {headers: {}}) : Promise<{ response: http.IncomingMessage; body: LastAccessChange;  }> {
        const localVarPath = this.basePath + '/lastAccessChanges';
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

        if ($relatedItemType !== undefined) {
            localVarQueryParameters['$relatedItemType'] = ObjectSerializer.serialize($relatedItemType, "string");
        }

        if ($relatedItemId !== undefined) {
            localVarQueryParameters['$relatedItemId'] = ObjectSerializer.serialize($relatedItemId, "string");
        }

        if ($relatedItemCollection !== undefined) {
            localVarQueryParameters['$relatedItemCollection'] = ObjectSerializer.serialize($relatedItemCollection, "Array<string>");
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
            return new Promise<{ response: http.IncomingMessage; body: LastAccessChange;  }>((resolve, reject) => {
                localVarRequest(localVarRequestOptions, (error, response, body) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (response.statusCode && response.statusCode >= 200 && response.statusCode <= 299) {
                            body = ObjectSerializer.deserialize(body, "LastAccessChange");
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
