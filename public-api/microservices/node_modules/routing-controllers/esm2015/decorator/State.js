import { getMetadataArgsStorage } from '../index';
/**
 * Injects a State object to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function State(objectName) {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'state',
            object: object,
            method: methodName,
            index: index,
            name: objectName,
            parse: false,
            required: true,
            classTransform: undefined,
        });
    };
}
//# sourceMappingURL=State.js.map