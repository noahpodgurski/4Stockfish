import {tiltTurnDashBuffer, checkForTiltTurn, checkForSmashTurn, checkForDash, checkForSquat, checkForJump,
    checkForSmashes
    , checkForTilts
    , checkForSpecials
    , actionStates
} from "physics/actionStateShortcuts";
import {characterSelections, player} from "main/main";
import {framesData} from 'main/characters';
import { State } from "../../State";

const OTTOTTO: State = {
  name : "OTTOTTO",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "OTTOTTO";
    player[p].timer = 1;
    player[p].phys.cVel.x = 0;
    actionStates[characterSelections[p]].OTTOTTO.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].OTTOTTO.interrupt!(p,input)){

    }
  },
  interrupt : function(p,input){
    const b = checkForSpecials(p, input);
    const t = checkForTilts(p, input);
    const s = checkForSmashes(p, input);
    const j = checkForJump(p, input);
    if (player[p].timer > framesData[characterSelections[p]].OTTOTTO){
      actionStates[characterSelections[p]].OTTOTTOWAIT.init(p,input);
      return true;
    }
    else if (j[0]){
      actionStates[characterSelections[p]].KNEEBEND.init(p,j[1],input);
      return true;
    }
    else if (input[p][0].l || input[p][0].r){
      actionStates[characterSelections[p]].GUARDON.init(p,input);
      return true;
    }
    else if (input[p][0].lA > 0 || input[p][0].rA > 0){
      actionStates[characterSelections[p]].GUARDON.init(p,input);
    }
    else if (b[0]){
      actionStates[characterSelections[p]][b[1] as string].init(p,input);
      return true;
    }
    else if (s[0]){
      actionStates[characterSelections[p]][s[1] as string].init(p,input);
      return true;
    }
    else if (t[0]){
      actionStates[characterSelections[p]][t[1] as string].init(p,input);
      return true;
    }
    else if (input[p][0].du) {
      actionStates[characterSelections[p]].APPEAL.init(p,input);
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
    else if (Math.abs(input[p][0].lsX) > 0.6){
      actionStates[characterSelections[p]].WALK.init(p,input, true);
      return true;
    }
    else {
      return false;
    }
  }
};



export default OTTOTTO;