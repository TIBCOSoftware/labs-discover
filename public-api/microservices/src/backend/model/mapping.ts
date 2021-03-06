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

export class Mapping {
    'Activity'?: string;
    'CaseID'?: string;
    'Endtime'?: string;
    'Otherattributes'?: string;
    'Requester'?: string;
    'Resource'?: string;
    'Resourcegroup'?: string;
    'Scheduledend'?: string;
    'Scheduledstart'?: string;
    'Starttime'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "Activity",
            "baseName": "Activity",
            "type": "string"
        },
        {
            "name": "CaseID",
            "baseName": "CaseID",
            "type": "string"
        },
        {
            "name": "Endtime",
            "baseName": "Endtime",
            "type": "string"
        },
        {
            "name": "Otherattributes",
            "baseName": "Otherattributes",
            "type": "string"
        },
        {
            "name": "Requester",
            "baseName": "Requester",
            "type": "string"
        },
        {
            "name": "Resource",
            "baseName": "Resource",
            "type": "string"
        },
        {
            "name": "Resourcegroup",
            "baseName": "Resourcegroup",
            "type": "string"
        },
        {
            "name": "Scheduledend",
            "baseName": "Scheduledend",
            "type": "string"
        },
        {
            "name": "Scheduledstart",
            "baseName": "Scheduledstart",
            "type": "string"
        },
        {
            "name": "Starttime",
            "baseName": "Starttime",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return Mapping.attributeTypeMap;
    }
}

