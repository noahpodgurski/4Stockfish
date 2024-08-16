// @flow

import {Vec2D} from "../../main/util/Vec2D";
import { Surface } from "../stage";
import { Line } from './detectIntersections';

// export function extremePoint(wall : [Vec2D, Vec2D], extreme : string) : Vec2D {
export function extremePoint(wall : Surface | Line, extreme : string) : Vec2D {
  const  v1 = wall[0];
  const  v2 = wall[1];
  switch (extreme) {
    case "u":
    case "t":
      if (v2.y < v1.y) {
        return v1;
      }
      else {
        return v2;
      }
    case "d":
    case "b":
      if (v2.y > v1.y) {
        return v1;
      }
      else {
        return v2;
      }
    case "l":
      if (v2.x > v1.x) {
        return v1;
      }
      else {
        return v2;
      }
    case "r":
      if (v2.x < v1.x) {
        return v1;
      }
      else {
        return v2;
      }
    default:
      console.log( "error in 'extremePoint': invalid parameter "+extreme+", not up/top/down/bottom/left/right");
      return v1; // just to make the type checker happy
  }
};