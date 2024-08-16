import { Vec2D } from "./Vec2D";

export type Segment2DType = {
  x: number;
  y: number;
  vecx: number;
  vecy: number;
  segLength: () => number;
  project: (segOnto: Segment2DType) => Vec2D;
}

export class Segment2D implements Segment2DType {
  x: number;
  y: number;
  vecx: number;
  vecy: number;

  constructor(x: number, y: number, vecx: number, vecy: number) {
    this.x = x;
    this.y = y;
    this.vecx = vecx;
    this.vecy = vecy;
  }

  segLength(): number {
    const dx: number = this.vecx;
    const dy: number = this.vecy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  project(segOnto: Segment2DType): Vec2D {
    const vec = new Vec2D(this.vecx, this.vecy);
    const onto = new Vec2D(segOnto.vecx, segOnto.vecy);
    const d = onto.dot(onto);
    if (d > 0) {
      const dp = vec.dot(onto);
      const multiplier = dp / d;
      const rx = onto.x * multiplier;
      const ry = onto.y * multiplier;
      return new Vec2D(rx, ry);
    }
    return new Vec2D(0, 0);
  }
}
