
import WAIT from "../../shared/moves/WAIT";
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
import {Vec2D} from "../../../main/util/Vec2D";
import {activeStage} from "../../../stages/activeStage";

import { State } from "../../State";

const CLIFFGETUPSLOW: State = {
  name : "CLIFFGETUPSLOW",
  offset : [[-70.6,-16.31],[-70.6,-16.09],[-70.6,-15.85],[-70.6,-15.61],[-70.6,-15.37],[-70.6,-15.17],[-70.6,-15.00],[-70.6,-14.89],[-70.6,-14.85],[-70.6,-14.85],[-70.6,-14.85],[-70.6,-14.85],[-70.6,-14.85],[-70.6,-14.85],[-70.6,-14.85],[-70.6,-14.85],[-70.6,-14.85],[-70.6,-14.83],[-70.6,-14.79],[-70.6,-14.72],[-70.6,-14.62],[-70.6,-14.50],[-70.6,-14.36],[-70.6,-14.20],[-70.6,-14.02],[-70.6,-13.84],[-70.6,-13.64],[-70.6,-13.42],[-70.6,-13.21],[-70.6,-12.99],[-70.6,-12.76],[-70.6,-12.54],[-70.6,-12.32],[-70.6,-12.1],[-70.6,-11.85],[-70.6,-11.53],[-70.6,-11.16],[-70.6,-10.75],[-70.6,-10.33],[-70.6,-9.9],[-70.6,-9.50],[-70.6,-9.12],[-70.6,-8.75],[-70.6,-8.33],[-70.6,-7.86],[-70.6,-7.29],[-70.6,-6.6],[-70.50,-5.58],[-70.22,-4.21],[-69.82,-2.73],[-69.35,-1.37],[-68.86,-0.38],[-67.94,0]],
  setVelocities : [0.44,0.47,0.49,0.50,0.49,0.47],
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "CLIFFGETUPSLOW";
    player[p].timer = 0;
    player[p].phys.intangibleTimer = 55;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      const l = activeStage.ledge[player[p].phys.onLedge];
      const x = activeStage[l[0]][l[1]][l[2]].x;
      const y = activeStage[l[0]][l[1]][l[2]].y;
      if (player[p].timer < 54){
        player[p].phys.pos = new Vec2D(x+(this.offset[player[p].timer-1][0]+68.4)*player[p].phys.face,y+this.offset[player[p].timer-1][1]);
      }
      else {
        player[p].phys.cVel.x = this.setVelocities![player[p].timer-54]*player[p].phys.face;
      }
      if (player[p].timer === 54){
        player[p].phys.grounded = true;
        player[p].phys.onSurface = [l[0] === "ground" ? 0 : 1, l[1]];
        player[p].phys.airborneTimer = 0;
        player[p].phys.pos.y = y;
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 59){
      player[p].phys.onLedge = -1;
      player[p].phys.ledgeRegrabCount = false;
      WAIT.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default CLIFFGETUPSLOW;