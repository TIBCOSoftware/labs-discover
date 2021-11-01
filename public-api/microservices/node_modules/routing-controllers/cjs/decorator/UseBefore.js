"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseBefore = void 0;
const index_1 = require("../index");
/**
 * Specifies a given middleware to be used for controller or controller action BEFORE the action executes.
 * Must be set to controller action or controller class.
 */
function UseBefore(...middlewares) {
    return function (objectOrFunction, methodName) {
        middlewares.forEach(middleware => {
            index_1.getMetadataArgsStorage().uses.push({
                target: methodName ? objectOrFunction.constructor : objectOrFunction,
                method: methodName,
                middleware: middleware,
                afterAction: false,
            });
        });
    };
}
exports.UseBefore = UseBefore;
//# sourceMappingURL=UseBefore.js.map