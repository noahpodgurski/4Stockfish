/* eslint-disable */
import DOWNSPECIALGROUNDSTART from "./DOWNSPECIALGROUNDSTART";
import {player} from "main/main";

import { State } from "../../State";

const DOWNSPECIALGROUND: State = {
  name : "DOWNSPECIALGROUND",
  init : function(p,input){
    DOWNSPECIALGROUNDSTART.init(p,input);
  }
};



export default DOWNSPECIALGROUND;