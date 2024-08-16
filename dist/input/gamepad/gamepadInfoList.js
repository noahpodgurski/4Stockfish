"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamepadInfoList = void 0;
/*eslint indent:0*/
/*eslint camelcase:0*/
const mayflash_js_1 = require("./gamepads/mayflash.js");
const vjoy_js_1 = require("./gamepads/vjoy.js");
const raphnet_js_1 = require("./gamepads/raphnet.js");
const xbox_js_1 = require("./gamepads/xbox.js");
const tigergame_js_1 = require("./gamepads/tigergame.js");
const retrolink_js_1 = require("./gamepads/retrolink.js");
const brook_js_1 = require("./gamepads/brook.js");
const ps4_js_1 = require("./gamepads/ps4.js");
const rockx360_js_1 = require("./gamepads/rockx360.js");
const wiiU_js_1 = require("./gamepads/wiiU.js");
const betop_js_1 = require("./gamepads/betop.js");
const dualAction_js_1 = require("./gamepads/dualAction.js");
exports.gamepadInfoList = [mayflash_js_1.mayflash, vjoy_js_1.vjoy, raphnet_js_1.raphnetV2_9, raphnet_js_1.raphnetV3_2, xbox_js_1.xbox, tigergame_js_1.tigergame1, tigergame_js_1.tigergame2,
    retrolink_js_1.retrolink, brook_js_1.brook, ps4_js_1.ps4, rockx360_js_1.rockx360, wiiU_js_1.wiiU, betop_js_1.betop, dualAction_js_1.dualAction
];
