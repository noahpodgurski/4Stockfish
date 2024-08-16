"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.scaleToGCTrigger = scaleToGCTrigger;
exports.scaleToUnitAxes = scaleToUnitAxes;
exports.meleeRound = meleeRound;
exports.scaleToMeleeAxes = scaleToMeleeAxes;
exports.deaden = deaden;
exports.tasRescale = tasRescale;
/*eslint indent:0*/
/*eslint prefer-const:0*/
const linAlg_1 = require("../main/linAlg");
// ----------------------------------------------------------------------------------------------------
// Melee input simulation
function fromCardinals([origx, origy], l, r, d, u) {
    return [[origx, origy], [l, origy], [r, origy], [origx, d], [origx, u]];
}
;
// parameters for GC controller simulation
// the following function gives an approximation to the extreme raw axis data for a given controller
// of course, this varies between controllers, but this serves as a useful first approximation
// function output: [[origx, origy], [lx, ly], [rx, ry], [dx, dy], [ux, uy]]
function stickExtremePoints(stickCardinals) {
    if (stickCardinals === null || stickCardinals === undefined) {
        return (fromCardinals([0, 0], -1, 1, 1, -1));
    }
    else {
        return (fromCardinals([stickCardinals.center.x, stickCardinals.center.y], stickCardinals.left, stickCardinals.right, stickCardinals.down, stickCardinals.up));
    }
}
;
// The following function renormalises axis input,
// so that corners (l = left, r = right, d=down, u=up) are mapped to the respective corners of the unit square.
// This function assumes that ALL coordinates have already been centered.
// Return type: [xnew,ynew]
function renormaliseAxisInput([lx, ly], [rx, ry], [dx, dy], [ux, uy], [x, y]) {
    let invMat;
    if ((x * ry - y * rx <= 0) && (x * uy - y * ux >= 0)) { // quadrant 1
        invMat = (0, linAlg_1.inverseMatrix)([
            [rx, ux],
            [ry, uy]
        ]);
    }
    else if ((x * uy - y * ux <= 0) && (x * ly - y * lx >= 0)) { // quadrant 2
        invMat = (0, linAlg_1.inverseMatrix)([
            [-lx, ux],
            [-ly, uy]
        ]);
    }
    else if ((x * ly - y * lx <= 0) && (x * dy - y * dx >= 0)) { // quadrant 3
        invMat = (0, linAlg_1.inverseMatrix)([
            [-lx, -dx],
            [-ly, -dy]
        ]);
    }
    else { // quadrant 4
        invMat = (0, linAlg_1.inverseMatrix)([
            [rx, -dx],
            [ry, -dy]
        ]);
    }
    if (invMat === null || invMat === undefined) {
        return [x, y];
    }
    else {
        return (0, linAlg_1.multMatVect)(invMat, [x, y]);
    }
}
;
// clamps a value between -1 and 1
function toInterval(x) {
    if (x < -1) {
        return -1;
    }
    else if (x > 1) {
        return 1;
    }
    else {
        return x;
    }
}
;
// Analog triggers.
// t = trigger input
function scaleToGCTrigger(t, offset, scale) {
    const tnew = Math.abs(scale) < 0.001 ? 0 : (t + offset) / scale;
    if (tnew > 1) {
        return 1;
    }
    else if (tnew < 0.3) {
        return 0;
    }
    else {
        return tnew;
    }
}
;
// ---------------------------
// GC controller simulation
const steps = 80;
const deadzoneConst = 0.28;
const leniency = 10;
const meleeOrig = 128;
const meleeMin = meleeOrig - (steps + leniency); // lowest  0 -- 255 input the controller will give
const meleeMax = meleeOrig + (steps + leniency); // highest 0 -- 255 input the controller will give
// rescales -1 -- 0 -- 1 to min -- orig -- max, and rounds to nearest integer
function discretise(x, min, orig, max) {
    if (x < 0) {
        return Math.round((x * (orig - min) + orig));
    }
    else if (x > 0) {
        return Math.round((x * (max - orig) + orig));
    }
    else {
        return orig;
    }
}
;
// Rescales controller input to -1 -- 0 -- 1 in both axes
function scaleToUnitAxes(x, y, stickCardinals, customCenterX, customCenterY) {
    let [[origx, origy], [lx, ly], [rx, ry], [dx, dy], [ux, uy]] = stickExtremePoints(stickCardinals);
    origx += customCenterX;
    origy += customCenterY;
    const [xnew, ynew] = renormaliseAxisInput([lx - origx, ly - origy], [rx - origx, ry - origy], [dx - origx, dy - origy], [ux - origx, uy - origy], [x - origx, y - origy]);
    return [toInterval(xnew), toInterval(ynew)];
}
;
// Rescales -1 -- 1 input to 0 -- 255 values to simulate a GC controller
function scaleUnitToGCAxes(x, y) {
    const xnew = discretise(x, meleeMin, meleeOrig, meleeMax);
    const ynew = discretise(y, meleeMin, meleeOrig, meleeMax);
    return ([xnew, ynew]);
}
;
// Rescales controller input to 0 -- 255 values to simulate a GC controller
function scaleToGCAxes(x, y, stickCardinals, customCenterX, customCenterY) {
    const [xnew, ynew] = scaleToUnitAxes(x, y, stickCardinals, customCenterX, customCenterY);
    return scaleUnitToGCAxes(xnew, ynew);
}
// ---------------------------------
// Melee input rescaling functions
// basic mapping from 0 -- 255 back to -1 -- 1 done by Melee
function axisRescale(x, orig = meleeOrig) {
    return (x - orig) / steps;
}
;
function unitRetract([x, y]) {
    const norm = Math.sqrt(x * x + y * y);
    if (norm < 1) {
        return ([x, y]);
    }
    else {
        return ([x / norm, y / norm]);
    }
}
;
function meleeRound(x) {
    return Math.round(steps * x) / steps;
}
;
function meleeAxesRescale([x, y]) {
    const xnew = axisRescale(x, meleeOrig);
    const ynew = axisRescale(y, meleeOrig);
    let [xnew2, ynew2] = unitRetract([xnew, ynew]);
    return [xnew2, ynew2].map(meleeRound);
}
// this is the main input rescaling function
// it scales raw input data to the data Melee uses for the simulation
// number : controller ID, to rescale axes dependent on controller raw input
//boolean == false means no deadzone,boolean == true means deadzone
function scaleToMeleeAxes(x, y, isGC, stickCardinals, customCenterX = 0, customCenterY = 0) {
    let xnew = x;
    let ynew = y;
    if (isGC) { // gamecube controllers, don't mess up the raw data
        xnew = (x - customCenterX + 1) * 255 / 2; // convert raw input to 0 -- 255 values in obvious way
        ynew = (-y + customCenterY + 1) * 255 / 2; // y incurs a sign flip
        //console.log("You are using raw GC controller data.");
    }
    else { // convert raw input to 0 -- 255 by GC controller simulation
        [xnew, ynew] = scaleToGCAxes(x, y, stickCardinals, customCenterX, customCenterY);
        //console.log("You are using GC controller simulation.");
    }
    return meleeAxesRescale([xnew, ynew]);
}
;
function deaden(x, dead = deadzoneConst) {
    return Math.abs(x) < dead ? 0 : x;
}
;
// scales -1 -- 1 TAS data to the data Melee uses for the simulation
function tasRescale(x, y, isDeadzoned = false) {
    const xnew = (x + 1) * 255 / 2;
    const ynew = (y + 1) * 255 / 2;
    return meleeAxesRescale([xnew, ynew]);
    // return meleeAxesRescale ( [xnew, ynew], isDeadzoned );
}
;
