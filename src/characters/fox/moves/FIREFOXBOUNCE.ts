
import FALLSPECIAL from "../../shared/moves/FALLSPECIAL";
import WAIT from "../../shared/moves/WAIT";
import LANDING from "../../shared/moves/LANDING";
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

export default {
  name : "FIREFOXBOUNCE",
  canPassThrough : true,
  canGrabLedge : [true,false],
  wallJumpAble : false,
  headBonk : false,
  canBeGrabbed : true,
  setVelocities : [0.00062,0.00062,0.00062,5.27148,5.4568,2.56,0.0638,0.02712,-0.00286,-0.02613,-0.0427,-0.05257,-0.05573,-1.83217],
  landType : 1,
  init : function(p,input){
    player[p].actionState = "FIREFOXBOUNCE";
    player[p].timer = 0;
    player[p].phys.grounded = false;
    this.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    if (!this.interrupt!(p,input)){
      if (player[p].phys.cVel.x !== 0){
        player[p].phys.cVel.x -= 0.03*player[p].phys.face;
        if (player[p].phys.cVel.x*player[p].phys.face < 0){
          player[p].phys.cVel.x = 0;
        }
      }
      player[p].phys.cVel.y = this.setVelocities![player[p].timer-1];
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 14){
      if (player[p].phys.grounded){
        WAIT.init(p,input);
      }
      else {
        FALLSPECIAL.init(p,input);
      }
      return true;
    }
    else {
      return false;
    }
  },
  land : function(p,input){
    LANDING.init(p,input);
  }
};
