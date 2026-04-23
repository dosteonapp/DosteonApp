#!/usr/bin/env python3
"""Download the Prisma query engine binary to the project root if not already present.

Run before gunicorn in the start command so the binary exists when the app boots.
Needed because Render's build and runtime are separate machines — the binary
downloaded during `prisma generate` in the build phase is not available at runtime.
"""
import gzip
import stat
import subprocess
import sys
import urllib.request
from pathlib import Path

_FALLBACK_HASH = "393aa359c9ad4a4bb28630fb5613f9c281cde053"
_PLATFORM = "debian-openssl-3.0.x"
_BINARY_NAME = f"prisma-query-engine-{_PLATFORM}"


def _engine_hash() -> str:
    try:
        from prisma._config import DefaultConfig
        return DefaultConfig().expected_engine_version
    except Exception:
        return _FALLBACK_HASH


def main() -> None:
    target = Path.cwd() / _BINARY_NAME
    hash_ = _engine_hash()
    url = f"https://binaries.prisma.sh/all_commits/{hash_}/{_PLATFORM}/query-engine.gz"

    if target.exists():
        result = subprocess.run([str(target), "--version"], capture_output=True)
        if result.returncode == 0:
            print(f"[ensure_prisma_binary] Binary already present and executable: {target}")
            return
        print("[ensure_prisma_binary] Binary exists but not executable — re-downloading")
        target.unlink()

    print(f"[ensure_prisma_binary] Downloading from {url} ...")
    gz_data = urllib.request.urlopen(url).read()
    target.write_bytes(gzip.decompress(gz_data))
    target.chmod(target.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    result = subprocess.run([str(target), "--version"], capture_output=True)
    if result.returncode != 0:
        print("[ensure_prisma_binary] ERROR: binary failed --version check", file=sys.stderr)
        sys.exit(1)

    print(f"[ensure_prisma_binary] Binary ready: {target}")


if __name__ == "__main__":
    main()
