
import WAIT from "../../shared/moves/WAIT";
import CATCHCUT from "../../shared/moves/CATCHCUT";
import {randomShout, turnOffHitboxes, actionStates} from "../../../physics/actionStateShortcuts";
let characterSelections, player;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ characterSelections, player } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ characterSelections, player } = mainModule);
  }
})();
import {framesData} from '../../../main/characters';
import {hitQueue} from '../../../physics/hitDetection';
import { State } from "../../State";

const THROWFORWARD: State = {
  name : "THROWFORWARD",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "THROWFORWARD";
    player[p].timer = 0;
    const grabbing = player[p].phys.grabbing;
    if(grabbing === -1){
      return;
    }
    actionStates[characterSelections[grabbing]].THROWNFALCONFORWARD.init(grabbing,input);
    const frame = framesData[characterSelections[grabbing]].THROWNFALCONFORWARD;
    player[p].phys.releaseFrame = frame+1;
    turnOffHitboxes(p);
    player[p].hitboxes.id[0] = player[p].charHitboxes.throwforward.id0;
    randomShout(characterSelections[p]);
    this.main!(p,input);
  },
  main : function(p,input){
    const prevFrame = player[p].timer;
    player[p].timer+=18/player[p].phys.releaseFrame;
    if (!this.interrupt!(p,input)){
      if (player[p].timer >= 11 && prevFrame < 11){
        player[p].hitboxes.id[0] = player[p].charHitboxes.throwforwardextra.id0;
        player[p].hitboxes.id[1] = player[p].charHitboxes.throwforwardextra.id1;
        player[p].hitboxes.id[2] = player[p].charHitboxes.throwforwardextra.id2;
        player[p].hitboxes.active = [true,true,true,false];
        player[p].hitboxes.frame = 0;
      }
      if (player[p].timer >= 18 && prevFrame < 18){
        turnOffHitboxes(p);
      }
      if (Math.floor(player[p].timer+0.01) >= 18 && Math.floor(prevFrame+0.01) < 18){
        player[p].hitboxes.id[0] = player[p].charHitboxes.throwforward.id0;
        player[p].hitboxes.active = [true,false,false,false];
        hitQueue.push([player[p].phys.grabbing,p,0,false,true,false]);
        turnOffHitboxes(p);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 39){
      player[p].phys.grabbing = -1;
      WAIT.init(p,input);
      return true;
    }
    else {
      const grabbing = player[p].phys.grabbing;
      if(grabbing === -1){
        return;
      }
      if (player[p].timer < player[p].phys.releaseFrame && player[grabbing].phys.grabbedBy !== p){
        CATCHCUT.init(p,input);
        return true;
      }
      else {
        return false;
      }
    }
  }
};


export default THROWFORWARD;