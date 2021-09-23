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
import { Profiles } from './profiles';

export class MetricsDS {
    'Organisation': string;
    'JobName': string;
    'DatasetID': string;
    'Metrics': Array<Profiles>;
    'DurationDB': number;
    'DurationJob': number;
    'TotalRows': number;
    'DuplicatedRows': number;
    'TimeStamp': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "Organisation",
            "baseName": "Organisation",
            "type": "string"
        },
        {
            "name": "JobName",
            "baseName": "JobName",
            "type": "string"
        },
        {
            "name": "DatasetID",
            "baseName": "DatasetID",
            "type": "string"
        },
        {
            "name": "Metrics",
            "baseName": "Metrics",
            "type": "Array<Profiles>"
        },
        {
            "name": "DurationDB",
            "baseName": "DurationDB",
            "type": "number"
        },
        {
            "name": "DurationJob",
            "baseName": "DurationJob",
            "type": "number"
        },
        {
            "name": "TotalRows",
            "baseName": "TotalRows",
            "type": "number"
        },
        {
            "name": "DuplicatedRows",
            "baseName": "DuplicatedRows",
            "type": "number"
        },
        {
            "name": "TimeStamp",
            "baseName": "TimeStamp",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return MetricsDS.attributeTypeMap;
    }
}

