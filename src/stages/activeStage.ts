import vsstages from './vs-stages/vs-stages';
import {Box2D} from "../main/util/Box2D";
import {Vec2D} from "../main/util/Vec2D";
import { Stage, Surface } from './stage';


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

export function setVsStage(val) {
  activeStage = vsstages[stageMapping[val]];

}


export let activeStage: Stage = {
  box: [new Box2D([-68.4, -108.8], [68.4, 0])],
  platform: [
    [new Vec2D(-57.6, 27.2), new Vec2D(-20, 27.2), void 0] as Surface,
    [new Vec2D(20, 27.2), new Vec2D(57.6, 27.2), void 0] as Surface,
    [new Vec2D(-18.8, 54.4), new Vec2D(18.8, 54.4), void 0] as Surface
  ],
  ground: [[new Vec2D(-68.4, 0), new Vec2D(68.4, 0), void 0] as Surface],
  ceiling: [[new Vec2D(-68.4, -108.8), new Vec2D(68.4, -108.8), void 0] as Surface],
  wallL: [[new Vec2D(-68.4, 0), new Vec2D(-68.4, -108.8), void 0] as Surface],
  wallR: [[new Vec2D(68.4, 0), new Vec2D(68.4, -108.8), void 0] as Surface],
  startingPoint: [new Vec2D(-50, 50), new Vec2D(50, 50), new Vec2D(-25, 5), new Vec2D(25, 5)],
  startingFace: [1, -1, 1, -1],
  respawnPoints: [new Vec2D(-50, 50), new Vec2D(50, 50), new Vec2D(-25, 35), new Vec2D(25, 35)],
  respawnFace: [1, -1, 1, -1],
  blastzone: new Box2D([-224, -108.8], [224, 200]),
  ledge: [["ground", 0, 0], ["ground", 0, 1]],
  ledgePos: [new Vec2D(-68.4, 0), new Vec2D(68.4, 0)],
  scale: 4.5,
  offset: [600, 480],
  connected: [[], []],
};


export function setActiveStageBuilderTestStage( stageTemp ) {
  activeStage = stageTemp;
}

export function getActiveStage() {
  return activeStage;
}