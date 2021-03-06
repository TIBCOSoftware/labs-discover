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

export class ActionPerformedTDVCreate {
    'message': string;
    'code': number;
    'datasource': string;
    'dataview': string;
    'publishedview': string;
    'dataSourceName': string;
    'dataSetId': string;

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
            "name": "datasource",
            "baseName": "datasource",
            "type": "string"
        },
        {
            "name": "dataview",
            "baseName": "dataview",
            "type": "string"
        },
        {
            "name": "publishedview",
            "baseName": "publishedview",
            "type": "string"
        },
        {
            "name": "dataSourceName",
            "baseName": "dataSourceName",
            "type": "string"
        },
        {
            "name": "dataSetId",
            "baseName": "dataSetId",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return ActionPerformedTDVCreate.attributeTypeMap;
    }
}

