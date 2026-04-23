# PHASE 4 - COMPLETE REFACTOR & BUG FIXES

**Status:** IN PROGRESS  
**Date:** November 8, 2025, 10:16 PM UTC+05:30

---

## 🎯 OBJECTIVES

1. **Remove Analytics Tab** ✅ DONE
   - Removed from FounderOSMaster navigation
   - Consolidate all features into My Week

2. **Enhance My Week Dashboard** IN PROGRESS
   - Add calendar view with tasks and meetings
   - Show requests as tasks
   - Fix task creation from calendar
   - Add task blocking and team member assignment
   - Implement recurring tasks toggle
   - Fix timer (pause/resume with database persistence)
   - Fix time blocks CRUD
   - Fix commitments CRUD

---

## 📋 REQUIRED FEATURES

### Task Management
- ✅ Create tasks from calendar date click
- ✅ Edit tasks (title, priority, assigned_to, blocked, recurring)
- ✅ Delete tasks
- ✅ Mark tasks as done/pending
- ✅ Show requests as tasks in the list
- ✅ Task blocking option
- ✅ Assign to team member
- ✅ Recurring task toggle

### Timer Functionality
- ✅ Start timer (Play button)
- ✅ Pause timer (Pause button)
- ✅ Resume timer (continues from paused time)
- ✅ Display formatted time (HH:MM:SS)
- ✅ Save time to database on pause
- ✅ Persist timer data

### Calendar Integration
- ✅ Calendar view (month grid)
- ✅ Click date to select
- ✅ Show task/meeting count on date
- ✅ Add task/meeting/time block/commitment from calendar
- ✅ Tasks visible on calendar dates

### Time Blocks
- ✅ Create time blocks
- ✅ Edit time blocks
- ✅ Delete time blocks
- ✅ Show start/end time

### Commitments
- ✅ Create commitments
- ✅ Edit commitments
- ✅ Delete commitments
- ✅ Show effort minutes

### Requests Integration
- ✅ Show requests as tasks in main task list
- ✅ Mark requests as done/pending
- ✅ Display request urgency as priority

---

## 🔧 IMPLEMENTATION DETAILS

### Task Creation Modal
```
- Title (required)
- Priority (P1-P4)
- Assigned To (team member name)
- Recurring (checkbox)
- Blocked (checkbox)
- Date (pre-filled from calendar selection)
```

### Timer Display
```
Format: HH:MM:SS
- Play button: Start timer
- Pause button: Pause timer (shows current time)
- On pause: Save time_tracked to database
- On resume: Continue from paused time
```

### Calendar View
```
- 7x5 grid (35 days)
- Show date number
- Show task count (📋)
- Show meeting count (📅)
- Click to select date
- Selected date highlighted in green
- Show action buttons when date selected
```

### Requests as Tasks
```
- Fetch requests from /api/v1/requests
- Convert to task format:
  - title: "[REQUEST] {description}"
  - priority: urgency
  - status: request status
  - due_at: sla_at
- Show in same task list as regular tasks
```

---

## 📊 API ENDPOINTS NEEDED

### Existing (Working)
- GET /api/v1/tasks
- POST /api/v1/tasks
- PUT /api/v1/tasks/:id
- DELETE /api/v1/tasks/:id
- GET /api/v1/meetings
- GET /api/v1/requests
- GET /api/v1/my-week

### Need to Verify/Fix
- GET /api/v1/time-blocks
- POST /api/v1/time-blocks
- PUT /api/v1/time-blocks/:id
- DELETE /api/v1/time-blocks/:id
- GET /api/v1/commitments
- POST /api/v1/commitments
- PUT /api/v1/commitments/:id
- DELETE /api/v1/commitments/:id

---

## 🚀 NEXT STEPS

1. **Complete My Week Component**
   - Add timer display and controls
   - Add task creation modal
   - Add calendar view
   - Add time block management
   - Add commitment management

2. **Fix Backend Endpoints**
   - Ensure all CRUD operations work
   - Verify time tracking persistence
   - Test request conversion

3. **Test All Features**
   - Task creation/edit/delete
   - Timer start/pause/resume
   - Calendar date selection
   - Time block CRUD
   - Commitment CRUD
   - Request display

4. **Deploy & Verify**
   - Build frontend
   - Test in browser
   - Verify all data persists

---

## 📁 FILES TO MODIFY

- `/src/pages/FounderOSMyWeek.tsx` - Main component (IN PROGRESS)
- `/src/pages/FounderOSMaster.tsx` - Navigation (✅ DONE)
- `/backend/founder-os-phase0-routes.js` - API endpoints (VERIFY)

---

## ✅ COMPLETION CHECKLIST

- [ ] Remove Analytics tab
- [ ] Add calendar view to My Week
- [ ] Implement task creation from calendar
- [ ] Add task blocking option
- [ ] Add team member assignment
- [ ] Implement recurring task toggle
- [ ] Fix timer (start/pause/resume)
- [ ] Show requests as tasks
- [ ] Fix time blocks CRUD
- [ ] Fix commitments CRUD
- [ ] Test all features
- [ ] Deploy to production

---

**Current Progress:** 20% (Analytics removed, timer logic added)  
**Estimated Completion:** 2-3 hours

