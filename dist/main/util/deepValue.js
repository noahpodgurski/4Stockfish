"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepValue = deepValue;
function deepValue(obj, path) {
    let val = obj;
    const accessors = path.split('.');
    for (let i = 0; i < accessors.length && val !== undefined; i++) {
        val = val[accessors[i]];
    }
    return val;
}
;
