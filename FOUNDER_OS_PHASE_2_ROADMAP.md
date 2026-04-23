# FOUNDER OS - PHASE 2: COMPLETE ROADMAP

**Date:** November 8, 2025  
**Status:** Planning Phase  
**Goal:** Build a complete, self-contained productivity OS for founders

---

## 🎯 VISION

**One-Stop Founder OS** - Everything a founder needs to run their week without external tools:
- Calendar & Tasks (in-app)
- Meetings (with recording, transcripts, decisions)
- Interruption Firewall (service desk)
- Notes, Wiki, Files (searchable)
- Personal CRM (touchpoints)
- Communications (email, chat, notifications)
- Analytics & Dashboards (clarity on what matters)

---

## 📊 GAP ANALYSIS

### Current State (Phase 1)
✅ Time blocks, commitments, focus sessions  
✅ Meeting scheduling, decisions, actions  
✅ Request queue, office hours, escalation  
✅ Basic analytics  

### Gaps to Close
❌ No calendar (just time blocks)  
❌ No task management (just commitments)  
❌ No email/chat (just notifications)  
❌ No notes/wiki (just meeting notes)  
❌ No CRM (no contact tracking)  
❌ No audio/transcripts (manual notes only)  
❌ No KB/FAQ (no self-serve)  
❌ No timers (no offline capture)  
❌ No audit/governance (no compliance)  
❌ No personal productivity tracking  

---

## 🏗️ CORE PRIMITIVES (Phase 0: Weeks 1-4)

### 1. Calendar & Task Engine

**Calendar Module:**
```
Features:
- Day/Week/Month views
- Create events (focus, meetings, office hours)
- Recurring rules (daily, weekly, monthly)
- Color tags (work, personal, urgent)
- Reminders (15m, 1h, 1d before)
- Timezone support
- Conflict detection

Data Model:
calendar_events(
  id, org_id, user_id,
  title, description,
  start_at, end_at,
  type: [focus, meeting, office_hours, personal],
  recurrence_rule,
  attendees[],
  color_tag,
  reminders[],
  notes_id,
  created_at, updated_at
)
```

**Task Manager:**
```
Features:
- My Tasks (personal)
- Project Tasks (shared)
- Recurring tasks
- Dependencies (task A blocks task B)
- Checklists (sub-tasks)
- Reminders
- Time tracking (start/stop)
- Auto-completion logging

Data Model:
tasks(
  id, org_id, owner_id,
  title, description,
  due_at, priority,
  status: [todo, in_progress, done, blocked],
  parent_id (for sub-tasks),
  dependencies[],
  checklist_json,
  time_spent_minutes,
  time_logs[{start, end, duration}],
  linked_to: {type, id},
  created_at, updated_at
)
```

**Linkage:**
- Tasks ↔ Time-blocks (task can be scheduled in a block)
- Tasks ↔ Meetings (action items from meetings become tasks)
- Tasks ↔ Requests (firewall requests become tasks)

---

### 2. Notifications & Communications

**Platform Email:**
```
Features:
- Per-org sender (SPF/DKIM setup)
- Canned replies (templates)
- Read receipts
- Inbound parsing to threads
- Email-to-task (forward to create task)

Data Model:
emails(
  id, org_id, from_id, to[],
  subject, body, html,
  status: [draft, sent, read],
  thread_id,
  attachments[],
  created_at, read_at
)

email_templates(
  id, org_id, name,
  subject_template, body_template,
  variables[]
)
```

**In-App Threads/Chat:**
```
Features:
- Per task/meeting/request threads
- Mentions (@user)
- Attachments
- Rich text
- Typing indicators
- Read status

Data Model:
threads(
  id, org_id,
  object_type: [task, meeting, request, note],
  object_id,
  participants[],
  created_at
)

messages(
  id, thread_id, author_id,
  content, mentions[],
  attachments[],
  reactions[],
  created_at, edited_at
)
```

**Notifications:**
```
Features:
- In-app notifications
- Push notifications (PWA)
- Desktop alerts
- Email digests
- Notification preferences per user

Data Model:
notifications(
  id, org_id, user_id,
  type: [mention, assignment, reminder, update],
  object_type, object_id,
  title, message,
  read_at,
  created_at
)
```

---

### 3. Notes, Wiki & Files

**Notes Module:**
```
Features:
- Quick notes (capture)
- Pinned daily note
- Meeting notes template
- Tags
- Linked to objects (meetings, tasks, requests)
- Version history
- Search

Data Model:
notes(
  id, org_id, user_id,
  title, content,
  tags[],
  linked_to: {type, id},
  is_pinned, is_template,
  versions[{content, created_at, created_by}],
  created_at, updated_at
)
```

**Wiki Module:**
```
Features:
- Hierarchical pages
- Version control
- Approval workflow (for SOPs)
- Search
- Breadcrumbs
- Related pages

Data Model:
wiki_pages(
  id, org_id,
  path: "/sops/sales/onboarding",
  title, content,
  parent_id,
  status: [draft, published, archived],
  approver_id, approved_at,
  versions[],
  created_at, updated_at
)
```

**File Storage:**
```
Features:
- Upload PDFs, docs, images
- Virus scan
- Access control
- Preview
- Search (OCR for PDFs)
- Retention policies

Data Model:
files(
  id, org_id, uploaded_by,
  name, mime_type, size,
  url, preview_url,
  linked_to: {type, id},
  access_level: [private, team, org],
  created_at
)
```

**Global Search:**
```
Features:
- Search across tasks, notes, wiki, meetings, requests
- Full-text search
- Filters (type, date, owner)
- Saved searches
- Search analytics

Implementation:
- Use in-memory index (MVP)
- Later: Elasticsearch
```

---

### 4. Personal CRM Lite

**Contacts Module:**
```
Features:
- Persons & Companies
- Email, phone, social
- Tags (advisor, client, team, partner)
- Last touch date
- Notes
- Follow-up reminders

Data Model:
contacts(
  id, org_id,
  type: [person, company],
  name, email, phone,
  company_id (if person),
  tags[],
  notes,
  last_touch_at,
  created_at
)

contact_interactions(
  id, contact_id,
  type: [call, email, meeting, note],
  date, notes,
  created_at
)
```

**Follow-Up Tracker:**
```
Features:
- "Who to follow up today"
- Suggested cadence (weekly, monthly)
- Auto-create tasks
- Track completion

Data Model:
follow_ups(
  id, contact_id,
  due_at, cadence,
  status: [pending, done],
  task_id,
  created_at
)
```

---

## 🎬 MEETING OS ENHANCEMENTS (Phase 0)

### 1. Agenda Packets
```
Features:
- Agenda + pre-reads + questions before meeting
- Attendee confirmation
- Document sharing
- Q&A collection

Data Model:
meeting_packets(
  id, meeting_id,
  agenda_items[],
  pre_reads[],
  questions[],
  created_at
)
```

### 2. Built-in Audio Recording
```
Features:
- Record meeting audio
- Auto-transcribe (Whisper API or similar)
- Auto-summary (AI)
- Action extraction
- Searchable transcript

Data Model:
audio_records(
  id, meeting_id,
  url, duration,
  transcript, transcript_status: [pending, done],
  summary, summary_status: [pending, done],
  extracted_actions[],
  created_at
)
```

### 3. Screen Timer Overlay
```
Features:
- Floating timer showing current agenda segment
- Gong at segment end (light humour)
- Pause/skip controls
- Visible to all attendees

Implementation:
- Browser extension or PWA overlay
- Synced with meeting agenda
```

### 4. Decision Register
```
Features:
- Org-wide searchable log
- Decision, owner, review date
- Status (pending, approved, implemented)
- Linked to meetings

Data Model:
decisions(
  id, org_id, meeting_id,
  title, description,
  owner_id, review_at,
  status: [pending, approved, implemented],
  created_at
)
```

### 5. 1:1 & Team Rituals
```
Features:
- Templates: Weekly L10, 1:1s, Retros, Quarterly Planning
- Auto-scheduled
- Pre-fill from previous week
- Action tracking

Data Model:
ritual_templates(
  id, org_id,
  name, type: [weekly_l10, 1on1, retro, quarterly],
  agenda_template,
  questions_template,
  created_at
)
```

---

## 🔥 INTERRUPTION FIREWALL ENHANCEMENTS (Phase 0)

### 1. Request Types & Dynamic Forms
```
Features:
- Request types: IT, Admin, Ops, Sales, Finance, Content, Client Issue, "Ask Founder"
- Conditional fields per type
- Required artifacts
- Auto-categorization

Data Model:
request_types(
  id, org_id,
  name, icon,
  form_schema: {fields: [{name, type, required, condition}]},
  sla_default,
  created_at
)
```

### 2. KB/FAQ Suggestions
```
Features:
- Side panel suggests SOPs before submit
- "Try this first" nudge
- Reduces duplicate requests

Implementation:
- Search wiki/FAQ for keywords
- Show top 3 matches
- Track if user clicks (deflection metric)
```

### 3. Queues & SLAs
```
Features:
- P1–P4 clocks
- Assignee
- Escalation
- Breach alerts
- Metrics

Data Model:
request_slas(
  id, org_id, request_type_id,
  priority, sla_hours,
  escalation_to_id
)

request_queue(
  id, org_id,
  priority, status,
  assigned_to_id,
  created_at, due_at,
  sla_breached_at
)
```

### 4. Office Hours Auto-Scheduler
```
Features:
- Batches P3/P4 into owner's slots
- Looks at owner's calendar
- Creates office hours blocks
- Notifies requester

Implementation:
- Cron job: every hour, check P3/P4 requests
- Find next available office hours slot
- Schedule batch
- Send notification
```

### 5. Decision Trees
```
Features:
- Tweakable "if…then" routing
- Exception approvals
- Visual builder

Data Model:
routing_rules(
  id, org_id,
  name, conditions[],
  action: {route_to, sla, template},
  created_at
)
```

---

## 🌉 CROSS-MODULE BRIDGES (Phase 0)

### 1. Tasks Everywhere
```
Features:
- Create tasks from meetings, firewall, notes
- Common "My Queue"
- Unified task list

Implementation:
- Task creation modal in each module
- "My Queue" page shows all tasks
- Filter by type, priority, due date
```

### 2. My Week Page
```
Features:
- Single page shows:
  - Top-3 commitments
  - Today's time blocks
  - Upcoming meetings
  - Requests due today
  - Quick plan button

Implementation:
- Dashboard-style layout
- Drag-drop to reorder
- Quick actions
```

### 3. Owner Brief (Weekly)
```
Features:
- One-pager: focus score, meeting hours, top interruptions, wins/misses, next week plan
- PDF + email
- AI commentary

Data Model:
owner_briefs(
  id, org_id, user_id,
  week_start, week_end,
  metrics_json: {
    focus_score, focus_hours, meeting_hours,
    interruptions, top_categories,
    wins[], misses[]
  },
  summary, recommendations[],
  created_at
)
```

### 4. Rituals Calendar
```
Features:
- Pre-set weekly/quarterly cadences
- Weekly Review, Team L10, Planning
- Auto-create meetings
- Reminders

Data Model:
ritual_schedules(
  id, org_id,
  ritual_type, day_of_week, time,
  attendees[],
  created_at
)
```

---

## 🤖 AI LAYER (Phase 1)

### 1. Planner Copilot
```
Features:
- Auto-pack tasks into blocks
- Flag unrealistic loads
- Propose Top-3
- Suggest focus windows

Prompt:
"Given these tasks [list] and calendar [events], 
suggest how to pack them into available time blocks. 
Flag if overbooked. Suggest Top-3 for tomorrow."
```

### 2. Meeting Copilot
```
Features:
- Draft agenda from title
- Live capture prompts
- Post-summary with actions

Prompt:
"Meeting: [title]. Suggest agenda items. 
After meeting, summarize key points and extract actions."
```

### 3. Firewall Triage
```
Features:
- Classify request
- Suggest SOP link
- Draft response
- Set SLA and slot

Prompt:
"Request: [description]. 
Classify priority (P1-P4). 
Suggest relevant SOP. 
Draft response. 
Recommend SLA."
```

### 4. Notes/Wiki Copilot
```
Features:
- Convert rough notes → SOP
- Enforce style & approvals
- Suggest structure

Prompt:
"Notes: [content]. 
Convert to SOP format with sections: 
Overview, Steps, Troubleshooting, Owner. 
Suggest approval chain."
```

### 5. Focus Coach
```
Features:
- Nudges on context-switching
- Suggests break
- Rearranges plan when meeting overruns

Prompt:
"User switched contexts 5 times today. 
Suggest consolidating tasks. 
Recommend 15-min break. 
If meeting overruns, suggest deferring next task."
```

**Guardrails:**
- Role-aware (don't show sensitive data to viewers)
- No external fetch (only in-app data)
- Citations to in-app records
- Explainability ("marked P2 because deadline is 48h+ and doc exists")

---

## 🔐 ADMIN, SECURITY & DATA (Phase 0)

### 1. RBAC
```
Roles:
- Owner: Full access, billing, org settings
- Admin: User management, settings, audit logs
- Manager: Team management, reporting
- Member: Personal + team tasks/meetings
- Viewer: Read-only
- Guest: External, read-only specific items

Data Model:
role_permissions(
  role, resource, action: [create, read, update, delete]
)
```

### 2. Passkeys/2FA
```
Features:
- Passkey (WebAuthn) by default for Owner/Admin
- 2FA (TOTP) for all users
- Recovery codes

Implementation:
- Use WebAuthn API
- TOTP library (speakeasy or similar)
```

### 3. DLP Toggles
```
Features:
- Restrict file downloads on sensitive notes
- Watermark exports
- Disable copy-paste on certain docs
- Audit access

Data Model:
dlp_policies(
  id, org_id,
  resource_type, resource_id,
  policy: {no_download, no_copy, watermark},
  created_at
)
```

### 4. Audit Logs
```
Features:
- Every action logged: create, update, delete, override, escalation
- User, timestamp, change details
- Searchable
- Retention policy

Data Model:
audit_logs(
  id, org_id, user_id,
  action: [create, update, delete, override, escalate],
  resource_type, resource_id,
  changes: {before, after},
  reason,
  created_at
)
```

### 5. Backups & Exports
```
Features:
- Daily PITR (Point-In-Time Recovery)
- JSON/CSV export of tasks/notes/meetings/requests
- Scheduled exports
- Retention policies

Implementation:
- Daily snapshots (in-memory → JSON)
- Export endpoints
- Scheduled job for exports
```

### 6. Branding
```
Features:
- Logo upload
- Colors (primary, accent)
- Email footer
- Custom domain (later)

Data Model:
org_branding(
  id, org_id,
  logo_url, primary_color, accent_color,
  email_footer,
  created_at
)
```

---

## 📊 REPORTS & DASHBOARDS (Phase 0)

### 1. Productivity Dashboard
```
Metrics:
- Focus hours planned vs done (weekly)
- Top-3 accuracy (% completed)
- Context-switch heatmap (by hour)
- Energy score trend
- Habit tracking (sleep, workout)

Charts:
- Line chart: focus hours over time
- Heatmap: context switches by day/hour
- Bar chart: Top-3 completion rate
```

### 2. Meetings Dashboard
```
Metrics:
- Hours spent in meetings (weekly)
- Agenda compliance (% with agenda)
- Decisions/hour
- Actions closed (%)
- Meetings without outcomes

Charts:
- Pie chart: meeting time vs focus time
- Bar chart: decisions per meeting
- Table: meetings without outcomes
```

### 3. Firewall Dashboard
```
Metrics:
- Request volumes (by type, priority)
- Diversion % (requests deflected by KB)
- True-P1 ratio (actual P1s / marked P1s)
- SLA hits/misses
- Top FAQ categories

Charts:
- Funnel: requests → resolved
- Bar chart: SLA performance
- Table: top FAQ categories
```

### 4. Owner Brief (PDF/Email)
```
Format:
- Header: Week of [date]
- KPIs: focus score, meeting hours, interruptions
- Wins: top 3 accomplishments
- Misses: incomplete items
- Next week plan: Top-3 + focus blocks
- AI commentary: "You had 2 context switches on Wed. 
  Consider batching similar tasks."

Frequency: Every Friday 5pm
Delivery: Email + in-app
```

---

## 📋 DATA MODEL (Complete)

```sql
-- Calendar & Tasks
CREATE TABLE calendar_events (
  id, org_id, user_id,
  title, description,
  start_at, end_at,
  type, recurrence_rule,
  attendees[], color_tag,
  reminders[], notes_id,
  created_at, updated_at
);

CREATE TABLE tasks (
  id, org_id, owner_id,
  title, description,
  due_at, priority,
  status, parent_id,
  dependencies[], checklist_json,
  time_spent_minutes, time_logs[],
  linked_to, created_at, updated_at
);

-- Communications
CREATE TABLE emails (
  id, org_id, from_id, to[],
  subject, body, html,
  status, thread_id,
  attachments[], created_at, read_at
);

CREATE TABLE threads (
  id, org_id,
  object_type, object_id,
  participants[], created_at
);

CREATE TABLE messages (
  id, thread_id, author_id,
  content, mentions[],
  attachments[], reactions[],
  created_at, edited_at
);

CREATE TABLE notifications (
  id, org_id, user_id,
  type, object_type, object_id,
  title, message, read_at,
  created_at
);

-- Notes & Wiki
CREATE TABLE notes (
  id, org_id, user_id,
  title, content, tags[],
  linked_to, is_pinned, is_template,
  versions[], created_at, updated_at
);

CREATE TABLE wiki_pages (
  id, org_id,
  path, title, content,
  parent_id, status,
  approver_id, approved_at,
  versions[], created_at, updated_at
);

CREATE TABLE files (
  id, org_id, uploaded_by,
  name, mime_type, size,
  url, preview_url,
  linked_to, access_level,
  created_at
);

-- CRM
CREATE TABLE contacts (
  id, org_id,
  type, name, email, phone,
  company_id, tags[],
  notes, last_touch_at,
  created_at
);

CREATE TABLE contact_interactions (
  id, contact_id,
  type, date, notes,
  created_at
);

-- Meetings
CREATE TABLE audio_records (
  id, meeting_id,
  url, duration,
  transcript, transcript_status,
  summary, summary_status,
  extracted_actions[], created_at
);

CREATE TABLE meeting_packets (
  id, meeting_id,
  agenda_items[], pre_reads[],
  questions[], created_at
);

CREATE TABLE decisions (
  id, org_id, meeting_id,
  title, description,
  owner_id, review_at,
  status, created_at
);

-- Firewall
CREATE TABLE request_types (
  id, org_id,
  name, icon, form_schema,
  sla_default, created_at
);

CREATE TABLE request_slas (
  id, org_id, request_type_id,
  priority, sla_hours,
  escalation_to_id
);

CREATE TABLE routing_rules (
  id, org_id,
  name, conditions[],
  action, created_at
);

-- Analytics
CREATE TABLE owner_briefs (
  id, org_id, user_id,
  week_start, week_end,
  metrics_json, summary,
  recommendations[], created_at
);

-- Admin
CREATE TABLE audit_logs (
  id, org_id, user_id,
  action, resource_type, resource_id,
  changes, reason, created_at
);

CREATE TABLE dlp_policies (
  id, org_id,
  resource_type, resource_id,
  policy, created_at
);

CREATE TABLE org_branding (
  id, org_id,
  logo_url, primary_color, accent_color,
  email_footer, created_at
);
```

---

## 🚀 DELIVERY PLAN (No External Integrations)

### Phase 0: Core Usable (Weeks 1-4)
**Goal:** Plan week → run meetings → handle interruptions all inside app

**Week 1-2: Calendar & Tasks**
- [ ] Calendar module (day/week views, events, recurring)
- [ ] Task manager (my tasks, project tasks, dependencies)
- [ ] Time tracking (start/stop, auto-logging)
- [ ] Linkage (tasks ↔ blocks ↔ meetings)

**Week 3: Meetings & Firewall**
- [ ] Agenda templates
- [ ] Live timer overlay
- [ ] Decision register
- [ ] Request types & dynamic forms
- [ ] KB/FAQ suggestions
- [ ] Office hours batching

**Week 4: Communications & Search**
- [ ] Platform email (basic)
- [ ] In-app notifications
- [ ] Notes & quick capture
- [ ] Global search
- [ ] "My Week" page
- [ ] Reports v0 (focus, meetings, firewall)

**Pilot Goal:** 1 founder uses app for 1 week end-to-end

---

### Phase 1: Power Up (Weeks 5-8)
**Goal:** AI-assisted planning, audio notes, self-serve deflection

**Week 5-6: AI & Audio**
- [ ] Audio record + transcribe + summarize
- [ ] Planner Copilot (auto-pack tasks)
- [ ] Meeting Copilot (draft agenda, post-summary)
- [ ] Firewall Triage Copilot

**Week 7: Personal Productivity**
- [ ] Workload heatmap
- [ ] Habit/Energy tracker
- [ ] Focus Coach nudges
- [ ] Daily startup/shutdown flows

**Week 8: Admin & Security**
- [ ] Passkeys/2FA
- [ ] RBAC (5 roles)
- [ ] DLP toggles
- [ ] Audit logs
- [ ] Backups/Exports
- [ ] Owner Weekly Brief

---

### Phase 2: Polish & Scale (Weeks 9-12)
**Goal:** Enterprise-ready, template library, guest access

**Week 9-10: CRM & Rituals**
- [ ] Personal CRM (contacts, interactions)
- [ ] Follow-up tracker
- [ ] 1:1 & Team Rituals library
- [ ] Review cadences

**Week 11: Wiki & Governance**
- [ ] Wiki with hierarchy & versioning
- [ ] SOP publishing & approvals
- [ ] Template marketplace (internal)
- [ ] Data retention policies

**Week 12: Polish & Metrics**
- [ ] Meeting health analytics
- [ ] Focus Coach nudges v2
- [ ] Offline capture & sync (PWA)
- [ ] Guest links (view summaries/actions)
- [ ] Org branding
- [ ] Performance optimization

---

## 🎯 SUCCESS METRICS

### Phase 0 (Weeks 1-4)
- [ ] 1 founder completes full week in app
- [ ] 0 external tool switches (calendar, tasks, email)
- [ ] 80%+ task completion rate
- [ ] <5 context switches/day
- [ ] 100% meeting agenda compliance

### Phase 1 (Weeks 5-8)
- [ ] 50%+ of requests deflected by KB
- [ ] 90%+ SLA compliance
- [ ] 3+ AI copilots actively used
- [ ] 2FA adoption 100% for admins
- [ ] Owner Brief read rate 100%

### Phase 2 (Weeks 9-12)
- [ ] 5+ rituals auto-scheduled
- [ ] 50+ SOPs published
- [ ] 10+ guest users active
- [ ] 99.9% uptime
- [ ] <100ms search latency

---

## 🎉 WHAT FOUNDERS WILL BE ABLE TO DO

✅ **Plan your week** - Calendar + tasks in one place  
✅ **Block deep work** - Auto-fill from tasks  
✅ **Run meetings** - Agenda, timer, decisions, auto-summary  
✅ **Stop random pings** - All requests via Firewall  
✅ **Keep notes & SOPs** - Searchable, versioned  
✅ **Track follow-ups** - Personal CRM  
✅ **See one dashboard** - "Is my week under control?"  
✅ **Get AI help** - Planner, meeting, firewall, notes copilots  
✅ **Sleep better** - Know interruptions are handled  

---

## 📝 NEXT STEP

Start Phase 0, Week 1: **Calendar & Task Engine**

Files to create:
1. `/backend/calendar-routes.js` (Calendar API)
2. `/backend/tasks-routes.js` (Task API)
3. `/lapaas-saas-ui-kit/src/pages/Calendar.tsx` (Calendar UI)
4. `/lapaas-saas-ui-kit/src/pages/Tasks.tsx` (Task UI)
5. Update `App.tsx` with new routes

Ready to proceed? 🚀
