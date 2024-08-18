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
  fg2.strokeStyle = makeColour(255, 227, 79, 1 - (vfxQueue[posInQueue].timer / 5));
  fg2.lineWidth = 1;
  fg2.beginPath();
  fg2.arc((vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0], (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + activeStage.offset[1],
      vfxQueue[posInQueue].face * (vfxQueue[posInQueue].timer / 5), 0, twoPi);
  fg2.closePath();
  fg2.stroke();
};