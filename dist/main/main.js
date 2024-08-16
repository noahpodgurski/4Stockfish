"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTimer = exports.starting = exports.blastzone = exports.stageSelect = exports.respawnPoints = exports.edgeOrientation = exports.edgeOffset = exports.edges = exports.wallsR = exports.wallsL = exports.platforms = exports.ground = exports.startingFace = exports.startingPoint = exports.frameAdvance = exports.pause = exports.colours = exports.costumeTimeout = exports.pPal = exports.tagText = exports.hasTag = exports.palettes = exports.randomTags = exports.versusMode = exports.gameMode = exports.showDebug = exports.findingPlayers = exports.frameByFrameRender = exports.wasFrameByFrame = exports.frameByFrame = exports.playing = exports.activePorts = exports.ports = exports.cpuDifficulty = exports.playerType = exports.playerAmount = exports.currentPlayers = exports.mType = exports.firstTimeDetected = exports.usingCustomControls = exports.controllerResetCountdowns = exports.gameEnd = exports.calibrationPlayer = exports.shine = exports.characterSelections = exports.framerate = exports.gamelogicTime = exports.renderTime = exports.player = exports.snowCount = void 0;
exports.customDeadzone = exports.layerSwitches = exports.layers = exports.c = exports.ui = exports.fg2 = exports.fg1 = exports.bg2 = exports.bg1 = exports.keyBinding = exports.keyBind = exports.keys = exports.usingLocalStorage = exports.matchTimer = void 0;
exports.setControllerReset = setControllerReset;
exports.setUsingCustomControls = setUsingCustomControls;
exports.setMtype = setMtype;
exports.setCurrentPlayer = setCurrentPlayer;
exports.setTagText = setTagText;
exports.setStageSelect = setStageSelect;
exports.setStarting = setStarting;
exports.setStartTimer = setStartTimer;
exports.getStartTimer = getStartTimer;
exports.addMatchTimer = addMatchTimer;
exports.setMatchTimer = setMatchTimer;
exports.getMatchTimer = getMatchTimer;
exports.setCookie = setCookie;
exports.setVersusMode = setVersusMode;
exports.getCookie = getCookie;
exports.setKeyBinding = setKeyBinding;
exports.overrideKeyboardEvent = overrideKeyboardEvent;
exports.disabledEventPropagation = disabledEventPropagation;
exports.SVG = SVG;
exports.matchTimerTick = matchTimerTick;
exports.screenShake = screenShake;
exports.percentShake = percentShake;
exports.findPlayers = findPlayers;
exports.setPlayerType = setPlayerType;
exports.addPlayer = addPlayer;
exports.togglePort = togglePort;
exports.positionPlayersInCSS = positionPlayersInCSS;
exports.changeGamemode = changeGamemode;
exports.interpretInputs = interpretInputs;
exports.renderToMain = renderToMain;
exports.update = update;
exports.gameTick = gameTick;
exports.clearScreen = clearScreen;
exports.renderTick = renderTick;
exports.buildPlayerObject = buildPlayerObject;
exports.initializePlayers = initializePlayers;
exports.startGame = startGame;
exports.endGame = endGame;
exports.finishGame = finishGame;
exports.start = start;
exports.addShine = addShine;
exports.setShine = setShine;
exports.setFindingPlayers = setFindingPlayers;
exports.setPlaying = setPlaying;
exports.setCalibrationPlayer = setCalibrationPlayer;
exports.cacheDom = cacheDom;
exports.setCS = setCS;
/* eslint-disable */
const css_1 = require("../menus/css");
const player_1 = require("../main/player");
const settings_1 = require("../settings");
const startup_1 = require("../menus/startup");
const menu_1 = require("../menus/menu");
const sfx_1 = require("../main/sfx");
const startscreen_1 = require("../menus/startscreen");
const stagerender_1 = require("../stages/stagerender");
const stageselect_1 = require("../menus/stageselect");
const audiomenu_1 = require("../menus/audiomenu");
const gameplaymenu_1 = require("../menus/gameplaymenu");
const keyboardmenu_1 = require("../menus/keyboardmenu");
const controllermenu_1 = require("../menus/controllermenu");
const render_1 = require("../main/render");
const actionStateShortcuts_1 = require("../physics/actionStateShortcuts");
const hitDetection_1 = require("../physics/hitDetection");
const article_1 = require("../physics/article");
const ai_1 = require("../main/ai");
const physics_1 = require("../physics/physics");
const jquery_1 = __importDefault(require("jquery"));
const transparency_1 = require("../main/vfx/transparency");
const drawVfx_1 = require("../main/vfx/drawVfx");
const vfxQueue_1 = require("../main/vfx/vfxQueue");
const activeStage_1 = require("../stages/activeStage");
const music_1 = require("./music");
const vfx_1 = require("../main/vfx");
const renderVfx_1 = require("./vfx/renderVfx");
const Box2D_1 = require("./util/Box2D");
const Vec2D_1 = require("./util/Vec2D");
const streamclient_1 = require("./multiplayer/streamclient");
const replay_1 = require("./replay");
const input_1 = require("../input/input");
const meleeInputs_1 = require("../input/meleeInputs");
const findGamepadInfo_1 = require("../input/gamepad/findGamepadInfo");
const custom_1 = require("../input/gamepad/gamepads/custom");
const retrieveGamepadInputs_1 = require("../input/gamepad/retrieveGamepadInputs");
const drawGamepad_1 = require("../input/gamepad/drawGamepad");
const deepCopyObject_1 = require("./util/deepCopyObject");
const css_2 = require("../menus/css");
/*globals performance*/
exports.snowCount = 150;
//todo find 'Player' object
exports.player = [null, null, null, null];
exports.renderTime = [10, 0, 100, 0];
exports.gamelogicTime = [5, 0, 100, 0];
exports.framerate = [0, 0, 0];
exports.characterSelections = [0, 0, 0, 0];
exports.shine = 0.5;
exports.calibrationPlayer = 0;
exports.gameEnd = false;
exports.controllerResetCountdowns = [0, 0, 0, 0];
function setControllerReset(i) {
    exports.controllerResetCountdowns[i] = 0;
}
let keyboardOccupied = false;
exports.usingCustomControls = [false, false, false, false];
function setUsingCustomControls(i, bool, info = null) {
    exports.usingCustomControls[i] = bool;
    if (bool) {
        exports.mType[i] = custom_1.customGamepadInfo[exports.currentPlayers[i]];
    }
    else {
        exports.mType[i] = info;
    }
}
exports.firstTimeDetected = [true, true, true, true];
window.mType = [null, null, null, null];
exports.mType = [null, null, null, null];
function setMtype(index, val) {
    exports.mType[index] = val;
}
exports.currentPlayers = [];
function setCurrentPlayer(index, val) {
    exports.currentPlayers[index] = val;
}
exports.playerAmount = 0;
exports.playerType = [-1, -1, -1, -1];
exports.cpuDifficulty = [3, 3, 3, 3];
exports.ports = 0;
exports.activePorts = [];
exports.playing = false;
exports.frameByFrame = false;
exports.wasFrameByFrame = false;
exports.frameByFrameRender = false;
exports.findingPlayers = true;
exports.showDebug = false;
exports.gameMode = 20;
// 20:Startup
// 13:Data Menu
// 12:Keyboard Controls
// 11:Gameplay Menu
// 10:Sound Menu
// 9: -
// 8: -
// 7:Target Select
// 6:Stage Select (VS)
// 5:Target Playing
// 4:Target Builder
// 3:Playing (VS)
// 2:CSS
// 1:Main Menu
// 0:Title Screen
exports.versusMode = 0;
exports.randomTags = ["NEO!", "SELF", "NOVA", "PNDA", "Panda", "LFFN", "Scorp", "AZ", "AXE", "Tempo", "TMPO", "[A]rmada", "WBALLZ", "Westballz", "PPMD", "Kreygasm", "M2K", "Mang0", "USA", "SCAR", "TOPH", "(.Y.)", "HBOX", "HungryBox", "PLUP", "Shroomed", "SFAT", "Wizz", "Lucky", "S2J", "SilentWolf", "aMSa", "S2J", "Hax$"];
exports.palettes = [["rgb(250, 89, 89)", "rgb(255, 170, 170)", "rgba(255, 206, 111, ", "rgb(244, 68, 68)", "rgba(255, 225, 167, "],
    ["rgb(95, 216, 84)", "rgb(184, 253, 154)", "rgba(252, 95, 95, ", "rgb(255, 182, 96)", "rgba(254, 141, 141, "],
    ["rgb(5, 195, 255)", "rgb(121, 223, 255)", "rgba(218, 96, 254, ", "rgb(231, 134, 255)", "rgba(230, 144, 255, "],
    ["rgb(255, 187, 70)", "rgb(248, 255, 122)", "rgba(80, 182, 255, ", "rgb(255, 142, 70)", "rgba(139, 203, 249, "],
    ["rgb(177, 89, 255)", "rgb(203, 144, 255)", "rgba(144, 255, 110, ", "rgb(247, 126, 250)", "rgba(190, 255, 170, "],
    ["rgb(182, 131, 70)", "rgb(252, 194, 126)", "rgba(47, 186, 123, ", "rgb(255, 112, 66)", "rgba(111, 214, 168, "],
    ["rgb(232, 232, 208)", "rgb(255, 255, 255)", "rgba(244, 255, 112, ", "rgb(191, 119, 119)", "rgba(255, 255, 200, "]];
exports.hasTag = [false, false, false, false];
exports.tagText = ["", "", "", ""];
function setTagText(index, value) {
    exports.tagText[index] = value;
    exports.hasTag[index] = true;
}
exports.pPal = [0, 1, 2, 3];
exports.costumeTimeout = [];
exports.colours = ["rgba(4, 255, 82, 0.62)", "rgba(117, 20, 255, 0.63)", "rgba(255, 20, 20, 0.63)", "rgba(255, 232, 20, 0.63)"];
exports.pause = [[true, true], [true, true], [true, true], [true, true]];
exports.frameAdvance = [[true, true], [true, true], [true, true], [true, true]];
exports.startingPoint = [new Vec2D_1.Vec2D(-50, 50), new Vec2D_1.Vec2D(50, 50), new Vec2D_1.Vec2D(-25, 5), new Vec2D_1.Vec2D(25, 5)];
exports.startingFace = [1, -1, 1, -1];
exports.ground = [[-68.4, 0], [68.4, 0]];
exports.platforms = [[[-57.6, 27.2], [-20, 27.2]], [[20, 27.2], [57.6, 27.2]], [[-18.8, 54.4], [18.8, 54.4]]];
exports.wallsL = [[[-68.4, 0], [-68.4, -108.8]]];
exports.wallsR = [[[68.4, 0], [68.4, -108.8]]];
exports.edges = [[[-68.4, 0], [-63.4, 0]], [[68.4, 0], [63.4, 0]]];
//edgeOffset = [[-71.3,-23.7],[71.3,-23.7]];
exports.edgeOffset = [[-2.9, -23.7], [2.9, -23.7]];
exports.edgeOrientation = [1, -1];
exports.respawnPoints = [[-50, 50, 1], [50, 50, -1], [25, 35, 1], [-25, 35, -1]];
exports.stageSelect = 0;
function setStageSelect(val) {
    exports.stageSelect = val;
}
exports.blastzone = new Box2D_1.Box2D([-224, 200], [224, -108.8]);
exports.starting = true;
function setStarting(val) {
    exports.starting = val;
}
exports.startTimer = 1.5;
function setStartTimer(val) {
    exports.startTimer = val;
}
function getStartTimer() {
    return exports.startTimer;
}
//matchTimer = 5999.99;
exports.matchTimer = 480;
function addMatchTimer(val) {
    exports.matchTimer += val;
}
function setMatchTimer(val) {
    exports.matchTimer = val;
}
function getMatchTimer() {
    return exports.matchTimer;
}
exports.usingLocalStorage = false;
if (typeof (Storage) !== "undefined") {
    // Code for localStorage/sessionStorage.
    exports.usingLocalStorage = true;
    console.log("local storage works");
}
else {
    // Sorry! No Web Storage support..
    console.log("local storage does not work");
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var exp = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + exp;
    localStorage.setItem(cname, cvalue);
}
function setVersusMode(val) {
    exports.versusMode = val;
}
function getCookie(cname) {
    if (exports.usingLocalStorage) {
        const x = localStorage.getItem(cname);
        if (x === null) {
            throw Error("unable to get cookie");
        }
        return x;
    }
    else {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1);
            if (c.indexOf(name) == 0)
                return c.substring(name.length, c.length);
        }
        return "";
    }
}
exports.keys = {};
exports.keyBind = 0;
exports.keyBinding = false;
function setKeyBinding(val) {
    exports.keyBinding = val;
}
function overrideKeyboardEvent(e) {
    if (css_1.choosingTag == -1 && e.keyCode != 122 && e.keyCode != 116) {
        switch (e.type) {
            case "keydown":
                if (!exports.keys[e.keyCode]) {
                    exports.keys[e.keyCode] = true;
                    exports.keyBind = e.keyCode;
                    exports.keyBinding = true;
                    // do key down stuff here
                }
                break;
            case "keyup":
                delete (exports.keys[e.keyCode]);
                // do key up stuff here
                break;
        }
        disabledEventPropagation(e);
        e.preventDefault();
        return false;
    }
    else {
        if (css_1.choosingTag > -1) {
            if (e.keyCode == 13) {
                switch (e.type) {
                    case "keydown":
                        exports.keys[13] = true;
                        break;
                    case "keyup":
                        delete (exports.keys[13]);
                        break;
                    default:
                        break;
                }
            }
        }
        return true;
    }
}
;
function disabledEventPropagation(e) {
    if (e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        else if (event) {
            event.cancelBubble = true;
        }
    }
}
;
document.onkeydown = overrideKeyboardEvent;
document.onkeyup = overrideKeyboardEvent;
/*var keys = [];
export const onkeyup (e) {
  keys[e.keyCode]=false;
}
export const onkeydown (e) {
  keys[e.keyCode]=true;
}*/
function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}
/*if (Gamepad.supported) {
    console.log("gamepad supported");
} else {
    console.log("gamepad not supported");
}*/
window.addEventListener("gamepadconnected", function (e) {
    console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
});
if (navigator.getGamepads)
    console.log(navigator.getGamepads());
function matchTimerTick(input) {
    exports.matchTimer -= 0.016667;
    if (dom.matchMinutes && dom.matchSeconds) {
        var sec = (exports.matchTimer % 60).toFixed(2);
        dom.matchMinutes.innerHTML = String(Math.floor(exports.matchTimer / 60));
        dom.matchSeconds.innerHTML = String(sec.length < 5 ? `0${sec}` : sec);
    }
    if (exports.matchTimer <= 0) {
        finishGame(input);
    }
}
function screenShake(kb) {
    var seed = [Math.random(), Math.random(), Math.random(), Math.random()];
    exports.fg1.translate(kb * 0.1 * seed[0], kb * 0.1 * seed[1]);
    setTimeout(function () { exports.fg1.translate(-kb * 0.05 * seed[0], -kb * 0.05 * seed[1]); }, 20);
    setTimeout(function () { exports.fg1.translate(-kb * 0.05 * seed[0], -kb * 0.05 * seed[1]); exports.fg1.translate(-kb * 0.1 * seed[2], -kb * 0.1 * seed[3]); }, 40);
    setTimeout(function () { exports.fg1.translate(kb * 0.05 * seed[2], kb * 0.05 * seed[3]); }, 60);
    setTimeout(function () { exports.fg1.translate(kb * 0.05 * seed[2], kb * 0.05 * seed[3]); }, 80);
}
function percentShake(kb, i) {
    exports.player[i].percentShake = new Vec2D_1.Vec2D(kb * 0.1 * Math.random(), kb * 0.1 * Math.random());
    setTimeout(function () { exports.player[i].percentShake = new Vec2D_1.Vec2D(kb * 0.05 * Math.random(), kb * 0.05 * Math.random()); }, 20);
    setTimeout(function () { exports.player[i].percentShake = new Vec2D_1.Vec2D(-kb * 0.1 * Math.random(), -kb * 0.1 * Math.random()); }, 40);
    setTimeout(function () { exports.player[i].percentShake = new Vec2D_1.Vec2D(-kb * 0.05 * Math.random(), -kb * 0.05 * Math.random()); }, 60);
    setTimeout(function () { exports.player[i].percentShake = new Vec2D_1.Vec2D(0, 0); }, 80);
}
function findPlayers() {
    var gps = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    /*if (typeof gps != "undefined"){
      console.log(gps);
    }*/
    if (!keyboardOccupied) {
        if (exports.gameMode < 2 || exports.gameMode == 20) {
            if (exports.keys[13] || exports.keys[settings_1.keyMap.s[0]] || exports.keys[settings_1.keyMap.s[1]]) {
                if (exports.ports < 4) {
                    changeGamemode(1);
                    (0, jquery_1.default)("#keyboardPrompt").hide();
                    keyboardOccupied = true;
                    sfx_1.sounds.menuForward.play();
                    if (exports.ports == 0) {
                        music_1.MusicManager.playMenuLoop();
                    }
                    addPlayer(exports.ports, "keyboard");
                }
            }
        }
        else {
            if (exports.keys[settings_1.keyMap.a[0]] || exports.keys[settings_1.keyMap.a[1]]) {
                if (exports.ports < 4) {
                    keyboardOccupied = true;
                    addPlayer(exports.ports, "keyboard");
                }
            }
        }
    }
    for (var i = 0; i < gps.length; i++) {
        var gamepad = navigator.getGamepads ? navigator.getGamepads()[i] : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads()[i] : null);
        if (exports.playerType[i] === 2) {
            var alreadyIn = false;
            for (var k = 0; k < exports.ports; k++) {
                if (exports.currentPlayers[k] === i) {
                    alreadyIn = true;
                }
            }
            if (!alreadyIn) {
                if (exports.ports < 4) {
                    addPlayer(i, 99);
                }
            }
            continue;
        }
        var gamepad = navigator.getGamepads ? navigator.getGamepads()[i] : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads()[i] : null);
        if (typeof gamepad != "undefined" && gamepad != null) {
            var detected = false;
            var gpdName;
            var gpdInfo;
            if (exports.usingCustomControls[i] && custom_1.customGamepadInfo[i] !== null) {
                gpdName = "custom controls";
                gpdInfo = custom_1.customGamepadInfo[i];
                detected = true;
            }
            else {
                const maybeNameAndInfo = (0, findGamepadInfo_1.getGamepadNameAndInfo)(gamepad.id);
                if (maybeNameAndInfo === null) {
                    console.log("Error in 'findPlayers': controller " + (i + 1) + " detected but not supported.");
                    console.log("Try manual calibration of your controller.");
                }
                else {
                    detected = true;
                    [gpdName, gpdInfo] = maybeNameAndInfo;
                }
            }
            if (detected) {
                if (exports.firstTimeDetected[i]) {
                    console.log("Controller " + (i + 1) + " is: " + gpdName + ".");
                    exports.firstTimeDetected[i] = false;
                }
                if (exports.gameMode < 2 || exports.gameMode == 20) {
                    if ((0, retrieveGamepadInputs_1.buttonState)(gamepad, gpdInfo, "s")) {
                        var alreadyIn = false;
                        for (var k = 0; k < exports.ports; k++) {
                            if (exports.currentPlayers[k] == i) {
                                alreadyIn = true;
                            }
                        }
                        if (!alreadyIn) {
                            if (exports.ports < 4) {
                                changeGamemode(1);
                                (0, jquery_1.default)("#keyboardPrompt").hide();
                                sfx_1.sounds.menuForward.play();
                                if (exports.ports === 0) {
                                    music_1.MusicManager.playMenuLoop();
                                }
                                addPlayer(i, gpdInfo);
                            }
                        }
                    }
                }
                else {
                    if ((0, retrieveGamepadInputs_1.buttonState)(gamepad, gpdInfo, "a")) {
                        var alreadyIn = false;
                        for (var k = 0; k < exports.ports; k++) {
                            if (exports.currentPlayers[k] == i) {
                                alreadyIn = true;
                            }
                        }
                        if (!alreadyIn) {
                            if (exports.ports < 4) {
                                addPlayer(i, gpdInfo);
                            }
                        }
                    }
                }
            }
            else {
                console.log("No controller detected by browser");
            }
        }
    }
}
function setPlayerType(playerSlot, type) {
    exports.playerType[playerSlot] = type;
}
function addPlayer(i, controllerInfo) {
    if (controllerInfo === 99) {
        exports.ports++;
        exports.currentPlayers[exports.ports - 1] = i;
        exports.playerType[exports.ports - 1] = 2;
        exports.mType[exports.ports - 1] = controllerInfo;
    }
    else {
        exports.ports++;
        exports.currentPlayers[exports.ports - 1] = i;
        exports.playerType[exports.ports - 1] = 0;
        exports.mType[exports.ports - 1] = controllerInfo;
        if (exports.showDebug) {
            (0, drawGamepad_1.updateGamepadSVGColour)(i, "gamepadSVG" + i);
            document.getElementById("gamepadSVG" + i).style.display = "";
        }
    }
}
function togglePort(i) {
    exports.playerType[i]++;
    if (exports.playerType[i] == 3) {
        exports.playerType[i] = -1;
        if (exports.showDebug) {
            document.getElementById("gamepadSVG" + i).style.display = "none";
        }
    }
    if (exports.playerType[i] == 0 && exports.ports <= i) {
        exports.playerType[i] = 1;
        (0, drawGamepad_1.setGamepadSVGColour)(i, "black");
        if (exports.showDebug) {
            (0, drawGamepad_1.updateGamepadSVGColour)(i, "gamepadSVG" + i);
            document.getElementById("gamepadSVG" + i).style.display = "";
        }
    }
}
function positionPlayersInCSS() {
    for (var i = 0; i < 4; i++) {
        var x = (-80 + i * 50) * 2 / 3;
        var y = -30;
        exports.player[i].phys.pos = new Vec2D_1.Vec2D(x, y);
        exports.player[i].phys.hurtbox = new Box2D_1.Box2D([-4 + x, 18 + y], [4 + x, y]);
    }
}
// 20:Startup
// 14:Controller Menu
// 13:Data Menu
// 12:Keyboard Controls
// 11:Gameplay Menu
// 10:Sound Menu
// 9: -
// 8: -
// 7:Target Select
// 6:Stage Select (VS)
// 5:Target Playing
// 4:Target Builder
// 3:Playing (VS)
// 2:CSS
// 1:Main Menu
// 0:Title Screen
function changeGamemode(newGamemode) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    exports.bg1.fillStyle = "black";
    exports.bg1.fillRect(0, 0, (_b = (_a = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    exports.fg1.clearRect(0, 0, (_f = (_e = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.FG1) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0, (_h = (_g = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.FG1) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0);
    exports.gameMode = newGamemode;
    switch (newGamemode) {
        // TITLESCREEN
        case 0:
            (0, startscreen_1.drawStartScreenInit)();
            break;
        // MAIN MENU
        case 1:
            (0, jquery_1.default)("#logoVid").remove();
            (0, menu_1.drawMainMenuInit)();
            break;
        // CSS
        case 2:
            (0, css_1.drawCSSInit)();
            break;
        // Playing (VS)
        case 3:
            (0, stagerender_1.drawBackgroundInit)();
            (0, stagerender_1.drawStageInit)();
            break;
        // Target Builder
        case 4:
            break;
        // Target Playing
        case 5:
            (0, stagerender_1.drawBackgroundInit)();
            (0, stagerender_1.drawStageInit)();
            break;
        // Stage select (vs)
        case 6:
            (0, stageselect_1.drawSSSInit)();
            break;
        // Target Select
        case 7:
            // drawTSSInit();
            break;
        // sound menu
        case 10:
            (0, audiomenu_1.drawAudioMenuInit)();
            break;
        // gameplay menu
        case 11:
            (0, gameplaymenu_1.drawGameplayMenuInit)();
            break;
        // keyboard menu
        case 12:
            (0, keyboardmenu_1.drawKeyboardMenuInit)();
            break;
        // credits
        case 13:
            // drawCreditsInit();
            break;
        // Multiplayer Modes
        case 14:
            (0, controllermenu_1.drawControllerMenuInit)();
            break;
        case 15:
            (0, css_1.drawCSSInit)();
            (0, streamclient_1.connectToMPServer)();
            break;
        // startup
        case 20:
            break;
        default:
            break;
    }
}
/*export const addPlayer (i,gType,pType){
  console.log(i,gType,pType);

  currentPlayers.push(i);
  if (pType == 0){
    ports++;
    mType[ports-1] = gType;
    playerType[ports-1] = pType;

    costumeTimeout.push(false);
    pPal.push(ports-1);
    buildPlayerObject(ports-1);
    player[playerAmount-1].phys.pos = new Vec2D(-100+25*(playerAmount=1),-40);
    player[ports-1].phys.face = 1;
    player[ports-1].actionState = 0;
    $("#currentPlayers").append('<div class="pBoxBox"><div class="playerBox" id="pBox'+(ports-1)+'" style="background-color:'+palettes[pPal[ports-1]][0]+';border:5px solid '+palettes[pPal[ports-1]][2]+'0.8)"><p>P'+ports+'<br><span class="cont">(Cont. '+i+')</span></p></div><div id="pTag'+(ports-1)+'" class="pTag"><textarea id="pTagEdit'+(ports-1)+'" class="pTagEdit" maxlength="10"></textarea></div></div>');
  }
  else {
    mType[i] = gType;

    costumeTimeout.push(false);
    pPal.push(i);
    buildPlayerObject(i);
    player[playerAmount-1].phys.pos = new Vec2D(-100+25*(playerAmount=1),-40);
    player[i].phys.face = 1;
    player[i].actionState = 0;
    $("#currentPlayers").append('<div class="pBoxBox"><div class="playerBox" id="pBox'+i+'" style="background-color:'+palettes[pPal[i]][0]+';border:5px solid '+palettes[pPal[i]][2]+'0.8)"><p>P'+(i+1)+'<br><span class="cont">(Cont. '+i+')</span></p></div><div id="pTag'+i+'" class="pTag"><textarea id="pTagEdit'+i+'" class="pTagEdit" maxlength="10"></textarea></div></div>');
  }
  playerAmount++;
}

export const removePlayer (i){
  playerType[i] = -1;
  playerAmount--;
}*/
function interpretInputs(i, active, playertype, inputBuffer) {
    let tempBuffer = (0, input_1.nullInputs)();
    // keep updating Z and Start all the time, even when paused
    for (var k = 0; k < 7; k++) {
        tempBuffer[7 - k].z = inputBuffer[6 - k].z;
        tempBuffer[7 - k].s = inputBuffer[6 - k].s;
    }
    tempBuffer[0] = (0, input_1.pollInputs)(exports.gameMode, exports.frameByFrame, exports.mType[i], i, exports.currentPlayers[i], exports.keys, playertype);
    let pastOffset = 0;
    if ((exports.gameMode !== 3 && exports.gameMode !== 5) || (exports.playing && (exports.pause[i][1] || !exports.pause[i][0]))
        || exports.wasFrameByFrame
        || (!exports.playing && exports.pause[i][0] && !exports.pause[i][1])) {
        pastOffset = 1;
    }
    exports.pause[i][1] = exports.pause[i][0];
    exports.wasFrameByFrame = false;
    exports.frameAdvance[i][1] = exports.frameAdvance[i][0];
    for (var k = 0; k < 7; k++) {
        tempBuffer[7 - k].lsX = inputBuffer[7 - k - pastOffset].lsX;
        tempBuffer[7 - k].lsY = inputBuffer[7 - k - pastOffset].lsY;
        tempBuffer[7 - k].rawX = inputBuffer[7 - k - pastOffset].rawX;
        tempBuffer[7 - k].rawY = inputBuffer[7 - k - pastOffset].rawY;
        tempBuffer[7 - k].csX = inputBuffer[7 - k - pastOffset].csX;
        tempBuffer[7 - k].csY = inputBuffer[7 - k - pastOffset].csY;
        tempBuffer[7 - k].rawcsX = inputBuffer[7 - k - pastOffset].rawcsX;
        tempBuffer[7 - k].rawcsY = inputBuffer[7 - k - pastOffset].rawcsY;
        tempBuffer[7 - k].lA = inputBuffer[7 - k - pastOffset].lA;
        tempBuffer[7 - k].rA = inputBuffer[7 - k - pastOffset].rA;
        tempBuffer[7 - k].a = inputBuffer[7 - k - pastOffset].a;
        tempBuffer[7 - k].b = inputBuffer[7 - k - pastOffset].b;
        tempBuffer[7 - k].x = inputBuffer[7 - k - pastOffset].x;
        tempBuffer[7 - k].y = inputBuffer[7 - k - pastOffset].y;
        tempBuffer[7 - k].r = inputBuffer[7 - k - pastOffset].r;
        tempBuffer[7 - k].l = inputBuffer[7 - k - pastOffset].l;
        tempBuffer[7 - k].dl = inputBuffer[7 - k - pastOffset].dl;
        tempBuffer[7 - k].dd = inputBuffer[7 - k - pastOffset].dd;
        tempBuffer[7 - k].dr = inputBuffer[7 - k - pastOffset].dr;
        tempBuffer[7 - k].du = inputBuffer[7 - k - pastOffset].du;
    }
    if (exports.mType !== null) {
        if ((exports.mType[i] === "keyboard" && (tempBuffer[0].z || tempBuffer[1].z))
            || (exports.mType[i] !== "keyboard" && (tempBuffer[0].z && !tempBuffer[1].z))) {
            exports.frameAdvance[i][0] = true;
        }
        else {
            exports.frameAdvance[i][0] = false;
        }
    }
    if (exports.frameAdvance[i][0] && !exports.frameAdvance[i][1] && !exports.playing && exports.gameMode !== 4) {
        exports.frameByFrame = true;
    }
    if (exports.mType[i] === "keyboard") { // keyboard controls
        if (tempBuffer[0].s || tempBuffer[1].s || (exports.gameMode === 5 && (tempBuffer[0].du || tempBuffer[1].du))) {
            exports.pause[i][0] = true;
        }
        else {
            exports.pause[i][0] = false;
        }
        if (!exports.playing && (exports.gameMode == 3 || exports.gameMode == 5)
            && (tempBuffer[0].a || tempBuffer[1].a) && (tempBuffer[0].l || tempBuffer[1].l)
            && (tempBuffer[0].r || tempBuffer[1].r) && (tempBuffer[0].s || tempBuffer[1].s)) {
            if (tempBuffer[0].b || tempBuffer[1].b) {
                startGame();
            }
            else {
                endGame(inputBuffer);
            }
        }
        interpretPause(exports.pause[i][0], exports.pause[i][1]);
    }
    else if (exports.mType[i] !== null) { // gamepad controls
        if (!exports.playing && (exports.gameMode == 3 || exports.gameMode == 5) &&
            (tempBuffer[0].a && tempBuffer[0].l && tempBuffer[0].r && tempBuffer[0].s)
            && (!(tempBuffer[1].a && tempBuffer[1].l && tempBuffer[1].r && tempBuffer[1].s))) {
            if (tempBuffer[0].b) {
                startGame();
            }
            else {
                endGame(inputBuffer);
            }
        }
        if (tempBuffer[0].s || tempBuffer[0].du && exports.gameMode == 5) {
            exports.pause[i][0] = true;
        }
        else {
            exports.pause[i][0] = false;
        }
        // Controller reset functionality
        if ((tempBuffer[0].z || tempBuffer[0].du) && tempBuffer[0].x && tempBuffer[0].y) {
            exports.controllerResetCountdowns[i] -= 1;
            if (exports.controllerResetCountdowns[i] === 0) {
                // triggers code in input.js
                console.log("Controller #" + (i + 1) + " was reset!");
                (0, jquery_1.default)("#resetIndicator" + i).fadeIn(100);
                (0, jquery_1.default)("#resetIndicator" + i).fadeOut(500);
            }
        }
        else {
            exports.controllerResetCountdowns[i] = 125;
        }
        interpretPause(exports.pause[i][0], exports.pause[i][1]);
    }
    else { // AI
        tempBuffer[0].rawX = tempBuffer[0].lsX;
        tempBuffer[0].rawY = tempBuffer[0].lsY;
        tempBuffer[0].rawcsX = tempBuffer[0].csX;
        tempBuffer[0].rawcsY = tempBuffer[0].csY;
        tempBuffer[0].lsX = (0, meleeInputs_1.deaden)(tempBuffer[0].rawX);
        tempBuffer[0].lsY = (0, meleeInputs_1.deaden)(tempBuffer[0].rawY);
        tempBuffer[0].csX = (0, meleeInputs_1.deaden)(tempBuffer[0].rawcsX);
        tempBuffer[0].csY = (0, meleeInputs_1.deaden)(tempBuffer[0].rawcsY);
    }
    if (exports.showDebug) {
        (0, jquery_1.default)("#lsAxisX" + i).empty().append(tempBuffer[0].lsX.toFixed(3));
        (0, jquery_1.default)("#lsAxisY" + i).empty().append(tempBuffer[0].lsY.toFixed(3));
        (0, jquery_1.default)("#csAxisX" + i).empty().append(tempBuffer[0].csX.toFixed(3));
        (0, jquery_1.default)("#csAxisY" + i).empty().append(tempBuffer[0].csY.toFixed(3));
        (0, jquery_1.default)("#lAnalog" + i).empty().append(tempBuffer[0].lA.toFixed(3));
        (0, jquery_1.default)("#rAnalog" + i).empty().append(tempBuffer[0].rA.toFixed(3));
        (0, drawGamepad_1.updateGamepadSVGState)(i, "gamepadSVG" + i, tempBuffer[0]);
    }
    if (exports.gameMode === 14) { // controller calibration screen
        (0, drawGamepad_1.updateGamepadSVGState)(i, "gamepadSVGCalibration", tempBuffer[0]);
    }
    if (exports.showDebug || exports.gameMode === 14) {
        const which = (exports.showDebug && exports.gameMode === 14) ? "both" : exports.showDebug ? "debug" : "calibration";
        if (tempBuffer[0].x && !tempBuffer[1].x && tempBuffer[0].du) {
            (0, drawGamepad_1.cycleGamepadColour)(i, which, true);
        }
        if (tempBuffer[0].y && !tempBuffer[1].y && tempBuffer[0].du) {
            (0, drawGamepad_1.cycleGamepadColour)(i, which, false);
        }
    }
    if (streamclient_1.giveInputs[i] === true) {
        //turns out keyboards leave gaps in the input buffer
        (0, deepCopyObject_1.deepObjectMerge)(true, (0, input_1.nullInput)(), tempBuffer[0]);
        (0, streamclient_1.updateNetworkInputs)(tempBuffer[0], i);
    }
    if (active) {
        if (tempBuffer[0].dl && !tempBuffer[1].dl) {
            exports.player[i].showLedgeGrabBox = !exports.player[i].showLedgeGrabBox;
        }
        if (tempBuffer[0].dd && !tempBuffer[1].dd) {
            exports.player[i].showECB = !exports.player[i].showECB;
        }
        if (tempBuffer[0].dr && !tempBuffer[1].dr) {
            exports.player[i].showHitbox = !exports.player[i].showHitbox;
        }
    }
    if (exports.frameByFrame) {
        tempBuffer[0].z = false;
    }
    return tempBuffer;
}
function interpretPause(pause0, pause1) {
    if (pause0 && !pause1) {
        if (exports.gameMode == 3 || exports.gameMode == 5) {
            exports.playing = !exports.playing;
            if (!exports.playing) {
                // sounds.pause.play();
                // changeVolume(MusicManager, masterVolume[1] * 0.3, 1);
                (0, render_1.renderForeground)();
            }
            else {
                // changeVolume(MusicManager, masterVolume[1], 1);
            }
        }
    }
}
exports.c = 0;
exports.layers = {
    BG1: null,
    BG2: null,
    FG1: null,
    FG2: null,
    UI: null
};
exports.layerSwitches = {
    BG1: true,
    BG2: true,
    FG1: true,
    FG2: true,
    UI: true
};
function renderToMain() {
    var keys = Object.keys(exports.layers);
    for (var i = 0; i < keys.length; i++) {
        if (exports.layerSwitches[keys[i]]) {
            // c.drawImage(layers[keys[i]], 0, 0) //todo wat???
        }
    }
}
function update(i, inputBuffers) {
    if (!exports.starting) {
        if (exports.currentPlayers[i] != -1) {
            if (exports.playerType[i] == 0) {
                // do nothing, use the provided player i inputs
            }
            else if (exports.playerType[i] === 1) {
                if (exports.player[i].actionState != "SLEEP") {
                    (0, ai_1.runAI)(i); // no need to return input since polling returns ai input if they are active
                }
            }
        }
    }
    (0, physics_1.physics)(i, inputBuffers);
}
let delta = 0;
let lastFrameTimeMs = 0;
let lastUpdate = performance.now();
function gameTick(oldInputBuffers) {
    var start = performance.now();
    var diff = 0;
    let input = [(0, input_1.nullInputs)(), (0, input_1.nullInputs)(), (0, input_1.nullInputs)(), (0, input_1.nullInputs)()];
    if (exports.gameMode == 0 || exports.gameMode == 20) {
        findPlayers();
    }
    else if (exports.gameMode == 1) {
        //console.log(playerType);
        for (var i = 0; i < exports.ports; i++) {
            input[i] = interpretInputs(i, true, exports.playerType[i], oldInputBuffers[i]);
            (0, menu_1.menuMove)(i, input);
        }
    }
    else if (exports.gameMode == 10) {
        for (var i = 0; i < exports.ports; i++) {
            input[i] = interpretInputs(i, true, exports.playerType[i], oldInputBuffers[i]);
            (0, audiomenu_1.audioMenuControls)(i, input);
        }
    }
    else if (exports.gameMode == 11) {
        for (var i = 0; i < exports.ports; i++) {
            input[i] = interpretInputs(i, true, exports.playerType[i], oldInputBuffers[i]);
            (0, gameplaymenu_1.gameplayMenuControls)(i, input);
        }
    }
    else if (exports.gameMode == 12) {
        for (var i = 0; i < exports.ports; i++) {
            input[i] = interpretInputs(i, true, exports.playerType[i], oldInputBuffers[i]);
            (0, keyboardmenu_1.keyboardMenuControls)(i, input);
        }
    }
    else if (exports.gameMode == 13) {
        //target
    }
    else if (exports.gameMode == 14) {
        // controller calibration
        input[exports.calibrationPlayer] = interpretInputs(exports.calibrationPlayer, true, exports.playerType[exports.calibrationPlayer], oldInputBuffers[exports.calibrationPlayer]);
    }
    else if (exports.gameMode == 15) {
        for (var i = 0; i < exports.ports; i++) {
            input[i] = interpretInputs(i, true, exports.playerType[i], oldInputBuffers[i]);
            (0, menu_1.menuMove)(i, input);
        }
    }
    else if (exports.gameMode == 2) {
        for (var i = 0; i < 4; i++) {
            if (i < exports.ports) {
                input[i] = interpretInputs(i, true, exports.playerType[i], oldInputBuffers[i]);
                (0, css_1.cssControls)(i, input);
            }
            actionStateShortcuts_1.actionStates[exports.characterSelections[i]][exports.player[i].actionState].main(i, input);
        }
        for (var i = 0; i < 4; i++) {
            if (exports.playerType[i] > -1) {
                (0, hitDetection_1.hitDetect)(i, input);
            }
        }
        (0, hitDetection_1.executeHits)(input);
        (0, hitDetection_1.resetHitQueue)();
        findPlayers();
    }
    else if (exports.gameMode == 6) {
        // stage select
        for (var i = 0; i < 4; i++) {
            if (i < exports.ports) {
                input[i] = interpretInputs(i, true, exports.playerType[i], oldInputBuffers[i]);
                (0, stageselect_1.sssControls)(i, input);
            }
        }
    }
    else if (exports.playing || exports.frameByFrame) {
        //console.log("test0");
        /*delta = timestamp - lastFrameTimeMs; // get the delta time since last frame
        lastFrameTimeMs = timestamp;
        console.log(delta);*/
        var now = performance.now();
        var dt = now - lastUpdate;
        //console.log(now);
        //console.log(dt);
        lastUpdate = now;
        (0, hitDetection_1.resetHitQueue)();
        const _stage = (0, activeStage_1.getActiveStage)();
        if (_stage.movingPlatforms) {
            _stage.movingPlatforms();
        }
        (0, article_1.destroyArticles)();
        (0, article_1.executeArticles)();
        for (var i = 0; i < 4; i++) {
            if (exports.playerType[i] > -1) {
                if (!exports.starting) {
                    input[i] = interpretInputs(i, true, exports.playerType[i], oldInputBuffers[i]);
                }
                update(i, input);
            }
        }
        (0, hitDetection_1.checkPhantoms)();
        for (var i = 0; i < 4; i++) {
            if (exports.playerType[i] > -1) {
                (0, hitDetection_1.hitDetect)(i, input);
            }
        }
        (0, hitDetection_1.executeHits)(input);
        (0, article_1.articlesHitDetection)();
        (0, article_1.executeArticleHits)(input);
        if (!exports.starting && !exports.versusMode) {
            matchTimerTick(input);
        }
        else {
            exports.startTimer -= 0.01666667;
            if (exports.startTimer < 0) {
                exports.starting = false;
            }
        }
        if (exports.frameByFrame) {
            exports.frameByFrameRender = true;
            exports.wasFrameByFrame = true;
        }
        exports.frameByFrame = false;
        if (exports.showDebug) {
            diff = performance.now() - start;
            exports.gamelogicTime[0] += diff;
            exports.gamelogicTime[0] /= 2;
            if (diff >= 10) {
                exports.gamelogicTime[3]++;
            }
            if (diff < exports.gamelogicTime[2]) {
                exports.gamelogicTime[2] = diff;
            }
            if (diff > exports.gamelogicTime[1]) {
                exports.gamelogicTime[1] = diff;
            }
            dom.gamelogicAvg.innerHTML = String(Math.round(exports.gamelogicTime[0]));
            dom.gamelogicHigh.innerHTML = String(Math.round(exports.gamelogicTime[1]));
            dom.gamelogicLow.innerHTML = String(Math.round(exports.gamelogicTime[2]));
            dom.gamelogicPeak.innerHTML = String(exports.gamelogicTime[3]);
        }
    }
    else if (exports.findingPlayers) {
        findPlayers();
    }
    else {
        if (!exports.gameEnd) {
            for (var i = 0; i < 4; i++) {
                if (exports.playerType[i] == 0 || exports.playerType[i] == 2) {
                    if (exports.currentPlayers[i] != -1) {
                        input[i] = interpretInputs(i, false, exports.playerType[i], oldInputBuffers[i]);
                    }
                }
            }
        }
    }
    /*
  
    var beforeWaster = performance.now();
    // neeed to waste 0.666ms
    var timeWasted = false;
    var t = 0;
    var o = performance.now();
    while(!timeWasted){
      var n = performance.now();
      t += n - o;
      //console.log(t);
      if (t > 0.6666){
        timeWasted = true;
      }
      o = n;
      //console.log(".");
    }
    //console.log(performance.now() - beforeWaster);*/
    (0, replay_1.saveGameState)(input);
    setTimeout(gameTick, 16, input);
}
function clearScreen() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    //bg1.fillStyle = "rgb(0, 0, 0)";
    //bg1.fillRect(0,0,layers?.BG1?.width ?? 0,layers?.BG1?.height ?? 0);
    exports.bg2.clearRect(0, 0, (_b = (_a = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.BG2) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.BG2) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    //fg1.clearRect(0,0,layers?.FG1?.width ?? 0,layers?.FG1?.height ?? 0);
    exports.fg2.clearRect(0, 0, (_f = (_e = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.FG2) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0, (_h = (_g = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.FG2) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0);
    exports.ui.clearRect(0, 0, (_k = (_j = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.UI) === null || _j === void 0 ? void 0 : _j.width) !== null && _k !== void 0 ? _k : 0, (_m = (_l = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.UI) === null || _l === void 0 ? void 0 : _l.height) !== null && _m !== void 0 ? _m : 0);
}
let otherFrame = true;
let fps30 = false;
function renderTick() {
    window.requestAnimationFrame(renderTick);
    otherFrame = !otherFrame;
    if ((fps30 && otherFrame) || !fps30) {
        //console.log("------");
        if (exports.gameMode == 20) {
            (0, startup_1.drawStartUp)();
        }
        else if (exports.gameMode == 10) {
            (0, audiomenu_1.drawAudioMenu)();
        }
        else if (exports.gameMode == 11) {
            (0, gameplaymenu_1.drawGameplayMenu)();
        }
        else if (exports.gameMode == 12) {
            (0, keyboardmenu_1.drawKeyboardMenu)();
        }
        else if (exports.gameMode == 13) {
            // drawCredits();
        }
        else if (exports.gameMode == 14) {
            (0, controllermenu_1.drawControllerMenu)();
        }
        else if (exports.gameMode == 0) {
            (0, startscreen_1.drawStartScreen)();
        }
        else if (exports.gameMode == 1) {
            (0, menu_1.drawMainMenu)();
        }
        else if (exports.gameMode == 2) {
            (0, css_1.drawCSS)();
            //renderVfx();
        }
        else if (exports.gameMode == 6) {
            (0, stageselect_1.drawSSS)();
        }
        else if (exports.playing || exports.frameByFrameRender) {
            /*delta = timestamp - lastFrameTimeMs; // get the delta time since last frame
            lastFrameTimeMs = timestamp;
            console.log(delta);*/
            //console.log("test2");
            var rStart = performance.now();
            clearScreen();
            if ((0, vfx_1.isShowSFX)()) {
                (0, stagerender_1.drawBackground)();
            }
            (0, stagerender_1.drawStage)();
            for (var i = 0; i < 4; i++) {
                if (exports.playerType[i] > -1) {
                    (0, render_1.renderPlayer)(i);
                }
            }
            (0, article_1.renderArticles)();
            (0, renderVfx_1.renderVfx)();
            (0, render_1.renderOverlay)(true);
            if (exports.showDebug) {
                var diff = performance.now() - rStart;
                exports.renderTime[0] += diff;
                exports.renderTime[0] /= 2;
                if (diff >= 10) {
                    exports.renderTime[3]++;
                }
                if (diff > exports.renderTime[1]) {
                    exports.renderTime[1] = diff;
                }
                if (diff < exports.renderTime[2]) {
                    exports.renderTime[2] = diff;
                }
                dom.renderAvg.innerHTML = String(Math.round(exports.renderTime[0]));
                dom.renderHigh.innerHTML = String(Math.round(exports.renderTime[1]));
                dom.renderLow.innerHTML = String(Math.round(exports.renderTime[2]));
                dom.renderPeak.innerHTML = String(exports.renderTime[3]);
            }
        }
        if (exports.frameByFrameRender) {
            (0, render_1.renderForeground)();
        }
        exports.frameByFrameRender = false;
        //renderToMain();
        //console.log(performance.now());
    }
    else {
        if (exports.playing) {
            (0, renderVfx_1.renderVfx)(true);
        }
    }
}
function buildPlayerObject(i) {
    exports.player[i] = new player_1.playerObject(exports.characterSelections[i], exports.startingPoint[i], exports.startingFace[i]);
    exports.player[i].phys.ECB1 = [new Vec2D_1.Vec2D(exports.startingPoint[i].x, exports.startingPoint[i].y), new Vec2D_1.Vec2D(exports.startingPoint[i].x, exports.startingPoint[i].y), new Vec2D_1.Vec2D(exports.startingPoint[i].x, exports.startingPoint[i].y), new Vec2D_1.Vec2D(exports.startingPoint[i].x, exports.startingPoint[i].y)];
    exports.player[i].phys.ECBp = [new Vec2D_1.Vec2D(exports.startingPoint[i].x, exports.startingPoint[i].y), new Vec2D_1.Vec2D(exports.startingPoint[i].x, exports.startingPoint[i].y), new Vec2D_1.Vec2D(exports.startingPoint[i].x, exports.startingPoint[i].y), new Vec2D_1.Vec2D(exports.startingPoint[i].x, exports.startingPoint[i].y)];
    exports.player[i].difficulty = exports.cpuDifficulty[i];
}
function initializePlayers(i, target) {
    buildPlayerObject(i);
    if (target) {
        (0, drawVfx_1.drawVfx)({
            name: "entrance",
            pos: new Vec2D_1.Vec2D(activeStage_1.activeStage.startingPoint[0].x, activeStage_1.activeStage.startingPoint[0].y)
        });
    }
    else {
        (0, drawVfx_1.drawVfx)({
            name: "entrance",
            pos: new Vec2D_1.Vec2D(exports.startingPoint[i][0], exports.startingPoint[i][1])
        });
    }
}
function startGame() {
    (0, activeStage_1.setVsStage)(exports.stageSelect);
    (0, stagerender_1.setBackgroundType)(Math.round(Math.random()));
    changeGamemode(3);
    (0, vfxQueue_1.resetVfxQueue)();
    for (var n = 0; n < 4; n++) {
        if (exports.playerType[n] > -1) {
            initializePlayers(n, false);
            (0, render_1.renderPlayer)(n);
            exports.player[n].inCSS = false;
        }
        if (exports.versusMode) {
            exports.player[n].stocks = 1;
        }
    }
    exports.matchTimer = 480;
    exports.startTimer = 1.5;
    exports.starting = true;
    music_1.MusicManager.stopWhatisPlaying();
    switch (exports.stageSelect) {
        case 0:
            music_1.MusicManager.playBattleFieldLoop();
            break;
        case 1:
            music_1.MusicManager.playyStoryLoop();
            break;
        case 2:
            music_1.MusicManager.playpStadiumLoop();
            break;
        case 3:
            music_1.MusicManager.playDreamLandLoop();
            break;
        case 4:
            music_1.MusicManager.playfinaldLoop();
            break;
        case 5:
            music_1.MusicManager.playfodLoop();
            break;
        default:
            break;
    }
    (0, drawVfx_1.drawVfx)({
        name: "start",
        pos: new Vec2D_1.Vec2D(0, 0)
    });
    exports.findingPlayers = false;
    exports.playing = true;
}
function endGame(input) {
    exports.gameEnd = false;
    (0, render_1.resetLostStockQueue)();
    (0, hitDetection_1.setPhantonQueue)([]);
    (0, article_1.resetAArticles)();
    music_1.MusicManager.stopWhatisPlaying();
    // changeVolume(MusicManager, masterVolume[1], 1);
    exports.playing = false;
    clearScreen();
    (0, stagerender_1.drawStage)();
    (0, css_2.setTokenPosSnapToChar)(0);
    (0, css_2.setTokenPosSnapToChar)(1);
    (0, css_2.setTokenPosSnapToChar)(2);
    (0, css_2.setTokenPosSnapToChar)(3);
    if (exports.gameMode == 3) {
        changeGamemode(2);
        music_1.MusicManager.playMenuLoop();
        exports.pause = [[true, true], [true, true], [true, true], [true, true]];
        exports.frameAdvance = [
            [true, true],
            [true, true],
            [true, true],
            [true, true]
        ];
        exports.findingPlayers = true;
        positionPlayersInCSS();
        for (var i = 0; i < 4; i++) {
            if (exports.playerType[i] > -1) {
                if (exports.player[i].actionState == "FURAFURA") {
                    sfx_1.sounds.furaloop.stop(exports.player[i].furaLoopID);
                }
                //input[i][0].a = true; // do
                //input[i][1].a = true; // not
                exports.player[i].inCSS = true;
                exports.player[i].phys.face = 1;
                exports.player[i].actionState = "WAIT";
                exports.player[i].timer = 0;
            }
        }
    }
}
function finishGame(input = null) {
    exports.gameEnd = true;
    exports.playing = false;
    exports.fg2.save();
    exports.fg2.textAlign = "center";
    var text = "Game!";
    var size = 300;
    var textScale = 1;
    var textGrad = exports.fg2.createLinearGradient(0, 200, 0, 520);
    if (exports.matchTimer <= 0) {
        text = "Time!";
        sfx_1.sounds.time.play();
        textGrad.addColorStop(0, "black");
        textGrad.addColorStop(0.5, "black");
        textGrad.addColorStop(0.7, "rgb(21, 51, 180)");
        textGrad.addColorStop(1, "rgb(71, 94, 250)");
    }
    else {
        sfx_1.sounds.game.play();
        textGrad.addColorStop(0, "black");
        textGrad.addColorStop(0.4, "black");
        textGrad.addColorStop(0.7, "rgb(167, 27, 40)");
        textGrad.addColorStop(1, "rgb(255, 31, 52)");
    }
    exports.fg2.scale(1, textScale);
    exports.fg2.fillStyle = textGrad;
    exports.fg2.lineWidth = 40;
    exports.fg2.strokeStyle = "black";
    exports.fg2.font = "900 " + size + "px Arial";
    exports.fg2.strokeText(text, 600, 470 / textScale);
    exports.fg2.lineWidth = 20;
    exports.fg2.strokeStyle = "white";
    exports.fg2.font = "900 " + size + "px Arial";
    exports.fg2.strokeText(text, 600, 470 / textScale);
    exports.fg2.font = "900 " + size + "px Arial";
    exports.fg2.fillText(text, 600, 470 / textScale);
    exports.fg2.restore();
    music_1.MusicManager.stopWhatisPlaying();
    setTimeout(function () {
        endGame(input);
    }, 2500);
}
function onFullScreenChange() {
    var fullscreenElement = document.fullscreenElement;
    // if in fullscreen mode fullscreenElement won't be null
    var cont = document.getElementById("topButtonContainer");
    var icn = document.querySelectorAll(".topButton");
    if (cont === null) {
        throw Error("top button container not found");
    }
    if ((icn === null || icn === void 0 ? void 0 : icn.length) === null) {
        throw Error("top button class not found");
    }
    if (fullscreenElement != null) {
        cont.style.transition = "opacity 0.5s linear 0s";
        cont.style.opacity = "0";
        setTimeout(function () {
            var i;
            for (i = 0; i < icn.length; i++) {
                icn[i].setAttribute("style", "height: 5px");
            }
            cont.style.height = "5px";
            window.resize();
        }, 500);
        (0, jquery_1.default)("#keyboardPrompt").hide();
        (0, jquery_1.default)("#keyboardControlsImg").hide();
        (0, jquery_1.default)("#controllerSupportContainer").hide();
        (0, jquery_1.default)("#debugButtonEdit").empty().append("OFF");
        (0, jquery_1.default)("#debug").hide();
        (0, jquery_1.default)("#players").hide();
        (0, jquery_1.default)("body").css("overflow", "hidden");
        // showHeader = false;
    }
    else {
        var i;
        for (i = 0; i < icn.length; i++) {
            // icn[i]!.style!.height = "25px";
            icn[i].setAttribute("style", "height: 25px");
        }
        cont.style.height = "31px";
        cont.style.transition = "opacity 0.5s linear 0s";
        cont.style.opacity = "1";
    }
}
function start() {
    var _a, _b, _c, _d;
    for (var i = 0; i < 4; i++) {
        buildPlayerObject(i);
        exports.player[i].phys.face = 1;
        exports.player[i].actionState = "WAIT";
    }
    cacheDom();
    (0, keyboardmenu_1.getKeyboardCookie)();
    (0, audiomenu_1.getAudioCookies)();
    (0, gameplaymenu_1.getGameplayCookies)();
    (0, jquery_1.default)("#keyboardButton").click(function () {
        (0, jquery_1.default)("#keyboardControlsImg").toggle();
        (0, jquery_1.default)("#keyboardPrompt").hide();
    });
    (0, jquery_1.default)("#controllerButton").click(function () {
        (0, jquery_1.default)("#controllerSupportContainer").toggle();
    });
    if (exports.layers === null) {
        throw Error("layers is null");
    }
    exports.layers.BG1 = document.getElementById("background1Canvas");
    exports.bg1 = exports.layers.BG1.getContext("2d");
    if (!exports.layers.BG1)
        throw Error("bg1 not found");
    exports.layers.BG2 = document.getElementById("background2Canvas");
    exports.bg2 = exports.layers.BG2.getContext("2d");
    if (!exports.layers.BG2)
        throw Error("bg2 not found");
    exports.layers.FG1 = document.getElementById("foreground1Canvas");
    exports.fg1 = exports.layers.FG1.getContext("2d");
    if (!exports.layers.FG1)
        throw Error("fg1 not found");
    exports.layers.FG2 = document.getElementById("foreground2Canvas");
    exports.fg2 = exports.layers.FG2.getContext("2d");
    if (!exports.layers.FG2)
        throw Error("fg2 not found");
    exports.layers.UI = document.getElementById("uiCanvas");
    if (!exports.layers.UI)
        throw Error("uiCanvas not found");
    exports.ui = exports.layers.UI.getContext("2d");
    exports.bg1.fillStyle = "rgb(0, 0, 0)";
    exports.bg1.fillRect(0, 0, (_b = (_a = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0, (_d = (_c = exports.layers === null || exports.layers === void 0 ? void 0 : exports.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0);
    let nullInputBuffers = [(0, input_1.nullInputs)(), (0, input_1.nullInputs)(), (0, input_1.nullInputs)(), (0, input_1.nullInputs)()];
    gameTick(nullInputBuffers);
    renderTick();
    (0, jquery_1.default)("#effectsButton").click(function () {
        if ((0, vfx_1.isShowSFX)()) {
            (0, jquery_1.default)("#effectsButtonEdit").empty().append("OFF");
        }
        else {
            (0, jquery_1.default)("#effectsButtonEdit").empty().append("ON");
        }
        (0, vfx_1.toggleShowSFX)();
    });
    (0, jquery_1.default)("#fpsButton").click(function () {
        if (fps30) {
            (0, jquery_1.default)("#fpsButtonEdit").empty().append("60");
        }
        else {
            (0, jquery_1.default)("#fpsButtonEdit").empty().append("30");
        }
        fps30 = !fps30;
    });
    (0, jquery_1.default)("#alphaButton").click(function () {
        if ((0, transparency_1.getTransparency)()) {
            (0, jquery_1.default)("#alphaButtonEdit").empty().append("OFF");
        }
        else {
            (0, jquery_1.default)("#alphaButtonEdit").empty().append("ON");
        }
        (0, transparency_1.toggleTransparency)();
    });
    (0, jquery_1.default)("#layerButton").hover(function () {
        (0, jquery_1.default)("#layerDropdown").toggle();
    });
    (0, jquery_1.default)(".layer").click(function () {
        var id = (0, jquery_1.default)(this).attr("id");
        switch (id) {
            case "layer1":
                exports.layerSwitches.BG1 = !exports.layerSwitches.BG1;
                (0, jquery_1.default)("#background1Canvas").toggle();
                break;
            case "layer2":
                exports.layerSwitches.BG2 = !exports.layerSwitches.BG2;
                (0, jquery_1.default)("#background2Canvas").toggle();
                break;
            case "layer3":
                exports.layerSwitches.FG1 = !exports.layerSwitches.FG1;
                (0, jquery_1.default)("#foreground1Canvas").toggle();
                break;
            case "layer4":
                exports.layerSwitches.FG2 = !exports.layerSwitches.FG2;
                (0, jquery_1.default)("#foreground2Canvas").toggle();
                break;
            case "layer5":
                exports.layerSwitches.UI = !exports.layerSwitches.UI;
                (0, jquery_1.default)("#uiCanvas").toggle();
                break;
            default:
                break;
        }
        (0, jquery_1.default)(this).toggleClass("layerOn");
    });
    (0, jquery_1.default)("#debugButton").click(function () {
        if (exports.showDebug) {
            for (let i = 0; i < 4; i++) {
                document.getElementById("gamepadSVG" + i).style.display = "none";
            }
            (0, jquery_1.default)("#debugButtonEdit").empty().append("OFF");
            (0, jquery_1.default)("#debug").hide();
            (0, jquery_1.default)("#players").hide();
            (0, jquery_1.default)("body").css("overflow", "hidden");
            //var mY = Math.max(($(window).height()-750)/2,0);
            //$("#display").css("margin",mY+"px 0px 0px "+mX+"px");
        }
        else {
            for (let i = 0; i < 4; i++) {
                if (exports.playerType[i] !== -1) {
                    (0, drawGamepad_1.updateGamepadSVGColour)(i, "gamepadSVG" + i);
                    document.getElementById("gamepadSVG" + i).style.display = "";
                }
            }
            (0, jquery_1.default)("#debugButtonEdit").empty().append("ON");
            (0, jquery_1.default)("#debug").show();
            (0, jquery_1.default)("#players").show();
            (0, jquery_1.default)("body").css("overflow", "scroll");
            //var mY = Math.max(($(window).height()-900)/2,0);
            //$("#display").css("margin",mY+" 0px 0px px "+mX+"px");
        }
        exports.showDebug = !exports.showDebug;
        window.resize();
    });
    (0, jquery_1.default)("#hideButton").click(function () {
        (0, jquery_1.default)("#header").toggle();
        // // showHeader = !showHeader;
        window.resize();
    });
    (0, jquery_1.default)("#fullscreenButton").click(function () {
        if (document.fullscreenElement) {
            // Exit fullscreen mode
            document.exitFullscreen().catch(err => {
                console.error("Failed to exit fullscreen mode:", err);
            });
        }
        else {
            // Enter fullscreen mode
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error("Failed to enter fullscreen mode:", err);
                });
            }
            else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen().catch(err => {
                    console.error("Failed to enter fullscreen mode:", err);
                });
            }
            else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen().catch(err => {
                    console.error("Failed to enter fullscreen mode:", err);
                });
            }
            else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen().catch(err => {
                    console.error("Failed to enter fullscreen mode:", err);
                });
            }
            else {
                console.log("Fullscreen API is not supported");
            }
        }
    });
    document.addEventListener("fullscreenchange", onFullScreenChange, false);
    document.addEventListener("webkitfullscreenchange", onFullScreenChange, false);
    document.addEventListener("mozfullscreenchange", onFullScreenChange, false);
    (0, jquery_1.default)(".topButton").hover(function () {
        (0, jquery_1.default)(this).children(".buttonDetails").toggle();
    });
    if (window.mobile === false) {
        (0, jquery_1.default)(".button").hover(function () {
            (0, jquery_1.default)(this).toggleClass("buttonhighlighted");
        });
        (0, jquery_1.default)(".socialmedia").hover(function () {
            (0, jquery_1.default)(this).toggleClass("socialmediahighlight");
        });
        (0, jquery_1.default)(".sugbtn").hover(function () {
            (0, jquery_1.default)(this).toggleClass("sugbtnhighlight");
        });
    }
    (0, jquery_1.default)("#appsButton").hover(function () {
        (0, jquery_1.default)("#appsDropdown").show();
    }, function () {
        (0, jquery_1.default)("#appsDropdown").hide();
    });
    (0, jquery_1.default)("#replay").change(function () {
        // grab the first image in the FileList object and pass it to the function
        // loadReplay(this.files[0]); // todo - wat???
    });
    window.resize();
}
window.start = start;
class customDeadzone {
    constructor() {
        this.ls = new Vec2D_1.Vec2D(0, 0);
        this.cs = new Vec2D_1.Vec2D(0, 0);
        this.l = 0;
        this.r = 0;
    }
}
exports.customDeadzone = customDeadzone;
function addShine(val) {
    exports.shine += val;
}
function setShine(val) {
    exports.shine = val;
}
function setFindingPlayers(val) {
    exports.findingPlayers = val;
}
function setPlaying(val) {
    exports.playing = val;
}
function setCalibrationPlayer(val) {
    exports.calibrationPlayer = val;
}
const dom = {
    matchMinutes: null,
    matchSeconds: null,
    gamelogicAvg: null,
    gamelogicHigh: null,
    gamelogicLow: null,
    gamelogicPeak: null,
    renderAvg: null,
    renderHigh: null,
    renderLow: null,
    renderPeak: null,
};
function cacheDom() {
    const elementIds = [
        "matchMinutes",
        "matchSeconds",
        "gamelogicAvg",
        "gamelogicHigh",
        "gamelogicLow",
        "gamelogicPeak",
        "renderAvg",
        "renderHigh",
        "renderLow",
        "renderPeak",
    ];
    elementIds.forEach((id) => {
        dom[id] = document.getElementById(id);
    });
}
;
function setCS(index, val) {
    exports.characterSelections[index] = val;
}
