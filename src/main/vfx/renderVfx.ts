import {vfxQueue,dropFromVfxQueue} from "./vfxQueue";
import {isShowSFX, dVfx} from "../vfx";

export function renderVfx (otherFrame=false){
  let altFrame = otherFrame;
  altFrame = altFrame || false;
  const popQueue: number[] = [];
  for (let posInQueue = 0; posInQueue < vfxQueue.length; posInQueue++) {
    vfxQueue[posInQueue].timer++;
    if (vfxQueue[posInQueue].frames >= vfxQueue[posInQueue].timer) {
      if (isShowSFX() || vfxQueue[posInQueue].name === "start") {
        if (!altFrame) {
          dVfx[vfxQueue[posInQueue].name](posInQueue);
        }
        // if 30fps mode on the other frame, still call swing function but just don't draw
        else if (vfxQueue[posInQueue].name === "swing") {
          dVfx.swing(posInQueue, false);
        }
      }
    } else {
      popQueue.push(posInQueue);
    }
  }
  for (let k = 0; k < popQueue.length; k++) {
    dropFromVfxQueue(popQueue[k] - k, 1);
  }
}