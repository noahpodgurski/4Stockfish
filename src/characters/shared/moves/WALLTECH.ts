import {checkForSpecials, checkForAerials, checkForDoubleJump, airDrift, fastfall, actionStates, playSounds} from "../../../physics/actionStateShortcuts";
import {sounds} from "../../../main/sfx";
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
import {drawVfx} from "../../../main/vfx/drawVfx";
import { State } from "../../State";

const WALLTECH: State = {
  name : "WALLTECH",
  canPassThrough : true,
  canGrabLedge : [true,false],
  wallJumpAble : true,
  headBonk : false,
  canBeGrabbed : true,
  landType : 0,
  init : function(p,input){
    player[p].actionState = "WALLTECH";
    player[p].timer = 0;
    player[p].phys.fastfalled = false;
    player[p].hit.knockback = 0;
    player[p].hit.hitstun = 0;
    player[p].phys.kVel.y = 0;
    player[p].phys.kVel.x = 0;
    player[p].phys.cVel.x = 0;
    player[p].phys.cVel.y = 0;
    player[p].phys.intangibleTimer = Math.max(player[p].phys.intangibleTimer,14);
    if (player[p].phys.face === 1){
      drawVfx({
        name: "tech",
        pos: player[p].phys.ECBp[3]
      });
    }
    else {
      drawVfx({
        name: "tech",
        pos: player[p].phys.ECBp[1]
      });
    }
    // draw tech rotated
    actionStates[characterSelections[p]].WALLTECH.main!(p,input);
  },
  main : function(p,input){
    if (player[p].timer < 1){
      player[p].timer+= 0.15;
      if (player[p].timer > 1){
        player[p].timer = 1;
      }
    }
    else {
      player[p].timer++;
    }
    playSounds("TECH",p);
    if (!actionStates[characterSelections[p]].WALLTECH.interrupt!(p,input)){
      if (player[p].timer === 2){
        sounds.walljump.play();
      }
      if (player[p].timer > 0.89 && player[p].timer < 0.91){
        player[p].phys.cVel.x = player[p].phys.face * 0.5;
      }
      if (player[p].timer >= 1){
        fastfall(p,input);
        airDrift(p,input);
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 1){
      const a = checkForAerials(p, input);
      const b = checkForSpecials(p, input);
      if (a[0]){
        actionStates[characterSelections[p]][a[1]].init(p,input);
        return true;
      }
      else if ((input[p][0].l && !input[p][1].l) || (input[p][0].r && !input[p][1].r)){
        actionStates[characterSelections[p]].ESCAPEAIR.init(p,input);
        return true;
      }
      else if (checkForDoubleJump (p,input) && (!player[p].phys.doubleJumped || (player[p].phys.jumpsUsed < 5 && player[p].charAttributes.multiJump))){
        if (input[p][0].lsX*player[p].phys.face < -0.3){
          actionStates[characterSelections[p]].JUMPAERIALB.init(p,input);
        }
        else {
          actionStates[characterSelections[p]].JUMPAERIALF.init(p,input);
        }
        return true;
      }
      else if (b[0]){
        actionStates[characterSelections[p]][b[1] as string].init(p,input);
        return true;
      }
      else if (player[p].timer > framesData[characterSelections[p]].WALLTECH){
        actionStates[characterSelections[p]].FALL.init(p,input);
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



export default WALLTECH;