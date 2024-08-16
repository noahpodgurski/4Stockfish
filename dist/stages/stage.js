"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSurfaceFromStage = getSurfaceFromStage;
function getSurfaceFromStage(surfaceTypeAndIndex, stage) {
    const surfaceType = surfaceTypeAndIndex[0];
    const surfaceIndex = surfaceTypeAndIndex[1];
    switch (surfaceType) {
        case "l":
            return stage.wallL[surfaceIndex];
        case "r":
            return stage.wallR[surfaceIndex];
        case "p":
            return stage.platform[surfaceIndex];
        case "g":
        default:
            return stage.ground[surfaceIndex];
        case "c":
            return stage.ceiling[surfaceIndex];
    }
}
;
