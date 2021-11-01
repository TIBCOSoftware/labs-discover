import { getMetadataArgsStorage } from '../index';
/**
 * Injects all request's http headers to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function HeaderParams() {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'headers',
            object: object,
            method: methodName,
            index: index,
            parse: false,
            required: false,
        });
    };
}
//# sourceMappingURL=HeaderParams.js.map