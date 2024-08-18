
import MOVES from "./index";
import JAB3 from "./JAB3";
import WAIT from "../../shared/moves/WAIT";
import WALK from "../../shared/moves/WALK";
import DASH from "../../shared/moves/DASH";
import KNEEBEND from "../../shared/moves/KNEEBEND";
import SMASHTURN from "../../shared/moves/SMASHTURN";
import TILTTURN from "../../shared/moves/TILTTURN";
import {tiltTurnDashBuffer, checkForTiltTurn, checkForSmashTurn, checkForDash, checkForJump, checkForSmashes,
    checkForTilts
    , checkForSpecials
    , turnOffHitboxes
    , reduceByTraction
} from "../../../physics/actionStateShortcuts";
import {sounds} from "../../../main/sfx";
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

const JAB2: State = {
  name : "JAB2",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "JAB2";
    player[p].timer = 0;
    player[p].phys.jabCombo = false;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.jab2.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.jab2.id1;
    player[p].hitboxes.id[2] = player[p].charHitboxes.jab2.id2;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      reduceByTraction(p,true);
      if (player[p].timer > 1 && player[p].timer < 26 && input[p][0].a && !input[p][1].a){
        player[p].phys.jabCombo = true;
      }
      if (player[p].timer === 5){
        player[p].hitboxes.active = [true,true,true,false];
        player[p].hitboxes.frame = 0;
        sounds.normalswing2.play();
      }
      if (player[p].timer > 5 && player[p].timer < 8){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 8){
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 7 && player[p].phys.jabCombo){
      JAB3.init(p,input);
      return true;
    }
    else if (player[p].timer > 20){
      WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default JAB2;