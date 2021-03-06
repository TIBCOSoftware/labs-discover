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
import { ListBucket } from './listBucket';

export class S3Content {
    'list': Array<ListBucket>;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "list",
            "baseName": "list",
            "type": "Array<ListBucket>"
        }    ];

    static getAttributeTypeMap() {
        return S3Content.attributeTypeMap;
    }
}

