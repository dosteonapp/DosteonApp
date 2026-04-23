#!/usr/bin/env python3
"""Copy the Prisma query engine binary from npm cache to the project root.

Run as the last step of the BUILD command after `prisma generate`:
  pip install -r requirements.txt && python -m prisma generate && python scripts/ensure_prisma_binary.py

`prisma generate` downloads the query engine binary to the npm cache on the BUILD
machine. This script copies it into the project source tree so that Render's
build-to-runtime artifact transfer includes it. Prisma Python finds it at startup
via its local_path check (Path.cwd() / "prisma-query-engine-debian-openssl-3.0.x").

The npm package names the binary without the "prisma-" prefix; Prisma Python
expects the prefix. This script bridges that gap.
"""
import stat
import subprocess
import sys
from pathlib import Path

_PLATFORM = "debian-openssl-3.0.x"
_BINARY_NAME = f"prisma-query-engine-{_PLATFORM}"      # what Prisma Python looks for
_NPM_BINARY_NAME = f"query-engine-{_PLATFORM}"         # what the npm package names it


def main() -> None:
    target = Path.cwd() / _BINARY_NAME

    if target.exists():
        result = subprocess.run([str(target), "--version"], capture_output=True)
        if result.returncode == 0:
            print(f"[ensure_prisma_binary] Binary already present: {target}")
            return
        print("[ensure_prisma_binary] Binary exists but not executable — re-copying")
        target.unlink()

    result = subprocess.run(
        ["find", "/opt/render/.cache/prisma-python/binaries", "-name", _NPM_BINARY_NAME, "-type", "f"],
        capture_output=True,
        text=True,
    )
    paths = [p.strip() for p in result.stdout.strip().splitlines() if p.strip()]

    if not paths:
        print(
            f"[ensure_prisma_binary] ERROR: '{_NPM_BINARY_NAME}' not found in prisma npm cache.\n"
            "Ensure 'python -m prisma generate' ran successfully before this script.",
            file=sys.stderr,
        )
        sys.exit(1)

    src = Path(paths[0])
    target.write_bytes(src.read_bytes())
    target.chmod(target.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    result = subprocess.run([str(target), "--version"], capture_output=True)
    if result.returncode != 0:
        print("[ensure_prisma_binary] ERROR: binary copied but failed --version check", file=sys.stderr)
        sys.exit(1)

    print(f"[ensure_prisma_binary] Binary copied to {target}")


if __name__ == "__main__":
    main()
