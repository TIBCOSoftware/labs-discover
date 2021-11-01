import { getMetadataArgsStorage } from '../index';
/**
 * Sets response HTTP status code.
 * Http code will be set only when controller action is successful.
 * In the case if controller action rejects or throws an exception http code won't be applied.
 * Must be applied on a controller action.
 */
export function HttpCode(code) {
    return function (object, methodName) {
        getMetadataArgsStorage().responseHandlers.push({
            type: 'success-code',
            target: object.constructor,
            method: methodName,
            value: code,
        });
    };
}
//# sourceMappingURL=HttpCode.js.map