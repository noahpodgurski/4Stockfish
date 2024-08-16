import {puffNextJump} from "../puffNextJump";
import { State } from "../../State";

const JUMPAERIALB: State = {
  name: "JUMPAERIALB",
  init: function (p, input) {
    puffNextJump(p, input);
  }
};

export default JUMPAERIALB;