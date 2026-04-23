# 🎯 MEETING OS - FULL IMPLEMENTATION PLAN

**Date:** November 20, 2025  
**Priority:** HIGH  
**Estimated Effort:** 3 weeks  
**Status:** Starting Now

---

## 📋 IMPLEMENTATION ROADMAP

### **WEEK 10: Core Meeting Features (Nov 20-26)**

#### **Day 1-2: Agenda Management Enhancement**
- [x] Review existing agenda CRUD in MeetingDetailPageV2
- [ ] Add drag-drop reordering for agenda items
- [ ] Add time allocation per agenda item
- [ ] Create agenda templates system
- [ ] Add agenda item status tracking

#### **Day 3-4: Live Meeting Timer**
- [ ] Implement meeting-level timer
- [ ] Add per-agenda-item timer
- [ ] Create timer controls (Start/Pause/Stop)
- [ ] Add time warnings (80%/100% alerts)
- [ ] Visual progress indicators

#### **Day 5-7: Role Management**
- [ ] Add role assignment UI (Facilitator, Scribe, Decision-Maker)
- [ ] Create role selection dropdown
- [ ] Display roles prominently during meeting
- [ ] Add role-based permissions

---

### **WEEK 11: Decision Logging & Actions (Nov 27 - Dec 3)**

#### **Day 1-3: Decision Logging System**
- [ ] Create decision capture form
- [ ] Add decision rationale field
- [ ] Implement owner assignment
- [ ] Add review date setting
- [ ] Create decisions list view
- [ ] Add decision edit/delete

#### **Day 4-5: Auto-Task Creation from Decisions**
- [ ] Create task generation from decision
- [ ] Auto-populate task fields from decision
- [ ] Link task to decision
- [ ] Add task tracking in meeting

#### **Day 6-7: Meeting Actions**
- [ ] Create action items list
- [ ] Link actions to tasks
- [ ] Add action item status tracking
- [ ] Create action items dashboard

---

### **WEEK 12: Recording, Transcription & After-Action (Dec 4-10)**

#### **Day 1-2: Meeting Recording**
- [ ] Implement in-app audio recording
- [ ] Add record/stop controls
- [ ] Store audio files
- [ ] Add playback functionality

#### **Day 3-4: Transcription & AI Summary**
- [ ] Integrate transcription API
- [ ] Auto-transcribe recordings
- [ ] Generate AI summary
- [ ] Display transcription in meeting notes

#### **Day 5-6: After-Action Packet**
- [ ] Auto-generate meeting summary
- [ ] Create email template
- [ ] Add micro-NPS survey
- [ ] Generate action items list
- [ ] Email distribution system

#### **Day 7: Testing & Polish**
- [ ] End-to-end testing
- [ ] UI/UX polish
- [ ] Performance optimization
- [ ] Documentation

---

## 🎨 UI/UX DESIGN

### **Meeting Detail Page Layout (3-Column)**

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Meetings          Meeting Title          Edit Delete │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  LEFT COLUMN (30%)     CENTER COLUMN (40%)      RIGHT COLUMN (30%)│
│  ┌──────────────┐     ┌──────────────────┐    ┌────────────────┐│
│  │ Meeting Info │     │  Live Meeting    │    │  Roles         ││
│  │              │     │  ┌────────────┐  │    │  👤 Facilitator││
│  │ 📅 Date/Time │     │  │   Timer    │  │    │  ✍️  Scribe    ││
│  │ 📍 Location  │     │  │  00:45:30  │  │    │  ⚖️  Decision  ││
│  │ 👥 Attendees │     │  │  [Pause]   │  │    │                ││
│  │ 📊 Status    │     │  └────────────┘  │    │  Statistics    ││
│  │              │     │                  │    │  ⏱️ Duration   ││
│  │ Created      │     │  Agenda Items    │    │  ✅ Decisions  ││
│  │ Updated      │     │  ┌────────────┐  │    │  📋 Actions    ││
│  └──────────────┘     │  │ 1. Intro   │  │    │                ││
│                       │  │    15 min  │  │    │  Quick Actions ││
│                       │  │    [Timer] │  │    │  🎤 Record     ││
│                       │  ├────────────┤  │    │  📝 Decision   ││
│                       │  │ 2. Review  │  │    │  ✅ Action     ││
│                       │  │    30 min  │  │    └────────────────┘│
│                       │  │    [Timer] │  │                       │
│                       │  └────────────┘  │                       │
│                       │                  │                       │
│                       │  Decisions       │                       │
│                       │  ┌────────────┐  │                       │
│                       │  │ Decision 1 │  │                       │
│                       │  │ Owner: XX  │  │                       │
│                       │  └────────────┘  │                       │
│                       │                  │                       │
│                       │  Notes           │                       │
│                       │  ┌────────────┐  │                       │
│                       │  │ Meeting    │  │                       │
│                       │  │ notes...   │  │                       │
│                       │  └────────────┘  │                       │
│                       └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### **Frontend Components**

#### **1. MeetingTimer Component**
```typescript
interface MeetingTimerProps {
  duration: number;
  onComplete: () => void;
  onWarning: (percentage: number) => void;
}
```

#### **2. AgendaItemTimer Component**
```typescript
interface AgendaItemTimerProps {
  agendaId: string;
  duration: number;
  onComplete: () => void;
}
```

#### **3. DecisionLogger Component**
```typescript
interface DecisionLoggerProps {
  meetingId: string;
  onDecisionAdded: (decision: Decision) => void;
}
```

#### **4. RoleAssignment Component**
```typescript
interface RoleAssignmentProps {
  meetingId: string;
  roles: MeetingRoles;
  onRolesUpdate: (roles: MeetingRoles) => void;
}
```

#### **5. AudioRecorder Component**
```typescript
interface AudioRecorderProps {
  meetingId: string;
  onRecordingComplete: (audioUrl: string) => void;
}
```

---

### **Backend API Endpoints**

#### **Existing (Already Implemented)**
- `GET /api/v1/meetings/:id` - Get meeting details
- `PUT /api/v1/meetings/:id` - Update meeting
- `DELETE /api/v1/meetings/:id` - Delete meeting
- `POST /api/v1/meetings/:id/agenda` - Add agenda item
- `DELETE /api/v1/meetings/:id/agenda/:agendaId` - Delete agenda item
- `GET /api/v1/meetings/:id/decisions` - Get decisions
- `GET /api/v1/meetings/:id/actions` - Get actions

#### **New Endpoints Needed**
- `PUT /api/v1/meetings/:id/agenda/:agendaId` - Update agenda item
- `PUT /api/v1/meetings/:id/agenda/reorder` - Reorder agenda items
- `POST /api/v1/meetings/:id/decisions` - Create decision
- `PUT /api/v1/meetings/:id/decisions/:decisionId` - Update decision
- `DELETE /api/v1/meetings/:id/decisions/:decisionId` - Delete decision
- `POST /api/v1/meetings/:id/roles` - Update meeting roles
- `POST /api/v1/meetings/:id/recording` - Upload recording
- `POST /api/v1/meetings/:id/transcribe` - Trigger transcription
- `POST /api/v1/meetings/:id/after-action` - Generate after-action packet
- `POST /api/v1/meetings/:id/timer/start` - Start meeting timer
- `POST /api/v1/meetings/:id/timer/pause` - Pause meeting timer
- `POST /api/v1/meetings/:id/timer/stop` - Stop meeting timer

---

## 📊 DATABASE SCHEMA UPDATES

### **meetings table (existing)**
```sql
- id
- title
- start_at
- end_at
- location
- status
- org_id
- created_at
- updated_at
```

### **meeting_agenda table (new)**
```sql
CREATE TABLE meeting_agenda (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  owner TEXT,
  status TEXT DEFAULT 'pending',
  time_spent INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);
```

### **meeting_decisions table (existing)**
```sql
- id
- meeting_id
- title
- rationale
- owner_id
- review_at
- created_at
```

### **meeting_roles table (new)**
```sql
CREATE TABLE meeting_roles (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  facilitator TEXT,
  scribe TEXT,
  decision_maker TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);
```

### **meeting_recordings table (new)**
```sql
CREATE TABLE meeting_recordings (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  transcription TEXT,
  summary TEXT,
  duration INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);
```

---

## 🎯 SUCCESS CRITERIA

### **KPIs to Achieve**
- Meeting hours -40%
- Agenda compliance ≥90%
- Decisions per meeting ≥2
- Action closure ≥85%

### **Feature Checklist**
- [ ] Agenda management with drag-drop
- [ ] Live meeting timer
- [ ] Per-agenda-item timers
- [ ] Role assignments
- [ ] Decision logging
- [ ] Auto-task creation
- [ ] Audio recording
- [ ] Transcription
- [ ] AI summary
- [ ] After-action packet
- [ ] Email distribution
- [ ] Micro-NPS survey

---

## 🚀 NEXT IMMEDIATE STEPS

1. **Create backend database migrations**
2. **Implement new API endpoints**
3. **Build MeetingTimer component**
4. **Build AgendaItemTimer component**
5. **Build DecisionLogger component**
6. **Build RoleAssignment component**
7. **Enhance MeetingDetailPage with new features**
8. **Test end-to-end workflow**

---

**Status:** Ready to begin implementation  
**Start Date:** November 20, 2025  
**Target Completion:** December 10, 2025
