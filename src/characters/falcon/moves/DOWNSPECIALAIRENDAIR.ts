/* eslint-disable */
import WAIT from "../../shared/moves/WAIT";
import FALL from "../../shared/moves/FALL";
import DOWNSPECIALAIRENDGROUND from "./DOWNSPECIALAIRENDGROUND";
let player;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ player } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ player } = mainModule);
  }
})();
import {sounds} from "../../../main/sfx";
import {turnOffHitboxes} from "../../../physics/actionStateShortcuts";
import {drawVfx} from "../../../main/vfx/drawVfx";
import {Vec2D} from "../../../main/util/Vec2D";
import {gameSettings} from "../../../settings";

import { State } from "../../State";

const DOWNSPECIALAIRENDAIR: State = {
  name : "DOWNSPECIALAIRENDAIR",
  canPassThrough : false,
  canEdgeCancel : false,
  canGrabLedge : [false,false],
  wallJumpAble : false,
  headBonk : false,
  canBeGrabbed : true,
  landType : 1,
  init : function(p,input){
    player[p].actionState = "DOWNSPECIALAIRENDAIR";
    player[p].timer = 0;
    player[p].phys.fastfalled = false;
    player[p].phys.doubleJumped = false;
    turnOffHitboxes(p);
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      player[p].phys.cVel.y = Math.max(player[p].phys.cVel.y-player[p].charAttributes.gravity, -player[p].charAttributes.terminalV);
      player[p].phys.cVel.x = Math.sign(player[p].phys.cVel.x) * Math.max(Math.abs(player[p].phys.cVel.x)-player[p].charAttributes.airFriction, 0);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 29){
      FALL.init(p,input);
      return true;
    }
    else {
      return false;
    }
  },
  land : function(p,input){
    DOWNSPECIALAIRENDGROUND.init(p,input);
  }
};


export default DOWNSPECIALAIRENDAIR;