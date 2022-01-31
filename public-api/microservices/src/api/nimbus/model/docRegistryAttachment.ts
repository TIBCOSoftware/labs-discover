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

export class DocRegistryAttachment {
    'documentId': string;
    'documentNumber'?: number;
    'hasMaster'?: boolean;
    'registryItemType'?: string;
    'id'?: string;
    'title'?: string;
    'type'?: DocRegistryAttachment.TypeEnum;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "documentId",
            "baseName": "documentId",
            "type": "string"
        },
        {
            "name": "documentNumber",
            "baseName": "documentNumber",
            "type": "number"
        },
        {
            "name": "hasMaster",
            "baseName": "hasMaster",
            "type": "boolean"
        },
        {
            "name": "registryItemType",
            "baseName": "registryItemType",
            "type": "string"
        },
        {
            "name": "id",
            "baseName": "id",
            "type": "string"
        },
        {
            "name": "title",
            "baseName": "title",
            "type": "string"
        },
        {
            "name": "type",
            "baseName": "type",
            "type": "DocRegistryAttachment.TypeEnum"
        }    ];

    static getAttributeTypeMap() {
        return DocRegistryAttachment.attributeTypeMap;
    }
}

export namespace DocRegistryAttachment {
    export enum TypeEnum {
        DocRegistry = <any> 'docRegistry'
    }
}