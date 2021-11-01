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
import { ActivityModelStyleBackground } from './activityModelStyleBackground';
import { ActivityModelStylePen } from './activityModelStylePen';

export class ActivityModelStyle {
    'rounded'?: boolean;
    'visibleBorder'?: boolean;
    'pen'?: ActivityModelStylePen;
    'background'?: ActivityModelStyleBackground;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "rounded",
            "baseName": "rounded",
            "type": "boolean"
        },
        {
            "name": "visibleBorder",
            "baseName": "visibleBorder",
            "type": "boolean"
        },
        {
            "name": "pen",
            "baseName": "pen",
            "type": "ActivityModelStylePen"
        },
        {
            "name": "background",
            "baseName": "background",
            "type": "ActivityModelStyleBackground"
        }    ];

    static getAttributeTypeMap() {
        return ActivityModelStyle.attributeTypeMap;
    }
}
