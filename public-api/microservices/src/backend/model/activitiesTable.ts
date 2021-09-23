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

export class ActivitiesTable {
    'analysisId'?: string;
    'activityName'?: string;
    'id'?: object;
    'totalOccurrences'?: object;
    'totalFirst'?: object;
    'totalLast'?: object;
    'isend'?: object;
    'isstart'?: object;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "analysisId",
            "baseName": "analysisId",
            "type": "string"
        },
        {
            "name": "activityName",
            "baseName": "activityName",
            "type": "string"
        },
        {
            "name": "id",
            "baseName": "id",
            "type": "object"
        },
        {
            "name": "totalOccurrences",
            "baseName": "totalOccurrences",
            "type": "object"
        },
        {
            "name": "totalFirst",
            "baseName": "totalFirst",
            "type": "object"
        },
        {
            "name": "totalLast",
            "baseName": "totalLast",
            "type": "object"
        },
        {
            "name": "isend",
            "baseName": "isend",
            "type": "object"
        },
        {
            "name": "isstart",
            "baseName": "isstart",
            "type": "object"
        }    ];

    static getAttributeTypeMap() {
        return ActivitiesTable.attributeTypeMap;
    }
}

