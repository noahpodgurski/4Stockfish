import {vfxQueue} from "../vfxQueue";
import general from "../dVfx/general";
export default (posInQueue) => {
  general(posInQueue, -Math.atan2(vfxQueue[posInQueue].facing.y,vfxQueue[posInQueue].facing.x)+Math.PI/2);
};