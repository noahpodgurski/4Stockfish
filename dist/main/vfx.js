"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dVfx = exports.vfx = exports.showVfx = void 0;
exports.isShowSFX = isShowSFX;
exports.toggleShowSFX = toggleShowSFX;
const vfxData_1 = __importDefault(require("main/vfx/vfxData"));
const dVfx_1 = __importDefault(require("main/vfx/dVfx"));
const twoPi = Math.PI * 2;
exports.showVfx = true;
function isShowSFX() {
    return exports.showVfx;
}
function toggleShowSFX() {
    exports.showVfx = !exports.showVfx;
}
exports.vfx = Object.assign({}, vfxData_1.default);
exports.vfx.wallBounce.path = exports.vfx.groundBounce.path;
exports.vfx.wallBounce.colour = exports.vfx.groundBounce.colour;
exports.vfx.wallBounce.frames = exports.vfx.groundBounce.frames;
exports.vfx.ceilingBounce.path = exports.vfx.groundBounce.path;
exports.vfx.ceilingBounce.colour = exports.vfx.groundBounce.colour;
exports.vfx.ceilingBounce.frames = exports.vfx.groundBounce.frames;
exports.dVfx = Object.assign({}, dVfx_1.default);
