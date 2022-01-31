/**
 * Swagger TIBCO Cloud
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * Contact: apiteam@swagger.io
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';
import { TenantDetails } from './tenantDetails';

export class User {
    'userEntityId'?: string;
    'role'?: string;
    'email'?: string;
    'firstName'?: string;
    'lastName'?: string;
    'status'?: string;
    'tenantDetails'?: Array<TenantDetails>;
    'lastLoginDate'?: number;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "userEntityId",
            "baseName": "userEntityId",
            "type": "string"
        },
        {
            "name": "role",
            "baseName": "role",
            "type": "string"
        },
        {
            "name": "email",
            "baseName": "email",
            "type": "string"
        },
        {
            "name": "firstName",
            "baseName": "firstName",
            "type": "string"
        },
        {
            "name": "lastName",
            "baseName": "lastName",
            "type": "string"
        },
        {
            "name": "status",
            "baseName": "status",
            "type": "string"
        },
        {
            "name": "tenantDetails",
            "baseName": "tenantDetails",
            "type": "Array<TenantDetails>"
        },
        {
            "name": "lastLoginDate",
            "baseName": "lastLoginDate",
            "type": "number"
        }    ];

    static getAttributeTypeMap() {
        return User.attributeTypeMap;
    }
}
