"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rtfFlashD = exports.rtfFlash = exports.readyToFight = exports.occupiedCpu = exports.whichCpuGrabbed = exports.cpuGrabbed = exports.cpuSlider = exports.bHold = exports.occupiedToken = exports.whichTokenGrabbed = exports.tokenGrabbed = exports.chosenChar = exports.tokenPos = exports.handPos = exports.handType = exports.choosingTag = exports.handGrab = exports.handOpen = exports.handPoint = exports.falconPic = exports.falcoPic = exports.foxPic = exports.puffPic = exports.marthPic = void 0;
exports.setChoosingTag = setChoosingTag;
exports.setChosenChar = setChosenChar;
exports.setTokenPosSnapToChar = setTokenPosSnapToChar;
exports.setTokenPosValue = setTokenPosValue;
exports.changeCharacter = changeCharacter;
exports.cssControls = cssControls;
exports.drawCSSInit = drawCSSInit;
exports.drawCSS = drawCSS;
const main_1 = require("../main/main");
const render_1 = require("main/render");
const sfx_1 = require("main/sfx");
const actionStateShortcuts_1 = require("physics/actionStateShortcuts");
const main_2 = require("../main/main");
const characters_1 = require("../main/characters");
const Vec2D_1 = require("../main/util/Vec2D");
const streamclient_1 = require("../main/multiplayer/streamclient");
const settings_1 = require("../settings");
const animations_1 = require("../animations");
const jquery_1 = __importDefault(require("jquery"));
/* eslint-disable */
exports.marthPic = new Image();
exports.marthPic.src = "assets/css/marth.png";
exports.puffPic = new Image();
exports.puffPic.src = "assets/css/puff.png";
exports.foxPic = new Image();
exports.foxPic.src = "assets/css/fox.png";
exports.falcoPic = new Image();
exports.falcoPic.src = "assets/css/falco.png";
exports.falconPic = new Image();
exports.falconPic.src = "assets/css/falcon.png";
exports.handPoint = new Image();
exports.handPoint.src = "assets/hand/handpoint.png";
exports.handOpen = new Image();
exports.handOpen.src = "assets/hand/handopen.png";
exports.handGrab = new Image();
exports.handGrab.src = "assets/hand/handgrab.png";
exports.choosingTag = -1;
function setChoosingTag(val) {
    exports.choosingTag = val;
}
exports.handType = [0, 0, 0, 0];
exports.handPos = [new Vec2D_1.Vec2D(140, 700), new Vec2D_1.Vec2D(365, 700), new Vec2D_1.Vec2D(590, 700), new Vec2D_1.Vec2D(815, 700)];
exports.tokenPos = [new Vec2D_1.Vec2D(475 - 54, 268), new Vec2D_1.Vec2D(515 - 54, 268), new Vec2D_1.Vec2D(475 - 54, 308), new Vec2D_1.Vec2D(515 - 54, 308)];
exports.chosenChar = [0, 0, 0, 0];
exports.tokenGrabbed = [false, false, false, false];
exports.whichTokenGrabbed = [-1, -1, -1, -1];
exports.occupiedToken = [false, false, false, false];
exports.bHold = [0, 0, 0, 0];
exports.cpuSlider = [new Vec2D_1.Vec2D(152 + 15 + 166 + 0 - 50, 595), new Vec2D_1.Vec2D(152 + 15 + 166 + 225 - 50, 595), new Vec2D_1.Vec2D(152 + 15 + 166 + 450 - 50, 595), new Vec2D_1.Vec2D(152 + 15 + 166 + 675 - 50, 595)];
exports.cpuGrabbed = [false, false, false, false];
exports.whichCpuGrabbed = [-1, -1, -1, -1];
exports.occupiedCpu = [false, false, false, false];
exports.readyToFight = false;
exports.rtfFlash = 25;
exports.rtfFlashD = 1;
const gameSettingsText = {
    turbo: "Turbo Mode",
    lCancelType: "L-Cancel Type", // 0- normal | 1 - Auto | 2 - smash 64
    blastzoneWrapping: "",
    flashOnLCancel: "Flash on L-Cancel",
    dustLessPerfectWavedash: "",
    phantomThreshold: "",
    everyCharWallJump: "Everyone Walljumps", //0 - off | 1 - on
    tapJumpOffp1: "Player 1 tap-jump",
    tapJumpOffp2: "Player 2 tap-jump",
    tapJumpOffp3: "Player 3 tap-jump",
    tapJumpOffp4: "Player 4 tap-jump",
};
const gameSettingsValueTranslation = {
    turbo: (value) => {
        return (value === 0) ? "OFF" : "ON";
    },
    lCancelType: (value) => {
        return (value === 0) ? "NORMAL" : (value === 1) ? "AUTO" : "SMASH 64";
    }, // 0- normal | 1 - Auto | 2 - smash 64
    blastzoneWrapping: "",
    flashOnLCancel: (value) => {
        return (value === 0) ? "OFF" : "ON";
    },
    dustLessPerfectWavedash: "",
    phantomThreshold: "",
    everyCharWallJump: (value) => {
        return (value === 0) ? "OFF" : "ON";
    }, //0 - off | 1 - on
    tapJumpOffp1: (value) => {
        return (value === 0) ? "OFF" : "ON";
    },
    tapJumpOffp2: (value) => {
        return (value === 0) ? "OFF" : "ON";
    },
    tapJumpOffp3: (value) => {
        return (value === 0) ? "OFF" : "ON";
    },
    tapJumpOffp4: (value) => {
        return (value === 0) ? "OFF" : "ON";
    },
};
//in order
const charIconPos = [
    //marth
    new Vec2D_1.Vec2D(475, 268),
    //puff
    new Vec2D_1.Vec2D(568, 268),
    //fox
    new Vec2D_1.Vec2D(663, 268),
    //falco
    new Vec2D_1.Vec2D(733, 268),
    //falcon
    new Vec2D_1.Vec2D(803, 268)
];
function setChosenChar(index, charSelected) {
    (0, main_2.setCS)(index, charSelected);
    exports.chosenChar[index] = charSelected;
    exports.tokenGrabbed[index] = false;
    exports.occupiedToken[index] = false;
    // setTokenPosSnapToChar(index, charSelected);
    setTokenPosSnapToChar(index);
    main_1.player[index].actionState = "WAIT";
    main_1.player[index].timer = 0;
    main_1.player[index].charAttributes = characters_1.chars[main_1.characterSelections[index]].attributes;
    main_1.player[index].charHitboxes = characters_1.chars[main_1.characterSelections[index]].hitboxes;
    exports.whichTokenGrabbed[index] = -1;
}
function setTokenPosSnapToChar(index) {
    exports.tokenPos[index] = charIconPos[index];
}
function setTokenPosValue(index, val) {
    if (typeof (val) === 'undefined') {
        debugger;
    }
    exports.tokenPos[index] = val;
}
function changeCharacter(i, c) {
    (0, main_2.setCS)(i, c);
    (0, streamclient_1.syncCharacter)(i, c);
    main_1.player[i].actionState = "WAIT";
    main_1.player[i].timer = 0;
    main_1.player[i].charAttributes = characters_1.chars[main_1.characterSelections[i]].attributes;
    main_1.player[i].charHitboxes = characters_1.chars[main_1.characterSelections[i]].hitboxes;
}
function cancelSetTag() {
    sfx_1.sounds.menuSelect.play();
    main_1.tagText[exports.choosingTag] = (0, jquery_1.default)("#pTagEdit" + exports.choosingTag).val();
    (0, streamclient_1.syncTagText)(exports.choosingTag, main_1.tagText[exports.choosingTag]);
    (0, jquery_1.default)("#pTagEdit" + exports.choosingTag).hide();
    exports.choosingTag = -1;
}
function cssControls(i, input) {
    var _a, _b, _c, _d;
    let allowRegrab = true;
    let o = 54;
    if (exports.choosingTag == -1) {
        if (input[i][0].b) {
            exports.bHold[i]++;
            if (exports.bHold[i] == 30) {
                sfx_1.sounds.menuBack.play();
                (0, main_1.changeGamemode)(1);
            }
        }
        else {
            exports.bHold[i] = 0;
        }
        exports.handPos[i].x += input[i][0].lsX * 12;
        exports.handPos[i].y += -input[i][0].lsY * 12;
        if (exports.handPos[i].x > 1200) {
            exports.handPos[i].x = 1200;
        }
        else if (exports.handPos[i].x < 0) {
            exports.handPos[i].x = 0;
        }
        if (exports.handPos[i].y > 750) {
            exports.handPos[i].y = 750;
        }
        else if (exports.handPos[i].y < 0) {
            exports.handPos[i].y = 0;
        }
        if (exports.handPos[i].y < 400 && exports.handPos[i].y > 160) {
            exports.handType[i] = 1;
            if (input[i][0].b && !input[i][1].b && main_1.playerType[i] == 0 && exports.whichTokenGrabbed[i] == -1) {
                exports.handType[i] = 2;
                setTokenPosValue(i, new Vec2D_1.Vec2D(exports.handPos[i].x, exports.handPos[i].y));
                exports.tokenGrabbed[i] = true;
                exports.whichTokenGrabbed[i] = i;
                exports.occupiedToken[i] = true;
            }
            if (exports.tokenGrabbed[exports.whichTokenGrabbed[i]]) {
                exports.handType[i] = 2;
                setTokenPosValue(exports.whichTokenGrabbed[i], new Vec2D_1.Vec2D(exports.handPos[i].x, exports.handPos[i].y));
                if (exports.handPos[i].y > 240 && exports.handPos[i].y < 335) {
                    // - 43
                    if (exports.handPos[i].x > 452 - o && exports.handPos[i].x < 547 - o) {
                        if (exports.chosenChar[exports.whichTokenGrabbed[i]] != 0) {
                            exports.chosenChar[exports.whichTokenGrabbed[i]] = 0;
                            changeCharacter(exports.whichTokenGrabbed[i], 0);
                            sfx_1.sounds.menuSelect.play();
                        }
                        if (input[i][0].a && !input[i][1].a) {
                            exports.tokenGrabbed[exports.whichTokenGrabbed[i]] = false;
                            exports.occupiedToken[exports.whichTokenGrabbed[i]] = false;
                            setTokenPosValue(exports.whichTokenGrabbed[i], new Vec2D_1.Vec2D(473 - o + (exports.whichTokenGrabbed[i] % 2) * 40, 268 + (exports.whichTokenGrabbed[i] > 1 ? 40 : 0)));
                            exports.whichTokenGrabbed[i] = -1;
                            sfx_1.sounds.marth.play();
                        }
                    }
                    else if (exports.handPos[i].x > 547 - o && exports.handPos[i].x < 642 - o) {
                        if (exports.chosenChar[exports.whichTokenGrabbed[i]] != 1) {
                            exports.chosenChar[exports.whichTokenGrabbed[i]] = 1;
                            changeCharacter(exports.whichTokenGrabbed[i], 1);
                            sfx_1.sounds.menuSelect.play();
                        }
                        if (input[i][0].a && !input[i][1].a) {
                            exports.tokenGrabbed[exports.whichTokenGrabbed[i]] = false;
                            exports.occupiedToken[exports.whichTokenGrabbed[i]] = false;
                            setTokenPosValue(exports.whichTokenGrabbed[i], new Vec2D_1.Vec2D(568 - o + (exports.whichTokenGrabbed[i] % 2) * 40, 268 + (exports.whichTokenGrabbed[i] > 1 ? 40 : 0)));
                            exports.whichTokenGrabbed[i] = -1;
                            sfx_1.sounds.jigglypuff.play();
                        }
                    }
                    else if (exports.handPos[i].x > 642 - o && exports.handPos[i].x < 737 - o) {
                        if (exports.chosenChar[exports.whichTokenGrabbed[i]] != 2) {
                            exports.chosenChar[exports.whichTokenGrabbed[i]] = 2;
                            changeCharacter(exports.whichTokenGrabbed[i], 2);
                            sfx_1.sounds.menuSelect.play();
                        }
                        if (input[i][0].a && !input[i][1].a) {
                            exports.tokenGrabbed[exports.whichTokenGrabbed[i]] = false;
                            exports.occupiedToken[exports.whichTokenGrabbed[i]] = false;
                            setTokenPosValue(exports.whichTokenGrabbed[i], new Vec2D_1.Vec2D(663 - o + (exports.whichTokenGrabbed[i] % 2) * 40, 268 + (exports.whichTokenGrabbed[i] > 1 ? 40 : 0)));
                            exports.whichTokenGrabbed[i] = -1;
                            sfx_1.sounds.fox.play();
                        }
                    }
                    else if (exports.handPos[i].x > 737 - o && exports.handPos[i].x < 832 - o) {
                        if (exports.chosenChar[exports.whichTokenGrabbed[i]] != 3) {
                            exports.chosenChar[exports.whichTokenGrabbed[i]] = 3;
                            changeCharacter(exports.whichTokenGrabbed[i], 3);
                            sfx_1.sounds.menuSelect.play();
                        }
                        if (input[i][0].a && !input[i][1].a) {
                            exports.tokenGrabbed[exports.whichTokenGrabbed[i]] = false;
                            exports.occupiedToken[exports.whichTokenGrabbed[i]] = false;
                            setTokenPosValue(exports.whichTokenGrabbed[i], new Vec2D_1.Vec2D(758 - o + (exports.whichTokenGrabbed[i] % 2) * 40, 268 + (exports.whichTokenGrabbed[i] > 1 ? 40 : 0)));
                            exports.whichTokenGrabbed[i] = -1;
                            sfx_1.sounds.falco.play();
                        }
                    }
                    else if (exports.handPos[i].x > 832 - o && exports.handPos[i].x < 927 - o) {
                        if (exports.chosenChar[exports.whichTokenGrabbed[i]] != 4) {
                            exports.chosenChar[exports.whichTokenGrabbed[i]] = 4;
                            changeCharacter(exports.whichTokenGrabbed[i], 4);
                            sfx_1.sounds.menuSelect.play();
                        }
                        if (input[i][0].a && !input[i][1].a) {
                            exports.tokenGrabbed[exports.whichTokenGrabbed[i]] = false;
                            exports.occupiedToken[exports.whichTokenGrabbed[i]] = false;
                            setTokenPosValue(exports.whichTokenGrabbed[i], new Vec2D_1.Vec2D(853 - o + (exports.whichTokenGrabbed[i] % 2) * 40, 268 + (exports.whichTokenGrabbed[i] > 1 ? 40 : 0)));
                            exports.whichTokenGrabbed[i] = -1;
                            sfx_1.sounds.falcon.play();
                        }
                    }
                }
            }
            else {
                for (var j = 0; j < 4; j++) {
                    //console.log(j+" "+occupiedToken[j]);
                    if (!exports.occupiedToken[j] && (main_1.playerType[j] == 1 || i == j)) {
                        if (exports.handPos[i].y > exports.tokenPos[j].y - 20 && exports.handPos[i].y < exports.tokenPos[j].y + 20 && exports.handPos[i].x > exports.tokenPos[j].x -
                            20 && exports.handPos[i].x < exports.tokenPos[j].x + 20) {
                            if (input[i][0].a && !input[i][1].a) {
                                exports.handType[i] = 2;
                                exports.whichTokenGrabbed[i] = j;
                                setTokenPosValue(exports.whichTokenGrabbed[i], new Vec2D_1.Vec2D(exports.handPos[i].x, exports.handPos[i].y));
                                exports.tokenGrabbed[exports.whichTokenGrabbed[i]] = true;
                                exports.occupiedToken[exports.whichTokenGrabbed[i]] = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
        else if (exports.cpuGrabbed[i]) {
            exports.handPos[i].y = exports.cpuSlider[exports.whichCpuGrabbed[i]].y + 15;
            if (exports.handPos[i].x < 152 + 15 + exports.whichCpuGrabbed[i] * 225) {
                exports.handPos[i].x = 152 + 15 + exports.whichCpuGrabbed[i] * 225;
            }
            if (exports.handPos[i].x > 152 + 15 + 166 + exports.whichCpuGrabbed[i] * 225) {
                exports.handPos[i].x = 152 + 15 + 166 + exports.whichCpuGrabbed[i] * 225;
            }
            exports.cpuSlider[exports.whichCpuGrabbed[i]].x = exports.handPos[i].x;
            main_1.cpuDifficulty[exports.whichCpuGrabbed[i]] = Math.round((exports.cpuSlider[exports.whichCpuGrabbed[i]].x - exports.whichCpuGrabbed[i] * 225 -
                152 - 15) * 3 / 166) + 1;
            main_1.player[exports.whichCpuGrabbed[i]].difficulty = main_1.cpuDifficulty[exports.whichCpuGrabbed[i]];
            if (input[i][0].a && !input[i][1].a) {
                exports.cpuGrabbed[i] = false;
                exports.occupiedCpu[exports.whichCpuGrabbed[i]] = false;
                exports.whichCpuGrabbed[i] = -1;
                exports.handType[i] = 0;
                allowRegrab = false;
            }
        }
        else {
            exports.handType[i] = 0;
            setTokenPosValue(exports.whichTokenGrabbed[i], new Vec2D_1.Vec2D(518 + (exports.whichTokenGrabbed[i] % 2) * 40 + exports.chosenChar[exports.whichTokenGrabbed[i]] * 93, 268 + (exports.whichTokenGrabbed[i] > 1 ? 40 : 0)));
            //tokenPos[i] = new Vec2D(518+(i%2)*40,268+(i>1?40:0));
            //tokenGrabbed[i] = false;
            if (exports.whichTokenGrabbed[i] > -1 && exports.tokenGrabbed[exports.whichTokenGrabbed[i]] == true) {
                exports.tokenGrabbed[exports.whichTokenGrabbed[i]] = false;
                exports.occupiedToken[exports.whichTokenGrabbed[i]] = false;
            }
            exports.whichTokenGrabbed[i] = -1;
            for (var j = 0; j < 4; j++) {
                if (exports.handPos[i].y > 430 && exports.handPos[i].y < 485 && exports.handPos[i].x > 109 + j * 225 && exports.handPos[i].x < 207 + j * 225) {
                    if (input[i][0].a && !input[i][1].a) {
                        sfx_1.sounds.menuSelect.play();
                        (0, main_1.togglePort)(j);
                        main_1.hasTag[j] = false;
                    }
                }
            }
        }
        if (exports.handPos[i].y < 160 && exports.handPos[i].x > 920) {
            if (input[i][0].a && !input[i][1].a) {
                sfx_1.sounds.menuBack.play();
                (0, main_1.changeGamemode)(1);
            }
        }
        let tok;
        if (input[i][0].x && !input[i][1].x) {
            sfx_1.sounds.menuSelect.play();
            if (exports.whichTokenGrabbed[i] != -1) {
                tok = exports.whichTokenGrabbed[i];
            }
            else {
                tok = i;
            }
            main_1.pPal[tok]++;
            if (main_1.pPal[tok] > 6) {
                main_1.pPal[tok] = 0;
            }
        }
        if (input[i][0].y && !input[i][1].y) {
            sfx_1.sounds.menuSelect.play();
            if (exports.whichTokenGrabbed[i] != -1) {
                tok = exports.whichTokenGrabbed[i];
            }
            else {
                tok = i;
            }
            main_1.pPal[tok]--;
            if (main_1.pPal[tok] < 0) {
                main_1.pPal[tok] = 6;
            }
        }
        if (exports.handPos[i].y > 100 && exports.handPos[i].y < 160 && exports.handPos[i].x > 380 && exports.handPos[i].x < 910) {
            if (input[i][0].a && !input[i][1].a) {
                sfx_1.sounds.menuSelect.play();
                (0, main_1.setVersusMode)(1 - main_1.versusMode);
            }
        }
        if (!exports.cpuGrabbed[i]) {
            for (var s = 0; s < 4; s++) {
                if (main_1.playerType[s] == 1) {
                    if (!exports.occupiedCpu[s]) {
                        if (exports.handPos[i].y >= exports.cpuSlider[s].y - 25 && exports.handPos[i].y <= exports.cpuSlider[s].y + 25 && exports.handPos[i].x >=
                            exports.cpuSlider[s].x - 25 && exports.handPos[i].x <= exports.cpuSlider[s].x + 25) {
                            if (input[i][0].a && !input[i][1].a && allowRegrab) {
                                exports.cpuGrabbed[i] = true;
                                exports.whichCpuGrabbed[i] = s;
                                exports.occupiedCpu[s] = true;
                                exports.handType[i] = 2;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (exports.handPos[i].y > 640 && exports.handPos[i].y < 680 && exports.handPos[i].x > 130 + i * 225 && exports.handPos[i].x < 310 + i * 225) {
            if (main_2.gameMode !== 2) {
                cancelSetTag();
            }
            if (input[i][0].a && !input[i][1].a) {
                // do tag
                if (exports.handPos[i].x < 154 + i * 225) {
                    // random
                    sfx_1.sounds.menuSelect.play();
                    main_1.hasTag[i] = true;
                    main_1.tagText[i] = main_1.randomTags[Math.round((main_1.randomTags.length - 1) * Math.random())];
                    (0, streamclient_1.syncTagText)(i, main_1.tagText[i]);
                }
                else if (exports.handPos[i].x > 286 + i * 225) {
                    // remove
                    sfx_1.sounds.menuSelect.play();
                    main_1.hasTag[i] = false;
                }
                else {
                    // set
                    sfx_1.sounds.menuSelect.play();
                    main_1.hasTag[i] = true;
                    exports.choosingTag = i;
                    main_1.ui.fillStyle = "rgba(0,0,0,0.8)";
                    main_1.ui.fillRect(0, 0, ((_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.UI) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0), ((_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.UI) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0));
                    (0, jquery_1.default)("#pTagEdit" + i).show().select();
                }
            }
        }
    }
    else if (exports.choosingTag == i && ((input[i][0].a && !input[i][1].a) || main_1.keys[13])) {
        cancelSetTag();
    }
    if (exports.readyToFight && exports.choosingTag == -1) {
        if (main_1.pause[i][0] && !main_1.pause[i][1]) {
            sfx_1.sounds.menuForward.play();
            (0, main_1.changeGamemode)(6);
            (0, streamclient_1.syncGameMode)(6);
        }
    }
    else if (exports.choosingTag == -1 && input[i][0].du && !input[i][1].du) {
        sfx_1.sounds.menuForward.play();
        (0, main_1.changeGamemode)(6);
        (0, streamclient_1.syncGameMode)(6);
    }
    else if (exports.choosingTag == -1 && input[i][0].dr && !input[i][1].dr) {
        exports.chosenChar[i] = 3;
        changeCharacter(i, 3);
        sfx_1.sounds.menuSelect.play();
    }
}
function drawCSSInit() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
    var bgGrad = main_1.bg1.createLinearGradient(0, 0, 1200, 700);
    bgGrad.addColorStop(0, "rgb(17, 12, 56)");
    bgGrad.addColorStop(1, "black");
    main_1.bg1.fillStyle = bgGrad;
    main_1.bg1.fillRect(0, 0, ((_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0), ((_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0));
    main_1.bg1.fillStyle = "rgb(85, 96, 107)";
    main_1.bg1.strokeStyle = "rgb(144, 152, 161)";
    main_1.bg1.save();
    main_1.bg1.lineWidth = 2;
    main_1.bg1.strokeStyle = "rgb(120, 127, 161)";
    main_1.bg1.beginPath();
    main_1.bg1.moveTo(-10, 200);
    main_1.bg1.lineTo(290, 200);
    main_1.bg1.arc(290, 225, 25, Math.PI * 1.5, Math.PI * 0.5);
    main_1.bg1.lineTo(-10, 250);
    main_1.bg1.closePath();
    main_1.bg1.stroke();
    main_1.bg1.fillStyle = "rgb(29, 144, 61)";
    main_1.bg1.beginPath();
    main_1.bg1.arc(145, 225, 20, 0, render_1.twoPi);
    main_1.bg1.closePath();
    main_1.bg1.fill();
    main_1.bg1.font = "900 31px Arial";
    main_1.bg1.fillStyle = "rgb(120, 127, 161)";
    main_1.bg1.fillText("Push     to join", 37, 235);
    main_1.bg1.fillStyle = "rgb(17, 71, 32)";
    main_1.bg1.fillText("A", 133, 235);
    main_1.bg1.restore();
    main_1.bg1.save();
    main_1.bg1.lineWidth = 3;
    main_1.bg1.translate(((_f = (_e = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _e === void 0 ? void 0 : _e.width) !== null && _f !== void 0 ? _f : 0) / 2, ((_h = (_g = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _g === void 0 ? void 0 : _g.height) !== null && _h !== void 0 ? _h : 0) / 2 + 20);
    for (var i = 0; i < 2; i++) {
        main_1.bg1.rotate(i * Math.PI);
        main_1.bg1.beginPath();
        main_1.bg1.moveTo(-10 - ((_k = (_j = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _j === void 0 ? void 0 : _j.width) !== null && _k !== void 0 ? _k : 0) / 2, -250);
        main_1.bg1.lineTo(-300, -250);
        main_1.bg1.bezierCurveTo(-240, -250, -240, -330, -180, -330);
        main_1.bg1.lineTo(10 + ((_m = (_l = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _l === void 0 ? void 0 : _l.width) !== null && _m !== void 0 ? _m : 0) / 2, -330);
        main_1.bg1.lineTo(10 + ((_p = (_o = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _o === void 0 ? void 0 : _o.width) !== null && _p !== void 0 ? _p : 0) / 2, -30 - ((_r = (_q = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _q === void 0 ? void 0 : _q.height) !== null && _r !== void 0 ? _r : 0) / 2);
        main_1.bg1.lineTo(-10 - ((_t = (_s = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _s === void 0 ? void 0 : _s.width) !== null && _t !== void 0 ? _t : 0) / 2, -30 - ((_v = (_u = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.BG1) === null || _u === void 0 ? void 0 : _u.height) !== null && _v !== void 0 ? _v : 0) / 2);
        main_1.bg1.closePath();
        main_1.bg1.fill();
        main_1.bg1.stroke();
    }
    main_1.bg1.restore();
    main_1.bg1.lineWidth = 3;
    main_1.bg1.beginPath();
    main_1.bg1.moveTo(410, 80);
    main_1.bg1.lineTo(950, 80);
    main_1.bg1.lineTo(955, 105);
    main_1.bg1.lineTo(946, 130);
    main_1.bg1.lineTo(406, 130);
    main_1.bg1.lineTo(400, 105);
    main_1.bg1.closePath();
    main_1.bg1.stroke();
    main_1.bg1.lineWidth = 5;
    main_1.bg1.beginPath();
    main_1.bg1.moveTo(412, 81);
    main_1.bg1.lineTo(422, 81);
    main_1.bg1.lineTo(412, 105);
    main_1.bg1.lineTo(418, 129);
    main_1.bg1.lineTo(408, 129);
    main_1.bg1.lineTo(402, 105);
    main_1.bg1.closePath();
    main_1.bg1.fill();
    main_1.bg1.stroke();
    main_1.bg1.beginPath();
    main_1.bg1.moveTo(938, 81);
    main_1.bg1.lineTo(948, 81);
    main_1.bg1.lineTo(953, 105);
    main_1.bg1.lineTo(944, 129);
    main_1.bg1.lineTo(934, 129);
    main_1.bg1.lineTo(943, 105);
    main_1.bg1.closePath();
    main_1.bg1.fill();
    main_1.bg1.stroke();
    main_1.bg1.lineWidth = 3;
    main_1.bg1.fillStyle = "black";
    main_1.bg1.font = "italic 900 50px Arial";
    main_1.bg1.save();
    main_1.bg1.scale(1, 1.9);
    main_1.bg1.fillText("MELEE", 50, 65);
    main_1.bg1.restore();
    main_1.bg1.beginPath();
    main_1.bg1.arc(305, 85, 30, 0, render_1.twoPi);
    main_1.bg1.closePath();
    main_1.bg1.fill();
    main_1.bg1.stroke();
    main_1.bg1.fillStyle = "rgb(144, 152, 161)";
    main_1.bg1.font = "700 32px Arial";
    main_1.bg1.fillText("VS", 284, 98);
    main_1.bg1.fillStyle = "rgb(219, 219, 219)";
    main_1.bg1.fillStyle = "rgba(0,0,0,0.65)";
    main_1.bg1.beginPath();
    main_1.bg1.moveTo(1100, 0);
    main_1.bg1.lineTo(1000, 110);
    main_1.bg1.lineTo(1020, 125);
    main_1.bg1.lineTo(1200, 125);
    main_1.bg1.lineTo(1200, 0);
    main_1.bg1.closePath();
    main_1.bg1.fill();
    main_1.bg1.fillStyle = "rgb(255, 222, 0)";
    main_1.bg1.beginPath();
    main_1.bg1.moveTo(1100, 0);
    main_1.bg1.lineTo(1000, 110);
    main_1.bg1.lineTo(1020, 125);
    main_1.bg1.lineTo(1200, 125);
    main_1.bg1.lineTo(1200, 119);
    main_1.bg1.lineTo(1015, 119);
    main_1.bg1.lineTo(1002, 110);
    main_1.bg1.lineTo(1102, 0);
    main_1.bg1.closePath();
    main_1.bg1.fill();
    main_1.bg1.font = "700 27px Arial";
    main_1.bg1.fillText("BACK", 1035, 112);
    main_1.bg1.fillStyle = "rgb(194, 24, 8)";
    main_1.bg1.beginPath();
    main_1.bg1.moveTo(1025, 75);
    main_1.bg1.lineTo(992, 110);
    main_1.bg1.lineTo(1010, 125);
    main_1.bg1.lineTo(972, 110);
    main_1.bg1.closePath();
    main_1.bg1.fill();
    var bgGrad = main_1.bg1.createLinearGradient(0, 250, 0, 350);
    bgGrad.addColorStop(0, "rgb(41, 47, 68)");
    bgGrad.addColorStop(1, "rgb(85, 95, 128)");
    main_1.bg1.lineWidth = 2;
    let o = 54;
    for (var j = 0; j < 5; j++) {
        main_1.bg1.fillStyle = bgGrad;
        main_1.bg1.beginPath();
        main_1.bg1.moveTo(457 - o + j * 95, 265);
        main_1.bg1.bezierCurveTo(457 - o + j * 95, 245, 457 - o + j * 95, 245, 477 - o + j * 95, 245);
        main_1.bg1.lineTo(522 - o + j * 95, 245);
        main_1.bg1.bezierCurveTo(542 - o + j * 95, 245, 542 - o + j * 95, 245, 542 - o + j * 95, 265);
        main_1.bg1.lineTo(542 - o + j * 95, 310);
        main_1.bg1.bezierCurveTo(542 - o + j * 95, 330, 542 - o + j * 95, 330, 522 - o + j * 95, 330);
        main_1.bg1.lineTo(477 - o + j * 95, 330);
        main_1.bg1.bezierCurveTo(457 - o + j * 95, 330, 457 - o + j * 95, 330, 457 - o + j * 95, 310);
        main_1.bg1.closePath();
        main_1.bg1.fill();
        main_1.bg1.stroke();
        switch (j) {
            case 0:
                var add = 0;
                break;
            case 1:
                var add = 7;
                break;
            case 2:
                var add = 0;
                break;
            default:
                var add = 0;
                break;
        }
        main_1.bg1.fillStyle = "black";
        main_1.bg1.beginPath();
        main_1.bg1.moveTo(540 - o + j * 95, 305 - add);
        main_1.bg1.lineTo(540 - o + j * 95, 310 - add);
        main_1.bg1.bezierCurveTo(540 - o + j * 95, 328, 540 - o + j * 95, 328, 522 - o + j * 95, 328);
        main_1.bg1.lineTo(487 - o + j * 95, 328);
        main_1.bg1.bezierCurveTo(459 - o + j * 95, 328, 459 - o + j * 95, 328, 459 - o + j * 95, 310 - add);
        main_1.bg1.lineTo(459 - o + j * 95, 305 - add);
        main_1.bg1.closePath();
        main_1.bg1.fill();
        main_1.bg1.fillStyle = "rgb(180, 180, 180)";
        main_1.bg1.font = "700 18px Arial";
        switch (j) {
            case 0:
                main_1.bg1.fillText("MARTH", 467 - o + j * 95, 323);
                main_1.bg1.drawImage(exports.marthPic, 459 - o + j * 95, 247, 81, 58);
                break;
            case 1:
                main_1.bg1.fillText("JIGGLY-", 464 - o + j * 95, 313);
                main_1.bg1.fillText("PUFF", 477 - o + j * 95, 326);
                main_1.bg1.drawImage(exports.puffPic, 459 - o + j * 95, 247, 81, 51);
                break;
            case 2:
                main_1.bg1.fillText("  F O X ", 467 - o + j * 95, 323);
                main_1.bg1.drawImage(exports.foxPic, 459 - o + j * 95, 247, 81, 58);
                break;
            case 3:
                main_1.bg1.fillText("FALCO", 470 - o + j * 95, 323);
                main_1.bg1.drawImage(exports.falcoPic, 459 - o + j * 95, 247, 81, 58);
                break;
            case 4:
                main_1.bg1.font = "700 15px Arial";
                main_1.bg1.fillText("C.FALCON", 462 - o + j * 95, 323);
                main_1.bg1.drawImage(exports.falconPic, 459 - o + j * 95, 247, 81, 58);
                main_1.bg1.font = "700 18px Arial";
                break;
            default:
                break;
        }
    }
    main_1.bg1.fillStyle = "rgb(49, 52, 56)";
    for (var i = 0; i < 4; i++) {
        main_1.bg1.fillRect(145 + i * 225, 430, 210, 280);
        main_1.bg1.strokeRect(145 + i * 225, 430, 210, 280);
    }
    main_1.bg1.fillStyle = "rgb(55, 58, 62)";
    main_1.bg1.strokeStyle = "rgb(72, 77, 85)";
    for (var i = 0; i < 4; i++) {
        main_1.bg1.fillRect(158 + i * 225, 440, 184, 260);
        main_1.bg1.strokeRect(158 + i * 225, 440, 184, 260);
    }
    main_1.bg1.fillStyle = "rgba(255,255,255,0.1)";
    for (var i = 0; i < 4; i++) {
        main_1.bg1.fillRect(158 + i * 225, 630, 184, 50);
    }
    main_1.bg1.strokeStyle = "rgba(0,0,0,0.2)";
    main_1.bg1.fillStyle = "rgba(0,0,0,0.2)";
    main_1.bg1.lineWidth = 15;
    for (var i = 0; i < 4; i++) {
        main_1.bg1.beginPath();
        main_1.bg1.moveTo(150 + i * 225, 435);
        main_1.bg1.lineTo(350 + i * 225, 705);
        main_1.bg1.closePath();
        main_1.bg1.stroke();
        main_1.bg1.beginPath();
        main_1.bg1.arc(250 + i * 225, 570, 60, 0, render_1.twoPi);
        main_1.bg1.closePath();
        main_1.bg1.stroke();
        main_1.bg1.beginPath();
        main_1.bg1.moveTo(150 + i * 225, 570);
        main_1.bg1.lineTo(350 + i * 225, 570);
        main_1.bg1.closePath();
        main_1.bg1.stroke();
    }
    main_1.bg1.lineWidth = 3;
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 7; j++) {
            main_1.bg1.beginPath();
            main_1.bg1.arc(165 + i * 225 + j * 30, 450, 11, 0, render_1.twoPi);
            main_1.bg1.closePath();
            main_1.bg1.fill();
            main_1.bg1.beginPath();
            main_1.bg1.arc(165 + i * 225 + j * 30, 690, 10, 0, render_1.twoPi);
            main_1.bg1.closePath();
            main_1.bg1.stroke();
            if (j == 3) {
                main_1.bg1.fill();
            }
        }
    }
}
function drawCSS() {
    var _a, _b, _c, _d;
    (0, main_1.clearScreen)();
    main_1.ui.fillStyle = "rgb(219, 219, 219)";
    main_1.ui.save();
    main_1.ui.scale(1.25, 1);
    if (main_1.versusMode) {
        main_1.ui.fillText("An endless KO fest!", 393, 117);
    }
    else {
        main_1.ui.fillText("4-man survival test!", 390, 117);
    }
    var bestHold = 0;
    main_1.bg1.lineWidth = 3;
    main_1.bg1.fillStyle = "rgb(255, 222, 0)";
    main_1.bg1.beginPath();
    main_1.bg1.moveTo(1100, 0);
    main_1.bg1.lineTo(1000, 110);
    main_1.bg1.lineTo(1020, 125);
    main_1.bg1.lineTo(1200, 125);
    main_1.bg1.lineTo(1200, 119);
    main_1.bg1.lineTo(1015, 119);
    main_1.bg1.lineTo(1002, 110);
    main_1.bg1.lineTo(1102, 0);
    main_1.bg1.closePath();
    main_1.bg1.fill();
    for (let ia = 0; ia < 4; ia++) {
        if (exports.bHold[ia] > bestHold) {
            bestHold = exports.bHold[ia];
        }
    }
    if (bestHold > 0) {
        var abb = 1020 + (bestHold * 6);
        main_1.bg1.fillStyle = "rgb(194, 24, 8)";
        main_1.bg1.beginPath();
        main_1.bg1.moveTo(1020, 125);
        main_1.bg1.lineTo(abb, 125);
        main_1.bg1.lineTo(abb, 119);
        main_1.bg1.lineTo(1015, 119);
        main_1.bg1.closePath();
        main_1.bg1.fill();
    }
    main_1.ui.restore();
    for (var i = 0; i < 4; i++) {
        if (main_1.playerType[i] > -1) {
            if (main_1.playerType[i] == 0 || main_1.playerType[i] == 2) {
                switch (i) {
                    case 0:
                        main_1.ui.fillStyle = "rgb(218, 51, 51)";
                        break;
                    case 1:
                        main_1.ui.fillStyle = "rgb(51, 53, 218)";
                        break;
                    case 2:
                        main_1.ui.fillStyle = "rgb(226, 218, 34)";
                        break;
                    case 3:
                        main_1.ui.fillStyle = "rgb(44, 217, 29)";
                        break;
                    default:
                        break;
                }
            }
            else {
                main_1.ui.fillStyle = "rgb(91, 91, 91)";
            }
            main_1.ui.fillRect(147 + i * 225, 432, 206, 276);
            main_1.ui.fillStyle = "rgba(0,0,0,0.5)";
            main_1.ui.beginPath();
            main_1.ui.moveTo(152 + i * 225, 465);
            main_1.ui.lineTo(210 + i * 225, 465);
            main_1.ui.lineTo(230 + i * 225, 450);
            main_1.ui.lineTo(318 + i * 225, 450);
            main_1.ui.bezierCurveTo(338 + i * 225, 450, 338 + i * 225, 450, 338 + i * 225, 470);
            main_1.ui.lineTo(338 + i * 225, 708);
            main_1.ui.lineTo(152 + i * 225, 708);
            main_1.ui.closePath();
            main_1.ui.fill();
            main_1.ui.save();
            main_1.ui.fillStyle = "rgba(0, 0, 0, 0.3)";
            main_1.ui.translate(250 + i * 225, 615);
            main_1.ui.scale(1, 0.3);
            main_1.ui.beginPath();
            main_1.ui.arc(0, 0, 50, 0, render_1.twoPi);
            main_1.ui.closePath();
            main_1.ui.fill();
            main_1.ui.restore();
            main_1.ui.fillStyle = "black";
            main_1.ui.strokeStyle = "rgb(102, 102, 102)";
            main_1.ui.fillRect(152 + i * 225, 640, 196, 60);
            main_1.ui.strokeRect(152 + i * 225, 640, 196, 60);
            main_1.ui.save();
            main_1.ui.fillStyle = "rgb(84, 84, 84)";
            main_1.ui.font = "italic 900 45px Arial";
            main_1.ui.scale(14 / 8, 1);
            var text = "P" + (i + 1);
            if (main_1.playerType[i] == 1) {
                text = "CP";
            }
            main_1.ui.fillText(text, 87 + i * 225 / (14 / 8), 690);
            main_1.ui.restore();
            main_1.ui.textAlign = "start";
        }
    }
    main_1.ui.fillStyle = "rgb(82, 81, 81)";
    for (var i = 0; i < 4; i++) {
        main_1.ui.fillStyle = "rgb(82, 81, 81)";
        switch (main_1.playerType[i]) {
            case 0:
                main_1.ui.fillStyle = "rgb(201, 178, 20)";
                break;
            case 1:
                main_1.ui.fillStyle = "rgb(161, 161, 161)";
                break;
            default:
                main_1.ui.fillStyle = "rgb(82, 81, 81)";
                break;
        }
        main_1.ui.beginPath();
        main_1.ui.moveTo(139 + i * 225, 420);
        main_1.ui.lineTo(220 + i * 225, 420);
        main_1.ui.lineTo(237 + i * 225, 432);
        main_1.ui.lineTo(215 + i * 225, 455);
        main_1.ui.lineTo(142 + i * 225, 455);
        main_1.ui.lineTo(139 + i * 225, 452);
        main_1.ui.closePath();
        main_1.ui.fill();
    }
    main_1.ui.fillStyle = "rgba(0, 0, 0,0.7)";
    main_1.ui.strokeStyle = "rgba(0, 0, 0,0.7)";
    main_1.ui.lineWidth = 4;
    for (var i = 0; i < 4; i++) {
        main_1.ui.beginPath();
        main_1.ui.moveTo(160 + i * 225, 424);
        main_1.ui.lineTo(215 + i * 225, 424);
        main_1.ui.lineTo(228 + i * 225, 432);
        main_1.ui.lineTo(210 + i * 225, 451);
        main_1.ui.lineTo(160 + i * 225, 451);
        main_1.ui.closePath();
        main_1.ui.fill();
        main_1.ui.beginPath();
        main_1.ui.moveTo(139 + i * 225, 420);
        main_1.ui.lineTo(151 + i * 225, 424);
        main_1.ui.lineTo(151 + i * 225, 451);
        main_1.ui.lineTo(140 + i * 225, 451);
        main_1.ui.stroke();
    }
    main_1.ui.fillStyle = "rgb(82, 81, 81)";
    main_1.ui.font = "700 22px Arial";
    for (var i = 0; i < 4; i++) {
        main_1.ui.fillStyle = "rgb(82, 81, 81)";
        var text = "N/A";
        switch (main_1.playerType[i]) {
            case 0:
                text = "HMN";
                main_1.ui.fillStyle = "rgb(201, 178, 20)";
                break;
            case 1:
                text = "CPU";
                main_1.ui.fillStyle = "rgb(161, 161, 161)";
                break;
            case 2:
                text = "NET";
                main_1.ui.fillStyle = "rgb(66, 241, 244)";
                break;
            default:
                break;
        }
        main_1.ui.fillText(text, 163 + i * 225, 445);
    }
    for (var i = 0; i < 4; i++) {
        if (main_1.playerType[i] > -1) {
            var frame = Math.floor(main_1.player[i].timer);
            if (frame == 0) {
                frame = 1;
            }
            var face = main_1.player[i].phys.face;
            var model = animations_1.animations[main_1.characterSelections[i]][actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].name][frame - 1];
            switch (main_1.player[i].actionState) {
                case 15:
                case 17:
                case 20:
                case 25:
                case 61:
                case 72:
                case 94:
                    var model = animations_1.animations[main_1.characterSelections[i]][actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].name][0];
                    break;
                default:
                    break;
            }
            if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].reverseModel) {
                face *= -1;
            }
            else if (main_1.player[i].actionState == 4) {
                if (frame > 5) {
                    face *= -1;
                }
            }
            else if (main_1.player[i].actionState == 6) {
                if (frame > 18) {
                    face *= -1;
                }
            }
            else if (main_1.player[i].actionState == 34) {
                if (frame > 29) {
                    face *= -1;
                }
            }
            var col = main_1.palettes[main_1.pPal[i]][0];
            if (exports.tokenGrabbed[i]) {
                main_1.ui.globalAlpha = 0.6;
            }
            else {
                main_1.ui.globalAlpha = 1;
            }
            (0, render_1.drawArrayPathCompress)(main_1.ui, col, face, (main_1.player[i].phys.pos.x * 4.5 * 1.5) + 600, (main_1.player[i].phys.pos.y * -4.5) +
                480, model, main_1.player[i].charAttributes.charScale * 1.5, main_1.player[i].charAttributes.charScale * 1.5, 0, 0, 0);
            if (main_1.player[i].phys.shielding) {
                var sCol = main_1.palettes[main_1.pPal[i]][2];
                main_1.ui.fillStyle = sCol + (0.6 * main_1.player[i].phys.shieldAnalog) + ")";
                main_1.ui.beginPath();
                main_1.ui.arc((main_1.player[i].phys.shieldPositionReal.x * 4.5 * 1.5) + 600, (main_1.player[i].phys.shieldPositionReal.y * -4.5) +
                    460, main_1.player[i].phys.shieldSize * 4.5 * 1.5, render_1.twoPi, 0);
                main_1.ui.fill();
            }
            main_1.ui.globalAlpha = 1;
            if (main_1.playerType[i] == 1) {
                main_1.ui.fillStyle = "rgba(0,0,0,0.5)";
                main_1.ui.strokeStyle = "rgb(102, 102, 102)";
                main_1.ui.fillRect(152 + i * 225, 555, 196, 85);
                main_1.ui.strokeRect(152 + i * 225, 555, 196, 85);
                main_1.ui.fillStyle = "rgb(177, 177, 177)";
                main_1.ui.save();
                main_1.ui.font = "900 18px Arial";
                main_1.ui.scale(1.2, 1);
                main_1.ui.fillText("CPU Level", (152 + 10 + i * 225) / 1.2, 575);
                main_1.ui.restore();
                var sliderGrad = main_1.ui.createLinearGradient(152 + 10 + i * 225, 0, 152 + 196 - 20 + i * 225, 0);
                sliderGrad.addColorStop(0, "rgb(0, 47, 168)");
                sliderGrad.addColorStop(0.5, "rgb(168, 162, 0)");
                sliderGrad.addColorStop(1, "rgb(168, 0, 0)");
                main_1.ui.fillStyle = sliderGrad;
                main_1.ui.fillRect(152 + 15 + i * 225, 592, 166, 5);
                main_1.ui.fillStyle = "black";
                main_1.ui.fillRect(152 + 18 + i * 225, 594, 160, 1);
                main_1.ui.fillStyle = "rgb(214, 35, 35)";
                main_1.ui.beginPath();
                main_1.ui.arc(exports.cpuSlider[i].x, exports.cpuSlider[i].y, 17, 0, render_1.twoPi);
                main_1.ui.closePath();
                main_1.ui.fill();
                main_1.ui.save();
                main_1.ui.fillStyle = "black";
                main_1.ui.strokeStyle = "white";
                main_1.ui.lineWidth = 2;
                main_1.ui.font = "900 30px Arial";
                main_1.ui.textAlign = "center";
                main_1.ui.strokeText(main_1.player[i].difficulty, exports.cpuSlider[i].x, exports.cpuSlider[i].y + 11);
                main_1.ui.fillText(main_1.player[i].difficulty, exports.cpuSlider[i].x, exports.cpuSlider[i].y + 11);
                main_1.ui.restore();
            }
            main_1.ui.fillStyle = "black";
            main_1.ui.strokeStyle = "rgb(102, 102, 102)";
            main_1.ui.fillRect(160 + i * 225, 620, 180, 40);
            main_1.ui.strokeRect(160 + i * 225, 620, 180, 40);
            main_1.ui.font = "900 24px Arial";
            if (main_1.playerType[i] == 0) {
                main_1.ui.fillStyle = "rgb(42, 42, 42)";
                main_1.ui.fillRect(162 + i * 225, 622, 22, 37);
                main_1.ui.fillRect(316 + i * 225, 622, 22, 37);
                main_1.ui.fillStyle = "rgb(83, 83, 83)";
                main_1.ui.fillText("?", 166 + i * 225, 648);
                main_1.ui.fillText("x", 319 + i * 225, 647);
            }
            main_1.ui.font = "500 28px Arial";
            main_1.ui.fillStyle = "white";
            switch (exports.chosenChar[i]) {
                case 0:
                    var text = "Marth";
                    break;
                case 1:
                    var text = "Jigglypuff";
                    break;
                case 2:
                    var text = "Fox";
                    break;
                case 3:
                    var text = "Falco";
                    break;
                case 4:
                    var text = "C.Falcon";
                    break;
                default:
                    var text = "Unknown";
                    break;
            }
            if (main_1.hasTag[i]) {
                var text = main_1.tagText[i];
            }
            main_1.ui.textAlign = "center";
            main_1.ui.fillText(text, 250 + i * 225, 650);
            main_1.ui.textAlign = "start";
        }
    }
    main_1.ui.font = "900 31px Arial";
    main_1.ui.lineWidth = 2;
    let alreadyDrawn = [false, false, false, false];
    for (let i = 3; i >= 0; i--) {
        if (main_1.playerType[i] > -1) {
            if (exports.tokenGrabbed[i] === false) {
                alreadyDrawn[i] = true;
            }
            var bgGrad = main_1.ui.createLinearGradient(exports.tokenPos[i].x - 100, exports.tokenPos[i].y, exports.tokenPos[i].x + 50, exports.tokenPos[i].y);
            bgGrad.addColorStop(0, "rgb(255, 255, 255)");
            var text = "";
            switch (main_1.playerType[i]) {
                case 0:
                    text = "P" + (i + 1);
                    switch (i) {
                        case 0:
                            bgGrad.addColorStop(1, "rgb(233, 57, 57)");
                            break;
                        case 1:
                            bgGrad.addColorStop(1, "rgb(62, 130, 233)");
                            break;
                        case 2:
                            bgGrad.addColorStop(1, "rgb(255, 253, 47)");
                            break;
                        case 3:
                            bgGrad.addColorStop(1, "rgb(36, 242, 45)");
                            break;
                        default:
                            break;
                    }
                    break;
                case 1:
                    text = "CP";
                    bgGrad.addColorStop(1, "rgb(135, 135, 135)");
                default:
                    break;
            }
            main_1.ui.fillStyle = "rgba(0,0,0,0.4)";
            main_1.ui.beginPath();
            main_1.ui.arc(exports.tokenPos[i].x, exports.tokenPos[i].y, 34, 0, render_1.twoPi);
            main_1.ui.closePath();
            main_1.ui.fill();
            main_1.ui.fillStyle = bgGrad;
            main_1.ui.beginPath();
            main_1.ui.arc(exports.tokenPos[i].x, exports.tokenPos[i].y, 30, 0, render_1.twoPi);
            main_1.ui.closePath();
            main_1.ui.fill();
            main_1.ui.fillStyle = "rgba(0,0,0,0.4)";
            main_1.ui.beginPath();
            main_1.ui.moveTo(exports.tokenPos[i].x, exports.tokenPos[i].y); //changed from ui.beginPath(tokenPos[i].y);
            //ui.moveTo(tokenPos[i].x,tokenPos[i].y+4);
            main_1.ui.arc(exports.tokenPos[i].x, exports.tokenPos[i].y, 26, 1.2 * Math.PI, 0.4 * Math.PI);
            main_1.ui.arc(exports.tokenPos[i].x - 3, exports.tokenPos[i].y, 23, 0.5 * Math.PI, 1.2 * Math.PI, true);
            main_1.ui.closePath();
            main_1.ui.fill();
            main_1.ui.strokeStyle = "rgb(57, 57, 57)";
            main_1.ui.fillStyle = "rgb(207, 207, 207)";
            main_1.ui.fillText(text, exports.tokenPos[i].x - 22, exports.tokenPos[i].y + 13);
            main_1.ui.strokeText(text, exports.tokenPos[i].x - 22, exports.tokenPos[i].y + 13);
        }
    }
    for (let i = 3; i >= 0; i--) {
        if (alreadyDrawn[i] === false) {
            if (main_1.playerType[i] > -1) {
                var bgGrad = main_1.ui.createLinearGradient(exports.tokenPos[i].x - 100, exports.tokenPos[i].y, exports.tokenPos[i].x + 50, exports.tokenPos[i].y);
                bgGrad.addColorStop(0, "rgb(255, 255, 255)");
                var text = "";
                switch (main_1.playerType[i]) {
                    case 0:
                        text = "P" + (i + 1);
                        switch (i) {
                            case 0:
                                bgGrad.addColorStop(1, "rgb(233, 57, 57)");
                                break;
                            case 1:
                                bgGrad.addColorStop(1, "rgb(62, 130, 233)");
                                break;
                            case 2:
                                bgGrad.addColorStop(1, "rgb(255, 253, 47)");
                                break;
                            case 3:
                                bgGrad.addColorStop(1, "rgb(36, 242, 45)");
                                break;
                            default:
                                break;
                        }
                        break;
                    case 1:
                        text = "CP";
                        bgGrad.addColorStop(1, "rgb(135, 135, 135)");
                    default:
                        break;
                }
                main_1.ui.fillStyle = "rgba(0,0,0,0.4)";
                main_1.ui.beginPath();
                main_1.ui.arc(exports.tokenPos[i].x, exports.tokenPos[i].y, 34, 0, render_1.twoPi);
                main_1.ui.closePath();
                main_1.ui.fill();
                main_1.ui.fillStyle = bgGrad;
                main_1.ui.beginPath();
                main_1.ui.arc(exports.tokenPos[i].x, exports.tokenPos[i].y, 30, 0, render_1.twoPi);
                main_1.ui.closePath();
                main_1.ui.fill();
                main_1.ui.fillStyle = "rgba(0,0,0,0.4)";
                main_1.ui.beginPath();
                main_1.ui.moveTo(exports.tokenPos[i].x, exports.tokenPos[i].y); //changed from ui.beginPath(tokenPos[i].y);
                //ui.moveTo(tokenPos[i].x,tokenPos[i].y+4);
                main_1.ui.arc(exports.tokenPos[i].x, exports.tokenPos[i].y, 26, 1.2 * Math.PI, 0.4 * Math.PI);
                main_1.ui.arc(exports.tokenPos[i].x - 3, exports.tokenPos[i].y, 23, 0.5 * Math.PI, 1.2 * Math.PI, true);
                main_1.ui.closePath();
                main_1.ui.fill();
                main_1.ui.strokeStyle = "rgb(57, 57, 57)";
                main_1.ui.fillStyle = "rgb(207, 207, 207)";
                main_1.ui.fillText(text, exports.tokenPos[i].x - 22, exports.tokenPos[i].y + 13);
                main_1.ui.strokeText(text, exports.tokenPos[i].x - 22, exports.tokenPos[i].y + 13);
            }
        }
    }
    // 72 95
    for (var i = 0; i < main_1.ports; i++) {
        switch (exports.handType[i]) {
            case 0:
                main_1.ui.drawImage(exports.handPoint, exports.handPos[i].x - 40, exports.handPos[i].y - 30, 101, 133);
                break;
            case 1:
                main_1.ui.drawImage(exports.handOpen, exports.handPos[i].x - 40, exports.handPos[i].y - 30, 101, 133);
                break;
            case 2:
                main_1.ui.drawImage(exports.handGrab, exports.handPos[i].x - 40, exports.handPos[i].y - 30, 101, 133);
                break;
            default:
                break;
        }
        switch (i) {
            case 0:
                main_1.ui.fillStyle = "rgb(233, 57, 57)";
                break;
            case 1:
                main_1.ui.fillStyle = "rgb(62, 130, 233)";
                break;
            case 2:
                main_1.ui.fillStyle = "rgb(255, 253, 47)";
                break;
            case 3:
                main_1.ui.fillStyle = "rgb(36, 242, 45)";
                break;
            default:
                break;
        }
        main_1.ui.fillText("P" + (i + 1), exports.handPos[i].x - 15, exports.handPos[i].y + 60);
        main_1.ui.strokeText("P" + (i + 1), exports.handPos[i].x - 15, exports.handPos[i].y + 60);
    }
    var readyPlayers = 0;
    for (var k = 0; k < 4; k++) {
        if (main_1.playerType[k] > -1) {
            readyPlayers++;
            if (readyPlayers >= 2) {
                exports.readyToFight = true;
            }
            else {
                exports.readyToFight = false;
            }
            if (exports.occupiedToken[k]) {
                exports.readyToFight = false;
                break;
            }
        }
    }
    if (streamclient_1.inServerMode) {
        main_1.ui.fillStyle = "white";
        var keys = Object.keys(settings_1.gameSettings);
        let spacer = 50;
        for (var j = 0; j < keys.length; j++) {
            if (gameSettingsText[keys[j]] !== "") {
                main_1.ui.fillText(gameSettingsText[keys[j]] + ":" + gameSettingsValueTranslation[keys[j]](settings_1.gameSettings[keys[j]]), 820, 130 + spacer);
                spacer = spacer + 30;
            }
        }
    }
    if (exports.readyToFight) {
        main_1.ui.save();
        main_1.ui.fillStyle = "rgba(223, 31, 31, 0.8)";
        main_1.ui.beginPath();
        main_1.ui.moveTo(50, 300);
        main_1.ui.bezierCurveTo(450, 270, 750, 270, 1150, 300);
        main_1.ui.bezierCurveTo(750, 280, 450, 280, 50, 300);
        main_1.ui.closePath();
        main_1.ui.fill();
        main_1.ui.beginPath();
        main_1.ui.moveTo(50, 370);
        main_1.ui.bezierCurveTo(450, 350, 750, 350, 1150, 370);
        //ui.bezierCurveTo(750,360,450,360,50,370);
        main_1.ui.bezierCurveTo(750, 360, 900, 365, 900, 365);
        main_1.ui.bezierCurveTo(850, 365, 830, 380, 800, 380);
        main_1.ui.lineTo(400, 380);
        main_1.ui.bezierCurveTo(370, 380, 350, 365, 300, 365);
        main_1.ui.bezierCurveTo(300, 360, 450, 370, 0, 370);
        main_1.ui.closePath();
        main_1.ui.fill();
        main_1.ui.fillStyle = "rgba(0,0,0,0.5)";
        main_1.ui.beginPath();
        main_1.ui.moveTo(50, 300);
        main_1.ui.bezierCurveTo(450, 280, 750, 280, 1150, 300);
        main_1.ui.arc(1150, 335, 35, Math.PI * 1.5, Math.PI * 0.5, true);
        //ui.lineTo(1150,370);
        main_1.ui.bezierCurveTo(750, 350, 450, 350, 50, 370);
        main_1.ui.arc(50, 335, 35, Math.PI * 0.5, Math.PI * 1.5, true);
        main_1.ui.closePath();
        main_1.ui.fill();
        main_1.ui.scale(1.4, 1);
        exports.rtfFlash += 0.5 * exports.rtfFlashD;
        if (exports.rtfFlash < 25) {
            exports.rtfFlashD = 1;
        }
        if (exports.rtfFlash > 50) {
            exports.rtfFlashD = -1;
        }
        main_1.ui.fillStyle = "hsl(52, 85%, " + exports.rtfFlash + "%)";
        main_1.ui.font = "italic 600 65px Arial";
        main_1.ui.rotate(-0.03);
        main_1.ui.fillText("READY", 120, 353);
        main_1.ui.rotate(0.03);
        main_1.ui.fillText("TO", 390, 342);
        main_1.ui.rotate(0.03);
        main_1.ui.fillText("FIGHT", 520, 329);
        main_1.ui.rotate(-0.03);
        main_1.ui.fillStyle = "rgb(193, 193, 193)";
        main_1.ui.font = "900 15px Arial";
        main_1.ui.scale(2.3 / 1.4, 1);
        main_1.ui.fillText("PRESS START", 205, 373);
        main_1.ui.restore();
    }
    if (exports.choosingTag > -1) {
        main_1.ui.fillStyle = "rgba(0,0,0,0.8)";
        main_1.ui.fillRect(0, 0, ((_b = (_a = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.UI) === null || _a === void 0 ? void 0 : _a.width) !== null && _b !== void 0 ? _b : 0), ((_d = (_c = main_1.layers === null || main_1.layers === void 0 ? void 0 : main_1.layers.UI) === null || _c === void 0 ? void 0 : _c.height) !== null && _d !== void 0 ? _d : 0));
        main_1.ui.fillStyle = "white";
        main_1.ui.textAlign = "center";
        //ui.fillText(text,250+i*225,650);
        main_1.ui.fillText("Type tag now", 250 + exports.choosingTag * 225, 570);
        main_1.ui.fillText("Press A to finish", 250 + exports.choosingTag * 225, 600);
        main_1.ui.textAlign = "start";
    }
}
