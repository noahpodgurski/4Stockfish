let pPal, palettes, characterSelections, player;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ pPal, palettes, characterSelections, player } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ pPal, palettes, characterSelections, player } = mainModule);
  }
})();
import {reduceByTraction, actionStates} from "../../../physics/actionStateShortcuts";
import {sounds} from "../../../main/sfx";
import {framesData} from '../../../main/characters';
import {blendColours} from "../../../main/vfx/blendColours";
import { State } from "../../State";

const FURASLEEPSTART: State = {
  name : "FURASLEEPSTART",
  canEdgeCancel : true,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "FURASLEEPSTART";
    player[p].timer = 0;
    player[p].phys.stuckTimer = 95+2*Math.floor(player[p].percent);
    sounds.fireweakhit.play();
    actionStates[characterSelections[p]].FURASLEEPSTART.main!(p,input);
  },
  main : function(p,input){
    let newCol;
    player[p].timer++;
    if (!actionStates[characterSelections[p]].FURASLEEPSTART.interrupt!(p,input)){
      player[p].phys.stuckTimer--;
      reduceByTraction(p,true);
      let originalColour = palettes[pPal[p]][0];
      originalColour = originalColour.substr(4,originalColour.length-5);
      const colourArray = originalColour.split(",");
      //rgb(207, 45, 190)
      const part = player[p].timer % 30;
      if (part < 25){
        player[p].colourOverlayBool = true;
        if (part < 13){
          newCol = blendColours(colourArray, [207, 45, 190], Math.min(1, part / 12));
        }
        else {
          newCol = blendColours(colourArray, [207, 45, 190], Math.max(0, 1 - (part - 12 / 12)));
        }
        player[p].colourOverlay = "rgb("+newCol[0]+","+newCol[1]+","+newCol[2]+")";
      }
      else {
        player[p].colourOverlayBool = false;
      }
    }
  },
  interrupt : function(p,input){
    if (player[p].phys.stuckTimer <= 0){
      player[p].colourOverlayBool = false;
      actionStates[characterSelections[p]].FURASLEEPEND.init(p,input);
      return true;
    }
    else if (player[p].timer > framesData[characterSelections[p]].FURASLEEPSTART){
      player[p].colourOverlayBool = false;
      actionStates[characterSelections[p]].FURASLEEPLOOP.init(p,input);
      return true;
    }
    else {
      return false;
    }
  }
};



export default FURASLEEPSTART;