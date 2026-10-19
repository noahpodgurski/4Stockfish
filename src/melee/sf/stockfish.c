#include "stockfish.h"

#include <dolphin/gx.h>
#include <dolphin/mtx.h>
#include <melee/ft/fighter.h>
#include <melee/ft/inlines.h>
#include <melee/gm/gm_1601.h>
#include <melee/gm/gmpause.h>
#include <melee/gm/gmscene.h>
#include <melee/gm/gmvs.h>
#include <melee/gm/types.h>
#include <melee/gr/ground.h>
#include <melee/if/ifall.h>
#include <melee/if/iftime.h>
#include <melee/mn/types.h>
#include <melee/pl/player.h>
#include <sysdolphin/baselib/cobj.h>
#include <sysdolphin/baselib/controller.h>
#include <sysdolphin/baselib/gobj.h>
#include <sysdolphin/baselib/gobjgxlink.h>
#include <sysdolphin/baselib/gobjproc.h>
#include <sysdolphin/baselib/rumble.h>
#include <sysdolphin/baselib/sislib.h>
#include <sysdolphin/baselib/state.h>

#include "pc/sf_search.h"

/**
 * 4stockfish
 *
 * Start pauses the match and searches ahead from that frame; the engine is
 * pc/sf_search.c. This file watches for the pause, reads the menu's pad and
 * draws. Every number shown came from a simulation of the running game.
 * Up and down move, A plays a line, left and right change the horizon,
 * L and R change how long a line may wait after hitstun.
 */

static const char* sf_kind_name[Ft_Kind_Max] = {
    "Mario",  "Fox",      "Falcon", "DK",     "Kirby",  "Bowser", "Link",
    "Sheik",  "Ness",     "Peach",  "Popo",   "Nana",   "Pika",   "Samus",
    "Yoshi",  "Puff",     "Mewtwo", "Luigi",  "Marth",  "Zelda",  "YLink",
    "Doc",    "Falco",    "Pichu",  "GnW",    "Ganon",  "Roy",    "MasterH",
    "CrazyH", "Boy",      "Girl",   "Giga",   "Sandbag",
};

static u32 sf_last_frame;
static HSD_Text* sf_text;
static int sf_text_ready;
static int sf_text_shown;
static HSD_GObj* sf_menu_gobj;
static int sf_was_paused;
static int sf_stick_lock;
static int sf_panel;
static int sf_panel_rows;
static int sf_bar; ///< progress bar, 0..1000, or -1 for none
static int sf_rule_row; ///< row under the frames line, or -1

static const char* sf_name(int kind)
{
    if (kind < 0 || kind >= Ft_Kind_Max) {
        return "Fighter";
    }
    return sf_kind_name[kind];
}

static void sf_ensure_text(void)
{
    int font;
    int ctx;

    if (sf_text_ready) {
        return;
    }
    if (HSD_SisLib_804D1124[0] != NULL) {
        font = 0;
    } else if (HSD_SisLib_804D1124[2] != NULL) {
        font = 2;
    } else {
        return;
    }
    ctx = HSD_SisLib_803A611C(font, NULL, 9, 20, 0, 14, 0, 18);
    sf_text = HSD_SisLib_803A6754(font, ctx);
    if (sf_text == NULL) {
        return;
    }
    sf_text_ready = 1;
}

static void sf_style_text(void)
{
    sf_text->x34.x = 0.4F;
    sf_text->x34.y = 0.4F;
    sf_text->text_color.r = 255;
    sf_text->text_color.g = 255;
    sf_text->text_color.b = 255;
    sf_text->text_color.a = 255;
}

static void sf_hide(void)
{
    sf_panel = 0;
    if (!sf_text_shown || !sf_text_ready || sf_text == NULL) {
        return;
    }
    HSD_SisLib_803A7664(sf_text);
    sf_text_shown = 0;
}

static void sf_quad(float x0, float y0, float x1, float y1, u8 grey, u8 alpha)
{
    GXBegin(GX_QUADS, GX_VTXFMT0, 4);
    GXPosition3f32(x0, y0, 0.0F);
    GXColor4u8(grey, grey, grey, alpha);
    GXPosition3f32(x1, y0, 0.0F);
    GXColor4u8(grey, grey, grey, alpha);
    GXPosition3f32(x1, y1, 0.0F);
    GXColor4u8(grey, grey, grey, alpha);
    GXPosition3f32(x0, y1, 0.0F);
    GXColor4u8(grey, grey, grey, alpha);
    GXEnd();
}

static void sf_draw_panel(HSD_GObj* gobj, intptr_t pass)
{
    HSD_CObj* cobj;
    Mtx view;
    float bar_y;

    (void) gobj;
    /* Pass 2 is the overlay camera. Drawing on the other passes
     * desyncs the graphics fifo and corrupts the next animation. */
    if (!sf_panel || pass != 2) {
        return;
    }
    cobj = HSD_CObjGetCurrent();
    if (cobj == NULL) {
        return;
    }
    HSD_CObjGetViewingMtx(cobj, view);
    GXLoadPosMtxImm(view, 0);
    GXSetCurrentMtx(0);
    GXSetCullMode(GX_CULL_NONE);
    GXSetZMode(GX_FALSE, GX_ALWAYS, GX_FALSE);
    GXSetBlendMode(GX_BM_BLEND, GX_BL_SRCALPHA, GX_BL_INVSRCALPHA, GX_LO_CLEAR);
    GXSetNumChans(1);
    GXSetChanCtrl(GX_COLOR0A0, GX_FALSE, GX_SRC_REG, GX_SRC_VTX, GX_LIGHT_NULL,
                  GX_DF_NONE, GX_AF_NONE);
    GXSetNumTexGens(0);
    GXSetNumTevStages(1);
    GXSetTevOrder(GX_TEVSTAGE0, GX_TEXCOORD_NULL, GX_TEXMAP_NULL, GX_COLOR0A0);
    GXSetTevOp(GX_TEVSTAGE0, GX_PASSCLR);
    GXClearVtxDesc();
    GXSetVtxDesc(GX_VA_POS, GX_DIRECT);
    GXSetVtxDesc(GX_VA_CLR0, GX_DIRECT);
    GXSetVtxAttrFmt(GX_VTXFMT0, GX_VA_POS, GX_POS_XYZ, GX_F32, 0);
    GXSetVtxAttrFmt(GX_VTXFMT0, GX_VA_CLR0, GX_CLR_RGBA, GX_RGBA8, 0);
    sf_quad(18.0F, -10.0F, 470.0F, -(16.0F + (float) sf_panel_rows * 18.0F),
            28, 170);
    if (sf_bar >= 0) {
        bar_y = -(18.0F + (float) (sf_panel_rows - 1) * 18.0F);
        sf_quad(28.0F, bar_y, 428.0F, bar_y - 8.0F, 70, 200);
        sf_quad(28.0F, bar_y, 28.0F + 400.0F * (float) sf_bar / 1000.0F,
                bar_y - 8.0F, 230, 230);
    }
    if (sf_rule_row >= 0) {
        float y = -(18.0F + 18.0F * (float) sf_rule_row);

        sf_quad(28.0F, y, 428.0F, y - 1.0F, 255, 255);
    }
    HSD_StateInvalidate(-1);
}

static Fighter* sf_fighter_at(int slot, int sub)
{
    HSD_GObj* gobj;
    Fighter* fp;

    if (slot < 0) {
        return NULL;
    }
    gobj = Player_GetEntityAtIndex(slot, sub);
    if (gobj == NULL) {
        return NULL;
    }
    fp = GET_FIGHTER(gobj);
    if (fp == NULL || fp->is_sleeping) {
        return NULL;
    }
    return fp;
}

static void sf_print(int row, const char* fmt, const char* a, int n)
{
    HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F + 18.0F * (float) row, fmt, a,
                        n);
}

static int sf_draw_head(const PcSfView* v)
{
    Fighter* attacker = sf_fighter_at(v->attacker_slot, 0);
    Fighter* victim = sf_fighter_at(v->victim_slot, v->victim_sub);

    HSD_SisLib_803A6B98(sf_text, 28.0F, 0.0F, "4stockfish");
    if (attacker != NULL && victim != NULL) {
        HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F, "%s vs %s, %d pct",
                            sf_name(attacker->kind), sf_name(victim->kind),
                            (int) victim->dmg.x1830_percent);
    } else {
        HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F, "no opponent");
    }
    return 1;
}

static void sf_draw_search(const PcSfView* v)
{
    int row = sf_draw_head(v);

    if (!v->have_best) {
        sf_print(row++, "%snothing yet", "", 0);
    } else if (v->best_ko) {
        sf_print(row++, "%soptimal path: KO", "", 0);
    } else {
        sf_print(row++, "%soptimal path: +%d%%", "", v->best_dmg);
    }
    row++;
    HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F + 18.0F * (float) row + 5.0F,
        "searching %d frames, max combo gap %d", v->horizon, v->endlag);
    HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F + 18.0F * (float) (row + 1) + 5.0F,
        "%ds", v->elapsed_time);
    sf_bar = v->progress;
    sf_panel_rows = row + 2;
}

/* Choice rows drawn at once, the above and below counts included. The
 * text object crashes once the menu runs past about ten rows, header
 * included, so this stays under that. */
#define SF_MENU_CHOICES 6

static void sf_draw_line(int row, const PcSfView* v, int i)
{
    const char* mark = i == v->cursor ? "PICK" : "opt";

    if (v->lines[i].ko) {
        HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F + 18.0F * row, "%s %d %s  KO",
                            mark, i + 1, v->lines[i].text);
    } else {
        HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F + 18.0F * row,
                            "%s %d %s  plus %d", mark, i + 1, v->lines[i].text,
                            v->lines[i].dmg);
    }
}

static void sf_draw_menu(const PcSfView* v)
{
    int row = sf_draw_head(v);
    int slots, first, count, above, below, i;

    // sf_print(row++, "%sframes %d, left right", "", v->horizon);
    // sf_print(row++, "%sendlag %d, L R", "", v->endlag);
    HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F + 18.0F * (float) row++,
        "frames %d, left right, endlag %d, L R", v->horizon,
    v->endlag);
    row++;
    sf_rule_row = row;
    slots = SF_MENU_CHOICES;
    if (v->note != NULL && slots > 2) {
        slots -= 1;
    }
    if (v->nlines <= slots) {
        first = 0;
        count = v->nlines;
    } else {
        count = slots - 2;
        if (count < 1) {
            count = 1;
        }
        first = v->cursor - count / 2;
        if (first < 0) {
            first = 0;
        }
        if (first + count > v->nlines) {
            first = v->nlines - count;
        }
        if (first == 0 && count < slots - 1) {
            count++;
        }
        if (first > 0 && first + count >= v->nlines && count < slots - 1) {
            int room = (slots - 1) - count;

            if (room > first) {
                room = first;
            }
            first -= room;
            count += room;
        }
    }
    above = first > 0;
    below = first + count < v->nlines;
    if (above) {
        sf_print(row++, "%s%d ...", "", first);
    }
    for (i = 0; i < count; i++, row++) {
        sf_draw_line(row, v, first + i);
    }
    if (below) {
        sf_print(row++, "%s%d ...", "", v->nlines - (first + count));
    }
    if (v->note != NULL) {
        sf_print(row++, "%s", v->note, 0);
    }
    sf_panel_rows = row + 1;
}

static void sf_draw_playing(const PcSfView* v)
{
    sf_panel = 0;
    if (v->play_index >= 0 && v->play_index < v->nlines) {
        sf_print(0, "playing %s", v->lines[v->play_index].text, 0);
    } else {
        sf_print(0, "%splaying", "", 0);
    }
}

static void sf_draw_result(const PcSfView* v)
{
    if (v->result_ko) {
        sf_print(0, "%sresult KO", "", 0);
    } else {
        sf_print(0, "%sresult plus %d", "", v->result_dmg);
    }
    if (v->play_index >= 0 && v->play_index < v->nlines) {
        sf_print(1, "%s", v->lines[v->play_index].text, 0);
    }
    sf_panel_rows = 2;
}

void Stockfish_Redraw(void)
{
    const PcSfView* v = pc_sf_view();

    if (v->state == PC_SF_IDLE) {
        sf_hide();
        return;
    }
    sf_ensure_text();
    if (!sf_text_ready || sf_text == NULL) {
        return;
    }
    HSD_SisLib_803A7664(sf_text);
    sf_style_text();
    sf_text_shown = 1;
    sf_panel = 1;
    sf_bar = -1;
    sf_rule_row = -1;
    switch (v->state) {
    case PC_SF_SEARCH:
        sf_draw_search(v);
        break;
    case PC_SF_MENU:
        sf_draw_menu(v);
        break;
    case PC_SF_PLAY:
        sf_draw_playing(v);
        break;
    default:
        sf_draw_result(v);
        break;
    }
}

static void sf_menu_input(const PcSfView* v)
{
    int port = v->attacker_slot >= 0 ? Player_GetPadPort(v->attacker_slot)
                                      : -1;
    float sy;
    u32 trigger;

    if (port < 0 || port > 3) {
        return;
    }
    sy = HSD_PadCopyStatus[port].nml_stickY;
    trigger = HSD_PadCopyStatus[port].trigger;
    if (trigger & HSD_PAD_DPADLEFT) {
        pc_sf_horizon_step(-1);
        return;
    }
    if (trigger & HSD_PAD_DPADRIGHT) {
        pc_sf_horizon_step(1);
        return;
    }
    if (trigger & HSD_PAD_L) {
        pc_sf_endlag_step(-1);
        return;
    }
    if (trigger & HSD_PAD_R) {
        pc_sf_endlag_step(1);
        return;
    }
    if (sy > 0.5F || sy < -0.5F) {
        if (sf_stick_lock == 0) {
            pc_sf_cursor_step(sy > 0.0F ? -1 : 1);
            sf_stick_lock = 10;
        } else {
            sf_stick_lock -= 1;
        }
    } else if (sy > -0.3F && sy < 0.3F) {
        sf_stick_lock = 0;
    }
    if (trigger & HSD_PAD_A) {
        pc_sf_play();
    }
}

static int sf_pause_bit_now(void)
{
    if (gm_GetDbPauseFlag(1)) {
        return 1;
    }
    if (gm_GetDbPauseFlag(2)) {
        return 2;
    }
    return 0;
}

static void sf_menu_proc(HSD_GObj* gobj)
{
    int bit;
    int paused;

    (void) gobj;
    if (p_ftCommonData == NULL || pc_sf_searching()) {
        return;
    }
    bit = sf_pause_bit_now();
    paused = bit != 0;
    switch (pc_sf_state()) {
    case PC_SF_IDLE:
        if (paused && !sf_was_paused) {
            sf_stick_lock = 10;
            pc_sf_request(bit);
        }
        Stockfish_Redraw();
        break;
    case PC_SF_MENU:
        if (!paused) {
            pc_sf_end();
            sf_hide();
            break;
        }
        sf_menu_input(pc_sf_view());
        Stockfish_Redraw();
        break;
    default:
        Stockfish_Redraw();
        break;
    }
    sf_was_paused = paused;
}

static s8 sf_slot_by_player(int player)
{
    int slot;

    for (slot = 0; slot < 6; slot++) {
        if (player == Player_GetPadPort(slot) &&
            Player_GetPlayerSlotType(slot) == Gm_PKind_Human)
        {
            return slot;
        }
    }
    return -1;
}

void Stockfish_PrepareRoot(int pause_bit)
{
    VsSceneController* c = gmVs_GetSceneController();
    int pauser = c->state.pauser;

    gm_ClearDbPauseFlag(pause_bit);
    ifAll_802F33CC();
    gm_801A10FC(pauser);
    HSD_PadRumbleUnpauseAll();
    if (c->start.x4_0) {
        if (c->start.on_unpause_override != NULL) {
            c->start.on_unpause_override(pauser);
        } else {
            Ground_EnableMatchCamera();
        }
    }
    c->state.pause_timer = 0;
}

void Stockfish_Repause(int pause_bit)
{
    VsSceneController* c = gmVs_GetSceneController();
    int pauser = c->state.pauser;

    ifAll_802F3394();
    if (c->start.x3_7) {
        ifTime_ShowTimers();
    }
    gm_SetDbPauseFlag(pause_bit);
    if (c->start.x4_0) {
        s8 slot = sf_slot_by_player(pauser);
        if (c->start.on_pause_override != NULL) {
            c->start.on_pause_override(slot);
        } else {
            gm_EnablePlayerPauseCamera(slot, pauser);
        }
    }
    HSD_PadRumblePauseAll();
    c->state.pause_timer = 0xA;
}

void Stockfish_OnFighterUpdate(Fighter_GObj* gobj)
{
    u32 frame;

    (void) gobj;
    if (p_ftCommonData == NULL || pc_sf_searching()) {
        return;
    }
    frame = gm_GetFrameCount();
    if (frame < sf_last_frame) {
        sf_menu_gobj = NULL;
        sf_text = NULL;
        sf_text_ready = 0;
        sf_text_shown = 0;
        sf_panel = 0;
        sf_was_paused = 0;
    }
    sf_last_frame = frame;
    if (sf_menu_gobj != NULL) {
        return;
    }
    sf_menu_gobj = GObj_Create(0xE, 0, 0);
    if (sf_menu_gobj == NULL) {
        return;
    }
    HSD_GObj_SetupProc(sf_menu_gobj, sf_menu_proc, 0);
    GObj_SetupGXLink(sf_menu_gobj, sf_draw_panel, 14, 0);
}
