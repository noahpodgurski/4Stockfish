import {airDrift, fastfall, actionStates} from "../../../physics/actionStateShortcuts";
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

const FALLSPECIAL: State = {
  name : "FALLSPECIAL",
  canPassThrough : true,
  canGrabLedge : [true,false],
  wallJumpAble : false,
  headBonk : false,
  canBeGrabbed : true,
  landType : 1,
  vCancel : true,
  init : function(p,input){
    player[p].actionState = "FALLSPECIAL";
    player[p].timer = 0;
    actionStates[characterSelections[p]].FALLSPECIAL.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].FALLSPECIAL.interrupt!(p,input)){
      fastfall(p,input);
      airDrift(p,input);
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > framesData[characterSelections[p]].FALLSPECIAL){
      actionStates[characterSelections[p]].FALLSPECIAL.init(p,input);
      return true;
    }
    else {
      return false;
    }
  },
  land : function(p,input){
    actionStates[characterSelections[p]].LANDINGFALLSPECIAL.init(p,input);
  }
};


export default FALLSPECIAL;