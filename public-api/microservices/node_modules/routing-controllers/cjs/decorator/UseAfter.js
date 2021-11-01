"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseAfter = void 0;
const index_1 = require("../index");
/**
 * Specifies a given middleware to be used for controller or controller action AFTER the action executes.
 * Must be set to controller action or controller class.
 */
function UseAfter(...middlewares) {
    return function (objectOrFunction, methodName) {
        middlewares.forEach(middleware => {
            index_1.getMetadataArgsStorage().uses.push({
                target: methodName ? objectOrFunction.constructor : objectOrFunction,
                method: methodName,
                middleware: middleware,
                afterAction: true,
            });
        });
    };
}
exports.UseAfter = UseAfter;
//# sourceMappingURL=UseAfter.js.map