"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSmallestWithin = findSmallestWithin;
exports.pickSmallestSweep = pickSmallestSweep;
// finds the smallest value t of the list with t > min, t <= max
function findSmallestWithin(list, min, max, smallestSoFar = null) {
    if (list.length < 1) {
        return smallestSoFar;
    }
    else {
        const [head, ...tail] = list;
        if (head === null) {
            return findSmallestWithin(tail, min, max, smallestSoFar);
        }
        else if (head >= min && head <= max) {
            if (smallestSoFar === null) {
                return findSmallestWithin(tail, min, max, head);
            }
            else if (head > smallestSoFar) {
                return findSmallestWithin(tail, min, max, smallestSoFar);
            }
            else {
                return findSmallestWithin(tail, min, max, head);
            }
        }
        else {
            return findSmallestWithin(tail, min, max, smallestSoFar);
        }
    }
}
;
// finds the object with smallest sweeping parameter
function pickSmallestSweep(list, smallestSoFar = null) {
    if (list.length < 1) {
        return smallestSoFar;
    }
    else {
        const [head, ...tail] = list;
        if (head === null) {
            return pickSmallestSweep(tail, smallestSoFar);
        }
        else {
            if (smallestSoFar === null || head.sweep < smallestSoFar.sweep) {
                return pickSmallestSweep(tail, head);
            }
            else {
                return pickSmallestSweep(tail, smallestSoFar);
            }
        }
    }
}
