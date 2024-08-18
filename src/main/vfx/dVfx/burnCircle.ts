let fg2;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ fg2 } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ fg2 } = mainModule);
  }
})();
import {makeColour} from "../makeColour";
import {vfxQueue} from "../vfxQueue";
import {activeStage} from "../../../stages/activeStage";
import {twoPi} from "../../../main/render";
import {blendColours} from "../blendColours";
export default (posInQueue) =>{
  //rgb(253,255,161)
  //rgb(198, 57, 5)
  const col = blendColours([253, 255, 161], [198, 57, 5], vfxQueue[posInQueue].timer / 9);
  fg2.fillStyle = makeColour(col[0], col[1], col[2], 1 - vfxQueue[posInQueue].timer / 9);
  fg2.beginPath();
  fg2.arc((vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0], ((vfxQueue[posInQueue].newPos.y + vfxQueue[posInQueue].timer) * -activeStage.scale) +
      activeStage.offset[1], 3 * activeStage.scale, 0, twoPi);
  fg2.closePath();
  fg2.fill();
};