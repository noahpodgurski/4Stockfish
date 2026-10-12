#ifndef MELEE_DB_DBINIT_H
#define MELEE_DB_DBINIT_H

#include <dat_macros.h>

struct DISC_STRUCT db_Setup_commonData {
    /// Bonus names, bounded by #fn_80228E54.
    /* +0 */ DISC_PTR(DISC_PTR(char)) bonus_names DAT_COUNT(0xD7);
    /// Common motion-state names (#fn_UpdateAnimationInfo).
    /* +4 */ DISC_PTR(DISC_PTR(char)) motionstate_names DAT_COUNT(ftCo_MS_Count);
    /// Common submotion names (#fn_UpdateAnimationInfo).
    /* +8 */ DISC_PTR(DISC_PTR(char)) submotion_names DAT_COUNT(ftCo_SM_Count);
};
DISC_ASSERT_SIZE(struct db_Setup_commonData, 0xC);

#endif
