import { HitBox } from './createHitBox';

export type HitBoxObject = {
  id0: HitBox;
  id1?: HitBox;
  id2?: HitBox;
  id3?: HitBox;
}
export class createHitboxObject implements HitBoxObject {
  id0: HitBox;
  id1?: HitBox;
  id2?: HitBox;
  id3?: HitBox;
  
  constructor(id0: HitBox, id1?: HitBox, id2?: HitBox, id3?: HitBox) {
    this.id0 = id0;
    this.id1 = id1;
    this.id2 = id2;
    this.id3 = id3;
  }
}