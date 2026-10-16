#!/bin/sh
# Stop hook: rebuild the code graph in the background when src/ changed since the last refresh.
# AST-only (no LLM) → zero tokens; prints nothing so nothing enters the context.
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
STAMP=graphify-out/cache/.refresh-stamp
LOCK=graphify-out/cache/.refresh-lock
[ -f graphify-out/graph.json ] || exit 0
mkdir -p graphify-out/cache
[ -f "$STAMP" ] && [ -z "$(find src -type f -newer "$STAMP" -print -quit 2>/dev/null)" ] && exit 0
find "$LOCK" -maxdepth 0 -mmin +10 -exec rmdir {} \; 2>/dev/null
mkdir "$LOCK" 2>/dev/null || exit 0
touch "$STAMP"
nohup sh -c "/Users/anasalsaadi/.local/bin/graphify update . >/dev/null 2>&1; rmdir '$LOCK'" >/dev/null 2>&1 &
exit 0
