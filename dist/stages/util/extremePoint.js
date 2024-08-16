"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.extremePoint = extremePoint;
// export function extremePoint(wall : [Vec2D, Vec2D], extreme : string) : Vec2D {
function extremePoint(wall, extreme) {
    const v1 = wall[0];
    const v2 = wall[1];
    switch (extreme) {
        case "u":
        case "t":
            if (v2.y < v1.y) {
                return v1;
            }
            else {
                return v2;
            }
        case "d":
        case "b":
            if (v2.y > v1.y) {
                return v1;
            }
            else {
                return v2;
            }
        case "l":
            if (v2.x > v1.x) {
                return v1;
            }
            else {
                return v2;
            }
        case "r":
            if (v2.x < v1.x) {
                return v1;
            }
            else {
                return v2;
            }
        default:
            console.log("error in 'extremePoint': invalid parameter " + extreme + ", not up/top/down/bottom/left/right");
            return v1; // just to make the type checker happy
    }
}
;
