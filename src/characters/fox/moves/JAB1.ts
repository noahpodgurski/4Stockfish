
import MOVES from "../../fox/moves/index";
import JAB2 from "../../fox/moves/JAB2";
import WAIT from "../../shared/moves/WAIT";
import WALK from "../../shared/moves/WALK";
import DASH from "../../shared/moves/DASH";
import KNEEBEND from "../../shared/moves/KNEEBEND";
import SMASHTURN from "../../shared/moves/SMASHTURN";
import TILTTURN from "../../shared/moves/TILTTURN";
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
import {turnOffHitboxes, reduceByTraction, checkForSpecials, checkForTilts, checkForSmashes, checkForJump, checkForDash,
    tiltTurnDashBuffer
    , checkForTiltTurn
    , checkForSmashTurn
} from "../../../physics/actionStateShortcuts";
import {sounds} from "../../../main/sfx";

export default {
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
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      reduceByTraction(p,true);

      if (player[p].timer > 2 && player[p].timer < 32 && input[p][0].a && !input[p][1].a){
        player[p].phys.jabCombo = true;
      }
      if (player[p].timer === 2){
        player[p].hitboxes.active = [true,true,false,false];
        player[p].hitboxes.frame = 0;
        sounds.normalswing2.play();
      }
      if (player[p].timer > 2 && player[p].timer < 4){
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 4){
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 5 && player[p].phys.jabCombo){
      JAB2.init(p,input);
      return true;
    }
    else if (player[p].timer > 17){
      WAIT.init(p,input);
      return true;
    }
    else if (player[p].timer > 15){
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
