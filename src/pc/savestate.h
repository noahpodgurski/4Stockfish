/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Dev savestates. Ctrl+S writes melee-pc/savestates/latest.msv (and a
 * timestamped copy). MELEE_SAVESTATE=<path> restores that file once the
 * boot has entered the scene it was saved in. MELEE_SAVESTATE_DIR overrides
 * the output directory. See src/pc/savestate.c. */
#ifndef PC_SAVESTATE_H
#define PC_SAVESTATE_H

#ifdef __cplusplus
extern "C" {
#endif

void pc_savestate_request_save(void);
/* Between ticks (the frame boundary): write a save that was requested. */
void pc_savestate_on_frame(void);
/* Start of a simulation tick: restore MELEE_SAVESTATE, then a queued save. */
void pc_savestate_on_tick(void);
/* Ticks since MELEE_SAVESTATE was restored, or -1 if it has not been. */
int pc_savestate_frames_since_load(void);

#ifdef __cplusplus
}
#endif

#endif
