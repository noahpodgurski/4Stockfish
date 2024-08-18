import {vfxQueue} from "../vfxQueue";
import {makeColour} from "../makeColour";
import {activeStage} from "../../../stages/activeStage";
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
import {twoPi} from "../../../main/render";
export default (posInQueue)=> {
  const x = (vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0];
  const y = (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + activeStage.offset[1];
  fg2.strokeStyle = makeColour(146, 217, 164, 0.7 * ((vfxQueue[posInQueue].frames - vfxQueue[posInQueue].timer) / vfxQueue[posInQueue].frames));
  fg2.lineWidth = 5;
  fg2.beginPath();
  fg2.arc(x, y, 15, twoPi, 0);
  fg2.closePath();
  fg2.stroke();
  fg2.lineWidth = 1;
  fg2.fillStyle = makeColour(146, 217, 164, 0.8 * ((vfxQueue[posInQueue].frames - vfxQueue[posInQueue].timer) / vfxQueue[posInQueue].frames));
  fg2.beginPath();
  fg2.moveTo(x + 3, y - 3);
  fg2.lineTo(x + 30, y);
  fg2.lineTo(x + 3, y + 3);
  fg2.lineTo(x, y + 30);
  fg2.lineTo(x - 3, y + 3);
  fg2.lineTo(x - 30, y);
  fg2.lineTo(x - 3, y - 3);
  fg2.lineTo(x, y - 30);
  fg2.closePath();
  fg2.fill();
};