import {vfxQueue} from "../vfxQueue";
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
import {activeStage} from "../../../stages/activeStage";
export default (posInQueue)=> {
  if (vfxQueue[posInQueue].timer % 2) {
    fg2.save();
    fg2.fillStyle = makeColour(255, 255, 255, 0.3);
    fg2.translate((vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0], (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + activeStage.offset[
            1]);
    const seed = (Math.random() + 1.5) * (activeStage.scale / 4.5);
    fg2.scale(seed, seed);
    for (let i = 0; i < 6; i++) {
      fg2.rotate(Math.PI / 3);
      fg2.beginPath();
      fg2.moveTo(0, -15);
      fg2.lineTo(6, -23);
      fg2.lineTo(0, -40);
      fg2.lineTo(-6, -23);
      fg2.closePath();
      fg2.fill();
    }
    fg2.restore();
  }
};