"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseInterceptor = void 0;
const index_1 = require("../index");
/**
 * Specifies a given interceptor middleware or interceptor function to be used for controller or controller action.
 * Must be set to controller action or controller class.
 */
function UseInterceptor(...interceptors) {
    return function (objectOrFunction, methodName) {
        interceptors.forEach(interceptor => {
            index_1.getMetadataArgsStorage().useInterceptors.push({
                interceptor: interceptor,
                target: methodName ? objectOrFunction.constructor : objectOrFunction,
                method: methodName,
            });
        });
    };
}
exports.UseInterceptor = UseInterceptor;
//# sourceMappingURL=UseInterceptor.js.map