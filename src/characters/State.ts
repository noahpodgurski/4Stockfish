import { Vec2D } from '../main/util/Vec2D';

export class State {
    name: string;
    canEdgeCancel?: boolean;
    canBeGrabbed?: boolean;
    canGrabLedge?: any;
    setVelocities?: any;
    setVelocities1?: number[];
    setVelocities2?: number[];
    airVelocities?: number[];
    airborneState?: string;
    groundVelocities?: number[];
    
    offsetVel?: number[];
    offset?: any;
    setPositions?: number[];
    posOffset?: any; //number[] or number[][]

    // situational flags
    canPassThrough?: boolean;
    specialOnHit?: boolean;
    wallJumpAble?: boolean;
    headBonk?: boolean;
    landType?: number;
    disableTeeter?: boolean;
    reverseModel?: boolean;
    crouch?: boolean;
    ignoreCollision?: boolean;
    vCancel?: boolean;
    missfoot?: boolean;
    downed?: boolean;
    inGrab?: boolean;
    dead?: boolean;
    specialWallCollide?: boolean;
    specialClank?: boolean;

    //functions
    init?: any;
    initWithType?: (p: number, input: any, type: number | false) => void;
    initWithNormal?: (p: number, input: any, normal: Vec2D) => void;
    main?: (p: number, input: any) => void;
    interrupt?: (p: number, input: any) => boolean | void | undefined;
    land?: (p: number, input: any) => void;
    landWithNormal?: (p: number, input: any, normal: Vec2D) => void;
    onPlayerHit?: (p: number) => void;
    onWallCollide?: (p: number, input: any, wallFace: any, wallNum: any) => void;
    onClank?: (p: number, input: any, wallFace: any, wallNum: any) => void;

    constructor(
        name: string,
        canEdgeCancel: boolean,
        canBeGrabbed: boolean,
        canGrabLedge: any,
        setVelocities: any,
        setVelocities1: number[],
        setVelocities2: number[],
        airVelocities: number[],
        groundVelocities: number[],
        
        offsetVel: number[],
        offset: any,
        posOffset: any,
        init: any,
        
        setPositions?: number[],
        airborneState?: string,
        canPassThrough?: boolean,
        specialOnHit?: boolean,
        wallJumpAble?: boolean,
        headBonk?: boolean,
        landType?: number,
        disableTeeter?: boolean,
        reverseModel?: boolean,
        crouch?: boolean,
        ignoreCollision?: boolean,
        vCancel?: boolean,
        missfoot?: boolean,
        downed?: boolean,
        inGrab?: boolean,
        dead?: boolean,
        specialWallCollide?: boolean,
        specialClank?: boolean,
        
        initWithType?: (p: number, input: any, type: number | false) => void,
        initWithNormal?: (p: number, input: any, normal: Vec2D) => void,
        main?: (p: number, input: any) => void,
        interrupt?: (p: number, input: any) => boolean | void | undefined,
        land?: (p: number, input: any) => void,
        landWithNormal?: (p: number, input: any, normal: Vec2D) => void,
        onPlayerHit?: (p: number) => void,
        onWallCollide?: (p: number, input: any, wallFace: any, wallNum: any) => void,
        onClank?: (p: number, input: any) => void,
    ) {
        this.name = name;
        this.canEdgeCancel = canEdgeCancel;
        this.canBeGrabbed = canBeGrabbed;
        this.canGrabLedge = canBeGrabbed;
        this.setVelocities = setVelocities;
        this.setVelocities1 = setVelocities1;
        this.setVelocities2 = setVelocities2;
        this.setVelocities2 = setVelocities2;
        this.airVelocities = airVelocities;
        this.airVelocities = airVelocities;
        this.groundVelocities = groundVelocities;

        this.offsetVel = offsetVel;
        this.offset = offset;
        this.posOffset = posOffset;
        this.setPositions = setPositions;

        this.canPassThrough = canPassThrough;
        this.specialOnHit = specialOnHit;
        this.wallJumpAble = wallJumpAble;
        this.headBonk = headBonk;
        this.landType = landType;
        this.disableTeeter = disableTeeter;
        this.reverseModel = reverseModel;
        this.crouch = crouch;
        this.ignoreCollision = ignoreCollision;
        this.vCancel = vCancel;
        this.missfoot = missfoot;
        this.downed = downed;
        this.airborneState = airborneState;
        this.inGrab = inGrab;
        this.dead = dead;
        this.specialWallCollide = specialWallCollide,
        this.specialClank = specialClank,

        this.init = (p, input=null, addInitV = false) => init(p, input, addInitV);
        this.initWithType = initWithType;
        this.initWithNormal = initWithNormal;
        this.init = init;
        this.main = main;
        this.interrupt = interrupt;
        this.land = land;
        this.landWithNormal = landWithNormal;
        this.onPlayerHit = onPlayerHit;
        this.onWallCollide = onWallCollide;
        this.onClank = onClank;
    }
}