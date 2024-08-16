"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.articles = exports.articleHitQueue = exports.destroyArticleQueue = exports.aArticles = void 0;
exports.resetAArticles = resetAArticles;
exports.executeArticles = executeArticles;
exports.destroyArticles = destroyArticles;
exports.renderArticles = renderArticles;
exports.articlesHitDetection = articlesHitDetection;
exports.executeArticleHits = executeArticleHits;
exports.wallDetection = wallDetection;
exports.articleHitCollision = articleHitCollision;
exports.articleShieldCollision = articleShieldCollision;
exports.interpolatedArticleCircleCollision = interpolatedArticleCircleCollision;
exports.interpolatedArticleHurtCollision = interpolatedArticleHurtCollision;
exports.articleHurtCollision = articleHurtCollision;
const main_1 = require("main/main");
const render_1 = require("main/render");
const sfx_1 = require("main/sfx");
const hitDetection_1 = require("physics/hitDetection");
const environmentalCollision_1 = require("./environmentalCollision");
const ecbTransform_1 = require("../main/util/ecbTransform");
const findSmallestWithin_1 = require("../main/util/findSmallestWithin");
const linAlg_1 = require("../main/linAlg");
const actionStateShortcuts_1 = require("physics/actionStateShortcuts");
const drawVfx_1 = require("main/vfx/drawVfx");
const activeStage_1 = require("stages/activeStage");
const createHitBox_1 = require("../main/util/createHitBox");
const Vec2D_1 = require("../main/util/Vec2D");
const laser_1 = require("../main/vfx/dVfx/laser");
const chromaticAberration_1 = require("../main/vfx/chromaticAberration");
const makeColour_1 = require("../main/vfx/makeColour");
const interpolatedCollision_1 = require("./interpolatedCollision");
/* eslint-disable */
exports.aArticles = [];
exports.destroyArticleQueue = [];
exports.articleHitQueue = [];
function resetAArticles() {
    exports.aArticles = [];
}
// 0.00390583333333333333333333333333 = hitbox size multiplier
exports.articles = {
    "LASER": {
        name: "LASER",
        canTurboCancel: false,
        strokeStyle: "",
        fillStyle: "",
        init: function (options) {
            const p = options.p;
            const x = options.x;
            const y = options.y;
            const rotate = options.rotate;
            const isFox = (options.isFox !== undefined) ? options.isFox : true;
            const partOfThrow = options.partOfThrow || false;
            this.strokeStyle = isFox ? "rgba(255, 59, 59,0.6)" : "rgba(73,130,234,0.6)";
            this.fillStyle = isFox ? "rgb(255, 193, 193)" : "rgb(225, 255, 255)";
            var obj = {
                hitList: [],
                rotate: rotate,
                destroyOnHit: true,
                clank: false,
                timer: 0,
                vel: new Vec2D_1.Vec2D((isFox ? 7 : 5) * Math.cos(rotate) * main_1.player[p].phys.face, (isFox ? 7 : 5) * Math.sin(rotate)),
                pos: new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (x * main_1.player[p].phys.face), main_1.player[p].phys.pos.y + y),
                posPrev1: new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x, main_1.player[p].phys.pos.y + y),
                posPrev2: new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x, main_1.player[p].phys.pos.y + y),
                posPrev3: new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x, main_1.player[p].phys.pos.y + y),
                posPrev: new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x, main_1.player[p].phys.pos.y + y),
                hb: new createHitBox_1.createHitbox(new Vec2D_1.Vec2D(0, 0), 1.172, 3, 361, isFox ? 0 : partOfThrow ? 0 : 100, 0, isFox ? 0 : partOfThrow ? 0 : 5, 0, 0, 1, 1),
                ecb: [new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (x * main_1.player[p].phys.face), main_1.player[p].phys.pos.y + y - 0.01),
                    new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (x * main_1.player[p].phys.face) + 10, main_1.player[p].phys.pos.y + y),
                    new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (x * main_1.player[p].phys.face), main_1.player[p].phys.pos.y + y + 0.01),
                    new Vec2D_1.Vec2D(main_1.player[p].phys.pos.x + (x * main_1.player[p].phys.face) - 10, main_1.player[p].phys.pos.y + y)]
            };
            exports.aArticles.push({
                name: "LASER",
                player: p,
                instance: obj
            });
            exports.articles.LASER.main(exports.aArticles.length - 1);
        },
        main: function (i) {
            exports.aArticles[i].instance.timer++;
            if (exports.aArticles[i].instance.timer > 4) {
                exports.aArticles[i].instance.posPrev.x = exports.aArticles[i].instance.posPrev3.x;
                exports.aArticles[i].instance.posPrev.y = exports.aArticles[i].instance.posPrev3.y;
            }
            if (exports.aArticles[i].instance.timer > 3) {
                exports.aArticles[i].instance.posPrev3.x = exports.aArticles[i].instance.posPrev2.x;
                exports.aArticles[i].instance.posPrev3.y = exports.aArticles[i].instance.posPrev2.y;
            }
            if (exports.aArticles[i].instance.timer > 2) {
                exports.aArticles[i].instance.posPrev2.x = exports.aArticles[i].instance.posPrev1.x;
                exports.aArticles[i].instance.posPrev2.y = exports.aArticles[i].instance.posPrev1.y;
            }
            if (exports.aArticles[i].instance.timer > 1) {
                exports.aArticles[i].instance.posPrev1.x = exports.aArticles[i].instance.pos.x;
                exports.aArticles[i].instance.posPrev1.y = exports.aArticles[i].instance.pos.y;
            }
            exports.aArticles[i].instance.pos.x += exports.aArticles[i].instance.vel.x;
            exports.aArticles[i].instance.ecb[0].x += exports.aArticles[i].instance.vel.x;
            exports.aArticles[i].instance.ecb[1].x += exports.aArticles[i].instance.vel.x;
            exports.aArticles[i].instance.ecb[2].x += exports.aArticles[i].instance.vel.x;
            exports.aArticles[i].instance.ecb[3].x += exports.aArticles[i].instance.vel.x;
            exports.aArticles[i].instance.pos.y += exports.aArticles[i].instance.vel.y;
            exports.aArticles[i].instance.ecb[0].y += exports.aArticles[i].instance.vel.y;
            exports.aArticles[i].instance.ecb[1].y += exports.aArticles[i].instance.vel.y;
            exports.aArticles[i].instance.ecb[2].y += exports.aArticles[i].instance.vel.y;
            exports.aArticles[i].instance.ecb[3].y += exports.aArticles[i].instance.vel.y;
            if (wallDetection(i) || exports.aArticles[i].instance.timer > 200) {
                exports.destroyArticleQueue.push(i);
            }
        },
        draw: function (i) {
            main_1.fg2.save();
            var h = new Vec2D_1.Vec2D((exports.aArticles[i].instance.pos.x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (exports.aArticles[i].instance.pos.y * -activeStage_1.activeStage.scale) +
                activeStage_1.activeStage.offset[1]);
            var t = new Vec2D_1.Vec2D((exports.aArticles[i].instance.posPrev.x * activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[0], (exports.aArticles[i].instance.posPrev.y * -activeStage_1.activeStage.scale) + activeStage_1.activeStage.offset[1]);
            var d = (h.x > t.x) ? 1 : -1;
            var r = exports.aArticles[i].instance.rotate;
            var v1 = (0, render_1.rotateVector)(-4, 2, -r);
            var v2 = (0, render_1.rotateVector)(4, 2, -r);
            var v3 = (0, render_1.rotateVector)(4, -2, -r);
            var v4 = (0, render_1.rotateVector)(-4, -2, -r);
            (0, chromaticAberration_1.chromaticAberration)(main_1.fg2, (c1, c2) => (0, laser_1.drawLaserLine)(h, t, v1, v2, v3, v4, d, c1, c2), (0, makeColour_1.unmakeColour)(this.strokeStyle), (0, makeColour_1.unmakeColour)(this.fillStyle), 0.8, new Vec2D_1.Vec2D(-0.3 * Math.sin(r) * activeStage_1.activeStage.scale, -0.3 * Math.cos(r) * activeStage_1.activeStage.scale));
            main_1.fg2.restore();
        }
    },
    "ILLUSION": {
        name: "ILLUSION",
        noDraw: true,
        canTurboCancel: true,
        init: function (options) {
            const p = options.p;
            const type = options.type;
            const isFox = options.isFox || true;
            var obj = {
                hitList: [],
                destroyOnHit: false,
                clank: true,
                timer: 0,
                pos: new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x, main_1.player[p].phys.posPrev.y + 5),
                posPrev: new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x, main_1.player[p].phys.posPrev.y + 5),
                hb: new createHitBox_1.createHitbox(new Vec2D_1.Vec2D(0, 0), 4.160, 7, isFox ? 80 : 270, isFox ? 60 : 70, isFox ? 68 : 70, 0, 1, 1, 1, 1),
                ecb: [new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x, main_1.player[p].phys.posPrev.y - 10), new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev
                        .x + 10, main_1.player[p].phys.posPrev.y), new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x, main_1.player[p].phys.posPrev.y +
                        10), new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x - 10, main_1.player[p].phys.posPrev.y)]
            };
            // if ground
            if (type) {
                if (isFox) {
                    obj.hb.kg = 40;
                }
                else {
                    obj.hb.angle = 65;
                    obj.hb.kg = 60;
                    obj.hb.bk = 74;
                }
            }
            exports.aArticles.push({
                name: "ILLUSION",
                player: p,
                instance: obj
            });
            exports.articles.ILLUSION.main(exports.aArticles.length - 1);
        },
        main: function (i) {
            var p = exports.aArticles[i].player;
            exports.aArticles[i].instance.timer++;
            exports.aArticles[i].instance.posPrev = new Vec2D_1.Vec2D(exports.aArticles[i].instance.pos.x, exports.aArticles[i].instance.pos.y);
            exports.aArticles[i].instance.pos = new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x, main_1.player[p].phys.posPrev.y);
            exports.aArticles[i].instance.ecb = [new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x, main_1.player[p].phys.posPrev.y - 10), new Vec2D_1.Vec2D(main_1.player[p]
                    .phys.posPrev.x + 10, main_1.player[p].phys.posPrev.y), new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x, main_1.player[p].phys.posPrev
                    .y + 10), new Vec2D_1.Vec2D(main_1.player[p].phys.posPrev.x - 10, main_1.player[p].phys.posPrev.y)];
            if (exports.aArticles[i].instance.timer > 5) {
                exports.destroyArticleQueue.push(i);
            }
        }
    }
};
function executeArticles() {
    exports.destroyArticleQueue = [];
    for (var i = 0; i < exports.aArticles.length; i++) {
        exports.articles[exports.aArticles[i].name].main(i);
    }
}
function destroyArticles() {
    for (var k = 0; k < exports.destroyArticleQueue.length; k++) {
        exports.aArticles.splice(exports.destroyArticleQueue[k] - k, 1);
    }
}
function renderArticles() {
    for (var i = 0; i < exports.aArticles.length; i++) {
        if (!exports.articles[exports.aArticles[i].name].noDraw) {
            exports.articles[exports.aArticles[i].name].draw(i);
        }
    }
}
function articlesHitDetection() {
    exports.articleHitQueue = [];
    for (var a = 0; a < exports.aArticles.length; a++) {
        var articleDestroyed = false;
        if (exports.aArticles[a].instance.timer > 1) {
            var interpolate = true;
        }
        else {
            var interpolate = false;
        }
        for (var v = 0; v < 4; v++) {
            var inHitList = false;
            for (var n = 0; n < 4; n++) {
                if (v == exports.aArticles[a].instance.hitList[n]) {
                    inHitList = true;
                    break;
                }
            }
            // if v isnt the owner, not destroyed and no in article's hitlist
            if (v != exports.aArticles[a].player && !articleDestroyed && !inHitList && main_1.playerType[v] != -1) {
                // if article is clankable
                var attackerClank = false;
                if (exports.aArticles[a].instance.clank) {
                    for (var k = 0; k < 4; k++) {
                        if (main_1.player[v].hitboxes.active[k] && (main_1.player[v].hitboxes.id[k].clank == 1 || (main_1.player[v].hitboxes.id[k].clank ==
                            2 && main_1.player[v].phys.grounded))) {
                            // ILL DO CLANKS TOMOZ
                            /*var clankHit = articleHitCollision(a,v,k);
                             if (clankHit[0]){
  
                             var diff = player[p].hitboxes.id[j].dmg - player[i].hitboxes.id[k].dmg;
                             if (diff >= 9){
                             // victim clank
                             // attacker cut through
                             player[i].hit.hitlag = Math.floor(player[p].hitboxes.id[j].dmg * (1/3) + 3);
                             turnOffHitboxes(i);
                             actionStates[characterSelections[i]][78].init(i);
                             }
                             else if (diff <= -9){
                             // attacker clank
                             // victim cut through
                             player[p].hit.hitlag = Math.floor(player[i].hitboxes.id[k].dmg * (1/3) + 3);
                             attackerClank = true;
                             articleDestroyed = true;
                             turnOffHitboxes(p);
                             actionStates[characterSelections[p]][78].init(p,input);
                             }
                             else {
                             // both clank
                             player[i].hit.hitlag = Math.floor(player[p].hitboxes.id[j].dmg * (1/3) + 3);
                             player[p].hit.hitlag = Math.floor(player[i].hitboxes.id[k].dmg * (1/3) + 3);
                             attackerClank = true;
                             articleDestroyed = true;
                             turnOffHitboxes(i);
                             actionStates[characterSelections[i]][78].init(i);
                             turnOffHitboxes(p);
                             actionStates[characterSelections[p]][78].init(p,input);
                             }
                             sounds.clank.play();
                             drawVfx("clank",clankHit[1]);
                             player[p].hitboxes.hitList.push(i);
                             break;
                             }*/
                        }
                    }
                }
                if (!attackerClank) {
                    var reflected = false;
                    for (var i = 0; i < 4; i++) {
                        if (main_1.player[v].hitboxes.active[i]) {
                            if (main_1.player[v].hitboxes.id[i].type == 7) {
                                if (articleHitCollision(a, v, i) || (interpolate && (articleHitCollision(a, v, i) ||
                                    interpolatedArticleCircleCollision(a, new Vec2D_1.Vec2D(main_1.player[v].phys.pos.x + main_1.player[v].hitboxes.id[i]
                                        .offset[0].x, main_1.player[v].phys.pos.y + main_1.player[v].hitboxes.id[i].offset[0].y), main_1.player[v].hitboxes
                                        .id[i].size)))) {
                                    if (main_1.player[v].actionState.substr(0, 11) == "DOWNSPECIAL") {
                                        // do shine reflect animation
                                        sfx_1.sounds.foxshinereflect.play();
                                    }
                                    // change ownership
                                    exports.aArticles[a].player = v;
                                    // increase damage
                                    exports.aArticles[a].instance.hb.dmg *= 1.5;
                                    // reflect
                                    if (exports.aArticles[a].instance.vel != undefined || exports.aArticles[a].instance.vel != null) {
                                        exports.aArticles[a].instance.vel.x *= -1;
                                        exports.aArticles[a].instance.vel.y *= -1;
                                    }
                                    reflected = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!reflected) {
                        if (main_1.player[v].phys.shielding && (articleShieldCollision(a, v, false) || (interpolate && (articleShieldCollision(a, v, true) || interpolatedArticleCircleCollision(a, main_1.player[v].phys.shieldPositionReal, main_1.player[v].phys.shieldSize))))) {
                            exports.articleHitQueue.push([a, v, true]);
                            exports.aArticles[a].instance.hitList.push(v);
                            if (exports.articles[exports.aArticles[a].name].canTurboCancel) {
                                main_1.player[exports.aArticles[a].player].hasHit = true;
                            }
                        }
                        else if (main_1.player[v].phys.hurtBoxState != 1) {
                            if (articleHurtCollision(a, v, false) || (interpolate && (interpolatedArticleHurtCollision(a, v) ||
                                articleHurtCollision(a, v, true)))) {
                                exports.articleHitQueue.push([a, v, false]);
                                exports.aArticles[a].instance.hitList.push(v);
                                if (exports.articles[exports.aArticles[a].name].canTurboCancel) {
                                    main_1.player[exports.aArticles[a].player].hasHit = true;
                                }
                                if (exports.aArticles[a].instance.destroyOnHit) {
                                    exports.destroyArticleQueue.push(a);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
function executeArticleHits(input) {
    for (var i = 0; i < exports.articleHitQueue.length; i++) {
        var a = exports.articleHitQueue[i][0];
        var v = exports.articleHitQueue[i][1];
        var shieldHit = exports.articleHitQueue[i][2];
        var o = exports.aArticles[a].player;
        var hb = exports.aArticles[a].instance.hb;
        var damage = hb.dmg;
        if (shieldHit) {
            if (main_1.player[v].phys.powerShieldReflectActive) {
                (0, drawVfx_1.drawVfx)({
                    name: "powershieldreflect",
                    pos: main_1.player[v].phys.shieldPositionReal,
                    face: main_1.player[v].phys.face
                });
                sfx_1.sounds.powershieldreflect.play();
                exports.aArticles[a].player = v; // change ownership to victim
                // reflects velocity
                if (exports.aArticles[a].instance.vel != undefined || exports.aArticles[a].instance.vel != null) {
                    exports.aArticles[a].instance.vel.x *= -1;
                    exports.aArticles[a].instance.vel.y *= -1;
                }
                // cuts damage in half
                exports.aArticles[a].instance.hb.dmg *= 0.5;
            }
            else {
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
                    break;
                }
                if (exports.aArticles[a].instance.destroyOnHit) {
                    exports.destroyArticleQueue.push(a);
                }
                (0, drawVfx_1.drawVfx)({
                    name: "clank",
                    pos: exports.aArticles[a].instance.pos,
                    face: 1
                });
                main_1.player[v].hit.hitlag = Math.floor(damage * (1 / 3) + 3);
                main_1.player[v].hit.shieldstun = ((Math.floor(damage) * ((0.65 * (1 - ((main_1.player[v].phys.shieldAnalog - 0.3) / 0.7))) +
                    0.3)) * 1.5) + 2;
                var victimPush = ((Math.floor(damage) * ((0.195 * (1 - ((main_1.player[v].phys.shieldAnalog - 0.3) / 0.7))) + 0.09)) +
                    0.4) * 0.6;
                if (victimPush > 2) {
                    victimPush = 2;
                }
                if (exports.aArticles[a].instance.pos.x < main_1.player[v].phys.pos.x) {
                    main_1.player[v].phys.cVel.x = victimPush;
                }
                else {
                    main_1.player[v].phys.cVel.x = -victimPush;
                }
            }
            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].GUARD.init(v, input);
        }
        else {
            if (main_1.player[v].phys.hurtBoxState == 0) {
                var crouching = actionStateShortcuts_1.actionStates[main_1.characterSelections[v]][main_1.player[v].actionState].crouch;
                var vCancel = false;
                if (main_1.player[v].phys.vCancelTimer > 0) {
                    if (actionStateShortcuts_1.actionStates[main_1.characterSelections[v]][main_1.player[v].actionState].vCancel) {
                        vCancel = true;
                        sfx_1.sounds.vcancel.play();
                    }
                }
                main_1.player[v].hit.knockback = (0, hitDetection_1.getKnockback)(hb, damage, damage, main_1.player[v].percent, main_1.player[v].charAttributes.weight, crouching, vCancel);
                main_1.player[v].hit.hitPoint = exports.aArticles[a].instance.pos;
                main_1.player[v].percent += damage;
                switch (hb.type) {
                    case 0:
                        (0, drawVfx_1.drawVfx)({
                            name: "normalhit",
                            pos: main_1.player[v].hit.hitPoint,
                            face: main_1.player[v].phys.face
                        });
                        break;
                    case 1:
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
                    default:
                        break;
                }
                (0, hitDetection_1.knockbackSounds)(hb.type, main_1.player[v].hit.knockback, v);
                if (main_1.player[v].hit.knockback > 0) {
                    main_1.player[v].hit.angle = hb.angle;
                    if (main_1.player[v].hit.angle == 361) {
                        if (main_1.player[v].hit.knockback < 32.1) {
                            main_1.player[v].hit.angle = 0;
                        }
                        else if (main_1.player[v].hit.knockback >= 32.1) {
                            main_1.player[v].hit.angle = 44;
                        }
                    }
                    main_1.player[v].hit.hitlag = Math.floor(damage * (1 / 3) + 3);
                    if (exports.aArticles[a].instance.pos.x < main_1.player[v].phys.pos.x) {
                        main_1.player[v].hit.reverse = false;
                        main_1.player[v].phys.face = -1;
                    }
                    else {
                        main_1.player[v].hit.reverse = true;
                        main_1.player[v].phys.face = 1;
                    }
                    var isThrow = false;
                    if (main_1.player[v].phys.grabbedBy == -1 || (main_1.player[v].phys.grabbedBy > -1 && main_1.player[v].hit.knockback > 50)) {
                        main_1.player[v].hit.hitstun = (0, hitDetection_1.getHitstun)(main_1.player[v].hit.knockback);
                        if (main_1.player[v].hit.knockback >= 80 || isThrow) {
                            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].DAMAGEFLYN.init(v, input, !isThrow);
                        }
                        else {
                            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].DAMAGEN2.init(v, input);
                        }
                    }
                    else {
                        if (main_1.player[v].actionState != "THROWNPUFFDOWN") {
                            actionStateShortcuts_1.actionStates[main_1.characterSelections[v]].CAPTUREDAMAGE.init(v, input);
                        }
                    }
                    if (main_1.player[v].phys.grounded && main_1.player[v].hit.angle > 180) {
                        if (main_1.player[v].hit.knockback >= 80) {
                            sfx_1.sounds.bounce.play();
                            (0, drawVfx_1.drawVfx)({
                                name: "groundBounce",
                                pos: main_1.player[v].phys.pos,
                                face: main_1.player[v].phys.face
                            });
                            main_1.player[v].hit.angle = 360 - main_1.player[v].hit.angle;
                            main_1.player[v].hit.knockback *= 0.8;
                        }
                    }
                    (0, main_1.screenShake)(main_1.player[v].hit.knockback);
                    (0, main_1.percentShake)(main_1.player[v].hit.knockback, v);
                }
            }
            else {
                sfx_1.sounds.blunthit.play();
                (0, drawVfx_1.drawVfx)({
                    name: "clank",
                    pos: exports.aArticles[a].instance.pos
                });
            }
        }
    }
}
function wallDetection(i) {
    const article = exports.aArticles[i].instance;
    const ecbp = article.ecb;
    let ecb1;
    if (article.timer < 2) {
        const focus = article.posPrev;
        const offset = 0.0001;
        ecb1 = [new Vec2D_1.Vec2D(focus.x, focus.y - offset),
            new Vec2D_1.Vec2D(focus.x + offset, focus.y),
            new Vec2D_1.Vec2D(focus.x, focus.y + offset),
            new Vec2D_1.Vec2D(focus.x - offset, focus.y)
        ];
    }
    else {
        ecb1 = (0, ecbTransform_1.moveECB)(ecbp, (0, linAlg_1.subtract)(article.posPrev, article.pos));
    }
    let collisions = [];
    let thisCollision = null;
    for (var j = 0; j < activeStage_1.activeStage.wallL.length; j++) {
        thisCollision = (0, environmentalCollision_1.findCollision)(ecb1, ecbp, { surface: activeStage_1.activeStage.wallL[j], label: ["l", j] });
        if (thisCollision !== null) {
            collisions.push(thisCollision);
        }
    }
    for (var j = 0; j < activeStage_1.activeStage.wallR.length; j++) {
        thisCollision = (0, environmentalCollision_1.findCollision)(ecb1, ecbp, { surface: activeStage_1.activeStage.wallR[j], label: ["r", j] });
        if (thisCollision !== null) {
            collisions.push(thisCollision);
        }
    }
    for (var j = 0; j < activeStage_1.activeStage.ceiling.length; j++) {
        thisCollision = (0, environmentalCollision_1.findCollision)(ecb1, ecbp, { surface: activeStage_1.activeStage.ceiling[j], label: ["c", j] });
        if (thisCollision !== null) {
            collisions.push(thisCollision);
        }
    }
    for (var j = 0; j < activeStage_1.activeStage.ground.length; j++) {
        thisCollision = (0, environmentalCollision_1.findCollision)(ecb1, ecbp, { surface: activeStage_1.activeStage.ground[j], label: ["g", j] });
        if (thisCollision !== null) {
            collisions.push(thisCollision);
            ;
        }
    }
    for (var j = 0; j < activeStage_1.activeStage.platform.length; j++) {
        thisCollision = (0, environmentalCollision_1.findCollision)(ecb1, ecbp, { surface: activeStage_1.activeStage.platform[j], label: ["p", j] });
        if (thisCollision !== null) {
            collisions.push(thisCollision);
        }
    }
    let firstCollision = (0, findSmallestWithin_1.pickSmallestSweep)(collisions);
    if (firstCollision !== null) {
        return firstCollision.sweep;
    }
    else {
        return null;
    }
}
function articleHitCollision(a, v, k) {
    var hbpos = exports.aArticles[a].instance.pos;
    var hbpos2 = new Vec2D_1.Vec2D(main_1.player[v].phys.pos.x + (main_1.player[v].hitboxes.id[k].offset[main_1.player[v].hitboxes.frame].x * main_1.player[v].phys.face), main_1.player[v].phys.pos.y + main_1.player[v].hitboxes.id[k].offset[main_1.player[v].hitboxes.frame].y);
    var hitPoint = new Vec2D_1.Vec2D((hbpos.x + hbpos2.x) / 2, (hbpos.y + hbpos2.y) / 2);
    return (Math.pow(hbpos2.x - hbpos.x, 2) + Math.pow(hbpos.y - hbpos2.y, 2) <= Math.pow(exports.aArticles[a].instance.hb.size +
        main_1.player[v].hitboxes.id[k].size, 2));
    //return [(Math.pow(hbpos2.x-hbpos.x,2) + Math.pow(hbpos.y-hbpos2.y,2) <= Math.pow(aArticles[a].instance.hb.size+player[v].hitboxes.id[k].size,2)),hitPoint];
}
function articleShieldCollision(a, v, previous) {
    if (previous) {
        var hbpos = exports.aArticles[a].instance.posPrev;
    }
    else {
        var hbpos = exports.aArticles[a].instance.pos;
    }
    var shieldpos = main_1.player[v].phys.shieldPositionReal;
    return (Math.pow(shieldpos.x - hbpos.x, 2) + Math.pow(hbpos.y - shieldpos.y, 2) <= Math.pow(exports.aArticles[a].instance.hb.size +
        main_1.player[v].phys.shieldSize, 2));
}
function interpolatedArticleCircleCollision(a, circlePos, r) {
    const h1 = exports.aArticles[a].instance.posPrev;
    const h2 = exports.aArticles[a].instance.pos;
    const s = exports.aArticles[a].instance.hb.size;
    const collision = (0, interpolatedCollision_1.sweepCircleVsSweepCircle)(h1, s, h2, s, circlePos, r, circlePos, r);
    if (collision === null) {
        return false;
    }
    else {
        return true;
    }
}
function interpolatedArticleHurtCollision(a, v) {
    const hurt = main_1.player[v].phys.hurtbox;
    const h1 = exports.aArticles[a].instance.posPrev;
    const h2 = exports.aArticles[a].instance.pos;
    const r = exports.aArticles[a].instance.hb.size;
    const collision = (0, interpolatedCollision_1.sweepCircleVsAABB)(h1, r, h2, r, hurt.min, hurt.max);
    if (collision === null) {
        return false;
    }
    else {
        return true;
    }
}
function articleHurtCollision(a, v, previous) {
    if (previous) {
        var hbpos = exports.aArticles[a].instance.posPrev;
    }
    else {
        var hbpos = exports.aArticles[a].instance.pos;
    }
    var hurtCenter = new Vec2D_1.Vec2D((main_1.player[v].phys.hurtbox.min.x + main_1.player[v].phys.hurtbox.max.x) / 2, (main_1.player[v].phys.hurtbox
        .min.y + main_1.player[v].phys.hurtbox.max.y) / 2);
    var distance = new Vec2D_1.Vec2D(Math.abs(hbpos.x - hurtCenter.x), Math.abs(hbpos.y - hurtCenter.y));
    var hurtWidth = 8;
    var hurtHeight = 18;
    if (distance.x > (hurtWidth / 2 + exports.aArticles[a].instance.hb.size)) {
        return false;
    }
    if (distance.y > (hurtHeight / 2 + exports.aArticles[a].instance.hb.size)) {
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
    return (cornerDistance_sq <= (Math.pow(exports.aArticles[a].instance.hb.size, 2)));
}
