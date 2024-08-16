"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
class State {
    constructor(name, canEdgeCancel, canBeGrabbed, init, main, interrupt) {
        this.name = name;
        this.canEdgeCancel = canEdgeCancel;
        this.canBeGrabbed = canBeGrabbed;
        this.init = init;
        this.main = main;
        this.interrupt = interrupt;
    }
}
exports.State = State;
