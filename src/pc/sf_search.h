/* SPDX-License-Identifier: GPL-3.0-or-later */
#ifndef PC_SF_SEARCH_H
#define PC_SF_SEARCH_H
/* 4stockfish, the pause-menu combo advisor (4stockfish.md). Pausing a match
 * searches ahead from that frame by running the real tick on snapshots
 * (net_snapshot.c), lists every input line for the first human with the
 * damage or KO a straight replay of each produced, and plays a chosen
 * line in real time before rewinding to the pause.
 *
 * All advisor state lives in src/pc/sf_search.c, outside every snapshot, so
 * a restore never rewinds it. The menu itself (SIS text, pad reading) is
 * src/melee/sf/4stockfish.c. Game thread only. */

#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

enum {
    PC_SF_IDLE,   /* no advisor: the match runs as usual */
    PC_SF_SEARCH, /* searching; the scene loop's tick slots belong to the advisor */
    PC_SF_MENU,   /* paused on the root with the results listed */
    PC_SF_PLAY,   /* replaying the chosen line in real time */
    PC_SF_HOLD,   /* paused on the replay's result, then back to the menu */
};

/* pc_sf_slice's answer to the scene loop (gmscene.c gm_801A4D34). */
enum {
    PC_SF_PASS,   /* run the normal tick */
    PC_SF_TICKED, /* the advisor ran this tick slot */
    PC_SF_YIELD,  /* the advisor ran; end this batch and present */
};

#define PC_SF_LINES 64 /* every kept candidate can be listed */
#define PC_SF_LINE_TEXT 72
#define PC_SF_FOUND 128 /* hits kept for the search's live arrows */

typedef struct PcSfView {
    int state;
    int horizon;
    int endlag;       /* frames out of hitstun a line may spend before it stops */
    int effort;       /* budget multiplier: 1, 2, 4 or 8 times the trials per frame */
    int depth;        /* frames searched so far */
    int progress;     /* 0..1000 over the whole search, verification included */
    int elapsed_time; /* seconds since this search started */
    bool have_best;
    int best_dmg; /* best simulated so far, not yet verified */
    bool best_ko;
    int nlines;
    int cursor;
    struct {
        char text[PC_SF_LINE_TEXT];
        int dmg;
        int frames; /* input frames in this line */
        int advantage; /* hitstun_remaining - actionable_frames at combo end */
        int position;  /* attacker place minus victim place on the path's last frame */
        bool ko;
        unsigned moves; /* bit per pc_sf_move_label index that hit in this line */
        bool have_end;  /* the victim was on screen on the path's last frame */
        float end_x, end_y; /* victim world position on the path's last frame */
        float vel_x, vel_y; /* victim self plus knockback velocity on that frame */
    } lines[PC_SF_LINES];
    bool have_root;
    float root_x, root_y; /* victim world position at the pause */
    struct {
        float x, y;   /* victim world position on the frame a trial hit */
        float vx, vy; /* victim self plus knockback velocity on that frame */
        bool ko;
    } found[PC_SF_FOUND]; /* ring of the newest hits the search found */
    int nfound;
    int found_head; /* next slot written */
    int filter;       /* 0 for none, else 1 + the move bit a listed line must have */
    char* sort_type; /* longest line first, damage, length, position */
    int play_index;
    int result_dmg;
    bool result_ko;
    const char* note; /* one status line in the SIS charset, NULL for none */
    int attacker_slot, victim_slot, victim_sub;
} PcSfView;

/* Scene loop, before each tick slot. run_tick runs one gm_RunSimTick. */
int pc_sf_slice(void (*run_tick)(void));
/* A search tick is running: the menu proc and the fighter hook do nothing. */
bool pc_sf_searching(void);
/* A tick the advisor drives (search or replay) is running. */
bool pc_sf_sim_tick(void);
/* gmvs.c: the match outcome check fired. True when the advisor owns the
 * timeline, and then the match must not end. */
bool pc_sf_hold_outcome(void);
/* net.c pc_net_note_io: the game thread asked for a disc read. */
void pc_sf_note_io(void);

/* From the menu proc (paused ticks). */
int pc_sf_state(void);
void pc_sf_request(int pause_bit); /* the match was just paused */
void pc_sf_end(void);              /* the game unpaused itself from the menu */
void pc_sf_on_loaded(void);        /* a savestate replaced the match; drop the old root */
void pc_sf_horizon_step(int dir);  /* -1 / +1: 15 frames shorter / longer, then search again */
void pc_sf_endlag_step(int dir);   /* -1 / +1: 15 frames less / more endlag, then search again */
void pc_sf_effort_step(void);      /* 1x, 2x, 4x, 8x search budget, then search again */
void pc_sf_cursor_step(int dir);   /* skips lines the filter hides */
void pc_sf_filter_step(int dir);   /* -1 / +1: previous / next move present in the list, or none */
bool pc_sf_line_shown(int i);      /* line i passes the filter */
const char* pc_sf_move_label(int bit);
void pc_sf_sort_toggle(void); /* damage order <-> length order */
void pc_sf_play(void);        /* replay the line under the cursor */
const PcSfView* pc_sf_view(void);

#ifdef __cplusplus
}
#endif

#endif
