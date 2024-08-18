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
import {chromaticAberration} from "../chromaticAberration";
import {Vec2D} from "../../../main/util/Vec2D";

export default (posInQueue)=> {
  const x = vfxQueue[posInQueue].newPos.x;
  const y = vfxQueue[posInQueue].newPos.y;
  const t = vfxQueue[posInQueue].timer / vfxQueue[posInQueue].frames;
  const dir = vfxQueue[posInQueue].direction;
  const col = vfxQueue[posInQueue].color;
  const offset = vfxQueue[posInQueue].offset;
  const u = (8*offset+12*t);
  const [px,py] = [(x + u*dir.x)*activeStage.scale + activeStage.offset[0], (y + u*dir.y)* -activeStage.scale + activeStage.offset[1]];;

  chromaticAberration(fg2, (c1, c2) => drawSpark(px, py, dir, c1), col, col, 0.75*(3-4*t), new Vec2D ( 0.3*dir.y*activeStage.scale, 0.3*dir.x*activeStage.scale) );
};

function drawSpark( px, py, dir, col ) {
  fg2.lineWidth = 2;
  fg2.strokeStyle = col;
  fg2.beginPath();
  fg2.moveTo(px, py);
  fg2.lineTo(px + 4*activeStage.scale*dir.x, py - 4*activeStage.scale*dir.y);
  fg2.stroke();
}