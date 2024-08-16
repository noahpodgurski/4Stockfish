export {};

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
        start: () => void;
    }
}