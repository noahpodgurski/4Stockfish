/* eslint-disable */
import DOWNSPECIALAIRSTART from "./DOWNSPECIALAIRSTART";
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

const DOWNSPECIALAIR: State = {
  name : "DOWNSPECIALAIR",
  init : function(p,input){
    DOWNSPECIALAIRSTART.init(p,input);
  }
};


export default DOWNSPECIALAIR;