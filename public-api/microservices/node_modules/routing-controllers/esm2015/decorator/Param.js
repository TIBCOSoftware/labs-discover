import { getMetadataArgsStorage } from '../index';
/**
 * Injects a request's route parameter value to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function Param(name) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'param',
            object: object,
            method: methodName,
            index: index,
            name: name,
            parse: false,
            required: true,
            classTransform: undefined,
        });
    };
}
//# sourceMappingURL=Param.js.map