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

export class ManagedDatasetsInfo {
    'DatasetId': string;
    'DatasetName': string;
    'DatasetDescription': string;
    'CreationTime': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "DatasetId",
            "baseName": "DatasetId",
            "type": "string"
        },
        {
            "name": "DatasetName",
            "baseName": "DatasetName",
            "type": "string"
        },
        {
            "name": "DatasetDescription",
            "baseName": "DatasetDescription",
            "type": "string"
        },
        {
            "name": "CreationTime",
            "baseName": "CreationTime",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return ManagedDatasetsInfo.attributeTypeMap;
    }
}

