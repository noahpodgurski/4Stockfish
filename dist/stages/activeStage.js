"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeStage = void 0;
exports.setVsStage = setVsStage;
exports.setActiveStageBuilderTestStage = setActiveStageBuilderTestStage;
exports.getActiveStage = getActiveStage;
const vs_stages_1 = __importDefault(require("./vs-stages/vs-stages"));
const Box2D_1 = require("../main/util/Box2D");
const Vec2D_1 = require("../main/util/Vec2D");
// for stages to have connected grounds/platforms, they need to provide a 'connectednessFunction'
// input of a connectedness function: [ [type, index ], side ]
// type is either "g" (ground) or "p" (platform),
// index is the index of that surface in the stage's list of surfaces (grounds or platforms depending on type)
// side is either "l" (left) or "r" (right)
// given such an input, the function should return which ground/platform is connected to that side of the given ground/platform,
// in the format [ newType, newIndex ],
// or return 'false' if the ground/platform is not connected on that side to any other ground/platform
// if 'connectednessFunction' is not supplied, it is assumed that no grounds/platforms are connected to any other grounds/platforms
const stageMapping = {
    0: "battlefield",
    1: "ystory",
    2: "pstadium",
    3: "dreamland",
    4: "fdest",
    5: "fountain"
};
function setVsStage(val) {
    exports.activeStage = vs_stages_1.default[stageMapping[val]];
}
exports.activeStage = {
    box: [new Box2D_1.Box2D([-68.4, -108.8], [68.4, 0])],
    platform: [
        [new Vec2D_1.Vec2D(-57.6, 27.2), new Vec2D_1.Vec2D(-20, 27.2), void 0],
        [new Vec2D_1.Vec2D(20, 27.2), new Vec2D_1.Vec2D(57.6, 27.2), void 0],
        [new Vec2D_1.Vec2D(-18.8, 54.4), new Vec2D_1.Vec2D(18.8, 54.4), void 0]
    ],
    ground: [[new Vec2D_1.Vec2D(-68.4, 0), new Vec2D_1.Vec2D(68.4, 0), void 0]],
    ceiling: [[new Vec2D_1.Vec2D(-68.4, -108.8), new Vec2D_1.Vec2D(68.4, -108.8), void 0]],
    wallL: [[new Vec2D_1.Vec2D(-68.4, 0), new Vec2D_1.Vec2D(-68.4, -108.8), void 0]],
    wallR: [[new Vec2D_1.Vec2D(68.4, 0), new Vec2D_1.Vec2D(68.4, -108.8), void 0]],
    startingPoint: [new Vec2D_1.Vec2D(-50, 50), new Vec2D_1.Vec2D(50, 50), new Vec2D_1.Vec2D(-25, 5), new Vec2D_1.Vec2D(25, 5)],
    startingFace: [1, -1, 1, -1],
    respawnPoints: [new Vec2D_1.Vec2D(-50, 50), new Vec2D_1.Vec2D(50, 50), new Vec2D_1.Vec2D(-25, 35), new Vec2D_1.Vec2D(25, 35)],
    respawnFace: [1, -1, 1, -1],
    blastzone: new Box2D_1.Box2D([-224, -108.8], [224, 200]),
    ledge: [["ground", 0, 0], ["ground", 0, 1]],
    ledgePos: [new Vec2D_1.Vec2D(-68.4, 0), new Vec2D_1.Vec2D(68.4, 0)],
    scale: 4.5,
    offset: [600, 480],
    connected: [[], []],
};
function setActiveStageBuilderTestStage(stageTemp) {
    exports.activeStage = stageTemp;
}
function getActiveStage() {
    return exports.activeStage;
}
