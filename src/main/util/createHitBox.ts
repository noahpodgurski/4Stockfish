import { Vec2D } from '../util/Vec2D';

export type HitBox = {
  offset: Vec2D;
  size: number;
  dmg: number;
  angle: number;
  kg: number;
  bk: number;
  sk: number;
  type: number;
  clank: number;
  hitGrounded: number;
  hitAirborne: number;
  throwextra: boolean;
}

export class createHitbox implements HitBox {
  offset: Vec2D;
  size: number;
  dmg: number;
  angle: number;
  kg: number;
  bk: number;
  sk: number;
  type: number;
  clank: number;
  hitGrounded: number;
  hitAirborne: number;
  throwextra: boolean;

  constructor(
    offset: Vec2D,
    size: number,
    dmg: number,
    angle: number,
    kg: number,
    bk: number,
    sk: number,
    type: number,
    clank: number,
    hG: number,
    hA: number,
    throwex = false
  ) {
    this.offset = offset;
    this.size = size;
    this.dmg = dmg;
    this.angle = angle;
    this.kg = kg;
    this.bk = bk;
    this.sk = sk;
    this.type = type;
    this.clank = clank;
    this.hitGrounded = hG;
    this.hitAirborne = hA;
    this.throwextra = throwex;
  }
}
