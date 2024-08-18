import {checkForSmashTurn, checkForDash, checkForJump, checkForSmashes, checkForTilts, checkForSpecials,
    reduceByTraction
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
import {framesData} from '../../../main/characters';
import { State } from "../../State";

const SQUATWAIT: State = {
  name : "SQUATWAIT",
  canEdgeCancel : true,
  canBeGrabbed : true,
  crouch : true,
  disableTeeter : true,
  init : function(p,input){
    player[p].actionState = "SQUATWAIT";
    player[p].timer = 0;
    actionStates[characterSelections[p]].SQUATWAIT.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].SQUATWAIT.interrupt!(p,input)){
      reduceByTraction(p,true);
    }
  },
  interrupt : function(p,input){
    const b = checkForSpecials(p,input);
    const t = checkForTilts(p,input);
    const s = checkForSmashes(p,input);
    const j = checkForJump(p,input);
    if (input[p][0].lsY > -0.61){
      actionStates[characterSelections[p]].SQUATRV.init(p,input);
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
      return true;
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
    else if (checkForDash(p,input)){
      actionStates[characterSelections[p]].DASH.init(p,input);
      return true;
    }
    else if (checkForSmashTurn(p,input)){
      actionStates[characterSelections[p]].SMASHTURN.init(p,input);
      return true;
    }
    else if (player[p].timer > framesData[characterSelections[p]].SQUATWAIT){
      actionStates[characterSelections[p]].SQUATWAIT.init(p,input);
    }
    else {
      return false;
    }
  }
};


export default SQUATWAIT;