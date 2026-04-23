# Module 4: Analytics & Reporting

**Status:** Core | **Priority:** High | **Phase:** 3 (Weeks 9-12)

## Quick Links
- [Billing Module](./M3_BILLING.md)
- [Integrations Module](./M5_INTEGRATIONS.md)
- [Compliance Module](./M8_COMPLIANCE.md)

---

## 4.1 Dashboard

### Endpoints
```
GET    /analytics/dashboard    - Get dashboard data
GET    /analytics/kpis         - Get KPIs
```

### Database
```sql
analytics_events (id, organization_id, user_id, event_name, event_properties, timestamp)
analytics_sessions (id, organization_id, user_id, session_start, session_end, page_views)
```

### KPI Cards
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Active Users
- Churn Rate
- Net Retention Rate
- Customer Lifetime Value

---

## 4.2 Revenue Analytics

### Endpoints
```
GET    /analytics/revenue      - Revenue metrics
GET    /analytics/revenue/by-plan - Revenue by plan
GET    /analytics/revenue/by-month - Revenue by month
```

### Metrics
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- MRR Growth
- Revenue by Plan
- Revenue by Source
- Average Revenue Per User (ARPU)

---

## 4.3 User Analytics

### Endpoints
```
GET    /analytics/users        - User metrics
GET    /analytics/users/growth - User growth
GET    /analytics/users/retention - Retention metrics
GET    /analytics/users/cohorts - Cohort analysis
```

### Metrics
- Total Users
- Active Users
- New Users
- Churned Users
- Retention Rate
- Churn Rate
- Cohort Analysis

---

## 4.4 Feature Analytics

### Endpoints
```
GET    /analytics/features     - Feature usage
GET    /analytics/features/:id - Feature detail
```

### Metrics
- Feature Usage Count
- Feature Adoption Rate
- Feature Engagement
- Feature Performance

---

## 4.5 Custom Reports

### Endpoints
```
GET    /reports                - List reports
POST   /reports                - Create report
PUT    /reports/:id            - Update report
DELETE /reports/:id            - Delete report
POST   /reports/:id/schedule   - Schedule report
GET    /reports/:id/export     - Export report
```

### Database
```sql
reports (id, organization_id, name, report_type, filters, metrics, dimensions, created_by)
report_schedules (id, report_id, frequency, recipients, last_sent_at, next_send_at)
```

### Report Types
- Revenue Report
- User Report
- Feature Report
- Custom Report

### Export Formats
- PDF
- CSV
- Excel
- JSON

---

## 4.6 Real-time Events

### Endpoints
```
GET    /analytics/events       - List events
POST   /analytics/events       - Track event
GET    /analytics/events/:id   - Get event
```

### Event Types
- user.signup
- subscription.created
- subscription.upgraded
- subscription.cancelled
- payment.succeeded
- payment.failed
- feature.used
- custom events

---

## Frontend Components

### Pages
- `/analytics/dashboard` - Main dashboard
- `/analytics/revenue` - Revenue metrics
- `/analytics/users` - User metrics
- `/analytics/features` - Feature usage
- `/analytics/events` - Event tracking
- `/analytics/reports` - Custom reports

### Components
- `Dashboard` - Dashboard layout
- `KPICard` - KPI display
- `RevenueChart` - Revenue chart
- `UserGrowthChart` - User growth chart
- `ReportBuilder` - Report builder
- `ExportButton` - Export functionality

---

## Data Retention

- Real-time events: 30 days
- Aggregated data: 2 years
- Reports: Indefinite
- Exports: 90 days

---

## Related Documentation
- [Billing Module](./M3_BILLING.md)
- [Compliance Module](./M8_COMPLIANCE.md)
- [Architecture Overview](../ARCHITECTURE.md)
