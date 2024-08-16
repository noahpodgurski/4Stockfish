import WAIT from "../../shared/moves/WAIT";
import { State } from "../../State";

const FURAFURA: State = {
  name: "FURAFURA",
  init: function (p, input) {
    WAIT.init(p, input);
    //*cough*BITES*cough*
  },
  main: function(p, input) {},
  interrupt: function(p, input) {}, //todo (maybe make optional and dont define here?)
};

export default FURAFURA;