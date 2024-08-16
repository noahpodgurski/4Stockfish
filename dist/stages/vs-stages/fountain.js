"use strict";
// @flow
Object.defineProperty(exports, "__esModule", { value: true });
const Box2D_1 = require("../../main/util/Box2D");
const Vec2D_1 = require("../../main/util/Vec2D");
const activeStage_1 = require("../activeStage");
const main_1 = require("../../main/main");
const environmentalCollision_1 = require("../../physics/environmentalCollision");
/*eslint indent:0*/
const platL = 21;
const platR = 49.5;
const platYMin = 12.375;
const platYMax = 27.375;
let platformStates = [{ state: "moving", timer: 0, destination: 22.125 },
    { state: "moving", timer: 0, destination: 16.125 }];
function updatePlatform(i, j) {
    const platformState = platformStates[j];
    if (platformState.state === "static") {
        if (platformState.timer < 1) {
            platformState.timer = 0;
            platformState.state = "moving";
            let t = Math.random();
            if (Math.abs(activeStage_1.activeStage.platform[i][0].y) < 0.075) {
                platformState.destination = 19.875;
            }
            else if (t < 0.3) {
                platformState.destination = -environmentalCollision_1.additionalOffset;
            }
            else {
                t = (t - 0.3) / 0.7;
                platformState.destination = platYMin + t * (platYMax - platYMin);
            }
        }
        else {
            platformState.timer--;
        }
    }
    else {
        const destination = platformState.destination;
        if (activeStage_1.activeStage.platform[i][0].y < destination - 0.075) {
            activeStage_1.activeStage.platform[i][0].y += 0.075;
            activeStage_1.activeStage.platform[i][1].y += 0.075;
        }
        else if (activeStage_1.activeStage.platform[i][0].y > destination + 0.075) {
            activeStage_1.activeStage.platform[i][0].y -= 0.075;
            activeStage_1.activeStage.platform[i][1].y -= 0.075;
        }
        else {
            activeStage_1.activeStage.platform[i][0].y = destination;
            activeStage_1.activeStage.platform[i][1].y = destination;
            let newTimer;
            if (destination < 0.075) {
                newTimer = 480 + 360 * Math.random();
            }
            else if (Math.abs(destination - 19.875) < 0.075) {
                // platform returning to base height
                newTimer = 0;
            }
            else {
                newTimer = 240 + 360 * Math.random();
            }
            platformState.state = "static";
            platformState.timer = newTimer;
        }
    }
}
exports.default = {
    name: "fountain",
    box: [],
    polygon: [[new Vec2D_1.Vec2D(-63.35, 0.62), new Vec2D_1.Vec2D(-53.5, 0.62), new Vec2D_1.Vec2D(-51.25, 0), new Vec2D_1.Vec2D(51.25, 0), new Vec2D_1.Vec2D(53.5, 0.62), new Vec2D_1.Vec2D(63.35, 0.62),
            new Vec2D_1.Vec2D(63.35, -4.5), new Vec2D_1.Vec2D(59.33, -15), new Vec2D_1.Vec2D(56.9, -19.5),
            new Vec2D_1.Vec2D(55, -27), new Vec2D_1.Vec2D(52, -32), new Vec2D_1.Vec2D(48, -38), new Vec2D_1.Vec2D(41, -42),
            new Vec2D_1.Vec2D(19, -49.5), new Vec2D_1.Vec2D(13, -54.5), new Vec2D_1.Vec2D(10, -62), new Vec2D_1.Vec2D(8.8, -72),
            new Vec2D_1.Vec2D(8.8, -150), new Vec2D_1.Vec2D(-8.8, -150),
            new Vec2D_1.Vec2D(-8.8, -72), new Vec2D_1.Vec2D(-10, -62), new Vec2D_1.Vec2D(-13, -54.5), new Vec2D_1.Vec2D(-19, -49.5),
            new Vec2D_1.Vec2D(-41, -42), new Vec2D_1.Vec2D(-48, -38), new Vec2D_1.Vec2D(-52, -32), new Vec2D_1.Vec2D(-55, -27),
            new Vec2D_1.Vec2D(-56.9, -19.5), new Vec2D_1.Vec2D(-59.33, -15), new Vec2D_1.Vec2D(-63.35, -4.5)
        ]],
    platform: [[new Vec2D_1.Vec2D(-14.25, 42.75), new Vec2D_1.Vec2D(14.25, 42.75)], [new Vec2D_1.Vec2D(platL, 22.125), new Vec2D_1.Vec2D(platR, 22.125)], [new Vec2D_1.Vec2D(-platR, 16.125), new Vec2D_1.Vec2D(-platL, 16.125)]],
    ground: [[new Vec2D_1.Vec2D(-63.33, 0.62), new Vec2D_1.Vec2D(-53.5, 0.62)], [new Vec2D_1.Vec2D(-53.5, 0.62), new Vec2D_1.Vec2D(-51, 0)],
        [new Vec2D_1.Vec2D(-51, 0), new Vec2D_1.Vec2D(51, 0)],
        [new Vec2D_1.Vec2D(51, 0), new Vec2D_1.Vec2D(53.5, 0.62)], [new Vec2D_1.Vec2D(53.5, 0.62), new Vec2D_1.Vec2D(63.33, 0.62)]
    ],
    ceiling: [[new Vec2D_1.Vec2D(-19, -49.5), new Vec2D_1.Vec2D(-41, -42)], [new Vec2D_1.Vec2D(19, -49.5), new Vec2D_1.Vec2D(41, -42)]],
    wallL: [[new Vec2D_1.Vec2D(-63.35, 0.62), new Vec2D_1.Vec2D(-63.35, -4.5)], [new Vec2D_1.Vec2D(-63.35, -4.5), new Vec2D_1.Vec2D(-59.33, -15)], [new Vec2D_1.Vec2D(-59.33, -15), new Vec2D_1.Vec2D(-56.9, -19.5)],
        [new Vec2D_1.Vec2D(-56.9, -19.5), new Vec2D_1.Vec2D(-55, -27)], [new Vec2D_1.Vec2D(-55, -27), new Vec2D_1.Vec2D(-52, -32)], [new Vec2D_1.Vec2D(-52, -32), new Vec2D_1.Vec2D(-48, -38)],
        [new Vec2D_1.Vec2D(-48, -38), new Vec2D_1.Vec2D(-41, -42)], [new Vec2D_1.Vec2D(-19, -49.5), new Vec2D_1.Vec2D(-13, -54.5)], [new Vec2D_1.Vec2D(-13, -54.5), new Vec2D_1.Vec2D(-10, -62)],
        [new Vec2D_1.Vec2D(-10, -62), new Vec2D_1.Vec2D(-8.8, -72)], [new Vec2D_1.Vec2D(-8.8, -72), new Vec2D_1.Vec2D(-8.8, -150)]],
    wallR: [[new Vec2D_1.Vec2D(63.35, 0.62), new Vec2D_1.Vec2D(63.35, -4.5)], [new Vec2D_1.Vec2D(63.35, -4.5), new Vec2D_1.Vec2D(59.33, -15)], [new Vec2D_1.Vec2D(59.33, -15), new Vec2D_1.Vec2D(56.9, -19.5)],
        [new Vec2D_1.Vec2D(56.9, -19.5), new Vec2D_1.Vec2D(55, -27)], [new Vec2D_1.Vec2D(55, -27), new Vec2D_1.Vec2D(52, -32)], [new Vec2D_1.Vec2D(52, -32), new Vec2D_1.Vec2D(48, -38)],
        [new Vec2D_1.Vec2D(48, -38), new Vec2D_1.Vec2D(41, -42)], [new Vec2D_1.Vec2D(19, -49.5), new Vec2D_1.Vec2D(13, -54.5)], [new Vec2D_1.Vec2D(13, -54.5), new Vec2D_1.Vec2D(10, -62)],
        [new Vec2D_1.Vec2D(10, -62), new Vec2D_1.Vec2D(8.8, -72)], [new Vec2D_1.Vec2D(8.8, -72), new Vec2D_1.Vec2D(8.8, -150)]],
    startingPoint: [new Vec2D_1.Vec2D(-41.25, 21), new Vec2D_1.Vec2D(41.25, 27), new Vec2D_1.Vec2D(0, 5.25), new Vec2D_1.Vec2D(0, 48)],
    startingFace: [1, -1, -1, 1],
    respawnPoints: [new Vec2D_1.Vec2D(0, 63.75), new Vec2D_1.Vec2D(0, 63.75), new Vec2D_1.Vec2D(0, 63.75), new Vec2D_1.Vec2D(0, 63.75)],
    respawnFace: [1, 1, 1, 1],
    blastzone: new Box2D_1.Box2D([-198.75, -146.25], [198.75, 202.5]),
    ledge: [["ground", 0, 0], ["ground", 4, 1]],
    ledgePos: [new Vec2D_1.Vec2D(-66.35, 0.62), new Vec2D_1.Vec2D(66.35, 0.62)],
    scale: 5,
    offset: [600, 450],
    connected: [[[null, ["g", 1]], [["g", 0], ["g", 2]], [["g", 1], ["g", 3]], [["g", 2], ["g", 4]], [["g", 3], null]], [[null, null], [null, null], [null, null]]],
    movingPlats: [1, 2],
    movingPlatforms: function () {
        if (main_1.starting) { // resets the stage
            platformStates = [{ state: "moving", timer: 0, destination: 22.125 },
                { state: "moving", timer: 0, destination: 16.125 }];
            activeStage_1.activeStage.platform[1][0].y = 22.125;
            activeStage_1.activeStage.platform[1][1].y = 22.125;
            activeStage_1.activeStage.platform[2][0].y = 16.125;
            activeStage_1.activeStage.platform[2][1].y = 16.125;
        }
        else {
            updatePlatform(1, 0);
            updatePlatform(2, 1);
            for (let j = 0; j < 4; j++) {
                if (main_1.player[j].phys.grounded) {
                    if (main_1.player[j].phys.onSurface[0] === 1 && (main_1.player[j].phys.onSurface[1] === 1 || main_1.player[j].phys.onSurface[1] === 2)) {
                        const plat = main_1.player[j].phys.onSurface[1];
                        if (activeStage_1.activeStage.platform[plat][0].y < environmentalCollision_1.additionalOffset) {
                            main_1.player[j].phys.pos.y = environmentalCollision_1.additionalOffset;
                            main_1.player[j].phys.onSurface = [0, 2]; // transfer player from platform to middle ground
                        }
                    }
                    else if (main_1.player[j].phys.onSurface[0] === 0 && main_1.player[j].phys.onSurface[1] === 2) {
                        const x = main_1.player[j].phys.pos.x;
                        if (platformStates[0].state === "moving" && activeStage_1.activeStage.platform[1][0].y < 0.075 && platformStates[0].destination > 0.075 && x >= platL && x <= platR) {
                            main_1.player[j].phys.onSurface = [1, 1]; // transfer player from middle ground to right platform
                        }
                        else if (platformStates[1].state === "moving" && activeStage_1.activeStage.platform[2][0].y < 0.075 && platformStates[1].destination > 0.075 && x >= -platR && x <= -platL) {
                            main_1.player[j].phys.onSurface = [1, 2]; // transfer player from middle ground to left platform
                        }
                    }
                }
            }
        }
    }
};
