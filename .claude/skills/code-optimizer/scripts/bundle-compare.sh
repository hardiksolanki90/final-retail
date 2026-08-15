#!/bin/bash
# Bundle Size Comparison Script
# Compares current bundle size against a baseline to detect regressions
# Usage: bash .claude/skills/code-optimizer/scripts/bundle-compare.sh [baseline_kb]

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$PROJECT_ROOT"

BASELINE_KB=${1:-500}

echo "📦 Bundle Size Comparison"
echo "────────────────────────"
echo "  Baseline: ${BASELINE_KB}KB (gzipped)"
echo ""

# Build the project
echo "  Building production bundle..."
npm run build --silent 2>/dev/null

if [ ! -d "dist" ]; then
  echo "  ❌ Build failed — no dist/ directory created"
  exit 1
fi

# Calculate sizes
TOTAL_BYTES=$(find dist -type f \( -name '*.js' -o -name '*.css' \) -exec cat {} + | wc -c | tr -d ' ')
TOTAL_KB=$((TOTAL_BYTES / 1024))

# Estimate gzipped size (roughly 30% of original)
GZIP_EST_KB=$((TOTAL_KB * 30 / 100))

echo "  Raw size:     ${TOTAL_KB}KB"
echo "  Gzip (est.):  ${GZIP_EST_KB}KB"
echo ""

if [ "$GZIP_EST_KB" -gt "$BASELINE_KB" ]; then
  OVER=$((GZIP_EST_KB - BASELINE_KB))
  echo "  🔴 Bundle is ${OVER}KB OVER baseline!"
  echo "  Run the audit script and check for optimization opportunities."
  exit 1
else
  UNDER=$((BASELINE_KB - GZIP_EST_KB))
  echo "  ✅ Bundle is ${UNDER}KB UNDER baseline. Looking good!"
fi
