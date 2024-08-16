"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backgroundType = exports.BgStar = exports.boxFillBG = exports.boxFill = void 0;
exports.drawStageInit = drawStageInit;
exports.calculateDamageWallColours = calculateDamageWallColours;
exports.drawDamageLine = drawDamageLine;
exports.drawStage = drawStage;
exports.setBackgroundType = setBackgroundType;
exports.drawBackgroundInit = drawBackgroundInit;
exports.drawBackground = drawBackground;
exports.drawTunnel = drawTunnel;
exports.drawStars = drawStars;
const transparency_1 = require("../main/vfx/transparency");
const main_1 = require("../main/main");
const render_1 = require("../main/render");
const activeStage_1 = require("../stages/activeStage");
const Vec2D_1 = require("../main/util/Vec2D");
const linAlg_1 = require("../main/linAlg");
const bgPos = [[-30, 500, 300, 500, 900, 500, 1230, 450, 358], [-30, 400, 300, 400, 900, 400, 1230, 350, 179]];
const direction = [[1, -1, 1, -1, 1, -1, 1, -1, 1], [-1, 1, -1, 1, -1, 1, -1, 1, -1]];
exports.boxFill = "rgba(0, 0, 0, 0.1)";
exports.boxFillBG = "rgba(0, 0, 0, 0.1)";
class BgStar {
    constructor() {
        const vSeed = Math.random();
        this.velocity = new Vec2D_1.Vec2D(5 * vSeed * Math.sign(0.5 - Math.random()), 5 * (1 - vSeed) * Math.sign(0.5 - Math.random()));
        if ((0, transparency_1.getTransparency)()) {
            this.colour = "hsl(" + 358 * Math.random() + ", 100%, 50%)";
        }
        else {
            this.colour = "hsl(" + 358 * Math.random() + ",100%,15%)";
        }
        this.pos = new Vec2D_1.Vec2D(0, 0);
        this.life = 0;
    }
}
exports.BgStar = BgStar;
;
const bgStars = [];
for (let p = 0; p < 20; p++) {
    bgStars[p] = new BgStar();
    bgStars[p].pos = new Vec2D_1.Vec2D(600 + 100 * Math.random() * bgStars[p].velocity.x, 375 + 100 * Math.random() * bgStars[p].velocity.y);
}
let bgSparkle = 3;
const gridGrad = "rgba(94,173,255,0.2)";
const circleSize = [];
for (let i = 0; i < 5; i++) {
    circleSize[i] = i * 40;
}
let ang = 0;
exports.backgroundType = 0;
const scandypattern = new Image();
scandypattern.src = "assets/christmas/scandypattern.png";
const fabric = new Image();
fabric.src = "assets/christmas/fabric.png";
const randall = [new Image(), new Image(), new Image()];
randall[0].src = "assets/stage/randall1.png";
randall[1].src = "assets/stage/randall2.png";
randall[2].src = "assets/stage/randall3.png";
let randallTimer = 0;
function drawStageInit() {
    main_1.fg1.strokeStyle = "#db80cc";
    main_1.fg1.lineWidth = 1;
    for (let j = 0; j < activeStage_1.activeStage.ground.length; j++) {
        main_1.fg1.beginPath();
        main_1.fg1.moveTo((activeStage_1.activeStage.ground[j][0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.ground[j][0].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.lineTo((activeStage_1.activeStage.ground[j][1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.ground[j][1].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.closePath();
        main_1.fg1.stroke();
    }
    main_1.fg1.strokeStyle = "#ed6767";
    for (let j = 0; j < activeStage_1.activeStage.ceiling.length; j++) {
        main_1.fg1.beginPath();
        main_1.fg1.moveTo((activeStage_1.activeStage.ceiling[j][0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.ceiling[j][0].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.lineTo((activeStage_1.activeStage.ceiling[j][1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.ceiling[j][1].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.closePath();
        main_1.fg1.stroke();
    }
    main_1.fg1.strokeStyle = "#4794c6";
    for (let j = 0; j < activeStage_1.activeStage.platform.length; j++) {
        if (activeStage_1.activeStage.movingPlats === null || activeStage_1.activeStage.movingPlats === undefined || activeStage_1.activeStage.movingPlats.indexOf(j) === -1) { // not a moving platform
            main_1.fg1.beginPath();
            main_1.fg1.moveTo((activeStage_1.activeStage.platform[j][0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.platform[j][0].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
            main_1.fg1.lineTo((activeStage_1.activeStage.platform[j][1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.platform[j][1].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
            main_1.fg1.closePath();
            main_1.fg1.stroke();
        }
    }
    main_1.fg1.strokeStyle = "#47c648";
    for (let k = 0; k < activeStage_1.activeStage.wallL.length; k++) {
        main_1.fg1.beginPath();
        main_1.fg1.moveTo((activeStage_1.activeStage.wallL[k][0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.wallL[k][0].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.lineTo((activeStage_1.activeStage.wallL[k][1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.wallL[k][1].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.closePath();
        main_1.fg1.stroke();
    }
    main_1.fg1.strokeStyle = "#9867de";
    for (let l = 0; l < activeStage_1.activeStage.wallR.length; l++) {
        main_1.fg1.beginPath();
        main_1.fg1.moveTo((activeStage_1.activeStage.wallR[l][0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.wallR[l][0].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.lineTo((activeStage_1.activeStage.wallR[l][1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.wallR[l][1].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.closePath();
        main_1.fg1.stroke();
    }
    main_1.fg1.strokeStyle = "#E7A44C";
    main_1.fg1.lineWidth = 2;
    for (let i = 0; i < activeStage_1.activeStage.ledge.length; i++) {
        const e = activeStage_1.activeStage.ledge[i];
        const pA = activeStage_1.activeStage[e[0]][e[1]][e[2]];
        const pB = activeStage_1.activeStage[e[0]][e[1]][1 - e[2]];
        const ang = Math.atan2((pB.y - pA.y), (pB.x - pA.x));
        const magnitude = (0, linAlg_1.euclideanDist)(pA, pB);
        const length = Math.min(0.4 * magnitude, 20 / activeStage_1.activeStage.scale);
        const pC = new Vec2D_1.Vec2D(pA.x + length * Math.cos(ang), pA.y + length * Math.sin(ang));
        main_1.fg1.beginPath();
        main_1.fg1.moveTo((pA.x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (pA.y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.lineTo((pC.x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (pC.y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
        main_1.fg1.closePath();
        main_1.fg1.stroke();
    }
}
;
const swirlTimer = 0;
const swirlSwitch = false;
const wallColour = ["rgb(255,0,40)", "rgb(0,255,255)", "rgb(125,125,125)", "rgb(125,50,255)"];
function wallColourFromDamageType(damageType) {
    if (damageType === "fire") {
        return wallColour[0];
    }
    else if (damageType === "electric") {
        return wallColour[1];
    }
    else if (damageType === "slash") {
        return wallColour[2];
    }
    else if (damageType === "darkness") {
        return wallColour[3];
    }
    else {
        return "rgb(0,50,180)";
    }
}
;
let wallCycle = 0;
function calculateDamageWallColours() {
    let a = 0;
    if (wallCycle < 240) {
        wallCycle++;
        if (wallCycle > 120) {
            a = 240 - wallCycle;
        }
        else {
            a = wallCycle;
        }
    }
    else {
        wallCycle = 0;
    }
    const n = Math.round(255 * a / 120);
    wallColour[0] = "rgb(255," + n + ",40)";
    wallColour[1] = "rgb(" + n + ",255,255)";
    const m = Math.round(125 + n / 2);
    wallColour[2] = "rgb(" + m + "," + m + "," + m + ")";
    wallColour[3] = "rgb(" + Math.round(125 - n / 3) + ",50," + Math.round(255 - n / 3) + ")";
}
function drawDamageLine(type, can, stage) {
    for (let i = 0; i < stage[type].length; i++) {
        const surfaceProperties = stage[type][i][2];
        if (surfaceProperties !== undefined && surfaceProperties.damageType !== null) {
            can.strokeStyle = wallColourFromDamageType(surfaceProperties.damageType);
            can.beginPath();
            can.moveTo((stage[type][i][0].x * stage.scale) + stage.offset[0], (stage[type][i][0].y * -stage.scale) + stage.offset[1]);
            can.lineTo((stage[type][i][1].x * stage.scale) + stage.offset[0], (stage[type][i][1].y * -stage.scale) + stage.offset[1]);
            can.stroke();
        }
    }
}
function drawStage() {
    calculateDamageWallColours();
    if (activeStage_1.activeStage.name === "ystory") {
        // Randall
        randallTimer++;
        if (randallTimer === 30) {
            randallTimer = 0;
        }
        main_1.bg2.drawImage(randall[Math.floor(randallTimer / 10)], (activeStage_1.activeStage.platform[0][0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0] - 20, (activeStage_1.activeStage.platform[0][0].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1] - 20, 100, 100);
    }
    else if (activeStage_1.activeStage.movingPlats !== null && activeStage_1.activeStage.movingPlats !== undefined && activeStage_1.activeStage.movingPlats.length !== 0) {
        main_1.fg2.strokeStyle = "#4794c6";
        for (let i = 0; i < activeStage_1.activeStage.movingPlats.length; i++) {
            if (activeStage_1.activeStage.name !== "fountain" || activeStage_1.activeStage.platform[activeStage_1.activeStage.movingPlats[i]][0].y > 0) {
                main_1.fg2.beginPath();
                main_1.fg2.moveTo((activeStage_1.activeStage.platform[activeStage_1.activeStage.movingPlats[i]][0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.platform[activeStage_1.activeStage.movingPlats[i]][0].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
                main_1.fg2.lineTo((activeStage_1.activeStage.platform[activeStage_1.activeStage.movingPlats[i]][1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.platform[activeStage_1.activeStage.movingPlats[i]][1].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
                main_1.fg2.closePath();
                main_1.fg2.stroke();
            }
        }
    }
    main_1.fg2.fillStyle = exports.boxFill;
    if (activeStage_1.activeStage.box !== null && activeStage_1.activeStage.box !== undefined) {
        for (let j = 0; j < activeStage_1.activeStage.box.length; j++) {
            main_1.fg2.fillRect((activeStage_1.activeStage.box[j].min.x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (activeStage_1.activeStage.box[j].max.y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1], (activeStage_1.activeStage.box[j].max.x - activeStage_1.activeStage.box[j].min.x) * activeStage_1.activeStage.scale, (activeStage_1.activeStage.box[j].max.y - activeStage_1.activeStage.box[j].min.y) * activeStage_1.activeStage.scale);
        }
    }
    if (activeStage_1.activeStage.polygon !== null && activeStage_1.activeStage.polygon !== undefined) {
        for (let j = 0; j < activeStage_1.activeStage.polygon.length; j++) {
            const p = activeStage_1.activeStage.polygon[j];
            main_1.fg2.beginPath();
            main_1.fg2.moveTo(p[0].x * activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[0], p[0].y * -activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[1]);
            for (let n = 1; n < p.length; n++) {
                main_1.fg2.lineTo(p[n].x * activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[0], p[n].y * -activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[1]);
            }
            main_1.fg2.closePath();
            main_1.fg2.fill();
        }
    }
    if (activeStage_1.activeStage.background !== null && activeStage_1.activeStage.background !== undefined) {
        if (activeStage_1.activeStage.background.polygon !== null && activeStage_1.activeStage.background.polygon !== undefined) {
            main_1.bg2.save();
            main_1.bg2.fillStyle = exports.boxFillBG;
            for (let i = 0; i < activeStage_1.activeStage.background.polygon.length; i++) {
                const p = activeStage_1.activeStage.background.polygon[i];
                main_1.bg2.beginPath();
                main_1.bg2.moveTo(p[0].x * activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[0], p[0].y * -activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[1]);
                for (let n = 1; n < p.length; n++) {
                    main_1.bg2.lineTo(p[n].x * activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[0], p[n].y * -activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[1]);
                }
                main_1.bg2.closePath();
                main_1.bg2.fill();
            }
        }
        if (activeStage_1.activeStage.background.line !== null && activeStage_1.activeStage.background.line !== undefined) {
            main_1.bg2.lineWidth = 3;
            main_1.bg2.strokeStyle = exports.boxFillBG;
            for (let i = 0; i < activeStage_1.activeStage.background.line.length; i++) {
                const lL = activeStage_1.activeStage.background.line[i][0];
                const lR = activeStage_1.activeStage.background.line[i][1];
                main_1.bg2.beginPath();
                main_1.bg2.moveTo(lL.x * activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[0], lL.y * -activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[1]);
                main_1.bg2.lineTo(lR.x * activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[0], lR.y * -activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[1]);
                main_1.bg2.closePath();
                main_1.bg2.stroke();
            }
            main_1.bg2.restore();
        }
    }
    main_1.fg2.lineWidth = 4;
    const types = ["wallL", "wallR", "ground", "ceiling"];
    for (let i = 0; i < types.length; i++) {
        drawDamageLine(types[i], main_1.fg2, activeStage_1.activeStage);
    }
    main_1.fg2.strokeStyle = "#e7a44c";
    const ex = 0;
}
;
function setBackgroundType(val) {
    exports.backgroundType = val;
}
;
function drawBackgroundInit() {
    var _a, _b, _c, _d;
    const bgGrad = main_1.bg1.createLinearGradient(0, 0, 0, 500);
    bgGrad.addColorStop(0, "rgb(24, 17, 66)");
    bgGrad.addColorStop(1, "black");
    main_1.bg1.fillStyle = bgGrad;
    main_1.bg1.fillRect(-100, -100, (_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0 + 200, (_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0 + 200);
    ;
}
;
function drawBackground() {
    if (exports.backgroundType === 0) {
        drawStars();
    }
    else {
        drawTunnel();
    }
}
;
function drawTunnel() {
    main_1.bg2.lineWidth = 2;
    ang += 0.005;
    let angB = ang;
    main_1.bg2.beginPath();
    for (let i = 0; i < 16; i++) {
        const v = (0, render_1.rotateVector)(0, 800, angB);
        main_1.bg2.moveTo(600, 375);
        main_1.bg2.lineTo(600 + v.x, 375 + v.y);
        angB += Math.PI / 8;
    }
    main_1.bg2.stroke();
    for (let i = 0; i < circleSize.length; i++) {
        circleSize[i]++;
        if (circleSize[i] > 200) {
            circleSize[i] = 0;
        }
        main_1.bg2.lineWidth = Math.max(1, Math.round(3 * (circleSize[i] / 60)));
        main_1.bg2.beginPath();
        main_1.bg2.arc(600, 375, circleSize[i] * 4, 0, render_1.twoPi);
        main_1.bg2.closePath();
        main_1.bg2.stroke();
    }
}
;
function drawStars() {
    bgSparkle--;
    for (let p = 0; p < 20; p++) {
        if (bgStars[p].pos.x > 1250 || bgStars[p].pos.y > 800 || bgStars[p].pos.x < -50 || bgStars[p].pos.y < -50) {
            bgStars[p].pos = new Vec2D_1.Vec2D(600, 375);
            bgStars[p].life = 0;
            const vSeed = Math.random();
            bgStars[p].velocity = new Vec2D_1.Vec2D(5 * vSeed * Math.sign(0.5 - Math.random()), 5 * (1 - vSeed) * Math.sign(0.5 - Math.random()));
        }
        bgStars[p].pos.x += bgStars[p].velocity.x;
        bgStars[p].pos.y += bgStars[p].velocity.y;
        bgStars[p].life++;
        if (bgSparkle === 0) {
            main_1.bg2.fillStyle = bgStars[p].colour;
            if ((0, transparency_1.getTransparency)()) {
                main_1.bg2.globalAlpha = Math.min(bgStars[p].life / 300, 1);
            }
            main_1.bg2.beginPath();
            main_1.bg2.arc(bgStars[p].pos.x, bgStars[p].pos.y, 5, render_1.twoPi, 0);
            ;
            main_1.bg2.fill();
        }
    }
    if (bgSparkle === 0) {
        bgSparkle = 2;
    }
    main_1.bg2.globalAlpha = 1;
    for (let k = 1; k > -1; k--) {
        for (let j = 0; j < 9; j++) {
            //bgPos[j] += direction[j]*5*Math.random();
            if (j === 8) {
                bgPos[k][j] += direction[k][j] * 0.2 * Math.random();
            }
            else {
                bgPos[k][j] += direction[k][j] * 1 * Math.random();
            }
            switch (j) {
                case 0:
                    if ((direction[k][j] === 1 && bgPos[k][j] > -10) || (direction[k][j] === -1 && bgPos[k][j] < -200)) {
                        direction[k][j] *= -1;
                    }
                    break;
                case 1:
                    if ((direction[k][j] === 1 && bgPos[k][j] > 550 - k * 100) || (direction[k][j] === -1 && bgPos[k][j] < 450 - k * 100)) {
                        direction[k][j] *= -1;
                    }
                    break;
                case 2:
                    if ((direction[k][j] === 1 && bgPos[k][j] > 550) || (direction[k][j] === -1 && bgPos[k][j] < 0)) {
                        direction[k][j] *= -1;
                    }
                    break;
                case 3:
                    if ((direction[k][j] === 1 && bgPos[k][j] > 550 - k * 100) || (direction[k][j] === -1 && bgPos[k][j] < 450 - k * 100)) {
                        direction[k][j] *= -1;
                    }
                    break;
                case 4:
                    if ((direction[k][j] === 1 && bgPos[k][j] > 1150) || (direction[k][j] === -1 && bgPos[k][j] < 600)) {
                        direction[k][j] *= -1;
                    }
                    break;
                case 5:
                    if ((direction[k][j] === 1 && bgPos[k][j] > 550 - k * 100) || (direction[k][j] === -1 && bgPos[k][j] < 450 - k * 100)) {
                        direction[k][j] *= -1;
                    }
                    break;
                case 6:
                    if ((direction[k][j] === 1 && bgPos[k][j] > 1400) || (direction[k][j] === -1 && bgPos[k][j] < 1210)) {
                        direction[k][j] *= -1;
                    }
                    break;
                case 7:
                    if ((direction[k][j] === 1 && bgPos[k][j] > 550 - k * 100) || (direction[k][j] === -1 && bgPos[k][j] < 450 - k * 100)) {
                        direction[k][j] *= -1;
                    }
                    break;
                case 8:
                    if ((direction[k][j] === 1 && bgPos[k][j] > 357) || (direction[k][j] === -1 && bgPos[k][j] < 1)) {
                        direction[k][j] *= -1;
                    }
                    break;
                default:
                    break;
            }
        }
        if ((0, transparency_1.getTransparency)()) {
            exports.boxFill = "hsla(" + bgPos[k][8] + ", 100%, 50%, " + (0.15 - k * 0.07) + ")";
            exports.boxFillBG = "hsla(" + bgPos[k][8] + ", 100%, 50%, " + (0.13 - k * 0.07) + ")";
        }
        else {
            exports.boxFill = "hsl(" + bgPos[k][8] + ", 100%, 7%)";
            exports.boxFillBG = "hsl(" + bgPos[k][8] + ", 50%, 7%)";
        }
        main_1.bg2.fillStyle = exports.boxFill;
        main_1.bg2.beginPath();
        main_1.bg2.moveTo(bgPos[k][0], bgPos[k][1]);
        main_1.bg2.bezierCurveTo(bgPos[k][2], bgPos[k][3], bgPos[k][4], bgPos[k][5], bgPos[k][6], bgPos[k][7]);
        if (k === 1) {
            main_1.bg2.lineTo(bgPos[0][6], bgPos[0][7]);
            main_1.bg2.bezierCurveTo(bgPos[0][4], bgPos[0][5], bgPos[0][2], bgPos[0][3], bgPos[0][0], bgPos[0][1]);
        }
        else {
            main_1.bg2.lineTo(1200, 750);
            main_1.bg2.lineTo(0, 750);
        }
        main_1.bg2.closePath();
        main_1.bg2.fill();
    }
}
;
