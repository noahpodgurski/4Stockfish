import {makeColour} from "../makeColour";
import {drawArrayPath} from "../drawArrayPath";
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
import {vfxQueue} from "../vfxQueue";
import {activeStage} from "../../../stages/activeStage";
export default (posInQueue)=> {
  const col = makeColour(143, 128, 233, 0.7);
  drawArrayPath(fg2, col, vfxQueue[posInQueue].face, (vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0] + 10, (vfxQueue[posInQueue].newPos
          .y * -activeStage.scale) + activeStage.offset[1], vfxQueue[posInQueue].path1, 0.2 * (activeStage.scale / 4.5), 0.2 * (activeStage.scale /
      4.5));
  drawArrayPath(fg2, col, vfxQueue[posInQueue].face, (vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0] + 10, (vfxQueue[posInQueue].newPos
          .y * -activeStage.scale) + activeStage.offset[1], vfxQueue[posInQueue].path2, 0.2 * (activeStage.scale / 4.5), 0.2 * (activeStage.scale /
      4.5));
  fg2.save();
  fg2.translate((vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0], (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + activeStage.offset[
          1]);
  fg2.rotate(Math.PI);
  drawArrayPath(fg2, col, vfxQueue[posInQueue].face, 0, 0, vfxQueue[posInQueue].path1, 0.2 * (activeStage.scale / 4.5), 0.2 * (activeStage.scale /
      4.5));
  drawArrayPath(fg2, col, vfxQueue[posInQueue].face, 0, 0, vfxQueue[posInQueue].path2, 0.2 * (activeStage.scale / 4.5), 0.2 * (activeStage.scale /
      4.5));
  fg2.restore();
};