# 4stockfish for melee-pc

A pause-menu combo advisor. Pause during a match and the game searches ahead from that exact frame by actually simulating it. It then lists up to 3 input sequences for the human player, each with the damage or stock that its simulation produced. Picking one plays it back in real time, then rewinds to the pause.

A GameCube version already exists in the sibling `melee` repo (branch `4stockfish`, `src/melee/sf/stockfish.c`, notes in `melee/CLAUDE.md`). This document says what to keep from it, what melee-pc already provides that replaces most of it, and how to build it here. Written against melee-pc `0cc24fee`. Line numbers below drift, so search for the function names.

## Short answer: is the PC faster?

Yes, by a lot, but not for the reason of "many cores" alone.

| | GameCube build (Dolphin) | melee-pc native |
| --- | --- | --- |
| One simulation tick | emulated PPC; paced by the pad alarm; about 4 logic ticks per screen refresh at best | about 1 ms or less on a desktop CPU (rollback re-runs 7 frames in under 8 ms, 4 players, `docs/netcode-plan.md` M1 row) |
| State save/restore | hand-written: fighter bytes, two 0x8000 animation archives, items, StaticPlayer, RNG, clock. Misses effects, camera, stage | `snapshot_take` / `snapshot_restore` in `src/pc/net_snapshot.c`: every game static plus every live heap except audio, about 5.6 MB, about 0.6 ms |
| Memory for buffers | about 2 MB of game heap, and `HSD_MemAlloc` hangs when full | host `malloc`; 50 snapshots is about 280 MB, which is fine |
| Skeleton/pose after restore | had to call `ftAnim_8006EBE8` by hand to resync bones | JObj/AObj state is in the heaps, so it is restored exactly |

Two things limit the PC version, and the design below is shaped by them.

1. **The simulation is single-threaded and global.** All game state lives at fixed addresses: MEM1 at `0x80000000` and the decomp statics in the executable. One process can run one simulation at a time. Using more cores means more processes (Phase 3), not threads.
2. **A full restore costs about as much as a tick.** 5.6 MB of `memcpy` per trial is roughly 0.6 ms against roughly 1 ms of tick. Snapshot cost and the number of trials matter as much as raw speed.

Rough budget, one process: one trial is a restore plus one tick, about 1.5 ms. The GameCube search (beam of 3, 72 inputs per frame, 30 frames) is 6,480 trials, so about 10 s. Duplicate-state pruning (below) should cut that several times over. Measure before tuning; the numbers above come from the netcode docs, not from a search run.

## What the player gets

Same as the GameCube version, so the two stay recognisable:

- Pause with Start during an offline match. The picture holds on that frame.
- The search runs. On PC it can run in time slices with the menu visible, showing a progress bar and the best lines found so far (the GameCube version had to hide everything).
- Up to 3 lines are listed. Each shows `plus N` (damage) or `KO`, taken from the simulation. A line that deals nothing and takes no stock is never listed.
- D-pad left/right changes the horizon by 15 frames (default 30, range 15 to 180) and restarts the search.
- Stick up/down moves the cursor. A plays the line in real time, holds the result for about 75 frames, then rewinds to the pause.
- Start during the search or the playback cancels back to the paused position.
- The advisor is off during netplay (`net.active`). Any of this would desync a session.

## Where it plugs in

### The tick loop

`gm_801A4D34` in `src/melee/gm/gmscene.c` already separates one tick into `gm_RunSimTick(on_frame, st)`, and already runs extra ticks from the scene loop for rollback:

```c
gm_RunSimTick(frame_fn, temp_r25);
while (pc_net_after_tick(...)) {
    gm_RunSimTick(frame_fn, temp_r25);
}
```

That is the model. The search must drive ticks **from the scene loop**, never from inside a GObj proc. The GameCube version crashed when it called procs from inside its menu proc: `HSD_GObj_DelayedProcInfo` is global, so a nested `on_invoke` freed GObjs the outer `HSD_GObj_RunProcs` was still walking.

Add one hook next to the netcode one, for example:

```c
/* PORT: 4stockfish search; runs its own ticks between presents. */
if (pc_sf_searching()) {
    pc_sf_slice(frame_fn, temp_r25); /* restore/inject/tick until the time budget, then restore root */
    /* skip the game render; the overlay draws over the preserved frame */
}
```

Skip `HSD_StartRender` / `HSD_GObj_80390FC0` while searching and call `aurora_preserve_frame_buffer(true)`. That is how the F1 overlay holds the last frame (`src/pc/vi.c`, `pc_frame_boundary`). Do not block inside `VIWaitForRetrace` the way F1 does. The search needs the game thread.

### Code layout

Follow the boundary rule in `CODING_STYLE.md`: the decomp side stays decomp-shaped and talks to the platform through small `pc_*` hooks.

| Piece | Where | Notes |
| --- | --- | --- |
| Pause detection, menu state, input names, SIS text menu | `src/melee/sf/stockfish.c` | Port from the GameCube file: `sf_menu_proc`, `sf_build_combos`, `sf_format_seq`, `sf_draw_menu`, `sf_pick_pair`. Drop all of its snapshot code (`SFSnap`, `sf_buf_*`, `sf_resync_pose`, `sf_keep_*`) |
| Search engine | `src/pc/sf_search.c` (C11) | Owns snapshots, the beam, scoring, time slicing |
| Hook into the scene loop | `src/melee/gm/gmscene.c`, tagged `/* PORT: */` | Like the `pc_net_after_tick` loop |
| Optional nicer UI | RmlUi panel next to the F1 overlay in `src/pc/launcher.cpp` | Only if controller navigation there is already solid; the SIS menu works on both builds |
| Build | `CMakeLists.txt` source list | |

The fighter hook from the GameCube build (`Stockfish_OnFighterUpdate` in `Fighter_procUpdate`, creating a p_link 0 GObj that still runs while paused) works here unchanged, and is still the simplest way to watch for the pause and read the pad.

## Reuse from the netcode (most of the hard parts)

| Need | Existing piece | How to use it |
| --- | --- | --- |
| Save/restore everything | `snapshot_take`, `snapshot_restore`, `snapshot_unusable` (`src/pc/net_snapshot.c`) | Root, per-beam and scratch snapshots. Check `snapshot_unusable(root)` before each restore and abort the search if it reports a scene or heap change |
| Keep the live pad queue across a restore | `rollback_to` in `src/pc/net.c` | Copy its pattern: save `HSD_PadLibData` and the queue with interrupts off, restore, put them back. Otherwise every restore rewinds the real controller stream |
| Feed one input to one tick | `write_head` / `unconsume` in `net.c` | Write the attacker's `PADStatus` into the queue head right before `gm_RunSimTick`, so `HSD_PadRenewMasterStatus` derives Master, Copy and Game status the normal way. The GameCube build poked `HSD_PadGameStatus` from a proc instead; do not copy that |
| Pad alarm slipping a raw sample in | §13 Defect A in `docs/netcode-plan.md` | Due alarms fire from any `OSRestoreInterrupts`. Re-resolve the head slot right before writing it and use queue type 2 while searching, as the netcode does |
| Sound state the sim reads | `pc_net_audio_deaf`, the audio journal (`net.c`) | Search ticks must answer "not playing" (deaf) and start no sounds. Generalise the `net.active` checks to "netplay or search" |
| Sound effects | `net_sfx_*` | Mute all starts during search ticks. Only the A playback should be audible |
| Disc reads | `snapshot_refused_io`, `aurora_dvd_inflight`, `aurora_arq_inflight` | A tick that issues a read cannot be re-run. If one appears during a trial, drop that branch; if it appears at the root, refuse to search |
| Purity check | `MELEE_NET_SYNCTEST` (`synctest_after_tick`), `state_hash` | Use to validate the search loop itself: restore, tick, hash, restore, tick, hash must match |

Also suppress during search ticks:

- Slippi recording, `pc_slp_tick_begin` / `pc_slp_tick_end`. Otherwise the `.slp` gets thousands of fake frames.
- Rumble.
- Anything in `src/pc` that counts frames for pacing or the netcode (`net.frame` must not move).

## Search design

### Root

1. On the pause edge, record the pause bit (`gm_GetDbPauseFlag(1|2)`) and pick attacker (first human) and victim (nearest other fighter), as `sf_pick_pair` does.
2. Clear the pause flag, hide the pause graphic (`gm_801A10FC(0)`), and **then** take the root snapshot. Every trial starts unpaused, with no per-trial pause bookkeeping.
3. Read base percent and stocks for the victim.

### Trial

```
restore(parent_state)           // snapshot_restore + live pad queue kept
write_head(attacker_input)      // other humans get neutral
gm_RunSimTick(frame_fn, st)     // the real tick, nothing skipped
read result                     // victim percent delta, stock lost, hitlag, distance
```

KO detection: victim stocks below base, or the victim's GObj changed or sleeps. Do not let a trial end the match. If the outcome logic (`gm_GetMatchOutcome` path) would fire, stop there, score it as a KO, and restore.

### Inputs per frame

Start with the GameCube set so results are comparable: 9 stick directions (neutral, 4 cardinals, 4 diagonals) times 8 button sets (none, A, B, shield, and their combinations), 72 in total. Shield is `L` digital plus full analog. Names stay inside the SIS charset (letters, digits, space, comma; no `+` or `%`).

With the PC budget, the following become worth adding later: C-stick smashes and aerials, jump (X), Z grab, half-tilt stick magnitudes. Every addition multiplies the trial count, so add them only behind pruning.

### Pruning duplicate states (the big win)

During hitlag, startup and endlag, most of the 72 inputs produce the same state. Hash a small fingerprint after each trial: for each fighter, position, velocity, `motion_id`, animation frame, percent, hitlag, hitstun, the held-button history, plus the RNG seed. Keep only the first trial per fingerprint at each depth. Do not use the full `state_hash` for this: it walks all 5.6 MB.

### Beam

The GameCube build kept 3 beams (best damage/stock, best hitlag, closest distance). With PC memory, keep a wider beam (start at 16 to 32) with diversity: no two beams share the same last few inputs. Each beam owns a snapshot taken when it was accepted, so no beam is ever replayed from the root. The GameCube build added the same idea late (`sf_alloc_beams`). Score order: KO, then damage, then victim in hitlag or hitstun, then distance.

### Publish

At the horizon, take the best 3 distinct lines with damage > 0 or a KO. Then **verify** each one: restore root and replay the whole line once, straight through, and keep the number from that run. This catches non-purity (see Risks) and is cheap: 3 times the horizon in ticks.

### Time slicing

Run trials until about 12 ms of the 16.7 ms present has gone. Restore the root (so anything that renders sees the paused frame), update the overlay with progress and best-so-far, and present. Start cancels between slices. A horizon change restarts from the root snapshot.

## Playback after A

The GameCube flow carries over: build the per-frame script, clear pause, inject one input per real tick through the normal (non-search) path, re-pause at the end, show the result for about 75 frames, then `snapshot_restore(root)` and return to the menu. Sound is on during playback; it is real play. On PC the rewind is exact, including effects, camera and stage, which the GameCube version could not do.

## Phases

1. **Single process, correct.** Hooks, root snapshot, 72 inputs, beam of 3, verify step, SIS menu, A playback. Pass condition: on FD, Fox vs a CPU at 0 percent, the listed `plus N` matches the A playback every time.
2. **Fast.** Fingerprint pruning, wider beam, time-sliced search with a live menu. If restore dominates (likely, at 0.6 ms of a 1.5 ms trial), add Windows write tracking: allocate MEM1 with `MEM_WRITE_WATCH` in `OSInit` and use `GetWriteWatch` / `ResetWriteWatch` to copy back only touched pages. The decomp statics (about 2.2 MB) still need a full copy. Measure first; the netcode note says to optimise only past 2 ms.
3. **Many cores (optional).** Worker processes: the same `melee.exe` started with a worker flag, no window, no Dawn device, no audio. The main process sends one full MEM1 image plus the statics and heap descriptors through a file mapping. Workers run trial batches and send back fingerprints and scores. This works only because MEM1 and the image base are fixed on Windows (`OSInit` `VirtualAlloc2`, `--image-base 0x10000000 --disable-dynamicbase`). It needs a headless boot path that does not exist yet, and every worker must be the identical build. Do this only if Phase 2 is still too slow for the horizons people use.

## Risks and things to check first

- **The tick is not yet a pure function of (state, inputs).** `MELEE_NET_SYNCTEST` still reports mismatches on a replay (§13 of `docs/netcode-plan.md`). A trial's result may differ slightly from playback. The verify step catches this; log how often it disagrees.
- **Audio branching.** `crowdsfx.c` and `ground.c` ask whether a voice is still playing. Search ticks must be deaf, or results depend on the real audio clock.
- **Disc I/O mid-search.** Stage transformations and some items load files. Branches that start a read are dropped; a pause right after a load (inside the netcode's `IO_QUIET` window) should refuse to search.
- **Pad queue corruption.** If the live queue is not kept across restores, the controller will "replay" old input after the search. Copy `rollback_to`.
- **Out-of-tick RNG draws.** `seed_out_of_tick_check` exists because things outside ticks stir the RNG. Root is snapshotted right after the pause tick, so restores cover it, but do not render between restore and tick.
- **Match end.** A preview or trial that takes the last stock must not end the match. Catch it before the outcome check runs.
- **Netplay.** Disable the advisor entirely while `net.active`, and do not let search state leak into the netcode's rings (`net.frame`, snapshot slots, audit).

## Lessons carried over from the GameCube build

- Never call match procs from inside a proc. Run ticks from the scene loop.
- Never show an estimated number. A line is listed only after a simulation produced it. The GameCube build once showed move-table estimates and players saw `plus 12` turn into 0 on playback.
- Do not draw the game while searching. Hold the frame, draw only the overlay.
- Restore must include the skeleton pose. On PC the full snapshot does this; on GameCube missing it made hitboxes use the previous trial's pose.
