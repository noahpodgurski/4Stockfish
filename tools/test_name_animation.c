/* Exercise the real name-menu animation selection, including target precedence. */
#define __assert libc_assert
#include <assert.h>
#undef __assert
#include <stdio.h>
#include <stdlib.h>
#include "../src/melee/mn/mnname.c"

static float animation_frame;
static int closed;
MenuFlow mn_804A04F0;

float mn_8022F298(HSD_JObj* jobj) {
    (void)jobj;
    return animation_frame;
}

float mn_8022ED6C(HSD_JObj* jobj, AnimLoopSettings* loop) {
    (void)jobj;
    assert(animation_frame >= loop->start_frame && animation_frame <= loop->end_frame);
    return animation_frame;
}

void HSD_GObjFree(HSD_GObj* gobj) {
    (void)gobj;
    closed++;
}

void HSD_JObjReqAnimAll(HSD_JObj* jobj, float frame) {
    (void)jobj;
    (void)frame;
}

void HSD_JObjAnimAll(HSD_JObj* jobj) {
    (void)jobj;
}

void OSReport(const char* format, ...) {
    (void)format;
    abort();
}

void HSD_SisLib_803A74F0(HSD_Text* text, s32 index, GXColor* color) {
    (void)text;
    (void)index;
    (void)color;
    abort();
}

int main(void) {
    /* Target and index cover all three controls (0x18..0x1A).
     * Each pair is the unpressed/pressed animation start frame. */
    static const float expected[3][3][2] = {
        {{50, 40}, {50, 40}, {50, 40}},
        {{30, 20}, {10, 0}, {30, 20}},
        {{30, 20}, {30, 20}, {10, 0}},
    };
    for (int target = 0; target < 3; target++) {
        for (int index = 0; index < 3; index++) {
            for (int pressed = 0; pressed < 2; pressed++) {
                float frame = mnName_80238964(index + 0x18, target + 0x18, pressed);
                assert(frame == expected[target][index][pressed]);
            }
        }
    }
    puts("Name-menu animation selection: all 18 target/button/press combinations pass");
    MnName_GObj data = {0};
    HSD_GObj gobj = {0};
    gobj.user_data = &data;
    animation_frame = 40;
    mnName_80238C34(&gobj, 0, 0);
    assert(closed == 0);
    animation_frame = 48;
    mnName_80238C34(&gobj, 0, 0);
    assert(closed == 0);
    animation_frame = 49;
    mnName_80238C34(&gobj, 0, 0);
    assert(closed == 1);
    puts("Name-menu lifecycle: remains open at frames 40/48, closes at frame 49");
    return 0;
}
