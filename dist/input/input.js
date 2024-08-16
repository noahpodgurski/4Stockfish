"use strict";
/*eslint indent:0*/
// @flow
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customCenters = exports.keyboardMap = exports.aiInputBank = exports.aiPlayer4 = exports.aiPlayer3 = exports.aiPlayer2 = exports.aiPlayer1 = exports.nullInputs = exports.nullInput = void 0;
exports.inputData = inputData;
exports.pollInputs = pollInputs;
exports.showButton = showButton;
exports.setCustomCenters = setCustomCenters;
const Vec2D_1 = require("../main/util/Vec2D");
const settings_1 = require("../settings");
const main_1 = require("../main/main");
const retrieveGamepadInputs_1 = require("./gamepad/retrieveGamepadInputs");
const meleeInputs_1 = require("./meleeInputs");
const jquery_1 = __importDefault(require("jquery"));
const replay_1 = require("../main/replay");
const streamclient_1 = require("../main/multiplayer/streamclient");
function inputData(list = [false, false, false, false, false, false, false, false, false, false, false, false, 0, 0, 0, 0, 0, 0]) {
    return {
        a: list[0],
        b: list[1],
        x: list[2],
        y: list[3],
        z: list[4],
        r: list[5],
        l: list[6],
        s: list[7],
        du: list[8],
        dr: list[9],
        dd: list[10],
        dl: list[11],
        lsX: (0, meleeInputs_1.deaden)(list[12]),
        lsY: (0, meleeInputs_1.deaden)(list[13]),
        csX: (0, meleeInputs_1.deaden)(list[14]),
        csY: (0, meleeInputs_1.deaden)(list[15]),
        lA: list[16],
        rA: list[17],
        rawX: list[12],
        rawY: list[13],
        rawcsX: list[14],
        rawcsY: list[15]
    };
}
;
const nullInput = () => inputData();
exports.nullInput = nullInput;
const nullInputs = () => [inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData()
];
exports.nullInputs = nullInputs;
exports.aiPlayer1 = [inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData()
];
exports.aiPlayer2 = [inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData()
];
exports.aiPlayer3 = [inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData()
];
exports.aiPlayer4 = [inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData(),
    inputData()
];
exports.aiInputBank = [exports.aiPlayer1, exports.aiPlayer2, exports.aiPlayer3, exports.aiPlayer4];
// should be able to move out the "frameByFrame" aspect of the following function
// it is only used to make z button mean "left trigger value = 0.35" + "A = true".
function pollInputs(gameMode, frameByFrame, controllerInfo, playerSlot, controllerIndex, keys, playertype) {
    // input is the input for player i in the current frame
    let input = (0, exports.nullInput)(); // initialise with default values
    if (replay_1.replayActive) {
        input = pollReplayInputs(gameMode, controllerInfo, playerSlot, controllerIndex, frameByFrame);
    }
    else if (playertype === 1 && gameMode === 3) {
        return exports.aiInputBank[playerSlot][0];
    }
    else if (controllerInfo === "keyboard") { // keyboard controls
        input = pollKeyboardInputs(gameMode, frameByFrame, keys);
        // } else if (playertype === 2 || controllerInfo === 99) { // np: online play?
        //   input = pollNetworkInputs(gameMode, controllerInfo, playerSlot, controllerIndex, frameByFrame);
    }
    else if (playertype === 0) {
        input = pollGamepadInputs(gameMode, controllerInfo, playerSlot, controllerIndex, frameByFrame);
    }
    return input;
}
function pollNetworkInputs(gameMode, controllerType, playerSlot, controllerIndex, frameByFrame) {
    return (0, streamclient_1.retrieveNetworkInputs)(playerSlot, controllerIndex);
}
function pollReplayInputs(gameMode, controllerType, playerSlot, controllerIndex, frameByFrame) {
    return (0, replay_1.retrieveReplayInputs)(playerSlot, controllerIndex);
}
function pollKeyboardInputs(gameMode, frameByFrame, keys) {
    const input = (0, exports.nullInput)(); // initialise with default values
    let stickR = 1;
    let stickL = 1;
    let stickU = 1;
    let stickD = 1;
    if (gameMode === 3 || gameMode === 5) {
        stickR = settings_1.keyMap.lstick.ranges[1];
        stickL = settings_1.keyMap.lstick.ranges[2];
        stickU = settings_1.keyMap.lstick.ranges[0];
        stickD = settings_1.keyMap.lstick.ranges[3];
    }
    let lstickX = (keys[settings_1.keyMap.lstick.right[0]] || keys[settings_1.keyMap.lstick.right[1]]) ? ((keys[settings_1.keyMap.lstick.left[0]] ||
        keys[settings_1.keyMap.lstick.left[1]]) ? 0 : stickR) : ((keys[settings_1.keyMap.lstick.left[0]] || keys[settings_1.keyMap.lstick.left[1]]) ?
        -stickL : 0);
    let lstickY = (keys[settings_1.keyMap.lstick.up[0]] || keys[settings_1.keyMap.lstick.up[1]]) ? ((keys[settings_1.keyMap.lstick.down[0]] || keys[settings_1.keyMap.lstick.down[1]]) ? 0 : stickU) : ((keys[settings_1.keyMap.lstick.down[0]] || keys[settings_1.keyMap.lstick.down[1]]) ? -stickD : 0);
    let lAnalog = (keys[settings_1.keyMap.shoulders.lAnalog[0]] || keys[settings_1.keyMap.shoulders.lAnalog[1]]) ? settings_1.keyMap.shoulders.ranges[0] : 0;
    let rAnalog = (keys[settings_1.keyMap.shoulders.rAnalog[0]] || keys[settings_1.keyMap.shoulders.rAnalog[1]]) ? settings_1.keyMap.shoulders.ranges[1] : 0;
    if (gameMode === 3 || gameMode === 5) {
        for (let j = 0; j < 5; j++) {
            if (keys[settings_1.keyMap.lstick.modifiers[j][0]]) {
                lstickX *= settings_1.keyMap.lstick.modifiers[j][1];
                lstickY *= settings_1.keyMap.lstick.modifiers[j][2];
            }
            if (keys[settings_1.keyMap.shoulders.modifiers[j][0]]) {
                lAnalog *= settings_1.keyMap.shoulders.modifiers[j][1];
                rAnalog *= settings_1.keyMap.shoulders.modifiers[j][2];
            }
        }
    }
    lstickX = Math.sign(lstickX) * Math.min(1, Math.abs(lstickX));
    lstickY = Math.sign(lstickY) * Math.min(1, Math.abs(lstickY));
    lAnalog = Math.min(1, Math.abs(lAnalog));
    rAnalog = Math.min(1, Math.abs(rAnalog));
    const cstickX = (keys[settings_1.keyMap.cstick.right[0]] || keys[settings_1.keyMap.cstick.right[1]]) ? ((keys[settings_1.keyMap.cstick.left[0]] ||
        keys[settings_1.keyMap.cstick.left[1]]) ? 0 : 1) : ((keys[settings_1.keyMap.cstick.left[0]] || keys[settings_1.keyMap.cstick.left[1]]) ? -1 :
        0);
    const cstickY = (keys[settings_1.keyMap.cstick.up[0]] || keys[settings_1.keyMap.cstick.up[1]]) ? ((keys[settings_1.keyMap.cstick.down[0]] || keys[settings_1.keyMap.cstick.down[1]]) ? 0 : 1) : ((keys[settings_1.keyMap.cstick.down[0]] || keys[settings_1.keyMap.cstick.down[1]]) ? -1 : 0);
    const rescaledLStick = (0, meleeInputs_1.tasRescale)(lstickX, lstickY, true);
    input.lsX = (0, meleeInputs_1.deaden)(rescaledLStick[0]);
    input.lsY = (0, meleeInputs_1.deaden)(rescaledLStick[1]);
    input.rawX = rescaledLStick[0];
    input.rawY = rescaledLStick[1];
    const rescaledCStick = (0, meleeInputs_1.tasRescale)(cstickX, cstickY, true);
    input.csX = (0, meleeInputs_1.deaden)(rescaledCStick[0]);
    input.csY = (0, meleeInputs_1.deaden)(rescaledCStick[1]);
    input.rawcsX = rescaledCStick[0];
    input.rawcsY = rescaledCStick[1];
    input.lA = lAnalog;
    input.rA = rAnalog;
    input.s = keys[settings_1.keyMap.s[0]] || keys[settings_1.keyMap.s[1]];
    input.x = keys[settings_1.keyMap.x[0]] || keys[settings_1.keyMap.x[1]];
    input.a = keys[settings_1.keyMap.a[0]] || keys[settings_1.keyMap.a[1]];
    input.b = keys[settings_1.keyMap.b[0]] || keys[settings_1.keyMap.b[1]];
    input.y = keys[settings_1.keyMap.y[0]] || keys[settings_1.keyMap.y[1]];
    input.r = keys[settings_1.keyMap.r[0]] || keys[settings_1.keyMap.r[1]];
    input.l = keys[settings_1.keyMap.l[0]] || keys[settings_1.keyMap.l[1]];
    input.z = keys[settings_1.keyMap.z[0]] || keys[settings_1.keyMap.z[1]];
    input.dl = keys[settings_1.keyMap.dl[0]];
    input.dd = keys[settings_1.keyMap.dd[0]];
    input.dr = keys[settings_1.keyMap.dr[0]];
    input.du = keys[settings_1.keyMap.du[0]];
    if (!frameByFrame && gameMode !== 4 && gameMode !== 14) { // not in target builder, calibration screen, or frame by frame mode
        if (input.z) {
            if (input.lA < 0.35) {
                input.lA = 0.35;
            }
            input.a = true;
        }
    }
    if (input.l) {
        input.lA = 1;
    }
    if (input.r) {
        input.rA = 1;
    }
    return input;
}
function pollGamepadInputs(gameMode, gamepadInfo, playerSlot, controllerIndex, frameByFrame) {
    const input = (0, exports.nullInput)();
    if (navigator.getGamepads === undefined) {
        return input;
    }
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[controllerIndex];
    if (gamepad === null || gamepad === undefined) {
        return input;
    }
    // -------------------------------------------------------
    // analog sticks
    const fixedGamepad = gamepad; //todo fix??
    const lsVec = (0, retrieveGamepadInputs_1.stickValue)(fixedGamepad, gamepadInfo, "ls");
    const csVec = (0, retrieveGamepadInputs_1.stickValue)(fixedGamepad, gamepadInfo, "cs");
    const isGC = gamepadInfo.isGC;
    let lsCardinals = null;
    if (gamepadInfo.ls !== null) {
        lsCardinals = gamepadInfo.ls.cardinals;
    }
    let csCardinals = null;
    if (gamepadInfo.cs !== null) {
        csCardinals = gamepadInfo.cs.cardinals;
    }
    const lsticks = (0, meleeInputs_1.scaleToMeleeAxes)(lsVec.x // x-axis data
    , lsVec.y // y-axis data
    , isGC, lsCardinals, custcent[playerSlot].ls.x // x-axis "custom center" offset
    , custcent[playerSlot].ls.y // y-axis "custom center" offset
    );
    const csticks = (0, meleeInputs_1.scaleToMeleeAxes)(csVec.x, csVec.y, isGC, csCardinals, custcent[playerSlot].cs.x, custcent[playerSlot].cs.y);
    input.lsX = (0, meleeInputs_1.deaden)(lsticks[0]);
    input.lsY = (0, meleeInputs_1.deaden)(lsticks[1]);
    input.csX = (0, meleeInputs_1.deaden)(csticks[0]);
    input.csY = (0, meleeInputs_1.deaden)(csticks[1]);
    input.rawX = lsticks[0];
    input.rawY = lsticks[1];
    input.rawcsX = csticks[0];
    input.rawcsY = csticks[1];
    // -------------------------------------------------------
    // buttons
    input.s = (0, retrieveGamepadInputs_1.buttonState)(fixedGamepad, gamepadInfo, "s");
    input.x = (0, retrieveGamepadInputs_1.buttonState)(fixedGamepad, gamepadInfo, "x");
    input.a = (0, retrieveGamepadInputs_1.buttonState)(fixedGamepad, gamepadInfo, "a");
    input.b = (0, retrieveGamepadInputs_1.buttonState)(fixedGamepad, gamepadInfo, "b");
    input.y = (0, retrieveGamepadInputs_1.buttonState)(fixedGamepad, gamepadInfo, "y");
    input.z = (0, retrieveGamepadInputs_1.buttonState)(fixedGamepad, gamepadInfo, "z");
    // -------------------------------------------------------
    // triggers
    input.l = (0, retrieveGamepadInputs_1.buttonState)(fixedGamepad, gamepadInfo, "l");
    input.r = (0, retrieveGamepadInputs_1.buttonState)(fixedGamepad, gamepadInfo, "r");
    if (gamepadInfo.lA !== null) {
        const lA = gamepadInfo.lA;
        if (lA.kind === "light") {
            input.lA = (0, retrieveGamepadInputs_1.triggerValue)(fixedGamepad, gamepadInfo, "lA");
        }
        else {
            input.lA = (0, meleeInputs_1.scaleToGCTrigger)((0, retrieveGamepadInputs_1.triggerValue)(fixedGamepad, gamepadInfo, "lA") // raw trigger value
            , -lA.min - custcent[playerSlot].l // offset
            , lA.max - lA.min // scaling
            );
        }
    }
    if (gamepadInfo.rA !== null) {
        const rA = gamepadInfo.rA;
        if (rA.kind === "light") {
            input.rA = (0, retrieveGamepadInputs_1.triggerValue)(fixedGamepad, gamepadInfo, "rA");
        }
        else {
            input.rA = (0, meleeInputs_1.scaleToGCTrigger)((0, retrieveGamepadInputs_1.triggerValue)(fixedGamepad, gamepadInfo, "rA") // raw trigger value
            , -rA.min - custcent[playerSlot].r // offset
            , rA.max - rA.min // scaling
            );
        }
    }
    if (main_1.controllerResetCountdowns[playerSlot] === 0) {
        setCustomCenters(playerSlot, lsVec, csVec, input.lA, input.rA);
    }
    if (!frameByFrame && gameMode !== 4 && gameMode !== 14) { // not in target builder or calibration screen
        if (input.z) {
            if (input.lA < 0.35) {
                input.lA = 0.35;
            }
            input.a = true;
        }
    }
    if (gameMode !== 14) {
        if (input.l) {
            input.lA = 1;
        }
        if (input.r) {
            input.rA = 1;
        }
        if (input.lA > 0.95) {
            input.l = true;
        }
        if (input.rA > 0.95) {
            input.r = true;
        }
    }
    // -------------------------------------------------------
    // d-pad
    const dPadData = (0, retrieveGamepadInputs_1.dPadState)(fixedGamepad, gamepadInfo);
    input.dl = dPadData.left;
    input.dd = dPadData.down;
    input.dr = dPadData.right;
    input.du = dPadData.up;
    return input;
}
;
function showButton(i, but, boolean) {
    if (boolean) {
        (0, jquery_1.default)("#" + i + "button" + but).show();
    }
    else {
        (0, jquery_1.default)("#" + i + "button" + but).hide();
    }
}
;
exports.keyboardMap = [
    [102, 186],
    [101, 76],
    [100, 75],
    [104, 79],
    [103, 73],
    [105, 80],
    [107, 192, 222],
    [109, 219], 71, 78, 66, 86
];
class customCenters {
    constructor() {
        this.ls = new Vec2D_1.Vec2D(0, 0);
        this.cs = new Vec2D_1.Vec2D(0, 0);
        this.l = 0;
        this.r = 0;
    }
}
exports.customCenters = customCenters;
;
const custcent = [new customCenters(), new customCenters(), new customCenters(), new customCenters()];
function setCustomCenters(i, ls0, cs0, l0, r0) {
    custcent[i].ls = ls0;
    custcent[i].cs = cs0;
    custcent[i].l = l0;
    custcent[i].r = r0;
}
