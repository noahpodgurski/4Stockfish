"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playingReplay = exports.replaysOn = exports.gameTickDelay = exports.replayActive = void 0;
exports.updateGameTickDelay = updateGameTickDelay;
exports.saveGameState = saveGameState;
exports.loadReplay = loadReplay;
exports.retrieveReplayInputs = retrieveReplayInputs;
exports.isObject = isObject;
exports.default = mergeDeep;
const main_1 = require("./main");
const deepCopyObject_1 = require("./util/deepCopyObject");
const pako_1 = __importDefault(require("pako"));
const jquery_1 = __importDefault(require("jquery"));
const localforage_1 = __importDefault(require("localforage"));
const input_1 = require("../input/input");
const fullGameState = {
    inputs: [],
    playerData: []
};
let frameCount = 0;
let snapShot = [];
exports.replayActive = false;
const result = [];
let playingFrame = 0;
const replayInputs = [];
const replayPlayerData = [];
const replayFrameData = [];
let lastFrametime = performance.now();
exports.gameTickDelay = 0;
exports.replaysOn = localStorage.getItem('replayson') === "true" || false;
console.log(`replayson: ${exports.replaysOn}`);
exports.playingReplay = false;
(0, jquery_1.default)("#replayson").on("click", () => {
    exports.replaysOn = !exports.replaysOn;
    localStorage.setItem('replayson', String(exports.replaysOn));
    (0, jquery_1.default)("#replayson").attr('checked', String(exports.replaysOn));
});
(0, jquery_1.default)("#replayson").attr('checked', String(exports.replaysOn));
function updateGameTickDelay(val) {
    exports.gameTickDelay = val;
}
const prevFramePlayer = [];
function compressObject(obj) {
    return pako_1.default.deflate(JSON.stringify(obj));
}
function decompressObject(obj) {
    return JSON.parse(pako_1.default.inflate(obj, { to: "string" }));
}
function saveGameState(input) {
    if (!exports.playingReplay) {
        if (main_1.playing && exports.replaysOn && !main_1.starting && !main_1.pause[0][0]) {
            const now = performance.now();
            const frameDelay = now - lastFrametime;
            lastFrametime = now;
            for (let i = 0; i < main_1.playerType.length; i++) {
                if (main_1.playerType[i] === 1) {
                    fullGameState.inputs[i] = (0, deepCopyObject_1.deepObjectMerge)(true, {}, input_1.aiInputBank[i][0]);
                }
                else if (main_1.playerType[i] === 0) {
                    fullGameState.inputs[i] = (0, deepCopyObject_1.deepObjectMerge)(true, {}, input[i][0]);
                }
                else if (main_1.playerType[i] === 2) {
                    fullGameState.inputs[i] = (0, deepCopyObject_1.deepObjectMerge)(true, {}, input[i][0]);
                }
                // const exclusions = ["charAttributes",
                //   "charHitboxes",
                //   "prevFrameHitboxes"];
                fullGameState.playerData[i] = main_1.player[i].phys.pos;
                // prevFramePlayer[i] = deepObjectMerge(true, prevFramePlayer[i], player[i], exclusions);
            }
            // fullGameState.frameDelay = frameDelay;
            snapShot.push(compressObject({ frameCount, fullGameState }));
            frameCount++;
        }
        if (!main_1.playing && (frameCount > 0) && exports.replaysOn && main_1.gameEnd) {
            frameCount = 0;
            const headerFrame = {};
            const replayname = 'replay-' + new Date() + '.json';
            const wholeReplay = [];
            wholeReplay.push(compressObject(main_1.stageSelect));
            wholeReplay.push(compressObject(main_1.playerType));
            wholeReplay.push(compressObject(main_1.characterSelections));
            wholeReplay.push(snapShot);
            localforage_1.default.setItem(replayname, wholeReplay).then((value) => {
                let resultAsUint8Array;
                localforage_1.default.getItem(replayname).then((value) => {
                    // This code runs once the value has been loaded
                    // from the offline store.
                    saveData(value, replayname);
                    snapShot = [];
                }).catch((err) => {
                    // This code runs if there were any errors
                    console.log(err);
                });
            }).catch((err) => {
                // This code runs if there were any errors
                console.log(err);
            });
        }
    }
}
const saveData = (function () {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    return function (data, fileName) {
        const blob = new Blob([compressObject(data)], { type: "octet/stream" });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
function loadReplay(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        if (event.target === null) {
            throw Error("event target is null");
        }
        const decompressed = decompressObject(event.target.result);
        exports.replayActive = true;
        (0, main_1.setStageSelect)(decompressObject(decompressed[0]));
        const deplayerTypes = decompressObject(decompressed[1]);
        //ASSUMING PLAYER 1 IS ALWAYS POPULATED
        for (let j = 1; j < deplayerTypes.length; j++) {
            if (deplayerTypes[j] !== -1) {
                if (main_1.ports < (j + 1)) {
                    (0, main_1.addPlayer)(j, 0);
                }
            }
        }
        const decharacterSelections = decompressObject(decompressed[2]);
        for (let j = 0; j < decharacterSelections.length; j++) {
            (0, main_1.setCS)(j, decharacterSelections[j]);
        }
        const replayInputPackage = decompressed[3];
        for (let n = 0; n < replayInputPackage.length; n++) {
            const stateData = decompressObject(replayInputPackage[n]);
            replayInputs.push(stateData.fullGameState.inputs);
            replayPlayerData.push(stateData.fullGameState.playerData);
            // replayFrameData.push(stateData.fullGameState.frameDelay);
        }
        exports.playingReplay = true;
        (0, main_1.startGame)();
    };
    reader.readAsBinaryString(file);
}
function retrieveReplayInputs(playerSlot, controllerIndex) {
    if (replayInputs[playingFrame] === undefined) {
        exports.playingReplay = false;
        exports.replayActive = false;
        (0, main_1.finishGame)();
        return (0, input_1.nullInput)();
    }
    const returnInput = replayInputs[playingFrame][playerSlot];
    main_1.player[playerSlot].phys.pos = replayPlayerData[playingFrame][playerSlot];
    if (playerSlot === (main_1.ports - 1)) {
        playingFrame++;
    }
    // gameTickDelay = replayFrameData[playingFrame];
    return returnInput;
}
const isEmptyObject = function (obj) {
    let name;
    for (name in obj) {
        return false;
    }
    return true;
};
const diff = function (obj1, obj2, exclusions) {
    const result = {};
    let change;
    for (const key in obj1) {
        if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object' && exclusions.indexOf(key) === -1) {
            change = diff(obj1[key], obj2[key], exclusions);
            if (isEmptyObject(change) === false) {
                result[key] = change;
            }
        }
        else if (obj2[key] !== obj1[key]) {
            result[key] = obj2[key];
        }
    }
    return result;
};
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}
function mergeDeep(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            }
            else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
