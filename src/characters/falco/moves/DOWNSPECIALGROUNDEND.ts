/* eslint-disable */
import WAIT from "../../shared/moves/WAIT";
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

import { State } from "../../State";

const DOWNSPECIALGROUNDEND: State = {
  name : "DOWNSPECIALGROUNDEND",
  canPassThrough : false,
  canGrabLedge : [false,false],
  wallJumpAble : false,
  headBonk : false,
  canBeGrabbed : true,
  canEdgeCancel : true,
  disableTeeter : true,
  airborneState : "DOWNSPECIALAIREND",
  init : function(p,input){
    player[p].actionState = "DOWNSPECIALGROUNDEND";
    player[p].timer = 0;
    turnOffHitboxes(p);
    this.main!(p,input);
  },
  main : function(p,input) {
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      reduceByTraction(p);
    }
  },
  interrupt : function(p,input) {
    if (player[p].timer > 18){
      WAIT.init(p,input);
      return true;
    } 
    else {
      return false;
    }
  }
};

export default DOWNSPECIALGROUNDEND;