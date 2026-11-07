#include "4stockfish.h"
#include "pc/pc.h"

#include <math.h>
#include <stdarg.h>
#include <stdio.h>

#include <dolphin/gx.h>
#include <dolphin/mtx.h>
#include <melee/cm/camera.h>
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
#include <melee/lb/lbvector.h>
#include <melee/mn/types.h>
#include <melee/pl/player.h>
#include <sysdolphin/baselib/cobj.h>
#include <sysdolphin/baselib/controller.h>
#include <sysdolphin/baselib/gobj.h>
#include <sysdolphin/baselib/gobjgxlink.h>
#include <sysdolphin/baselib/gobjplink.h>
#include <sysdolphin/baselib/gobjproc.h>
#include <sysdolphin/baselib/gobjuserdata.h>
#include <sysdolphin/baselib/rumble.h>
#include <sysdolphin/baselib/sislib.h>
#include <sysdolphin/baselib/state.h>

#include "pc/savestate.h"
#include "pc/sf_search.h"

/**
 * 4stockfish
 *
 * Start pauses the match and searches ahead from that frame; the engine is
 * pc/sf_search.c. This file watches for the pause, reads the menu's pad and
 * draws. Every number shown came from a simulation of the running game.
 * Up and down move, A plays a line, left and right change the horizon,
 * L and R change how long a line may wait after hitstun, X sorts, and Y
 * doubles the search budget (1x to 8x, then back to 1x). Z or Ctrl+S
 * writes this frame to a savestate file. Ctrl+O opens one and, when that
 * file was saved paused, starts a search from it.
 */

static const char* sf_kind_name[Ft_Kind_Max] = {
    "Mario",  "Fox",      "Falcon", "DK",     "Kirby",  "Bowser", "Link",
    "Sheik",  "Ness",     "Peach",  "Popo",   "Nana",   "Pika",   "Samus",
    "Yoshi",  "Puff",     "Mewtwo", "Luigi",  "Marth",  "Zelda",  "YLink",
    "Doc",    "Falco",    "Pichu",  "GnW",    "Ganon",  "Roy",    "MasterH",
    "CrazyH", "Boy",      "Girl",   "Giga",   "Sandbag",
};

#define PAD_LEFT 0.0F
#define PAD_TOP 10.0F

static u32 sf_last_frame;
static HSD_Text* sf_text;
static int sf_text_ready;
static int sf_text_shown;
static HSD_GObj* sf_menu_gobj;
static int sf_was_paused;
static int sf_load_gen;
static int sf_stick_lock;

static void sf_text_remove(void* data);
static void sf_menu_proc(HSD_GObj* gobj);
static void sf_draw_panel(HSD_GObj* gobj, intptr_t pass);
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
    if (sf_menu_gobj != NULL &&
        sf_menu_gobj->user_data_kind == HSD_GOBJ_USER_DATA_NONE)
    {
        GObj_InitUserData(sf_menu_gobj, 0, sf_text_remove, sf_text);
    }
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

/* Frames of victim velocity the short arrow at each endpoint covers. */
#define SF_VEL_FRAMES 8.0F

/* A world point in the overlay camera's space: screen pixels, y negated. */
static bool sf_to_overlay(HSD_CObj* cam, float wx, float wy, float* ox,
                          float* oy)
{
    Vec3 world;
    Vec3 screen;

    if (!(wx > -50000.0F && wx < 50000.0F && wy > -50000.0F &&
          wy < 50000.0F))
    {
        return false;
    }
    world.x = wx;
    world.y = wy;
    world.z = 0.0F;
    if (lbVector_WorldToScreen(cam, &world, &screen, 0) == NULL) {
        return false;
    }
    *ox = screen.x;
    *oy = -screen.y;
    return true;
}

static void sf_arrow(float x0, float y0, float x1, float y1, float width,
                     GXColor c)
{
    float dx = x1 - x0;
    float dy = y1 - y0;
    float len = sqrtf(dx * dx + dy * dy);
    float ux, uy, nx, ny, head, bx, by;

    if (len < 2.0F) {
        return;
    }
    ux = dx / len;
    uy = dy / len;
    nx = -uy;
    ny = ux;
    head = width * 3.0F;
    if (head > len * 0.6F) {
        head = len * 0.6F;
    }
    bx = x1 - ux * head;
    by = y1 - uy * head;
    GXBegin(GX_QUADS, GX_VTXFMT0, 4);
    GXPosition3f32(x0 + nx * width * 0.5F, y0 + ny * width * 0.5F, 0.0F);
    GXColor4u8(c.r, c.g, c.b, c.a);
    GXPosition3f32(bx + nx * width * 0.5F, by + ny * width * 0.5F, 0.0F);
    GXColor4u8(c.r, c.g, c.b, c.a);
    GXPosition3f32(bx - nx * width * 0.5F, by - ny * width * 0.5F, 0.0F);
    GXColor4u8(c.r, c.g, c.b, c.a);
    GXPosition3f32(x0 - nx * width * 0.5F, y0 - ny * width * 0.5F, 0.0F);
    GXColor4u8(c.r, c.g, c.b, c.a);
    GXEnd();
    GXBegin(GX_TRIANGLES, GX_VTXFMT0, 3);
    GXPosition3f32(x1, y1, 0.0F);
    GXColor4u8(c.r, c.g, c.b, c.a);
    GXPosition3f32(bx + nx * head * 0.6F, by + ny * head * 0.6F, 0.0F);
    GXColor4u8(c.r, c.g, c.b, c.a);
    GXPosition3f32(bx - nx * head * 0.6F, by - ny * head * 0.6F, 0.0F);
    GXColor4u8(c.r, c.g, c.b, c.a);
    GXEnd();
}

/* The search's hits as it finds them, oldest first so the newest draw on
 * top. Older ones fade out. */
static void sf_draw_found(const PcSfView* v, HSD_CObj* cam, float rx,
                          float ry)
{
    int i;

    for (i = 0; i < v->nfound; i++) {
        int k = (v->found_head - v->nfound + i + PC_SF_FOUND) % PC_SF_FOUND;
        int age = v->nfound - 1 - i;
        u8 alpha = (u8) (40 + 180 * (PC_SF_FOUND - age) / PC_SF_FOUND);
        GXColor path = v->found[k].ko ? (GXColor) {255, 90, 90, alpha}
                                      : (GXColor) {120, 220, 140, alpha};
        GXColor vel = {255, 210, 80, alpha};
        float ex, ey, vx, vy;

        if (!sf_to_overlay(cam, v->found[k].x, v->found[k].y, &ex, &ey)) {
            continue;
        }
        sf_arrow(rx, ry, ex, ey, age == 0 ? 2.5F : 1.0F, path);
        if (sf_to_overlay(cam, v->found[k].x + v->found[k].vx * SF_VEL_FRAMES,
                          v->found[k].y + v->found[k].vy * SF_VEL_FRAMES, &vx,
                          &vy))
        {
            sf_arrow(ex, ey, vx, vy, age == 0 ? 2.0F : 1.0F, vel);
        }
    }
}

/* Where each listed line leaves the victim: an arrow from the victim at
 * the pause to the path's last frame, and a short one for the victim's
 * velocity there. The line under the cursor draws on top, brighter. */
static void sf_draw_endpoints(void)
{
    const PcSfView* v = pc_sf_view();
    HSD_GObj* cam_gobj;
    HSD_CObj* cam;
    float rx, ry;
    int i;

    if (v->state != PC_SF_SEARCH && v->state != PC_SF_MENU) {
        return;
    }
    if (!v->have_root) {
        return;
    }
    cam_gobj = Camera_80030A50();
    cam = cam_gobj != NULL ? GET_COBJ(cam_gobj) : NULL;
    if (cam == NULL || !sf_to_overlay(cam, v->root_x, v->root_y, &rx, &ry)) {
        return;
    }
    if (v->state == PC_SF_SEARCH) {
        sf_draw_found(v, cam, rx, ry);
    }
    for (i = 0; i <= v->nlines; i++) {
        /* One pass past the end draws the cursor line last. */
        int k = i < v->nlines ? i : v->cursor;
        bool sel = v->state == PC_SF_MENU && k == v->cursor;
        float ex, ey, vx, vy;
        GXColor path, vel;

        if (k < 0 || k >= v->nlines || !v->lines[k].have_end ||
            !pc_sf_line_shown(k) || (sel && i < v->nlines))
        {
            continue;
        }
        if (!sf_to_overlay(cam, v->lines[k].end_x, v->lines[k].end_y, &ex,
                           &ey))
        {
            continue;
        }
        if (sel) {
            path = (GXColor) {86, 100, 209, 255};
            vel = (GXColor) {255, 210, 80, 255};
        } else if (v->lines[k].ko) {
            path = (GXColor) {220, 70, 70, 140};
            vel = (GXColor) {255, 210, 80, 110};
        } else {
            path = (GXColor) {255, 255, 255, 110};
            vel = (GXColor) {255, 210, 80, 110};
        }
        sf_arrow(rx, ry, ex, ey, sel ? 3.0F : 1.5F, path);
        if (sf_to_overlay(cam,
                          v->lines[k].end_x +
                              v->lines[k].vel_x * SF_VEL_FRAMES,
                          v->lines[k].end_y +
                              v->lines[k].vel_y * SF_VEL_FRAMES,
                          &vx, &vy))
        {
            sf_arrow(ex, ey, vx, vy, sel ? 2.5F : 1.0F, vel);
        }
    }
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
    sf_draw_endpoints();
    sf_quad(PAD_LEFT, -10.0F, 600.0F, -(16.0F + (float) sf_panel_rows * 18.0F),
            28, 170);
    if (sf_bar >= 0) {
        bar_y = -(PAD_TOP + (float) (sf_panel_rows - 1) * 18.0F);
        sf_quad(PAD_LEFT, bar_y, 428.0F, bar_y - 8.0F, 70, 200);
        sf_quad(PAD_LEFT, bar_y, PAD_LEFT + 400.0F * (float) sf_bar / 1000.0F,
                bar_y - 8.0F, 230, 230);
    }
    if (sf_text != NULL) {
        float y = -(PAD_TOP * 3.0F);

        sf_quad(PAD_LEFT, y, 200.0F, y + 1.0F, 255, 255); // line under "4stockfish"
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

/* One menu row. Formatted here, so the text object only ever gets "%s".
 * Returns the row's entry in the text object. */
static int sf_vprint(int row, const char* fmt, va_list ap)
{
    char buf[128];

    vsnprintf(buf, sizeof buf, fmt, ap);
    return HSD_SisLib_803A6B98(sf_text, PAD_LEFT,
                               PAD_TOP + 2.0F + 18.0F * (float) row, "%s", buf);
}

static void sf_print(int row, const char* fmt, ...)
{
    va_list ap;

    va_start(ap, fmt);
    sf_vprint(row, fmt, ap);
    va_end(ap);
}

/* A row in its own color. The rest keep text_color from sf_style_text. */
static void sf_print_color(int row, GXColor color, const char* fmt, ...)
{
    va_list ap;
    int entry;

    va_start(ap, fmt);
    entry = sf_vprint(row, fmt, ap);
    va_end(ap);
    HSD_SisLib_803A74F0(sf_text, entry, &color);
}

static int sf_draw_head(const PcSfView* v)
{
    Fighter* attacker = sf_fighter_at(v->attacker_slot, 0);
    Fighter* victim = sf_fighter_at(v->victim_slot, v->victim_sub);

    sf_print_color(-1, (GXColor) {74, 168, 99, 255}, "4Stockfish %s", pc_app_version());
    // if (attacker != NULL && victim != NULL) {
    //     HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F, "%s vs %s, %d pct",
    //                         sf_name(attacker->kind), sf_name(victim->kind),
    //                         (int) victim->dmg.x1830_percent);
    // } else {
    //     HSD_SisLib_803A6B98(sf_text, 28.0F, 18.0F, "no opponent");
    // }
    return 0;
}

static void sf_draw_search(const PcSfView* v)
{
    int row = sf_draw_head(v);

    if (!v->have_best) {
        sf_print(row++, "nothing yet");
    } else if (v->best_ko) {
        sf_print(row++, "optimal path: KO");
    } else {
        sf_print(row++, "optimal path: +%d%%", v->best_dmg);
    }
    sf_print(row++, "searching %d frames, max combo gap %d, effort %dx", v->horizon, v->endlag, v->effort);
    sf_print(row++, "%ds", v->elapsed_time);
    sf_bar = v->progress;
    sf_panel_rows = row + 2;
}

/* Choice rows drawn at once, the above and below counts included. The
 * text object crashes once the menu runs past about ten rows, header
 * included, so this stays under that. */
#define SF_MENU_CHOICES 7

static void sf_draw_line(int row, const PcSfView* v, int i)
{
    // todo fix advantage calculation
    // int adv = v->lines[i].advantage;
    if (v->lines[i].ko) {
        if (i == v->cursor) {
            sf_print_color(row, (GXColor) {86, 100, 209, 255}, "%d: %d frames %s KO pos %+d", i + 1,
                 v->lines[i].frames, v->lines[i].text, v->lines[i].position);
        } else {
            sf_print(row, "%d: %d frames %s KO pos %+d", i + 1,
                     v->lines[i].frames, v->lines[i].text, v->lines[i].position);
        }
    } else {
        if (i == v->cursor) {
            sf_print_color(row, (GXColor) {86, 100, 209, 255}, "%d: %d frames %s +%d%% pos %+d", i + 1,
                 v->lines[i].frames, v->lines[i].text, v->lines[i].dmg, v->lines[i].position);
        } else {
            sf_print(row, "%d: %d frames %s +%d%% pos %+d", i + 1,
                     v->lines[i].frames, v->lines[i].text, v->lines[i].dmg, v->lines[i].position);
        }
    }
}

static void sf_draw_menu(const PcSfView* v)
{
    int row = sf_draw_head(v);
    int slots, first, count, above, below, i;
    int vis[PC_SF_LINES];
    int nvis = 0;
    int cur = 0;

    for (i = 0; i < v->nlines; i++) {
        if (pc_sf_line_shown(i)) {
            if (i == v->cursor) {
                cur = nvis;
            }
            vis[nvis++] = i;
        }
    }
    sf_print(row++, "frames %d, DPAD left right, endlag %d, L R", v->horizon,
             v->endlag);
    sf_print(row++, "filter: %s, stick left right",
             pc_sf_move_label(v->filter - 1));
    sf_print(row++, "sort: %s, X  effort %dx, Y",
             v->sort_type != NULL ? v->sort_type : "damage", v->effort);
    sf_rule_row = row;
    slots = SF_MENU_CHOICES;
    if (slots > 2) {
        slots -= 1;
    }
    if (nvis <= slots) {
        first = 0;
        count = nvis;
    } else {
        count = slots - 2;
        if (count < 1) {
            count = 1;
        }
        first = cur - count / 2;
        if (first < 0) {
            first = 0;
        }
        if (first + count > nvis) {
            first = nvis - count;
        }
        if (first == 0 && count < slots - 1) {
            count++;
        }
        if (first > 0 && first + count >= nvis && count < slots - 1) {
            int room = (slots - 1) - count;

            if (room > first) {
                room = first;
            }
            first -= room;
            count += room;
        }
    }
    above = first > 0;
    below = first + count < nvis;
    if (above) {
        sf_print(row++, "%d ...", first);
    }
    for (i = 0; i < count; i++, row++) {
        sf_draw_line(row, v, vis[first + i]);
    }
    if (below) {
        sf_print(row++, "%d ...", nvis - (first + count));
    }
    if (nvis == 0 && v->nlines > 0) {
        sf_print(row++, "no line has that move");
    }
    // {
    //     const char* status = v->note != NULL ? v->note : pc_savestate_message();

    //     if (status == NULL) {
    //         status = "Z or Ctrl+S saves, Ctrl+O loads";
    //     }
    //     sf_print(row++, "%s", status);
    // }
    sf_panel_rows = row + 1;
}

static void sf_draw_playing(const PcSfView* v)
{
    int row = sf_draw_head(v);
    sf_print(row++, "%s", v->lines[v->play_index].text);
    sf_panel_rows = row;
}

static void sf_draw_result(const PcSfView* v)
{
    if (v->result_ko) {
        sf_print(0, "result KO");
    } else {
        sf_print(0, "result +%d%%,", v->result_dmg);
    }
    if (v->play_index >= 0 && v->play_index < v->nlines) {
        sf_print(1, "%s", v->lines[v->play_index].text);
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
    float sx;
    float sy;
    u32 trigger;

    if (port < 0 || port > 3) {
        return;
    }
    sx = HSD_PadCopyStatus[port].nml_stickX;
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
    if (trigger & HSD_PAD_X) {
        pc_sf_sort_toggle();
        return;
    }
    if (trigger & HSD_PAD_Y) {
        pc_sf_effort_step();
        return;
    }
    if (trigger & HSD_PAD_Z) {
        pc_savestate_request_save();
        return;
    }
    if (sx > 0.5F || sx < -0.5F) {
        if (sf_stick_lock == 0) {
            pc_sf_filter_step(sx > 0.0F ? 1 : -1);
            sf_stick_lock = 10;
        } else {
            sf_stick_lock -= 1;
        }
    } else if (sy > 0.5F || sy < -0.5F) {
        if (sf_stick_lock == 0) {
            pc_sf_cursor_step(sy > 0.0F ? -1 : 1);
            sf_stick_lock = 10;
        } else {
            sf_stick_lock -= 1;
        }
    } else if (sx > -0.3F && sx < 0.3F && sy > -0.3F && sy < 0.3F) {
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
    /* A loaded file replaced the match. Drop the old pause edge so a file
     * that was saved paused starts a search on this frame. */
    if (pc_savestate_generation() != sf_load_gen) {
        sf_load_gen = pc_savestate_generation();
        if (pc_sf_state() != PC_SF_IDLE) {
            pc_sf_end();
        }
        sf_was_paused = 0;
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

/* The menu text is drawn by its own object. A file saved while paused
 * still holds that object, so a second one must not be allocated over it. */
static bool sf_is_our_text(HSD_Text* text)
{
    return text != NULL && text->x34.x == 0.4F && text->x34.y == 0.4F;
}

static bool sf_is_menu(HSD_GObj* gobj)
{
    HSD_GObjProc* proc;

    if (gobj == NULL) {
        return false;
    }
    if (gobj->render_cb == sf_draw_panel) {
        return true;
    }
    for (proc = gobj->proc; proc != NULL; proc = proc->child) {
        if (proc->on_invoke == sf_menu_proc) {
            return true;
        }
    }
    return false;
}

static void sf_text_remove(void* data)
{
    HSD_Text* text = data;

    if (sf_text == text) {
        sf_text = NULL;
        sf_text_ready = 0;
        sf_text_shown = 0;
    }
    if (text != NULL) {
        HSD_SisLib_803A5CC4(text);
    }
}

/* One menu gobj and one text. Anything else the file brought back is a
 * second copy of this UI. */
static void sf_keep_one_menu(void)
{
    HSD_GObj* keep = NULL;
    HSD_GObj* extra[8];
    HSD_Text* text = NULL;
    int nextra = 0;
    int link;
    int i;

    if (HSD_GObjPLinkHead == NULL) {
        return;
    }
    for (link = 0; link <= HSD_GOBJ_PLINK_MAX; link++) {
        HSD_GObj* g = HSD_GObjPLinkHead[link];

        while (g != NULL) {
            HSD_GObj* next = g->next;

            if (sf_is_menu(g)) {
                if (keep == NULL) {
                    keep = g;
                } else if (nextra < 8) {
                    extra[nextra++] = g;
                }
            }
            g = next;
        }
    }
    for (i = 0; i < nextra; i++) {
        HSD_GObjFree(extra[i]);
    }
    sf_menu_gobj = keep;
    sf_panel = 0;
    sf_was_paused = 0;
    if (keep != NULL && keep->user_data_kind != HSD_GOBJ_USER_DATA_NONE &&
        sf_is_our_text(keep->user_data))
    {
        text = keep->user_data;
    }
    {
        HSD_Text* t = HSD_SisLib_804D7978;

        while (t != NULL) {
            HSD_Text* next = t->next;

            if (sf_is_our_text(t)) {
                if (text == NULL) {
                    text = t;
                } else if (t != text) {
                    HSD_SisLib_803A5CC4(t);
                }
            }
            t = next;
        }
    }
    sf_text = text;
    sf_text_ready = text != NULL;
    sf_text_shown = 0;
    if (keep != NULL && text != NULL &&
        keep->user_data_kind == HSD_GOBJ_USER_DATA_NONE)
    {
        GObj_InitUserData(keep, 0, sf_text_remove, text);
    }
}

void Stockfish_OnLoad(void)
{
    sf_keep_one_menu();
}

void Stockfish_OnFighterUpdate(Fighter_GObj* gobj)
{
    u32 frame;

    (void) gobj;
    if (p_ftCommonData == NULL || pc_sf_searching()) {
        return;
    }
    frame = gm_GetFrameCount();
    /* A new match rewinds the clock and the old menu is gone. A savestate
     * rewind keeps the menu the file restored, so it must not be replaced. */
    if (frame < sf_last_frame && pc_savestate_generation() == sf_load_gen) {
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
    sf_keep_one_menu();
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
