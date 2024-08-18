import {reduceByTraction, actionStates} from "../../../physics/actionStateShortcuts";
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

const CATCHCUT: State = {
  name : "CATCHCUT",
  canEdgeCancel : false,
  canGrabLedge : [true,false],
  canBeGrabbed : true,
  inGrab : true,
  init : function(p,input){
    player[p].actionState = "CATCHCUT";
    player[p].timer = 0;
    player[p].phys.grabbing = -1;
    player[p].phys.cVel.x = -1*player[p].phys.face;
    actionStates[characterSelections[p]].CATCHCUT.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].CATCHCUT.interrupt!(p,input)){
      reduceByTraction(p,true);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].CATCHCUT){
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default CATCHCUT;