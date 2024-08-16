
import WAIT from "../../shared/moves/WAIT";
import {characterSelections, player} from "main/main";
import {randomShout, reduceByTraction, turnOffHitboxes} from "physics/actionStateShortcuts";
import {sounds} from "main/sfx";

import { State } from "../../State";

const UPSMASH: State = {
  name : "UPSMASH",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "UPSMASH";
    player[p].timer = 0;
    player[p].phys.charging = false;
    player[p].phys.chargeFrames = 0;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.upsmash1.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.upsmash1.id1;
    this.main!(p,input);
  },
  main : function(p,input){
    if (player[p].timer === 2){
      if (input[p][0].a || input[p][0].z){
        player[p].phys.charging = true;
        player[p].phys.chargeFrames++;
        if (player[p].phys.chargeFrames === 5){
          sounds.smashcharge.play();
        }
        if (player[p].phys.chargeFrames === 60){
          player[p].timer++;
          player[p].phys.charging = false;
        }
      }
      else {
        player[p].timer++;
        player[p].phys.charging = false;
      }
    }
    else {
      player[p].timer++;
      player[p].phys.charging = false;
    }
    if (!this.interrupt!(p,input)){
      reduceByTraction(p,true);

      if (player[p].timer === 7){
        player[p].hitboxes.active = [true,true,false,false];
        player[p].hitboxes.frame = 0;
        randomShout(characterSelections[p]);
        sounds.normalswing1.play();
      }
      if (player[p].timer > 7 && player[p].timer < 18){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 11){
        player[p].hitboxes.id[0] = player[p].charHitboxes.upsmash2.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.upsmash2.id1;
        player[p].hitboxes.frame = 0;
      }
      if (player[p].timer === 16){
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 41){
      WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default UPSMASH;