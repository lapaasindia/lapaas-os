# Finance OS Phase 4 - Advanced Invoicing, Payments, AR/AP, Compliance & Accounting

**Date:** November 8, 2025  
**Status:** Planning Phase  
**Estimated Duration:** 8-10 weeks  
**Priority:** CRITICAL for MVP

---

## ✅ TESTING RESULTS - Finance OS Current State

### All Modules Working ✅
- ✅ Finance Home Dashboard - Real data, key metrics, today's actions, exceptions
- ✅ 13-Week Cashflow Board - 13 weeks forecast, scenarios, inflows/outflows breakdown
- ✅ Collections Dashboard - Outstanding tracking, aging, top customers, Add Invoice button
- ✅ Payables Management - Bills, vendors, pay runs with approval workflow
- ✅ Compliance Management - GST, TDS, EPF checklists with progress tracking
- ✅ Reserves & Debt - Allocation rules, reserve ledger, debt tracking
- ✅ Controls & Reconciliation - Bank reconciliation, 3-way match, exceptions

### Backend Status ✅
- ✅ 50+ API endpoints
- ✅ Real data with 50+ records
- ✅ All modules returning correct data
- ✅ Navigation working smoothly

### Frontend Status ✅
- ✅ 8 pages fully functional
- ✅ Navigation bar working
- ✅ Real-time data display
- ✅ User actions (Add, Approve, Send, etc.)

---

## 📋 PHASE 4 REQUIREMENTS BREAKDOWN

### A. INVOICING & RECEIPTS (Native)

#### 1. Tax-Ready Invoices
**Features:**
- [ ] Series/numbering (INV-2025-001, etc.)
- [ ] HSN/SAC codes for line items
- [ ] CGST/SGST/IGST tax calculation
- [ ] Reverse charge mechanism
- [ ] Place of supply (INTRA/INTER state)
- [ ] Bilingual notes (English/Hindi)
- [ ] Invoice templates (Standard, GST, E-Invoice ready)

**Data Model:**
```
invoices {
  id, org_id, customer_id, invoice_number, series
  issue_date, due_date, status (Draft/Issued/Part-paid/Paid/Overdue/Disputed/Written-off)
  subtotal, cgst, sgst, igst, total, currency
  reverse_charge, place_of_supply
  notes_en, notes_hi
  approval_status, approved_by, approved_at
}

invoice_items {
  id, invoice_id, description, hsn_sac, qty, rate
  cgst_rate, sgst_rate, igst_rate, amount
}
```

#### 2. Invoice Lifecycles
**Workflow:**
- Draft → Issued → Part-paid → Paid → Overdue → Disputed → Written-off
- Approval workflow (Maker-Checker)
- Status transitions with audit trail
- Overdue calculation (T+0, T+7, T+15, T+30, T+60)

**Features:**
- [ ] Draft editing
- [ ] Issue with approval
- [ ] Part-payment tracking
- [ ] Overdue auto-flagging
- [ ] Dispute workflow
- [ ] Write-off with reason

#### 3. Credit/Debit Notes
**Features:**
- [ ] Link to original invoice
- [ ] Adjust AR (Accounts Receivable)
- [ ] Adjust tax ledgers
- [ ] Approval workflow
- [ ] PDF generation
- [ ] Ledger posting

**Data Model:**
```
credit_notes {
  id, org_id, invoice_id, note_number
  issue_date, reason, amount
  cgst, sgst, igst, total
  status, approved_by, approved_at
}
```

#### 4. Advance Receipts & Adjustments
**Features:**
- [ ] Track advance receipts
- [ ] Auto-apply to invoices
- [ ] Partial application
- [ ] Reversal if needed
- [ ] Ledger posting

**Data Model:**
```
advance_receipts {
  id, org_id, customer_id, amount, currency
  receipt_date, applied_to_invoices[]
  status (Unapplied/Partial/Applied)
}
```

#### 5. PDF Builder
**Features:**
- [ ] Multiple themes (Standard, Premium, Minimal)
- [ ] Company stamp/logo placement
- [ ] QR code (for e-Invoice)
- [ ] Terms & conditions
- [ ] Late fee clauses
- [ ] Signature area
- [ ] Bilingual captions

#### 6. Statement of Accounts
**Features:**
- [ ] Per customer
- [ ] Aging analysis
- [ ] All documents (invoices, credits, receipts)
- [ ] Payment history
- [ ] Outstanding summary

---

### B. PAYMENTS (Phase-0 without PSP)

#### 1. UPI Offline Flow
**Features:**
- [ ] Generate dynamic UPI QR code
- [ ] Generate static VPA (Virtual Payment Address)
- [ ] Display in invoice/portal
- [ ] Client pays from any UPI app
- [ ] Client uploads UTR (Unique Transaction Reference)
- [ ] Manual reconciliation from bank CSV

**Data Model:**
```
upi_requests {
  id, invoice_id, amount, currency
  qr_code_url, vpa, dynamic_link
  status (Generated/Paid/Expired)
  utr_uploaded, utr, payment_date
}
```

#### 2. NEFT/RTGS Flow
**Features:**
- [ ] Auto-generate virtual reference (INV-2025-001)
- [ ] Display bank details with reference
- [ ] Client uploads UTR
- [ ] Match from bank CSV
- [ ] Auto-receipt creation

**Data Model:**
```
bank_transfer_requests {
  id, invoice_id, amount, currency
  bank_account_id, virtual_reference
  status (Generated/Paid/Matched)
  utr_uploaded, utr, payment_date
}
```

#### 3. Receipting Rules
**Features:**
- [ ] Idempotent receipt creation (no duplicates)
- [ ] Partial receipts
- [ ] Auto-close invoice when fully matched
- [ ] Ledger posting
- [ ] Receipt PDF generation

**Data Model:**
```
receipts {
  id, org_id, invoice_id, amount, currency
  receipt_date, receipt_number
  payment_method (UPI/NEFT/RTGS/Cash/Cheque)
  utr, bank_reference
  status (Draft/Issued/Reconciled)
}
```

---

### C. AR COLLECTIONS (Native Comms)

#### 1. Dunning Ladder
**Timeline:**
- T-7: Reminder (friendly)
- T-3: Reminder (gentle)
- T0: Due date
- T+7: First follow-up (firm)
- T+15: Second follow-up (urgent)
- T+30: Legal notice (requires approval)

**Channels:**
- [ ] Platform email
- [ ] In-app notifications
- [ ] SMS (optional later)

**Features:**
- [ ] Customizable templates
- [ ] Tone control (Friendly/Firm/Legal)
- [ ] Auto-send or manual approval
- [ ] Delivery tracking
- [ ] Response capture

#### 2. Promise-to-Pay Tracker
**Features:**
- [ ] Record promised payment date & amount
- [ ] Track owner/contact
- [ ] Auto-remind before date
- [ ] Mark kept/missed
- [ ] Impact on dunning ladder
- [ ] Trend analysis

**Data Model:**
```
promise_to_pay {
  id, invoice_id, customer_id
  promised_date, promised_amount
  owner_name, contact_info
  status (Pending/Kept/Missed)
  created_at, updated_at
}
```

#### 3. Disputes
**Features:**
- [ ] Pause dunning ladder
- [ ] Reason codes (Quality/Billing/Delivery/Other)
- [ ] SLA tracking (e.g., resolve within 7 days)
- [ ] Attach evidence
- [ ] Re-age invoice after close
- [ ] Audit trail

**Data Model:**
```
disputes {
  id, invoice_id, customer_id
  reason_code, description
  evidence_urls[]
  status (Open/In-Review/Resolved/Closed)
  sla_due_date, resolved_date
  resolution_notes
}
```

---

### D. AP & PAY RUNS (No Bank API)

#### 1. PO → GRN → Bill (3-Way Match)
**Features:**
- [ ] Link PO to GRN
- [ ] Link GRN to Bill
- [ ] Tolerance rules (e.g., ±2% amount, ±5% qty)
- [ ] Exception queue for mismatches
- [ ] Auto-match when within tolerance
- [ ] Manual override with approval

**Data Model:**
```
pos {
  id, org_id, vendor_id, po_number
  issue_date, delivery_date
  line_items[] (description, qty, rate, amount)
  total, status (Draft/Issued/Partial-GRN/Complete)
}

grns {
  id, org_id, po_id, grn_number
  receipt_date, line_items[] (po_line_id, qty_received, amount)
  total, status
}

bills {
  id, org_id, vendor_id, bill_number
  bill_date, due_date
  po_id, grn_id (for matching)
  line_items[] (description, qty, rate, amount, hsn_sac)
  cgst, sgst, igst, total
  status (Draft/Received/Matched/Approved/Paid)
}

three_way_matches {
  id, po_id, grn_id, bill_id
  status (Matched/Mismatch/Exception)
  variance_qty, variance_amount, variance_reason
  tolerance_exceeded, exception_type
}
```

#### 2. Maker-Checker Approval
**Features:**
- [ ] Approval matrix by vendor/amount
- [ ] Role-based (Maker/Checker)
- [ ] Audit trail
- [ ] Rejection with reason
- [ ] Resubmit workflow

#### 3. Pay Runs (1st & 15th)
**Features:**
- [ ] Schedule pay runs (1st, 15th of month)
- [ ] Select bills to pay
- [ ] Generate bank batch file (CSV)
- [ ] Printable checklist
- [ ] After payment, upload bank debit CSV
- [ ] Auto-mark bills "Paid"

**Data Model:**
```
pay_runs {
  id, org_id, pay_run_number
  scheduled_date, created_date
  status (Draft/Generated/Submitted/Paid)
  pay_run_lines[] (bill_id, amount, vendor_id)
  total_amount, currency
  bank_batch_file_url
  bank_debit_csv_uploaded, uploaded_at
}
```

#### 4. TDS Certificates
**Features:**
- [ ] Auto-generate from payouts
- [ ] PDF generation
- [ ] Vendor download from portal
- [ ] Compliance tracking

---

### E. 13-WEEK CASHFLOW (Self-driven)

#### 1. Source of Truth
**Data Sources:**
- [ ] Invoices (AR inflows)
- [ ] Receipts (actual collections)
- [ ] Bills (AP outflows)
- [ ] Pay runs (actual payments)
- [ ] Recurring expenses (from settings)
- [ ] Payroll (from HR module - future)

#### 2. Scenarios
**Features:**
- [ ] Tight collections (75% collection rate)
- [ ] Base case (85% collection rate)
- [ ] Loose collections (95% collection rate)
- [ ] CapEx deferrals
- [ ] Owner draws
- [ ] Show runway impact

#### 3. Variance Notes
**Features:**
- [ ] Manual notes (user-entered)
- [ ] AI explanation using internal data only
- [ ] Week-over-week variance
- [ ] Reason codes

---

### F. COMPLIANCE (India-first) without APIs

#### 1. GST & e-Invoice
**Features:**
- [ ] GSTR-1 builder (outward supplies)
- [ ] GSTR-3B builder (monthly return)
- [ ] Export JSON/CSV exactly as portal needs
- [ ] User uploads to portal manually
- [ ] User uploads challan/ack to Evidence Vault
- [ ] e-Invoice/e-Way Bill payload JSON builder
- [ ] QR placeholder for IRN
- [ ] User runs on portal, pastes IRN/QR back
- [ ] System validates fields and locks invoice

**Data Model:**
```
gst_returns {
  id, org_id, return_type (GSTR-1/GSTR-3B)
  period (month/year)
  status (Draft/Prepared/Submitted/Acknowledged)
  json_payload, csv_export
  challan_uploaded, ack_uploaded
  evidence_urls[]
}
```

#### 2. ITC Vendor Check (Basic)
**Features:**
- [ ] Track vendor GSTIN
- [ ] Filing status field (manual)
- [ ] Flag if missing bills
- [ ] ITC eligibility check

#### 3. TDS, EPF/ESI, ROC
**Features:**
- [ ] TDS checklist & calculator
- [ ] EPF/ESI checklist & calculator
- [ ] ROC filing checklist
- [ ] Challan cover sheet generation
- [ ] Manual portal filing
- [ ] Upload proof → turn dashboard green

---

### G. ACCOUNTING-LITE → DOUBLE-ENTRY

#### Phase-0 (Go-live)
**Features:**
- [ ] Cashbook
- [ ] AR ledger (Accounts Receivable)
- [ ] AP ledger (Accounts Payable)
- [ ] Tax ledgers (CGST, SGST, IGST, TDS)
- [ ] Starter Chart of Accounts (COA)

**COA Starter (SMB India):**
```
Sales (4000-4999)
  - Product Sales (4100)
  - Service Revenue (4200)
  - Other Income (4300)

COGS (5000-5999)
  - Cost of Goods (5100)
  - Subcontracting (5200)

Expenses (6000-6999)
  - Salaries (6100)
  - Rent (6200)
  - Utilities (6300)
  - Travel (6400)
  - Supplies (6500)

Bank (1000-1099)
  - Main Account (1010)
  - Savings Account (1020)

AR (1100-1199)
  - Customers (1100)

AP (2000-2099)
  - Vendors (2000)

Taxes (2100-2199)
  - CGST Payable (2110)
  - SGST Payable (2120)
  - IGST Payable (2130)
  - TDS Payable (2140)
```

#### Phase-1 (Upgrade)
**Features:**
- [ ] General Ledger
- [ ] Journal vouchers
- [ ] Period close
- [ ] Trial Balance
- [ ] P&L (Profit & Loss)
- [ ] Balance Sheet

---

### H. CLIENT & VENDOR PORTALS (Built-in)

#### Client Portal
**Features:**
- [ ] View/download invoices
- [ ] Upload UTR for payment
- [ ] Raise dispute
- [ ] Download receipts
- [ ] Download statement of accounts
- [ ] NPS survey after payment

#### Vendor Portal
**Features:**
- [ ] Upload bills
- [ ] See approval status
- [ ] Scheduled pay-run date
- [ ] Download TDS certificates
- [ ] Submit quality notes

---

### I. COMMUNICATIONS (Built-in)

#### Platform Emailer
**Features:**
- [ ] Per-org sender domain (SPF/DKIM)
- [ ] Email templates
- [ ] Reply capture to ticket/dispute
- [ ] Delivery tracking
- [ ] Bounce handling

#### In-app Notifications
**Features:**
- [ ] For clients/vendors (portal bell)
- [ ] Email fallback
- [ ] Read/unread tracking

#### Legal Last-Notice
**Features:**
- [ ] Requires owner approval
- [ ] Stamped PDF generation
- [ ] Delivery tracking

---

### J. CONTROLS, AUDIT, SECURITY

#### Controls
**Features:**
- [ ] Maker-Checker for bills, credit notes, write-offs
- [ ] 3-Way Match with tolerances
- [ ] Period Locks (month close)
- [ ] Role-based unlock with audit reason
- [ ] Duplicate detection (same bill no./amount/vendor)
- [ ] Round-figure & weekend-dated flags

#### Audit
**Features:**
- [ ] Immutable logs (every posting/change)
- [ ] Before/after values
- [ ] Export for auditors
- [ ] Evidence Vault (all challans/acks/agreements)
- [ ] OCR filename/fields

#### Security
**Features:**
- [ ] 2FA mandatory for Finance roles
- [ ] Field-level masking (PAN, GSTIN, bank details)
- [ ] Data residency (India)
- [ ] Daily backups
- [ ] 30–90 day retention

---

### K. AI (Works Offline)

#### Collections Copilot
- [ ] Draft reminder with tone control
- [ ] Suggest next step
- [ ] Predict pay probability from history

#### Cashflow Copilot
- [ ] Propose scenario deltas
- [ ] List weeks at risk with reasons

#### AP Optimizer
- [ ] Suggest bills for pay run
- [ ] Maximize vendor trust
- [ ] Maintain runway

#### Compliance Guide
- [ ] Human-readable steps for GSTR-1/3B
- [ ] Checklist verification

#### Controls Sentinel
- [ ] Flag duplicate bills
- [ ] Unusual amounts
- [ ] Back-dated entries

---

## 📊 IMPLEMENTATION PLAN

### Week 1-2: Invoicing & Receipts (Backend)
**Tasks:**
- [ ] Create invoice schema & endpoints
- [ ] Create receipt schema & endpoints
- [ ] Create credit/debit note endpoints
- [ ] Create advance receipt endpoints
- [ ] Implement tax calculation
- [ ] Implement invoice lifecycle
- [ ] Create 20+ API endpoints

**Deliverables:**
- ✅ Backend: Invoicing module
- ✅ Real data: 20+ invoices
- ✅ API: Full CRUD + lifecycle

### Week 3: Invoicing & Receipts (Frontend)
**Tasks:**
- [ ] Create Invoice List page
- [ ] Create Invoice Create/Edit form
- [ ] Create Invoice View page
- [ ] Create Receipt List page
- [ ] Create Credit Note form
- [ ] PDF preview

**Deliverables:**
- ✅ Frontend: 5 pages
- ✅ User actions: Create, Edit, View, Receipt

### Week 4: Payments (Backend)
**Tasks:**
- [ ] Create UPI request schema
- [ ] Create NEFT/RTGS request schema
- [ ] Create receipt matching logic
- [ ] Create bank CSV import endpoints
- [ ] Implement idempotent receipt creation

**Deliverables:**
- ✅ Backend: Payments module
- ✅ API: 10+ endpoints

### Week 5: Payments (Frontend)
**Tasks:**
- [ ] Create Payment Request page
- [ ] Create UPI QR display
- [ ] Create UTR upload form
- [ ] Create Bank CSV import
- [ ] Create Receipt matching UI

**Deliverables:**
- ✅ Frontend: 4 pages
- ✅ User actions: Generate QR, Upload UTR, Match

### Week 6: AR Collections (Backend)
**Tasks:**
- [ ] Create dunning schedule schema
- [ ] Create promise-to-pay schema
- [ ] Create dispute schema
- [ ] Create dunning email templates
- [ ] Implement dunning ladder logic

**Deliverables:**
- ✅ Backend: Collections module
- ✅ API: 15+ endpoints

### Week 7: AR Collections (Frontend)
**Tasks:**
- [ ] Create Dunning Dashboard
- [ ] Create Promise-to-Pay Tracker
- [ ] Create Dispute Management
- [ ] Create Email Template Builder
- [ ] Create Dunning History

**Deliverables:**
- ✅ Frontend: 5 pages
- ✅ User actions: Send Reminder, Track Promise, Raise Dispute

### Week 8: AP & Pay Runs (Backend)
**Tasks:**
- [ ] Create PO schema
- [ ] Create GRN schema
- [ ] Create Bill schema
- [ ] Create 3-way match logic
- [ ] Create pay run schema
- [ ] Create bank batch file generator

**Deliverables:**
- ✅ Backend: AP module
- ✅ API: 20+ endpoints

### Week 9: AP & Pay Runs (Frontend)
**Tasks:**
- [ ] Create PO Management
- [ ] Create GRN Management
- [ ] Create Bill Management
- [ ] Create 3-Way Match Dashboard
- [ ] Create Pay Run Generator
- [ ] Create Bank CSV Upload

**Deliverables:**
- ✅ Frontend: 6 pages
- ✅ User actions: Create PO, Receive GRN, Approve Bill, Generate Pay Run

### Week 10: Compliance & Accounting (Backend)
**Tasks:**
- [ ] Create GST return schema
- [ ] Create Chart of Accounts
- [ ] Create General Ledger
- [ ] Create compliance checklist schema
- [ ] Create audit log schema

**Deliverables:**
- ✅ Backend: Compliance & Accounting modules
- ✅ API: 20+ endpoints

---

## 🎯 INTEGRATION WITH EXISTING FINANCE OS

### Current Finance OS Modules
1. Finance Home Dashboard
2. 13-Week Cashflow Board
3. Collections Dashboard
4. Payables Management
5. Compliance Management
6. Reserves & Debt
7. Controls & Reconciliation

### New Modules to Add
1. **Invoicing & Receipts** (New)
2. **Payments** (New)
3. **AR Collections** (Enhance existing Collections)
4. **AP & Pay Runs** (Enhance existing Payables)
5. **Compliance** (Enhance existing Compliance)
6. **Accounting** (New)
7. **Client Portal** (New)
8. **Vendor Portal** (New)

### Navigation Updates
```
Finance OS
├── Dashboard (existing)
├── Cashflow (existing)
├── Collections
│   ├── Collections Dashboard (existing)
│   ├── Invoices (NEW)
│   ├── Receipts (NEW)
│   ├── Dunning (NEW)
│   └── Disputes (NEW)
├── Payables
│   ├── Bills (existing)
│   ├── Vendors (existing)
│   ├── Pay Runs (existing)
│   ├── PO Management (NEW)
│   └── GRN Management (NEW)
├── Compliance
│   ├── Checklists (existing)
│   ├── GST Returns (NEW)
│   ├── TDS/EPF (existing)
│   └── Evidence Vault (NEW)
├── Accounting (NEW)
│   ├── Chart of Accounts
│   ├── General Ledger
│   ├── Trial Balance
│   ├── P&L
│   └── Balance Sheet
├── Reserves (existing)
└── Controls (existing)
```

---

## 📈 DELIVERY TIMELINE

### MVP (30 days)
**Week 1-2:** Invoicing & Receipts (Backend + Frontend)
**Week 3:** Payments (Backend + Frontend)
**Week 4:** AR Collections (Backend + Frontend)

**Go/No-Go Criteria:**
- ✅ Create invoice → collect via UPI/NEFT (UTR) → reconcile from bank CSV
- ✅ Receipt/ledger post → 13-week updates
- ✅ Dunning ladder working
- ✅ Promise-to-Pay tracking

### Pro (60 days)
**Week 5-6:** AP & Pay Runs (Backend + Frontend)
**Week 7:** Compliance & Accounting (Backend)
**Week 8:** Client & Vendor Portals

**Features:**
- ✅ 3-way match
- ✅ Pay run generation
- ✅ Bank CSV upload
- ✅ TDS certificates
- ✅ GST returns
- ✅ Portal access

### Scale (90 days)
**Week 9-10:** Advanced Features
- ✅ Trial Balance/P&L/Balance Sheet
- ✅ e-Invoice/e-Way Bill builders
- ✅ GST JSON exports
- ✅ Controls Sentinel
- ✅ Multi-entity (basic)
- ✅ Statements library

---

## ✅ ACCEPTANCE TARGETS

- [ ] Current% ≥ 75% in 45 days for pilot users (from zero tools)
- [ ] DSO ↓ ≥ 15% within 60 days
- [ ] On-time pay ≥ 95% with only two pay runs/month
- [ ] 100% filings with proof for 2 months
- [ ] Bank rec by T+3 on latest month
- [ ] Zero duplicate bills detected
- [ ] 3-way match tolerance < 2%

---

## 🚀 NEXT STEPS

1. **Approve Phase 4 Plan** ✓
2. **Start Week 1: Invoicing Backend**
   - Create invoice schema
   - Create API endpoints
   - Load real data
3. **Create Frontend pages** (Week 2-3)
4. **Test end-to-end workflows**
5. **Integrate with existing Finance OS**

---

**Status:** Ready to implement  
**Timeline:** 10 weeks for full Phase 4  
**Priority:** CRITICAL for MVP  
**Next Review:** End of Week 1
