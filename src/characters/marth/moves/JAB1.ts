import marth from "./index";
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
import {
  turnOffHitboxes, reduceByTraction, checkForSpecials, checkForTilts, checkForSmashes, checkForJump, checkForDash,
  checkForSmashTurn
  , checkForTiltTurn
  , tiltTurnDashBuffer
} from "../../../physics/actionStateShortcuts";
import {drawVfx} from "../../../main/vfx/drawVfx";
import {Vec2D} from "../../../main/util/Vec2D";
import {sounds} from "../../../main/sfx";
import WAIT from "../../shared/moves/WAIT";
import KNEEBEND from "../../shared/moves/KNEEBEND";
import DASH from "../../shared/moves/DASH";
import SMASHTURN from "../../shared/moves/SMASHTURN";
import TILTTURN from "../../shared/moves/TILTTURN";
import WALK from "../../shared/moves/WALK";

import { State } from "../../State";

const JAB1: State = {
  name: "JAB1",
  canEdgeCancel: false,
  canBeGrabbed: true,
  init: function (p, input) {
    player[p].actionState = "JAB1";
    player[p].timer = 0;
    player[p].phys.jabCombo = false;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.jab1.id0;
    player[p].hitboxes.id[1] = player[p].charHitboxes.jab1.id1;
    player[p].hitboxes.id[2] = player[p].charHitboxes.jab1.id2;
    player[p].hitboxes.id[3] = player[p].charHitboxes.jab1.id3;
    marth.JAB1.main!(p, input);
  },
  main: function (p, input) {
    player[p].timer++;
    if (!marth.JAB1.interrupt!(p, input)) {
      reduceByTraction(p, true);
      if (player[p].timer > 3 && player[p].timer < 15) {
        drawVfx({
          name: "swing",
          pos: new Vec2D(0, 0),
          face: player[p].phys.face,
          f: {
            pNum: p,
            swingType: "JAB1",
            frame: player[p].timer - 4
          }
        });
      }
      if (player[p].timer > 2 && player[p].timer < 26 && input[p][0].a && !input[p][1].a) {
        player[p].phys.jabCombo = true;
      }
      if (player[p].timer === 4) {
        player[p].hitboxes.active = [true, true, true, true];
        player[p].hitboxes.frame = 0;
        sounds.sword1.play();
      }
      if (player[p].timer > 4 && player[p].timer < 8) {
        player[p].hitboxes.frame++;
      }
      if (player[p].timer === 8) {
        turnOffHitboxes(p);
      }
    }
  },
  interrupt: function (p, input) {
    if (player[p].timer > 19 && player[p].phys.jabCombo) {
      marth.JAB2.init(p, input);
      return true;
    }
    else if (player[p].timer > 27) {
      WAIT.init(p, input);
      return true;
    }
    else if (player[p].timer > 26) {
      const b = checkForSpecials(p, input);
      const t = checkForTilts(p, input);
      const s = checkForSmashes(p, input);
      const j = checkForJump(p, input);
      if (j[0]) {
        KNEEBEND.init(p, j[1], input);
        return true;
      }
      else if (b[0]) {
        marth[b[1] as string].init(p, input);
        return true;
      }
      else if (s[0]) {
        marth[s[1] as string].init(p, input);
        return true;
      }
      else if (t[0]) {
        marth[t[1] as string].init(p, input);
        return true;
      }
      else if (checkForDash(p, input)) {
        DASH.init(p, input);
        return true;
      }
      else if (checkForSmashTurn(p, input)) {
        SMASHTURN.init(p, input);
        return true;
      }
      else if (checkForTiltTurn(p, input)) {
        player[p].phys.dashbuffer = tiltTurnDashBuffer(p, input);
        TILTTURN.init(p, input);
        return true;
      }
      else if (Math.abs(input[p][0].lsX) > 0.3) {
        WALK.init(p, input, true);
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
};

export default JAB1;