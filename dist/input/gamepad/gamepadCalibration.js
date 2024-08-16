"use strict";
// @flow
/*eslint indent:0*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.customGamepadInfoIsUsable = void 0;
exports.setClickObject = setClickObject;
exports.setClickObjectNumber = setClickObjectNumber;
exports.setCustomGamepadInfoIsUsable = setCustomGamepadInfoIsUsable;
exports.runCalibration = runCalibration;
const Vec2D_js_1 = require("../../main/util/Vec2D.js");
const deepCopy_js_1 = require("../../main/util/deepCopy.js");
const main_js_1 = require("../../main/main.js");
const controllermenu_js_1 = require("../../menus/controllermenu.js");
const gamepadInfo_js_1 = require("./gamepadInfo.js");
const gamepad_js_1 = require("./gamepad.js");
const custom_js_1 = require("./gamepads/custom.js");
const findGamepadInfo_js_1 = require("./findGamepadInfo.js");
const sfx_js_1 = require("../../main/sfx.js");
const calibrationInProgress = [false, false, false, false];
function setCalibrationInProgress(i, boolean) {
    calibrationInProgress[i] = boolean;
}
const nullSnapshots = {
    b0: [], bL: [], bR: [], bU: [],
    a0: [], aL: [], aR: [], aU: []
};
let clickObject = null;
function setClickObject(click) {
    if (clickObject === null) {
        clickObject = click;
    }
}
let clickObjectNumber = 0;
function setClickObjectNumber(k) {
    clickObjectNumber = k;
}
exports.customGamepadInfoIsUsable = [true, null, null, null, null, null, null, null];
let listening = false;
const ids = ["a", "b", "x", "y", "s", "r", "l", "z", "dpad", "icon", "ls", "cs"];
// add listeners for click
// these turn off when the SVG is not displayed, so shouldn't impact performance
function listen() {
    var _a, _b;
    // $FlowFixMe ignore the following type error
    const svgDoc = (_a = document.getElementById("gamepadSVGCalibration")) === null || _a === void 0 ? void 0 : _a.ownerDocument;
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (id === null) {
            throw "id is null";
        }
        // eslint-disable-next-line no-loop-func
        (_b = svgDoc === null || svgDoc === void 0 ? void 0 : svgDoc.getElementById(id)) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            clickObject = id;
        });
    }
    listening = true;
}
const defaultTexts = ["Click button, trigger or analog stick to rebind."];
const errorText = ["Error: no controller detected"];
// figure out which custom gamepad infos are usable by the current controller
// sets the value for customGamepadInfoIsUsable
function setCustomGamepadInfoIsUsable(j) {
    const currentGamepad = (0, gamepad_js_1.getGamepad)(j);
    if (currentGamepad) {
        const currentGamepadId = currentGamepad.id;
        if ((0, findGamepadInfo_js_1.getGamepadNameAndInfo)(currentGamepadId) === null) {
            exports.customGamepadInfoIsUsable[0] = null;
        }
        else {
            exports.customGamepadInfoIsUsable[0] = true;
        }
        for (let k = 1; k < 8; k++) {
            const maybeCustomGamepadInfo = (0, custom_js_1.getCustomGamepadInfo)(k);
            if (maybeCustomGamepadInfo === null) {
                exports.customGamepadInfoIsUsable[k] = null;
            }
            else {
                if (currentGamepadId === maybeCustomGamepadInfo.fullID) {
                    exports.customGamepadInfoIsUsable[k] = true;
                }
                else {
                    exports.customGamepadInfoIsUsable[k] = false;
                }
            }
        }
    }
    else {
        exports.customGamepadInfoIsUsable[0] = null;
    }
}
function runCalibration(i) {
    if (!calibrationInProgress[i]) {
        setCalibrationInProgress(i, true);
        const interval = 2000;
        const j = main_js_1.currentPlayers[i];
        const prevGamepadInfo = main_js_1.mType[i] === null || main_js_1.mType[i] === "keyboard" ? gamepadInfo_js_1.nullGamepadInfo : main_js_1.mType[i];
        const gamepadInfo = (0, deepCopy_js_1.deepCopyObject)(true, prevGamepadInfo);
        setCustomGamepadInfoIsUsable(j);
        clickObject = null;
        if (listening === false) {
            listen();
        }
        (0, controllermenu_js_1.updateControllerMenu)(false, ["Mouse-click the start button to begin calibration."], 0);
        preCalibrationLoop(i, j, gamepadInfo, interval);
    }
}
function resetGamepadInfo(j) {
    const gamepad = (0, gamepad_js_1.getGamepad)(j);
    let baseGamepadInfo = gamepadInfo_js_1.nullGamepadInfo;
    if (gamepad !== undefined && gamepad !== null && gamepad.id !== undefined && gamepad.id !== null) {
        const maybeNameAndInfo = (0, findGamepadInfo_js_1.getGamepadNameAndInfo)(gamepad.id);
        if (maybeNameAndInfo !== null) {
            baseGamepadInfo = (0, deepCopy_js_1.deepCopyObject)(true, maybeNameAndInfo[1]);
        }
    }
    return baseGamepadInfo;
}
function saveSound() {
    sfx_js_1.sounds.star.play();
}
function preCalibrationLoop(i, j, gamepadInfo, interval) {
    if (clickObject === "s") {
        sfx_js_1.sounds.blunthit.play();
        (0, custom_js_1.setCustomGamepadInfo)(j, gamepadInfo);
        (0, main_js_1.setUsingCustomControls)(i, true);
        (0, controllermenu_js_1.updateControllerMenu)(false, ["Finding controller neutral point.", "Do not press anything."], interval);
        // take null snapshot
        setTimeout(() => {
            (0, main_js_1.setControllerReset)(i);
            saveSound();
            const gamepad = (0, gamepad_js_1.getGamepad)(j);
            if (gamepad !== undefined && gamepad !== null) {
                const snapshots = nullSnapshots;
                snapshots.b0 = (0, deepCopy_js_1.deepCopyArray)(true, gamepad.buttons);
                snapshots.a0 = (0, deepCopy_js_1.deepCopyArray)(true, gamepad.axes);
                calibrationLoop(i, j, gamepadInfo, snapshots, interval);
                (0, controllermenu_js_1.updateControllerMenu)(false, defaultTexts, 0);
            }
            else {
                (0, controllermenu_js_1.updateControllerMenu)(false, errorText, 0);
            }
        }, interval);
    }
    else if (clickObject === "exit") {
        sfx_js_1.sounds.menuBack.play();
        (0, controllermenu_js_1.updateControllerMenu)(true, ["Quitting calibration menu."], interval);
        setCalibrationInProgress(i, false);
    }
    else if (clickObject === "reset") {
        sfx_js_1.sounds.loudelectricfizz.play();
        (0, controllermenu_js_1.setCustomInUse)(0);
        const baseGamepadInfo = resetGamepadInfo(j);
        (0, main_js_1.setUsingCustomControls)(i, false, baseGamepadInfo);
        (0, controllermenu_js_1.updateControllerMenu)(false, ["Controller bindings have been reset.", "Click the start button to begin calibration."], 0);
        setTimeout(() => preCalibrationLoop(i, j, baseGamepadInfo, interval), 16);
    }
    else if (clickObject === "center") {
        saveSound();
        (0, main_js_1.setControllerReset)(i);
        (0, controllermenu_js_1.updateControllerMenu)(false, ["Controller has been re-centered.", "Click the start button to begin calibration."], 0);
        setTimeout(() => preCalibrationLoop(i, j, gamepadInfo, interval), 16);
    }
    else if (clickObject === "loadCustom") {
        if (clickObjectNumber === 0) {
            (0, controllermenu_js_1.setCustomInUse)(0);
            const baseGamepadInfo = resetGamepadInfo(j);
            (0, main_js_1.setUsingCustomControls)(i, false, baseGamepadInfo);
            (0, controllermenu_js_1.updateControllerMenu)(false, ["Now using default controller bindings.", "Click the start button to begin calibration."], 0);
            setTimeout(() => preCalibrationLoop(i, j, baseGamepadInfo, interval), 16);
        }
        else {
            const newCustomGamepadInfo = (0, custom_js_1.getCustomGamepadInfo)(clickObjectNumber);
            if (newCustomGamepadInfo === null || exports.customGamepadInfoIsUsable[clickObjectNumber] !== true) {
                sfx_js_1.sounds.deny.play();
                setTimeout(() => preCalibrationLoop(i, j, gamepadInfo, interval), 16);
            }
            else {
                const newGamepadInfo = newCustomGamepadInfo.gamepadInfo;
                (0, controllermenu_js_1.setCustomInUse)(clickObjectNumber);
                (0, custom_js_1.setCustomGamepadInfo)(j, newGamepadInfo);
                (0, main_js_1.setUsingCustomControls)(i, true);
                (0, controllermenu_js_1.updateControllerMenu)(false, ["Now using custom bindings #" + clickObjectNumber + ".", "Click the start button to begin calibration."], 0);
                setTimeout(() => preCalibrationLoop(i, j, newGamepadInfo, interval), 16);
            }
        }
    }
    else if (clickObject === "saveCustom") {
        if (clickObjectNumber < 1) {
            sfx_js_1.sounds.deny.play();
        }
        else {
            exports.customGamepadInfoIsUsable[clickObjectNumber] = true;
            (0, custom_js_1.storeCustomGamepadInfo)(gamepadInfo, (0, gamepad_js_1.getGamepad)(j).id, ("custom" + clickObjectNumber), clickObjectNumber);
            (0, controllermenu_js_1.setCustomInUse)(clickObjectNumber);
        }
        setTimeout(() => preCalibrationLoop(i, j, gamepadInfo, interval), 16);
    }
    else {
        if (clickObject === "icon") {
            sfx_js_1.sounds.shout8.play();
            sfx_js_1.sounds.sword3.play();
        }
        setTimeout(() => preCalibrationLoop(i, j, gamepadInfo, interval), 16);
    }
    clickObject = null;
}
;
function calibrationLoop(i, j, gamepadInfo, snapshots, interval) {
    if (clickObject === null) {
        setTimeout(() => {
            calibrationLoop(i, j, gamepadInfo, snapshots, interval);
        }, 16);
    }
    else {
        calibrateObject(i, j, gamepadInfo, snapshots, interval);
    }
}
;
function calibrateObject(i, j, gamepadInfo, snapshots, interval) {
    let texts;
    let gamepad;
    let totalInterval = interval + 16;
    if (clickObject === null) {
        console.log("error in function 'calibrateObject': calibration called on null object");
    }
    else if (clickObject === "icon") {
        sfx_js_1.sounds.shout8.play();
        sfx_js_1.sounds.sword3.play();
    }
    else if (clickObject === "exit") {
        sfx_js_1.sounds.menuBack.play();
        setCalibrationInProgress(i, false);
        (0, controllermenu_js_1.updateControllerMenu)(true, ["Quitting calibration menu."], interval);
    }
    else if (clickObject === "reset") {
        sfx_js_1.sounds.loudelectricfizz.play();
        (0, controllermenu_js_1.setCustomInUse)(0);
        const baseGamepadInfo = resetGamepadInfo(j);
        (0, custom_js_1.setCustomGamepadInfo)(j, baseGamepadInfo);
        (0, main_js_1.setUsingCustomControls)(i, false, baseGamepadInfo);
        (0, controllermenu_js_1.updateControllerMenu)(false, ["Controller bindings have been reset.", "Click the start button to begin calibration."], 0);
        setTimeout(() => preCalibrationLoop(i, j, baseGamepadInfo, interval), 16);
    }
    else if (clickObject === "center") {
        saveSound();
        (0, main_js_1.setControllerReset)(i);
        (0, controllermenu_js_1.updateControllerMenu)(false, ["Controller has been re-centered.", "Click the start button to continue calibration."], 0);
        setTimeout(() => preCalibrationLoop(i, j, gamepadInfo, interval), 16);
        totalInterval = 16;
    }
    else if (clickObject === "loadCustom") {
        if (clickObjectNumber === 0) {
            (0, controllermenu_js_1.setCustomInUse)(0);
            const baseGamepadInfo = resetGamepadInfo(j);
            (0, main_js_1.setUsingCustomControls)(i, false, baseGamepadInfo);
            (0, controllermenu_js_1.updateControllerMenu)(false, ["Now using default controller bindings.", "Click the start button to begin calibration."], 0);
            setTimeout(() => preCalibrationLoop(i, j, baseGamepadInfo, interval), 16);
        }
        else {
            const newCustomGamepadInfo = (0, custom_js_1.getCustomGamepadInfo)(clickObjectNumber);
            if (newCustomGamepadInfo === null || exports.customGamepadInfoIsUsable[clickObjectNumber] !== true) {
                sfx_js_1.sounds.deny.play();
                setTimeout(() => preCalibrationLoop(i, j, gamepadInfo, interval), 16);
            }
            else {
                const newGamepadInfo = newCustomGamepadInfo.gamepadInfo;
                (0, controllermenu_js_1.setCustomInUse)(clickObjectNumber);
                (0, custom_js_1.setCustomGamepadInfo)(j, newGamepadInfo);
                (0, main_js_1.setUsingCustomControls)(i, true);
                (0, controllermenu_js_1.updateControllerMenu)(false, ["Now using custom bindings #" + clickObjectNumber + ".", "Click the start button to begin calibration."], 0);
                setTimeout(() => preCalibrationLoop(i, j, newGamepadInfo, interval), 16);
            }
        }
    }
    else if (clickObject === "saveCustom") {
        if (clickObjectNumber < 1) {
            sfx_js_1.sounds.deny.play();
        }
        else {
            exports.customGamepadInfoIsUsable[clickObjectNumber] = true;
            (0, custom_js_1.storeCustomGamepadInfo)(gamepadInfo, (0, gamepad_js_1.getGamepad)(j).id, ("custom" + clickObjectNumber), clickObjectNumber);
            (0, controllermenu_js_1.setCustomInUse)(clickObjectNumber);
        }
    }
    else if (clickObject === "l" || clickObject === "r") {
        texts = ["Fully depress " + clickObject.toUpperCase() + " trigger.", "Keep holding down the trigger."];
        const t = clickObject; // passed as-is in the closure
        const tA = clickObject + "A";
        (0, controllermenu_js_1.updateControllerMenu)(false, texts, interval);
        setTimeout(() => {
            saveSound();
            gamepad = (0, gamepad_js_1.getGamepad)(j);
            gamepadInfo[t] = scanForButton(snapshots.b0, gamepad.buttons, snapshots.a0, gamepad.axes, true);
            gamepadInfo[tA] = scanForTrigger(snapshots.b0, gamepad.buttons, snapshots.a0, gamepad.axes);
            (0, controllermenu_js_1.updateControllerMenu)(false, defaultTexts, 0);
            if (t === "l" && gamepadInfo.lA !== null && (gamepadInfo.lA.kind === "value" || gamepadInfo.lA.kind === "axis")) {
                gamepadInfo.isGC = Math.abs(gamepadInfo.lA.min + 0.866) < 0.01 ? true : false; // hacky but hey
            }
        }, interval);
    }
    else if (clickObject === "ls" || clickObject === "cs" || clickObject === "dpad") {
        let sep = ",";
        if (clickObject === "ls") {
            texts = ["Move left analog stick all the way ", "and keep it there."];
        }
        else if (clickObject === "cs") {
            texts = ["Move c-stick all the way ", "and keep it there."];
        }
        else {
            sep = ".";
            texts = ["Press and hold d-pad "];
        }
        totalInterval += 5 * interval;
        (0, controllermenu_js_1.updateControllerMenu)(false, [texts[0] + "left" + sep, texts[1]], 1.5 * interval);
        setTimeout(() => {
            saveSound();
            gamepad = (0, gamepad_js_1.getGamepad)(j);
            snapshots.bL = (0, deepCopy_js_1.deepCopyArray)(true, gamepad.buttons);
            snapshots.aL = (0, deepCopy_js_1.deepCopyArray)(true, gamepad.axes);
            (0, controllermenu_js_1.updateControllerMenu)(false, [texts[0] + "right" + sep, texts[1]], 1.5 * interval);
        }, 1.5 * interval);
        setTimeout(() => {
            saveSound();
            gamepad = (0, gamepad_js_1.getGamepad)(j);
            snapshots.bR = (0, deepCopy_js_1.deepCopyArray)(true, gamepad.buttons);
            snapshots.aR = (0, deepCopy_js_1.deepCopyArray)(true, gamepad.axes);
            (0, controllermenu_js_1.updateControllerMenu)(false, [texts[0] + "up" + sep, texts[1]], 1.5 * interval);
        }, 3 * interval);
        setTimeout(() => {
            saveSound();
            gamepad = (0, gamepad_js_1.getGamepad)(j);
            snapshots.bU = (0, deepCopy_js_1.deepCopyArray)(true, gamepad.buttons);
            snapshots.aU = (0, deepCopy_js_1.deepCopyArray)(true, gamepad.axes);
            (0, controllermenu_js_1.updateControllerMenu)(false, [texts[0] + "down" + sep, texts[1]], 1.5 * interval);
        }, 4.5 * interval);
        if (clickObject === "dpad") {
            setTimeout(() => {
                saveSound();
                gamepad = (0, gamepad_js_1.getGamepad)(j);
                gamepadInfo.dpad = scanForDPad(snapshots.b0, snapshots.bL, snapshots.bR, snapshots.bU, gamepad.buttons, snapshots.a0, snapshots.aL, snapshots.aR, snapshots.aU, gamepad.axes);
                (0, controllermenu_js_1.updateControllerMenu)(false, defaultTexts, 0);
            }, 6 * interval);
        }
        else {
            const clickNow = clickObject; // passed as-is in the closure
            setTimeout(() => {
                saveSound();
                gamepad = (0, gamepad_js_1.getGamepad)(j);
                gamepadInfo[clickNow] = scanForStick(snapshots.b0, snapshots.bL, snapshots.bR, snapshots.bU, gamepad.buttons, snapshots.a0, snapshots.aL, snapshots.aR, snapshots.aU, gamepad.axes);
                (0, controllermenu_js_1.updateControllerMenu)(false, defaultTexts, 0);
            }, 6 * interval);
        }
    }
    else { // only plain buttons left now
        const buttonName = clickObject === "s" ? "start" : clickObject.toUpperCase();
        texts = ["Press and hold " + buttonName + "."];
        const clickNow = clickObject;
        (0, controllermenu_js_1.updateControllerMenu)(false, texts, interval);
        setTimeout(() => {
            saveSound();
            gamepad = (0, gamepad_js_1.getGamepad)(j);
            gamepadInfo[clickNow] = scanForButton(snapshots.b0, gamepad.buttons, snapshots.a0, gamepad.axes);
            (0, controllermenu_js_1.updateControllerMenu)(false, defaultTexts, 0);
        }, interval);
    }
    if (clickObject !== "exit" && clickObject !== "reset" && clickObject !== "center" && clickObject !== "loadCustom") {
        if (clickObject !== null) {
            sfx_js_1.sounds.blunthit.play();
            setTimeout(() => {
                (0, custom_js_1.setCustomGamepadInfo)(j, gamepadInfo);
                calibrationLoop(i, j, gamepadInfo, snapshots, interval);
            }, totalInterval);
        }
        else {
            setTimeout(() => {
                calibrationLoop(i, j, gamepadInfo, snapshots, interval);
            }, totalInterval);
        }
    }
    if (clickObject !== null && clickObject !== "saveCustom" && clickObject !== "loadCustom"
        && clickObject !== "center" && clickObject !== "icon" && clickObject !== "exit" && clickObject !== "reset") {
        (0, controllermenu_js_1.setCustomInUse)(null);
    }
    if (clickObject !== null) {
        clickObject = null;
    }
}
function scanForButton(buttons0, buttons1, axes0, axes1, onlyPressed = false) {
    let buttonInfo = null;
    const bLg = buttons1.length;
    for (let i = 0; i < bLg; i++) {
        if (detectedButtonPressed(buttons0[i].pressed, buttons1[i].pressed)) {
            buttonInfo = { kind: "pressed", index: i };
            break;
        }
        else if (!onlyPressed && detectedButtonValue(buttons0[i].value, buttons1[i].value)) {
            buttonInfo = { kind: "value", index: i, threshold: 0.75 };
            break;
        }
    }
    if (!onlyPressed && buttonInfo === null) {
        const aLg = axes1.length;
        for (let j = 0; j < aLg; j++) {
            if (detectedButtonValue(axes0[j], axes1[j])) {
                buttonInfo = { kind: "axis", index: j, threshold: 0.75 };
                break;
            }
        }
    }
    return buttonInfo;
}
;
function detectedButtonPressed(pressed0, pressed1) {
    return pressed1 && !pressed0;
}
;
function detectedButtonValue(value0, value1) {
    return (value0 < 0.25 && value1 > 0.75);
}
;
function scanForTrigger(buttons0, buttons1, axes0, axes1) {
    let minMax;
    let triggerInfo = null;
    const aLg = axes1.length;
    for (let i = 0; i < aLg && triggerInfo === null; i++) {
        minMax = detectedTrigger(axes0[i], axes1[i]);
        if (minMax !== null) {
            triggerInfo = { kind: "axis", index: i, min: minMax[0], max: minMax[1] };
            break;
        }
    }
    if (triggerInfo === null) {
        const bLg = buttons1.length;
        for (let j = 0; j < bLg && triggerInfo === null; j++) {
            minMax = detectedTrigger(buttons0[j].value, buttons1[j].value);
            if (minMax !== null) {
                triggerInfo = { kind: "value", index: j, min: minMax[0], max: minMax[1] };
                break;
            }
        }
    }
    return triggerInfo;
}
function detectedTrigger(axis0, axis1) {
    if (Math.abs(axis1 - axis0) < 0.5) {
        return null;
    }
    else {
        return getMinAndMax(axis0, axis1);
    }
}
function getMinAndMax(axis0, axis1) {
    const min = axis0 < -0.87 ? -1 : axis0 < -0.5 ? -0.866 : axis0 > 0.87 ? 1 : axis0 > 0.5 ? 0.8667 : 0;
    const max = min === 0 ? Math.sign(axis1) : -min;
    return [min, max];
}
function scanForStick(buttons0, buttonsL, buttonsR, buttonsU, buttonsD, axes0, axesL, axesR, axesU, axesD) {
    let stickInfo = null;
    let xDiff = 0;
    let yDiff = 0;
    let newXDiff = 0;
    let newYDiff = 0;
    let xIndex;
    let yIndex;
    let kind;
    let cardinals = null;
    const aLg = axes0.length;
    kind = "axes";
    for (let i = 0; i < aLg; i++) {
        newXDiff = axesR[i] - axesL[i];
        if (Math.abs(newXDiff) > Math.abs(xDiff)) {
            xDiff = newXDiff;
            xIndex = i;
        }
        newYDiff = axesU[i] - axesD[i];
        if (Math.abs(newYDiff) > Math.abs(yDiff)) {
            yDiff = newYDiff;
            yIndex = i;
        }
    }
    if (xIndex !== undefined && yIndex !== undefined && Math.abs(xDiff) > 0.5 && Math.abs(yDiff) > 0.5) {
        cardinals = {
            center: new Vec2D_js_1.Vec2D(axes0[xIndex], axes0[yIndex]),
            left: axesL[xIndex],
            right: axesR[xIndex],
            up: axesU[yIndex],
            down: axesD[yIndex]
        };
    }
    if (Math.abs(xDiff) < 0.5 || Math.abs(yDiff) < 0.5) {
        const bLg = buttons0.length;
        kind = "value";
        for (let j = 0; j < bLg; j++) {
            newXDiff = buttonsR[j].value - buttonsL[j].value;
            if (Math.abs(newXDiff) > Math.abs(xDiff)) {
                xDiff = newXDiff;
                xIndex = j;
            }
            newYDiff = buttonsU[j].value - buttonsD[j].value;
            if (Math.abs(newYDiff) > Math.abs(yDiff)) {
                yDiff = newYDiff;
                yIndex = j;
            }
        }
        if (xIndex !== undefined && yIndex !== undefined && Math.abs(xDiff) > 0.5 && Math.abs(yDiff) > 0.5) {
            cardinals = {
                center: new Vec2D_js_1.Vec2D(buttons0[xIndex].value, buttons0[yIndex].value),
                left: buttonsL[xIndex].value,
                right: buttonsR[xIndex].value,
                up: buttonsU[yIndex].value,
                down: buttonsD[yIndex].value
            };
        }
    }
    if (xIndex !== undefined && yIndex !== undefined) {
        if (kind === "axes") {
            stickInfo = { kind: "axes", xIndex: xIndex, yIndex: yIndex, cardinals: cardinals };
        }
        else {
            stickInfo = { kind: "value", xIndex: xIndex, yIndex: yIndex, cardinals: cardinals };
        }
    }
    return stickInfo;
}
function scanForDPad(buttons0, buttonsL, buttonsR, buttonsU, buttonsD, axes0, axesL, axesR, axesU, axesD) {
    let dPadInfo = null;
    const bLg = buttons0.length;
    let lIndex;
    let rIndex;
    let uIndex;
    let dIndex;
    for (let i = 0; i < bLg; i++) {
        if (lIndex === undefined && detectedButtonPressed(buttons0[i].pressed, buttonsL[i].pressed)) {
            lIndex = i;
        }
        if (rIndex === undefined && detectedButtonPressed(buttons0[i].pressed, buttonsR[i].pressed)) {
            rIndex = i;
        }
        if (uIndex === undefined && detectedButtonPressed(buttons0[i].pressed, buttonsU[i].pressed)) {
            uIndex = i;
        }
        if (dIndex === undefined && detectedButtonPressed(buttons0[i].pressed, buttonsD[i].pressed)) {
            dIndex = i;
        }
    }
    if (lIndex !== undefined && rIndex !== undefined && uIndex !== undefined && dIndex !== undefined) {
        dPadInfo = {
            kind: "buttons",
            upIndex: uIndex, downIndex: dIndex,
            leftIndex: lIndex, rightIndex: rIndex
        };
    }
    else {
        let xDiff = 0;
        let yDiff = 0;
        let newXDiff = 0;
        let newYDiff = 0;
        let xIndex;
        let yIndex;
        const aLg = axes0.length;
        for (let i = 0; i < aLg; i++) {
            newXDiff = axesR[i] - axesL[i];
            if (Math.abs(newXDiff) > Math.abs(xDiff)) {
                xDiff = newXDiff;
                xIndex = i;
            }
            newYDiff = axesU[i] - axesD[i];
            if (Math.abs(newYDiff) > Math.abs(yDiff)) {
                yDiff = newYDiff;
                yIndex = i;
            }
        }
        if (xIndex !== undefined && yIndex !== undefined) {
            if (Math.abs(xDiff) > 0.5 && Math.abs(yDiff) > 0.5 && xIndex !== yIndex) {
                dPadInfo = {
                    kind: "2axes",
                    xIndex: xIndex, yIndex: yIndex,
                    xFlip: (xDiff < 0), yFlip: (yDiff < 0)
                };
            }
            else { // lol
                dPadInfo = { kind: "axis", index: xIndex };
            }
        }
    }
    return dPadInfo;
}
