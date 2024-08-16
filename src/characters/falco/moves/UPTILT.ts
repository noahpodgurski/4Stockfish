
import MOVES from "./index";
import WAIT from "../../shared/moves/WAIT";
import KNEEBEND from "../../shared/moves/KNEEBEND";
import DASH from "../../shared/moves/DASH";
import SMASHTURN from "../../shared/moves/SMASHTURN";
import TILTTURN from "../../shared/moves/TILTTURN";
import WALK from "../../shared/moves/WALK";
import {tiltTurnDashBuffer, checkForSmashTurn, checkForDash, checkForJump, checkForSmashes, checkForTilts,
    checkForSpecials
    , reduceByTraction
    , turnOffHitboxes
} from "physics/actionStateShortcuts";
import {sounds} from "main/sfx";
import {player} from "main/main";

import { State } from "../../State";

const UPTILT: State = {
  name : "UPTILT",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "UPTILT";
    player[p].timer = 0;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.uptilt.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.uptilt.id1;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      reduceByTraction(p,true);

      if (player[p].timer === 5){
        player[p].hitboxes.active = [true,true,false,false];
        player[p].hitboxes.frame = 0;
        sounds.normalswing2.play();
        // needs 3
      }
      if (player[p].timer > 5 && player[p].timer < 12){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 12){
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 23){
      WAIT.init(p,input);
      return true;
    }
    else if (player[p].timer > 22){
      const b = checkForSpecials(p,input);
      const t = checkForTilts(p,input);
      const s = checkForSmashes(p,input);
      const j = checkForJump(p,input);
      if (j[0]){
        KNEEBEND.init(p,j[1],input);
        return true;
      }
      else if (b[0]){
        MOVES[b[1] as string].init(p,input);
        return true;
      }
      else if (s[0]){
        MOVES[s[1] as string].init(p,input);
        return true;
      }
      else if (t[0]){
        MOVES[t[1] as string].init(p,input);
        return true;
      }
      else if (checkForDash(p,input)){
        DASH.init(p,input);
        return true;
      }
      else if (checkForSmashTurn(p,input)){
        SMASHTURN.init(p,input);
        return true;
      }
      else if (input[p][0].lsX*player[p].phys.face < -0.3 && Math.abs(input[p][0].lsX) > input[p][0].lsY*-1){
        player[p].phys.dashbuffer = tiltTurnDashBuffer(p,input);
        TILTTURN.init(p,input);
        return true;
      }
      else if (input[p][0].lsX*player[p].phys.face > 0.3 && Math.abs(input[p][0].lsX) > input[p][0].lsY*-1){
        WALK.init(p,input, true);
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
};


export default UPTILT;