#!/usr/bin/env python3
"""Local preview launcher: persistent data, no real payments, no Node in release ZIP."""

import hashlib
import os
import secrets
import socket
import subprocess
import sys
import threading
import time
import urllib.request
import venv
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def storage_directory():
    override = os.getenv("NUMEROLOGIC_DATA_DIR")
    if override:
        return Path(override).expanduser()
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "Numerologic"
    return Path(os.getenv("XDG_DATA_HOME", str(Path.home() / ".local" / "share"))) / "Numerologic"


def open_when_ready(url, process):
    for _ in range(120):
        if process.poll() is not None:
            return
        try:
            with urllib.request.urlopen(url + "/api/health", timeout=1) as response:
                if response.status == 200:
                    if os.getenv("NUMEROLOGIC_NO_BROWSER") != "1":
                        webbrowser.open(url)
                    print("\nПриложение открыто: " + url, flush=True)
                    return
        except OSError:
            time.sleep(0.25)


def main():
    if sys.version_info < (3, 10):
        raise RuntimeError("Нужен Python 3.10 или новее: https://www.python.org/downloads/")
    data = storage_directory()
    data.mkdir(parents=True, exist_ok=True, mode=0o700)
    env_dir = data / "runtime"
    python = env_dir / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    requirements = ROOT / "backend" / "requirements.txt"
    digest = hashlib.sha256(requirements.read_bytes()).hexdigest()
    marker = data / "requirements.sha256"
    if not python.exists():
        print("Готовим локальное окружение…", flush=True)
        venv.create(env_dir, with_pip=True)
    if not marker.exists() or marker.read_text() != digest:
        print("Первый запуск: устанавливаем зависимости. Нужен интернет.", flush=True)
        subprocess.run([str(python), "-m", "pip", "install", "-r", str(requirements)], check=True)
        marker.write_text(digest)
    if not (ROOT / "frontend" / "dist" / "index.html").exists():
        print("Собираем интерфейс из исходников…", flush=True)
        npm = "npm.cmd" if os.name == "nt" else "npm"
        subprocess.run([npm, "ci", "--prefix", str(ROOT / "frontend")], check=True)
        subprocess.run([npm, "run", "build", "--prefix", str(ROOT / "frontend")], check=True)
    secret_file = data / "session-secret"
    if not secret_file.exists():
        secret_file.write_text(secrets.token_hex(32))
        secret_file.chmod(0o600)
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", int(os.getenv("NUMEROLOGIC_PORT", "0"))))
        port = sock.getsockname()[1]
    url = "http://127.0.0.1:" + str(port)
    env = dict(
        os.environ,
        APP_ENV="development",
        PAYMENT_PROVIDER="mock",
        SESSION_SECRET=secret_file.read_text(),
        FRONTEND_BASE_URL=url,
        DATABASE_URL="sqlite:///" + str(data / "product.sqlite3"),
    )
    print(
        "\nNUMEROLOGIC · демонстрационная версия\nДеньги не списываются. Данные сохраняются между запусками.\nЗакрыть: Ctrl+C в этом окне.\n",
        flush=True,
    )
    server = subprocess.Popen(
        [str(python), "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", str(port)],
        cwd=ROOT / "backend",
        env=env,
    )
    threading.Thread(target=open_when_ready, args=(url, server), daemon=True).start()
    try:
        server.wait()
    except KeyboardInterrupt:
        server.terminate()
        server.wait(timeout=10)
    return server.returncode


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print("Не удалось запустить Numerologic: " + str(error), file=sys.stderr)
        if sys.stdin.isatty():
            input("Нажмите Enter, чтобы закрыть окно.")
        sys.exit(1)
