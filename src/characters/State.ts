import { Vec2D } from '../main/util/Vec2D';

export class State {
    name: string;
    canEdgeCancel: boolean;
    canBeGrabbed: boolean;
    init: (p: number, input: any, addInitV: boolean) => void;
    initWithType: (p: number, input: any, type: number | false) => void;
    initWithNormal: (p: number, input: any, normal: Vec2D) => void;
    main: (p: number, input: any) => void;
    interrupt: (p: number, input: any) => boolean;

    constructor(
        name: string,
        canEdgeCancel: boolean,
        canBeGrabbed: boolean,
        init: (p: number, input: any, addInitV: boolean=false) => void,
        initWithType: (p: number, input: any, type: number | false) => void,
        initWithNormal: (p: number, input: any, normal: Vec2D) => void,
        main: (p: number, input: any) => void,
        interrupt: (p: number, input: any) => boolean
    ) {
        this.name = name;
        this.canEdgeCancel = canEdgeCancel;
        this.canBeGrabbed = canBeGrabbed;
        this.init = init;
        this.initWithType = initWithType;
        this.initWithNormal = initWithNormal;
        this.init = init;
        this.main = main;
        this.interrupt = interrupt;
    }
}