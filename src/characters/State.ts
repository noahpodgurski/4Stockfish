import { Vec2D } from '../main/util/Vec2D';

export class State {
    name: string;
    canEdgeCancel?: boolean;
    canBeGrabbed?: boolean;
    canGrabLedge?: any;
    setVelocities?: number[];
    setVelocities1?: number[];
    setVelocities2?: number[];
    offset?: any;
    posOffset?: any; //number[] or number[][]
    init?: any;
    initWithType?: (p: number, input: any, type: number | false) => void;
    initWithNormal?: (p: number, input: any, normal: Vec2D) => void;
    main: (p: number, input: any) => void;
    interrupt: (p: number, input: any) => boolean;

    constructor(
        name: string,
        canEdgeCancel: boolean,
        canBeGrabbed: boolean,
        canGrabLedge: any,
        setVelocities: number[],
        setVelocities1: number[],
        setVelocities2: number[],
        offset: any,
        posOffset: any,
        init: any,
        initWithType: (p: number, input: any, type: number | false) => void,
        initWithNormal: (p: number, input: any, normal: Vec2D) => void,
        main: (p: number, input: any) => void,
        interrupt: (p: number, input: any) => boolean
    ) {
        this.name = name;
        this.canEdgeCancel = canEdgeCancel;
        this.canBeGrabbed = canBeGrabbed;
        this.canGrabLedge = canBeGrabbed;
        this.setVelocities = setVelocities;
        this.setVelocities1 = setVelocities;
        this.setVelocities2 = setVelocities;
        this.offset = offset;
        this.posOffset = posOffset;
        this.init = (p, input=null, addInitV = false) => init(p, input, addInitV);
        this.initWithType = initWithType;
        this.initWithNormal = initWithNormal;
        this.init = init;
        this.main = main;
        this.interrupt = interrupt;
    }
}