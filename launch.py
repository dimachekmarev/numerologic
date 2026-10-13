#!/usr/bin/env python3
"""Compatibility entry point for the current Node Worker application."""
import shutil
import subprocess
import sys
from pathlib import Path
if not shutil.which("node"):
    sys.exit("Для запуска Numerologic нужен Node.js 22+: https://nodejs.org/")
sys.exit(subprocess.call(["node", str(Path(__file__).parent / "hosting" / "launch.mjs")]))
