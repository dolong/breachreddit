#!/bin/sh
# Kill orphaned `vite build --watch` processes for this project (left behind when
# `devvit playtest` is killed hard). They rebuild into dist/ and race `vite build`.
# Only reaps orphans (parent = launchd), so a live playtest's watcher is untouched.
dir="$(cd "$(dirname "$0")/.." && pwd)"
ps -eo pid=,ppid=,command= | awk -v d="$dir/node_modules/.bin/vite build --watch" '$2==1 && index($0,d){print $1}' | xargs kill 2>/dev/null
exit 0
