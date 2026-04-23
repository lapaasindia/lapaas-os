# COLOR CODING GUIDE - My Week Dashboard

## 🎨 Task Type Color Scheme

### 📋 TASK (Slate)
```
Background: bg-slate-700
Border: border-l-4 border-slate-600
Text: text-slate-300
Label: 📋 Task
Use: Regular tasks and to-do items
```

### 📅 MEETING (Blue)
```
Background: bg-blue-900
Border: border-l-4 border-blue-500
Text: text-blue-300
Label: 📅 Meeting
Use: Scheduled meetings and events
```

### 🎯 COMMITMENT (Purple)
```
Background: bg-purple-900
Border: border-l-4 border-purple-500
Text: text-purple-300
Label: 🎯 Commitment
Use: Daily commitments and goals
```

### 🔄 DAILY COMMITMENT (Purple)
```
Background: bg-purple-900
Border: border-l-4 border-purple-500
Text: text-purple-300
Label: 🔄 Daily Commitment
Use: Recurring daily commitments
```

### 🚨 REQUEST (Orange)
```
Background: bg-orange-900
Border: border-l-4 border-orange-500
Text: text-orange-300
Label: 🚨 Request
Use: Interruption requests from Firewall
```

---

## 🔴 Status Badge Colors

### 🔒 BLOCKED (Red)
```
Background: bg-red-900
Text: text-red-200
Meaning: Task is blocked and cannot proceed
```

### ✅ DONE (Green)
```
Background: bg-green-900
Text: text-green-200
Meaning: Task is completed
Display: Faded with strikethrough text
```

### ⏳ IN PROGRESS (Blue)
```
Background: bg-blue-900
Text: text-blue-200
Meaning: Task is currently being worked on
```

### ⏸️ PENDING (Yellow)
```
Background: bg-yellow-900
Text: text-yellow-200
Meaning: Task is waiting to be started
```

---

## 🎯 Priority Colors

### P1 - CRITICAL (Red)
```
Border: border-red-700
Background: bg-red-900
Text: text-red-200
Meaning: Highest priority, urgent
```

### P2 - HIGH (Orange)
```
Border: border-orange-700
Background: bg-orange-900
Text: text-orange-200
Meaning: High priority
```

### P3 - MEDIUM (Yellow)
```
Border: border-yellow-700
Background: bg-yellow-900
Text: text-yellow-200
Meaning: Medium priority
```

### P4 - LOW (Blue)
```
Border: border-blue-700
Background: bg-blue-900
Text: text-blue-200
Meaning: Low priority
```

---

## 📊 Visual Layout Example

```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Task                                                          │
│ ▶ (0/3) ← Subtask indicator                                    │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Task Title                                                    │
│   Due: 11/10/2025                                              │
├─────────────────────────────────────────────────────────────────┤
│ ⏱️ 00:15:30  │ ⏸️ Pending  │ 🔄 Recurring  │ 👥 John  │ P2  │
├─────────────────────────────────────────────────────────────────┤
│ 📋 ✏️ 🗑️                                                         │
└─────────────────────────────────────────────────────────────────┘

When Expanded:
┌─────────────────────────────────────────────────────────────────┐
│ ▼ (2/3) Subtasks                                               │
├─────────────────────────────────────────────────────────────────┤
│ ✓ Subtask 1 (completed)                              🗑️       │
│ ☐ Subtask 2 (pending)                                🗑️       │
│ ☐ Subtask 3 (pending)                                🗑️       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Combinations

### Task Type + Status
- **Task + Pending:** Slate background + Yellow status badge
- **Meeting + Done:** Blue background + Green status badge
- **Commitment + In Progress:** Purple background + Blue status badge
- **Request + Blocked:** Orange background + Red status badge

### Visual Hierarchy
1. **Left Border** - Task type (4px colored border)
2. **Background** - Task type (subtle background color)
3. **Type Label** - Task type (emoji + text)
4. **Status Badge** - Current status (prominent badge)
5. **Priority Badge** - Priority level (colored border)

---

## 📱 Mobile Responsive

On mobile devices:
- Left border remains visible
- Type label shows emoji only (text hidden)
- Badges stack vertically
- Subtasks expand to full width
- Touch-friendly buttons

---

## ♿ Accessibility

### Color Contrast:
- All text meets WCAG AA standards
- Sufficient contrast ratios
- Not relying on color alone

### Indicators:
- Emojis provide additional context
- Text labels for all colors
- Icons for actions
- Status badges clearly labeled

---

## 🔄 Task Type Detection

```typescript
// Automatic type detection:
if (task.title.startsWith('[REQUEST]')) → 🚨 Request (Orange)
if (task.recurring && type === 'commitment') → 🔄 Daily Commitment (Purple)
if (type === 'commitment') → 🎯 Commitment (Purple)
if (type === 'meeting') → 📅 Meeting (Blue)
default → 📋 Task (Slate)
```

---

## 💡 Usage Tips

1. **Quick Identification:** Use colors to quickly identify task types
2. **Priority at a Glance:** Priority badges show urgency
3. **Status Tracking:** Status badges show current state
4. **Subtask Management:** Expand to see and manage subtasks
5. **Visual Organization:** Color-coded tasks are easier to scan

---

## 🎯 Summary

The color-coding system provides:
- ✅ Quick visual identification of task types
- ✅ Clear status indicators
- ✅ Priority visualization
- ✅ Professional appearance
- ✅ Better user experience
- ✅ Improved task management
- ✅ Accessibility compliance
