import {executeIntangibility, reduceByTraction, actionStates} from "../../../physics/actionStateShortcuts";
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

const DOWNSTANDN: State = {
  name : "DOWNSTANDN",
  canEdgeCancel : true,
  disableTeeter : true,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "DOWNSTANDN";
    player[p].timer = 0;
    actionStates[characterSelections[p]].DOWNSTANDN.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].DOWNSTANDN.interrupt!(p,input)){
      reduceByTraction(p,true);
      executeIntangibility("DOWNSTANDN",p);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].DOWNSTANDN){
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default DOWNSTANDN;