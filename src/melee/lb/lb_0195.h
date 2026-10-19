#ifndef GALE01_01955C
#define GALE01_01955C

#include <Runtime/platform.h>

/* 01955C */ void lb_8001955C(void);
/* 0195D0 */ void lb_800195D0(void);
/* 0195FC */ void fn_800195FC(void);
/* 019628 */ void lb_80019628(void);
/* 019880 */ void lb_80019880(u64);
/* 019894 */ u8 lb_80019894(void);
/* 0198E0 */ void lb_800198E0(void);
/* 019900 */ void lb_80019900(void);
/* 019A30 */ bool lb_80019A30(int);
/* 019A48 */ void lb_80019A48(void);
/* 019AAC */ void lb_80019AAC(Event);

#ifdef TARGET_PC
/// Every pad period runs exactly one frame of both clocks (game speed 1), so
/// lb_80019900 leaves its accumulators where it found them and a re-run tick
/// advances the same way. The accumulators are outside every snapshot.
bool lb_EveryPeriodTicks(void);
#endif

#endif
