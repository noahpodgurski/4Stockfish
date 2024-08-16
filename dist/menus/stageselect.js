"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sssControls = sssControls;
exports.drawSSSInit = drawSSSInit;
exports.drawSSS = drawSSS;
const sfx_1 = require("main/sfx");
const main_1 = require("main/main");
const render_1 = require("main/render");
const streamclient_1 = require("../main/multiplayer/streamclient");
/* eslint-disable */
/*
should be able to add levels by just adding to smallboxstagenames, bigboxnames and stageimages
 */
const smallBoxStageNames = [
    "BATTLEFIELD",
    "Y-STORY",
    "P-STADIUM",
    "DREAMLAND",
    "F-DEST",
    "FOUNTAIN"
];
const bigBoxNames = [
    "Battlefield",
    "Yoshi's Story",
    "Pokemon Stadium",
    "Dreamland",
    "Final Destination",
    "Fountain Of Dreams"
];
const stageImages = {
    0: retrieveImage("assets/stage-icons/bf.png"),
    1: retrieveImage("assets/stage-icons/ys.png"),
    2: retrieveImage("assets/stage-icons/ps.png"),
    3: retrieveImage("assets/stage-icons/dl.png"),
    4: retrieveImage("assets/stage-icons/fd.png"),
    5: retrieveImage("assets/stage-icons/fod.png"),
};
function retrieveImage(src) {
    let box = new Image();
    box.src = src;
    box.onerror = function () {
        box.onerror = null;
        box.src = "assets/stage-icons/Icon_transparent_Question.png";
    };
    return box;
}
let stageSelected = smallBoxStageNames.length;
let stageSelectTimer = 0;
const stagePointerPos = [600, 635];
const xRowOffset = 175;
function sssControls(i, input) {
    stagePointerPos[0] += input[i][0].lsX * 15;
    stagePointerPos[1] += input[i][0].lsY * -15;
    if (stagePointerPos[1] >= 450 && stagePointerPos[1] <= 540) {
        for (let j = 0; j < smallBoxStageNames.length; j++) {
            if (stagePointerPos[0] >= 87.5 + j * xRowOffset && stagePointerPos[0] <= 237.5 + j * xRowOffset) {
                if (stageSelected != j) {
                    sfx_1.sounds.menuSelect.play();
                }
                stageSelected = j;
                break;
            }
        }
    }
    else if (stagePointerPos[0] >= 525 && stagePointerPos[0] <= 675 &&
        stagePointerPos[1] >= 590 && stagePointerPos[1] <= 680) {
        if (stageSelected != smallBoxStageNames.length) {
            sfx_1.sounds.menuSelect.play();
        }
        stageSelected = smallBoxStageNames.length;
    }
    if (input[i][0].b && !input[i][1].b) {
        sfx_1.sounds.menuBack.play();
        (0, main_1.changeGamemode)(2);
    }
    else if ((input[i][0].a && !input[i][1].a)) {
        sfx_1.sounds.menuForward.play();
        if (stageSelected == smallBoxStageNames.length) {
            stageSelected = Math.floor(Math.random() * (smallBoxStageNames.length - 0.01));
        }
        (0, main_1.setStageSelect)(stageSelected);
        (0, streamclient_1.syncStartGame)(stageSelected);
        (0, main_1.startGame)();
    }
}
function drawSSSInit() {
    var _a, _b, _c, _d;
    let bgGrad = main_1.bg1.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "rgb(17, 11, 65)");
    bgGrad.addColorStop(1, "rgb(61, 8, 37)");
    main_1.bg1.fillStyle = bgGrad;
    main_1.bg1.fillRect(0, 0, (_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    main_1.fg1.lineWidth = 4;
    main_1.fg1.strokeStyle = "rgba(255, 255, 255, 0.57)";
    main_1.fg1.strokeRect(198, 98, 804, 304);
    main_1.fg1.fillStyle = "black";
    stageSelectTimer++;
    for (let i = 0; i < smallBoxStageNames.length; i++) {
        main_1.fg1.fillRect(87.5 + i * xRowOffset, 450, 150, 90);
    }
    main_1.fg1.fillRect(525, 590, 150, 90);
    main_1.fg1.fillStyle = "white";
    main_1.fg1.font = "500 16px Arial";
    main_1.fg1.textAlign = "center";
    for (let i = 0; i < smallBoxStageNames.length; i++) {
        main_1.fg1.fillText(smallBoxStageNames[i], i * xRowOffset + 162.5, 530);
        main_1.fg1.drawImage(stageImages[i], i * xRowOffset + 87.5, 452, 146, 55);
    }
}
function drawBigBox() {
    if (stageSelected < smallBoxStageNames.length) {
        main_1.ui.drawImage(stageImages[stageSelected], 200, 100, 800, 300);
        main_1.ui.fillText(bigBoxNames[stageSelected], 220, 380);
    }
    else if (stageSelected == smallBoxStageNames.length) {
        main_1.ui.textAlign = "center";
        main_1.ui.lineWidth = 9;
        main_1.ui.fillStyle = "rgba(0,0,0,0.7)";
        main_1.ui.fillRect(202, 102, 796, 296);
        main_1.ui.fillStyle = "rgb(255, 161, 84)";
        main_1.ui.strokeStyle = "rgb(255, 161, 84)";
        main_1.ui.font = "900 100px Arial";
        main_1.ui.fillText("?", 600, 230);
        main_1.ui.fillText("RANDOM", 600, 355);
        main_1.ui.beginPath();
        main_1.ui.arc(600, 192, 55, 0, render_1.twoPi);
        main_1.ui.closePath();
        main_1.ui.stroke();
    }
}
function drawSSS() {
    (0, main_1.clearScreen)();
    main_1.bg2.lineWidth = 3;
    (0, main_1.addShine)(0.01);
    if (main_1.shine > 1.8) {
        (0, main_1.setShine)(-0.8);
    }
    var opacity = (main_1.shine < 0) ? (0.05 + (0.25 / 0.8) * (0.8 + main_1.shine)) : ((main_1.shine > 1) ? (0.3 - (0.25 / 0.8) * (main_1.shine - 1)) :
        0.3);
    var bgGrad = main_1.bg2.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "rgba(255, 255, 255,0.05)");
    bgGrad.addColorStop(Math.min(Math.max(0, main_1.shine), 1), "rgba(255,255,255," + opacity + ")");
    bgGrad.addColorStop(1, "rgba(255, 255, 255,0.05)");
    //ui.strokeStyle = "rgba(255,255,255,0.13)";
    main_1.bg2.strokeStyle = bgGrad;
    main_1.bg2.beginPath();
    for (var i = 0; i < 60; i++) {
        main_1.bg2.moveTo(0 + (i * 30), 0);
        main_1.bg2.lineTo(0 + (i * 30), 750);
        main_1.bg2.moveTo(0, 0 + (i * 30));
        main_1.bg2.lineTo(1200, 0 + (i * 30));
    }
    main_1.bg2.stroke();
    main_1.ui.textAlign = "center";
    main_1.ui.lineWidth = 3;
    stageSelectTimer++;
    for (var i = 0; i < smallBoxStageNames.length; i++) {
        if (stageSelected == i) {
            if (stageSelectTimer % 8 > 4) {
                main_1.ui.strokeStyle = "rgb(251, 116, 155)";
            }
            else {
                main_1.ui.strokeStyle = "rgb(255, 182, 204)";
            }
        }
        else {
            main_1.ui.strokeStyle = "rgb(166, 166, 166)";
        }
        main_1.ui.strokeRect(87.5 + i * xRowOffset, 450, 150, 90);
    }
    main_1.ui.fillStyle = "rgb(245, 144, 61)";
    main_1.ui.strokeStyle = "rgb(245, 144, 61)";
    if (stageSelected === smallBoxStageNames.length) {
        if (stageSelectTimer % 8 > 4) {
            main_1.ui.fillStyle = "rgb(251, 195, 149)";
            main_1.ui.strokeStyle = "rgb(251, 195, 149)";
        }
    }
    main_1.ui.font = "700 25px Arial";
    main_1.ui.lineWidth = 4;
    main_1.ui.strokeRect(525, 590, 150, 90);
    main_1.ui.fillText("RANDOM", 600, 665);
    main_1.ui.font = "700 32px Arial";
    main_1.ui.fillText("?", 600, 630);
    main_1.ui.beginPath();
    main_1.ui.arc(600, 618, 18, 0, render_1.twoPi);
    main_1.ui.closePath();
    main_1.ui.stroke();
    main_1.ui.textAlign = "start";
    main_1.ui.fillStyle = "rgba(255,255,255,0.6)";
    main_1.ui.font = "900 48px Arial";
    drawBigBox();
    main_1.ui.textAlign = "center";
    main_1.ui.lineWidth = 8;
    main_1.ui.strokeStyle = "rgba(255,255,255,0.8)";
    main_1.ui.beginPath();
    main_1.ui.arc(stagePointerPos[0], stagePointerPos[1], 40, 0, render_1.twoPi);
    main_1.ui.closePath();
    main_1.ui.stroke();
}
