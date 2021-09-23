/**
 * Business Process Management Service
 * The TIBCO(R) Live Apps Business Process Management Service manages the following resources:  * __Case Creator processes__: A Case Creator process is a process definition containing the business logic used to create a Case - this may simply be a single step process that provides a form for a user to complete, or a more involved sequence of steps. An application designer creates at least one Case Creator process when they create an application in Live Apps Designer. A user creates a Process Instance when they use Live Apps Case Manager to start a Case.     * __Case Action processes__: A Case Action process is a process definition containing the business logic used to execute some sort of unscheduled action on an active Case. An application designer creates as many Case Action processes as they need when they create an application in Live Apps Designer. A user creates a Process Instance when they use Live Apps Case Manager to execute an Action on an existing Case.    * __Process Instances__: A Process Instance is a particular instance of a Case Creator process or a Case Action process.   * Process Instance __States__: A Process Instance is, at any time, in one of the following States: STARTED, ACTIVE, COMPLETED, DELAYED, CANCELLED, HALTED or UNKNOWN. Process Instance States are system-defined values representing logical stages in the lifecycle of a process and are used by every Process Instance.     Note: Process Instance States should not be confused with Case states, which are application-defined values representing logical stages in the lifecycle of a Case. An application designer creates whatever Case states they need when they create an application in Live Apps Designer. They can configure the application to only allow users to execute a particular Case Action (that is, start a Process Instance of a Case Action process) when a Case is in a particular (Case) state. 
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: liveapps@tibco.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';

/**
* Error
*/
export class ModelError {
    /**
    * Verbose error message.
    */
    'errorMsg'?: string;
    /**
    * The following are the possible error codes in the Business Process Management Service (note that the description shown is not part of the error code): - BP_AUTO_START_COUNT_EXCEEDED - Processing of AUTOSTART message has exceeded the maximum allowed; rejecting message. - CE_AUTO_START_NOT_DEFINED - The Process referenced within the AUTOSTART message is not defined as auto-start; rejecting message. - CE_BAD_START_REQUEST - Bad request received for a Process Instance start. - CE_BAD_START_REQUEST_AUTO_START - Bad request received for a Process Instance start; the Process is marked as auto-start only. - CE_GENERAL_FAULT - Exception generated when processing the Process Instance. - CE_INVALID_CASE_ACTION_START_REQUEST - The specified process is a Case Action process, but the request does not include a Case reference (\'caseReference\'). - CE_INVALID_CASE_CREATOR_START_REQUEST - The specified process is a Case Creator process, but the request includes a case reference (\'caseReference\'). - CE_INVALID_CASE_REF - The supplied Case reference (\'caseReference\') is not valid. - CE_INVALID_CASE_STATE - The current Case state does not permit execution of the specified Case Action. - CE_INVALID_MAPPING - An error occurred while mapping data. - CE_PERMISSION_DENIED - Permission denied. - CE_RUN_INSTANCE_PERMISSION_DENIED - Permission denied to start or run this Process Instance. - CE_SERVICE_GENERIC - Generic Business Process Management Service exception. - CE_SERVICE_INVALID_PARAMETER - The JSON payload specified for the request is invalid. - CE_SERVICE_MISSING_APP_PROCESS - The service request failed to find the specified application or process. - CE_SERVICE_MISSING_DELAYED_MESSAGE_ID - Cannnot fire timer immediately due to missing delayed message id. - CE_SERVICE_MISSING_INSTANCE - The service request failed to find the specified Process Instance. - CE_SERVICE_MISSING_PARAMETER - The service request is missing a required parameter. - CE_SERVICE_MISSING_PROCESS - The service request failed to find the specified process in the specified application. - CE_SERVICE_MISSING_PROCESS_ID - The service request failed to find the specified process. - CE_SERVICE_STATE_CHANGE_NOT_ALLOWED - The specified State change is not allowed for the Process Instance. - CE_SERVICE_UNKNOWN_ATTRIBUTE - The specified attribute is unknown for the Process Instance. - CE_SERVICE_UNKNOWN_STATE - The specified State is unknown or unsupported. 
    */
    'errorCode'?: string;
    /**
    * Stack trace details (only provided in a debug environment).
    */
    'stackTrace'?: string;
    /**
    * Contextual information about the Error.
    */
    'contextInfo'?: string;

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
            "name": "contextInfo",
            "baseName": "contextInfo",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return ModelError.attributeTypeMap;
    }
}

