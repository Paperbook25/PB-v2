#!/bin/bash
# Comprehensive endpoint testing for Phase 1 + Phase 2
BASE="http://localhost:3001/api"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

assert_status() {
  local EXPECTED=$1
  local ACTUAL=$2
  local DESC=$3
  if [ "$ACTUAL" = "$EXPECTED" ]; then
    echo -e "${GREEN}PASS${NC} $DESC (HTTP $ACTUAL)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} $DESC (expected $EXPECTED, got $ACTUAL)"
    FAIL=$((FAIL + 1))
  fi
}

echo "============================================================"
echo "  PaperBook API Endpoint Tests (Phase 1 + Phase 2)"
echo "============================================================"
echo ""

# ============================================================
echo -e "${YELLOW}=== PHASE 1: AUTH ENDPOINTS ===${NC}"
# ============================================================

# Health check
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/health)
assert_status 200 "$CODE" "[GET /health] Health check"

# Login as admin
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paperbook.in","password":"demo123"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[POST /auth/login] Login as admin"
ADMIN_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
ADMIN_REFRESH=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['refreshToken'])" 2>/dev/null)

# Verify login response has user data
HAS_USER=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if d.get('user',{}).get('role')=='admin' else 'no')" 2>/dev/null)
if [ "$HAS_USER" = "ok" ]; then
  echo -e "${GREEN}PASS${NC} [POST /auth/login] Response includes user with role=admin"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [POST /auth/login] Response missing user data"
  FAIL=$((FAIL + 1))
fi

# Login wrong password
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paperbook.in","password":"wrongpass"}')
assert_status 401 "$CODE" "[POST /auth/login] Wrong password"

# Login non-existent email
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@test.com","password":"demo123"}')
assert_status 401 "$CODE" "[POST /auth/login] Non-existent email"

# Login missing email (validation)
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"demo123"}')
assert_status 422 "$CODE" "[POST /auth/login] Missing email (validation)"

# Login as teacher
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@paperbook.in","password":"demo123"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[POST /auth/login] Login as teacher"
TEACHER_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

# Login as student
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@paperbook.in","password":"demo123"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[POST /auth/login] Login as student"
STUDENT_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

# Verify student login includes studentId
HAS_STU=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if d.get('user',{}).get('studentId') else 'no')" 2>/dev/null)
if [ "$HAS_STU" = "ok" ]; then
  echo -e "${GREEN}PASS${NC} [POST /auth/login] Student login includes studentId"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [POST /auth/login] Student login missing studentId"
  FAIL=$((FAIL + 1))
fi

# GET /auth/me with token
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /auth/me] With valid token"

# GET /auth/me without token
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/auth/me)
assert_status 401 "$CODE" "[GET /auth/me] Without token"

# Token refresh
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$ADMIN_REFRESH\"}")
CODE=$(echo "$RESP" | tail -1)
assert_status 200 "$CODE" "[POST /auth/refresh] Refresh token"

# Refresh with invalid token
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"invalid-token"}')
assert_status 401 "$CODE" "[POST /auth/refresh] Invalid refresh token"

# Forgot password
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paperbook.in"}')
assert_status 200 "$CODE" "[POST /auth/forgot-password] Valid email"

# Forgot password - non-existent (should still 200 — no enumeration)
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nobody@test.com"}')
assert_status 200 "$CODE" "[POST /auth/forgot-password] Non-existent email (no enumeration)"

# Reset password with invalid token
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"fake-token","password":"newpassword123"}')
assert_status 400 "$CODE" "[POST /auth/reset-password] Invalid reset token"

# Re-login for remaining tests
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paperbook.in","password":"demo123"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[POST /auth/login] Re-login admin"
ADMIN_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
ADMIN_REFRESH=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['refreshToken'])" 2>/dev/null)

# Logout
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d "{\"refreshToken\":\"$ADMIN_REFRESH\"}")
assert_status 200 "$CODE" "[POST /auth/logout] Logout"

# Re-login after logout
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paperbook.in","password":"demo123"}')
BODY=$(echo "$RESP" | sed '$d')
ADMIN_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 1: USER CRUD ===${NC}"
# ============================================================

# List users
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/settings/users \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/users] List users (admin)"

# List users without auth
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/settings/users)
assert_status 401 "$CODE" "[GET /settings/users] Without auth"

# List users as teacher (RBAC)
CODE=$(curl -s -o /dev/null -w "%{http_code}" $BASE/settings/users \
  -H "Authorization: Bearer $TEACHER_TOKEN")
assert_status 403 "$CODE" "[GET /settings/users] As teacher (RBAC)"

# Create user
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/settings/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"email":"test@paperbook.in","password":"test1234","name":"Test User","role":"teacher"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 201 "$CODE" "[POST /settings/users] Create user"
NEW_USER_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

# Duplicate email
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/settings/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"email":"test@paperbook.in","password":"test1234","name":"Dupe","role":"teacher"}')
assert_status 409 "$CODE" "[POST /settings/users] Duplicate email"

# Invalid data
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/settings/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"email":"bad","password":"1","name":"","role":"fake"}')
assert_status 422 "$CODE" "[POST /settings/users] Invalid data (validation)"

# Get by ID
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/users/$NEW_USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/users/:id] Get user by ID"

# Update user
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/users/$NEW_USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Updated Test User"}')
assert_status 200 "$CODE" "[PUT /settings/users/:id] Update user"

# Toggle status
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/settings/users/$NEW_USER_ID/toggle-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[PATCH /settings/users/:id/toggle-status] Toggle off"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/settings/users/$NEW_USER_ID/toggle-status" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[PATCH /settings/users/:id/toggle-status] Toggle on"

# Delete user
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/users/$NEW_USER_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[DELETE /settings/users/:id] Delete user"

# Delete non-existent
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/users/non-existent-id" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 404 "$CODE" "[DELETE /settings/users/:id] Non-existent"

# Create as student (RBAC)
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/settings/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"email":"x@x.com","password":"test1234","name":"X","role":"teacher"}')
assert_status 403 "$CODE" "[POST /settings/users] As student (RBAC)"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 1: AUDIT LOG ===${NC}"
# ============================================================

RESP=$(curl -s -w "\n%{http_code}" "$BASE/settings/audit-log" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[GET /settings/audit-log] List audit logs"

# Check meta is present
HAS_META=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if 'meta' in d and 'total' in d['meta'] else 'no')" 2>/dev/null)
if [ "$HAS_META" = "ok" ]; then
  echo -e "${GREEN}PASS${NC} [GET /settings/audit-log] Response has meta.total"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /settings/audit-log] Missing meta.total"
  FAIL=$((FAIL + 1))
fi

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/audit-log?module=settings" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/audit-log?module=settings] Filtered"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/audit-log?page=1&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/audit-log?page=1&limit=5] Paginated"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/audit-log" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
assert_status 403 "$CODE" "[GET /settings/audit-log] As teacher (RBAC)"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 2: SCHOOL PROFILE ===${NC}"
# ============================================================

RESP=$(curl -s -w "\n%{http_code}" "$BASE/settings/school-profile" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[GET /settings/school-profile] Get profile"
NAME=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['name'])" 2>/dev/null)
echo "  School: $NAME"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/school-profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"DPS Updated","phone":"+91 11 9999 9999"}')
assert_status 200 "$CODE" "[PUT /settings/school-profile] Update"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/school-profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{"name":"Hack"}')
assert_status 403 "$CODE" "[PUT /settings/school-profile] Teacher (RBAC)"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 2: ACADEMIC YEARS ===${NC}"
# ============================================================

RESP=$(curl -s -w "\n%{http_code}" "$BASE/settings/academic-years" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[GET /settings/academic-years] List"
YEAR_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "  Found $YEAR_COUNT academic years"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/settings/academic-years" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"2026-27","startDate":"2026-04-01","endDate":"2027-03-31"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 201 "$CODE" "[POST /settings/academic-years] Create"
NEW_YEAR_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/academic-years/$NEW_YEAR_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"2026-27 Updated"}')
assert_status 200 "$CODE" "[PUT /settings/academic-years/:id] Update"

# Get current year ID
CURRENT_YEAR_ID=$(curl -s "$BASE/settings/academic-years" -H "Authorization: Bearer $ADMIN_TOKEN" | \
  python3 -c "import sys,json; yrs=json.load(sys.stdin)['data']; print([y['id'] for y in yrs if y['isCurrent']][0])" 2>/dev/null)

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/academic-years/$CURRENT_YEAR_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 400 "$CODE" "[DELETE /settings/academic-years/:id] Cannot delete current"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/settings/academic-years/$NEW_YEAR_ID/set-current" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[PATCH /settings/academic-years/:id/set-current] Set current"

# Restore original
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/settings/academic-years/$CURRENT_YEAR_ID/set-current" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[PATCH /settings/academic-years/:id/set-current] Restore"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/academic-years/$NEW_YEAR_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[DELETE /settings/academic-years/:id] Delete"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/academic-years/non-existent" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 404 "$CODE" "[DELETE /settings/academic-years/:id] Non-existent"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 2: CLASSES ===${NC}"
# ============================================================

RESP=$(curl -s -w "\n%{http_code}" "$BASE/settings/classes" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[GET /settings/classes] List"
CLASS_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "  Found $CLASS_COUNT classes"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/settings/classes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"className":"Pre-Nursery","sections":["A","B"]}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 201 "$CODE" "[POST /settings/classes] Create"
NEW_CLASS_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/classes/$NEW_CLASS_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"className":"Pre-Nursery Updated","sections":["A","B","C"]}')
assert_status 200 "$CODE" "[PUT /settings/classes/:id] Update (add section)"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/classes/$NEW_CLASS_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[DELETE /settings/classes/:id] Delete"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/settings/classes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"className":"","sections":[]}')
assert_status 422 "$CODE" "[POST /settings/classes] Invalid data"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 2: SUBJECTS ===${NC}"
# ============================================================

RESP=$(curl -s -w "\n%{http_code}" "$BASE/settings/subjects" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[GET /settings/subjects] List"
SUB_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "  Found $SUB_COUNT subjects"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/settings/subjects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Sanskrit","code":"SANS","type":"theory"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 201 "$CODE" "[POST /settings/subjects] Create"
NEW_SUB_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/settings/subjects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Sanskrit2","code":"SANS"}')
assert_status 409 "$CODE" "[POST /settings/subjects] Duplicate code"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/subjects/$NEW_SUB_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Sanskrit Language","maxMarks":80}')
assert_status 200 "$CODE" "[PUT /settings/subjects/:id] Update"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/subjects/$NEW_SUB_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[DELETE /settings/subjects/:id] Delete"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 2: NOTIFICATION PREFERENCES ===${NC}"
# ============================================================

RESP=$(curl -s -w "\n%{http_code}" "$BASE/settings/notifications" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
assert_status 200 "$CODE" "[GET /settings/notifications] Get prefs"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"smsNotifications":false}')
assert_status 200 "$CODE" "[PUT /settings/notifications] Update prefs"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 2: BACKUP CONFIG ===${NC}"
# ============================================================

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/backup" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/backup] Get config"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/backup" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"backupFrequency":"weekly"}')
assert_status 200 "$CODE" "[PUT /settings/backup] Update config"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/settings/backup/trigger" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[POST /settings/backup/trigger] Trigger backup"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/backup" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
assert_status 403 "$CODE" "[GET /settings/backup] Teacher (RBAC)"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 2: THEME CONFIG ===${NC}"
# ============================================================

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/theme" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/theme] Get config"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/theme" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"mode":"dark","primaryColor":"#1e40af"}')
assert_status 200 "$CODE" "[PUT /settings/theme] Update"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/theme" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"primaryColor":"not-a-color"}')
assert_status 422 "$CODE" "[PUT /settings/theme] Invalid color"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 2: CALENDAR EVENTS ===${NC}"
# ============================================================

RESP=$(curl -s -w "\n%{http_code}" "$BASE/settings/calendar" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[GET /settings/calendar] List events"
EVT_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "  Found $EVT_COUNT events"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/calendar?type=holiday" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/calendar?type=holiday] Filtered"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/calendar?month=2025-03" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/calendar?month=2025-03] Month filtered"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/settings/calendar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"title":"Test Event","type":"other","startDate":"2025-07-01","endDate":"2025-07-01"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 201 "$CODE" "[POST /settings/calendar] Create event"
NEW_EVT_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/settings/calendar/$NEW_EVT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"title":"Test Event Updated"}')
assert_status 200 "$CODE" "[PUT /settings/calendar/:id] Update event"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/calendar/$NEW_EVT_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[DELETE /settings/calendar/:id] Delete event"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/calendar/non-existent" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 404 "$CODE" "[DELETE /settings/calendar/:id] Non-existent"

echo ""
# ============================================================
echo -e "${YELLOW}=== PHASE 2: EMAIL TEMPLATES ===${NC}"
# ============================================================

RESP=$(curl -s -w "\n%{http_code}" "$BASE/settings/email-templates" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[GET /settings/email-templates] List templates"
TMPL_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "  Found $TMPL_COUNT templates"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/email-templates?category=fee" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/email-templates?category=fee] Filtered"

RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/settings/email-templates" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"name":"Test Template","subject":"Hello {{name}}","body":"Dear {{name}}, balance is {{amount}}.","category":"general"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 201 "$CODE" "[POST /settings/email-templates] Create template"
NEW_TMPL_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

# Check variables auto-extracted
VARS=$(echo "$BODY" | python3 -c "import sys,json; print(','.join(sorted(json.load(sys.stdin)['data']['variables'])))" 2>/dev/null)
if [ "$VARS" = "amount,name" ]; then
  echo -e "${GREEN}PASS${NC} [POST /settings/email-templates] Variables auto-extracted: $VARS"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [POST /settings/email-templates] Variables wrong: got '$VARS', expected 'amount,name'"
  FAIL=$((FAIL + 1))
fi

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/email-templates/$NEW_TMPL_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[GET /settings/email-templates/:id] Get by ID"

RESP=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/settings/email-templates/$NEW_TMPL_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"body":"Dear {{name}}, new content {{new_var}}."}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[PUT /settings/email-templates/:id] Update template"

VARS2=$(echo "$BODY" | python3 -c "import sys,json; v=json.load(sys.stdin)['data']['variables']; print('ok' if 'new_var' in v else 'no')" 2>/dev/null)
if [ "$VARS2" = "ok" ]; then
  echo -e "${GREEN}PASS${NC} [PUT /settings/email-templates/:id] Variables re-extracted on update"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [PUT /settings/email-templates/:id] Variables not re-extracted"
  FAIL=$((FAIL + 1))
fi

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/settings/email-templates/$NEW_TMPL_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 200 "$CODE" "[DELETE /settings/email-templates/:id] Delete"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/settings/email-templates/non-existent" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
assert_status 404 "$CODE" "[GET /settings/email-templates/:id] Non-existent"

echo ""
echo "============================================================"
echo -e "  Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "============================================================"

if [ $FAIL -gt 0 ]; then
  exit 1
else
  echo -e "\n${GREEN}All tests passed!${NC}"
fi
