/**
 * TIBCO Discover public API
 * TIBCO Discover public API
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';
import { InvestigationApplication } from './investigationApplication';

export class Investigations {
    'numberApplications'?: number;
    'applications'?: Array<InvestigationApplication>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "numberApplications",
            "baseName": "numberApplications",
            "type": "number"
        },
        {
            "name": "applications",
            "baseName": "applications",
            "type": "Array<InvestigationApplication>"
        }    ];

    static getAttributeTypeMap() {
        return Investigations.attributeTypeMap;
    }
}

