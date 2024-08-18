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
import { State } from "../../State";

const DOWNDAMAGE: State = {
  name : "DOWNDAMAGE",
  canEdgeCancel : true,
  disableTeeter : true,
  airborneState : "DOWNDAMAGE",
  canBeGrabbed : true,
  downed : true,
  landType : 1,
  canGrabLedge : [false,false],
  init : function(p,input){
    player[p].actionState = "DOWNDAMAGE";
    player[p].timer = 0;
    player[p].phys.jabReset = true;
    player[p].phys.grounded = false;
    actionStates[characterSelections[p]].DOWNDAMAGE.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!actionStates[characterSelections[p]].DOWNDAMAGE.interrupt!(p,input)){
      if (!player[p].phys.grounded){
        player[p].phys.cVel.y -= player[p].charAttributes.gravity;
      }
      else {
        reduceByTraction(p,true);
      }
      if (player[p].timer > 1){
        player[p].hit.hitstun--;
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 13){
      if (player[p].phys.grounded){
        if (player[p].hit.hitstun <= 0){
          actionStates[characterSelections[p]].DOWNSTANDN.init(p,input);
        }
        else {
          actionStates[characterSelections[p]].DOWNWAIT.init(p,input);
        }
      }
      else {
        actionStates[characterSelections[p]].FALL.init(p,input);
      }
      return true;
    }
    else {
      return false;
    }
  },
  land : function(p,input){

  }
};



export default DOWNDAMAGE;