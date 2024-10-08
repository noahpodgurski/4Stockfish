
import MOVES from "./index";
import GRAB from "./GRAB";
import KNEEBEND from "../../shared/moves/KNEEBEND";
import DASH from "../../shared/moves/DASH";
import SMASHTURN from "../../shared/moves/SMASHTURN";
import TILTTURN from "../../shared/moves/TILTTURN";
import WALK from "../../shared/moves/WALK";
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
import {turnOffHitboxes, checkForSpecials, checkForTilts, checkForSmashes, checkForJump, checkForDash,
    checkForSmashTurn
    , checkForTiltTurn
    , tiltTurnDashBuffer
} from "../../../physics/actionStateShortcuts";
import {sounds} from "../../../main/sfx";

import { State } from "../../State";

const ATTACKDASH: State = {
  name : "ATTACKDASH",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "ATTACKDASH";
    player[p].timer = 0;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.dashattackClean.id0;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){

      if (player[p].timer < 27) {
        player[p].phys.cVel.x = 1.30577 * player[p].phys.face;
      }
      else {
        player[p].phys.cVel.x = 0.34643 * player[p].phys.face;
      }

      if (player[p].timer === 7){
        player[p].hitboxes.active = [true,false,false,false];
        player[p].hitboxes.frame = 0;
        sounds.normalswing2.play();
      }
      if (player[p].timer > 7 && player[p].timer < 17){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 10){
        player[p].hitboxes.id[0] = player[p].charHitboxes.dashattackLate.id0;
        player[p].hitboxes.frame = 0;
      }
      if (player[p].timer === 17){
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 39){
      WAIT.init(p,input);
      return true;
    }
    else if (player[p].timer < 5 && (input[p][0].lA > 0 || input[p][0].rA > 0)){
      if (player[p].phys.cVel.x*player[p].phys.face > player[p].charAttributes.dMaxV){
        player[p].phys.cVel.x = player[p].charAttributes.dMaxV*player[p].phys.face;
      }
      GRAB.init(p,input);
      return true;
    }
    else if (player[p].timer > 37){
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


export default ATTACKDASH;