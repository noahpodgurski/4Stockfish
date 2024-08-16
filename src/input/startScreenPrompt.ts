//<div id="cib0" class="controllerInfoBox"><div class="cibInput"><div class="cibInputTitle"><p>Input</p></div><div id="cibL0" class="cibInputLight"></div></div><div class="cibName"><p class="cibNameBig">Mayflash</p><p class="cibNameSmall">asdasdasdasdasdasdasdasdasdasd</p></div><div class="cibPrompt"><p id="cibPromptEdit0">Ready</p></div></div>

import {gameMode} from "../main/main.js";

const domCIBContainer = document.getElementById("controllerInfoBoxContainer");

export function startControllerInfoBox() {
  const gamepads = navigator.getGamepads();
  let i = 0;
  for (i=0;i<gamepads.length;i++) {
    if (gamepads[i] === null) {
      continue;
    }
    const gamepad = gamepads[i] as Gamepad;
    
    domCIBContainer?.insertAdjacentHTML('beforeend', '<div id="cib'+i+'" class="controllerInfoBox"><div class="cibInput"><div class="cibInputTitle"><p>Input</p></div><div id="cibL'+i+'" class="cibInputLight"></div></div><div class="cibName"><p class="cibNameBig">Mayflash</p><p class="cibNameSmall">'+gamepad.id+'</p></div><div class="cibPrompt"><p id="cibPromptEdit'+i+'">Ready</p></div></div>');
  }
  if (i === 0) {
    domCIBContainer?.insertAdjacentHTML('beforeend', '<div id="noControllerPrompt"><p>No Controllers Detected</p></div>');
  }
}

export function renderControllerInputLight() {
  const gamepads = navigator.getGamepads();
  let cibLight;
  let foundInput;
  let colour;
  for (let i=0;i<gamepads.length;i++) {
    if (gamepads[i] === null) {
      continue;
    }
    const gamepad = gamepads[i] as Gamepad;
    foundInput = false;
    colour = "black";
    for (let j=0;j<gamepad.buttons.length;j++) {
      if (gamepad.buttons[j].pressed || gamepad.buttons[j].value > 0) {
        foundInput = true;
        break;
      }
    }
    if (foundInput) {
      colour = "#4eff3c";
    }
    cibLight = document.getElementById("cibL"+i);
    if (typeof(cibLight) !== 'undefined' && cibLight !== null) {
      cibLight.style.backgroundColor = colour;
    }
  }
}