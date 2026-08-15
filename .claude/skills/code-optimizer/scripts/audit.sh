#!/bin/bash
# Code Optimization Audit Script
# Analyzes the React frontend for performance improvement opportunities
# Usage: bash .claude/skills/code-optimizer/scripts/audit.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$PROJECT_ROOT"

echo "=============================================="
echo "  🚀 Code Optimization Audit — Retail App React"
echo "=============================================="
echo ""

# ─── 1. Bundle Size Analysis ───
echo "📦 [1/6] Bundle Size Analysis"
echo "──────────────────────────────"
if [ -d "dist" ]; then
  TOTAL_SIZE=$(du -sh dist/ | awk '{print $1}')
  JS_SIZE=$(find dist -name '*.js' -exec du -ch {} + 2>/dev/null | tail -1 | awk '{print $1}')
  CSS_SIZE=$(find dist -name '*.css' -exec du -ch {} + 2>/dev/null | tail -1 | awk '{print $1}')
  echo "  Total dist size: $TOTAL_SIZE"
  echo "  JavaScript:      $JS_SIZE"
  echo "  CSS:             $CSS_SIZE"
else
  echo "  ⚠️  No dist/ directory found. Run 'npm run build' first."
fi
echo ""

# ─── 2. Unused Dependencies ───
echo "📋 [2/6] Unused Dependencies Check"
echo "──────────────────────────────────"
if command -v npx &> /dev/null; then
  npx depcheck --skip-missing 2>/dev/null | head -30 || echo "  ⚠️  depcheck not available. Install with: npm i -g depcheck"
else
  echo "  ⚠️  npx not available"
fi
echo ""

# ─── 3. Large Imports Detection ───
echo "🔍 [3/6] Large / Non-Tree-Shakeable Imports"
echo "──────────────────────────────────────────"
echo "  Checking for barrel imports from heavy libraries..."
grep -rn "from 'react-icons'" src/ --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' 2>/dev/null | head -10 && echo "  🟡 Found barrel imports from react-icons — use specific icon set paths (e.g., react-icons/fi)" || echo "  ✅ No barrel react-icons imports found"
echo ""
grep -rn "from 'lodash'" src/ --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' 2>/dev/null | head -10 && echo "  🟡 Found barrel imports from lodash — use lodash-es or specific imports" || echo "  ✅ No barrel lodash imports found"
echo ""
grep -rn "import \* as" src/ --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' 2>/dev/null | head -10 && echo "  🟡 Found namespace imports — may prevent tree-shaking" || echo "  ✅ No namespace imports found"
echo ""

# ─── 4. Re-render Risk Patterns ───
echo "🔄 [4/6] Re-render Risk Detection"
echo "──────────────────────────────────"
echo "  Inline objects in JSX props:"
INLINE_OBJECTS=$(grep -rn 'style={{' src/ --include='*.tsx' --include='*.jsx' 2>/dev/null | wc -l | tr -d ' ')
echo "    Found: $INLINE_OBJECTS occurrences"

echo "  Inline arrow functions in JSX:"
INLINE_ARROWS=$(grep -rn 'onClick={() =>' src/ --include='*.tsx' --include='*.jsx' 2>/dev/null | wc -l | tr -d ' ')
echo "    Found: $INLINE_ARROWS occurrences"

echo "  Components using React.memo:"
MEMOIZED=$(grep -rn 'React.memo' src/ --include='*.tsx' --include='*.jsx' 2>/dev/null | wc -l | tr -d ' ')
echo "    Found: $MEMOIZED memoized components"

echo "  useCallback usage:"
USE_CALLBACK=$(grep -rn 'useCallback' src/ --include='*.tsx' --include='*.jsx' 2>/dev/null | wc -l | tr -d ' ')
echo "    Found: $USE_CALLBACK uses"
echo ""

# ─── 5. Lazy Loading Check ───
echo "⏳ [5/6] Code Splitting & Lazy Loading"
echo "──────────────────────────────────────"
LAZY_IMPORTS=$(grep -rn 'React.lazy\|lazy(' src/ --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' 2>/dev/null | wc -l | tr -d ' ')
DYNAMIC_IMPORTS=$(grep -rn 'import(' src/ --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' 2>/dev/null | wc -l | tr -d ' ')
echo "  React.lazy components:  $LAZY_IMPORTS"
echo "  Dynamic imports:        $DYNAMIC_IMPORTS"
if [ "$LAZY_IMPORTS" -lt 3 ]; then
  echo "  🟡 Consider lazy loading more route-level components and drawers"
else
  echo "  ✅ Good code-splitting coverage"
fi
echo ""

# ─── 6. Console Statements ───
echo "🧹 [6/6] Debug Artifacts"
echo "──────────────────────────────────"
CONSOLE_LOGS=$(grep -rn 'console\.\(log\|debug\|info\|warn\)' src/ --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' 2>/dev/null | wc -l | tr -d ' ')
echo "  console.* statements: $CONSOLE_LOGS"
if [ "$CONSOLE_LOGS" -gt 0 ]; then
  echo "  🟡 Remove console statements for production builds"
fi
echo ""

# ─── Summary ───
echo "=============================================="
echo "  📊 Audit Summary"
echo "=============================================="
echo "  Inline style objects:   $INLINE_OBJECTS"
echo "  Inline arrow handlers:  $INLINE_ARROWS"
echo "  Memoized components:    $MEMOIZED"
echo "  useCallback hooks:      $USE_CALLBACK"
echo "  Lazy-loaded components: $LAZY_IMPORTS"
echo "  Console statements:     $CONSOLE_LOGS"
echo ""
echo "  Run 'npm run build && npx vite-bundle-analyzer' for detailed bundle analysis."
echo "=============================================="
