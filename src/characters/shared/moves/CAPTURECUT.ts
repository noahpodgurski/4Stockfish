import {reduceByTraction, actionStates} from "../../../physics/actionStateShortcuts";
let characterSelections, player;
(async () => {
  ;
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

const CAPTURECUT: State = {
  name : "CAPTURECUT",
  canEdgeCancel : false,
  canGrabLedge : [true,false],
  wallJumpAble : false,
  canBeGrabbed : true,
  inGrab : true,
  init : function(p,input){
    player[p].actionState = "CAPTURECUT";
    player[p].timer = 0;
    player[p].phys.grabbedBy = -1;
    player[p].phys.cVel.x = -1*player[p].phys.face;
    actionStates[characterSelections[p]].CAPTURECUT.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].CAPTURECUT.interrupt!(p,input)){
      if (player[p].timer === 2){
        player[p].phys.grabTech = false;
      }
      reduceByTraction(p,true);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].CAPTURECUT){
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default CAPTURECUT;