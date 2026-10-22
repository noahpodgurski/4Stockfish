/* SPDX-License-Identifier: GPL-3.0-or-later */
/* The GX texture cache is keyed by ids the fresh process already handed
 * out. A restored match carries the old process's ids, so the next draw
 * would bind the boot match's textures. The clear is an atomic the render
 * thread applies before it resolves samplers. */
namespace aurora::gx {
void clear_static_texture_cache() noexcept;
}

extern "C" void pc_savestate_drop_gfx_cache(void) {
    aurora::gx::clear_static_texture_cache();
}
