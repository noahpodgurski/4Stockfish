"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.customGamepadInfo = void 0;
exports.setCustomGamepadInfo = setCustomGamepadInfo;
exports.storeCustomGamepadInfo = storeCustomGamepadInfo;
exports.getCustomGamepadInfo = getCustomGamepadInfo;
const main_1 = require("../../../main/main");
exports.customGamepadInfo = [null, null, null, null];
function setCustomGamepadInfo(i, gamepadInfo) {
    exports.customGamepadInfo[i] = gamepadInfo;
}
function storeCustomGamepadInfo(gamepadInfo, fullID, name, slot) {
    const customGamepadInfo = { gamepadInfo: gamepadInfo, fullID: fullID, name: name };
    (0, main_1.setCookie)("customGamepad" + slot, JSON.stringify(customGamepadInfo), 365);
}
function getCustomGamepadInfo(slot) {
    const cookie = (0, main_1.getCookie)("customGamepad" + slot);
    if (cookie === null || cookie === undefined || cookie === '') {
        return null;
    }
    else {
        const customGamepadInfo = JSON.parse(cookie);
        if (customGamepadInfo === undefined) {
            return null;
        }
        else {
            return customGamepadInfo;
        }
    }
}
