"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamecubeCardinals = exports.invertedYCardinals = exports.defaultCardinals = void 0;
const Vec2D_1 = require("../../main/util/Vec2D");
exports.defaultCardinals = { center: new Vec2D_1.Vec2D(0, 0), left: -1, right: 1, down: 1, up: -1 };
exports.invertedYCardinals = { center: new Vec2D_1.Vec2D(0, 0), left: -1, right: 1, down: -1, up: 1 };
exports.gamecubeCardinals = { center: new Vec2D_1.Vec2D(0, 0), left: -0.75, right: 0.75, down: 0.75, up: -0.75 };
