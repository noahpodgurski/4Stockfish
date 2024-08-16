"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipLabels = zipLabels;
// zips labelling information onto a list
function zipLabels(list, string, start = 0) {
    if (list.length === 0) {
        return [];
    }
    else {
        const [head, ...tail] = list;
        return ([[head, [string, start]]].concat(zipLabels(tail, string, start + 1)));
    }
}
