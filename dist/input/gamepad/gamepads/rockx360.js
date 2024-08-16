"use strict";
// @flow
/*eslint indent:0*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.rockx360 = void 0;
const defaults_1 = require("../defaults");
exports.rockx360 = { a: { kind: "pressed", index: 0 },
    b: { kind: "pressed", index: 1 },
    x: { kind: "pressed", index: 2 },
    y: { kind: "pressed", index: 3 },
    z: { kind: "pressed", index: 5 },
    r: null,
    l: null,
    s: { kind: "pressed", index: 7 },
    lA: { kind: "value", index: 2, min: 0, max: 1 },
    rA: { kind: "value", index: 5, min: 0, max: 1 },
    dpad: { kind: "2axes", xIndex: 6, yIndex: 7, xFlip: false, yFlip: true },
    ls: { kind: "axes", xIndex: 0, yIndex: 1, cardinals: defaults_1.defaultCardinals },
    cs: { kind: "axes", xIndex: 3, yIndex: 4, cardinals: defaults_1.defaultCardinals },
    isGC: false,
    ids: [{ name: "Rock Candy Xbox 360 controller", id: "Performance Designed Products Rock Candy Gamepad", vendor: "0e6f", product: "011f" }]
};
