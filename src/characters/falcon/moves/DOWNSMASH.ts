
import MOVES from "./index";
import DASH from "../../shared/moves/DASH";
import SMASHTURN from "../../shared/moves/SMASHTURN";
import TILTTURN from "../../shared/moves/TILTTURN";
import WALK from "../../shared/moves/WALK";
import WAIT from "../../shared/moves/WAIT";
import KNEEBEND from "../../shared/moves/KNEEBEND";
let player, characterSelections;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ player, characterSelections } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ player, characterSelections } = mainModule);
  }
})();
import {sounds} from "../../../main/sfx";
import {reduceByTraction, randomShout, turnOffHitboxes, checkForSpecials, checkForTilts, checkForSmashes, checkForJump,
    checkForDash
    , checkForSmashTurn
    , checkForTiltTurn
    , tiltTurnDashBuffer
} from "../../../physics/actionStateShortcuts";

import { State } from "../../State";

const DOWNSMASH: State = {
  name : "DOWNSMASH",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "DOWNSMASH";
    player[p].timer = 0;
    player[p].phys.charging = false;
    player[p].phys.chargeFrames = 0;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.dsmash1.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.dsmash1.id1;
    this.main!(p,input);
  },
  main : function(p,input){
    if (player[p].timer === 14){
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

      if (player[p].timer === 19){
        player[p].hitboxes.active = [true,true,false,false];
        player[p].hitboxes.frame = 0;
        randomShout(characterSelections[p]);
        sounds.normalswing1.play();
      }
      if (player[p].timer > 19 && player[p].timer < 23){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 23){
        turnOffHitboxes(p);
      }
      if (player[p].timer === 29){
        player[p].hitboxes.id[0] = player[p].charHitboxes.dsmash2.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.dsmash2.id1;
        player[p].hitboxes.active = [true,true,false,false];
        player[p].hitboxes.frame = 0;
        sounds.normalswing1.play();
      }
      if (player[p].timer > 29 && player[p].timer < 33){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 33){
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 49){
      WAIT.init(p,input);
      return true;
    }
    else if (player[p].timer > 44 && !player[p].inCSS){
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
      else if (checkForTiltTurn(p,input)){
        player[p].phys.dashbuffer = tiltTurnDashBuffer(p,input);
        TILTTURN.init(p,input);
        return true;
      }
      else if (Math.abs(input[p][0].lsX) > 0.3){
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


export default DOWNSMASH;