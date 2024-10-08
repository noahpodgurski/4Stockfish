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
import {sounds} from "../../../main/sfx";
import puff from "./index";
import {fastfall, checkForAerials, checkForSpecials} from "../../../physics/actionStateShortcuts";
import {puffMultiJumpDrift} from "../puffMultiJumpDrift";
import ESCAPEAIR from "../../shared/moves/ESCAPEAIR";
import { State } from "../../State";

const AERIALTURN4: State = {
  name: "AERIALTURN4",
  canPassThrough: true,
  canGrabLedge: [true, false],
  wallJumpAble: true,
  headBonk: true,
  canBeGrabbed: true,
  landType: 0,
  init: function (p, input) {
    player[p].actionState = "AERIALTURN4";
    player[p].timer = 0;
    player[p].phys.fastfalled = false;
    player[p].phys.doubleJumped = true;
    player[p].phys.cVel.y = 1.36;
    player[p].phys.cVel.x = (input[p][0].lsX * 0.5);
    player[p].phys.jumpsUsed++;
    sounds.jump2.play();
    puff.AERIALTURN4.main!(p, input);

  },
  main: function (p, input) {
    player[p].timer++;
    if (player[p].timer === 13) {
      player[p].timer--;
      player[p].actionState = "JUMPAERIAL4";
      puff.JUMPAERIAL4.main!(p, input);
    }
    else {
      if (!puff.AERIALTURN4.interrupt!(p, input)) {
        fastfall(p, input);
        puffMultiJumpDrift(p, input);
        if (player[p].timer === 6) {
          player[p].phys.face *= -1;
        }
      }
    }
  },
  interrupt: function (p, input) {
    const a = checkForAerials(p, input);
    const b = checkForSpecials(p, input);
    if (a[0]) {
      puff[a[1]].init(p, input);
      return true;
    }
    else if ((input[p][0].l && !input[p][1].l) || (input[p][0].r && !input[p][1].r)) {
      ESCAPEAIR.init(p, input);
      return true;
    }
    else if (b[0]) {
      puff[b[1] as string].init(p, input);
      return true;
    }
    else {
      return false;
    }
  }
};

export default AERIALTURN4;