"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toList = toList;
// temporary workaround for custom stage data being objects and not arrays
function toList(list) {
    if (list.length === 0) {
        return [];
    }
    else {
        const [head, ...tail] = list;
        return ([head].concat(toList(tail)));
    }
}
