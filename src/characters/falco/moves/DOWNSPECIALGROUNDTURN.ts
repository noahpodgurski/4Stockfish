/* eslint-disable */
import DOWNSPECIALGROUNDLOOP from "./DOWNSPECIALGROUNDLOOP";
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
import {turnOffHitboxes, reduceByTraction} from "../../../physics/actionStateShortcuts";
import {drawVfx} from "../../../main/vfx/drawVfx";
import {Vec2D} from "../../../main/util/Vec2D";

import { State } from "../../State";

const DOWNSPECIALGROUNDTURN: State = {
  name : "DOWNSPECIALGROUNDTURN",
  canPassThrough : false,
  canGrabLedge : [false,false],
  wallJumpAble : false,
  headBonk : false,
  canBeGrabbed : true,
  canEdgeCancel : true,
  disableTeeter : true,
  airborneState : "DOWNSPECIALAIRTURN",
  init : function(p,input){
    player[p].actionState = "DOWNSPECIALGROUNDTURN";
    player[p].timer = 0;
    turnOffHitboxes(p);
    this.main!(p,input);
  },
  main : function(p,input) {
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      reduceByTraction(p);

      if (player[p].shineLoop === 6){
        player[p].shineLoop = 0;
      }
      player[p].shineLoop++;
      drawVfx({
        name:"shineloop",
        pos:new Vec2D(0,0),
        face:p
      });
    }
  },
  interrupt : function(p,input) {
    if (player[p].timer > 3){
      player[p].phys.face *= -1;
      DOWNSPECIALGROUNDLOOP.init(p,input);
      return true;
    } 
    else {
      return false;
    }
  }
};

export default DOWNSPECIALGROUNDTURN;