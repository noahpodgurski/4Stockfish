
import MOVES from "./index";
import LANDING from "../../shared/moves/LANDING";
import LANDINGATTACKAIRB from "../../shared/moves/LANDINGATTACKAIRB";
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
import {sounds} from "../../../main/sfx";
import {turnOffHitboxes, airDrift, fastfall, checkForAerials, checkForDoubleJump, checkForIASA} from "../../../physics/actionStateShortcuts";

import { State } from "../../State";

const ATTACKAIRB: State = {
  name : "ATTACKAIRB",
  canPassThrough : false,
  canGrabLedge : [false,false],
  wallJumpAble : false,
  headBonk : false,
  canBeGrabbed : true,
  landType : 1,
  init : function(p,input){
    player[p].actionState = "ATTACKAIRB";
    player[p].timer = 0;
    player[p].phys.autoCancel = true;
    player[p].inAerial = true;
    player[p].IASATimer = 29;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.bairClean.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.bairClean.id1;
    player[p].hitboxes.id[2] = player[p].charHitboxes.bairClean.id2;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      fastfall(p,input);
      airDrift(p,input);

      if (player[p].timer === 6){
        player[p].phys.autoCancel = false;
      }
      if (player[p].timer === 10){
        player[p].hitboxes.active = [true,true,true,false];
        player[p].hitboxes.frame = 0;
        sounds.normalswing1.play();
      }
      if (player[p].timer > 10 && player[p].timer < 18){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 14){
        player[p].hitboxes.id[0] = player[p].charHitboxes.bairLate.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.bairLate.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.bairLate.id2;
        player[p].hitboxes.active = [true,true,true,false];
        player[p].hitboxes.frame = 0;
      }
      if (player[p].timer === 18){
        turnOffHitboxes(p);
      }
      if (player[p].timer === 21){
        player[p].phys.autoCancel = true;
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 35){
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
      LANDINGATTACKAIRB.init(p,input);
    }
  }
};


export default ATTACKAIRB;