"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableStick = exports.keyboardPrompt = exports.keyboardPromptTimer = exports.menuScrollSpeed = exports.enterHeldTimer = exports.enterHeld = exports.settingRange = exports.settingModifierPart = exports.settingModifier = exports.keyListen = exports.kMenuKeyFlash = exports.kMenuSelected = exports.keymapItems = exports.KeymapItem = void 0;
exports.getKeyboardCookie = getKeyboardCookie;
exports.setKeyboardCookie = setKeyboardCookie;
exports.keyboardMenuControls = keyboardMenuControls;
exports.drawKeyboardMenuInit = drawKeyboardMenuInit;
exports.drawKeyboardMenu = drawKeyboardMenu;
const main_1 = require("../main/main");
const settings_1 = require("../settings");
const sfx_1 = require("main/sfx");
const keytest_1 = require("menus/keytest");
const render_1 = require("main/render");
const menu_1 = require("menus/menu");
const Vec2D_1 = require("../main/util/Vec2D");
/* eslint-disable */
class KeymapItem {
    constructor(type, pos, value, binding, index, above, toRight, below, toLeft, modType = 0) {
        this.type = type;
        // 0 = keys, 1 = modifier
        this.pos = pos;
        this.value = value;
        this.binding = binding;
        this.index = index;
        this.above = above;
        this.toRight = toRight;
        this.below = below;
        this.toLeft = toLeft;
        this.modType = modType;
    }
}
exports.KeymapItem = KeymapItem;
exports.keymapItems = {
    "lstickUp1": new KeymapItem(0, new Vec2D_1.Vec2D(150, 120), 87, settings_1.keyMap.lstick.up, 0, "shoulderMod3", "lstickUp2", "lstickRight1", "cstickUp2"),
    "lstickUp2": new KeymapItem(0, new Vec2D_1.Vec2D(230, 120), 0, settings_1.keyMap.lstick.up, 1, "shoulderMod5", "lstickRangeUp", "lstickRight2", "lstickUp1"),
    "lstickRight1": new KeymapItem(0, new Vec2D_1.Vec2D(150, 190), 68, settings_1.keyMap.lstick.right, 0, "lstickUp1", "lstickRight2", "lstickLeft1", "cstickRight2"),
    "lstickRight2": new KeymapItem(0, new Vec2D_1.Vec2D(230, 190), 0, settings_1.keyMap.lstick.right, 1, "lstickUp2", "lstickRangeRight", "lstickLeft2", "lstickRight1"),
    "lstickLeft1": new KeymapItem(0, new Vec2D_1.Vec2D(150, 260), 65, settings_1.keyMap.lstick.left, 0, "lstickRight1", "lstickLeft2", "lstickDown1", "cstickLeft2"),
    "lstickLeft2": new KeymapItem(0, new Vec2D_1.Vec2D(230, 260), 0, settings_1.keyMap.lstick.left, 1, "lstickRight2", "lstickRangeLeft", "lstickDown2", "lstickLeft1"),
    "lstickDown1": new KeymapItem(0, new Vec2D_1.Vec2D(150, 330), 83, settings_1.keyMap.lstick.down, 0, "lstickLeft1", "lstickDown2", "lstickMod3", "cstickDown2"),
    "lstickDown2": new KeymapItem(0, new Vec2D_1.Vec2D(230, 330), 0, settings_1.keyMap.lstick.down, 1, "lstickLeft2", "lstickRangeDown", "lstickMod5", "lstickDown1"),
    "lstickRangeUp": new KeymapItem(2, new Vec2D_1.Vec2D(310, 120), 1.00, settings_1.keyMap.lstick.ranges, 0, "shoulderMod5", "a1", "lstickRangeRight", "lstickUp2"),
    "lstickRangeRight": new KeymapItem(2, new Vec2D_1.Vec2D(310, 190), 1.00, settings_1.keyMap.lstick.ranges, 1, "lstickRangeUp", "b1", "lstickRangeLeft", "lstickRight2"),
    "lstickRangeLeft": new KeymapItem(2, new Vec2D_1.Vec2D(310, 260), 1.00, settings_1.keyMap.lstick.ranges, 2, "lstickRangeRight", "x1", "lstickRangeDown", "lstickLeft2"),
    "lstickRangeDown": new KeymapItem(2, new Vec2D_1.Vec2D(310, 330), 1.00, settings_1.keyMap.lstick.ranges, 3, "lstickRangeLeft", "y1", "lstickMod5", "lstickDown2"),
    "lstickMod1": new KeymapItem(1, new Vec2D_1.Vec2D(100, 430), 32, settings_1.keyMap.lstick.modifiers, 0, "lstickDown1", "lstickMod2", "lAnalog1", "cstickDown2", 0),
    "lstickMod2": new KeymapItem(1, new Vec2D_1.Vec2D(150, 430), 0, settings_1.keyMap.lstick.modifiers, 1, "lstickDown1", "lstickMod3", "lAnalog1", "lstickMod1", 0),
    "lstickMod3": new KeymapItem(1, new Vec2D_1.Vec2D(200, 430), 0, settings_1.keyMap.lstick.modifiers, 2, "lstickDown1", "lstickMod4", "lAnalog1", "lstickMod2", 0),
    "lstickMod4": new KeymapItem(1, new Vec2D_1.Vec2D(250, 430), 0, settings_1.keyMap.lstick.modifiers, 3, "lstickDown2", "lstickMod5", "lAnalog2", "lstickMod3", 0),
    "lstickMod5": new KeymapItem(1, new Vec2D_1.Vec2D(300, 430), 0, settings_1.keyMap.lstick.modifiers, 4, "lstickRangeDown", "y1", "shoulderRangeL", "lstickMod4", 0),
    "lAnalog1": new KeymapItem(0, new Vec2D_1.Vec2D(150, 520), 111, settings_1.keyMap.shoulders.lAnalog, 0, "lstickMod3", "lAnalog2", "rAnalog1", "dpadRight"),
    "lAnalog2": new KeymapItem(0, new Vec2D_1.Vec2D(230, 520), 0, settings_1.keyMap.shoulders.lAnalog, 1, "lstickMod5", "shoulderRangeL", "rAnalog2", "lAnalog1"),
    "rAnalog1": new KeymapItem(0, new Vec2D_1.Vec2D(150, 590), 106, settings_1.keyMap.shoulders.rAnalog, 0, "lAnalog1", "rAnalog2", "shoulderMod3", "dpadLeft"),
    "rAnalog2": new KeymapItem(0, new Vec2D_1.Vec2D(230, 590), 0, settings_1.keyMap.shoulders.rAnalog, 1, "lAnalog2", "shoulderRangeR", "shoulderMod5", "rAnalog1"),
    "shoulderRangeL": new KeymapItem(2, new Vec2D_1.Vec2D(310, 520), 1.00, settings_1.keyMap.shoulders.ranges, 0, "lstickMod5", "l1", "shoulderRangeR", "lAnalog2"),
    "shoulderRangeR": new KeymapItem(2, new Vec2D_1.Vec2D(310, 590), 1.00, settings_1.keyMap.shoulders.ranges, 1, "shoulderRangeL", "r1", "shoulderMod5", "rAnalog2"),
    "shoulderMod1": new KeymapItem(1, new Vec2D_1.Vec2D(100, 690), 0, settings_1.keyMap.shoulders.modifiers, 0, "rAnalog1", "shoulderMod2", "lstickUp1", "dpadDown", 1),
    "shoulderMod2": new KeymapItem(1, new Vec2D_1.Vec2D(150, 690), 0, settings_1.keyMap.shoulders.modifiers, 1, "rAnalog1", "shoulderMod3", "lstickUp1", "shoulderMod1", 1),
    "shoulderMod3": new KeymapItem(1, new Vec2D_1.Vec2D(200, 690), 0, settings_1.keyMap.shoulders.modifiers, 2, "rAnalog2", "shoulderMod4", "lstickUp2", "shoulderMod2", 1),
    "shoulderMod4": new KeymapItem(1, new Vec2D_1.Vec2D(250, 690), 0, settings_1.keyMap.shoulders.modifiers, 3, "rAnalog2", "shoulderMod5", "lstickUp2", "shoulderMod3", 1),
    "shoulderMod5": new KeymapItem(1, new Vec2D_1.Vec2D(300, 690), 0, settings_1.keyMap.shoulders.modifiers, 4, "shoulderRangeR", "s1", "lstickUp2", "shoulderMod4", 1),
    "a1": new KeymapItem(0, new Vec2D_1.Vec2D(550, 145), 76, settings_1.keyMap.a, 0, "s1", "a2", "b1", "lstickRangeRight"),
    "a2": new KeymapItem(0, new Vec2D_1.Vec2D(630, 145), 101, settings_1.keyMap.a, 1, "s2", "cstickRight1", "b2", "a1"),
    "b1": new KeymapItem(0, new Vec2D_1.Vec2D(550, 215), 75, settings_1.keyMap.b, 0, "a1", "b2", "x1", "lstickRangeLeft"),
    "b2": new KeymapItem(0, new Vec2D_1.Vec2D(630, 215), 100, settings_1.keyMap.b, 1, "a2", "cstickLeft1", "x2", "b1"),
    "x1": new KeymapItem(0, new Vec2D_1.Vec2D(550, 285), 186, settings_1.keyMap.x, 0, "b1", "x2", "y1", "lstickRangeDown"),
    "x2": new KeymapItem(0, new Vec2D_1.Vec2D(630, 285), 102, settings_1.keyMap.x, 1, "b2", "cstickDown1", "y2", "x1"),
    "y1": new KeymapItem(0, new Vec2D_1.Vec2D(550, 355), 79, settings_1.keyMap.y, 0, "x1", "y2", "z1", "lstickMod5"),
    "y2": new KeymapItem(0, new Vec2D_1.Vec2D(630, 355), 104, settings_1.keyMap.y, 1, "x2", "cstickDown1", "z2", "y1"),
    "z1": new KeymapItem(0, new Vec2D_1.Vec2D(550, 425), 192, settings_1.keyMap.z, 0, "y1", "z2", "l1", "lstickMod5"),
    "z2": new KeymapItem(0, new Vec2D_1.Vec2D(630, 425), 107, settings_1.keyMap.z, 1, "y2", "dpadUp", "l2", "z1"),
    "l1": new KeymapItem(0, new Vec2D_1.Vec2D(550, 495), 73, settings_1.keyMap.l, 0, "z1", "l2", "r1", "shoulderRangeL"),
    "l2": new KeymapItem(0, new Vec2D_1.Vec2D(630, 495), 103, settings_1.keyMap.l, 1, "z2", "dpadRight", "r2", "l1"),
    "r1": new KeymapItem(0, new Vec2D_1.Vec2D(550, 565), 80, settings_1.keyMap.r, 0, "l1", "r2", "s1", "shoulderRangeR"),
    "r2": new KeymapItem(0, new Vec2D_1.Vec2D(630, 565), 105, settings_1.keyMap.r, 1, "l2", "dpadLeft", "s2", "r1"),
    "s1": new KeymapItem(0, new Vec2D_1.Vec2D(550, 635), 219, settings_1.keyMap.s, 0, "r1", "s2", "a1", "shoulderMod5"),
    "s2": new KeymapItem(0, new Vec2D_1.Vec2D(630, 635), 109, settings_1.keyMap.s, 1, "r2", "dpadDown", "a2", "s1"),
    "cstickUp1": new KeymapItem(0, new Vec2D_1.Vec2D(950, 120), 38, settings_1.keyMap.cstick.up, 0, "dpadDown", "cstickUp2", "cstickRight1", "a2"),
    "cstickUp2": new KeymapItem(0, new Vec2D_1.Vec2D(1030, 120), 0, settings_1.keyMap.cstick.up, 1, "dpadDown", "lstickUp1", "cstickRight2", "cstickUp1"),
    "cstickRight1": new KeymapItem(0, new Vec2D_1.Vec2D(950, 190), 39, settings_1.keyMap.cstick.right, 0, "cstickUp1", "cstickRight2", "cstickLeft1", "b2"),
    "cstickRight2": new KeymapItem(0, new Vec2D_1.Vec2D(1030, 190), 0, settings_1.keyMap.cstick.right, 1, "cstickUp2", "lstickRight1", "cstickLeft2", "cstickRight1"),
    "cstickLeft1": new KeymapItem(0, new Vec2D_1.Vec2D(950, 260), 37, settings_1.keyMap.cstick.left, 0, "cstickRight1", "cstickLeft2", "cstickDown1", "x2"),
    "cstickLeft2": new KeymapItem(0, new Vec2D_1.Vec2D(1030, 260), 0, settings_1.keyMap.cstick.left, 1, "cstickRight2", "lstickLeft1", "cstickDown2", "cstickLeft1"),
    "cstickDown1": new KeymapItem(0, new Vec2D_1.Vec2D(950, 330), 40, settings_1.keyMap.cstick.down, 0, "cstickLeft1", "cstickDown2", "dpadUp", "y2"),
    "cstickDown2": new KeymapItem(0, new Vec2D_1.Vec2D(1030, 330), 0, settings_1.keyMap.cstick.down, 1, "cstickLeft2", "lstickDown1", "dpadUp", "cstickDown1"),
    "dpadUp": new KeymapItem(0, new Vec2D_1.Vec2D(950, 440), 71, settings_1.keyMap.du, 0, "cstickDown1", "lAnalog1", "dpadRight", "z2"),
    "dpadRight": new KeymapItem(0, new Vec2D_1.Vec2D(950, 510), 78, settings_1.keyMap.dr, 0, "dpadUp", "lAnalog1", "dpadLeft", "l2"),
    "dpadLeft": new KeymapItem(0, new Vec2D_1.Vec2D(950, 580), 86, settings_1.keyMap.dl, 0, "dpadRight", "rAnalog1", "dpadDown", "r2"),
    "dpadDown": new KeymapItem(0, new Vec2D_1.Vec2D(950, 650), 66, settings_1.keyMap.dd, 0, "dpadLeft", "shoulderMod1", "cstickUp1", "s2")
};
exports.kMenuSelected = "lstickUp1";
exports.kMenuKeyFlash = 0;
exports.keyListen = false;
exports.settingModifier = false;
exports.settingModifierPart = 0;
exports.settingRange = false;
exports.enterHeld = false;
exports.enterHeldTimer = 0;
exports.menuScrollSpeed = 10;
exports.keyboardPromptTimer = 0;
exports.keyboardPrompt = "";
exports.disableStick = [false, false, false, false];
function getKeyboardCookie() {
    var keys = Object.keys(exports.keymapItems);
    for (var i = 0; i < keys.length; i++) {
        var keymapData = (0, main_1.getCookie)(keys[i]);
        if (keymapData != undefined && keymapData != null && keymapData != "") {
            if (exports.keymapItems[keys[i]].type == 1) {
                // if modifier
                var modVal = keymapData.split("-");
                exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index][0] = parseInt(modVal[0]);
                exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index][1] = parseFloat(modVal[1]);
                exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index][2] = parseFloat(modVal[2]);
            }
            else if (exports.keymapItems[keys[i]].type == 2) {
                // if range
                exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index] = parseFloat((0, main_1.getCookie)(keys[i]));
            }
            else {
                // if button
                exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index] = parseInt((0, main_1.getCookie)(keys[i]));
            }
        }
    }
}
function setKeyboardCookie() {
    var keys = Object.keys(exports.keymapItems);
    for (var i = 0; i < keys.length; i++) {
        if (exports.keymapItems[keys[i]].type == 1) {
            var modVal = exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index];
            (0, main_1.setCookie)(keys[i], "" + modVal[0] + "-" + modVal[1] + "-" + modVal[2], 36500);
        }
        else {
            (0, main_1.setCookie)(keys[i], exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index], 36500);
        }
    }
    console.log(document.cookie);
    console.log(localStorage);
}
function keyboardMenuControls(i, input) {
    var menuMove = false;
    var moveD = "";
    if (input[i][0].lsX == 0 && input[i][0].lsY == 0) {
        exports.disableStick[i] = false;
    }
    if (exports.keyboardPromptTimer > 0) {
        exports.keyboardPromptTimer--;
    }
    exports.kMenuKeyFlash++;
    if (exports.kMenuKeyFlash > 120) {
        exports.kMenuKeyFlash = 0;
    }
    if (exports.settingModifier) {
        if (exports.enterHeldTimer > 60) {
            exports.enterHeldTimer = 0;
            exports.settingModifier = false;
            exports.settingModifierPart = 0;
            exports.keymapItems[exports.kMenuSelected].value = 0;
            exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index][0] = 0;
            exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index][1] = 0.5;
            exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index][2] = 0.5;
            sfx_1.sounds.menuBack.play();
            exports.menuScrollSpeed = 10;
            exports.keyListen = false;
        }
    }
    else {
        if (exports.enterHeldTimer > 60) {
            if (exports.keymapItems[exports.kMenuSelected].type == 1) {
                // mod
                exports.keymapItems[exports.kMenuSelected].value = 0;
                exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index][0] = 0;
                sfx_1.sounds.menuBack.play();
            }
            else if (exports.keymapItems[exports.kMenuSelected].type == 2) {
                sfx_1.sounds.deny.play();
            }
            else {
                // button
                switch (exports.kMenuSelected) {
                    case "lstickUp1":
                    case "lstickDown1":
                    case "lstickLeft1":
                    case "lstickRight1":
                    case "a1":
                    case "b1":
                    case "x1":
                    case "y1":
                    case "z1":
                    case "l1":
                    case "r1":
                    case "s1":
                        sfx_1.sounds.deny.play();
                        exports.keyboardPromptTimer = 100;
                        exports.keyboardPrompt = "Cannot clear";
                        break;
                    default:
                        exports.keymapItems[exports.kMenuSelected].value = 0;
                        exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index] = 0;
                        sfx_1.sounds.menuBack.play();
                        break;
                }
            }
            exports.enterHeldTimer = 0;
            exports.keyListen = false;
        }
    }
    if (exports.keyListen) {
        if (main_1.keyBinding) {
            if (exports.keymapItems[exports.kMenuSelected].type) {
                // modifier
                sfx_1.sounds.menuForward.play();
                exports.keymapItems[exports.kMenuSelected].value = main_1.keyBind;
                exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index][0] = main_1.keyBind;
                exports.settingModifierPart++;
            }
            else {
                //key
                if (main_1.keyBind == 13) {
                    switch (exports.kMenuSelected) {
                        case "lstickUp1":
                        case "lstickUp2":
                        case "lstickDown1":
                        case "lstickDown2":
                        case "lstickLeft1":
                        case "lstickLeft2":
                        case "lstickRight1":
                        case "lstickRight2":
                        case "b1":
                        case "b2":
                        case "a1":
                        case "a2":
                            sfx_1.sounds.deny.play();
                            exports.keyboardPromptTimer = 120;
                            exports.keyboardPrompt = "Not a good idea";
                            break;
                        default:
                            sfx_1.sounds.menuForward.play();
                            exports.keymapItems[exports.kMenuSelected].value = main_1.keyBind;
                            exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index] = main_1.keyBind;
                            break;
                    }
                }
                else {
                    sfx_1.sounds.menuForward.play();
                    exports.keymapItems[exports.kMenuSelected].value = main_1.keyBind;
                    exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index] = main_1.keyBind;
                }
            }
            //input[i].b[0] = true;
            //input[i].b[1] = true;
            exports.disableStick[i] = true;
            exports.keyListen = false;
        }
    }
    else {
        (0, main_1.setKeyBinding)(false);
        if (main_1.keys[13] && !exports.keyListen && !exports.enterHeld) {
            if (exports.settingModifierPart > 0) {
                exports.settingModifierPart++;
                if (exports.settingModifierPart > 2) {
                    exports.settingModifierPart = 0;
                    exports.settingModifier = false;
                    exports.menuScrollSpeed = 10;
                }
            }
            else if (exports.settingRange) {
                exports.settingRange = false;
                exports.menuScrollSpeed = 10;
            }
            else {
                if (exports.keymapItems[exports.kMenuSelected].type == 2) {
                    exports.settingRange = true;
                    exports.menuScrollSpeed = 5;
                }
                else {
                    if (exports.keymapItems[exports.kMenuSelected].type == 1) {
                        exports.settingModifier = true;
                        exports.menuScrollSpeed = 5;
                    }
                    exports.keyListen = true;
                }
            }
            sfx_1.sounds.menuForward.play();
        }
        else if (input[i][0].b && !input[i][1].b) {
            if (!exports.settingModifier && !exports.settingRange) {
                sfx_1.sounds.menuBack.play();
                input[i][1].b = true;
                (0, main_1.changeGamemode)(1);
                setKeyboardCookie();
            }
        }
        else if (input[i][0].lsY > 0.7 && !exports.disableStick[i]) {
            menu_1.stickHoldEach[i] = true;
            if (menu_1.stickHold == 0) {
                moveD = "u";
                menuMove = true;
                (0, menu_1.increaseStick)();
            }
            else {
                (0, menu_1.increaseStick)();
                if (menu_1.stickHold % exports.menuScrollSpeed == 0) {
                    moveD = "u";
                    menuMove = true;
                }
            }
        }
        else if (input[i][0].lsY < -0.7 && !exports.disableStick[i]) {
            menu_1.stickHoldEach[i] = true;
            if (menu_1.stickHold == 0) {
                moveD = "d";
                menuMove = true;
                (0, menu_1.increaseStick)();
            }
            else {
                (0, menu_1.increaseStick)();
                if (menu_1.stickHold % exports.menuScrollSpeed == 0) {
                    moveD = "d";
                    menuMove = true;
                }
            }
        }
        else if (input[i][0].lsX > 0.7 && !exports.disableStick[i]) {
            menu_1.stickHoldEach[i] = true;
            if (menu_1.stickHold == 0) {
                moveD = "r";
                menuMove = true;
                (0, menu_1.increaseStick)();
            }
            else {
                (0, menu_1.increaseStick)();
                if (menu_1.stickHold % exports.menuScrollSpeed == 0) {
                    moveD = "r";
                    menuMove = true;
                }
            }
        }
        else if (input[i][0].lsX < -0.7 && !exports.disableStick[i]) {
            menu_1.stickHoldEach[i] = true;
            if (menu_1.stickHold == 0) {
                menuMove = true;
                moveD = "l";
                (0, menu_1.increaseStick)();
            }
            else {
                (0, menu_1.increaseStick)();
                if (menu_1.stickHold % exports.menuScrollSpeed == 0) {
                    moveD = "l";
                    menuMove = true;
                }
            }
        }
        else {
            menu_1.stickHoldEach[i] = false;
            if (i == main_1.ports - 1) {
                var stickHoldAll = false;
                for (var j = 0; j < main_1.ports; j++) {
                    if (menu_1.stickHoldEach[j]) {
                        stickHoldAll = true;
                        break;
                    }
                }
                if (!stickHoldAll) {
                    (0, menu_1.resetStick)();
                }
            }
        }
        if (menuMove) {
            sfx_1.sounds.menuSelect.play();
            if (exports.settingRange) {
                var rangeValue = exports.keymapItems[exports.kMenuSelected].binding;
                var index = exports.keymapItems[exports.kMenuSelected].index;
                switch (moveD) {
                    case "l":
                        rangeValue[index] -= 0.01;
                        if (rangeValue[index] < 0) {
                            rangeValue[index] = 0;
                        }
                        break;
                    case "r":
                        rangeValue[index] += 0.01;
                        if (rangeValue[index] > 2) {
                            rangeValue[index] = 2;
                        }
                        break;
                    default:
                        break;
                }
            }
            else if (exports.settingModifier) {
                var modifierValue = exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index];
                switch (moveD) {
                    case "l":
                        modifierValue[exports.settingModifierPart] -= 0.01;
                        if (modifierValue[exports.settingModifierPart] < 0) {
                            modifierValue[exports.settingModifierPart] = 0;
                        }
                        break;
                    case "r":
                        modifierValue[exports.settingModifierPart] += 0.01;
                        if (modifierValue[exports.settingModifierPart] > 2) {
                            modifierValue[exports.settingModifierPart] = 2;
                        }
                        break;
                    default:
                        break;
                }
            }
            else {
                exports.kMenuKeyFlash = 0;
                switch (moveD) {
                    case "u":
                        exports.kMenuSelected = exports.keymapItems[exports.kMenuSelected].above;
                        break;
                    case "d":
                        exports.kMenuSelected = exports.keymapItems[exports.kMenuSelected].below;
                        break;
                    case "l":
                        exports.kMenuSelected = exports.keymapItems[exports.kMenuSelected].toLeft;
                        break;
                    case "r":
                        exports.kMenuSelected = exports.keymapItems[exports.kMenuSelected].toRight;
                        break;
                    default:
                        break;
                }
            }
        }
    }
    if (main_1.keys[13]) {
        exports.enterHeld = true;
        exports.enterHeldTimer++;
    }
    else {
        exports.enterHeld = false;
        exports.enterHeldTimer = 0;
    }
}
function drawKeyboardMenuInit() {
    var _a, _b, _c, _d;
    var bgGrad = main_1.bg1.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "rgb(11, 65, 39)");
    bgGrad.addColorStop(1, "rgb(8, 20, 61)");
    main_1.bg1.fillStyle = bgGrad;
    main_1.bg1.fillRect(0, 0, (_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    main_1.fg1.lineWidth = 3;
    main_1.fg1.textAlign = "center";
    main_1.fg1.fillStyle = "rgba(255, 255, 255, 0.65)";
    main_1.fg1.font = "italic 900 60px Arial";
    main_1.fg1.fillText("Keyboard Controls", 600, 75);
    main_1.fg1.font = "italic 900 30px Arial";
    main_1.fg1.fillText("L-stick", 150, 100);
    main_1.fg1.fillText("Shoulder Analog", 200, 495);
    main_1.fg1.fillText("C-stick", 950, 100);
    main_1.fg1.fillText("Dpad", 950, 420);
    var buttonLetters = ["A", "B", "X", "Y", "Z", "L", "R", "S"];
    for (var i = 0; i < buttonLetters.length; i++) {
        main_1.fg1.fillText(buttonLetters[i], 510, 186 + i * 70);
    }
    main_1.fg1.fillText("L", 95, 556);
    main_1.fg1.fillText("R", 95, 626);
    main_1.fg1.font = "italic 900 16px Arial";
    main_1.fg1.fillText("Press Enter to listen for key bind    Hold Enter to clear", 600, 115);
    main_1.fg1.font = "italic 900 20px Arial";
    main_1.fg1.fillText("Modifiers", 200, 405);
    main_1.fg1.fillText("Modifiers", 200, 665);
    main_1.fg1.textAlign = "left";
    var directionPlacements = [new Vec2D_1.Vec2D(75, 153), new Vec2D_1.Vec2D(875, 153), new Vec2D_1.Vec2D(875, 475)];
    for (var i = 0; i < 3; i++) {
        main_1.fg1.fillText("Up", directionPlacements[i].x, directionPlacements[i].y);
        main_1.fg1.fillText("Right", directionPlacements[i].x, directionPlacements[i].y + 70);
        main_1.fg1.fillText("Left", directionPlacements[i].x, directionPlacements[i].y + 140);
        main_1.fg1.fillText("Down", directionPlacements[i].x, directionPlacements[i].y + 210);
    }
}
;
function drawKeyboardMenu() {
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
    var keys = Object.keys(exports.keymapItems);
    for (var i = 0; i < keys.length; i++) {
        if (exports.keymapItems[keys[i]].type == 1) {
            if (keys[i] == exports.kMenuSelected) {
                main_1.ui.fillStyle = "black";
                main_1.ui.fillRect(exports.keymapItems[keys[i]].pos.x - 80, exports.keymapItems[keys[i]].pos.y + 20, 160, 40);
                main_1.ui.fillStyle = "white";
                var text = keytest_1.keyText[exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index][0]];
                main_1.ui.font = "italic 900 " + Math.round(Math.max(8, 23 - (2 * text.length))) + "px Arial";
                if (exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index][0] == 0) {
                    main_1.ui.fillText("empty", exports.keymapItems[keys[i]].pos.x, exports.keymapItems[keys[i]].pos.y + 45);
                }
                else {
                    var modText = (exports.keymapItems[exports.kMenuSelected].modType) ? ["L", "R"] : ["X", "Y"];
                    main_1.ui.fillText(text + " " + modText[0] + ":" + (exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index][1]).toFixed(2) + " " + modText[1] + ":" + (exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index][2]).toFixed(2), exports.keymapItems[keys[i]].pos.x, exports.keymapItems[keys[i]].pos.y + 45);
                }
                main_1.ui.fillStyle = "rgba(200,200,200, " + Math.abs(1 - exports.kMenuKeyFlash / 60) + ")";
                main_1.ui.strokeStyle = "rgba(255, 255, 255, 0.9)";
            }
            else if (exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index][0] == 0) {
                main_1.ui.fillStyle = "rgba(0, 0, 0, 0.5)";
                main_1.ui.strokeStyle = "rgba(255, 255, 255, 0.2)";
            }
            else {
                main_1.ui.fillStyle = "rgb(0, 0, 0)";
                main_1.ui.strokeStyle = "rgba(255, 255, 255, 0.8)";
            }
            main_1.ui.beginPath();
            main_1.ui.arc(exports.keymapItems[keys[i]].pos.x, exports.keymapItems[keys[i]].pos.y, 15, 0, render_1.twoPi);
            main_1.ui.closePath();
            main_1.ui.fill();
            main_1.ui.stroke();
        }
        else if (exports.keymapItems[keys[i]].type == 2) {
            if (keys[i] == exports.kMenuSelected) {
                main_1.ui.fillStyle = "rgba(200,200,200, " + Math.abs(1 - exports.kMenuKeyFlash / 60) + ")";
                main_1.ui.strokeStyle = "rgba(255, 255, 255, 0.9)";
            }
            else {
                main_1.ui.fillStyle = "rgba(0, 0, 0, 0.65)";
                main_1.ui.strokeStyle = "rgba(255, 255, 255, 0.6)";
            }
            var x = exports.keymapItems[keys[i]].pos.x;
            var y = exports.keymapItems[keys[i]].pos.y;
            main_1.ui.beginPath();
            main_1.ui.moveTo(x + 15, y + 10);
            main_1.ui.lineTo(x + 65, y + 10);
            main_1.ui.arc(x + 65, y + 25, 15, 1.5 * Math.PI, 0.5 * Math.PI);
            main_1.ui.lineTo(x + 15, y + 40);
            main_1.ui.arc(x + 15, y + 25, 15, 0.5 * Math.PI, 1.5 * Math.PI);
            main_1.ui.closePath();
            main_1.ui.fill();
            main_1.ui.stroke();
            main_1.ui.strokeStyle = "black";
            main_1.ui.fillStyle = "white";
            main_1.ui.font = "italic 900 20px Arial";
            main_1.ui.strokeText((exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index]).toFixed(2), x + 37, y + 32);
            main_1.ui.fillText((exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index]).toFixed(2), x + 37, y + 32);
            if (exports.settingRange && keys[i] == exports.kMenuSelected) {
                main_1.ui.strokeText("<", x - 15, y + 32);
                main_1.ui.fillText("<", x - 15, y + 32);
                main_1.ui.strokeText(">", x + 90, y + 32);
                main_1.ui.fillText(">", x + 90, y + 32);
                main_1.ui.strokeText("Enter to Confirm", x + 37, y + 60);
                main_1.ui.fillText("Enter to Confirm", x + 37, y + 60);
            }
        }
        else {
            if (keys[i] == exports.kMenuSelected) {
                main_1.ui.fillStyle = "rgba(255, 255, 255, " + Math.abs(1 - exports.kMenuKeyFlash / 60) + ")";
                main_1.ui.strokeStyle = "rgba(255, 255, 255, 0.9)";
            }
            else if (exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index] == 0) {
                main_1.ui.fillStyle = "rgba(31, 31, 31, 0.69)";
                main_1.ui.strokeStyle = "rgba(182, 182, 182, 0.66)";
            }
            else {
                main_1.ui.fillStyle = "rgba(255, 255, 255, 0.2)";
                main_1.ui.strokeStyle = "rgba(255, 255, 255, 0.8)";
            }
            main_1.ui.fillRect(exports.keymapItems[keys[i]].pos.x, exports.keymapItems[keys[i]].pos.y, 50, 50);
            main_1.ui.strokeRect(exports.keymapItems[keys[i]].pos.x, exports.keymapItems[keys[i]].pos.y, 50, 50);
            main_1.ui.fillStyle = "white";
            main_1.ui.strokeStyle = "black";
            var text = keytest_1.keyText[exports.keymapItems[keys[i]].binding[exports.keymapItems[keys[i]].index]];
            main_1.ui.font = "italic 900 " + Math.round(Math.max(8, 25 - (2 * text.length))) + "px Arial";
            main_1.ui.strokeText(text, exports.keymapItems[keys[i]].pos.x + 22, exports.keymapItems[keys[i]].pos.y + 32);
            main_1.ui.fillText(text, exports.keymapItems[keys[i]].pos.x + 22, exports.keymapItems[keys[i]].pos.y + 32);
        }
    }
    if (exports.settingModifier) {
        main_1.ui.fillStyle = "black";
        main_1.ui.fillRect(400, 200, 400, 420);
        main_1.ui.font = "italic 900 40px Arial";
        main_1.ui.fillStyle = "white";
        main_1.ui.fillText("Setting Modifier", 600, 245);
        main_1.ui.font = "italic 900 30px Arial";
        main_1.ui.fillText("Key:", 460, 320);
        if (exports.keymapItems[exports.kMenuSelected].modType) {
            main_1.ui.fillText("L:", 460, 400);
            main_1.ui.fillText("R:", 460, 480);
        }
        else {
            main_1.ui.fillText("X:", 460, 400);
            main_1.ui.fillText("Y:", 460, 480);
        }
        if (exports.keyListen) {
            main_1.ui.fillText("Listening...", 660, 320);
        }
        else {
            main_1.ui.fillText(keytest_1.keyText[exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index][0]], 660, 320);
            main_1.ui.fillText("Enter to confirm", 600, 560);
        }
        for (var i = 0; i < 2; i++) {
            main_1.ui.fillText("<", 580, 400 + i * 80);
            main_1.ui.fillText(">", 740, 400 + i * 80);
            main_1.ui.fillText((exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index][i + 1]).toFixed(2), 660, 400 +
                i * 80);
        }
        main_1.ui.font = "italic 900 20px Arial";
        main_1.ui.fillText("Hold Enter to remove settings", 600, 600);
        main_1.ui.strokeStyle = "rgba(255, 255, 255, " + Math.abs(1 - exports.kMenuKeyFlash / 60) + ")";
        main_1.ui.strokeRect(550, 285 + 80 * exports.settingModifierPart, 220, 50);
    }
    else if (exports.keyListen) {
        main_1.ui.fillStyle = "black";
        main_1.ui.fillRect(exports.keymapItems[exports.kMenuSelected].pos.x - 75, exports.keymapItems[exports.kMenuSelected].pos.y + 55, 200, 45);
        main_1.ui.fillStyle = "white";
        var text = keytest_1.keyText[exports.keymapItems[exports.kMenuSelected].binding[exports.keymapItems[exports.kMenuSelected].index]];
        main_1.ui.font = "italic 900 30px Arial";
        main_1.ui.fillText("Listening...", exports.keymapItems[exports.kMenuSelected].pos.x + 25, exports.keymapItems[exports.kMenuSelected].pos.y + 90);
    }
    if (exports.keyboardPromptTimer > 0) {
        main_1.ui.fillStyle = "black";
        main_1.ui.fillRect(400, 300, 400, 100);
        main_1.ui.fillStyle = "white";
        main_1.ui.font = "italic 900 40px Arial";
        main_1.ui.fillText(exports.keyboardPrompt, 600, 360);
    }
}
;
