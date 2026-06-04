#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/home/ovidio-neto/farmacia"
SOURCE_DIR="$PROJECT_ROOT/.codex/memories"
TARGET_REPO_DIR="/home/ovidio-neto/memories-farmacia"
TARGET_REPO_SSH="git@github.com:FSPH/memories.git"
TARGET_SUBDIR=".codex/memories-backup/farmacia"
DATE_TAG="$(date +%F)"
TS_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Source memories directory not found: $SOURCE_DIR"
  exit 1
fi

if [[ ! -d "$TARGET_REPO_DIR/.git" ]]; then
  git clone "$TARGET_REPO_SSH" "$TARGET_REPO_DIR"
fi

cd "$TARGET_REPO_DIR"
git pull --ff-only

mkdir -p "$TARGET_SUBDIR/snapshots/$DATE_TAG"

# Snapshot only project-scoped memory artifacts (sanitized-by-selection).
for f in memory_summary.md MEMORY.md; do
  if [[ -f "$SOURCE_DIR/$f" ]]; then
    cp "$SOURCE_DIR/$f" "$TARGET_SUBDIR/snapshots/$DATE_TAG/$f"
  fi
done

mkdir -p "$TARGET_SUBDIR"
cat > "$TARGET_SUBDIR/LAST_SYNC.txt" <<EOF
project=farmacia
source=$SOURCE_DIR
synced_at_utc=$TS_UTC
snapshot=$DATE_TAG
EOF

if [[ -z "$(git status --porcelain)" ]]; then
  echo "No changes to commit."
  exit 0
fi

git add "$TARGET_SUBDIR"
git commit -m "memories commited (farmacia $DATE_TAG)"
git push origin main

echo "Memories backup completed for farmacia at $TS_UTC"
