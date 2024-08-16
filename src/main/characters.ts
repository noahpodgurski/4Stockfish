/* eslint-disable */
export const CHARIDS = {
    MARTH_ID : 0,
    PUFF_ID : 1,
    FOX_ID : 2,
    FALCO_ID : 3,
    FALCON_ID : 4
};


export let chars: charObject[] = [];
export function setChars(index,val){
  chars[index] = val;
}
export const hitboxes: any[] = [];
export function setHitBoxes(index,val){
  hitboxes[index] = val;
}

export const offsets: any[] = [];
 export function setOffsets(charId,val){
 offsets[charId] = val;
 }
 export const charAttributes: any[] = [];
 export function setCharAttributes(charId,val){
 charAttributes[charId] = val;
 }
 export const intangibility: any[] = [];
 export function setIntangibility(charId,val){
 intangibility[charId] =val;
 }
 export const framesData: any[] = [];
 export function setFrames(charId,val){
 framesData[charId] = val;
 }
 export const actionSounds: any[] = [];
 export function setActionSounds(charId,val){
 actionSounds[charId] =val;
 }
export class charObject {
  attributes: any;
  animations: any;
  hitboxes: any;

  constructor(num){
    this.attributes = charAttributes[num];
    this.animations = 0;
    this.hitboxes = hitboxes[num];
  }
}

export const ecb: any = [];

export function getEcB(index){
  return ecb[index];
}

export function setEcbData(index,val){
  ecb[index] = val;
}