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

import { RequestFile } from './models';
import { NoteAttribute } from './noteAttribute';
import { Thread } from './thread';

/**
* A Note used to collaborate around a specific Related Item.
*/
export class Note {
    /**
    * An optional Note type, default=INFORMATIONAL.
    */
    'type'?: Note.TypeEnum;
    /**
    * An optional title for this Note (max size of 100 characters).
    */
    'title'?: string;
    /**
    * Optional text for this Note (max size of 10000 characters).
    */
    'text'?: string;
    /**
    * [Not currently used.] An optional URL to display the Note in context from a Notification link.  The following substitution parameters may be included in the URL - {$noteId$}, {$threadId$}, and {$topicId$}.  The corresponding ID values will be substituted for the tokens.  For example - notificationUrl set in the request payload to \"http://_host_:_port_/_path_$noteId={$noteId$}&threadId={$threadId$}&topicId={$topicId$}\" would result in the notificationUrl being saved as \"http://_host_:_port_/_path_$noteId=234&threadId=14&topicId=87\" where the corresponding ID values are 234, 14, and 87.  This allows a POST of a new Note to set these values without requiring a subsequent PUT to update the notificationUrl, as these ID values are not known when constructing the POST payload.  The substitution parameters may also be used on PUT updates to a Note. 
    */
    'notificationUrl'?: string;
    /**
    * [Not currently used.] An optional label used in a Notification to describe the Note context. 
    */
    'notificationLabel'?: string;
    /**
    * An optional set of named Attributes that may be relevant to this Note.
    */
    'attributes'?: Array<NoteAttribute>;
    /**
    * Set by the service.  The unique identifier for this Note assigned by the service when created.
    */
    'id'?: string;
    /**
    * Set by the service.  The type of the Related Item.  Set by the service when created.
    */
    'relatedItemType'?: string;
    /**
    * Set by the service.  The ID for the Related Item.  Set by the service when created.
    */
    'relatedItemId'?: string;
    /**
    * Set by the service.  A list of Collection name values used to associate the Topic this Note belongs to with those Collection names.  This property is maintained by the service.
    */
    'relatedItemCollection'?: Array<string>;
    /**
    * Set by the service.  The unique identifier for the Topic this Note belongs to.  This is assigned by the service when created.
    */
    'topicId'?: string;
    /**
    * Set by the service.  The unique identifier for the Thread this Note belongs to.  This is assigned by the service when created.
    */
    'threadId'?: string;
    /**
    * Set by the service.  The unique identifier for the Note that is being replied to by this Note.  If it is a top-level Note, this is Null.  This property is assigned by the service when created.
    */
    'parentId'?: string;
    /**
    * Set by the service.  The status of the Note.  This value is set by the service to indicate the current status of this Note.  These are set as follows: - ISSUE Notes have a status of UNRESOLVED until a RESOLUTION reply Note is accepted, which changes the status to RESOLVED. - QUESTION Notes have a status of UNANSWERED until an ANSWER reply Note is accepted, which changes the status to ANSWERED. - RESOLUTION and ANSWER Notes have a status of UNACCEPTED until they are accepted, which changes the status to ACCEPTED. - INFORMATIONAL Notes have a status of UNCLASSIFIED. 
    */
    'status'?: Note.StatusEnum;
    /**
    * This is set to true if the Note has been hidden.  The title and text of a hidden Note are only visible to the Note creator, and users with a ThreadRole of OWNER or MODERATOR.  Only users with a ThreadRole of OWNER or MODERATOR can change this value.  The isHidden property cannot be changed by the Note creator unless that User also has a ThreadRole of OWNER or MODERATOR.
    */
    'isHidden'?: boolean;
    /**
    * Set by the service.  The hierarchical level of this Note. This property is maintained by the service. - A top-level Note has a level = 1. - A reply to a top-level Note has a level = 2. - The first-level reply to a reply has a level = 3, and so on. 
    */
    'level'?: number;
    /**
    * Set by the service. The unique identifier for the User who created this Note.  This is set by the service when a Note is created.  The User who creates a Note implicitly has a Role of OWNER (as it applies to this Note).
    */
    'createdById'?: string;
    /**
    * Set by the service. The username of the User who created this Note.  This is set by the service when a Note is created and is used for display purposes only.  If the User has been deleted then this value is set to \'Unknown User\'.
    */
    'createdByName'?: string;
    /**
    * Set by the service.  The date-time (UTC) when this Note was created.  This property is maintained by the service.
    */
    'createdDate'?: Date;
    /**
    * Set by the service.  The unique identifier for the User who last modified this Note.  This value is set by the service when a Note is modified.
    */
    'modifiedById'?: string;
    /**
    * Set by the service.  The username of the User who last modified this Note.  This value is set by the service when a Note is modified and is used for display purposes only.  If the User has been deleted then this value is set to \'Unknown User\'.
    */
    'modifiedByName'?: string;
    /**
    * Set by the service.  The date-time (UTC) when this Note was last modified.  This property is maintained by the service.
    */
    'modifiedDate'?: Date;
    /**
    * Set by the service.  The date-time (UTC) when this Note last received a reply Note.  Null if no replies exist.  This property is maintained by the service.
    */
    'replyDate'?: Date;
    /**
    * Set by the service.  The number of direct reply Notes for this Note.  This property is maintained by the service.
    */
    'replyCount'?: number;
    /**
    * Applies specifically to ISSUE/QUESTION Notes.  The unique identifier for the Note that has been accepted as a reply to this Note.  This is null if no reply has been accepted.  A RESOLUTION Note can only reply to an ISSUE Note and an ANSWER Note can only reply to a QUESTION Note.  Setting replyAcceptedId to a valid Note ID causes the service to set the status of the reply Note to \'ACCEPTED\', and the status of a previously accepted Note set to \'UNACCEPTED\' if changed.  To clear a previously set value, set the replyAcceptedId to an empty String.  Only the Note creator, an OWNER, or MODERATOR can change this value.
    */
    'replyAcceptedId'?: string;
    /**
    * Set by the service.  This is set to true if the Note is new.  A Note is new if it was created since the last time the User fetched Notes in this Topic, whether they fetched the Notes for the Topic directly, or fetched the Notes for the Topic indirectly by fetching the Notes in a Collection that contains the Topic.  This flag is always false on a Note when returned for the User who created the Note.  This property is maintained by the service.
    */
    'isNew'?: boolean;
    /**
    * Set by the service.  This is set to true if the Note has been modified.  A Note has been modified if it was modified since the last time the User fetched Notes in this Topic, whether they fetched the Notes for the Topic directly, or fetched the Notes for the Topic indirectly by fetching the Notes in a Collection that contains the Topic.  This flag is always false on a Note when returned for the User who last modified the Note.  This property is maintained by the service.
    */
    'isModified'?: boolean;
    /**
    * Set by the service.  This is set to true if there is new or modified content somewhere in the descendant hierarchy of this Note (new/modified since the User\'s last access to the Topic containing the Note).  This property is maintained by the service.
    */
    'isDescendantNewOrModified'?: boolean;
    /**
    * Set by the service.  The date-time (UTC) when a descendant of this Note was created or modified.  This is null if no descendant exists.  This property is maintained by the service.
    */
    'descendantModifiedDate'?: Date;
    'thread'?: Thread;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "type",
            "baseName": "type",
            "type": "Note.TypeEnum"
        },
        {
            "name": "title",
            "baseName": "title",
            "type": "string"
        },
        {
            "name": "text",
            "baseName": "text",
            "type": "string"
        },
        {
            "name": "notificationUrl",
            "baseName": "notificationUrl",
            "type": "string"
        },
        {
            "name": "notificationLabel",
            "baseName": "notificationLabel",
            "type": "string"
        },
        {
            "name": "attributes",
            "baseName": "attributes",
            "type": "Array<NoteAttribute>"
        },
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
            "name": "threadId",
            "baseName": "threadId",
            "type": "string"
        },
        {
            "name": "parentId",
            "baseName": "parentId",
            "type": "string"
        },
        {
            "name": "status",
            "baseName": "status",
            "type": "Note.StatusEnum"
        },
        {
            "name": "isHidden",
            "baseName": "isHidden",
            "type": "boolean"
        },
        {
            "name": "level",
            "baseName": "level",
            "type": "number"
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
            "name": "replyDate",
            "baseName": "replyDate",
            "type": "Date"
        },
        {
            "name": "replyCount",
            "baseName": "replyCount",
            "type": "number"
        },
        {
            "name": "replyAcceptedId",
            "baseName": "replyAcceptedId",
            "type": "string"
        },
        {
            "name": "isNew",
            "baseName": "isNew",
            "type": "boolean"
        },
        {
            "name": "isModified",
            "baseName": "isModified",
            "type": "boolean"
        },
        {
            "name": "isDescendantNewOrModified",
            "baseName": "isDescendantNewOrModified",
            "type": "boolean"
        },
        {
            "name": "descendantModifiedDate",
            "baseName": "descendantModifiedDate",
            "type": "Date"
        },
        {
            "name": "thread",
            "baseName": "thread",
            "type": "Thread"
        }    ];

    static getAttributeTypeMap() {
        return Note.attributeTypeMap;
    }
}

export namespace Note {
    export enum TypeEnum {
        Issue = <any> 'ISSUE',
        Resolution = <any> 'RESOLUTION',
        Question = <any> 'QUESTION',
        Answer = <any> 'ANSWER',
        Informational = <any> 'INFORMATIONAL'
    }
    export enum StatusEnum {
        Unresolved = <any> 'UNRESOLVED',
        Unanswered = <any> 'UNANSWERED',
        Resolved = <any> 'RESOLVED',
        Answered = <any> 'ANSWERED',
        Accepted = <any> 'ACCEPTED',
        Unaccepted = <any> 'UNACCEPTED',
        Unclassified = <any> 'UNCLASSIFIED'
    }
}
