import {player} from "../../../main/main";
import {sounds} from "../../../main/sfx";
import puff from "./index";
import {fastfall, checkForAerials, checkForSpecials, checkForMultiJump} from "../../../physics/actionStateShortcuts";
import {puffMultiJumpDrift} from "../puffMultiJumpDrift";
import {puffNextJump} from "../puffNextJump";
import ESCAPEAIR from "../../shared/moves/ESCAPEAIR";
import FALL from "../../shared/moves/FALL";
import { State } from "../../State";

const JUMPAERIAL1: State = {
  name: "JUMPAERIAL1",
  canPassThrough: true,
  canGrabLedge: [true, false],
  wallJumpAble: true,
  headBonk: true,
  canBeGrabbed: true,
  landType: 0,
  init: function (p, input) {
    player[p].actionState = "JUMPAERIAL1";
    player[p].timer = 0;
    player[p].phys.fastfalled = false;
    player[p].phys.cVel.y = 1.65;
    player[p].phys.cVel.x = (input[p][0].lsX * 0.5);
    player[p].phys.jumpsUsed++;
    sounds.jump2.play();
    puff.JUMPAERIAL1.main!(p, input);
  },
  main: function (p, input) {
    player[p].timer++;
    if (!puff.JUMPAERIAL1.interrupt!(p, input)) {
      fastfall(p, input);
      puffMultiJumpDrift(p, input);
    }
  },
  interrupt: function (p, input) {
    const a = checkForAerials(p, input);
    const b = checkForSpecials(p, input);
    if (a[0] === true) {
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
    else if (player[p].timer > 28 && checkForMultiJump(p, input)) {
      puffNextJump(p, input);
      return true;
    }
    else if (player[p].timer > 50) {
      FALL.init(p, input);
      return true;
    }
    else {
      return false;
    }
  }
};

export default JUMPAERIAL1;