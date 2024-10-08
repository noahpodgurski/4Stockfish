import {airDrift, fastfall, actionStates, turnOffHitboxes} from "../../../physics/actionStateShortcuts";
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
import { State } from "../../State";

const MISSFOOT: State = {
  name : "MISSFOOT",
  canPassThrough : true,
  canGrabLedge : [true,false],
  wallJumpAble : false,
  headBonk : true,
  canBeGrabbed : true,
  landType : 0,
  init : function(p,input){
    player[p].actionState = "MISSFOOT";
    player[p].timer = 0;
    player[p].hit.hitstun = 0;
    turnOffHitboxes(p);
    actionStates[characterSelections[p]].MISSFOOT.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].MISSFOOT.interrupt!(p,input)){
      fastfall(p,input);
      airDrift(p,input);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 26){
      actionStates[characterSelections[p]].DAMAGEFALL.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default MISSFOOT;