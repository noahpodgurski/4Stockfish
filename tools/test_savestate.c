/* SPDX-License-Identifier: GPL-3.0-or-later */
/* The savestate file header and the pointer slide, without a running game. */
#include "pc/savestate_format.h"

#include <stdio.h>
#include <string.h>

static int s_fail;

#define EXPECT(cond)                                                                               \
    do {                                                                                           \
        if (!(cond)) {                                                                             \
            fprintf(stderr, "%s:%d: FAILED: %s\n", __FILE__, __LINE__, #cond);                     \
            s_fail++;                                                                              \
        }                                                                                          \
    } while (0)

static void test_relocate(void) {
    uint64_t buf[5];
    uint64_t odd = 0x1001;
    buf[0] = 0;
    buf[1] = 0x1000;
    buf[2] = 0x1008;
    buf[3] = 42;
    buf[4] = 0x1004; /* pointer to an interior field */
    EXPECT(savestate_relocate(buf, sizeof buf, 0x1000, 0x2000, 0x5000) == 3);
    EXPECT(buf[0] == 0);
    EXPECT(buf[1] == 0x6000);
    EXPECT(buf[2] == 0x6008);
    EXPECT(buf[3] == 42);
    EXPECT(buf[4] == 0x6004);
    EXPECT(savestate_relocate(&odd, sizeof odd, 0x1000, 0x2000, 0x5000) == 0);
    EXPECT(odd == 0x1001);
    buf[0] = 0x2000; /* hi is exclusive */
    EXPECT(savestate_relocate(buf, 8, 0x1000, 0x2000, 0x10) == 0);
    EXPECT(buf[0] == 0x2000);
    buf[0] = 0x1000;
    EXPECT(savestate_relocate(buf, 8, 0x1000, 0x2000, 0) == 0);
    EXPECT(buf[0] == 0x1000);
}

static void test_header(void) {
    SavestateInfo in, out;
    uint8_t payload[16];
    FILE* f;
    memset(&in, 0, sizeof in);
    in.module_base = 0x140000000ull;
    in.module_size = 0x200000;
    in.mem1_base = 0x80000000ull;
    in.mem1_size = 0x6000000;
    in.frame = 1234;
    in.scene = 2;
    in.seed_val = 0xabcdef01;
    in.seed_ptr = 0x140001234ull;
    in.nregions = 2;
    in.payload_bytes = sizeof payload;
    snprintf(in.regions[0].name, sizeof in.regions[0].name, "data");
    in.regions[0].ptr = 0x140000100ull;
    in.regions[0].len = 8;
    snprintf(in.regions[1].name, sizeof in.regions[1].name, "heap0");
    in.regions[1].ptr = 0x80100000ull;
    in.regions[1].len = 8;
    memset(payload, 0x5a, sizeof payload);
    f = tmpfile();
    EXPECT(f != NULL);
    EXPECT(savestate_info_write(f, &in));
    EXPECT(fwrite(payload, 1, sizeof payload, f) == sizeof payload);
    EXPECT(savestate_end_write(f));
    rewind(f);
    EXPECT(savestate_info_read(f, &out));
    EXPECT(out.module_base == in.module_base);
    EXPECT(out.module_size == in.module_size);
    EXPECT(out.mem1_base == in.mem1_base);
    EXPECT(out.frame == 1234);
    EXPECT(out.scene == 2);
    EXPECT(out.seed_val == 0xabcdef01);
    EXPECT(out.seed_ptr == in.seed_ptr);
    EXPECT(out.nregions == 2);
    EXPECT(out.payload_bytes == sizeof payload);
    EXPECT(strcmp(out.regions[0].name, "data") == 0);
    EXPECT(out.regions[0].ptr == in.regions[0].ptr);
    EXPECT(out.regions[0].len == 8);
    EXPECT(strcmp(out.regions[1].name, "heap0") == 0);
    EXPECT(out.regions[1].ptr == in.regions[1].ptr);
    EXPECT(fread(payload, 1, sizeof payload, f) == sizeof payload);
    EXPECT(payload[0] == 0x5a);
    EXPECT(savestate_end_read(f));
    fclose(f);

    f = tmpfile();
    EXPECT(f != NULL);
    EXPECT(savestate_info_write(f, &in));
    rewind(f);
    EXPECT(savestate_info_read(f, &out));
    EXPECT(!savestate_end_read(f));
    fclose(f);
}

int main(void) {
    test_relocate();
    test_header();
    if (s_fail != 0) {
        fprintf(stderr, "%d failure(s)\n", s_fail);
        return 1;
    }
    printf("ok\n");
    return 0;
}
