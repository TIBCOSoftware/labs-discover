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

export class TypeValue {
    /**
    * TBD
    */
    'name'?: string;
    /**
    * TBD
    */
    'description'?: string;
    /**
    * TBD
    */
    'category'?: string;
    /**
    * TBD
    */
    'values'?: Array<string>;
    /**
    * TBD
    */
    'includeEmpty'?: boolean;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "name",
            "baseName": "name",
            "type": "string"
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string"
        },
        {
            "name": "category",
            "baseName": "category",
            "type": "string"
        },
        {
            "name": "values",
            "baseName": "values",
            "type": "Array<string>"
        },
        {
            "name": "includeEmpty",
            "baseName": "includeEmpty",
            "type": "boolean"
        }    ];

    static getAttributeTypeMap() {
        return TypeValue.attributeTypeMap;
    }
}
