import {puffNextJump} from "../puffNextJump";
import { State } from "../../State";

const JUMPAERIALF: State = {
  name: "JUMPAERIALF",
  init: function (p, input) {
    puffNextJump(p, input);
  }
};

export default JUMPAERIALF;