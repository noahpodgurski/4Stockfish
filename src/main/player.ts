
import {chars} from "./characters";
import {Vec2D} from "./util/Vec2D";
import {Box2D} from "./util/Box2D";
/* eslint-disable */

//todo make all objects
export class ActiveHitbox {
  size: any;
  offset: any;
  dmg: any;
  angle: any;
  kg: any;
  bk: any;
  sk: any;
  type: any;

  constructor(size, offset, dmg, angle, kg, bk, sk, type){
    this.size = size;
    this.offset = offset;
    this.dmg = dmg;
    this.angle = angle;
    this.kg = kg;
    this.bk = bk;
    this.sk = sk;
    this.type = type;
  }
}

export class createHitboxes {
  active: any;
  frame: any;
  id: any;
  hitList: any;

  constructor() { 
    this.active = [false, false, false, false];
    this.frame = 0;
    this.id = [new ActiveHitbox(0, new Vec2D(0, 0), 0, 0, 0, 0, 0, 0), new ActiveHitbox(0, new Vec2D(0, 0), 0, 0, 0, 0,
      0, 0), new ActiveHitbox(0, new Vec2D(0, 0), 0, 0, 0, 0, 0, 0), new ActiveHitbox(0, new Vec2D(0, 0), 0, 0, 0,
      0, 0, 0)];
    this.hitList = [];
  }
}

export type PhysicsObjectType = {
  cVel: any;
  kVel: any;
  kDec: any;
  pos: any;
  posPrev: any;
  posDelta: any;
  grounded: any;
  airborneTimer: number;
  fastfalled: any;
  face: any;
  ECBp: any;
  ECB1: any;
  ECB2: any;
  onSurface: any;
  doubleJumped: any;
  shieldHP: any;
  shieldSize: any;
  shieldAnalog: any;
  shielding: any;
  shieldPosition: any;
  shieldPositionReal: any;
  shieldStun: any;
  powerShieldActive: any;
  powerShieldReflectActive: any;
  powerShielded: any;
  onLedge: any;
  ledgeSnapBoxF: any;
  ledgeSnapBoxB: any;
  ledgeRegrabTimeout: any;
  ledgeRegrabCount: any;
  hurtbox: any;
  hurtBoxState: any;
  intangibleTimer: number;
  invincibleTimer: number;
  lCancel: any;
  lCancelTimer: number;
  autoCancel: any;
  landingLagScaling: any;
  passFastfall: any;
  jabCombo: any;
  sideBJumpFlag: any;
  charging: any;
  chargeFrames: any;
  stuckTimer: number;
  techTimer: number;
  grabbedBy: any;
  grabbing: any;
  dashbuffer: any;
  jumpType: any;
  jumpSquatType: any;
  wallJumpTimer: number;
  canWallJump: any;
  upbAngleMultiplier: any;
  thrownHitbox: any;
  thrownHitboxOwner: any;
  landingMultiplier: any;
  wallJumpCount: any;
  prevFrameHitboxes: any;
  interPolatedHitbox: any;
  interPolatedHitboxPhantom: any;
  isInterpolated: any;
  facePrev: any;
  jumpsUsed: any;
  releaseFrame: any;
  vCancelTimer: number;
  shoulderLockout: any;
  inShine: any;
  jabReset: any;
  outOfCameraTimer: number;
  rollOutDistance: any;
  bTurnaroundTimer: number;
  bTurnaroundDirection: any;
  groundAngle: any;
  raptorBoost: any;
}

export class physicsObject implements PhysicsObjectType {
  cVel: any;
  kVel: any;
  kDec: any;
  pos: any;
  posPrev: any;
  posDelta: any;
  grounded: any;
  airborneTimer: number;
  fastfalled: any;
  face: any;
  ECBp: any;
  ECB1: any;
  ECB2: any;
  onSurface: any;
  doubleJumped: any;
  shieldHP: any;
  shieldSize: any;
  shieldAnalog: any;
  shielding: any;
  shieldPosition: any;
  shieldPositionReal: any;
  shieldStun: any;
  powerShieldActive: any;
  powerShieldReflectActive: any;
  powerShielded: any;
  onLedge: any;
  ledgeSnapBoxF: any;
  ledgeSnapBoxB: any;
  ledgeRegrabTimeout: any;
  ledgeRegrabCount: any;
  hurtbox: any;
  hurtBoxState: any;
  intangibleTimer: number;
  invincibleTimer: number;
  lCancel: any;
  lCancelTimer: number;
  autoCancel: any;
  landingLagScaling: any;
  passFastfall: any;
  jabCombo: any;
  sideBJumpFlag: any;
  charging: any;
  chargeFrames: any;
  stuckTimer: number;
  techTimer: number;
  grabbedBy: any;
  grabbing: any;
  dashbuffer: any;
  jumpType: any;
  jumpSquatType: any;
  wallJumpTimer: number;
  canWallJump: any;
  upbAngleMultiplier: any;
  thrownHitbox: any;
  thrownHitboxOwner: any;
  landingMultiplier: any;
  wallJumpCount: any;
  prevFrameHitboxes: any;
  interPolatedHitbox: any;
  interPolatedHitboxPhantom: any;
  isInterpolated: any;
  facePrev: any;
  jumpsUsed: any;
  releaseFrame: any;
  vCancelTimer: number;
  shoulderLockout: any;
  inShine: any;
  jabReset: any;
  outOfCameraTimer: number;
  rollOutDistance: any;
  bTurnaroundTimer: number;
  bTurnaroundDirection: any;
  groundAngle: any;
  raptorBoost: any;

  constructor(pos, face) {
    this.cVel = new Vec2D(0, 0);
    this.kVel = new Vec2D(0, 0);
    this.kDec = new Vec2D(0, 0);
    this.pos = new Vec2D(pos[0], pos[1]);
    this.posPrev = new Vec2D(0, 0);
    this.posDelta = new Vec2D(0, 0);
    this.grounded = false;
    this.airborneTimer = 0;
    this.fastfalled = false;
    this.face = face;
    this.ECBp = [new Vec2D(0, 0), new Vec2D(3, 7), new Vec2D(0, 14), new Vec2D(-3, 7)];
    this.ECB1 = [new Vec2D(0, 0), new Vec2D(3, 7), new Vec2D(0, 14), new Vec2D(-3, 7)];
    this.ECB2 = [new Vec2D(0, 0), new Vec2D(3, 7), new Vec2D(0, 14), new Vec2D(-3, 7)];
    this.onSurface = [0, 0];
    this.doubleJumped = false;
    this.shieldHP = 60;
    this.shieldSize = 0;
    this.shieldAnalog = 0;
    this.shielding = false;
    this.shieldPosition = new Vec2D(0, 0);
    this.shieldPositionReal = new Vec2D(0, 0);
    this.shieldStun = 0;
    this.powerShieldActive = false;
    this.powerShieldReflectActive = false;
    this.powerShielded = false;
    this.onLedge = -1;
    this.ledgeSnapBoxF = new Box2D([0, 5], [8, 10]);
    this.ledgeSnapBoxB = new Box2D([0, 5], [-8, 10]);
    this.ledgeRegrabTimeout = 0;
    this.ledgeRegrabCount = false;
    this.hurtbox = new Box2D([-4, 18], [4, 0]);
    this.hurtBoxState = 0;
    this.intangibleTimer = 0;
    this.invincibleTimer = 0;
    this.lCancel = false;
    this.lCancelTimer = 0;
    this.autoCancel = false;
    this.landingLagScaling = 1;
    this.passFastfall = false;
    this.jabCombo = false;
    this.sideBJumpFlag = true;
    this.charging = false;
    this.chargeFrames = 0;
    this.stuckTimer = 0;
    this.techTimer = 0;
    this.grabbedBy = -1;
    this.grabbing = -1;
    this.dashbuffer = false;
    this.jumpType = 0;
    this.jumpSquatType = 0;
    this.wallJumpTimer = 254;
    this.canWallJump = false;
    this.upbAngleMultiplier = 0;
    this.thrownHitbox = false;
    this.thrownHitboxOwner = -1;
    this.landingMultiplier = 15;
    this.wallJumpCount = 0;
    this.prevFrameHitboxes = new createHitboxes();
    this.interPolatedHitbox = [];
    this.interPolatedHitboxPhantom = [];
    this.isInterpolated = false;
    this.facePrev = 1;
    this.jumpsUsed = 0;
    this.releaseFrame = 0;
    this.vCancelTimer = 0;
    this.shoulderLockout = 0;
    this.inShine = 0;
    this.jabReset = false;
    this.outOfCameraTimer = 0;
    this.rollOutDistance = 0;
    this.bTurnaroundTimer = 0;
    this.bTurnaroundDirection = 1;
    this.groundAngle = Math.PI/2;
    this.raptorBoost = false;
  }
}

export type InputObjectType = {
  lsX: any;
  lsY: any;
  rawX: any;
  rawY: any;
  csX: any;
  csY: any;
  lA: any;
  rA: any;
  s: any;
  z: any;
  a: any;
  b: any;
  x: any;
  y: any;
  r: any;
  l: any;
  dl: any;
  dd: any;
  dr: any;
  du: any;
}

//todo make InputObject
export class inputObject implements InputObjectType {
  lsX: any;
  lsY: any;
  rawX: any;
  rawY: any;
  csX: any;
  csY: any;
  lA: any;
  rA: any;
  s: any;
  z: any;
  a: any;
  b: any;
  x: any;
  y: any;
  r: any;
  l: any;
  dl: any;
  dd: any;
  dr: any;
  du: any;

  constructor() {
    this.lsX = [0,0,0,0,0,0,0,0];
    this.lsY = [0, 0, 0, 0, 0, 0, 0, 0];
    this.rawX = [0, 0, 0, 0, 0, 0, 0, 0];
    this.rawY = [0, 0, 0, 0, 0, 0, 0, 0];
    this.csX = [0, 0, 0, 0, 0, 0, 0, 0];
    this.csY = [0, 0, 0, 0, 0, 0, 0, 0];
    this.lA = [0, 0, 0, 0, 0, 0, 0, 0];
    this.rA = [0, 0, 0, 0, 0, 0, 0, 0];
    this.s = [false, false, false, false, false, false, false, false];
    this.z = [false, false, false, false, false, false, false, false];
    this.a = [false, false, false, false, false, false, false, false];
    this.b = [false, false, false, false, false, false, false, false];
    this.x = [false, false, false, false, false, false, false, false];
    this.y = [false, false, false, false, false, false, false, false];
    this.r = [false, false, false, false, false, false, false, false];
    this.l = [false, false, false, false, false, false, false, false];
    this.dl = [false, false, false, false, false, false, false];
    this.dd = [false, false, false, false, false, false, false];
    this.dr = [false, false, false, false, false, false, false];
    this.du = [false, false, false, false, false, false, false];
  }
}

export type PlayerObjectType = {
  phys: any;
  actionState: any;
  prevActionState: any;
  timer: number;
  IASATimer: number;
  charAttributes: any;
  charHitboxes: any;
  showLedgeGrabBox: any;
  showECB: any;
  showHitbox: any;
  spawnWaitTime: any;
  hitboxes: any;
  hit: any;
  percent: any;
  stocks: any;
  miniView: any;
  miniViewPoint: Vec2D;
  miniViewSide: number;
  inCSS: any;
  furaLoopID: any;
  percentShake: any;
  shineLoop: any;
  laserCombo: any;
  rotation: any;
  rotationPoint: any;
  colourOverlay: any;
  colourOverlayBool: any;
  currentAction: any;
  currentSubaction: any;
  difficulty: any;
  lastMash: any;
  hasHit: any;
  shocked: any;
  burning: any;
}

//todo make type PlayerObject
export class playerObject implements PlayerObjectType {
  phys: any;
  actionState: any;
  prevActionState: any;
  timer: number;
  IASATimer: number;
  charAttributes: any;
  charHitboxes: any;
  showLedgeGrabBox: any;
  showECB: any;
  showHitbox: any;
  spawnWaitTime: any;
  hitboxes: any;
  hit: any;
  percent: any;
  stocks: any;
  miniView: any;
  miniViewPoint: Vec2D;
  miniViewSide: number;
  inCSS: any;
  furaLoopID: any;
  percentShake: any;
  shineLoop: any;
  laserCombo: any;
  rotation: any;
  rotationPoint: any;
  colourOverlay: any;
  colourOverlayBool: any;
  currentAction: any;
  currentSubaction: any;
  difficulty: any;
  lastMash: any;
  hasHit: any;
  shocked: any;
  burning: any;

  constructor(character, pos, face){
    this.phys = new physicsObject(pos, face);
    this.actionState = "ENTRANCE";
    this.prevActionState = "";
    this.timer = 0;
    this.IASATimer = 0;
    this.charAttributes = chars[character].attributes;
    this.charHitboxes = chars[character].hitboxes;
    this.showLedgeGrabBox = false;
    this.showECB = false;
    this.showHitbox = false;
    this.spawnWaitTime = 0;
    this.hitboxes = new createHitboxes();
    this.hit = {
      knockback: 0,
      hitlag: 0,
      hitstun: 0,
      angle: 0,
      hitPoint: new Vec2D(0, 0),
      powershield: false,
      shieldstun: 0
    };
    this.percent = 0;
    this.stocks = 4;
    this.miniView = false;
    this.miniViewPoint = new Vec2D(0, 0);
    this.miniViewSide = 0;
    this.inCSS = true;
    this.furaLoopID = 0;
    this.percentShake = new Vec2D(0, 0);
    this.shineLoop = 0;
    this.laserCombo = false;
    this.rotation = 0;
    this.rotationPoint = new Vec2D(0, 0);
    this.colourOverlay = "";
    this.colourOverlayBool = false;
    this.currentAction = "NONE";
    this.currentSubaction = "NONE";
    this.difficulty = 4;
    this.lastMash = 0;
    this.hasHit = false;
    this.shocked = 0;
    this.burning = 0;
  }
}
