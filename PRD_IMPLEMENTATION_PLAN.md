# LAPAAS OS - PRD IMPLEMENTATION PLAN

**Date:** November 8, 2025, 10:57 PM UTC+05:30  
**Status:** Ready for Implementation  
**Priority:** CRITICAL

---

## 📋 EXECUTIVE SUMMARY

This document outlines the complete implementation plan for all missing features from the PRD (Product Requirements Document). The plan is organized by feature area and includes technical specifications, acceptance criteria, and implementation timeline.

**Total Missing Features:** 20+  
**Estimated Timeline:** 12-16 weeks  
**Team Size:** 6-8 developers

---

## 🎯 SECTION 2: PERSONAS & JTBD

### Implementation: Role-Based Access Control (RBAC)

**Components to Create:**
- `RoleManager.tsx` - Role assignment UI
- `PermissionMatrix.tsx` - Permission configuration
- `RoleService.ts` - Backend role management

**Database Schema:**
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  org_id UUID,
  name VARCHAR(50),
  description TEXT,
  permissions JSONB,
  created_at TIMESTAMP
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID,
  role_id UUID,
  org_id UUID,
  assigned_at TIMESTAMP
);
```

**Roles to Implement:**
1. **Founder/Owner**
   - Permissions: All (plan week, run decisions, batch interruptions)
   - Features: Dashboard access, settings, team management

2. **Manager/Lead**
   - Permissions: Run meetings, triage requests, own actions
   - Features: Meeting management, request triage, team oversight

3. **IC/Assistant**
   - Permissions: Submit requests with context, execute tasks
   - Features: Request submission, task execution, limited dashboard

4. **Guest (Optional)**
   - Permissions: Join meeting link, view summary/tasks
   - Features: Read-only meeting access, task visibility

**Timeline:** 1 week

---

## 📅 SECTION 3.1: PERSONAL PRODUCTIVITY

### Feature 1: Plan My Week (Time-Blocking)

**Components to Create:**
- `WeekPlanner.tsx` - Main time-blocking interface
- `TimeBlockDragDrop.tsx` - Drag-and-drop functionality
- `BlockTypeSelector.tsx` - Deep Work/Admin/Sales/Custom
- `CollisionDetector.ts` - Collision resolution logic
- `TargetVsPlannedChip.tsx` - Display component

**Database Schema:**
```sql
CREATE TABLE time_blocks (
  id UUID PRIMARY KEY,
  user_id UUID,
  org_id UUID,
  block_type VARCHAR(50), -- 'deep_work', 'admin', 'sales', 'custom'
  title VARCHAR(255),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  target_minutes INT,
  actual_minutes INT,
  date DATE,
  created_at TIMESTAMP
);
```

**Features:**
- ✅ Drag-and-drop time blocks
- ✅ Block types: Deep Work, Admin, Sales, Custom
- ✅ Target minutes per block
- ✅ Collision detection and resolution
- ✅ Target vs Planned chips display
- ✅ Persist to database
- ✅ Weekly view with day columns

**Acceptance Criteria:**
- Blocks persist after page refresh
- Collisions are automatically resolved
- Target vs Planned chips show correctly
- Drag-drop works smoothly
- Mobile responsive

**Timeline:** 2 weeks

---

### Feature 2: Daily Top-3 Commitments

**Components to Create:**
- `Top3Selector.tsx` - Selection interface
- `CommitmentCard.tsx` - Individual commitment display
- `EndOfDayReview.tsx` - Auto check and score
- `RescheduleQueue.tsx` - Queue for missed items

**Database Schema:**
```sql
CREATE TABLE daily_commitments (
  id UUID PRIMARY KEY,
  user_id UUID,
  org_id UUID,
  date DATE,
  commitment_id UUID,
  effort_minutes INT,
  status VARCHAR(20), -- 'pending', 'completed', 'missed'
  linked_tasks JSONB,
  linked_projects JSONB,
  created_at TIMESTAMP
);

CREATE TABLE commitment_scores (
  id UUID PRIMARY KEY,
  user_id UUID,
  date DATE,
  completed INT,
  total INT,
  score DECIMAL,
  created_at TIMESTAMP
);
```

**Features:**
- ✅ Select Top-3 commitments per day
- ✅ Link to tasks/projects
- ✅ Set effort in minutes
- ✅ End-of-day auto check
- ✅ Score calculation
- ✅ Queue missed items for reschedule/delegate

**Acceptance Criteria:**
- Can select exactly 3 commitments
- Auto-check at end of day
- Score calculated correctly
- Missed items queued for next day
- Historical tracking available

**Timeline:** 1.5 weeks

---

### Feature 3: Deep-Work Guardrails

**Components to Create:**
- `FocusMode.tsx` - Focus ON/OFF toggle
- `P1Whitelist.tsx` - P1 notification whitelist
- `DoNotDisturbBanner.tsx` - Visual indicator
- `FocusSessionSummary.tsx` - Post-session summary
- `OverrideLogger.ts` - Log overrides and breaches

**Features:**
- ✅ Focus ON mutes notifications
- ✅ P1 whitelist for critical notifications
- ✅ Website blocker (desktop app integration)
- ✅ Do Not Disturb banner
- ✅ Log overrides
- ✅ Track breach count
- ✅ Focus session summary

**Acceptance Criteria:**
- Notifications muted when Focus ON
- P1 notifications still come through
- Overrides logged with timestamp
- Breach count tracked
- Summary shows focus time, interruptions, achievements

**Timeline:** 2 weeks

---

### Feature 4: Auto-Plan & Heatmap

**Components to Create:**
- `AutoPlanner.tsx` - Auto-pack interface
- `HeatmapView.tsx` - Visual overload indicator
- `ConstraintConfig.tsx` - Lunch, travel, max block length
- `ConflictResolver.ts` - Conflict detection

**Features:**
- ✅ "Auto-pack my week" button
- ✅ Fill free slots from tasks by priority/deadlines
- ✅ Heatmap shows overload (red/yellow/green)
- ✅ Respects constraints (lunch, travel, max block length)
- ✅ Surface conflicts
- ✅ Suggest alternatives

**Acceptance Criteria:**
- Auto-packing respects all constraints
- Heatmap accurately shows overload
- Conflicts surfaced with solutions
- User can accept/reject suggestions
- Packing algorithm efficient

**Timeline:** 2 weeks

---

### Feature 5: Daily Startup/Shutdown

**Components to Create:**
- `StartupFlow.tsx` - Morning quick flow
- `ShutdownFlow.tsx` - Evening quick flow
- `JournalEntry.tsx` - Optional journaling
- `DayReconciliation.tsx` - Day reconciliation

**Features:**
- ✅ Quick flow to set Top-3 (< 90 seconds)
- ✅ Reconcile day
- ✅ Optional journaling
- ✅ Time tracking
- ✅ Completion scoring

**Acceptance Criteria:**
- Startup flow completes in < 90 seconds
- Shutdown flow completes in < 90 seconds
- Optional journaling available
- Day reconciliation accurate
- Historical tracking available

**Timeline:** 1 week

---

## 🤝 SECTION 3.2: MEETING OS

### Feature 1: No-Agenda-No-Meeting

**Components to Create:**
- `MeetingInviteForm.tsx` - Invite with required fields
- `AgendaValidator.ts` - Validation logic
- `AgendaNudge.tsx` - T-12h reminder
- `AutoCancelFlow.tsx` - T-2h auto-cancel

**Database Schema:**
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  org_id UUID,
  organizer_id UUID,
  title VARCHAR(255),
  purpose TEXT,
  outcomes JSONB,
  segments JSONB, -- [{name, duration_mins, outcome}]
  doc_links JSONB,
  owner_id UUID,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  attendees JSONB,
  status VARCHAR(20), -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMP
);
```

**Features:**
- ✅ Invite requires: purpose, outcomes, segments (with mins), doc links, owner
- ✅ T-12h agenda nudge
- ✅ T-2h missing agenda → auto-cancel with template
- ✅ Mandatory fields enforced

**Acceptance Criteria:**
- Cannot send invite without all required fields
- Nudge sent 12 hours before
- Auto-cancel works 2 hours before
- Cancellation notification sent
- Template provided for rescheduling

**Timeline:** 1.5 weeks

---

### Feature 2: Live Timers & Roles

**Components to Create:**
- `MeetingRoleSelector.tsx` - Facilitator/Scribe/Decision-Maker
- `SegmentTimer.tsx` - Segment-level timer
- `TimerAlerts.tsx` - 80%/100% alerts
- `OvertimeBadge.tsx` - Overtime indicator

**Features:**
- ✅ Assign roles: Facilitator, Scribe, Decision-Maker
- ✅ Segment timers with 80%/100% alerts
- ✅ Cannot start segment without stated outcome
- ✅ Overtime badge when exceeding time
- ✅ Real-time timer display

**Acceptance Criteria:**
- Roles assigned before meeting starts
- Timers accurate to second
- Alerts trigger at 80% and 100%
- Cannot start without outcome
- Overtime badge visible

**Timeline:** 1.5 weeks

---

### Feature 3: Decision Log → Auto Tasks

**Components to Create:**
- `DecisionLog.tsx` - Capture decisions
- `DecisionForm.tsx` - Decision, Rationale, Owner, Due
- `AutoTaskCreator.ts` - Auto-create tasks
- `DecisionTracker.tsx` - Track decisions

**Database Schema:**
```sql
CREATE TABLE decisions (
  id UUID PRIMARY KEY,
  meeting_id UUID,
  org_id UUID,
  decision TEXT,
  rationale TEXT,
  owner_id UUID,
  due_date DATE,
  status VARCHAR(20), -- 'pending', 'completed', 'reviewed'
  review_date DATE,
  created_task_id UUID,
  created_at TIMESTAMP
);
```

**Features:**
- ✅ Capture Decision, Rationale, Owner, Due
- ✅ Auto-create tasks from decisions
- ✅ 100% decisions have owner & review date
- ✅ Link decisions to meeting
- ✅ Track decision status

**Acceptance Criteria:**
- All decisions have owner and review date
- Tasks auto-created with correct details
- Decisions linked to meeting
- Status tracking accurate
- Review dates tracked

**Timeline:** 1 week

---

### Feature 4: Record → Transcribe → Summarize

**Components to Create:**
- `AudioRecorder.tsx` - In-app recording
- `TranscriptionService.ts` - Transcription API integration
- `AITranscriptSummarizer.ts` - AI summary generation
- `TranscriptViewer.tsx` - Display transcript
- `SummaryDisplay.tsx` - Display summary

**Features:**
- ✅ In-app audio record
- ✅ Transcript generation (< 2 min post end)
- ✅ AI summary with decisions/actions/risks
- ✅ Searchable transcript
- ✅ Summary < 2 min post end

**Acceptance Criteria:**
- Recording works in-app
- Transcript available within 2 minutes
- Summary includes decisions, actions, risks
- Transcript searchable
- Summary accurate and concise

**Timeline:** 2 weeks (requires AI/transcription API)

---

### Feature 5: After-Action Packet

**Components to Create:**
- `AfterActionPacket.tsx` - Packet builder
- `PacketEmail.tsx` - Email template
- `MicroNPS.tsx` - Quick survey
- `GuestLink.tsx` - Guest access link

**Features:**
- ✅ Send summary via platform email + in-app
- ✅ Micro-NPS survey
- ✅ Deliver to all attendees
- ✅ Guest link for external attendees
- ✅ Include decisions, actions, risks

**Acceptance Criteria:**
- Summary sent to all attendees
- Guest link works for external attendees
- NPS survey included
- Email and in-app delivery working
- Packet includes all key information

**Timeline:** 1 week

---

## 🚨 SECTION 3.3: INTERRUPTION FIREWALL

### Feature 1: Structured Request Intake

**Components to Create:**
- `RequestForm.tsx` - Structured intake form
- `RequestValidator.ts` - Validation logic
- `SLAClock.tsx` - SLA timer display
- `RequestTicket.tsx` - Ticket display

**Database Schema:**
```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY,
  org_id UUID,
  requester_id UUID,
  category VARCHAR(50),
  urgency VARCHAR(5), -- 'P1', 'P2', 'P3', 'P4'
  what_tried TEXT,
  impact TEXT,
  deadline DATE,
  attachments JSONB,
  status VARCHAR(20), -- 'new', 'assigned', 'in_progress', 'resolved'
  sla_due_at TIMESTAMP,
  created_at TIMESTAMP
);
```

**Features:**
- ✅ Form fields: category, urgency (P1-P4), what tried, impact, deadline, attachments
- ✅ Creates ticket with SLA clocks
- ✅ Mandatory fields enforced
- ✅ SLA tracking

**Acceptance Criteria:**
- All mandatory fields required
- SLA clock starts on creation
- Ticket created successfully
- Attachments handled
- Status tracking accurate

**Timeline:** 1 week

---

### Feature 2: Escalation Matrix

**Components to Create:**
- `EscalationMatrix.tsx` - Matrix configuration
- `EscalationRouter.ts` - Routing logic
- `EscalationLog.tsx` - Track escalations

**Features:**
- ✅ Route P3/P4 → FAQ/Manager/Office Hours
- ✅ P1 requires justification
- ✅ ≥70% diverted from Founder by week 4
- ✅ Exception log kept
- ✅ Automatic routing

**Acceptance Criteria:**
- Routing rules work correctly
- P1 requires justification
- Diversion rate tracked
- Exception log maintained
- Metrics dashboard available

**Timeline:** 1.5 weeks

---

### Feature 3: Office Hours & Batching

**Components to Create:**
- `OfficeHoursConfig.tsx` - Configure hours
- `RequestBatcher.ts` - Batching logic
- `OfficeHoursCalendar.tsx` - Display slots

**Features:**
- ✅ Configure owner/teams office hours
- ✅ Batch non-urgent into slots
- ✅ Holds appear on calendar
- ✅ Requestors get slot details
- ✅ Automatic batching

**Acceptance Criteria:**
- Office hours configurable
- Batching works automatically
- Calendar shows slots
- Requestors notified
- Conflicts resolved

**Timeline:** 1.5 weeks

---

### Feature 4: KB Deflection

**Components to Create:**
- `KBSearch.tsx` - Real-time KB search
- `FAQSuggestions.tsx` - FAQ suggestions
- `DeflectionTracker.ts` - Track deflection

**Features:**
- ✅ Show relevant SOP/FAQ as user types
- ✅ Encourage self-serve
- ✅ Track deflection rate
- ✅ Click-through tracking
- ✅ Measure effectiveness

**Acceptance Criteria:**
- Suggestions appear in real-time
- Deflection rate tracked
- Click-through data available
- Self-serve encouraged
- Metrics dashboard available

**Timeline:** 1 week

---

## 📧 SECTION 3.4: ONE-STOP EXTRAS

### Feature 1: Platform Email + Threads

**Components to Create:**
- `EmailClient.tsx` - Email interface
- `ThreadView.tsx` - Thread display
- `EmailParser.ts` - Inbound parsing
- `MentionSystem.tsx` - @mentions

**Features:**
- ✅ Workspace email (DKIM/SPF)
- ✅ Inbound parsing to threads
- ✅ @mentions support
- ✅ Attachments support
- ✅ Map emails to meeting/request thread

**Acceptance Criteria:**
- Email sending works
- Inbound parsing accurate
- Threads organized correctly
- @mentions functional
- Attachments handled

**Timeline:** 3 weeks (complex feature)

---

### Feature 2: Notes & Wiki/SOPs

**Components to Create:**
- `NoteEditor.tsx` - Rich text editor
- `WikiPage.tsx` - Wiki display
- `VersionControl.tsx` - Version tracking
- `ApprovalFlow.tsx` - SOP approval

**Features:**
- ✅ Notes with templates
- ✅ Wiki with versions & approvals
- ✅ Approved SOPs read-only
- ✅ Change requests tracked
- ✅ Search functionality

**Acceptance Criteria:**
- Notes editable
- Wiki searchable
- Versions tracked
- Approvals enforced
- Change requests tracked

**Timeline:** 2 weeks

---

### Feature 3: PWA/Desktop Timer & Quick-Capture

**Components to Create:**
- `PWAInstaller.tsx` - PWA installation
- `DesktopTimer.tsx` - Desktop timer
- `QuickCapture.tsx` - Quick note/task
- `OfflineSync.ts` - Offline sync logic

**Features:**
- ✅ Start/stop focus
- ✅ Quick note/task capture
- ✅ Offline sync
- ✅ Offline cache
- ✅ Conflict resolution

**Acceptance Criteria:**
- PWA installable
- Timer works offline
- Quick capture works offline
- Sync resolves conflicts
- Cache efficient

**Timeline:** 2 weeks

---

## 📊 IMPLEMENTATION TIMELINE

### Phase 1 (Weeks 1-4): CRITICAL FEATURES
- [ ] RBAC System (1 week)
- [ ] Plan My Week (2 weeks)
- [ ] Daily Top-3 Commitments (1.5 weeks)
- [ ] Structured Request Intake (1 week)

### Phase 2 (Weeks 5-8): HIGH PRIORITY
- [ ] Deep-Work Guardrails (2 weeks)
- [ ] Live Timers & Roles (1.5 weeks)
- [ ] Decision Log → Auto Tasks (1 week)
- [ ] Escalation Matrix (1.5 weeks)

### Phase 3 (Weeks 9-12): MEDIUM PRIORITY
- [ ] Auto-Plan & Heatmap (2 weeks)
- [ ] Record → Transcribe → Summarize (2 weeks)
- [ ] Office Hours & Batching (1.5 weeks)
- [ ] Platform Email + Threads (3 weeks)

### Phase 4 (Weeks 13-16): NICE-TO-HAVE
- [ ] Daily Startup/Shutdown (1 week)
- [ ] After-Action Packet (1 week)
- [ ] KB Deflection (1 week)
- [ ] Notes & Wiki/SOPs (2 weeks)
- [ ] PWA/Desktop Timer (2 weeks)

---

## 🚀 NEXT STEPS

1. **Week 1:** Start Phase 1 implementation
2. **Daily:** Standup meetings
3. **Weekly:** Progress review
4. **Bi-weekly:** Demo to stakeholders
5. **Monthly:** Retrospective and planning

---

**Status:** Ready for Implementation  
**Estimated Total Timeline:** 16 weeks  
**Team Size:** 6-8 developers  
**Start Date:** November 9, 2025
