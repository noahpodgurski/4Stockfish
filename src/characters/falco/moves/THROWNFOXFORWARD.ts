import {Vec2D} from "../../../main/util/Vec2D";
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
import { State } from "../../State";

const THROWNFOXFORWARD: State = {
  name : "THROWNFOXFORWARD",
  canEdgeCancel : false,
  canGrabLedge : [false,false],
  canBeGrabbed : false,
  offset : [[-7.74-0.08,-0.77],[-7.17-0.22,-0.03],[-7.15-0.24,0.12],[-7.34,0.13],[-7.44+0.68,0.30],[-7.65+1.67,0.49],[-8.06+2.69,0.65],[-8.77+3.47,0.72],[-10.03+4.04,0.61],[-12.03+4.61,0.38],[-12.03+4.61,0.38]],
  //[0.08,0.22,0.24,0,-0.68,-1.67,-2.69,-3.47,-4.04,-4.61]
  init : function(p,input){
    player[p].actionState = "THROWNFOXFORWARD";
    if (player[p].phys.grabbedBy < p){
      player[p].timer = -1;
    }
    else {
      player[p].timer = 0;
    }
    player[p].phys.grounded = false;
    player[p].phys.pos = new Vec2D(player[player[p].phys.grabbedBy].phys.pos.x,player[player[p].phys.grabbedBy].phys.pos.y);
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      if (player[p].timer > 0){
        player[p].phys.pos = new Vec2D(player[player[p].phys.grabbedBy].phys.pos.x+this.offset[player[p].timer-1][0]*player[p].phys.face,player[player[p].phys.grabbedBy].phys.pos.y+this.offset[player[p].timer-1][1]);
      }
    }
  },
  interrupt : function(p,input){
    return false;
  }
};


export default THROWNFOXFORWARD;