import { getMetadataArgsStorage } from '../index';
/**
 * Injects all request's route parameters to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function Params(options) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'params',
            object: object,
            method: methodName,
            index: index,
            parse: options ? options.parse : false,
            required: options ? options.required : undefined,
            classTransform: options ? options.transform : undefined,
            explicitType: options ? options.type : undefined,
            validate: options ? options.validate : undefined,
        });
    };
}
//# sourceMappingURL=Params.js.map