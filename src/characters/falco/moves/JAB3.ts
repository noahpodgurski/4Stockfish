
import WAIT from "../../shared/moves/WAIT";
import {sounds} from "../../../main/sfx";
import {reduceByTraction, turnOffHitboxes} from "../../../physics/actionStateShortcuts";
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

import { State } from "../../State";

const JAB3: State = {
  name : "JAB3",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "JAB3";
    player[p].timer = 0;
    player[p].phys.jabCombo = false;
    turnOffHitboxes(p);
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      reduceByTraction(p,true);
      if (player[p].timer > 6 && player[p].timer < 43 && input[p][0].a && !input[p][1].a){
        player[p].phys.jabCombo = true;
      }

      if (player[p].timer === 9){
        player[p].hitboxes.id[0] = player[p].charHitboxes.jab3_1.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.jab3_1.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.jab3_1.id2;
      }
      else if (player[p].timer === 16){
        player[p].hitboxes.id[0] = player[p].charHitboxes.jab3_2.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.jab3_2.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.jab3_2.id2;
      }
      else if (player[p].timer === 23){
        player[p].hitboxes.id[0] = player[p].charHitboxes.jab3_3.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.jab3_3.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.jab3_3.id2;
      }
      else if (player[p].timer === 30){
        player[p].hitboxes.id[0] = player[p].charHitboxes.jab3_4.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.jab3_4.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.jab3_4.id2;
      }
      else if (player[p].timer === 37){
        player[p].hitboxes.id[0] = player[p].charHitboxes.jab3_5.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.jab3_5.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.jab3_5.id2;
      }

      if (player[p].timer > 8 && player[p].timer < 40){
        switch (player[p].timer % 7){
          case 2:
            player[p].hitboxes.active = [true,true,true,false];
            player[p].hitboxes.frame = 0;
            sounds.normalswing2.play();
            break;
          case 3:
            player[p].hitboxes.frame++;
            break;
          case 4:
            turnOffHitboxes(p);
            break;

        }
      }
      if (player[p].timer === 43 && player[p].phys.jabCombo){
        player[p].phys.jabCombo = false;
        player[p].timer = 7;
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 51){
      WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default JAB3;