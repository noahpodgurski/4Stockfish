"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawECB = drawECB;
const main_1 = require("../main");
const activeStage_1 = require("../../stages/activeStage");
function drawECB(ecb, color) {
    main_1.fg2.strokeStyle = color;
    main_1.fg2.lineWidth = 1;
    main_1.fg2.beginPath();
    main_1.fg2.moveTo((ecb[0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (ecb[0].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
    main_1.fg2.lineTo((ecb[1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (ecb[1].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
    main_1.fg2.lineTo((ecb[2].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (ecb[2].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
    main_1.fg2.lineTo((ecb[3].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (ecb[3].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
    main_1.fg2.closePath();
    main_1.fg2.stroke();
}
;
