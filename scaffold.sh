#!/usr/bin/env bash
# scaffold.sh
# Creates empty placeholder files for Sprint 1 and Sprint 2.
# SAFE TO RERUN: uses `touch` — only creates if missing, never overwrites.
# Does NOT delete anything.

set -e

ROOT="${1:-.}"

echo "📁 Target: $ROOT"
echo ""

SPRINT1_FILES=(
  # App entry
  "src/app/globals.css"
  "src/app/layout.tsx"

  # Auth route group
  "src/app/(auth)/layout.tsx"
  "src/app/(auth)/login/page.tsx"

  # Dashboard route group — role pages
  "src/app/(dashboard)/layout.tsx"
  "src/app/(dashboard)/admin/page.tsx"
  "src/app/(dashboard)/student/page.tsx"
  "src/app/(dashboard)/lecturer/page.tsx"
  "src/app/(dashboard)/hod/page.tsx"
  "src/app/(dashboard)/qa/page.tsx"

  # API
  "src/app/api/auth/[...nextauth]/route.ts"

  # Lib
  "src/lib/auth.ts"
  "src/lib/prisma.ts"
  "src/lib/roles.ts"
  "src/lib/utils.ts"
  "src/lib/validations/auth.ts"

  # Middleware
  "src/middleware.ts"

  # Types
  "src/types/next-auth.d.ts"
  "src/types/prisma.ts"

  # Components
  "src/components/auth/login-form.tsx"
  "src/components/layout/sidebar.tsx"
  "src/components/layout/topbar.tsx"
  "src/components/shared/theme-provider.tsx"
  "src/components/shared/theme-toggle.tsx"
  "src/components/ui/button.tsx"
  "src/components/ui/input.tsx"
  "src/components/ui/label.tsx"
  "src/components/ui/card.tsx"
  "src/components/ui/badge.tsx"

  # Prisma
  "prisma/schema.prisma"
  "prisma/seed.ts"

  # Root config & docs
  ".env.example"
  "SCHEMA_AND_ENV.md"
  "package.json"
)

SPRINT2_FILES=(
  # Server actions
  "src/actions/departments.ts"
  "src/actions/users.ts"
  "src/actions/courses.ts"
  "src/actions/periods.ts"

  # Validations
  "src/lib/validations/admin.ts"

  # UI components
  "src/components/ui/select.tsx"
  "src/components/ui/dialog.tsx"
  "src/components/ui/toast.tsx"

  # Hooks
  "src/hooks/use-toast.tsx"

  # Admin client components
  "src/components/admin/departments-client.tsx"
  "src/components/admin/users-client.tsx"
  "src/components/admin/courses-client.tsx"
  "src/components/admin/periods-client.tsx"

  # Admin pages
  "src/app/(dashboard)/admin/departments/page.tsx"
  "src/app/(dashboard)/admin/users/page.tsx"
  "src/app/(dashboard)/admin/courses/page.tsx"
  "src/app/(dashboard)/admin/periods/page.tsx"
)

scaffold() {
  local sprint_label="$1"
  shift
  local files=("$@")

  echo "── $sprint_label ──────────────────────────────────────"
  local created=0
  local skipped=0

  for file in "${files[@]}"; do
    local full="$ROOT/$file"
    local dir
    dir="$(dirname "$full")"

    mkdir -p "$dir"

    if [ -e "$full" ]; then
      echo "  SKIP   $file"
      ((skipped++)) || true
    else
      touch "$full"
      echo "  CREATE $file"
      ((created++)) || true
    fi
  done

  echo ""
  echo "  $created created, $skipped already existed."
  echo ""
}

scaffold "Sprint 1" "${SPRINT1_FILES[@]}"
scaffold "Sprint 2" "${SPRINT2_FILES[@]}"

echo "✅ Done. No files were overwritten or deleted."