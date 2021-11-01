import { getMetadataArgsStorage } from '../index';
/**
 * Injects a Koa's Context object to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function Ctx() {
    return function (object, methodName, index) {
        getMetadataArgsStorage().params.push({
            type: 'context',
            object: object,
            method: methodName,
            index: index,
            parse: false,
            required: false,
        });
    };
}
//# sourceMappingURL=Ctx.js.map