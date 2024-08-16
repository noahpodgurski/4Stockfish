"use strict";
// @flow
/*eslint indent:0*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.dualAction = void 0;
const defaults_1 = require("../defaults");
exports.dualAction = { a: { kind: "pressed", index: 0 },
    b: { kind: "pressed", index: 2 },
    x: { kind: "pressed", index: 3 },
    y: { kind: "pressed", index: 1 },
    z: { kind: "pressed", index: 5 },
    r: { kind: "pressed", index: 7 },
    l: { kind: "pressed", index: 6 },
    s: { kind: "pressed", index: 8 },
    lA: null,
    rA: null,
    dpad: { kind: "buttons", upIndex: 12, downIndex: 13, leftIndex: 14, rightIndex: 15 },
    ls: { kind: "axes", xIndex: 0, yIndex: 1, cardinals: defaults_1.defaultCardinals },
    cs: { kind: "axes", xIndex: 2, yIndex: 3, cardinals: defaults_1.defaultCardinals },
    isGC: false,
    ids: [{ name: "Logitech Dual Action controller", id: "Logitech Dual Action", vendor: "046d", product: "c216" }]
};
