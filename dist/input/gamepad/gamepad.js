"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullGamepad = void 0;
exports.getGamepad = getGamepad;
exports.nullGamepad = { buttons: [], axes: [], id: "null gamepad" };
function getGamepad(j) {
    return navigator.getGamepads ? navigator.getGamepads()[j] : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads()[j] : exports.nullGamepad);
}
