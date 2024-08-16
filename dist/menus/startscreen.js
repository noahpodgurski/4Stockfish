"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.circlePos = exports.mlDir = exports.mlPos = exports.mlVel = exports.angles = exports.angR = exports.angB = void 0;
exports.drawStartScreenInit = drawStartScreenInit;
exports.drawStartScreen = drawStartScreen;
const main_1 = require("main/main");
const render_1 = require("main/render");
/* eslint-disable */
exports.angB = 0;
exports.angR = 0;
exports.angles = [0, Math.PI];
exports.mlVel = 0;
exports.mlPos = 0;
exports.mlDir = 1;
exports.circlePos = [[200, 0, 0.4, 1, 200], [600, 240, 0.21, 1, 250], [10, 600, 0.7, -1, 150], [350, 500, 0.65, -1, 270], [1000, 50, 0.9, 1, 200], [900, 400, 0.1, -1, 260]];
const lightDust = [];
for (var k = 0; k < 20; k++) {
    lightDust[k] = [Math.random() * 3 + 2, 330 + (k * 26 + 26 * Math.random()), 520, 0.2];
}
function drawStartScreenInit() {
    var _a, _b, _c, _d;
    main_1.bg1.fillStyle = "rgba(46, 8, 154, 1)";
    var grd = main_1.bg1.createRadialGradient(600, 375, 5, 600, 375, 750);
    grd.addColorStop(0, "#27005b");
    grd.addColorStop(0.25, "#2b0170");
    grd.addColorStop(0.5, "#2b005b");
    grd.addColorStop(0.75, "#35005b");
    grd.addColorStop(1, "#38005b");
    main_1.bg1.fillStyle = grd;
    main_1.bg1.fillRect(0, 0, (_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    main_1.bg1.save();
    main_1.bg1.scale(1.5, 1);
    main_1.bg1.shadowBlur = 60;
    main_1.bg1.shadowColor = "rgba(147, 14, 42, 1)";
    main_1.bg1.shadowOffsetX = -3150;
    main_1.bg1.fillStyle = "rgba(147, 14, 42, 0.5)";
    main_1.bg1.translate(2440, 380);
    var ang = 0;
    for (var i = 0; i < 10; i++) {
        main_1.bg1.beginPath();
        main_1.bg1.arc(0, 0, 720, ang, ang + Math.PI / 20);
        main_1.bg1.lineTo(0, 0);
        main_1.bg1.closePath();
        main_1.bg1.fill();
        ang += Math.PI / 5;
    }
    main_1.bg1.restore();
}
function drawStartScreen() {
    var _a, _b, _c, _d;
    (0, main_1.clearScreen)();
    main_1.bg2.save();
    main_1.bg2.lineWidth = 60;
    main_1.bg2.strokeStyle = "rgba(92, 18, 18, 0.2)";
    for (var j = 0; j < 6; j++) {
        exports.circlePos[j][0] += exports.circlePos[j][2] * exports.circlePos[j][3];
        exports.circlePos[j][1] += exports.circlePos[j][2] * exports.circlePos[j][3];
        if (exports.circlePos[j][0] > 1300 || exports.circlePos[j][1] > 850) {
            exports.circlePos[j][0] -= 1;
            exports.circlePos[j][1] -= 1;
            exports.circlePos[j][3] *= -1;
        }
        if (exports.circlePos[j][0] < -100 || exports.circlePos[j][1] < -100) {
            exports.circlePos[j][0] += 1;
            exports.circlePos[j][1] += 1;
            exports.circlePos[j][3] *= -1;
        }
        main_1.bg2.beginPath();
        main_1.bg2.arc(Math.round(exports.circlePos[j][0]), Math.round(exports.circlePos[j][1]), exports.circlePos[j][4], 0, render_1.twoPi);
        main_1.bg2.closePath();
        main_1.bg2.stroke();
    }
    main_1.bg2.restore();
    main_1.bg2.save();
    main_1.bg2.fillStyle = "#333236";
    main_1.bg2.translate(600, 375);
    exports.angB += 0.001;
    var ang = exports.angB;
    for (var i = 0; i < 30; i++) {
        main_1.bg2.beginPath();
        main_1.bg2.arc(0, 0, 720, ang, ang + Math.PI / 30);
        main_1.bg2.lineTo(0, 0);
        main_1.bg2.closePath();
        main_1.bg2.fill();
        ang += Math.PI / 15;
    }
    main_1.bg2.restore();
    var grd = main_1.bg2.createRadialGradient(600, 375, 5, 600, 375, 300);
    grd.addColorStop(0, "rgb(51, 51, 51)");
    grd.addColorStop(1, "rgba(51, 51, 51, 0)");
    main_1.bg2.fillStyle = grd;
    main_1.bg2.fillRect(0, 0, (_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG2) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG2) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    main_1.bg2.save();
    main_1.bg2.lineWidth = 3;
    main_1.bg2.strokeStyle = "rgba(149, 255, 131, 0.12)";
    main_1.bg2.scale(1.3, 1.1);
    var rad = 20;
    for (var n = 0; n < 15; n++) {
        main_1.bg2.beginPath();
        main_1.bg2.arc(515, 530 + n * 10, rad, 0, render_1.twoPi);
        main_1.bg2.closePath();
        main_1.bg2.stroke();
        rad += 30 + n * 5;
    }
    main_1.bg2.restore();
    main_1.bg2.save();
    main_1.bg2.lineWidth = 3;
    main_1.bg2.strokeStyle = "rgba(149, 255, 131, 0.12)";
    main_1.bg2.translate(670, 580);
    exports.angR += 0.001;
    main_1.bg2.rotate(exports.angR);
    var ang = 0;
    main_1.bg2.beginPath();
    for (var m = 0; m < 25; m++) {
        ang += Math.PI / 12;
        main_1.bg2.moveTo(0, 0);
        main_1.bg2.lineTo(0, 850);
        main_1.bg2.rotate(ang);
    }
    main_1.bg2.stroke();
    main_1.bg2.restore();
    main_1.ui.save();
    main_1.ui.strokeStyle = "rgba(0, 0, 0, 0.3)";
    main_1.ui.strokeStyle = "rgba(255, 255, 255, 0.6)";
    main_1.ui.lineWidth = 5;
    main_1.ui.globalCompositeOperation = "xor";
    var bgGrad = main_1.ui.createLinearGradient(0, 200, 0, 390);
    bgGrad.addColorStop(0, "rgba(0, 0, 0, 1)");
    bgGrad.addColorStop(1, "rgba(0, 0, 0, 0.5)");
    main_1.ui.fillStyle = bgGrad;
    main_1.ui.textAlign = "center";
    main_1.ui.font = "900 250px Arial";
    main_1.ui.strokeText("Melee", 600, 350);
    main_1.ui.fillText("Melee", 600, 350);
    main_1.ui.globalCompositeOperation = "lighter";
    var bgGrad = main_1.ui.createLinearGradient(0, 440 + exports.mlPos, 0, 500 + exports.mlPos);
    bgGrad.addColorStop(0, "rgba(255, 255, 255,0.45)");
    bgGrad.addColorStop(1, "rgba(255, 255, 255,0.2)");
    main_1.ui.fillStyle = bgGrad;
    main_1.ui.shadowBlur = 30;
    main_1.ui.shadowColor = "rgba(255, 255, 255, 0.7)";
    main_1.ui.font = "900 150px Arial";
    main_1.ui.fillText("LIGHT", 600, 500 + exports.mlPos);
    exports.mlVel += 0.05 * exports.mlDir;
    exports.mlPos += exports.mlVel;
    if (Math.abs(exports.mlVel) > 0.8) {
        exports.mlDir *= -1;
        if (exports.mlDir == -1) {
            for (var k = 0; k < 10; k++) {
            }
        }
    }
    main_1.ui.restore();
    for (var k = 0; k < 20; k++) {
        if (lightDust[k][2] < 410) {
            lightDust[k] = [Math.random() * 3 + 2, 330 + (k * 26 + 26 * Math.random()), 520, 0.2];
        }
        lightDust[k][2] -= lightDust[k][0];
        lightDust[k][3] = Math.max(0, lightDust[k][3] - 0.01);
        main_1.ui.fillStyle = "rgba(155,155,255," + lightDust[k][3] + ")";
        main_1.ui.beginPath();
        main_1.ui.arc(lightDust[k][1], lightDust[k][2], 10, 0, render_1.twoPi);
        main_1.ui.closePath();
        main_1.ui.fill();
    }
    main_1.ui.save();
    main_1.ui.fillStyle = "#989898";
    main_1.ui.beginPath();
    main_1.ui.arc(600, 580, 30, 0, render_1.twoPi);
    main_1.ui.closePath();
    main_1.ui.fill();
    main_1.ui.fillStyle = "#6c6b6b";
    main_1.ui.beginPath();
    main_1.ui.arc(600, 580, 15, 0, render_1.twoPi);
    main_1.ui.closePath();
    main_1.ui.fill();
    main_1.ui.lineWidth = 7;
    main_1.ui.font = "900 40px monospace";
    main_1.ui.textAlign = "center";
    main_1.ui.fillStyle = "#f0c900";
    main_1.ui.strokeStyle = "black";
    main_1.ui.strokeText("PRESS START", 600, 600);
    main_1.ui.fillText("PRESS START", 600, 600);
    main_1.ui.fillStyle = "rgba(0,0,0,0.6)";
    main_1.ui.beginPath();
    main_1.ui.arc(600, -2900, 3000, Math.PI * 0.05, Math.PI * 0.95);
    main_1.ui.closePath();
    main_1.ui.fill();
    main_1.ui.beginPath();
    main_1.ui.arc(600, 3650, 3000, Math.PI * 1.05, Math.PI * 1.95);
    main_1.ui.closePath();
    main_1.ui.fill();
    main_1.ui.restore();
}
