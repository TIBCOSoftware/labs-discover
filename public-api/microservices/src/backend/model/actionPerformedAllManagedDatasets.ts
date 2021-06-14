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
import { ManagedDatasetsInfo } from './managedDatasetsInfo';

export class ActionPerformedAllManagedDatasets {
    'message': string;
    'code': number;
    'ManagedDatasets': Array<ManagedDatasetsInfo>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "message",
            "baseName": "message",
            "type": "string"
        },
        {
            "name": "code",
            "baseName": "code",
            "type": "number"
        },
        {
            "name": "ManagedDatasets",
            "baseName": "ManagedDatasets",
            "type": "Array<ManagedDatasetsInfo>"
        }    ];

    static getAttributeTypeMap() {
        return ActionPerformedAllManagedDatasets.attributeTypeMap;
    }
}

