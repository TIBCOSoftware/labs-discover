import { getMetadataArgsStorage } from '../index';
/**
 * Injects a Request object to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function Req() {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'request',
            object: object,
            method: methodName,
            index: index,
            parse: false,
            required: false,
        });
    };
}
//# sourceMappingURL=Req.js.map