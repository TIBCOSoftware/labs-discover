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
import { MapFolderModelAccessRightsSpecific } from './mapFolderModelAccessRightsSpecific';

export class MapFolderModelAccessRights {
    '_default'?: MapFolderModelAccessRights.DefaultEnum;
    'specific'?: Array<MapFolderModelAccessRightsSpecific>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "_default",
            "baseName": "default",
            "type": "MapFolderModelAccessRights.DefaultEnum"
        },
        {
            "name": "specific",
            "baseName": "specific",
            "type": "Array<MapFolderModelAccessRightsSpecific>"
        }    ];

    static getAttributeTypeMap() {
        return MapFolderModelAccessRights.attributeTypeMap;
    }
}

export namespace MapFolderModelAccessRights {
    export enum DefaultEnum {
        Allowed = <any> 'allowed',
        Denied = <any> 'denied'
    }
}
