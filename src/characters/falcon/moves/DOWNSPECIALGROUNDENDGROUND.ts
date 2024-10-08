import WAIT from "../../shared/moves/WAIT";
import FALL from "../../shared/moves/FALL";
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
import {turnOffHitboxes, reduceByTraction} from "../../../physics/actionStateShortcuts";

import {drawVfx} from "../../../main/vfx/drawVfx";
import {Vec2D} from "../../../main/util/Vec2D";
import { State } from "../../State";

const DOWNSPECIALGROUNDENDGROUND: State = {
  name : "DOWNSPECIALGROUNDENDGROUND",
  canPassThrough : false,
  canGrabLedge : [false,false],
  wallJumpAble : false,
  headBonk : false,
  canBeGrabbed : true,
  canEdgeCancel : true,
  disableTeeter : true,
  airborneState : "DOWNSPECIALGROUNDENDGROUND",
  init : function(p,input){
    player[p].actionState = "DOWNSPECIALGROUNDENDGROUND";
    player[p].timer = 0;
    player[p].phys.cVel.x = 2.14 * player[p].phys.face;
    player[p].phys.cVel.y = 0;
    turnOffHitboxes(p);
    sounds.land.play();
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      if (player[p].phys.grounded) {
        player[p].phys.cVel.x = Math.sign(player[p].phys.cVel.x) * Math.max(Math.abs(player[p].phys.cVel.x)-0.128, 0);
        player[p].phys.cVel.y = 0;
      }
      else {
        player[p].phys.cVel.x = Math.sign(player[p].phys.cVel.x) * Math.max(Math.abs(player[p].phys.cVel.x)-player[p].charAttributes.airFriction, 0);
        player[p].phys.cVel.y = Math.max(player[p].phys.cVel.y-player[p].charAttributes.gravity, -player[p].charAttributes.terminalV);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 30){
      if (player[p].phys.grounded){
        WAIT.init(p,input);
      }
      else {
        FALL.init(p,input);
      }
      return true;
    }
    else {
      return false;
    }
  }
};


export default DOWNSPECIALGROUNDENDGROUND;