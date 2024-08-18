import {vfxQueue} from "../vfxQueue";
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
import {makeColour} from "../makeColour";
import {activeStage} from "../../../stages/activeStage";
import vfx from "../vfxData/index";
export default (posInQueue) =>{
  if (!(vfxQueue[posInQueue].timer % 2)) {
    fg2.save();
    drawArrayPathNew( fg2
                    , makeColour(68, 0, 0, 0.75)
                    , vfxQueue[posInQueue].face
                    , ((vfxQueue[posInQueue].newPos.x-0.3) * activeStage.scale) + activeStage.offset[0]
                    , ((vfxQueue[posInQueue].newPos.y-0.3) * -activeStage.scale) + activeStage.offset[1]
                    , vfx.illusion.path
                    , 0.35 * (activeStage.scale / 4.5)
                    , 0.35 * (activeStage.scale / 4.5)
                    , 0
                    , 0
                    , 0
                    , setToScreen );
    drawArrayPathNew( fg2
                    , makeColour(0, 244, 0, 0.75)
                    , vfxQueue[posInQueue].face
                    , (vfxQueue[posInQueue].newPos.x * activeStage.scale) + activeStage.offset[0]
                    , (vfxQueue[posInQueue].newPos.y * -activeStage.scale) + activeStage.offset[1]
                    , vfx.illusion.path
                    , 0.35 * (activeStage.scale / 4.5)
                    , 0.35 * (activeStage.scale / 4.5)
                    , 0
                    , 0
                    , 0
                    , setToScreen );
    drawArrayPathNew( fg2
                    , makeColour(0, 0, 255, 0.75)
                    , vfxQueue[posInQueue].face
                    , ((vfxQueue[posInQueue].newPos.x+0.3) * activeStage.scale) + activeStage.offset[0]
                    , ((vfxQueue[posInQueue].newPos.y+0.3) * -activeStage.scale)+ activeStage.offset[1]
                    , vfx.illusion.path
                    , 0.35 * (activeStage.scale / 4.5)
                    , 0.35 * (activeStage.scale / 4.5)
                    , 0
                    , 0
                    , 0
                    , setToScreen );
    fg2.restore();
  }
};

function setToScreen () {
  fg2.globalCompositeOperation = "screen";
}