import FALLSPECIAL from "../../shared/moves/FALLSPECIAL";
let player;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ player } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ player } = mainModule);
  }
})();

import { State } from "../../State";

const SIDESPECIALGROUNDTOAIR: State = {
  name : "SIDESPECIALGROUNDTOAIR",
  init : function(p,input){
    if (Math.abs(player[p].phys.cVel.x) > player[p].charAttributes.aerialHmaxV) {
      player[p].phys.cVel.x = Math.sign(player[p].phys.cVel.x) * player[p].charAttributes.aerialHmaxV;
    }
    FALLSPECIAL.init(p,input);
  },
  main : function(p,input) {
    this.init(p,input);
  }
};


export default SIDESPECIALGROUNDTOAIR;