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
import {actionStates} from "../../../physics/actionStateShortcuts";
import { State } from "../../State";

const ENTRANCE: State = {
  name : "ENTRANCE",
  canBeGrabbed : false,
  init : function(p,input){
    player[p].actionState = "ENTRANCE";
    player[p].timer = 0;
    player[p].phys.grounded = false;
    actionStates[characterSelections[p]].ENTRANCE.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    actionStates[characterSelections[p]].ENTRANCE.interrupt!(p,input);
  },
  interrupt : function(p,input){
    if (player[p].timer > 60){
      actionStates[characterSelections[p]].FALL.init(p,input);
    }
  }
};



export default ENTRANCE;