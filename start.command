#!/bin/bash
cd "$(dirname "$0")" || exit 1
for candidate in python3.12 python3.11 python3.10 python3 /opt/homebrew/bin/python3; do
  if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys; sys.exit(sys.version_info < (3,10))' 2>/dev/null; then
    exec "$candidate" launch.py
  fi
done
printf '%s\n' 'Для запуска нужен Python 3.10 или новее: https://www.python.org/downloads/'
read -r -p 'Нажмите Enter, чтобы закрыть окно.'
