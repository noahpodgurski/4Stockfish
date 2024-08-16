"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineAngle = lineAngle;
function lineAngle(line) {
    const v1 = line[0];
    const v2 = line[1];
    const theta = Math.atan2(v2.y - v1.y, v2.x - v1.x);
    if (theta < 0) {
        return (theta + Math.PI);
    }
    else {
        return theta;
    }
}
;
