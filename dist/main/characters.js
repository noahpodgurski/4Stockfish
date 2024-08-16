"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ecb = exports.charObject = exports.actionSounds = exports.framesData = exports.intangibility = exports.charAttributes = exports.offsets = exports.hitboxes = exports.chars = exports.CHARIDS = void 0;
exports.setChars = setChars;
exports.setHitBoxes = setHitBoxes;
exports.setOffsets = setOffsets;
exports.setCharAttributes = setCharAttributes;
exports.setIntangibility = setIntangibility;
exports.setFrames = setFrames;
exports.setActionSounds = setActionSounds;
exports.getEcB = getEcB;
exports.setEcbData = setEcbData;
/* eslint-disable */
exports.CHARIDS = {
    MARTH_ID: 0,
    PUFF_ID: 1,
    FOX_ID: 2,
    FALCO_ID: 3,
    FALCON_ID: 4
};
exports.chars = [];
function setChars(index, val) {
    exports.chars[index] = val;
}
exports.hitboxes = [];
function setHitBoxes(index, val) {
    exports.hitboxes[index] = val;
}
exports.offsets = [];
function setOffsets(charId, val) {
    exports.offsets[charId] = val;
}
exports.charAttributes = [];
function setCharAttributes(charId, val) {
    exports.charAttributes[charId] = val;
}
exports.intangibility = [];
function setIntangibility(charId, val) {
    exports.intangibility[charId] = val;
}
exports.framesData = [];
function setFrames(charId, val) {
    exports.framesData[charId] = val;
}
exports.actionSounds = [];
function setActionSounds(charId, val) {
    exports.actionSounds[charId] = val;
}
class charObject {
    constructor(num) {
        this.attributes = exports.charAttributes[num];
        this.animations = 0;
        this.hitboxes = exports.hitboxes[num];
    }
}
exports.charObject = charObject;
exports.ecb = [];
function getEcB(index) {
    return exports.ecb[index];
}
function setEcbData(index, val) {
    exports.ecb[index] = val;
}
