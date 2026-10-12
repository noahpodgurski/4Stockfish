#ifndef MELEE_FT_CHARA_FTSANDBAG_TYPES_H
#define MELEE_FT_CHARA_FTSANDBAG_TYPES_H

#include <melee/ft/forward.h>
#include <melee/ft/kinds/ftSandbag/forward.h> // IWYU pragma: export

struct DISC_STRUCT _ftSandbagAttributes {
    u32 x0_pair[2];
};
DISC_ASSERT_SIZE(ftSandbagAttributes, 0x8);

struct ftSandbag_FighterVars {
    char filler0[FIGHTERVARS_SIZE];
};

#endif
