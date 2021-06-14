/**
 * Authorization Engine Service
 * The TIBCO Cloud(TM) Live Apps Authorization Engine Service manages the organization model and subscription resources used by each TIBCO(R) Live Apps subscription. These resources are:   * __Sandboxes__: There are two types of Sandbox:        * __Production__: A subscription contains a single Production Sandbox, in which published applications run and are used.          * __Developer__: A subscription contains a Developer Sandbox for every user who is mapped to the ApplicationDeveloper Group in the Production Sandbox. Each User owns their Developer Sandbox and can use it to write and test applications in isolation before publishing them.          Users and Groups are mapped to Sandboxes.      * __Users__: Users are created at a subscription level. They are mapped to Groups and to Sandboxes that they are authorized to access.       * __Groups__: There are two types of Group:        * _System-defined_ Groups. There are four of these:       * __AllUsers__: Users mapped to this Group are authorized to access the Live Apps Case Manager.       * __Administrator__: Users mapped to this Group are authorized to access the Live Apps Administrator.       * __ApplicationDeveloper__: Users mapped to this Group are authorized to access the Live Apps Designer.       * __UIDeveloper__: Reserved for future use.                    * _Subscription-defined_ (or custom) groups, which Users can be mapped to as required. These Groups must have a type of __SubscriptionDefined__.             NOTE: You can use the Authorization Service to retrieve information about all types of Group, but you can only create, update or delete subscription-defined Groups.      * __UserGroupMappings__ (or __Mappings__): UserGroupMappings define all the mappings between Users, Groups and Sandboxes.       * __Claims__: Claims are associated with Users. They hold the information about which Sandboxes and Groups the User has access to. Whenever a User attempts to access a Live Apps resource, the Authorization Engine Service validates the Claims held for the User who is making the request against the resources they are attempting to access.      * __Parameters__: Provide configuration details about the subscription.      The Authorization Engine Service allows you to retrieve information about these resources. In the case of subscription-defined Groups and UserGroupMappings, you can also create, update and delete them. 
 *
 * OpenAPI spec version: 1.0.0
 * Contact: liveapps@tibco.com
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { ClaimsSandbox } from './claimsSandbox';


/**
 * Details supplied for the Claims
 */
export interface ClaimsValues { 
    /**
     * The subscription to which this User belongs
     */
    subscriptionId: string;
    /**
     * First name of the User
     */
    firstName: string;
    /**
     * Last name of the User
     */
    lastName: string;
    /**
     * Username of the User
     */
    username: string;
    /**
     * email address of the User
     */
    email?: string;
    /**
     * An array of status values applicable to this User. Valid values are 'VerifyEmailOutstanding'.
     */
    status?: string[];
    /**
     * The Sandboxes to which the User has access
     */
    sandboxes?: ClaimsSandbox[];
}
