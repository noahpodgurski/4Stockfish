
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
import {sounds} from "../../../main/sfx";

import { State } from "../../State";

const FORWARDTILT: State = {
  name : "FORWARDTILT",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "FORWARDTILT";
    player[p].timer = 0;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.ftilt.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.ftilt.id1;
    player[p].hitboxes.id[2] = player[p].charHitboxes.ftilt.id2;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      reduceByTraction(p,true);
      if (player[p].timer === 5){
        player[p].hitboxes.active = [true,true,true,false];
        player[p].hitboxes.frame = 0;
        sounds.normalswing2.play();
        // needs 3
      }
      if (player[p].timer > 5 && player[p].timer < 10){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 10){
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 26){
      WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default FORWARDTILT;