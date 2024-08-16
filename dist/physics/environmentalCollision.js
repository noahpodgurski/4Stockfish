"use strict";
// @flow
/*eslint indent:0*/ // get stuffed
Object.defineProperty(exports, "__esModule", { value: true });
exports.smallestECBHeight = exports.smallestECBWidth = exports.additionalOffset = void 0;
exports.hLineThrough = hLineThrough;
exports.hLineAt = hLineAt;
exports.vLineThrough = vLineThrough;
exports.vLineAt = vLineAt;
exports.lineThrough = lineThrough;
exports.outwardsWallNormal = outwardsWallNormal;
exports.coordinateInterceptParameter = coordinateInterceptParameter;
exports.coordinateIntercept = coordinateIntercept;
exports.findCollision = findCollision;
exports.getSameAndOther = getSameAndOther;
exports.moveAlongGround = moveAlongGround;
exports.groundedECBSquashFactor = groundedECBSquashFactor;
exports.runCollisionRoutine = runCollisionRoutine;
const Vec2D_1 = require("../main/util/Vec2D");
const linAlg_1 = require("../main/linAlg");
const findSmallestWithin_1 = require("../main/util/findSmallestWithin");
const solveQuadraticEquation_1 = require("../main/util/solveQuadraticEquation");
const lineAngle_1 = require("../main/util/lineAngle");
const extremePoint_1 = require("../stages/util/extremePoint");
const ecbTransform_1 = require("../main/util/ecbTransform");
const zipLabels_1 = require("../main/util/zipLabels");
const drawECB_1 = require("../main/util/drawECB");
const encode_1 = require("../stages/encode");
exports.additionalOffset = 0.00001;
exports.smallestECBWidth = 1.95;
exports.smallestECBHeight = 1.95;
const maxRecursion = 6;
// -----------------------------------------------------
// various utility functions
// horizontal line through a point
function hLineThrough(point) {
    return [point, new Vec2D_1.Vec2D(point.x + 1, point.y)];
}
;
function hLineAt(y) {
    return hLineThrough(new Vec2D_1.Vec2D(0, y));
}
// vertical line through a point
function vLineThrough(point) {
    return [point, new Vec2D_1.Vec2D(point.x, point.y + 1)];
}
;
function vLineAt(x) {
    return vLineThrough(new Vec2D_1.Vec2D(x, 0));
}
// either horizontal or vertical line through a point
function lineThrough(point, xOrY) {
    if (xOrY === "x") {
        return hLineThrough(point);
    }
    else {
        return vLineThrough(point);
    }
}
;
// next ECB point index, counterclockwise or clockwise (with respect to the ECB)
function turn(number, counterclockwise = true) {
    if (counterclockwise) {
        if (number === 3) {
            return 0;
        }
        else {
            return number + 1;
        }
    }
    else {
        if (number === 0) {
            return 3;
        }
        else {
            return number - 1;
        }
    }
}
;
function outwardsWallNormal(wallBottomOrLeft, wallTopOrRight, wallType) {
    let sign = 1;
    switch (wallType) {
        case "l": // left wall
        case "g": // ground
        case "b":
        case "d":
        case "p": // platform
            sign = -1;
            break;
        default: // right wall, ceiling
            break;
    }
    return new Vec2D_1.Vec2D(sign * (wallTopOrRight.y - wallBottomOrLeft.y), sign * (wallBottomOrLeft.x - wallTopOrRight.x));
}
// returns true if the vector is moving into the wall, false otherwise
// need to be careful that arguments 2 and 3 are given in the correct order to get the expected result
function movingInto(vec, wallTopOrRight, wallBottomOrLeft, wallType) {
    return (0, linAlg_1.dotProd)(vec, outwardsWallNormal(wallBottomOrLeft, wallTopOrRight, wallType)) < 0;
}
;
// returns true if point is to the right of a "left" wall, or to the left of a "right" wall,
// and false otherwise
function isOutside(point, wallTopOrRight, wallBottomOrLeft, wallType) {
    //const vec = new Vec2D ( point.x - wallBottom.x, point.y - wallBottom.y );
    //return ( !movingInto(vec, wallTop, wallBottom, wallType ) );
    return !movingInto(new Vec2D_1.Vec2D(point.x - wallBottomOrLeft.x, point.y - wallBottomOrLeft.y), wallTopOrRight, wallBottomOrLeft, wallType);
}
;
// say line1 passes through the two points p1 = (x1,y1), p2 = (x2,y2)
// and line2 by the two points p3 = (x3,y3) and p4 = (x4,y4)
// this function returns the parameter t, such that p3 + t*(p4-p3) is the intersection point of the two lines
// please ensure this function is not called on parallel lines
function coordinateInterceptParameter(line1, line2) {
    // const x1 = line1[0].x;
    // const x2 = line1[1].x;
    // const x3 = line2[0].x;
    // const x4 = line2[1].x;
    // const y1 = line1[0].y;
    // const y2 = line1[1].y;
    // const y3 = line2[0].y;
    // const y4 = line2[1].y;
    // const t = ( (x1-x3)*(y2-y1) + (x1-x2)*(y1-y3) ) / ( (x4-x3)*(y2-y1) + (x2-x1)*(y3-y4) );
    // return t;
    return ((line1[0].x - line2[0].x) * (line1[1].y - line1[0].y)
        + (line1[0].x - line1[1].x) * (line1[0].y - line2[0].y))
        / ((line2[1].x - line2[0].x) * (line1[1].y - line1[0].y)
            + (line1[1].x - line1[0].x) * (line2[0].y - line2[1].y));
}
;
// find the intersection of two lines
// please ensure this function is not called on parallel lines
function coordinateIntercept(line1, line2) {
    const t = coordinateInterceptParameter(line1, line2);
    return (new Vec2D_1.Vec2D(line2[0].x + t * (line2[1].x - line2[0].x), line2[0].y + t * (line2[1].y - line2[0].y)));
}
;
// finds whether the ECB impacted a surface on one of its vertices
function runPointSweep(ecb1, ecbp, same, wall, wallType, wallIndex, wallBottomOrLeft, wallTopOrRight, xOrY) {
    let result = null;
    const wallAngle = (0, lineAngle_1.lineAngle)([wallBottomOrLeft, wallTopOrRight]);
    if (wallType === "l" || wallType === "r") { // left or right wall, need to check top or bottom ECB vertex too
        const sameResult = pointSweepingCheck(ecb1, ecbp, same, wall, wallType, wallIndex, wallTopOrRight, wallBottomOrLeft, xOrY);
        const other = (wallType === "l" && wallAngle < Math.PI / 2) || (wallType === "r" && wallAngle > Math.PI / 2) ? 0 : 2;
        const otherResult = pointSweepingCheck(ecb1, ecbp, other, wall, wallType, wallIndex, wallTopOrRight, wallBottomOrLeft, xOrY);
        result = (0, findSmallestWithin_1.pickSmallestSweep)([sameResult, otherResult]);
    }
    else if (wallType === "c") { // for ceilings, need to check side ECB vertex too
        const topResult = pointSweepingCheck(ecb1, ecbp, 2, wall, wallType, wallIndex, wallTopOrRight, wallBottomOrLeft, xOrY);
        const side = wallAngle < Math.PI / 2 ? 3 : 1;
        const sideResult = pointSweepingCheck(ecb1, ecbp, side, wall, wallType, wallIndex, wallTopOrRight, wallBottomOrLeft, xOrY);
        result = (0, findSmallestWithin_1.pickSmallestSweep)([topResult, sideResult]);
    }
    else { // can only collide grounds on the bottom ECB vertex
        result = pointSweepingCheck(ecb1, ecbp, same, wall, wallType, wallIndex, wallTopOrRight, wallBottomOrLeft, xOrY);
    }
    return result;
}
;
function pointSweepingCheck(ecb1, ecbp, pt, wall, wallType, wallIndex, wallTopOrRight, wallBottomOrLeft, xOrY) {
    let result = null;
    if (isOutside(ecb1[pt], wallTopOrRight, wallBottomOrLeft, wallType) && !isOutside(ecbp[pt], wallTopOrRight, wallBottomOrLeft, wallType)) {
        const s = coordinateInterceptParameter(wall, [ecb1[pt], ecbp[pt]]); // need to put wall first
        if (!(isNaN(s) || s === Infinity || s > 1 || s < 0)) {
            const intersection = new Vec2D_1.Vec2D((1 - s) * ecb1[pt].x + s * ecbp[pt].x, (1 - s) * ecb1[pt].y + s * ecbp[pt].y);
            if ((0, Vec2D_1.getXOrYCoord)(intersection, xOrY) <= (0, Vec2D_1.getXOrYCoord)(wallTopOrRight, xOrY) && (0, Vec2D_1.getXOrYCoord)(intersection, xOrY) >= (0, Vec2D_1.getXOrYCoord)(wallBottomOrLeft, xOrY)) {
                result = { sweep: s, kind: "surface", surface: (0, encode_1.Vec2DArrayToSurface)(wall), type: wallType, index: wallIndex, pt: pt };
            }
        }
    }
    return result;
}
;
// second: edge sweeping functions
// in this next function, we are considering a line that is sweeping,
// from the initial line 'line1' passing through the two points p1 = (x1,y1), p2 = (x2,y2)
// to the final line 'line2' passing through the two points p3 = (x3,y3) and p4 = (x4,y4)
// there are two sweeping parameters: 
//   't', which indicates how far along each line we are
//   's', which indicates how far we are sweeping between line1 and line2 (the main sweeping parameter)
// for instance:
//  s=0 means we are on line1,
//  s=1 means we are on line2,
//  t=0 means we are on the line between p1 and p3,
//  t=1 means we are on the line between p2 and p4
// this function returns a specific value for each of t and s,
// which correspond to when the swept line hits the origin O (at coordinates (0,0))
// if either of the parameters is not between 0 and 1, this function instead returns null
// see '/doc/linesweep.png' for a visual representation of the situation
function lineSweepParameters(line1, line2, flip = false) {
    let sign = 1;
    if (flip) {
        sign = -1;
    }
    const x1 = line1[0].x;
    const x2 = line1[1].x;
    const x3 = line2[0].x;
    const x4 = line2[1].x;
    const y1 = line1[0].y;
    const y2 = line1[1].y;
    const y3 = line2[0].y;
    const y4 = line2[1].y;
    const a0 = x2 * y1 - x1 * y2;
    const a1 = x4 * y1 - 2 * x2 * y1 + 2 * x1 * y2 - x3 * y2 + x2 * y3 - x1 * y4;
    const a2 = x2 * y1 - x4 * y1 - x1 * y2 + x3 * y2 - x2 * y3 + x4 * y3 + x1 * y4 - x3 * y4;
    // s satisfies the equation:   a0 + a1*s + a2*s^2 = 0
    const s = (0, solveQuadraticEquation_1.solveQuadraticEquation)(a0, a1, a2, sign);
    if (s === null || isNaN(s) || s === Infinity || s < 0 || s > 1) {
        return null; // no real solution
    }
    else {
        const t = (s * (x1 - x3) - x1) / (x2 - x1 + s * (x1 - x2 - x3 + x4));
        if (isNaN(t) || t === Infinity || t < 0 || t > 1) {
            return null;
        }
        else {
            return [t, s];
        }
    }
}
;
// finds whether the ECB impacted a surface on one of its edges
function runEdgeSweep(ecb1, ecbp, same, wallType, wallLeft, wallRight, wallBottomOrLeft, wallTopOrRight, xOrY, damageType) {
    let other = 0; // other ECB point
    let counterclockwise = true; // whether (same ECB point -> other ECB point) is counterclockwise (w.r.t. the ECB)
    let corner = null;
    let otherCorner = null;
    let edgeSweepResult = null;
    let otherEdgeSweepResult = null;
    const flip = wallType === "r" || wallType === "c" ? false : true;
    // case 1
    if ((0, Vec2D_1.getXOrYCoord)(ecb1[same], xOrY) > (0, Vec2D_1.getXOrYCoord)(wallTopOrRight, xOrY)) {
        counterclockwise = !flip;
        other = turn(same, counterclockwise);
        if ((0, Vec2D_1.getXOrYCoord)(ecbp[other], xOrY) < (0, Vec2D_1.getXOrYCoord)(wallTopOrRight, xOrY)) {
            corner = wallTopOrRight;
        }
    }
    // case 2
    else if ((0, Vec2D_1.getXOrYCoord)(ecb1[same], xOrY) < (0, Vec2D_1.getXOrYCoord)(wallBottomOrLeft, xOrY)) {
        counterclockwise = flip;
        other = turn(same, counterclockwise);
        if ((0, Vec2D_1.getXOrYCoord)(ecbp[other], xOrY) > (0, Vec2D_1.getXOrYCoord)(wallBottomOrLeft, xOrY)) {
            corner = wallBottomOrLeft;
        }
    }
    if (corner !== null) {
        // the relevant ECB edge, that might collide with the corner, is the edge between ECB points 'same' and 'other'
        let interiorECBside = "l";
        if (counterclockwise === false) {
            interiorECBside = "r";
        }
        if (!isOutside(corner, ecbp[same], ecbp[other], interiorECBside) && isOutside(corner, ecb1[same], ecb1[other], interiorECBside)) {
            edgeSweepResult = edgeSweepingCheck(ecb1, ecbp, same, other, counterclockwise, corner, damageType);
        }
    }
    if ((wallType === "l" || wallType === "r") && (other === 0)) {
        // if dealing with a wall, we might also want to check the top ECB point for collision if we aren't already doing so
        let otherCounterclockwise = false; // whether ( same ECB point -> top ECB point) is counterclockwise
        otherCorner = wallRight;
        if (wallType === "l") {
            otherCounterclockwise = true;
            otherCorner = wallLeft;
        }
        let otherInteriorECBside = "l";
        if (otherCounterclockwise === false) {
            otherInteriorECBside = "r";
        }
        if (!isOutside(otherCorner, ecbp[same], ecbp[2], otherInteriorECBside)
            && isOutside(otherCorner, ecb1[same], ecb1[2], otherInteriorECBside)) {
            otherEdgeSweepResult = edgeSweepingCheck(ecb1, ecbp, same, 2, otherCounterclockwise, otherCorner, damageType);
        }
    }
    return (0, findSmallestWithin_1.pickSmallestSweep)([edgeSweepResult, otherEdgeSweepResult]);
}
;
// determines whether the given ECB edge (same--other) has collided with the corner, using the lineSweepParameters function
function edgeSweepingCheck(ecb1, ecbp, same, other, counterclockwise, corner, damageType) {
    let output = null;
    // the relevant ECB edge, that might collide with the corner, is the edge between ECB points 'same' and 'other'
    let interiorECBside = "l";
    if (counterclockwise === false) {
        interiorECBside = "r";
    }
    if (!isOutside(corner, ecbp[same], ecbp[other], interiorECBside) && isOutside(corner, ecb1[same], ecb1[other], interiorECBside)) {
        // we sweep a line,
        // starting from the relevant ECB1 edge, and ending at the relevant ECBp edge,
        // and figure out where this would intersect the corner
        // first we recenter everything around the corner,
        // as the 'lineSweepParameters' function calculates collision with respect to the origin
        const recenteredECB1Edge = [new Vec2D_1.Vec2D(ecb1[same].x - corner.x, ecb1[same].y - corner.y),
            new Vec2D_1.Vec2D(ecb1[other].x - corner.x, ecb1[other].y - corner.y)];
        const recenteredECBpEdge = [new Vec2D_1.Vec2D(ecbp[same].x - corner.x, ecbp[same].y - corner.y),
            new Vec2D_1.Vec2D(ecbp[other].x - corner.x, ecbp[other].y - corner.y)];
        // in the line sweeping, some tricky orientation checks show that a minus sign is required precisely in the counterclockwise case
        // this is what the third argument to 'lineSweepParameters' corresponds to
        const lineSweepResult = lineSweepParameters(recenteredECB1Edge, recenteredECBpEdge, counterclockwise);
        if (lineSweepResult !== null) {
            const [t, s] = lineSweepResult;
            const angularParameter = getAngularParameter(t, same, other);
            output = { kind: "corner", corner: corner, sweep: s, angular: angularParameter, damageType: damageType };
        }
    }
    return output;
}
;
// this function finds the first collision that happens as the old ECB moves to the projected ECB
// the sweeping parameter s corresponds to the location of this first collision
// terminology in the comments: a wall is a segment with an inside and an outside (could be a ground or ceiling )
// which is contained in an infinite line, extending both ways, which also has an inside and an outside
function findCollision(ecb1, ecbp, labelledSurface) {
    // STANDING ASSUMPTIONS
    // the ECB can only collide a ground/platform surface on its bottom point (or a bottom edge)
    // the ECB can only collide a ceiling surface on a top or side point (or a top edge)
    // the ECB cannot collide a left wall on its left vertex
    // the ECB cannot collide a right wall on its right vertex
    // walls and corners push out horizontally, grounds/ceilings/platforms push out vertically
    // const [wall, [wallType, wallIndex]] = labelledSurface;
    const { surface: wall, label: [wallType, wallIndex] } = labelledSurface;
    const damageType = wall[2] !== undefined ? wall[2].damageType : null;
    // start defining useful constants/variables
    const wallTop = (0, extremePoint_1.extremePoint)(wall, "t");
    const wallBottom = (0, extremePoint_1.extremePoint)(wall, "b");
    const wallLeft = (0, extremePoint_1.extremePoint)(wall, "l");
    const wallRight = (0, extremePoint_1.extremePoint)(wall, "r");
    // right wall by default
    let wallTopOrRight = wallTop;
    let wallBottomOrLeft = wallBottom;
    let same = 3;
    let xOrY = "y";
    let isPlatform = false;
    switch (wallType) {
        case "l": // left wall
            same = 1;
            break;
        case "p": // platform
            isPlatform = true;
        case "g": // ground
            same = 0;
            wallTopOrRight = wallRight;
            wallBottomOrLeft = wallLeft;
            xOrY = "x";
            break;
        case "c": // ceiling
            same = 2;
            wallTopOrRight = wallRight;
            wallBottomOrLeft = wallLeft;
            xOrY = "x";
            break;
        default: // right wall by default
            break;
    }
    // first check if player ECB was even near the wall
    if ((ecbp[0].y > wallTop.y && ecb1[0].y > wallTop.y) // player ECB stayed above the wall
        || (ecbp[2].y < wallBottom.y && ecb1[2].y < wallBottom.y) // played ECB stayed below the wall
        || (ecbp[3].x > wallRight.x && ecb1[3].x > wallRight.x) // player ECB stayed to the right of the wall
        || (ecbp[1].x < wallLeft.x && ecb1[1].x < wallLeft.x) // player ECB stayed to the left of the wall
    ) {
        return null;
    }
    else {
        // if the surface is a platform, and the bottom ECB point is below the platform, we shouldn't do anything
        if (isPlatform) {
            if (!isOutside(ecb1[same], wallTopOrRight, wallBottomOrLeft, wallType)) {
                return null;
            }
        }
        const closestEdgeCollision = runEdgeSweep(ecb1, ecbp, same, wallType, wallLeft, wallRight, wallBottomOrLeft, wallTopOrRight, xOrY, damageType);
        const closestPointCollision = runPointSweep(ecb1, ecbp, same, (0, encode_1.surfaceToVec2DArray)(wall), wallType, wallIndex, wallBottomOrLeft, wallTopOrRight, xOrY);
        let finalCollision = null;
        // if we have only one collision type (point/edge), take that one
        if (closestEdgeCollision === null) {
            finalCollision = closestPointCollision;
        }
        else if (closestPointCollision === null) {
            finalCollision = closestEdgeCollision;
        }
        // otherwise choose the collision with smallest sweeping parameter
        else if (closestEdgeCollision.sweep > closestPointCollision.sweep) {
            finalCollision = closestPointCollision;
        }
        else {
            finalCollision = closestEdgeCollision;
        }
        return finalCollision;
    }
}
;
// this function finds the first (non-ignored) collision as the ECB1 moves to the ECBp
function findClosestCollision(ecb1, ecbp, labelledSurfaces) {
    const touchingData = [null]; // initialise list of new collisions
    const collisionData = labelledSurfaces.map((labelledSurface) => findCollision(ecb1, ecbp, labelledSurface));
    for (let i = 0; i < collisionData.length; i++) {
        const collisionDatum = collisionData[i];
        if (collisionDatum !== null) {
            if (collisionDatum.kind === "surface") {
                touchingData.push({
                    sweep: collisionDatum.sweep, object: {
                        kind: "surface",
                        surface: collisionDatum.surface,
                        type: collisionDatum.type,
                        index: collisionDatum.index,
                        pt: collisionDatum.pt
                    }
                });
            }
            else if (collisionDatum.kind === "corner") {
                touchingData.push({
                    sweep: collisionDatum.sweep, object: {
                        kind: "corner",
                        corner: collisionDatum.corner,
                        angular: collisionDatum.angular,
                        damageType: collisionDatum.damageType
                    }
                });
            }
        }
    }
    return (0, findSmallestWithin_1.pickSmallestSweep)(touchingData);
}
;
function resolveECB(ecb1, ecbp, playerStatusInfo, labelledSurfaces) {
    return runSlideRoutine(ecb1, ecbp, ecbp, playerStatusInfo, labelledSurfaces, null, {
        type: null,
        angular: null
    }, false, true, 0);
}
function runSlideRoutine(srcECB, tgtECB, ecbp, playerStatusInfo, labelledSurfaces, oldTouchingDatum, slidingAgainst, squashed, final, recursionCounter) {
    let output;
    if (recursionCounter > maxRecursion) {
        console.log("'runSlideRoutine': excessive recursion, aborting.");
        (0, drawECB_1.drawECB)(srcECB, "#286ee0");
        (0, drawECB_1.drawECB)(tgtECB, "#f49930");
        (0, drawECB_1.drawECB)(ecbp, "#fff9ad");
        output = { ecb: srcECB, touching: null, squashed: squashed };
    }
    else {
        const slideDatum = slideECB(srcECB, tgtECB, labelledSurfaces, slidingAgainst, playerStatusInfo);
        let newECBp = ecbp;
        if (slideDatum.event === "end") {
            output = { ecb: slideDatum.finalECB, touching: slideDatum.touching, squashed: squashed };
        }
        else if (slideDatum.event === "continue") {
            if (final) {
                output = { ecb: tgtECB, touching: oldTouchingDatum, squashed: squashed };
            }
            else {
                newECBp = updateECBp(srcECB, tgtECB, ecbp, slidingAgainst.type, 0);
                output = runSlideRoutine(tgtECB, newECBp, newECBp, playerStatusInfo, labelledSurfaces, oldTouchingDatum, slidingAgainst, squashed, true, recursionCounter + 1);
            }
        }
        else { // slideDatum.event === "transfer" || slideDatum.event === "squash"
            const newSrcECB = slideDatum.midECB;
            const slideObject = slideDatum.object;
            let newTouchingDatum;
            let angular;
            let newFinal;
            let newTgtECB;
            let newSlidingType = null;
            let same;
            let other;
            if (slideObject.kind === "surface") {
                const surface = slideObject.surface;
                const surfaceType = slideObject.type;
                if (surfaceType === "l" || surfaceType === "r" || surfaceType === "c") {
                    newSlidingType = surfaceType;
                }
                same = surfaceType === "l" ? 1 : 3;
                angular = slideObject.pt;
                newECBp = updateECBp(srcECB, slideDatum.midECB, ecbp, newSlidingType, same);
                newTouchingDatum = { kind: "surface", type: surfaceType, index: slideObject.index, pt: angular };
                [newTgtECB, newFinal] = findNextTargetFromSurface(newSrcECB, newECBp, (0, encode_1.surfaceToVec2DArray)(surface), surfaceType, angular);
            }
            else {
                const corner = slideObject.corner;
                angular = slideObject.angular;
                if (angular < 2 && angular > 0) {
                    newSlidingType = "l";
                }
                else if (angular > 2) {
                    newSlidingType = "r";
                }
                [same, other] = getSameAndOther(angular);
                newECBp = updateECBp(srcECB, slideDatum.midECB, ecbp, newSlidingType, same);
                [newTgtECB, newFinal] = findNextTargetFromCorner(newSrcECB, newECBp, corner, angular);
                newTouchingDatum = { kind: "corner", angular: angular };
            }
            if (slideDatum.event === "transfer") {
                output = runSlideRoutine(newSrcECB, newTgtECB, newECBp, playerStatusInfo, labelledSurfaces, newTouchingDatum, {
                    type: newSlidingType,
                    angular: angular
                }, squashed, newFinal, recursionCounter + 1);
            }
            else {
                const otherTgtECB = slideDatum.tgtECB;
                const [squashTgtECB, abort] = agreeOnTargetECB(newSrcECB, otherTgtECB, newTgtECB, newECBp, same, playerStatusInfo.grounded);
                if (abort) {
                    output = { ecb: srcECB, touching: oldTouchingDatum, squashed: squashed };
                }
                else {
                    output = runSlideRoutine(newSrcECB, squashTgtECB, newECBp, playerStatusInfo, labelledSurfaces, newTouchingDatum, {
                        type: newSlidingType,
                        angular: angular
                    }, true, newFinal && final, recursionCounter + 1);
                }
            }
        }
    }
    return output;
}
;
// this function figures out if we can move the ECB, from the source ECB to the target ECB
function slideECB(srcECB, tgtECB, labelledSurfaces, slidingAgainst, playerStatusInfo) {
    let output;
    // figure our whether a collision occured while moving srcECB -> tgtECB
    const touchingDatum = findClosestCollision(srcECB, tgtECB, labelledSurfaces);
    if (touchingDatum === null) {
        //console.log("'slideECB': sliding.");
        output = { event: "continue" };
    }
    else {
        const s = touchingDatum.sweep;
        const r = Math.max(0, s - exports.additionalOffset / 10); // to account for floating point errors
        const midECB = (0, ecbTransform_1.interpolateECB)(srcECB, tgtECB, r);
        const collisionObject = touchingDatum.object;
        // ------------------------------------------------------------------------------------------------------------------------------
        // damaging objects cause premature end to sliding
        let damageType = null;
        if (!playerStatusInfo.immune) {
            if (collisionObject.kind === "surface") {
                const surfaceProperties = collisionObject.surface[2];
                if (surfaceProperties !== null && surfaceProperties !== undefined) {
                    damageType = surfaceProperties.damageType;
                }
            }
            else if (collisionObject.kind === "corner") {
                damageType = collisionObject.damageType;
            }
        }
        if (damageType !== null && damageType !== undefined) {
            if (collisionObject.kind === "surface") {
                //console.log("'slideECB': sliding interrupted by collision with damaging surface.");
                output = {
                    event: "end",
                    finalECB: midECB,
                    touching: {
                        kind: "surface",
                        type: collisionObject.type,
                        index: collisionObject.index,
                        pt: collisionObject.pt,
                        damageType: damageType
                    }
                };
            }
            else {
                //console.log("'slideECB': sliding interrupted by collision with damaging corner.");
                output = {
                    event: "end",
                    finalECB: midECB,
                    touching: {
                        kind: "corner",
                        angular: collisionObject.angular,
                        damageType: damageType
                    }
                };
            }
        }
        // ------------------------------------------------------------------------------------------------------------------------------
        else if (slidingAgainst.type === null) {
            if (collisionObject.kind === "surface") {
                if (collisionObject.type === "g" || collisionObject.type === "p") {
                    //console.log("'slideECB': sliding interrupted by landing.");
                    output = {
                        event: "end",
                        finalECB: midECB,
                        touching: {
                            kind: "surface",
                            type: collisionObject.type,
                            index: collisionObject.index,
                            pt: collisionObject.pt
                        }
                    };
                }
                else {
                    //console.log("'slideECB': beginning slide on surface.");
                    output = {
                        event: "transfer",
                        midECB: midECB,
                        object: {
                            kind: "surface",
                            surface: collisionObject.surface,
                            type: collisionObject.type,
                            pt: collisionObject.pt,
                            index: collisionObject.index
                        }
                    };
                }
            }
            else {
                //console.log("'slideECB': beginning slide on corner.");
                output = {
                    event: "transfer",
                    midECB: midECB,
                    object: {
                        kind: "corner",
                        corner: collisionObject.corner,
                        angular: collisionObject.angular
                    }
                };
            }
        }
        else {
            const slidingType = slidingAgainst.type;
            if (collisionObject.kind === "surface") {
                const surfaceType = collisionObject.type;
                if (surfaceType === slidingType) {
                    //console.log("'slideECB': transferring slide to new surface.");
                    output = {
                        event: "transfer",
                        midECB: midECB,
                        object: {
                            kind: "surface",
                            surface: collisionObject.surface,
                            type: collisionObject.type,
                            pt: collisionObject.pt,
                            index: collisionObject.index
                        }
                    };
                }
                else if (slidingType === "c" || surfaceType === "c" || surfaceType === "g" || surfaceType === "p") {
                    // no way to continue when one of the involved surfaces is a ceiling or a ground
                    //console.log("'slideECB': interrupting sliding because of conflicting surface collision.");
                    output = {
                        event: "end",
                        finalECB: midECB,
                        touching: {
                            kind: "surface",
                            type: collisionObject.type,
                            index: collisionObject.index,
                            pt: collisionObject.pt
                        }
                    };
                }
                else {
                    //console.log("'slideECB': beginning ECB squashing because of conflicting horizontal surface pushout.");
                    output = {
                        event: "squash",
                        midECB: midECB,
                        tgtECB: tgtECB,
                        object: collisionObject,
                        pt: collisionObject.pt
                    };
                }
            }
            else {
                const angularParameter = collisionObject.angular;
                const side = getSameAndOther(angularParameter)[0];
                if (slidingType === "c") {
                    //console.log("'slideECB': interrupting sliding because of conflicting corner collision.");
                    output = {
                        event: "end",
                        finalECB: midECB,
                        touching: {
                            kind: "corner",
                            angular: angularParameter
                        }
                    };
                }
                else if (slidingType === null
                    || (side === 3 && slidingType === "r")
                    || (side === 1 && slidingType === "l")) {
                    //console.log("'slideECB': transferring slide to new corner.");
                    output = {
                        event: "transfer",
                        midECB: midECB, object: {
                            kind: "corner",
                            corner: collisionObject.corner,
                            angular: angularParameter
                        }
                    };
                }
                else {
                    //console.log("'slideECB': beginning ECB squashing because of conflicting horizontal corner pushout.");
                    output = {
                        event: "squash",
                        midECB: midECB,
                        tgtECB: tgtECB,
                        side: side,
                        object: collisionObject
                    };
                }
            }
        }
    }
    return output;
}
;
function findNextTargetFromSurface(srcECB, ecbp, wall, wallType, pt) {
    let wallForward;
    let s = 1;
    let tgtECB = ecbp;
    let pushout = 0;
    let final = true;
    const sign = (wallType === "l" || wallType === "c") ? -1 : 1;
    const additionalPushout = sign * exports.additionalOffset;
    const xOrY = (wallType === "l" || wallType === "r") ? "x" : "y";
    if (wallType === "c") {
        const wallLeft = (0, extremePoint_1.extremePoint)(wall, "l");
        const wallRight = (0, extremePoint_1.extremePoint)(wall, "r");
        if (ecbp[pt].x <= wallRight.x && ecbp[pt].x >= wallLeft.x) {
            const intercept = coordinateIntercept(vLineThrough(ecbp[pt]), wall);
            pushout = intercept.y - ecbp[pt].y;
        }
        else {
            wallForward = ecbp[pt].x < srcECB[pt].x ? wallLeft : wallRight;
            s = (wallForward.x - srcECB[pt].x) / (ecbp[pt].x - srcECB[pt].x);
            s = Math.min(Math.max(s, 0), 1);
            tgtECB = (0, ecbTransform_1.interpolateECB)(srcECB, ecbp, s);
            pushout = wallForward.y - tgtECB[pt].y;
        }
    }
    else {
        const wallBottom = (0, extremePoint_1.extremePoint)(wall, "b");
        const wallTop = (0, extremePoint_1.extremePoint)(wall, "t");
        if (ecbp[pt].y <= wallTop.y && ecbp[pt].y >= wallBottom.y) {
            const intercept = coordinateIntercept(hLineThrough(ecbp[pt]), wall);
            pushout = intercept.x - ecbp[pt].x;
        }
        else {
            wallForward = ecbp[pt].y < srcECB[pt].y ? wallBottom : wallTop;
            s = (wallForward.y - srcECB[pt].y) / (ecbp[pt].y - srcECB[pt].y);
            s = Math.min(Math.max(s, 0), 1);
            tgtECB = (0, ecbTransform_1.interpolateECB)(srcECB, ecbp, s);
            pushout = wallForward.x - tgtECB[pt].x;
        }
    }
    if (s < 1 || sign * pushout < 0) {
        final = false;
    }
    tgtECB = (0, ecbTransform_1.moveECB)(tgtECB, (0, Vec2D_1.putXOrYCoord)(pushout + additionalPushout, xOrY));
    (0, drawECB_1.drawECB)(ecbp, "#8f54ff");
    (0, drawECB_1.drawECB)(tgtECB, "#35f4ab");
    return [tgtECB, final];
}
;
function findNextTargetFromCorner(srcECB, ecbp, corner, angularParameter) {
    const [same, other] = getSameAndOther(angularParameter);
    const LRSign = (same === 1) ? -1 : 1;
    const UDSign = (other === 2) ? -1 : 1;
    const additionalPushout = LRSign * exports.additionalOffset;
    let tgtECB = ecbp;
    let s = 1;
    let pushout = 0;
    let final = true;
    if (UDSign * ecbp[same].y < UDSign * corner.y) {
        s = (corner.y - srcECB[same].y) / (ecbp[same].y - srcECB[same].y);
        s = Math.min(Math.max(s, 0), 1);
        tgtECB = (0, ecbTransform_1.interpolateECB)(srcECB, ecbp, s);
        pushout = corner.x - tgtECB[same].x;
    }
    else if (UDSign * ecbp[other].y < UDSign * corner.y) {
        const intercept = coordinateIntercept(hLineThrough(corner), [ecbp[same], ecbp[other]]);
        pushout = corner.x - intercept.x + additionalPushout;
    }
    else {
        s = (corner.y - srcECB[other].y) / (ecbp[other].y - srcECB[other].y);
        s = Math.min(Math.max(s, 0), 1);
        tgtECB = (0, ecbTransform_1.interpolateECB)(srcECB, ecbp, s);
        pushout = corner.x - tgtECB[other].x;
    }
    if (s < 1 || LRSign * pushout < 0) {
        final = false;
    }
    tgtECB = (0, ecbTransform_1.moveECB)(tgtECB, (0, Vec2D_1.putXOrYCoord)(pushout + additionalPushout, "x"));
    (0, drawECB_1.drawECB)(ecbp, "#1098c9");
    (0, drawECB_1.drawECB)(tgtECB, "#5cbc12");
    return [tgtECB, final];
}
;
function updateECBp(startECB, endECB, ecbp, slidingType, pt) {
    if (slidingType === null) {
        return ecbp;
    }
    else {
        let xOrY = (slidingType === "l" || slidingType === "r") ? "y" : "x";
        let t;
        if ((0, Vec2D_1.getXOrYCoord)(ecbp[pt], xOrY) - (0, Vec2D_1.getXOrYCoord)(startECB[pt], xOrY) === 0) {
            xOrY = xOrY === "x" ? "y" : "x";
            if ((0, Vec2D_1.getXOrYCoord)(ecbp[pt], xOrY) - (0, Vec2D_1.getXOrYCoord)(startECB[pt], xOrY) === 0) {
                t = 1;
            }
            else {
                t = ((0, Vec2D_1.getXOrYCoord)(endECB[pt], xOrY) - (0, Vec2D_1.getXOrYCoord)(startECB[pt], xOrY))
                    / ((0, Vec2D_1.getXOrYCoord)(ecbp[pt], xOrY) - (0, Vec2D_1.getXOrYCoord)(startECB[pt], xOrY));
            }
        }
        else {
            t = ((0, Vec2D_1.getXOrYCoord)(endECB[pt], xOrY) - (0, Vec2D_1.getXOrYCoord)(startECB[pt], xOrY))
                / ((0, Vec2D_1.getXOrYCoord)(ecbp[pt], xOrY) - (0, Vec2D_1.getXOrYCoord)(startECB[pt], xOrY));
        }
        let midECB;
        if (t <= 0) {
            midECB = startECB;
        }
        else if (t >= 1) {
            midECB = ecbp;
        }
        else {
            midECB = (0, ecbTransform_1.interpolateECB)(startECB, ecbp, t);
        }
        return [(0, linAlg_1.add)(ecbp[0], (0, linAlg_1.subtract)(endECB[0], midECB[0])),
            (0, linAlg_1.add)(ecbp[1], (0, linAlg_1.subtract)(endECB[1], midECB[1])),
            (0, linAlg_1.add)(ecbp[2], (0, linAlg_1.subtract)(endECB[2], midECB[2])),
            (0, linAlg_1.add)(ecbp[3], (0, linAlg_1.subtract)(endECB[3], midECB[3]))
        ];
    }
}
;
// this function gets called when two walls (or corners) are trying to push horizontally in opposite directions
// this function computes a squashed ECB that will fit in between the two objects that are squeezing it
function agreeOnTargetECB(srcECB, fstTgtECB, sndTgtECB, ecbp, pt, grounded) {
    let output;
    const flipPt = pt === 1 ? 3 : 1;
    const [closestTgtECB, furthestTgtECB, same] = (Math.abs(fstTgtECB[pt].y - srcECB[pt].y) < Math.abs(sndTgtECB[flipPt].y - srcECB[flipPt].y))
        ? ([fstTgtECB, sndTgtECB, pt])
        : ([sndTgtECB, fstTgtECB, flipPt]);
    const diff = same === 1 ? 3 : 1;
    let otherTgtECB;
    if (furthestTgtECB[diff].y === srcECB[diff].y) {
        otherTgtECB = furthestTgtECB;
    }
    else {
        const t = (closestTgtECB[same].y - srcECB[same].y) / (furthestTgtECB[diff].y - srcECB[diff].y);
        if (t <= 0) {
            otherTgtECB = srcECB;
        }
        else if (t >= 1) {
            otherTgtECB = furthestTgtECB;
        }
        else {
            otherTgtECB = (0, ecbTransform_1.interpolateECB)(srcECB, furthestTgtECB, t);
        }
    }
    const tgtECB = [new Vec2D_1.Vec2D(0, 0), new Vec2D_1.Vec2D(0, 0), new Vec2D_1.Vec2D(0, 0), new Vec2D_1.Vec2D(0, 0)]; // initialising
    let abort;
    let squashFactor = 1;
    const sign = Math.sign(closestTgtECB[same].x - closestTgtECB[diff].x);
    // ideally we would now squash the ECB, so that it has side points otherTgtECB[same] and closestTgtECB[diff]
    // however we can't do that if these points are too close together, or, even worse, have moved past eachother
    if (Math.abs(otherTgtECB[same].x - closestTgtECB[diff].x) > exports.smallestECBWidth
        && Math.sign(otherTgtECB[same].x - closestTgtECB[diff].x) === sign) {
        if (Math.abs(otherTgtECB[same].x - closestTgtECB[diff].x) > Math.abs(closestTgtECB[same].x - closestTgtECB[diff].x)) {
            abort = false;
            console.log("'agreeOnTargetECB' warning: function called when no squashing was required.");
            output = [closestTgtECB, abort];
        }
        else {
            abort = false;
            squashFactor = (otherTgtECB[same].x - closestTgtECB[diff].x) / (closestTgtECB[same].x - closestTgtECB[diff].x);
            tgtECB[same] = new Vec2D_1.Vec2D(otherTgtECB[same].x - sign * exports.additionalOffset, otherTgtECB[same].y);
            tgtECB[diff] = new Vec2D_1.Vec2D(closestTgtECB[diff].x + sign * exports.additionalOffset, closestTgtECB[diff].y);
            tgtECB[2].y = tgtECB[same].y + squashFactor * (closestTgtECB[2].y - closestTgtECB[same].y);
            tgtECB[0].y = grounded ? srcECB[0].y : tgtECB[same].y + squashFactor * (closestTgtECB[0].y - closestTgtECB[same].y);
            tgtECB[2].x = (tgtECB[1].x + tgtECB[3].x) / 2;
            tgtECB[0].x = (tgtECB[1].x + tgtECB[3].x) / 2;
            output = [tgtECB, abort];
        }
    }
    else {
        // can't directly squash, so we need to find the closest allowable height
        const sameLine = [srcECB[same], otherTgtECB[same]];
        const diffLine = [srcECB[diff], closestTgtECB[diff]];
        const offsetDiffLine = [(0, linAlg_1.add)(diffLine[0], new Vec2D_1.Vec2D(sign * exports.smallestECBWidth, 0)),
            (0, linAlg_1.add)(diffLine[1], new Vec2D_1.Vec2D(sign * exports.smallestECBWidth, 0))];
        const intercept = coordinateIntercept(sameLine, offsetDiffLine);
        if (Math.abs(closestTgtECB[same].y - srcECB[same].y) >= Math.abs(intercept.y - srcECB[same].y)) {
            abort = true;
            tgtECB[same] = new Vec2D_1.Vec2D(intercept.x + sign * exports.additionalOffset, intercept.y);
            tgtECB[diff] = new Vec2D_1.Vec2D(intercept.x - sign * exports.smallestECBWidth - sign * exports.additionalOffset, intercept.y);
            squashFactor = (tgtECB[same].x - tgtECB[diff].x) / (closestTgtECB[same].x - closestTgtECB[diff].x);
            tgtECB[2].y = tgtECB[same].y + squashFactor * (closestTgtECB[2].y - closestTgtECB[same].y);
            tgtECB[0].y = grounded ? srcECB[0].y : tgtECB[same].y + squashFactor * (closestTgtECB[0].y - closestTgtECB[same].y);
            tgtECB[2].x = (tgtECB[1].x + tgtECB[3].x) / 2;
            tgtECB[0].x = (tgtECB[1].x + tgtECB[3].x) / 2;
            output = [tgtECB, abort];
        }
        else {
            abort = false;
            squashFactor = (otherTgtECB[same].x - closestTgtECB[diff].x - 2 * sign * exports.additionalOffset) / (closestTgtECB[same].x - closestTgtECB[diff].x);
            if (squashFactor >= 1) {
                output = [closestTgtECB, abort];
            }
            else {
                tgtECB[same] = new Vec2D_1.Vec2D(otherTgtECB[same].x - sign * exports.additionalOffset, otherTgtECB[same].y);
                tgtECB[diff] = new Vec2D_1.Vec2D(closestTgtECB[diff].x + sign * exports.additionalOffset, closestTgtECB[diff].y);
                tgtECB[2].y = tgtECB[same].y + squashFactor * (closestTgtECB[2].y - closestTgtECB[same].y);
                tgtECB[0].y = grounded ? srcECB[0].y : tgtECB[same].y + squashFactor * (closestTgtECB[0].y - closestTgtECB[same].y);
                tgtECB[2].x = (tgtECB[1].x + tgtECB[3].x) / 2;
                tgtECB[0].x = (tgtECB[1].x + tgtECB[3].x) / 2;
                output = [tgtECB, abort];
            }
        }
    }
    (0, drawECB_1.drawECB)(tgtECB, "#f9482c");
    return output;
}
// ----------------------------------------------------------------------------------------------------------------------------------
// convert between angular parameters and "same/other" data
function getAngularParameter(t, same, other) {
    if (same === 3 && other === 0) {
        return ((1 - t) * 3 + t * 4);
    }
    else if (same === 0 && other === 3) {
        return ((1 - t) * 4 + t * 3);
    }
    else {
        return ((1 - t) * same + t * other);
    }
}
;
function getSameAndOther(a) {
    if (a < 1) {
        return [1, 0];
    }
    else if (a < 2) {
        return [1, 2];
    }
    else if (a < 3) {
        return [3, 2];
    }
    else {
        return [3, 0];
    }
}
;
// ----------------------------------------------------------------------------------------------------------------------------------
// function to check whether grounded movement is permissible (no low ceilings)
function moveAlongGround(pos, posNext, ecbHeight, ground, ceilings) {
    if (pos.x === posNext.x) {
        return null;
    }
    else {
        const dir = posNext.x < pos.x ? "l" : "r";
        const groundLeft = (0, extremePoint_1.extremePoint)(ground, "l");
        const groundRight = (0, extremePoint_1.extremePoint)(ground, "r");
        if ((dir === "l" && pos.x < groundLeft.x)
            || (dir === "r" && pos.x > groundRight.x)) {
            return null;
        }
        else {
            const start = dir === "l" ? Math.min(pos.x, groundRight.x) : Math.max(pos.x, groundLeft.x);
            const end = dir === "l" ? Math.max(posNext.x, groundLeft.x) : Math.min(posNext.x, groundRight.x);
            const groundStart = coordinateIntercept((0, encode_1.surfaceToVec2DArray)(ground), vLineAt(start));
            const groundEnd = coordinateIntercept((0, encode_1.surfaceToVec2DArray)(ground), vLineAt(end));
            let startECB = (0, ecbTransform_1.makeECB)(groundStart, exports.additionalOffset, exports.smallestECBHeight);
            let endECB = (0, ecbTransform_1.makeECB)(groundEnd, exports.additionalOffset, exports.smallestECBHeight);
            const labelledCeilings = (0, zipLabels_1.zipLabels)(ceilings, "c"); // should not recalculate this every time...
            let firstCeilingCollision = findClosestCollision(startECB, endECB, labelledCeilings);
            if (firstCeilingCollision === null) {
                if (ecbHeight > exports.smallestECBHeight) {
                    return null;
                }
                else {
                    // do a second collision check, in case the player squeezed themselves into a location they should not have
                    startECB = (0, ecbTransform_1.makeECB)(groundStart, exports.additionalOffset / 10, ecbHeight);
                    endECB = (0, ecbTransform_1.makeECB)(groundEnd, exports.additionalOffset / 10, ecbHeight);
                    firstCeilingCollision = findClosestCollision(startECB, endECB, labelledCeilings);
                    if (firstCeilingCollision === null || firstCeilingCollision.object.kind === "corner") {
                        return null;
                    }
                    else {
                        const ceiling = firstCeilingCollision.object.surface;
                        // find where to reposition the player by intersecting the offset ground with the ceiling
                        const intercept = coordinateIntercept((0, encode_1.surfaceToVec2DArray)(ceiling), [(0, linAlg_1.add)(groundStart, new Vec2D_1.Vec2D(0, exports.smallestECBHeight)), (0, linAlg_1.add)(groundEnd, new Vec2D_1.Vec2D(0, exports.smallestECBHeight))]);
                        /*
                         if ((dir === "l" && intercept.x > pos.x) || (dir === "r" && intercept.x < pos.x)) {
                         return pos.x;
                         }
                         else {
                         return intercept.x;
                         }
                         */
                        return intercept.x + (dir === "l" ? exports.additionalOffset : -exports.additionalOffset);
                    }
                }
            }
            else {
                const s = firstCeilingCollision.sweep;
                return (1 - s) * pos.x + s * posNext.x + (dir === "l" ? exports.additionalOffset : -exports.additionalOffset);
            }
        }
    }
}
// ----------------------------------------------------------------------------------------------------------------------------------
// ECB squashing and re-inflating
// finds the ECB squash factor for a grounded ECB
function groundedECBSquashFactor(ecbTop, ecbBottom, ceilings) {
    const ceilingYValues = ceilings.map((ceil) => {
        if (ecbTop.x < (0, extremePoint_1.extremePoint)(ceil, "l").x || ecbTop.x > (0, extremePoint_1.extremePoint)(ceil, "r").x) {
            return null;
        }
        else {
            return coordinateIntercept([ecbBottom, ecbTop], ceil).y;
        }
    });
    const lowestCeilingYValue = (0, findSmallestWithin_1.findSmallestWithin)(ceilingYValues, ecbBottom.y, ecbTop.y);
    const offset = exports.additionalOffset / 10;
    if (lowestCeilingYValue === null) {
        return null;
    }
    else {
        return (Math.max(offset, (lowestCeilingYValue - ecbBottom.y) / (ecbTop.y - ecbBottom.y) - offset));
    }
}
;
// finds the ECB squash factor by inflating the ECB from the point on the ECB given by the angular parameter t
// if angular parameter is null, instead inflates the ECB from its center
function inflateECB(ecb, t, focus, relevantSurfaces) {
    const offset = exports.additionalOffset / 10;
    const pointlikeECB = [new Vec2D_1.Vec2D(focus.x, focus.y - offset),
        new Vec2D_1.Vec2D(focus.x + offset, focus.y),
        new Vec2D_1.Vec2D(focus.x, focus.y + offset),
        new Vec2D_1.Vec2D(focus.x - offset, focus.y)
    ];
    const closestCollision = findClosestCollision(pointlikeECB, ecb, relevantSurfaces);
    if (closestCollision === null) {
        return { location: t, factor: 1 };
    }
    else {
        const newLocation = t === null
            ? closestCollision.object.kind === "surface"
                ? closestCollision.object.pt
                : closestCollision.object.angular
            : t;
        return { location: newLocation, factor: Math.max(exports.additionalOffset, closestCollision.sweep - exports.additionalOffset) }; // ECB angular parameter, sweeping parameter
    }
}
function reinflateECB(ecb, position, relevantSurfaces, oldecbSquashDatum, grounded) {
    let q = 1;
    const angularParameter = oldecbSquashDatum.location;
    if (oldecbSquashDatum.factor < 1) {
        q = 1 / oldecbSquashDatum.factor + exports.additionalOffset / 20;
        const focus = (0, ecbTransform_1.ecbFocusFromAngularParameter)(ecb, angularParameter);
        const fullsizeecb = [new Vec2D_1.Vec2D(q * ecb[0].x + (1 - q) * focus.x, q * ecb[0].y + (1 - q) * focus.y),
            new Vec2D_1.Vec2D(q * ecb[1].x + (1 - q) * focus.x, q * ecb[1].y + (1 - q) * focus.y),
            new Vec2D_1.Vec2D(q * ecb[2].x + (1 - q) * focus.x, q * ecb[2].y + (1 - q) * focus.y),
            new Vec2D_1.Vec2D(q * ecb[3].x + (1 - q) * focus.x, q * ecb[3].y + (1 - q) * focus.y)
        ];
        const ecbSquashDatum = inflateECB(fullsizeecb, angularParameter, focus, relevantSurfaces);
        const squashedecb = (0, ecbTransform_1.squashECBAt)(fullsizeecb, { factor: ecbSquashDatum.factor, location: angularParameter });
        const newPosition = new Vec2D_1.Vec2D(position.x + squashedecb[0].x - ecb[0].x, grounded ? position.y : position.y + squashedecb[0].y - ecb[0].y);
        const newAngular = ecbSquashDatum.location;
        (0, drawECB_1.drawECB)(squashedecb, "#ffff00");
        return [newPosition, ecbSquashDatum, squashedecb];
    }
    else {
        return [position, { location: angularParameter, factor: 1 }, ecb];
    }
}
;
// recall: type PlayerStatusInfo = { grounded :boolean, ignoringPlatforms :boolean, immune :boolean };
// this function initialises necessary data and then calls the main collision routine loop
function runCollisionRoutine(ecb1, ecbp, position, ecbSquashDatum, playerStatusInfo, stage) {
    // --------------------------------------------------------------
    // BELOW: this is recomputed every frame and should be avoided
    const stageWalls = (0, zipLabels_1.zipLabels)(stage.wallL, "l").concat((0, zipLabels_1.zipLabels)(stage.wallR, "r"));
    const stageGrounds = (0, zipLabels_1.zipLabels)(stage.ground, "g");
    const stageCeilings = (0, zipLabels_1.zipLabels)(stage.ceiling, "c");
    const stagePlatforms = (0, zipLabels_1.zipLabels)(stage.platform, "p");
    // ABOVE: this is recomputed every frame and should be avoided
    // --------------------------------------------------------------
    const grounded = playerStatusInfo.grounded;
    let horizIgnore = "none"; // ignore no horizontal surfaces by default
    if (grounded) {
        horizIgnore = "all"; // ignore all horizontal surfaces when grounded
    }
    else {
        horizIgnore = playerStatusInfo.ignoringPlatforms ? "platforms" : "none";
    }
    const allSurfacesMinusPlatforms = stageWalls.concat(stageGrounds).concat(stageCeilings);
    let relevantSurfaces = [];
    switch (horizIgnore) {
        case "platforms":
            relevantSurfaces = stageWalls.concat(stageGrounds).concat(stageCeilings);
            break;
        case "none":
        default:
            relevantSurfaces = stageWalls.concat(stageGrounds).concat(stageCeilings).concat(stagePlatforms);
            break;
        case "all":
            relevantSurfaces = stageWalls;
            break;
    }
    const resolution = resolveECB(ecb1, ecbp, playerStatusInfo, relevantSurfaces);
    const newTouching = resolution.touching;
    let newECBp = resolution.ecb;
    const newSquashFactor = resolution.squashed ? Math.min(1, (newECBp[1].x - newECBp[3].x) / (ecbp[1].x - ecbp[3].x))
        : 1;
    let newSquashLocation = null;
    if (newTouching !== null) {
        if (newTouching.kind === "surface") {
            newSquashLocation = newTouching.pt;
        }
        else {
            newSquashLocation = newTouching.angular;
        }
    }
    let newSquashDatum = { location: newSquashLocation, factor: newSquashFactor };
    newSquashDatum.factor *= ecbSquashDatum.factor;
    let newPosition = (0, linAlg_1.subtract)((0, linAlg_1.add)(position, newECBp[0]), ecbp[0]);
    if (newSquashDatum.factor < 1) {
        let squashingLocation = null;
        if (grounded) {
            squashingLocation = 0;
        }
        [newPosition,
            newSquashDatum,
            newECBp] = reinflateECB(newECBp, newPosition, allSurfacesMinusPlatforms, { factor: newSquashDatum.factor, location: squashingLocation }, grounded);
        if (!grounded && newSquashDatum.factor < 1) {
            // reinflate a second time if it might help
            [newPosition, newSquashDatum, newECBp] = reinflateECB(newECBp, newPosition, allSurfacesMinusPlatforms, newSquashDatum, false);
        }
    }
    return { position: newPosition, touching: newTouching, squashDatum: newSquashDatum, ecb: newECBp };
}
;
