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
import puff from "./index";
import {Vec2D} from "../../../main/util/Vec2D";
import { State } from "../../State";

const THROWNPUFFFORWARD: State = {
  name: "THROWNPUFFFORWARD",
  canEdgeCancel: false,
  canGrabLedge: [false, false],
  canBeGrabbed: false,
  offset: [[-10.52, -3.27], [-9.84, -3.27], [-9.13, -3.27], [-8.70, -3.27], [-8.60, -3.27], [-8.61, -3.27], [-8.67, -3.27], [-8.70, -3.27], [-9.78, -3.27], [-9.78, 0.01]],
  init: function (p, input) {
    player[p].actionState = "THROWNPUFFFORWARD";
    const grabbedBy = player[p].phys.grabbedBy;
    if(grabbedBy === -1){
      return;
    }
    if (grabbedBy < p) {
      player[p].timer = -1;
    }
    else {
      player[p].timer = 0;
    }
    player[p].phys.grounded = false;
    puff.THROWNPUFFFORWARD.main!(p, input);
  },
  main: function (p, input) {
    player[p].timer++;
    if (!puff.THROWNPUFFFORWARD.interrupt!(p, input)) {
      let timer = player[p].timer;
      if (timer > 0) {
        const grabbedBy = player[p].phys.grabbedBy;
        if(grabbedBy === -1){
          return;
        }
        if(timer > puff.THROWNPUFFFORWARD.offset.length){
          timer = puff.THROWNPUFFFORWARD.offset.length - 1;
        }
        player[p].phys.pos = new Vec2D(player[grabbedBy].phys.pos.x + puff.THROWNPUFFFORWARD.offset[timer - 1][0] * player[p].phys.face, player[grabbedBy].phys.pos.y + puff.THROWNPUFFFORWARD.offset[timer - 1][1]);
      }
    }
  },
  interrupt: function (p, input) {
    return false;
  }
};

export default THROWNPUFFFORWARD;