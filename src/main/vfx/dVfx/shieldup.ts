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
export default (posInQueue)=> {
  fg2.strokeStyle = makeColour(255, 255, 255, 0.8 * ((vfxQueue[posInQueue].frames - vfxQueue[posInQueue].timer) / vfxQueue[posInQueue].frames));
  fg2.lineWidth = 10;
  fg2.beginPath();
  fg2.arc((vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0], (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + activeStage.offset[1],
      vfxQueue[posInQueue].facing * activeStage.scale + 10 + (5 * (vfxQueue[posInQueue].timer - 1)), twoPi, 0);
  fg2.stroke();
  fg2.lineWidth = 5;
  fg2.beginPath();
  fg2.arc((vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0], (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + activeStage.offset[1],
      vfxQueue[posInQueue].facing * activeStage.scale + (5 * (vfxQueue[posInQueue].timer - 1)), twoPi, 0);
  fg2.stroke();
  fg2.lineWidth = 1;
};