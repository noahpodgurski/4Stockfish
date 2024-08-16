"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sounds = void 0;
/* eslint-disable */
const howler_1 = require("howler");
exports.sounds = {
    menuBack: new howler_1.Howl({
        src: ['sfx/menu-back.wav']
    }),
    menuForward: new howler_1.Howl({
        src: ['sfx/menu-forward.wav']
    }),
    menuSelect: new howler_1.Howl({
        src: ['sfx/menu-select.wav']
    }),
    marth: new howler_1.Howl({
        src: ['sfx/marth.wav']
    }),
    ready: new howler_1.Howl({
        src: ['sfx/ready.wav']
    }),
    go: new howler_1.Howl({
        src: ['sfx/go.wav']
    }),
    game: new howler_1.Howl({
        src: ['sfx/game.wav']
    }),
    dash: new howler_1.Howl({
        src: ['sfx/dash.wav'],
        volume: 0.3
    }),
    tech: new howler_1.Howl({
        src: ['sfx/tech.wav']
    }),
    airdodge: new howler_1.Howl({
        src: ['sfx/airdodge.wav'],
        volume: 0.7
    }),
    dolphinSlash: new howler_1.Howl({
        src: ['sfx/dolphin-slash.wav']
    }),
    dolphinSlash2: new howler_1.Howl({
        src: ['sfx/dolphin-slash2.wav']
    }),
    grab: new howler_1.Howl({
        src: ['sfx/grab.wav'],
        volume: 0.5
    }),
    grabbed: new howler_1.Howl({
        src: ['sfx/grabbed.wav']
    }),
    jump: new howler_1.Howl({
        src: ['sfx/jump.wav'],
        volume: 0.7
    }),
    jump2: new howler_1.Howl({
        src: ['sfx/jump2.wav'],
        volume: 0.4
    }),
    kill: new howler_1.Howl({
        src: ['sfx/kill.wav']
    }),
    land: new howler_1.Howl({
        src: ['sfx/land.wav'],
        volume: 0.7
    }),
    ledgegrab: new howler_1.Howl({
        src: ['sfx/ledgegrab.wav'],
        volume: 0.7
    }),
    powershield: new howler_1.Howl({
        src: ['sfx/powershield.wav']
    }),
    powershieldreflect: new howler_1.Howl({
        src: ['sfx/powershieldreflect.wav']
    }),
    roll: new howler_1.Howl({
        src: ['sfx/roll.wav']
    }),
    shieldbreak: new howler_1.Howl({
        src: ['sfx/shieldbreak.wav']
    }),
    shieldup: new howler_1.Howl({
        src: ['sfx/shieldup.wav'],
        volume: 0.7
    }),
    swordsheath: new howler_1.Howl({
        src: ['sfx/swordsheath.wav'],
        volume: 0.7
    }),
    sworddraw: new howler_1.Howl({
        src: ['sfx/sworddraw.wav'],
        volume: 0.7
    }),
    fastfall: new howler_1.Howl({
        src: ['sfx/fastfall.wav'],
        volume: 0.4
    }),
    spotdodge: new howler_1.Howl({
        src: ['sfx/spotdodge.wav']
    }),
    dancingBlade: new howler_1.Howl({
        src: ['sfx/dancing-blade.wav']
    }),
    dancingBlade2: new howler_1.Howl({
        src: ['sfx/dancing-blade2.wav']
    }),
    shieldoff: new howler_1.Howl({
        src: ['sfx/shieldoff.wav'],
        volume: 0.4
    }),
    runbrake: new howler_1.Howl({
        src: ['sfx/runbrake.wav']
    }),
    shout1: new howler_1.Howl({
        src: ['sfx/shout1.wav']
    }),
    shout2: new howler_1.Howl({
        src: ['sfx/shout2.wav']
    }),
    shout3: new howler_1.Howl({
        src: ['sfx/shout3.wav']
    }),
    shout4: new howler_1.Howl({
        src: ['sfx/shout4.wav']
    }),
    shout5: new howler_1.Howl({
        src: ['sfx/shout5.wav']
    }),
    shout6: new howler_1.Howl({
        src: ['sfx/shout6.wav']
    }),
    shout7: new howler_1.Howl({
        src: ['sfx/shout7.wav']
    }),
    shout8: new howler_1.Howl({
        src: ['sfx/shout8.wav']
    }),
    sword1: new howler_1.Howl({
        src: ['sfx/sword1.wav'],
        volume: 0.7
    }),
    sword2: new howler_1.Howl({
        src: ['sfx/sword2.wav'],
        volume: 0.7
    }),
    sword3: new howler_1.Howl({
        src: ['sfx/sword3.wav'],
        volume: 0.7
    }),
    footstep: new howler_1.Howl({
        src: ['sfx/footstep.wav']
    }),
    smashcharge: new howler_1.Howl({
        src: ['sfx/smashcharge.wav']
    }),
    deathShout: new howler_1.Howl({
        src: ['sfx/death.wav']
    }),
    walljump: new howler_1.Howl({
        src: ['sfx/walljump.wav']
    }),
    weakhurt: new howler_1.Howl({
        src: ['sfx/weakhurt.wav']
    }),
    stronghurt: new howler_1.Howl({
        src: ['sfx/stronghurt.wav']
    }),
    swordweakhit: new howler_1.Howl({
        src: ['sfx/swordweakhit.wav'],
        volume: 0.5
    }),
    swordmediumhit: new howler_1.Howl({
        src: ['sfx/swordmediumhit.wav'],
        volume: 0.5
    }),
    swordstronghit: new howler_1.Howl({
        src: ['sfx/swordstronghit.wav'],
        volume: 0.5
    }),
    swordreallystronghit: new howler_1.Howl({
        src: ['sfx/swordreallystronghit.wav'],
        volume: 0.7
    }),
    stronghit: new howler_1.Howl({
        src: ['sfx/stronghit.wav']
    }),
    strongerhit: new howler_1.Howl({
        src: ['sfx/strongerhit.wav']
    }),
    normalweakhit: new howler_1.Howl({
        src: ['sfx/normalweakhit.wav']
    }),
    cheer: new howler_1.Howl({
        src: ['sfx/cheer.wav']
    }),
    lowdown: new howler_1.Howl({
        src: ['sfx/lowdown.wav']
    }),
    bounce: new howler_1.Howl({
        src: ['sfx/bounce.wav']
    }),
    pause: new howler_1.Howl({
        src: ['sfx/pause.wav']
    }),
    furacry: new howler_1.Howl({
        src: ['sfx/furacry.wav'],
        volume: 0.4
    }),
    furaloop: new howler_1.Howl({
        src: ['sfx/furaloop.wav'],
        loop: true
    }),
    parry: new howler_1.Howl({
        src: ['sfx/parry.wav']
    }),
    blunthit: new howler_1.Howl({
        src: ['sfx/blunthit.wav'],
        volume: 0.7
    }),
    clank: new howler_1.Howl({
        src: ['sfx/clank.wav']
    }),
    deny: new howler_1.Howl({
        src: ['sfx/deny.wav']
    }),
    targetBreak: new howler_1.Howl({
        src: ['sfx/target-break.wav']
    }),
    complete: new howler_1.Howl({
        src: ['sfx/complete.wav']
    }),
    newRecord: new howler_1.Howl({
        src: ['sfx/new-record.wav']
    }),
    failure: new howler_1.Howl({
        src: ['sfx/failure.wav']
    }),
    time: new howler_1.Howl({
        src: ['sfx/time.wav']
    }),
    puffshout1: new howler_1.Howl({
        src: ['sfx/puffshout1.wav']
    }),
    puffshout2: new howler_1.Howl({
        src: ['sfx/puffshout2.wav']
    }),
    puffshout3: new howler_1.Howl({
        src: ['sfx/puffshout3.wav']
    }),
    puffshout4: new howler_1.Howl({
        src: ['sfx/puffshout4.wav']
    }),
    puffshout5: new howler_1.Howl({
        src: ['sfx/puffshout5.wav']
    }),
    rest1: new howler_1.Howl({
        src: ['sfx/rest1.wav']
    }),
    rest2: new howler_1.Howl({
        src: ['sfx/rest2.wav']
    }),
    restbubbles: new howler_1.Howl({
        src: ['sfx/restbubbles.wav']
    }),
    sing1: new howler_1.Howl({
        src: ['sfx/sing1.wav']
    }),
    sing2: new howler_1.Howl({
        src: ['sfx/sing2.wav']
    }),
    puffdeath: new howler_1.Howl({
        src: ['sfx/puffkill.wav']
    }),
    normalswing1: new howler_1.Howl({
        src: ['sfx/normalswing1.wav'],
        volume: 0.5
    }),
    normalswing2: new howler_1.Howl({
        src: ['sfx/normalswing2.wav'],
        volume: 0.5
    }),
    puffledgegrab: new howler_1.Howl({
        src: ['sfx/puffledgegrab.wav'],
        volume: 0.7
    }),
    normalmediumhit: new howler_1.Howl({
        src: ['sfx/normalmediumhit.wav']
    }),
    normalstronghit: new howler_1.Howl({
        src: ['sfx/normalstronghit.wav']
    }),
    bathit: new howler_1.Howl({
        src: ['sfx/bathit.wav']
    }),
    fireweakhit: new howler_1.Howl({
        src: ['sfx/fireweakhit.wav']
    }),
    firemediumhit: new howler_1.Howl({
        src: ['sfx/firemediumhit.wav']
    }),
    firestronghit: new howler_1.Howl({
        src: ['sfx/firestronghit.wav'],
        volume: 0.6
    }),
    jigglypuff: new howler_1.Howl({
        src: ['sfx/jigglypuff.wav']
    }),
    foxairdodge: new howler_1.Howl({
        src: ['sfx/foxairdodge.wav']
    }),
    foxjump: new howler_1.Howl({
        src: ['sfx/foxjump.wav']
    }),
    foxshine: new howler_1.Howl({
        src: ['sfx/foxshine.wav']
    }),
    foxshout1: new howler_1.Howl({
        src: ['sfx/foxshout1.wav']
    }),
    foxshout2: new howler_1.Howl({
        src: ['sfx/foxshout2.wav']
    }),
    foxshout3: new howler_1.Howl({
        src: ['sfx/foxshout3.wav']
    }),
    foxshout4: new howler_1.Howl({
        src: ['sfx/foxshout4.wav']
    }),
    foxshout5: new howler_1.Howl({
        src: ['sfx/foxshout5.wav']
    }),
    foxupbburn: new howler_1.Howl({
        src: ['sfx/foxupbburn.wav']
    }),
    foxupbshout: new howler_1.Howl({
        src: ['sfx/foxupbshout.wav']
    }),
    foxillusion1: new howler_1.Howl({
        src: ['sfx/foxillusion1.wav']
    }),
    foxillusion2: new howler_1.Howl({
        src: ['sfx/foxillusion2.wav']
    }),
    foxcliffcatch: new howler_1.Howl({
        src: ['sfx/foxcliffcatch.wav']
    }),
    foxupblaunch: new howler_1.Howl({
        src: ['sfx/foxupblaunch.wav']
    }),
    foxlasercock: new howler_1.Howl({
        src: ['sfx/foxlasercock.wav']
    }),
    foxlaserfire: new howler_1.Howl({
        src: ['sfx/foxlaserfire.wav']
    }),
    foxlaserholster: new howler_1.Howl({
        src: ['sfx/foxlaserholster.wav']
    }),
    foxfura: new howler_1.Howl({
        src: ['sfx/foxfura.wav']
    }),
    foxdeath: new howler_1.Howl({
        src: ['sfx/foxdeath.wav']
    }),
    foxweakhurt: new howler_1.Howl({
        src: ['sfx/foxweakhurt.wav']
    }),
    foxstronghurt: new howler_1.Howl({
        src: ['sfx/foxstronghurt.wav']
    }),
    star: new howler_1.Howl({
        src: ['sfx/star.wav']
    }),
    vcancel: new howler_1.Howl({
        src: ['sfx/vcancel.wav']
    }),
    outofcamera: new howler_1.Howl({
        src: ['sfx/outofcamera.wav']
    }),
    fox: new howler_1.Howl({
        src: ['sfx/fox.wav']
    }),
    rolloutshout: new howler_1.Howl({
        src: ['sfx/rolloutshout.wav']
    }),
    rollouttickground: new howler_1.Howl({
        src: ['sfx/rollouttickground.wav']
    }),
    rollouttickair: new howler_1.Howl({
        src: ['sfx/rollouttickair.wav']
    }),
    rolloutlaunch: new howler_1.Howl({
        src: ['sfx/rolloutlaunch.wav']
    }),
    rollouthit: new howler_1.Howl({
        src: ['sfx/rollouthit.wav']
    }),
    shieldbreaker1: new howler_1.Howl({
        src: ['sfx/shieldbreaker1.wav']
    }),
    shieldbreaker2: new howler_1.Howl({
        src: ['sfx/shieldbreaker2.wav']
    }),
    shieldbreakershout: new howler_1.Howl({
        src: ['sfx/shieldbreakershout.wav']
    }),
    shieldbreakercharge: new howler_1.Howl({
        src: ['sfx/shieldbreakercharge.wav']
    }),
    marthcounter: new howler_1.Howl({
        src: ['sfx/marthcounter.wav']
    }),
    marthcountershout: new howler_1.Howl({
        src: ['sfx/marthcountershout.wav']
    }),
    marthcounterclank: new howler_1.Howl({
        src: ['sfx/marthcounterclank.wav'],
        volume: 0.6
    }),
    puffhurt: new howler_1.Howl({
        src: ['sfx/puffhurt.wav']
    }),
    electricfizz: new howler_1.Howl({
        src: ['sfx/electricfizz.wav'],
        volume: 0.2
    }),
    loudelectricfizz: new howler_1.Howl({
        src: ['sfx/electricfizz.wav'],
        volume: 1
    }),
    foxshinereflect: new howler_1.Howl({
        src: ['sfx/foxshinereflect.wav']
    }),
    falco: new howler_1.Howl({
        src: ['sfx/falco.wav']
    }),
    falcotaunt: new howler_1.Howl({
        src: ['sfx/falcotaunt.wav']
    }),
    foxtaunt: new howler_1.Howl({
        src: ['sfx/foxtaunt.wav']
    }),
    marthtaunt: new howler_1.Howl({
        src: ['sfx/marthtaunt.wav']
    }),
    pufftaunt: new howler_1.Howl({
        src: ['sfx/pufftaunt.wav']
    }),
    falcofirebird: new howler_1.Howl({
        src: ['sfx/falcofirebird.wav']
    }),
    falcocliffcatch: new howler_1.Howl({
        src: ['sfx/falcocliffcatch.wav']
    }),
    falcoshout1: new howler_1.Howl({
        src: ['sfx/falcoshout1.wav']
    }),
    falcoshout2: new howler_1.Howl({
        src: ['sfx/falcoshout2.wav']
    }),
    falcoshout3: new howler_1.Howl({
        src: ['sfx/falcoshout3.wav']
    }),
    falcoshout4: new howler_1.Howl({
        src: ['sfx/falcoshout4.wav']
    }),
    falcoshout5: new howler_1.Howl({
        src: ['sfx/falcoshout5.wav']
    }),
    falcofura: new howler_1.Howl({
        src: ['sfx/falcofura.wav']
    }),
    falcodeath: new howler_1.Howl({
        src: ['sfx/falcodeath.wav']
    }),
    falcodoublejump: new howler_1.Howl({
        src: ['sfx/falcodoublejump.wav']
    }),
    falcoairdodge: new howler_1.Howl({
        src: ['sfx/falcoairdodge.wav']
    }),
    falcotech: new howler_1.Howl({
        src: ['sfx/falcotech.wav']
    }),
    falcohurt1: new howler_1.Howl({
        src: ['sfx/falcohurt1.wav']
    }),
    falcohurt2: new howler_1.Howl({
        src: ['sfx/falcohurt2.wav']
    }),
    falcohurt3: new howler_1.Howl({
        src: ['sfx/falcohurt3.wav']
    }),
    phantasm: new howler_1.Howl({
        src: ['sfx/phantasm.wav']
    }),
    phantasmshout: new howler_1.Howl({
        src: ['sfx/phantasmshout.wav']
    }),
    firebirdcharge: new howler_1.Howl({
        src: ['sfx/firebirdcharge.wav']
    }),
    firebirdlaunch: new howler_1.Howl({
        src: ['sfx/firebirdlaunch.wav']
    }),
    falcosleep: new howler_1.Howl({
        src: ['sfx/falcosleep.wav']
    }),
    hitspin: new howler_1.Howl({
        src: ['sfx/hitspin.wav']
    }),
    falcondeath: new howler_1.Howl({
        src: ['sfx/falcondeath.wav']
    }),
    falcondive: new howler_1.Howl({
        src: ['sfx/falcondive.wav']
    }),
    falcondoublejump: new howler_1.Howl({
        src: ['sfx/falcondoublejump.wav']
    }),
    falconfura: new howler_1.Howl({
        src: ['sfx/falconfura.wav']
    }),
    falconhurt: new howler_1.Howl({
        src: ['sfx/falconhurt.wav']
    }),
    falconkick: new howler_1.Howl({
        src: ['sfx/falconkick.wav']
    }),
    falconkickshout: new howler_1.Howl({
        src: ['sfx/falconkickshout.wav']
    }),
    falconpunchbird: new howler_1.Howl({
        src: ['sfx/falconpunchbird.wav']
    }),
    falconpunchshout1: new howler_1.Howl({
        src: ['sfx/falconpunchshout1.wav']
    }),
    falconpunchshout2: new howler_1.Howl({
        src: ['sfx/falconpunchshout2.wav']
    }),
    falconshout1: new howler_1.Howl({
        src: ['sfx/falconshout1.wav']
    }),
    falconshout2: new howler_1.Howl({
        src: ['sfx/falconshout2.wav']
    }),
    falconshout3: new howler_1.Howl({
        src: ['sfx/falconshout3.wav']
    }),
    falconshout4: new howler_1.Howl({
        src: ['sfx/falconshout4.wav']
    }),
    falconshout5: new howler_1.Howl({
        src: ['sfx/falconshout5.wav']
    }),
    falconshout6: new howler_1.Howl({
        src: ['sfx/falconshout6.wav']
    }),
    falconsleep: new howler_1.Howl({
        src: ['sfx/falconsleep.wav']
    }),
    falcontaunt: new howler_1.Howl({
        src: ['sfx/falcontaunt.wav']
    }),
    falconyes: new howler_1.Howl({
        src: ['sfx/falconyes.wav']
    }),
    raptorboost: new howler_1.Howl({
        src: ['sfx/raptorboost.wav']
    }),
    falcon: new howler_1.Howl({
        src: ['sfx/falcon.wav']
    })
};
const volumeOverwrites = {
    dash: 0.3,
    airdodge: 0.7,
    grab: 0.5,
    jump: 0.7,
    jump2: 0.4,
    land: 0.7,
    ledgegrab: 0.7,
    shieldup: 0.7,
    swordsheath: 0.7,
    sworddraw: 0.7,
    fastfall: 0.4,
    shieldoff: 0.4,
    sword1: 0.7,
    sword2: 0.7,
    sword3: 0.7,
    swordweakhit: 0.5,
    swordmediumhit: 0.5,
    swordstronghit: 0.5,
    swordreallystronghit: 0.7,
    furacry: 0.4,
    blunthit: 0.7,
    normalswing1: 0.5,
    normalswing2: 0.5,
    puffledgegrab: 0.7,
    marthcounterclank: 0.6,
    electricfizz: 0.2,
    firestronghit: 0.6
};
// window.changeVolume = function(audioGroup, newVolume, groupType) {
//   var keys = Object.keys(audioGroup);
//   for (var i = 0; i < keys.length; i++) {
//     if (volumeOverwrites[keys[i]]) {
//       audioGroup[keys[i]]._volume = newVolume * volumeOverwrites[keys[i]];
//     } else {
//       audioGroup[keys[i]]._volume = newVolume;
//     }
//     if (groupType && audioGroup[keys[i]].volume) {
//       audioGroup[keys[i]].volume(newVolume);
//     }
//   }
// }
// window.changeVolume(sounds, 0.5, 0);
// window.changeVolume(MusicManager, 0.3, 1);
// window.playSfx = function(name) {
//   sounds[name].play();
// }
