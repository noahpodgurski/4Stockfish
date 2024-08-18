import WAIT from "../../shared/moves/WAIT";
let player;
(async () => {
  ;
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ player } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ player } = mainModule);
  }
})();
import {sounds} from "../../../main/sfx";
import { State } from "../../State";

const APPEAL: State = {
  name : "APPEAL",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "APPEAL";
    player[p].timer = 0;
    player[p].phys.cVel.x = 0;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      if (player[p].timer === 3) {
        sounds.falcotaunt.play();
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 115) {
      WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default APPEAL;