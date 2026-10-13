#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Для запуска нужен Node.js 22 или новее: https://nodejs.org/'
  read -r -p 'Нажмите Enter, чтобы закрыть окно.'
  exit 1
fi
exec node hosting/launch.mjs
