/* SPDX-License-Identifier: GPL-3.0-or-later */
/* Dev savestate. Ctrl+S, or Z while the 4stockfish menu is up, copies the
 * rollback snapshot (net_snapshot.c) out to a file. Ctrl+O picks a file and
 * copies it back once this process is in that scene. A later process can
 * still boot with MELEE_SAVESTATE. A file saved from the pause menu still
 * has the pause set, so the menu starts a search on that frame.
 *
 * The snapshot is host addresses: code and statics in the exe, allocations
 * in MEM1. ASLR puts the exe somewhere else next run, so every pointer that
 * fell inside the old image is slid by the difference of the two bases.
 * MEM1 is asked for at a fixed address and usually does not move; when it
 * does, those pointers slide too. The scene has to be the one the file was
 * taken in, because the call stack is not in the snapshot -- the fight
 * loop has to already be the fight loop before its globals are replaced. */
#include "compat.h"
#include "pc/net_internal.h"
#include "pc/savestate.h"
#include "pc/savestate_format.h"
#include "pc/sf_search.h"

#include <dolphin/os.h>

#include <SDL3/SDL_dialog.h>
#include <SDL3/SDL_filesystem.h>
#include <SDL3/SDL_mutex.h>
#include <SDL3/SDL_time.h>

#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#if defined(_WIN32)
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <direct.h>
#include <windows.h>
#elif defined(__APPLE__)
#include <mach-o/dyld.h>
#include <mach-o/loader.h>
#include <sys/stat.h>
#elif defined(__linux__)
#include <sys/stat.h>
#include <unistd.h>
#else
#include <sys/stat.h>
#endif

_Static_assert(SAVESTATE_MAX_REGIONS >= MAX_REGIONS, "savestate region cap");

extern void pc_savestate_drop_gfx_cache(void);

static bool s_save_requested;
static bool s_save_wait_logged;
static bool s_save_ignored_logged;
static int s_generation;
static bool s_message_on;
static char s_message[96];
static SDL_Mutex* s_pick_mu;
static char s_pick_path[1024];
static bool s_pick_ready;
static bool s_dialog_open;
static char s_dialog_dir[1024];

enum { LOAD_NONE = 0, LOAD_UNREAD, LOAD_WAIT, LOAD_DONE, LOAD_FAIL };

static int s_load_state = LOAD_UNREAD;
static int s_frames_since_load = -1;
static SavestateInfo s_load;
static uint8_t* s_payload;
static char s_load_path[1024];
static int s_wait_scene = -2;

static const char* scene_name(int scene) {
    switch (scene) {
    case GS_TITLE:
        return "title";
    case GS_MENU:
        return "menu";
    case GS_VS:
        return "vs";
    case GS_SUDDEN_DEATH:
        return "sudden death";
    case GS_TRAINING:
        return "training";
    case GS_RESULTS:
        return "results";
    case GS_CSS:
        return "css";
    case GS_SSS:
        return "sss";
    default:
        return "other";
    }
}

static bool module_span(uint64_t* base, uint64_t* size) {
#if defined(_WIN32)
    HMODULE mod = GetModuleHandleA(NULL);
    IMAGE_DOS_HEADER* dos;
    IMAGE_NT_HEADERS* nt;
    if (mod == NULL) {
        return false;
    }
    dos = (IMAGE_DOS_HEADER*)mod;
    if (dos->e_magic != IMAGE_DOS_SIGNATURE || dos->e_lfanew <= 0) {
        return false;
    }
    nt = (IMAGE_NT_HEADERS*)((uint8_t*)mod + dos->e_lfanew);
    if (nt->Signature != IMAGE_NT_SIGNATURE || nt->OptionalHeader.SizeOfImage == 0) {
        return false;
    }
    *base = (uint64_t)(uintptr_t)mod;
    *size = nt->OptionalHeader.SizeOfImage;
    return true;
#elif defined(__APPLE__)
    const struct mach_header* mh = _dyld_get_image_header(0);
    intptr_t slide = _dyld_get_image_vmaddr_slide(0);
    const struct load_command* lc;
    uint32_t ncmds, i;
    uint64_t lo = UINT64_MAX, hi = 0;
    if (mh == NULL || mh->magic != MH_MAGIC_64) {
        return false;
    }
    ncmds = ((const struct mach_header_64*)mh)->ncmds;
    lc = (const struct load_command*)((const struct mach_header_64*)mh + 1);
    for (i = 0; i < ncmds; i++) {
        if (lc->cmd == LC_SEGMENT_64) {
            const struct segment_command_64* seg = (const struct segment_command_64*)lc;
            uint64_t start, end;
            if (strcmp(seg->segname, "__PAGEZERO") != 0 && seg->vmsize != 0) {
                start = (uint64_t)(seg->vmaddr + (uint64_t)slide);
                end = start + seg->vmsize;
                if (start < lo) {
                    lo = start;
                }
                if (end > hi) {
                    hi = end;
                }
            }
        }
        lc = (const struct load_command*)((const char*)lc + lc->cmdsize);
    }
    if (hi <= lo) {
        return false;
    }
    *base = lo;
    *size = hi - lo;
    return true;
#elif defined(__linux__)
    char exe[2048];
    char line[2048];
    ssize_t en = readlink("/proc/self/exe", exe, sizeof exe - 1);
    FILE* f;
    uint64_t lo = UINT64_MAX, hi = 0;
    bool any = false;
    if (en <= 0) {
        return false;
    }
    exe[en] = '\0';
    f = fopen("/proc/self/maps", "r");
    if (f == NULL) {
        return false;
    }
    while (fgets(line, sizeof line, f) != NULL) {
        unsigned long start, end;
        if (strstr(line, exe) == NULL || sscanf(line, "%lx-%lx", &start, &end) != 2) {
            continue;
        }
        if ((uint64_t)start < lo) {
            lo = (uint64_t)start;
        }
        if ((uint64_t)end > hi) {
            hi = (uint64_t)end;
        }
        any = true;
    }
    fclose(f);
    if (!any || hi <= lo) {
        return false;
    }
    *base = lo;
    *size = hi - lo;
    return true;
#else
    (void)base;
    (void)size;
    return false;
#endif
}

static int mkdir_one(const char* path) {
#if defined(_WIN32)
    return _mkdir(path);
#else
    return mkdir(path, 0755);
#endif
}

static void savestate_dir(char* out, size_t cap) {
    const char* env = getenv("MELEE_SAVESTATE_DIR");
    const char* base;
    size_t n;
    if (env != NULL && env[0] != '\0') {
        snprintf(out, cap, "%s", env);
        return;
    }
    /* SDL owns this string; it stays valid and ends with a separator. */
    base = SDL_GetBasePath();
    if (base == NULL) {
        snprintf(out, cap, "savestates");
        return;
    }
    n = strlen(base);
    while (n > 0 && (base[n - 1] == '/' || base[n - 1] == '\\')) {
        n--;
    }
    while (n > 0 && base[n - 1] != '/' && base[n - 1] != '\\') {
        n--;
    }
    if (n == 0) {
        snprintf(out, cap, "savestates");
    } else {
        snprintf(out, cap, "%.*ssavestates", (int)n, base);
    }
}

static const Region* find_now(const Region* regs, int n, const char* name) {
    int i;
    for (i = 0; i < n; i++) {
        if (regs[i].name != NULL && strcmp(regs[i].name, name) == 0) {
            return &regs[i];
        }
    }
    return NULL;
}

static const SavestateRegion* find_saved(const SavestateInfo* info, const char* name) {
    int i;
    for (i = 0; i < info->nregions; i++) {
        if (strcmp(info->regions[i].name, name) == 0) {
            return &info->regions[i];
        }
    }
    return NULL;
}

static uint64_t slide(uint64_t v, uint64_t lo, uint64_t hi, int64_t delta) {
    if (delta != 0 && v >= lo && v < hi) {
        return (uint64_t)((int64_t)v + delta);
    }
    return v;
}

static void set_message(const char* s) {
    if (s == NULL || s[0] == '\0') {
        s_message_on = false;
        return;
    }
    snprintf(s_message, sizeof s_message, "%s", s);
    s_message_on = true;
}

static bool ensure_pick_mu(void) {
    if (s_pick_mu == NULL) {
        s_pick_mu = SDL_CreateMutex();
    }
    return s_pick_mu != NULL;
}

static FILE* open_rb(const char* path) {
#if defined(_WIN32)
    wchar_t wide[1024];
    if (MultiByteToWideChar(CP_UTF8, 0, path, -1, wide, (int)(sizeof wide / sizeof wide[0])) <= 0) {
        return NULL;
    }
    return _wfopen(wide, L"rb");
#else
    return fopen(path, "rb");
#endif
}

static bool write_one(const char* path, const SavestateInfo* info, const void* payload) {
    FILE* f = fopen(path, "wb");
    bool ok;
    if (f == NULL) {
        return false;
    }
    ok = savestate_info_write(f, info) &&
         fwrite(payload, 1, (size_t)info->payload_bytes, f) == (size_t)info->payload_bytes &&
         savestate_end_write(f);
    if (fclose(f) != 0) {
        ok = false;
    }
    if (!ok) {
        remove(path);
    }
    return ok;
}

static void flush_save(void) {
    static Snapshot snap;
    SavestateInfo info;
    char dir[1024];
    char path[1100];
    char latest[1100];
    char stamp[32];
    SDL_Time now = 0;
    SDL_DateTime local;
    uint64_t base = 0, size = 0;
    int i;
    int suffix;
    if (!s_save_requested || pc_sf_sim_tick()) {
        return;
    }
    if (s_load_state == LOAD_WAIT || s_load_state == LOAD_UNREAD) {
        if (!s_save_ignored_logged) {
            s_save_ignored_logged = true;
            pc_log_line(
                "savestate: Ctrl+S ignored until the file from MELEE_SAVESTATE is restored");
        }
        return;
    }
    if (pc_net_active()) {
        pc_log_line("savestate: not saved during netplay");
        s_save_requested = false;
        return;
    }
    if (!module_span(&base, &size) || OSBaseAddress == 0) {
        pc_log_line("savestate: not saved, memory layout is not ready");
        s_save_requested = false;
        return;
    }
    if (!snapshot_take(&snap, pc_net_frame())) {
        if (snapshot_refused_io()) {
            if (!s_save_wait_logged) {
                s_save_wait_logged = true;
                pc_log_line("savestate: waiting for a disc transfer to finish");
            }
            return;
        }
        pc_log_line("savestate: snapshot failed%s",
            snapshot_state_region_missing() != NULL ? " (no state section)" : "");
        s_save_requested = false;
        return;
    }
    s_save_wait_logged = false;
    if (snap.nregions < 1 || snap.nregions > SAVESTATE_MAX_REGIONS || snap.buf == NULL ||
        snap.used == 0 || snap.used > SAVESTATE_MAX_BYTES)
    {
        pc_log_line("savestate: snapshot was empty");
        s_save_requested = false;
        return;
    }
    memset(&info, 0, sizeof info);
    info.module_base = base;
    info.module_size = size;
    info.mem1_base = (uint64_t)OSBaseAddress;
    info.mem1_size = PC_MEM1_SIZE;
    info.frame = snap.frame;
    info.scene = snap.scene;
    info.seed_val = snap.seed_val;
    info.seed_ptr = (uint64_t)(uintptr_t)snap.seed_ptr;
    info.nregions = snap.nregions;
    info.payload_bytes = snap.used;
    for (i = 0; i < snap.nregions; i++) {
        snprintf(info.regions[i].name, SAVESTATE_NAME_LEN, "%s",
            snap.regions[i].name != NULL ? snap.regions[i].name : "?");
        info.regions[i].ptr = (uint64_t)(uintptr_t)snap.regions[i].ptr;
        info.regions[i].len = snap.regions[i].len;
    }
    savestate_dir(dir, sizeof dir);
    if (mkdir_one(dir) != 0 && errno != EEXIST) {
        pc_log_line("savestate: cannot create %s", dir);
        s_save_requested = false;
        return;
    }
    SDL_GetCurrentTime(&now);
    if (!SDL_TimeToDateTime(now, &local, true)) {
        memset(&local, 0, sizeof local);
    }
    snprintf(stamp, sizeof stamp, "%04d%02d%02dT%02d%02d%02d", local.year, local.month, local.day,
        local.hour, local.minute, local.second);
    snprintf(path, sizeof path, "%s/state_%s.msv", dir, stamp);
    suffix = 2;
    while (suffix < 100) {
        FILE* existing = fopen(path, "rb");
        if (existing == NULL) {
            break;
        }
        fclose(existing);
        snprintf(path, sizeof path, "%s/state_%s_%d.msv", dir, stamp, suffix);
        suffix++;
    }
    snprintf(latest, sizeof latest, "%s/latest.msv", dir);
    if (!write_one(path, &info, snap.buf) || !write_one(latest, &info, snap.buf)) {
        pc_log_line("savestate: could not write %s", path);
        s_save_requested = false;
        return;
    }
    s_save_requested = false;
    set_message("saved");
    pc_log_line("savestate: wrote %s (%.2f MB, %s, frame %d). latest.msv matches it", path,
        snap.used / 1048576.0, scene_name(snap.scene), snap.frame);
}

static void fail_load(const char* why) {
    pc_log_line(
        "savestate: %s (%s)", why, s_load_path[0] != '\0' ? s_load_path : "MELEE_SAVESTATE");
    free(s_payload);
    s_payload = NULL;
    s_load_state = LOAD_FAIL;
    set_message("load failed");
}

static void read_path(const char* path) {
    FILE* f;
    free(s_payload);
    s_payload = NULL;
    s_frames_since_load = -1;
    snprintf(s_load_path, sizeof s_load_path, "%s", path);
    f = open_rb(s_load_path);
    if (f == NULL || !savestate_info_read(f, &s_load)) {
        if (f != NULL) {
            fclose(f);
        }
        fail_load("cannot read");
        return;
    }
    if (s_load.payload_bytes == 0) {
        fclose(f);
        fail_load("file has no payload");
        return;
    }
    s_payload = (uint8_t*)malloc((size_t)s_load.payload_bytes);
    if (s_payload == NULL ||
        fread(s_payload, 1, (size_t)s_load.payload_bytes, f) != (size_t)s_load.payload_bytes ||
        !savestate_end_read(f))
    {
        fclose(f);
        fail_load("file is truncated or too large");
        return;
    }
    fclose(f);
    s_load_state = LOAD_WAIT;
    set_message("loading");
    pc_log_line("savestate: read %s (%.2f MB, %s). waiting for that scene", s_load_path,
        s_load.payload_bytes / 1048576.0, scene_name(s_load.scene));
}

static void read_env(void) {
    const char* path = getenv("MELEE_SAVESTATE");
    s_load_state = LOAD_NONE;
    if (path == NULL || path[0] == '\0') {
        return;
    }
    read_path(path);
}

static void apply_load(void) {
    Region now[MAX_REGIONS];
    const Region* data;
    const Region* bss;
    const SavestateRegion* saved_data;
    const SavestateRegion* saved_bss;
    Snapshot snap;
    uint64_t base = 0, size = 0;
    uint64_t mem1;
    int64_t image_delta, mem1_delta;
    int n, i;
    uint64_t sum;
    size_t moved;
    int scene;
    if (s_load_state != LOAD_WAIT || pc_sf_sim_tick()) {
        return;
    }
    if (pc_net_active()) {
        fail_load("refusing to restore during netplay");
        return;
    }
    scene = scene_kind();
    if (scene != s_load.scene) {
        if (scene != s_wait_scene) {
            s_wait_scene = scene;
            pc_log_line("savestate: waiting for %s, currently %s", scene_name(s_load.scene),
                scene_name(scene));
        }
        return;
    }
    if (!module_span(&base, &size) || OSBaseAddress == 0) {
        return;
    }
    if (size != s_load.module_size) {
        fail_load("this executable does not match the savestate");
        return;
    }
    mem1 = (uint64_t)OSBaseAddress;
    if (s_load.mem1_size != PC_MEM1_SIZE) {
        fail_load("MEM1 size does not match");
        return;
    }
    n = snapshot_regions(now, MAX_REGIONS);
    data = find_now(now, n, "data");
    bss = find_now(now, n, "bss");
    saved_data = find_saved(&s_load, "data");
    saved_bss = find_saved(&s_load, "bss");
    if (data == NULL || bss == NULL || saved_data == NULL || saved_bss == NULL) {
        fail_load("savestate has no data/bss regions");
        return;
    }
    if (saved_data->len != data->len || saved_bss->len != bss->len ||
        saved_data->ptr - s_load.module_base != (uint64_t)(uintptr_t)data->ptr - base ||
        saved_bss->ptr - s_load.module_base != (uint64_t)(uintptr_t)bss->ptr - base)
    {
        fail_load("this executable does not match the savestate");
        return;
    }
    image_delta = (int64_t)base - (int64_t)s_load.module_base;
    mem1_delta = (int64_t)mem1 - (int64_t)s_load.mem1_base;
    sum = 0;
    memset(&snap, 0, sizeof snap);
    snap.buf = s_payload;
    snap.nregions = s_load.nregions;
    snap.frame = s_load.frame;
    snap.scene = s_load.scene;
    snap.seed_val = s_load.seed_val;
    for (i = 0; i < s_load.nregions; i++) {
        const SavestateRegion* r = &s_load.regions[i];
        uint64_t dest;
        if (r->len > s_load.payload_bytes || sum + r->len < sum ||
            sum + r->len > s_load.payload_bytes)
        {
            fail_load("region lengths do not match the payload");
            return;
        }
        sum += r->len;
        if (strcmp(r->name, "data") == 0) {
            dest = (uint64_t)(uintptr_t)data->ptr;
        } else if (strcmp(r->name, "bss") == 0) {
            dest = (uint64_t)(uintptr_t)bss->ptr;
        } else {
            dest = (uint64_t)((int64_t)r->ptr + mem1_delta);
            if (dest < mem1 || r->len > s_load.mem1_size || dest + r->len > mem1 + s_load.mem1_size)
            {
                fail_load("a heap region falls outside MEM1");
                return;
            }
        }
        snap.regions[i].name = r->name;
        snap.regions[i].ptr = (void*)(uintptr_t)dest;
        snap.regions[i].len = (size_t)r->len;
    }
    if (sum != s_load.payload_bytes) {
        fail_load("region lengths do not match the payload");
        return;
    }
    moved = savestate_relocate(s_payload, (size_t)s_load.payload_bytes, s_load.module_base,
        s_load.module_base + s_load.module_size, image_delta);
    moved += savestate_relocate(s_payload, (size_t)s_load.payload_bytes, s_load.mem1_base,
        s_load.mem1_base + s_load.mem1_size, mem1_delta);
    snap.seed_ptr = (u32*)(uintptr_t)slide(
        s_load.seed_ptr, s_load.module_base, s_load.module_base + s_load.module_size, image_delta);
    snap.seed_ptr = (u32*)(uintptr_t)slide((uint64_t)(uintptr_t)snap.seed_ptr, s_load.mem1_base,
        s_load.mem1_base + s_load.mem1_size, mem1_delta);
    if (snap.seed_ptr == NULL) {
        fail_load("savestate has no RNG seed");
        return;
    }
    if (mem1_delta != 0) {
        pc_log_line(
            "savestate: MEM1 moved by %+lld; restore may be unstable", (long long)mem1_delta);
    }
    snapshot_restore(&snap);
    pc_savestate_drop_gfx_cache();
    /* Before this tick's search slice. The old root must not be written
     * back over the file. */
    pc_sf_on_loaded();
    free(s_payload);
    s_payload = NULL;
    s_load_state = LOAD_DONE;
    s_frames_since_load = 0;
    s_generation++;
    set_message("loaded");
    pc_log_line("savestate: restored %s (%s, frame %d, image %+lld, %zu pointers)", s_load_path,
        scene_name(s_load.scene), s_load.frame, (long long)image_delta, moved);
}

static void take_pick(void) {
    char path[1024];
    bool ready = false;
    if (s_pick_mu == NULL) {
        return;
    }
    SDL_LockMutex(s_pick_mu);
    if (s_pick_ready) {
        snprintf(path, sizeof path, "%s", s_pick_path);
        s_pick_ready = false;
        ready = true;
    }
    SDL_UnlockMutex(s_pick_mu);
    if (!ready) {
        return;
    }
    if (pc_net_active()) {
        set_message("not during netplay");
        return;
    }
    if (s_load_state == LOAD_WAIT || s_load_state == LOAD_UNREAD) {
        SDL_LockMutex(s_pick_mu);
        s_pick_ready = true;
        SDL_UnlockMutex(s_pick_mu);
        set_message("still loading");
        return;
    }
    read_path(path);
}

static void on_dialog(void* userdata, const char* const* filelist, int filter) {
    (void)userdata;
    (void)filter;
    if (!ensure_pick_mu()) {
        return;
    }
    SDL_LockMutex(s_pick_mu);
    s_dialog_open = false;
    if (filelist != NULL && filelist[0] != NULL) {
        snprintf(s_pick_path, sizeof s_pick_path, "%s", filelist[0]);
        s_pick_ready = true;
    }
    SDL_UnlockMutex(s_pick_mu);
}

void pc_savestate_request_save(void) {
    s_save_requested = true;
}

void pc_savestate_request_open(void) {
    static const SDL_DialogFileFilter filters[] = {
        {"Melee savestate", "msv"},
        {"All files", "*"},
    };
    SDL_Window* window = NULL;
    SDL_Window** wins;
    int n = 0;
    bool open;
    if (pc_net_active()) {
        set_message("not during netplay");
        return;
    }
    if (!ensure_pick_mu()) {
        set_message("load failed");
        return;
    }
    SDL_LockMutex(s_pick_mu);
    open = s_dialog_open;
    if (!open) {
        s_dialog_open = true;
    }
    SDL_UnlockMutex(s_pick_mu);
    if (open) {
        return;
    }
    savestate_dir(s_dialog_dir, sizeof s_dialog_dir);
    wins = SDL_GetWindows(&n);
    if (wins != NULL && n > 0) {
        window = wins[0];
    }
    SDL_free(wins);
    set_message("choose a file");
    SDL_ShowOpenFileDialog(on_dialog, NULL, window, filters, 2,
        s_dialog_dir[0] != '\0' ? s_dialog_dir : NULL, false);
}

int pc_savestate_generation(void) {
    return s_generation;
}

const char* pc_savestate_message(void) {
    return s_message_on ? s_message : NULL;
}

void pc_savestate_on_frame(void) {
    if (s_load_state == LOAD_UNREAD) {
        read_env();
    }
    flush_save();
}

void pc_savestate_on_tick(void) {
    if (pc_sf_sim_tick()) {
        return;
    }
    if (s_load_state == LOAD_UNREAD) {
        read_env();
    }
    take_pick();
    apply_load();
    if (s_load_state == LOAD_DONE && s_frames_since_load >= 0) {
        s_frames_since_load++;
    }
    flush_save();
}

int pc_savestate_frames_since_load(void) {
    return s_frames_since_load;
}
