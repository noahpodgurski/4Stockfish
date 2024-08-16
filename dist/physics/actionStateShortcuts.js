"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionStates = void 0;
exports.randomShout = randomShout;
exports.executeIntangibility = executeIntangibility;
exports.playSounds = playSounds;
exports.isFinalDeath = isFinalDeath;
exports.getAngle = getAngle;
exports.turnOffHitboxes = turnOffHitboxes;
exports.shieldTilt = shieldTilt;
exports.reduceByTraction = reduceByTraction;
exports.airDrift = airDrift;
exports.fastfall = fastfall;
exports.shieldDepletion = shieldDepletion;
exports.shieldSize = shieldSize;
exports.mashOut = mashOut;
exports.checkForSmashes = checkForSmashes;
exports.checkForTilts = checkForTilts;
exports.checkForIASA = checkForIASA;
exports.checkForSpecials = checkForSpecials;
exports.checkForAerials = checkForAerials;
exports.checkForDash = checkForDash;
exports.checkForSmashTurn = checkForSmashTurn;
exports.tiltTurnDashBuffer = tiltTurnDashBuffer;
exports.checkForTiltTurn = checkForTiltTurn;
exports.checkForJump = checkForJump;
exports.checkForDoubleJump = checkForDoubleJump;
exports.checkForMultiJump = checkForMultiJump;
exports.checkForSquat = checkForSquat;
exports.turboAirborneInterrupt = turboAirborneInterrupt;
exports.turboGroundedInterrupt = turboGroundedInterrupt;
exports.setupActionStates = setupActionStates;
const main_1 = require("../main/main");
const index_1 = __importDefault(require("../characters/fox/moves/index"));
const index_2 = __importDefault(require("../characters/puff/moves/index"));
const index_3 = __importDefault(require("../characters/marth/moves/index"));
const JUMPAERIALB_1 = __importDefault(require("../characters/shared/moves/JUMPAERIALB"));
const JUMPAERIALF_1 = __importDefault(require("../characters/shared/moves/JUMPAERIALF"));
const sfx_1 = require("../main/sfx");
const characters_1 = require("../main/characters");
const drawVfx_1 = require("../main/vfx/drawVfx");
const Vec2D_1 = require("../main/util/Vec2D");
const settings_1 = require("../settings");
const deepCopy_1 = require("../main/util/deepCopy");
/* eslint-disable */
function randomShout(char) {
    //playSfx("shout"+Math.round(0.5+Math.random()*5.99));
    switch (char) {
        case 0:
            var shout = Math.round(0.5 + Math.random() * 5.99);
            switch (shout) {
                case 1:
                    sfx_1.sounds.shout1.play();
                    break;
                case 2:
                    sfx_1.sounds.shout2.play();
                    break;
                case 3:
                    sfx_1.sounds.shout3.play();
                    break;
                case 4:
                    sfx_1.sounds.shout4.play();
                    break;
                case 5:
                    sfx_1.sounds.shout5.play();
                    break;
                case 6:
                    sfx_1.sounds.shout6.play();
                    break;
                default:
                    break;
            }
            break;
        case 1:
            var shout = Math.round(0.5 + Math.random() * 4.99);
            switch (shout) {
                case 1:
                    sfx_1.sounds.puffshout1.play();
                    break;
                case 2:
                    sfx_1.sounds.puffshout2.play();
                    break;
                case 3:
                    sfx_1.sounds.puffshout3.play();
                    break;
                case 4:
                    sfx_1.sounds.puffshout4.play();
                    break;
                case 5:
                    sfx_1.sounds.puffshout5.play();
                    break;
                default:
                    break;
            }
            break;
        case 2:
            var shout = Math.round(0.5 + Math.random() * 4.99);
            switch (shout) {
                case 1:
                    sfx_1.sounds.foxshout1.play();
                    break;
                case 2:
                    sfx_1.sounds.foxshout2.play();
                    break;
                case 3:
                    sfx_1.sounds.foxshout3.play();
                    break;
                case 4:
                    sfx_1.sounds.foxshout4.play();
                    break;
                case 5:
                    sfx_1.sounds.foxshout5.play();
                    break;
                default:
                    break;
            }
            break;
        case 3:
            var shout = Math.round(0.5 + Math.random() * 4.99);
            switch (shout) {
                case 1:
                    sfx_1.sounds.falcoshout1.play();
                    break;
                case 2:
                    sfx_1.sounds.falcoshout2.play();
                    break;
                case 3:
                    sfx_1.sounds.falcoshout3.play();
                    break;
                case 4:
                    sfx_1.sounds.falcoshout4.play();
                    break;
                case 5:
                    sfx_1.sounds.falcoshout5.play();
                    break;
                default:
                    break;
            }
            break;
        case 4:
            var shout = Math.round(0.5 + Math.random() * 5.99);
            switch (shout) {
                case 1:
                    sfx_1.sounds.falconshout1.play();
                    break;
                case 2:
                    sfx_1.sounds.falconshout2.play();
                    break;
                case 3:
                    sfx_1.sounds.falconshout3.play();
                    break;
                case 4:
                    sfx_1.sounds.falconshout4.play();
                    break;
                case 5:
                    sfx_1.sounds.falconshout5.play();
                    break;
                case 6:
                    sfx_1.sounds.falconshout6.play();
                    break;
                default:
                    break;
            }
        default:
            break;
    }
}
function executeIntangibility(actionStateName, p) {
    if (main_1.player[p].timer == characters_1.intangibility[main_1.characterSelections[p]][actionStateName][0]) {
        main_1.player[p].phys.intangibleTimer = characters_1.intangibility[main_1.characterSelections[p]][actionStateName][1];
        main_1.player[p].phys.hurtBoxState = 1;
    }
}
function playSounds(actionStateName, p) {
    for (var i = 0; i < characters_1.actionSounds[main_1.characterSelections[p]][actionStateName].length; i++) {
        if (main_1.player[p].timer == characters_1.actionSounds[main_1.characterSelections[p]][actionStateName][i][0]) {
            sfx_1.sounds[characters_1.actionSounds[main_1.characterSelections[p]][actionStateName][i][1]].play();
        }
    }
}
function isFinalDeath() {
    if (main_1.gameMode == 5) {
        return true;
    }
    else if (main_1.versusMode) {
        return false;
    }
    else {
        let finalDeaths = 0;
        let totalPlayers = 0;
        for (let j = 0; j < 4; j++) {
            if (main_1.playerType[j] > -1) {
                totalPlayers++;
                if (main_1.player[j].stocks == 0) {
                    finalDeaths++;
                }
            }
        }
        return (finalDeaths >= Math.max(1, totalPlayers - 1));
    }
}
function getAngle(x, y) {
    var angle = 0;
    if (x != 0 || y != 0) {
        angle = Math.atan2(y, x);
    }
    return angle;
}
//aC = 180/Math.PI;
function turnOffHitboxes(p) {
    main_1.player[p].hitboxes.active = [false, false, false, false];
    main_1.player[p].hitboxes.hitList = [];
}
function shieldTilt(p, shieldstun, input) {
    if (!shieldstun && !main_1.player[p].inCSS) {
        var x = input[p][0].lsX;
        var y = input[p][0].lsY;
        var targetOffset = Math.sqrt(x * x + y * y) * 3;
        var targetAngle = getAngle(x, y);
        var targetPosition = new Vec2D_1.Vec2D(Math.cos(targetAngle) * targetOffset, Math.sin(targetAngle) * targetOffset);
        main_1.player[p].phys.shieldPosition = new Vec2D_1.Vec2D(main_1.player[p].phys.shieldPosition.x + ((targetPosition.x - main_1.player[p].phys.shieldPosition.x) / 5 + 0.01), main_1.player[p].phys.shieldPosition.y + ((targetPosition.y - main_1.player[p].phys.shieldPosition.y) / 5 + 0.01));
    }
    main_1.player[p].phys.shieldPositionReal = new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + main_1.player[p].phys.shieldPosition.x + (main_1.player[p].charAttributes
        .shieldOffset[0] * main_1.player[p].phys.face / 4.5), main_1.player[p].phys.pos.y + main_1.player[p].phys.shieldPosition.y + (main_1.player[p].charAttributes.shieldOffset[1] / 4.5));
}
function reduceByTraction(p, applyDouble) {
    if (main_1.player[p].phys.cVel.x > 0) {
        if (applyDouble && main_1.player[p].phys.cVel.x > main_1.player[p].charAttributes.maxWalk) {
            main_1.player[p].phys.cVel.x -= main_1.player[p].charAttributes.traction * 2;
        }
        else {
            main_1.player[p].phys.cVel.x -= main_1.player[p].charAttributes.traction;
        }
        if (main_1.player[p].phys.cVel.x < 0) {
            main_1.player[p].phys.cVel.x = 0;
        }
    }
    else {
        if (applyDouble && main_1.player[p].phys.cVel.x < -main_1.player[p].charAttributes.maxWalk) {
            main_1.player[p].phys.cVel.x += main_1.player[p].charAttributes.traction * 2;
        }
        else {
            main_1.player[p].phys.cVel.x += main_1.player[p].charAttributes.traction;
        }
        if (main_1.player[p].phys.cVel.x > 0) {
            main_1.player[p].phys.cVel.x = 0;
        }
    }
}
function airDrift(p, input) {
    if (Math.abs(input[p][0].lsX) < 0.3) {
        var tempMax = 0;
    }
    else {
        var tempMax = main_1.player[p].charAttributes.aerialHmaxV * input[p][0].lsX;
    }
    if ((tempMax < 0 && main_1.player[p].phys.cVel.x < tempMax) || (tempMax > 0 && main_1.player[p].phys.cVel.x > tempMax)) {
        if (main_1.player[p].phys.cVel.x > 0) {
            main_1.player[p].phys.cVel.x -= main_1.player[p].charAttributes.airFriction;
            if (main_1.player[p].phys.cVel.x < 0) {
                main_1.player[p].phys.cVel.x = 0;
            }
        }
        else {
            main_1.player[p].phys.cVel.x += main_1.player[p].charAttributes.airFriction;
            if (main_1.player[p].phys.cVel.x > 0) {
                main_1.player[p].phys.cVel.x = 0;
            }
        }
    }
    else if (Math.abs(input[p][0].lsX) > 0.3 && ((tempMax < 0 && main_1.player[p].phys.cVel.x > tempMax) ||
        (tempMax > 0 && main_1.player[p].phys.cVel.x < tempMax))) {
        main_1.player[p].phys.cVel.x += (main_1.player[p].charAttributes.airMobA * input[p][0].lsX) + (Math.sign(input[p][0].lsX) * main_1.player[p].charAttributes.airMobB);
    }
    if (Math.abs(input[p][0].lsX) < 0.3) {
        if (main_1.player[p].phys.cVel.x > 0) {
            main_1.player[p].phys.cVel.x -= main_1.player[p].charAttributes.airFriction;
            if (main_1.player[p].phys.cVel.x < 0) {
                main_1.player[p].phys.cVel.x = 0;
            }
        }
        else {
            main_1.player[p].phys.cVel.x += main_1.player[p].charAttributes.airFriction;
            if (main_1.player[p].phys.cVel.x > 0) {
                main_1.player[p].phys.cVel.x = 0;
            }
        }
    }
}
function fastfall(p, input) {
    if (!main_1.player[p].phys.fastfalled) {
        main_1.player[p].phys.cVel.y -= main_1.player[p].charAttributes.gravity;
        if (main_1.player[p].phys.cVel.y < -main_1.player[p].charAttributes.terminalV) {
            main_1.player[p].phys.cVel.y = -main_1.player[p].charAttributes.terminalV;
        }
        if (input[p][0].lsY < -0.65 && input[p][3].lsY > -0.1 && main_1.player[p].phys.cVel.y <
            0) {
            sfx_1.sounds.fastfall.play();
            main_1.player[p].phys.fastfalled = true;
            main_1.player[p].phys.cVel.y = -main_1.player[p].charAttributes.fastFallV;
        }
    }
}
function shieldDepletion(p, input) {
    //(0.28*input - (1-input/10))
    input = Math.max(input[p][0].lA, input[p][0].rA);
    main_1.player[p].phys.shieldHP -= 0.28 * input - ((1 - input) / 10);
    if (main_1.player[p].phys.shieldHP <= 0) {
        main_1.player[p].phys.shielding = false;
        main_1.player[p].phys.kVel.y = main_1.player[p].charAttributes.shieldBreakVel;
        main_1.player[p].phys.kDec.y = 0.051;
        main_1.player[p].phys.kDec.x = 0;
        main_1.player[p].phys.grounded = false;
        main_1.player[p].phys.shieldHP = 0;
        (0, drawVfx_1.drawVfx)({
            name: "breakShield",
            pos: main_1.player[p].phys.pos,
            face: main_1.player[p].phys.face
        });
        sfx_1.sounds.shieldbreak.play();
        exports.actionStates[main_1.characterSelections[p]].SHIELDBREAKFALL.init(p, input);
    }
}
function shieldSize(p, lock, input) {
    //shield size * 0.575 * model scaling
    //(shield size * 0.575 * hp/60) + (1-input)*0.60714*shieldsize
    main_1.player[p].phys.shieldAnalog = Math.max(input[p][0].lA, input[p][0].rA);
    if (main_1.player[p].phys.shieldAnalog === 0) {
        main_1.player[p].phys.shieldAnalog = 1;
    }
    if (lock && main_1.player[p].phys.shieldAnalog == 0) {
        main_1.player[p].phys.shieldAnalog = 1;
    }
    main_1.player[p].phys.shieldSize = (main_1.player[p].charAttributes.shieldScale * 0.575 * main_1.player[p].charAttributes.modelScale * (main_1.player[p].phys.shieldHP / 60)) + ((1 - main_1.player[p].phys.shieldAnalog) * 0.6 * main_1.player[p].charAttributes.shieldScale) +
        ((60 - main_1.player[p].phys.shieldHP) / 60 * 2);
}
function mashOut(p, input) {
    if (input[p][0].a && !input[p][1].a) {
        return true;
    }
    else if (input[p][0].b && !input[p][1].b) {
        return true;
    }
    else if (input[p][0].x && !input[p][1].x) {
        return true;
    }
    else if (input[p][0].y && !input[p][1].y) {
        return true;
    }
    else if (input[p][0].lsX > 0.8 && !(input[p][1].lsX < 0.7)) {
        return true;
    }
    else if (input[p][0].lsX < -0.8 && !(input[p][1].lsX < -0.7)) {
        return true;
    }
    else if (input[p][0].lsY > 0.8 && !(input[p][1].lsY < 0.7)) {
        return true;
    }
    else if (input[p][0].lsY < -0.8 && !(input[p][1].lsY > -0.7)) {
        return true;
    }
    else if (input[p][0].csX > 0.8 && !(input[p][1].csX < 0.7)) {
        return true;
    }
    else if (input[p][0].csX < -0.8 && !(input[p][1].csX < -0.7)) {
        return true;
    }
    else if (input[p][0].csY > 0.8 && !(input[p][1].csY < 0.7)) {
        return true;
    }
    else if (input[p][0].csY < -0.8 && !(input[p][1].csY > -0.7)) {
        return true;
    }
    else {
        return false;
    }
}
// Global Interrupts
function checkForSmashes(p, input) {
    if (input[p][0].a && !input[p][1].a) {
        if (Math.abs(input[p][0].lsX) >= 0.79 && input[p][2].lsX * Math.sign(input[p][0].lsX) < 0.3) {
            main_1.player[p].phys.face = Math.sign(input[p][0].lsX);
            return [true, "FORWARDSMASH"];
        }
        else if (input[p][0].lsY >= 0.66 && input[p][2].lsY < 0.3) {
            return [true, "UPSMASH"];
        }
        else if (input[p][0].lsY <= -0.66 && input[p][2].lsY > -0.3) {
            return [true, "DOWNSMASH"];
        }
        else {
            return [false, false];
        }
    }
    else if (Math.abs(input[p][0].csX) >= 0.79 && Math.abs(input[p][1].csX) < 0.79) {
        main_1.player[p].phys.face = Math.sign(input[p][0].csX);
        return [true, "FORWARDSMASH"];
    }
    else if (input[p][0].csY >= 0.66 && input[p][1].csY < 0.66) {
        return [true, "UPSMASH"];
    }
    else if (input[p][0].csY <= -0.66 && input[p][1].csY > -0.66) {
        return [true, "DOWNSMASH"];
    }
    else {
        return [false, false];
    }
}
function checkForTilts(p, input, reverse = 1) {
    if (input[p][0].a && !input[p][1].a) {
        if (input[p][0].lsX * main_1.player[p].phys.face * reverse > 0.3 && Math.abs(input[p][0].lsX) - (Math.abs(input[p][0].lsY)) > -0.05) {
            return [true, "FORWARDTILT"];
        }
        else if (input[p][0].lsY < -0.3) {
            return [true, "DOWNTILT"];
        }
        else if (input[p][0].lsY > 0.3) {
            return [true, "UPTILT"];
        }
        else {
            return [true, "JAB1"];
        }
    }
    else {
        return [false, false];
    }
}
function checkForIASA(p, input, isAerial) {
    if (main_1.player[p].timer > main_1.player[p].IASATimer) {
        if (isAerial) {
            const a = checkForAerials(p, input);
            if ((checkForDoubleJump(p, input) && (!main_1.player[p].phys.doubleJumped)) || (checkForMultiJump(p, input) && main_1.player[p].phys.jumpsUsed < 5 && main_1.player[p].charAttributes.multiJump)) {
                if (input[p][0].lsX * main_1.player[p].phys.face < -0.3) {
                    JUMPAERIALB_1.default.init(p, input);
                }
                else {
                    JUMPAERIALF_1.default.init(p, input);
                }
                return true;
            }
            else if (a[0]) {
                if (main_1.characterSelections[p] == 0) {
                    index_3.default[a[1]].init(p, input);
                }
                else if (main_1.characterSelections[p] == 1) {
                    index_2.default[a[1]].init(p, input);
                }
                else if (main_1.characterSelections[p] == 2) {
                    index_1.default[a[1]].init(p, input);
                }
                return true;
            }
            else {
                return false;
            }
        }
        else { //isn't aerial
        }
    }
    return false; //i guess???
}
function checkForSpecials(p, input) {
    if (input[p][0].b && !input[p][1].b) {
        if (main_1.player[p].phys.grounded) {
            if (Math.abs(input[p][0].lsX) > 0.59 || (input[p][0].lsY > 0.54 && Math.abs(input[p][0].lsX) > input[p][0].lsY - 0.2)) {
                main_1.player[p].phys.face = Math.sign(input[p][0].lsX);
                return [true, "SIDESPECIALGROUND"];
            }
            else if (input[p][0].lsY > 0.54) {
                return [true, "UPSPECIAL"];
            }
            else if (input[p][0].lsY < -0.54) {
                return [true, "DOWNSPECIALGROUND"];
            }
            else {
                return [true, "NEUTRALSPECIALGROUND"];
            }
        }
        else {
            if (input[p][0].lsY > 0.54 || (Math.abs(input[p][0].lsX) > 0.59 && input[p][0].lsY > Math.abs(input[p][0].lsX) - 0.2)) {
                return [true, "UPSPECIAL"];
            }
            else if (input[p][0].lsY < -0.54 || (Math.abs(input[p][0].lsX) > 0.59 && -input[p][0].lsY > Math.abs(input[p][0].lsX) - 0.2)) {
                return [true, "DOWNSPECIALAIR"];
            }
            else if (Math.abs(input[p][0].lsX) > 0.59) {
                main_1.player[p].phys.face = Math.sign(input[p][0].lsX);
                return [true, "SIDESPECIALAIR"];
            }
            else {
                if (input[p][0].lsX * main_1.player[p].phys.face < -0.25) {
                    main_1.player[p].phys.face *= -1;
                }
                else if (main_1.player[p].phys.bTurnaroundTimer > 0) {
                    main_1.player[p].phys.face = main_1.player[p].phys.bTurnaroundDirection;
                }
                return [true, "NEUTRALSPECIALAIR"];
            }
        }
    }
    else {
        return [false, false];
    }
}
function checkForAerials(p, input) {
    //console.log(p);
    //console.log(input);
    //console.log(input[p]);
    if (input[p][0].csX * main_1.player[p].phys.face >= 0.3 && input[p][1].csX * main_1.player[p].phys
        .face < 0.3 && Math.abs(input[p][0].csX) > Math.abs(input[p][0].csY) - 0.1) {
        return [true, "ATTACKAIRF"];
    }
    else if (input[p][0].csX * main_1.player[p].phys.face <= -0.3 && input[p][1].csX *
        main_1.player[p].phys.face > -0.3 && Math.abs(input[p][0].csX) > Math.abs(input[p][0].csY) - 0.1) {
        return [true, "ATTACKAIRB"];
    }
    else if (input[p][0].csY >= 0.3 && input[p][1].csY < 0.3) {
        return [true, "ATTACKAIRU"];
    }
    else if (input[p][0].csY < -0.3 && input[p][1].csY > -0.3) {
        return [true, "ATTACKAIRD"];
    }
    else if ((input[p][0].a && !input[p][1].a) || (input[p][0].z && !input[p][1].z)) {
        if (input[p][0].lsX * main_1.player[p].phys.face > 0.3 && Math.abs(input[p][0].lsX) >
            Math.abs(input[p][0].lsY) - 0.1) {
            return [true, "ATTACKAIRF"];
        }
        else if (input[p][0].lsX * main_1.player[p].phys.face < -0.3 && Math.abs(input[p][0].lsX) > Math.abs(input[p][0].lsY) - 0.1) {
            return [true, "ATTACKAIRB"];
        }
        else if (input[p][0].lsY > 0.3) {
            return [true, "ATTACKAIRU"];
        }
        else if (input[p][0].lsY < -0.3) {
            return [true, "ATTACKAIRD"];
        }
        else {
            return [true, "ATTACKAIRN"];
        }
    }
    return [false, 0];
}
function checkForDash(p, input) {
    return input[p][0].lsX * main_1.player[p].phys.face > 0.79 && input[p][2].lsX * main_1.player[p].phys.face < 0.3;
}
function checkForSmashTurn(p, input) {
    return input[p][0].lsX * main_1.player[p].phys.face < -0.79 && input[p][2].lsX * main_1.player[p].phys.face > -0.3;
}
function tiltTurnDashBuffer(p, input) {
    return input[p][1].lsX * main_1.player[p].phys.face > -0.3;
}
function checkForTiltTurn(p, input) {
    return input[p][0].lsX * main_1.player[p].phys.face < -0.3;
}
function checkForJump(p, input) {
    if ((input[p][0].x && !input[p][1].x) || (input[p][0].y && !input[p][1].y)) {
        return [true, 0];
    }
    else if (settings_1.gameSettings["tapJumpOffp" + (p + 1)] == false && (input[p][0].lsY > 0.66 && input[p][3].lsY < 0.2)) { // == is on purpose
        return [true, 1];
    }
    else {
        return [false, false];
    }
}
function checkForDoubleJump(p, input) {
    return ((input[p][0].x && !input[p][1].x)
        || (input[p][0].y && !input[p][1].y)
        || (settings_1.gameSettings["tapJumpOffp" + (p + 1)] == false && (input[p][0].lsY > 0.69 && input[p][1].lsY <= 0.69)));
}
function checkForMultiJump(p, input) {
    return !!(input[p][0].x || input[p][0].y || (settings_1.gameSettings["tapJumpOffp" + (p + 1)] == false && input[p][0].lsY > 0.7));
}
function checkForSquat(p, input) {
    return input[p][0].lsY < -0.69;
}
function turboAirborneInterrupt(p, input) {
    var a = checkForAerials(p, input);
    var b = checkForSpecials(p, input);
    if (a[0] && a[1] != main_1.player[p].actionState) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]][a[1]].init(p, input);
        return true;
    }
    else if ((input[p][0].l && !input[p][1].l) || (input[p][0].r && !input[p][1].r)) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]].ESCAPEAIR.init(p, input);
        return true;
    }
    else if (((input[p][0].x && !input[p][1].x) || (input[p][0].y && !input[p][1].y) ||
        (input[p][0].lsY > 0.7 && input[p][1].lsY <= 0.7)) && (!main_1.player[p].phys.doubleJumped ||
        (main_1.player[p].phys.jumpsUsed < 5 && main_1.player[p].charAttributes.multiJump))) {
        turnOffHitboxes(p);
        if (input[p][0].lsX * main_1.player[p].phys.face < -0.3) {
            exports.actionStates[main_1.characterSelections[p]].JUMPAERIALB.init(p, input);
        }
        else {
            exports.actionStates[main_1.characterSelections[p]].JUMPAERIALF.init(p, input);
        }
        return true;
    }
    else if (b[0] && b[1] != main_1.player[p].actionState) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]][b[1]].init(p, input);
        return true;
    }
    else {
        return false;
    }
}
function turboGroundedInterrupt(p, input) {
    var b = checkForSpecials(p, input);
    var t = checkForTilts(p, input);
    var s = checkForSmashes(p, input);
    var j = checkForJump(p, input);
    if (j[0]) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]].KNEEBEND.initWithType(p, input, j[1]);
        return true;
    }
    else if (input[p][0].l || input[p][0].r) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]].GUARDON.init(p, input);
        return true;
    }
    else if (input[p][0].lA > 0 || input[p][0].rA > 0) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]].GUARDON.init(p, input);
        return true;
    }
    else if (b[0] && b[1] != main_1.player[p].actionState) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]][b[1]].init(p, input);
        return true;
    }
    else if (s[0] && s[1] != main_1.player[p].actionState) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]][s[1]].init(p, input);
        return true;
    }
    else if (t[0] && t[1] != main_1.player[p].actionState) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]][t[1]].init(p, input);
        return true;
    }
    else if (checkForSquat(p, input)) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]].SQUAT.init(p, input);
        return true;
    }
    else if (checkForDash(p, input)) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]].DASH.init(p, input);
        return true;
    }
    else if (checkForSmashTurn(p, input)) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]].SMASHTURN.init(p, input);
        return true;
    }
    else if (checkForTiltTurn(p, input)) {
        turnOffHitboxes(p);
        main_1.player[p].phys.dashbuffer = tiltTurnDashBuffer(p, input);
        exports.actionStates[main_1.characterSelections[p]].TILTTURN.init(p, input);
        return true;
    }
    else if (Math.abs(input[p][0].lsX) > 0.3) {
        turnOffHitboxes(p);
        exports.actionStates[main_1.characterSelections[p]].WALK.init(p, input, true);
        return true;
    }
    else {
        return false;
    }
}
exports.actionStates = [];
function setupActionStates(index, val) {
    exports.actionStates[index] = (0, deepCopy_1.deepCopyObject)(true, val);
}
/* char id:
0 - marth
1 - jiggs
2 - fox
*/
