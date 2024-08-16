import marth from "./index";
import {player} from "../../../main/main";
import {turnOffHitboxes, reduceByTraction} from "../../../physics/actionStateShortcuts";
import {sounds} from "../../../main/sfx";
import WAIT from "../../shared/moves/WAIT";
import { State } from "../../State";

const DOWNATTACK: State = {
  name: "DOWNATTACK",
  canEdgeCancel: false,
  canBeGrabbed: true,
  init: function (p, input) {
    player[p].actionState = "DOWNATTACK";
    player[p].timer = 0;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.downattack1.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.downattack1.id1;
    player[p].hitboxes.id[2] = player[p].charHitboxes.downattack1.id2;
    player[p].hitboxes.id[3] = player[p].charHitboxes.downattack1.id3;
    marth.DOWNATTACK.main!(p, input);
  },
  main: function (p, input) {
    player[p].timer++;
    if (!marth.DOWNATTACK.interrupt!(p, input)) {
      reduceByTraction(p, true);

      if (player[p].timer === 1) {
        player[p].phys.intangibleTimer = 31;
      }

      if (player[p].timer === 20) {
        player[p].hitboxes.active = [true, true, true, true];
        player[p].hitboxes.frame = 0;
        sounds.sword2.play();
      }
      if (player[p].timer > 20 && player[p].timer < 24) {
        player[p].hitboxes.frame++;
      }

      if (player[p].timer === 24) {
        turnOffHitboxes(p);
      }

      if (player[p].timer === 30) {
        player[p].hitboxes.id[0] = player[p].charHitboxes.downattack2.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.downattack2.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.downattack2.id2;
        player[p].hitboxes.id[3] = player[p].charHitboxes.downattack2.id3;
        player[p].hitboxes.active = [true, true, true, true];
        player[p].hitboxes.frame = 0;
        sounds.sword2.play();
      }
      if (player[p].timer > 30 && player[p].timer < 32) {
        player[p].hitboxes.frame++;
      }

      if (player[p].timer === 32) {
        turnOffHitboxes(p);
      }
    }
  },
  interrupt: function (p, input) {
    if (player[p].timer > 49) {
      WAIT.init(p, input);
      return true;
    }
    else {
      return false;
    }
  }
};

export default DOWNATTACK;