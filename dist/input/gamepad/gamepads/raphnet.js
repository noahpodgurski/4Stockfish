"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.raphnetV3_2 = exports.raphnetV2_9 = void 0;
/*eslint indent:0*/
/*eslint camelcase:0*/
const defaults_1 = require("../defaults");
const raphnetV2_9IDs = [{ name: "Raphnet N64 adapter, v2.9", id: "GC/N64 to USB, v2.", vendor: "289b", product: "000c" },
    { name: "Raphnet N64 adapter, v2.9", id: "GC/N64 to USB v2." }
];
const raphnetV3_2IDs = [{ name: "Raphnet N64 adapter, v3", id: "GC/N64 to USB, v3.", vendor: "289b", product: "001d" },
    { name: "Raphnet N64 adapter, v3", id: "GC/N64 to USB v3." }
];
exports.raphnetV2_9 = { a: { kind: "pressed", index: 4 },
    b: { kind: "pressed", index: 3 },
    x: { kind: "pressed", index: 2 },
    y: { kind: "pressed", index: 1 },
    z: { kind: "pressed", index: 7 },
    r: { kind: "pressed", index: 6 },
    l: { kind: "pressed", index: 5 },
    s: { kind: "pressed", index: 0 },
    lA: null,
    rA: null,
    dpad: { kind: "buttons", upIndex: 8, downIndex: 9, leftIndex: 11, rightIndex: 10 },
    ls: { kind: "axes", xIndex: 0, yIndex: 1, cardinals: defaults_1.defaultCardinals },
    cs: { kind: "axes", xIndex: 3, yIndex: 4, cardinals: defaults_1.defaultCardinals },
    isGC: false,
    ids: raphnetV2_9IDs
};
exports.raphnetV3_2 = { a: { kind: "pressed", index: 0 },
    b: { kind: "pressed", index: 1 },
    x: { kind: "pressed", index: 7 },
    y: { kind: "pressed", index: 8 },
    z: { kind: "pressed", index: 2 },
    r: { kind: "pressed", index: 5 },
    l: { kind: "pressed", index: 4 },
    s: { kind: "pressed", index: 3 },
    lA: null,
    rA: null,
    dpad: { kind: "buttons", upIndex: 10, downIndex: 11, leftIndex: 12, rightIndex: 13 },
    ls: { kind: "axes", xIndex: 0, yIndex: 1, cardinals: defaults_1.defaultCardinals },
    cs: { kind: "axes", xIndex: 3, yIndex: 4, cardinals: defaults_1.defaultCardinals },
    isGC: false,
    ids: raphnetV3_2IDs
};
