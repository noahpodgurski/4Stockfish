import {vfxQueue} from "../vfxQueue";
import {activeStage} from "../../../stages/activeStage";
import {makeColour} from "../makeColour";
import {drawArrayPathNew} from "../drawArrayPathNew";
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
import vfx from "../vfxData/index";
export default (posInQueue) =>{
  fg2.save();
  fg2.translate((vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0], (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + activeStage.offset[
          1]);
  const secondFrame = (vfxQueue[posInQueue].facing + 4) % 10;
  drawArrayPathNew(fg2, makeColour(237, 219, 53, 0.3), vfxQueue[posInQueue].face, 0, 0, vfx.firefoxcharge.path[secondFrame],
      0.35 * (activeStage.scale / 4.5), 0.5 * (activeStage.scale / 4.5), 0, 0, 0);
  drawArrayPathNew(fg2, "rgb(255, 218, 163)", vfxQueue[posInQueue].face, 0, 0, vfx.firefoxcharge.path[vfxQueue[posInQueue].facing], 0.35 *
      (activeStage.scale / 4.5), 0.5 * (activeStage.scale / 4.5), 0, 0, 0);
  fg2.restore();
};