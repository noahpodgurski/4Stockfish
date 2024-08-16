"use strict";
//@flow
Object.defineProperty(exports, "__esModule", { value: true });
exports.land = land;
exports.physics = physics;
const main_1 = require("../main/main");
const characters_1 = require("../main/characters");
const sfx_1 = require("../main/sfx");
const settings_1 = require("../settings");
const actionStateShortcuts_1 = require("./actionStateShortcuts");
const hitDetection_1 = require("./hitDetection");
const render_1 = require("../main/render");
const environmentalCollision_1 = require("./environmentalCollision");
const deepCopyObject_1 = require("../main/util/deepCopyObject");
const drawVfx_1 = require("../main/vfx/drawVfx");
const stage_1 = require("../stages/stage");
const activeStage_1 = require("../stages/activeStage");
const Box2D_1 = require("../main/util/Box2D");
const Vec2D_1 = require("../main/util/Vec2D");
const toList_1 = require("../main/util/toList");
const extremePoint_1 = require("../stages/util/extremePoint");
const ecbTransform_1 = require("../main/util/ecbTransform");
const linAlg_1 = require("../main/linAlg");
function updatePosition(i, newPosition) {
    main_1.player[i].phys.pos = newPosition;
}
;
function dealWithDamagingStageCollision(i, normal, corner, angular, damageType) {
    const collisionData = { normal: normal, angular: angular, corner: corner };
    let damageTypeIndex = -1;
    switch (damageType) {
        case "fire":
            damageTypeIndex = 3;
            break;
        case "electric":
            damageTypeIndex = 4;
            break;
        case "slash":
            damageTypeIndex = 1;
            break;
        case "darkness":
            damageTypeIndex = 5;
            break;
        default:
            break;
    }
    if (damageTypeIndex !== -1) {
        hitDetection_1.hitQueue.push([i, collisionData, damageTypeIndex, false, false, true]);
    }
}
function dealWithWallCollision(i, newPosition, pt, wallType, wallIndex, input) {
    updatePosition(i, newPosition);
    let wallLabel = "L";
    let sign = -1;
    let isRight = 0;
    if (wallType[0].toLowerCase() === "r") {
        wallLabel = "R";
        sign = 1;
        isRight = 1;
    }
    const wall = (0, stage_1.getSurfaceFromStage)([wallType, wallIndex], activeStage_1.activeStage);
    const wallBottom = (0, extremePoint_1.extremePoint)(wall, "b");
    const wallTop = (0, extremePoint_1.extremePoint)(wall, "t");
    const wallNormal = (0, environmentalCollision_1.outwardsWallNormal)(wallBottom, wallTop, wallType);
    const damageType = wall[2] ? wall[2].damageType : null;
    const inDamageState = main_1.player[i].actionState === "DAMAGEFLYN" || main_1.player[i].actionState === "WALLDAMAGE" || main_1.player[i].actionState === "DAMAGEFALL";
    if (inDamageState && main_1.player[i].phys.techTimer > 0) {
        main_1.player[i].phys.face = sign;
        if (input[i][0].x || input[i][0].y || input[i][0].lsY > 0.7) {
            actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].WALLTECHJUMP.init(i, input);
        }
        else {
            actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].WALLTECH.init(i, input);
        }
    }
    else if (inDamageState && Math.sign(main_1.player[i].phys.kVel) !== sign && main_1.player[i].hit.hitlag === 0 && Math.pow(main_1.player[i].phys.kVel.x, 2) + Math.pow(main_1.player[i].phys.kVel.y, 2) >= 2.25) {
        main_1.player[i].phys.face = sign;
        (0, drawVfx_1.drawVfx)({
            name: "wallBounce",
            pos: new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.ECBp[1].y),
            face: sign,
            f: wallNormal
        });
        actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].WALLDAMAGE.initWithNormal(i, input, wallNormal);
    }
    else if (main_1.player[i].hit.hitlag === 0) {
        if (damageType !== undefined && damageType !== null
            && main_1.player[i].phys.hurtBoxState === 0) {
            // apply damage
            dealWithDamagingStageCollision(i, wallNormal, false, pt, damageType);
        }
        else if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].specialWallCollide) {
            actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].onWallCollide(i, input, wallLabel, wallIndex);
        }
        else if (main_1.player[i].phys.canWallJump) {
            if (main_1.player[i].phys.wallJumpTimer === 254) {
                if (main_1.player[i].phys.posDelta.x >= 0.5) {
                    main_1.player[i].phys.wallJumpTimer = 0;
                }
            }
        }
        if (main_1.player[i].phys.wallJumpTimer >= 0 && main_1.player[i].phys.wallJumpTimer < 120) {
            if (sign * input[i][0].lsX >= 0.7 &&
                sign * input[i][3].lsX <= 0 &&
                main_1.player[i].charAttributes.walljump) {
                main_1.player[i].phys.wallJumpTimer = 254;
                main_1.player[i].phys.face = sign;
                actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].WALLJUMP.init(i, input);
            }
            else {
                main_1.player[i].phys.wallJumpTimer++;
            }
        }
    }
}
;
function dealWithPlatformCollision(i, alreadyGrounded, newPosition, ecbpBottom, platformIndex, input) {
    const platform = (0, stage_1.getSurfaceFromStage)(["p", platformIndex], activeStage_1.activeStage);
    const damageType = platform[2] ? platform[2].damageType : null;
    const platLeft = (0, extremePoint_1.extremePoint)(platform, "l");
    const platRight = (0, extremePoint_1.extremePoint)(platform, "r");
    const platNormal = (0, environmentalCollision_1.outwardsWallNormal)(platLeft, platRight, "g");
    if (main_1.player[i].hit.hitlag > 0 || alreadyGrounded || main_1.player[i].phys.grabbedBy !== -1) {
        updatePosition(i, newPosition);
    }
    else {
        land(i, ecbpBottom, 1, platformIndex, platNormal, input);
    }
}
;
function dealWithGroundCollision(i, alreadyGrounded, newPosition, ecbpBottom, groundIndex, input) {
    const ground = (0, stage_1.getSurfaceFromStage)(["g", groundIndex], activeStage_1.activeStage);
    const damageType = ground[2] ? ground[2].damageType : null;
    const ignoreDamage = main_1.player[i].actionState === "DAMAGEFLYN" || main_1.player[i].actionState === "DAMAGEFALL" || main_1.player[i].actionState === "WALLDAMAGE";
    const groundLeft = (0, extremePoint_1.extremePoint)(ground, "l");
    const groundRight = (0, extremePoint_1.extremePoint)(ground, "r");
    const groundNormal = (0, environmentalCollision_1.outwardsWallNormal)(groundLeft, groundRight, "g");
    if (!ignoreDamage && damageType !== undefined && damageType !== null
        && main_1.player[i].phys.hurtBoxState === 0) {
        // apply damage
        dealWithDamagingStageCollision(i, groundNormal, false, 0, damageType);
    }
    else {
        if (main_1.player[i].hit.hitlag > 0 || alreadyGrounded || main_1.player[i].phys.grabbedBy !== -1) {
            updatePosition(i, newPosition);
        }
        else {
            land(i, ecbpBottom, 0, groundIndex, groundNormal, input);
        }
    }
}
;
function fallOffGround(i, side, groundEdgePosition, disableFall, input) {
    let [stillGrounded, backward] = [true, false];
    let sign = 1;
    if (side === "r") {
        sign = -1;
    }
    if (disableFall) {
        main_1.player[i].phys.pos.y = Math.max(main_1.player[i].phys.pos.y, groundEdgePosition.y) + environmentalCollision_1.additionalOffset;
        main_1.player[i].phys.pos.x = groundEdgePosition.x + (side === "l" ? environmentalCollision_1.additionalOffset : -environmentalCollision_1.additionalOffset);
        main_1.player[i].phys.ECBp = (0, ecbTransform_1.moveECB)(main_1.player[i].phys.ECBp, (0, linAlg_1.subtract)(main_1.player[i].phys.pos, main_1.player[i].phys.ECBp[0]));
    }
    else if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].canEdgeCancel) {
        if (main_1.player[i].phys.face === sign) {
            stillGrounded = false;
            main_1.player[i].phys.pos.y = Math.max(main_1.player[i].phys.pos.y, groundEdgePosition.y) + environmentalCollision_1.additionalOffset;
            backward = true;
        }
        else if (Math.abs(input[i][0].lsX) > 0.6
            || (main_1.player[i].phys.cVel.x === 0 && main_1.player[i].phys.kVel.x === 0)
            || actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].disableTeeter
            || main_1.player[i].phys.shielding) {
            stillGrounded = false;
            main_1.player[i].phys.pos.y = Math.max(main_1.player[i].phys.pos.y, groundEdgePosition.y) + environmentalCollision_1.additionalOffset;
        }
        else {
            main_1.player[i].phys.cVel.x = 0;
            main_1.player[i].phys.pos.x = groundEdgePosition.x + sign * environmentalCollision_1.additionalOffset;
            actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].OTTOTTO.init(i, input);
        }
    }
    else if (main_1.player[i].phys.cVel.x === 0
        && main_1.player[i].phys.kVel.x === 0
        && !actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].inGrab) {
        stillGrounded = false;
        main_1.player[i].phys.pos.y = Math.max(main_1.player[i].phys.pos.y, groundEdgePosition.y) + environmentalCollision_1.additionalOffset;
    }
    else {
        main_1.player[i].phys.cVel.x = 0;
        main_1.player[i].phys.pos.x = groundEdgePosition.x + sign * environmentalCollision_1.additionalOffset;
    }
    return [stillGrounded, backward];
}
;
// ground type and index is a pair, either ["g", index] or ["p", index]
function dealWithGround(i, ground, groundTypeAndIndex, connected, input) {
    const damageType = ground[2] ? ground[2].damageType : null;
    const ignoreDamage = main_1.player[i].actionState === "DAMAGEFLYN" || main_1.player[i].actionState === "DAMAGEFALL" || main_1.player[i].actionState === "WALLDAMAGE";
    const leftmostGroundPoint = (0, extremePoint_1.extremePoint)(ground, "l");
    const rightmostGroundPoint = (0, extremePoint_1.extremePoint)(ground, "r");
    const groundNormal = (0, environmentalCollision_1.outwardsWallNormal)(leftmostGroundPoint, rightmostGroundPoint, "g");
    let [stillGrounded, backward] = [true, false];
    let groundOrPlatform = 0;
    if (groundTypeAndIndex[0] === "p") {
        groundOrPlatform = 1;
    }
    let disableFall = false;
    let maybeLeftGroundTypeAndIndex = null;
    let maybeRightGroundTypeAndIndex = null;
    // first check if the player is allowed to move along the ground, by checking there are no low ceilings
    const ecb0Height = Math.max(environmentalCollision_1.additionalOffset, main_1.player[i].phys.ECB1[2].y - main_1.player[i].phys.ECB1[0].y - environmentalCollision_1.additionalOffset);
    const maybeNextPosX = (0, environmentalCollision_1.moveAlongGround)(main_1.player[i].phys.ECB1[0], main_1.player[i].phys.ECBp[0], ecb0Height, ground, activeStage_1.activeStage.ceiling);
    if (maybeNextPosX !== null) {
        // ceiling has obstructed grounded movement
        main_1.player[i].phys.pos.x = maybeNextPosX;
        main_1.player[i].phys.ECBp = (0, ecbTransform_1.moveECB)(main_1.player[i].phys.ECBp, new Vec2D_1.Vec2D(maybeNextPosX - main_1.player[i].phys.ECBp[0].x, 0));
    }
    if (main_1.player[i].phys.ECBp[0].x < leftmostGroundPoint.x) {
        if (connected !== null && connected !== undefined) {
            maybeLeftGroundTypeAndIndex = groundTypeAndIndex[0] === "g"
                ? connected[0][groundTypeAndIndex[1]][0]
                : connected[1][groundTypeAndIndex[1]][0];
        }
        if (maybeLeftGroundTypeAndIndex === null || maybeLeftGroundTypeAndIndex === undefined) { // no other ground to the left
            [stillGrounded, backward] = fallOffGround(i, "l", leftmostGroundPoint, disableFall, input);
        }
        else {
            const [leftGroundType, leftGroundIndex] = maybeLeftGroundTypeAndIndex;
            switch (leftGroundType) {
                case "g":
                    [stillGrounded, backward] = dealWithGround(i, activeStage_1.activeStage.ground[leftGroundIndex], ["g", leftGroundIndex], connected, input);
                    break;
                case "p":
                    [stillGrounded, backward] = dealWithGround(i, activeStage_1.activeStage.platform[leftGroundIndex], ["p", leftGroundIndex], connected, input);
                    break;
                case "r":
                    const rightWallToTheLeft = activeStage_1.activeStage.wallR[leftGroundIndex];
                    if ((0, extremePoint_1.extremePoint)(rightWallToTheLeft, "l").y > leftmostGroundPoint.y) {
                        disableFall = true;
                    }
                    [stillGrounded, backward] = fallOffGround(i, "l", leftmostGroundPoint, disableFall, input);
                    break;
                default: // surface to the left is neither ground, platform or right wall
                    [stillGrounded, backward] = fallOffGround(i, "l", leftmostGroundPoint, disableFall, input);
                    break;
            }
        }
    }
    else if (main_1.player[i].phys.ECBp[0].x > rightmostGroundPoint.x) {
        if (connected !== null && connected !== undefined) {
            maybeRightGroundTypeAndIndex = groundTypeAndIndex[0] === "g"
                ? connected[0][groundTypeAndIndex[1]][1]
                : connected[1][groundTypeAndIndex[1]][1];
        }
        if (maybeRightGroundTypeAndIndex === null || maybeRightGroundTypeAndIndex === undefined) { // no other ground to the right
            [stillGrounded, backward] = fallOffGround(i, "r", rightmostGroundPoint, disableFall, input);
        }
        else {
            const [rightGroundType, rightGroundIndex] = maybeRightGroundTypeAndIndex;
            switch (rightGroundType) {
                case "g":
                    [stillGrounded, backward] = dealWithGround(i, activeStage_1.activeStage.ground[rightGroundIndex], ["g", rightGroundIndex], connected, input);
                    break;
                case "p":
                    [stillGrounded, backward] = dealWithGround(i, activeStage_1.activeStage.platform[rightGroundIndex], ["p", rightGroundIndex], connected, input);
                    break;
                case "l":
                    const leftWallToTheRight = activeStage_1.activeStage.wallL[rightGroundIndex];
                    if ((0, extremePoint_1.extremePoint)(leftWallToTheRight, "r").y > rightmostGroundPoint.y) {
                        disableFall = true;
                    }
                    [stillGrounded, backward] = fallOffGround(i, "r", rightmostGroundPoint, disableFall, input);
                    break;
                default: // surface to the right is neither ground, platform or left wall
                    [stillGrounded, backward] = fallOffGround(i, "r", rightmostGroundPoint, disableFall, input);
                    break;
            }
        }
    }
    else {
        const ecbpBottom = main_1.player[i].phys.ECBp[0];
        const [vec1, vec2] = ground;
        const yIntercept = (0, environmentalCollision_1.coordinateIntercept)([ecbpBottom, new Vec2D_1.Vec2D(ecbpBottom.x, ecbpBottom.y + 1)], [vec1, vec2]);
        main_1.player[i].phys.pos.y = main_1.player[i].phys.pos.y + yIntercept.y - ecbpBottom.y + environmentalCollision_1.additionalOffset;
        main_1.player[i].phys.ECBp = (0, ecbTransform_1.moveECB)(main_1.player[i].phys.ECBp, new Vec2D_1.Vec2D(0, yIntercept.y - ecbpBottom.y + environmentalCollision_1.additionalOffset));
        main_1.player[i].phys.onSurface = [groundOrPlatform, groundTypeAndIndex[1]];
        main_1.player[i].phys.groundAngle = Math.atan2(groundNormal.y, groundNormal.x) || Math.PI / 2;
    }
    if (!ignoreDamage && damageType !== undefined && damageType !== null
        && main_1.player[i].phys.hurtBoxState === 0) {
        // apply damage
        dealWithDamagingStageCollision(i, groundNormal, false, 0, damageType);
        stillGrounded = false;
    }
    return [stillGrounded, backward];
}
;
function dealWithCeilingCollision(i, newPosition, ecbTop, ceilingIndex, input) {
    updatePosition(i, newPosition);
    const ceiling = (0, stage_1.getSurfaceFromStage)(["c", ceilingIndex], activeStage_1.activeStage);
    const damageType = ceiling[2] ? ceiling[2].damageType : null;
    const ceilingLeft = (0, extremePoint_1.extremePoint)(ceiling, "l");
    const ceilingRight = (0, extremePoint_1.extremePoint)(ceiling, "r");
    const ceilingNormal = (0, environmentalCollision_1.outwardsWallNormal)(ceilingLeft, ceilingRight, "c");
    const ignoreDamage = main_1.player[i].actionState === "DAMAGEFLYN" || main_1.player[i].actionState === "DAMAGEFALL" || main_1.player[i].actionState === "WALLDAMAGE";
    if (!ignoreDamage && damageType !== undefined && damageType !== null
        && main_1.player[i].phys.hurtBoxState === 0) {
        // apply damage
        dealWithDamagingStageCollision(i, ceilingNormal, false, 2, damageType);
    }
    else if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].headBonk && main_1.player[i].phys.cVel.y + main_1.player[i].phys.kVel.y > 0) {
        if (main_1.player[i].hit.hitstun > 0) {
            if (main_1.player[i].phys.techTimer > 0) {
                actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].TECHU.init(i, input);
            }
            else {
                (0, drawVfx_1.drawVfx)({
                    name: "ceilingBounce",
                    pos: ecbTop,
                    face: 1,
                    f: ceilingNormal
                });
                sfx_1.sounds.bounce.play();
                actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].STOPCEIL.initWithNormal(i, input, ceilingNormal);
            }
        }
        else {
            actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].STOPCEIL.init(i, input);
        }
    }
}
;
function dealWithCornerCollision(i, newPosition, ecb, angularParameter, damageType) {
    updatePosition(i, newPosition);
    const insideECBType = angularParameter < 2 ? "l" : "r";
    const [same, other] = (0, environmentalCollision_1.getSameAndOther)(angularParameter);
    const lowerECBPoint = other === 2 ? ecb[same] : ecb[0];
    const upperECBPoint = other === 2 ? ecb[2] : ecb[same];
    const normal = (0, environmentalCollision_1.outwardsWallNormal)(lowerECBPoint, upperECBPoint, insideECBType);
    if (main_1.player[i].hit.hitlag === 0 && damageType !== undefined && damageType !== null
        && main_1.player[i].phys.hurtBoxState === 0) {
        dealWithDamagingStageCollision(i, normal, true, angularParameter, damageType);
    }
}
;
function land(i, newPosition, t, j, normal, input) {
    main_1.player[i].phys.pos = newPosition;
    main_1.player[i].phys.grounded = true;
    main_1.player[i].phys.doubleJumped = false;
    main_1.player[i].phys.jumpsUsed = 0;
    main_1.player[i].phys.airborneTimer = 0;
    main_1.player[i].phys.fastfalled = false;
    main_1.player[i].phys.chargeFrames = 0;
    main_1.player[i].phys.charging = false;
    main_1.player[i].phys.wallJumpCount = 0;
    main_1.player[i].phys.thrownHitbox = false;
    main_1.player[i].phys.sideBJumpFlag = true;
    main_1.player[i].phys.onSurface = [t, j];
    main_1.player[i].phys.onLedge = -1;
    main_1.player[i].rotation = 0;
    main_1.player[i].rotationPoint = new Vec2D_1.Vec2D(0, 0);
    main_1.player[i].colourOverlayBool = false;
    main_1.player[i].hitboxes.active = [false, false, false, false];
    let newNormal = normal;
    if (newNormal === null || newNormal === undefined || (newNormal.x === 0 && newNormal.y === 0)) {
        newNormal = new Vec2D_1.Vec2D(0, 1);
    }
    main_1.player[i].phys.groundAngle = Math.atan2(newNormal.y, newNormal.x);
    switch (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].landType) {
        case 0:
            // LANDING / NIL
            if (main_1.player[i].phys.cVel.y >= -1) {
                actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].WAIT.init(i, input);
            }
            else {
                actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].LANDING.init(i, input);
            }
            break;
        case 1:
            // OWN FUNCTION
            actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].land(i, input);
            break;
        case 2:
            // KNOCKDOWN / TECH
            if (main_1.player[i].phys.techTimer > 0) {
                if (input[i][0].lsX * main_1.player[i].phys.face > 0.5) {
                    actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].TECHF.init(i, input);
                }
                else if (input[i][0].lsX * main_1.player[i].phys.face < -0.5) {
                    actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].TECHB.init(i, input);
                }
                else {
                    actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].TECHN.init(i, input);
                }
            }
            else {
                actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].DOWNBOUND.init(i, input);
            }
            break;
        default:
            actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].LANDING.init(i, input);
            break;
    }
    main_1.player[i].phys.cVel.y = 0;
    main_1.player[i].phys.kVel.y = 0;
    main_1.player[i].hit.hitstun = 0;
}
;
function hitlagSwitchUpdate(i, input) {
    if (main_1.player[i].hit.hitlag > 0) {
        main_1.player[i].hit.hitlag--;
        if (main_1.player[i].hit.hitlag === 0 && main_1.player[i].hit.knockback > 0) {
            if (main_1.player[i].phys.grabbedBy === -1 || main_1.player[i].hit.knockback > 50) {
                const newAngle = (0, hitDetection_1.getLaunchAngle)(main_1.player[i].hit.angle, main_1.player[i].hit.knockback, main_1.player[i].hit.reverse, input[i][0].lsX, input[i][0].lsY, i);
                main_1.player[i].phys.cVel.x = 0;
                main_1.player[i].phys.cVel.y = 0;
                //console.log(newAngle);
                main_1.player[i].phys.kVel.x = (0, hitDetection_1.getHorizontalVelocity)(main_1.player[i].hit.knockback, newAngle);
                main_1.player[i].phys.kVel.y = (0, hitDetection_1.getVerticalVelocity)(main_1.player[i].hit.knockback, newAngle, main_1.player[i].phys.grounded, main_1.player[i].hit.angle);
                //console.log(player[i].phys.kVel);
                main_1.player[i].phys.kDec.x = (0, hitDetection_1.getHorizontalDecay)(newAngle);
                main_1.player[i].phys.kDec.y = (0, hitDetection_1.getVerticalDecay)(newAngle);
                //console.log(player[i].phys.kDec);
                //player[i].hit.hitstun = getHitstun(player[i].hit.knockback);
                main_1.player[i].phys.onLedge = -1;
                main_1.player[i].phys.charging = false;
                main_1.player[i].phys.chargeFrames = 0;
                main_1.player[i].phys.shielding = false;
                /*if (player[i].phys.grounded){
                 if (newAngle == 0 || newAngle > 270){
                 player[i].phys.kVel.y = 0;
                 player[i].phys.kDec.x = player[i].charAttributes.traction;
                 }
                 else if (newAngle > 180){
                 player[i].phys.kVel.y = 0;
                 player[i].phys.kDec.x = -player[i].charAttributes.traction;
                 }
                 }*/
                if (main_1.player[i].phys.kVel.y === 0) {
                    if (main_1.player[i].hit.knockback >= 80) {
                        main_1.player[i].phys.grounded = false;
                        main_1.player[i].phys.pos.y += 0.0001;
                    }
                }
                if (main_1.player[i].phys.kVel.y > 0) {
                    main_1.player[i].phys.grounded = false;
                }
            }
            main_1.player[i].hit.knockback = 0;
        }
        //SDI / ASDI
        switch (main_1.player[i].actionState) {
            case "DAMAGEN2":
            case "DAMAGEFLYN":
            case "GUARDON":
            case "GUARD":
            case "DOWNDAMAGE":
                if (main_1.player[i].hit.hitlag > 0) {
                    if ((input[i][0].lsX > 0.7 && input[i][1].lsX < 0.7) ||
                        (input[i][0].lsX < -0.7 && input[i][1].lsX > -0.7) ||
                        (input[i][0].lsY > 0.7 && input[i][1].lsY < 0.7) ||
                        (input[i][0].lsY < -0.7 && input[i][1].lsY > -0.7)) {
                        if (!((input[i][0].lsX * input[i][0].lsX) + (input[i][0].lsY * input[i][0].lsY) < (0.49))) {
                            main_1.player[i].phys.pos.x += input[i][0].lsX * 6;
                            main_1.player[i].phys.pos.y += main_1.player[i].phys.grounded ? 0 : input[i][0].lsY * 6;
                        }
                    }
                }
                else {
                    main_1.player[i].phys.pos.x += input[i][0].lsX * 3;
                    main_1.player[i].phys.pos.y += main_1.player[i].phys.grounded ? 0 : input[i][0].lsY * 3;
                }
                break;
            default:
                break;
        }
        if (main_1.player[i].hit.hitlag === 0) {
            // if hitlag just ended, do normal stuff as well
            hitlagSwitchUpdate(i, input);
        }
    }
    else {
        if (main_1.player[i].hit.shieldstun > 0) {
            //console.log(player[i].hit.shieldstun);
            main_1.player[i].hit.shieldstun--;
            if (main_1.player[i].hit.shieldstun < 0) {
                main_1.player[i].hit.shieldstun = 0;
            }
        }
        //console.log(actionStates[characterSelections[i]][player[i].actionState]);
        main_1.player[i].phys.canWallJump = actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].wallJumpAble;
        main_1.player[i].phys.bTurnaroundTimer--;
        if (main_1.player[i].phys.bTurnaroundTimer < 0) {
            main_1.player[i].phys.bTurnaroundTimer = 0;
        }
        if ((input[i][0].lsX > 0.9 && input[i][1].lsX < 0.9) ||
            (input[i][0].lsX < -0.9 && input[i][1].lsX > -0.9)) {
            main_1.player[i].phys.bTurnaroundTimer = 20;
            main_1.player[i].phys.bTurnaroundDirection = Math.sign(input[i][0].lsX);
        }
        main_1.player[i].prevActionState = main_1.player[i].actionState;
        actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].main(i, input);
        if (main_1.player[i].shocked > 0) {
            main_1.player[i].shocked--;
            if (main_1.player[i].shocked % 5 === 0) {
                sfx_1.sounds.electricfizz.play();
            }
            (0, drawVfx_1.drawVfx)({
                name: "shocked",
                pos: new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y + 5),
                face: main_1.player[i].phys.face
            });
        }
        if (main_1.player[i].burning > 0) {
            main_1.player[i].burning--;
            if (main_1.player[i].burning % 6 === 0) {
                (0, drawVfx_1.drawVfx)({
                    name: "burning",
                    pos: new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y + 5),
                    face: main_1.player[i].phys.face
                });
            }
        }
        // TURBO MODE
        // if just changed action states, remove ability to cancel
        if (main_1.player[i].prevActionState !== main_1.player[i].actionState) {
            main_1.player[i].hasHit = false;
        }
        if (settings_1.gameSettings.turbo && main_1.gameMode !== 5) {
            if (main_1.player[i].hasHit) {
                if (main_1.player[i].actionState !== "CATCHATTACK") {
                    if (main_1.player[i].phys.grounded) {
                        if ((0, actionStateShortcuts_1.turboGroundedInterrupt)(i, input)) {
                            main_1.player[i].hasHit = false;
                        }
                    }
                    else {
                        if ((0, actionStateShortcuts_1.turboAirborneInterrupt)(i, input)) {
                            main_1.player[i].hasHit = false;
                        }
                    }
                }
            }
        }
        if (Math.abs(main_1.player[i].phys.kVel.x) > 0) {
            const oSign = Math.sign(main_1.player[i].phys.kVel.x);
            if (main_1.player[i].phys.grounded) {
                main_1.player[i].phys.kVel.x -= oSign * main_1.player[i].charAttributes.traction;
            }
            else {
                main_1.player[i].phys.kVel.x -= main_1.player[i].phys.kDec.x;
            }
            if (oSign !== Math.sign(main_1.player[i].phys.kVel.x)) {
                main_1.player[i].phys.kVel.x = 0;
            }
        }
        if (Math.abs(main_1.player[i].phys.kVel.y) > 0) {
            const oSign = Math.sign(main_1.player[i].phys.kVel.y);
            if (main_1.player[i].phys.grounded) {
                main_1.player[i].phys.kVel.y = 0;
            }
            main_1.player[i].phys.kVel.y -= main_1.player[i].phys.kDec.y;
            if (oSign !== Math.sign(main_1.player[i].phys.kVel.y)) {
                main_1.player[i].phys.kVel.y = 0;
            }
        }
        main_1.player[i].phys.pos.x += main_1.player[i].phys.cVel.x + main_1.player[i].phys.kVel.x;
        main_1.player[i].phys.pos.y += main_1.player[i].phys.cVel.y + main_1.player[i].phys.kVel.y;
    }
}
;
function hurtBoxStateUpdate(i) {
    if (main_1.player[i].actionState === "REBIRTH" || main_1.player[i].actionState === "REBIRTHWAIT") {
        main_1.player[i].phys.hurtBoxState = 1;
    }
    else {
        main_1.player[i].phys.hurtBoxState = 0;
    }
    if (main_1.player[i].phys.invincibleTimer > 0) {
        main_1.player[i].phys.invincibleTimer--;
        main_1.player[i].phys.hurtBoxState = 2;
    }
    if (main_1.player[i].phys.intangibleTimer > 0) {
        main_1.player[i].phys.intangibleTimer--;
        main_1.player[i].phys.hurtBoxState = 1;
    }
}
;
function outOfCameraUpdate(i) {
    if (main_1.player[i].phys.outOfCameraTimer >= 60) {
        if (main_1.player[i].percent < 150) {
            main_1.player[i].percent++;
        }
        (0, main_1.percentShake)(40, i);
        sfx_1.sounds.outofcamera.play();
        main_1.player[i].phys.outOfCameraTimer = 0;
    }
}
;
function lCancelUpdate(i, input) {
    // if smash 64 lcancel, put any landingattackair action states into landing
    if (settings_1.gameSettings.lCancelType === 2 && main_1.gameMode !== 5) {
        if (main_1.player[i].phys.lCancel) {
            if (main_1.player[i].actionState.substr(0, 16) === "LANDINGATTACKAIR") {
                main_1.player[i].actionState = "LANDING";
                main_1.player[i].timer = 1;
            }
        }
    }
    if (main_1.player[i].phys.lCancelTimer > 0) {
        main_1.player[i].phys.lCancelTimer--;
        if (main_1.player[i].phys.lCancelTimer === 0) {
            main_1.player[i].phys.lCancel = false;
        }
    }
    // l CANCEL
    if (main_1.player[i].phys.lCancelTimer === 0 &&
        ((input[i][0].lA > 0 && input[i][1].lA === 0) ||
            (input[i][0].rA > 0 && input[i][1].rA === 0) ||
            (input[i][0].z && !input[i][1].z))) {
        // if smash 64 lcancel, increase window to 11 frames
        if (settings_1.gameSettings.lCancelType === 2 && main_1.gameMode !== 5) {
            main_1.player[i].phys.lCancelTimer = 11;
        }
        else {
            main_1.player[i].phys.lCancelTimer = 7;
        }
        main_1.player[i].phys.lCancel = true;
    }
    // if auto lcancel is on, always lcancel
    if (settings_1.gameSettings.lCancelType === 1 && main_1.gameMode !== 5) {
        main_1.player[i].phys.lCancel = true;
    }
    // V Cancel
    if (main_1.player[i].phys.vCancelTimer > 0) {
        main_1.player[i].phys.vCancelTimer--;
    }
    if (main_1.player[i].phys.techTimer > 0) {
        main_1.player[i].phys.techTimer--;
    }
    if (main_1.player[i].phys.shoulderLockout > 0) {
        main_1.player[i].phys.shoulderLockout--;
    }
    if ((input[i][0].l && !input[i][1].l) ||
        (input[i][0].r && !input[i][1].r)) {
        if (!main_1.player[i].phys.grounded) {
            if (main_1.player[i].phys.shoulderLockout === 0) {
                main_1.player[i].phys.vCancelTimer = 3;
                main_1.player[i].phys.techTimer = 20;
            }
        }
        main_1.player[i].phys.shoulderLockout = 40;
    }
}
;
const nullSquashDatum = { location: null, factor: 1 };
const ecbSquashData = [nullSquashDatum,
    nullSquashDatum,
    nullSquashDatum,
    nullSquashDatum];
function findAndResolveCollisions(i, input, oldBackward, oldNotTouchingWalls, ecbOffset) {
    var _a;
    let stillGrounded = true;
    let backward = oldBackward;
    const notTouchingWalls = oldNotTouchingWalls;
    const connected = (_a = activeStage_1.activeStage.connected) !== null && _a !== void 0 ? _a : [[], []];
    // ------------------------------------------------------------------------------------------------------
    // grounded state movement
    if (main_1.player[i].phys.grounded) {
        const oldPosition = new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y);
        const relevantGroundIndex = main_1.player[i].phys.onSurface[1];
        let relevantGroundType = "g";
        let relevantGround = activeStage_1.activeStage.ground[relevantGroundIndex];
        if (main_1.player[i].phys.onSurface[0] === 1) {
            relevantGroundType = "p";
            relevantGround = activeStage_1.activeStage.platform[relevantGroundIndex];
        }
        const relevantGroundTypeAndIndex = [relevantGroundType, relevantGroundIndex];
        [stillGrounded, backward] = dealWithGround(i, relevantGround, relevantGroundTypeAndIndex, connected, input);
    }
    // end of grounded state movement
    // ------------------------------------------------------------------------------------------------------
    // ------------------------------------------------------------------------------------------------------
    // main collision detection routine
    const notIgnoringPlatforms = ((!actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].canPassThrough || (input[i][0].lsY > -0.56)) && !main_1.player[i].phys.passing);
    const isImmune = main_1.player[i].phys.hurtBoxState !== 0;
    const playerStatusInfo = {
        ignoringPlatforms: !notIgnoringPlatforms,
        grounded: main_1.player[i].phys.grounded,
        immune: isImmune
    };
    // type CollisionRoutineResult = { position : Vec2D, touching : null | SimpleTouchingDatum, squashDatum : SquashDatum, ecb : ECB};
    const collisionData = (0, environmentalCollision_1.runCollisionRoutine)(main_1.player[i].phys.ECB1, main_1.player[i].phys.ECBp, main_1.player[i].phys.pos, ecbSquashData[i], playerStatusInfo, activeStage_1.activeStage);
    ecbSquashData[i] = collisionData.squashDatum;
    const newPosition = collisionData.position;
    const newECB = collisionData.ecb;
    const touchingDatum = collisionData.touching;
    if (touchingDatum === null) {
        updatePosition(i, newPosition);
    }
    else if (touchingDatum.kind === "surface") {
        const surfaceLabel = touchingDatum.type;
        const surfaceIndex = touchingDatum.index;
        const pt = touchingDatum.pt;
        switch (surfaceLabel[0].toLowerCase()) {
            case "l": // player touching left wall
                notTouchingWalls[0] = false;
                dealWithWallCollision(i, newPosition, pt, "l", surfaceIndex, input);
                break;
            case "r": // player touching right wall
                notTouchingWalls[1] = false;
                dealWithWallCollision(i, newPosition, pt, "r", surfaceIndex, input);
                break;
            case "g": // player landed on ground
                dealWithGroundCollision(i, main_1.player[i].phys.grounded, newPosition, newECB[0], surfaceIndex, input);
                break;
            case "c": // player touching ceiling
                dealWithCeilingCollision(i, newPosition, newECB[2], surfaceIndex, input);
                break;
            case "p": // player landed on platform
                dealWithPlatformCollision(i, main_1.player[i].phys.grounded, newPosition, newECB[0], surfaceIndex, input);
                break;
            default:
                console.log("error in 'findAndResolveCollisions': unrecognised surface type.");
                break;
        }
    }
    else if (touchingDatum.kind === "corner") {
        const angularParameter = touchingDatum.angular;
        const cornerDamageType = touchingDatum.damageType !== undefined ? touchingDatum.damageType : null;
        dealWithCornerCollision(i, newPosition, newECB, angularParameter, cornerDamageType);
    }
    main_1.player[i].phys.ECB1 = newECB;
    // finally, calculate how much squashing is required by the ground
    if (main_1.player[i].phys.grounded) {
        const groundSquashFactor = (0, environmentalCollision_1.groundedECBSquashFactor)(new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y + ecbOffset[3]) //    top non-squashed ECBp point
        , new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y) // bottom non-squashed ECBp point, no offset as grounded
        , (0, toList_1.toList)(activeStage_1.activeStage.ceiling));
        if (groundSquashFactor !== null && (groundSquashFactor < ecbSquashData[i].factor)) {
            ecbSquashData[i] = { location: 0, factor: groundSquashFactor };
        }
        if (ecbSquashData[i] !== null) {
            ecbSquashData[i].location = 0;
        }
    }
    return [stillGrounded, backward, notTouchingWalls];
}
;
function dealWithLedges(i, input) {
    const playerPosX = main_1.player[i].phys.pos.x;
    const playerPosY = main_1.player[i].phys.pos.y;
    //TODO find out what these magic numbers are
    const ledgeSnapBoxOffset2 = main_1.player[i].charAttributes.ledgeSnapBoxOffset[2];
    const ledgeSnapBoxOffset0 = main_1.player[i].charAttributes.ledgeSnapBoxOffset[0];
    const ledgeSnapBoxOffset1 = main_1.player[i].charAttributes.ledgeSnapBoxOffset[1];
    main_1.player[i].phys.ledgeSnapBoxF = new Box2D_1.Box2D([playerPosX, playerPosY + ledgeSnapBoxOffset2], [playerPosX + ledgeSnapBoxOffset0, playerPosY + ledgeSnapBoxOffset1]);
    main_1.player[i].phys.ledgeSnapBoxB = new Box2D_1.Box2D([playerPosX - ledgeSnapBoxOffset0, playerPosY + ledgeSnapBoxOffset2], [playerPosX, playerPosY + ledgeSnapBoxOffset1]);
    if (main_1.player[i].phys.ledgeRegrabCount) {
        main_1.player[i].phys.ledgeRegrabTimeout--;
        if (main_1.player[i].phys.ledgeRegrabTimeout === 0) {
            main_1.player[i].phys.ledgeRegrabCount = false;
        }
    }
    let lsBF = -1;
    let lsBB = -1;
    let foundLedge = 0;
    if (main_1.player[i].phys.onLedge === -1 && !main_1.player[i].phys.ledgeRegrabCount) {
        for (let j = 0; j < activeStage_1.activeStage.ledge.length; j++) {
            let ledgeAvailable = true;
            for (let k = 0; k < 4; k++) {
                if (main_1.playerType[k] > -1) {
                    if (k !== i) {
                        if (main_1.player[k].phys.onLedge === j) {
                            ledgeAvailable = false;
                        }
                    }
                }
            }
            if (ledgeAvailable && !main_1.player[i].phys.grounded && main_1.player[i].hit.hitstun <= 0) {
                const x = activeStage_1.activeStage[activeStage_1.activeStage.ledge[j][0]][activeStage_1.activeStage.ledge[j][1]][activeStage_1.activeStage.ledge[j][2]].x;
                const y = activeStage_1.activeStage[activeStage_1.activeStage.ledge[j][0]][activeStage_1.activeStage.ledge[j][1]][activeStage_1.activeStage.ledge[j][2]].y;
                if (x > main_1.player[i].phys.ledgeSnapBoxF.min.x &&
                    x < main_1.player[i].phys.ledgeSnapBoxF.max.x &&
                    y < main_1.player[i].phys.ledgeSnapBoxF.min.y &&
                    y > main_1.player[i].phys.ledgeSnapBoxF.max.y) {
                    if (activeStage_1.activeStage.ledge[j][2] === 0) {
                        if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].canGrabLedge[0]) {
                            lsBF = j;
                        }
                    }
                    else if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].canGrabLedge[1]) {
                        lsBF = j;
                    }
                }
                if (x > main_1.player[i].phys.ledgeSnapBoxB.min.x &&
                    x < main_1.player[i].phys.ledgeSnapBoxB.max.x &&
                    y < main_1.player[i].phys.ledgeSnapBoxB.min.y &&
                    y > main_1.player[i].phys.ledgeSnapBoxF.max.y) {
                    if (activeStage_1.activeStage.ledge[j][2] === 1) {
                        if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].canGrabLedge[0]) {
                            lsBB = j;
                        }
                    }
                    else if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].canGrabLedge[1]) {
                        lsBB = j;
                    }
                }
            }
            if (main_1.player[i].phys.cVel.y < 0 && input[i][0].lsY > -0.5) {
                if (lsBF > -1) {
                    foundLedge = activeStage_1.activeStage.ledge[lsBF];
                    if (foundLedge[2] * -2 + 1 === main_1.player[i].phys.face || actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].canGrabLedge[1]) {
                        main_1.player[i].phys.onLedge = lsBF;
                        main_1.player[i].phys.ledgeRegrabTimeout = 30;
                        main_1.player[i].phys.face = foundLedge[2] * -2 + 1;
                        main_1.player[i].phys.pos = new Vec2D_1.Vec2D(activeStage_1.activeStage[foundLedge[0]][foundLedge[1]][foundLedge[2]].x + main_1.edgeOffset[0][0], activeStage_1.activeStage[foundLedge[0]][foundLedge[1]][foundLedge[2]].y + main_1.edgeOffset[0][1]);
                        actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].CLIFFCATCH.init(i, input);
                    }
                }
                else if (lsBB > -1) {
                    foundLedge = activeStage_1.activeStage.ledge[lsBB];
                    if (foundLedge[2] * -2 + 1 === main_1.player[i].phys.face || actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].canGrabLedge[1]) {
                        main_1.player[i].phys.onLedge = lsBB;
                        main_1.player[i].phys.ledgeRegrabTimeout = 30;
                        main_1.player[i].phys.face = foundLedge[2] * -2 + 1;
                        main_1.player[i].phys.pos = new Vec2D_1.Vec2D(activeStage_1.activeStage[foundLedge[0]][foundLedge[1]][foundLedge[2]].x + main_1.edgeOffset[1][0], activeStage_1.activeStage[foundLedge[0]][foundLedge[1]][foundLedge[2]].y + main_1.edgeOffset[1][1]);
                        actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].CLIFFCATCH.init(i, input);
                    }
                }
            }
        }
    }
}
;
function dealWithDeath(i, input) {
    if (!actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].dead && main_1.player[i].actionState !== "SLEEP") {
        let state = 0;
        if (main_1.player[i].phys.pos.x < activeStage_1.activeStage.blastzone.min.x) {
            state = "DEADLEFT";
        }
        else if (main_1.player[i].phys.pos.x > activeStage_1.activeStage.blastzone.max.x) {
            state = "DEADRIGHT";
        }
        else if (main_1.player[i].phys.pos.y < activeStage_1.activeStage.blastzone.min.y) {
            state = "DEADDOWN";
        }
        else if (main_1.player[i].phys.pos.y > activeStage_1.activeStage.blastzone.max.y && main_1.player[i].phys.kVel.y >= 2.4) {
            state = "DEADUP";
        }
        if (state !== 0) {
            main_1.player[i].phys.outOfCameraTimer = 0;
            (0, actionStateShortcuts_1.turnOffHitboxes)(i);
            main_1.player[i].stocks--;
            main_1.player[i].colourOverlayBool = false;
            render_1.lostStockQueue.push([i, main_1.player[i].stocks, 0]);
            if (main_1.player[i].stocks === 0 && main_1.versusMode) {
                main_1.player[i].stocks = 1;
            }
            actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][state].init(i, input);
        }
    }
}
;
function updateHitboxes(i) {
    main_1.player[i].phys.isInterpolated = false;
    for (let j = 0; j < 4; j++) {
        if (main_1.player[i].hitboxes.active[j] && main_1.player[i].phys.prevFrameHitboxes.active[j]) {
            if (main_1.player[i].phys.prevFrameHitboxes.id[j].offset[main_1.player[i].phys.prevFrameHitboxes.frame] === undefined) {
                continue;
            }
            if (main_1.player[i].hitboxes.id[j].offset[main_1.player[i].hitboxes.frame] === undefined) {
                continue;
            }
            const h1 = new Vec2D_1.Vec2D(main_1.player[i].phys.posPrev.x + (main_1.player[i].phys.prevFrameHitboxes.id[j].offset[main_1.player[i].phys.prevFrameHitboxes.frame].x * main_1.player[i].phys.facePrev), main_1.player[i].phys.posPrev.y + main_1.player[i].phys.prevFrameHitboxes.id[j].offset[main_1.player[i].phys.prevFrameHitboxes.frame].y);
            const h2 = new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x + (main_1.player[i].hitboxes.id[j].offset[main_1.player[i].hitboxes.frame].x * main_1.player[i].phys.face), main_1.player[i].phys.pos.y + main_1.player[i].hitboxes.id[j].offset[main_1.player[i].hitboxes.frame].y);
            const a = h2.x - h1.x;
            const b = h2.y - h1.y;
            let x = 0;
            if (!(a === 0 || b === 0)) {
                x = Math.atan(Math.abs(a) / Math.abs(b));
            }
            {
                const opp = Math.sin(x) * main_1.player[i].hitboxes.id[j].size;
                const adj = Math.cos(x) * main_1.player[i].hitboxes.id[j].size;
                const sigma = [h1.x, h1.y];
                let alpha1;
                let alpha2;
                let beta1;
                let beta2;
                if ((a > 0 && b > 0) || (a <= 0 && b <= 0)) {
                    alpha1 = new Vec2D_1.Vec2D((sigma[0] + adj), (sigma[1] - opp));
                    alpha2 = new Vec2D_1.Vec2D((alpha1.x + a), (alpha1.y + b));
                    beta1 = new Vec2D_1.Vec2D((sigma[0] - adj), (sigma[1] + opp));
                    beta2 = new Vec2D_1.Vec2D((beta1.x + a), (beta1.y + b));
                }
                else {
                    alpha1 = new Vec2D_1.Vec2D((sigma[0] - adj), (sigma[1] - opp));
                    alpha2 = new Vec2D_1.Vec2D((alpha1.x + a), (alpha1.y + b));
                    beta1 = new Vec2D_1.Vec2D((sigma[0] + adj), (sigma[1] + opp));
                    beta2 = new Vec2D_1.Vec2D((beta1.x + a), (beta1.y + b));
                }
                main_1.player[i].phys.interPolatedHitbox[j] = [alpha1, alpha2, beta2, beta1];
            }
            {
                const opp = Math.sin(x) * main_1.player[i].hitboxes.id[j].size - settings_1.gameSettings.phantomThreshold;
                const adj = Math.cos(x) * main_1.player[i].hitboxes.id[j].size - settings_1.gameSettings.phantomThreshold;
                const sigma = [h1.x, h1.y];
                let alpha1;
                let alpha2;
                let beta1;
                let beta2;
                if ((a > 0 && b > 0) || (a <= 0 && b <= 0)) {
                    alpha1 = new Vec2D_1.Vec2D((sigma[0] + adj), (sigma[1] - opp));
                    alpha2 = new Vec2D_1.Vec2D((alpha1.x + a), (alpha1.y + b));
                    beta1 = new Vec2D_1.Vec2D((sigma[0] - adj), (sigma[1] + opp));
                    beta2 = new Vec2D_1.Vec2D((beta1.x + a), (beta1.y + b));
                }
                else {
                    alpha1 = new Vec2D_1.Vec2D((sigma[0] - adj), (sigma[1] - opp));
                    alpha2 = new Vec2D_1.Vec2D((alpha1.x + a), (alpha1.y + b));
                    beta1 = new Vec2D_1.Vec2D((sigma[0] + adj), (sigma[1] + opp));
                    beta2 = new Vec2D_1.Vec2D((beta1.x + a), (beta1.y + b));
                }
                main_1.player[i].phys.interPolatedHitboxPhantom[j] = [alpha1, alpha2, beta2, beta1];
                main_1.player[i].phys.isInterpolated = true;
            }
        }
    }
}
;
function physics(i, input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    main_1.player[i].phys.passing = false;
    main_1.player[i].phys.posPrev = new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y);
    main_1.player[i].phys.facePrev = main_1.player[i].phys.face;
    (0, deepCopyObject_1.deepObjectMerge)(true, main_1.player[i].phys.prevFrameHitboxes, main_1.player[i].hitboxes);
    hitlagSwitchUpdate(i, input);
    hurtBoxStateUpdate(i);
    outOfCameraUpdate(i);
    lCancelUpdate(i, input);
    if (!main_1.player[i].phys.grounded) {
        main_1.player[i].phys.airborneTimer++;
    }
    //console.log(player[i].timer);
    let frame = Math.floor(main_1.player[i].timer);
    if (frame === 0) {
        frame = 1;
    }
    if (frame > characters_1.framesData[main_1.characterSelections[i]][main_1.player[i].actionState]) {
        frame = characters_1.framesData[main_1.characterSelections[i]][main_1.player[i].actionState];
    }
    //console.log(actionStates[characterSelections[i]][player[i].actionState].name+" "+(frame-1));
    /* global ecb */
    let ecb;
    const ecbOffset = actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].dead ? [0, 0, 0, 0] : [ecb[main_1.characterSelections[i]][main_1.player[i].actionState][frame - 1][0] * main_1.player[i].charAttributes.ecbScale, ecb[main_1.characterSelections[i]][main_1.player[i].actionState][frame - 1][1] * main_1.player[i].charAttributes.ecbScale, ecb[main_1.characterSelections[i]][main_1.player[i].actionState][frame - 1][2] * main_1.player[i].charAttributes.ecbScale, ecb[main_1.characterSelections[i]][main_1.player[i].actionState][frame - 1][3] * main_1.player[i].charAttributes.ecbScale];
    const playerPosX = main_1.player[i].phys.pos.x;
    const playerPosY = main_1.player[i].phys.pos.y;
    main_1.player[i].phys.ECBp = [
        new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y + ((main_1.player[i].phys.grounded || main_1.player[i].phys.airborneTimer < 10) ? 0 : ecbOffset[0])),
        new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x + Math.max(1, ecbOffset[1]), main_1.player[i].phys.pos.y + ecbOffset[2]),
        new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y + ecbOffset[3]),
        new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x - ecbOffset[1], main_1.player[i].phys.pos.y + ecbOffset[2])
    ];
    if (ecbSquashData[i] !== null && ecbSquashData[i].factor < 1) {
        if (ecbSquashData[i].factor * 2 * ecbOffset[1] < environmentalCollision_1.smallestECBWidth) {
            ecbSquashData[i].factor = (environmentalCollision_1.smallestECBWidth + 2 * environmentalCollision_1.additionalOffset) / (2 * ecbOffset[1]);
        }
        main_1.player[i].phys.ECBp = (0, ecbTransform_1.squashECBAt)(main_1.player[i].phys.ECBp, { factor: ecbSquashData[i].factor, location: 0 });
        if (!main_1.player[i].phys.grounded) {
            main_1.player[i].phys.ECBp = (0, ecbTransform_1.moveECB)(main_1.player[i].phys.ECBp, new Vec2D_1.Vec2D(0, (ecbSquashData[i].factor - 1) * ecbOffset[0]));
        }
    }
    if (!actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].ignoreCollision) {
        let notTouchingWalls = [true, true];
        let stillGrounded = true;
        let backward = false;
        [stillGrounded, backward, notTouchingWalls] = findAndResolveCollisions(i, input, backward, notTouchingWalls, ecbOffset);
        if (main_1.player[i].phys.grabbedBy === -1) {
            if (notTouchingWalls[0] && notTouchingWalls[1] && main_1.player[i].phys.canWallJump) {
                main_1.player[i].phys.wallJumpTimer = 254;
            }
            if (!notTouchingWalls[0] || !notTouchingWalls[1]) {
                if (main_1.player[i].phys.grounded) {
                    const s = main_1.player[i].phys.onSurface[1];
                    const surface = main_1.player[i].phys.onSurface[0] ? activeStage_1.activeStage.platform[s] : activeStage_1.activeStage.ground[s];
                    if (main_1.player[i].phys.pos.x < surface[0].x - 0.1 || main_1.player[i].phys.pos.x > surface[1].x + 0.1) {
                        stillGrounded = false;
                    }
                }
            }
            if (!stillGrounded) {
                main_1.player[i].phys.grounded = false;
                if (typeof actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].airborneState !== 'undefined') {
                    main_1.player[i].actionState = actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].airborneState;
                }
                else {
                    if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].missfoot && backward) {
                        actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].MISSFOOT.init(i, input);
                    }
                    else {
                        if (main_1.player[i].phys.grabbing !== -1) {
                            actionStateShortcuts_1.actionStates[main_1.characterSelections[main_1.player[i].phys.grabbing]].FALL.init(main_1.player[i].phys.grabbing, input, true);
                            main_1.player[main_1.player[i].phys.grabbing].phys.grabbedBy = -1;
                            main_1.player[i].phys.grabbing = -1;
                        }
                        actionStateShortcuts_1.actionStates[main_1.characterSelections[i]].FALL.init(i, input);
                    }
                    if (Math.abs(main_1.player[i].phys.cVel.x) > main_1.player[i].charAttributes.aerialHmaxV) {
                        main_1.player[i].phys.cVel.x = Math.sign(main_1.player[i].phys.cVel.x) * main_1.player[i].charAttributes.aerialHmaxV;
                    }
                }
                main_1.player[i].phys.shielding = false;
            }
            if (main_1.player[i].phys.grounded) {
                for (let j = 0; j < 4; j++) {
                    if (main_1.playerType[j] > -1) {
                        if (i !== j) {
                            if (main_1.player[j].phys.grounded &&
                                main_1.player[j].phys.onSurface[0] === main_1.player[i].phys.onSurface[0] &&
                                main_1.player[j].phys.onSurface[1] === main_1.player[i].phys.onSurface[1]) {
                                if (main_1.player[i].phys.grabbing !== j && main_1.player[i].phys.grabbedBy !== j) {
                                    // TODO: this pushing code needs to account for players on slanted surfaces
                                    const diff = Math.abs(main_1.player[i].phys.pos.x - main_1.player[j].phys.pos.x);
                                    if (diff < 6.5 && diff > 0) {
                                        main_1.player[j].phys.pos.x += Math.sign(main_1.player[i].phys.pos.x - main_1.player[j].phys.pos.x) * -0.3;
                                    }
                                    else if (diff === 0 && Math.abs(main_1.player[i].phys.cVel.x) > Math.abs(main_1.player[j].phys.cVel.x)) {
                                        main_1.player[j].phys.pos.x += Math.sign(main_1.player[i].phys.cVel.x) * -0.3;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    else { // player ignoring collisions
        main_1.player[i].phys.ECB1 = [
            new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y + ((main_1.player[i].phys.grounded || main_1.player[i].phys.airborneTimer < 10) ? 0 : ecbOffset[0])),
            new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x + ecbOffset[1], main_1.player[i].phys.pos.y + ecbOffset[2]),
            new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x, main_1.player[i].phys.pos.y + ecbOffset[3]),
            new Vec2D_1.Vec2D(main_1.player[i].phys.pos.x - ecbOffset[1], main_1.player[i].phys.pos.y + ecbOffset[2])
        ];
    }
    if (main_1.player[i].phys.shielding === false) {
        main_1.player[i].phys.shieldHP += 0.07;
        if (main_1.player[i].phys.shieldHP > 60) {
            main_1.player[i].phys.shieldHP = 60;
        }
    }
    dealWithLedges(i, input);
    dealWithDeath(i, input);
    main_1.player[i].phys.hurtbox = new Box2D_1.Box2D([playerPosX - main_1.player[i].charAttributes.hurtboxOffset[0], playerPosY + main_1.player[i].charAttributes.hurtboxOffset[1]], [playerPosX + main_1.player[i].charAttributes.hurtboxOffset[0], playerPosY]);
    if (main_1.gameMode === 3 && main_1.player[i].phys.posPrev.y > -80 && playerPosY <= -80) {
        sfx_1.sounds.lowdown.play();
    }
    updateHitboxes(i);
    main_1.player[i].phys.posDelta = new Vec2D_1.Vec2D(Math.abs(playerPosX - main_1.player[i].phys.posPrev.x), Math.abs(playerPosY - main_1.player[i].phys.posPrev.y));
    if (main_1.showDebug) {
        let actState = (_b = (_a = document.getElementById('actState' + i)) === null || _a === void 0 ? void 0 : _a.innerHTML) !== null && _b !== void 0 ? _b : "";
        let stateNum = (_d = (_c = document.getElementById('stateNum' + i)) === null || _c === void 0 ? void 0 : _c.innerHTML) !== null && _d !== void 0 ? _d : "";
        let face = (_f = (_e = document.getElementById('face' + i)) === null || _e === void 0 ? void 0 : _e.innerHTML) !== null && _f !== void 0 ? _f : "";
        let velocityX = (_h = (_g = document.getElementById("velocityX" + i)) === null || _g === void 0 ? void 0 : _g.innerHTML) !== null && _h !== void 0 ? _h : "";
        let velocityY = (_k = (_j = document.getElementById("velocityY" + i)) === null || _j === void 0 ? void 0 : _j.innerHTML) !== null && _k !== void 0 ? _k : "";
        let kvelocityX = (_m = (_l = document.getElementById("kvelocityX" + i)) === null || _l === void 0 ? void 0 : _l.innerHTML) !== null && _m !== void 0 ? _m : "";
        let kvelocityY = (_p = (_o = document.getElementById("kvelocityY" + i)) === null || _o === void 0 ? void 0 : _o.innerHTML) !== null && _p !== void 0 ? _p : "";
        let pvelocityX = (_r = (_q = document.getElementById("pvelocityX" + i)) === null || _q === void 0 ? void 0 : _q.innerHTML) !== null && _r !== void 0 ? _r : "";
        let pvelocityY = (_t = (_s = document.getElementById("pvelocityY" + i)) === null || _s === void 0 ? void 0 : _s.innerHTML) !== null && _t !== void 0 ? _t : "";
        actState = main_1.player[i].currentAction + " " + main_1.player[i].currentSubaction + " : " + main_1.player[i].actionState;
        stateNum = frame.toString();
        face = main_1.player[i].phys.face;
        velocityX = main_1.player[i].phys.cVel.x.toFixed(5);
        velocityY = main_1.player[i].phys.cVel.y.toFixed(5);
        kvelocityX = main_1.player[i].phys.kVel.x.toFixed(5);
        kvelocityY = main_1.player[i].phys.kVel.y.toFixed(5);
        pvelocityX = playerPosX.toFixed(5);
        pvelocityY = playerPosY.toFixed(5);
    }
}
