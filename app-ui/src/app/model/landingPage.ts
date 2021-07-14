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
import { LandingPageButtons } from './landingPageButtons';
import { LandingPageHightlight } from './landingPageHightlight';


export interface LandingPage { 
    title?: string;
    subtitle?: string;
    backgroundURL?: string;
    verticalPadding?: number;
    actionButtons?: Array<LandingPageButtons>;
    highlights?: Array<LandingPageHightlight>;
}
