
import WAIT from "../../shared/moves/WAIT";
import CATCHCUT from "../../shared/moves/CATCHCUT";
import {framesData} from "../../../main/characters";
let characterSelections, player;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../../../engine/main');
    ({ characterSelections, player } = engineModule);
  } else {
    const mainModule = await import('../../../main/main');
    ({ characterSelections, player } = mainModule);
  }
})();
import {articles} from "../../../physics/article";
import {sounds} from "../../../main/sfx";
import {turnOffHitboxes, actionStates} from "../../../physics/actionStateShortcuts";

import {hitQueue} from '../../../physics/hitDetection';
import {drawVfx} from "../../../main/vfx/drawVfx";
import {Vec2D} from "../../../main/util/Vec2D";
import { State } from "../../State";

const THROWUP: State = {
  name : "THROWUP",
  canEdgeCancel : false,
  canBeGrabbed : true,
  init : function(p,input){
    player[p].actionState = "THROWUP";
    player[p].timer = 0;
    actionStates[characterSelections[player[p].phys.grabbing]].THROWNFALCOUP.init(player[p].phys.grabbing,input);
    turnOffHitboxes(p);
    const frame = framesData[characterSelections[player[p].phys.grabbing]].THROWNFALCOUP;
    player[p].phys.releaseFrame = frame+1;
    player[p].hitboxes.id[0] = player[p].charHitboxes.throwup.id0;
    this.main!(p,input);
  },
  main : function(p,input){
    const prevFrame = player[p].timer;
    player[p].timer+=7/player[p].phys.releaseFrame;
    if (!this.interrupt!(p,input)){
      if (prevFrame < 14 && player[p].timer >= 14){
        sounds.foxlasercock.play();
      }
      if (prevFrame < 18 && player[p].timer >= 18){
        articles.LASER.init({
          p: p,
          x: 0,
          y: 18,
          rotate: Math.PI / 2,
          isFox: false
        });
        sounds.foxlaserfire.play();
        drawVfx({
          name:"laser",
          pos:new Vec2D(player[p].phys.pos.x+(0*player[p].phys.face),player[p].phys.pos.y+18),
          face:player[p].phys.face,
          f:Math.PI/2,
          color1:{r:137, g:255, b:255},
          color2:{r:157, g:255, b:255}
        });
      }
      else if (prevFrame < 20 && player[p].timer >= 20){
        articles.LASER.init({
          p: p,
          x: 0,
          y: 18,
          rotate: Math.PI / 2,
          isFox: false
        });
        // rotate 90
        sounds.foxlaserfire.play();
        drawVfx({
          name:"laser",
          pos:new Vec2D(player[p].phys.pos.x+(0*player[p].phys.face),player[p].phys.pos.y+18),
          face:player[p].phys.face,
          f:Math.PI/2,
          color1:{r:137, g:255, b:255},
          color2:{r:157, g:255, b:255}
        });
      }
      else if (prevFrame < 24 && player[p].timer >= 24){
        articles.LASER.init({
          p: p,
          x: 0,
          y: 18,
          rotate: Math.PI / 2,
          isFox: false
        });
        sounds.foxlaserfire.play();
        drawVfx({
          name:"laser",
          pos:new Vec2D(player[p].phys.pos.x+(0*player[p].phys.face),player[p].phys.pos.y+18),
          face:player[p].phys.face,
          f:Math.PI/2,
          color1:{r:137, g:255, b:255},
          color2:{r:157, g:255, b:255}
        });
      }
      else if (prevFrame < 33 && player[p].timer >= 33){
        sounds.foxlaserholster.play();
      }
      if (Math.floor(player[p].timer+0.01) >= 7 && Math.floor(prevFrame+0.01) < 7){
        hitQueue.push([player[p].phys.grabbing,p,0,false,true,false]);
        turnOffHitboxes(p);
      }

    }
  },
  interrupt : function(p,input){
    if (player[p].timer > 38){
      player[p].phys.grabbing = -1;
      WAIT.init(p,input);
      return true;
    }
    else {
      const grabbing = player[p].phys.grabbing;
      if(grabbing === -1){
        return;
      }
      if (player[p].timer < player[p].phys.releaseFrame && player[grabbing].phys.grabbedBy !== p){
        CATCHCUT.init(p,input);
        return true;
      }
      else {
        return false;
      }
    }
  }
};


export default THROWUP;