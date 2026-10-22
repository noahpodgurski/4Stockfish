/* SPDX-License-Identifier: GPL-3.0-or-later */
/* On-disk layout for a dev savestate (src/pc/savestate.c). Native endian,
 * same machine and the same build: the bytes are a rollback snapshot, and
 * the header records where the executable and MEM1 lived so the loader can
 * slide pointers. */
#ifndef PC_SAVESTATE_FORMAT_H
#define PC_SAVESTATE_FORMAT_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdio.h>

#define SAVESTATE_MAGIC "MSV1"
#define SAVESTATE_END "END1"
#define SAVESTATE_VERSION 1
#define SAVESTATE_NAME_LEN 16
#define SAVESTATE_MAX_REGIONS 12
#define SAVESTATE_MAX_BYTES (64u * 1024u * 1024u)

typedef struct SavestateRegion {
    char name[SAVESTATE_NAME_LEN];
    uint64_t ptr;
    uint64_t len;
} SavestateRegion;

typedef struct SavestateInfo {
    uint64_t module_base;
    uint64_t module_size;
    uint64_t mem1_base;
    uint64_t mem1_size;
    int32_t frame;
    int32_t scene;
    uint32_t seed_val;
    uint64_t seed_ptr;
    int32_t nregions;
    SavestateRegion regions[SAVESTATE_MAX_REGIONS];
    uint64_t payload_bytes;
} SavestateInfo;

/* Add `delta` to every 8-byte-aligned slot in [p, p+n) whose value lies in
 * [lo, hi) and is 4-byte aligned (a pointer, including one to an interior
 * field). `hi` is exclusive. A zero delta changes nothing. Returns how many
 * slots moved. */
size_t savestate_relocate(void* p, size_t n, uint64_t lo, uint64_t hi, int64_t delta);

bool savestate_info_write(FILE* f, const SavestateInfo* info);
bool savestate_info_read(FILE* f, SavestateInfo* info);
bool savestate_end_write(FILE* f);
bool savestate_end_read(FILE* f);

#endif
