import {sounds} from "../../../main/sfx";
import {executeIntangibility, playSounds, actionStates} from "../../../physics/actionStateShortcuts";
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

const ESCAPEB: State = {
  name : "ESCAPEB",
  setVelocities : [],
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "ESCAPEB";
    player[p].timer = 0;
    player[p].phys.shielding = false;
    actionStates[characterSelections[p]].ESCAPEB.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    playSounds("ESCAPEB",p);
    if (!actionStates[characterSelections[p]].ESCAPEB.interrupt!(p,input)){
      player[p].phys.cVel.x = actionStates[characterSelections[p]].ESCAPEB.setVelocities![player[p].timer-1]*player[p].phys.face ?? 0;
      executeIntangibility("ESCAPEB",p);
      if (player[p].timer === 4){
        sounds.roll.play();
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].ESCAPEB){
      player[p].phys.cVel.x = 0;
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default ESCAPEB;