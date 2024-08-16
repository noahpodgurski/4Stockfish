"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vec2D = void 0;
exports.getXOrYCoord = getXOrYCoord;
exports.putXOrYCoord = putXOrYCoord;
exports.flipXOrY = flipXOrY;
class Vec2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    ;
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    ;
}
exports.Vec2D = Vec2D;
;
function getXOrYCoord(vec, xOrY) {
    if (xOrY === "x") {
        return vec.x;
    }
    else {
        return vec.y;
    }
}
;
function putXOrYCoord(coord, xOrY) {
    if (xOrY === "x") {
        return (new Vec2D(coord, 0));
    }
    else {
        return (new Vec2D(0, coord));
    }
}
;
function flipXOrY(xOrY) {
    return xOrY === "x" ? "y" : "x";
}
