"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicManager = void 0;
/* eslint-disable no-undef */
const howler_1 = require("howler");
class MusicManager {
    constructor() {
    }
    static playLoop(track, sprite) {
        this.stopWhatisPlaying();
        console.log("starting sound");
        console.log(track._src);
        track.play(sprite);
        this.whatisPlaying = track;
        console.log("now what is playing");
        console.log(this.whatisPlaying._src);
    }
    static stopWhatisPlaying() {
        console.log("stopping sound");
        if (!this.whatisPlaying) {
            return;
        }
        console.log("waiting to stop playing");
        console.log(this.whatisPlaying._src);
        while (this.whatisPlaying.playing()) {
            this.whatisPlaying.stop();
            console.log("confirmed stopped sound");
        }
    }
    static playMenuLoop() {
        this.playLoop(this.menu, "menuStart");
    }
    static playBattleFieldLoop() {
        this.playLoop(this.battlefield, "battlefieldStart");
    }
    static playyStoryLoop() {
        this.playLoop(this.yStory, "yStoryStart");
    }
    static playpStadiumLoop() {
        this.playLoop(this.pStadium, "pStadiumStart");
    }
    static playDreamLandLoop() {
        this.playLoop(this.dreamland, "dreamlandStart");
    }
    static playTargetTestLoop() {
        this.playLoop(this.targettest, "targettestStart");
    }
    static playfinaldLoop() {
        this.playLoop(this.finald, "finaldStart");
    }
    static playfodLoop() {
        this.playLoop(this.fod, "fodStart");
    }
    static isWhatisPlaying(track) {
        return this.whatisPlaying === track;
    }
    static setWhatisPlaying(track) {
        this.whatisPlaying = track;
    }
}
exports.MusicManager = MusicManager;
MusicManager.menu = new howler_1.Howl({
    src: ['music/menu.ogg'],
    volume: 1,
    html5: true,
    sprite: {
        menuStart: [0, 7425],
        menuLoop: [7425, 173500]
        //end - 181070
    },
    onend: function () {
        if (MusicManager.isWhatisPlaying(MusicManager.menu)) {
            this.play("menuLoop");
        }
    }
});
MusicManager.battlefield = new howler_1.Howl({
    src: ['music/battlefield.ogg'],
    sprite: {
        battlefieldStart: [0, 12366],
        battlefieldLoop: [12366, 184256]
        // 196622
    },
    volume: 1,
    html5: true,
    onend: function () {
        this.play("battlefieldLoop");
    }
});
MusicManager.yStory = new howler_1.Howl({
    src: ['music/yStory.ogg'],
    sprite: {
        yStoryStart: [0, 2957],
        yStoryLoop: [2957, 252182]
        // 255139
    },
    volume: 1,
    html5: true,
    onend: function () {
        this.play("yStoryLoop");
    }
});
MusicManager.pStadium = new howler_1.Howl({
    src: ['music/pStadium.ogg'],
    sprite: {
        pStadiumStart: [0, 1],
        pStadiumLoop: [0, 219496]
    },
    volume: 1,
    html5: true,
    onend: function () {
        this.play("pStadiumLoop");
    }
});
MusicManager.dreamland = new howler_1.Howl({
    src: ['music/dreamland.ogg'],
    sprite: {
        dreamlandStart: [0, 16320],
        dreamlandLoop: [16320, 194782]
        // end 211102
    },
    volume: 1,
    html5: true,
    onend: function () {
        this.play("dreamlandLoop");
    }
});
MusicManager.fod = new howler_1.Howl({
    src: ['music/fod.ogg'],
    sprite: {
        fodStart: [21320, 21321],
        fodLoop: [21320, 310782]
        // end 211102
    },
    volume: 1,
    html5: true,
    onend: function () {
        this.play("fodLoop");
    }
});
MusicManager.finald = new howler_1.Howl({
    src: ['music/finald.ogg'],
    sprite: {
        finaldStart: [15000, 15001],
        finaldLoop: [15000, 210000]
        // end 211102
    },
    volume: 1,
    html5: true,
    onend: function () {
        this.play("finaldLoop");
    }
});
MusicManager.targettest = new howler_1.Howl({
    src: ['music/targettest.ogg'],
    sprite: {
        targettestStart: [0, 1],
        targettestLoop: [0, 224459]
        //224459
    },
    volume: 1,
    html5: true,
    onend: function () {
        this.play("targettestLoop");
    }
});
