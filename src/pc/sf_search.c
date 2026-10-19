/* SPDX-License-Identifier: GPL-3.0-or-later */
/* 4stockfish search engine (4stockfish.md, pc/sf_search.h).
 *
 * Root. The pause edge clears the pause, so every trial starts unpaused, and
 * takes one whole-state snapshot (net_snapshot.c) between two ticks.
 *
 * Trial. Restore a parent's snapshot, write the attacker's input into the
 * pad queue head, run the real tick (gmscene.c gm_RunSimTick) and read the
 * victim's percent and stocks. The live pad queue is carried across every
 * restore the way net.c rollback_to does, so the controller stream is not
 * rewound.
 *
 * Tree. One ply is one frame. From each kept state every combo is simulated,
 * and the resulting state is a node of its own: frame 1 after A and frame 1
 * after B are both kept, then each is expanded the same way. The value of a
 * node is the best stock or damage on any line through it (the attacker
 * moves; the victim plays whatever the match already had them doing). Every
 * combo at every depth does not fit in memory. An attack is kept through
 * endlag. It is dropped once the motion ends and it never hit. Other states
 * fill a few slots by score, including one air state. Identical positions,
 * input buffer included, collapse to one node.
 *
 * The inputs tried depend on the state. Ground: tilts, smashes, dashes,
 * a hop, grab, and the four specials. Air: the five aerials, drift, a
 * double jump, and an airdodge angled at the ground. Grab: a throw. During
 * an attack, after it has hit or its interrupt window has opened, A or B
 * with a direction, plus jump. Anything that does not change the body is
 * not kept. An aerial otherwise drifts and L-cancels. Landing from that
 * aerial with the L-cancel window already missed is dropped. A line that
 * has dealt damage continues through hitstun. It ends after the victim has
 * been actionable for more than SF_COMBO_GAP frames. Another hit starts
 * that count over.
 *
 * Publish. Trials that raised the damage or took the stock are candidate
 * lines. Each kept candidate is replayed straight through from the root,
 * then with no input for the same window playback uses. A star KO starts
 * in that window: the stock is removed only after the animation. The menu
 * names the moves that connected. The input sequence is what playback uses.
 *
 * Search ticks are deaf and silent (net.c pc_net_resim, pc_net_audio_deaf),
 * start no rumble, write no .slp frames, never end the match (gmvs.c) and
 * never move net.frame; the advisor is off in netplay. Game thread only. */
#include "compat.h"
#include "pc/sf_search.h"
#include "pc/net_internal.h"

#include <dolphin/ar.h>
#include <dolphin/dvd.h>
#include <dolphin/os.h>
#include <dolphin/pad.h>
#include <dolphin/vi.h>
#include <sysdolphin/baselib/controller.h>
#include <sysdolphin/baselib/gobj.h>
#include <sysdolphin/baselib/random.h>
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wscalar-storage-order" /* disc-struct unions in lb/types.h */
#include <melee/ft/fighter.h>
#include <melee/ft/inlines.h>
#include <melee/ft/kinds/ftCommon/forward.h>
#include <melee/lb/forward.h>
#include <melee/gm/gmscene.h>
#include <melee/gm/gmvs.h>
#include <melee/it/types.h>
#include <melee/lb/lb_0195.h>
#include <melee/lb/lbaudio_ax.h>
#include <melee/pl/player.h>
#include <melee/sf/stockfish.h>
#pragma GCC diagnostic pop
#include <xxhash.h>

#include <SDL3/SDL_thread.h>
#include <SDL3/SDL_timer.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define SF_DIRECTIONS 13 /* neutral, 4 cardinals, 4 half sticks, 4 diagonals */
#define SF_BTN 6 /* none, a, b, jump, shield, grab; nested inside the directions */
/* Shield is button set 4 (L) with a neutral stick. Jump is X, grab is Z. */
#define SF_IN_NONE 0
#define SF_IN_A 1
#define SF_IN_B 2
#define SF_IN_JUMP 3
#define SF_IN_SHIELD 4
#define SF_IN_GRAB 5
#define SF_IN_LEFT (1 * SF_BTN)
#define SF_IN_RIGHT (2 * SF_BTN)
#define SF_IN_UP (3 * SF_BTN)
#define SF_IN_DOWN (4 * SF_BTN)
#define SF_IN_HALF_LEFT (5 * SF_BTN)
#define SF_IN_HALF_RIGHT (6 * SF_BTN)
#define SF_IN_HALF_UP (7 * SF_BTN)
#define SF_IN_HALF_DOWN (8 * SF_BTN)
/* Full diagonals, both axes at the rim. A wavedash is down-left or
 * down-right plus L on the first airborne frame. */
#define SF_IN_UP_LEFT (9 * SF_BTN)
#define SF_IN_UP_RIGHT (10 * SF_BTN)
#define SF_IN_DOWN_LEFT (11 * SF_BTN)
#define SF_IN_DOWN_RIGHT (12 * SF_BTN)
#define SF_IN_WD_L (SF_IN_DOWN_LEFT + SF_IN_SHIELD)
#define SF_IN_WD_R (SF_IN_DOWN_RIGHT + SF_IN_SHIELD)
#define SF_COMBOS (SF_DIRECTIONS * SF_BTN)
_Static_assert(SF_COMBOS <= 128, "s_allow has two words of bits");
_Static_assert(SF_IN_WD_L < SF_COMBOS && SF_IN_WD_R < SF_COMBOS, "wavedash is a diagonal shield");
/* Ground and air states kept beside any attack that has not finished.
 * They are split across the distances available that frame, not given to
 * whoever is closest. After a hit, or when the pause started in hitstun,
 * more of them are kept. */
#define SF_MOVE_KEEP 18
#define SF_COMBO_KEEP 36
#define SF_HORIZON_DEFAULT 60
#define SF_HORIZON_MIN 30
#define SF_HORIZON_MAX 600
#define SF_HORIZON_STEP 30
/* One snapshot per combo, so the ply after the root can keep every input.
 * Two banks, about 6 MB of state each, is about 900 MB. */
#define SF_BEAM_MAX SF_COMBOS
#define SF_BEAM_DEFAULT SF_COMBOS
#define SF_HOF PC_SF_LINES /* candidate lines kept, then all replayed and listed */
#define SF_SLICE_NS 12000000ull
#define SF_HOLD_FRAMES 75
/* After a hit, frames the victim may spend out of hitstun before the line
 * is no longer extended. Hitlag alone is only the freeze, and five frames
 * of that ended every line inside the first move. */
#define SF_COMBO_GAP 45
#define SF_ENDLAG_DEFAULT 10
#define SF_ENDLAG_MIN 0
#define SF_ENDLAG_MAX 120
#define SF_ENDLAG_STEP 5
/* Frames of the victim's velocity added to their position when measuring
 * distance. The aim is pulled back to the victim when that point lies past
 * him. Movement slots are spread across those distances, not given to the
 * closest one. */
#define SF_CHASE_LEAD 20.0f
/* Frames a jump is kept after it leaves the ground. A full hop is still
 * falling into a fair or dair after a short hop would have landed. */
#define SF_COMMIT 70
#define SF_HITS 8 /* connecting moves named on one line */
#define SF_PLAY_TAIL 60 /* frames of no input after the combo, at 60fps */
#define SF_ROOT_TRIES 120 /* presents to wait for a disc read before refusing */
#define SF_FP_SLOTS 32768 /* > 2 * SF_BEAM_MAX * SF_COMBOS, power of two */
#define SF_ITEM_PLINK 9
#define SF_START 0x1000u
#define SF_DPAD_LEFT 0x0001u
#define SF_DPAD_RIGHT 0x0002u
#define SF_TRIGGER_L 0x0040u
#define SF_TRIGGER_R 0x0020u

typedef struct SfCombo {
    int8_t sx, sy;
    uint16_t button;
    char name[24];
} SfCombo;

typedef struct SfLine {
    uint8_t seq[SF_HORIZON_MAX];
    int len;
    int dmg;
    bool ko;
    int motion;
    bool hit_seen; /* this motion has had an attack hitbox out */
    bool attack;   /* A, B, or Z move whose hitboxes are not finished */
    bool iasa;     /* allow_interrupt was set, so this frame can be searched */
    bool connected; /* this attack has already dealt damage */
    uint8_t gap;    /* frames the victim has been out of hitstun */
    uint8_t commit; /* frames left to keep this jump past the squat */
    uint8_t hits[SF_HITS]; /* FtMoveId of each connecting move, in order */
    uint8_t nhits;
} SfLine;

typedef struct SfBeam {
    SfLine line;
    Snapshot snap;
} SfBeam;

typedef struct SfTrial {
    uint16_t parent;
    uint8_t combo;
    bool hitlag;
    bool ko;
    int dmg;
    float dist;
    float side; /* attacker x minus victim x; positive means the victim is to the left */
    float rise;  /* victim y minus attacker y; positive means the opponent is above */
    float front; /* facing times how far the opponent is in front */
    int motion; /* the attacker's action state */
    bool hit_seen;
    bool attack;
    bool iasa;
    bool connected;
    uint8_t gap;
    uint8_t commit;
    uint64_t fp;
} SfTrial;

typedef struct SfResult {
    int dmg;
    bool ko;
    bool hitlag;
    bool dead; /* the attacker lost a stock */
    float dist;
    float side;
    float rise;
    float front;
    int motion;
} SfResult;

/* Two words: a diagonal shield is past bit 63. */
typedef struct SfAllow {
    uint64_t lo, hi;
} SfAllow;

enum { PH_ROOT, PH_EXPAND, PH_ACCEPT, PH_VERIFY, PH_DONE };

static int s_state = PC_SF_IDLE;
static int s_phase;
static void (*s_run_tick)(void);
static bool s_in_tick;     /* an advisor tick is running */
static SDL_ThreadID s_tick_thread;
static bool s_outcome;     /* that tick tried to end the match */
static bool s_io;          /* that tick asked for a disc read */
static bool s_restart;     /* search again from the root, keeping it */
static bool s_resume_ok;   /* the beam at the last horizon is still in a bank */
static int s_resume_bank, s_resume_n, s_resume_depth;
static int s_searched;     /* deepest horizon already finished */
static bool s_trim;        /* re-list stored lines at a shorter horizon */
static bool s_inited;

static int s_pause_bit;
static int s_attacker = -1, s_port, s_victim = -1, s_victim_sub;
static HSD_GObj* s_victim_gobj;
static int s_base_pct, s_base_stocks, s_base_att_stocks;
static int s_horizon = SF_HORIZON_DEFAULT;
static int s_endlag = SF_ENDLAG_DEFAULT;
static bool s_open_combo; /* the opponent was already in hitstun when the search started */
static int s_beam_w = SF_BEAM_DEFAULT;
static int s_root_tries;
static uint8_t s_saved_qtype;
static uint16_t s_real_last[4];

static SfCombo s_combo[SF_COMBOS];
static Snapshot s_root;
static SfBeam s_bank[2][SF_BEAM_MAX];
static int s_cur_bank, s_ncur;
static SfTrial s_trials[SF_BEAM_MAX * SF_COMBOS];
static int s_ntrials;
static int s_pick[SF_BEAM_MAX], s_npick, s_accept_k;
static int s_depth, s_job_parent, s_job_combo;
static int s_open_parent; /* parent whose combos are already known to matter */
static SfAllow s_allow; /* bit per combo while that parent is expanded */
static SfLine s_hof[SF_HOF];
static int s_hof_n, s_verify_i;
static uint64_t s_fp[SF_FP_SLOTS];
static SfLine s_lines[PC_SF_LINES]; /* the published lines, as replay scripts */
static PcSfView s_view;
static XXH3_state_t* s_xxh;

static int s_play_k, s_hold_left;
static int s_play_dmg;
static bool s_play_ko;
static uint32_t s_play_seed;
static bool s_play_seed_ok;

static uint64_t s_search_t0;
static unsigned s_n_trials, s_n_pruned, s_n_impure, s_n_io, s_n_eaten, s_n_verify_bad, s_n_locked,
    s_n_whiff, s_n_lcancel, s_n_gap;

/* ---- inputs ----------------------------------------------------------- */

/* Neutral, the four cardinals, a half stick on each cardinal, and the four
 * full diagonals, times the button sets. Names stay inside the SIS charset
 * (letters, digits, space, comma). Raw 127 is past the 80-unit clamp, so a
 * cardinal or a diagonal reads 1.0 on each axis it uses. Raw 40 divides by
 * scale_stick (80) to 0.5: past the tilt deadzone and short of dash and
 * f-smash (0.8) and of u-smash, d-smash, tap jump and fast fall (0.6625).
 * Grounded A is then a tilt, and the same stick drifts partway in the air.
 * Z is a digital trigger, not a face button. */
static void build_combos(void) {
    enum { SF_STICK_FULL = 127, SF_STICK_HALF = 40 };
    static const int8_t dx[SF_DIRECTIONS] = {
        0, -SF_STICK_FULL, SF_STICK_FULL, 0, 0, -SF_STICK_HALF, SF_STICK_HALF, 0, 0,
        -SF_STICK_FULL, SF_STICK_FULL, -SF_STICK_FULL, SF_STICK_FULL};
    static const int8_t dy[SF_DIRECTIONS] = {
        0, 0, 0, SF_STICK_FULL, -SF_STICK_FULL, 0, 0, SF_STICK_HALF, -SF_STICK_HALF,
        SF_STICK_FULL, SF_STICK_FULL, -SF_STICK_FULL, -SF_STICK_FULL};
    static const char* dname[SF_DIRECTIONS] = {
        "", "left", "right", "up", "down", "half left", "half right", "half up", "half down",
        "up left", "up right", "down left", "down right"};
    static const uint16_t bbit[SF_BTN] = {
        0, PAD_BUTTON_A, PAD_BUTTON_B, PAD_BUTTON_X, PAD_TRIGGER_L, PAD_TRIGGER_Z};
    static const char* bname[SF_BTN] = {"", "a", "b", "jump", "shield", "grab"};
    int n = 0;
    for (int d = 0; d < SF_DIRECTIONS; d++) {
        for (int b = 0; b < SF_BTN; b++, n++) {
            SfCombo* c = &s_combo[n];
            c->sx = dx[d];
            c->sy = dy[d];
            c->button = bbit[b];
            if (d == 0 && b == 0) {
                snprintf(c->name, sizeof c->name, "none");
            } else {
                snprintf(c->name, sizeof c->name, "%s%s%s", dname[d],
                    dname[d][0] != '\0' && bname[b][0] != '\0' ? " " : "", bname[b]);
            }
        }
    }
}

/* The id the game stored when the hit landed (fp+208C). Same id across a
 * multi-hit move, a new id when a different move connects. Names stay in
 * the SIS charset: letters, digits, space, comma. */
static const char* move_name(int id) {
    switch (id) {
    case FtMoveId_Attack11:
    case FtMoveId_Attack12:
    case FtMoveId_Attack13:
    case FtMoveId_Attack100:
    case FtMoveId_SwordSwing1:
    case FtMoveId_BatSwing1:
    case FtMoveId_ParasolSwing1:
    case FtMoveId_HarisenSwing1:
    case FtMoveId_StarRodSwing1:
    case FtMoveId_LipstickSwing1:
        return "jab";
    case FtMoveId_AttackDash:
    case FtMoveId_SwordSwingDash:
    case FtMoveId_BatSwingDash:
    case FtMoveId_ParasolSwingDash:
    case FtMoveId_HarisenSwingDash:
    case FtMoveId_StarRodSwingDash:
    case FtMoveId_LipstickSwingDash:
        return "dash attack";
    case FtMoveId_AttackS3:
    case FtMoveId_SwordSwing3:
    case FtMoveId_BatSwing3:
    case FtMoveId_ParasolSwing3:
    case FtMoveId_HarisenSwing3:
    case FtMoveId_StarRodSwing3:
    case FtMoveId_LipstickSwing3:
        return "forward tilt";
    case FtMoveId_AttackHi3:
        return "up tilt";
    case FtMoveId_AttackLw3:
        return "down tilt";
    case FtMoveId_AttackS4:
    case FtMoveId_SwordSwing4:
    case FtMoveId_BatSwing4:
    case FtMoveId_ParasolSwing4:
    case FtMoveId_HarisenSwing4:
    case FtMoveId_StarRodSwing4:
    case FtMoveId_LipstickSwing4:
        return "f-smash";
    case FtMoveId_AttackHi4:
        return "u-smash";
    case FtMoveId_AttackLw4:
        return "d-smash";
    case FtMoveId_AttackAirN:
        return "nair";
    case FtMoveId_AttackAirF:
        return "fair";
    case FtMoveId_AttackAirB:
        return "bair";
    case FtMoveId_AttackAirHi:
        return "uair";
    case FtMoveId_AttackAirLw:
        return "dair";
    case FtMoveId_SpecialN:
        return "neutral B";
    case FtMoveId_SpecialS:
        return "side B";
    case FtMoveId_SpecialHi:
        return "up B";
    case FtMoveId_SpecialLw:
        return "down B";
    case FtMoveId_ThrowF:
    case FtMoveId_CargoThrowF:
        return "fthrow";
    case FtMoveId_ThrowB:
    case FtMoveId_CargoThrowB:
        return "bthrow";
    case FtMoveId_ThrowHi:
    case FtMoveId_CargoThrowHi:
        return "uthrow";
    case FtMoveId_ThrowLw:
    case FtMoveId_CargoThrowLw:
        return "dthrow";
    case FtMoveId_CatchAttack:
        return "pummel";
    case FtMoveId_DownAttackU:
    case FtMoveId_DownAttackD:
        return "getup attack";
    case FtMoveId_CliffAttackSlow:
    case FtMoveId_CliffAttackQuick:
        return "edge attack";
    default:
        if (id >= FtMoveId_KbSpecialNMr && id <= FtMoveId_KbSpecialNGk) {
            return "neutral special";
        }
        return NULL;
    }
}

static void format_line(char* dst, size_t cap, const SfLine* l) {
    size_t pos = 0;
    dst[0] = '\0';
    if (l->nhits == 0) {
        snprintf(dst, cap, "hit");
        return;
    }
    for (int i = 0; i < l->nhits && pos + 1 < cap; i++) {
        const char* name = move_name(l->hits[i]);
        if (name == NULL) {
            name = "hit";
        }
        int n = snprintf(dst + pos, cap - pos, "%s%s", pos ? ", " : "", name);
        if (n < 0 || pos + (size_t)n >= cap) {
            dst[pos] = '\0';
            break;
        }
        pos += (size_t)n;
    }
}

/* Ports 0-3 for one tick: the attacker's port gets the combo, every other
 * human's port is held neutral, the rest read as unplugged. Search, verify
 * and replay all feed exactly this, so they can agree. */
static void build_pads(PADStatus pads[4], int combo) {
    memset(pads, 0, 4 * sizeof *pads);
    for (int i = 0; i < 4; i++) {
        pads[i].err = PAD_ERR_NO_CONTROLLER;
    }
    for (int slot = 0; slot < GM_MAX_PLAYERS; slot++) {
        if (Player_GetPlayerSlotType(slot) != Gm_PKind_Human) {
            continue;
        }
        int port = Player_GetPadPort(slot);
        if (port >= 0 && port < 4) {
            pads[port].err = PAD_ERR_NONE;
        }
    }
    if (combo >= 0) {
        const SfCombo* c = &s_combo[combo];
        PADStatus* p = &pads[s_port];
        p->err = PAD_ERR_NONE;
        p->stickX = c->sx;
        p->stickY = c->sy;
        p->button = c->button;
        p->triggerLeft = (c->button & PAD_TRIGGER_L) ? 255 : 0;
    }
}

/* ---- pad queue -------------------------------------------------------- */

/* Restore a snapshot but keep the live pad queue and its bookkeeping, as
 * net.c rollback_to does: raw samples queued since the snapshot belong to
 * the present. Rumble comes from the snapshot with the nodes it rewound. */
static void restore_keep_pads(const Snapshot* s) {
    bool intr = OSDisableInterrupts();
    PadLibData pad = HSD_PadLibData;
    HSD_PadData queue[8];
    int qn = pad.qnum > 8 ? 8 : pad.qnum;
    memcpy(queue, pad.queue, (size_t)qn * sizeof *queue);
    snapshot_restore(s);
    memcpy(pad.queue, queue, (size_t)qn * sizeof *queue);
    pad.rumble_info = HSD_PadLibData.rumble_info;
    HSD_PadLibData = pad;
    OSRestoreInterrupts(intr);
}

/* Put this tick's inputs where HSD_PadRenewMasterStatus will read them. A
 * search tick re-exposes the slot the last tick consumed (net.c unconsume)
 * so no real sample is eaten; only a full queue makes it take the head.
 * Re-resolved here, after anything that can run the pad alarm. */
static void feed(const PADStatus pads[4], bool live_head) {
    bool intr = OSDisableInterrupts();
    PadLibData* p = &HSD_PadLibData;
    if (!live_head || p->qcount == 0) {
        if (p->qcount < p->qnum) {
            p->qread = (uint8_t)((p->qread + p->qnum - 1) % p->qnum);
            p->qcount++;
        } else {
            s_n_eaten++;
        }
    }
    memcpy(&p->queue->stat[p->qread * 4], pads, 4 * sizeof *pads);
    OSRestoreInterrupts(intr);
}

/* New presses on the real controllers since the last look, from the raw
 * samples waiting in the queue; `flush` drops them afterwards so the game
 * never sees them. */
static uint32_t real_presses(bool flush) {
    uint32_t pressed = 0;
    bool intr = OSDisableInterrupts();
    PadLibData* p = &HSD_PadLibData;
    for (int k = 0; k < p->qcount; k++) {
        const PADStatus* st = &p->queue->stat[((p->qread + k) % p->qnum) * 4];
        for (int port = 0; port < 4; port++) {
            uint16_t b = st[port].err == PAD_ERR_NONE ? st[port].button : 0;
            uint16_t edge = (uint16_t)(b & ~s_real_last[port]);
            pressed |= port == s_port ? edge : (edge & SF_START);
            s_real_last[port] = b;
        }
    }
    if (flush) {
        p->qread = p->qwrite;
        p->qcount = 0;
    }
    OSRestoreInterrupts(intr);
    return pressed;
}

/* Strip Start from the samples waiting, so a replay or its result cannot be
 * unpaused into: the match must resume from the root, through the menu. */
static bool real_start_strip(void) {
    bool start = false;
    bool intr = OSDisableInterrupts();
    PadLibData* p = &HSD_PadLibData;
    for (int k = 0; k < p->qcount; k++) {
        PADStatus* st = &p->queue->stat[((p->qread + k) % p->qnum) * 4];
        for (int port = 0; port < 4; port++) {
            uint16_t b = st[port].err == PAD_ERR_NONE ? st[port].button : 0;
            start |= (b & SF_START) && !(s_real_last[port] & SF_START);
            s_real_last[port] = b;
            st[port].button &= (uint16_t)~SF_START;
        }
    }
    OSRestoreInterrupts(intr);
    return start;
}

static void real_last_from_master(void) {
    for (int port = 0; port < 4; port++) {
        s_real_last[port] = (uint16_t)(HSD_PadMasterStatus[port].button & 0xffffu);
    }
}

/* ---- one tick --------------------------------------------------------- */

static bool io_busy(void) {
    return aurora_dvd_inflight() > 0 || aurora_arq_inflight() > 0;
}

/* A trial that started a transfer cannot be restored over while the worker
 * is still writing; wait it out (bounded, like net.c dvd_settle). */
static void io_drain(void) {
    uint64_t t0 = SDL_GetTicksNS();
    while (io_busy() && SDL_GetTicksNS() - t0 < 5000000000ull) {
        SDL_DelayNS(200000);
    }
}

static void run_tick(const PADStatus pads[4], bool live_head) {
    feed(pads, live_head);
    s_outcome = false;
    s_io = false;
    s_tick_thread = SDL_GetCurrentThreadID();
    s_in_tick = true;
    s_run_tick();
    s_in_tick = false;
}

static Fighter* fighter_at(int slot, int sub, HSD_GObj** out) {
    HSD_GObj* gobj = Player_GetEntityAtIndex(slot, sub);
    if (out != NULL) {
        *out = gobj;
    }
    if (gobj == NULL || gobj->classifier != HSD_GOBJ_CLASS_FIGHTER) {
        return NULL;
    }
    Fighter* fp = GET_FIGHTER(gobj);
    return fp != NULL && !fp->is_sleeping ? fp : NULL;
}

static SfResult read_result(void) {
    SfResult r = {0, false, false, false, 1e30f, 0, 0, 0, -1};
    HSD_GObj* vg;
    Fighter* v = fighter_at(s_victim, s_victim_sub, &vg);
    /* The stock is removed after the top-blast animation, not when it
     * starts. DeadUpStar and DeadUpStarIce are the star KO. DeadUpFall
     * through DeadUpFallHitCameraIce are the other top-blast KO, also
     * before the stock changes (ftCo_800D3158). */
    bool star = v != NULL && v->motion_id >= ftCo_MS_DeadUpStar &&
                v->motion_id <= ftCo_MS_DeadUpFallHitCameraIce;
    r.ko = vg != s_victim_gobj || v == NULL || Player_GetStocks(s_victim) < s_base_stocks || star;
    r.dead = Player_GetStocks(s_attacker) < s_base_att_stocks;
    if (!r.ko) {
        r.dmg = (int)v->dmg.x1830_percent - s_base_pct;
        if (r.dmg < 0) {
            r.dmg = 0;
        }
        r.hitlag = v->dmg.x195c_hitlag_frames > 0.0F || v->x221C_b6;
        Fighter* a = fighter_at(s_attacker, 0, NULL);
        if (a != NULL) {
            float vx = v->self_vel.x + v->x8c_kb_vel.x;
            float vy = v->self_vel.y + v->x8c_kb_vel.y;
            float aim_x = v->cur_pos.x + vx * SF_CHASE_LEAD;
            float aim_y = v->cur_pos.y + vy * SF_CHASE_LEAD;
            float to_victim = v->cur_pos.x - a->cur_pos.x;
            float to_aim = aim_x - a->cur_pos.x;
            /* The lead point is past the victim, or Fox is already on the
             * far side of it. Aim at the victim so a step through him loses
             * to stopping in front of him. */
            if ((to_victim * to_aim > 0.0f && to_aim * to_aim >= to_victim * to_victim) ||
                to_victim * to_aim < 0.0f)
            {
                aim_x = v->cur_pos.x;
                aim_y = v->cur_pos.y;
            }
            r.side = a->cur_pos.x - v->cur_pos.x;
            r.rise = v->cur_pos.y - a->cur_pos.y;
            r.front = a->facing_dir * (v->cur_pos.x - a->cur_pos.x);
            r.dist = (a->cur_pos.x - aim_x) * (a->cur_pos.x - aim_x) +
                     (a->cur_pos.y - aim_y) * (a->cur_pos.y - aim_y);
            r.motion = (int)a->motion_id;
        }
    }
    return r;
}

/* Grounded, out of hitstun, and stopped. Nothing left in this playback
 * window can carry them into a blast zone. */
static bool victim_settled(void) {
    const Fighter* v = fighter_at(s_victim, s_victim_sub, NULL);
    float vx, vy;
    if (v == NULL || v->ground_or_air != GA_Ground) {
        return false;
    }
    if (v->dmg.x195c_hitlag_frames > 0.0f || v->x221C_b6) {
        return false;
    }
    if (v->motion_id >= ftCo_MS_DeadDown && v->motion_id <= ftCo_MS_DeadUpFallHitCameraIce) {
        return false;
    }
    vx = v->self_vel.x + v->x8c_kb_vel.x;
    vy = v->self_vel.y + v->x8c_kb_vel.y;
    return vx * vx + vy * vy < 0.01f;
}

/* Hitlag is the freeze. x221C_b6 stays set until hitstun runs out, which is
 * the window a second move can still be a combo. */
static bool victim_in_hitstun(void) {
    const Fighter* v = fighter_at(s_victim, s_victim_sub, NULL);
    return v != NULL && (v->dmg.x195c_hitlag_frames > 0.0f || v->x221C_b6);
}

/* What decides the future of a state, cheaply: every fighter's motion,
 * physics, damage, hitlag, the input buffer (so a press that has not moved
 * the animation yet is still frame N after that press, not after no
 * buttons), input timers and motion vars, every item, and the seed. Not
 * net_snapshot.c's state_hash, which reads all 5.6 MB. Merging can only
 * lose a line, never misreport one: every listed number comes from the
 * straight replay in verify_one. */
static uint64_t fingerprint(void) {
    if (s_xxh == NULL) {
        s_xxh = XXH3_createState();
        if (s_xxh == NULL) {
            return 0;
        }
    }
    XXH3_64bits_reset(s_xxh);
    for (int slot = 0; slot < GM_MAX_PLAYERS; slot++) {
        for (int sub = 0; sub < 2; sub++) {
            HSD_GObj* gobj = Player_GetEntityAtIndex(slot, sub);
            if (gobj == NULL || gobj->classifier != HSD_GOBJ_CLASS_FIGHTER) {
                continue;
            }
            const Fighter* fp = GET_FIGHTER(gobj);
            int bits[2] = {fp->is_sleeping, fp->x221C_b6};
            s32 stocks = Player_GetStocks(slot);
            XXH3_64bits_update(s_xxh, &fp->motion_id, sizeof fp->motion_id);
            XXH3_64bits_update(s_xxh, &fp->facing_dir, sizeof fp->facing_dir);
            XXH3_64bits_update(s_xxh, &fp->self_vel, sizeof fp->self_vel);
            XXH3_64bits_update(s_xxh, &fp->x8c_kb_vel, sizeof fp->x8c_kb_vel);
            XXH3_64bits_update(s_xxh, &fp->cur_pos, sizeof fp->cur_pos);
            XXH3_64bits_update(s_xxh, &fp->ground_or_air, sizeof fp->ground_or_air);
            XXH3_64bits_update(s_xxh, &fp->gr_vel, sizeof fp->gr_vel);
            XXH3_64bits_update(s_xxh, &fp->active_timer, 4 * sizeof fp->active_timer);
            XXH3_64bits_update(s_xxh, &fp->cur_anim_frame, sizeof fp->cur_anim_frame);
            XXH3_64bits_update(s_xxh, &fp->frame_speed_mul, sizeof fp->frame_speed_mul);
            XXH3_64bits_update(s_xxh, &fp->dmg.x1830_percent, sizeof fp->dmg.x1830_percent);
            XXH3_64bits_update(
                s_xxh, &fp->dmg.x195c_hitlag_frames, sizeof fp->dmg.x195c_hitlag_frames);
            XXH3_64bits_update(s_xxh, &fp->x1968_jumpsUsed, sizeof fp->x1968_jumpsUsed);
            XXH3_64bits_update(s_xxh, &fp->input, sizeof fp->input);
            XXH3_64bits_update(s_xxh, &fp->cmd_vars, sizeof fp->cmd_vars);
            XXH3_64bits_update(s_xxh, &fp->cmd_timer, sizeof fp->cmd_timer);
            XXH3_64bits_update(s_xxh, &fp->mv, sizeof fp->mv);
            XXH3_64bits_update(s_xxh, bits, sizeof bits);
            XXH3_64bits_update(s_xxh, &stocks, sizeof stocks);
        }
    }
    if (HSD_GObjPLinkHead != NULL) {
        for (HSD_GObj* g = HSD_GObjPLinkHead[SF_ITEM_PLINK]; g != NULL; g = g->next) {
            const Item* ip = HSD_GObjGetUserData(g);
            if (ip != NULL) {
                XXH3_64bits_update(s_xxh, ip, sizeof *ip);
            }
        }
    }
    XXH3_64bits_update(s_xxh, HSD_RandSeedPtr, sizeof(u32));
    return XXH3_64bits_digest(s_xxh);
}

/* The attacker's body after a tick, without the input buffer or the stick
 * timers. Those echo a direction even when a smash ignores it, so they
 * cannot say whether the input was legal. */
static uint64_t attacker_body(void) {
    if (s_xxh == NULL) {
        s_xxh = XXH3_createState();
        if (s_xxh == NULL) {
            return 0;
        }
    }
    XXH3_64bits_reset(s_xxh);
    const Fighter* fp = fighter_at(s_attacker, 0, NULL);
    int present = fp != NULL;
    XXH3_64bits_update(s_xxh, &present, sizeof present);
    if (fp == NULL) {
        return XXH3_64bits_digest(s_xxh);
    }
    int bits[2] = {fp->is_sleeping, fp->x221C_b6};
    XXH3_64bits_update(s_xxh, &fp->motion_id, sizeof fp->motion_id);
    XXH3_64bits_update(s_xxh, &fp->facing_dir, sizeof fp->facing_dir);
    XXH3_64bits_update(s_xxh, &fp->self_vel, sizeof fp->self_vel);
    XXH3_64bits_update(s_xxh, &fp->x8c_kb_vel, sizeof fp->x8c_kb_vel);
    XXH3_64bits_update(s_xxh, &fp->cur_pos, sizeof fp->cur_pos);
    XXH3_64bits_update(s_xxh, &fp->ground_or_air, sizeof fp->ground_or_air);
    XXH3_64bits_update(s_xxh, &fp->gr_vel, sizeof fp->gr_vel);
    XXH3_64bits_update(s_xxh, &fp->cur_anim_frame, sizeof fp->cur_anim_frame);
    XXH3_64bits_update(s_xxh, &fp->frame_speed_mul, sizeof fp->frame_speed_mul);
    XXH3_64bits_update(s_xxh, &fp->dmg.x1830_percent, sizeof fp->dmg.x1830_percent);
    XXH3_64bits_update(s_xxh, &fp->dmg.x195c_hitlag_frames, sizeof fp->dmg.x195c_hitlag_frames);
    XXH3_64bits_update(s_xxh, &fp->x1968_jumpsUsed, sizeof fp->x1968_jumpsUsed);
    XXH3_64bits_update(s_xxh, &fp->cmd_vars, sizeof fp->cmd_vars);
    XXH3_64bits_update(s_xxh, &fp->cmd_timer, sizeof fp->cmd_timer);
    XXH3_64bits_update(s_xxh, &fp->mv, sizeof fp->mv);
    XXH3_64bits_update(s_xxh, bits, sizeof bits);
    return XXH3_64bits_digest(s_xxh);
}

/* First trial per fingerprint at one depth; false when already seen. */
static bool fp_insert(uint64_t fp) {
    if (fp == 0) {
        fp = 1; /* 0 marks an empty slot */
    }
    for (uint32_t i = (uint32_t)fp & (SF_FP_SLOTS - 1);; i = (i + 1) & (SF_FP_SLOTS - 1)) {
        if (s_fp[i] == fp) {
            return false;
        }
        if (s_fp[i] == 0) {
            s_fp[i] = fp;
            return true;
        }
    }
}

/* ---- candidates ------------------------------------------------------- */

static bool line_better(const SfLine* a, const SfLine* b) {
    if (a->ko != b->ko) {
        return a->ko;
    }
    if (a->dmg != b->dmg) {
        return a->dmg > b->dmg;
    }
    return a->len < b->len;
}

static bool line_same(const SfLine* a, const SfLine* b) {
    return a->len == b->len && memcmp(a->seq, b->seq, (size_t)a->len) == 0;
}

/* fp+208C is the move id of the hit that just landed. A multi-hit move
 * keeps that id, so it is named once. */
static void note_connect(SfLine* l) {
    const Fighter* a = fighter_at(s_attacker, 0, NULL);
    const char* name;
    const char* prev;
    int id;
    if (a == NULL) {
        return;
    }
    id = a->x208C;
    name = move_name(id);
    if (name == NULL) {
        if (id <= FtMoveId_Default) {
            return;
        }
        name = "hit";
    }
    if (l->nhits > 0) {
        prev = move_name(l->hits[l->nhits - 1]);
        if (prev == NULL) {
            prev = "hit";
        }
        if (strcmp(prev, name) == 0) {
            return;
        }
    }
    if (l->nhits >= SF_HITS) {
        return;
    }
    l->hits[l->nhits++] = (uint8_t)id;
}

/* Every trial that raised the damage or took the stock ends a line worth
 * listing; it ends there, not at the horizon. */
static void hof_add(const SfLine* parent, int combo, const SfResult* r) {
    SfLine l = *parent;
    l.seq[l.len++] = (uint8_t)combo;
    l.dmg = r->dmg;
    l.ko = r->ko;
    note_connect(&l);
    for (int i = 0; i < s_hof_n; i++) {
        if (line_same(&s_hof[i], &l)) {
            return;
        }
    }
    /* One row per move list. A second back air replaces the first if it
     * deals more, instead of using up every row and hiding up smash. */
    char text[PC_SF_LINE_TEXT];
    format_line(text, sizeof text, &l);
    for (int i = 0; i < s_hof_n; i++) {
        char other[PC_SF_LINE_TEXT];
        format_line(other, sizeof other, &s_hof[i]);
        if (strcmp(other, text) != 0) {
            continue;
        }
        if (line_better(&l, &s_hof[i])) {
            s_hof[i] = l;
        }
        return;
    }
    if (s_hof_n < SF_HOF) {
        s_hof[s_hof_n++] = l;
        return;
    }
    int worst = 0;
    for (int i = 1; i < s_hof_n; i++) {
        if (line_better(&s_hof[worst], &s_hof[i])) {
            worst = i;
        }
    }
    if (line_better(&l, &s_hof[worst])) {
        s_hof[worst] = l;
    }
}

static int hof_cmp(const void* a, const void* b) {
    const SfLine* x = a;
    const SfLine* y = b;
    return line_better(x, y) ? -1 : line_better(y, x) ? 1 : 0;
}

static const SfLine* parent_line(int p) {
    return &s_bank[s_cur_bank][p].line;
}

static int dist_cmp(const void* a, const void* b) {
    float xa = s_trials[*(const int*)a].dist;
    float xb = s_trials[*(const int*)b].dist;
    return (xa > xb) - (xa < xb);
}

static bool air_motion(int motion) {
    return motion == ftCo_MS_KneeBend || motion == ftCo_MS_JumpF || motion == ftCo_MS_JumpB ||
           motion == ftCo_MS_JumpAerialF || motion == ftCo_MS_JumpAerialB ||
           motion == ftCo_MS_Fall || motion == ftCo_MS_FallF || motion == ftCo_MS_FallB ||
           motion == ftCo_MS_FallAerial || motion == ftCo_MS_FallAerialF ||
           motion == ftCo_MS_FallAerialB;
}

static bool attack_air(int motion) {
    return motion >= ftCo_MS_AttackAirN && motion <= ftCo_MS_AttackAirLw;
}

/* 0 neutral, 1 forward, 2 back, 3 up, 4 down. -1 is not an aerial. */
static int aerial_kind(int motion) {
    if (!attack_air(motion)) {
        return -1;
    }
    return motion - ftCo_MS_AttackAirN;
}

static bool aerial_press(int combo) {
    return combo >= 0 && combo < SF_DIRECTIONS * SF_BTN && (combo % SF_BTN) == SF_IN_A;
}

/* Angled smashes and tilts are one move. Everything else, including each
 * aerial and each throw, keeps its own slot. */
static int attack_family(int motion) {
    if (motion >= ftCo_MS_AttackS3Hi && motion <= ftCo_MS_AttackS3Lw) {
        return ftCo_MS_AttackS3S;
    }
    if (motion >= ftCo_MS_AttackS4Hi && motion <= ftCo_MS_AttackS4Lw) {
        return ftCo_MS_AttackS4S;
    }
    if (motion >= ftCo_MS_Catch && motion <= ftCo_MS_CatchAttack) {
        return ftCo_MS_Catch;
    }
    return motion;
}

static bool jump_input(int combo) {
    return combo >= 0 && combo < SF_DIRECTIONS * SF_BTN && (combo % SF_BTN) == SF_IN_JUMP;
}

static bool jump_motion(int motion) {
    return motion == ftCo_MS_KneeBend || motion == ftCo_MS_JumpF || motion == ftCo_MS_JumpB ||
           motion == ftCo_MS_JumpAerialF || motion == ftCo_MS_JumpAerialB;
}

static bool fall_motion(int motion) {
    return motion == ftCo_MS_Fall || motion == ftCo_MS_FallF || motion == ftCo_MS_FallB ||
           motion == ftCo_MS_FallAerial || motion == ftCo_MS_FallAerialF ||
           motion == ftCo_MS_FallAerialB;
}

/* Rising, or still falling from a jump. The button is already up by then. */
static bool jump_air(int motion) {
    return jump_motion(motion) || fall_motion(motion);
}

/* A hop that started on an earlier frame. The button is already up. */
static bool ongoing_hop(const SfTrial* t) {
    return t->commit > 0 && (int)t->commit < SF_COMMIT && jump_air(t->motion) && !t->attack;
}

/* Neutral, fast fall, or drift toward the opponent. A fair needs the drift.
 * side is attacker x minus victim x, so a positive side means he is to the left. */
static bool hop_hold(const SfTrial* t) {
    if (t->combo == SF_IN_NONE || t->combo == SF_IN_DOWN) {
        return true;
    }
    if (t->side > 1.0f && t->combo == SF_IN_LEFT) {
        return true;
    }
    if (t->side < -1.0f && t->combo == SF_IN_RIGHT) {
        return true;
    }
    return false;
}

static bool trial_outranks(int a, int b) {
    if (s_trials[a].dmg != s_trials[b].dmg) {
        return s_trials[a].dmg > s_trials[b].dmg;
    }
    return s_trials[a].dist < s_trials[b].dist;
}

static float dist_between(int a, int b) {
    float d = s_trials[a].dist - s_trials[b].dist;
    return d < 0.0f ? -d : d;
}

/* Up to four timings of one aerial, each from a different line. One closer
 * fair that misses must not be the only fair that gets to play out. */
enum { SF_AIR_KEEP = 4 };

static void keep_aerial_slot(int* slots, int* n, int trial) {
    int parent = s_trials[trial].parent;
    for (int k = 0; k < *n; k++) {
        if (s_trials[slots[k]].parent == parent) {
            if (trial_outranks(trial, slots[k])) {
                slots[k] = trial;
            }
            return;
        }
    }
    if (*n < SF_AIR_KEEP) {
        slots[(*n)++] = trial;
        return;
    }
    /* A new timing replaces a duplicate of its own range. A timing that sits
     * apart from the ones already kept replaces the pair that are piled on
     * the same distance, so a close fair cannot evict a spaced one. */
    int nearest = 0;
    float near_d = dist_between(trial, slots[0]);
    for (int k = 1; k < *n; k++) {
        float d = dist_between(trial, slots[k]);
        if (d < near_d) {
            near_d = d;
            nearest = k;
        }
    }
    int left = 0;
    int right = 1;
    float pair = dist_between(slots[0], slots[1]);
    for (int i = 0; i < *n; i++) {
        for (int j = i + 1; j < *n; j++) {
            float d = dist_between(slots[i], slots[j]);
            if (d < pair) {
                pair = d;
                left = i;
                right = j;
            }
        }
    }
    if (near_d <= pair) {
        if (trial_outranks(trial, slots[nearest])) {
            slots[nearest] = trial;
        }
        return;
    }
    int drop = trial_outranks(slots[left], slots[right]) ? right : left;
    slots[drop] = trial;
}

static bool landing_air(int motion) {
    return motion >= ftCo_MS_LandingAirN && motion <= ftCo_MS_LandingAirLw;
}

/* There is no L-cancel bit. fp->x67F counts frames since L or R was pressed
 * (fighter.c) and saturates at 255. ftCo_LandingAir_EnterWithLag reads it
 * while entering LandingAir from an aerial whose cmd_vars[0] is still set,
 * and divides the lag by p_ftCommonData->xE8 when the count is below
 * p_ftCommonData->xE4. The timer is updated before collision, so the landing
 * frame still holds the value that was tested. An autocancel takes the
 * normal landing path and never reads the timer. */
static bool missed_lcancel(int prev_motion, const Fighter* fp) {
    if (fp == NULL || p_ftCommonData == NULL) {
        return false;
    }
    if (!attack_air(prev_motion) || !landing_air((int)fp->motion_id)) {
        return false;
    }
    return fp->x67F >= p_ftCommonData->xE4;
}

/* The next ply's parents. Aerials are kept before other attacks. Several
 * timings of each aerial stay, spread across distance, so a close fair does
 * not erase a spaced one. Movement slots are split the same way: near, mid,
 * and far each keep a share. An empty hop still keeps its drift and fast fall.
 * After a hit, or when the opponent was already in hitstun at the pause,
 * movement room is SF_COMBO_KEEP. Otherwise it is SF_MOVE_KEEP. */

/* `ids` is sorted near to far. Each third of that list gets an equal share
 * of the remaining movement slots. */
static void take_one(int t, uint8_t* picked, int* moves, int* air) {
    s_pick[s_npick++] = t;
    picked[t] = 1;
    (*moves)++;
    if (*air < 0 && air_motion(s_trials[t].motion)) {
        *air = t;
    }
}

static void take_spread(const int* ids, int n, uint8_t* picked, int* moves, int* air, int move_cap) {
    int bands = 3;
    if (n <= 0 || *moves >= move_cap || s_npick >= s_beam_w) {
        return;
    }
    int room = move_cap - *moves;
    int base = room / bands;
    int extra = room % bands;
    for (int band = 0; band < bands; band++) {
        int begin = band * n / bands;
        int end = (band + 1) * n / bands;
        int want = base + (band < extra ? 1 : 0);
        int got = 0;
        for (int i = begin; i < end && got < want && *moves < move_cap && s_npick < s_beam_w; i++) {
            int t = ids[i];
            if (picked[t]) {
                continue;
            }
            take_one(t, picked, moves, air);
            got++;
        }
    }
    while (*moves < move_cap && s_npick < s_beam_w) {
        int before = *moves;
        for (int band = 0; band < bands && *moves < move_cap && s_npick < s_beam_w; band++) {
            int begin = band * n / bands;
            int end = (band + 1) * n / bands;
            for (int i = begin; i < end; i++) {
                int t = ids[i];
                if (picked[t]) {
                    continue;
                }
                take_one(t, picked, moves, air);
                break;
            }
        }
        if (*moves == before) {
            break;
        }
    }
}
static void select_children(void) {
    static int order[SF_BEAM_MAX * SF_COMBOS];
    static uint8_t picked[SF_BEAM_MAX * SF_COMBOS];
    int norder = 0;
    bool combo = s_open_combo;
    for (int i = 0; i < s_ntrials; i++) {
        combo = combo || s_trials[i].dmg > 0;
        picked[i] = 0;
    }
    int move_cap = combo ? SF_COMBO_KEEP : SF_MOVE_KEEP;
    int attack_cap = s_beam_w - move_cap;
    if (attack_cap < 1) {
        attack_cap = 1;
    }
    s_npick = 0;
    /* One fresh press and one ongoing line for each grounded move. Each
     * aerial keeps four timings from different hops, so a closer fair that
     * misses does not erase the dair or the later fair. */
    enum { SF_FAM = 64 };
    int fam_id[SF_FAM];
    int fam_fresh[SF_FAM];
    int fam_cont[SF_FAM];
    int air_fresh[SF_FAM][SF_AIR_KEEP];
    int air_cont[SF_FAM][SF_AIR_KEEP];
    int air_fresh_n[SF_FAM];
    int air_cont_n[SF_FAM];
    uint8_t fam_aerial[SF_FAM];
    int nfam = 0;
    for (int i = 0; i < s_ntrials; i++) {
        if (!s_trials[i].attack) {
            continue;
        }
        int fam = attack_family(s_trials[i].motion);
        int s = 0;
        bool aerial = attack_air(s_trials[i].motion);
        for (; s < nfam; s++) {
            if (fam_id[s] == fam) {
                break;
            }
        }
        if (s == nfam) {
            if (nfam >= SF_FAM) {
                continue;
            }
            fam_id[nfam] = fam;
            fam_fresh[nfam] = fam_cont[nfam] = -1;
            air_fresh_n[nfam] = air_cont_n[nfam] = 0;
            fam_aerial[nfam] = aerial;
            nfam++;
        }
        bool fresh = aerial_press(s_trials[i].combo) ||
                     (s_trials[i].combo % SF_BTN) == SF_IN_A ||
                     (s_trials[i].combo % SF_BTN) == SF_IN_B ||
                     (s_trials[i].combo % SF_BTN) == SF_IN_GRAB;
        if (aerial) {
            keep_aerial_slot(fresh ? air_fresh[s] : air_cont[s],
                             fresh ? &air_fresh_n[s] : &air_cont_n[s], i);
            continue;
        }
        int* slot = fresh ? &fam_fresh[s] : &fam_cont[s];
        if (*slot < 0 || trial_outranks(i, *slot)) {
            *slot = i;
        }
    }
    for (int pass = 0; pass < 2 && s_npick < attack_cap; pass++) {
        for (int s = 0; s < nfam && s_npick < attack_cap; s++) {
            if ((pass == 0) != fam_aerial[s]) {
                continue;
            }
            if (fam_aerial[s]) {
                int slot[SF_AIR_KEEP * 2];
                int nslot = 0;
                for (int k = 0; k < air_fresh_n[s]; k++) {
                    slot[nslot++] = air_fresh[s][k];
                }
                for (int k = 0; k < air_cont_n[s]; k++) {
                    slot[nslot++] = air_cont[s][k];
                }
                for (int k = 0; k < nslot && s_npick < attack_cap; k++) {
                    int i = slot[k];
                    if (i < 0 || picked[i]) {
                        continue;
                    }
                    s_pick[s_npick++] = i;
                    picked[i] = 1;
                }
                continue;
            }
            int slot[2] = {fam_fresh[s], fam_cont[s]};
            for (int k = 0; k < 2 && s_npick < attack_cap; k++) {
                int i = slot[k];
                if (i < 0 || picked[i]) {
                    continue;
                }
                s_pick[s_npick++] = i;
                picked[i] = 1;
            }
        }
    }
    for (int pass = 0; pass < 2; pass++) {
        for (int i = 0; i < s_ntrials && s_npick < attack_cap; i++) {
            bool aerial = attack_air(s_trials[i].motion);
            if (!s_trials[i].attack || picked[i] || (pass == 0) != aerial) {
                continue;
            }
            s_pick[s_npick++] = i;
            picked[i] = 1;
        }
    }
    for (int i = 0; i < s_ntrials; i++) {
        if (!s_trials[i].attack) {
            order[norder++] = i;
        }
    }
    qsort(order, (size_t)norder, sizeof order[0], dist_cmp);
    int moves = 0;
    int air = -1;
    static int hops[SF_BEAM_MAX * SF_COMBOS];
    int nh = 0;
    for (int i = 0; i < norder; i++) {
        int t = order[i];
        if (ongoing_hop(&s_trials[t]) && hop_hold(&s_trials[t])) {
            hops[nh++] = t;
        }
    }
    int hop_cap = move_cap / 2;
    if (hop_cap < 6) {
        hop_cap = 6;
    }
    if (hop_cap > move_cap) {
        hop_cap = move_cap;
    }
    take_spread(hops, nh, picked, &moves, &air, hop_cap);
    take_spread(order, norder, picked, &moves, &air, move_cap);
    if (air >= 0 && !picked[air] && s_npick < s_beam_w) {
        s_pick[s_npick++] = air;
    }
    s_accept_k = 0;
}

/* ---- search ----------------------------------------------------------- */

static const Snapshot* parent_snap(int p) {
    return s_depth == 0 ? &s_root : &s_bank[s_cur_bank][p].snap;
}

static void view_progress(void) {
    int total = s_horizon * 10;
    int done = s_depth * 10;
    if (s_phase == PH_EXPAND && s_ncur > 0) {
        done += 9 * (s_job_parent * SF_COMBOS + s_job_combo) / (s_ncur * SF_COMBOS);
    }
    if (s_phase >= PH_VERIFY) {
        done = total;
    }
    s_view.depth = s_depth;
    s_view.progress = total > 0 ? 950 * done / total : 0;
    if (s_phase == PH_VERIFY && s_hof_n > 0) {
        int done_v = s_verify_i < s_hof_n ? s_verify_i : s_hof_n;
        s_view.progress = 950 + 50 * done_v / s_hof_n;
    }
    s_view.elapsed_time = (int)((SDL_GetTicksNS() - s_search_t0) / 1000000000ull);
}

static void search_begin(void) {
    s_depth = 0;
    s_ncur = 1;
    s_cur_bank = 0;
    s_bank[0][0].line = (SfLine){.len = 0};
    s_job_parent = s_job_combo = 0;
    s_ntrials = 0;
    s_hof_n = 0;
    s_verify_i = 0;
    memset(s_fp, 0, sizeof s_fp);
    s_view.nlines = 0;
    s_view.cursor = 0;
    s_view.have_best = false;
    s_view.note = NULL;
    s_view.horizon = s_horizon;
    s_view.endlag = s_endlag;
    s_n_trials = s_n_pruned = s_n_impure = s_n_io = s_n_eaten = s_n_verify_bad = s_n_locked =
        s_n_whiff = s_n_lcancel = s_n_gap = 0;
    s_open_parent = -1;
    Fighter* att = fighter_at(s_attacker, 0, NULL);
    if (att != NULL) {
        s_bank[0][0].line.motion = (int)att->motion_id;
        s_bank[0][0].line.iasa = att->allow_interrupt;
    }
    s_open_combo = victim_in_hitstun();
    s_search_t0 = SDL_GetTicksNS();
    s_resume_ok = false;
    s_searched = 0;
    s_trim = false;
    s_phase = PH_EXPAND;
    view_progress();
}

static void note_best(const SfResult* r) {
    if (!r->ko && r->dmg <= 0) {
        return;
    }
    if (!s_view.have_best || (r->ko && !s_view.best_ko) ||
        (r->ko == s_view.best_ko && r->dmg > s_view.best_dmg))
    {
        s_view.have_best = true;
        s_view.best_ko = r->ko;
        s_view.best_dmg = r->dmg;
    }
}

static bool hitboxes_live(const Fighter* fp) {
    if (fp == NULL) {
        return false;
    }
    for (int i = 0; i < 4; i++) {
        if (fp->x914[i].state != HitCapsule_Disabled) {
            return true;
        }
    }
    return false;
}

static bool attack_input(int combo) {
    uint16_t b = s_combo[combo].button;
    return (b & (PAD_BUTTON_A | PAD_BUTTON_B | PAD_TRIGGER_Z)) != 0;
}

/* Back to a state that is not the attack. A whiffed move ends here. */
static bool move_over(int motion) {
    return motion == ftCo_MS_Wait || motion == ftCo_MS_WalkSlow || motion == ftCo_MS_WalkMiddle ||
           motion == ftCo_MS_WalkFast || motion == ftCo_MS_Turn || motion == ftCo_MS_TurnRun ||
           motion == ftCo_MS_Dash || motion == ftCo_MS_Run || motion == ftCo_MS_RunDirect ||
           motion == ftCo_MS_RunBrake || motion == ftCo_MS_Squat || motion == ftCo_MS_SquatWait ||
           motion == ftCo_MS_SquatRv || motion == ftCo_MS_Landing ||
           motion == ftCo_MS_LandingFallSpecial || motion == ftCo_MS_Guard ||
           motion == ftCo_MS_GuardOn || motion == ftCo_MS_GuardOff || air_motion(motion);
}

/* CONT_ATTACK: the move is still going, so the beam must keep this.
 * CONT_DROP: the motion ended and it never hit. */
enum { CONT_KEEP, CONT_ATTACK, CONT_DROP };

static int continuation(const SfLine* par, int combo, const SfResult* r, int motion, bool live,
                        bool* seen) {
    bool same = motion == par->motion;
    *seen = same ? (par->hit_seen || live) : live;
    if (attack_input(combo) && !same) {
        *seen = live;
        return CONT_ATTACK;
    }
    if (par->attack && same) {
        /* Hitboxes ending is not the end of the move. IASA can be later. */
        *seen = par->hit_seen || live;
        return CONT_ATTACK;
    }
    if (r->ko || r->dmg > par->dmg || par->connected || !par->attack) {
        return CONT_KEEP;
    }
    if (live || (!par->hit_seen && !move_over(motion))) {
        *seen = live;
        return CONT_ATTACK;
    }
    return CONT_DROP;
}

static void keep_trial(int parent, int combo, const SfResult* r, uint64_t fp) {
    const SfLine* par = parent_line(parent);
    if (r->dead) {
        return;
    }
    const Fighter* att = fighter_at(s_attacker, 0, NULL);
    if (missed_lcancel(par->motion, att)) {
        s_n_lcancel++;
        return;
    }
    if (r->ko || r->dmg > par->dmg) {
        hof_add(par, combo, r);
        note_best(r);
    }
    if (r->ko || s_outcome || par->len + 1 >= s_horizon) {
        return;
    }
    /* The count stays at 0 through hitlag and hitstun, and restarts when
     * another hit puts the victim back there. */
    int gap = 0;
    if ((par->dmg > 0 || r->dmg > 0) && !victim_in_hitstun()) {
        gap = par->gap + 1;
    }
    if (gap > s_endlag) {
        s_n_gap++;
        return;
    }
    int motion = att != NULL ? (int)att->motion_id : r->motion;
    bool seen = false;
    int cont = continuation(par, combo, r, motion, hitboxes_live(att), &seen);
    if (cont == CONT_DROP) {
        s_n_whiff++;
        return;
    }
    if (!fp_insert(fp)) {
        s_n_pruned++;
        return;
    }
    bool same = motion == par->motion;
    bool dealt = r->dmg > par->dmg || r->ko;
    uint8_t commit = 0;
    if (par->commit > 0 && jump_air(motion)) {
        commit = (uint8_t)(par->commit - 1);
    } else if (jump_input(combo) && jump_motion(motion)) {
        commit = SF_COMMIT;
    }
    s_trials[s_ntrials++] = (SfTrial){
        .parent = (uint16_t)parent,
        .combo = (uint8_t)combo,
        .hitlag = r->hitlag,
        .ko = r->ko,
        .dmg = r->dmg,
        .dist = r->dist,
        .side = r->side,
        .rise = r->rise,
        .front = r->front,
        .motion = motion,
        .hit_seen = seen,
        .attack = cont == CONT_ATTACK,
        .iasa = att != NULL && att->allow_interrupt,
        .connected = same && par->attack ? (par->connected || dealt) : dealt,
        .gap = (uint8_t)gap,
        .commit = commit,
        .fp = fp,
    };
}

/* One tick of `combo` from this parent. The body hash is the attacker's
 * reaction, not the whole position. False when the tick asked for a disc
 * read; that branch cannot be compared. */
static bool probe_tick(int parent, int combo, SfResult* r, uint64_t* body) {
    PADStatus pads[4];
    restore_keep_pads(parent_snap(parent));
    build_pads(pads, combo);
    run_tick(pads, false);
    s_n_trials++;
    if (s_io || io_busy()) {
        io_drain();
        s_n_io++;
        return false;
    }
    *r = read_result();
    *body = attacker_body();
    return true;
}

/* True when `combo` leaves the attacker somewhere no-input would not. */
static bool is_actionable(int parent, int combo, uint64_t neutral_body) {
    SfResult r;
    uint64_t body;
    if (!probe_tick(parent, combo, &r, &body) || r.dead) {
        return true;
    }
    return body != neutral_body;
}

static SfAllow allow_bit(int combo) {
    SfAllow m = {0, 0};
    if ((unsigned)combo < 64u) {
        m.lo = 1ull << combo;
    } else {
        m.hi = 1ull << (combo - 64);
    }
    return m;
}

static SfAllow allow_or(SfAllow a, SfAllow b) {
    a.lo |= b.lo;
    a.hi |= b.hi;
    return a;
}

static SfAllow allow_bits(const int* ids, size_t n) {
    SfAllow m = {0, 0};
    for (size_t i = 0; i < n; i++) {
        m = allow_or(m, allow_bit(ids[i]));
    }
    return m;
}

static bool allow_empty(SfAllow m) {
    return m.lo == 0 && m.hi == 0;
}

static bool allow_has(SfAllow m, int combo) {
    SfAllow b = allow_bit(combo);
    return (m.lo & b.lo) != 0 || (m.hi & b.hi) != 0;
}

static bool grabbing(int motion) {
    return motion == ftCo_MS_Catch || motion == ftCo_MS_CatchPull || motion == ftCo_MS_CatchDash ||
           motion == ftCo_MS_CatchDashPull || motion == ftCo_MS_CatchWait ||
           motion == ftCo_MS_CatchAttack;
}

static bool in_air(int motion) {
    return (jump_motion(motion) && motion != ftCo_MS_KneeBend) || fall_motion(motion);
}

/* The actions worth trying from this state. None is added by the caller.
 * Ground: tilts, smashes, dashes, a hop, grab, specials.
 * Air: aerials, drift, a double jump, an airdodge at the ground.
 * Grab: the four throws, and A to pummel.
 * Attack: A or B with a direction, and jump. */
static SfAllow state_actions(int motion, bool attack) {
    static const int ground[] = {
        SF_IN_LEFT, SF_IN_RIGHT,
        SF_IN_HALF_LEFT + SF_IN_A, SF_IN_HALF_RIGHT + SF_IN_A,
        SF_IN_HALF_UP + SF_IN_A, SF_IN_HALF_DOWN + SF_IN_A,
        SF_IN_LEFT + SF_IN_A, SF_IN_RIGHT + SF_IN_A, SF_IN_UP + SF_IN_A, SF_IN_DOWN + SF_IN_A,
        SF_IN_JUMP, SF_IN_GRAB,
        SF_IN_B, SF_IN_LEFT + SF_IN_B, SF_IN_RIGHT + SF_IN_B, SF_IN_UP + SF_IN_B,
        SF_IN_DOWN + SF_IN_B,
    };
    static const int air[] = {
        SF_IN_LEFT, SF_IN_RIGHT, SF_IN_UP, SF_IN_DOWN,
        SF_IN_A, SF_IN_LEFT + SF_IN_A, SF_IN_RIGHT + SF_IN_A, SF_IN_UP + SF_IN_A,
        SF_IN_DOWN + SF_IN_A,
        SF_IN_JUMP,
        SF_IN_DOWN + SF_IN_SHIELD, SF_IN_WD_L, SF_IN_WD_R,
    };
    static const int throws[] = {
        SF_IN_LEFT, SF_IN_RIGHT, SF_IN_UP, SF_IN_DOWN, SF_IN_A,
    };
    static const int cancel[] = {
        SF_IN_A, SF_IN_B, SF_IN_JUMP,
        SF_IN_LEFT + SF_IN_A, SF_IN_RIGHT + SF_IN_A, SF_IN_UP + SF_IN_A, SF_IN_DOWN + SF_IN_A,
        SF_IN_HALF_LEFT + SF_IN_A, SF_IN_HALF_RIGHT + SF_IN_A,
        SF_IN_HALF_UP + SF_IN_A, SF_IN_HALF_DOWN + SF_IN_A,
        SF_IN_LEFT + SF_IN_B, SF_IN_RIGHT + SF_IN_B, SF_IN_UP + SF_IN_B, SF_IN_DOWN + SF_IN_B,
    };
    if (grabbing(motion)) {
        return allow_bits(throws, sizeof throws / sizeof throws[0]);
    }
    if (attack) {
        return allow_bits(cancel, sizeof cancel / sizeof cancel[0]);
    }
    if (in_air(motion)) {
        return allow_bits(air, sizeof air / sizeof air[0]);
    }
    return allow_bits(ground, sizeof ground / sizeof ground[0]);
}

/* Bits of `want` that leave the attacker somewhere no-input would not. */
static SfAllow actionable(int parent, SfAllow want, uint64_t neutral_body) {
    SfAllow m = {0, 0};
    for (int c = 0; c < SF_COMBOS; c++) {
        if (!allow_has(want, c)) {
            continue;
        }
        if (is_actionable(parent, c, neutral_body)) {
            m = allow_or(m, allow_bit(c));
        }
    }
    return m;
}

static void expand_one(void) {
    if (s_job_parent >= s_ncur) {
        select_children();
        s_phase = PH_ACCEPT;
        return;
    }
    if (s_job_combo >= SF_COMBOS) {
        s_job_parent++;
        s_job_combo = 0;
        s_open_parent = -1;
        return;
    }
    if (s_open_parent != s_job_parent) {
        const SfLine* par = parent_line(s_job_parent);
        if (par->motion == ftCo_MS_KneeBend || par->motion == ftCo_MS_Guard ||
            par->motion == ftCo_MS_GuardOn)
        {
            /* Jumpsquat. Releasing jump is a short hop. Holding it through
             * the squat is a full hop. Up plus A is an up smash, which the
             * squat accepts before the jump leaves the ground. Left and
             * right are the jump's horizontal speed. Shield: jump is the
             * only input that matters. */
            SfAllow m = {0, 0};
            if (par->motion == ftCo_MS_KneeBend) {
                static const int squat[] = {
                    SF_IN_NONE, SF_IN_JUMP, SF_IN_A, SF_IN_B, SF_IN_GRAB,
                    SF_IN_UP + SF_IN_A, SF_IN_UP + SF_IN_JUMP, SF_IN_HALF_UP + SF_IN_JUMP,
                    SF_IN_LEFT, SF_IN_LEFT + SF_IN_JUMP, SF_IN_LEFT + SF_IN_A,
                    SF_IN_LEFT + SF_IN_B, SF_IN_LEFT + SF_IN_GRAB,
                    SF_IN_RIGHT, SF_IN_RIGHT + SF_IN_JUMP, SF_IN_RIGHT + SF_IN_A,
                    SF_IN_RIGHT + SF_IN_B, SF_IN_RIGHT + SF_IN_GRAB,
                    SF_IN_HALF_LEFT, SF_IN_HALF_LEFT + SF_IN_JUMP, SF_IN_HALF_LEFT + SF_IN_A,
                    SF_IN_HALF_LEFT + SF_IN_B, SF_IN_HALF_LEFT + SF_IN_GRAB,
                    SF_IN_HALF_RIGHT, SF_IN_HALF_RIGHT + SF_IN_JUMP, SF_IN_HALF_RIGHT + SF_IN_A,
                    SF_IN_HALF_RIGHT + SF_IN_B, SF_IN_HALF_RIGHT + SF_IN_GRAB,
                };
                m = allow_bits(squat, sizeof squat / sizeof squat[0]);
            } else {
                m = allow_bit(SF_IN_JUMP);
            }
            s_allow = m;
            s_open_parent = s_job_parent;
            return;
        }
        if (par->motion == ftCo_MS_AttackAirN || par->motion == ftCo_MS_AttackAirF ||
            par->motion == ftCo_MS_AttackAirB || par->motion == ftCo_MS_AttackAirHi ||
            par->motion == ftCo_MS_AttackAirLw)
        {
            /* Drift and L-cancel. Each input alone: no diagonals, and shield
             * is not combined with a direction. Neutral keeps the aerial.
             * Half sticks are the slower drift. */
            static const int drift[] = {
                SF_IN_NONE, SF_IN_LEFT, SF_IN_RIGHT, SF_IN_UP, SF_IN_DOWN, SF_IN_SHIELD,
                SF_IN_HALF_LEFT, SF_IN_HALF_RIGHT, SF_IN_HALF_UP, SF_IN_HALF_DOWN,
            };
            s_allow = allow_bits(drift, sizeof drift / sizeof drift[0]);
            s_open_parent = s_job_parent;
            return;
        }
        SfResult neutral;
        uint64_t body;
        if (!probe_tick(s_job_parent, SF_IN_NONE, &neutral, &body)) {
            s_job_combo = SF_COMBOS;
            return;
        }
        uint64_t fp = fingerprint();
        bool outcome = s_outcome;
        keep_trial(s_job_parent, SF_IN_NONE, &neutral, fp);
        /* Startup, before the hit and before the interrupt window, cannot
         * be cancelled. A grab still throws; the attack check is for moves. */
        bool cancellable = !par->attack || grabbing(par->motion) || par->dmg > 0 || par->iasa;
        if (!cancellable) {
            s_n_locked++;
            s_outcome = outcome;
            s_job_combo = SF_COMBOS;
            return;
        }
        SfAllow m = actionable(s_job_parent, state_actions(par->motion, par->attack), body);
        s_outcome = outcome;
        if (allow_empty(m)) {
            s_n_locked++;
            s_job_combo = SF_COMBOS;
            return;
        }
        s_allow = m;
        s_open_parent = s_job_parent;
        return;
    }
    while (s_job_combo < SF_COMBOS && !allow_has(s_allow, s_job_combo)) {
        s_job_combo++;
    }
    if (s_job_combo >= SF_COMBOS) {
        s_job_parent++;
        s_job_combo = 0;
        s_open_parent = -1;
        return;
    }
    int combo = s_job_combo++;
    PADStatus pads[4];
    restore_keep_pads(parent_snap(s_job_parent));
    build_pads(pads, combo);
    run_tick(pads, false);
    s_n_trials++;
    if (s_io || io_busy()) {
        io_drain();
        s_n_io++;
        return;
    }
    SfResult r = read_result();
    keep_trial(s_job_parent, combo, &r, fingerprint());
}

/* Give each chosen child a snapshot of its own: re-run its one tick from
 * the parent and keep the state. A different fingerprint the second time
 * means the tick is not a pure function of (state, input). */
static void accept_one(void) {
    int nb = s_cur_bank ^ 1;
    if (s_accept_k >= s_npick) {
        int parent_bank = s_cur_bank;
        int parent_n = s_ncur;
        int parent_depth = s_depth;
        int kept = 0;
        for (int k = 0; k < s_npick; k++) {
            if (s_bank[nb][k].line.len > 0) {
                if (kept != k) {
                    Snapshot tmp = s_bank[nb][kept].snap;
                    s_bank[nb][kept].snap = s_bank[nb][k].snap;
                    s_bank[nb][k].snap = tmp;
                    s_bank[nb][kept].line = s_bank[nb][k].line;
                }
                kept++;
            }
        }
        s_cur_bank = nb;
        s_ncur = kept;
        s_depth++;
        if (s_depth == 1) {
            pc_log_line("sf: ply 1 kept %d states", s_ncur);
        }
        s_job_parent = s_job_combo = 0;
        s_open_parent = -1;
        s_ntrials = 0;
        memset(s_fp, 0, sizeof s_fp);
        /* Parents one frame short of the horizon add no children, so the
         * beam empties exactly when the horizon is reached. Those parents
         * stay in the other bank so a longer horizon can continue. */
        if (s_ncur == 0) {
            s_resume_ok = parent_n > 0;
            s_resume_bank = parent_bank;
            s_resume_n = parent_n;
            s_resume_depth = parent_depth;
            s_searched = s_horizon;
            qsort(s_hof, (size_t)s_hof_n, sizeof s_hof[0], hof_cmp);
            s_verify_i = 0;
            s_phase = PH_VERIFY;
        } else {
            s_phase = PH_EXPAND;
        }
        return;
    }
    int k = s_accept_k++;
    const SfTrial* t = &s_trials[s_pick[k]];
    SfBeam* child = &s_bank[nb][k];
    child->line.len = 0;
    PADStatus pads[4];
    restore_keep_pads(parent_snap(t->parent));
    build_pads(pads, t->combo);
    run_tick(pads, false);
    if (s_io || io_busy()) {
        io_drain();
        s_n_io++;
        return;
    }
    if (fingerprint() != t->fp && s_n_impure++ == 0) {
        pc_log_line("sf: a re-run tick reached another state at depth %d (impure tick)", s_depth);
    }
    if (!snapshot_take(&child->snap, s_depth + 1)) {
        return;
    }
    child->line = *parent_line(t->parent);
    child->line.seq[child->line.len++] = t->combo;
    child->line.dmg = t->dmg;
    child->line.ko = false;
    child->line.motion = t->motion;
    child->line.hit_seen = t->hit_seen;
    child->line.attack = t->attack;
    child->line.iasa = t->iasa;
    child->line.connected = t->connected;
    child->line.gap = t->gap;
    child->line.commit = t->commit;
    if (t->dmg > parent_line(t->parent)->dmg) {
        note_connect(&child->line);
    }
}

/* KO outranks damage. A star KO is learned during verification, after the
 * list was ordered, so the published rows are ordered again. */
static void sort_listed(void) {
    for (int i = 1; i < s_view.nlines; i++) {
        int j = i;
        while (j > 0 && line_better(&s_lines[j], &s_lines[j - 1])) {
            SfLine line = s_lines[j];
            char text[PC_SF_LINE_TEXT];
            int dmg = s_view.lines[j].dmg;
            bool ko = s_view.lines[j].ko;
            memcpy(text, s_view.lines[j].text, sizeof text);
            s_lines[j] = s_lines[j - 1];
            s_lines[j - 1] = line;
            memcpy(s_view.lines[j].text, s_view.lines[j - 1].text, PC_SF_LINE_TEXT);
            s_view.lines[j].dmg = s_view.lines[j - 1].dmg;
            s_view.lines[j].ko = s_view.lines[j - 1].ko;
            memcpy(s_view.lines[j - 1].text, text, PC_SF_LINE_TEXT);
            s_view.lines[j - 1].dmg = dmg;
            s_view.lines[j - 1].ko = ko;
            j--;
        }
    }
}

static void list_line(const SfLine* l) {
    char text[PC_SF_LINE_TEXT];
    format_line(text, sizeof text, l);
    if (s_view.nlines >= PC_SF_LINES) {
        return;
    }
    for (int i = 0; i < s_view.nlines; i++) {
        if (strcmp(s_view.lines[i].text, text) == 0) {
            return;
        }
    }
    int n = s_view.nlines++;
    snprintf(s_view.lines[n].text, sizeof s_view.lines[n].text, "%s", text);
    s_view.lines[n].dmg = l->dmg;
    s_view.lines[n].ko = l->ko;
    s_lines[n] = *l;
}

/* Replay one candidate straight through from the root; what that replay
 * produced replaces the search's number. Every replay that dealt damage
 * or took the stock is listed. */
static void verify_one(void) {
    if (s_verify_i >= s_hof_n) {
        sort_listed();
        s_trim = false;
        s_phase = PH_DONE;
        return;
    }
    int h = s_verify_i++;
    SfLine* l = &s_hof[h];
    PADStatus pads[4];
    SfResult r = {0};
    SfResult at_script = {0};
    bool dropped = false;
    bool saw_script = false;
    int n = l->len < s_horizon ? l->len : s_horizon;
    /* Playback holds no input for SF_PLAY_TAIL frames after the combo.
     * A star KO starts in that stretch. */
    int limit = n + SF_PLAY_TAIL;
    SfLine shown = *l;
    shown.len = 0;
    shown.nhits = 0;
    shown.dmg = 0;
    shown.ko = false;
    restore_keep_pads(&s_root);
    int dealt = 0;
    bool ko = false;
    for (int i = 0; i < limit && !dropped; i++) {
        int combo = i < n ? l->seq[i] : SF_IN_NONE;
        build_pads(pads, combo);
        run_tick(pads, false);
        dropped = s_io || io_busy();
        if (dropped) {
            break;
        }
        r = read_result();
        if (i < n) {
            shown.seq[shown.len++] = (uint8_t)combo;
            at_script = r;
            saw_script = true;
            if (r.dmg > dealt || r.ko) {
                shown.dmg = r.dmg;
                shown.ko = r.ko;
                note_connect(&shown);
            }
        }
        if (!r.ko && r.dmg > dealt) {
            dealt = r.dmg;
        }
        if (r.ko) {
            ko = true;
        }
        if (ko || r.dead || s_outcome || (i + 1 >= n && victim_settled())) {
            break;
        }
    }
    if (dropped) {
        io_drain();
        s_n_io++;
        return;
    }
    if (!s_trim && saw_script && (at_script.dmg != l->dmg || at_script.ko != l->ko)) {
        s_n_verify_bad++;
        pc_log_line("sf: verify of a %d frame line gave %s %d, the search had %s %d", l->len,
            at_script.ko ? "KO" : "plus", at_script.dmg, l->ko ? "KO" : "plus", l->dmg);
    }
    if (ko) {
        SfResult best = r;
        best.ko = true;
        best.dmg = dealt;
        note_best(&best);
    }
    if (!s_trim) {
        l->dmg = dealt;
        l->ko = ko;
        if (!r.dead && (l->ko || l->dmg > 0)) {
            list_line(l);
        }
    } else if (!r.dead && (ko || dealt > 0)) {
        shown.dmg = dealt;
        shown.ko = ko;
        list_line(&shown);
    }
}

static void search_step(void) {
    switch (s_phase) {
    case PH_EXPAND:
        expand_one();
        break;
    case PH_ACCEPT:
        accept_one();
        break;
    case PH_VERIFY:
        verify_one();
        break;
    default:
        break;
    }
}

/* ---- leaving and entering states -------------------------------------- */

static void snap_free(Snapshot* s) {
    free(s->buf);
    memset(s, 0, sizeof *s);
    s->frame = -1;
}

static void free_all(void) {
    snap_free(&s_root);
    for (int b = 0; b < 2; b++) {
        for (int i = 0; i < SF_BEAM_MAX; i++) {
            snap_free(&s_bank[b][i].snap);
        }
    }
}

/* Drop the advisor without touching the match: the scene it was for is
 * gone, or the root cannot be restored any more. */
static void reset(const char* why) {
    if (why != NULL) {
        pc_log_line("sf: advisor off (%s)", why);
    }
    if (s_state == PC_SF_SEARCH) {
        HSD_PadLibData.qtype = s_saved_qtype;
    }
    s_state = PC_SF_IDLE;
    s_view.state = s_state;
    s_in_tick = false;
    free_all();
}

/* Back on the root, paused, with the menu up. */
static void to_menu(const char* note) {
    if (s_state == PC_SF_SEARCH) {
        HSD_PadLibData.qtype = s_saved_qtype;
    }
    restore_keep_pads(&s_root);
    Stockfish_Repause(s_pause_bit);
    lbAudioAx_80024E84(true);
    s_state = PC_SF_MENU;
    s_view.state = s_state;
    s_view.note = note;
    if (s_view.cursor >= s_view.nlines) {
        s_view.cursor = 0;
    }
    Stockfish_Redraw();
}

static void pick_pair(void) {
    s_attacker = -1;
    s_victim = -1;
    s_victim_sub = 0;
    s_port = 0;
    Fighter* a = NULL;
    HSD_GObj* ag = NULL;
    for (int slot = 0; slot < GM_MAX_PLAYERS && s_attacker < 0; slot++) {
        if (Player_GetPlayerSlotType(slot) != Gm_PKind_Human) {
            continue;
        }
        a = fighter_at(slot, 0, &ag);
        if (a != NULL) {
            s_attacker = slot;
            s_port = Player_GetPadPort(slot);
            if (s_port < 0 || s_port > 3) {
                s_port = 0;
            }
        }
    }
    if (a == NULL) {
        return;
    }
    float best = 0.0F;
    for (int slot = 0; slot < GM_MAX_PLAYERS; slot++) {
        for (int sub = 0; sub < 2; sub++) {
            HSD_GObj* g;
            Fighter* o = fighter_at(slot, sub, &g);
            if (o == NULL || g == ag) {
                continue;
            }
            float dx = o->cur_pos.x - a->cur_pos.x;
            float dy = o->cur_pos.y - a->cur_pos.y;
            float d = dx * dx + dy * dy;
            if (s_victim < 0 || d < best) {
                best = d;
                s_victim = slot;
                s_victim_sub = sub;
            }
        }
    }
}

/* Between two ticks, right after the pause tick: unpause, so no trial has
 * pause bookkeeping, and snapshot that. Returns false while a disc read
 * keeps the snapshot from being taken. */
static bool root_begin(void) {
    Stockfish_PrepareRoot(s_pause_bit);
    if (!snapshot_take(&s_root, 0)) {
        Stockfish_Repause(s_pause_bit);
        if (snapshot_refused_io() && ++s_root_tries < SF_ROOT_TRIES) {
            return false;
        }
        reset("no root snapshot");
        s_state = PC_SF_IDLE;
        return false;
    }
    HSD_GObj* vg;
    Fighter* v = fighter_at(s_victim, s_victim_sub, &vg);
    Fighter* a = fighter_at(s_attacker, 0, NULL);
    s_victim_gobj = vg;
    s_base_pct = v != NULL ? (int)v->dmg.x1830_percent : 0;
    if (a != NULL && v != NULL) {
        pc_log_line("sf: root at match frame %u: slot %d at %.1f,%.1f vs slot %d at %.1f,%.1f "
                    "(%d percent), horizon %d, beam %d",
            gm_GetFrameCount(), s_attacker, a->cur_pos.x, a->cur_pos.y, s_victim, v->cur_pos.x,
            v->cur_pos.y, s_base_pct, s_horizon, s_beam_w);
    }
    s_base_stocks = Player_GetStocks(s_victim);
    s_base_att_stocks = Player_GetStocks(s_attacker);
    s_saved_qtype = HSD_PadLibData.qtype;
    /* A full queue with qtype 0 shifts qread under the slot feed() wrote
     * (docs/netcode-plan.md section 13, defect A); 2 drops the new sample. */
    HSD_PadLibData.qtype = 2;
    real_last_from_master();
    search_begin();
    return true;
}

/* ---- per tick slot ---------------------------------------------------- */

/* Keep the beam and the lines already found. The next frames are the ones
 * past the depth already searched. */
static bool extend_horizon(int h) {
    bool live = s_ncur > 0 && s_depth < h && s_phase != PH_VERIFY && s_phase != PH_DONE;
    bool saved = s_resume_ok && s_resume_n > 0 && s_resume_depth < h;
    if (!live && !saved) {
        return false;
    }
    s_horizon = h;
    s_view.horizon = h;
    if (live) {
        return true;
    }
    s_cur_bank = s_resume_bank;
    s_ncur = s_resume_n;
    s_depth = s_resume_depth;
    s_resume_ok = false;
    s_job_parent = s_job_combo = 0;
    s_open_parent = -1;
    s_ntrials = 0;
    memset(s_fp, 0, sizeof s_fp);
    s_phase = PH_EXPAND;
    s_view.nlines = 0;
    s_view.note = NULL;
    pc_log_line("sf: resume from frame %d toward %d", s_depth, h);
    return true;
}

static int search_slot(void) {
    static uint32_t last_retrace;
    if (VIGetRetraceCount() == last_retrace && s_phase != PH_ROOT) {
        return PC_SF_YIELD; /* one slice per present */
    }
    last_retrace = VIGetRetraceCount();
    if (s_phase == PH_ROOT) {
        if (!root_begin()) {
            return s_state == PC_SF_IDLE ? PC_SF_PASS : PC_SF_YIELD;
        }
    } else if (s_restart) {
        restore_keep_pads(&s_root);
        s_saved_qtype = HSD_PadLibData.qtype;
        HSD_PadLibData.qtype = 2;
        real_last_from_master();
        search_begin();
    }
    s_restart = false;
    uint32_t pressed = real_presses(true);
    if (pressed & SF_START) {
        to_menu("stopped, left right searches again");
        return PC_SF_YIELD;
    }
    int dir = (pressed & SF_DPAD_RIGHT) ? 1 : (pressed & SF_DPAD_LEFT) ? -1 : 0;
    int h = s_horizon + dir * SF_HORIZON_STEP;
    if (dir != 0 && h >= SF_HORIZON_MIN && h <= SF_HORIZON_MAX && h != s_horizon) {
        if (!(dir > 0 && extend_horizon(h))) {
            s_horizon = h;
            restore_keep_pads(&s_root);
            search_begin();
        }
    }
    int lag_dir = (pressed & SF_TRIGGER_R) ? 1 : (pressed & SF_TRIGGER_L) ? -1 : 0;
    int lag = s_endlag + lag_dir * SF_ENDLAG_STEP;
    if (lag_dir != 0 && lag >= SF_ENDLAG_MIN && lag <= SF_ENDLAG_MAX && lag != s_endlag) {
        s_endlag = lag;
        restore_keep_pads(&s_root);
        search_begin();
    }
    uint64_t t0 = SDL_GetTicksNS();
    while (s_phase != PH_DONE && SDL_GetTicksNS() - t0 < SF_SLICE_NS) {
        const char* why = snapshot_unusable(&s_root);
        if (why != NULL) {
            reset(why);
            return PC_SF_YIELD;
        }
        search_step();
    }
    view_progress();
    if (s_phase == PH_DONE) {
        pc_log_line("sf: %d frames searched in %.1f s: %u trials, %u pruned, %u dropped (I/O), "
                    "%u impure, %u verify mismatches, %u pad samples eaten, %u locked, %u whiffed, "
                    "%u missed l-cancel, %u left hitstun, %d lines",
            s_depth, (SDL_GetTicksNS() - s_search_t0) / 1e9, s_n_trials, s_n_pruned, s_n_io,
            s_n_impure, s_n_verify_bad, s_n_eaten, s_n_locked, s_n_whiff, s_n_lcancel, s_n_gap,
            s_view.nlines);
        to_menu(s_view.nlines == 0 ? "no path in range" : NULL);
        return PC_SF_YIELD;
    }
    /* Leave the root in place so the frame presented is the paused one. */
    restore_keep_pads(&s_root);
    Stockfish_Redraw();
    return PC_SF_YIELD;
}

static int play_slot(void) {
    const SfLine* l = &s_lines[s_view.play_index];
    if (s_play_k < 0) {
        restore_keep_pads(&s_root);
        lbAudioAx_80024E84(false);
        s_play_k = 0;
        s_play_dmg = 0;
        s_play_ko = false;
        s_play_seed_ok = false;
        real_last_from_master();
    }
    if (real_start_strip()) {
        to_menu(NULL);
        return PC_SF_YIELD;
    }
    /* Ticks of the search ran back to back; here a render sits between two,
     * and a draw there would leave the seed elsewhere than the search saw
     * it (net.c seed_out_of_tick_check). Start where the last tick ended. */
    if (s_play_seed_ok) {
        *HSD_RandSeedPtr = s_play_seed;
    }
    /* The listed line is the combo. After that, no input: the attack and
     * the knockback keep playing for SF_PLAY_TAIL frames. */
    PADStatus pads[4];
    int combo = s_play_k < l->len ? l->seq[s_play_k] : SF_IN_NONE;
    build_pads(pads, combo);
    run_tick(pads, true);
    s_play_seed = *HSD_RandSeedPtr;
    s_play_seed_ok = true;
    s_play_k++;
    SfResult r = read_result();
    if (r.ko) {
        s_play_ko = true;
    } else if (r.dmg > s_play_dmg) {
        s_play_dmg = r.dmg;
    }
    if (s_play_k >= l->len + SF_PLAY_TAIL) {
        s_view.result_dmg = s_play_dmg;
        s_view.result_ko = s_play_ko;
        // pc_log_line("sf: replay of line %d gave %s %d, the menu said %s %d%s",
        //     s_view.play_index + 1, s_play_ko ? "KO" : "plus", s_play_dmg, l->ko ? "KO" : "plus",
        //     l->dmg, s_play_dmg != l->dmg || s_play_ko != l->ko ? " (MISMATCH)" : "");
        // Stockfish_Repause(s_pause_bit);
        // lbAudioAx_80024E84(true);
        // s_hold_left = SF_HOLD_FRAMES;
        // s_state = PC_SF_HOLD;
        // s_view.state = s_state;
        to_menu(NULL);
        return PC_SF_YIELD;
    }
    return PC_SF_TICKED;
}

static int hold_slot(void) {
    if (real_start_strip() || --s_hold_left <= 0) {
        to_menu(NULL);
        return PC_SF_YIELD;
    }
    return PC_SF_PASS;
}

/* MELEE_SF_TEST=<match frame>: a scripted run with no controller. Presses
 * Start on port 0 at that frame, waits for the menu, plays each listed line
 * with A (cursor down between them), then unpauses with Start. The log has
 * the lines and every replay's result. Pair with MELEE_BOOT_SCENE=vs. */
static void self_test(void) {
    static int at = -2, step, line, wait;
    if (at == -2) {
        const char* e = getenv("MELEE_SF_TEST");
        at = e != NULL ? atoi(e) : -1;
    }
    if (at < 0 || pc_net_active() || step >= 6) {
        return;
    }
    uint16_t press = 0;
    if (wait > 0) {
        wait--;
    } else if (step == 0 && s_state == PC_SF_IDLE && gm_GetFrameCount() >= (u32)at) {
        press = SF_START;
        step = 1;
        wait = 30;
    } else if (step == 1 && s_state == PC_SF_MENU) {
        for (int i = 0; i < s_view.nlines; i++) {
            pc_log_line("sf test: line %d: %s, %s %d", i + 1, s_view.lines[i].text,
                s_view.lines[i].ko ? "KO" : "plus", s_view.lines[i].dmg);
        }
        if (s_view.nlines == 0) {
            pc_log_line("sf test: no lines (%s)", s_view.note ? s_view.note : "");
        }
        step = s_view.nlines > 0 ? 2 : 5;
        wait = 10;
    } else if (step == 2 && s_state == PC_SF_MENU) {
        if (s_view.cursor != line) {
            pc_sf_cursor_step(1);
        } else {
            press = PAD_BUTTON_A;
            step = 3;
        }
        wait = 10;
    } else if (step == 3 && s_state == PC_SF_MENU) {
        step = ++line < s_view.nlines ? 2 : 5;
        wait = 10;
    } else if (step == 5 && s_state == PC_SF_MENU) {
        press = SF_START;
        step = 6;
        pc_log_line("sf test: done");
    } else if (step == 1 && s_state == PC_SF_IDLE && gm_GetFrameCount() >= (u32)at + 120) {
        pc_log_line("sf test: the pause did not start a search");
        step = 6;
    }
    if (press != 0) {
        bool intr = OSDisableInterrupts();
        PadLibData* p = &HSD_PadLibData;
        for (int k = 0; k < p->qcount; k++) {
            p->queue->stat[((p->qread + k) % p->qnum) * 4].button |= press;
        }
        OSRestoreInterrupts(intr);
    }
}

int pc_sf_slice(void (*run)(void)) {
    s_run_tick = run;
    self_test();
    if (s_state == PC_SF_IDLE) {
        return PC_SF_PASS;
    }
    if (pc_net_active()) {
        reset("netplay");
        return PC_SF_PASS;
    }
    if (s_root.frame >= 0 && snapshot_unusable(&s_root) != NULL) {
        reset(snapshot_unusable(&s_root));
        return PC_SF_PASS;
    }
    switch (s_state) {
    case PC_SF_SEARCH:
        return search_slot();
    case PC_SF_PLAY:
        return play_slot();
    case PC_SF_HOLD:
        return hold_slot();
    default:
        return PC_SF_PASS;
    }
}

/* ---- the game's side -------------------------------------------------- */

/* The audio thread keys voices off too; only the game thread is in a tick. */
bool pc_sf_searching(void) {
    return s_in_tick && s_state == PC_SF_SEARCH && SDL_GetCurrentThreadID() == s_tick_thread;
}

bool pc_sf_sim_tick(void) {
    return s_in_tick && SDL_GetCurrentThreadID() == s_tick_thread;
}

bool pc_sf_hold_outcome(void) {
    if (s_state == PC_SF_IDLE || s_state == PC_SF_MENU) {
        return false;
    }
    if (s_in_tick) {
        s_outcome = true;
    }
    return true;
}

void pc_sf_note_io(void) {
    if (s_in_tick) {
        s_io = true;
    }
}

int pc_sf_state(void) {
    return s_state;
}

void pc_sf_request(int pause_bit) {
    if (s_state != PC_SF_IDLE || pc_net_active()) {
        return;
    }
    if (!s_inited) {
        s_inited = true;
        build_combos();
        const char* e = getenv("MELEE_SF_BEAM");
        int w = e != NULL ? atoi(e) : SF_BEAM_DEFAULT;
        s_beam_w = w < 1 ? 1 : w > SF_BEAM_MAX ? SF_BEAM_MAX : w;
        s_root.frame = -1;
    }
    const char* off = getenv("MELEE_4STOCKFISH");
    if (off != NULL && off[0] == '0') {
        return;
    }
    memset(&s_view, 0, sizeof s_view);
    s_view.horizon = s_horizon;
    s_view.endlag = s_endlag;
    s_pause_bit = pause_bit;
    pick_pair();
    s_view.attacker_slot = s_attacker;
    s_view.victim_slot = s_victim;
    s_view.victim_sub = s_victim_sub;
    if (s_attacker < 0 || s_victim < 0) {
        /* No human, or nobody to hit: an ordinary pause. */
        pc_log_line("sf: no search (attacker slot %d, victim slot %d)", s_attacker, s_victim);
        return;
    }
    if (!lb_EveryPeriodTicks()) {
        /* lb_0195.c's frame-skip accumulator is outside the snapshot and
         * only idempotent per tick at game speed 1 (net.c fresh_tick). Read
         * from the clock itself: debug VS never fills the speed rule. */
        pc_log_line("sf: no search (game speed is not 1)");
        return;
    }
    s_root_tries = 0;
    s_restart = false;
    s_phase = PH_ROOT;
    s_state = PC_SF_SEARCH;
    s_view.state = s_state;
}

void pc_sf_end(void) {
    if (s_state != PC_SF_IDLE) {
        reset(NULL);
    }
}

void pc_sf_horizon_step(int dir) {
    int h = s_horizon + (dir > 0 ? SF_HORIZON_STEP : -SF_HORIZON_STEP);
    if (s_state != PC_SF_MENU || h < SF_HORIZON_MIN || h > SF_HORIZON_MAX) {
        return;
    }
    if (dir > 0 && h > s_searched && extend_horizon(h)) {
        s_saved_qtype = HSD_PadLibData.qtype;
        HSD_PadLibData.qtype = 2;
        real_last_from_master();
        s_state = PC_SF_SEARCH;
        s_view.state = s_state;
        return;
    }
    /* Already searched at least this far. Replay the stored lines only up
     * to the new horizon. The beam stays put, so lengthening again does
     * not start over. */
    if (h <= s_searched && s_hof_n > 0) {
        s_horizon = h;
        s_view.horizon = h;
        s_trim = true;
        s_saved_qtype = HSD_PadLibData.qtype;
        HSD_PadLibData.qtype = 2;
        real_last_from_master();
        s_verify_i = 0;
        s_view.nlines = 0;
        s_view.note = NULL;
        s_phase = PH_VERIFY;
        s_state = PC_SF_SEARCH;
        s_view.state = s_state;
        pc_log_line("sf: reuse %d stored lines at horizon %d", s_hof_n, h);
        return;
    }
    s_horizon = h;
    s_view.horizon = h;
    s_restart = true;
    s_phase = PH_EXPAND;
    s_state = PC_SF_SEARCH;
    s_view.state = s_state;
    s_view.nlines = 0;
    s_view.note = NULL;
}

void pc_sf_endlag_step(int dir) {
    int lag = s_endlag + (dir > 0 ? SF_ENDLAG_STEP : -SF_ENDLAG_STEP);
    if (s_state != PC_SF_MENU || lag < SF_ENDLAG_MIN || lag > SF_ENDLAG_MAX) {
        return;
    }
    s_endlag = lag;
    s_view.endlag = lag;
    s_restart = true;
    s_phase = PH_EXPAND;
    s_state = PC_SF_SEARCH;
    s_view.state = s_state;
    s_view.nlines = 0;
    s_view.note = NULL;
}

void pc_sf_cursor_step(int dir) {
    if (s_state != PC_SF_MENU || s_view.nlines <= 0) {
        return;
    }
    s_view.cursor = (s_view.cursor + (dir > 0 ? 1 : s_view.nlines - 1)) % s_view.nlines;
}

void pc_sf_play(void) {
    if (s_state != PC_SF_MENU || s_view.cursor >= s_view.nlines) {
        return;
    }
    s_view.play_index = s_view.cursor;
    s_view.note = NULL;
    s_play_k = -1;
    s_state = PC_SF_PLAY;
    s_view.state = s_state;
}

const PcSfView* pc_sf_view(void) {
    return &s_view;
}
