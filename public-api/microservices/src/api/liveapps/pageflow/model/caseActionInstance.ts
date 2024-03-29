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
* CaseActionInstance
*/
export class CaseActionInstance {
    /**
    * Unique id of the process
    */
    'id': string;
    /**
    * Name of the process
    */
    'name': string;
    /**
    * Version of the application
    */
    'version': number;
    /**
    * Name of the process
    */
    'data': string;
    /**
    * Unique id of the application
    */
    'applicationId': string;
    /**
    * Name of the Activity
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
            "name": "version",
            "baseName": "version",
            "type": "number"
        },
        {
            "name": "data",
            "baseName": "data",
            "type": "string"
        },
        {
            "name": "applicationId",
            "baseName": "applicationId",
            "type": "string"
        },
        {
            "name": "activityName",
            "baseName": "activityName",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return CaseActionInstance.attributeTypeMap;
    }
}

