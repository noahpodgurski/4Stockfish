import {getTransparency} from "../main/vfx/transparency";

let bg1, bg2, fg1, fg2, layers, gameMode;
(async () => {
  
  if (process.env.RUN_MODE === 'engine') {
    const engineModule = await import('../engine/main');
    ({ bg1, bg2, fg1, fg2, layers, gameMode } = engineModule);
  } else {
    const mainModule = await import('../main/main');
    ({ bg1, bg2, fg1, fg2, layers, gameMode } = mainModule);
  }
})();

import {rotateVector, twoPi} from "../main/render";
import {activeStage} from "../stages/activeStage";
import {Vec2D} from "../main/util/Vec2D";
import {euclideanDist} from "../main/linAlg";
import { Ledge, Stage } from "./stage";
import { scandypattern, fabric, randall } from "../images";

const bgPos = [[-30, 500, 300, 500, 900, 500, 1230, 450, 358], [-30, 400, 300, 400, 900, 400, 1230, 350, 179]];
const direction = [[1, -1, 1, -1, 1, -1, 1, -1, 1], [-1, 1, -1, 1, -1, 1, -1, 1, -1]];
export let boxFill = "rgba(0, 0, 0, 0.1)";
export let boxFillBG = "rgba(0, 0, 0, 0.1)";

export type BGStarType = {
  velocity: Vec2D;
  colour: string;
  pos: Vec2D;
  life: number;
}

export class BgStar {
  velocity: Vec2D;
  colour: string;
  pos: Vec2D;
  life: number;

  constructor() {
    const vSeed = Math.random();
    this.velocity = new Vec2D(5 * vSeed * Math.sign(0.5 - Math.random()), 5 * (1 - vSeed) * Math.sign(0.5 - Math.random()));
    if (getTransparency()) {
      this.colour = "hsl(" + 358 * Math.random() + ", 100%, 50%)";
    }
    else {
      this.colour = "hsl(" + 358 * Math.random() + ",100%,15%)";
    }
    this.pos = new Vec2D(0, 0);
    this.life = 0;
  }
};

const bgStars: BGStarType[] = [];
for (let p = 0; p < 20; p++) {
  bgStars[p] = new BgStar();
  bgStars[p].pos = new Vec2D(600 + 100 * Math.random() * bgStars[p].velocity.x, 375 + 100 * Math.random() * bgStars[p].velocity.y);
}
let bgSparkle = 3;
const gridGrad = "rgba(94,173,255,0.2)";

const circleSize: number[] = [];
for (let i = 0; i < 5; i++) {
  circleSize[i] = i * 40;
}
let ang = 0;
export let backgroundType = 0;

let randallTimer = 0;

export function drawStageInit() {
  fg1.strokeStyle = "#db80cc";
  fg1.lineWidth = 1;
  
  for (let j = 0; j < activeStage.ground.length; j++) {
    fg1.beginPath();
    fg1.moveTo((activeStage.ground[j][0].x * activeStage.scale) + activeStage.offset[0], (activeStage.ground[j][0].y * -activeStage.scale) + activeStage.offset[1]);
    fg1.lineTo((activeStage.ground[j][1].x * activeStage.scale) + activeStage.offset[0], (activeStage.ground[j][1].y * -activeStage.scale) + activeStage.offset[1]);
    fg1.closePath();
    fg1.stroke();
  }
  fg1.strokeStyle = "#ed6767";
  for (let j = 0; j < activeStage.ceiling.length; j++) {
    fg1.beginPath();
    fg1.moveTo((activeStage.ceiling[j][0].x * activeStage.scale) + activeStage.offset[0], (activeStage.ceiling[j][0].y * -activeStage.scale) + activeStage.offset[1]);
    fg1.lineTo((activeStage.ceiling[j][1].x * activeStage.scale) + activeStage.offset[0], (activeStage.ceiling[j][1].y * -activeStage.scale) + activeStage.offset[1]);
    fg1.closePath();
    fg1.stroke();
  }

  fg1.strokeStyle = "#4794c6";
  for (let j = 0; j < activeStage.platform.length; j++) {
    if (activeStage.movingPlats === null || activeStage.movingPlats === undefined || activeStage.movingPlats.indexOf(j) === -1){ // not a moving platform
      fg1.beginPath();
      fg1.moveTo((activeStage.platform[j][0].x * activeStage.scale) + activeStage.offset[0], (activeStage.platform[j][0].y * -activeStage.scale) + activeStage.offset[1]);
      fg1.lineTo((activeStage.platform[j][1].x * activeStage.scale) + activeStage.offset[0], (activeStage.platform[j][1].y * -activeStage.scale) + activeStage.offset[1]);
      fg1.closePath();
      fg1.stroke();
    }
  }
  
  fg1.strokeStyle = "#47c648";
  for (let k = 0; k < activeStage.wallL.length; k++) {
    fg1.beginPath();
    fg1.moveTo((activeStage.wallL[k][0].x * activeStage.scale) + activeStage.offset[0], (activeStage.wallL[k][0].y * -activeStage.scale) + activeStage.offset[1]);
    fg1.lineTo((activeStage.wallL[k][1].x * activeStage.scale) + activeStage.offset[0], (activeStage.wallL[k][1].y * -activeStage.scale) + activeStage.offset[1]);
    fg1.closePath();
    fg1.stroke();
  }
  fg1.strokeStyle = "#9867de";
  for (let l = 0; l < activeStage.wallR.length; l++) {
    fg1.beginPath();
    fg1.moveTo((activeStage.wallR[l][0].x * activeStage.scale) + activeStage.offset[0], (activeStage.wallR[l][0].y * -activeStage.scale) + activeStage.offset[1]);
    fg1.lineTo((activeStage.wallR[l][1].x * activeStage.scale) + activeStage.offset[0], (activeStage.wallR[l][1].y * -activeStage.scale) + activeStage.offset[1]);
    fg1.closePath();
    fg1.stroke();
  }

  fg1.strokeStyle = "#E7A44C";
  fg1.lineWidth = 2;
  for (let i = 0; i < activeStage.ledge.length; i++) {
    const e: Ledge = activeStage.ledge[i];
    const pA: Vec2D = activeStage[e[0]][e[1]][e[2]] as Vec2D;
    const pB: Vec2D = activeStage[e[0]][e[1]][1 - e[2]] as Vec2D;
    const ang = Math.atan2((pB.y - pA.y), (pB.x - pA.x));
    const magnitude = euclideanDist(pA, pB);
    const length = Math.min(0.4 * magnitude, 20 / activeStage.scale);
    const pC = new Vec2D(pA.x + length * Math.cos(ang), pA.y + length * Math.sin(ang));
    fg1.beginPath();
    fg1.moveTo((pA.x * activeStage.scale) + activeStage.offset[0], (pA.y * -activeStage.scale) + activeStage.offset[1]);
    fg1.lineTo((pC.x * activeStage.scale) + activeStage.offset[0], (pC.y * -activeStage.scale) + activeStage.offset[1]);
    fg1.closePath();
    fg1.stroke();
  }
}

const swirlTimer = 0;
const swirlSwitch = false;

const wallColour = ["rgb(255,0,40)","rgb(0,255,255)","rgb(125,125,125)","rgb(125,50,255)"];

function wallColourFromDamageType (damageType) {
  if (damageType === "fire") {
    return wallColour[0];
  }
  else if (damageType === "electric") {
    return wallColour[1];
  }
  else if (damageType === "slash") {
    return wallColour[2];
  }
  else if (damageType === "darkness") {
    return wallColour[3];
  }
  else {
    return "rgb(0,50,180)";
  }
};

let wallCycle = 0;

export function calculateDamageWallColours(){
  let a = 0;
  if (wallCycle < 240){
    wallCycle++;
    if (wallCycle > 120){
      a = 240 - wallCycle;
    } else {
      a = wallCycle;
    }
  } else {
    wallCycle = 0;
  } 
  const n = Math.round(255*a/120);
  wallColour[0] = "rgb(255,"+n+",40)";
  wallColour[1] = "rgb("+n+",255,255)";
  const m = Math.round(125+n/2);
  wallColour[2] = "rgb("+m+","+m+","+m+")";
  wallColour[3] = "rgb("+Math.round(125-n/3)+",50,"+Math.round(255-n/3)+")";
}

export function drawDamageLine(type,can,stage){
  for (let i=0;i<stage[type].length;i++) {
    const surfaceProperties = stage[type][i][2];
    if (surfaceProperties !== undefined && surfaceProperties.damageType !== null) {
      can.strokeStyle = wallColourFromDamageType(surfaceProperties.damageType);
      can.beginPath();
      can.moveTo((stage[type][i][0].x * stage.scale) + stage.offset[0], (stage[type][i][0].y * -stage.scale) + stage.offset[1]);
      can.lineTo((stage[type][i][1].x * stage.scale) + stage.offset[0], (stage[type][i][1].y * -stage.scale) + stage.offset[1]);
      can.stroke();
    }
  }
}

export function drawStage() {
  calculateDamageWallColours();
  if (activeStage.name === "ystory") {
    // Randall
    randallTimer++;
    if (randallTimer === 30){
      randallTimer = 0;
    }
    bg2.drawImage(randall[Math.floor(randallTimer/10)],(activeStage.platform[0][0].x * activeStage.scale) + activeStage.offset[0]-20, (activeStage.platform[0][0].y * -activeStage.scale) + activeStage.offset[1]-20,100,100);
  }
  else if (activeStage.movingPlats !== null && activeStage.movingPlats !== undefined && activeStage.movingPlats.length !== 0) {
    fg2.strokeStyle = "#4794c6";
    for (let i = 0; i < activeStage.movingPlats.length; i++) {
      if (activeStage.name !== "fountain" || activeStage.platform[activeStage.movingPlats[i]][0].y > 0) {
        fg2.beginPath();
        fg2.moveTo((activeStage.platform[activeStage.movingPlats[i]][0].x * activeStage.scale) + activeStage.offset[0], (activeStage.platform[activeStage.movingPlats[i]][0].y * -activeStage.scale) + activeStage.offset[1]);
        fg2.lineTo((activeStage.platform[activeStage.movingPlats[i]][1].x * activeStage.scale) + activeStage.offset[0], (activeStage.platform[activeStage.movingPlats[i]][1].y * -activeStage.scale) + activeStage.offset[1]);
        fg2.closePath();
        fg2.stroke();
      }
    }
  }
  fg2.fillStyle = boxFill;

  if (activeStage.box !== null && activeStage.box !== undefined) {
    for (let j = 0; j < activeStage.box.length; j++) {
      fg2.fillRect((activeStage.box[j].min.x * activeStage.scale) + activeStage.offset[0], (activeStage.box[j].max.y * -activeStage.scale) + activeStage.offset[1], (activeStage.box[j].max.x - activeStage.box[j].min.x) * activeStage.scale, (activeStage.box[j].max.y - activeStage.box[j].min.y) * activeStage.scale);
    }
  }
  if (activeStage.polygon !== null && activeStage.polygon !== undefined) {
    for (let j=0;j<activeStage.polygon.length;j++){
      const p = activeStage.polygon[j];
      fg2.beginPath();
      fg2.moveTo(p[0].x* activeStage.scale + activeStage.offset[0], p[0].y* -activeStage.scale + activeStage.offset[1]);
      for (let n=1;n<p.length;n++) {
        fg2.lineTo(p[n].x * activeStage.scale + activeStage.offset[0], p[n].y* -activeStage.scale + activeStage.offset[1]);
      }
      fg2.closePath();
      fg2.fill();
    }
  }
  if (activeStage.background !== null && activeStage.background !== undefined) {
    if (activeStage.background.polygon !== null && activeStage.background.polygon !== undefined) {
      bg2.save();
      bg2.fillStyle = boxFillBG;
      for (let i=0;i<activeStage.background.polygon.length;i++) {   
        const p = activeStage.background.polygon[i];
        bg2.beginPath();
        bg2.moveTo(p[0].x * activeStage.scale + activeStage.offset[0],p[0].y * -activeStage.scale + activeStage.offset[1]);
        for (let n=1;n<p.length;n++) {
          bg2.lineTo(p[n].x * activeStage.scale + activeStage.offset[0],p[n].y * -activeStage.scale + activeStage.offset[1]);
        }
        bg2.closePath();
        bg2.fill();
      }
    }
    if (activeStage.background.line !== null && activeStage.background.line !== undefined) {
      bg2.lineWidth = 3;
      bg2.strokeStyle = boxFillBG;
      for (let i=0;i<activeStage.background.line.length;i++){
        const lL = activeStage.background.line[i][0];
        const lR = activeStage.background.line[i][1];
        bg2.beginPath();
        bg2.moveTo(lL.x * activeStage.scale + activeStage.offset[0], lL.y * -activeStage.scale + activeStage.offset[1]);
        bg2.lineTo(lR.x * activeStage.scale + activeStage.offset[0], lR.y * -activeStage.scale + activeStage.offset[1]);
        bg2.closePath();
        bg2.stroke();
      }
      bg2.restore();
    }
  }

  fg2.lineWidth = 4;
  const types = ["wallL", "wallR", "ground", "ceiling"];
  for (let i=0;i<types.length;i++) {
    drawDamageLine(types[i],fg2,activeStage);
  }

  fg2.strokeStyle = "#e7a44c";
  
  const ex = 0;
};

export function setBackgroundType(val) {
  backgroundType = val;
};

export function drawBackgroundInit() {
  const bgGrad: CanvasGradient = bg1.createLinearGradient(0, 0, 0, 500);
  bgGrad.addColorStop(0, "rgb(24, 17, 66)");
  bgGrad.addColorStop(1, "black");
  bg1.fillStyle = bgGrad;
  bg1.fillRect(-100, -100, layers?.BG1?.width ?? 0 + 200, layers?.BG1?.height ?? 0 + 200);
  ;
};

export function drawBackground() {
  if (backgroundType === 0) {
    drawStars();
  }
  else {
    drawTunnel();
  }
};

export function drawTunnel() {
  bg2.lineWidth = 2;
  ang += 0.005;
  let angB = ang;
  bg2.beginPath();
  for (let i = 0; i < 16; i++) {
    const v = rotateVector(0, 800, angB);
    bg2.moveTo(600, 375);
    bg2.lineTo(600 + v.x, 375 + v.y);
    angB += Math.PI / 8;
  }
  bg2.stroke();
  for (let i = 0; i < circleSize.length; i++) {
    circleSize[i]++;
    if (circleSize[i] > 200) {
      circleSize[i] = 0;
    }
    bg2.lineWidth = Math.max(1, Math.round(3 * (circleSize[i] / 60)));
    bg2.beginPath();
    bg2.arc(600, 375, circleSize[i] * 4, 0, twoPi);
    bg2.closePath();
    bg2.stroke();
  }
};

export function drawStars() {
  bgSparkle--;
  for (let p = 0; p < 20; p++) {
    if (bgStars[p].pos.x > 1250 || bgStars[p].pos.y > 800 || bgStars[p].pos.x < -50 || bgStars[p].pos.y < -50) {
      bgStars[p].pos = new Vec2D(600, 375);
      bgStars[p].life = 0;
      const vSeed = Math.random();
      bgStars[p].velocity = new Vec2D(5 * vSeed * Math.sign(0.5 - Math.random()), 5 * (1 - vSeed) * Math.sign(0.5 - Math.random()));
    }
    bgStars[p].pos.x += bgStars[p].velocity.x;
    bgStars[p].pos.y += bgStars[p].velocity.y;

    bgStars[p].life++;

    if (bgSparkle === 0) {
      bg2.fillStyle = bgStars[p].colour;
      if (getTransparency()) {
        bg2.globalAlpha = Math.min(bgStars[p].life / 300, 1);
      }
      bg2.beginPath();
      bg2.arc(bgStars[p].pos.x, bgStars[p].pos.y, 5, twoPi, 0);
      ;
      bg2.fill();
    }
  }
  if (bgSparkle === 0) {
    bgSparkle = 2;
  }
  bg2.globalAlpha = 1;
  for (let k = 1; k > -1; k--) {
    for (let j = 0; j < 9; j++) {
      //bgPos[j] += direction[j]*5*Math.random();
      if (j === 8) {
        bgPos[k][j] += direction[k][j] * 0.2 * Math.random();
      }
      else {
        bgPos[k][j] += direction[k][j] * 1 * Math.random();
      }
      switch (j) {
        case 0:
          if ((direction[k][j] === 1 && bgPos[k][j] > -10) || (direction[k][j] === -1 && bgPos[k][j] < -200)) {
            direction[k][j] *= -1;
          }
          break;
        case 1:
          if ((direction[k][j] === 1 && bgPos[k][j] > 550 - k * 100) || (direction[k][j] === -1 && bgPos[k][j] < 450 - k * 100)) {
            direction[k][j] *= -1;
          }
          break;
        case 2:
          if ((direction[k][j] === 1 && bgPos[k][j] > 550) || (direction[k][j] === -1 && bgPos[k][j] < 0)) {
            direction[k][j] *= -1;
          }
          break;
        case 3:
          if ((direction[k][j] === 1 && bgPos[k][j] > 550 - k * 100) || (direction[k][j] === -1 && bgPos[k][j] < 450 - k * 100)) {
            direction[k][j] *= -1;
          }
          break;
        case 4:
          if ((direction[k][j] === 1 && bgPos[k][j] > 1150) || (direction[k][j] === -1 && bgPos[k][j] < 600)) {
            direction[k][j] *= -1;
          }
          break;
        case 5:
          if ((direction[k][j] === 1 && bgPos[k][j] > 550 - k * 100) || (direction[k][j] === -1 && bgPos[k][j] < 450 - k * 100)) {
            direction[k][j] *= -1;
          }
          break;
        case 6:
          if ((direction[k][j] === 1 && bgPos[k][j] > 1400) || (direction[k][j] === -1 && bgPos[k][j] < 1210)) {
            direction[k][j] *= -1;
          }
          break;
        case 7:
          if ((direction[k][j] === 1 && bgPos[k][j] > 550 - k * 100) || (direction[k][j] === -1 && bgPos[k][j] < 450 - k * 100)) {
            direction[k][j] *= -1;
          }
          break;
        case 8:
          if ((direction[k][j] === 1 && bgPos[k][j] > 357) || (direction[k][j] === -1 && bgPos[k][j] < 1)) {
            direction[k][j] *= -1;
          }
          break;
        default:
          break;
      }
    }
    if (getTransparency()) {
      boxFill = "hsla(" + bgPos[k][8] + ", 100%, 50%, " + (0.15 - k * 0.07) + ")";
      boxFillBG = "hsla(" + bgPos[k][8] + ", 100%, 50%, " + (0.13 - k * 0.07) + ")";
    }
    else {
      boxFill = "hsl(" + bgPos[k][8] + ", 100%, 7%)";
      boxFillBG = "hsl(" + bgPos[k][8] + ", 50%, 7%)";
    }
    bg2.fillStyle = boxFill;
    bg2.beginPath();
    bg2.moveTo(bgPos[k][0], bgPos[k][1]);
    bg2.bezierCurveTo(bgPos[k][2], bgPos[k][3], bgPos[k][4], bgPos[k][5], bgPos[k][6], bgPos[k][7]);
    if (k === 1) {
      bg2.lineTo(bgPos[0][6], bgPos[0][7]);
      bg2.bezierCurveTo(bgPos[0][4], bgPos[0][5], bgPos[0][2], bgPos[0][3], bgPos[0][0], bgPos[0][1]);
    }
    else {
      bg2.lineTo(1200, 750);
      bg2.lineTo(0, 750);
    }
    bg2.closePath();
    bg2.fill();
  }
};