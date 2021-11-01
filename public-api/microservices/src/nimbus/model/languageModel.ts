/**
 * TIBCO Nimbus Public REST API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';

export class LanguageModel {
    'languageId'?: number;
    'name'?: string;
    'code'?: string;
    'localeId'?: number;
    'isDefault'?: boolean;
    'deleted'?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "languageId",
            "baseName": "languageId",
            "type": "number"
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "code",
            "baseName": "code",
            "type": "string"
        },
        {
            "name": "localeId",
            "baseName": "localeId",
            "type": "number"
        },
        {
            "name": "isDefault",
            "baseName": "isDefault",
            "type": "boolean"
        },
        {
            "name": "deleted",
            "baseName": "deleted",
            "type": "boolean"
        }    ];

    static getAttributeTypeMap() {
        return LanguageModel.attributeTypeMap;
    }
}
