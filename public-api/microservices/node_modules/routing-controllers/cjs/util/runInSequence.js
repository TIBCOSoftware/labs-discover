"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInSequence = void 0;
/**
 * Runs given callback that returns promise for each item in the given collection in order.
 * Operations executed after each other, right after previous promise being resolved.
 */
function runInSequence(collection, callback) {
    const results = [];
    return collection
        .reduce((promise, item) => {
        return promise
            .then(() => {
            return callback(item);
        })
            .then(result => {
            results.push(result);
        });
    }, Promise.resolve())
        .then(() => {
        return results;
    });
}
exports.runInSequence = runInSequence;
//# sourceMappingURL=runInSequence.js.map