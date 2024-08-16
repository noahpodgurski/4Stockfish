/* eslint-disable */
import DOWNSPECIALAIRSTART from "./DOWNSPECIALAIRSTART";
import {player} from "main/main";

import { State } from "../../State";

const DOWNSPECIALAIR: State = {
  name : "DOWNSPECIALAIR",
  init : function(p,input){
    DOWNSPECIALAIRSTART.init(p,input);
  }
};


export default DOWNSPECIALAIR;