#!/bin/bash
# ============================================================================
# Phase 5: Finance/Fees Module — Endpoint Tests
# ============================================================================

BASE_URL="http://localhost:3001/api"
PASS=0
FAIL=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

assert_status() {
  local description="$1"
  local expected="$2"
  local actual="$3"
  local body="$4"
  TOTAL=$((TOTAL + 1))
  if [ "$actual" -eq "$expected" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}✓${NC} $description (HTTP $actual)"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}✗${NC} $description (expected $expected, got $actual)"
    if [ -n "$body" ]; then
      echo "    Response: $(echo "$body" | head -c 200)"
    fi
  fi
}

assert_json_field() {
  local description="$1"
  local body="$2"
  local field="$3"
  TOTAL=$((TOTAL + 1))
  local value
  value=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d${field})" 2>/dev/null)
  if [ $? -eq 0 ] && [ -n "$value" ] && [ "$value" != "None" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}✓${NC} $description = $value"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}✗${NC} $description (field ${field} not found)"
  fi
}

# ==================== Login ====================
echo -e "\n${YELLOW}=== Phase 5: Finance/Fees Module Tests ===${NC}\n"
echo "Logging in..."

# Admin login
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paperbook.in","password":"demo123"}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
ADMIN_TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
assert_status "Admin login" 200 "$HTTP"

# Accountant login
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"accounts@paperbook.in","password":"demo123"}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
ACCT_TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
assert_status "Accountant login" 200 "$HTTP"

# Teacher login
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@paperbook.in","password":"demo123"}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
TEACHER_TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
assert_status "Teacher login" 200 "$HTTP"

# Student login
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@paperbook.in","password":"demo123"}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
STUDENT_TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null)
assert_status "Student login" 200 "$HTTP"

AUTH="Authorization: Bearer $ADMIN_TOKEN"
ACCT_AUTH="Authorization: Bearer $ACCT_TOKEN"
TEACHER_AUTH="Authorization: Bearer $TEACHER_TOKEN"
STUDENT_AUTH="Authorization: Bearer $STUDENT_TOKEN"

# ==================== Fee Types ====================
echo -e "\n${YELLOW}--- Fee Types ---${NC}"

# List fee types
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/fee-types" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "List fee types" 200 "$HTTP"
assert_json_field "Fee types data array exists" "$RESP" "['data']"

# Teacher can read fee types
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/fee-types" -H "$TEACHER_AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Teacher can list fee types (readRoles)" 200 "$HTTP"

# Create fee type
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/fee-types" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Transport Fee","category":"transport","description":"Monthly transport fee"}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Create fee type" 201 "$HTTP"
FEE_TYPE_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
assert_json_field "Fee type has id" "$RESP" "['data']['id']"
assert_json_field "Fee type category=transport" "$RESP" "['data']['category']"

# Get fee type by ID
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/fee-types/$FEE_TYPE_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Get fee type by ID" 200 "$HTTP"

# Update fee type
BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/finance/fee-types/$FEE_TYPE_ID" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Transport Fee Updated"}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Update fee type" 200 "$HTTP"

# Toggle fee type
BODY=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/finance/fee-types/$FEE_TYPE_ID/toggle" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Toggle fee type" 200 "$HTTP"

# Duplicate fee type should fail
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/fee-types" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Tuition Fee","category":"tuition"}')
HTTP=$(echo "$BODY" | tail -1)
assert_status "Duplicate fee type rejected (409)" 409 "$HTTP"

# Filter fee types by category
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/fee-types?category=tuition" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Filter fee types by category" 200 "$HTTP"

# Delete fee type (the new one with no structures)
BODY=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/finance/fee-types/$FEE_TYPE_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Delete fee type" 200 "$HTTP"

# ==================== Fee Structures ====================
echo -e "\n${YELLOW}--- Fee Structures ---${NC}"

# List fee structures
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/fee-structures" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "List fee structures" 200 "$HTTP"
assert_json_field "Fee structures data array" "$RESP" "['data']"

# Get first fee type ID for creating structure
FIRST_FEE_TYPE_ID=$(curl -s -X GET "$BASE_URL/finance/fee-types" -H "$AUTH" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(d[0]['id'])" 2>/dev/null)

# Create fee structure
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/fee-structures" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"feeTypeId\":\"$FIRST_FEE_TYPE_ID\",\"academicYear\":\"2025-26\",\"applicableClasses\":[\"Class 1\",\"Class 2\"],\"amount\":6000,\"frequency\":\"monthly\",\"dueDay\":15}")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Create fee structure" 201 "$HTTP"
FEE_STRUCT_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
assert_json_field "Fee structure has feeType" "$RESP" "['data']['feeType']"

# Get fee structure by ID
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/fee-structures/$FEE_STRUCT_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Get fee structure by ID" 200 "$HTTP"

# Update fee structure
BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/finance/fee-structures/$FEE_STRUCT_ID" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"amount":6500}')
HTTP=$(echo "$BODY" | tail -1)
assert_status "Update fee structure" 200 "$HTTP"

# Toggle fee structure
BODY=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/finance/fee-structures/$FEE_STRUCT_ID/toggle" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Toggle fee structure" 200 "$HTTP"

# Assign fee structure to students
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/fee-structures/$FEE_STRUCT_ID/assign" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Assign fee structure to students" 201 "$HTTP"
assert_json_field "Assignment created count" "$RESP" "['data']['created']"

# Delete fee structure (should fail because it now has student fees)
BODY=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/finance/fee-structures/$FEE_STRUCT_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Delete fee structure with fees rejected (400)" 400 "$HTTP"

# Filter by academic year
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/fee-structures?academicYear=2024-25" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Filter fee structures by academic year" 200 "$HTTP"

# ==================== Student Fees ====================
echo -e "\n${YELLOW}--- Student Fees ---${NC}"

# List student fees
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/student-fees" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "List student fees" 200 "$HTTP"
assert_json_field "Student fees meta total" "$RESP" "['meta']['total']"

# Get first student fee ID
FIRST_SF_ID=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(d[0]['id'])" 2>/dev/null)
FIRST_STUDENT_ID=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(d[0]['studentId'])" 2>/dev/null)

# Get student fee by ID
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/student-fees/$FIRST_SF_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Get student fee by ID" 200 "$HTTP"

# Get student's fees
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/students/$FIRST_STUDENT_ID/fees" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Get student's fees" 200 "$HTTP"
assert_json_field "Student fees data array" "$RESP" "['data']"

# Update student fee
BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/finance/student-fees/$FIRST_SF_ID" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"discountAmount":500}')
HTTP=$(echo "$BODY" | tail -1)
assert_status "Update student fee" 200 "$HTTP"

# Filter student fees by status
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/student-fees?status=pending" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Filter student fees by status" 200 "$HTTP"

# Bulk assign
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/student-fees/bulk-assign" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"feeStructureId\":\"$FEE_STRUCT_ID\",\"className\":\"Class 1\"}")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Bulk assign fees" 201 "$HTTP"

# Accountant can also access student fees
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/student-fees" -H "$ACCT_AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Accountant can list student fees" 200 "$HTTP"

# ==================== Payments & Receipts ====================
echo -e "\n${YELLOW}--- Payments & Receipts ---${NC}"

# Get a pending student fee for payment
PENDING_FEE=$(curl -s -X GET "$BASE_URL/finance/student-fees?status=pending&limit=1" -H "$AUTH")
PENDING_SF_ID=$(echo "$PENDING_FEE" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(d[0]['id'])" 2>/dev/null)
PENDING_STUDENT_ID=$(echo "$PENDING_FEE" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(d[0]['studentId'])" 2>/dev/null)
PENDING_AMOUNT=$(echo "$PENDING_FEE" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; f=d[0]; print(f['totalAmount']-f['paidAmount']-f['discountAmount'])" 2>/dev/null)

# Collect payment (partial)
PARTIAL_AMOUNT=$(python3 -c "print(int(float('$PENDING_AMOUNT') / 2))" 2>/dev/null)
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/payments/collect" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"studentId\":\"$PENDING_STUDENT_ID\",\"paymentMode\":\"cash\",\"payments\":[{\"studentFeeId\":\"$PENDING_SF_ID\",\"amount\":$PARTIAL_AMOUNT}]}")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Collect partial payment" 201 "$HTTP"
RECEIPT_NUMBER=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['receiptNumber'])" 2>/dev/null)
assert_json_field "Payment receipt number" "$RESP" "['data']['receiptNumber']"
assert_json_field "Payment total paid" "$RESP" "['data']['totalAmount']"

# Verify student fee is now partial
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/student-fees/$PENDING_SF_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Get updated student fee after partial payment" 200 "$HTTP"
SF_STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$SF_STATUS" = "partial" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}✓${NC} Student fee status is 'partial' after partial payment"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}✗${NC} Student fee status should be 'partial', got '$SF_STATUS'"
fi

# Collect remaining payment
REMAINING=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(d['totalAmount']-d['paidAmount']-d['discountAmount'])" 2>/dev/null)
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/payments/collect" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"studentId\":\"$PENDING_STUDENT_ID\",\"paymentMode\":\"upi\",\"transactionRef\":\"UPI-TEST-001\",\"payments\":[{\"studentFeeId\":\"$PENDING_SF_ID\",\"amount\":$REMAINING}]}")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Collect remaining payment" 201 "$HTTP"

# Verify student fee is now paid
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/student-fees/$PENDING_SF_ID" -H "$AUTH")
RESP=$(echo "$BODY" | sed '$d')
SF_STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$SF_STATUS" = "paid" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}✓${NC} Student fee status is 'paid' after full payment"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}✗${NC} Student fee status should be 'paid', got '$SF_STATUS'"
fi

# Overpayment prevention
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/payments/collect" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"studentId\":\"$PENDING_STUDENT_ID\",\"paymentMode\":\"cash\",\"payments\":[{\"studentFeeId\":\"$PENDING_SF_ID\",\"amount\":9999}]}")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Overpayment rejected (400)" 400 "$HTTP"

# List payments
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/payments" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "List payments" 200 "$HTTP"
assert_json_field "Payments meta total" "$RESP" "['meta']['total']"
FIRST_PAYMENT_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])" 2>/dev/null)

# Get payment by ID
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/payments/$FIRST_PAYMENT_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Get payment by ID" 200 "$HTTP"

# Get receipt by number
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/receipts/$RECEIPT_NUMBER" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Get receipt by number" 200 "$HTTP"
assert_json_field "Receipt has items" "$RESP" "['data']['items']"

# Get student payments
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/students/$FIRST_STUDENT_ID/payments" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Get student payments" 200 "$HTTP"

# Get student receipts
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/students/$FIRST_STUDENT_ID/receipts" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Get student receipts" 200 "$HTTP"

# Cancel payment
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/payments/$FIRST_PAYMENT_ID/cancel" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Cancel payment" 200 "$HTTP"
assert_json_field "Cancel refunded amount" "$RESP" "['data']['refundedAmount']"

# ==================== Waive Fee ====================
echo -e "\n${YELLOW}--- Waive Fee ---${NC}"

# Get a pending fee to waive
WAIVE_FEE=$(curl -s -X GET "$BASE_URL/finance/student-fees?status=pending&limit=1" -H "$AUTH")
WAIVE_SF_ID=$(echo "$WAIVE_FEE" | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(d[0]['id'])" 2>/dev/null)

if [ -n "$WAIVE_SF_ID" ] && [ "$WAIVE_SF_ID" != "None" ]; then
  BODY=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/finance/student-fees/$WAIVE_SF_ID/waive" -H "$AUTH")
  HTTP=$(echo "$BODY" | tail -1)
  RESP=$(echo "$BODY" | sed '$d')
  assert_status "Waive student fee" 200 "$HTTP"
  WAIVE_STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
  TOTAL=$((TOTAL + 1))
  if [ "$WAIVE_STATUS" = "waived" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}✓${NC} Waived fee status is 'waived'"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}✗${NC} Expected 'waived', got '$WAIVE_STATUS'"
  fi
else
  echo -e "  ${YELLOW}⚠${NC} No pending fee found to waive, skipping"
fi

# ==================== Outstanding Dues ====================
echo -e "\n${YELLOW}--- Outstanding Dues ---${NC}"

# List outstanding dues
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/outstanding-dues" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "List outstanding dues" 200 "$HTTP"
assert_json_field "Outstanding dues meta" "$RESP" "['meta']"

# Get student outstanding dues
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/outstanding-dues/$FIRST_STUDENT_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Get student outstanding dues" 200 "$HTTP"

# Send reminders (stub)
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/outstanding-dues/send-reminders" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Send reminders" 200 "$HTTP"

# ==================== Expenses ====================
echo -e "\n${YELLOW}--- Expenses ---${NC}"

# List expenses
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/expenses" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "List expenses" 200 "$HTTP"
assert_json_field "Expenses meta total" "$RESP" "['meta']['total']"

# Create expense
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/expenses" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"category":"supplies","description":"Whiteboard markers for all classrooms","amount":5000,"vendorName":"Office Supply Co"}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Create expense" 201 "$HTTP"
EXPENSE_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
assert_json_field "Expense has expenseNumber" "$RESP" "['data']['expenseNumber']"
assert_json_field "Expense status=pending_approval" "$RESP" "['data']['status']"

# Get expense by ID
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/expenses/$EXPENSE_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Get expense by ID" 200 "$HTTP"

# Update expense
BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/finance/expenses/$EXPENSE_ID" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"amount":5500,"invoiceNumber":"INV-2025-999"}')
HTTP=$(echo "$BODY" | tail -1)
assert_status "Update expense" 200 "$HTTP"

# Approve expense
BODY=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/finance/expenses/$EXPENSE_ID/approve" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Approve expense" 200 "$HTTP"
EXP_STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$EXP_STATUS" = "approved" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}✓${NC} Expense status is 'approved'"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}✗${NC} Expected 'approved', got '$EXP_STATUS'"
fi

# Cannot update approved expense
BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/finance/expenses/$EXPENSE_ID" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"amount":6000}')
HTTP=$(echo "$BODY" | tail -1)
assert_status "Cannot update approved expense (400)" 400 "$HTTP"

# Cannot approve already approved
BODY=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/finance/expenses/$EXPENSE_ID/approve" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Cannot approve already approved (400)" 400 "$HTTP"

# Mark expense paid
BODY=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/finance/expenses/$EXPENSE_ID/mark-paid" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"paidRef":"CHQ-9999"}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Mark expense paid" 200 "$HTTP"
EXP_STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$EXP_STATUS" = "paid" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}✓${NC} Expense status is 'paid'"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}✗${NC} Expected 'paid', got '$EXP_STATUS'"
fi

# Create another expense to test reject
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/expenses" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"category":"events","description":"Annual Day decorations","amount":10000}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
EXPENSE_ID2=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
assert_status "Create expense for rejection" 201 "$HTTP"

# Reject expense
BODY=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE_URL/finance/expenses/$EXPENSE_ID2/reject" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"reason":"Budget not available for events this month"}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Reject expense" 200 "$HTTP"
EXP_STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$EXP_STATUS" = "rejected" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}✓${NC} Expense status is 'rejected'"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}✗${NC} Expected 'rejected', got '$EXP_STATUS'"
fi

# Create expense to test delete
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/expenses" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"category":"other","description":"Temp expense to delete","amount":100}')
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
EXPENSE_DEL_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null)
assert_status "Create expense for deletion" 201 "$HTTP"

# Delete expense
BODY=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/finance/expenses/$EXPENSE_DEL_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Delete pending expense" 200 "$HTTP"

# Filter expenses by category
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/expenses?category=salary" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Filter expenses by category" 200 "$HTTP"

# Filter expenses by status
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/expenses?status=paid" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Filter expenses by status" 200 "$HTTP"

# ==================== Ledger ====================
echo -e "\n${YELLOW}--- Ledger ---${NC}"

# List ledger entries
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/ledger" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "List ledger entries" 200 "$HTTP"
assert_json_field "Ledger meta total" "$RESP" "['meta']['total']"
FIRST_LEDGER_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])" 2>/dev/null)

# Get ledger entry by ID
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/ledger/$FIRST_LEDGER_ID" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Get ledger entry by ID" 200 "$HTTP"

# Get ledger balance
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/ledger/balance" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Get ledger balance summary" 200 "$HTTP"
assert_json_field "Balance has totalCredits" "$RESP" "['data']['totalCredits']"
assert_json_field "Balance has totalDebits" "$RESP" "['data']['totalDebits']"
assert_json_field "Balance has closingBalance" "$RESP" "['data']['closingBalance']"

# Filter ledger by type
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/ledger?type=credit" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Filter ledger by type=credit" 200 "$HTTP"

# ==================== Reports & Stats ====================
echo -e "\n${YELLOW}--- Reports & Stats ---${NC}"

# Collection report
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/reports/collection" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Collection report" 200 "$HTTP"
assert_json_field "Collection report has byPaymentMode" "$RESP" "['data']['byPaymentMode']"
assert_json_field "Collection report has byFeeType" "$RESP" "['data']['byFeeType']"
assert_json_field "Collection report has byClass" "$RESP" "['data']['byClass']"

# Due report
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/reports/dues" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Due report" 200 "$HTTP"
assert_json_field "Due report has byClass" "$RESP" "['data']['byClass']"
assert_json_field "Due report has byAgeingBucket" "$RESP" "['data']['byAgeingBucket']"
assert_json_field "Due report has topDefaulters" "$RESP" "['data']['topDefaulters']"

# Financial summary
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/reports/financial-summary" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Financial summary" 200 "$HTTP"
assert_json_field "Summary has totalCollections" "$RESP" "['data']['totalCollections']"
assert_json_field "Summary has totalExpenses" "$RESP" "['data']['totalExpenses']"
assert_json_field "Summary has netIncome" "$RESP" "['data']['netIncome']"

# Dashboard stats
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/stats" -H "$AUTH")
HTTP=$(echo "$BODY" | tail -1)
RESP=$(echo "$BODY" | sed '$d')
assert_status "Finance stats" 200 "$HTTP"
assert_json_field "Stats totalFeeAmount" "$RESP" "['data']['totalFeeAmount']"
assert_json_field "Stats totalCollected" "$RESP" "['data']['totalCollected']"
assert_json_field "Stats collectionRate" "$RESP" "['data']['collectionRate']"
assert_json_field "Stats pendingAmount" "$RESP" "['data']['pendingAmount']"

# ==================== RBAC Tests ====================
echo -e "\n${YELLOW}--- RBAC Tests ---${NC}"

# Teacher cannot create fee type
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/fee-types" \
  -H "$TEACHER_AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Test","category":"other"}')
HTTP=$(echo "$BODY" | tail -1)
assert_status "Teacher cannot create fee type (403)" 403 "$HTTP"

# Teacher cannot collect payment
BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/finance/payments/collect" \
  -H "$TEACHER_AUTH" -H "Content-Type: application/json" \
  -d '{"studentId":"x","paymentMode":"cash","payments":[]}')
HTTP=$(echo "$BODY" | tail -1)
assert_status "Teacher cannot collect payment (403)" 403 "$HTTP"

# Student cannot list all student fees
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/student-fees" -H "$STUDENT_AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Student cannot list all student fees (403)" 403 "$HTTP"

# Student cannot access expenses
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/expenses" -H "$STUDENT_AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Student cannot access expenses (403)" 403 "$HTTP"

# Student cannot access ledger
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/ledger" -H "$STUDENT_AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Student cannot access ledger (403)" 403 "$HTTP"

# Student cannot access stats
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/stats" -H "$STUDENT_AUTH")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Student cannot access stats (403)" 403 "$HTTP"

# Unauthenticated access
BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/finance/fee-types")
HTTP=$(echo "$BODY" | tail -1)
assert_status "Unauthenticated access rejected (401)" 401 "$HTTP"

# ==================== Delete Student Fee ====================
echo -e "\n${YELLOW}--- Delete Student Fee ---${NC}"

# Create a fresh student fee for testing delete
# Get a pending fee with 0 paid
DEL_FEE=$(curl -s -X GET "$BASE_URL/finance/student-fees?status=pending&limit=5" -H "$AUTH")
DEL_SF_ID=$(echo "$DEL_FEE" | python3 -c "
import sys,json
data = json.load(sys.stdin)['data']
for d in data:
    if d['paidAmount'] == 0:
        print(d['id'])
        break
" 2>/dev/null)

if [ -n "$DEL_SF_ID" ] && [ "$DEL_SF_ID" != "" ]; then
  BODY=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/finance/student-fees/$DEL_SF_ID" -H "$AUTH")
  HTTP=$(echo "$BODY" | tail -1)
  assert_status "Delete unpaid student fee" 200 "$HTTP"
else
  echo -e "  ${YELLOW}⚠${NC} No suitable unpaid fee found to delete, skipping"
fi

# ==================== Summary ====================
echo -e "\n${YELLOW}========================================${NC}"
echo -e "Total: $TOTAL | ${GREEN}Passed: $PASS${NC} | ${RED}Failed: $FAIL${NC}"
echo -e "${YELLOW}========================================${NC}"

if [ $FAIL -gt 0 ]; then
  exit 1
fi
