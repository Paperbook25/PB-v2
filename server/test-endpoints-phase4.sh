#!/bin/bash
# Phase 4: Attendance + Timetable + Leave endpoint tests
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
echo "  PaperBook API Endpoint Tests — Phase 4"
echo "  Attendance + Timetable + Leave"
echo "============================================================"
echo ""

# ============================================================
echo -e "${YELLOW}=== LOGIN ===${NC}"
# ============================================================

# Admin login
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paperbook.in","password":"demo123"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[POST /auth/login] Admin login"
ADMIN_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

# Teacher login
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@paperbook.in","password":"demo123"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[POST /auth/login] Teacher login"
TEACHER_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

# Student login
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@paperbook.in","password":"demo123"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[POST /auth/login] Student login"
STUDENT_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

# Parent login
RESP=$(curl -s -w "\n%{http_code}" -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@paperbook.in","password":"demo123"}')
CODE=$(echo "$RESP" | tail -1)
BODY=$(echo "$RESP" | sed '$d')
assert_status 200 "$CODE" "[POST /auth/login] Parent login"
PARENT_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

AUTH="Authorization: Bearer $ADMIN_TOKEN"
TAUTH="Authorization: Bearer $TEACHER_TOKEN"

# Fetch IDs we'll need
STUDENTS_RESP=$(curl -s "$BASE/students?limit=50" -H "$AUTH")

# Get a class ID (Class 10)
CLASS10_ID=$(echo "$STUDENTS_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('data',[]):
    if s.get('class','')=='Class 10':
        print(s['classId'])
        break
" 2>/dev/null)

# Get section A ID for Class 10
SECTION_A_ID=$(echo "$STUDENTS_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('data',[]):
    if s.get('class','')=='Class 10' and s.get('section','')=='A':
        print(s['sectionId'])
        break
" 2>/dev/null)

echo "CLASS10_ID=$CLASS10_ID"
echo "SECTION_A_ID=$SECTION_A_ID"

# Get a student ID in Class 10-A
STUDENT_ID=$(echo "$STUDENTS_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('data',[]):
    if s.get('class','')=='Class 10' and s.get('section','')=='A':
        print(s['id'])
        break
" 2>/dev/null)
echo "STUDENT_ID=$STUDENT_ID"

# Get a staff ID
STAFF_ID=$(curl -s "$BASE/staff" -H "$AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin)
staff=d.get('data',[])
if staff: print(staff[0]['id'])
" 2>/dev/null)
echo "STAFF_ID=$STAFF_ID"

# Get second staff ID
STAFF_ID2=$(curl -s "$BASE/staff" -H "$AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin)
staff=d.get('data',[])
if len(staff)>1: print(staff[1]['id'])
" 2>/dev/null)

echo ""

# ============================================================
echo -e "${YELLOW}=== STUDENT DAILY ATTENDANCE ===${NC}"
# ============================================================

# Get students for marking
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/students?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$AUTH")
assert_status 200 "$CODE" "[GET /attendance/students] Get students for marking"

# Teacher can access too
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/students?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$TAUTH")
assert_status 200 "$CODE" "[GET /attendance/students] Teacher access"

# Student cannot access
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/students?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "Authorization: Bearer $STUDENT_TOKEN")
assert_status 403 "$CODE" "[GET /attendance/students] Student forbidden"

# Mark daily attendance
TODAY=$(python3 -c "from datetime import datetime; print(datetime.now().strftime('%Y-%m-%d'))")
if [ -n "$STUDENT_ID" ] && [ -n "$CLASS10_ID" ] && [ -n "$SECTION_A_ID" ]; then
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/attendance" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"date\":\"$TODAY\",\"classId\":\"$CLASS10_ID\",\"sectionId\":\"$SECTION_A_ID\",\"records\":[{\"studentId\":\"$STUDENT_ID\",\"status\":\"present\",\"remarks\":\"On time\"}]}")
  CODE=$(echo "$RESP" | tail -1)
  assert_status 201 "$CODE" "[POST /attendance] Mark daily attendance"

  # Teacher can mark attendance
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/attendance" \
    -H "$TAUTH" -H "Content-Type: application/json" \
    -d "{\"date\":\"$TODAY\",\"classId\":\"$CLASS10_ID\",\"sectionId\":\"$SECTION_A_ID\",\"records\":[{\"studentId\":\"$STUDENT_ID\",\"status\":\"late\",\"remarks\":\"5 min late\"}]}")
  assert_status 201 "$CODE" "[POST /attendance] Teacher can mark attendance"
else
  echo -e "${RED}SKIP${NC} [POST /attendance] Missing IDs"
  FAIL=$((FAIL + 2))
fi

# Get daily attendance for today
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance?date=$TODAY&classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$AUTH")
assert_status 200 "$CODE" "[GET /attendance] Get daily attendance"

# Get daily attendance — response has data
RESP=$(curl -s "$BASE/attendance?date=$TODAY&classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$AUTH")
HAS_DATA=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if len(d.get('data',[]))>0 else 'no')" 2>/dev/null)
if [ "$HAS_DATA" = "ok" ]; then
  echo -e "${GREEN}PASS${NC} [GET /attendance] Response has attendance data"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /attendance] No attendance data returned"
  FAIL=$((FAIL + 1))
fi

# Attendance history
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/history?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$AUTH")
assert_status 200 "$CODE" "[GET /attendance/history] Get history"

# History has meta
RESP=$(curl -s "$BASE/attendance/history?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$AUTH")
HAS_META=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if 'meta' in d else 'no')" 2>/dev/null)
if [ "$HAS_META" = "ok" ]; then
  echo -e "${GREEN}PASS${NC} [GET /attendance/history] Has pagination meta"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /attendance/history] Missing pagination meta"
  FAIL=$((FAIL + 1))
fi

# Attendance report
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/report?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$AUTH")
assert_status 200 "$CODE" "[GET /attendance/report] Get report"

# Report has per-student data (array format)
RESP=$(curl -s "$BASE/attendance/report?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$AUTH")
HAS_DATA=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); data=d.get('data',[]); print('ok' if isinstance(data, list) and len(data) > 0 and 'studentName' in data[0] else 'no')" 2>/dev/null)
if [ "$HAS_DATA" = "ok" ]; then
  echo -e "${GREEN}PASS${NC} [GET /attendance/report] Has per-student report data"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /attendance/report] Missing per-student report data"
  FAIL=$((FAIL + 1))
fi

# Attendance summary
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/summary?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$AUTH")
assert_status 200 "$CODE" "[GET /attendance/summary] Get summary"

# Student self-view (student role)
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/my" -H "Authorization: Bearer $STUDENT_TOKEN")
assert_status 200 "$CODE" "[GET /attendance/my] Student self-view"

# Parent view
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/my-children" -H "Authorization: Bearer $PARENT_TOKEN")
assert_status 200 "$CODE" "[GET /attendance/my-children] Parent view"

# RBAC: student can't access /attendance/report
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/report" -H "Authorization: Bearer $STUDENT_TOKEN")
assert_status 403 "$CODE" "[GET /attendance/report] Student forbidden"

# RBAC: parent can't access /attendance/history
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/history?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "Authorization: Bearer $PARENT_TOKEN")
assert_status 403 "$CODE" "[GET /attendance/history] Parent forbidden"

# Student attendance via student routes
if [ -n "$STUDENT_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/students/$STUDENT_ID/attendance" -H "$AUTH")
  assert_status 200 "$CODE" "[GET /students/:id/attendance] Student attendance history"
fi

echo ""

# ============================================================
echo -e "${YELLOW}=== PERIOD ATTENDANCE ===${NC}"
# ============================================================

# Get period definitions
RESP=$(curl -s -w "\n%{http_code}" "$BASE/attendance/periods/definitions" -H "$AUTH")
CODE=$(echo "$RESP" | tail -1)
assert_status 200 "$CODE" "[GET /attendance/periods/definitions] List periods"

PERIOD_ID=$(echo "$RESP" | sed '$d' | python3 -c "
import sys,json
d=json.load(sys.stdin)
periods=d.get('data',[])
for p in periods:
    if p.get('type')=='class':
        print(p['id'])
        break
" 2>/dev/null)
echo "PERIOD_ID=$PERIOD_ID"

# Mark period attendance
if [ -n "$PERIOD_ID" ] && [ -n "$STUDENT_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/attendance/periods" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"date\":\"$TODAY\",\"classId\":\"$CLASS10_ID\",\"sectionId\":\"$SECTION_A_ID\",\"periodId\":\"$PERIOD_ID\",\"records\":[{\"studentId\":\"$STUDENT_ID\",\"status\":\"present\"}]}")
  assert_status 201 "$CODE" "[POST /attendance/periods] Mark period attendance"

  # Teacher can mark period attendance
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/attendance/periods" \
    -H "$TAUTH" -H "Content-Type: application/json" \
    -d "{\"date\":\"$TODAY\",\"classId\":\"$CLASS10_ID\",\"sectionId\":\"$SECTION_A_ID\",\"periodId\":\"$PERIOD_ID\",\"records\":[{\"studentId\":\"$STUDENT_ID\",\"status\":\"present\"}]}")
  assert_status 201 "$CODE" "[POST /attendance/periods] Teacher marks period attendance"
else
  echo -e "${RED}SKIP${NC} Missing PERIOD_ID or STUDENT_ID"
  FAIL=$((FAIL + 2))
fi

# Get period attendance
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/periods?date=$TODAY&classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "$AUTH")
assert_status 200 "$CODE" "[GET /attendance/periods] Get period attendance"

# Period summary
if [ -n "$STUDENT_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/periods/summary?studentId=$STUDENT_ID" -H "$AUTH")
  assert_status 200 "$CODE" "[GET /attendance/periods/summary] Period summary"
fi

# Update period definition (admin only)
if [ -n "$PERIOD_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/attendance/periods/definitions/$PERIOD_ID" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d '{"name":"Period 1 Updated"}')
  assert_status 200 "$CODE" "[PUT /attendance/periods/definitions/:id] Update period"

  # Teacher cannot update period definition
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/attendance/periods/definitions/$PERIOD_ID" \
    -H "$TAUTH" -H "Content-Type: application/json" \
    -d '{"name":"Should Fail"}')
  assert_status 403 "$CODE" "[PUT /attendance/periods/definitions/:id] Teacher forbidden"

  # Restore name
  curl -s -o /dev/null -X PUT "$BASE/attendance/periods/definitions/$PERIOD_ID" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d '{"name":"Period 1"}'
fi

echo ""

# ============================================================
echo -e "${YELLOW}=== STAFF ATTENDANCE ===${NC}"
# ============================================================

# Get staff daily attendance
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/staff/attendance?date=$TODAY" -H "$AUTH")
assert_status 200 "$CODE" "[GET /staff/attendance] Daily staff attendance"

# Mark staff attendance
if [ -n "$STAFF_ID" ]; then
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/staff/attendance" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"date\":\"$TODAY\",\"records\":[{\"staffId\":\"$STAFF_ID\",\"status\":\"present\",\"checkInTime\":\"08:00\",\"checkOutTime\":\"16:00\"}]}")
  CODE=$(echo "$RESP" | tail -1)
  assert_status 201 "$CODE" "[POST /staff/attendance] Mark staff attendance"

  # Verify data returned
  BODY=$(echo "$RESP" | sed '$d')
  HAS_RECORDS=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if len(d.get('data',[]))>0 else 'no')" 2>/dev/null)
  if [ "$HAS_RECORDS" = "ok" ]; then
    echo -e "${GREEN}PASS${NC} [POST /staff/attendance] Response has records"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} [POST /staff/attendance] No records returned"
    FAIL=$((FAIL + 1))
  fi
else
  echo -e "${RED}SKIP${NC} Missing STAFF_ID"
  FAIL=$((FAIL + 2))
fi

# Teacher cannot mark staff attendance
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/staff/attendance" \
  -H "$TAUTH" -H "Content-Type: application/json" \
  -d "{\"date\":\"$TODAY\",\"records\":[{\"staffId\":\"$STAFF_ID\",\"status\":\"present\"}]}")
assert_status 403 "$CODE" "[POST /staff/attendance] Teacher forbidden"

# Get staff attendance history
if [ -n "$STAFF_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/staff/$STAFF_ID/attendance" -H "$AUTH")
  assert_status 200 "$CODE" "[GET /staff/:id/attendance] Staff attendance history"

  # History has pagination
  RESP=$(curl -s "$BASE/staff/$STAFF_ID/attendance" -H "$AUTH")
  HAS_META=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if 'meta' in d else 'no')" 2>/dev/null)
  if [ "$HAS_META" = "ok" ]; then
    echo -e "${GREEN}PASS${NC} [GET /staff/:id/attendance] Has pagination meta"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} [GET /staff/:id/attendance] Missing pagination meta"
    FAIL=$((FAIL + 1))
  fi

  # Staff attendance summary
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/staff/$STAFF_ID/attendance/summary" -H "$AUTH")
  assert_status 200 "$CODE" "[GET /staff/:id/attendance/summary] Summary"

  # Teacher can read staff attendance
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/staff/$STAFF_ID/attendance" -H "$TAUTH")
  assert_status 200 "$CODE" "[GET /staff/:id/attendance] Teacher can read"
fi

echo ""

# ============================================================
echo -e "${YELLOW}=== LEAVE MANAGEMENT ===${NC}"
# ============================================================

# Get leave balance
if [ -n "$STAFF_ID" ]; then
  RESP=$(curl -s -w "\n%{http_code}" "$BASE/staff/$STAFF_ID/leave-balance" -H "$AUTH")
  CODE=$(echo "$RESP" | tail -1)
  assert_status 200 "$CODE" "[GET /staff/:id/leave-balance] Leave balance"

  # Balance has 4 types
  BODY=$(echo "$RESP" | sed '$d')
  BALANCE_COUNT=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
  if [ "$BALANCE_COUNT" = "4" ]; then
    echo -e "${GREEN}PASS${NC} [GET /staff/:id/leave-balance] Has 4 leave types"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} [GET /staff/:id/leave-balance] Expected 4 types, got $BALANCE_COUNT"
    FAIL=$((FAIL + 1))
  fi
fi

# List all leave requests
RESP=$(curl -s -w "\n%{http_code}" "$BASE/staff/leave-requests" -H "$AUTH")
CODE=$(echo "$RESP" | tail -1)
assert_status 200 "$CODE" "[GET /staff/leave-requests] List all requests"

BODY=$(echo "$RESP" | sed '$d')
LR_COUNT=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
if [ "$LR_COUNT" -ge 3 ] 2>/dev/null; then
  echo -e "${GREEN}PASS${NC} [GET /staff/leave-requests] Has >= 3 requests (got $LR_COUNT)"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /staff/leave-requests] Expected >= 3, got $LR_COUNT"
  FAIL=$((FAIL + 1))
fi

# Leave requests have pagination
HAS_META=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if 'meta' in d else 'no')" 2>/dev/null)
if [ "$HAS_META" = "ok" ]; then
  echo -e "${GREEN}PASS${NC} [GET /staff/leave-requests] Has pagination meta"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /staff/leave-requests] Missing pagination meta"
  FAIL=$((FAIL + 1))
fi

# Teacher cannot list all leave requests
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/staff/leave-requests" -H "$TAUTH")
assert_status 403 "$CODE" "[GET /staff/leave-requests] Teacher forbidden"

# List staff's own leave requests
if [ -n "$STAFF_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/staff/$STAFF_ID/leave-requests" -H "$AUTH")
  assert_status 200 "$CODE" "[GET /staff/:id/leave-requests] Staff's requests"
fi

# Create leave request
if [ -n "$STAFF_ID2" ]; then
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/staff/$STAFF_ID2/leave-requests" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d '{"type":"CL","startDate":"2025-04-01","endDate":"2025-04-02","days":2,"reason":"Family event"}')
  CODE=$(echo "$RESP" | tail -1)
  assert_status 201 "$CODE" "[POST /staff/:id/leave-requests] Create leave request"

  BODY=$(echo "$RESP" | sed '$d')
  NEW_LR_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
  NEW_LR_STATUS=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('status',''))" 2>/dev/null)

  if [ "$NEW_LR_STATUS" = "pending" ]; then
    echo -e "${GREEN}PASS${NC} [POST /staff/:id/leave-requests] Status is pending"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} [POST /staff/:id/leave-requests] Expected pending, got $NEW_LR_STATUS"
    FAIL=$((FAIL + 1))
  fi

  # Approve leave request
  if [ -n "$NEW_LR_ID" ]; then
    RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE/staff/leave-requests/$NEW_LR_ID" \
      -H "$AUTH" -H "Content-Type: application/json" \
      -d '{"status":"approved","reviewRemarks":"Approved"}')
    CODE=$(echo "$RESP" | tail -1)
    assert_status 200 "$CODE" "[PATCH /staff/leave-requests/:id] Approve request"

    BODY=$(echo "$RESP" | sed '$d')
    APPROVED_STATUS=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('status',''))" 2>/dev/null)
    if [ "$APPROVED_STATUS" = "approved" ]; then
      echo -e "${GREEN}PASS${NC} [PATCH /staff/leave-requests/:id] Status changed to approved"
      PASS=$((PASS + 1))
    else
      echo -e "${RED}FAIL${NC} [PATCH /staff/leave-requests/:id] Expected approved, got $APPROVED_STATUS"
      FAIL=$((FAIL + 1))
    fi

    # Can't approve again
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/staff/leave-requests/$NEW_LR_ID" \
      -H "$AUTH" -H "Content-Type: application/json" \
      -d '{"status":"rejected"}')
    assert_status 400 "$CODE" "[PATCH /staff/leave-requests/:id] Can't re-process"
  fi

  # Create another to reject
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/staff/$STAFF_ID2/leave-requests" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d '{"type":"SL","startDate":"2025-04-10","endDate":"2025-04-10","days":1,"reason":"Sick"}')
  CODE=$(echo "$RESP" | tail -1)
  BODY=$(echo "$RESP" | sed '$d')
  REJECT_LR_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)

  if [ -n "$REJECT_LR_ID" ]; then
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/staff/leave-requests/$REJECT_LR_ID" \
      -H "$AUTH" -H "Content-Type: application/json" \
      -d '{"status":"rejected","reviewRemarks":"Need medical certificate"}')
    assert_status 200 "$CODE" "[PATCH /staff/leave-requests/:id] Reject request"
  fi

  # Teacher cannot approve/reject
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/staff/$STAFF_ID/leave-requests" \
    -H "$TAUTH" -H "Content-Type: application/json" \
    -d '{"type":"CL","startDate":"2025-05-01","endDate":"2025-05-01","days":1,"reason":"Test"}')
  CODE=$(echo "$RESP" | tail -1)
  assert_status 201 "$CODE" "[POST /staff/:id/leave-requests] Teacher can create"

  BODY=$(echo "$RESP" | sed '$d')
  TEACHER_LR_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)

  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/staff/leave-requests/$TEACHER_LR_ID" \
    -H "$TAUTH" -H "Content-Type: application/json" \
    -d '{"status":"approved"}')
  assert_status 403 "$CODE" "[PATCH /staff/leave-requests/:id] Teacher can't approve"
fi

echo ""

# ============================================================
echo -e "${YELLOW}=== TIMETABLE — ROOMS ===${NC}"
# ============================================================

# List rooms
RESP=$(curl -s -w "\n%{http_code}" "$BASE/timetable/rooms" -H "$AUTH")
CODE=$(echo "$RESP" | tail -1)
assert_status 200 "$CODE" "[GET /timetable/rooms] List rooms"

BODY=$(echo "$RESP" | sed '$d')
ROOM_COUNT=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
if [ "$ROOM_COUNT" -ge 10 ] 2>/dev/null; then
  echo -e "${GREEN}PASS${NC} [GET /timetable/rooms] Has >= 10 rooms"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /timetable/rooms] Expected >= 10, got $ROOM_COUNT"
  FAIL=$((FAIL + 1))
fi

# Create room
RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/timetable/rooms" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Test Room","type":"classroom","capacity":25,"building":"Test Block","floor":"Ground"}')
CODE=$(echo "$RESP" | tail -1)
assert_status 201 "$CODE" "[POST /timetable/rooms] Create room"

BODY=$(echo "$RESP" | sed '$d')
TEST_ROOM_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)

# Duplicate room name fails
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/timetable/rooms" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Test Room","type":"classroom"}')
assert_status 409 "$CODE" "[POST /timetable/rooms] Duplicate name conflict"

# Update room
if [ -n "$TEST_ROOM_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/timetable/rooms/$TEST_ROOM_ID" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d '{"capacity":30}')
  assert_status 200 "$CODE" "[PUT /timetable/rooms/:id] Update room"
fi

# Teacher can read rooms
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/timetable/rooms" -H "$TAUTH")
assert_status 200 "$CODE" "[GET /timetable/rooms] Teacher can read"

# Teacher cannot create room
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/timetable/rooms" \
  -H "$TAUTH" -H "Content-Type: application/json" \
  -d '{"name":"Fail Room"}')
assert_status 403 "$CODE" "[POST /timetable/rooms] Teacher forbidden"

# Delete room
if [ -n "$TEST_ROOM_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/timetable/rooms/$TEST_ROOM_ID" -H "$AUTH")
  assert_status 200 "$CODE" "[DELETE /timetable/rooms/:id] Delete room"
fi

echo ""

# ============================================================
echo -e "${YELLOW}=== TIMETABLE — CORE ===${NC}"
# ============================================================

# Stats
RESP=$(curl -s -w "\n%{http_code}" "$BASE/timetable/stats" -H "$AUTH")
CODE=$(echo "$RESP" | tail -1)
assert_status 200 "$CODE" "[GET /timetable/stats] Get stats"

BODY=$(echo "$RESP" | sed '$d')
HAS_STATS=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if 'totalTimetables' in d.get('data',{}) else 'no')" 2>/dev/null)
if [ "$HAS_STATS" = "ok" ]; then
  echo -e "${GREEN}PASS${NC} [GET /timetable/stats] Has stats data"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /timetable/stats] Missing stats data"
  FAIL=$((FAIL + 1))
fi

# Period definitions
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/timetable/periods" -H "$AUTH")
assert_status 200 "$CODE" "[GET /timetable/periods] List periods"

# Subjects
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/timetable/subjects" -H "$AUTH")
assert_status 200 "$CODE" "[GET /timetable/subjects] List subjects"

# List timetables
RESP=$(curl -s -w "\n%{http_code}" "$BASE/timetable/timetables" -H "$AUTH")
CODE=$(echo "$RESP" | tail -1)
assert_status 200 "$CODE" "[GET /timetable/timetables] List timetables"

BODY=$(echo "$RESP" | sed '$d')
TT_COUNT=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
if [ "$TT_COUNT" -ge 2 ] 2>/dev/null; then
  echo -e "${GREEN}PASS${NC} [GET /timetable/timetables] Has >= 2 timetables"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /timetable/timetables] Expected >= 2, got $TT_COUNT"
  FAIL=$((FAIL + 1))
fi

# Get existing timetable ID
EXISTING_TT_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); tt=d.get('data',[]); print(tt[0]['id'] if tt else '')" 2>/dev/null)

# Get timetable by ID
if [ -n "$EXISTING_TT_ID" ]; then
  RESP=$(curl -s -w "\n%{http_code}" "$BASE/timetable/timetables/$EXISTING_TT_ID" -H "$AUTH")
  CODE=$(echo "$RESP" | tail -1)
  assert_status 200 "$CODE" "[GET /timetable/timetables/:id] Get timetable"

  BODY=$(echo "$RESP" | sed '$d')
  HAS_ENTRIES=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if len(d.get('data',{}).get('entries',[]))>0 else 'no')" 2>/dev/null)
  if [ "$HAS_ENTRIES" = "ok" ]; then
    echo -e "${GREEN}PASS${NC} [GET /timetable/timetables/:id] Has entries"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} [GET /timetable/timetables/:id] No entries"
    FAIL=$((FAIL + 1))
  fi
fi

# Create a new timetable (need a class/section/year that doesn't have one yet)
# Use Class 1, Section A
CLASS1_ID=$(echo "$STUDENTS_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('data',[]):
    if s.get('class','')=='Class 1':
        print(s['classId'])
        break
" 2>/dev/null)
SECTION_1A_ID=$(echo "$STUDENTS_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('data',[]):
    if s.get('class','')=='Class 1' and s.get('section','')=='A':
        print(s['sectionId'])
        break
" 2>/dev/null)
AY_ID=$(curl -s "$BASE/settings/academic-years" -H "$AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for y in d.get('data',[]):
    if y.get('isCurrent'):
        print(y['id'])
        break
" 2>/dev/null)
echo "CLASS1_ID=$CLASS1_ID  SECTION_1A_ID=$SECTION_1A_ID  AY_ID=$AY_ID"

if [ -n "$CLASS1_ID" ] && [ -n "$SECTION_1A_ID" ] && [ -n "$AY_ID" ]; then
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/timetable/timetables" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"classId\":\"$CLASS1_ID\",\"sectionId\":\"$SECTION_1A_ID\",\"academicYearId\":\"$AY_ID\"}")
  CODE=$(echo "$RESP" | tail -1)
  assert_status 201 "$CODE" "[POST /timetable/timetables] Create timetable"

  BODY=$(echo "$RESP" | sed '$d')
  NEW_TT_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
  NEW_TT_STATUS=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('status',''))" 2>/dev/null)

  if [ "$NEW_TT_STATUS" = "draft" ]; then
    echo -e "${GREEN}PASS${NC} [POST /timetable/timetables] Status is draft"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} [POST /timetable/timetables] Expected draft, got $NEW_TT_STATUS"
    FAIL=$((FAIL + 1))
  fi

  # Duplicate create fails
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/timetable/timetables" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"classId\":\"$CLASS1_ID\",\"sectionId\":\"$SECTION_1A_ID\",\"academicYearId\":\"$AY_ID\"}")
  assert_status 409 "$CODE" "[POST /timetable/timetables] Duplicate conflict"

  # Add entry to draft timetable
  if [ -n "$NEW_TT_ID" ] && [ -n "$PERIOD_ID" ]; then
    SUBJ_ID=$(curl -s "$BASE/timetable/subjects" -H "$AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin)
subjs=d.get('data',[])
if subjs: print(subjs[0]['id'])
" 2>/dev/null)

    RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/timetable/timetables/$NEW_TT_ID/entries" \
      -H "$AUTH" -H "Content-Type: application/json" \
      -d "{\"dayOfWeek\":\"monday\",\"periodId\":\"$PERIOD_ID\",\"subjectId\":\"$SUBJ_ID\"}")
    CODE=$(echo "$RESP" | tail -1)
    assert_status 201 "$CODE" "[POST /timetable/timetables/:id/entries] Add entry"

    BODY=$(echo "$RESP" | sed '$d')
    ENTRY_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)

    # Delete entry
    if [ -n "$ENTRY_ID" ]; then
      CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/timetable/entries/$ENTRY_ID" -H "$AUTH")
      assert_status 200 "$CODE" "[DELETE /timetable/entries/:id] Delete entry"
    fi

    # Re-add entry for publish test
    curl -s -o /dev/null -X POST "$BASE/timetable/timetables/$NEW_TT_ID/entries" \
      -H "$AUTH" -H "Content-Type: application/json" \
      -d "{\"dayOfWeek\":\"monday\",\"periodId\":\"$PERIOD_ID\",\"subjectId\":\"$SUBJ_ID\"}"
  fi

  # Update timetable
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/timetable/timetables/$NEW_TT_ID" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d '{"effectiveFrom":"2025-04-01"}')
  assert_status 200 "$CODE" "[PUT /timetable/timetables/:id] Update timetable"

  # Publish timetable
  RESP=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE/timetable/timetables/$NEW_TT_ID/publish" -H "$AUTH")
  CODE=$(echo "$RESP" | tail -1)
  assert_status 200 "$CODE" "[PATCH /timetable/timetables/:id/publish] Publish"

  BODY=$(echo "$RESP" | sed '$d')
  PUB_STATUS=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('status',''))" 2>/dev/null)
  if [ "$PUB_STATUS" = "published" ]; then
    echo -e "${GREEN}PASS${NC} [PATCH /timetable/timetables/:id/publish] Status is published"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} [PATCH /timetable/timetables/:id/publish] Expected published, got $PUB_STATUS"
    FAIL=$((FAIL + 1))
  fi

  # Can't add entry to published timetable
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/timetable/timetables/$NEW_TT_ID/entries" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"dayOfWeek\":\"tuesday\",\"periodId\":\"$PERIOD_ID\"}")
  assert_status 400 "$CODE" "[POST /timetable/timetables/:id/entries] Can't add to published"

  # Teacher can read timetable
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/timetable/timetables/$NEW_TT_ID" -H "$TAUTH")
  assert_status 200 "$CODE" "[GET /timetable/timetables/:id] Teacher can read"

  # Teacher cannot create timetable
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/timetable/timetables" \
    -H "$TAUTH" -H "Content-Type: application/json" \
    -d "{\"classId\":\"$CLASS1_ID\",\"sectionId\":\"$SECTION_1A_ID\",\"academicYearId\":\"$AY_ID\"}")
  assert_status 403 "$CODE" "[POST /timetable/timetables] Teacher forbidden"
fi

echo ""

# ============================================================
echo -e "${YELLOW}=== TIMETABLE — VIEWS ===${NC}"
# ============================================================

# Get a teacher's staff ID for timetable view
STAFF_RESP=$(curl -s "$BASE/staff" -H "$AUTH")
TEACHER_STAFF_ID=$(echo "$STAFF_RESP" | python3 -c "
import sys,json
d=json.load(sys.stdin)
for s in d.get('data',[]):
    if 'Priya' in s.get('name',''):
        print(s['id'])
        break
" 2>/dev/null)

if [ -n "$TEACHER_STAFF_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/timetable/teachers/$TEACHER_STAFF_ID/timetable" -H "$AUTH")
  assert_status 200 "$CODE" "[GET /timetable/teachers/:id/timetable] Teacher schedule"
fi

# Room timetable
ROOM_ID=$(curl -s "$BASE/timetable/rooms" -H "$AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin)
rooms=d.get('data',[])
if rooms: print(rooms[0]['id'])
" 2>/dev/null)

if [ -n "$ROOM_ID" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/timetable/rooms/$ROOM_ID/timetable" -H "$AUTH")
  assert_status 200 "$CODE" "[GET /timetable/rooms/:id/timetable] Room utilization"
fi

# Update period definition via timetable route
PERIOD_ID_TT=$(curl -s "$BASE/timetable/periods" -H "$AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin)
periods=d.get('data',[])
if periods: print(periods[0]['id'])
" 2>/dev/null)

if [ -n "$PERIOD_ID_TT" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/timetable/periods/$PERIOD_ID_TT" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d '{"name":"Assembly Updated"}')
  assert_status 200 "$CODE" "[PUT /timetable/periods/:id] Update period via timetable"

  # Restore
  curl -s -o /dev/null -X PUT "$BASE/timetable/periods/$PERIOD_ID_TT" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d '{"name":"Assembly"}'
fi

echo ""

# ============================================================
echo -e "${YELLOW}=== SUBSTITUTIONS ===${NC}"
# ============================================================

# List substitutions
RESP=$(curl -s -w "\n%{http_code}" "$BASE/timetable/substitutions" -H "$AUTH")
CODE=$(echo "$RESP" | tail -1)
assert_status 200 "$CODE" "[GET /timetable/substitutions] List substitutions"

BODY=$(echo "$RESP" | sed '$d')
SUB_COUNT=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null)
if [ "$SUB_COUNT" -ge 2 ] 2>/dev/null; then
  echo -e "${GREEN}PASS${NC} [GET /timetable/substitutions] Has >= 2 subs"
  PASS=$((PASS + 1))
else
  echo -e "${RED}FAIL${NC} [GET /timetable/substitutions] Expected >= 2, got $SUB_COUNT"
  FAIL=$((FAIL + 1))
fi

# Create substitution
# Get an entry ID from existing timetable
ENTRY_FOR_SUB=$(curl -s "$BASE/timetable/timetables/$EXISTING_TT_ID" -H "$AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin)
entries=d.get('data',{}).get('entries',[])
if len(entries)>2: print(entries[2]['id'])
" 2>/dev/null)

if [ -n "$ENTRY_FOR_SUB" ]; then
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/timetable/substitutions" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"date\":\"$TODAY\",\"timetableEntryId\":\"$ENTRY_FOR_SUB\",\"reason\":\"Test substitution\"}")
  CODE=$(echo "$RESP" | tail -1)
  assert_status 201 "$CODE" "[POST /timetable/substitutions] Create substitution"

  BODY=$(echo "$RESP" | sed '$d')
  NEW_SUB_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)
  NEW_SUB_STATUS=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('status',''))" 2>/dev/null)

  if [ "$NEW_SUB_STATUS" = "pending" ]; then
    echo -e "${GREEN}PASS${NC} [POST /timetable/substitutions] Status is pending"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}FAIL${NC} [POST /timetable/substitutions] Expected pending, got $NEW_SUB_STATUS"
    FAIL=$((FAIL + 1))
  fi

  # Teacher can create substitution
  ENTRY_FOR_TSUB=$(curl -s "$BASE/timetable/timetables/$EXISTING_TT_ID" -H "$AUTH" | python3 -c "
import sys,json
d=json.load(sys.stdin)
entries=d.get('data',{}).get('entries',[])
if len(entries)>3: print(entries[3]['id'])
" 2>/dev/null)

  if [ -n "$ENTRY_FOR_TSUB" ]; then
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/timetable/substitutions" \
      -H "$TAUTH" -H "Content-Type: application/json" \
      -d "{\"date\":\"$TODAY\",\"timetableEntryId\":\"$ENTRY_FOR_TSUB\",\"reason\":\"Teacher sub\"}")
    assert_status 201 "$CODE" "[POST /timetable/substitutions] Teacher can create"
  fi

  # Approve substitution
  if [ -n "$NEW_SUB_ID" ]; then
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/timetable/substitutions/$NEW_SUB_ID/approve" -H "$AUTH")
    assert_status 200 "$CODE" "[PATCH /timetable/substitutions/:id/approve] Approve"

    # Can't approve again
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/timetable/substitutions/$NEW_SUB_ID/approve" -H "$AUTH")
    assert_status 400 "$CODE" "[PATCH /timetable/substitutions/:id/approve] Can't re-approve"
  fi

  # Create another to reject
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/timetable/substitutions" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"date\":\"$TODAY\",\"timetableEntryId\":\"$ENTRY_FOR_SUB\",\"reason\":\"To reject\"}")
  CODE=$(echo "$RESP" | tail -1)
  BODY=$(echo "$RESP" | sed '$d')
  REJECT_SUB_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)

  if [ -n "$REJECT_SUB_ID" ]; then
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/timetable/substitutions/$REJECT_SUB_ID/reject" -H "$AUTH")
    assert_status 200 "$CODE" "[PATCH /timetable/substitutions/:id/reject] Reject"
  fi

  # Create one more to delete
  RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/timetable/substitutions" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"date\":\"$TODAY\",\"timetableEntryId\":\"$ENTRY_FOR_SUB\",\"reason\":\"To delete\"}")
  BODY=$(echo "$RESP" | sed '$d')
  DELETE_SUB_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',{}).get('id',''))" 2>/dev/null)

  if [ -n "$DELETE_SUB_ID" ]; then
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/timetable/substitutions/$DELETE_SUB_ID" -H "$AUTH")
    assert_status 200 "$CODE" "[DELETE /timetable/substitutions/:id] Delete"
  fi

  # Teacher can't approve
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/timetable/substitutions/$REJECT_SUB_ID/approve" -H "$TAUTH")
  assert_status 403 "$CODE" "[PATCH /timetable/substitutions/:id/approve] Teacher forbidden"
fi

echo ""

# ============================================================
echo -e "${YELLOW}=== RBAC VALIDATION ===${NC}"
# ============================================================

# Student can't access staff endpoints
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/staff/attendance" -H "Authorization: Bearer $STUDENT_TOKEN")
assert_status 403 "$CODE" "[GET /staff/attendance] Student forbidden"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/timetable/stats" -H "Authorization: Bearer $STUDENT_TOKEN")
assert_status 403 "$CODE" "[GET /timetable/stats] Student forbidden"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/timetable/rooms" -H "Authorization: Bearer $STUDENT_TOKEN")
assert_status 403 "$CODE" "[GET /timetable/rooms] Student forbidden"

# Parent can only access /my-children
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/my-children" -H "Authorization: Bearer $PARENT_TOKEN")
assert_status 200 "$CODE" "[GET /attendance/my-children] Parent allowed"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance/students?classId=$CLASS10_ID&sectionId=$SECTION_A_ID" -H "Authorization: Bearer $PARENT_TOKEN")
assert_status 403 "$CODE" "[GET /attendance/students] Parent forbidden"

# No auth = 401
CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/attendance")
assert_status 401 "$CODE" "[GET /attendance] No auth = 401"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/timetable/stats")
assert_status 401 "$CODE" "[GET /timetable/stats] No auth = 401"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/staff/attendance")
assert_status 401 "$CODE" "[GET /staff/attendance] No auth = 401"

echo ""

# ============================================================
echo "============================================================"
echo ""
echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, $((PASS + FAIL)) total"
echo ""
if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
else
  echo -e "${RED}$FAIL test(s) failed${NC}"
fi
echo ""
