import {makeColour} from "../makeColour";
let fg2;
(async () => {
  ;
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
import {twoPi} from "../../render";
export default (posInQueue) => {
  fg2.fillStyle = makeColour(255, 254, 108, 0.9 * ((vfxQueue[posInQueue].frames - vfxQueue[posInQueue].timer) / vfxQueue[posInQueue].frames));
  fg2.beginPath();
  fg2.arc((vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0], (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + activeStage.offset[1],
      5 * (activeStage.scale / 4.5), twoPi, 0);
  fg2.fill();
};