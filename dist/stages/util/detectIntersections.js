"use strict";
// @flow
/*eslint indent:0*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.intersectsAny = intersectsAny;
exports.distanceToLine = distanceToLine;
exports.distanceToPolygon = distanceToPolygon;
exports.lineDistanceToLines = lineDistanceToLines;
const Vec2D_1 = require("../../main/util/Vec2D");
const environmentalCollision_1 = require("../../physics/environmentalCollision");
const linAlg_1 = require("../../main/linAlg");
const extremePoint_1 = require("./extremePoint");
function intersectsAny(newLine, lines) {
    for (let i = 0; i < lines.length; i++) {
        if (intersects(newLine, lines[i])) {
            return true;
        }
    }
    return false;
}
function intersects(line1, line2) {
    const t1 = (0, environmentalCollision_1.coordinateInterceptParameter)(line1, line2);
    const t2 = (0, environmentalCollision_1.coordinateInterceptParameter)(line2, line1);
    if (isNaN(t1) || isNaN(t2) || t1 === Infinity || t2 === Infinity || t1 < 0 || t2 < 0 || t1 > 1 || t2 > 1) {
        return false;
    }
    else {
        return true;
    }
}
function isInside(point, lines) {
    const pt = new Vec2D_1.Vec2D(point.x + 0.001, point.y);
    const atInfinity = new Vec2D_1.Vec2D(point.x + 0.001, point.y + 100000);
    return !evenNumberOfTrue(lines.map((line) => intersects(line, [pt, atInfinity])));
}
function evenNumberOfTrue(list) {
    if (list.length < 1) {
        return true;
    }
    else {
        const [head, ...tail] = list;
        if (head === true) {
            return !evenNumberOfTrue(tail);
        }
        else {
            return evenNumberOfTrue(tail);
        }
    }
}
function distanceToLines(point, lines) {
    if (isInside(point, lines)) {
        return -1;
    }
    else {
        return minimum(lines.map((line) => distanceToLine(point, line)));
    }
}
function distanceToLine(point, line) {
    if ((0, linAlg_1.euclideanDist)(line[0], line[1]) < 0.001) {
        return (0, linAlg_1.euclideanDist)(point, line[0]);
    }
    else {
        const projectedPoint = (0, linAlg_1.orthogonalProjection)(point, line);
        const lineRight = (0, extremePoint_1.extremePoint)(line, "r");
        const lineLeft = (0, extremePoint_1.extremePoint)(line, "l");
        const lineTop = (0, extremePoint_1.extremePoint)(line, "t");
        const lineBot = (0, extremePoint_1.extremePoint)(line, "b");
        if (projectedPoint.x > lineRight.x) {
            return (0, linAlg_1.euclideanDist)(point, lineRight);
        }
        else if (projectedPoint.x < lineLeft.x) {
            return (0, linAlg_1.euclideanDist)(point, lineLeft);
        }
        else if (projectedPoint.y > lineTop.y) {
            return (0, linAlg_1.euclideanDist)(point, lineTop);
        }
        else if (projectedPoint.y < lineBot.y) {
            return (0, linAlg_1.euclideanDist)(point, lineBot);
        }
        else {
            return (0, linAlg_1.euclideanDist)(point, projectedPoint);
        }
    }
}
function minimum(numbers) {
    if (numbers.length < 1) {
        return Infinity;
    }
    else {
        const [head, ...tail] = numbers;
        const next = minimum(tail);
        if (head < next) {
            return head;
        }
        else {
            return next;
        }
    }
}
function distanceToPolygon(point, polygon) {
    return distanceToLines(point, linesOfPolygon(polygon));
}
function linesOfPolygon(polygon) {
    const lg = polygon.length;
    let pt = polygon[lg - 1];
    const lines = [];
    for (let i = 0; i < polygon.length; i++) {
        lines.push([pt, polygon[i]]);
        pt = polygon[i];
    }
    return lines;
}
function distanceBetweenLines(line1, line2) {
    if (intersects(line1, line2)) {
        return 0;
    }
    else {
        return minimum([distanceToLine(line1[0], line2),
            distanceToLine(line1[1], line2),
            distanceToLine(line2[0], line1),
            distanceToLine(line2[1], line1)
        ]);
    }
}
function lineDistanceToLines(thisLine, otherLines) {
    return minimum(otherLines.map((otherLine) => distanceBetweenLines(thisLine, otherLine)));
}
