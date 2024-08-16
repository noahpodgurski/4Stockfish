"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuMove = exports.menuHOptions = exports.menuVOptions = exports.menuIndex = void 0;
exports.getGameplayCookies = getGameplayCookies;
exports.gameplayMenuControls = gameplayMenuControls;
exports.drawGameplayMenuInit = drawGameplayMenuInit;
exports.drawGameplayMenu = drawGameplayMenu;
const main_1 = require("main/main");
const settings_1 = require("settings");
const sfx_1 = require("main/sfx");
const menu_1 = require("menus/menu");
const streamclient_1 = require("../main/multiplayer/streamclient");
/* eslint-disable */
exports.menuIndex = [0, 0];
exports.menuVOptions = 4;
exports.menuHOptions = [0, 0, 0, 0, 3];
exports.menuMove = false;
function getGameplayCookies() {
    var keys = Object.keys(settings_1.gameSettings);
    for (var j = 0; j < keys.length; j++) {
        var c = (0, main_1.getCookie)(keys[j]);
        if (c != null && c != undefined && c != "null") {
            settings_1.gameSettings[keys[j]] = Number(c);
        }
    }
}
function gameplayMenuControls(i, input) {
    var menuMove = false;
    if (input[i][0].b && !input[i][1].b) {
        sfx_1.sounds.menuBack.play();
        input[i][1].b = true;
        if (streamclient_1.meHost) {
            var keys = Object.keys(settings_1.gameSettings);
            for (var j = 0; j < keys.length; j++) {
                (0, main_1.setCookie)(keys[j], settings_1.gameSettings[keys[j]], 36500);
            }
        }
        else {
            alert("Settings not saved because you joined a host. Reload the game if this is a mistake");
        }
        (0, main_1.changeGamemode)(1);
    }
    else if (input[i][0].a && !input[i][1].a) {
        sfx_1.sounds.menuSelect.play();
        switch (exports.menuIndex[0]) {
            case 0:
                settings_1.gameSettings.turbo = !settings_1.gameSettings.turbo;
                break;
            case 1:
                settings_1.gameSettings.lCancelType++;
                if (settings_1.gameSettings.lCancelType > 2) {
                    settings_1.gameSettings.lCancelType = 0;
                }
                break;
            case 2:
                settings_1.gameSettings.flashOnLCancel = !settings_1.gameSettings.flashOnLCancel;
                break;
            case 3:
                settings_1.gameSettings.everyCharWallJump = !settings_1.gameSettings.everyCharWallJump;
                break;
            case 4:
                settings_1.gameSettings["tapJumpOffp" + (exports.menuIndex[1] + 1)] = !settings_1.gameSettings["tapJumpOffp" + (exports.menuIndex[1] + 1)];
            default:
                break;
        }
    }
    else if (input[i][0].lsY > 0.7 && !(Math.abs(input[i][0].lsX) >= 0.7)) {
        menu_1.stickHoldEach[i] = true;
        if (menu_1.stickHold == 0) {
            exports.menuIndex[0]--;
            if (exports.menuIndex[1] > exports.menuHOptions[exports.menuIndex[0]]) {
                exports.menuIndex[1] = exports.menuHOptions[exports.menuIndex[0]];
            }
            menuMove = true;
            (0, menu_1.increaseStick)();
        }
        else {
            (0, menu_1.increaseStick)();
            if (menu_1.stickHold % 10 == 0) {
                exports.menuIndex[0]--;
                if (exports.menuIndex[1] > exports.menuHOptions[exports.menuIndex[0]]) {
                    exports.menuIndex[1] = exports.menuHOptions[exports.menuIndex[0]];
                }
                menuMove = true;
            }
        }
    }
    else if (input[i][0].lsY < -0.7 && !(Math.abs(input[i][0].lsX) >= 0.7)) {
        menu_1.stickHoldEach[i] = true;
        if (menu_1.stickHold == 0) {
            exports.menuIndex[0]++;
            if (exports.menuIndex[1] > exports.menuHOptions[exports.menuIndex[0]]) {
                exports.menuIndex[1] = exports.menuHOptions[exports.menuIndex[0]];
            }
            menuMove = true;
            (0, menu_1.increaseStick)();
        }
        else {
            (0, menu_1.increaseStick)();
            if (menu_1.stickHold % 10 == 0) {
                exports.menuIndex[0]++;
                if (exports.menuIndex[1] > exports.menuHOptions[exports.menuIndex[0]]) {
                    exports.menuIndex[1] = exports.menuHOptions[exports.menuIndex[0]];
                }
                menuMove = true;
            }
        }
    }
    else if (input[i][0].lsX > 0.7 && !(Math.abs(input[i][0].lsY) >= 0.7)) {
        menu_1.stickHoldEach[i] = true;
        if (menu_1.stickHold == 0) {
            exports.menuIndex[1]++;
            //if (menuIndex[1] > menuHOptions[menuIndex[0]]) {
            //  menuIndex[1] = menuHOptions[menuIndex[0]];
            //}
            menuMove = true;
            (0, menu_1.increaseStick)();
        }
        else {
            (0, menu_1.increaseStick)();
            if (menu_1.stickHold % 10 == 0) {
                exports.menuIndex[1]++;
                //if (menuIndex[1] > menuHOptions[menuIndex[0]]) {
                //  menuIndex[1] = menuHOptions[menuIndex[0]];
                //}
                menuMove = true;
            }
        }
    }
    else if (input[i][0].lsX < -0.7 && !(Math.abs(input[i][0].lsY) >= 0.7)) {
        if (menu_1.stickHold == 0) {
            exports.menuIndex[1]--;
            //if (menuIndex[1] > menuHOptions[menuIndex[0]]) {
            //  menuIndex[1] = menuHOptions[menuIndex[0]];
            //}
            menuMove = true;
            (0, menu_1.increaseStick)();
        }
        else {
            (0, menu_1.increaseStick)();
            if (menu_1.stickHold % 10 == 0) {
                exports.menuIndex[1]--;
                //if (menuIndex[1] > menuHOptions[menuIndex[0]]) {
                //  menuIndex[1] = menuHOptions[menuIndex[0]];
                //}
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
        menuMove = false;
        sfx_1.sounds.menuSelect.play();
        if (exports.menuIndex[0] < 0) {
            exports.menuIndex[0] = exports.menuVOptions;
        }
        else if (exports.menuIndex[0] > exports.menuVOptions) {
            exports.menuIndex[0] = 0;
        }
        if (exports.menuIndex[1] > exports.menuHOptions[exports.menuIndex[0]]) {
            exports.menuIndex[1] = 0;
        }
        else if (exports.menuIndex[1] < 0) {
            exports.menuIndex[1] = exports.menuHOptions[exports.menuIndex[0]];
        }
    }
}
function drawGameplayMenuInit() {
    var _a, _b, _c, _d;
    var bgGrad = main_1.bg1.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "rgb(11, 65, 39)");
    bgGrad.addColorStop(1, "rgb(8, 20, 61)");
    main_1.bg1.fillStyle = bgGrad;
    main_1.bg1.fillRect(0, 0, (_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    main_1.fg1.textAlign = "center";
    main_1.fg1.fillStyle = "rgba(255, 255, 255, 0.65)";
    main_1.fg1.font = "italic 900 80px Arial";
    main_1.fg1.fillText("Gameplay", 600, 100);
    main_1.fg1.font = "italic 900 50px Arial";
    main_1.fg1.textAlign = "start";
    main_1.fg1.fillText("Turbo Mode", 75, 275);
    main_1.fg1.fillText("L-Cancel", 75, 335);
    main_1.fg1.fillText("Flash on L-Cancel", 75, 395);
    main_1.fg1.fillText("Everyone Walljumps", 75, 465);
    main_1.fg1.fillText("Tapjump off", 75, 535);
}
function drawGameplayMenu() {
    (0, main_1.clearScreen)();
    main_1.fg1.lineWidth = 3;
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
    for (let i = 0; i < exports.menuVOptions + 1; i++) {
        for (let x = 0; x < exports.menuHOptions[i] + 1; x++) {
            main_1.ui.strokeStyle = "rgba(255, 255, 255, 0.72)";
            if (i == exports.menuIndex[0] && x == exports.menuIndex[1]) {
                main_1.ui.fillStyle = "rgba(255, 255, 255, 0.6)";
            }
            else {
                main_1.ui.fillStyle = "rgba(255, 255, 255, 0.2)";
            }
            if (exports.menuHOptions[i] > 0) {
                main_1.ui.fillRect(650 + (x * (300 / (exports.menuHOptions[i] + 1))), 235 + i * 60, (300 / (exports.menuHOptions[i] + 1)), 50);
                main_1.ui.strokeRect(650 + (x * (300 / (exports.menuHOptions[i] + 1))), 235 + i * 60, (300 / (exports.menuHOptions[i] + 1)), 50);
            }
            else {
                main_1.ui.fillRect(650, 235 + i * 60, 300, 50);
                main_1.ui.strokeRect(650, 235 + i * 60, 300, 50);
            }
            main_1.ui.font = "900 " + 30 / (Math.min(1, exports.menuHOptions[i] - 1)) + "px Arial";
            main_1.ui.textAlign = "center";
            main_1.ui.fillStyle = "white";
            main_1.ui.strokeStyle = "black";
            var text = "";
            switch (i) {
                case 0:
                    text = settings_1.gameSettings.turbo ? "On" : "Off";
                    break;
                case 1:
                    text = settings_1.gameSettings.lCancelType ? (settings_1.gameSettings.lCancelType == 1 ? "Auto" : "Smash 64") : "Normal";
                    break;
                case 2:
                    text = settings_1.gameSettings.flashOnLCancel ? "On" : "Off";
                    break;
                case 3:
                    text = settings_1.gameSettings.everyCharWallJump ? "On" : "Off";
                    break;
                case 4:
                    text = settings_1.gameSettings["tapJumpOffp" + (x + 1)] ? "On" : "Off";
                default:
                    break;
            }
            if (exports.menuHOptions[i] == 0) {
                main_1.ui.strokeText(text, 800, 270 + i * 60);
                main_1.ui.fillText(text, 800, 270 + i * 60);
            }
            else {
                main_1.ui.strokeText(text, (650 + (x * (300 / (exports.menuHOptions[i] + 1)))) + ((300 / (exports.menuHOptions[i] + 1)) / 2), 270 + i * 60);
                main_1.ui.fillText(text, (650 + (x * (300 / (exports.menuHOptions[i] + 1)))) + ((300 / (exports.menuHOptions[i] + 1)) / 2), 270 + i * 60);
            }
        }
    }
}
