let player;
(async () => {
  ;
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../engine/main');
    ({ player } = engineModule);
  } else {
    const mainModule = await import('../../main/main');
    ({ player } = mainModule);
  }
})();
export function dancingBladeCombo (p, min, max, input){
  if (player[p].timer > 1){
    if ((input[p][0].a && !input[p][1].a) || (input[p][0].b && !input[p][1].b) && !player[p].phys.dancingBladeDisable){
      if (player[p].timer < min){
        player[p].phys.dancingBladeDisable = true;
      }
      else if (player[p].timer <= max){
        player[p].phys.dancingBlade = true;
      }
    }
  }
}