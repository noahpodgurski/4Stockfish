let finishGame, characterSelections, percentShake, screenShake, player;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ finishGame, characterSelections, percentShake, screenShake, player } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ finishGame, characterSelections, percentShake, screenShake, player } = mainModule);
  }
})();
import {playSounds, actionStates, isFinalDeath} from "../../../physics/actionStateShortcuts";
import {sounds} from "../../../main/sfx";
import {drawVfx} from "../../../main/vfx/drawVfx";
import { State } from "../../State";

const DEADRIGHT: State = {
  name : "DEADRIGHT",
  canBeGrabbed : false,
  ignoreCollision : true,
  dead : true,
  init : function(p,input){
    player[p].actionState = "DEADRIGHT";
    player[p].timer = 0;
    player[p].phys.cVel.x = 0;
    player[p].phys.cVel.y = 0;
    player[p].phys.kVel.x = 0;
    player[p].phys.kVel.y = 0;
    player[p].percent = 0;
    drawVfx({
      name: "blastzoneExplosion",
      pos: player[p].phys.pos,
      face: -90
    });
    if (!isFinalDeath()){
      screenShake(500);
      percentShake(500,p);
    }
    sounds.kill.play();
    actionStates[characterSelections[p]].DEADRIGHT.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    playSounds("DEAD",p);
    if (!actionStates[characterSelections[p]].DEADRIGHT.interrupt!(p,input)){
      player[p].phys.outOfCameraTimer = 0;
      player[p].phys.intangibleTimer = 2;
      player[p].phys.hurtBoxState = 1;
      if (player[p].timer === 4){
        if (isFinalDeath()){
          finishGame(input);
        }
        else {
          screenShake(500);
          percentShake(500,p);
        }
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 60){
      if (player[p].stocks > 0){
        actionStates[characterSelections[p]].REBIRTH.init(p,input);
      }
      else {
        actionStates[characterSelections[p]].SLEEP.init(p,input);
      }
      return true;
    }
    else {
      return false;
    }
  }
};



export default DEADRIGHT;