import puff from './moves';
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
export function puffNextJump(p, input) {
  if (Math.abs(input[p][0].lsX) > 0.3 && Math.sign(input[p][0].lsX) !== player[p].phys.face) {
    puff["AERIALTURN" + (1 + player[p].phys.jumpsUsed)].init(p, input);
  }
  else {
    puff["JUMPAERIAL" + (1 + player[p].phys.jumpsUsed)].init(p, input);
  }
}
