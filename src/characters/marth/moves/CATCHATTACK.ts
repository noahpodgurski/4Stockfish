import marth from "./index";
import {player} from "../../../main/main";
import {turnOffHitboxes} from "../../../physics/actionStateShortcuts";
import CATCHWAIT from "../../shared/moves/CATCHWAIT";
import { State } from "../../State";
const CATCHATTACK: State = {
  name: "CATCHATTACK",
  canEdgeCancel: false,
  canBeGrabbed: true,
  init: function (p, input) {
    player[p].actionState = "CATCHATTACK";
    player[p].timer = 0;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.pummel.id0;
    marth.CATCHATTACK.main!(p, input);
  },
  main: function (p, input) {
    player[p].timer++;
    if (!marth.CATCHATTACK.interrupt!(p, input)) {
      if (player[p].timer === 6) {
        player[p].hitboxes.active = [true, false, false, false];
        player[p].hitboxes.frame = 0;
      }
      if (player[p].timer === 7) {
        turnOffHitboxes(p);
      }
    }
  },
  interrupt: function (p, input) {
    if (player[p].timer > 24) {
      CATCHWAIT.init(p, input);
      return true;
    }
    else {
      return false;
    }
  }
};

export default CATCHATTACK;