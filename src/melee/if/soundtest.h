#ifndef _SOUNDTEST_H_
#define _SOUNDTEST_H_

#include <Runtime/platform.h>

#include <melee/if/forward.h>

#include <dat_macros.h>

#include <melee/if/types.h>

struct SoundTestMenuData {
    /* 0x000 */ struct un_80304138_objalloc_t_x8 entries[11];
    /* 0x160 */ char x160[0xC];
    /* 0x16C */ char x16C[0x18];
};

/* 2FF7DC */ void un_802FF7DC(void);
/* 2FF884 */ bool un_802FF884(char*);
/* 3F9FA4 */ extern struct SoundTestMenuData un_803F9FA4;

/// Symbol table loaded from SmSt.dat
struct DISC_STRUCT SoundTestLoadData {
    /* 0x00 */ int x0;
    /* 0x04 */ DISC_PTR(DISC_PTR(char)) x4 DAT_COUNT(x0);
    /// 55 sound-group names plus the final GRPSFX_END entry.
    /* 0x08 */ DISC_PTR(DISC_PTR(char)) x8 DAT_COUNT(56);
    /* 0x0C */ DISC_PTR(DISC_PTR(char)) xC DAT_COUNT(x10);
    /* 0x10 */ int x10;
    /* 0x14 */ DISC_PTR(DiscS32) x14 DAT_COUNT(x10);
    /// Per-group lengths, bounded by #un_803F9FA4's entry 6.
    /* 0x18 */ DISC_PTR(DiscS32) x18 DAT_COUNT(55);
    /// 98 music names plus the unused testnz.hps entry.
    /* 0x1C */ DISC_PTR(DISC_PTR(char)) x1C DAT_COUNT(99);
};
DISC_ASSERT_SIZE(struct SoundTestLoadData, 0x20);

#endif
