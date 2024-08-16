"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.Box2D = void 0;
const Vec2D_1 = require("./Vec2D");
class Box2D {
    constructor(min, max) {
        this.min = new Vec2D_1.Vec2D(min[0], min[1]);
        this.max = new Vec2D_1.Vec2D(max[0], max[1]);
    }
}
exports.Box2D = Box2D;
