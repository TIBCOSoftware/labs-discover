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

export class SchemaTdv {
    'COLUMN_NAME': string;
    'DATA_TYPE': string;
    'ORDINAL_POSITION': number;
    'JDBC_DATA_TYPE': number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "COLUMN_NAME",
            "baseName": "COLUMN_NAME",
            "type": "string"
        },
        {
            "name": "DATA_TYPE",
            "baseName": "DATA_TYPE",
            "type": "string"
        },
        {
            "name": "ORDINAL_POSITION",
            "baseName": "ORDINAL_POSITION",
            "type": "number"
        },
        {
            "name": "JDBC_DATA_TYPE",
            "baseName": "JDBC_DATA_TYPE",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return SchemaTdv.attributeTypeMap;
    }
}
