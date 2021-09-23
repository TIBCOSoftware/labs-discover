/**
 * Authorization Engine Service
 * The TIBCO Cloud(TM) Live Apps Authorization Engine Service manages the organization model and subscription resources used by each TIBCO(R) Live Apps subscription. These resources are:   * __Sandboxes__: There are two types of Sandbox:        * __Production__: A subscription contains a single Production Sandbox, in which published applications run and are used.          * __Developer__: A subscription contains a Developer Sandbox for every user who is mapped to the ApplicationDeveloper Group in the Production Sandbox. Each User owns their Developer Sandbox and can use it to write and test applications in isolation before publishing them.          Users and Groups are mapped to Sandboxes.      * __Users__: Users are created at a subscription level. They are mapped to Groups and to Sandboxes that they are authorized to access.       * __Groups__: There are two types of Group:        * _System-defined_ Groups. There are four of these:       * __AllUsers__: Users mapped to this Group are authorized to access the Live Apps Case Manager.       * __Administrator__: Users mapped to this Group are authorized to access the Live Apps Administrator.       * __ApplicationDeveloper__: Users mapped to this Group are authorized to access the Live Apps Designer.       * __UIDeveloper__: Reserved for future use.                    * _Subscription-defined_ (or custom) groups, which Users can be mapped to as required. These Groups must have a type of __SubscriptionDefined__.             NOTE: You can use the Authorization Service to retrieve information about all types of Group, but you can only create, update or delete subscription-defined Groups.      * __UserGroupMappings__ (or __Mappings__): UserGroupMappings define all the mappings between Users, Groups and Sandboxes.       * __Claims__: Claims are associated with Users. They hold the information about which Sandboxes and Groups the User has access to. Whenever a User attempts to access a Live Apps resource, the Authorization Engine Service validates the Claims held for the User who is making the request against the resources they are attempting to access.      * __Parameters__: Provide configuration details about the subscription.      The Authorization Engine Service allows you to retrieve information about these resources. In the case of subscription-defined Groups and UserGroupMappings, you can also create, update and delete them. 
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: liveapps@tibco.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';
import { ErrorAttribute } from './errorAttribute';

/**
* Error
*/
export class ModelError {
    /**
    * Verbose error message
    */
    'errorMsg': string;
    /**
    * The following are the possible error codes in the Authorization Engine Service (note that the description shown is not part of the error code): - AE_UNKNOWN_ERROR - An unknown error has occurred. - AE_INVALID_ARGUMENT - An invalid argument has been passed over the REST interface. - AE_INVALID_ACCESS - The operation is not valid for this User. - AE_ATTRIBUTE_SIZE_EXCEEDED - An argument to an interface exceeded the allowed size. - AE_DATABASE_UNREACHABLE - Unable to connect to the database. (More detail is supplied in the exception.) - AE_INVALID_FILTER - The supplied filter is invalid or unsupported.  - AE_SUBSCRIPTION_DOES_NOT_EXIST - The subscription requested does not exist. - AE_SUBSCRIPTION_CREATE_ERROR - Failed to create the subscription. - AE_SUBSCRIPTION_UPDATE_ERROR - Failed to update the subscription. - AE_SUBSCRIPTION_DELETE_ERROR - Failed to delete a subscription. - AE_SUBSCRIPTION_MISSING_MANDATORY_PARAMETERS - A request has been made where not all required values have been provided. - AE_SUBSCRIPTION_CREATE_ERROR_ALREADY_EXISTS - A request has been made to create a subscription where one already exists with the same externalId and name. - AE_SUBSCRIPTION_UPDATE_ERROR_ALREADY_EXISTS - Failed to update a subscription. - AE_INVALID_PARAMETER_VALUES - Parameters were set with values that are not valid.  - AE_SUBSCRIPTION_DISABLED - Subscription has been disabled. - AE_SUBSCRIPTION_EXPIRED - Subscription has expired (Duration exceeded).  - AE_SANDBOX_DOES_NOT_EXIST - The requested Sandbox does not exist. - AE_SANDBOX_CREATE_ERROR - Failed to create the Sandbox. - AE_SANDBOX_CREATE_ERROR_ALREADY_EXISTS - A Sandbox with the same name already exists. - AE_MAXIMUM_DEVELOPER_SANDBOXES_EXCEEDED - An attempt to create a Developer Sandbox would exceed the maximum allowed via the \"BPMDevelopers\" subscription Parameter.  - AE_USER_DOES_NOT_EXIST - The requested User does not exist. - AE_USER_CREATE_ERROR - Failed to create the User. - AE_USER_UPDATE_ERROR - Failed to update the User. - AE_USER_DELETE_ERROR - Failed to delete the User. - AE_USER_MISSING_MANDATORY_PARAMETERS - A request has been made where not all required values have been provided. - AE_USER_CREATE_ERROR_ALREADY_EXISTS - A User already exists with the given Username. - AE_USER_UPDATE_ERROR_ALREADY_EXISTS - A User already exists with the given Username being requested for the update. - AE_USER_DELETE_ERROR_CAN_NOT_DELETE_ONLY_ADMINISTRATOR - Failed to delete User as they are the only User in the Administrator Group. - AE_USER_CREATE_ERROR_SUBSCRIPTION_DOES_NOT_EXIST - The subscription for the User does not exist. - AE_USER_UNSUPPORTED_USER_TYPE - An attempt has been made to create, update, delete or login as a non standard User (for example, as a Test User). - AE_UPDATE_OF_UNSUPPORTED_PARAMETER - An attempt has been made to update a Parameter with a value that is not supported. - AE_MAXIMUM_END_USERS_EXCEEDED - An attempt to create a new User would exceed the maximum allowed via the \"EndUsers\" subscription Parameter.  - AE_GROUP_DOES_NOT_EXIST - The requested Group does not exist. - AE_GROUP_CREATE_ERROR - Failed to create the Group. - AE_GROUP_UPDATE_ERROR - Failed to update the Group. - AE_GROUP_DELETE_ERROR - Failed to delete the Group. - AE_GROUP_MISSING_MANDATORY_PARAMETERS - A request has been made where not all required values have been provided. - AE_GROUP_INVALID_GROUP_TYPE - An attempt has been made to create, update or delete a Group that was not SubscriptionDefined. - AE_GROUP_CREATE_ERROR_ALREADY_EXISTS - A Group already exists with the given name. - AE_GROUP_UPDATE_ERROR_ALREADY_EXISTS - A Group already exists with the given name being requested for the update. - AE_GROUP_ERROR_PERMISSION_DENIED - The User making the request does not have permission for the Group operation. - AE_GROUP_USED_BY_APPLICATION - Group cannot be removed because it is being used by an application.  - AE_USERGROUPMAPPING_DOES_NOT_EXIST - The requested UserGroupMapping does not exist. - AE_USERGROUPMAPPING_CREATE_ERROR - Failed to create the UserGroupMapping. - AE_USERGROUPMAPPING_DELETE_ERROR - Failed to delete the UserGroupMapping. - AE_USERGROUPMAPPING_MISSING_MANDATORY_PARAMETERS - A request has been made where not all required values have been provided. - AE_USERGROUPMAPPING_CREATE_ERROR_ALREADY_EXISTS - There is already a mapping for the User/Group/sandbox combination. - AE_USERGROUPMAPPING_DELETE_ERROR_CAN_NOT_REMOVE_SANDBOX_ADMINISTRATOR - The Sandbox owner cannot be removed from the Administrator Group. - AE_USERGROUPMAPPING_DELETE_ERROR_CAN_NOT_REMOVE_FROM_ALL_USERS_GROUP - Users can not be removed from the All Users Group. - AE_USERGROUPMAPPING_CREATE_ERROR_SANDBOX_DOES_NOT_EXIST - The Sandbox defined in the mapping does not exist. - AE_USERGROUPMAPPING_CREATE_ERROR_USER_DOES_NOT_EXIST - The User defined in the mapping does not exist. - AE_USERGROUPMAPPING_CREATE_ERROR_GROUP_DOES_NOT_EXIST - The Group defined in the mapping does not exist. - AE_USERGROUPMAPPING_CREATE_ERROR_SUBSCRIPTION_MISSMATCH - The mapping requested spans multiple Subscriptions. - AE_USERGROUPMAPPING_ERROR_PERMISSION_DENIED - User is not authorized to perform this operation. - AE_USERGROUPMAPPING_CREATE_ERROR_INVALID_MAPPING - The UserGroupMapping requested is invalid and not supported.  - AE_USERGROUPMAPPING_DELETE_ERROR_UNABLE_TO_REMOVE_MAPPING - It is not valid or possible to delete the requested UserGroupMapping.  - AE_PARAMETER_DOES_NOT_EXIST - The requested subscription Parameter does not exist.  - AE_TOKEN_CREATE_ERROR - Error creating the security token. - AE_TOKEN_SUBSCRIPTION_ID_DOES_NOT_EXIST - The subscription for the User performing the operation no longer exists. - AE_TOKEN_MISSING_TROPOSPHERE_TOKEN - Unable to retrieve the security token. - AE_TOKEN_INVALID_TROPOSPHERE_TOKEN - The security token is not valid.  - AE_USER_RULE_CREATE_ERROR - Error creating user delegate rule. - AE_USER_RULE_UPDATE_ERROR - Error updating user delegate rule. - AE_USER_RULE_DOES_NOT_EXIST - The specified user delegate rule does not exist. - AE_USER_RULE_INVALID_DATE_FORMAT - An invalid date time format was used with trying to create a user delegate rule. - AE_USER_RULE_SUBSCRIPTION_MISMATCH_ERROR - Attempt to access a user delegate rule that is not for your subscription. - AE_USER_RULE_INVALID_OWNER_ID - The owner specified for a user delegate rule is not valid. - AE_USER_RULE_INVALID_TARGET_ID - The target user specified for a user delegate rule is not valid. - AE_USER_RULE_INVALID_DATES - The date range specified for the user delegate rule is not valid. - AE_USER_RULE_TARGET_IS_OWNER - The target user specified for the user delegate rule is already the owner of a rule for the specified date range. - AE_USER_RULE_OWNER_IS_TARGET - The owner specified for the user delegate rule is already the target of a rule for the specified date range. - AE_USER_RULE_OWNER_HAS_OVERLAP - The date range specified in the user delegate rule overlaps an existing rule for this owner. 
    */
    'errorCode': string;
    /**
    * Added if available
    */
    'stackTrace'?: string;
    /**
    * Error Attributes
    */
    'contextAttributes'?: Array<ErrorAttribute>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "errorMsg",
            "baseName": "errorMsg",
            "type": "string"
        },
        {
            "name": "errorCode",
            "baseName": "errorCode",
            "type": "string"
        },
        {
            "name": "stackTrace",
            "baseName": "stackTrace",
            "type": "string"
        },
        {
            "name": "contextAttributes",
            "baseName": "contextAttributes",
            "type": "Array<ErrorAttribute>"
        }    ];

    static getAttributeTypeMap() {
        return ModelError.attributeTypeMap;
    }
}

