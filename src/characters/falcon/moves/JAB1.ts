
import MOVES from "./index";
import JAB2 from "./JAB2";
import WAIT from "../../shared/moves/WAIT";
import WALK from "../../shared/moves/WALK";
import DASH from "../../shared/moves/DASH";
import KNEEBEND from "../../shared/moves/KNEEBEND";
import SMASHTURN from "../../shared/moves/SMASHTURN";
import TILTTURN from "../../shared/moves/TILTTURN";
import {player} from "main/main";
import {turnOffHitboxes, reduceByTraction, checkForSpecials, checkForTilts, checkForSmashes, checkForJump, checkForDash,
    tiltTurnDashBuffer
    , checkForTiltTurn
    , checkForSmashTurn
} from "physics/actionStateShortcuts";
import {sounds} from "main/sfx";

import { State } from "../../State";

const JAB1: State = {
  name : "JAB1",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "JAB1";
    player[p].timer = 0;
    player[p].phys.jabCombo = false;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.jab1.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.jab1.id1;
    player[p].hitboxes.id[2] = player[p].charHitboxes.jab1.id2;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      reduceByTraction(p,true);

      if (player[p].timer > 2 && player[p].timer < 25 && input[p][0].a && !input[p][1].a){
        player[p].phys.jabCombo = true;
      }
      if (player[p].timer === 3){
        player[p].hitboxes.active = [true,true,true,false];
        player[p].hitboxes.frame = 0;
        sounds.normalswing2.play();
      }
      if (player[p].timer > 3 && player[p].timer < 6){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 6){
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 8 && player[p].phys.jabCombo){
      JAB2.init(p,input);
      return true;
    }
    else if (player[p].timer > 21){
      WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default JAB1;