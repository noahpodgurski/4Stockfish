import UPSPECIALCHARGE from "./UPSPECIALCHARGE";

import { State } from "../../State";

const UPSPECIAL: State = {
  name : "UPSPECIAL",
  init : function(p,input){
    UPSPECIALCHARGE.init(p,input);
  }
};


export default UPSPECIAL;