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
import { ActivityModelBubbleTextText } from './activityModelBubbleTextText';

export class ActivityModelCommentary {
    'showAsHint'?: boolean;
    'text'?: ActivityModelBubbleTextText;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "showAsHint",
            "baseName": "showAsHint",
            "type": "boolean"
        },
        {
            "name": "text",
            "baseName": "text",
            "type": "ActivityModelBubbleTextText"
        }    ];

    static getAttributeTypeMap() {
        return ActivityModelCommentary.attributeTypeMap;
    }
}
