import FALLSPECIAL from "../../shared/moves/FALLSPECIAL";
import { player} from "main/main";

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