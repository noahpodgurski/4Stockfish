"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotProd = dotProd;
exports.scalarProd = scalarProd;
exports.norm = norm;
exports.add = add;
exports.subtract = subtract;
exports.euclideanDist = euclideanDist;
exports.manhattanDist = manhattanDist;
exports.orthogonalProjection = orthogonalProjection;
exports.inverseMatrix = inverseMatrix;
exports.multMatVect = multMatVect;
exports.reflect = reflect;
const Vec2D_1 = require("./util/Vec2D");
function dotProd(vec1, vec2) {
    return (vec1.x * vec2.x + vec1.y * vec2.y);
}
;
function scalarProd(lambda, vec) {
    return (new Vec2D_1.Vec2D(lambda * vec.x, lambda * vec.y));
}
;
function norm(vec) {
    return (Math.sqrt(dotProd(vec, vec)));
}
function add(vec1, vec2) {
    return (new Vec2D_1.Vec2D(vec1.x + vec2.x, vec1.y + vec2.y));
}
function subtract(vec1, vec2) {
    return (new Vec2D_1.Vec2D(vec1.x - vec2.x, vec1.y - vec2.y));
}
function squaredDist(center1, center2) {
    return ((center2.x - center1.x) * (center2.x - center1.x) + (center2.y - center1.y) * (center2.y - center1.y));
}
;
function euclideanDist(center1, center2) {
    const sqDist = squaredDist(center1, center2);
    return sqDist <= 0 ? 0 : Math.sqrt(sqDist);
}
function manhattanDist(center1, center2) {
    return (Math.abs(center2.x - center1.x) + Math.abs(center2.y - center1.y));
}
;
// orthogonally projects a point onto a line
// line is given by two points it passes through
function orthogonalProjection(point, line) {
    const line0 = line[0];
    const [line0x, line0y] = [line0.x, line0.y];
    if (line0x === line[1].x && line0y === line[1].y) {
        console.log("error in function 'orthogonalProjection', line reduced to a point.");
        return line0;
    }
    else {
        // turn everything into relative coordinates with respect to the point line[0]
        const pointVec = new Vec2D_1.Vec2D(point.x - line0x, point.y - line0y);
        const lineVec = new Vec2D_1.Vec2D(line[1].x - line0x, line[1].y - line0y);
        // renormalise line vector
        const lineNorm = norm(lineVec);
        const lineElem = scalarProd(1 / lineNorm, lineVec);
        // vector projection calculation
        const factor = dotProd(pointVec, lineElem);
        const projVec = scalarProd(factor, lineElem);
        // back to absolute coordinates by adding the coordinates of line[0]
        return (new Vec2D_1.Vec2D(projVec.x + line0x, projVec.y + line0y));
    }
}
;
// Computes the inverse of a 2x2 matrix.
function inverseMatrix([[x1, x2], [y1, y2]]) {
    const det = x1 * y2 - x2 * y1;
    if (Math.abs(det) < 0.00001) {
        console.log("error in inverseMatrix: determinant too small");
        return null;
    }
    else {
        return [
            [y2 / det, -x2 / det],
            [-y1 / det, x1 / det]
        ];
    }
}
;
// Multiplication Av (A a 2x2 matrix, v a 2x1 column vector)
// Return type: [xnew,ynew]
function multMatVect([[x1, x2], [y1, y2]], [x, y]) {
    return [x1 * x + x2 * y, y1 * x + y2 * y];
}
;
function reflect(reflectee, reflector) {
    const projVec = orthogonalProjection(reflectee, [new Vec2D_1.Vec2D(0, 0), reflector]);
    const moveVec = subtract(projVec, reflectee);
    return add(reflectee, scalarProd(2, moveVec));
}
