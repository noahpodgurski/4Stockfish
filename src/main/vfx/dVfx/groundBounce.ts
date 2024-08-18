import {vfxQueue} from "../vfxQueue";
import general from "./general";
export default (posInQueue) =>{
  general(posInQueue, Math.PI/2-vfxQueue[posInQueue].facing);
};