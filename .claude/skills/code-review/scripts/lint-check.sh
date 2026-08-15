#!/bin/bash
# Run linting and type checking for code review
# Usage: bash scripts/lint-check.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔍 Running ESLint..."
npm run lint 2>/dev/null || echo "⚠️  ESLint check failed or not configured"

echo ""
echo "🔍 Running TypeScript type check..."
npx tsc --noEmit 2>/dev/null || echo "⚠️  TypeScript errors found"

echo ""
echo "🔍 Checking for debug statements..."
grep -rn 'console\.log\|console\.debug\|debugger' src/ --include='*.tsx' --include='*.ts' --include='*.jsx' --include='*.js' 2>/dev/null && echo "🟡 Found debug statements!" || echo "✅ No debug statements found"

echo ""
echo "✅ Lint check complete"
