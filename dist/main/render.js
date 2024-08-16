"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lostStockQueue = exports.twoPi = exports.hurtboxColours = void 0;
exports.rotateVector = rotateVector;
exports.drawArrayPathCompress = drawArrayPathCompress;
exports.renderPlayer = renderPlayer;
exports.renderOverlay = renderOverlay;
exports.setLostStockQueue = setLostStockQueue;
exports.renderForeground = renderForeground;
exports.resetLostStockQueue = resetLostStockQueue;
const main_1 = require("main/main");
const settings_1 = require("settings");
const makeColour_1 = require("main/vfx/makeColour");
const actionStateShortcuts_1 = require("physics/actionStateShortcuts");
const blendColours_1 = require("main/vfx/blendColours");
const activeStage_1 = require("stages/activeStage");
const Vec2D_1 = require("./util/Vec2D");
const characters_1 = require("./characters");
const animations_1 = require("../animations");
/* eslint-disable */
exports.hurtboxColours = [(0, makeColour_1.makeColour)(255, 237, 70, 0.6), (0, makeColour_1.makeColour)(42, 57, 255, 0.6), (0, makeColour_1.makeColour)(54, 255, 37, 0.6)];
exports.twoPi = Math.PI * 2;
exports.lostStockQueue = [];
function rotateVector(vecx, vecy, ang) {
    return new Vec2D_1.Vec2D(vecx * Math.cos(ang) - vecy * Math.sin(ang), vecx * Math.sin(ang) + vecy * Math.cos(ang));
}
function drawArrayPathCompress(can, col, face, tX, tY, path, scaleX, scaleY, rotate, rpX, rpY, extra) {
    can.save();
    extra === null || extra === void 0 ? void 0 : extra();
    can.translate(tX - rpX, tY - rpY);
    can.rotate(rotate);
    can.fillStyle = col;
    can.beginPath();
    // for each shape
    if (path !== undefined && path !== null && path.length !== undefined) {
        for (var j = 0; j < path.length; j++) {
            // first 2 numbers are starting vector points
            var x = (path[j][0] * scaleX * face) + rpX;
            var y = (path[j][1] * scaleY) + rpY;
            can.moveTo(x, y);
            // starting from index 2, each set of 6 numbers are bezier curve coords
            for (var k = 2; k < path[j].length; k += 6) {
                can.bezierCurveTo((path[j][k] * scaleX * face) + rpX, (path[j][k + 1] * scaleY) + rpY, (path[j][k + 2] * scaleX *
                    face) + rpX, (path[j][k + 3] * scaleY) + rpY, (path[j][k + 4] * scaleX * face) + rpX, (path[j][k + 5] *
                    scaleY) + rpY);
            }
        }
    }
    can.closePath();
    can.fill();
    can.restore();
}
function renderPlayer(i) {
    var temX = (main_1.player[i].phys.pos.x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0];
    var temY = (main_1.player[i].phys.pos.y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1];
    var face = main_1.player[i].phys.face;
    var frame = Math.floor(main_1.player[i].timer);
    if (frame == 0) {
        frame = 1;
    }
    if (frame > characters_1.framesData[main_1.characterSelections[i]][main_1.player[i].actionState]) {
        frame = characters_1.framesData[main_1.characterSelections[i]][main_1.player[i].actionState];
    }
    if (animations_1.animations[main_1.characterSelections[i]][main_1.player[i].actionState] === undefined) {
        return;
    }
    if (animations_1.animations[main_1.characterSelections[i]][main_1.player[i].actionState][frame - 1] === undefined) {
        return;
    }
    var model = animations_1.animations[main_1.characterSelections[i]][main_1.player[i].actionState][frame - 1];
    if (actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].reverseModel) {
        face *= -1;
    }
    else if (main_1.player[i].actionState == "TILTTURN") {
        if (frame > 5) {
            face *= -1;
        }
    }
    else if (main_1.player[i].actionState == "RUNTURN") {
        if (frame > main_1.player[i].charAttributes.runTurnBreakPoint) {
            face *= -1;
        }
    }
    // JiGGS MULTIJUMP TURN
    else if (main_1.player[i].actionState.substring(0, main_1.player[i].actionState.length - 1) == "AERIALTURN" && main_1.player[i].timer >
        5) {
        face *= -1;
    }
    // MARTH BAIR
    else if (main_1.player[i].actionState == "ATTACKAIRB" && main_1.characterSelections[i] == 0) {
        if (frame > 29) {
            face *= -1;
        }
    }
    // FOX BTHROW
    else if (main_1.player[i].actionState == "THROWBACK" && (main_1.characterSelections[i] == 2 || main_1.characterSelections[i] == 3)) {
        if (frame >= 10) {
            face *= -1;
        }
    }
    if (!actionStateShortcuts_1.actionStates[main_1.characterSelections[i]][main_1.player[i].actionState].dead) {
        var col;
        if (main_1.player[i].phys.shielding && main_1.player[i].phys.powerShielded && main_1.player[i].hit.hitlag > 0) {
            col = "rgb(255,255,255)";
        }
        else if (settings_1.gameSettings.flashOnLCancel && main_1.player[i].actionState.substr(0, 10) == "LANDINGATT" && main_1.player[i].phys.landingLagScaling ==
            2 && Math.round(main_1.player[i].timer) % 3 == 0) {
            col = "rgb(255,255,255)";
        }
        else if (main_1.player[i].phys.intangibleTimer % 9 > 3 || main_1.player[i].phys.invincibleTimer % 9 > 3 || main_1.player[i].hit.hitlag >
            0) {
            col = main_1.palettes[main_1.pPal[i]][1];
        }
        else if (main_1.player[i].phys.charging && main_1.player[i].phys.chargeFrames % 9 > 3) {
            col = "rgb(252, 255, 91)";
        }
        else if (main_1.player[i].actionState == "FURAFURA" && main_1.player[i].timer % 30 < 6) {
            col = main_1.palettes[main_1.pPal[i]][3];
        }
        else if (main_1.player[i].colourOverlayBool) {
            col = main_1.player[i].colourOverlay;
        }
        else if (main_1.player[i].shocked > 0) {
            var originalColour = main_1.palettes[main_1.pPal[i]][0];
            originalColour = originalColour.substr(4, originalColour.length - 5);
            var colourArray = originalColour.split(",");
            if (main_1.player[i].shocked % 2) {
                var newCol = (0, blendColours_1.blendColours)(colourArray, [14, 0, 131], 0.7);
            }
            else {
                var newCol = (0, blendColours_1.blendColours)(colourArray, [255, 255, 255], 0.7);
            }
            col = "rgb(" + newCol[0] + "," + newCol[1] + "," + newCol[2] + ")";
        }
        else if (main_1.player[i].burning > 0) {
            var originalColour = main_1.palettes[main_1.pPal[i]][0];
            originalColour = originalColour.substr(4, originalColour.length - 5);
            var colourArray = originalColour.split(",");
            var part = main_1.player[i].burning % 3;
            if (part) {
                if (part == 1) {
                    var newCol = (0, blendColours_1.blendColours)(colourArray, [253, 255, 161], 0.7);
                }
                else {
                    var newCol = (0, blendColours_1.blendColours)(colourArray, [198, 57, 5], 0.7);
                }
                col = "rgb(" + newCol[0] + "," + newCol[1] + "," + newCol[2] + ")";
            }
            else {
                col = main_1.palettes[main_1.pPal[i]][0];
            }
        }
        else {
            col = main_1.palettes[main_1.pPal[i]][0];
        }
        if (main_1.player[i].phys.chargeFrames % 4 == 3) {
            temX += 2;
        }
        else if (main_1.player[i].phys.chargeFrames % 4 == 1) {
            temX -= 2;
        }
        if (temX > 1220 || temX < -20 || temY > 880 || temY < -30) {
            var pA = new Vec2D_1.Vec2D(temX - 600, temY - 375);
            var pB = new Vec2D_1.Vec2D(0, 0);
            var s = (pA.y - pB.y) / (pA.x - pB.x);
            if (-375 <= s * 600 && s * 600 <= 375) {
                if (pA.x > pB.x) {
                    main_1.player[i].miniViewPoint = new Vec2D_1.Vec2D(1150, s * 600 + 375);
                    main_1.player[i].miniViewSide = 0;
                }
                else {
                    main_1.player[i].miniViewPoint = new Vec2D_1.Vec2D(50, -s * 600 + 375);
                    main_1.player[i].miniViewSide = 1;
                }
                main_1.player[i].miniView = true;
                main_1.player[i].phys.outOfCameraTimer++;
            }
            else if (-600 <= 375 / s && 375 / s <= 600) {
                if (pA.y > pB.y) {
                    if (temX < 50) {
                        main_1.player[i].miniViewPoint = new Vec2D_1.Vec2D(50, 700);
                    }
                    else if (temX > 1150) {
                        main_1.player[i].miniViewPoint = new Vec2D_1.Vec2D(1150, 700);
                    }
                    else {
                        //player[i].miniViewPoint = new Vec2D(375/s+stage.offset[0],700);
                        main_1.player[i].miniViewPoint = new Vec2D_1.Vec2D(temX, 700);
                    }
                    main_1.player[i].miniViewSide = 2;
                }
                else {
                    main_1.player[i].miniViewPoint = new Vec2D_1.Vec2D(-375 / s + activeStage_1.activeStage.offset[0], 50);
                    main_1.player[i].miniViewSide = 2;
                }
                main_1.player[i].miniView = true;
                main_1.player[i].phys.outOfCameraTimer++;
            }
            else {
                main_1.player[i].miniView = false;
                main_1.player[i].phys.outOfCameraTimer = 0;
            }
        }
        else {
            main_1.player[i].miniView = false;
            main_1.player[i].phys.outOfCameraTimer = 0;
        }
        if (main_1.player[i].miniView && main_1.player[i].actionState != "SLEEP") {
            main_1.fg2.fillStyle = "black";
            main_1.fg2.strokeStyle = main_1.palettes[main_1.pPal[i]][0];
            main_1.fg2.beginPath();
            main_1.fg2.arc(main_1.player[i].miniViewPoint.x, main_1.player[i].miniViewPoint.y, 35, exports.twoPi, 0);
            main_1.fg2.fill();
            main_1.fg2.lineWidth = 6;
            main_1.fg2.stroke();
            main_1.fg2.lineWidth = 1;
            drawArrayPathCompress(main_1.fg2, col, face, main_1.player[i].miniViewPoint.x, main_1.player[i].miniViewPoint.y + 30, model, main_1.player[i].charAttributes.miniScale, main_1.player[i].charAttributes.miniScale, main_1.player[i].rotation, main_1.player[i].rotationPoint
                .x, main_1.player[i].rotationPoint.y);
        }
        else {
            if (main_1.player[i].actionState == "ENTRANCE") {
                drawArrayPathCompress(main_1.fg2, col, face, temX, temY, model, main_1.player[i].charAttributes.charScale * (activeStage_1.activeStage.scale /
                    4.5), Math.min(main_1.player[i].charAttributes.charScale, main_1.player[i].charAttributes.charScale * (1.5 -
                    main_1.startTimer)) * (activeStage_1.activeStage.scale / 4.5), main_1.player[i].rotation, main_1.player[i].rotationPoint.x, main_1.player[i].rotationPoint
                    .y);
            }
            else {
                drawArrayPathCompress(main_1.fg2, col, face, temX, temY, model, main_1.player[i].charAttributes.charScale * (activeStage_1.activeStage.scale /
                    4.5), main_1.player[i].charAttributes.charScale * (activeStage_1.activeStage.scale / 4.5), main_1.player[i].rotation, main_1.player[i].rotationPoint
                    .x, main_1.player[i].rotationPoint.y);
            }
        }
    }
    if (main_1.player[i].phys.shielding) {
        if (!(main_1.player[i].phys.powerShielded && main_1.player[i].hit.hitlag > 0)) {
            var sX = ((main_1.player[i].phys.shieldPositionReal.x) * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0];
            var sY = ((main_1.player[i].phys.shieldPositionReal.y) * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1];
            var sCol = main_1.palettes[main_1.pPal[i]][2];
            if (Math.floor(main_1.player[i].hit.shieldstun) > 0) {
                sCol = main_1.palettes[main_1.pPal[i]][4];
            }
            main_1.fg2.fillStyle = sCol + (0.6 * main_1.player[i].phys.shieldAnalog) + ")";
            main_1.fg2.beginPath();
            main_1.fg2.arc(sX, sY, main_1.player[i].phys.shieldSize * activeStage_1.activeStage.scale, exports.twoPi, 0);
            main_1.fg2.fill();
        }
    }
    if (main_1.hasTag[i]) {
        main_1.fg2.fillStyle = (0, makeColour_1.makeColour)(0, 0, 0, 0.5);
        main_1.fg2.strokeStyle = main_1.palettes[main_1.pPal[i]][0];
        var size = 10 * main_1.tagText[i].length;
        main_1.fg2.fillRect(temX - size / 2, temY - 130 * (activeStage_1.activeStage.scale / 4.5), size, 20);
        main_1.fg2.strokeRect(temX - size / 2, temY - 130 * (activeStage_1.activeStage.scale / 4.5), size, 20);
        main_1.fg2.font = "13px Lucida Console, monaco, monospace";
        main_1.fg2.textAlign = "center";
        main_1.fg2.fillStyle = "white";
        main_1.fg2.fillText(main_1.tagText[i], temX, temY + 15 - 130 * (activeStage_1.activeStage.scale / 4.5));
        main_1.fg2.fillStyle = main_1.palettes[main_1.pPal[i]][0];
        main_1.fg2.beginPath();
        main_1.fg2.moveTo(temX - 8, temY + 20 - 130 * (activeStage_1.activeStage.scale / 4.5));
        main_1.fg2.lineTo(temX + 8, temY + 20 - 130 * (activeStage_1.activeStage.scale / 4.5));
        main_1.fg2.lineTo(temX, temY + 28 - 130 * (activeStage_1.activeStage.scale / 4.5));
        main_1.fg2.closePath();
        main_1.fg2.fill();
        main_1.fg2.textAlign = "start";
    }
    if (main_1.player[i].actionState == "REBIRTH" || main_1.player[i].actionState == "REBIRTHWAIT") {
        main_1.fg2.fillStyle = main_1.palettes[main_1.pPal[i]][1];
        main_1.fg2.strokeStyle = main_1.palettes[main_1.pPal[i]][0];
        main_1.fg2.beginPath();
        main_1.fg2.moveTo(temX + 18 * (activeStage_1.activeStage.scale / 4.5), temY + 13.5 * (activeStage_1.activeStage.scale / 4.5));
        main_1.fg2.lineTo(temX + 31.5 * (activeStage_1.activeStage.scale / 4.5), temY);
        main_1.fg2.lineTo(temX - 31.5 * (activeStage_1.activeStage.scale / 4.5), temY);
        main_1.fg2.lineTo(temX - 18 * (activeStage_1.activeStage.scale / 4.5), temY + 13.5 * (activeStage_1.activeStage.scale / 4.5));
        main_1.fg2.closePath();
        main_1.fg2.fill();
        main_1.fg2.stroke();
    }
    if (main_1.player[i].showLedgeGrabBox) {
        main_1.fg2.strokeStyle = "#4478ff";
        main_1.fg2.strokeRect(main_1.player[i].phys.ledgeSnapBoxF.min.x * activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[0], main_1.player[i].phys.ledgeSnapBoxF.min
            .y * -activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[1], 14 * activeStage_1.activeStage.scale, 10 * activeStage_1.activeStage.scale);
        main_1.fg2.strokeStyle = "#ff4444";
        main_1.fg2.strokeRect(main_1.player[i].phys.ledgeSnapBoxB.min.x * activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[0], main_1.player[i].phys.ledgeSnapBoxB.min
            .y * -activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[1], 14 * activeStage_1.activeStage.scale, 10 * activeStage_1.activeStage.scale);
    }
    if (main_1.player[i].showECB) {
        main_1.fg2.fillStyle = "#ff8d2f";
        main_1.fg2.beginPath();
        main_1.fg2.moveTo((main_1.player[i].phys.ECB1[0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.ECB1[0].y * -activeStage_1.activeStage.scale) +
            activeStage_1.activeStage.offset[1]);
        main_1.fg2.lineTo((main_1.player[i].phys.ECB1[1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.ECB1[1].y * -activeStage_1.activeStage.scale) +
            activeStage_1.activeStage.offset[1]);
        main_1.fg2.lineTo((main_1.player[i].phys.ECB1[2].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.ECB1[2].y * -activeStage_1.activeStage.scale) +
            activeStage_1.activeStage.offset[1]);
        main_1.fg2.lineTo((main_1.player[i].phys.ECB1[3].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.ECB1[3].y * -activeStage_1.activeStage.scale) +
            activeStage_1.activeStage.offset[1]);
        main_1.fg2.closePath();
        main_1.fg2.fill();
        main_1.fg2.strokeStyle = "white";
        main_1.fg2.beginPath();
        main_1.fg2.moveTo((main_1.player[i].phys.ECBp[0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.ECBp[0].y * -activeStage_1.activeStage.scale) +
            activeStage_1.activeStage.offset[1]);
        main_1.fg2.lineTo((main_1.player[i].phys.ECBp[1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.ECBp[1].y * -activeStage_1.activeStage.scale) +
            activeStage_1.activeStage.offset[1]);
        main_1.fg2.lineTo((main_1.player[i].phys.ECBp[2].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.ECBp[2].y * -activeStage_1.activeStage.scale) +
            activeStage_1.activeStage.offset[1]);
        main_1.fg2.lineTo((main_1.player[i].phys.ECBp[3].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.ECBp[3].y * -activeStage_1.activeStage.scale) +
            activeStage_1.activeStage.offset[1]);
        main_1.fg2.closePath();
        main_1.fg2.stroke();
        main_1.fg2.beginPath();
        main_1.fg2.moveTo(temX, temY - 6);
        main_1.fg2.lineTo(temX, temY + 6);
        main_1.fg2.closePath();
        main_1.fg2.stroke();
        main_1.fg2.beginPath();
        main_1.fg2.moveTo(temX + 6, temY);
        main_1.fg2.lineTo(temX - 6, temY);
        main_1.fg2.closePath();
        main_1.fg2.stroke();
    }
    if (main_1.player[i].showHitbox) {
        main_1.fg2.fillStyle = exports.hurtboxColours[main_1.player[i].phys.hurtBoxState];
        main_1.fg2.fillRect(main_1.player[i].phys.hurtbox.min.x * activeStage_1.activeStage.scale + activeStage_1.activeStage.offset[0], main_1.player[i].phys.hurtbox.min.y * -activeStage_1.activeStage.scale +
            activeStage_1.activeStage.offset[1], main_1.player[i].charAttributes.hurtboxOffset[0] * 2 * activeStage_1.activeStage.scale, main_1.player[i].charAttributes.hurtboxOffset[1] * activeStage_1.activeStage.scale);
        main_1.fg2.fillStyle = (0, makeColour_1.makeColour)(255, 29, 29, 0.69);
        for (var j = 0; j < 4; j++) {
            switch (j) {
                case 0:
                    main_1.fg2.fillStyle = (0, makeColour_1.makeColour)(255, 29, 29, 0.69);
                    main_1.fg2.strokeStyle = (0, makeColour_1.makeColour)(255, 126, 126, 0.69);
                    break;
                case 1:
                    main_1.fg2.fillStyle = (0, makeColour_1.makeColour)(47, 255, 29, 0.69);
                    main_1.fg2.strokeStyle = (0, makeColour_1.makeColour)(126, 252, 115, 0.69);
                    break;
                case 2:
                    main_1.fg2.fillStyle = (0, makeColour_1.makeColour)(29, 208, 255, 0.69);
                    main_1.fg2.strokeStyle = (0, makeColour_1.makeColour)(117, 226, 255, 0.69);
                    break;
                case 3:
                    main_1.fg2.fillStyle = (0, makeColour_1.makeColour)(203, 29, 255, 0.69);
                    main_1.fg2.strokeStyle = (0, makeColour_1.makeColour)(216, 116, 246, 0.69);
                    break;
                default:
                    break;
            }
            if (main_1.player[i].hitboxes.active[j]) {
                var offset = main_1.player[i].hitboxes.id[j].offset[main_1.player[i].hitboxes.frame];
                if (main_1.player[i].actionState == "DAMAGEFLYN") {
                    offset = main_1.player[i].hitboxes.id[j].offset[0];
                }
                main_1.fg2.beginPath();
                main_1.fg2.arc(((offset.x * main_1.player[i].phys.face + main_1.player[i].phys.pos.x) * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], ((offset.y +
                    main_1.player[i].phys.pos.y) * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1], main_1.player[i].hitboxes.id[j].size * activeStage_1.activeStage.scale, Math.PI * 2, 0);
                main_1.fg2.fill();
                if (main_1.player[i].phys.prevFrameHitboxes.active[j]) {
                    var offset = main_1.player[i].phys.prevFrameHitboxes.id[j].offset[main_1.player[i].phys.prevFrameHitboxes.frame];
                    if (main_1.player[i].actionState == "DAMAGEFLYN") {
                        offset = main_1.player[i].phys.prevFrameHitboxes.id[j].offset[0];
                    }
                    main_1.fg2.beginPath();
                    main_1.fg2.arc(((offset.x * main_1.player[i].phys.facePrev + main_1.player[i].phys.posPrev.x) * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], ((offset.y + main_1.player[i].phys.posPrev.y) * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1], main_1.player[i].phys.prevFrameHitboxes
                        .id[j].size * activeStage_1.activeStage.scale, Math.PI * 2, 0);
                    main_1.fg2.fill();
                    //console.log(player[i].phys.interPolatedHitbox[j]);
                    main_1.fg2.beginPath();
                    main_1.fg2.moveTo((main_1.player[i].phys.interPolatedHitbox[j][0].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.interPolatedHitbox[j][0].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
                    main_1.fg2.lineTo((main_1.player[i].phys.interPolatedHitbox[j][1].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.interPolatedHitbox[j][1].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
                    main_1.fg2.lineTo((main_1.player[i].phys.interPolatedHitbox[j][2].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.interPolatedHitbox[j][2].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
                    main_1.fg2.lineTo((main_1.player[i].phys.interPolatedHitbox[j][3].x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (main_1.player[i].phys.interPolatedHitbox[j][3].y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
                    main_1.fg2.closePath();
                    main_1.fg2.fill();
                    main_1.fg2.stroke();
                }
            }
        }
    }
}
function renderOverlay(showStock) {
    // stocks, percent, timer
    main_1.fg2.strokeStyle = "black";
    if (!main_1.versusMode || main_1.gameMode == 5) {
        main_1.fg2.fillStyle = "white";
        main_1.fg2.lineWidth = 2;
        main_1.fg2.font = "900 40px Arial";
        main_1.fg2.textAlign = "center";
        var min = (Math.floor(main_1.matchTimer / 60)).toString();
        var sec = (main_1.matchTimer % 60).toFixed(2);
        main_1.fg2.fillText(((min.length < 2) ? "0" + min : min) + ":" + ((sec.length < 5) ? "0" + sec[0] : sec[0] + sec[1]), 590, 70);
        main_1.fg2.strokeText(((min.length < 2) ? "0" + min : min) + ":" + ((sec.length < 5) ? "0" + sec[0] : sec[0] + sec[1]), 590, 70);
        main_1.fg2.font = "900 25px Arial";
        main_1.fg2.fillText(((sec.length < 5) ? sec[2] + sec[3] : sec[3] + sec[4]), 670, 70);
        main_1.fg2.strokeText(((sec.length < 5) ? sec[2] + sec[3] : sec[3] + sec[4]), 670, 70);
    }
    if (showStock) {
        main_1.fg2.font = "900 53px Arial";
        main_1.fg2.lineWidth = 2;
        main_1.fg2.textAlign = "end";
        main_1.fg2.save();
        main_1.fg2.scale(0.8, 1);
        for (var i = 0; i < 4; i++) {
            if (main_1.playerType[i] > -1) {
                main_1.fg2.fillStyle = "rgb(255," + Math.max(255 - main_1.player[i].percent, 0) + ", " + Math.max(255 - main_1.player[i].percent, 0) +
                    ")";
                main_1.fg2.fillText(Math.floor(main_1.player[i].percent) + "%", (450 + i * 145 + main_1.player[i].percentShake.x) * 1.25, 670 +
                    main_1.player[i].percentShake.y);
                main_1.fg2.strokeText(Math.floor(main_1.player[i].percent) + "%", (450 + i * 145 + main_1.player[i].percentShake.x) * 1.25, 670 +
                    main_1.player[i].percentShake.y);
            }
        }
        main_1.fg2.restore();
        for (var i = 0; i < 4; i++) {
            if (main_1.playerType[i] > -1) {
                main_1.fg2.fillStyle = main_1.palettes[main_1.pPal[i]][0];
                for (var j = 0; j < main_1.player[i].stocks; j++) {
                    main_1.fg2.beginPath();
                    main_1.fg2.arc(337 + i * 145 + j * 30, 600, 12, 0, exports.twoPi);
                    main_1.fg2.closePath();
                    main_1.fg2.fill();
                    main_1.fg2.stroke();
                }
            }
        }
        const lostStockPopQueue = [];
        main_1.fg2.fillStyle = "white";
        main_1.fg2.strokeStyle = "white";
        for (var i = 0; i < exports.lostStockQueue.length; i++) {
            exports.lostStockQueue[i][2]++;
            if (exports.lostStockQueue[i][2] > 20) {
                lostStockPopQueue.push(i);
            }
            else {
                main_1.fg2.save();
                main_1.fg2.translate(337 + exports.lostStockQueue[i][0] * 145 + exports.lostStockQueue[i][1] * 30 - 2, 600 - 2);
                main_1.fg2.fillRect(exports.lostStockQueue[i][2], 0, 4, 4);
                main_1.fg2.fillRect(exports.lostStockQueue[i][2], exports.lostStockQueue[i][2], 4, 4);
                main_1.fg2.fillRect(-exports.lostStockQueue[i][2], exports.lostStockQueue[i][2], 4, 4);
                main_1.fg2.fillRect(exports.lostStockQueue[i][2], -exports.lostStockQueue[i][2], 4, 4);
                main_1.fg2.fillRect(-exports.lostStockQueue[i][2], -exports.lostStockQueue[i][2], 4, 4);
                main_1.fg2.fillRect(-exports.lostStockQueue[i][2], 0, 4, 4);
                main_1.fg2.fillRect(0, exports.lostStockQueue[i][2], 4, 4);
                main_1.fg2.fillRect(0, -exports.lostStockQueue[i][2], 4, 4);
                main_1.fg2.beginPath();
                main_1.fg2.arc(2, 2, exports.lostStockQueue[i][2] / 2, 0, exports.twoPi);
                main_1.fg2.closePath();
                main_1.fg2.stroke();
                main_1.fg2.restore();
            }
        }
        for (var k = 0; k < lostStockPopQueue.length; k++) {
            exports.lostStockQueue.splice(lostStockPopQueue[k] - k, 1);
        }
        main_1.fg2.textAlign = "start";
    }
}
function setLostStockQueue(index, val) {
    exports.lostStockQueue[index] = val;
}
function renderForeground() {
    // pause UI
    main_1.fg2.textAlign = "start";
    main_1.fg2.fillStyle = "#8e8e8e";
    main_1.fg2.save();
    main_1.fg2.fillRect(45, 48, 300, 24);
    main_1.fg2.fillStyle = "#3724a6";
    main_1.fg2.fillRect(60, 50, 50, 20);
    main_1.fg2.beginPath();
    main_1.fg2.arc(60, 60, 10, 0, exports.twoPi);
    main_1.fg2.closePath();
    main_1.fg2.fill();
    main_1.fg2.beginPath();
    main_1.fg2.arc(110, 60, 10, 0, exports.twoPi);
    main_1.fg2.closePath();
    main_1.fg2.fill();
    main_1.fg2.restore();
    main_1.fg2.save();
    main_1.fg2.translate(950, 650);
    main_1.fg2.fillRect(0, 0, 8, 45);
    main_1.fg2.fillRect(0, 25, 200, 20);
    main_1.fg2.fillRect(192, 0, 8, 45);
    main_1.fg2.fillRect(0, 0, 12, 4);
    main_1.fg2.fillRect(188, 0, 12, 4);
    var xPos = 54;
    for (var j = 0; j < 3; j++) {
        main_1.fg2.fillRect(xPos - 2, -6, 4, 12);
        main_1.fg2.fillRect(xPos - 6, -2, 12, 4);
        xPos += 46;
    }
    main_1.fg2.beginPath();
    main_1.fg2.arc(169, 2, 12, 0, exports.twoPi);
    main_1.fg2.closePath();
    main_1.fg2.fill();
    main_1.fg2.fillStyle = "#21792f";
    main_1.fg2.beginPath();
    main_1.fg2.arc(123, 2, 15, 0, exports.twoPi);
    main_1.fg2.closePath();
    main_1.fg2.fill();
    main_1.fg2.fillStyle = "#9a2622";
    main_1.fg2.beginPath();
    main_1.fg2.arc(40, 62, 12, 0, exports.twoPi);
    main_1.fg2.closePath();
    main_1.fg2.fill();
    main_1.fg2.fillStyle = "#636363";
    main_1.fg2.beginPath();
    main_1.fg2.arc(31, 2, 15, 0.8 * Math.PI, exports.twoPi);
    main_1.fg2.closePath();
    main_1.fg2.fill();
    main_1.fg2.beginPath();
    main_1.fg2.arc(77, 2, 15, exports.twoPi / 2, 0.2 * Math.PI);
    main_1.fg2.closePath();
    main_1.fg2.fill();
    //ui.fillRect(20,59,4,12)
    main_1.fg2.fillRect(14, 55, 4, 12);
    main_1.fg2.fillRect(10, 59, 12, 4);
    main_1.fg2.fillRect(60, 52, 140, 20);
    main_1.fg2.fillStyle = "black";
    main_1.fg2.font = "800 20px Arial";
    main_1.fg2.fillText("S", 158, 8);
    main_1.fg2.fillText("B", 32, 70);
    main_1.fg2.fillText("Z", -872, -583);
    main_1.fg2.font = "800 17px Arial";
    main_1.fg2.fillText("T", 170, 9);
    main_1.fg2.scale(1.2, 1);
    main_1.fg2.font = "900 24px Arial";
    main_1.fg2.fillText("RESET", 72, 43);
    main_1.fg2.fillText("L", 17, 7);
    main_1.fg2.fillText("R", 56, 7);
    main_1.fg2.fillText("A", 93, 9);
    main_1.fg2.font = "900 20px Arial";
    main_1.fg2.fillText("RUNBACK", 53, 70);
    main_1.fg2.font = "900 18px Arial";
    main_1.fg2.fillText("FRAME ADVANCE", -685, -584);
    main_1.fg2.restore();
}
function resetLostStockQueue() {
    exports.lostStockQueue = [];
}
