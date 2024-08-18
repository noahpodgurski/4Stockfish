import {executeIntangibility, reduceByTraction, actionStates, playSounds} from "../../../physics/actionStateShortcuts";
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

const TECHN: State = {
  name : "TECHN",
  canEdgeCancel : true,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "TECHN";
    player[p].timer = 0;
    drawVfx({
      name: "tech",
      pos: player[p].phys.pos
    });
    sounds.tech.play();
    actionStates[characterSelections[p]].TECHN.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    playSounds("TECH",p);
    if (!actionStates[characterSelections[p]].TECHN.interrupt!(p,input)){
      reduceByTraction(p,true);
      executeIntangibility("TECHN",p);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].TECHN){
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default TECHN;