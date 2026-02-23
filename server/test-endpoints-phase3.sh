#!/bin/bash
# Phase 3: Students + Staff — Endpoint Tests
# Run after: prisma migrate dev, prisma db seed, server running on :3001

set -e

BASE="http://localhost:3001/api"
PASS=0
FAIL=0
TOTAL=0

# Colors
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m"

assert_status() {
  local desc="$1"
  local expected="$2"
  local actual="$3"
  local body="$4"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" -eq "$expected" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}✓${NC} $desc (HTTP $actual)"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}✗${NC} $desc (expected $expected, got $actual)"
    echo "    Body: $(echo "$body" | head -c 300)"
  fi
}

# Login as admin
echo -e "\n${YELLOW}=== Auth ===${NC}"
LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paperbook.in","password":"demo123"}')
LOGIN_CODE=$(echo "$LOGIN_RESP" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RESP" | sed '$d')
assert_status "Admin login" 200 "$LOGIN_CODE" "$LOGIN_BODY"
TOKEN=$(echo "$LOGIN_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

# Login as teacher
TEACHER_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@paperbook.in","password":"demo123"}')
TEACHER_TOKEN=$(echo "$TEACHER_RESP" | sed '$d' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

# Login as student (for RBAC tests)
STUDENT_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@paperbook.in","password":"demo123"}')
STUDENT_TOKEN=$(echo "$STUDENT_RESP" | sed '$d' | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)

AUTH="-H \"Authorization: Bearer $TOKEN\""

# Helper function
api() {
  local method="$1"
  local url="$2"
  local data="$3"
  local token="${4:-$TOKEN}"
  if [ -n "$data" ]; then
    curl -s -w "\n%{http_code}" -X "$method" "$BASE$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$data"
  else
    curl -s -w "\n%{http_code}" -X "$method" "$BASE$url" \
      -H "Authorization: Bearer $token"
  fi
}

get_code() { echo "$1" | tail -1; }
get_body() { echo "$1" | sed '$d'; }

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: CRUD ===${NC}"
# ============================================================================

# List students
RESP=$(api GET "/students?page=1&limit=5")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List students (paginated)" 200 "$CODE" "$BODY"
STUDENT_TOTAL=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['meta']['total'])" 2>/dev/null)
echo "    → Total students: $STUDENT_TOTAL"

# List with search
RESP=$(api GET "/students?search=Aarav")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Search students by name" 200 "$CODE" "$BODY"

# List with class filter
RESP=$(api GET "/students?class=Class+1")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Filter students by class" 200 "$CODE" "$BODY"

# Create student
RESP=$(api POST "/students" '{"firstName":"Test","lastName":"Student","email":"test.student@test.com","class":"Class 5","section":"A"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Create student" 201 "$CODE" "$BODY"
NEW_STUDENT_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
NEW_STUDENT_ADM=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['admissionNumber'])" 2>/dev/null)
echo "    → ID: $NEW_STUDENT_ID, Admission: $NEW_STUDENT_ADM"

# Get student
RESP=$(api GET "/students/$NEW_STUDENT_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get student by ID" 200 "$CODE" "$BODY"

# Update student
RESP=$(api PUT "/students/$NEW_STUDENT_ID" '{"firstName":"Updated","lastName":"Student","phone":"+91 99999 00001","address":{"street":"123 Test St","city":"Delhi","state":"Delhi","pincode":"110001"}}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update student" 200 "$CODE" "$BODY"

# Get updated student to verify name
RESP=$(api GET "/students/$NEW_STUDENT_ID")
BODY=$(get_body "$RESP")
UPDATED_NAME=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['name'])" 2>/dev/null)
echo "    → Updated name: $UPDATED_NAME"

# Duplicate email
RESP=$(api POST "/students" '{"firstName":"Dup","lastName":"Test","email":"test.student@test.com","class":"Class 5","section":"A"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Reject duplicate email" 409 "$CODE" "$BODY"

# Invalid class
RESP=$(api POST "/students" '{"firstName":"Bad","lastName":"Class","email":"badclass@test.com","class":"Class 99","section":"A"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Reject invalid class" 400 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: Documents ===${NC}"
# ============================================================================

RESP=$(api GET "/students/$NEW_STUDENT_ID/documents")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List student documents" 200 "$CODE" "$BODY"

RESP=$(api POST "/students/$NEW_STUDENT_ID/documents" '{"type":"birth_certificate","name":"Birth Certificate","fileName":"bc.pdf","url":"/uploads/bc.pdf","fileSize":100000}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Create document" 201 "$CODE" "$BODY"
DOC_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

RESP=$(api PATCH "/students/$NEW_STUDENT_ID/documents/$DOC_ID/verify" '{}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Verify document" 200 "$CODE" "$BODY"

RESP=$(api DELETE "/students/$NEW_STUDENT_ID/documents/$DOC_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Delete document" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: Health Records ===${NC}"
# ============================================================================

RESP=$(api GET "/students/$NEW_STUDENT_ID/health")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get health record (empty)" 200 "$CODE" "$BODY"

RESP=$(api PUT "/students/$NEW_STUDENT_ID/health" '{"allergies":["Peanuts"],"bloodGroup":"O+","height":145,"weight":40}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Upsert health record" 200 "$CODE" "$BODY"

RESP=$(api PUT "/students/$NEW_STUDENT_ID/health" '{"allergies":["Peanuts","Dust"],"height":146}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update health record" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: Timeline ===${NC}"
# ============================================================================

RESP=$(api GET "/students/$NEW_STUDENT_ID/timeline")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List timeline events" 200 "$CODE" "$BODY"
TIMELINE_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "    → Timeline events: $TIMELINE_COUNT"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: Siblings ===${NC}"
# ============================================================================

# Get a seed student ID for sibling linking
SEED_STUDENT_RESP=$(api GET "/students?search=Aarav&limit=1")
SEED_STUDENT_ID=$(echo "$SEED_STUDENT_RESP" | sed '$d' | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])" 2>/dev/null)

RESP=$(api GET "/students/$NEW_STUDENT_ID/siblings")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get siblings (empty)" 200 "$CODE" "$BODY"

RESP=$(api POST "/students/$NEW_STUDENT_ID/siblings" "{\"siblingId\":\"$SEED_STUDENT_ID\"}")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Link sibling" 201 "$CODE" "$BODY"

RESP=$(api GET "/students/$NEW_STUDENT_ID/siblings")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get siblings (linked)" 200 "$CODE" "$BODY"

# Self-link should fail
RESP=$(api POST "/students/$NEW_STUDENT_ID/siblings" "{\"siblingId\":\"$NEW_STUDENT_ID\"}")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Reject self-sibling" 400 "$CODE" "$BODY"

# Duplicate link should fail
RESP=$(api POST "/students/$NEW_STUDENT_ID/siblings" "{\"siblingId\":\"$SEED_STUDENT_ID\"}")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Reject duplicate sibling link" 409 "$CODE" "$BODY"

RESP=$(api DELETE "/students/$NEW_STUDENT_ID/siblings/$SEED_STUDENT_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Unlink sibling" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: ID Card ===${NC}"
# ============================================================================

RESP=$(api GET "/students/$NEW_STUDENT_ID/id-card")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get ID card data" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: Skills ===${NC}"
# ============================================================================

RESP=$(api POST "/students/$NEW_STUDENT_ID/skills" '{"name":"Chess","category":"academic","proficiencyLevel":4}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Add student skill" 201 "$CODE" "$BODY"
SKILL_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

RESP=$(api PUT "/students/$NEW_STUDENT_ID/skills/$SKILL_ID" '{"proficiencyLevel":5}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update student skill" 200 "$CODE" "$BODY"

RESP=$(api DELETE "/students/$NEW_STUDENT_ID/skills/$SKILL_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Delete student skill" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: Portfolio ===${NC}"
# ============================================================================

RESP=$(api GET "/students/$NEW_STUDENT_ID/portfolio")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get portfolio" 200 "$CODE" "$BODY"

RESP=$(api POST "/students/$NEW_STUDENT_ID/portfolio/items" '{"title":"Science Fair Project","type":"project","description":"Solar system model","tags":["science","solar"],"visibility":"school"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Add portfolio item" 201 "$CODE" "$BODY"
ITEM_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

RESP=$(api PUT "/students/$NEW_STUDENT_ID/portfolio/items/$ITEM_ID" '{"featured":true}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update portfolio item" 200 "$CODE" "$BODY"

RESP=$(api DELETE "/students/$NEW_STUDENT_ID/portfolio/items/$ITEM_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Delete portfolio item" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: Promotion ===${NC}"
# ============================================================================

RESP=$(api POST "/students/promote" "{\"studentIds\":[\"$NEW_STUDENT_ID\"],\"toClass\":\"Class 6\",\"toSection\":\"A\"}")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Promote students" 200 "$CODE" "$BODY"

# Verify promoted
RESP=$(api GET "/students/$NEW_STUDENT_ID")
BODY=$(get_body "$RESP")
PROMOTED_CLASS=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['class'])" 2>/dev/null)
echo "    → Promoted to: $PROMOTED_CLASS"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: Bulk ===${NC}"
# ============================================================================

RESP=$(api POST "/students/bulk-import" '{"students":[{"firstName":"Bulk1","lastName":"Test","email":"bulk1@test.com","class":"Class 3","section":"B"},{"firstName":"Bulk2","lastName":"Test","email":"bulk2@test.com","class":"Class 4","section":"A"}]}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Bulk import students" 201 "$CODE" "$BODY"

RESP=$(api GET "/students/export")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Export students" 200 "$CODE" "$BODY"
EXPORT_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "    → Exported: $EXPORT_COUNT students"

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: RBAC ===${NC}"
# ============================================================================

# Teacher should be able to read
RESP=$(api GET "/students" "" "$TEACHER_TOKEN")
CODE=$(get_code "$RESP")
assert_status "Teacher can list students" 200 "$CODE" ""

# Teacher should NOT be able to create
RESP=$(api POST "/students" '{"firstName":"X","lastName":"Y","email":"xy@test.com","class":"Class 1","section":"A"}' "$TEACHER_TOKEN")
CODE=$(get_code "$RESP")
assert_status "Teacher cannot create student (403)" 403 "$CODE" ""

# Student role should not be able to access
RESP=$(api GET "/students" "" "$STUDENT_TOKEN")
CODE=$(get_code "$RESP")
assert_status "Student role cannot list students (403)" 403 "$CODE" ""

# Delete test students
api DELETE "/students/$NEW_STUDENT_ID" > /dev/null 2>&1
# Clean bulk imports
BULK_RESP=$(api GET "/students?search=Bulk")
BULK_IDS=$(echo "$BULK_RESP" | sed '$d' | python3 -c "import sys,json; [print(s['id']) for s in json.load(sys.stdin)['data']]" 2>/dev/null)
for BID in $BULK_IDS; do
  api DELETE "/students/$BID" > /dev/null 2>&1
done

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: CRUD ===${NC}"
# ============================================================================

RESP=$(api GET "/staff?page=1&limit=5")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List staff (paginated)" 200 "$CODE" "$BODY"
STAFF_TOTAL=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['meta']['total'])" 2>/dev/null)
echo "    → Total staff: $STAFF_TOTAL"

# Search
RESP=$(api GET "/staff?search=Priya")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Search staff by name" 200 "$CODE" "$BODY"

# Filter by department
RESP=$(api GET "/staff?department=Mathematics")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Filter staff by department" 200 "$CODE" "$BODY"

# Create staff
RESP=$(api POST "/staff" '{"name":"Test Staff Member","email":"test.staff@test.com","department":"Science","designation":"Teacher","salary":55000,"qualification":["B.Ed","M.Sc"]}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Create staff" 201 "$CODE" "$BODY"
NEW_STAFF_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
NEW_STAFF_EID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['employeeId'])" 2>/dev/null)
echo "    → ID: $NEW_STAFF_ID, EmpId: $NEW_STAFF_EID"

# Name split verification
STAFF_FNAME=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['firstName'])" 2>/dev/null)
STAFF_LNAME=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['lastName'])" 2>/dev/null)
echo "    → Name split: first='$STAFF_FNAME', last='$STAFF_LNAME'"

# Qualification as array
STAFF_QUALS=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['qualification'])" 2>/dev/null)
echo "    → Qualifications: $STAFF_QUALS"

# Get staff
RESP=$(api GET "/staff/$NEW_STAFF_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get staff by ID" 200 "$CODE" "$BODY"

# Update staff
RESP=$(api PUT "/staff/$NEW_STAFF_ID" '{"name":"Updated Staff","department":"English","address":{"street":"456 Update St","city":"Mumbai","state":"Maharashtra","pincode":"400001"}}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update staff" 200 "$CODE" "$BODY"

# Department findOrCreate
RESP=$(api POST "/staff" '{"name":"New Dept Staff","email":"newdept@test.com","department":"Robotics","designation":"Lab Coordinator"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Create staff with new department (findOrCreate)" 201 "$CODE" "$BODY"
NEWDEPT_STAFF_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

# Duplicate email
RESP=$(api POST "/staff" '{"name":"Dup","email":"test.staff@test.com","department":"Science","designation":"Teacher"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Reject duplicate staff email" 409 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: Professional Development ===${NC}"
# ============================================================================

RESP=$(api GET "/staff/professional-development")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List all PD records" 200 "$CODE" "$BODY"

RESP=$(api POST "/staff/$NEW_STAFF_ID/professional-development" '{"type":"workshop","title":"React Testing Workshop","provider":"Udemy","startDate":"2025-01-15","status":"completed","hours":20}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Create PD record" 201 "$CODE" "$BODY"
PD_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

RESP=$(api GET "/staff/$NEW_STAFF_ID/professional-development")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List staff PD records" 200 "$CODE" "$BODY"

RESP=$(api PUT "/staff/professional-development/$PD_ID" '{"hours":25,"status":"completed"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update PD record" 200 "$CODE" "$BODY"

RESP=$(api DELETE "/staff/professional-development/$PD_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Delete PD record" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: Performance Reviews ===${NC}"
# ============================================================================

RESP=$(api GET "/staff/performance-reviews")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List all reviews" 200 "$CODE" "$BODY"

# Get a seed staff for reviewer
SEED_STAFF_RESP=$(api GET "/staff?search=Rajesh&limit=1")
REVIEWER_ID=$(echo "$SEED_STAFF_RESP" | sed '$d' | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])" 2>/dev/null)

RESP=$(api POST "/staff/performance-reviews" "{\"staffId\":\"$NEW_STAFF_ID\",\"reviewerId\":\"$REVIEWER_ID\",\"period\":\"Q1\",\"year\":2025,\"overallRating\":4.0,\"strengths\":\"Good\",\"status\":\"submitted\"}")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Create performance review" 201 "$CODE" "$BODY"
REVIEW_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

RESP=$(api GET "/staff/$NEW_STAFF_ID/performance-reviews")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List staff reviews" 200 "$CODE" "$BODY"

RESP=$(api PATCH "/staff/performance-reviews/$REVIEW_ID/acknowledge" '{}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Acknowledge review" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: Skills ===${NC}"
# ============================================================================

RESP=$(api POST "/staff/$NEW_STAFF_ID/skills" '{"skillName":"React","category":"technical","proficiency":"advanced","yearsOfExperience":5}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Add staff skill" 201 "$CODE" "$BODY"
STAFF_SKILL_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

RESP=$(api GET "/staff/$NEW_STAFF_ID/skills")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List staff skills" 200 "$CODE" "$BODY"

RESP=$(api PUT "/staff/$NEW_STAFF_ID/skills/$STAFF_SKILL_ID" '{"proficiency":"expert"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update staff skill" 200 "$CODE" "$BODY"

RESP=$(api GET "/staff/$NEW_STAFF_ID/skill-gaps")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get skill gaps" 200 "$CODE" "$BODY"

RESP=$(api GET "/staff/skills-matrix")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get skills matrix" 200 "$CODE" "$BODY"

RESP=$(api DELETE "/staff/$NEW_STAFF_ID/skills/$STAFF_SKILL_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Delete staff skill" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: Certifications ===${NC}"
# ============================================================================

RESP=$(api POST "/staff/$NEW_STAFF_ID/certifications" '{"name":"AWS Certified","issuingOrganization":"Amazon","credentialId":"AWS-123","issueDate":"2024-01-01","expiryDate":"2026-01-01","category":"technical"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Add certification" 201 "$CODE" "$BODY"
CERT_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)

RESP=$(api GET "/staff/$NEW_STAFF_ID/certifications")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List certifications" 200 "$CODE" "$BODY"

RESP=$(api PUT "/staff/$NEW_STAFF_ID/certifications/$CERT_ID" '{"name":"AWS Solutions Architect"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update certification" 200 "$CODE" "$BODY"

RESP=$(api GET "/staff/certifications/expiry-alerts")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get expiry alerts" 200 "$CODE" "$BODY"
ALERT_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "    → Expiry alerts: $ALERT_COUNT"

RESP=$(api DELETE "/staff/$NEW_STAFF_ID/certifications/$CERT_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Delete certification" 200 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: Onboarding ===${NC}"
# ============================================================================

RESP=$(api GET "/staff/onboarding/tasks")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List onboarding template tasks" 200 "$CODE" "$BODY"
TASK_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "    → Template tasks: $TASK_COUNT"

RESP=$(api GET "/staff/onboarding")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List all onboarding checklists" 200 "$CODE" "$BODY"

RESP=$(api POST "/staff/$NEW_STAFF_ID/onboarding" '{"assignedHR":"Admin User","assignedManager":"Principal"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Create onboarding checklist" 201 "$CODE" "$BODY"
# Get a task ID from the checklist
OB_TASK_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['tasks'][0]['taskId'])" 2>/dev/null)

RESP=$(api GET "/staff/$NEW_STAFF_ID/onboarding")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get staff onboarding checklist" 200 "$CODE" "$BODY"

RESP=$(api PATCH "/staff/$NEW_STAFF_ID/onboarding/tasks/$OB_TASK_ID" '{"completed":true}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Complete onboarding task" 200 "$CODE" "$BODY"
OB_PROGRESS=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['progress'])" 2>/dev/null)
echo "    → Progress: $OB_PROGRESS%"

# Duplicate checklist
RESP=$(api POST "/staff/$NEW_STAFF_ID/onboarding" '{}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Reject duplicate onboarding" 409 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: Exit Interviews ===${NC}"
# ============================================================================

RESP=$(api GET "/staff/exit-interviews")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "List exit interviews" 200 "$CODE" "$BODY"

RESP=$(api POST "/staff/$NEW_STAFF_ID/exit-interview" '{"lastWorkingDate":"2025-06-30","separationType":"resignation","interviewDate":"2025-06-15"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Create exit interview" 201 "$CODE" "$BODY"

RESP=$(api GET "/staff/$NEW_STAFF_ID/exit-interview")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Get staff exit interview" 200 "$CODE" "$BODY"

RESP=$(api PUT "/staff/$NEW_STAFF_ID/exit-interview" '{"ratings":{"overall":3.5},"reasonForLeaving":["Career growth"],"handoverStatus":"handover_in_progress"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update exit interview" 200 "$CODE" "$BODY"

RESP=$(api PATCH "/staff/$NEW_STAFF_ID/exit-interview/clearance/hr" '{"status":"cleared","clearedBy":"Admin User"}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Update clearance status" 200 "$CODE" "$BODY"

# Duplicate exit interview
RESP=$(api POST "/staff/$NEW_STAFF_ID/exit-interview" '{}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Reject duplicate exit interview" 409 "$CODE" "$BODY"

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: Bulk ===${NC}"
# ============================================================================

RESP=$(api POST "/staff/bulk-import" '{"staff":[{"name":"Bulk Staff One","email":"bulkstaff1@test.com","department":"Music","designation":"Teacher"},{"name":"Bulk Staff Two","email":"bulkstaff2@test.com","department":"Art","designation":"Assistant Teacher"}]}')
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Bulk import staff" 201 "$CODE" "$BODY"

RESP=$(api GET "/staff/export")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Export staff" 200 "$CODE" "$BODY"
EXPORT_STAFF_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))" 2>/dev/null)
echo "    → Exported: $EXPORT_STAFF_COUNT staff"

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: RBAC ===${NC}"
# ============================================================================

# Teacher can read staff
RESP=$(api GET "/staff" "" "$TEACHER_TOKEN")
CODE=$(get_code "$RESP")
assert_status "Teacher can list staff" 200 "$CODE" ""

# Teacher can read individual staff
RESP=$(api GET "/staff/$NEW_STAFF_ID" "" "$TEACHER_TOKEN")
CODE=$(get_code "$RESP")
assert_status "Teacher can get staff by ID" 200 "$CODE" ""

# Teacher cannot create staff
RESP=$(api POST "/staff" '{"name":"X","email":"x@test.com","department":"Science","designation":"Teacher"}' "$TEACHER_TOKEN")
CODE=$(get_code "$RESP")
assert_status "Teacher cannot create staff (403)" 403 "$CODE" ""

# Student cannot access staff
RESP=$(api GET "/staff" "" "$STUDENT_TOKEN")
CODE=$(get_code "$RESP")
assert_status "Student role cannot list staff (403)" 403 "$CODE" ""

# ============================================================================
echo -e "\n${YELLOW}=== STAFF: Delete + Cleanup ===${NC}"
# ============================================================================

RESP=$(api DELETE "/staff/$NEW_STAFF_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Delete staff (cascades sub-resources)" 200 "$CODE" "$BODY"

RESP=$(api DELETE "/staff/$NEWDEPT_STAFF_ID")
CODE=$(get_code "$RESP"); BODY=$(get_body "$RESP")
assert_status "Delete new-dept staff" 200 "$CODE" "$BODY"

# Cleanup bulk imports
BULK_STAFF_RESP=$(api GET "/staff?search=Bulk")
BULK_STAFF_IDS=$(echo "$BULK_STAFF_RESP" | sed '$d' | python3 -c "import sys,json; [print(s['id']) for s in json.load(sys.stdin)['data']]" 2>/dev/null)
for BID in $BULK_STAFF_IDS; do
  api DELETE "/staff/$BID" > /dev/null 2>&1
done

# ============================================================================
echo -e "\n${YELLOW}=== STUDENTS: Delete Test Student ===${NC}"
# ============================================================================

RESP=$(api GET "/students/$NEW_STUDENT_ID")
CODE=$(get_code "$RESP")
assert_status "Confirm test student deleted" 404 "$CODE" ""

# ============================================================================
# Summary
# ============================================================================

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Phase 3 Test Results${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "  Total:  $TOTAL"
echo -e "  ${GREEN}Passed: $PASS${NC}"
echo -e "  ${RED}Failed: $FAIL${NC}"
echo -e "${YELLOW}========================================${NC}"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
