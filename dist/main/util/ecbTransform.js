"use strict";
// @flow
/*eslint indent:0*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveECB = moveECB;
exports.squashECBAt = squashECBAt;
exports.ecbFocusFromAngularParameter = ecbFocusFromAngularParameter;
exports.interpolateECB = interpolateECB;
exports.makeECB = makeECB;
const Vec2D_1 = require("./Vec2D");
const linAlg_1 = require("../linAlg");
function moveECB(ecb, vec) {
    return ([new Vec2D_1.Vec2D(ecb[0].x + vec.x, ecb[0].y + vec.y),
        new Vec2D_1.Vec2D(ecb[1].x + vec.x, ecb[1].y + vec.y),
        new Vec2D_1.Vec2D(ecb[2].x + vec.x, ecb[2].y + vec.y),
        new Vec2D_1.Vec2D(ecb[3].x + vec.x, ecb[3].y + vec.y)]);
}
;
function squashECBAt(ecb, squashDatum) {
    const pos = ecbFocusFromAngularParameter(ecb, squashDatum.location);
    const t = squashDatum.factor;
    return ([new Vec2D_1.Vec2D(t * ecb[0].x + (1 - t) * pos.x, t * ecb[0].y + (1 - t) * pos.y),
        new Vec2D_1.Vec2D(t * ecb[1].x + (1 - t) * pos.x, t * ecb[1].y + (1 - t) * pos.y),
        new Vec2D_1.Vec2D(t * ecb[2].x + (1 - t) * pos.x, t * ecb[2].y + (1 - t) * pos.y),
        new Vec2D_1.Vec2D(t * ecb[3].x + (1 - t) * pos.x, t * ecb[3].y + (1 - t) * pos.y)]);
}
;
function ecbFocusFromAngularParameter(ecb, t) {
    let focus;
    if (t === null) {
        focus = new Vec2D_1.Vec2D(ecb[0].x, (ecb[0].y + ecb[2].y) / 2);
    }
    else if (t <= 1) {
        focus = new Vec2D_1.Vec2D((1 - t) * ecb[0].x + t * ecb[1].x, (1 - t) * ecb[0].y + t * ecb[1].y);
    }
    else if (t <= 2) {
        focus = new Vec2D_1.Vec2D((1 - (t - 1)) * ecb[1].x + (t - 1) * ecb[2].x, (1 - (t - 1)) * ecb[1].y + (t - 1) * ecb[2].y);
    }
    else if (t <= 3) {
        focus = new Vec2D_1.Vec2D((1 - (t - 2)) * ecb[2].x + (t - 2) * ecb[3].x, (1 - (t - 2)) * ecb[2].y + (t - 2) * ecb[3].y);
    }
    else {
        focus = new Vec2D_1.Vec2D((1 - (t - 3)) * ecb[3].x + (t - 3) * ecb[0].x, (1 - (t - 3)) * ecb[3].y + (t - 3) * ecb[0].y);
    }
    return focus;
}
function interpolateECB(srcECB, tgtECB, s) {
    return [new Vec2D_1.Vec2D((1 - s) * srcECB[0].x + s * tgtECB[0].x, (1 - s) * srcECB[0].y + s * tgtECB[0].y),
        new Vec2D_1.Vec2D((1 - s) * srcECB[1].x + s * tgtECB[1].x, (1 - s) * srcECB[1].y + s * tgtECB[1].y),
        new Vec2D_1.Vec2D((1 - s) * srcECB[2].x + s * tgtECB[2].x, (1 - s) * srcECB[2].y + s * tgtECB[2].y),
        new Vec2D_1.Vec2D((1 - s) * srcECB[3].x + s * tgtECB[3].x, (1 - s) * srcECB[3].y + s * tgtECB[3].y)];
}
function makeECB(pos, halfWidth, height) {
    return [pos,
        (0, linAlg_1.add)(pos, new Vec2D_1.Vec2D(halfWidth, 0)),
        (0, linAlg_1.add)(pos, new Vec2D_1.Vec2D(0, height)),
        (0, linAlg_1.add)(pos, new Vec2D_1.Vec2D(-halfWidth, 0))
    ];
}
