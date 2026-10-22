/* SPDX-License-Identifier: GPL-3.0-or-later */
#include "pc/savestate_format.h"

#include <string.h>

/* Fixed header, then one 32-byte record per region, then the payload, then
 * the four-byte end marker. Offsets below are the fixed header. */
enum {
    SAVESTATE_FIXED = 80,
    SAVESTATE_REGION = 32,
};

static void put_u32(uint8_t* p, size_t off, uint32_t v) {
    memcpy(p + off, &v, 4);
}

static void put_u64(uint8_t* p, size_t off, uint64_t v) {
    memcpy(p + off, &v, 8);
}

static void put_i32(uint8_t* p, size_t off, int32_t v) {
    memcpy(p + off, &v, 4);
}

static uint32_t get_u32(const uint8_t* p, size_t off) {
    uint32_t v;
    memcpy(&v, p + off, 4);
    return v;
}

static uint64_t get_u64(const uint8_t* p, size_t off) {
    uint64_t v;
    memcpy(&v, p + off, 8);
    return v;
}

static int32_t get_i32(const uint8_t* p, size_t off) {
    int32_t v;
    memcpy(&v, p + off, 4);
    return v;
}

size_t savestate_relocate(void* p, size_t n, uint64_t lo, uint64_t hi, int64_t delta) {
    size_t moved = 0;
    uint8_t* b = p;
    size_t slots;
    size_t i;
    if (p == NULL || delta == 0 || hi <= lo || n < 8) {
        return 0;
    }
    slots = n / 8;
    for (i = 0; i < slots; i++) {
        uint64_t v;
        memcpy(&v, b + i * 8, 8);
        if (v < lo || v >= hi || (v & 3u) != 0) {
            continue;
        }
        v = (uint64_t)((int64_t)v + delta);
        memcpy(b + i * 8, &v, 8);
        moved++;
    }
    return moved;
}

bool savestate_info_write(FILE* f, const SavestateInfo* info) {
    uint8_t hdr[SAVESTATE_FIXED + SAVESTATE_MAX_REGIONS * SAVESTATE_REGION];
    size_t n;
    int i;
    if (f == NULL || info == NULL || info->nregions < 1 ||
        info->nregions > SAVESTATE_MAX_REGIONS || info->payload_bytes > SAVESTATE_MAX_BYTES) {
        return false;
    }
    memset(hdr, 0, sizeof hdr);
    memcpy(hdr, SAVESTATE_MAGIC, 4);
    put_u32(hdr, 4, SAVESTATE_VERSION);
    put_u64(hdr, 8, info->module_base);
    put_u64(hdr, 16, info->module_size);
    put_u64(hdr, 24, info->mem1_base);
    put_u64(hdr, 32, info->mem1_size);
    put_i32(hdr, 40, info->frame);
    put_i32(hdr, 44, info->scene);
    put_u32(hdr, 48, info->seed_val);
    put_u64(hdr, 56, info->seed_ptr);
    put_i32(hdr, 64, info->nregions);
    put_u64(hdr, 72, info->payload_bytes);
    for (i = 0; i < info->nregions; i++) {
        uint8_t* rec = hdr + SAVESTATE_FIXED + (size_t)i * SAVESTATE_REGION;
        memcpy(rec, info->regions[i].name, SAVESTATE_NAME_LEN);
        rec[SAVESTATE_NAME_LEN - 1] = '\0';
        put_u64(rec, 16, info->regions[i].ptr);
        put_u64(rec, 24, info->regions[i].len);
    }
    n = SAVESTATE_FIXED + (size_t)info->nregions * SAVESTATE_REGION;
    return fwrite(hdr, 1, n, f) == n;
}

bool savestate_info_read(FILE* f, SavestateInfo* info) {
    uint8_t fixed[SAVESTATE_FIXED];
    int i;
    if (f == NULL || info == NULL || fread(fixed, 1, sizeof fixed, f) != sizeof fixed) {
        return false;
    }
    if (memcmp(fixed, SAVESTATE_MAGIC, 4) != 0 || get_u32(fixed, 4) != SAVESTATE_VERSION) {
        return false;
    }
    memset(info, 0, sizeof *info);
    info->module_base = get_u64(fixed, 8);
    info->module_size = get_u64(fixed, 16);
    info->mem1_base = get_u64(fixed, 24);
    info->mem1_size = get_u64(fixed, 32);
    info->frame = get_i32(fixed, 40);
    info->scene = get_i32(fixed, 44);
    info->seed_val = get_u32(fixed, 48);
    info->seed_ptr = get_u64(fixed, 56);
    info->nregions = get_i32(fixed, 64);
    info->payload_bytes = get_u64(fixed, 72);
    if (info->nregions < 1 || info->nregions > SAVESTATE_MAX_REGIONS ||
        info->payload_bytes > SAVESTATE_MAX_BYTES || info->module_size == 0) {
        return false;
    }
    for (i = 0; i < info->nregions; i++) {
        uint8_t rec[SAVESTATE_REGION];
        if (fread(rec, 1, sizeof rec, f) != sizeof rec) {
            return false;
        }
        memcpy(info->regions[i].name, rec, SAVESTATE_NAME_LEN);
        info->regions[i].name[SAVESTATE_NAME_LEN - 1] = '\0';
        info->regions[i].ptr = get_u64(rec, 16);
        info->regions[i].len = get_u64(rec, 24);
    }
    return true;
}

bool savestate_end_write(FILE* f) {
    return f != NULL && fwrite(SAVESTATE_END, 1, 4, f) == 4;
}

bool savestate_end_read(FILE* f) {
    char end[4];
    return f != NULL && fread(end, 1, 4, f) == 4 && memcmp(end, SAVESTATE_END, 4) == 0;
}
