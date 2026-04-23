# PHASE 1 - COMPREHENSIVE TESTING GUIDE

**Date:** November 8, 2025, 11:30 PM UTC+05:30  
**Status:** Ready for Testing  
**Test Environment:** Chrome DevTools MCP

---

## 🧪 TEST SETUP

### Prerequisites
- ✅ My Week dashboard running (http://localhost:5174/founder-os)
- ✅ Backend API running (http://localhost:3000)
- ✅ Chrome DevTools available
- ✅ Test data in database

### Test Data Required
```
Users:
- user-001 (Founder)
- user-002 (Manager)
- user-003 (IC)

Organization:
- org-001

Tasks:
- 5+ tasks with various priorities
- Some recurring tasks
- Some with subtasks

Time Blocks:
- 3+ time blocks for this week
- Different block types

Commitments:
- 3+ commitments for today
- Various effort levels
```

---

## 🧪 TEST SUITE 1: RBAC SYSTEM

### Test 1.1: View All Roles
**Steps:**
1. Navigate to Role Manager component
2. Verify all 4 default roles display:
   - Founder/Owner (👑)
   - Manager/Lead (📊)
   - IC/Assistant (👤)
   - Guest (👁️)

**Expected Results:**
- ✅ All 4 roles visible
- ✅ Role icons display correctly
- ✅ Permission counts shown
- ✅ Responsive layout

**Test Command:**
```javascript
// Check if RoleManager component renders
document.querySelector('[class*="RoleManager"]')
```

---

### Test 1.2: View Role Details
**Steps:**
1. Click on "Founder/Owner" role
2. Verify role details panel shows:
   - Role name and description
   - All 16 permissions listed
   - Permission categories
   - Created/Updated dates

**Expected Results:**
- ✅ Role details display
- ✅ All permissions visible
- ✅ Categories organized
- ✅ Dates formatted correctly

---

### Test 1.3: Create Custom Role
**Steps:**
1. Click "New Role" button
2. Enter role name: "Team Lead"
3. Enter description: "Team leadership role"
4. Click "Create"

**Expected Results:**
- ✅ Form appears
- ✅ Role created successfully
- ✅ New role appears in list
- ✅ Form clears after creation

---

### Test 1.4: Permission Matrix
**Steps:**
1. Select any role
2. View Permission Matrix component
3. Verify permissions grouped by category:
   - Tasks (4 permissions)
   - Meetings (4 permissions)
   - Requests (3 permissions)
   - Settings (2 permissions)
   - Admin (3 permissions)

**Expected Results:**
- ✅ All permissions visible
- ✅ Categories organized
- ✅ Permission count accurate
- ✅ Coverage percentage calculated

---

### Test 1.5: Assign Role to User
**Steps:**
1. Use roleService API:
```typescript
await roleService.assignRoleToUser('user-002', 'role-manager', 'org-001')
```
2. Verify role assigned
3. Check user permissions updated

**Expected Results:**
- ✅ Role assigned successfully
- ✅ User permissions updated
- ✅ API returns success

---

## 🧪 TEST SUITE 2: TIME-BLOCKING

### Test 2.1: View Weekly Planner
**Steps:**
1. Navigate to WeekPlanner component
2. Verify week view displays:
   - 7 days (Mon-Sun)
   - Current week dates
   - Day labels with dates
   - Total minutes per day

**Expected Results:**
- ✅ All 7 days visible
- ✅ Correct dates displayed
- ✅ Layout responsive
- ✅ Navigation buttons present

**Test Command:**
```javascript
// Check week planner renders
document.querySelectorAll('[class*="WeekPlanner"]').length > 0
```

---

### Test 2.2: Create Time Block
**Steps:**
1. Click "Add Block" on Monday
2. Select block type: "Deep Work"
3. Enter title: "Focus on project"
4. Set target minutes: 120
5. Click "Create"

**Expected Results:**
- ✅ Block created successfully
- ✅ Block appears on Monday
- ✅ Color matches block type (Purple)
- ✅ Title and time displayed

---

### Test 2.3: Drag-and-Drop Block
**Steps:**
1. Click and drag a time block from Monday
2. Drop it on Wednesday
3. Verify block moves to Wednesday

**Expected Results:**
- ✅ Block draggable
- ✅ Visual feedback during drag
- ✅ Block moves to new day
- ✅ Date updated in database

**Test Command:**
```javascript
// Simulate drag-drop
const block = document.querySelector('[draggable="true"]');
const target = document.querySelector('[data-day="3"]');
// Drag and drop logic
```

---

### Test 2.4: View Block Details
**Steps:**
1. Click on a time block
2. Verify details display:
   - Block title
   - Start and end time
   - Target minutes
   - Block type

**Expected Results:**
- ✅ Details visible
- ✅ All info displayed
- ✅ Formatted correctly

---

### Test 2.5: Delete Time Block
**Steps:**
1. Click delete button on a block
2. Confirm deletion
3. Verify block removed

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Block deleted on confirmation
- ✅ Block removed from UI
- ✅ Database updated

---

### Test 2.6: Weekly Statistics
**Steps:**
1. View weekly summary section
2. Verify statistics show:
   - Deep Work total minutes
   - Admin total minutes
   - Sales total minutes
   - Custom total minutes

**Expected Results:**
- ✅ All block types shown
- ✅ Minutes calculated correctly
- ✅ Summary accurate

---

### Test 2.7: Collision Detection
**Steps:**
1. Create block: 09:00-10:00
2. Try to create overlapping block: 09:30-10:30
3. Verify collision detected

**Expected Results:**
- ✅ Collision detected
- ✅ Warning message shown
- ✅ Alternative time suggested
- ✅ Block not created

---

## 🧪 TEST SUITE 3: DAILY TOP-3 COMMITMENTS

### Test 3.1: Get Today's Top-3
**Steps:**
1. Use commitmentService API:
```typescript
const top3 = await commitmentService.getTodayTop3('user-001', 'org-001')
```
2. Verify returns:
   - Date
   - 3 commitments
   - Completed count
   - Score

**Expected Results:**
- ✅ API returns data
- ✅ 3 commitments returned
- ✅ Score calculated (0-100)
- ✅ Data structured correctly

---

### Test 3.2: Create Commitment
**Steps:**
1. Use commitmentService API:
```typescript
const commitment = await commitmentService.createCommitment(
  'user-001',
  'org-001',
  {
    date: '2025-11-10',
    title: 'Complete project',
    effortMinutes: 120,
    status: 'pending',
    priority: 'P1'
  }
)
```
2. Verify commitment created

**Expected Results:**
- ✅ Commitment created
- ✅ ID generated
- ✅ Data saved to database
- ✅ Timestamps set

---

### Test 3.3: Mark Commitment Complete
**Steps:**
1. Use commitmentService API:
```typescript
await commitmentService.completeCommitment('commitment-id')
```
2. Verify status updated to 'completed'

**Expected Results:**
- ✅ Status updated
- ✅ Database updated
- ✅ Score recalculated

---

### Test 3.4: End-of-Day Check
**Steps:**
1. Use commitmentService API:
```typescript
const result = await commitmentService.endOfDayCheck(
  'user-001',
  'org-001',
  '2025-11-10'
)
```
2. Verify returns:
   - Completed count
   - Score (0-100)
   - Missed items queued

**Expected Results:**
- ✅ Check completes
- ✅ Score calculated
- ✅ Missed items identified
- ✅ Queue updated

---

### Test 3.5: Reschedule Queue
**Steps:**
1. Use commitmentService API:
```typescript
const queue = await commitmentService.getRescheduleQueue('user-001', 'org-001')
```
2. Verify returns:
   - Missed commitments
   - Suggested dates
   - Reason for reschedule

**Expected Results:**
- ✅ Queue returns data
- ✅ Missed items listed
- ✅ Suggestions provided

---

### Test 3.6: Reschedule Commitment
**Steps:**
1. Use commitmentService API:
```typescript
await commitmentService.rescheduleCommitment(
  'commitment-id',
  '2025-11-11',
  'missed'
)
```
2. Verify commitment moved to new date

**Expected Results:**
- ✅ Commitment rescheduled
- ✅ Date updated
- ✅ Status updated
- ✅ Queue updated

---

## 📊 TEST EXECUTION PLAN

### Phase 1: Unit Tests (30 minutes)
- Test 1.1 - 1.5 (RBAC)
- Test 2.1 - 2.7 (Time-Blocking)
- Test 3.1 - 3.6 (Commitments)

### Phase 2: Integration Tests (30 minutes)
- RBAC + Time-Blocking
- Time-Blocking + Tasks
- Commitments + Tasks

### Phase 3: UI/UX Tests (30 minutes)
- Responsive design
- Dark theme
- Accessibility
- Performance

---

## ✅ SUCCESS CRITERIA

**RBAC System:**
- ✅ All 4 roles functional
- ✅ Permissions working
- ✅ Role assignment working
- ✅ UI responsive

**Time-Blocking:**
- ✅ Week view working
- ✅ Drag-drop working
- ✅ Collision detection working
- ✅ Statistics accurate

**Daily Top-3:**
- ✅ API methods working
- ✅ Score calculation working
- ✅ Reschedule queue working
- ✅ End-of-day check working

---

## 🐛 KNOWN ISSUES

**Minor Lint Warnings:**
- `onAddSubtask` unused in TaskList.tsx
- `selectedBlock` unused in WeekPlanner.tsx
- `showForm` unused in WeekPlanner.tsx
- `handleCreateBlock` unused in WeekPlanner.tsx
- `dayBlocks` unused in WeekPlanner.tsx

**Status:** Non-blocking, can be cleaned up later

---

## 📝 TEST REPORT TEMPLATE

```
Test Date: [DATE]
Tester: [NAME]
Environment: [DEV/STAGING]

Test Suite: [SUITE NAME]
Total Tests: [NUMBER]
Passed: [NUMBER]
Failed: [NUMBER]
Skipped: [NUMBER]

Issues Found:
- [ISSUE 1]
- [ISSUE 2]

Notes:
- [NOTE 1]
- [NOTE 2]

Status: [PASS/FAIL]
```

---

**Ready to Test:** ✅ YES  
**Test Environment:** Chrome DevTools MCP  
**Estimated Time:** 1.5 - 2 hours  
**Next Steps:** Execute tests and document results
