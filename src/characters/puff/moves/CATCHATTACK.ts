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
import {turnOffHitboxes} from "../../../physics/actionStateShortcuts";
import puff from "./index";
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
    puff.CATCHATTACK.main!(p, input);
  },
  main: function (p, input) {
    player[p].timer++;
    if (!puff.CATCHATTACK.interrupt!(p, input)) {
      if (player[p].timer === 10) {
        player[p].hitboxes.active = [true, false, false, false];
        player[p].hitboxes.frame = 0;
      }
      if (player[p].timer === 11) {
        turnOffHitboxes(p);
      }
    }
  },
  interrupt: function (p, input) {
    if (player[p].timer > 30) {
      CATCHWAIT.init(p, input);
      return true;
    }
    else {
      return false;
    }
  }
};

export default CATCHATTACK;