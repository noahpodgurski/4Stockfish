"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const battlefield_1 = __importDefault(require("./battlefield"));
const dreamland_1 = __importDefault(require("./dreamland"));
const pstadium_1 = __importDefault(require("./pstadium"));
const ystory_1 = __importDefault(require("./ystory"));
const fdest_1 = __importDefault(require("./fdest"));
const fountain_1 = __importDefault(require("./fountain"));
exports.default = {
    battlefield: battlefield_1.default,
    dreamland: dreamland_1.default,
    pstadium: pstadium_1.default,
    ystory: ystory_1.default,
    fdest: fdest_1.default,
    fountain: fountain_1.default
};
