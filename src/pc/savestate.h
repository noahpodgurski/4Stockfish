/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Dev savestates. Ctrl+S, or Z on the 4stockfish pause menu, writes
 * melee-pc/savestates/latest.msv and a timestamped copy. Ctrl+O opens a
 * file dialog; the chosen .msv is restored on the next tick of that scene,
 * and a paused file starts a search from that frame. MELEE_SAVESTATE=<path>
 * still restores once at boot. MELEE_SAVESTATE_DIR overrides the directory.
 * See src/pc/savestate.c. */
#ifndef PC_SAVESTATE_H
#define PC_SAVESTATE_H

#ifdef __cplusplus
extern "C" {
#endif

void pc_savestate_request_save(void);
/* File dialog. The chosen .msv is restored on a later tick. */
void pc_savestate_request_open(void);
/* Bumps once each time a file is restored. */
int pc_savestate_generation(void);
/* One short status line for the pause menu, or NULL. */
const char* pc_savestate_message(void);
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
