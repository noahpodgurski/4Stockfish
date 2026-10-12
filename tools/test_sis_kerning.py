#!/usr/bin/env python3
"""Compile and run the real SIS line measurement regression test."""
import json
from pathlib import Path
import subprocess
import tempfile
from net_test_support import build_dir, standalone_compile_args

root = Path(__file__).resolve().parent.parent
entries = json.loads((build_dir(root) / "compile_commands.json").read_text())
entry = next(e for e in entries if e["file"].endswith("/baselib/hsd_3A76.c"))
args = standalone_compile_args(entry)
with tempfile.TemporaryDirectory(prefix="melee-sis-test-") as directory:
    exe = Path(directory) / "sis_kerning_test"
    subprocess.run(args + ["-UNDEBUG", "-ffunction-sections", "-fdata-sections",
                          "-Wl,--gc-sections", "-no-pie", str(root / "tools/test_sis_kerning.c"),
                          "-o", str(exe)], cwd=entry["directory"], check=True)
    subprocess.run([str(exe)], check=True)
