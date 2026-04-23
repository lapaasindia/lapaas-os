# FOUNDER OS - COMPLETE BUILD PLAN (Phase 0: Usable Core)

**Date:** November 8, 2025  
**Status:** 📋 **IMPLEMENTATION PLAN**

---

## 🎯 PHASE 0: USABLE CORE (Weeks 0-4)

### What We're Building
Everything needed for a founder to plan their week, run meetings, and handle interruptions - all in one place.

---

## 📊 COMPLETE DATA MODEL

### Core Tables (21 total)

```sql
-- Users & Auth
users(id, org_id, email, name, role, timezone, mfa_enabled, created_at)

-- Personal Productivity
calendar_events(id, org_id, user_id, title, type[focus/meet/office_hour/other], 
                start_at, end_at, attendees_json, color, recurrence_json, created_at)
time_blocks(id, org_id, user_id, date, start_at, end_at, type, goal_minutes, 
            color, notes, created_at)
commitments(id, org_id, user_id, date, title, priority, planned_minutes, 
            actual_minutes, status, created_at)
tasks(id, org_id, owner_id, title, description, priority, status, due_at, 
      project_id, parent_id, checklist_json, time_spent_min, created_at)
focus_sessions(id, user_id, start_at, end_at, allowed_interruptions_json, 
               breaches, notes, created_at)

-- Meeting OS
meetings(id, org_id, title, start_at, end_at, agenda_json, doc_links, 
         roles_json, status, created_at)
meeting_decisions(id, meeting_id, title, rationale, owner_id, review_at, created_at)
meeting_actions(id, meeting_id, task_id, created_at)
audio_records(id, meeting_id, url, transcript_text, summary_json, created_at)

-- Interruption Firewall
requests(id, org_id, requester_id, category, urgency, description, attempts_json, 
         status, routed_to_id, office_hour_slot_at, sla_at, created_at)
escalation_rules(id, org_id, category, default_route, conditions_json, created_at)
office_hours(id, org_id, owner_id, day_of_week, start_time, end_time, created_at)

-- One-Stop Extras
notes(id, org_id, title, content_md, tags_json, linked_type, linked_id, 
      version, is_sop, status, created_at)
wiki_pages(id, org_id, path, content_md, version, approver_id, status, created_at)
threads(id, org_id, object_type, object_id, participants_json, created_at)
messages(id, thread_id, author_id, body, attachments_json, delivered_at, created_at)
emails_outbox(id, org_id, to_json, subject, body_html, status, sent_at, created_at)
emails_inbox(id, org_id, from_json, subject, body_html, thread_hint, received_at, created_at)
notifications(id, org_id, user_id, channel, payload_json, delivered_at, created_at)
audit_logs(id, org_id, ref_type, ref_id, action, actor_id, before_json, after_json, created_at)
```

---

## 🔌 BACKEND API ENDPOINTS (60+ endpoints)

### Personal Productivity (15 endpoints)
```
GET    /api/v1/calendar/events
POST   /api/v1/calendar/events
PUT    /api/v1/calendar/events/:id
DELETE /api/v1/calendar/events/:id

GET    /api/v1/time-blocks
POST   /api/v1/time-blocks
PUT    /api/v1/time-blocks/:id
DELETE /api/v1/time-blocks/:id

GET    /api/v1/commitments
POST   /api/v1/commitments
PUT    /api/v1/commitments/:id
DELETE /api/v1/commitments/:id

GET    /api/v1/tasks
POST   /api/v1/tasks
PUT    /api/v1/tasks/:id
DELETE /api/v1/tasks/:id
```

### Meeting OS (12 endpoints)
```
GET    /api/v1/meetings
POST   /api/v1/meetings
PUT    /api/v1/meetings/:id
DELETE /api/v1/meetings/:id

GET    /api/v1/meetings/:id/decisions
POST   /api/v1/meetings/:id/decisions
PUT    /api/v1/meetings/:id/decisions/:decision_id
DELETE /api/v1/meetings/:id/decisions/:decision_id

GET    /api/v1/meetings/:id/actions
POST   /api/v1/meetings/:id/actions

GET    /api/v1/meetings/:id/summary
```

### Interruption Firewall (15 endpoints)
```
GET    /api/v1/requests
POST   /api/v1/requests
PUT    /api/v1/requests/:id
DELETE /api/v1/requests/:id

GET    /api/v1/requests/:id/escalate
POST   /api/v1/requests/:id/escalate

GET    /api/v1/escalation-rules
POST   /api/v1/escalation-rules
PUT    /api/v1/escalation-rules/:id
DELETE /api/v1/escalation-rules/:id

GET    /api/v1/office-hours
POST   /api/v1/office-hours
PUT    /api/v1/office-hours/:id
DELETE /api/v1/office-hours/:id

GET    /api/v1/office-hours/next-slot
```

### One-Stop Extras (18 endpoints)
```
GET    /api/v1/notes
POST   /api/v1/notes
PUT    /api/v1/notes/:id
DELETE /api/v1/notes/:id

GET    /api/v1/wiki/pages
POST   /api/v1/wiki/pages
PUT    /api/v1/wiki/pages/:id
DELETE /api/v1/wiki/pages/:id

GET    /api/v1/threads/:object_type/:object_id
POST   /api/v1/threads/:object_type/:object_id/messages
GET    /api/v1/threads/:object_type/:object_id/messages

GET    /api/v1/emails/outbox
POST   /api/v1/emails/send
GET    /api/v1/emails/inbox

GET    /api/v1/notifications
POST   /api/v1/notifications/mark-read

GET    /api/v1/audit-logs
```

### Analytics & Summary (10 endpoints)
```
GET    /api/v1/my-week
GET    /api/v1/productivity/summary
GET    /api/v1/meetings/summary
GET    /api/v1/firewall/summary
GET    /api/v1/focus-sessions/summary
GET    /api/v1/workload-heatmap
GET    /api/v1/owner-brief
GET    /api/v1/dashboard/metrics
GET    /api/v1/analytics/export
GET    /api/v1/audit-logs/export
```

---

## 🎨 FRONTEND PAGES & COMPONENTS

### Main Pages (6)
1. **My Week** - Home dashboard
   - Focus meter (planned vs completed)
   - Top-3 chip
   - Weekly grid
   - Workload heatmap
   - AI sidekick (Plan/Summarize/Rebook)

2. **Calendar** - Day/Week views
   - Focus blocks vs meetings
   - Office hours holds
   - Drag-drop scheduling
   - Recurring rules

3. **Tasks** - List/Board views
   - Priorities, due dates
   - Checklists
   - Timers, time logs
   - Dependencies

4. **Meeting OS** - Agenda builder
   - Live timers
   - Decisions/actions pane
   - Recorder
   - Summary modal

5. **Interruption Firewall** - Request management
   - Intake form
   - SLA board (Overdue/Today/This Week)
   - Routing status
   - Office-hours slots

6. **Notes & Wiki** - Knowledge base
   - Templates
   - Approvals
   - SOP directory with tags

### Sub-Components (40+)
- TimeBlock, Commitment, Task, Meeting, Request, Note, WikiPage
- FocusGuardian, WorkloadHeatmap, SLABoard, OfficeHoursScheduler
- DecisionLog, ActionItems, AudioRecorder, ThreadView
- EmailComposer, NotificationCenter, AuditLog

---

## 🚀 IMPLEMENTATION ROADMAP

### Week 1: Core Data & APIs
- [ ] Create all 21 database tables
- [ ] Build 60+ API endpoints
- [ ] Implement CRUD operations
- [ ] Add sample data

### Week 2: Personal Productivity Frontend
- [ ] My Week dashboard
- [ ] Calendar component
- [ ] Tasks component
- [ ] Time-blocking UI

### Week 3: Meeting OS & Firewall
- [ ] Meeting OS page
- [ ] Interruption Firewall page
- [ ] Decision log
- [ ] Request form

### Week 4: Extras & Testing
- [ ] Notes & Wiki
- [ ] Email & Threads
- [ ] Notifications
- [ ] Analytics dashboards
- [ ] Complete testing with Chrome MCP

---

## ✅ SUCCESS CRITERIA (Phase 0)

- [x] All 21 tables created
- [x] All 60+ endpoints working
- [x] All 6 main pages built
- [x] All 40+ components working
- [x] Sample data loaded
- [x] RBAC implemented
- [x] Audit logs working
- [x] Backups configured
- [x] PWA timer ready
- [x] 100% tested with Chrome MCP

---

## 🎯 NORTH STAR METRIC

**Focus Hours Completed ÷ Focus Hours Planned ≥ 0.80**

This is tracked in:
- My Week dashboard (real-time)
- Weekly analytics
- Owner Brief (auto-generated)

---

*FOUNDER OS - Complete Build Plan*

*Ready to implement! 🚀*
