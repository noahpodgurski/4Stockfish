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
 * Tree. Depth first, one frame per step. The search follows one line until
 * it ends, then comes back and tries the next input from the frame where
 * that line branched. An input that leaves the same state as holding
 * nothing is not a branch. An attack is followed through its animation.
 * When that animation ends without connecting, the position is still a
 * place the line can move and attack from. Two timings of one opening keep
 * the higher damage, then the shorter one. A dash attack and a short hop
 * fair are different openings, so both stay.
 *
 * The inputs tried depend on the state. Ground: walk, dash, crouch, shield,
 * tilts, smashes, a hop, grab, and the four specials. Air: the five aerials,
 * full and half drift, a double jump, and an airdodge angled at the ground.
 * Grab: a throw. Shield: jump, grab, up smash, up B, and down B. During an
 * attack, after it has hit or its interrupt window has opened, A or B with
 * a direction, plus jump. An input that does not change the state is not
 * kept. An aerial otherwise drifts and L-cancels. Landing from that aerial
 * with the L-cancel window already missed is dropped. A line that has dealt
 * damage continues through hitstun. It ends after the victim has been
 * actionable for more than SF_COMBO_GAP frames. Another hit starts that
 * count over.
 *
 * Publish. Trials that raised the damage or took the stock are candidate
 * lines. A short combo is still followed, so a later hit can make it
 * longer. When the search is finished, a line is listed only if it is
 * longer than 80% of the horizon, or it took the stock. Each kept
 * candidate is replayed straight through from the root, then with no
 * input for the same window playback uses. A star KO starts in that
 * window: the stock is removed only after the animation. The menu names
 * the moves that connected and how many frames the line ran. The input
 * sequence is what playback uses.
 *
 * Search ticks are deaf and silent (net.c pc_net_resim, pc_net_audio_deaf),
 * start no rumble, write no .slp frames, never end the match (gmvs.c) and
 * never move net.frame; the advisor is off in netplay. Game thread only. */
#include "compat.h"
#include "pc/sf_search.h"
#include "pc/net_internal.h"
#include "pc/pc.h"
#include "pc/savestate.h"

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
#define SF_HORIZON_DEFAULT 60
#define SF_HORIZON_MIN 30
#define SF_HORIZON_MAX 600
#define SF_HORIZON_STEP 30
/* A listed line is longer than this share of the horizon: 4/5 is 80%.
 * len * DEN > horizon * NUM, so 48 frames of a 60-frame search is out. */
#define SF_SPAN_NUM 4
#define SF_SPAN_DEN 5
#define SF_HOF PC_SF_LINES /* candidate lines kept, then all replayed and listed */
/* Simulated ticks per frame of horizon. MELEE_SF_TRIALS sets the total. */
#define SF_TRIALS_PER_FRAME 1500
/* A frame with less budget than this follows only its default input. */
#define SF_EXPAND_MIN 600
/* Units a playout closes on the victim, past the default input, that still
 * add to a child's budget. 40 is worth about a 10 percent hit. */
#define SF_CLOSE_MAX 40
/* Frames each child is played out with its default input to rank it. */
#define SF_PLAYOUT 12
/* While moving or drifting, the stick may change only this often, or at
 * the top of a jump (fast fall). Buttons may be pressed on any frame. */
#define SF_STICK_EVERY 6
/* L is pressed again this often during an aerial, so any landing is inside
 * the 7-frame L-cancel window. */
#define SF_LCANCEL_PULSE 6
#define SF_KO_VALUE 1000
#define SF_SEEN_BITS 20
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
/* Frames a jump is kept after it leaves the ground, once a combo has
 * started. A full hop is still falling into a fair or dair after a short
 * hop would have landed. */
#define SF_COMMIT 70
/* Before the first hit, this value just marks an empty hop. It is not a
 * countdown: the hop is kept until it lands, so a short hop dair can come
 * out on the way down. Landing with no attack ends the line. */
#define SF_COMMIT_OPEN 12
#define SF_HITS 8 /* connecting moves named on one line */
/* How the line reached its first attack. Two timings of one short hop fair
 * share these bits. A dash and a short hop do not. */
enum {
    AP_DASH = 1,
    AP_WD = 2,
    AP_SHORT = 4,
    AP_FULL = 8,
};
/* Jumpsquat still in progress. Released before takeoff is a short hop.
 * Held through the squat is a full hop. Not part of the opening key. */
enum {
    SQUAT_NONE = 0,
    SQUAT_BTN = 1,
    SQUAT_STICK = 2,
    SQUAT_LETGO = 3,
};
#define SF_MAC_DASH_FRAMES 8
#define SF_MAC_LIMIT 40
enum {
    SF_MAC_NONE = 0,
    SF_MAC_DASH,
    SF_MAC_SHORT,
    SF_MAC_FULL,
    SF_MAC_WDL,
    SF_MAC_WDR,
    SF_MAC_LASER,
    SF_MAC_SHINE,
    /* Short hop, then an aerial on the first airborne frame. A playout of
     * a bare hop presses nothing, so it never shows what the hop is for. */
    SF_MAC_SH_N,
    SF_MAC_SH_U,
    SF_MAC_SH_D,
    SF_MAC_SH_L,
    SF_MAC_SH_R,
    /* Full hop, jump held through the squat, then an aerial at the top. */
    SF_MAC_FH_N,
    SF_MAC_FH_U,
    SF_MAC_FH_D,
    SF_MAC_FH_L,
    SF_MAC_FH_R,
    /* Double jump in the air, then an aerial on the next frame. */
    SF_MAC_DJ_N,
    SF_MAC_DJ_U,
    SF_MAC_DJ_D,
    SF_MAC_DJ_L,
    SF_MAC_DJ_R,
    /* Full hop, or the hop already in the air, then a double jump at the
     * apex, then an aerial on the next frame. */
    SF_MAC_AJ_N,
    SF_MAC_AJ_U,
    SF_MAC_AJ_D,
    SF_MAC_AJ_L,
    SF_MAC_AJ_R,
    /* The same with the double jump once falling. */
    SF_MAC_FJ_N,
    SF_MAC_FJ_U,
    SF_MAC_FJ_D,
    SF_MAC_FJ_L,
    SF_MAC_FJ_R,
    SF_MAC_COUNT
};
/* Vertical speed of "falling" for SF_MAC_FJ_*. Fox reaches it 6 frames
 * past the apex. */
#define SF_FALL_VY (-1.5f)
#define SF_PLAY_TAIL 60 /* frames of no input after the combo, at 60fps */
#define SF_ROOT_TRIES 120 /* presents to wait for a disc read before refusing */
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
    uint8_t lcancel; /* frames since L during this aerial, 0 if not armed */
    uint8_t swings; /* separate attacks started on this line */
    uint8_t hit_swing; /* swing count when the last name was written */
    uint8_t hits[SF_HITS]; /* FtMoveId of each connecting move, in order */
    uint8_t nhits;
    uint16_t first_hit; /* frame of the first damage, 0 if this line has not hit */
    uint8_t macro;
    uint8_t macro_step;
    uint8_t macro_phase;
    uint8_t macro_toward;
    uint8_t approach; /* AP_* bits before the first attack */
    uint8_t squat;    /* SQUAT_* while a jump has not left the ground */
    uint8_t open_set; /* open_motion is the first attack */
    uint8_t open_btn; /* A, B, or Z of that attack, 0 if the press carried no button */
    uint16_t open_motion; /* attack_family of the first attack */
    uint8_t age;    /* frames this motion has lasted */
    bool grounded;
    bool lag;       /* the attacker is in hitlag, so no input is read */
    bool apex;      /* vertical speed turned downward on this frame */
    float vy;
    uint8_t jumps;   /* x1968_jumpsUsed */
    uint8_t max_jumps;
    bool dj;         /* double jumped since the last named hit */
    uint8_t dj_hits; /* bit i: hits[i] came out of a double jump */
} SfLine;

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

/* Fields read off the fighter after a tick. */
typedef struct SfBody {
    int motion;
    bool boxes;
    bool iasa;
    bool miss;
    bool stun;
} SfBody;

/* Two words: a diagonal shield is past bit 63. */
typedef struct SfAllow {
    uint64_t lo, hi;
} SfAllow;

/* Children of a frame: a combo index, the start of a scripted macro, or the
 * next frame of the macro already running. */
enum { SF_KID_MACRO = SF_COMBOS, SF_KID_SCRIPT = SF_COMBOS + SF_MAC_COUNT, SF_KIDS };

/* One frame of the line currently being followed. The root uses s_root
 * for its snapshot. Every deeper frame owns the snapshot in `snap`.
 * A frame gets a budget of simulated ticks. Each child is first played out
 * for a few frames to rank it, then the rest of the budget is split by
 * that rank, so the walk goes deep where damage was seen and always ends. */
typedef struct SfNode {
    Snapshot snap;
    SfLine line;
    uint32_t budget;
    uint32_t t0; /* s_n_trials when this frame was entered */
    int best;    /* best value reached under this frame */
    uint64_t neutral_fp;
    uint64_t neutral_body;
    bool baseline; /* the neutral fields are set */
    uint8_t stage;
    uint8_t nkid, ki, cur;
    uint8_t dkid; /* the default input: the last stick, buttons released */
    uint8_t kid[SF_KIDS];
    int16_t val[SF_KIDS];
    uint16_t dist[SF_KIDS]; /* closest the playout came to the victim */
    uint16_t dref;          /* dist of the default input */
    uint64_t key[SF_KIDS]; /* seen_key after the child's first tick */
} SfNode;

enum { SN_NEW, SN_SAMPLE, SN_EXPLORE };
enum { PH_ROOT, PH_EXPAND, PH_VERIFY, PH_DONE };

static int s_state = PC_SF_IDLE;
static int s_phase;
static void (*s_run_tick)(void);
static bool s_in_tick;     /* an advisor tick is running */
static SDL_ThreadID s_tick_thread;
static bool s_outcome;     /* that tick tried to end the match */
static bool s_io;          /* that tick asked for a disc read */
static bool s_restart;     /* search again from the root, keeping it */
static int s_searched;     /* deepest horizon already finished */
static bool s_trim;        /* re-list stored lines at a shorter horizon */
static bool s_inited;

static int s_pause_bit;
static int s_attacker = -1, s_port, s_victim = -1, s_victim_sub;
static HSD_GObj* s_victim_gobj;
static int s_base_pct, s_base_stocks, s_base_att_stocks;
static int s_horizon = SF_HORIZON_DEFAULT;
static int s_endlag = SF_ENDLAG_DEFAULT;
static int s_root_tries;
static uint8_t s_saved_qtype;
static uint16_t s_real_last[4];

static SfCombo s_combo[SF_COMBOS];
static Snapshot s_root;
static SfNode s_path[SF_HORIZON_MAX + 1];
static int s_top; /* index of the frame being expanded, -1 when the walk is done */
static int s_depth; /* deepest frame this search has reached */
static uint8_t s_root_toward;
/* States already walked: a later visit with no less budget and no earlier
 * frame would only repeat that subtree. */
typedef struct SfSeen {
    uint64_t key;
    uint32_t budget;
    uint16_t len;
} SfSeen;
static SfSeen s_seen[1u << SF_SEEN_BITS];
static SfLine s_hof[SF_HOF];
static int s_hof_n, s_verify_i;
static SfLine s_lines[PC_SF_LINES]; /* the published lines, as replay scripts */
static PcSfView s_view;
static XXH3_state_t* s_xxh;

static int s_play_k, s_hold_left;
static int s_play_dmg;
static bool s_play_ko;
static uint32_t s_play_seed;
static bool s_play_seed_ok;

static uint64_t s_search_t0;
static uint32_t s_budget; /* simulated ticks for the whole search */
static bool s_mac_script;
static bool s_mac_done;
static uint8_t s_mac_id, s_mac_step, s_mac_phase, s_mac_toward;
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

/* Every name move_name can return, in the order the menu filter cycles. */
static const char* const s_move_labels[] = {
    "jab", "dash attack", "forward tilt", "up tilt", "down tilt", "f-smash", "u-smash",
    "d-smash", "nair", "fair", "bair", "uair", "dair", "neutral B", "side B", "up B", "down B",
    "fthrow", "bthrow", "uthrow", "dthrow", "pummel", "getup attack", "edge attack",
    "neutral special", "double jump",
};
#define SF_LABEL_DJ 25
#define SF_MOVE_LABELS ((int)(sizeof s_move_labels / sizeof s_move_labels[0]))
_Static_assert(sizeof s_move_labels / sizeof s_move_labels[0] <= 32, "one bit per label");

static unsigned line_moves(const SfLine* l) {
    unsigned mask = 0;
    for (int i = 0; i < l->nhits; i++) {
        const char* name = move_name(l->hits[i]);
        for (int b = 0; name != NULL && b < SF_MOVE_LABELS; b++) {
            if (strcmp(name, s_move_labels[b]) == 0) {
                mask |= 1u << b;
                break;
            }
        }
    }
    if (l->dj_hits != 0) {
        mask |= 1u << SF_LABEL_DJ;
    }
    return mask;
}

/* The menu row is the hit names. The prefix is why two of those rows are
 * not the same starter: dash, wavedash, short hop, full hop. */
static void opening_prefix(char* dst, size_t cap, const SfLine* l) {
    static const struct {
        int bit;
        const char* word;
    } words[] = {
        {AP_DASH, ""},
        {AP_WD, "WD "},
        {AP_FULL, "FH "},
        {AP_SHORT, "SH "},
    };
    size_t pos = 0;
    int approach = l->approach;
    int named_dash = 0;
    dst[0] = '\0';
    if (cap == 0) {
        return;
    }
    if (l->nhits > 0) {
        const char* first = move_name(l->hits[0]);
        named_dash = first != NULL && strcmp(first, "dash attack") == 0;
    }
    /* The jump that starts a wavedash is not a separate short hop. */
    if ((approach & AP_WD) && (approach & AP_SHORT) && (approach & AP_FULL) == 0) {
        approach &= ~AP_SHORT;
    }
    if (named_dash && (approach & ~AP_DASH) == 0) {
        approach &= ~AP_DASH;
    }
    for (int i = 0; i < 4; i++) {
        size_t n;
        if ((approach & words[i].bit) == 0) {
            continue;
        }
        n = strlen(words[i].word);
        if (pos + n >= cap) {
            break;
        }
        memcpy(dst + pos, words[i].word, n);
        pos += n;
    }
    dst[pos] = '\0';
}

static void format_line(char* dst, size_t cap, const SfLine* l) {
    size_t pos = 0;
    char pre[48];
    dst[0] = '\0';
    opening_prefix(pre, sizeof pre, l);
    if (pre[0] != '\0' && cap > 0) {
        size_t n = strlen(pre);
        if (n >= cap) {
            n = cap - 1;
        }
        memcpy(dst, pre, n);
        dst[n] = '\0';
        pos = n;
    }
    if (l->nhits == 0) {
        snprintf(dst + pos, cap - pos, "hit");
        return;
    }
    for (int i = 0; i < l->nhits && pos + 1 < cap; i++) {
        const char* name = move_name(l->hits[i]);
        if (name == NULL) {
            name = "hit";
        }
        /* The prefix already ends with a space. Commas belong between hits. */
        int n = snprintf(dst + pos, cap - pos, "%s%s%s", i > 0 ? ", " : "",
                         (l->dj_hits >> i) & 1u ? "DJ " : "", name);
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
static uint64_t fingerprint_ex(bool with_input) {
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
            if (with_input) {
                XXH3_64bits_update(s_xxh, &fp->input, sizeof fp->input);
            }
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

static uint64_t fingerprint(void) {
    return fingerprint_ex(true);
}

/* The same state without the input buffer: two stick angles into one
 * up smash are one position. Only for skipping repeats, which can lose a
 * line but never misreport one. */
static uint64_t state_key(void) {
    return fingerprint_ex(false);
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


/* ---- candidates ------------------------------------------------------- */

static bool line_better(const SfLine* a, const SfLine* b) {
    int fa, fb;
    if (a->ko != b->ko) {
        return a->ko;
    }
    if (a->dmg != b->dmg) {
        return a->dmg > b->dmg;
    }
    /* Same percent: the line that hit first still has frames left to combo.
     * An empty hop that deals its damage 20 frames later is the worse punish. */
    fa = a->first_hit == 0 ? 65535 : (int)a->first_hit;
    fb = b->first_hit == 0 ? 65535 : (int)b->first_hit;
    if (fa != fb) {
        return fa < fb;
    }
    return a->len < b->len;
}

static bool line_same(const SfLine* a, const SfLine* b) {
    return a->len == b->len && memcmp(a->seq, b->seq, (size_t)a->len) == 0;
}

/* A new attack during an aerial's interrupt, or any attack that changes
 * the motion. A second fair is the same move id as the first, but it is a
 * new swing. Two hits of one nair are not. */
static int swing_count(const SfLine* par, int combo, int motion) {
    int par_aerial = par->motion >= ftCo_MS_AttackAirN && par->motion <= ftCo_MS_AttackAirLw;
    int press = combo >= 0 && combo < SF_COMBOS && (combo % SF_BTN) == SF_IN_A;
    uint16_t b = (combo >= 0 && combo < SF_COMBOS) ? s_combo[combo].button : 0;
    int atk = (b & (PAD_BUTTON_A | PAD_BUTTON_B | PAD_TRIGGER_Z)) != 0;
    int n = par->swings;
    if (press && par_aerial && par->iasa) {
        n++;
    } else if (atk && motion != par->motion) {
        n++;
    }
    return n;
}

/* fp+208C is the move id of the hit that just landed. A multi-hit move
 * keeps that id, so it is named once. A second swing of the same move,
 * such as short hop double fair, is named again. */
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
        if (strcmp(prev, name) == 0 && l->swings == l->hit_swing) {
            return;
        }
    }
    if (l->nhits >= SF_HITS) {
        return;
    }
    if (l->dj) {
        l->dj_hits |= (uint8_t)(1u << l->nhits);
        l->dj = false;
    }
    l->hits[l->nhits++] = (uint8_t)id;
    l->hit_swing = l->swings;
}

static const char* hit_token(const SfLine* l, int i) {
    const char* name = move_name(l->hits[i]);
    return name != NULL ? name : "hit";
}

static bool hits_equal(const SfLine* a, const SfLine* b) {
    if (a->nhits != b->nhits) {
        return false;
    }
    if (a->dj_hits != b->dj_hits) {
        return false;
    }
    for (int i = 0; i < a->nhits; i++) {
        if (strcmp(hit_token(a, i), hit_token(b, i)) != 0) {
            return false;
        }
    }
    return true;
}

/* Insert, delete, or substitute one named hit. A one-hit line is not an
 * edit of a longer string: "nair" must not swallow every combo that starts
 * with nair. */
static int hit_dist(const SfLine* a, const SfLine* b) {
    int prev[SF_HITS + 1];
    int cur[SF_HITS + 1];
    int na = a->nhits;
    int nb = b->nhits;
    for (int j = 0; j <= nb; j++) {
        prev[j] = j;
    }
    for (int i = 1; i <= na; i++) {
        cur[0] = i;
        for (int j = 1; j <= nb; j++) {
            int cost = strcmp(hit_token(a, i - 1), hit_token(b, j - 1)) != 0;
            int del = prev[j] + 1;
            int ins = cur[j - 1] + 1;
            int sub = prev[j - 1] + cost;
            int best = del < ins ? del : ins;
            cur[j] = best < sub ? best : sub;
        }
        memcpy(prev, cur, (size_t)(nb + 1) * sizeof prev[0]);
    }
    return prev[nb];
}

static bool attack_motion(int motion);
static int attack_family(int motion);

static int dash_motion(int motion) {
    return motion == ftCo_MS_Dash || motion == ftCo_MS_Run || motion == ftCo_MS_RunDirect ||
           motion == ftCo_MS_TurnRun || motion == ftCo_MS_RunBrake ||
           motion == ftCo_MS_AttackDash || motion == ftCo_MS_CatchDash ||
           motion == ftCo_MS_CatchDashPull;
}

/* Up, up-left, up-right. sy is at the rim, so a tap jump stays held. */
static int stick_full_up(int combo) {
    int dir = combo / SF_BTN;
    return dir == 3 || dir == 9 || dir == 10;
}

/* The frame a hop actually leaves the ground. Drift later in the air is not
 * another hop, and a grounded up smash out of jumpsquat is not one either. */
static int hop_takeoff(int motion) {
    if (motion == ftCo_MS_JumpF || motion == ftCo_MS_JumpB || motion == ftCo_MS_JumpAerialF ||
        motion == ftCo_MS_JumpAerialB || motion == ftCo_MS_Fall || motion == ftCo_MS_FallF ||
        motion == ftCo_MS_FallB || motion == ftCo_MS_FallAerial || motion == ftCo_MS_FallAerialF ||
        motion == ftCo_MS_FallAerialB || motion == ftCo_MS_EscapeAir)
    {
        return 1;
    }
    return motion >= ftCo_MS_AttackAirN && motion <= ftCo_MS_AttackAirLw;
}

/* The first swing, including a special. Appeals sit past the common table
 * too, and the search never presses one. */
static int starter_motion(int motion) {
    if (motion < 0) {
        return 0;
    }
    if (attack_motion(motion)) {
        return 1;
    }
    if (motion >= ftCo_MS_ThrowF && motion <= ftCo_MS_ThrowLw) {
        return 1;
    }
    return motion >= ftCo_MS_Count;
}

static void seed_opening(SfLine* l) {
    int motion = l->motion;
    if (dash_motion(motion)) {
        l->approach |= AP_DASH;
    }
    if (motion == ftCo_MS_EscapeAir) {
        l->approach |= AP_WD;
    }
    if (motion == ftCo_MS_KneeBend) {
        l->squat = SQUAT_BTN;
    }
    if (starter_motion(motion)) {
        l->open_motion = (uint16_t)attack_family(motion);
        l->open_set = 1;
        l->squat = SQUAT_NONE;
    }
}

/* Record the approach on the frame it happens. Short hop is a jumpsquat
 * that let go of jump. Full hop is one that was still held at takeoff.
 * The first attack motion locks the opening so a later drift cannot change it. */
static void note_opening(SfLine* l, int combo, int motion) {
    int btn;
    if (l->open_set || combo < 0 || combo >= SF_COMBOS) {
        return;
    }
    btn = combo % SF_BTN;
    if (dash_motion(motion)) {
        l->approach |= AP_DASH;
    }
    if (combo == SF_IN_WD_L || combo == SF_IN_WD_R || motion == ftCo_MS_EscapeAir) {
        l->approach |= AP_WD;
    }
    if (motion == ftCo_MS_KneeBend) {
        if (l->squat == SQUAT_NONE) {
            if (btn == SF_IN_JUMP) {
                l->squat = SQUAT_BTN;
            } else if (stick_full_up(combo)) {
                l->squat = SQUAT_STICK;
            } else {
                l->squat = SQUAT_LETGO;
            }
        } else if (l->squat == SQUAT_BTN && btn != SF_IN_JUMP) {
            l->squat = SQUAT_LETGO;
        } else if (l->squat == SQUAT_STICK && !stick_full_up(combo)) {
            l->squat = SQUAT_LETGO;
        }
    } else if (l->squat != SQUAT_NONE) {
        if (hop_takeoff(motion)) {
            l->approach |= l->squat == SQUAT_LETGO ? AP_SHORT : AP_FULL;
        }
        l->squat = SQUAT_NONE;
    }
    if (starter_motion(motion)) {
        l->open_motion = (uint16_t)attack_family(motion);
        l->open_set = 1;
        l->squat = SQUAT_NONE;
        /* The button on the frame the swing starts. Left and right share it,
         * so both sides of one fair are one family. */
        if (btn == SF_IN_A || btn == SF_IN_B || btn == SF_IN_GRAB) {
            l->open_btn = (uint8_t)btn;
        }
    }
}

/* Same starter: same approach and the same first attack. A missing button
 * matches either side, so two timings of one fair still meet. */
static bool opening_same(const SfLine* a, const SfLine* b) {
    if (a->approach != b->approach || a->open_set != b->open_set) {
        return false;
    }
    if (a->open_set && a->open_motion != b->open_motion) {
        return false;
    }
    if (a->open_btn != 0 && b->open_btn != 0 && a->open_btn != b->open_btn) {
        return false;
    }
    return true;
}

static bool combo_similar(const SfLine* a, const SfLine* b) {
    int d = a->nhits - b->nhits;
    /* A short hop nair and a running nair are not the same combo. Two
     * timings of that short hop nair still are. */
    if (!opening_same(a, b)) {
        return false;
    }
    if (a->nhits < 2 || b->nhits < 2) {
        return hits_equal(a, b);
    }
    if (d > 1 || d < -1) {
        return false;
    }
    return hit_dist(a, b) <= 1;
}

/* Same damage: the longer string is the one a wider horizon just grew.
 * The menu still prefers the shorter punish when the strings differ. */
static bool line_richer(const SfLine* a, const SfLine* b) {
    if (a->ko != b->ko || a->dmg != b->dmg) {
        return line_better(a, b);
    }
    if (a->nhits != b->nhits) {
        return a->nhits > b->nhits;
    }
    return a->len < b->len;
}

/* Drop a one-move edit of a line already kept, so a longer horizon spends
 * the freed row on a different combo. */
static void hof_compact(void) {
    int w = 0;
    for (int i = 0; i < s_hof_n; i++) {
        int sim = -1;
        for (int j = 0; j < w; j++) {
            if (combo_similar(&s_hof[j], &s_hof[i])) {
                sim = j;
                break;
            }
        }
        if (sim >= 0) {
            if (line_richer(&s_hof[i], &s_hof[sim])) {
                s_hof[sim] = s_hof[i];
            }
            continue;
        }
        s_hof[w++] = s_hof[i];
    }
    s_hof_n = w;
}

/* Listed once the search is finished. A KO stays even when the stock ends
 * before 80% of the horizon. A 30-frame combo on a 60-frame search is still
 * followed, in case a later hit lengthens it. */
static bool line_spans(const SfLine* l) {
    if (l->ko) {
        return true;
    }
    return true;
    // return l->len * SF_SPAN_DEN > s_horizon * SF_SPAN_NUM;
}

/* Worst extra copy of an opening that already has two rows. The best copy
 * of that opening stays, so a new starter can take the spare seat. */
static int spare_row(void) {
    int victim = -1;
    for (int i = 0; i < s_hof_n; i++) {
        int copies = 0;
        int best = -1;
        for (int j = 0; j < s_hof_n; j++) {
            if (!opening_same(&s_hof[i], &s_hof[j])) {
                continue;
            }
            copies++;
            if (best < 0 || line_better(&s_hof[j], &s_hof[best])) {
                best = j;
            } else if (j < best && !line_better(&s_hof[best], &s_hof[j])) {
                best = j;
            }
        }
        if (copies < 2 || i == best) {
            continue;
        }
        if (victim < 0 || line_better(&s_hof[victim], &s_hof[i])) {
            victim = i;
        }
    }
    return victim;
}

/* Every trial that raised the damage or took the stock is a candidate.
 * Distinct openings each keep a row. Same opening, two timings, one row. */
static void hof_add(const SfLine* parent, int combo, const SfResult* r, int motion) {
    SfLine l = *parent;
    int present = 0;
    int victim;
    l.seq[l.len++] = (uint8_t)combo;
    l.dmg = r->dmg;
    l.ko = r->ko;
    if (parent->dmg == 0 && r->dmg > 0) {
        l.first_hit = (uint16_t)l.len;
    }
    l.swings = (uint8_t)swing_count(parent, combo, r->motion);
    note_opening(&l, combo, motion);
    note_connect(&l);
    for (int i = 0; i < s_hof_n; i++) {
        if (line_same(&s_hof[i], &l)) {
            return;
        }
    }
    /* One row per combo string of one opening. A richer short hop fair
     * replaces a weaker timing of that fair, not a dash attack. */
    for (int i = 0; i < s_hof_n; i++) {
        if (!combo_similar(&s_hof[i], &l)) {
            continue;
        }
        if (line_richer(&l, &s_hof[i])) {
            /* The short timing is still being followed. Replacing the row
             * would drop a line the menu can already show. */
            if (!line_spans(&l) && line_spans(&s_hof[i])) {
                return;
            }
            s_hof[i] = l;
        }
        return;
    }
    if (s_hof_n < SF_HOF) {
        s_hof[s_hof_n++] = l;
        return;
    }
    for (int i = 0; i < s_hof_n; i++) {
        if (opening_same(&s_hof[i], &l)) {
            present = 1;
            break;
        }
    }
    victim = spare_row();
    if (present) {
        if (victim < 0 || !line_better(&l, &s_hof[victim])) {
            return;
        }
        if (!line_spans(&l) && line_spans(&s_hof[victim])) {
            return;
        }
        s_hof[victim] = l;
        return;
    }
    if (victim >= 0) {
        if (!line_spans(&l) && line_spans(&s_hof[victim])) {
            return;
        }
        s_hof[victim] = l;
        return;
    }
    /* A full table keeps a short combo on its path without giving it a
     * seat the menu will show. A line that already qualifies takes one. */
    if (!line_spans(&l)) {
        return;
    }
    for (int i = 0; i < s_hof_n; i++) {
        if (line_spans(&s_hof[i])) {
            continue;
        }
        if (victim < 0 || line_better(&s_hof[victim], &s_hof[i])) {
            victim = i;
        }
    }
    if (victim >= 0) {
        s_hof[victim] = l;
        return;
    }
    victim = 0;
    for (int i = 1; i < s_hof_n; i++) {
        if (line_better(&s_hof[victim], &s_hof[i])) {
            victim = i;
        }
    }
    if (line_better(&l, &s_hof[victim])) {
        s_hof[victim] = l;
    }
}

static int hof_cmp(const void* a, const void* b) {
    const SfLine* x = a;
    const SfLine* y = b;
    return line_better(x, y) ? -1 : line_better(y, x) ? 1 : 0;
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


/* ---- search ----------------------------------------------------------- */

static void snap_free(Snapshot* s);

static const Snapshot* node_snap(const SfNode* n) {
    return n == &s_path[0] ? &s_root : &n->snap;
}

static int toward_input(void);

static void view_progress(void) {
    uint64_t used = s_phase >= PH_VERIFY ? s_budget : s_n_trials;
    if (used > s_budget) {
        used = s_budget;
    }
    s_view.depth = s_top >= 0 ? s_path[s_top].line.len : s_depth;
    s_view.progress = s_budget > 0 ? (int)(950 * used / s_budget) : 0;
    if (s_phase == PH_VERIFY && s_hof_n > 0) {
        int done_v = s_verify_i < s_hof_n ? s_verify_i : s_hof_n;
        s_view.progress = 950 + 50 * done_v / s_hof_n;
    }
    s_view.elapsed_time = (int)((SDL_GetTicksNS() - s_search_t0) / 1000000000ull);
}

static void search_begin(void) {
    for (int i = 0; i <= SF_HORIZON_MAX; i++) {
        snap_free(&s_path[i].snap);
        memset(&s_path[i], 0, sizeof s_path[i]);
    }
    memset(s_seen, 0, sizeof s_seen);
    s_top = 0;
    s_depth = 0;
    s_path[0].line = (SfLine){.len = 0};
    const char* trials = getenv("MELEE_SF_TRIALS");
    s_budget = trials != NULL && atoi(trials) > 0 ? (uint32_t)atoi(trials)
                                                  : (uint32_t)(SF_TRIALS_PER_FRAME * s_horizon);
    s_path[0].budget = s_budget;
    s_hof_n = 0;
    s_verify_i = 0;
    s_view.nlines = 0;
    s_view.cursor = 0;
    s_view.have_best = false;
    s_view.note = NULL;
    s_view.horizon = s_horizon;
    s_view.endlag = s_endlag;
    s_n_trials = s_n_pruned = s_n_impure = s_n_io = s_n_eaten = s_n_verify_bad = s_n_locked =
        s_n_whiff = s_n_lcancel = s_n_gap = 0;
    Fighter* att = fighter_at(s_attacker, 0, NULL);
    if (att != NULL) {
        s_path[0].line.motion = (int)att->motion_id;
        s_path[0].line.iasa = att->allow_interrupt;
        s_path[0].line.grounded = att->ground_or_air == GA_Ground;
        s_path[0].line.lag = att->dmg.x195c_hitlag_frames > 0.0f;
        s_path[0].line.vy = att->self_vel.y;
        s_path[0].line.jumps = att->x1968_jumpsUsed;
        s_path[0].line.max_jumps = (uint8_t)att->co_attrs.max_jumps;
        seed_opening(&s_path[0].line);
    }
    s_root_toward = (uint8_t)toward_input();
    s_mac_script = false;
    s_mac_done = false;
    s_mac_id = s_mac_step = s_mac_phase = s_mac_toward = 0;
    s_search_t0 = SDL_GetTicksNS();
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

/* Back to a state that can move or attack again. Landing from an aerial and
 * the fall after a special count: the swing is over even though the common
 * idle list does not name those motions. */
static bool move_over(int motion) {
    return motion == ftCo_MS_Wait || motion == ftCo_MS_WalkSlow || motion == ftCo_MS_WalkMiddle ||
           motion == ftCo_MS_WalkFast || motion == ftCo_MS_Turn || motion == ftCo_MS_TurnRun ||
           motion == ftCo_MS_Dash || motion == ftCo_MS_Run || motion == ftCo_MS_RunDirect ||
           motion == ftCo_MS_RunBrake || motion == ftCo_MS_Squat || motion == ftCo_MS_SquatWait ||
           motion == ftCo_MS_SquatRv || motion == ftCo_MS_Landing ||
           motion == ftCo_MS_LandingFallSpecial || motion == ftCo_MS_FallSpecial ||
           motion == ftCo_MS_FallSpecialF || motion == ftCo_MS_FallSpecialB ||
           motion == ftCo_MS_Guard || motion == ftCo_MS_GuardOn || motion == ftCo_MS_GuardOff ||
           landing_air(motion) || air_motion(motion);
}

/* A common attack or a grab. A buffered press can start one of these on a
 * frame whose input is only the stick, and that frame is still the attack. */
static bool attack_motion(int motion) {
    if (motion >= ftCo_MS_Attack11 && motion <= ftCo_MS_AttackAirLw) {
        return true;
    }
    return motion == ftCo_MS_Catch || motion == ftCo_MS_CatchPull || motion == ftCo_MS_CatchDash ||
           motion == ftCo_MS_CatchDashPull || motion == ftCo_MS_CatchWait ||
           motion == ftCo_MS_CatchAttack;
}

/* CONT_ATTACK: the move is still going, so the line must keep this.
 * CONT_DROP: the swing finished and never hit. The caller keeps that
 * position as movement, so the line can still approach and attack again. */
enum { CONT_KEEP, CONT_ATTACK, CONT_DROP };

static int continuation(const SfLine* par, int combo, const SfResult* r, int motion, bool live,
                        bool* seen) {
    bool same = motion == par->motion;
    *seen = same ? (par->hit_seen || live) : live;
    if (!same && (attack_input(combo) || attack_motion(motion))) {
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

static SfBody read_body(int prev_motion, int fallback_motion) {
    const Fighter* att = fighter_at(s_attacker, 0, NULL);
    SfBody b;
    b.motion = att != NULL ? (int)att->motion_id : fallback_motion;
    b.boxes = hitboxes_live(att);
    b.iasa = att != NULL && att->allow_interrupt;
    b.miss = missed_lcancel(prev_motion, att);
    b.stun = victim_in_hitstun();
    return b;
}

/* Holding nothing is the baseline. Anything else that leaves the attacker
 * where neutral did is not a branch: the game reads no input from a buffer,
 * so a press with no effect on this frame has none later either. */
static bool input_useless(int kid, uint64_t body_hash, uint64_t fp, uint64_t neutral_body,
                          uint64_t neutral_fp) {
    if (kid == SF_IN_NONE) {
        return false;
    }
    return fp == neutral_fp || body_hash == neutral_body;
}

enum { EDGE_DROP, EDGE_PUSH, EDGE_RETRY };

static int push_child(const SfLine* line, uint32_t budget, int value) {
    if (s_top < 0 || s_top >= SF_HORIZON_MAX) {
        return EDGE_DROP;
    }
    SfNode* child = &s_path[s_top + 1];
    if (!snapshot_take(&child->snap, s_top + 1)) {
        return EDGE_RETRY;
    }
    child->line = *line;
    child->budget = budget;
    child->t0 = s_n_trials;
    child->best = value;
    child->baseline = false;
    child->stage = SN_NEW;
    child->nkid = child->ki = child->cur = 0;
    s_top++;
    if (line->len > s_depth) {
        s_depth = line->len;
    }
    return EDGE_PUSH;
}

/* Record damage, then build the next frame of the line when it is still a
 * combo. EDGE_DROP: the line ends here. */
static int edge_line(const SfLine* par, int combo, const SfResult* r, const SfBody* body,
                     SfLine* out) {
    uint8_t mac_id = s_mac_id;
    uint8_t mac_step = s_mac_step;
    uint8_t mac_phase = s_mac_phase;
    uint8_t mac_toward = s_mac_toward;
    bool mac_done = s_mac_done;
    bool mac_script = s_mac_script;
    s_mac_script = false;
    s_mac_done = false;
    s_mac_id = s_mac_step = s_mac_phase = s_mac_toward = 0;
    if (r->dead) {
        return EDGE_DROP;
    }
    if (body->miss) {
        s_n_lcancel++;
        return EDGE_DROP;
    }
    if (r->ko || r->dmg > par->dmg) {
        hof_add(par, combo, r, body->motion);
        note_best(r);
    }
    if (r->ko || s_outcome || par->len + 1 >= s_horizon) {
        return EDGE_DROP;
    }
    /* The count stays at 0 through hitlag and hitstun, and restarts when
     * another hit puts the victim back there. */
    int gap = 0;
    if ((par->dmg > 0 || r->dmg > 0) && !body->stun) {
        gap = par->gap + 1;
    }
    if (gap > s_endlag) {
        s_n_gap++;
        return EDGE_DROP;
    }
    int motion = body->motion;
    bool seen = false;
    int cont = continuation(par, combo, r, motion, body->boxes, &seen);
    /* A finished miss is still a position, so the line can swing, move,
     * and swing again. */
    if (cont == CONT_DROP) {
        s_n_whiff++;
        cont = CONT_KEEP;
    }
    bool same = motion == par->motion;
    bool dealt = r->dmg > par->dmg || r->ko;
    uint8_t commit = 0;
    if (par->commit > 0 && jump_air(motion)) {
        /* After a hit, the countdown is what lets a full hop reach a falling
         * aerial. Before a hit, hold the mark until the hop lands. */
        commit = (par->dmg > 0 || dealt) ? (uint8_t)(par->commit - 1) : par->commit;
    } else if (jump_input(combo) && jump_motion(motion)) {
        commit = (par->dmg > 0 || dealt) ? SF_COMMIT : SF_COMMIT_OPEN;
    } else if (par->commit > 0 && par->dmg == 0 && !dealt && motion == ftCo_MS_EscapeAir) {
        /* Airdodge is the middle of a wavedash. Keep the hop mark. */
        commit = par->commit;
    }
    uint8_t lcancel = 0;
    if (attack_air(par->motion) || attack_air(motion) || landing_air(motion)) {
        if (attack_air(par->motion) && (combo % SF_BTN) == SF_IN_SHIELD) {
            lcancel = 1;
        } else if (par->lcancel > 0 && par->lcancel < 10) {
            lcancel = (uint8_t)(par->lcancel + 1);
        }
    }
    if (par->len >= SF_HORIZON_MAX) {
        return EDGE_DROP;
    }
    SfLine child = *par;
    child.seq[child.len++] = (uint8_t)combo;
    child.dmg = r->dmg;
    if (par->dmg == 0 && r->dmg > 0) {
        child.first_hit = (uint16_t)child.len;
    }
    child.ko = false;
    child.motion = motion;
    note_opening(&child, combo, motion);
    child.hit_seen = seen;
    child.attack = cont == CONT_ATTACK;
    child.iasa = body->iasa;
    child.connected = same && par->attack ? (par->connected || dealt) : dealt;
    child.gap = (uint8_t)gap;
    child.commit = commit;
    child.lcancel = lcancel;
    child.swings = (uint8_t)swing_count(par, combo, motion);
    if (mac_script && mac_id != SF_MAC_NONE && !mac_done) {
        child.macro = mac_id;
        child.macro_step = mac_step;
        child.macro_phase = mac_phase;
        child.macro_toward = mac_toward;
    } else {
        child.macro = 0;
        child.macro_step = 0;
        child.macro_phase = 0;
        child.macro_toward = 0;
    }
    const Fighter* att = fighter_at(s_attacker, 0, NULL);
    float vy = att != NULL ? att->self_vel.y : 0.0f;
    child.age = same ? (uint8_t)(par->age < 255 ? par->age + 1 : 255) : 0;
    child.grounded = att != NULL && att->ground_or_air == GA_Ground;
    child.lag = att != NULL && att->dmg.x195c_hitlag_frames > 0.0f;
    child.apex = par->vy > 0.0f && vy <= 0.0f;
    child.vy = vy;
    if (att != NULL) {
        child.jumps = att->x1968_jumpsUsed;
        if (!par->grounded && child.jumps > par->jumps) {
            child.dj = true;
        }
    }
    if (r->dmg > par->dmg) {
        note_connect(&child);
    }
    *out = child;
    return EDGE_PUSH;
}

/* One tick of `combo` from this snapshot. The body hash is the attacker's
 * reaction, not the whole position. False when the tick asked for a disc
 * read; that branch cannot be compared. */
static bool step_tick(int combo, SfResult* r, uint64_t* body_hash) {
    PADStatus pads[4];
    build_pads(pads, combo);
    run_tick(pads, false);
    s_n_trials++;
    if (s_io || io_busy()) {
        io_drain();
        s_n_io++;
        return false;
    }
    *r = read_result();
    *body_hash = attacker_body();
    return true;
}

static bool probe_snap(const Snapshot* snap, int combo, SfResult* r, uint64_t* body_hash) {
    PADStatus pads[4];
    restore_keep_pads(snap);
    build_pads(pads, combo);
    run_tick(pads, false);
    s_n_trials++;
    if (s_io || io_busy()) {
        io_drain();
        s_n_io++;
        return false;
    }
    *r = read_result();
    *body_hash = attacker_body();
    return true;
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
 * Ground: walk, dash, crouch, shield, tilts, smashes, a hop, grab, specials.
 * Air: aerials, full and half drift, a double jump, an airdodge at the ground.
 * Grab: the four throws, and A to pummel.
 * Attack: A or B with a direction, and jump.
 * Shield options are chosen once the guard state is up, not from this list. */
static SfAllow state_actions(int motion, bool attack) {
    static const int ground[] = {
        SF_IN_NONE,
        /* Walk, dash, crouch, shield, grab, hop. Diagonals are the wavedash
         * and dash-jump angles: the stick is on that diagonal before jumpsquat. */
        SF_IN_JUMP, SF_IN_UP, SF_IN_DOWN, SF_IN_LEFT, SF_IN_RIGHT,
        SF_IN_HALF_LEFT, SF_IN_HALF_RIGHT, SF_IN_HALF_UP, SF_IN_HALF_DOWN,
        SF_IN_UP_LEFT, SF_IN_UP_RIGHT, SF_IN_DOWN_LEFT, SF_IN_DOWN_RIGHT,
        SF_IN_SHIELD, SF_IN_GRAB, SF_IN_A,
        /* Tilts. A diagonal stick still resolves to one of these. */
        SF_IN_HALF_LEFT + SF_IN_A, SF_IN_HALF_RIGHT + SF_IN_A,
        SF_IN_HALF_UP + SF_IN_A, SF_IN_HALF_DOWN + SF_IN_A,
        SF_IN_UP_LEFT + SF_IN_A, SF_IN_UP_RIGHT + SF_IN_A,
        SF_IN_DOWN_LEFT + SF_IN_A, SF_IN_DOWN_RIGHT + SF_IN_A,
        /* Smashes. A with the dash stick held is also the dash attack once
         * the state is already dash; from wait the same press is an f-smash. */
        SF_IN_LEFT + SF_IN_A, SF_IN_RIGHT + SF_IN_A,
        SF_IN_UP + SF_IN_A, SF_IN_DOWN + SF_IN_A,
        /* Specials. Down-diagonal B is shine while moving. */
        SF_IN_B, SF_IN_LEFT + SF_IN_B, SF_IN_RIGHT + SF_IN_B,
        SF_IN_UP + SF_IN_B, SF_IN_DOWN + SF_IN_B,
        SF_IN_DOWN_LEFT + SF_IN_B, SF_IN_DOWN_RIGHT + SF_IN_B,
        SF_IN_UP_LEFT + SF_IN_B, SF_IN_UP_RIGHT + SF_IN_B,
        /* Hop toward a side or a diagonal: the first input of a wavedash
         * or a short-hop aerial. Holding the dash stick through the jump
         * keeps dash -> jump -> up+A a running up smash. */
        SF_IN_LEFT + SF_IN_JUMP, SF_IN_RIGHT + SF_IN_JUMP,
        SF_IN_UP_LEFT + SF_IN_JUMP, SF_IN_UP_RIGHT + SF_IN_JUMP,
        SF_IN_DOWN_LEFT + SF_IN_JUMP, SF_IN_DOWN_RIGHT + SF_IN_JUMP,
    };
    static const int air[] = {
        SF_IN_NONE,
        /* Double jump. The direction is part of the press. */
        SF_IN_JUMP,
        SF_IN_LEFT + SF_IN_JUMP, SF_IN_RIGHT + SF_IN_JUMP,
        SF_IN_UP + SF_IN_JUMP, SF_IN_DOWN + SF_IN_JUMP,
        SF_IN_HALF_LEFT + SF_IN_JUMP, SF_IN_HALF_RIGHT + SF_IN_JUMP,
        SF_IN_LEFT, SF_IN_RIGHT, SF_IN_UP, SF_IN_DOWN,
        SF_IN_HALF_LEFT, SF_IN_HALF_RIGHT, SF_IN_HALF_DOWN, SF_IN_HALF_UP,
        SF_IN_UP_LEFT, SF_IN_UP_RIGHT, SF_IN_DOWN_LEFT, SF_IN_DOWN_RIGHT,
        SF_IN_A, SF_IN_LEFT + SF_IN_A, SF_IN_RIGHT + SF_IN_A,
        SF_IN_UP + SF_IN_A, SF_IN_DOWN + SF_IN_A,
        SF_IN_DOWN_LEFT + SF_IN_A, SF_IN_DOWN_RIGHT + SF_IN_A,
        SF_IN_B, SF_IN_LEFT + SF_IN_B, SF_IN_RIGHT + SF_IN_B,
        SF_IN_UP + SF_IN_B, SF_IN_DOWN + SF_IN_B,
        /* Airdodge. The down diagonals are the wavedash; a low hop also
         * lands from a cardinal dodge. */
        SF_IN_WD_L, SF_IN_WD_R, SF_IN_SHIELD, SF_IN_DOWN + SF_IN_SHIELD,
        SF_IN_LEFT + SF_IN_SHIELD, SF_IN_RIGHT + SF_IN_SHIELD, SF_IN_UP + SF_IN_SHIELD,
    };
    static const int throws[] = {
        SF_IN_NONE,
        SF_IN_A,
        SF_IN_LEFT, SF_IN_RIGHT, SF_IN_UP, SF_IN_DOWN, 
    };
    /* A move that hit or reached IASA. Jump is the shine's only way out
     * before it ends, so it has to be here. */
    static const int cancel[] = {
        SF_IN_NONE,
        SF_IN_JUMP, SF_IN_LEFT + SF_IN_JUMP, SF_IN_RIGHT + SF_IN_JUMP,
        SF_IN_A, SF_IN_B, SF_IN_GRAB, SF_IN_SHIELD,
        SF_IN_LEFT, SF_IN_RIGHT, SF_IN_UP, SF_IN_DOWN,
        SF_IN_HALF_LEFT, SF_IN_HALF_RIGHT, SF_IN_HALF_DOWN, SF_IN_HALF_UP,
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

/* Bits of `want` that leave a different state than holding nothing.
 * Neutral itself is followed separately. A disc read stays in the mask
 * and is tried again when that branch is taken. */
static SfAllow actionable(const Snapshot* snap, SfAllow want, uint64_t neutral_body,
                          uint64_t neutral_fp) {
    SfAllow m = {0, 0};
    for (int c = 0; c < SF_COMBOS; c++) {
        if (c == SF_IN_NONE || !allow_has(want, c)) {
            continue;
        }
        bool outcome = s_outcome;
        SfResult r;
        uint64_t body_hash;
        uint64_t fp;
        bool ok = probe_snap(snap, c, &r, &body_hash);
        s_outcome = outcome;
        if (!ok) {
            m = allow_or(m, allow_bit(c));
            continue;
        }
        fp = fingerprint();
        if (!r.dead && !input_useless(c, body_hash, fp, neutral_body, neutral_fp)) {
            m = allow_or(m, allow_bit(c));
        }
    }
    return m;
}

static bool approach_act(int motion) {
    switch (motion) {
    case ftCo_MS_Wait:
    case ftCo_MS_WalkSlow:
    case ftCo_MS_WalkMiddle:
    case ftCo_MS_WalkFast:
    case ftCo_MS_Dash:
    case ftCo_MS_Run:
    case ftCo_MS_RunDirect:
    case ftCo_MS_Fall:
    case ftCo_MS_FallF:
    case ftCo_MS_FallB:
    case ftCo_MS_FallAerial:
    case ftCo_MS_FallAerialF:
    case ftCo_MS_FallAerialB:
    case ftCo_MS_JumpF:
    case ftCo_MS_JumpB:
    case ftCo_MS_JumpAerialF:
    case ftCo_MS_JumpAerialB:
    case ftCo_MS_Landing:
    case ftCo_MS_LandingFallSpecial:
    case ftCo_MS_Guard:
    case ftCo_MS_GuardOn:
    case ftCo_MS_KneeBend:
        return true;
    default:
        return false;
    }
}

static bool grounded_motion(int motion) {
    if (attack_motion(motion) || grabbing(motion) || attack_air(motion)) {
        return false;
    }
    /* Turn and squat can still dash. A special's animation is not an opener. */
    return approach_act(motion) || motion == ftCo_MS_Turn || motion == ftCo_MS_TurnRun ||
           motion == ftCo_MS_RunBrake || motion == ftCo_MS_Squat || motion == ftCo_MS_SquatWait ||
           motion == ftCo_MS_SquatRv || motion == ftCo_MS_GuardOff;
}

static int toward_input(void) {
    const Fighter* a = fighter_at(s_attacker, 0, NULL);
    const Fighter* v = fighter_at(s_victim, s_victim_sub, NULL);
    if (a == NULL || v == NULL || v->cur_pos.x >= a->cur_pos.x) {
        return SF_IN_RIGHT;
    }
    return SF_IN_LEFT;
}

/* Nair, uair, dair, then the two sides, in SF_MAC_SH_* / SF_MAC_FH_* order. */
static const int mac_aerial[] = {
    SF_IN_A, SF_IN_UP + SF_IN_A, SF_IN_DOWN + SF_IN_A, SF_IN_LEFT + SF_IN_A, SF_IN_RIGHT + SF_IN_A,
};

static int macro_input(const SfLine* par) {
    switch (par->macro) {
    case SF_MAC_DASH:
        return par->macro_toward != 0 ? (int)par->macro_toward : SF_IN_RIGHT;
    case SF_MAC_FULL:
        return SF_IN_JUMP;
    case SF_MAC_SHORT:
        /* Release only after the jump is out. Releasing on the ground is no hop. */
        if (par->motion == ftCo_MS_KneeBend || in_air(par->motion)) {
            return SF_IN_NONE;
        }
        return SF_IN_JUMP;
    case SF_MAC_WDL:
    case SF_MAC_WDR: {
        int wd = par->macro == SF_MAC_WDL ? SF_IN_WD_L : SF_IN_WD_R;
        if (par->macro_phase >= 2) {
            return SF_IN_NONE;
        }
        if (par->macro_phase == 1 || in_air(par->motion)) {
            return wd;
        }
        if (par->motion == ftCo_MS_KneeBend) {
            return SF_IN_NONE;
        }
        return SF_IN_JUMP;
    }
    case SF_MAC_LASER:
        return par->macro_step == 0 ? SF_IN_B : SF_IN_NONE;
    case SF_MAC_SHINE:
        return par->macro_step == 0 ? (SF_IN_DOWN + SF_IN_B) : SF_IN_NONE;
    case SF_MAC_SH_N:
    case SF_MAC_SH_U:
    case SF_MAC_SH_D:
    case SF_MAC_SH_L:
    case SF_MAC_SH_R:
        if (in_air(par->motion)) {
            return mac_aerial[par->macro - SF_MAC_SH_N];
        }
        return par->motion == ftCo_MS_KneeBend ? SF_IN_NONE : SF_IN_JUMP;
    case SF_MAC_FH_N:
    case SF_MAC_FH_U:
    case SF_MAC_FH_D:
    case SF_MAC_FH_L:
    case SF_MAC_FH_R:
        if (in_air(par->motion)) {
            return par->vy <= 0.0f ? mac_aerial[par->macro - SF_MAC_FH_N] : SF_IN_NONE;
        }
        return SF_IN_JUMP;
    case SF_MAC_DJ_N:
    case SF_MAC_DJ_U:
    case SF_MAC_DJ_D:
    case SF_MAC_DJ_L:
    case SF_MAC_DJ_R:
        return par->macro_step == 0 ? SF_IN_JUMP : mac_aerial[par->macro - SF_MAC_DJ_N];
    case SF_MAC_AJ_N:
    case SF_MAC_AJ_U:
    case SF_MAC_AJ_D:
    case SF_MAC_AJ_L:
    case SF_MAC_AJ_R:
    case SF_MAC_FJ_N:
    case SF_MAC_FJ_U:
    case SF_MAC_FJ_D:
    case SF_MAC_FJ_L:
    case SF_MAC_FJ_R: {
        bool apex = par->macro <= SF_MAC_AJ_R;
        int base = apex ? SF_MAC_AJ_N : SF_MAC_FJ_N;
        if (par->macro_phase == 1) {
            return mac_aerial[par->macro - base];
        }
        /* Phase 2 has been airborne. Landing first ends the script; it
         * does not jump again from the ground. Grounded, not in_air: this
         * can start in an aerial's interrupt window. */
        if (par->grounded) {
            return par->macro_phase == 2 ? SF_IN_NONE : SF_IN_JUMP;
        }
        return par->vy <= (apex ? 0.0f : SF_FALL_VY) ? SF_IN_JUMP : SF_IN_NONE;
    }
    default:
        return SF_IN_NONE;
    }
}

static bool wavedash_landed(int motion) {
    const Fighter* a = fighter_at(s_attacker, 0, NULL);
    if (a == NULL || a->ground_or_air != GA_Ground) {
        return false;
    }
    if (motion == ftCo_MS_EscapeAir || jump_air(motion)) {
        return false;
    }
    return true;
}

static void mac_prepare(const SfLine* par, int combo, int motion) {
    uint8_t id = par->macro;
    uint8_t step = (uint8_t)(par->macro_step + 1);
    uint8_t phase = par->macro_phase;
    bool done = false;
    if (id == SF_MAC_WDL || id == SF_MAC_WDR) {
        int wd = id == SF_MAC_WDL ? SF_IN_WD_L : SF_IN_WD_R;
        /* Still in the hop: the diagonal shield was early. Try again. */
        if (combo == wd && !jump_air(motion)) {
            phase = 2;
        } else if (phase < 2 && in_air(motion)) {
            phase = 1;
        }
        if (phase == 2 && wavedash_landed(motion)) {
            done = true;
        }
    } else if (id == SF_MAC_SHORT || id == SF_MAC_FULL) {
        bool left_squat = par->motion == ftCo_MS_KneeBend && motion != ftCo_MS_KneeBend;
        bool hopped = step >= 1 && in_air(motion) && motion != ftCo_MS_KneeBend;
        if (left_squat || hopped) {
            done = true;
        }
    } else if (id >= SF_MAC_SH_N && id <= SF_MAC_SH_R) {
        if (in_air(par->motion)) {
            done = true;
        }
    } else if (id >= SF_MAC_FH_N && id <= SF_MAC_FH_R) {
        if (in_air(par->motion) && par->vy <= 0.0f) {
            done = true;
        }
    } else if (id >= SF_MAC_DJ_N && id <= SF_MAC_DJ_R) {
        if (step >= 2) {
            done = true;
        }
    } else if (id >= SF_MAC_AJ_N && id <= SF_MAC_FJ_R) {
        const Fighter* a = fighter_at(s_attacker, 0, NULL);
        bool airborne = a != NULL && a->ground_or_air != GA_Ground;
        if (phase == 1) {
            done = true;
        } else if (combo == SF_IN_JUMP && !par->grounded) {
            phase = 1;
        } else if (airborne) {
            phase = 2;
        } else if (phase == 2) {
            done = true;
        }
    } else if (id == SF_MAC_DASH) {
        if (step >= SF_MAC_DASH_FRAMES && approach_act(motion)) {
            done = true;
        }
    } else if (id == SF_MAC_LASER || id == SF_MAC_SHINE) {
        if (step >= 1 && approach_act(motion) && motion != ftCo_MS_KneeBend) {
            done = true;
        }
    }
    if (step >= SF_MAC_LIMIT) {
        done = true;
    }
    s_mac_script = true;
    s_mac_done = done;
    /* Id stays set on the last frame so select keeps that one snapshot. */
    s_mac_id = id;
    s_mac_step = done ? 0 : step;
    s_mac_phase = done ? 0 : phase;
    s_mac_toward = par->macro_toward;
}

static void dfs_finish(void) {
    s_top = -1;
    s_searched = s_horizon;
    qsort(s_hof, (size_t)s_hof_n, sizeof s_hof[0], hof_cmp);
    s_verify_i = 0;
    s_phase = PH_VERIFY;
}

static void dfs_pop(void) {
    SfNode* n = &s_path[s_top];
    if (s_top > 0) {
        SfNode* p = &s_path[s_top - 1];
        if (n->best > p->best) {
            p->best = n->best;
        }
        if (n->best > p->val[p->cur]) {
            p->val[p->cur] = (int16_t)n->best;
        }
    }
    s_top--;
    if (s_top < 0) {
        dfs_finish();
    }
}

static int kid_value(const SfResult* r) {
    if (r->dead) {
        return 0;
    }
    return r->ko ? SF_KO_VALUE : r->dmg;
}

static uint64_t seen_key(uint64_t fp, const SfLine* l) {
    uint8_t f[12] = {
        l->attack, l->connected, l->hit_seen, l->gap, l->commit, l->lcancel,
        l->macro, l->macro_step, l->macro_phase, l->squat, l->iasa, l->lag,
    };
    uint64_t k = fp ^ (XXH3_64bits(f, sizeof f) * 0x9E3779B97F4A7C15ull);
    return k != 0 ? k : 1;
}

/* False when this state was already walked from an earlier or equal frame
 * with at least this budget. */
static bool seen_fresh(uint64_t key, int len, uint32_t budget) {
    uint32_t mask = (1u << SF_SEEN_BITS) - 1u;
    uint32_t i = (uint32_t)key & mask;
    for (int p = 0; p < 8; p++, i = (i + 1u) & mask) {
        SfSeen* e = &s_seen[i];
        if (e->key == key && e->len <= len && e->budget >= budget) {
            return false;
        }
        if (e->key == key || e->key == 0) {
            *e = (SfSeen){key, budget, (uint16_t)len};
            return true;
        }
    }
    s_seen[(uint32_t)key & mask] = (SfSeen){key, budget, (uint16_t)len};
    return true;
}

static int with_lcancel(const SfLine* l, int combo) {
    if (!attack_air(l->motion) || (combo % SF_BTN) != SF_IN_NONE) {
        return combo;
    }
    if (l->lcancel != 0 && l->lcancel < SF_LCANCEL_PULSE) {
        return combo;
    }
    return combo + SF_IN_SHIELD;
}

/* The last stick, buttons released. A jump is held until the squat ends:
 * letting go on any squat frame is a short hop, and those have their own
 * macros. */
static int default_kid(const SfLine* l) {
    int last = l->len > 0 ? l->seq[l->len - 1] : SF_IN_NONE;
    if (l->motion == ftCo_MS_KneeBend && (last % SF_BTN) == SF_IN_JUMP) {
        return last;
    }
    return (last / SF_BTN) * SF_BTN;
}

static int default_input(const SfLine* l) {
    return with_lcancel(l, default_kid(l));
}

static SfAllow ration(const SfLine* l, SfAllow want) {
    if (l->age % SF_STICK_EVERY == 0) {
        return want;
    }
    int last = l->len > 0 ? l->seq[l->len - 1] / SF_BTN : 0;
    for (int dir = 0; dir < SF_DIRECTIONS; dir++) {
        int c = dir * SF_BTN;
        if (dir == last || (l->apex && c == SF_IN_DOWN)) {
            continue;
        }
        if (c < 64) {
            want.lo &= ~(1ull << c);
        } else {
            want.hi &= ~(1ull << (c - 64));
        }
    }
    return want;
}

static void kid_add(SfNode* n, int kid) {
    for (int i = 0; i < n->nkid; i++) {
        if (n->kid[i] == kid) {
            return;
        }
    }
    n->kid[n->nkid] = (uint8_t)kid;
    n->val[n->nkid] = 0;
    n->nkid++;
}

static bool node_open(SfNode* n, bool wide) {
    const SfLine* par = &n->line;
    n->nkid = 0;
    n->dkid = (uint8_t)default_kid(par);
    if (par->macro != SF_MAC_NONE) {
        kid_add(n, SF_KID_SCRIPT);
        return true;
    }
    bool squat = par->motion == ftCo_MS_KneeBend;
    bool guard = par->motion == ftCo_MS_Guard || par->motion == ftCo_MS_GuardOn;
    bool aerial = attack_air(par->motion);
    /* Startup, before this move hits and before the interrupt window, cannot
     * be cancelled. A grab still throws; the attack check is for moves.
     * Damage from an earlier move does not count: holding A through a
     * smash's startup is only charge. */
    bool cancellable = !par->attack || grabbing(par->motion) || par->connected || par->iasa;
    if (!wide || par->lag || (!squat && !guard && !aerial && !cancellable)) {
        if (wide) {
            s_n_locked++;
        }
        kid_add(n, n->dkid);
        return true;
    }
    SfResult r;
    uint64_t body_hash;
    if (!probe_snap(node_snap(n), with_lcancel(par, SF_IN_NONE), &r, &body_hash)) {
        return false;
    }
    n->neutral_fp = fingerprint();
    n->neutral_body = body_hash;
    n->baseline = true;
    SfAllow want;
    bool probe = false;
    if (squat || guard) {
        /* Jumpsquat. Releasing jump is a short hop. Holding it through
         * the squat is a full hop. Up plus A is an up smash, which the
         * squat accepts before the jump leaves the ground. Left and
         * right are the jump's horizontal speed. Shield can jump, grab,
         * or special, which is up smash, up B, and shine out of shield. */
        if (squat) {
            static const int squat_in[] = {
                SF_IN_NONE, SF_IN_JUMP, SF_IN_A,
                SF_IN_UP + SF_IN_A, SF_IN_DOWN + SF_IN_A,
                SF_IN_UP + SF_IN_B, SF_IN_DOWN + SF_IN_B,
                SF_IN_LEFT, SF_IN_LEFT + SF_IN_JUMP, SF_IN_LEFT + SF_IN_A,
                SF_IN_RIGHT, SF_IN_RIGHT + SF_IN_JUMP, SF_IN_RIGHT + SF_IN_A,
                SF_IN_HALF_LEFT, SF_IN_HALF_LEFT + SF_IN_JUMP, SF_IN_HALF_LEFT + SF_IN_A,
                SF_IN_HALF_RIGHT, SF_IN_HALF_RIGHT + SF_IN_JUMP, SF_IN_HALF_RIGHT + SF_IN_A,
                /* Last squat frame is already airborne for the next input. */
                SF_IN_UP_LEFT, SF_IN_UP_RIGHT, SF_IN_DOWN_LEFT, SF_IN_DOWN_RIGHT,
                SF_IN_DOWN_LEFT + SF_IN_JUMP, SF_IN_DOWN_RIGHT + SF_IN_JUMP,
                SF_IN_UP_LEFT + SF_IN_JUMP, SF_IN_UP_RIGHT + SF_IN_JUMP,
                SF_IN_WD_L, SF_IN_WD_R, SF_IN_SHIELD, SF_IN_DOWN + SF_IN_SHIELD,
                SF_IN_LEFT + SF_IN_SHIELD, SF_IN_RIGHT + SF_IN_SHIELD,
                SF_IN_B, SF_IN_LEFT + SF_IN_B, SF_IN_RIGHT + SF_IN_B,
                SF_IN_DOWN_LEFT + SF_IN_A, SF_IN_DOWN_RIGHT + SF_IN_A,
            };
            want = allow_bits(squat_in, sizeof squat_in / sizeof squat_in[0]);
        } else {
            static const int shield[] = {
                SF_IN_NONE, SF_IN_JUMP, SF_IN_GRAB, SF_IN_A, SF_IN_UP + SF_IN_A, SF_IN_UP + SF_IN_B,
                SF_IN_UP,
            };
            want = allow_bits(shield, sizeof shield / sizeof shield[0]);
        }
    } else if (aerial) {
        /* Drift. Neutral keeps the aerial. Half sticks are the slower
         * drift. L is pressed for every input by with_lcancel. */
        static const int drift[] = {
            SF_IN_NONE, SF_IN_LEFT, SF_IN_RIGHT, SF_IN_UP, SF_IN_DOWN,
            SF_IN_HALF_LEFT, SF_IN_HALF_RIGHT, SF_IN_HALF_UP, SF_IN_HALF_DOWN,
        };
        want = allow_bits(drift, sizeof drift / sizeof drift[0]);
        /* The interrupt window is the only time a second aerial can
         * come out before landing. That is Marth's double fair. */
        if (par->iasa) {
            static const int again[] = {
                SF_IN_GRAB, SF_IN_LEFT + SF_IN_GRAB, SF_IN_RIGHT + SF_IN_GRAB,
                SF_IN_UP + SF_IN_GRAB, SF_IN_DOWN + SF_IN_GRAB,
            };
            want = allow_or(want, allow_bits(again, sizeof again / sizeof again[0]));
        }
    } else {
        want = state_actions(par->motion, par->attack);
        probe = true;
    }
    want = ration(par, want);
    if (probe) {
        bool outcome = s_outcome;
        want = actionable(node_snap(n), want, n->neutral_body, n->neutral_fp);
        s_outcome = outcome;
    }
    kid_add(n, n->dkid);
    kid_add(n, SF_IN_NONE);
    for (int c = 1; c < SF_COMBOS; c++) {
        if (allow_has(want, c)) {
            kid_add(n, c);
        }
    }
    /* Hops and wavedashes are scripted, so the jump release and the
     * airdodge frame are not left to chance. Anywhere jump works. */
    if (par->grounded && !squat && !aerial && !grabbing(par->motion) &&
        (guard || allow_has(want, SF_IN_JUMP)))
    {
        if (par->len == 0 && !par->attack && grounded_motion(par->motion)) {
            kid_add(n, SF_KID_MACRO + SF_MAC_DASH);
            kid_add(n, SF_KID_MACRO + SF_MAC_LASER);
            kid_add(n, SF_KID_MACRO + SF_MAC_SHINE);
        }
        kid_add(n, SF_KID_MACRO + SF_MAC_SHORT);
        kid_add(n, SF_KID_MACRO + SF_MAC_FULL);
        for (int m = SF_MAC_SH_N; m <= SF_MAC_FH_R; m++) {
            kid_add(n, SF_KID_MACRO + m);
        }
        if (par->jumps + 1 < par->max_jumps) {
            for (int m = SF_MAC_AJ_N; m <= SF_MAC_FJ_R; m++) {
                kid_add(n, SF_KID_MACRO + m);
            }
        }
        kid_add(n, SF_KID_MACRO + SF_MAC_WDL);
        kid_add(n, SF_KID_MACRO + SF_MAC_WDR);
    }
    /* A bare double jump presses nothing after it, so its playout never
     * shows a hit. Out of an aerial only once its interrupt window opens.
     * Not from the jump list: rationing drops a neutral stick jump on most
     * frames. A jump held from the last frame is no new press. */
    bool held = par->len > 0 && par->seq[par->len - 1] % SF_BTN == SF_IN_JUMP;
    if (!par->grounded && !squat && !held && !grabbing(par->motion) &&
        par->jumps < par->max_jumps && (!aerial || par->iasa) && (aerial || cancellable))
    {
        for (int m = SF_MAC_DJ_N; m <= SF_MAC_DJ_R; m++) {
            kid_add(n, SF_KID_MACRO + m);
        }
    }
    /* Waiting for the apex or the fall. Offered once per motion, not on
     * every frame of the wait, since each start reaches the same jump. */
    if (!par->grounded && !squat && !grabbing(par->motion) && par->jumps < par->max_jumps &&
        (aerial ? par->iasa : (cancellable && par->age == 0)))
    {
        if (par->vy > 0.0f) {
            for (int m = SF_MAC_AJ_N; m <= SF_MAC_AJ_R; m++) {
                kid_add(n, SF_KID_MACRO + m);
            }
        }
        if (par->vy > SF_FALL_VY) {
            for (int m = SF_MAC_FJ_N; m <= SF_MAC_FJ_R; m++) {
                kid_add(n, SF_KID_MACRO + m);
            }
        }
    }
    if (n->nkid <= 2) {
        s_n_locked++;
    }
    return true;
}

enum { KID_OK, KID_DROP, KID_USELESS, KID_IO };

/* One tick of a child from this frame's snapshot. */
static int kid_step(SfNode* n, int kid, SfLine* out, SfResult* r, uint64_t* fp, bool prune) {
    SfLine par = n->line;
    bool scripted = kid >= SF_KID_MACRO;
    int combo;
    if (kid == SF_KID_SCRIPT) {
        combo = macro_input(&par);
    } else if (scripted) {
        par.macro = (uint8_t)(kid - SF_KID_MACRO);
        par.macro_step = 0;
        par.macro_phase = 0;
        par.macro_toward = s_root_toward;
        combo = macro_input(&par);
    } else {
        combo = with_lcancel(&par, kid);
    }
    uint64_t body_hash;
    if (!probe_snap(node_snap(n), combo, r, &body_hash)) {
        return KID_IO;
    }
    *fp = fingerprint();
    SfBody b = read_body(par.motion, r->motion);
    if (scripted) {
        mac_prepare(&par, combo, b.motion);
    } else if (prune && n->baseline &&
               input_useless(kid, body_hash, *fp, n->neutral_body, n->neutral_fp))
    {
        s_n_pruned++;
        return KID_USELESS;
    }
    return edge_line(&par, combo, r, &b, out) == EDGE_PUSH ? KID_OK : KID_DROP;
}

static uint16_t victim_dist(void) {
    const Fighter* a = fighter_at(s_attacker, 0, NULL);
    const Fighter* v = fighter_at(s_victim, s_victim_sub, NULL);
    if (a == NULL || v == NULL) {
        return UINT16_MAX;
    }
    float dx = v->cur_pos.x - a->cur_pos.x;
    float dy = v->cur_pos.y - a->cur_pos.y;
    float d = (dx < 0.0f ? -dx : dx) + (dy < 0.0f ? -dy : dy);
    return d < (float)UINT16_MAX ? (uint16_t)d : UINT16_MAX;
}

/* Play a child out with its default input for a few frames. Damage on the
 * way is recorded like any other line. Returns the best value reached;
 * *alive is false when the child is not worth following. *dist is the
 * closest the attacker got to the victim. */
static bool sample_kid(SfNode* n, int kid, int* value, bool* alive, uint16_t* dist) {
    SfLine line;
    SfResult r;
    uint64_t fp;
    *dist = UINT16_MAX;
    int e = kid_step(n, kid, &line, &r, &fp, true);
    if (e == KID_IO) {
        return false;
    }
    *alive = e == KID_OK;
    *value = e == KID_USELESS ? 0 : kid_value(&r);
    if (e != KID_OK) {
        return true;
    }
    /* Another stick angle into the same move: one child is enough. */
    uint64_t key = seen_key(state_key(), &line);
    n->key[n->ki] = key;
    for (int i = 0; i < n->ki; i++) {
        if (n->val[i] >= 0 && n->key[i] == key) {
            s_n_pruned++;
            *alive = false;
            return true;
        }
    }
    *dist = victim_dist();
    /* A script plays to its end, then the usual playout: an apex double
     * jump is past a plain playout's last frame. */
    int tail = SF_PLAYOUT;
    for (int i = 1; i < tail && i < SF_PLAYOUT + SF_MAC_LIMIT; i++) {
        bool mac = line.macro != SF_MAC_NONE;
        if (mac) {
            tail = i + SF_PLAYOUT;
        }
        int combo = mac ? macro_input(&line) : default_input(&line);
        uint64_t body_hash;
        if (!step_tick(combo, &r, &body_hash)) {
            break;
        }
        SfBody b = read_body(line.motion, r.motion);
        if (mac) {
            mac_prepare(&line, combo, b.motion);
        }
        SfLine next;
        int edge = edge_line(&line, combo, &r, &b, &next);
        if (kid_value(&r) > *value) {
            *value = kid_value(&r);
        }
        uint16_t d = victim_dist();
        if (d < *dist) {
            *dist = d;
        }
        if (edge != EDGE_PUSH) {
            break;
        }
        line = next;
    }
    return true;
}

/* Dead children out, then best first. Equal values keep their order, so
 * the default input leads a tie. */
static void rank_kids(SfNode* n) {
    int m = 0;
    for (int i = 0; i < n->nkid; i++) {
        if (n->val[i] >= 0) {
            n->kid[m] = n->kid[i];
            n->val[m] = n->val[i];
            n->dist[m] = n->dist[i];
            m++;
        }
    }
    n->nkid = (uint8_t)m;
    for (int i = 1; i < m; i++) {
        for (int j = i; j > 0 && n->val[j] > n->val[j - 1]; j--) {
            uint8_t k = n->kid[j];
            int16_t v = n->val[j];
            uint16_t d = n->dist[j];
            n->kid[j] = n->kid[j - 1];
            n->val[j] = n->val[j - 1];
            n->dist[j] = n->dist[j - 1];
            n->kid[j - 1] = k;
            n->val[j - 1] = v;
            n->dist[j - 1] = d;
        }
    }
}

/* Damage a child added in its playout counts by its square, so one hit
 * draws most of the budget. Waiting is always worth a share. Closing on
 * the victim faster than the default input counts too: a full hop and
 * double jump to a high victim hits nothing for many more frames than a
 * playout lasts. */
static uint64_t kid_weight(const SfNode* n, int k) {
    int gain = n->val[k] - n->line.dmg;
    if (gain < 0) {
        gain = 0;
    }
    if (gain > 60) {
        gain = 60;
    }
    uint64_t w = 1 + 4ull * (uint64_t)(gain * gain);
    int closer = n->dref == UINT16_MAX ? 0 : (int)n->dref - (int)n->dist[k];
    if (closer > SF_CLOSE_MAX) {
        closer = SF_CLOSE_MAX;
    }
    if (closer > 0) {
        w += (uint64_t)(closer * closer) / 4;
    }
    if (n->kid[k] == n->dkid) {
        w += n->nkid;
    }
    return w;
}

static void explore_next(SfNode* n) {
    while (n->ki < n->nkid) {
        int64_t left = (int64_t)n->budget - (int64_t)(s_n_trials - n->t0);
        if (left <= 0 || (n->nkid > 1 && left < SF_EXPAND_MIN)) {
            break;
        }
        int k = n->ki;
        uint64_t share = (uint64_t)left;
        if (n->nkid > 1) {
            uint64_t sum = 0;
            for (int j = k; j < n->nkid; j++) {
                sum += kid_weight(n, j);
            }
            /* A quarter is split evenly, so a child whose playout missed
             * still gets looked at when the budget is large. */
            uint64_t rest = (uint64_t)(n->nkid - k);
            share = (uint64_t)left * 3 * kid_weight(n, k) / (4 * sum) + (uint64_t)left / (4 * rest);
            if (share < SF_EXPAND_MIN) {
                n->ki++;
                continue;
            }
        }
        SfLine child;
        SfResult r;
        uint64_t fp;
        int e = kid_step(n, n->kid[k], &child, &r, &fp, false);
        if (e == KID_IO) {
            return;
        }
        n->ki++;
        if (e != KID_OK) {
            return;
        }
        if (!seen_fresh(seen_key(state_key(), &child), child.len, (uint32_t)share)) {
            s_n_pruned++;
            return;
        }
        n->cur = (uint8_t)k;
        if (push_child(&child, (uint32_t)share, kid_value(&r)) == EDGE_RETRY) {
            n->ki--;
        }
        return;
    }
    dfs_pop();
}

static void dfs_one(void) {
    if (s_top < 0) {
        dfs_finish();
        return;
    }
    SfNode* n = &s_path[s_top];
    if (n->stage == SN_NEW) {
        int64_t left = (int64_t)n->budget - (int64_t)(s_n_trials - n->t0);
        if (!node_open(n, left >= SF_EXPAND_MIN)) {
            return;
        }
        n->ki = 0;
        n->stage = n->nkid > 1 ? SN_SAMPLE : SN_EXPLORE;
        return;
    }
    if (n->stage == SN_SAMPLE) {
        if (n->ki < n->nkid) {
            int value = 0;
            bool alive = false;
            uint16_t dist;
            if (!sample_kid(n, n->kid[n->ki], &value, &alive, &dist)) {
                return;
            }
            n->val[n->ki] = (int16_t)(alive ? value : -1);
            n->dist[n->ki] = dist;
            if (n->ki == 0) {
                n->dref = dist;
            }
            if (value > n->best) {
                n->best = value;
            }
            n->ki++;
            return;
        }
        rank_kids(n);
        {
            static int dbg;
            if (getenv("MELEE_SF_DEBUG") != NULL && dbg++ < 400) {
                char b[160];
                int p = 0;
                for (int i = 0; i < n->nkid && i < 12 && p < 140; i++) {
                    p += snprintf(b + p, sizeof b - (size_t)p, " %d:%d", n->kid[i], n->val[i]);
                }
                b[p < 160 ? p : 159] = '\0';
                pc_log_line("sfdbg len %d motion %d grd %d atk %d dmg %d left %lld kids %d:%s",
                    n->line.len, n->line.motion, n->line.grounded, n->line.attack, n->line.dmg,
                    (long long)((int64_t)n->budget - (int64_t)(s_n_trials - n->t0)), n->nkid, b);
            }
        }
        n->ki = 0;
        n->stage = SN_EXPLORE;
        return;
    }
    explore_next(n);
}

/* The menu's order: KO then damage, or longest first with damage breaking
 * ties. */
static bool listed_before(const SfLine* a, const SfLine* b) {
    if (s_view.sort_length && a->len != b->len) {
        return a->len > b->len;
    }
    return line_better(a, b);
}

/* A star KO is learned during verification, after the list was ordered, so
 * the published rows are ordered again. The cursor stays on its line. */
static void sort_listed(void) {
    for (int i = 1; i < s_view.nlines; i++) {
        int j = i;
        while (j > 0 && listed_before(&s_lines[j], &s_lines[j - 1])) {
            SfLine line = s_lines[j];
            s_lines[j] = s_lines[j - 1];
            s_lines[j - 1] = line;
            char row[sizeof s_view.lines[0]];
            memcpy(row, &s_view.lines[j], sizeof row);
            memcpy(&s_view.lines[j], &s_view.lines[j - 1], sizeof row);
            memcpy(&s_view.lines[j - 1], row, sizeof row);
            if (s_view.cursor == j) {
                s_view.cursor = j - 1;
            } else if (s_view.cursor == j - 1) {
                s_view.cursor = j;
            }
            j--;
        }
    }
}

static void list_line(const SfLine* l) {
    char text[PC_SF_LINE_TEXT];
    if (!line_spans(l)) {
        return;
    }
    format_line(text, sizeof text, l);
    if (s_view.nlines >= PC_SF_LINES) {
        return;
    }
    for (int i = 0; i < s_view.nlines; i++) {
        /* Same label and the same starter. A different opening stays even
         * when the hit names alone would have matched. */
        if (strcmp(s_view.lines[i].text, text) == 0 && opening_same(&s_lines[i], l)) {
            return;
        }
    }
    int n = s_view.nlines++;
    snprintf(s_view.lines[n].text, sizeof s_view.lines[n].text, "%s", text);
    s_view.lines[n].dmg = l->dmg;
    s_view.lines[n].frames = l->len;
    s_view.lines[n].ko = l->ko;
    s_view.lines[n].moves = line_moves(l);
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
        dfs_one();
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
    for (int i = 0; i <= SF_HORIZON_MAX; i++) {
        snap_free(&s_path[i].snap);
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
    if (!pc_sf_line_shown(s_view.cursor)) {
        pc_sf_cursor_step(1);
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
                    "(%d percent), horizon %d, depth first",
            gm_GetFrameCount(), s_attacker, a->cur_pos.x, a->cur_pos.y, s_victim, v->cur_pos.x,
            v->cur_pos.y, s_base_pct, s_horizon);
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

/* The walk is still going. Raising the horizon lets the current line and
 * every branch not yet taken run further. A finished search starts over. */
static bool extend_horizon(int h) {
    if (s_phase != PH_EXPAND || s_top < 0) {
        return false;
    }
    hof_compact();
    uint32_t more = (uint32_t)(SF_TRIALS_PER_FRAME * (h - s_horizon));
    s_budget += more;
    s_path[0].budget += more;
    s_horizon = h;
    s_view.horizon = h;
    pc_log_line("sf: horizon %d, still on frame %d", h, s_top >= 0 ? s_path[s_top].line.len : 0);
    return true;
}

/* Menu labels, in the same order opening_prefix writes them. */
static int opening_bucket(const SfLine* l) {
    int wd = (l->approach & AP_WD) != 0;
    int dash = (l->approach & AP_DASH) != 0;
    int sh = (l->approach & AP_SHORT) != 0;
    int fh = (l->approach & AP_FULL) != 0;
    if (wd && sh && !fh) {
        sh = 0;
    }
    if (wd) {
        return 6;
    }
    if (dash && sh && fh) {
        return 7;
    }
    if (dash && sh) {
        return 4;
    }
    if (dash && fh) {
        return 5;
    }
    if (dash) {
        return 1;
    }
    if (sh && fh) {
        return 7;
    }
    if (sh) {
        return 2;
    }
    if (fh) {
        return 3;
    }
    return 0;
}

static void log_openings(void) {
    static const char* name[] = {
        "standing", "dash", "short hop", "full hop", "dash short hop", "dash full hop", "wavedash",
        "short and full hop",
    };
    int count[8] = {0};
    int nopen = 0;
    char buf[192];
    size_t pos = 0;
    buf[0] = '\0';
    for (int i = 0; i < s_view.nlines; i++) {
        int seen = 0;
        int bucket = opening_bucket(&s_lines[i]);
        if (bucket >= 0 && bucket < 8) {
            count[bucket]++;
        }
        for (int j = 0; j < i; j++) {
            if (opening_same(&s_lines[j], &s_lines[i])) {
                seen = 1;
                break;
            }
        }
        if (!seen) {
            nopen++;
        }
    }
    for (int k = 0; k < 8; k++) {
        int n;
        if (count[k] == 0) {
            continue;
        }
        n = snprintf(buf + pos, sizeof buf - pos, "%s%s %d", pos ? ", " : "", name[k], count[k]);
        if (n < 0 || pos + (size_t)n >= sizeof buf) {
            break;
        }
        pos += (size_t)n;
    }
    pc_log_line("sf: %d listed, %d openings%s%s", s_view.nlines, nopen, pos ? ": " : "", buf);
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
        if (s_phase == PH_EXPAND) {
            dfs_finish();
        } else {
            to_menu("stopped, left right searches again");
            return PC_SF_YIELD;
        }
    } else {
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
        log_openings();
        for (int i = 0; i < s_view.nlines; i++) {
            pc_log_line("sf: line %d: %d frames, %s, %s %d", i + 1, s_view.lines[i].frames,
                s_view.lines[i].text, s_view.lines[i].ko ? "KO" : "plus", s_view.lines[i].dmg);
        }
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
    static int at = -2, step, line, wait, after_load;
    if (at == -2) {
        const char* e = getenv("MELEE_SF_TEST");
        after_load = e != NULL && strcmp(e, "load") == 0;
        at = after_load ? -3 : (e != NULL ? atoi(e) : -1);
    }
    if ((at < 0 && !after_load) || pc_net_active() || step >= 6) {
        return;
    }
    uint16_t press = 0;
    if (wait > 0) {
        wait--;
    } else if (step == 0 && s_state == PC_SF_IDLE &&
               (after_load ? pc_savestate_frames_since_load() >= 20
                           : gm_GetFrameCount() >= (u32)at)) {
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
        pc_log_line("sf test: %d unique", s_view.nlines);
        if (after_load) {
            pc_exit_requested = true;
            step = 6;
            return;
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
     * to the new horizon. */
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
    int step = dir > 0 ? 1 : s_view.nlines - 1;
    int c = s_view.cursor;
    for (int i = 0; i < s_view.nlines; i++) {
        c = (c + step) % s_view.nlines;
        if (pc_sf_line_shown(c)) {
            s_view.cursor = c;
            return;
        }
    }
}

bool pc_sf_line_shown(int i) {
    if (i < 0 || i >= s_view.nlines) {
        return false;
    }
    return s_view.filter == 0 || (s_view.lines[i].moves & (1u << (s_view.filter - 1))) != 0;
}

const char* pc_sf_move_label(int bit) {
    return bit >= 0 && bit < SF_MOVE_LABELS ? s_move_labels[bit] : "None";
}

/* Steps through None and each move some listed line has, in label order.
 * The cursor lands on the first line that shows. */
void pc_sf_filter_step(int dir) {
    if (s_state != PC_SF_MENU) {
        return;
    }
    unsigned present = 0;
    for (int i = 0; i < s_view.nlines; i++) {
        present |= s_view.lines[i].moves;
    }
    int f = s_view.filter;
    for (int i = 0; i <= SF_MOVE_LABELS; i++) {
        f = (f + (dir > 0 ? 1 : SF_MOVE_LABELS)) % (SF_MOVE_LABELS + 1);
        if (f == 0 || (present & (1u << (f - 1))) != 0) {
            break;
        }
    }
    s_view.filter = f;
    s_view.cursor = s_view.nlines - 1;
    pc_sf_cursor_step(1);
}

void pc_sf_sort_toggle(void) {
    if (s_state != PC_SF_MENU) {
        return;
    }
    s_view.sort_length = !s_view.sort_length;
    sort_listed();
}

void pc_sf_play(void) {
    if (s_state != PC_SF_MENU || !pc_sf_line_shown(s_view.cursor)) {
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
