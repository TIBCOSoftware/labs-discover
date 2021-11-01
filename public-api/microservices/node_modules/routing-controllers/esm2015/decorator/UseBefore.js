import { getMetadataArgsStorage } from '../index';
/**
 * Specifies a given middleware to be used for controller or controller action BEFORE the action executes.
 * Must be set to controller action or controller class.
 */
export function UseBefore(...middlewares) {
    return function (objectOrFunction, methodName) {
        middlewares.forEach(middleware => {
            getMetadataArgsStorage().uses.push({
                target: methodName ? objectOrFunction.constructor : objectOrFunction,
                method: methodName,
                middleware: middleware,
                afterAction: false,
            });
        });
    };
}
//# sourceMappingURL=UseBefore.js.map