"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segment2D = void 0;
const Vec2D_1 = require("./Vec2D");
class Segment2D {
    constructor(x, y, vecx, vecy) {
        this.x = x;
        this.y = y;
        this.vecx = vecx;
        this.vecy = vecy;
    }
    segLength() {
        const dx = this.vecx;
        const dy = this.vecy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    project(segOnto) {
        const vec = new Vec2D_1.Vec2D(this.vecx, this.vecy);
        const onto = new Vec2D_1.Vec2D(segOnto.vecx, segOnto.vecy);
        const d = onto.dot(onto);
        if (d > 0) {
            const dp = vec.dot(onto);
            const multiplier = dp / d;
            const rx = onto.x * multiplier;
            const ry = onto.y * multiplier;
            return new Vec2D_1.Vec2D(rx, ry);
        }
        return new Vec2D_1.Vec2D(0, 0);
    }
}
exports.Segment2D = Segment2D;
