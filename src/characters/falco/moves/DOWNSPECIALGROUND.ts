/* eslint-disable */
import DOWNSPECIALGROUNDSTART from "./DOWNSPECIALGROUNDSTART";
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

const DOWNSPECIALGROUND: State = {
  name : "DOWNSPECIALGROUND",
  init : function(p,input){
    DOWNSPECIALGROUNDSTART.init(p,input);
  }
};



export default DOWNSPECIALGROUND;