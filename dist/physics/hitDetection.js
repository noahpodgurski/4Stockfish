"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phantomQueue = exports.hitQueue = void 0;
exports.resetHitQueue = resetHitQueue;
exports.setPhantonQueue = setPhantonQueue;
exports.hitDetect = hitDetect;
exports.setHasHit = setHasHit;
exports.hitHitCollision = hitHitCollision;
exports.interpolatedHitHitCollision = interpolatedHitHitCollision;
exports.hitShieldCollision = hitShieldCollision;
exports.interpolatedHitCircleCollision = interpolatedHitCircleCollision;
exports.segmentSegmentCollision = segmentSegmentCollision;
exports.interpolatedHitHurtCollision = interpolatedHitHurtCollision;
exports.hitHurtCollision = hitHurtCollision;
exports.cssHits = cssHits;
exports.executeShieldHit = executeShieldHit;
exports.bluntHit = bluntHit;
exports.executeRegularHit = executeRegularHit;
exports.hitEffectsAndSound = hitEffectsAndSound;
exports.hitEffect = hitEffect;
exports.executeHits = executeHits;
exports.executeGrabHits = executeGrabHits;
exports.executeGrabTech = executeGrabTech;
exports.getKnockback = getKnockback;
exports.getLaunchAngle = getLaunchAngle;
exports.getHorizontalVelocity = getHorizontalVelocity;
exports.getVerticalVelocity = getVerticalVelocity;
exports.getHorizontalDecay = getHorizontalDecay;
exports.getVerticalDecay = getVerticalDecay;
exports.getHitstun = getHitstun;
exports.knockbackSounds = knockbackSounds;
exports.checkPhantoms = checkPhantoms;
const main_1 = require("main/main");
const settings_1 = require("settings");
const sfx_1 = require("main/sfx");
const actionStateShortcuts_1 = require("physics/actionStateShortcuts");
const drawVfx_1 = require("main/vfx/drawVfx");
const Vec2D_1 = require("../main/util/Vec2D");
const linAlg_1 = require("../main/linAlg");
const environmentalCollision_1 = require("./environmentalCollision");
const interpolatedCollision_1 = require("./interpolatedCollision");
/* eslint-disable */
exports.hitQueue = [];
function resetHitQueue() {
    exports.hitQueue = [];
}
exports.phantomQueue = [];
function setPhantonQueue(val) {
    exports.phantomQueue = val;
}
const angleConversion = Math.PI / 180;
function hitDetect(p, input) {
    var attackerClank = false;
    for (var i = 0; i < 4; i++) {
        if (main_1.playerType[i] > -1) {
            if (i != p) {
                // check if victim is already in hitList
                var inHitList = false;
                for (var k = 0; k < main_1.player[p].hitboxes.hitList.length; k++) {
                    if (i == main_1.player[p].hitboxes.hitList[k]) {
                        inHitList = true;
                        break;
                    }
                }
                if (!inHitList) {
                    var storedPhantom = -1;
                    for (var j = 0; j < 4; j++) {
                        if (main_1.player[p].hitboxes.active[j] && main_1.player[p].phys.prevFrameHitboxes.active[j]) {
                            var interpolate = true;
                        }
                        else {
                            var interpolate = false;
                        }
                        if (main_1.player[p].hitboxes.active[j] && !(main_1.player[p].phys.thrownHitbox && main_1.player[p].phys.thrownHitboxOwner ==
                            i) && main_1.player[p].hitboxes.id[j].type != 7) {
                            //console.log(player[i].phys.shielding);
                            // clank == 6 means special clank
                            if (main_1.player[p].hitboxes.id[j].clank == 1 || (main_1.player[p].hitboxes.id[j].clank == 2 && main_1.player[p].phys.grounded) ||
                                main_1.player[p].hitboxes.id[j].clank == 6) {
                                for (var k = 0; k < 4; k++) {
                                    if (main_1.player[i].hitboxes.active[k] && (main_1.player[i].hitboxes.id[k].clank == 1 || (main_1.player[i].hitboxes.id[k].clank == 2 && main_1.player[i].phys.grounded) || (main_1.player[p].hitboxes.id[j].clank == 6 && main_1.player[i]
                                        .hitboxes.id[k].clank != 6))) {
                                        var clankHit = interpolate && main_1.player[i].phys.prevFrameHitboxes.active[k]
                                            ? interpolatedHitHitCollision(i, p, j, k)
                                            : hitHitCollision(i, p, j, k); // also need to do interpolated vs non-interpolated hitboxes
                                        if (clankHit[0]) {
                                            var diff = main_1.player[p].hitboxes.id[j].dmg - main_1.player[i].hitboxes.id[k].dmg;
                                            if (main_1.player[p].hitboxes.id[j].clank == 6) {
                                                attackerClank = true;
                                                (0, drawVfx_1.drawVfx)({
                                                    name: "clank",
                                                    pos: clankHit[1]
                                                });
                                                main_1.player[p].phys.hurtBoxState = 1;
                                                main_1.player[p].phys.intangibleTimer = 1;
                                                // double check still in action state for some weird case
                                                if (actionStateShortcuts_1.actionStates[main_1.characterSelections[p]][main_1.player[p].actionState].specialClank) {
                                                    actionStateShortcuts_1.actionStates[main_1.characterSelections[p]][main_1.player[p].actionState].onClank(p, input);
                                                }
                                            }
                                            else {
                                                if (diff >= 9) {
                                                    // victim clank
                                                    // attacker cut through
                                                    main_1.player[i].hit.hitlag = Math.floor(main_1.player[p].hitboxes.id[j].dmg * (1 / 3) + 3);
                                                    (0, actionStateShortcuts_1.turnOffHitboxes)(i);
                                                    actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].CATCHCUT.init(i, input);
                                                }
                                                else if (diff <= -9) {
                                                    // attacker clank
                                                    // victim cut through
                                                    main_1.player[p].hit.hitlag = Math.floor(main_1.player[i].hitboxes.id[k].dmg * (1 / 3) + 3);
                                                    attackerClank = true;
                                                    (0, actionStateShortcuts_1.turnOffHitboxes)(p);
                                                    actionStateShortcuts_1.actionStates[main_1.characterSelections[p]].CATCHCUT.init(p, input);
                                                }
                                                else {
                                                    // both clank
                                                    main_1.player[i].hit.hitlag = Math.floor(main_1.player[p].hitboxes.id[j].dmg * (1 / 3) + 3);
                                                    main_1.player[p].hit.hitlag = Math.floor(main_1.player[i].hitboxes.id[k].dmg * (1 / 3) + 3);
                                                    attackerClank = true;
                                                    (0, actionStateShortcuts_1.turnOffHitboxes)(i);
                                                    actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].CATCHCUT.init(i, input);
                                                    (0, actionStateShortcuts_1.turnOffHitboxes)(p);
                                                    actionStateShortcuts_1.actionStates[main_1.characterSelections[p]].CATCHCUT.init(p, input);
                                                }
                                                sfx_1.sounds.clank.play();
                                                (0, drawVfx_1.drawVfx)({
                                                    name: "clank",
                                                    pos: clankHit[1]
                                                });
                                                main_1.player[p].hitboxes.hitList.push(i);
                                                main_1.player[p].hasHit = true;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                            if (!attackerClank) {
                                if (main_1.player[i].phys.shielding && main_1.player[p].hitboxes.id[j].hitGrounded && (hitShieldCollision(i, p, j, false) || (interpolate && (hitShieldCollision(i, p, j, true) || interpolatedHitCircleCollision(main_1.player[i].phys.shieldPositionReal, main_1.player[i].phys.shieldSize, p, j))))) {
                                    exports.hitQueue.push([i, p, j, true, false, false]);
                                    main_1.player[p].hitboxes.hitList.push(i);
                                    setHasHit(p, j);
                                    break;
                                }
                                else if (main_1.player[i].phys.hurtBoxState != 1) {
                                    //
                                    if ((main_1.player[p].hitboxes.id[j].hitGrounded && main_1.player[i].phys.grounded) || (main_1.player[p].hitboxes.id[j].hitAirborne &&
                                        !main_1.player[i].phys.grounded))
                                        if (hitHurtCollision(i, p, j, false) || (interpolate && (interpolatedHitHurtCollision(i, p, j) ||
                                            hitHurtCollision(i, p, j, true)))) {
                                            if (!hitHurtCollision(i, p, j, false, true) && (interpolate ? !interpolatedHitHurtCollision(i, p, j, true) : true)) {
                                                storedPhantom = j;
                                            }
                                            else {
                                                exports.hitQueue.push([i, p, j, false, false, false, false]);
                                                if (main_1.player[p].hitboxes)
                                                    if (main_1.player[p].hitboxes.hitList)
                                                        if (main_1.player[p].hitboxes.hitList instanceof Array)
                                                            main_1.player[p].hitboxes.hitList.push(i);
                                                setHasHit(p, j);
                                                break;
                                            }
                                        }
                                }
                            }
                        }
                        if (storedPhantom > -1) {
                            exports.hitQueue.push([i, p, storedPhantom, false, false, false, true]);
                            main_1.player[p].hitboxes.hitList.push(i);
                            setHasHit(p, storedPhantom);
                        }
                    }
                }
            }
        }
    }
}
function setHasHit(p, j) {
    // for turbo mode. if not a grab and not counter and not a midthrow hitbox.
    if (main_1.player[p].hitboxes.id[j].type != 2 && main_1.player[p].hitboxes.id[j].type != 6 && main_1.player[p].actionState.substr(0, 5) !=
        "THROW") {
        main_1.player[p].hasHit = true;
    }
}
function hitHitCollision(i, p, j, k) {
    let framePos1 = main_1.player[p].hitboxes.frame;
    if (framePos1 > 1) {
        framePos1 = 1;
    }
    let framePos2 = main_1.player[i].hitboxes.frame;
    if (framePos2 > 1) {
        framePos2 = 1;
    }
    var hbpos = new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (main_1.player[p].hitboxes.id[j].offset[framePos1].x * main_1.player[p].phys.face), main_1.player[p].phys.pos.y + main_1.player[p].hitboxes.id[j].offset[framePos1].y);
    var hbpos2 = new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x + (main_1.player[i].hitboxes.id[k].offset[framePos2].x * main_1.player[i].phys.face), main_1.player[i].phys.pos.y + main_1.player[i].hitboxes.id[k].offset[framePos2].y);
    var hitPoint = new Vec2D_1.Vec2D((hbpos.x + hbpos2.x) / 2, (hbpos.y + hbpos2.y) / 2);
    return [Math.pow(hbpos2.x - hbpos.x, 2) + Math.pow(hbpos.y - hbpos2.y, 2)
            <= Math.pow(main_1.player[p].hitboxes.id[j].size + main_1.player[i].hitboxes.id[k].size, 2),
        hitPoint];
}
function interpolatedHitHitCollision(i, p, j, k) {
    const h1p = new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x + (main_1.player[p].phys.prevFrameHitboxes.id[j].offset[main_1.player[p].phys.prevFrameHitboxes.frame].x * main_1.player[p].phys.facePrev), main_1.player[p].phys.posPrev.y + main_1.player[p].phys.prevFrameHitboxes.id[j].offset[main_1.player[p].phys.prevFrameHitboxes.frame].y);
    const h2p = new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (main_1.player[p].hitboxes.id[j].offset[main_1.player[p].hitboxes.frame].x * main_1.player[p].phys.face), main_1.player[p].phys.pos.y + main_1.player[p].hitboxes.id[j].offset[main_1.player[p].hitboxes.frame].y);
    const h1i = new Vec2D_1.Vec2D(main_1.player[i].phys.posPrev.x + (main_1.player[i].phys.prevFrameHitboxes.id[k].offset[main_1.player[i].phys.prevFrameHitboxes.frame].x * main_1.player[i].phys.facePrev), main_1.player[i].phys.posPrev.y + main_1.player[i].phys.prevFrameHitboxes.id[k].offset[main_1.player[i].phys.prevFrameHitboxes.frame].y);
    const h2i = new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x + (main_1.player[i].hitboxes.id[k].offset[main_1.player[i].hitboxes.frame].x * main_1.player[p].phys.face), main_1.player[i].phys.pos.y + main_1.player[i].hitboxes.id[k].offset[main_1.player[i].hitboxes.frame].y);
    const r = main_1.player[p].hitboxes.id[j].size;
    const s = main_1.player[i].hitboxes.id[k].size;
    const collision = (0, interpolatedCollision_1.sweepCircleVsSweepCircle)(h1p, r, h2p, r, h1i, s, h2i, s);
    if (collision === null) {
        return [false, null];
    }
    else {
        return [true, collision];
    }
}
function hitShieldCollision(i, p, j, previous) {
    if (previous) {
        let checkPreviousFrame = main_1.player[p].phys.prevFrameHitboxes.frame;
        if (checkPreviousFrame > 1) {
            checkPreviousFrame = 1;
        }
        var hbpos = new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x + (main_1.player[p].phys.prevFrameHitboxes.id[j].offset[checkPreviousFrame].x * main_1.player[p].phys.facePrev), main_1.player[p].phys.posPrev.y + main_1.player[p].phys.prevFrameHitboxes.id[j].offset[checkPreviousFrame].y);
    }
    else {
        let checkFrame = main_1.player[p].hitboxes.frame;
        if (checkFrame > 1) {
            checkFrame = 1;
        }
        var hbpos = new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (main_1.player[p].hitboxes.id[j].offset[checkFrame].x *
            main_1.player[p].phys.face), main_1.player[p].phys.pos.y + main_1.player[p].hitboxes.id[j].offset[checkFrame].y);
    }
    var shieldpos = main_1.player[i].phys.shieldPositionReal;
    return (Math.pow(shieldpos.x - hbpos.x, 2) + Math.pow(hbpos.y - shieldpos.y, 2) <= Math.pow(main_1.player[p].hitboxes.id[j]
        .size + main_1.player[i].phys.shieldSize, 2));
}
function interpolatedHitCircleCollision(circlePos, r, p, j) {
    let prevPosFrame = main_1.player[p].phys.prevFrameHitboxes.frame;
    if (prevPosFrame > 1) {
        prevPosFrame = 1;
    }
    let posFrame = main_1.player[p].hitboxes.frame;
    if (posFrame > 1) {
        posFrame = 1;
    }
    var h1 = new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x + (main_1.player[p].phys.prevFrameHitboxes.id[j].offset[prevPosFrame].x * main_1.player[p].phys.facePrev), main_1.player[p].phys.posPrev.y + main_1.player[p].phys.prevFrameHitboxes.id[j].offset[prevPosFrame].y);
    var h2 = new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (main_1.player[p].hitboxes.id[j].offset[posFrame].x * main_1.player[p].phys
        .face), main_1.player[p].phys.pos.y + main_1.player[p].hitboxes.id[j].offset[posFrame].y);
    const s = main_1.player[p].hitboxes.id[j].size;
    const collision = (0, interpolatedCollision_1.sweepCircleVsSweepCircle)(h1, s, h2, s, circlePos, r, circlePos, r);
    if (collision === null) {
        return false;
    }
    else {
        return true;
    }
}
function segmentSegmentCollision(a1, a2, b1, b2) {
    var intersection = new Vec2D_1.Vec2D(0, 0);
    var b = new Vec2D_1.Vec2D(a2.x - a1.x, a2.y - a1.y);
    var d = new Vec2D_1.Vec2D(b2.x - b1.x, b2.y - b1.y);
    var bDotDPerp = b.x * d.y - b.y * d.x;
    // if b dot d == 0, it means the lines are parallel so have infinite intersection points
    if (bDotDPerp == 0) {
        return false;
    }
    var c = new Vec2D_1.Vec2D(b1.x - a1.x, b1.y - a1.y);
    var t = (c.x * d.y - c.y * d.x) / bDotDPerp;
    if (t < 0 || t > 1) {
        return false;
    }
    var u = (c.x * b.y - c.y * b.x) / bDotDPerp;
    if (u < 0 || u > 1) {
        return false;
    }
    intersection = new Vec2D_1.Vec2D(a1.x + t * b.x, a1.y + t * b.y);
    return true;
}
function interpolatedHitHurtCollision(i, p, j, phantom = false) {
    const hurt = main_1.player[i].phys.hurtbox;
    let hb;
    if (phantom) {
        hb = main_1.player[p].phys.interPolatedHitbox[j];
    }
    else {
        hb = main_1.player[p].phys.interPolatedHitboxPhantom[j];
    }
    const h1 = new Vec2D_1.Vec2D(0.5 * hb[0].x + 0.5 * hb[3].x, 0.5 * hb[0].y + 0.5 * hb[3].y);
    const h2 = new Vec2D_1.Vec2D(0.5 * hb[1].x + 0.5 * hb[2].x, 0.5 * hb[1].y + 0.5 * hb[2].y);
    const r = 0.5 * (0, linAlg_1.euclideanDist)(hb[0], hb[3]);
    const collision = (0, interpolatedCollision_1.sweepCircleVsAABB)(h1, r, h2, r, hurt.min, hurt.max);
    if (collision === null) {
        return false;
    }
    else {
        return true;
    }
}
function hitHurtCollision(i, p, j, previous, phantom = false) {
    let playerframe = main_1.player[p].hitboxes.frame;
    if (playerframe > 1) {
        playerframe = 1;
    }
    var offset = main_1.player[p].hitboxes.id[j].offset[playerframe];
    if (offset === undefined) {
        return false;
    }
    if (main_1.player[p].actionState == "DAMAGEFLYN") {
        offset = main_1.player[p].hitboxes.id[j].offset[0];
    }
    if (previous) {
        let prevframe = main_1.player[p].phys.prevFrameHitboxes.frame;
        if (prevframe > 1) {
            prevframe = 1;
        }
        const prevoffset = main_1.player[p].phys.prevFrameHitboxes.id[j].offset[prevframe];
        if (prevoffset === undefined) {
            return false;
        }
        var hbpos = new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x + (prevoffset.x * main_1.player[p].phys.facePrev), main_1.player[p].phys.posPrev.y + prevoffset.y);
    }
    else {
        var hbpos = new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (offset.x * main_1.player[p].phys.face), main_1.player[p].phys.pos.y + offset.y);
    }
    var hurtCenter = new Vec2D_1.Vec2D((main_1.player[i].phys.hurtbox.min.x + main_1.player[i].phys.hurtbox.max.x) / 2, (main_1.player[i].phys.hurtbox
        .min.y + main_1.player[i].phys.hurtbox.max.y) / 2);
    var distance = new Vec2D_1.Vec2D(Math.abs(hbpos.x - hurtCenter.x), Math.abs(hbpos.y - hurtCenter.y));
    var hurtWidth = 8;
    var hurtHeight = 18;
    if (distance.x > (hurtWidth / 2 + main_1.player[p].hitboxes.id[j].size - (phantom ? settings_1.gameSettings.phantomThreshold : 0))) {
        return false;
    }
    if (distance.y > (hurtHeight / 2 + main_1.player[p].hitboxes.id[j].size - (phantom ? settings_1.gameSettings.phantomThreshold : 0))) {
        return false;
    }
    if (distance.x <= (hurtWidth / 2)) {
        return true;
    }
    if (distance.y <= (hurtHeight / 2)) {
        return true;
    }
    var cornerDistance_sq = Math.pow(distance.x - hurtWidth / 2, 2) +
        Math.pow(distance.y - hurtHeight / 2, 2);
    return (cornerDistance_sq <= (Math.pow(main_1.player[p].hitboxes.id[j].size - (phantom ? settings_1.gameSettings.phantomThreshold : 0), 2)));
}
function cssHits(input) {
    for (var i = 0; i < exports.hitQueue.length; i++) {
        var v = exports.hitQueue[i][0];
        if (v === -1) {
            continue;
        }
        var a = exports.hitQueue[i][1];
        var h = exports.hitQueue[i][2];
        var shieldHit = exports.hitQueue[i][3];
        var isThrow = exports.hitQueue[i][4];
        var drawBounce = exports.hitQueue[i][5];
        var phantom = exports.hitQueue[i][6] || false;
        let frame = main_1.player[i].hitboxes.frame;
        if (frame > 1) {
            frame = 1;
        }
        const damage = main_1.player[a].hitboxes.id[h].dmg;
        if (shieldHit) {
            sfx_1.sounds.blunthit.play();
            main_1.player[v].hit.hitlag = Math.floor(damage * (1 / 3) + 3);
            if (main_1.player[v].phys.powerShieldActive) {
                main_1.player[v].phys.powerShielded = true;
                main_1.player[v].hit.powershield = true;
                (0, drawVfx_1.drawVfx)({
                    name: "impactLand",
                    pos: main_1.player[v].phys.pos,
                    face: main_1.player[v].phys.face
                });
                (0, drawVfx_1.drawVfx)({
                    name: "powershield",
                    pos: main_1.player[v].phys.shieldPositionReal,
                    face: main_1.player[v].phys.face
                });
                sfx_1.sounds.powershield.play();
            }
            main_1.player[v].hit.shieldstun = ((Math.floor(damage) * ((0.65 * (1 - ((main_1.player[v].phys.shieldAnalog - 0.3) / 0.7))) +
                0.3)) * 1.5) + 2;
        }
        else {
            // player[a].rpsPoints++; // what is this???
            main_1.player[v].hit.hitlag = Math.floor(damage * (1 / 3) + 3);
            main_1.player[v].hit.knockback = getKnockback(main_1.player[a].hitboxes.id[h], damage, damage, 0, main_1.player[v].charAttributes.weight, false, false);
            main_1.player[v].hit.hitPoint = new Vec2D_1.Vec2D(main_1.player[a].phys.pos.x + (main_1.player[a].hitboxes.id[h].offset[frame].x * main_1.player[a].phys.face), main_1.player[a].phys.pos.y + main_1.player[a].hitboxes.id[h].offset[frame].y);
            if (main_1.player[a].phys.pos.x < main_1.player[v].phys.pos.x) {
                main_1.player[v].hit.reverse = false;
                main_1.player[v].phys.face = -1;
            }
            else {
                main_1.player[v].hit.reverse = true;
                main_1.player[v].phys.face = 1;
            }
            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].DAMAGEN2.init(v, input);
            (0, main_1.screenShake)(main_1.player[v].hit.knockback);
            sfx_1.sounds.swordreallystronghit.play();
        }
    }
}
function executeShieldHit(input, v, a, h, damage) {
    if (!main_1.player[v].phys.powerShieldActive) {
        main_1.player[v].phys.shieldHP -= damage;
        if (main_1.player[v].phys.shieldHP < 0) {
            main_1.player[v].phys.shielding = false;
            main_1.player[v].phys.cVel.y = 2.5;
            main_1.player[v].phys.grounded = false;
            main_1.player[v].phys.shieldHP = 0;
            (0, drawVfx_1.drawVfx)({
                name: "breakShield",
                pos: main_1.player[v].phys.pos,
                face: main_1.player[v].phys.face
            });
            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].SHIELDBREAKFALL.init(v, input);
            sfx_1.sounds.shieldbreak.play();
            return;
        }
    }
    main_1.player[v].hit.hitlag = Math.floor(damage * (1 / 3) + 3);
    let vPushMultiplier = 0.6;
    if (main_1.player[v].phys.powerShieldActive) {
        vPushMultiplier = 1;
        main_1.player[v].phys.powerShielded = true;
        main_1.player[v].hit.powershield = true;
        (0, drawVfx_1.drawVfx)({
            name: "impactLand",
            pos: main_1.player[v].phys.pos,
            face: main_1.player[v].phys.face
        });
        (0, drawVfx_1.drawVfx)({
            name: "powershield",
            pos: main_1.player[v].phys.shieldPositionReal,
            face: main_1.player[v].phys.face
        });
        sfx_1.sounds.powershield.play();
    }
    else {
        let frame = main_1.player[v].hitboxes.frame;
        if (frame > 1) {
            frame = 1;
        }
        (0, drawVfx_1.drawVfx)({
            name: "clank",
            pos: new Vec2D_1.Vec2D(main_1.player[a].phys.pos.x + (main_1.player[a].hitboxes.id[h].offset[main_1.player[a].hitboxes.frame].x * main_1.player[a].phys.face), main_1.player[a].phys.pos.y + main_1.player[a].hitboxes.id[h].offset[main_1.player[a].hitboxes.frame].y)
        });
    }
    main_1.player[v].hit.shieldstun = ((Math.floor(damage) * ((0.65 * (1 - ((main_1.player[v].phys.shieldAnalog - 0.3) / 0.7))) + 0.3)) * 1.5) + 2;
    let victimPush = ((Math.floor(damage) * ((0.195 * (1 - ((main_1.player[v].phys.shieldAnalog - 0.3) / 0.7))) + 0.09)) +
        0.4) * vPushMultiplier;
    if (victimPush > 2) {
        victimPush = 2;
    }
    let attackerPush = (Math.floor(damage) * ((main_1.player[v].phys.shieldAnalog - 0.3) * 0.1)) + 0.02;
    if (main_1.player[a].phys.pos.x < main_1.player[v].phys.pos.x) {
        main_1.player[v].phys.cVel.x = victimPush;
        main_1.player[a].phys.cVel.x -= attackerPush;
    }
    else {
        main_1.player[v].phys.cVel.x = -victimPush;
        main_1.player[a].phys.cVel.x += attackerPush;
    }
    actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].GUARD.init(v, input);
}
function bluntHit(a, h) {
    sfx_1.sounds.blunthit.play();
    let frame = main_1.player[a].hitboxes.frame;
    if (frame > 1) {
        frame = 1;
    }
    (0, drawVfx_1.drawVfx)("clank", new Vec2D_1.Vec2D(main_1.player[a].phys.pos.x + (main_1.player[a].hitboxes.id[h].offset[frame].x * main_1.player[a].phys.face), main_1.player[a].phys.pos.y + main_1.player[a].hitboxes.id[h].offset[frame].y));
}
function executeRegularHit(input, v, a, h, shieldHit, isThrow, drawBounce, phantom, stageDamage, hitbox) {
    let damage = hitbox.dmg;
    main_1.player[v].phys.grabTech = false;
    if (!stageDamage) {
        if (main_1.player[a].phys.chargeFrames > 0) {
            damage *= 1 + (main_1.player[a].phys.chargeFrames * (0.3671 / 60));
        }
        if (actionStateShortcuts_1.actionStates[main_1.characterSelections[a]][main_1.player[a].actionState].specialOnHit) {
            actionStateShortcuts_1.actionStates[main_1.characterSelections[a]][main_1.player[a].actionState].onPlayerHit(a);
            if (hitbox.type === 8)
                return;
        }
        if (phantom) {
            exports.phantomQueue.push([a, v]);
            main_1.player[v].phys.phantomDamage = 0.5 * damage;
        }
        else {
            main_1.player[a].hit.hitlag = Math.floor(damage * (1 / 3) + 3);
        }
    }
    // TODO: STALING + KNOCKBACK STACKING
    if (shieldHit) {
        executeShieldHit(input, v, a, h, damage);
        return;
    }
    // if invincible
    if (main_1.player[v].phys.hurtboxState > 0 && !isThrow) {
        if (!stageDamage) {
            bluntHit(a, h);
        }
        return;
    }
    if (phantom) {
        main_1.player[v].hit.hitlag = Math.floor(damage * (1 / 3) + 3);
        main_1.player[v].hit.knockback = 0;
        let frame = main_1.player[a].hitboxes.frame;
        if (frame > 1) {
            frame = 1;
        }
        main_1.player[v].hit.hitPoint = new Vec2D_1.Vec2D(main_1.player[a].phys.pos.x + (hitbox.offset[frame].x * main_1.player[a].phys.face), main_1.player[a].phys.pos.y + hitbox.offset[frame].y);
        hitEffectsAndSound(a, v, h, isThrow);
        return;
    }
    let crouching = actionStateShortcuts_1.actionStates[main_1.characterSelections[v]][main_1.player[v].actionState].crouch;
    let vCancel = false;
    if (main_1.player[v].phys.vCancelTimer > 0) {
        if (actionStateShortcuts_1.actionStates[main_1.characterSelections[v]][main_1.player[v].actionState].vCancel) {
            vCancel = true;
            sfx_1.sounds.vcancel.play();
        }
    }
    let jabReset = false;
    if (actionStateShortcuts_1.actionStates[main_1.characterSelections[v]][main_1.player[v].actionState].downed && damage < 7) {
        jabReset = true;
    }
    main_1.player[v].hit.knockback = getKnockback(hitbox, damage, damage, main_1.player[v].percent, main_1.player[v].charAttributes.weight, crouching, vCancel);
    main_1.player[v].hit.angle = hitbox.angle;
    if (main_1.player[v].hit.angle == 361) {
        if (main_1.player[v].hit.knockback < 32.1) {
            main_1.player[v].hit.angle = 0;
        }
        else if (main_1.player[v].hit.knockback >= 32.1) {
            main_1.player[v].hit.angle = 44;
        }
    }
    main_1.player[v].hit.hitlag = Math.floor(damage * (1 / 3) + 3);
    if (!isThrow) {
        if (stageDamage) {
            const angularParameter = a.angular;
            let collisionPoint;
            if (a.corner) {
                const [same, other] = (0, environmentalCollision_1.getSameAndOther)(angularParameter);
                const t = angularParameter - Math.floor(angularParameter);
                if ((same === 1 && other === 2) || (same === 3 && other === 0)) {
                    collisionPoint = new Vec2D_1.Vec2D((1 - t) * main_1.player[v].phys.ECBp[same].x + t * main_1.player[v].phys.ECBp[other].x, (1 - t) * main_1.player[v].phys.ECBp[same].y + t * main_1.player[v].phys.ECBp[other].y);
                }
                else {
                    collisionPoint = new Vec2D_1.Vec2D((1 - t) * main_1.player[v].phys.ECBp[other].x + t * main_1.player[v].phys.ECBp[same].x, (1 - t) * main_1.player[v].phys.ECBp[other].y + t * main_1.player[v].phys.ECBp[same].y);
                }
            }
            else {
                collisionPoint = main_1.player[v].phys.ECBp[angularParameter];
            }
            main_1.player[v].hit.hitPoint = collisionPoint;
            main_1.player[v].hit.reverse = false;
            main_1.player[v].phys.stageDamageImmunity = 20;
        }
        else {
            let frame = main_1.player[a].hitboxes.frame;
            if (frame > 1) {
                frame = 1;
            }
            main_1.player[v].hit.hitPoint = new Vec2D_1.Vec2D(main_1.player[a].phys.pos.x + (hitbox.offset[frame].x * main_1.player[a].phys.face), main_1.player[a].phys.pos.y + hitbox.offset[frame].y);
            if (main_1.player[a].phys.pos.x < main_1.player[v].phys.pos.x) {
                main_1.player[v].hit.reverse = false;
            }
            else {
                main_1.player[v].hit.reverse = true;
            }
        }
        if (!jabReset && main_1.player[v].phys.grabbedBy == -1) {
            main_1.player[v].phys.face = main_1.player[v].hit.reverse ? 1 : -1;
        }
    }
    else {
        main_1.player[a].hasHit = true;
        main_1.player[a].phys.grabbing = -1;
        main_1.player[v].phys.thrownHitbox = true;
        main_1.player[v].phys.thrownHitboxOwner = a;
        main_1.player[v].phys.pos = new Vec2D_1.Vec2D(main_1.player[a].phys.pos.x + (hitbox.offset.x * main_1.player[a].phys.face), main_1.player[a].phys.pos.y + hitbox.offset.y);
        main_1.player[v].phys.grabbedBy = -1;
        main_1.player[v].hit.hitlag = 1;
        main_1.player[a].hit.hitlag = 1;
        if (main_1.player[a].phys.face == 1) {
            main_1.player[v].hit.reverse = false;
        }
        else {
            main_1.player[v].hit.reverse = true;
        }
        if (drawBounce) {
            sfx_1.sounds.bounce.play();
            (0, drawVfx_1.drawVfx)({
                name: "groundBounce",
                pos: main_1.player[v].phys.pos,
                face: main_1.player[v].phys.face,
                f: Math.PI / 2
            });
        }
    }
    main_1.player[v].percent += damage;
    // if victim is grabbing someone, put the victim's grab victim into a grab release
    if (main_1.player[v].phys.grabbing > -1) {
        main_1.player[main_1.player[v].phys.grabbing].phys.grabbedBy = -1;
        actionStateShortcuts_1.actionStates[main_1.characterSelections[main_1.player[v].phys.grabbing]].CAPTURECUT.init(main_1.player[v].phys.grabbing, input);
    }
    if (main_1.player[v].phys.grabbedBy == -1 || (main_1.player[v].phys.grabbedBy > -1 && main_1.player[v].hit.knockback > 50 && !hitbox.throwextra)) {
        if (main_1.player[v].phys.grabbedBy > -1) {
            main_1.player[main_1.player[v].phys.grabbedBy].phys.grabbing = -1;
            actionStateShortcuts_1.actionStates[main_1.characterSelections[main_1.player[v].phys.grabbedBy]].WAIT.init(main_1.player[v].phys.grabbedBy, input);
        }
        main_1.player[v].hit.hitstun = getHitstun(main_1.player[v].hit.knockback);
        if (jabReset) {
            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].DOWNDAMAGE.init(v, input);
        }
        else if (main_1.player[v].hit.knockback >= 80 || isThrow) {
            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].DAMAGEFLYN.init(v, input, !isThrow);
        }
        else {
            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].DAMAGEN2.init(v, input);
        }
    }
    else {
        if (!hitbox.throwextra) {
            //if (player[v].actionState != "THROWNPUFFDOWN" && player[v].actionState != "THROWNFALCONBACK" && player[v].actionState != "THROWNFALCONFORWARD" && player[v].actionState != "THROWNFALCONUP") {
            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].CAPTUREDAMAGE.init(v, input);
        }
    }
    if (main_1.player[v].phys.grounded && main_1.player[v].hit.angle > 180) {
        if (main_1.player[v].hit.knockback >= 80) {
            sfx_1.sounds.bounce.play();
            (0, drawVfx_1.drawVfx)({
                name: "groundBounce",
                pos: main_1.player[v].phys.pos,
                face: main_1.player[v].phys.face,
                f: Math.PI / 2
            });
            main_1.player[v].hit.angle = 360 - main_1.player[v].hit.angle;
            main_1.player[v].hit.knockback *= 0.8;
        }
    }
    (0, main_1.screenShake)(main_1.player[v].hit.knockback);
    (0, main_1.percentShake)(main_1.player[v].hit.knockback, v);
    hitEffectsAndSound(v, h, isThrow, hitbox.type);
}
function hitEffectsAndSound(v, h, isThrow, type) {
    if (!isThrow) {
        hitEffect(type, v);
        knockbackSounds(type, main_1.player[v].hit.knockback, v);
    }
    else {
        sfx_1.sounds.stronghit.play();
    }
}
function hitEffect(type, v) {
    switch (type) {
        case 0:
            // normal
            (0, drawVfx_1.drawVfx)({
                name: "normalhit",
                pos: main_1.player[v].hit.hitPoint,
                face: main_1.player[v].phys.face
            });
            break;
        case 1:
            // slash
            (0, drawVfx_1.drawVfx)({
                name: "hitSparks",
                pos: main_1.player[v].hit.hitPoint,
                face: main_1.player[v].phys.face
            });
            (0, drawVfx_1.drawVfx)({
                name: "hitFlair",
                pos: main_1.player[v].hit.hitPoint,
                face: main_1.player[v].phys.face
            });
            (0, drawVfx_1.drawVfx)({
                name: "hitCurve",
                pos: main_1.player[v].hit.hitPoint,
                face: main_1.player[v].phys.face,
                f: main_1.player[v].hit.angle
            });
            break;
        case 3:
            // fire
            main_1.player[v].burning = 20;
            (0, drawVfx_1.drawVfx)({
                name: "firehit",
                pos: main_1.player[v].hit.hitPoint,
                face: main_1.player[v].phys.face
            });
            break;
        case 4:
            // electric
            main_1.player[v].shocked = 20;
            (0, drawVfx_1.drawVfx)({
                name: "electrichit",
                pos: main_1.player[v].hit.hitPoint,
                face: main_1.player[v].phys.face
            });
            break;
        default:
            break;
    }
}
function executeHits(input) {
    if (main_1.gameMode === 2) {
        cssHits(input);
        return;
    }
    let grabQueue = [];
    let ignoreGrabs = [false, false, false, false];
    for (var i = 0; i < exports.hitQueue.length; i++) {
        // start defining constants for hit
        const v = exports.hitQueue[i][0];
        const a = exports.hitQueue[i][1];
        // h will contain hitbox type for stage damage
        const h = exports.hitQueue[i][2];
        const shieldHit = exports.hitQueue[i][3];
        const isThrow = exports.hitQueue[i][4];
        const drawBounce = exports.hitQueue[i][5];
        const phantom = exports.hitQueue[i][6] || false;
        // if a is a string, then it is stage damage
        const stageDamage = (a >= 0) ? false : true;
        let hitbox;
        if (stageDamage) {
            let normalAngle = Math.atan2(a.normal.y, a.normal.x);
            if (normalAngle < 0) {
                normalAngle += 2 * Math.PI;
            }
            hitbox = { offset: new Vec2D_1.Vec2D(0, 0),
                dmg: 10,
                angle: normalAngle * 180 / Math.PI, // why are we using degrees again?
                kg: 100,
                bk: 0,
                sk: 150,
                type: h
            };
        }
        else {
            hitbox = main_1.player[a].hitboxes.id[h];
        }
        // if in furafura, make sure sfx stops
        if (main_1.player[v].actionState == "FURAFURA") {
            sfx_1.sounds.furaloop.stop(main_1.player[v].furaLoopID);
        }
        switch (hitbox.type) {
            // if grab
            case 2:
                if (actionStateShortcuts_1.actionStates[main_1.characterSelections[v]][main_1.player[v].actionState].canBeGrabbed) {
                    grabQueue.push([a, v, false]);
                }
                break;
            // if sleep
            case 5:
                actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].FURASLEEPSTART.init(v, input);
                break;
            default:
                ignoreGrabs[v] = true;
                executeRegularHit(input, v, a, h, shieldHit, isThrow, drawBounce, phantom, stageDamage, hitbox);
                break;
        }
    }
    executeGrabHits(input, grabQueue, ignoreGrabs);
}
function executeGrabHits(input, grabQueue, ignoreGrabs) {
    for (var j = 0; j < grabQueue.length; j++) {
        if (!ignoreGrabs[grabQueue[j][0]]) {
            if (!grabQueue[j][2]) {
                if (main_1.player[grabQueue[j][1]].actionState == "GRAB" && main_1.player[grabQueue[j][1]].timer > 0 && main_1.player[grabQueue[j][1]].timer < 14 && main_1.player[grabQueue[j][1]].phys.face != main_1.player[grabQueue[j][0]].phys.face) {
                    executeGrabTech(grabQueue[j][0], grabQueue[j][1], input);
                    grabQueue[j][2] = true;
                    ignoreGrabs[grabQueue[j][1]] = true;
                }
                else {
                    for (var k = 0; k < grabQueue.length; k++) {
                        if (k != j) {
                            if (grabQueue[j][0] == grabQueue[k][1]) {
                                executeGrabTech(grabQueue[j][0], grabQueue[k][0], input);
                                grabQueue[j][2] = true;
                                grabQueue[k][2] = true;
                                break;
                            }
                        }
                    }
                }
            }
            if (!grabQueue[j][2]) {
                var a = grabQueue[j][0];
                var v = grabQueue[j][1];
                if (main_1.player[v].phys.grabbedBy == -1 && main_1.player[a].phys.grabbing == -1 && main_1.player[v].phys.hurtBoxState == 0 && !main_1.player[v].phys.grabTech) {
                    main_1.player[v].phys.cVel = new Vec2D_1.Vec2D(0, 0);
                    main_1.player[v].phys.kVel = new Vec2D_1.Vec2D(0, 0);
                    main_1.player[a].phys.cVel = new Vec2D_1.Vec2D(0, 0);
                    main_1.player[a].phys.kVel = new Vec2D_1.Vec2D(0, 0);
                    main_1.player[v].phys.grabbedBy = a;
                    main_1.player[v].phys.shielding = false;
                    main_1.player[a].phys.grabbing = v;
                    (0, actionStateShortcuts_1.turnOffHitboxes)(a);
                    (0, actionStateShortcuts_1.turnOffHitboxes)(v);
                    if (main_1.player[a].actionState == "UPSPECIAL") {
                        main_1.player[v].phys.face = main_1.player[a].phys.face * -1;
                        actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].THROWNFALCONDIVE.init(v, input);
                    }
                    else {
                        actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].CAPTUREPULLED.init(v, input);
                    }
                }
            }
        }
    }
}
function executeGrabTech(a, v, input) {
    if (main_1.player[a].phys.pos.x < main_1.player[v].phys.pos.x) {
        main_1.player[a].phys.face = 1;
        main_1.player[v].phys.face = -1;
    }
    else {
        main_1.player[a].phys.face = -1;
        main_1.player[v].phys.face = 1;
    }
    main_1.player[a].phys.grabTech = true;
    main_1.player[v].phys.grabTech = true;
    (0, actionStateShortcuts_1.turnOffHitboxes)(a);
    (0, actionStateShortcuts_1.turnOffHitboxes)(v);
    actionStateShortcuts_1.actionStates[main_1.characterSelections[a]].CAPTURECUT.init(a, input);
    actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].CAPTURECUT.init(v, input);
    sfx_1.sounds.parry.play();
    (0, drawVfx_1.drawVfx)({
        name: "shieldup",
        pos: new Vec2D_1.Vec2D((main_1.player[a].phys.pos.x + main_1.player[v].phys.pos.x) / 2, main_1.player[a].phys.pos.y + 12),
        face: main_1.player[v].phys.face,
        f: 3
    });
}
function getKnockback(hb, damagestaled, damageunstaled, percent, weight, crouching, vCancel) {
    if (hb.sk == 0) {
        var kb = ((0.01 * hb.kg) * ((1.4 * (((0.05 * (damageunstaled * (damagestaled + Math.floor(percent)))) + (damagestaled + Math.floor(percent)) * 0.1) * (2.0 - (2.0 * (weight * 0.01)) / (1.0 + (weight * 0.01))))) +
            18) + hb.bk);
    }
    else {
        //var kb = ((((setKnockback * 10 / 20) + 1) * 1.4 * (200/(weight + 100)) + 18) * (growth / 100)) + base;
        var kb = ((((hb.sk * 10 / 20) + 1) * 1.4 * (200 / (weight + 100)) + 18) * (hb.kg / 100)) + hb.bk;
    }
    if (kb > 2500) {
        kb = 2500;
    }
    if (crouching) {
        kb *= 0.67;
    }
    if (vCancel) {
        kb *= 0.95;
    }
    return kb;
}
function getLaunchAngle(trajectory, knockback, reverse, x, y, v) {
    var deadzone = false;
    //console.log(trajectory);
    var diAngle;
    if (knockback < 80 && main_1.player[v].phys.grounded && (trajectory == 0 || trajectory == 180)) {
        deadzone = true;
    }
    if (x < 0.2875 && x > -0.2875) {
        x = 0;
    }
    if (y < 0.2875 && y > -0.2875) {
        y = 0;
    }
    if (x == 0 && y < 0) {
        diAngle = 270;
    }
    else if (x == 0 && y > 0) {
        diAngle = 90;
    }
    else if (x == 0 && y == 0) {
        deadzone = true;
    }
    else {
        diAngle = Math.atan(y / x) * (180 / Math.PI) * 1;
        if (x < 0) {
            diAngle += 180;
        }
        else if (y < 0) {
            diAngle += 360;
        }
    }
    //console.log(deadzone);
    if (trajectory == 361) {
        if (knockback < 32.1) {
            if (reverse) {
                trajectory = 180;
            }
            else {
                trajectory = 0;
            }
        }
        else if (knockback >= 32.1) {
            if (reverse) {
                trajectory = 136;
            }
            else {
                trajectory = 44;
            }
        }
        else {
            prompt("Why would this ever get called?");
            trajectory = 440 * (knockback - 32);
            if (reverse) {
                trajectory = 180 - trajectory;
                if (trajectory < 0) {
                    trajectory = 360 + trajectory;
                }
            }
        }
    }
    else {
        if (reverse) {
            trajectory = 180 - trajectory;
            if (trajectory < 0) {
                trajectory = 360 + trajectory;
            }
        }
    }
    //console.log(trajectory);
    if (!deadzone) {
        var rAngle = trajectory - diAngle;
        if (rAngle > 180) {
            rAngle -= 360;
        }
        var pDistance = Math.sin(rAngle * angleConversion) * Math.sqrt(x * x + y * y);
        var angleOffset = pDistance * pDistance * 18;
        if (angleOffset > 18) {
            angleOffset = 18;
        }
        if (rAngle < 0 && rAngle > -180) {
            angleOffset *= -1;
        }
    }
    else {
        var angleOffset = 0;
    }
    var newtraj = trajectory - angleOffset;
    if (newtraj < 0.01) {
        newtraj = 0;
    }
    return newtraj;
}
function getHorizontalVelocity(knockback, angle) {
    var initialVelocity = knockback * 0.03;
    var horizontalAngle = Math.cos(angle * angleConversion);
    var horizontalVelocity = initialVelocity * horizontalAngle;
    horizontalVelocity = Math.round(horizontalVelocity * 100000) / 100000;
    return horizontalVelocity;
}
function getVerticalVelocity(knockback, angle, grounded, trajectory) {
    var initialVelocity = knockback * 0.03;
    var verticalAngle = Math.sin(angle * angleConversion);
    var verticalVelocity = initialVelocity * verticalAngle;
    verticalVelocity = Math.round(verticalVelocity * 100000) / 100000;
    if (knockback < 80 && grounded && (trajectory == 0 || trajectory == 180)) {
        verticalVelocity = 0;
    }
    return verticalVelocity;
}
function getHorizontalDecay(angle) {
    var decay = 0.051 * Math.cos(angle * angleConversion);
    decay = Math.round(decay * 100000) / 100000;
    return decay;
}
function getVerticalDecay(angle) {
    var decay = 0.051 * Math.sin(angle * angleConversion);
    decay = Math.round(decay * 100000) / 100000;
    return decay;
}
function getHitstun(knockback) {
    //if (groundDownHitType == "Fly"){
    //knockback *= 1.25;
    //}
    return Math.floor(knockback * .4);
}
function knockbackSounds(type, knockback, v) {
    if (type == 4) {
        sfx_1.sounds.firestronghit.play();
    }
    if (knockback < 50) {
        switch (type) {
            case 0:
                sfx_1.sounds.normalweakhit.play();
                break;
            case 1:
                sfx_1.sounds.swordweakhit.play();
                break;
            case 3:
                sfx_1.sounds.fireweakhit.play();
                break;
            default:
                break;
        }
    }
    else if (knockback < 100) {
        switch (type) {
            case 0:
                sfx_1.sounds.normalmediumhit.play();
                break;
            case 1:
                sfx_1.sounds.swordmediumhit.play();
                break;
            case 3:
                sfx_1.sounds.firemediumhit.play();
                break;
            default:
                break;
        }
    }
    else if (knockback < 140) {
        switch (type) {
            case 0:
                sfx_1.sounds.normalstronghit.play();
                break;
            case 1:
                sfx_1.sounds.swordstronghit.play();
                break;
            case 3:
                sfx_1.sounds.firestronghit.play();
                break;
            default:
                break;
        }
    }
    else {
        switch (type) {
            case 0:
                sfx_1.sounds.normalstronghit.play();
                break;
            case 1:
                sfx_1.sounds.swordreallystronghit.play();
                break;
            case 3:
                sfx_1.sounds.bathit.play();
                sfx_1.sounds.firestronghit.play();
                break;
            default:
                break;
        }
        sfx_1.sounds.cheer.play();
        if (knockback < 280) {
            sfx_1.sounds.stronghit.play();
            switch (main_1.characterSelections[v]) {
                case 0:
                    sfx_1.sounds.weakhurt.play();
                    break;
                case 2:
                    sfx_1.sounds.foxweakhurt.play();
                    break;
                case 3:
                    sfx_1.sounds.falcohurt1.play();
                    break;
                default:
                    break;
            }
        }
        else {
            sfx_1.sounds.strongerhit.play();
            switch (main_1.characterSelections[v]) {
                case 0:
                    sfx_1.sounds.stronghurt.play();
                    break;
                case 1:
                    sfx_1.sounds.puffhurt.play();
                    break;
                case 2:
                    sfx_1.sounds.foxstronghurt.play();
                    break;
                case 3:
                    sfx_1.sounds.falcohurt2.play();
                    break;
                default:
                    break;
            }
        }
    }
}
function checkPhantoms() {
    for (var i = 0; i < exports.phantomQueue.length; i++) {
        var v = exports.phantomQueue[i][1];
        if (main_1.player[v].hit.hitlag == 0 && main_1.player[v].phys.hurtBoxState == 0) {
            main_1.player[v].percent += main_1.player[v].phys.phantomDamage;
            main_1.player[v].phys.phantomDamage = 0;
            var a = exports.phantomQueue[i][0];
            for (var j = 0; j < main_1.player[a].hitboxes.hitList.length; j++) {
                if (main_1.player[a].hitboxes.hitList[j] == v) {
                    main_1.player[a].hitboxes.hitList.splice(j, 1);
                    break;
                }
            }
            exports.phantomQueue.splice(i, 1);
        }
    }
}
