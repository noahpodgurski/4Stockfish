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
import {turnOffHitboxes, fastfall, airDrift, checkForAerials, checkForMultiJump} from "../../../physics/actionStateShortcuts";
import puff from "./index";
import {sounds} from "../../../main/sfx";
import FALL from "../../shared/moves/FALL";
import LANDING from "../../shared/moves/LANDING";
import LANDINGATTACKAIRU from "../../shared/moves/LANDINGATTACKAIRU";
import { State } from "../../State";

const ATTACKAIRU: State = {
  name: "ATTACKAIRU",
  canPassThrough: false,
  canGrabLedge: [false, false],
  wallJumpAble: false,
  headBonk: false,
  canBeGrabbed: true,
  landType: 1,
  init: function (p, input) {
    player[p].actionState = "ATTACKAIRU";
    player[p].timer = 0;
    player[p].phys.autoCancel = true;
    player[p].inAerial = true;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.upair.id0;
    puff.ATTACKAIRU.main!(p, input);
  },
  main: function (p, input) {
    player[p].timer++;
    if (!puff.ATTACKAIRU.interrupt!(p, input)) {
      fastfall(p, input);
      airDrift(p, input);

      if (player[p].timer === 9) {
        player[p].hitboxes.active = [true, false, false, false];
        player[p].hitboxes.frame = 0;
        player[p].phys.autoCancel = false;
        sounds.normalswing2.play();
        // needs normalswing3
      }
      if (player[p].timer > 9 && player[p].timer < 13) {
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 13) {
        turnOffHitboxes(p);
      }
      if (player[p].timer === 38) {
        player[p].phys.autoCancel = true;
      }
    }
  },
  interrupt: function (p, input) {
    if (player[p].timer > 39) {
      FALL.init(p, input);
      return true;
    }
    else if (player[p].timer > 37) {
      const a = checkForAerials(p, input);
      if (checkForMultiJump(p,input) && player[p].phys.jumpsUsed < 5) {
        puff.JUMPAERIALF.init(p, input);
        return true;
      }
      else if (a[0]) {
        puff[a[1]].init(p, input);
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  },
  land: function (p, input) {
    if (player[p].phys.autoCancel) {
      LANDING.init(p, input);
    }
    else {
      LANDINGATTACKAIRU.init(p, input);
    }
  }
};

export default ATTACKAIRU;