"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstNonNull = firstNonNull;
function firstNonNull(list) {
    if (list.length < 1) {
        return null;
    }
    else {
        const [head, ...tail] = list;
        if (head === null) {
            return firstNonNull(tail);
        }
        else {
            return head;
        }
    }
}
