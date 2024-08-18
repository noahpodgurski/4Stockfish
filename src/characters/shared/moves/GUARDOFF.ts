import {tiltTurnDashBuffer, checkForTiltTurn, checkForSmashTurn, checkForDash, checkForSquat, checkForSmashes,
    checkForTilts
    , checkForJump
    , reduceByTraction
    , playSounds
    , actionStates
} from "../../../physics/actionStateShortcuts";
let characterSelections, player;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ characterSelections, player } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ characterSelections, player } = mainModule);
  }
})();
import {sounds} from "../../../main/sfx";
import {framesData} from '../../../main/characters';
import { State } from "../../State";

const GUARDOFF: State = {
  name : "GUARDOFF",
  canEdgeCancel : true,
  canBeGrabbed : true,
  missfoot : true,
  init : function(p,input){
    player[p].actionState = "GUARDOFF";
    player[p].timer = 0;
    sounds.shieldoff.play();
    actionStates[characterSelections[p]].GUARDOFF.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    playSounds("GUARDOFF",p);
    if (!actionStates[characterSelections[p]].GUARDOFF.interrupt!(p,input)){
      reduceByTraction(p,false);
      //shieldDepletion(p,input);
      //shieldSize(p,null,input);
    }
  },
  interrupt : function(p,input){
    let s;
    const j = checkForJump(p, input);
    if (j[0] && !player[p].inCSS){
      actionStates[characterSelections[p]].KNEEBEND.init(p,j[1],input);
      return true;
    }
    else if (player[p].timer > framesData[characterSelections[p]].GUARDOFF){
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else if (player[p].phys.powerShielded){
      if (!player[p].inCSS){
        const t = checkForTilts(p, input);
        s = checkForSmashes(p, input);
        if (s[0]){
          actionStates[characterSelections[p]][s[1] as string].init(p,input);
          return true;
        }
        else if (t[0]){
          actionStates[characterSelections[p]][t[1] as string].init(p,input);
          return true;
        }
        else if (checkForSquat(p,input)){
          actionStates[characterSelections[p]].SQUAT.init(p,input);
          return true;
        }
        else if (checkForDash(p,input)){
          actionStates[characterSelections[p]].DASH.init(p,input);
          return true;
        }
        else if (checkForSmashTurn(p,input)){
          actionStates[characterSelections[p]].SMASHTURN.init(p,input);
          return true;
        }
        else if (checkForTiltTurn(p,input)){
          player[p].phys.dashbuffer = tiltTurnDashBuffer(p,input);
          actionStates[characterSelections[p]].TILTTURN.init(p,input);
          return true;
        }
        else if (Math.abs(input[p][0].lsX) > 0.3){
          actionStates[characterSelections[p]].WALK.init(p,input, true);
          return true;
        }
        else {
          return false;
        }
      }
      else {
        s = checkForSmashes(p, input);
        if (s[0]){
          actionStates[characterSelections[p]][s[1] as string].init(p,input);
          return true;
        }
        else {
          return false;
        }
      }
    }
    else {
      return false;
    }
  }
};



export default GUARDOFF;