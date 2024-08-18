import {executeIntangibility, actionStates} from "../../../physics/actionStateShortcuts";
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

const DOWNSTANDB: State = {
  name : "DOWNSTANDB",
  canEdgeCancel : false,
  canBeGrabbed : true,
  setVelocities : [],
  init : function(p,input){
    player[p].actionState = "DOWNSTANDB";
    player[p].timer = 0;
    actionStates[characterSelections[p]].DOWNSTANDB.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].DOWNSTANDB.interrupt!(p,input)){
      player[p].phys.cVel.x = actionStates[characterSelections[p]].DOWNSTANDB.setVelocities![player[p].timer-1]*player[p].phys.face ?? 0;
      executeIntangibility("DOWNSTANDB",p);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].DOWNSTANDB){
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default DOWNSTANDB;