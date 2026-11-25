#!/usr/bin/env bash
# Drop the cloned repository's git data and start a new repo in this folder.
# History, branches, and the origin remote live in .git. Source files are left as they are.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ "${1:-}" != "--yes" ]]; then
  echo "This deletes .git (history, branches, and the clone remote) and runs git init."
  echo "Your code stays. The new repo has no remote and no commits."
  read -r -p "Type yes to continue: " answer
  [[ "$answer" == "yes" ]] || { echo "Cancelled."; exit 1; }
fi

found=0
while IFS= read -r -d '' gitdir; do
  rm -rf "$gitdir"
  found=1
done < <(
  find "$ROOT" \
    \( -path "$ROOT/node_modules" -o -path "$ROOT/node_modules/*" \
       -o -path "$ROOT/frontend/node_modules" -o -path "$ROOT/frontend/node_modules/*" \
       -o -path "$ROOT/backend/vendor" -o -path "$ROOT/backend/vendor/*" \) -prune \
    -o -name .git -print0
)

if [[ "$found" -eq 0 ]]; then
  echo "No .git folder found."
fi

git init -b main
echo "Done. This folder is a new repository with no commits and no remote."
