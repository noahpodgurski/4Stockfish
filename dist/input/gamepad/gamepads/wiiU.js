"use strict";
// @flow
/*eslint indent:0*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.wiiU = void 0;
const defaults_1 = require("../defaults");
exports.wiiU = { a: { kind: "pressed", index: 0 },
    b: { kind: "pressed", index: 3 },
    x: { kind: "pressed", index: 1 },
    y: { kind: "pressed", index: 2 },
    z: { kind: "pressed", index: 6 },
    r: { kind: "pressed", index: 5 },
    l: { kind: "pressed", index: 4 },
    s: { kind: "pressed", index: 7 },
    lA: { kind: "axis", index: 2, min: -0.867, max: 0.867 },
    rA: { kind: "axis", index: 5, min: -0.867, max: 0.867 },
    dpad: { kind: "buttons", upIndex: 8, downIndex: 9, leftIndex: 10, rightIndex: 11 },
    ls: { kind: "axes", xIndex: 0, yIndex: 1, cardinals: defaults_1.gamecubeCardinals },
    cs: { kind: "axes", xIndex: 3, yIndex: 4, cardinals: defaults_1.gamecubeCardinals },
    isGC: true,
    ids: [{ name: "Wii U GameCube Adapter", id: "Wii U GameCube Adapter" }]
};
