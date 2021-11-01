import { getMetadataArgsStorage } from '../index';
/**
 * Injects all request's cookies to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function CookieParams() {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'cookies',
            object: object,
            method: methodName,
            index: index,
            parse: false,
            required: false,
        });
    };
}
//# sourceMappingURL=CookieParams.js.map