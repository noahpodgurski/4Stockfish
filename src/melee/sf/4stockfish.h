#ifndef MELEE_SF_STOCKFISH_H
#define MELEE_SF_STOCKFISH_H

#include <melee/ft/forward.h>

/// 4stockfish pause menu (4stockfish.md). The search engine is
/// pc/sf_search.c; this side watches the pause, reads the pad and draws.

/// Called from the fighter update: creates the menu GObj once per scene.
void Stockfish_OnFighterUpdate(Fighter_GObj* gobj);

/// Between two ticks, before the root snapshot: the match as if just
/// unpaused, without the audio and with the pause graphic hidden.
void Stockfish_PrepareRoot(int pause_bit);

/// The pause again, as the pause routine sets it, without its sound.
void Stockfish_Repause(int pause_bit);

/// Redraw the menu text from the engine's view.
void Stockfish_Redraw(void);

#endif
