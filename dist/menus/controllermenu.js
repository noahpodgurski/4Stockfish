"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateControllerMenu = updateControllerMenu;
exports.drawControllerMenuInit = drawControllerMenuInit;
exports.setCustomInUse = setCustomInUse;
exports.drawControllerMenu = drawControllerMenu;
const main_1 = require("main/main");
const drawGamepad_1 = require("../input/gamepad/drawGamepad");
const gamepadCalibration_1 = require("../input/gamepad/gamepadCalibration");
const sfx_1 = require("main/sfx");
/* eslint-disable */
let controllerTimer = 0;
let controllerTimerMax = 3000;
let prevTime = 0;
function updateControllerMenu(quit, texts, interval) {
    var _a, _b, _c, _d;
    main_1.fg1.clearRect(0, 0, (_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.FG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.FG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    main_1.fg1.fillStyle = "rgba(255,255,255,0.8)";
    main_1.fg1.font = "700 36px Arial";
    main_1.fg1.textAlign = "center";
    const [text1, text2, text3] = texts;
    if (text1 !== undefined) {
        if (text2 === undefined) {
            main_1.fg1.fillText(text1, 600, 580);
        }
        else {
            main_1.fg1.fillText(text1, 600, 540);
            if (text2 !== undefined) {
                main_1.fg1.fillText(text2, 600, 580);
                if (text3 !== undefined) {
                    main_1.fg1.fillText(text3, 600, 620);
                }
            }
        }
    }
    if (quit) {
        setTimeout(function () {
            const gpd = document.getElementById("gamepadSVGCalibration");
            if (gpd === null) {
                throw Error("Unable to find gamepadSVGCalibration");
            }
            gpd.style.display = "none";
            const canvas = document.getElementById('uiCanvas');
            if (canvas === null) {
                throw Error("unable to find canvas");
            }
            const context = canvas.getContext('2d');
            if (context === null) {
                throw Error("unable to find context");
            }
            canvas.removeEventListener('mousemove', hoverFunction);
            canvas.removeEventListener('mousedown', pressFunction);
            canvas.removeEventListener('click', clickFunction);
            (0, main_1.changeGamemode)(1);
        }, 16);
    }
    else {
        controllerTimer = interval;
        controllerTimerMax = interval;
        prevTime = performance.now();
    }
}
function drawControllerMenuInit() {
    var _a, _b, _c, _d;
    (0, drawGamepad_1.updateGamepadSVGColour)(main_1.calibrationPlayer, "gamepadSVGCalibration");
    const cal = document.getElementById("gamepadSVGCalibration");
    if (cal !== null) {
        cal.style.display = "";
    }
    const bgGrad = main_1.bg1.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "rgb(11, 65, 39)");
    bgGrad.addColorStop(1, "rgb(8, 20, 61)");
    main_1.bg1.fillStyle = bgGrad;
    main_1.bg1.fillRect(0, 0, (_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    main_1.bg1.fillStyle = "rgba(0,0,0,0.5)";
    main_1.fg2.fillStyle = "rgba(255,255,255,0.2)";
    const newTime = performance.now();
    controllerTimer -= newTime - prevTime;
    prevTime = newTime;
    if (controllerTimer > 0) {
        main_1.fg2.fillRect(300, 600, 600, 30);
        main_1.fg2.fillStyle = "rgba(255,255,255,0.8)";
        main_1.fg2.fillRect(300, 600, 600 * Math.max(0, (controllerTimer / controllerTimerMax)), 30);
        main_1.fg2.fillRect(296, 585, 4, 60);
    }
}
const baseFill = "rgba(255, 255, 255, 0.6)";
const baseStroke = "rgba(255, 255, 255, 0.72)";
const redFill = "rgba(242, 120, 106, 0.6)";
const redStroke = "rgba(242, 120, 106, 0.72)";
const greenFill = "rgba(175, 232, 155, 0.6)";
const greenStroke = "rgba(175, 232, 155, 0.72)";
const highlightFill = "rgba(249, 255, 193, 0.6)";
const highlightStroke = "rgba(249, 255, 193, 0.72)";
const inUseStroke = "rgba(249, 255, 193, 0.9)";
const pressedFill = "rgba(145, 145, 145, 0.6)";
const pressedStroke = "rgba(249, 255, 193, 0.72)";
let centerState = "none";
let exitState = "none";
let resetState = "none";
let customState = "none";
let customInteract = null;
let customInUse = 0;
let saveOrLoad = "load";
function setCustomInUse(k) {
    customInUse = k;
}
function fillColour(state, k) {
    if (k === undefined || gamepadCalibration_1.customGamepadInfoIsUsable[k] === null) {
        if (state === "pressed") {
            return pressedFill;
        }
        else if (state === "highlight") {
            return highlightFill;
        }
        else {
            return baseFill;
        }
    }
    else if (gamepadCalibration_1.customGamepadInfoIsUsable[k] === false) {
        return redFill;
    }
    else {
        return greenFill;
    }
}
function strokeColour(state, k) {
    if (state === "pressed") {
        return pressedStroke;
    }
    else if (state === "highlight") {
        return highlightStroke;
    }
    else {
        if (k === undefined || gamepadCalibration_1.customGamepadInfoIsUsable[k] === null) {
            return baseStroke;
        }
        else if (gamepadCalibration_1.customGamepadInfoIsUsable[k] === false) {
            return redStroke;
        }
        else {
            return greenStroke;
        }
    }
}
function drawControllerMenu() {
    (0, main_1.clearScreen)();
    drawControllerMenuInit();
    main_1.bg2.lineWidth = 3;
    (0, main_1.addShine)(0.01);
    if (main_1.shine > 1.8) {
        (0, main_1.setShine)(-0.8);
    }
    const opacity = (main_1.shine < 0) ? (0.05 + (0.25 / 0.8) * (0.8 + main_1.shine)) : ((main_1.shine > 1) ? (0.3 - (0.25 / 0.8) * (main_1.shine - 1)) : 0.3);
    let bgGrad = main_1.bg2.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "rgba(255, 255, 255,0.05)");
    bgGrad.addColorStop(Math.min(Math.max(0, main_1.shine), 1), "rgba(255,255,255," + opacity + ")");
    bgGrad.addColorStop(1, "rgba(255, 255, 255,0.05)");
    //ui.strokeStyle = "rgba(255,255,255,0.13)";
    main_1.bg2.strokeStyle = bgGrad;
    main_1.bg2.beginPath();
    for (let i = 0; i < 60; i++) {
        main_1.bg2.moveTo(0 + (i * 30), 0);
        main_1.bg2.lineTo(0 + (i * 30), 750);
        main_1.bg2.moveTo(0, 0 + (i * 30));
        main_1.bg2.lineTo(1200, 0 + (i * 30));
    }
    main_1.bg2.stroke();
    main_1.ui.fillRect(30, 60, 120, 60);
    main_1.ui.strokeRect(30, 60, 120, 60);
    main_1.ui.fillRect(180, 60, 120, 60);
    main_1.ui.strokeRect(180, 60, 120, 60);
    main_1.ui.strokeStyle = inUseStroke;
    if (saveOrLoad === "load") {
        main_1.ui.strokeRect(27, 57, 126, 66);
    }
    else {
        main_1.ui.strokeRect(177, 57, 126, 66);
    }
    // draw custom controller binding boxes
    for (let i = 0; i < 4; i++) {
        if (customInteract !== 2 * i) {
            main_1.ui.fillStyle = fillColour("none", 2 * i);
            main_1.ui.strokeStyle = strokeColour("none", 2 * i);
            ;
        }
        else {
            main_1.ui.fillStyle = fillColour(customState, 2 * i);
            main_1.ui.strokeStyle = strokeColour(customState, 2 * i);
        }
        main_1.ui.fillRect(30, 150 + 90 * i, 120, 60);
        main_1.ui.strokeRect(30, 150 + 90 * i, 120, 60);
        if (customInUse === 2 * i) {
            main_1.ui.strokeStyle = inUseStroke;
            main_1.ui.strokeRect(27, 147 + 90 * i, 126, 66);
        }
        if (customInteract !== 2 * i + 1) {
            main_1.ui.fillStyle = fillColour("none", 2 * i + 1);
            main_1.ui.strokeStyle = strokeColour("none", 2 * i + 1);
            ;
        }
        else {
            main_1.ui.fillStyle = fillColour(customState, 2 * i + 1);
            main_1.ui.strokeStyle = strokeColour(customState, 2 * i + 1);
        }
        main_1.ui.fillRect(180, 150 + 90 * i, 120, 60);
        main_1.ui.strokeRect(180, 150 + 90 * i, 120, 60);
        if (customInUse === 2 * i + 1) {
            main_1.ui.strokeStyle = inUseStroke;
            main_1.ui.strokeRect(177, 147 + 90 * i, 126, 66);
        }
    }
    main_1.ui.font = "700 36px Arial";
    main_1.ui.textAlign = "center";
    main_1.ui.fillStyle = "rgba(255,255,255,0.8)";
    main_1.ui.fillText("Center", 1035, 190);
    main_1.ui.fillText("Reset", 1035, 280);
    main_1.ui.fillText("Quit", 1035, 370);
    main_1.ui.font = "700 28px Arial";
    main_1.ui.fillText("Load", 90, 100);
    main_1.ui.fillText("Save", 240, 100);
    main_1.ui.fillText("Default", 90, 190);
    main_1.ui.font = "700 20px Arial";
    main_1.ui.fillText("Custom 1", 240, 186);
    for (let i = 1; i < 4; i++) {
        main_1.ui.fillText("Custom " + (2 * i), 90, 186 + 90 * i);
        main_1.ui.fillText("Custom " + (2 * i + 1), 240, 186 + 90 * i);
    }
    main_1.ui.fillStyle = fillColour(centerState);
    main_1.ui.strokeStyle = strokeColour(centerState);
    main_1.ui.fillRect(960, 150, 150, 60);
    main_1.ui.strokeRect(960, 150, 150, 60);
    main_1.ui.fillStyle = fillColour(resetState);
    main_1.ui.strokeStyle = strokeColour(resetState);
    main_1.ui.fillRect(960, 240, 150, 60);
    main_1.ui.strokeRect(960, 240, 150, 60);
    main_1.ui.fillStyle = fillColour(exitState);
    main_1.ui.strokeStyle = strokeColour(exitState);
    main_1.ui.fillRect(960, 330, 150, 60);
    main_1.ui.strokeRect(960, 330, 150, 60);
    const canvas = document.getElementById('uiCanvas');
    if (canvas === null) {
        throw Error("canvas not found");
    }
    const context = canvas.getContext('2d');
    if (canvas === null) {
        throw Error("canvas not found");
    }
    canvas.addEventListener('mousemove', hoverFunction);
    canvas.addEventListener('mousedown', pressFunction);
    canvas.addEventListener('click', clickFunction);
}
function hoverFunction(e) {
    const x = e.offsetX;
    const y = e.offsetY;
    if (x >= 30 && x <= 150) {
        centerState = "none";
        resetState = "none";
        exitState = "none";
        if (y >= 60 && y <= 120) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = -2;
        }
        else if (y >= 150 && y <= 210) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = 0;
        }
        else if (y >= 240 && y <= 300) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = 2;
        }
        else if (y >= 330 && y <= 390) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = 4;
        }
        else if (y >= 420 && y <= 480) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = 6;
        }
        else {
            customState = "none";
            customInteract = null;
        }
    }
    else if (x >= 180 && x <= 300) {
        centerState = "none";
        resetState = "none";
        exitState = "none";
        if (y >= 60 && y <= 120) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = -1;
        }
        else if (y >= 150 && y <= 210) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = 1;
        }
        else if (y >= 240 && y <= 300) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = 3;
        }
        else if (y >= 330 && y <= 390) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = 5;
        }
        else if (y >= 420 && y <= 480) {
            if (customState === "none") {
                sfx_1.sounds.menuSelect.play();
                customState = "highlight";
            }
            customInteract = 7;
        }
        else {
            customState = "none";
            customInteract = null;
        }
    }
    else if (x >= 960 && x <= 1110) {
        customState = "none";
        customInteract = null;
        if (y >= 150 && y <= 210) {
            if (centerState === "none") {
                sfx_1.sounds.menuSelect.play();
                centerState = "highlight";
            }
            resetState = "none";
            exitState = "none";
        }
        else if (y >= 240 && y <= 300) {
            centerState = "none";
            if (resetState === "none") {
                sfx_1.sounds.menuSelect.play();
                resetState = "highlight";
            }
            exitState = "none";
        }
        else if (y >= 330 && y <= 390) {
            centerState = "none";
            resetState = "none";
            if (exitState === "none") {
                sfx_1.sounds.menuSelect.play();
                exitState = "highlight";
            }
        }
        else {
            centerState = "none";
            exitState = "none";
            resetState = "none";
        }
    }
    else {
        customState = "none";
        customInteract = null;
        centerState = "none";
        exitState = "none";
        resetState = "none";
    }
}
function pressFunction(e) {
    const x = e.offsetX;
    const y = e.offsetY;
    if (x >= 30 && x <= 150) {
        if (y >= 60 && y <= 120) {
            customState = "pressed";
            customInteract = -2;
        }
        else if (y >= 150 && y <= 210) {
            customState = "pressed";
            customInteract = 0;
        }
        else if (y >= 240 && y <= 300) {
            customState = "pressed";
            customInteract = 2;
        }
        else if (y >= 330 && y <= 390) {
            customState = "pressed";
            customInteract = 4;
        }
        else if (y >= 420 && y <= 480) {
            customState = "pressed";
            customInteract = 6;
        }
    }
    else if (x >= 180 && x <= 300) {
        if (y >= 60 && y <= 120) {
            customState = "pressed";
            customInteract = -1;
        }
        else if (y >= 150 && y <= 210) {
            customState = "pressed";
            customInteract = 1;
        }
        else if (y >= 240 && y <= 300) {
            customState = "pressed";
            customInteract = 3;
        }
        else if (y >= 330 && y <= 390) {
            customState = "pressed";
            customInteract = 5;
        }
        else if (y >= 420 && y <= 480) {
            customState = "pressed";
            customInteract = 7;
        }
    }
    else if (x >= 960 && x <= 1110) {
        if (y >= 150 && y <= 210) {
            centerState = "pressed";
        }
        else if (y >= 240 && y <= 300) {
            resetState = "pressed";
        }
        else if (y >= 330 && y <= 390) {
            exitState = "pressed";
        }
    }
}
function clickFunction(e) {
    const x = e.offsetX;
    const y = e.offsetY;
    if (x >= 30 && x <= 150) {
        if (y >= 60 && y <= 120) {
            saveOrLoad = "load";
        }
        else if (y >= 150 && y <= 210) {
            (0, gamepadCalibration_1.setClickObjectNumber)(0);
            (0, gamepadCalibration_1.setClickObject)(saveOrLoad + "Custom");
        }
        else if (y >= 240 && y <= 300) {
            (0, gamepadCalibration_1.setClickObjectNumber)(2);
            (0, gamepadCalibration_1.setClickObject)(saveOrLoad + "Custom");
        }
        else if (y >= 330 && y <= 390) {
            (0, gamepadCalibration_1.setClickObjectNumber)(4);
            (0, gamepadCalibration_1.setClickObject)(saveOrLoad + "Custom");
        }
        else if (y >= 420 && y <= 480) {
            (0, gamepadCalibration_1.setClickObjectNumber)(6);
            (0, gamepadCalibration_1.setClickObject)(saveOrLoad + "Custom");
        }
    }
    else if (x >= 180 && x <= 300) {
        if (y >= 60 && y <= 120) {
            saveOrLoad = "save";
        }
        if (y >= 150 && y <= 210) {
            (0, gamepadCalibration_1.setClickObjectNumber)(1);
            (0, gamepadCalibration_1.setClickObject)(saveOrLoad + "Custom");
        }
        else if (y >= 240 && y <= 300) {
            (0, gamepadCalibration_1.setClickObjectNumber)(3);
            (0, gamepadCalibration_1.setClickObject)(saveOrLoad + "Custom");
        }
        else if (y >= 330 && y <= 390) {
            (0, gamepadCalibration_1.setClickObjectNumber)(5);
            (0, gamepadCalibration_1.setClickObject)(saveOrLoad + "Custom");
        }
        else if (y >= 420 && y <= 480) {
            (0, gamepadCalibration_1.setClickObjectNumber)(7);
            (0, gamepadCalibration_1.setClickObject)(saveOrLoad + "Custom");
        }
    }
    else if (x >= 960 && x <= 1110) {
        if (y >= 150 && y <= 210) {
            (0, gamepadCalibration_1.setClickObject)("center");
        }
        else if (y >= 240 && y <= 300) {
            (0, gamepadCalibration_1.setClickObject)("reset");
        }
        else if (y >= 330 && y <= 390) {
            sfx_1.sounds.menuSelect.play();
            (0, gamepadCalibration_1.setClickObject)("exit");
        }
    }
}
