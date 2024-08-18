import {checkForJump, checkForSmashes, checkForTilts, checkForSpecials, reduceByTraction, actionStates} from "../../../physics/actionStateShortcuts";
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

const SQUAT: State = {
  name : "SQUAT",
  canEdgeCancel : true,
  canBeGrabbed : true,
  crouch : true,
  disableTeeter : true,
  init : function(p,input){
    player[p].actionState = "SQUAT";
    player[p].timer = 0;
    actionStates[characterSelections[p]].SQUAT.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].SQUAT.interrupt!(p,input)){
      reduceByTraction(p,true);
    }
  },
  interrupt : function(p,input){
    const b = checkForSpecials(p, input);
    const t = checkForTilts(p, input);
    const s = checkForSmashes(p, input);
    const j = checkForJump(p, input);
    if (player[p].timer === 4 && (input[p][0].lsY < -0.65 || input[p][1].lsY < -0.65 || input[p][2].lsY < -0.65) && input[p][6].lsY > -0.3 && player[p].phys.onSurface[0] === 1){
      actionStates[characterSelections[p]].PASS.init(p,input);
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
    else if (player[p].timer > framesData[characterSelections[p]].SQUAT){
      actionStates[characterSelections[p]].SQUATWAIT.init(p,input);
      return true;
    }
    else if (input[p][0].du) {
      actionStates[characterSelections[p]].APPEAL.init(p,input);
      return true;
    }
    else if (j[0]){
      actionStates[characterSelections[p]].KNEEBEND.init(p,j[1],input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default SQUAT;