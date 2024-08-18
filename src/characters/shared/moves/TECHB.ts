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

const TECHB: State = {
  name : "TECHB",
  canEdgeCancel : false,
  canBeGrabbed : true,
  setVelocities : [],
  init : function(p,input){
    player[p].actionState = "TECHB";
    player[p].timer = 0;
    drawVfx({
      name: "tech",
      pos: player[p].phys.pos
    });
    sounds.tech.play();
    actionStates[characterSelections[p]].TECHB.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    playSounds("TECH",p);
    if (!actionStates[characterSelections[p]].TECHB.interrupt!(p,input)){
      executeIntangibility("TECHB",p);
      player[p].phys.cVel.x = actionStates[characterSelections[p]].TECHB!.setVelocities![player[p].timer-1]*player[p].phys.face ?? 0;
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].TECHB){
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default TECHB;