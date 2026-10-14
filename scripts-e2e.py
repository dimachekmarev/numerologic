"""Run browser checks against the same Worker and migrations used in production."""
import os
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parent
with tempfile.TemporaryDirectory() as tmp:
    env = dict(os.environ, PORT="8080", PREVIEW_MODE="false",
               LOCAL_DB=str(Path(tmp) / "test.sqlite3"), E2E_URL="http://127.0.0.1:8080")
    server = subprocess.Popen(["node", "hosting/dev.mjs"], cwd=root, env=env)
    try:
        for attempt in range(100):
            if server.poll() is not None:
                raise RuntimeError("Worker stopped before browser checks")
            try:
                with urllib.request.urlopen(env["E2E_URL"] + "/api/health", timeout=1) as response:
                    if response.status == 200:
                        break
            except OSError:
                time.sleep(0.1)
        else:
            raise RuntimeError("Worker did not become ready")
        result = subprocess.run(["node", "tests/e2e.mjs"], cwd=root / "frontend", env=env)
        sys.exit(result.returncode)
    finally:
        server.terminate()
        server.wait(timeout=10)
