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
import {sounds} from "../../../main/sfx";
import {framesData} from '../../../main/characters';
import {drawVfx} from "../../../main/vfx/drawVfx";
import { State } from "../../State";

const LANDINGATTACKAIRB: State = {
  name : "LANDINGATTACKAIRB",
  canEdgeCancel : true,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "LANDINGATTACKAIRB";
    player[p].timer = 0;
    if (player[p].phys.lCancel){
      player[p].phys.landingLagScaling = 2;
    }
    else {
      player[p].phys.landingLagScaling = 1;
    }
    drawVfx({
      name: "circleDust",
      pos: player[p].phys.pos,
      face: player[p].phys.face
    });
    sounds.land.play();
    actionStates[characterSelections[p]].LANDINGATTACKAIRB.main!(p,input);
  },
  main : function(p,input){
    player[p].timer += player[p].phys.landingLagScaling;
    if (!actionStates[characterSelections[p]].LANDINGATTACKAIRB.interrupt!(p,input)){
      reduceByTraction(p,true);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].LANDINGATTACKAIRB){
      actionStates[characterSelections[p]].WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default LANDINGATTACKAIRB;