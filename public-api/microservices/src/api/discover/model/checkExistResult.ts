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

export class CheckExistResult {
    /**
    * It\'s true is the dataset of the name is found, otherwise return false.
    */
    'exist'?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "exist",
            "baseName": "exist",
            "type": "boolean"
        }    ];

    static getAttributeTypeMap() {
        return CheckExistResult.attributeTypeMap;
    }
}

