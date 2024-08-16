export let vfxQueue: any[] = [];

export function resetVfxQueue  (){
  vfxQueue =[];
}

export function addToVfxQueue(val){
  vfxQueue.push(val);
}

export function dropFromVfxQueue(start,count){
  vfxQueue.splice(start,count);
}