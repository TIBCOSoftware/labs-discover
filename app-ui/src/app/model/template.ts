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
import { TemplateMarkingConfig } from './templateMarkingConfig';
import { TemplateMenuConfig } from './templateMenuConfig';
import { TemplateFilterConfig } from './templateFilterConfig';


export interface Template { 
    /**
     * Unique Identifier for a Template
     */
    id?: string;
    /**
     * Template name
     */
    name: string;
    /**
     * The type of template. General and Vertical are provided and can\'t be edited. User defined templates can be modified.
     */
    type: Template.TypeEnum;
    /**
     * HTML enabled field to describe a template on a card.
     */
    description?: string;
    /**
     * Location of an Icon or Image to display on the card.
     */
    splash?: string;
    /**
     * Location of the Spotfire Report to use for this template
     */
    spotfireLocation?: string;
    /**
     * Set of menu entries that are shown for this template
     */
    menuConfig?: Array<TemplateMenuConfig>;
    /**
     * Set of filters entries that apply to this template
     */
    filters?: Array<TemplateFilterConfig>;
    /**
     * Determines if a template is enabled or disabled (No UI implementation for this yet)
     */
    enabled?: boolean;
    /**
     * Location of the Icon of the Template
     */
    icon?: string;
    marking?: TemplateMarkingConfig;
    /**
     * TBD
     */
    previewParameters?: string;
}
export namespace Template {
    export type TypeEnum = 'General' | 'Vertical' | 'User defined';
    export const TypeEnum = {
        General: 'General' as TypeEnum,
        Vertical: 'Vertical' as TypeEnum,
        UserDefined: 'User defined' as TypeEnum
    };
}


