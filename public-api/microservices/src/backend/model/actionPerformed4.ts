/**
 * TIBCO DISCOVER backend microservice
 * Api Layer for the backend of Project Discover
 *
 * The version of the OpenAPI document: 1.0
 * Contact: fcenedes@tibco.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';

export class ActionPerformed4 {
    'Data': string;
    'code': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "Data",
            "baseName": "Data",
            "type": "string"
        },
        {
            "name": "code",
            "baseName": "code",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return ActionPerformed4.attributeTypeMap;
    }
}

