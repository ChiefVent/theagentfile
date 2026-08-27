#!/usr/bin/env bash
set -euo pipefail

# Stage only Agent File catalog Markdown. Does not touch other paths.
# Usage:
#   scripts/commit-content.sh           # validate + git add
#   scripts/commit-content.sh --commit  # also git commit

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm run content:validate

git add -- 'src/content/agents/*.md'

if git diff --cached --quiet -- 'src/content/agents/*.md'; then
	echo "No agent content changes to stage."
	exit 0
fi

echo "Staged:"
git diff --cached --name-only -- 'src/content/agents/*.md'

if [[ "${1:-}" == "--commit" ]]; then
	msg="${COMMIT_MSG:-Add agent catalog entries from Grok Bot}"
	git commit -m "$msg"
fi
