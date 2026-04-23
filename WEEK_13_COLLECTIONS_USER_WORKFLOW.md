# 🚀 WEEK 13 - COLLECTIONS USER WORKFLOW

**Date:** November 8, 2025  
**Week:** 13 of 24  
**Status:** Starting Collections User MVP

---

## 📋 WEEK 13 DELIVERABLES

### Collections User Workflow - What Users Can Do

**User Can:**
1. ✅ View invoices (aging report)
2. ✅ Send payment reminders (WhatsApp/Email)
3. ✅ Track collections status
4. ✅ View collections KPIs
5. ✅ Log collection calls
6. ✅ Mark payments received
7. ✅ View customer aging

---

## 🎯 COLLECTIONS USER PAGES (5 pages)

### 1. Collections Dashboard
- Total outstanding amount
- Collection current %
- Days Sales Outstanding (DSO)
- Collections by age bucket
- Collections by customer
- Quick actions

### 2. Invoices Page
- Invoice list (paginated)
- Invoice status (paid, overdue, pending)
- Invoice amount
- Due date
- Customer name
- Send reminder button
- Mark as paid button

### 3. Collections Actions Page
- View pending reminders
- Send WhatsApp reminder
- Send Email reminder
- Log collection call
- Track follow-ups
- View reminder history

### 4. Collections Report Page
- Aging report (0-30, 30-60, 60-90, 90+)
- Collections by customer
- Collections by status
- Export report
- Date range filter

### 5. Customer Collections Page
- Customer list
- Customer aging
- Total outstanding
- Last collection action
- Next follow-up date
- View customer details

---

## 🔌 API ENDPOINTS NEEDED (10 endpoints)

### Collections User Endpoints:
```
GET    /api/v1/collections/dashboard
GET    /api/v1/collections/invoices
GET    /api/v1/collections/invoices/:id
POST   /api/v1/collections/send-reminder
POST   /api/v1/collections/log-call
PUT    /api/v1/collections/invoices/:id/mark-paid
GET    /api/v1/collections/report
GET    /api/v1/collections/customers
GET    /api/v1/collections/customers/:id
GET    /api/v1/collections/actions
```

---

## 📊 DATA MODELS

### Invoice:
```json
{
  "id": "INV-001",
  "customer_id": "cust-001",
  "customer_name": "Acme Corp",
  "amount": 50000,
  "due_date": "2025-11-15",
  "status": "overdue",
  "days_overdue": 5,
  "reminders_sent": 2,
  "last_reminder": "2025-11-08T10:30:00Z"
}
```

### Collections Action:
```json
{
  "id": "action-001",
  "invoice_id": "INV-001",
  "action_type": "reminder_sent",
  "channel": "whatsapp",
  "timestamp": "2025-11-08T10:30:00Z",
  "status": "sent"
}
```

### Collections Report:
```json
{
  "total_outstanding": 500000,
  "collection_current": 75,
  "dso": 25,
  "by_age": {
    "0_30": 100000,
    "30_60": 150000,
    "60_90": 150000,
    "90_plus": 100000
  }
}
```

---

## 🎯 IMPLEMENTATION PLAN

### Phase 1: Backend (Days 1-2)
- [ ] Create collections user routes
- [ ] Implement 10 API endpoints
- [ ] Add collections data models
- [ ] Add sample data

### Phase 2: Frontend (Days 3-4)
- [ ] Create Collections Dashboard page
- [ ] Create Invoices page
- [ ] Create Collections Actions page
- [ ] Create Collections Report page
- [ ] Create Customer Collections page

### Phase 3: Integration (Days 5)
- [ ] Connect frontend to backend
- [ ] Test all workflows
- [ ] Add error handling
- [ ] Verify data display

### Phase 4: Testing (Days 6-7)
- [ ] Chrome MCP testing
- [ ] User flow testing
- [ ] API testing
- [ ] Performance testing

---

## 📈 SUCCESS METRICS

- ✅ Collections current% visible
- ✅ DSO tracking working
- ✅ Reminders can be sent
- ✅ Collections KPIs displaying
- ✅ All 5 pages functional
- ✅ All 10 endpoints working
- ✅ No errors in console
- ✅ Responsive design

---

## 🚀 WEEK 13 READY

**Status: ✅ READY TO START**

**Previous:** Admin MVP Complete (50%)
**Current:** Collections User Workflow (Week 13)
**Next:** Finance User Workflow (Week 14)

---

**Timeline:** ON TRACK for Week 19 MVP Launch
