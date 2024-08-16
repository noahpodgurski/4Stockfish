import MOVES from "./index";
import WAIT from "../../shared/moves/WAIT";
import KNEEBEND from "../../shared/moves/KNEEBEND";
import DASH from "../../shared/moves/DASH";
import SMASHTURN from "../../shared/moves/SMASHTURN";
import TILTTURN from "../../shared/moves/TILTTURN";
import WALK from "../../shared/moves/WALK";
import {characterSelections, player} from "main/main";
import {randomShout, tiltTurnDashBuffer, checkForSmashTurn, checkForDash, checkForJump, checkForSmashes, checkForTilts,
    checkForSpecials
    , reduceByTraction
    , turnOffHitboxes
} from "physics/actionStateShortcuts";
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
    player[p].hitboxes.id[2] = player[p].charHitboxes.upsmash1.id2;
    player[p].hitboxes.id[3] = player[p].charHitboxes.upsmash1.id3;
    randomShout(characterSelections[p]);
    this.main!(p,input);
  },
  main : function(p,input){
    if (player[p].timer === 8){
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

      if (player[p].timer === 21){
        player[p].hitboxes.active = [true,true,true,true];
        player[p].hitboxes.frame = 0;
        sounds.normalswing2.play();
      }
      if (player[p].timer > 21 && player[p].timer < 23){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 23){
        turnOffHitboxes(p);
      }
      if (player[p].timer === 27){
        player[p].hitboxes.id[0] = player[p].charHitboxes.upsmash2.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.upsmash2.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.upsmash2.id2;
        player[p].hitboxes.frame = 0;
        player[p].hitboxes.active = [true,true,true,false];
        sounds.normalswing2.play();
      }
      if (player[p].timer === 29){
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 54){
      WAIT.init(p,input);
      return true;
    }
    else if (player[p].timer > 39){
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
    // iasa 40
    else {
      return false;
    }
  }
};


export default UPSMASH;