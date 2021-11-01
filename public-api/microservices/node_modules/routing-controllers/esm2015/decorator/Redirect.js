import { getMetadataArgsStorage } from '../index';
/**
 * Sets Redirect header with given value to the response.
 * Must be applied on a controller action.
 */
export function Redirect(url) {
    return function (object, methodName) {
        getMetadataArgsStorage().responseHandlers.push({
            type: 'redirect',
            target: object.constructor,
            method: methodName,
            value: url,
        });
    };
}
//# sourceMappingURL=Redirect.js.map