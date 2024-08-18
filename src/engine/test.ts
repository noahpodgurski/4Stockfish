import { startGame } from "./main";
import { createCanvas } from 'canvas';
import fs from 'fs';

declare global {
    interface Navigator {
        webkitGetGamepads: () => any;
    }
    
    interface Window {
        playSfx: (sound: string) => void;
        changeVolume: (x: any, y: number, z: number) => void;
        start: () => void;
        resize: () => void;
        resizeHeader: () => void;
        animations: any;
        mobile: boolean;
        mType: [any, any, any, any];
        isOffstage: (cpu: any) => boolean;
    }
}

export class Test {

    runGame() {
        console.log('starting engine...');
        startGame(); // Call the external startGame function
    }
    
    // getStateImage = () => {
    //     // Create an offscreen canvas
    //     const width = 1280; // Set the canvas width as per your game
    //     const height = 720; // Set the canvas height as per your game
    //     const canvas = createCanvas(width, height);
    //     const ui = canvas.getContext('2d');
        
    //     ui.fillStyle = "black";
    //     ui.lineWidth = 2;
    //     ui.font = "900 40px Arial";
    //     ui.textAlign = "center";
    //     const matchTimer = 300;
    //     var min = (Math.floor(matchTimer / 60)).toString();
    //     var sec = (matchTimer % 60).toFixed(2);
    //     ui.fillText(((min.length < 2) ? "0" + min : min) + ":" + ((sec.length < 5) ? "0" + sec[0] : sec[0] + sec[1]), 590,
    //     70);
    //     ui.strokeText(((min.length < 2) ? "0" + min : min) + ":" + ((sec.length < 5) ? "0" + sec[0] : sec[0] + sec[1]),
    //     590, 70);
    //     ui.font = "900 25px Arial";
    //     ui.fillText(((sec.length < 5) ? sec[2] + sec[3] : sec[3] + sec[4]), 670, 70);
    //     ui.strokeText(((sec.length < 5) ? sec[2] + sec[3] : sec[3] + sec[4]), 670, 70);
    //     const buffer = canvas.toBuffer('image/png');
    //     fs.writeFileSync('./game_state.png', buffer);
    //     console.log('Image saved successfully.');
    // }
    
    // getStateImage();
}