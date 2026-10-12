#ifndef SYSDOLPHIN_BASELIB_SPLINE_H
#define SYSDOLPHIN_BASELIB_SPLINE_H

#include <dat_macros.h>

#include <dolphin/mtx.h>

/* On-disc (reached from HSD_Joint.u.spline / stage data). */
typedef struct DISC_STRUCT HSD_Spline {
    /*  +0 */ u8 type;
    /*  +2 */ s16 numcv;
    /*  +4 */ f32 tension;
    DISC_PTR(DiscVec3) cv DAT_COUNT(numcv + 2 * (type != 0));
    /*  +C */ f32 totalLength;
    DISC_PTR(DiscF32) segLength DAT_COUNT(numcv);
    DISC_PTR(DiscF32) segPoly DAT_COUNT(numcv - 1); /* f32[numcv-1][5] */
} HSD_Spline;
DISC_ASSERT_SIZE(HSD_Spline, 0x18);

f32 splGetHelmite(f32, f32, f32, f32, f32, f32);
void splGetSplinePoint(Vec3*, HSD_Spline*, f32);
f32 splArcLengthGetParameter(HSD_Spline*, f32);
void splArcLengthPoint(Vec3*, HSD_Spline*, f32);

#endif
