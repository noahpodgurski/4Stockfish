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
export default (posInQueue) => {
  fg2.fillStyle = makeColour(73, 255, 244, 0.9 * ((vfxQueue[posInQueue].frames - vfxQueue[posInQueue].timer) / vfxQueue[posInQueue].frames));
  fg2.beginPath();
  fg2.arc((vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0], (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + 430, (10 + (3 *
      vfxQueue[posInQueue].timer)) * (activeStage.scale / 4.5), twoPi, 0);
  fg2.fill();
  fg2.fillStyle = "#cd8eff";
  for (let k = 0; k < 3; k++) {
    fg2.beginPath();
    fg2.arc((vfxQueue[posInQueue].newPos.x * activeStage.scale) + 550 + Math.random() * 100, (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + 380 +
        Math.random() * 100, 8 * (activeStage.scale / 4.5), twoPi, 0);
    fg2.fill();
  }
};