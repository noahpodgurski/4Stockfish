import marth from "./index";
let player, characterSelections;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ player, characterSelections } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ player, characterSelections } = mainModule);
  }
})();
import {actionStates, turnOffHitboxes, randomShout} from "../../../physics/actionStateShortcuts";
import {framesData} from "../../../main/characters";
import {hitQueue} from '../../../physics/hitDetection';
import WAIT from "../../shared/moves/WAIT";
import CATCHCUT from "../../shared/moves/CATCHCUT";
import { State } from "../../State";

const THROWUP: State = {
  name: "THROWUP",
  canEdgeCancel: false,
  canBeGrabbed: true,
  init: function (p, input) {
    player[p].actionState = "THROWUP";
    player[p].timer = 0;
    const grabbing = player[p].phys.grabbing;
    if(grabbing === -1){
      return;
    }
    actionStates[characterSelections[grabbing]].THROWNMARTHUP.init(grabbing, input);
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.throwup.id0;
    const frame = framesData[characterSelections[grabbing]].THROWNMARTHUP;
    player[p].phys.releaseFrame = frame + 1;
    randomShout(characterSelections[p]);
    marth.THROWUP.main!(p, input);
  },
  main: function (p, input) {
    const prevFrame = player[p].timer;
    player[p].timer += 12 / player[p].phys.releaseFrame;
    if (!marth.THROWUP.interrupt!(p, input)) {
      if (Math.floor(player[p].timer + 0.01) >= 12 && Math.floor(prevFrame+0.01) < 12) {
        hitQueue.push([player[p].phys.grabbing, p, 0, false, true, false]);
        turnOffHitboxes(p);
      }

    }
  },
  interrupt: function (p, input) {
    if (player[p].timer > 39) {
      player[p].phys.grabbing = -1;
      WAIT.init(p, input);
      return true;
    }
    else {
      const grabbing = player[p].phys.grabbing;
      if(grabbing === -1){
        return false;
      }
      if (player[p].timer < 11 && player[grabbing].phys.grabbedBy !== p) {
        CATCHCUT.init(p, input);
        return true;
      }
      else {
        return false;
      }
    }
  }
};

export default THROWUP;