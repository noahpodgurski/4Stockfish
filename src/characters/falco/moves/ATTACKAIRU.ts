
import MOVES from "./index";
import LANDING from "../../shared/moves/LANDING";
import LANDINGATTACKAIRU from "../../shared/moves/LANDINGATTACKAIRU";
import JUMPAERIALB from "../../shared/moves/JUMPAERIALB";
import JUMPAERIALF from "../../shared/moves/JUMPAERIALF";
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
import {turnOffHitboxes, fastfall, airDrift, checkForAerials, checkForDoubleJump, checkForIASA} from "../../../physics/actionStateShortcuts";
import {sounds} from "../../../main/sfx";

import { State } from "../../State";

const ATTACKAIRU: State = {
  name : "ATTACKAIRU",
  canPassThrough : false,
  canGrabLedge : [false,false],
  wallJumpAble : false,
  headBonk : false,
  canBeGrabbed : true,
  landType : 1,
  init : function(p,input){
    player[p].actionState = "ATTACKAIRU";
    player[p].timer = 0;
    player[p].phys.autoCancel = true;
    player[p].inAerial = true;
    player[p].IASATimer = 35;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.upair1.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.upair1.id1;
    player[p].hitboxes.id[2] = player[p].charHitboxes.upair1.id2;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      fastfall(p,input);
      airDrift(p,input);
      if (player[p].timer === 7){
        player[p].phys.autoCancel = false;
      }
      else if (player[p].timer === 8){
        player[p].hitboxes.active = [true,true,true,false];
        player[p].hitboxes.frame = 0;
        sounds.sword1.play();
      }
      else if (player[p].timer === 9){
        player[p].hitboxes.frame++;
      }
      else if (player[p].timer === 10){
        turnOffHitboxes(p);
      }
      else if (player[p].timer === 11){
        player[p].hitboxes.id[0] = player[p].charHitboxes.upair2.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.upair2.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.upair2.id2;
        player[p].hitboxes.active = [true,true,true,false];
        player[p].hitboxes.frame = 0;
        sounds.normalswing2.play();
        // needs normalswing3
      }
      else if (player[p].timer > 11 && player[p].timer < 15){
        player[p].hitboxes.frame++;
      }
      else if (player[p].timer === 15){
        turnOffHitboxes(p);
      }
      else if (player[p].timer === 27){
        player[p].phys.autoCancel = true;
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 39){
      FALL.init(p,input);
      return true;
    } else if (checkForIASA(p,input,true)){
      return true;
    } else {
      return false;
    }
  },
  land : function(p,input){
    if (player[p].phys.autoCancel){
      LANDING.init(p,input);
    }
    else {
      LANDINGATTACKAIRU.init(p,input);
    }
  }
};


export default ATTACKAIRU;