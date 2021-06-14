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
 * Describes a Case type's states. Used within GetTypeResponseItem 
 */
export interface GetTypeResponseItemState { 
    /**
     * The ID of the state. 
     */
    id?: string;
    /**
     * The name of the state defined by the application designer in Live Apps Designer. 
     */
    label?: string;
    /**
     * The name of the state defined by the application designer in Live Apps Designer. 
     */
    value?: string;
    /**
     * true if the state is a 'terminal' state (one in which Cases are no longer considered active). 
     */
    isTerminal?: boolean;
}
