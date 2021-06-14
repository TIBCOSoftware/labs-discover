/**
 * Case Manager Service
 * The TIBCO Cloud(TM) Live Apps Case Manager Service manages the following resources:  * __Types__: A Type contains the essential data definition of a TIBCO(R) Live Apps application - that is, the data fields, data types and states which are created by an application designer when they create an application in Live Apps Designer. There are two sorts of Type:    * __Case__: A Case Type contains the definition of:       * the top-level data fields used by the application. These data fields (referred to hereafter as 'attributes' of the Case) can be either simple types (such as strings or dates), or custom data types (that group together sets of existing data fields to suit the application's purpose).        * the states used by the application.       * details of Case Creator and Case Action processes defined in the application.               * __Structured__: A Structured Type contains the definition of a custom data type used by the application, which also has fields ('attributes').  * __Cases__: A Case is a particular instance of a Case Type. Users use Live Apps Case Manager to start Cases and run them through to completion. A Case contains the particular values of the data fields and states for that Case as it progresses from creation to completion.  __Paginating Results Lists__  By default, the GET /cases and GET /types methods do not return their entire results list. Instead, they return 10 items from the results list, starting from the beginning of the list. You can override this default behaviour by using the following parameters:  * $top - to specify how many items are returned from the results list. ($top must be a value from 1 to 1000.) * $skip - to specify the starting position in the results list from which to return items.
 *
 * OpenAPI spec version: 1.0.0
 * Contact: liveapps@tibco.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
/**
 * Describes the metadata for a Case. Used within GetCaseResponseItem in a GET /cases response and also within PutCasesRequest when unlocking a Case.
 */
export interface GetCaseResponseItemMetadata {
    /**
     * The unique identifier of the User that created the Case (if known).
     */
    createdBy?: string;
    /**
     * The date/time at which the Case was created.
     */
    creationTimestamp?: string;
    /**
     * The unique identifier of the User that last modified the Case (if known).
     */
    modifiedBy?: string;
    /**
     * The date/time at which the Case was last modified.
     */
    modificationTimestamp?: string;
    /**
     * true if the Case is considered locked (i.e. msLockExpiry > msSystemTime)
     */
    lock?: boolean;
    /**
     * Always \"1\"
     */
    lockType?: string;
    /**
     * The user ID of the user that last locked the Case when the Case is considered locked
     */
    lockedBy?: string;
    /**
     * The time (milliseconds since epoch) that the Case's lock is/was due to expire.
     */
    msLockExpiry?: string;
    /**
     * The current time (in milliseconds since epoch).
     */
    msSystemTime?: string;
    /**
     * true if the Case has been marked for purge, but has yet to be purged.
     */
    markedForPurge?: boolean;
    /**
     * The unique identifier of the application containing the Case's Type.
     */
    applicationId?: string;
    /**
     * The unique identifier of the Case's Type.
     */
    typeId?: string;
}