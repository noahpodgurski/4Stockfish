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

const SHIELDBREAKSTAND: State = {
  name : "SHIELDBREAKSTAND",
  canEdgeCancel : true,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "SHIELDBREAKSTAND";
    player[p].timer = 0;
    actionStates[characterSelections[p]].SHIELDBREAKSTAND.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].SHIELDBREAKSTAND.interrupt!(p,input)){
      reduceByTraction(p,true);
      player[p].phys.intangibleTimer = 1;
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].SHIELDBREAKSTAND){
      actionStates[characterSelections[p]].FURAFURA.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default SHIELDBREAKSTAND;