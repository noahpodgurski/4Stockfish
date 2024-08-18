import {checkForSpecials, checkForAerials, checkForDoubleJump, airDrift, fastfall, actionStates} from "../../../physics/actionStateShortcuts";
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

const FALLAERIAL: State = {
  name : "FALLAERIAL",
  canPassThrough : true,
  canGrabLedge : [true,false],
  wallJumpAble : true,
  headBonk : true,
  canBeGrabbed : true,
  landType : 0,
  vCancel : true,
  init : function(p,input){
    player[p].actionState = "FALLAERIAL";
    player[p].timer = 0;
    actionStates[characterSelections[p]].FALLAERIAL.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].FALLAERIAL.interrupt!(p,input)){
      fastfall(p,input);
      airDrift(p,input);
    }
  },
  interrupt : function(p,input){
    const a = checkForAerials(p, input);
    const b = checkForSpecials(p, input);
    if (a[0]){
      actionStates[characterSelections[p]][a[1]].init(p,input);
      return true;
    }
    else if ((input[p][0].l && !input[p][1].l) || (input[p][0].r && !input[p][1].r)){
      actionStates[characterSelections[p]].ESCAPEAIR.init(p,input);
      return true;
    }
    else if (checkForDoubleJump (p,input) && (!player[p].phys.doubleJumped || (player[p].phys.jumpsUsed < 5 && player[p].charAttributes.multiJump))){
      if (input[p][0].lsX*player[p].phys.face < -0.3){
        actionStates[characterSelections[p]].JUMPAERIALB.init(p,input);
      }
      else {
        actionStates[characterSelections[p]].JUMPAERIALF.init(p,input);
      }
      return true;
    }
    else if (b[0]){
      actionStates[characterSelections[p]][b[1] as string].init(p,input);
      return true;
    }
    else if (player[p].timer > framesData[characterSelections[p]].FALLAERIAL){
      actionStates[characterSelections[p]].FALLAERIAL.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default FALLAERIAL;