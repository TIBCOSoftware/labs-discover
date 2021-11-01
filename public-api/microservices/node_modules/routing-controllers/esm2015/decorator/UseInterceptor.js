import { getMetadataArgsStorage } from '../index';
/**
 * Specifies a given interceptor middleware or interceptor function to be used for controller or controller action.
 * Must be set to controller action or controller class.
 */
export function UseInterceptor(...interceptors) {
    return function (objectOrFunction, methodName) {
        interceptors.forEach(interceptor => {
            getMetadataArgsStorage().useInterceptors.push({
                interceptor: interceptor,
                target: methodName ? objectOrFunction.constructor : objectOrFunction,
                method: methodName,
            });
        });
    };
}
//# sourceMappingURL=UseInterceptor.js.map