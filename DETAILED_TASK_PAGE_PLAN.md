# DETAILED TASK PAGE - COMPREHENSIVE DESIGN PLAN

## 📋 OVERVIEW
A comprehensive task detail page that displays all task information, enables editing, tracks time spent on tasks and subtasks, and shows time tracking history.

---

## 🎨 PAGE LAYOUT (3-COLUMN RESPONSIVE DESIGN)

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back | Breadcrumb: Personal Productivity > Tasks > Task Name │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────┬──────────────────┐
│   LEFT (30%)     │      CENTER (40%)            │   RIGHT (30%)    │
├──────────────────┼──────────────────────────────┼──────────────────┤
│                  │                              │                  │
│ TASK OVERVIEW    │ MAIN CONTENT                 │ ACTIONS & STATS  │
│ ─────────────    │ ────────────────             │ ──────────────── │
│                  │                              │                  │
│ • Title          │ Section 1: Details           │ [Edit] [Delete]  │
│ • Status Badge   │ ─────────────────            │ [Save] [Back]    │
│ • Priority       │ Description (textarea)       │                  │
│ • Due Date       │ Assigned To (dropdown)       │ STATISTICS       │
│ • Created Date   │ Blocked (toggle)             │ ──────────────── │
│ • Updated Date   │ Recurring (toggle)           │                  │
│ • Recurring      │                              │ Total Time: 5h 30m
│                  │ Section 2: Time Tracking     │ Sessions: 12     │
│                  │ ─────────────────────        │ Avg/Session: 27m │
│                  │ Total Time: 5h 30m           │                  │
│                  │ [▶ Play] [⏸ Pause] [⏹ Stop] │ Subtasks: 5/8    │
│                  │ Current Session: 15m 23s     │ Completed: 62%   │
│                  │                              │                  │
│                  │ Time Tracking History        │                  │
│                  │ ─────────────────────────    │                  │
│                  │ [Table with entries]         │                  │
│                  │                              │                  │
│                  │ Section 3: Subtasks          │                  │
│                  │ ─────────────────────        │                  │
│                  │ Progress: 5/8 [████░░░░]    │                  │
│                  │ [List of subtasks]           │                  │
│                  │ [+ Add Subtask]              │                  │
│                  │                              │                  │
└──────────────────┴──────────────────────────────┴──────────────────┘
```

---

## 📊 SECTION DETAILS

### LEFT COLUMN - TASK OVERVIEW

```
┌─ TASK OVERVIEW ─────────────────┐
│                                 │
│ Task Title                      │
│ (Editable - click to edit)      │
│                                 │
│ Status: ✅ Done                 │
│ Priority: 🔴 P1                 │
│ Due: Nov 15, 2025               │
│ Created: Nov 10, 2025           │
│ Updated: Nov 15, 2025           │
│ Recurring: 🔄 Yes               │
│                                 │
└─────────────────────────────────┘
```

### CENTER COLUMN - MAIN CONTENT

#### Section 1: Task Details
```
┌─ TASK DETAILS ──────────────────────────┐
│                                         │
│ Description:                            │
│ ┌─────────────────────────────────────┐ │
│ │ [Editable textarea]                 │ │
│ │ Full task description here...       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Assigned To: [Dropdown: Select User]    │
│ Blocked: [Toggle: OFF]                  │
│ Recurring: [Toggle: ON]                 │
│                                         │
└─────────────────────────────────────────┘
```

#### Section 2: Time Tracking
```
┌─ TIME TRACKING ─────────────────────────┐
│                                         │
│ Total Time Spent: 5h 30m 45s            │
│                                         │
│ [▶ Play] [⏸ Pause] [⏹ Stop]            │
│ Current Session: 15m 23s                │
│                                         │
│ ┌─ TIME TRACKING HISTORY ─────────────┐ │
│ │ Date       │ Start  │ End   │ Dur.  │ │
│ ├────────────┼────────┼───────┼───────┤ │
│ │ Nov 15     │ 09:00  │ 10:30 │ 1h30m │ │
│ │ Nov 14     │ 14:00  │ 15:45 │ 1h45m │ │
│ │ Nov 13     │ 10:00  │ 11:15 │ 1h15m │ │
│ │ Nov 12     │ 09:30  │ 11:00 │ 1h30m │ │
│ │ ...        │ ...    │ ...   │ ...   │ │
│ └────────────┴────────┴───────┴───────┘ │
│                                         │
│ [+ Manual Entry]                        │
│                                         │
└─────────────────────────────────────────┘
```

#### Section 3: Subtasks
```
┌─ SUBTASKS ──────────────────────────────┐
│                                         │
│ Progress: 5/8 [████████░░░░░░░░░░░░░░] │
│                                         │
│ ☑ Design calendar layout (1h 30m)       │
│ ☑ Implement day/week views (2h 15m)    │
│ ☐ Add event creation (0m)              │
│ ☐ Add recurring events (0m)            │
│ ☑ Fix styling issues (45m)             │
│ ☑ Add time tracking (1h)               │
│ ☐ Write documentation (0m)             │
│ ☐ Deploy to production (0m)            │
│                                         │
│ [+ Add Subtask]                         │
│                                         │
└─────────────────────────────────────────┘
```

### RIGHT COLUMN - ACTIONS & STATISTICS

```
┌─ ACTIONS ───────────────────────┐
│                                 │
│ [✏️ Edit]  [💾 Save]            │
│ [🗑️ Delete] [← Back]            │
│                                 │
└─────────────────────────────────┘

┌─ STATISTICS ────────────────────┐
│                                 │
│ Total Time: 5h 30m 45s          │
│ Sessions: 12                    │
│ Avg/Session: 27m 33s           │
│                                 │
│ Subtasks: 5/8 (62%)            │
│ Completed: 5                    │
│ Pending: 3                      │
│                                 │
│ Created: Nov 10, 2025           │
│ Updated: Nov 15, 2025           │
│                                 │
└─────────────────────────────────┘
```

---

## 🔄 INTEGRATION WITH PERSONAL PRODUCTIVITY

### Current Flow:
```
Personal Productivity (Tasks Tab)
    ↓
[Click on Task]
    ↓
Navigate to /task/:taskId
    ↓
TaskDetailPageV2 (Enhanced)
    ↓
Display full task details with time tracking
```

### Navigation:
- Click task in Personal Productivity → Opens detail page
- Back button → Returns to Personal Productivity
- Breadcrumb navigation for context

---

## 💾 DATA STRUCTURE

### Task Detail Interface
```typescript
interface TaskDetail {
  id: string;
  title: string;
  description: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
  due_at: string;
  assigned_to: string;
  blocked: boolean;
  recurring: boolean;
  time_tracked: number; // in seconds
  subtasks: Subtask[];
  time_tracking_history: TimeEntry[];
  created_at: string;
  updated_at: string;
}

interface TimeEntry {
  id: string;
  task_id: string;
  start_time: string; // ISO format
  end_time: string;   // ISO format
  duration: number;   // in seconds
  notes?: string;
  date: string;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  time_tracked: number; // in seconds
  created_at: string;
}
```

---

## ⚙️ KEY FEATURES

### 1. Time Tracking System
- ✅ Start/Pause/Stop timer
- ✅ Manual time entry form
- ✅ Time tracking history with timestamps
- ✅ Total time calculation
- ✅ Time per subtask tracking
- ✅ Session-based tracking

### 2. Editable Fields
- ✅ Title (inline edit)
- ✅ Description (textarea)
- ✅ Priority (dropdown)
- ✅ Status (dropdown)
- ✅ Due Date (date picker)
- ✅ Assigned To (user dropdown)
- ✅ Blocked flag (toggle)
- ✅ Recurring flag (toggle)

### 3. Subtask Management
- ✅ View all subtasks
- ✅ Toggle completion status
- ✅ Delete subtask
- ✅ Add new subtask
- ✅ Time tracking per subtask
- ✅ Progress bar

### 4. Statistics & Analytics
- ✅ Total time spent
- ✅ Number of sessions
- ✅ Average time per session
- ✅ Subtask completion percentage
- ✅ Created/Updated timestamps

---

## 🎯 IMPLEMENTATION PHASES

### Phase 1: Enhanced UI Layout
- [ ] Create 3-column responsive layout
- [ ] Add task overview panel
- [ ] Add statistics panel
- [ ] Implement responsive design

### Phase 2: Time Tracking Display
- [ ] Display total time spent
- [ ] Show time tracking history table
- [ ] Display time per subtask
- [ ] Add time entry form

### Phase 3: Timer Functionality
- [ ] Implement start/pause/stop timer
- [ ] Add session tracking
- [ ] Save time entries to backend
- [ ] Update time tracking history

### Phase 4: Editing & Management
- [ ] Implement inline title editing
- [ ] Add description editor
- [ ] Add field dropdowns
- [ ] Add save/cancel buttons

### Phase 5: Integration
- [ ] Connect to Personal Productivity
- [ ] Add navigation
- [ ] Add breadcrumb
- [ ] Test full flow

---

## 🎨 STYLING GUIDELINES

- **Theme**: Dark mode (matching Personal Productivity)
- **Colors**:
  - Primary: Green (#10b981)
  - Priority P1: Red (#ef4444)
  - Priority P2: Orange (#f97316)
  - Priority P3: Yellow (#eab308)
  - Priority P4: Blue (#3b82f6)
  - Status Done: Green (#22c55e)
  - Status Pending: Yellow (#eab308)
  - Status In Progress: Blue (#3b82f6)
  - Status Blocked: Red (#ef4444)

- **Typography**:
  - Title: 24px, Bold
  - Section Headers: 18px, Bold
  - Body: 14px, Regular
  - Labels: 12px, Regular

- **Spacing**:
  - Sections: 24px gap
  - Fields: 16px gap
  - Padding: 20px

---

## 📱 RESPONSIVE DESIGN

### Desktop (1200px+)
- 3-column layout: 30% | 40% | 30%

### Tablet (768px - 1199px)
- 2-column layout: 40% | 60%
- Statistics move below main content

### Mobile (< 768px)
- Single column layout
- Stack all sections vertically
- Full width

---

## ✅ TESTING CHECKLIST

- [ ] Page loads correctly with task data
- [ ] All fields display correct values
- [ ] Timer starts/pauses/stops correctly
- [ ] Time tracking history displays
- [ ] Subtasks show time tracking
- [ ] Edit mode works for all fields
- [ ] Save button updates backend
- [ ] Delete button removes task
- [ ] Back button returns to previous page
- [ ] Responsive design works on all devices
- [ ] Navigation from Personal Productivity works
- [ ] Time calculations are accurate
- [ ] Statistics update correctly

---

## 🚀 NEXT STEPS

1. **Enhance TaskDetailPageV2** with new layout
2. **Add time tracking history** display
3. **Add time tracking per subtask**
4. **Add manual time entry** form
5. **Add task statistics** panel
6. **Connect to Personal Productivity** task list
7. **Test full integration** and flow
8. **Deploy and verify** in production

