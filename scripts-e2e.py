"""Launch the same-origin app and run the full browser test in one process namespace."""
import os, subprocess, sys, tempfile, time, urllib.request
from pathlib import Path
root=Path(__file__).resolve().parent
with tempfile.TemporaryDirectory() as tmp:
    env=dict(os.environ,APP_ENV='test',PAYMENT_PROVIDER='mock',FRONTEND_BASE_URL='http://127.0.0.1:8080',DATABASE_URL='sqlite:///'+tmp+'/test.sqlite3')
    server=subprocess.Popen([sys.executable,'-m','uvicorn','main:app','--host','127.0.0.1','--port','8080'],cwd=root/'backend',env=env,stdout=subprocess.DEVNULL)
    try:
        for i in range(30):
            try:
                urllib.request.urlopen('http://127.0.0.1:8080/api/health',timeout=1);break
            except OSError:time.sleep(.2)
        result=subprocess.run(['node','tests/e2e.mjs'],cwd=root/'frontend',env=env)
        sys.exit(result.returncode)
    finally:
        server.terminate();server.wait(timeout=10)
