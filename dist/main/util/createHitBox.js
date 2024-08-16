"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHitbox = void 0;
class createHitbox {
    constructor(offset, size, dmg, angle, kg, bk, sk, type, clank, hG, hA, throwex = false) {
        this.offset = offset;
        this.size = size;
        this.dmg = dmg;
        this.angle = angle;
        this.kg = kg;
        this.bk = bk;
        this.sk = sk;
        this.type = type;
        this.clank = clank;
        this.hitGrounded = hG;
        this.hitAirborne = hA;
        this.throwextra = throwex;
    }
}
exports.createHitbox = createHitbox;
