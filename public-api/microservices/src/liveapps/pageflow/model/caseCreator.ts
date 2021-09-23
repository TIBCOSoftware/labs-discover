/**
 * UP API
 * UP for Cloud BPM
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';

/**
* CaseCreator
*/
export class CaseCreator {
    /**
    * Unique id of the process
    */
    'id': string;
    /**
    * Name of the process
    */
    'name': string;
    /**
    * Name of the process
    */
    'label': string;
    /**
    * Version of the application
    */
    'version': number;
    /**
    * Unique id of the application
    */
    'applicationId': string;
    /**
    * Name of the application
    */
    'applicationName': string;
    /**
    * Unique id of the activity
    */
    'activityId': string;
    /**
    * Name of the activity
    */
    'activityName': string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "id",
            "baseName": "id",
            "type": "string"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "label",
            "baseName": "label",
            "type": "string"
        },
        {
            "name": "version",
            "baseName": "version",
            "type": "number"
        },
        {
            "name": "applicationId",
            "baseName": "applicationId",
            "type": "string"
        },
        {
            "name": "applicationName",
            "baseName": "applicationName",
            "type": "string"
        },
        {
            "name": "activityId",
            "baseName": "activityId",
            "type": "string"
        },
        {
            "name": "activityName",
            "baseName": "activityName",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return CaseCreator.attributeTypeMap;
    }
}

