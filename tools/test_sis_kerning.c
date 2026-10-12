/* Measure real SIS bytecode with deliberately distinct adjacent margins. */
#define __assert libc_assert
#include <assert.h>
#undef __assert
#include <stdlib.h>
#include "../src/sysdolphin/baselib/hsd_3A76.c"

bool pc_region_pal;
uintptr_t OSBaseAddress;
SIS* HSD_SisLib_804D1124[5];
void* pc_resolve_ext_ptr(uint32_t id) {
    abort();
}
void* HSD_SisLib_Alloc(s32 size) {
    return malloc(size);
}
void HSD_SisLib_Free(void* ptr) {
    free(ptr);
}

static void measure(u8* string, bool proportional, float expected) {
    char stack[64] = {0};
    HSD_Text text = {0};
    float width, height;
    text.x80.x = 1.0f;
    text.x80.y = 1.0f;
    text.kerning = proportional;
    text.string_buffer = stack;
    text.x6E = sizeof(stack);
    HSD_SisLib_803A8134(string, &text, &width, &height);
    assert(width == expected);
    assert(height == 32.0f);
    text.box_size_x = 100.0f;
    text.alignment = 1;
    sisFitLineToBox(&text, width);
    assert(text.current_width == (100.0f - expected) / 2.0f);
}

int main(void) {
    u8 ntsc[] = {0x20, 1, 0x20, 2, 0};
    u8 pal[] = {0x22, 0x23, 0};
    u8 last[] = {0x21, 0x1E, 0}; /* Last atlas glyph: index 286. */
    memset(HSD_SisLib_8040CB00, 0, sizeof(HSD_SisLib_8040CB00));
    HSD_SisLib_8040CB00[1] = (TextGlyphMetrics){3, 5};
    HSD_SisLib_8040CB00[2] = (TextGlyphMetrics){7, 9};
    HSD_SisLib_8040CB00[286] = (TextGlyphMetrics){4, 6};
    measure(ntsc, true, 44.0f); /* (32 - 3 - 5 + 2) + (32 - 7 - 9 + 2) */
    measure(ntsc, false, 64.0f);
    measure(last, true, 24.0f);
    pc_region_pal = true;
    measure(pal, true, 44.0f);
    measure(pal, false, 64.0f);
    return 0;
}
