"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.masterVolume = void 0;
exports.audioMenuControls = audioMenuControls;
exports.drawAudioMenuInit = drawAudioMenuInit;
exports.drawAudioMenu = drawAudioMenu;
exports.getAudioCookies = getAudioCookies;
const main_1 = require("main/main");
const sfx_1 = require("main/sfx");
const render_1 = require("main/render");
const menu_1 = require("menus/menu");
/* eslint-disable */
// sounds, music
exports.masterVolume = [0.5, 0.3];
const audioMenuNames = ["Sounds", "Music"];
let audioMenuSelected = 0;
function audioMenuControls(i, input) {
    let menuMove = false;
    let audioLevelMoveUp = false;
    let audioLevelMoveDown = false;
    if (input[i][0].b && !input[i][1].b) {
        main_1.bg1.textAlign = "left";
        sfx_1.sounds.menuBack.play();
        //input[i].b[1] = true;
        (0, main_1.setCookie)("soundsLevel", exports.masterVolume[0], 36500);
        (0, main_1.setCookie)("musicLevel", exports.masterVolume[1], 36500);
        (0, main_1.changeGamemode)(1);
    }
    else if (input[i][0].lsY > 0.7) {
        menu_1.stickHoldEach[i] = true;
        if (menu_1.stickHold == 0) {
            audioMenuSelected--;
            menuMove = true;
            (0, menu_1.increaseStick)();
        }
        else {
            (0, menu_1.increaseStick)();
            if (menu_1.stickHold % 10 == 0) {
                audioMenuSelected--;
                menuMove = true;
            }
        }
    }
    else if (input[i][0].lsY < -0.7) {
        menu_1.stickHoldEach[i] = true;
        if (menu_1.stickHold == 0) {
            audioMenuSelected++;
            menuMove = true;
            (0, menu_1.increaseStick)();
        }
        else {
            (0, menu_1.increaseStick)();
            if (menu_1.stickHold % 10 == 0) {
                audioMenuSelected++;
                menuMove = true;
            }
        }
    }
    else if (input[i][0].lsX > 0.7) {
        menu_1.stickHoldEach[i] = true;
        if (menu_1.stickHold == 0) {
            audioLevelMoveUp = true;
            (0, menu_1.increaseStick)();
        }
        else {
            (0, menu_1.increaseStick)();
            if (menu_1.stickHold % 10 == 0) {
                audioLevelMoveUp = true;
            }
        }
    }
    else if (input[i][0].lsX < -0.7) {
        menu_1.stickHoldEach[i] = true;
        if (menu_1.stickHold == 0) {
            audioLevelMoveDown = true;
            (0, menu_1.increaseStick)();
        }
        else {
            (0, menu_1.increaseStick)();
            if (menu_1.stickHold % 10 == 0) {
                audioLevelMoveDown = true;
            }
        }
    }
    else {
        menu_1.stickHoldEach[i] = false;
        if (i == main_1.ports - 1) {
            let stickHoldAll = false;
            for (let j = 0; j < main_1.ports; j++) {
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
        if (audioMenuSelected == -1) {
            audioMenuSelected = 1;
        }
        else if (audioMenuSelected == 2) {
            audioMenuSelected = 0;
        }
    }
    else if (audioLevelMoveUp) {
        sfx_1.sounds.menuSelect.play();
        exports.masterVolume[audioMenuSelected] += 0.1;
        if (exports.masterVolume[audioMenuSelected] > 1) {
            exports.masterVolume[audioMenuSelected] = 1;
        }
    }
    else if (audioLevelMoveDown) {
        sfx_1.sounds.menuSelect.play();
        exports.masterVolume[audioMenuSelected] -= 0.1;
        if (exports.masterVolume[audioMenuSelected] < 0) {
            exports.masterVolume[audioMenuSelected] = 0;
        }
    }
    if (audioLevelMoveDown || audioLevelMoveUp) {
        if (audioMenuSelected == 0) {
            // changeVolume(sounds, masterVolume[0], 0);
        }
        else {
            // changeVolume(MusicManager, masterVolume[1], 1);
        }
    }
}
function drawAudioMenuInit() {
    var _a, _b, _c, _d;
    const bgGrad = main_1.bg1.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "rgb(11, 65, 39)");
    bgGrad.addColorStop(1, "rgb(8, 20, 61)");
    main_1.bg1.fillStyle = bgGrad;
    main_1.bg1.fillRect(0, 0, (_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    main_1.bg1.fillStyle = "rgba(0,0,0,0.5)";
    main_1.bg1.lineWidth = 10;
    main_1.bg1.strokeStyle = "rgba(255, 255, 255, 0.3)";
    main_1.bg1.strokeRect(95, 125, 1010, 650);
    main_1.bg1.fillRect(95, 125, 1010, 650);
    main_1.bg1.textAlign = "center";
    main_1.bg1.fillStyle = "rgba(255, 255, 255, 0.5)";
    main_1.bg1.font = "italic 900 80px Arial";
    main_1.bg1.fillText("Audio", 600, 100);
    main_1.bg1.font = "italic 900 50px Arial";
    main_1.bg1.fillText("Sounds", 225, 275);
    main_1.bg1.fillText("Music", 225, 525);
}
function drawAudioMenu() {
    (0, main_1.clearScreen)();
    drawAudioMenuInit();
    main_1.fg2.lineWidth = 3;
    (0, main_1.addShine)(0.01);
    if (main_1.shine > 1.8) {
        (0, main_1.setShine)(-0.8);
    }
    const opacity = (main_1.shine < 0) ? (0.05 + (0.25 / 0.8) * (0.8 + main_1.shine)) : ((main_1.shine > 1) ? (0.3 - (0.25 / 0.8) * (main_1.shine - 1)) : 0.3);
    var bgGrad = main_1.fg2.createLinearGradient(0, 0, 1200, 750);
    bgGrad.addColorStop(0, "rgba(255, 255, 255,0.05)");
    bgGrad.addColorStop(Math.min(Math.max(0, main_1.shine), 1), "rgba(255,255,255," + opacity + ")");
    bgGrad.addColorStop(1, "rgba(255, 255, 255,0.05)");
    //ui.strokeStyle = "rgba(255,255,255,0.13)";
    main_1.fg2.strokeStyle = bgGrad;
    main_1.fg2.beginPath();
    for (var i = 0; i < 60; i++) {
        main_1.fg2.moveTo(0 + (i * 30), 0);
        main_1.fg2.lineTo(0 + (i * 30), 750);
        main_1.fg2.moveTo(0, 0 + (i * 30));
        main_1.fg2.lineTo(1200, 0 + (i * 30));
    }
    main_1.fg2.stroke();
    for (var i = 0; i < 2; i++) {
        if (i == audioMenuSelected) {
            //ui.fillStyle = "rgba(255, 255, 255, 0.7)";
            main_1.bg1.fillStyle = "rgba(255, 255, 255,0.3)";
        }
        else {
            main_1.bg1.fillStyle = "rgba(255, 255, 255,0.1)";
            //ui.fillStyle = "rgba(0, 0, 0, 0.8)";
        }
        main_1.bg1.beginPath();
        main_1.bg1.moveTo(200, 350 + i * 250);
        main_1.bg1.lineTo(1000, 200 + i * 250);
        main_1.bg1.lineTo(1000, 350 + i * 250);
        main_1.bg1.closePath();
        main_1.bg1.fill();
        if (i == 0) {
            var bgGrad = main_1.bg1.createLinearGradient(200, 0, 1200, 0);
            bgGrad.addColorStop(0, "rgb(12, 75, 13)");
            bgGrad.addColorStop(1, "rgb(15, 75, 255)");
            main_1.bg1.fillStyle = bgGrad;
        }
        else {
            var bgGrad = main_1.bg1.createLinearGradient(200, 0, 1200, 0);
            bgGrad.addColorStop(0, "rgb(11, 13, 65)");
            bgGrad.addColorStop(1, "rgb(255, 15, 73)");
            main_1.bg1.fillStyle = bgGrad;
        }
        main_1.bg1.beginPath();
        main_1.bg1.moveTo(200, 350 + i * 250);
        main_1.bg1.lineTo(200 + (exports.masterVolume[i] * 800), 350 + i * 250 - (exports.masterVolume[i] * 150));
        main_1.bg1.lineTo(200 + (exports.masterVolume[i] * 800), 350 + i * 250);
        main_1.bg1.closePath();
        main_1.bg1.fill();
        if (i == audioMenuSelected) {
            main_1.bg1.fillStyle = "rgba(255, 255, 255, 1)";
        }
        else {
            main_1.bg1.fillStyle = "rgba(136, 136, 136, 1)";
        }
        main_1.bg1.beginPath();
        main_1.bg1.arc(200 + (exports.masterVolume[i] * 800), 350 + i * 250 - (exports.masterVolume[i] * 75), 15 + (exports.masterVolume[i] * 65), 0, render_1.twoPi);
        main_1.bg1.closePath();
        main_1.bg1.fill();
    }
}
function getAudioCookies() {
    const s = (0, main_1.getCookie)("soundsLevel");
    if (s != null && s != undefined && s != "null") {
        // masterVolume[0] = Number(s);
        // changeVolume(sounds, masterVolume[0], 0);
    }
    const m = (0, main_1.getCookie)("musicLevel");
    if (m != null && m != undefined && m != "null") {
        // masterVolume[1] = Number(m);
        // changeVolume(MusicManager, masterVolume[1], 1);
    }
}
