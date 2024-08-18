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

export const dancingBladeAirMobility = function(p: number, input?: any){
  player[p].phys.cVel.y -= 0.06;
  if (player[p].phys.cVel.y < -1.5){
    player[p].phys.cVel.y = -1.5;
  }
  if (player[p].phys.cVel.x > 0){
    player[p].phys.cVel.x -= 0.0025;
    if (player[p].phys.cVel.x < 0){
      player[p].phys.cVel.x = 0;
    }
  }
  else {
    player[p].phys.cVel.x += 0.0025;
    if (player[p].phys.cVel.x > 0){
      player[p].phys.cVel.x = 0;
    }
  }
};