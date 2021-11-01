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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Thread = void 0;
/**
* A new Thread is created for each top-level Note, which contains information related to all of the reply Notes that are part of the Thread initiated when a top-level Note is created.  This is also used to set Roles.  Only top-level Notes have the thread property set.  All Thread properties are set by the service and cannot be modified by a client except the isLocked, lifecycledWithType, lifecycledWithId, and roles properties.
*/
class Thread {
    static getAttributeTypeMap() {
        return Thread.attributeTypeMap;
    }
}
exports.Thread = Thread;
Thread.discriminator = undefined;
Thread.attributeTypeMap = [
    {
        "name": "id",
        "baseName": "id",
        "type": "string"
    },
    {
        "name": "relatedItemType",
        "baseName": "relatedItemType",
        "type": "string"
    },
    {
        "name": "relatedItemId",
        "baseName": "relatedItemId",
        "type": "string"
    },
    {
        "name": "relatedItemCollection",
        "baseName": "relatedItemCollection",
        "type": "Array<string>"
    },
    {
        "name": "topicId",
        "baseName": "topicId",
        "type": "string"
    },
    {
        "name": "topLevelNoteId",
        "baseName": "topLevelNoteId",
        "type": "string"
    },
    {
        "name": "status",
        "baseName": "status",
        "type": "Thread.StatusEnum"
    },
    {
        "name": "isLocked",
        "baseName": "isLocked",
        "type": "boolean"
    },
    {
        "name": "lifecycledWithType",
        "baseName": "lifecycledWithType",
        "type": "string"
    },
    {
        "name": "lifecycledWithId",
        "baseName": "lifecycledWithId",
        "type": "string"
    },
    {
        "name": "createdById",
        "baseName": "createdById",
        "type": "string"
    },
    {
        "name": "createdByName",
        "baseName": "createdByName",
        "type": "string"
    },
    {
        "name": "createdDate",
        "baseName": "createdDate",
        "type": "Date"
    },
    {
        "name": "modifiedById",
        "baseName": "modifiedById",
        "type": "string"
    },
    {
        "name": "modifiedByName",
        "baseName": "modifiedByName",
        "type": "string"
    },
    {
        "name": "modifiedDate",
        "baseName": "modifiedDate",
        "type": "Date"
    },
    {
        "name": "actionDate",
        "baseName": "actionDate",
        "type": "Date"
    },
    {
        "name": "actionId",
        "baseName": "actionId",
        "type": "string"
    },
    {
        "name": "actionType",
        "baseName": "actionType",
        "type": "Thread.ActionTypeEnum"
    },
    {
        "name": "roles",
        "baseName": "roles",
        "type": "Array<ThreadRole>"
    },
    {
        "name": "totalCount",
        "baseName": "totalCount",
        "type": "number"
    },
    {
        "name": "issueNoteCount",
        "baseName": "issueNoteCount",
        "type": "number"
    },
    {
        "name": "resolutionNoteCount",
        "baseName": "resolutionNoteCount",
        "type": "number"
    },
    {
        "name": "questionNoteCount",
        "baseName": "questionNoteCount",
        "type": "number"
    },
    {
        "name": "answerNoteCount",
        "baseName": "answerNoteCount",
        "type": "number"
    },
    {
        "name": "informationalNoteCount",
        "baseName": "informationalNoteCount",
        "type": "number"
    },
    {
        "name": "unresolvedStatusCount",
        "baseName": "unresolvedStatusCount",
        "type": "number"
    },
    {
        "name": "unansweredStatusCount",
        "baseName": "unansweredStatusCount",
        "type": "number"
    },
    {
        "name": "resolvedStatusCount",
        "baseName": "resolvedStatusCount",
        "type": "number"
    },
    {
        "name": "answeredStatusCount",
        "baseName": "answeredStatusCount",
        "type": "number"
    },
    {
        "name": "acceptedStatusCount",
        "baseName": "acceptedStatusCount",
        "type": "number"
    },
    {
        "name": "unacceptedStatusCount",
        "baseName": "unacceptedStatusCount",
        "type": "number"
    },
    {
        "name": "unclassifiedStatusCount",
        "baseName": "unclassifiedStatusCount",
        "type": "number"
    },
    {
        "name": "isOrphaned",
        "baseName": "isOrphaned",
        "type": "boolean"
    },
    {
        "name": "isAbandoned",
        "baseName": "isAbandoned",
        "type": "boolean"
    }
];
(function (Thread) {
    let StatusEnum;
    (function (StatusEnum) {
        StatusEnum[StatusEnum["Open"] = 'OPEN'] = "Open";
        StatusEnum[StatusEnum["Pending"] = 'PENDING'] = "Pending";
        StatusEnum[StatusEnum["Complete"] = 'COMPLETE'] = "Complete";
        StatusEnum[StatusEnum["Info"] = 'INFO'] = "Info";
    })(StatusEnum = Thread.StatusEnum || (Thread.StatusEnum = {}));
    let ActionTypeEnum;
    (function (ActionTypeEnum) {
        ActionTypeEnum[ActionTypeEnum["Post"] = 'POST'] = "Post";
        ActionTypeEnum[ActionTypeEnum["Reply"] = 'REPLY'] = "Reply";
        ActionTypeEnum[ActionTypeEnum["Update"] = 'UPDATE'] = "Update";
        ActionTypeEnum[ActionTypeEnum["Delete"] = 'DELETE'] = "Delete";
    })(ActionTypeEnum = Thread.ActionTypeEnum || (Thread.ActionTypeEnum = {}));
})(Thread = exports.Thread || (exports.Thread = {}));
//# sourceMappingURL=thread.js.map