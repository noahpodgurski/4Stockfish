import {executeIntangibility, actionStates, playSounds} from "../../../physics/actionStateShortcuts";
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
import {sounds} from "../../../main/sfx";
import {framesData} from '../../../main/characters';
import {drawVfx} from "../../../main/vfx/drawVfx";
import { State } from "../../State";

const TECHF: State = {
  name : "TECHF",
  canEdgeCancel : false,
  canBeGrabbed : true,
  setVelocities : [],
  init : function(p,input){
    player[p].actionState = "TECHF";
    player[p].timer = 0;
    drawVfx({
      name: "tech",
      pos: player[p].phys.pos
    });
    sounds.tech.play();
    actionStates[characterSelections[p]].TECHF.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    playSounds("TECH",p);
    if (!actionStates[characterSelections[p]].TECHF.interrupt!(p,input)){
      executeIntangibility("TECHF",p);
      player[p].phys.cVel.x = actionStates[characterSelections[p]].TECHF!.setVelocities![player[p].timer-1]*player[p].phys.face;
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].TECHF){
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default TECHF;