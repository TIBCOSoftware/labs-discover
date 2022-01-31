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

export class CheckExist {
    /**
    * The dataset id
    */
    'Dataset_Id': string;
    /**
    * The dataset name
    */
    'Dataset_Name'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "Dataset_Id",
            "baseName": "Dataset_Id",
            "type": "string"
        },
        {
            "name": "Dataset_Name",
            "baseName": "Dataset_Name",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return CheckExist.attributeTypeMap;
    }
}

