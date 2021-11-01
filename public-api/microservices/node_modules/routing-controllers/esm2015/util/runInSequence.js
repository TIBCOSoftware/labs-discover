/**
 * Runs given callback that returns promise for each item in the given collection in order.
 * Operations executed after each other, right after previous promise being resolved.
 */
export function runInSequence(collection, callback) {
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
//# sourceMappingURL=runInSequence.js.map