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
import { NewVisualisationInformation } from './newVisualisationInformation';
import { Template } from './template';


export interface TemplateRequest { 
    template: Template;
    visualisation?: NewVisualisationInformation;
}

