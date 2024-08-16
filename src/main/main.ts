/* eslint-disable */
import {choosingTag, drawCSSInit, cssControls, drawCSS} from '../menus/css';
import {playerObject, PlayerObjectType} from '../main/player';
import {keyMap} from '../settings';
import {drawStartUp} from '../menus/startup';
import {menuMove, drawMainMenuInit, drawMainMenu} from "../menus/menu";
import {sounds} from "../main/sfx";
import {drawStartScreenInit, drawStartScreen} from "../menus/startscreen";
import {drawBackgroundInit, drawStageInit, drawBackground, drawStage, setBackgroundType} from "../stages/stagerender";
import {drawSSSInit, sssControls, drawSSS} from "../menus/stageselect";
import {drawAudioMenuInit, masterVolume, drawAudioMenu, audioMenuControls, getAudioCookies} from "../menus/audiomenu";
import {drawGameplayMenuInit, drawGameplayMenu, gameplayMenuControls, getGameplayCookies} from "../menus/gameplaymenu";
import {drawKeyboardMenuInit, keyboardMenuControls, drawKeyboardMenu, getKeyboardCookie} from "../menus/keyboardmenu";
import {drawControllerMenuInit, drawControllerMenu} from "../menus/controllermenu";
import {renderForeground, renderPlayer, renderOverlay, resetLostStockQueue} from "../main/render";

import {actionStates} from "../physics/actionStateShortcuts";
import {executeHits, hitDetect, checkPhantoms, resetHitQueue, setPhantonQueue} from "../physics/hitDetection";
import {destroyArticles, executeArticles, articlesHitDetection, executeArticleHits, renderArticles, resetAArticles} from "../physics/article";
import {runAI} from "../main/ai";
import {physics} from "../physics/physics";
import $ from 'jquery';
import {toggleTransparency,getTransparency} from "../main/vfx/transparency";
import {drawVfx} from "../main/vfx/drawVfx";
import {resetVfxQueue} from "../main/vfx/vfxQueue";
import {setVsStage, getActiveStage, activeStage} from "../stages/activeStage";
import {MusicManager} from "./music";
import {isShowSFX, toggleShowSFX} from "../main/vfx";
import {renderVfx} from "./vfx/renderVfx";
import {Box2D} from "./util/Box2D";
import {Vec2D} from "./util/Vec2D";
import {saveGameState, loadReplay, gameTickDelay} from "./replay";
import {keyboardMap, showButton, nullInputs, pollInputs, inputData, setCustomCenters, nullInput} from "../input/input";
import {deaden} from "../input/meleeInputs";
import {getGamepadNameAndInfo} from "../input/gamepad/findGamepadInfo";
import {customGamepadInfo} from "../input/gamepad/gamepads/custom";
import {buttonState} from "../input/gamepad/retrieveGamepadInputs";
import {updateGamepadSVGState, updateGamepadSVGColour, setGamepadSVGColour, cycleGamepadColour} from "../input/gamepad/drawGamepad";
import { GamepadInfo } from '../input/gamepad/gamepadInfo';
import {deepObjectMerge} from "./util/deepCopyObject";
import {setTokenPosSnapToChar} from "../menus/css";

/*globals performance*/

export var snowCount = 150;

//todo find 'Player' object
export const player:PlayerObjectType | null[] = [null, null, null, null];
export const renderTime = [10,0,100,0];
export const gamelogicTime = [5,0,100,0];
export const framerate = [0,0,0];
export var characterSelections = [0,0,0,0];

export var shine = 0.5;

export let calibrationPlayer = 0;

export let gameEnd = false;
export let controllerResetCountdowns = [0,0,0,0];
export function setControllerReset( i ) {
  controllerResetCountdowns[i] = 0;
}

let keyboardOccupied = false;

export let usingCustomControls = [false, false, false, false];

export function setUsingCustomControls( i, bool, info: GamepadInfo | null=null ) {
  usingCustomControls[i] = bool;
  if (bool) {
    mType[i] = customGamepadInfo[currentPlayers[i]];
  }
  else {
    mType[i] = info;
  }
}

export let firstTimeDetected = [true, true, true, true];

window.mType = [null, null, null, null];


export const mType: [any, any, any, any] = [null,null,null,null];

export  function setMtype(index,val){
  mType[index] = val;
}

export const currentPlayers: any[] = [];

export function setCurrentPlayer(index,val){
  currentPlayers[index] =val;
}

export const playerAmount = 0;

export const playerType = [-1,-1,-1,-1];

export const cpuDifficulty = [3,3,3,3];

export let ports = 0;
export const activePorts = [];

export let playing = false;

export let frameByFrame = false;
export let wasFrameByFrame = false;
export let frameByFrameRender = false;

export let findingPlayers = true;

export let showDebug = false;

export let gameMode = 20;
// 20:Startup
// 13:Data Menu
// 12:Keyboard Controls
// 11:Gameplay Menu
// 10:Sound Menu
// 9: -
// 8: -
// 7:Target Select
// 6:Stage Select (VS)
// 5:Target Playing
// 4:Target Builder
// 3:Playing (VS)
// 2:CSS
// 1:Main Menu
// 0:Title Screen
export let versusMode = 0;

export const randomTags = ["NEO!","SELF","NOVA","PNDA","Panda","LFFN","Scorp","AZ","AXE","Tempo","TMPO","[A]rmada","WBALLZ","Westballz","PPMD","Kreygasm","M2K","Mang0","USA","SCAR","TOPH","(.Y.)","HBOX","HungryBox","PLUP","Shroomed","SFAT","Wizz","Lucky","S2J","SilentWolf","aMSa","S2J","Hax$"];

export const palettes = [["rgb(250, 89, 89)","rgb(255, 170, 170)","rgba(255, 206, 111, ","rgb(244, 68, 68)","rgba(255, 225, 167, "],
["rgb(95, 216, 84)","rgb(184, 253, 154)","rgba(252, 95, 95, ","rgb(255, 182, 96)","rgba(254, 141, 141, "],
["rgb(5, 195, 255)","rgb(121, 223, 255)","rgba(218, 96, 254, ","rgb(231, 134, 255)","rgba(230, 144, 255, "],
["rgb(255, 187, 70)","rgb(248, 255, 122)","rgba(80, 182, 255, ","rgb(255, 142, 70)","rgba(139, 203, 249, "],
["rgb(177, 89, 255)","rgb(203, 144, 255)","rgba(144, 255, 110, ","rgb(247, 126, 250)","rgba(190, 255, 170, "],
["rgb(182, 131, 70)","rgb(252, 194, 126)","rgba(47, 186, 123, ","rgb(255, 112, 66)","rgba(111, 214, 168, "],
["rgb(232, 232, 208)","rgb(255, 255, 255)","rgba(244, 255, 112, ","rgb(191, 119, 119)","rgba(255, 255, 200, "]];


export const hasTag = [false,false,false,false];
export const tagText = ["","","",""];
export function setTagText(index,value){
  tagText[index] = value;
  hasTag[index] = true;
}
export const pPal = [0,1,2,3];

export const costumeTimeout = [];

export const colours = ["rgba(4, 255, 82, 0.62)","rgba(117, 20, 255, 0.63)","rgba(255, 20, 20, 0.63)","rgba(255, 232, 20, 0.63)"];

export let pause = [[true,true],[true,true],[true,true],[true,true]];
export let frameAdvance = [[true,true],[true,true],[true,true],[true,true]];

export const startingPoint: Vec2D[] = [new Vec2D(-50,50), new Vec2D(50,50) ,new Vec2D(-25,5) ,new Vec2D(25,5) ];
export const startingFace = [1,-1,1,-1];

export const ground = [[-68.4,0],[68.4,0]];

export const platforms = [[[-57.6,27.2],[-20,27.2]],[[20,27.2],[57.6,27.2]],[[-18.8,54.4],[18.8,54.4]]];

export const wallsL = [[[-68.4,0],[-68.4,-108.8]]];
export const wallsR = [[[68.4,0],[68.4,-108.8]]];

export const edges = [[[-68.4,0],[-63.4,0]],[[68.4,0],[63.4,0]]];

//edgeOffset = [[-71.3,-23.7],[71.3,-23.7]];
export const edgeOffset = [[-2.9,-23.7],[2.9,-23.7]];

export const edgeOrientation = [1,-1];

export const respawnPoints = [[-50,50,1],[50,50,-1],[25,35,1],[-25,35,-1]];

export var stageSelect = 0;

export function setStageSelect (val){
  stageSelect = val;
}

export const blastzone = new Box2D([-224,200],[224,-108.8]);

export let starting = true;
export function setStarting(val){
    starting = val;
}
export let startTimer = 1.5;
export function setStartTimer (val){
  startTimer = val;
}
export function getStartTimer(){
  return startTimer;
}
//matchTimer = 5999.99;
export let matchTimer = 480;

export function addMatchTimer (val){
  matchTimer += val;
}
export function setMatchTimer (val){
  matchTimer = val;
}

export function getMatchTimer(){
  return matchTimer;
}

export let usingLocalStorage = false;
if (typeof(Storage) !== "undefined") {
  // Code for localStorage/sessionStorage.
  usingLocalStorage = true;
  console.log("local storage works");
} else {
  // Sorry! No Web Storage support..
  console.log("local storage does not work");
}

export function setCookie (cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var exp = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + exp;
    localStorage.setItem(cname, cvalue);
}
export function setVersusMode (val){
  versusMode = val;
}
export function getCookie(cname: string): string {
  if (usingLocalStorage){
    const x = localStorage.getItem(cname);
    if (x === null) {
      throw Error("unable to get cookie");
    }
    return x;
  } else {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1);
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  }
}

export const keys = {};
export let keyBind = 0;
export let keyBinding = false;
export function setKeyBinding (val){
  keyBinding = val;
}
export function overrideKeyboardEvent (e){
  if (choosingTag == -1 && e.keyCode != 122 && e.keyCode != 116){
    switch(e.type){
      case "keydown":
        if (!keys[e.keyCode]) {
          keys[e.keyCode] = true;
          keyBind = e.keyCode;
          keyBinding = true;
          // do key down stuff here
        }
        break;
      case "keyup":
        delete(keys[e.keyCode]);
        // do key up stuff here
        break;
    }
    disabledEventPropagation(e);
    e.preventDefault();
    return false;
  } else {
    if (choosingTag > -1) {
      if (e.keyCode == 13) {
        switch (e.type) {
          case "keydown":
            keys[13] = true;
            break;
          case "keyup":
            delete(keys[13]);
            break;
          default:
            break;
        }
      }
    }
    return true;
  }
};

export function disabledEventPropagation (e){
  if(e){
    if(e.stopPropagation){
      e.stopPropagation();
    } else if(event){
       event.cancelBubble = true;
    }
  }
};

document.onkeydown = overrideKeyboardEvent;
document.onkeyup = overrideKeyboardEvent;

/*var keys = [];
export const onkeyup (e) {
  keys[e.keyCode]=false;
}
export const onkeydown (e) {
  keys[e.keyCode]=true;
}*/

export function SVG (tag)
{
   return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

/*if (Gamepad.supported) {
    console.log("gamepad supported");
} else {
    console.log("gamepad not supported");
}*/

window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
});
if (navigator.getGamepads) console.log(navigator.getGamepads());

export function matchTimerTick (input){
  matchTimer -= 0.016667;
  
  if (dom!.matchMinutes && dom!.matchSeconds) {
    var sec = (matchTimer % 60).toFixed(2);
    dom!.matchMinutes.innerHTML = String(Math.floor(matchTimer / 60));
    dom!.matchSeconds.innerHTML = String(sec.length < 5 ? `0${sec}` : sec);
  }

  if (matchTimer <= 0) {
    finishGame(input);
  }
}

export function screenShake (kb){
  var seed = [Math.random(),Math.random(),Math.random(),Math.random()];
  fg1.translate(kb*0.1*seed[0],kb*0.1*seed[1]);
  setTimeout(function(){fg1.translate(-kb*0.05*seed[0],-kb*0.05*seed[1])},20);
  setTimeout(function(){fg1.translate(-kb*0.05*seed[0],-kb*0.05*seed[1]);fg1.translate(-kb*0.1*seed[2],-kb*0.1*seed[3])},40);
  setTimeout(function(){fg1.translate(kb*0.05*seed[2],kb*0.05*seed[3])},60);
  setTimeout(function(){fg1.translate(kb*0.05*seed[2],kb*0.05*seed[3])},80);
}

export function percentShake (kb,i){
  player[i].percentShake = new Vec2D(kb*0.1*Math.random(),kb*0.1*Math.random());
  setTimeout(function(){player[i].percentShake = new Vec2D(kb*0.05*Math.random(),kb*0.05*Math.random())},20);
  setTimeout(function(){player[i].percentShake = new Vec2D(-kb*0.1*Math.random(),-kb*0.1*Math.random())},40);
  setTimeout(function(){player[i].percentShake = new Vec2D(-kb*0.05*Math.random(),-kb*0.05*Math.random())},60);
  setTimeout(function(){player[i].percentShake = new Vec2D(0,0)},80);
}


export function findPlayers (){
  var gps = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  /*if (typeof gps != "undefined"){
    console.log(gps);
  }*/
  if (!keyboardOccupied) {
    if (gameMode < 2 || gameMode == 20) {
      if (keys[13] || keys[keyMap.s[0]] || keys[keyMap.s[1]]) {
        if (ports < 4) {
          changeGamemode(1);
          $("#keyboardPrompt").hide();
          keyboardOccupied = true;
          sounds.menuForward.play();
          if (ports == 0) {
            MusicManager.playMenuLoop();
          }
          addPlayer(ports, "keyboard");
        }
      }
    } else {
      if (keys[keyMap.a[0]] || keys[keyMap.a[1]]) {
        if (ports < 4) {
          keyboardOccupied = true;
          addPlayer(ports, "keyboard");
        }
      }
    }
  }
  for (var i = 0; i < gps.length; i++) {
    var gamepad = navigator.getGamepads ? navigator.getGamepads()[i] : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads()[i] : null);
    if(playerType[i] === 2){
      var alreadyIn = false;
      for (var k = 0; k < ports; k++) {
        if (currentPlayers[k] === i) {
          alreadyIn = true;
        }
      }
      if (!alreadyIn) {
        if (ports < 4) {
          addPlayer(i, 99);
        }
      }
      continue;
    }

    var gamepad = navigator.getGamepads ? navigator.getGamepads()[i] : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads()[i] : null);
    if (typeof gamepad != "undefined" && gamepad != null) {
      var detected = false;
      var gpdName;
      var gpdInfo;
      if (usingCustomControls[i] && customGamepadInfo[i] !== null) {
        gpdName = "custom controls";
        gpdInfo = customGamepadInfo[i];
        detected = true;
      }
      else {
        const maybeNameAndInfo = getGamepadNameAndInfo(gamepad.id);
        if (maybeNameAndInfo === null) {
          console.log("Error in 'findPlayers': controller "+(i+1)+" detected but not supported.");
          console.log("Try manual calibration of your controller.");
        } else {
          detected = true;
          [gpdName, gpdInfo] = maybeNameAndInfo;
        }
      }
      if (detected) {
        if (firstTimeDetected[i]) {
          console.log("Controller "+(i+1)+" is: "+gpdName+".");
          firstTimeDetected[i] = false;
        }
        if (gameMode < 2 || gameMode == 20) {
          if (buttonState(gamepad, gpdInfo, "s")) {
            var alreadyIn = false;
            for (var k = 0; k < ports; k++) {
              if (currentPlayers[k] == i) {
                alreadyIn = true;
              }
            }
            if (!alreadyIn) {
              if (ports < 4) {
                changeGamemode(1);
                $("#keyboardPrompt").hide();
                sounds.menuForward.play();
                if (ports === 0) {
                  MusicManager.playMenuLoop();
                }
                addPlayer(i, gpdInfo);
              }
            }
          }
        } else {
          if (buttonState(gamepad, gpdInfo, "a")) {
            var alreadyIn = false;
            for (var k = 0; k < ports; k++) {
              if (currentPlayers[k] == i) {
                alreadyIn = true;
              }
            }
            if (!alreadyIn) {
              if (ports < 4) {
                addPlayer(i, gpdInfo);
              }
            }
          }
        }
      } else {
        console.log("No controller detected by browser");
      }
    }
  }
}

export function setPlayerType(playerSlot,type){
  playerType[playerSlot] = type;
}

export function addPlayer (i, controllerInfo){
  if(controllerInfo === 99){
    ports++;
    currentPlayers[ports - 1] = i;
    playerType[ports - 1] = 2;
    mType[ports - 1] = controllerInfo;
  }else {
    ports++;
    currentPlayers[ports - 1] = i;
    playerType[ports - 1] = 0;
    mType[ports - 1] = controllerInfo;
    if (showDebug) {
      updateGamepadSVGColour(i, "gamepadSVG" + i);
      document.getElementById("gamepadSVG" + i)!.style!.display = "";
    }
  }
}

export function togglePort (i){
  playerType[i]++;
  if (playerType[i] == 3) {
    playerType[i] = -1;
    if (showDebug) {
      document.getElementById("gamepadSVG"+i)!.style!.display = "none";
    }
  }
  if (playerType[i] == 0 && ports <= i) {
    playerType[i] = 1;
    setGamepadSVGColour(i, "black");
    if (showDebug) {
      updateGamepadSVGColour(i, "gamepadSVG"+i);
      document.getElementById("gamepadSVG"+i)!.style!.display = "";
    }
  }
}

export function positionPlayersInCSS (){
  for (var i=0;i<4;i++){
      var x = (-80+i*50)*2/3;
      var y = -30;
      player[i].phys.pos = new Vec2D(x,y);
      player[i].phys.hurtbox = new Box2D([-4+x,18+y],[4+x,y]);
  }
}

// 20:Startup
// 14:Controller Menu
// 13:Data Menu
// 12:Keyboard Controls
// 11:Gameplay Menu
// 10:Sound Menu
// 9: -
// 8: -
// 7:Target Select
// 6:Stage Select (VS)
// 5:Target Playing
// 4:Target Builder
// 3:Playing (VS)
// 2:CSS
// 1:Main Menu
// 0:Title Screen

export function changeGamemode (newGamemode){
  bg1.fillStyle = "black";
  bg1.fillRect(0, 0, layers?.BG1?.width ?? 0, layers?.BG1?.height ?? 0);
  fg1.clearRect(0, 0, layers?.FG1?.width ?? 0, layers?.FG1?.height ?? 0);

  gameMode = newGamemode;
  switch (newGamemode) {
    // TITLESCREEN
    case 0:
      drawStartScreenInit();
      break;
      // MAIN MENU
    case 1:
      $("#logoVid").remove();
      drawMainMenuInit();
      break;
      // CSS
    case 2:
      drawCSSInit();
      break;
      // Playing (VS)
    case 3:
      drawBackgroundInit();
      drawStageInit();
      break;
      // Target Builder
    case 4:
      break;
      // Target Playing
    case 5:
      drawBackgroundInit();
      drawStageInit();
      break;
      // Stage select (vs)
    case 6:
      drawSSSInit();
      break;
      // Target Select
    case 7:
      // drawTSSInit();
      break;
      // sound menu
    case 10:
      drawAudioMenuInit();
      break;
      // gameplay menu
    case 11:
      drawGameplayMenuInit();
      break;
      // keyboard menu
    case 12:
      drawKeyboardMenuInit();
      break;
      // credits
    case 13:
      // drawCreditsInit();
      break;
      // Multiplayer Modes
    case 14:
      drawControllerMenuInit();

      break;
    case 15:
      drawCSSInit();
      // connectToMPServer();

      break;


      // startup
    case 20:
      break;
    default:
      break;
  }
}


/*export const addPlayer (i,gType,pType){
  console.log(i,gType,pType);

  currentPlayers.push(i);
  if (pType == 0){
    ports++;
    mType[ports-1] = gType;
    playerType[ports-1] = pType;

    costumeTimeout.push(false);
    pPal.push(ports-1);
    buildPlayerObject(ports-1);
    player[playerAmount-1].phys.pos = new Vec2D(-100+25*(playerAmount=1),-40);
    player[ports-1].phys.face = 1;
    player[ports-1].actionState = 0;
    $("#currentPlayers").append('<div class="pBoxBox"><div class="playerBox" id="pBox'+(ports-1)+'" style="background-color:'+palettes[pPal[ports-1]][0]+';border:5px solid '+palettes[pPal[ports-1]][2]+'0.8)"><p>P'+ports+'<br><span class="cont">(Cont. '+i+')</span></p></div><div id="pTag'+(ports-1)+'" class="pTag"><textarea id="pTagEdit'+(ports-1)+'" class="pTagEdit" maxlength="10"></textarea></div></div>');
  }
  else {
    mType[i] = gType;

    costumeTimeout.push(false);
    pPal.push(i);
    buildPlayerObject(i);
    player[playerAmount-1].phys.pos = new Vec2D(-100+25*(playerAmount=1),-40);
    player[i].phys.face = 1;
    player[i].actionState = 0;
    $("#currentPlayers").append('<div class="pBoxBox"><div class="playerBox" id="pBox'+i+'" style="background-color:'+palettes[pPal[i]][0]+';border:5px solid '+palettes[pPal[i]][2]+'0.8)"><p>P'+(i+1)+'<br><span class="cont">(Cont. '+i+')</span></p></div><div id="pTag'+i+'" class="pTag"><textarea id="pTagEdit'+i+'" class="pTagEdit" maxlength="10"></textarea></div></div>');
  }
  playerAmount++;
}

export const removePlayer (i){
  playerType[i] = -1;
  playerAmount--;
}*/

export function interpretInputs  (i, active,playertype, inputBuffer) {

  let tempBuffer = nullInputs();

  // keep updating Z and Start all the time, even when paused
  for (var k = 0; k < 7; k++) {
    tempBuffer[7-k].z    = inputBuffer[6-k].z;
    tempBuffer[7-k].s    = inputBuffer[6-k].s;
  }

  tempBuffer[0] = pollInputs(gameMode, frameByFrame, mType[i], i, currentPlayers[i], keys,playertype);

  let pastOffset = 0;
  if ( (gameMode !== 3 && gameMode !== 5) || (playing && (pause[i][1] || !pause[i][0]))
                                          || wasFrameByFrame 
                                          || (!playing && pause[i][0] && !pause[i][1])) {
    pastOffset = 1;
  }

  pause[i][1] = pause[i][0];
  wasFrameByFrame = false;
  frameAdvance[i][1] = frameAdvance[i][0];

  for (var k = 0; k < 7; k++) {
    tempBuffer[7-k].lsX  = inputBuffer[7-k-pastOffset].lsX;
    tempBuffer[7-k].lsY  = inputBuffer[7-k-pastOffset].lsY;
    tempBuffer[7-k].rawX = inputBuffer[7-k-pastOffset].rawX;
    tempBuffer[7-k].rawY = inputBuffer[7-k-pastOffset].rawY;
    tempBuffer[7-k].csX  = inputBuffer[7-k-pastOffset].csX;
    tempBuffer[7-k].csY  = inputBuffer[7-k-pastOffset].csY;
    tempBuffer[7-k].rawcsX  = inputBuffer[7-k-pastOffset].rawcsX;
    tempBuffer[7-k].rawcsY  = inputBuffer[7-k-pastOffset].rawcsY;
    tempBuffer[7-k].lA   = inputBuffer[7-k-pastOffset].lA;
    tempBuffer[7-k].rA   = inputBuffer[7-k-pastOffset].rA;
    tempBuffer[7-k].a    = inputBuffer[7-k-pastOffset].a;
    tempBuffer[7-k].b    = inputBuffer[7-k-pastOffset].b;
    tempBuffer[7-k].x    = inputBuffer[7-k-pastOffset].x;
    tempBuffer[7-k].y    = inputBuffer[7-k-pastOffset].y;
    tempBuffer[7-k].r    = inputBuffer[7-k-pastOffset].r;
    tempBuffer[7-k].l    = inputBuffer[7-k-pastOffset].l;
    tempBuffer[7-k].dl   = inputBuffer[7-k-pastOffset].dl;
    tempBuffer[7-k].dd   = inputBuffer[7-k-pastOffset].dd;
    tempBuffer[7-k].dr   = inputBuffer[7-k-pastOffset].dr;
    tempBuffer[7-k].du   = inputBuffer[7-k-pastOffset].du;
  }

  if (mType !== null) {
    if (    (mType[i] === "keyboard" && (tempBuffer[0].z ||  tempBuffer[1].z))
         || (mType[i] !== "keyboard" && (tempBuffer[0].z && !tempBuffer[1].z))
       )  {
      frameAdvance[i][0] = true;
    }
    else {
      frameAdvance[i][0] = false;
    }
  }

  if (frameAdvance[i][0] && !frameAdvance[i][1] && !playing && gameMode !== 4) {
    frameByFrame = true;
  }

  if (mType[i] === "keyboard") { // keyboard controls

    if (tempBuffer[0].s || tempBuffer[1].s || (gameMode === 5 && (tempBuffer[0].du || tempBuffer[1].du) ) ) {
      pause[i][0] = true;
    }
    else {
      pause[i][0] = false;
    }

    if ( !playing && (gameMode == 3 || gameMode == 5)
         && (tempBuffer[0].a || tempBuffer[1].a) && (tempBuffer[0].l || tempBuffer[1].l) 
         && (tempBuffer[0].r || tempBuffer[1].r) && (tempBuffer[0].s || tempBuffer[1].s)) {
      if (tempBuffer[0].b || tempBuffer[1].b) {
        startGame();
      }
      else {
        endGame(inputBuffer);
      }
    }

    interpretPause(pause[i][0], pause[i][1]);
  }
  else if (mType[i] !== null) { // gamepad controls

    if ( !playing && (gameMode == 3 || gameMode == 5) &&
             ( tempBuffer[0].a && tempBuffer[0].l && tempBuffer[0].r && tempBuffer[0].s ) 
       && (! ( tempBuffer[1].a && tempBuffer[1].l && tempBuffer[1].r && tempBuffer[1].s ))) {
      if (tempBuffer[0].b) {
        startGame();
      }
      else {
        endGame(inputBuffer);
      }
    }

    if ( tempBuffer[0].s || tempBuffer[0].du && gameMode == 5) {
      pause[i][0] = true;
    }
    else {
      pause[i][0] = false;
    }

    // Controller reset functionality
    if ((tempBuffer[0].z || tempBuffer[0].du) && tempBuffer[0].x && tempBuffer[0].y) {
      controllerResetCountdowns[i] -= 1;
      if (controllerResetCountdowns[i] === 0) {
        // triggers code in input.js
        console.log("Controller #"+(i+1)+" was reset!");
        $("#resetIndicator" + i).fadeIn(100);
        $("#resetIndicator" + i).fadeOut(500);
      }
    }
    else {
      controllerResetCountdowns[i] = 125;
    }

    interpretPause(pause[i][0], pause[i][1]);
  }
  else { // AI
    tempBuffer[0].rawX = tempBuffer[0].lsX;
    tempBuffer[0].rawY = tempBuffer[0].lsY;
    tempBuffer[0].rawcsX = tempBuffer[0].csX;
    tempBuffer[0].rawcsY = tempBuffer[0].csY;
    tempBuffer[0].lsX = deaden(tempBuffer[0].rawX);
    tempBuffer[0].lsY = deaden(tempBuffer[0].rawY);
    tempBuffer[0].csX = deaden(tempBuffer[0].rawcsX);
    tempBuffer[0].csY = deaden(tempBuffer[0].rawcsY);
  }

  if (showDebug) {
    $("#lsAxisX" + i).empty().append(tempBuffer[0].lsX.toFixed(3));
    $("#lsAxisY" + i).empty().append(tempBuffer[0].lsY.toFixed(3));
    $("#csAxisX" + i).empty().append(tempBuffer[0].csX.toFixed(3));
    $("#csAxisY" + i).empty().append(tempBuffer[0].csY.toFixed(3));
    $("#lAnalog" + i).empty().append(tempBuffer[0].lA.toFixed(3));
    $("#rAnalog" + i).empty().append(tempBuffer[0].rA.toFixed(3));
    updateGamepadSVGState(i, "gamepadSVG"+i, tempBuffer[0]);
  }

  if (gameMode === 14) { // controller calibration screen
    updateGamepadSVGState(i, "gamepadSVGCalibration", tempBuffer[0]);
  }

  if (showDebug || gameMode === 14) {
    const which = (showDebug && gameMode === 14) ? "both" : showDebug ? "debug" : "calibration";
    if (tempBuffer[0].x && !tempBuffer[1].x && tempBuffer[0].du ) {
      cycleGamepadColour(i, which, true);
    }
    if (tempBuffer[0].y && !tempBuffer[1].y && tempBuffer[0].du ) {
      cycleGamepadColour(i, which, false);
    }
  }

  //for networking
  // if(giveInputs[i] === true){
  //   //turns out keyboards leave gaps in the input buffer
  //   deepObjectMerge(true,nullInput(),tempBuffer[0]);
  // }
  if (active) {
    if (tempBuffer[0].dl && !tempBuffer[1].dl ) {
     player[i].showLedgeGrabBox = !player[i].showLedgeGrabBox;
    }
    if (tempBuffer[0].dd && !tempBuffer[1].dd) {
      player[i].showECB = !player[i].showECB;
    }
    if (tempBuffer[0].dr && !tempBuffer[1].dr) {
      player[i].showHitbox = !player[i].showHitbox;
    }
  }

  if (frameByFrame) {
    tempBuffer[0].z = false;
  }

  return tempBuffer;

}

function interpretPause(pause0, pause1) {
  if (pause0 && !pause1) {
    if (gameMode == 3 || gameMode == 5) {
      playing = !playing;
      if (!playing) {
        // sounds.pause.play();
        // changeVolume(MusicManager, masterVolume[1] * 0.3, 1);
        renderForeground();
      } else {
        // changeVolume(MusicManager, masterVolume[1], 1);
      }
    }
  }
}


export let bg1: CanvasRenderingContext2D;
export let bg2: CanvasRenderingContext2D;
export let fg1: CanvasRenderingContext2D;
export let fg2: CanvasRenderingContext2D;
export let ui: CanvasRenderingContext2D;
export const c = 0;
export const layers: {
  BG1: HTMLCanvasElement | null, 
  BG2:HTMLCanvasElement | null, 
  FG1:HTMLCanvasElement | null, 
  FG2:HTMLCanvasElement | null, 
  UI:HTMLCanvasElement | null 
} = {
  BG1: null,
  BG2: null,
  FG1: null,
  FG2: null,
  UI: null
};

export const layerSwitches = {
  BG1 : true,
  BG2 : true,
  FG1 : true,
  FG2 : true,
  UI : true
};

export function renderToMain (){
  var keys = Object.keys(layers);
  for (var i = 0; i < keys.length; i++) {
    if (layerSwitches[keys[i]]) {
      // c.drawImage(layers[keys[i]], 0, 0) //todo wat???
    }
  }
}

export function update (i,inputBuffers){
  if (!starting){
    if (currentPlayers[i] != -1){
      if (playerType[i] == 0){
        // do nothing, use the provided player i inputs
      }
      else if (playerType[i] === 1) {
        if (player[i].actionState != "SLEEP"){
            runAI(i); // no need to return input since polling returns ai input if they are active
        }
      }
    }
  }
  physics(i, inputBuffers);
}

let delta = 0;
let lastFrameTimeMs = 0;
let lastUpdate = performance.now();


export function gameTick (oldInputBuffers){
  var start = performance.now();
  var diff = 0;

  let input = [nullInputs(), nullInputs(), nullInputs(), nullInputs()];

  if (gameMode == 0 || gameMode == 20) {
    findPlayers();
  } else if (gameMode == 1) {
    //console.log(playerType);
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true,playerType[i], oldInputBuffers[i]);
      menuMove(i, input);
    }
  } else if (gameMode == 10) {
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true,playerType[i], oldInputBuffers[i]);
      audioMenuControls(i, input);
    }
  } else if (gameMode == 11) {
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true,playerType[i], oldInputBuffers[i]);
      gameplayMenuControls(i, input);
    }
  } else if (gameMode == 12) {
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true, playerType[i], oldInputBuffers[i]);
      keyboardMenuControls(i, input);
    }
  } else if (gameMode == 13) {
    //target
  } else if (gameMode == 14) {
    // controller calibration
    input[calibrationPlayer] = interpretInputs(calibrationPlayer, true, playerType[calibrationPlayer],oldInputBuffers[calibrationPlayer]);
  }else if (gameMode == 15) {
    for (var i = 0; i < ports; i++) {
      input[i] = interpretInputs(i, true,playerType[i], oldInputBuffers[i]);
      menuMove(i, input);
    }
  }else if (gameMode == 2) {
    for (var i = 0; i < 4; i++) {
      if (i < ports) {
        input[i] = interpretInputs(i, true, playerType[i],oldInputBuffers[i]);
        cssControls(i, input);
      }

      actionStates[characterSelections[i]][player[i].actionState].main(i,input);
    }
    for (var i = 0; i < 4; i++) {
      if (playerType[i] > -1) {
        hitDetect(i,input);
      }
    }
    executeHits(input);
      resetHitQueue();
    findPlayers();
  } else if (gameMode == 6) {
    // stage select
    for (var i = 0; i < 4; i++) {
      if (i < ports) {
        input[i] = interpretInputs(i, true,playerType[i],oldInputBuffers[i]);
        sssControls(i, input);
      }
    }
  } else if (playing || frameByFrame) {
    //console.log("test0");
    /*delta = timestamp - lastFrameTimeMs; // get the delta time since last frame
    lastFrameTimeMs = timestamp;
    console.log(delta);*/
    var now = performance.now();
    var dt = now - lastUpdate;

    //console.log(now);
    //console.log(dt);
    lastUpdate = now;

      resetHitQueue();
    const _stage = getActiveStage();
    if (_stage.movingPlatforms) {
      _stage.movingPlatforms();
    }
    destroyArticles();
    executeArticles();

    for (var i = 0; i < 4; i++) {
      if (playerType[i] > -1) {
        if(!starting) {
          input[i] = interpretInputs(i, true,playerType[i],oldInputBuffers[i]);
        }
        update(i,input);
      }
    }
    checkPhantoms();
    for (var i = 0; i < 4; i++) {
      if (playerType[i] > -1) {
        hitDetect(i,input); 
      }
    }
    executeHits(input);
    articlesHitDetection();
    executeArticleHits(input);
    if (!starting && !versusMode) {
      matchTimerTick(input);
    } else {
      startTimer -= 0.01666667;
      if (startTimer < 0) {
        starting = false;
      }
    }
    if (frameByFrame) {
      frameByFrameRender = true;
      wasFrameByFrame = true;
    }
    frameByFrame = false;
    if (showDebug) {
      diff = performance.now() - start;
      gamelogicTime[0] += diff;
      gamelogicTime[0] /= 2;
      if (diff >= 10) {
        gamelogicTime[3]++;
      }
      if (diff < gamelogicTime[2]) {
        gamelogicTime[2] = diff;
      }
      if (diff > gamelogicTime[1]) {
        gamelogicTime[1] = diff;
      }
      dom!.gamelogicAvg!.innerHTML = String(Math.round(gamelogicTime[0]));
      dom!.gamelogicHigh!.innerHTML = String(Math.round(gamelogicTime[1]));
      dom!.gamelogicLow!.innerHTML = String(Math.round(gamelogicTime[2]));
      dom!.gamelogicPeak!.innerHTML = String(gamelogicTime[3]);
    }
  } else if (findingPlayers) {
    findPlayers();
  } else {
    if (!gameEnd) {
      for (var i = 0; i < 4; i++) {
        if (playerType[i] == 0 ||playerType[i] == 2) {
          if (currentPlayers[i] != -1) {
            input[i] = interpretInputs(i, false,playerType[i],oldInputBuffers[i]);
          }
        }
      }
    }
  }
  /*

  var beforeWaster = performance.now();
  // neeed to waste 0.666ms
  var timeWasted = false;
  var t = 0;
  var o = performance.now();
  while(!timeWasted){
    var n = performance.now();
    t += n - o;
    //console.log(t);
    if (t > 0.6666){
      timeWasted = true;
    }
    o = n;
    //console.log(".");
  }
  //console.log(performance.now() - beforeWaster);*/

    saveGameState(input);

  setTimeout(gameTick, 16, input);

}

export function clearScreen (){
  //bg1.fillStyle = "rgb(0, 0, 0)";
  //bg1.fillRect(0,0,layers?.BG1?.width ?? 0,layers?.BG1?.height ?? 0);
  bg2.clearRect(0, 0, layers?.BG2?.width ?? 0, layers?.BG2?.height ?? 0);
  //fg1.clearRect(0,0,layers?.FG1?.width ?? 0,layers?.FG1?.height ?? 0);
  fg2.clearRect(0, 0, layers?.FG2?.width ?? 0, layers?.FG2?.height ?? 0);
  ui.clearRect(0, 0, layers?.UI?.width ?? 0, layers?.UI?.height ?? 0);
}

let otherFrame = true;
let fps30 = false;
export function renderTick (){
  window.requestAnimationFrame(renderTick);
  otherFrame = !otherFrame;
  if ((fps30 && otherFrame) || !fps30) {
    //console.log("------");
    if (gameMode == 20) {
      drawStartUp();
    } else if (gameMode == 10) {
      drawAudioMenu();
    } else if (gameMode == 11) {
      drawGameplayMenu();
    } else if (gameMode == 12) {
      drawKeyboardMenu();
    } else if (gameMode == 13) {
      // drawCredits();
    } else if (gameMode == 14) {
      drawControllerMenu();
    } else if (gameMode == 0) {
      drawStartScreen();
    } else if (gameMode == 1) {
      drawMainMenu();
    } else if (gameMode == 2) {
      drawCSS();
      //renderVfx();
    } else if (gameMode == 6) {
      drawSSS();
    } else if (playing || frameByFrameRender) {
      /*delta = timestamp - lastFrameTimeMs; // get the delta time since last frame
      lastFrameTimeMs = timestamp;
      console.log(delta);*/
      //console.log("test2");
      var rStart = performance.now();
      clearScreen();
      if (isShowSFX()) {
        drawBackground();
      }
      drawStage();
      for (var i = 0; i < 4; i++) {
        if (playerType[i] > -1) {
          renderPlayer(i);
        }
      }
      renderArticles();
      renderVfx();
      renderOverlay(true);

      if (showDebug) {
        var diff = performance.now() - rStart;
        renderTime[0] += diff;
        renderTime[0] /= 2;
        if (diff >= 10) {
          renderTime[3]++;
        }
        if (diff > renderTime[1]) {
          renderTime[1] = diff;
        }
        if (diff < renderTime[2]) {
          renderTime[2] = diff;
        }

        dom!.renderAvg!.innerHTML = String(Math.round(renderTime[0]));
        dom!.renderHigh!.innerHTML = String(Math.round(renderTime[1]));
        dom!.renderLow!.innerHTML = String(Math.round(renderTime[2]));
        dom!.renderPeak!.innerHTML = String(renderTime[3]);
      }
    }
    if (frameByFrameRender) {
      renderForeground();
    }
    frameByFrameRender = false;
    //renderToMain();
    //console.log(performance.now());
  } else {
    if (playing) {
      renderVfx(true);
    }
  }
}

export function buildPlayerObject (i){
  player[i] = new playerObject(characterSelections[i],startingPoint[i],startingFace[i]);
  player[i].phys.ECB1 = [new Vec2D(startingPoint[i].x,startingPoint[i].y),new Vec2D(startingPoint[i].x,startingPoint[i].y),new Vec2D(startingPoint[i].x,startingPoint[i].y),new Vec2D(startingPoint[i].x,startingPoint[i].y)];
  player[i].phys.ECBp = [new Vec2D(startingPoint[i].x,startingPoint[i].y),new Vec2D(startingPoint[i].x,startingPoint[i].y),new Vec2D(startingPoint[i].x,startingPoint[i].y),new Vec2D(startingPoint[i].x,startingPoint[i].y)];
  player[i].difficulty = cpuDifficulty[i];
}



export function initializePlayers (i,target){
  buildPlayerObject(i);
  if (target) {
    drawVfx({
      name: "entrance",
      pos: new Vec2D(activeStage.startingPoint[0].x, activeStage.startingPoint[0].y)
    });
  } else {
    drawVfx({
      name: "entrance",
      pos: new Vec2D(startingPoint[i][0], startingPoint[i][1])
    });
  }
}

export function startGame (){
  setVsStage(stageSelect);
  setBackgroundType(Math.round(Math.random()));
  changeGamemode(3);
  resetVfxQueue();
  for (var n = 0; n < 4; n++) {
    if (playerType[n] > -1) {
      initializePlayers(n, false);
      renderPlayer(n);
      player[n].inCSS = false;
    }
    if (versusMode) {
      player[n].stocks = 1;
    }
  }
  matchTimer = 480;
  startTimer = 1.5;
  starting = true;
  MusicManager.stopWhatisPlaying();
  switch (stageSelect) {
    case 0:
      MusicManager.playBattleFieldLoop();
      break;
    case 1:
      MusicManager.playyStoryLoop();
      break;
    case 2:
      MusicManager.playpStadiumLoop();
      break;
    case 3:
      MusicManager.playDreamLandLoop();
      break;
      case 4:
      MusicManager.playfinaldLoop();
      break;
      case 5:
      MusicManager.playfodLoop();
      break;
    default:
      break;
  }
  drawVfx({
    name: "start",
    pos: new Vec2D(0, 0)
  });
  findingPlayers = false;
  playing = true;
}

export function endGame (input){
  gameEnd = false;
  resetLostStockQueue();
    setPhantonQueue([]);
    resetAArticles();
  MusicManager.stopWhatisPlaying();
  // changeVolume(MusicManager, masterVolume[1], 1);
  playing = false;
  clearScreen();
  drawStage();
  setTokenPosSnapToChar(0);
  setTokenPosSnapToChar(1);
  setTokenPosSnapToChar(2);
  setTokenPosSnapToChar(3);
  if (gameMode == 3) {
    changeGamemode(2);
    MusicManager.playMenuLoop();
  pause = [[true,true],[true,true],[true,true],[true,true]];
  frameAdvance = [
    [true, true],
    [true, true],
    [true, true],
    [true, true]
  ];
  findingPlayers = true;
  positionPlayersInCSS();
  for (var i = 0; i < 4; i++) {
    if (playerType[i] > -1) {
      if (player[i].actionState == "FURAFURA") {
        sounds.furaloop.stop(player[i].furaLoopID);
      }
      //input[i][0].a = true; // do
      //input[i][1].a = true; // not
      player[i].inCSS = true;
      player[i].phys.face = 1;
      player[i].actionState = "WAIT";
      player[i].timer = 0;
    }
  }
}
}

export function finishGame (input=null){
  gameEnd = true;
  playing = false;
  fg2.save();
  fg2.textAlign = "center";
  var text = "Game!";
  var size = 300;
  var textScale = 1;
  var textGrad = fg2.createLinearGradient(0, 200, 0, 520);
  if (matchTimer <= 0) {
    text = "Time!";
    sounds.time.play();
    textGrad.addColorStop(0, "black");
    textGrad.addColorStop(0.5, "black");
    textGrad.addColorStop(0.7, "rgb(21, 51, 180)");
    textGrad.addColorStop(1, "rgb(71, 94, 250)");
  } else {
    sounds.game.play();
    textGrad.addColorStop(0, "black");
    textGrad.addColorStop(0.4, "black");
    textGrad.addColorStop(0.7, "rgb(167, 27, 40)");
    textGrad.addColorStop(1, "rgb(255, 31, 52)");
  }
  fg2.scale(1, textScale);
  fg2.fillStyle = textGrad;
  fg2.lineWidth = 40;
  fg2.strokeStyle = "black";
  fg2.font = "900 " + size + "px Arial";
  fg2.strokeText(text, 600, 470 / textScale);
  fg2.lineWidth = 20;
  fg2.strokeStyle = "white";
  fg2.font = "900 " + size + "px Arial";
  fg2.strokeText(text, 600, 470 / textScale);
  fg2.font = "900 " + size + "px Arial";
  fg2.fillText(text, 600, 470 / textScale);
  fg2.restore();
  MusicManager.stopWhatisPlaying();
  setTimeout(function() {
    endGame(input)
  }, 2500);
}

function onFullScreenChange() {
  var fullscreenElement = document.fullscreenElement;

  // if in fullscreen mode fullscreenElement won't be null
  var cont = document.getElementById("topButtonContainer");
  var icn = document.querySelectorAll(".topButton");
  if (cont === null) {
    throw Error("top button container not found");
  }
  if (icn?.length === null) {
    throw Error("top button class not found");
  }
  
  if (fullscreenElement != null){
    cont!.style!.transition = "opacity 0.5s linear 0s";
    cont!.style!.opacity = "0";
    setTimeout(function(){
        var i;
        for (i = 0; i < icn.length; i++) {
          icn[i]!.setAttribute("style", "height: 5px");
        }
        cont!.style!.height = "5px";
        window.resize();
      }, 500);
    $("#keyboardPrompt").hide();
    $("#keyboardControlsImg").hide();
    $("#controllerSupportContainer").hide();
    $("#debugButtonEdit").empty().append("OFF");
    $("#debug").hide();
    $("#players").hide();
    $("body").css("overflow", "hidden");
    // showHeader = false;
  } else {
    var i;
    for (i = 0; i < icn.length; i++) {
      // icn[i]!.style!.height = "25px";
      icn[i]!.setAttribute("style", "height: 25px");
    }
    cont!.style!.height = "31px";
    cont!.style!.transition = "opacity 0.5s linear 0s";
    cont!.style!.opacity = "1";
  }
}


export function start (){
  for (var i=0;i<4;i++){
    buildPlayerObject(i);
    player[i].phys.face = 1;
    player[i].actionState = "WAIT";
  }
    cacheDom();
    getKeyboardCookie();
    getAudioCookies();
    getGameplayCookies();
  $("#keyboardButton").click(function(){
    $("#keyboardControlsImg").toggle();
    $("#keyboardPrompt").hide();
  });
  $("#controllerButton").click(function() {
    $("#controllerSupportContainer").toggle();
  });
  
  if (layers === null) {
    throw Error("layers is null");
  }

  layers.BG1 = document.getElementById("background1Canvas") as HTMLCanvasElement | null;
  bg1 = layers!.BG1!.getContext("2d") as CanvasRenderingContext2D;
  if (!layers.BG1) throw Error("bg1 not found");
  layers.BG2 = document.getElementById("background2Canvas") as HTMLCanvasElement | null;
  bg2 = layers!.BG2!.getContext("2d") as CanvasRenderingContext2D;
  if (!layers.BG2) throw Error("bg2 not found");
  layers.FG1 = document.getElementById("foreground1Canvas") as HTMLCanvasElement | null;
  fg1 = layers!.FG1!.getContext("2d") as CanvasRenderingContext2D;
  if (!layers.FG1) throw Error("fg1 not found");
  layers.FG2 = document.getElementById("foreground2Canvas") as HTMLCanvasElement | null;
  fg2 = layers!.FG2!.getContext("2d") as CanvasRenderingContext2D;
  if (!layers.FG2) throw Error("fg2 not found");
  layers.UI = document.getElementById("uiCanvas") as HTMLCanvasElement | null;
  if (!layers.UI) throw Error("uiCanvas not found");
  ui = layers!.UI!.getContext("2d") as CanvasRenderingContext2D;
  bg1.fillStyle = "rgb(0, 0, 0)";
  bg1.fillRect(0, 0, layers?.BG1?.width ?? 0, layers?.BG1?.height ?? 0);
  let nullInputBuffers =  [nullInputs(), nullInputs(), nullInputs(), nullInputs()];
  gameTick(nullInputBuffers);
  renderTick();

  $("#effectsButton").click(function() {
    if (isShowSFX()) {
      $("#effectsButtonEdit").empty().append("OFF");
    } else {
      $("#effectsButtonEdit").empty().append("ON");
    }
    toggleShowSFX();
  });

  $("#fpsButton").click(function() {
    if (fps30) {
      $("#fpsButtonEdit").empty().append("60");
    } else {
      $("#fpsButtonEdit").empty().append("30");
    }
    fps30 = !fps30;
  });

  $("#alphaButton").click(function() {
    if (getTransparency()) {
      $("#alphaButtonEdit").empty().append("OFF");
    } else {
      $("#alphaButtonEdit").empty().append("ON");
    }
      toggleTransparency();
  });

  $("#layerButton").hover(function() {
    $("#layerDropdown").toggle();
  });

  $(".layer").click(function(this: HTMLElement) {
    var id = $(this).attr("id");
    switch (id) {
      case "layer1":
        layerSwitches.BG1 = !layerSwitches.BG1;
        $("#background1Canvas").toggle();
        break;
      case "layer2":
        layerSwitches.BG2 = !layerSwitches.BG2;
        $("#background2Canvas").toggle();
        break;
      case "layer3":
        layerSwitches.FG1 = !layerSwitches.FG1;
        $("#foreground1Canvas").toggle();
        break;
      case "layer4":
        layerSwitches.FG2 = !layerSwitches.FG2;
        $("#foreground2Canvas").toggle();
        break;
      case "layer5":
        layerSwitches.UI = !layerSwitches.UI;
        $("#uiCanvas").toggle();
        break;
      default:
        break;
    }
    $(this).toggleClass("layerOn");
  });

  $("#debugButton").click(function() {
    if (showDebug) {
      for (let i = 0; i < 4; i++) {
        document.getElementById("gamepadSVG"+i)!.style!.display = "none";
      }
      $("#debugButtonEdit").empty().append("OFF");
      $("#debug").hide();
      $("#players").hide();
      $("body").css("overflow", "hidden");
      //var mY = Math.max(($(window).height()-750)/2,0);
      //$("#display").css("margin",mY+"px 0px 0px "+mX+"px");
    } else {
      for (let i = 0; i < 4; i++) {
        if (playerType[i] !== -1) {
          updateGamepadSVGColour(i, "gamepadSVG"+i);
          document.getElementById("gamepadSVG"+i)!.style!.display = "";
        }
      }
      $("#debugButtonEdit").empty().append("ON");
      $("#debug").show();
      $("#players").show();
      $("body").css("overflow", "scroll");
      //var mY = Math.max(($(window).height()-900)/2,0);
      //$("#display").css("margin",mY+" 0px 0px px "+mX+"px");
    }
    showDebug = !showDebug;
    window.resize();
  });

  $("#hideButton").click(function() {
    $("#header").toggle();
    // // showHeader = !showHeader;
    window.resize();
  });

  $("#fullscreenButton").click(function() {
    if (document.fullscreenElement) {
      // Exit fullscreen mode
      document.exitFullscreen().catch(err => {
        console.error("Failed to exit fullscreen mode:", err);
      });
    } else {
      // Enter fullscreen mode
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error("Failed to enter fullscreen mode:", err);
        });
      } else if ((document.documentElement as any).mozRequestFullScreen) {
        (document.documentElement as any).mozRequestFullScreen().catch(err => {
          console.error("Failed to enter fullscreen mode:", err);
        });
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen().catch(err => {
          console.error("Failed to enter fullscreen mode:", err);
        });
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen().catch(err => {
          console.error("Failed to enter fullscreen mode:", err);
        });
      } else {
        console.log("Fullscreen API is not supported");
      }
    }
  });

  document.addEventListener("fullscreenchange", onFullScreenChange, false);
  document.addEventListener("webkitfullscreenchange", onFullScreenChange, false);
  document.addEventListener("mozfullscreenchange", onFullScreenChange, false);

  $(".topButton").hover(function(this: HTMLElement) {
    $(this).children(".buttonDetails").toggle();
  });

  if (window.mobile === false) {
    $(".button").hover(function(this: HTMLElement) {
      $(this).toggleClass("buttonhighlighted");
    });
    $(".socialmedia").hover(function(this: HTMLElement) {
      $(this).toggleClass("socialmediahighlight");
    });
    $(".sugbtn").hover(function(this: HTMLElement) {
      $(this).toggleClass("sugbtnhighlight");
    });
  }
  $("#appsButton").hover(function() {
    $("#appsDropdown").show();
  }, function() {
    $("#appsDropdown").hide();
  });
  
  $("#replay").change(function() {


    // grab the first image in the FileList object and pass it to the function
    // loadReplay(this.files[0]); // todo - wat???
  });

  window.resize();
}
window.start = start;

export class customDeadzone {
  ls: Vec2D;
  cs: Vec2D;
  l: number;
  r: number;

  constructor() {
    this.ls = new Vec2D(0,0);
    this.cs = new Vec2D(0,0);
    this.l = 0;
    this.r = 0;
  }
}

export function addShine (val){
    shine += val;
}
export function setShine (val){
    shine = val;
}
export function setFindingPlayers(val){
  findingPlayers = val;
}
export function setPlaying(val){
  playing = val;
}
export function setCalibrationPlayer(val){
  calibrationPlayer =val;
}

const dom: {
  matchMinutes: HTMLElement | null,
  matchSeconds: HTMLElement | null,
  gamelogicAvg: HTMLElement | null,
  gamelogicHigh: HTMLElement | null,
  gamelogicLow: HTMLElement | null,
  gamelogicPeak: HTMLElement | null,
  renderAvg: HTMLElement | null,
  renderHigh: HTMLElement | null,
  renderLow: HTMLElement | null,
  renderPeak: HTMLElement | null,
} = {
  matchMinutes: null,
  matchSeconds: null,
  gamelogicAvg: null,
  gamelogicHigh: null,
  gamelogicLow: null,
  gamelogicPeak: null,
  renderAvg: null,
  renderHigh: null,
  renderLow: null,
  renderPeak: null,
};

export function cacheDom() {
  const elementIds = [
    "matchMinutes",
    "matchSeconds",
    "gamelogicAvg",
    "gamelogicHigh",
    "gamelogicLow",
    "gamelogicPeak",
    "renderAvg",
    "renderHigh",
    "renderLow",
    "renderPeak",
  ];

  elementIds.forEach((id) => {
    dom[id] = document.getElementById(id);
  });
};

export function setCS(index,val){
  characterSelections[index] = val;
}