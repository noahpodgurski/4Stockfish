#include "gmvsmode.h"

#include <stdlib.h>
#include <string.h>
#include <melee/lb/forward.h>

#include "forward.h"
#include "gm_1A3F.h"
#include "gm_unsplit.h"
#include "gmapproach.h"
#include "gmmovieend.h"
#include "gmresult.h"
#include "gmvsmelee.h"
#include "types.h"
#include <melee/if/if_2FD9.h>
#include <melee/lb/types.h>
#include <melee/mn/types.h>

/* 1B13B8 */ static void onEnterDebugVs(GameModeState*);
/* 1B14A0 */ static void onEnterCss(GameModeState*);
/* 1B14DC */ static void onExitCss(GameModeState*);
/* 1B1514 */ static void onEnterSss(GameModeState*);
/* 1B154C */ static void onExitSss(GameModeState*);
/* 1B1588 */ static void onEnterVs(GameModeState*);
/* 1B15C8 */ static void onExitVs(GameModeState*);
/* 1B1648 */ static void onEnterSuddenDeath(GameModeState*);
/* 1B1688 */ static void onExitSuddenDeath(GameModeState*);
/* 1B16A8 */ static void onEnterResults(GameModeState*);
/* 1B16C8 */ static void onExitResults(GameModeState*);

GameModeState gm_Mode_Vs_States[] = {
    {
        gmVsMode_State_Css,
        lbDvdPreload_3,
        0,
        onEnterCss,
        onExitCss,
        {
            GS_CSS,
            &gmVsMelee_CssData,
            &gmVsMelee_CssData,
        },
    },
    {
        gmVsMode_State_Sss,
        lbDvdPreload_3,
        0,
        onEnterSss,
        onExitSss,
        {
            GS_SSS,
            &gmVsMelee_SssData,
            &gmVsMelee_SssData,
        },
    },
    {
        gmVsMode_State_Vs,
        lbDvdPreload_3,
        0,
        onEnterVs,
        onExitVs,
        {
            GS_VS,
            &gmVsMelee_StartData,
            &gmVsMelee_VsExitInfo,
        },
    },
    {
        gmVsMode_State_SuddenDeath,
        lbDvdPreload_3,
        0,
        onEnterSuddenDeath,
        onExitSuddenDeath,
        {
            GS_SUDDEN_DEATH,
            &gmVsMelee_StartData,
            &gmVsMelee_SuddenDeathExitInfo,
        },
    },
    {
        gmVsMode_State_Results,
        lbDvdPreload_3,
        0,
        onEnterResults,
        onExitResults,
        {
            GS_RESULTS,
            &gmVsMelee_ResultsEnterData,
            NULL,
        },
    },
    {
        gmVsMode_State_Approach,
        lbDvdPreload_2,
        0,
        gm_ModeState_Approach_OnEnter,
        NULL,
        {
            GS_APPROACH,
            &gmVsMelee_ApproachData,
            &gmVsMelee_ApproachData,
        },
    },
    {
        gmVsMode_State_ApproachVs,
        lbDvdPreload_2,
        0,
        gm_ModeState_ApproachVs_OnEnter,
        gm_ModeState_ApproachVs_OnExit,
        {
            GS_VS,
            &gmVsMelee_StartData,
            &gmVsMelee_VsExitInfo,
        },
    },
    {
        gmVsMode_State_Prize,
        lbDvdPreload_2,
        0,
        gm_ModeState_Prize_OnEnter,
        gm_ModeState_Prize_OnExit,
        {
            GS_PRIZE_INTERFACE,
            &if_Scene_Prize_EnterData,
            NULL,
        },
    },
    { GM_GAMEMODESTATE_TERMINATE },
};

enum state_debug {
    state_debug_vs = 1,
    state_debug_results = 3,
};

GameModeState gm_Mode_DebugVs_States[] = {
    {
        state_debug_vs,
        lbDvdPreload_2,
        0,
        onEnterDebugVs,
        NULL,
        {
            GS_VS,
            &gmVsMelee_StartData,
            &gmVsMelee_VsExitInfo,
        },
    },
    {
        state_debug_results,
        lbDvdPreload_2,
        0,
        onEnterResults,
        NULL,
        {
            GS_RESULTS,
            &gmVsMelee_ResultsEnterData,
            NULL,
        },
    },
    { GM_GAMEMODESTATE_TERMINATE },
};

#ifdef TARGET_PC
/* MELEE_DEBUG_VS_P1 / P2: a character name or a CKind number. Unknown names
 * leave the default (Link and Mario). */
static CharacterKind debug_ckind(const char* s, CharacterKind fallback)
{
    static const struct {
        const char* name;
        CharacterKind kind;
    } names[] = {
        { "falcon", CKind_Captain },   { "captain", CKind_Captain },
        { "dk", CKind_Donkey },        { "donkey", CKind_Donkey },
        { "fox", CKind_Fox },          { "gnw", CKind_GameWatch },
        { "gamewatch", CKind_GameWatch }, { "kirby", CKind_Kirby },
        { "bowser", CKind_Koopa },     { "koopa", CKind_Koopa },
        { "link", CKind_Link },        { "luigi", CKind_Luigi },
        { "mario", CKind_Mario },      { "marth", CKind_Mars },
        { "mars", CKind_Mars },        { "mewtwo", CKind_Mewtwo },
        { "ness", CKind_Ness },        { "peach", CKind_Peach },
        { "pikachu", CKind_Pikachu },  { "pika", CKind_Pikachu },
        { "ics", CKind_PopoNana },     { "climbers", CKind_PopoNana },
        { "puff", CKind_Purin },       { "jigglypuff", CKind_Purin },
        { "samus", CKind_Samus },      { "yoshi", CKind_Yoshi },
        { "zelda", CKind_Zelda },      { "sheik", CKind_Seak },
        { "falco", CKind_Falco },      { "younglink", CKind_CLink },
        { "ylink", CKind_CLink },      { "doc", CKind_DrMario },
        { "drmario", CKind_DrMario },  { "roy", CKind_Emblem },
        { "pichu", CKind_Pichu },      { "ganon", CKind_Ganon },
        { "ganondorf", CKind_Ganon },
    };
    char buf[32];
    int i, n;

    if (s == NULL || s[0] == '\0') {
        return fallback;
    }
    if (s[0] >= '0' && s[0] <= '9') {
        int k = atoi(s);
        if (k >= 0 && k < CKind_Playable_Count) {
            return (CharacterKind) k;
        }
        return fallback;
    }
    n = 0;
    for (i = 0; s[i] != '\0' && n < (int) sizeof buf - 1; i++) {
        char c = s[i];
        if (c >= 'A' && c <= 'Z') {
            c = (char) (c - 'A' + 'a');
        }
        if (c == ' ' || c == '_' || c == '-') {
            continue;
        }
        buf[n++] = c;
    }
    buf[n] = '\0';
    for (i = 0; i < (int) (sizeof names / sizeof names[0]); i++) {
        if (strcmp(buf, names[i].name) == 0) {
            return names[i].kind;
        }
    }
    OSReport("MELEE_DEBUG_VS: unknown character '%s'\n", s);
    return fallback;
}
#endif

void onEnterDebugVs(GameModeState* state)
{
    StartMeleeData* start = gm_GetGameModeStateEnterData(state);
    ssize_t i;

    gm_SetupRulesDefaults(&start->rules);
    start->rules.stkind = St_Kind_Last;
    start->rules.item_freq = -1;
    start->rules.sd_penalty = -1;
    start->rules.match_kind = MatchKind_Time;

    for (i = 0; i < Gm_Player_NumMax; i++) {
        gm_SetupPlayerDefaults(&start->players[i]);
        start->players[i].stocks = 0;
        start->players[i].cpu_kind = 4;
    }

    start->players[0].ckind = CKind_Link;
    start->players[1].ckind = CKind_Mario;
    start->players[2].ckind = CKind_Link;
    start->players[3].ckind = CKind_Link;

    start->players[0].slot_type = Gm_PKind_Human;
    start->players[1].slot_type = Gm_PKind_Human;
    start->players[2].slot_type = Gm_PKind_NA;
    start->players[3].slot_type = Gm_PKind_NA;
#ifdef TARGET_PC
    /* MELEE_DEBUG_VS_STAGE=<StKind>: the debug match on one stage instead of
     * the last-used one, so the harness can reach a stage's mid-match loads
     * (3 is Pokemon Stadium, whose transformations load from disc). */
    if (getenv("MELEE_DEBUG_VS_STAGE") != NULL) {
        int st = atoi(getenv("MELEE_DEBUG_VS_STAGE"));
        if (st > St_Kind_Test && st <= St_Kind_Last) {
            start->rules.stkind = (StKind) st;
        }
    }
    if (getenv("MELEE_DEBUG_VS") != NULL && strcmp(getenv("MELEE_DEBUG_VS"), "cpu") == 0) {
        start->players[1].slot_type = Gm_PKind_Cpu;
    } else if (getenv("MELEE_DEBUG_VS") != NULL && strcmp(getenv("MELEE_DEBUG_VS"), "cpu4") == 0) {
        /* Four CPUs fighting each other: the worst-case scene for a
         * frame-time gate, with no input needed to keep it busy. */
        static const CharacterKind kinds[4] = {
            CKind_Link, CKind_Mario, CKind_Fox, CKind_Donkey,
        };
        const char* base_env = getenv("MELEE_DEBUG_VS_FIGHTER_BASE");
        char* end;
        long base = base_env ? strtol(base_env, &end, 10) : -1;
        bool selected = base_env && end != base_env && *end == '\0' &&
                        base >= 0 && base < CKind_Playable_Count;
        for (i = 0; i < 4; i++) {
            start->players[i].ckind = selected ?
                (CharacterKind) ((base + i) % CKind_Playable_Count) : kinds[i];
            start->players[i].slot_type = Gm_PKind_Cpu;
        }
    }
    /* MELEE_DEBUG_VS_STOCKS=<n>: a stock match instead of an untimed time
     * one, so a run can end on GAME! with stocks the replay (src/pc/slp.c)
     * must carry. */
    if (getenv("MELEE_DEBUG_VS_STOCKS") != NULL) {
        int stocks = atoi(getenv("MELEE_DEBUG_VS_STOCKS"));
        if (stocks > 0 && stocks < 100) {
            start->rules.match_kind = MatchKind_Stock;
            start->rules.is_stock = true;
            for (i = 0; i < Gm_Player_NumMax; i++) {
                start->players[i].stocks = stocks;
            }
        }
    }
    if (getenv("MELEE_DEBUG_VS_P1") != NULL) {
        start->players[0].ckind =
            debug_ckind(getenv("MELEE_DEBUG_VS_P1"), start->players[0].ckind);
    }
    if (getenv("MELEE_DEBUG_VS_P2") != NULL) {
        start->players[1].ckind =
            debug_ckind(getenv("MELEE_DEBUG_VS_P2"), start->players[1].ckind);
    }
#endif

    start->players[0].rumble_enabled = false;
    start->players[1].rumble_enabled = false;
    start->players[2].rumble_enabled = false;
    start->players[3].rumble_enabled = false;

    gm_LoadAnnouncer();
}

void onEnterCss(GameModeState* state)
{
    gmVsMelee_EnterCss(state, gmVsMelee_GetVsData(), VS_MELEE);
}

void onExitCss(GameModeState* state)
{
    gmVsMelee_ExitCss(state, gmVsMelee_GetVsData());
}

void onEnterSss(GameModeState* state)
{
    gmVsMelee_EnterSss(state, gmVsMelee_GetVsData());
}

void onExitSss(GameModeState* state)
{
    gmVsMelee_ExitSss(state, gmVsMelee_GetVsData(), gmVsMode_State_Css);
}

void onEnterVs(GameModeState* state)
{
    gmVsMelee_EnterVs(state, gmVsMelee_GetVsData(), NULL, NULL);
}

void onExitVs(GameModeState* state)
{
    MatchExitInfo* mei;
    ssize_t i;

    gmVsMelee_ExitVs(state, gmVsMode_State_Results,
                     gmVsMode_State_SuddenDeath);
    mei = gm_GetGameModeStateExitData(state);
    for (i = 0; i < GM_MAX_PLAYERS; i++) {
        if (mei->match_end.player_standings[i].pkind != Gm_PKind_NA) {
            gm_80162A98(mei->match_end.player_standings[i].x20);
            gm_RecordSelfDestructs(
                mei->match_end.player_standings[i].self_destructs);
            gm_80162A4C(mei->match_end.player_standings[i].x44);
        }
    }
}

void onEnterSuddenDeath(GameModeState* state)
{
    gmVsMelee_EnterSuddenDeath(state, gmVsMelee_GetVsData(), NULL, NULL);
}

void onExitSuddenDeath(GameModeState* state)
{
    gmVsMelee_ExitSuddenDeath(state);
}

void onEnterResults(GameModeState* state)
{
    gmVsMelee_EnterResults(state);
}

void onExitResults(GameModeState* state)
{
    gmVsMelee_ExitResults(state, gmVsMelee_GetVsData(), gmVsMode_State_Css);
    if (!gm_WasMatchCanceled(gmVsMelee_ResultsEnterData.match_end.outcome)) {
        gm_801623A4(&gmVsMelee_ResultsEnterData.match_end);
    }
}
