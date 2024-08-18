import {checkForSpecials, checkForAerials, airDrift, fastfall, playSounds, actionStates} from "../../../physics/actionStateShortcuts";
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
import {sounds} from "../../../main/sfx";
import {framesData} from '../../../main/characters';
import {drawVfx} from "../../../main/vfx/drawVfx";
import { State } from "../../State";

const JUMPAERIALF: State = {
  name : "JUMPAERIALF",
  canPassThrough : true,
  canGrabLedge : [true,false],
  wallJumpAble : true,
  headBonk : true,
  canBeGrabbed : true,
  landType : 0,
  vCancel : true,
  init : function(p,input){
    player[p].actionState = "JUMPAERIALF";
    player[p].timer = 0;
    player[p].phys.fastfalled = false;
    player[p].phys.doubleJumped = true;

    player[p].phys.cVel.y = player[p].charAttributes.fHopInitV * player[p].charAttributes.djMultiplier;

    player[p].phys.cVel.x = input[p][0].lsX * player[p].charAttributes.djMomentum;
    drawVfx({
      name: "doubleJumpRings",
      pos: player[p].phys.pos,
      face: player[p].phys.face
    });
    sounds.jump2.play();
    actionStates[characterSelections[p]].JUMPAERIALF.main!(p,input);
  },
  main : function(p,input){
    player[p].timer++;
    playSounds("JUMPAERIAL",p);
    if (!actionStates[characterSelections[p]].JUMPAERIALF.interrupt!(p,input)){
      fastfall(p,input);
      airDrift(p,input);
    }
  },
  interrupt : function(p,input){
    const a = checkForAerials(p,input);
    const b = checkForSpecials(p,input);
    if (a[0]){
      actionStates[characterSelections[p]][a[1]].init(p,input);
      return true;
    }
    else if ((input[p][0].l && !input[p][1].l) || (input[p][0].r && !input[p][1].r)){
      actionStates[characterSelections[p]].ESCAPEAIR.init(p,input);
      return true;
    }
    else if (b[0]){
      actionStates[characterSelections[p]][b[1] as string].init(p,input);
      return true;
    }
    else if (player[p].timer > framesData[characterSelections[p]].JUMPAERIALF){
      actionStates[characterSelections[p]].FALLAERIAL.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};


export default JUMPAERIALF;