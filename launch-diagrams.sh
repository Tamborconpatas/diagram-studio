#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

URL="http://localhost:5173/"

if ! curl -s -o /dev/null "$URL"; then
  npm run dev -- --port 5173 --strictPort &
  for i in $(seq 1 30); do
    curl -s -o /dev/null "$URL" && break
    sleep 0.5
  done
fi

xdg-open "$URL"
wait
