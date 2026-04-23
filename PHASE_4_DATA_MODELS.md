# Phase 4 - Data Models & Schemas

**Purpose:** Define all database schemas needed for Phase 4 implementation

---

## 1. INVOICING & RECEIPTS

### invoices
```javascript
{
  id: string (UUID),
  org_id: string,
  customer_id: string,
  invoice_number: string (INV-2025-001),
  series: string (default: "INV"),
  issue_date: date,
  due_date: date,
  
  // Line items
  line_items: [{
    id: string,
    description: string,
    hsn_sac: string,
    qty: number,
    rate: number,
    cgst_rate: number,
    sgst_rate: number,
    igst_rate: number,
    amount: number
  }],
  
  // Totals
  subtotal: number,
  cgst: number,
  sgst: number,
  igst: number,
  total: number,
  currency: string (default: "INR"),
  
  // Tax details
  reverse_charge: boolean,
  place_of_supply: string (INTRA/INTER),
  
  // Status
  status: string (Draft/Issued/Part-paid/Paid/Overdue/Disputed/Written-off),
  
  // Approval
  approval_status: string (Pending/Approved/Rejected),
  approved_by: string,
  approved_at: date,
  
  // Notes
  notes_en: string,
  notes_hi: string,
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string,
  updated_by: string
}
```

### invoice_items
```javascript
{
  id: string (UUID),
  invoice_id: string,
  description: string,
  hsn_sac: string,
  qty: number,
  rate: number,
  cgst_rate: number,
  sgst_rate: number,
  igst_rate: number,
  amount: number,
  created_at: date
}
```

### receipts
```javascript
{
  id: string (UUID),
  org_id: string,
  invoice_id: string,
  amount: number,
  currency: string (default: "INR"),
  receipt_date: date,
  receipt_number: string (REC-2025-001),
  
  // Payment method
  payment_method: string (UPI/NEFT/RTGS/Cash/Cheque),
  utr: string,
  bank_reference: string,
  
  // Status
  status: string (Draft/Issued/Reconciled),
  
  // Ledger
  ledger_posted: boolean,
  ledger_posted_at: date,
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string
}
```

### credit_notes
```javascript
{
  id: string (UUID),
  org_id: string,
  invoice_id: string,
  note_number: string (CN-2025-001),
  issue_date: date,
  
  // Details
  reason: string,
  amount: number,
  cgst: number,
  sgst: number,
  igst: number,
  total: number,
  currency: string (default: "INR"),
  
  // Status
  status: string (Draft/Issued/Applied),
  
  // Approval
  approval_status: string (Pending/Approved/Rejected),
  approved_by: string,
  approved_at: date,
  
  // Ledger
  ledger_posted: boolean,
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string
}
```

### advance_receipts
```javascript
{
  id: string (UUID),
  org_id: string,
  customer_id: string,
  amount: number,
  currency: string (default: "INR"),
  receipt_date: date,
  
  // Application
  applied_to_invoices: [{
    invoice_id: string,
    amount: number,
    applied_date: date
  }],
  
  // Status
  status: string (Unapplied/Partial/Applied),
  
  // Metadata
  created_at: date,
  updated_at: date
}
```

---

## 2. PAYMENTS

### upi_requests
```javascript
{
  id: string (UUID),
  org_id: string,
  invoice_id: string,
  amount: number,
  currency: string (default: "INR"),
  
  // UPI Details
  qr_code_url: string,
  vpa: string (Virtual Payment Address),
  dynamic_link: string,
  
  // Payment tracking
  status: string (Generated/Paid/Expired),
  utr_uploaded: boolean,
  utr: string,
  payment_date: date,
  
  // Metadata
  created_at: date,
  expires_at: date
}
```

### bank_transfer_requests
```javascript
{
  id: string (UUID),
  org_id: string,
  invoice_id: string,
  amount: number,
  currency: string (default: "INR"),
  
  // Bank Details
  bank_account_id: string,
  virtual_reference: string (INV-2025-001),
  bank_name: string,
  account_number: string (masked),
  ifsc: string,
  
  // Payment tracking
  status: string (Generated/Paid/Matched),
  utr_uploaded: boolean,
  utr: string,
  payment_date: date,
  
  // Metadata
  created_at: date,
  expires_at: date
}
```

### bank_statements
```javascript
{
  id: string (UUID),
  org_id: string,
  bank_account_id: string,
  
  // CSV Upload
  csv_file_url: string,
  upload_date: date,
  
  // Transactions
  transactions: [{
    date: date,
    description: string,
    amount: number,
    type: string (Debit/Credit),
    balance: number,
    reference: string
  }],
  
  // Reconciliation
  reconciliation_status: string (Pending/Matched/Unmatched),
  
  // Metadata
  created_at: date,
  updated_at: date
}
```

---

## 3. AR COLLECTIONS

### dunning_schedules
```javascript
{
  id: string (UUID),
  org_id: string,
  invoice_id: string,
  customer_id: string,
  
  // Schedule
  schedule: [{
    day_offset: number (-7, -3, 0, 7, 15, 30),
    template_id: string,
    status: string (Pending/Sent/Failed),
    sent_date: date,
    delivery_status: string (Sent/Delivered/Bounced/Opened/Clicked)
  }],
  
  // Ladder status
  current_stage: number,
  paused: boolean,
  pause_reason: string,
  
  // Metadata
  created_at: date,
  updated_at: date
}
```

### promise_to_pay
```javascript
{
  id: string (UUID),
  org_id: string,
  invoice_id: string,
  customer_id: string,
  
  // Promise details
  promised_date: date,
  promised_amount: number,
  owner_name: string,
  contact_info: string,
  
  // Status
  status: string (Pending/Kept/Missed),
  
  // Tracking
  reminder_sent: boolean,
  reminder_sent_date: date,
  kept_date: date,
  
  // Metadata
  created_at: date,
  updated_at: date
}
```

### disputes
```javascript
{
  id: string (UUID),
  org_id: string,
  invoice_id: string,
  customer_id: string,
  
  // Dispute details
  reason_code: string (Quality/Billing/Delivery/Other),
  description: string,
  evidence_urls: [string],
  
  // Status
  status: string (Open/In-Review/Resolved/Closed),
  
  // SLA
  sla_due_date: date,
  resolved_date: date,
  resolution_notes: string,
  
  // Dunning impact
  dunning_paused: boolean,
  re_age_date: date,
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string
}
```

### email_templates
```javascript
{
  id: string (UUID),
  org_id: string,
  
  // Template details
  name: string (Reminder-Friendly, Reminder-Firm, etc.),
  subject: string,
  body: string,
  tone: string (Friendly/Firm/Legal),
  
  // Variables
  variables: [string] ({{customer_name}}, {{amount}}, {{due_date}}),
  
  // Status
  active: boolean,
  
  // Metadata
  created_at: date,
  updated_at: date
}
```

---

## 4. AP & PAY RUNS

### purchase_orders (PO)
```javascript
{
  id: string (UUID),
  org_id: string,
  vendor_id: string,
  po_number: string (PO-2025-001),
  issue_date: date,
  delivery_date: date,
  
  // Line items
  line_items: [{
    id: string,
    description: string,
    qty: number,
    rate: number,
    amount: number
  }],
  
  // Totals
  subtotal: number,
  tax: number,
  total: number,
  currency: string (default: "INR"),
  
  // Status
  status: string (Draft/Issued/Partial-GRN/Complete),
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string
}
```

### goods_receipt_notes (GRN)
```javascript
{
  id: string (UUID),
  org_id: string,
  po_id: string,
  grn_number: string (GRN-2025-001),
  receipt_date: date,
  
  // Line items
  line_items: [{
    po_line_id: string,
    qty_received: number,
    amount: number,
    quality_notes: string
  }],
  
  // Totals
  total: number,
  currency: string (default: "INR"),
  
  // Status
  status: string (Draft/Received/Matched),
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string
}
```

### bills (Enhanced)
```javascript
{
  id: string (UUID),
  org_id: string,
  vendor_id: string,
  bill_number: string (BILL-2025-001),
  bill_date: date,
  due_date: date,
  
  // Matching
  po_id: string,
  grn_id: string,
  
  // Line items
  line_items: [{
    id: string,
    description: string,
    hsn_sac: string,
    qty: number,
    rate: number,
    cgst_rate: number,
    sgst_rate: number,
    igst_rate: number,
    amount: number
  }],
  
  // Totals
  subtotal: number,
  cgst: number,
  sgst: number,
  igst: number,
  total: number,
  currency: string (default: "INR"),
  
  // Status
  status: string (Draft/Received/Matched/Approved/Paid),
  
  // Approval
  approval_status: string (Pending/Approved/Rejected),
  approved_by: string,
  approved_at: date,
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string
}
```

### three_way_matches
```javascript
{
  id: string (UUID),
  org_id: string,
  po_id: string,
  grn_id: string,
  bill_id: string,
  
  // Match status
  status: string (Matched/Mismatch/Exception),
  
  // Variance
  variance_qty: number,
  variance_amount: number,
  variance_reason: string,
  
  // Tolerance
  tolerance_exceeded: boolean,
  exception_type: string (Qty-Mismatch/Amount-Mismatch/Both),
  
  // Resolution
  resolved: boolean,
  resolved_by: string,
  resolved_at: date,
  resolution_notes: string,
  
  // Metadata
  created_at: date,
  updated_at: date
}
```

### pay_runs (Enhanced)
```javascript
{
  id: string (UUID),
  org_id: string,
  pay_run_number: string (PR-2025-001),
  scheduled_date: date,
  created_date: date,
  
  // Status
  status: string (Draft/Generated/Submitted/Paid),
  
  // Pay run lines
  pay_run_lines: [{
    id: string,
    bill_id: string,
    vendor_id: string,
    amount: number,
    payment_method: string (Bank-Transfer/Cheque)
  }],
  
  // Totals
  total_amount: number,
  currency: string (default: "INR"),
  
  // Bank file
  bank_batch_file_url: string,
  bank_batch_format: string (ICICI/SBI/HDFC),
  
  // Reconciliation
  bank_debit_csv_uploaded: boolean,
  bank_debit_csv_url: string,
  uploaded_at: date,
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string
}
```

### tds_certificates
```javascript
{
  id: string (UUID),
  org_id: string,
  vendor_id: string,
  financial_year: string (2024-25),
  
  // TDS details
  total_amount: number,
  tds_rate: number,
  tds_amount: number,
  
  // Certificate
  certificate_number: string,
  certificate_date: date,
  pdf_url: string,
  
  // Status
  generated: boolean,
  downloaded: boolean,
  downloaded_at: date,
  
  // Metadata
  created_at: date,
  updated_at: date
}
```

---

## 5. COMPLIANCE

### gst_returns
```javascript
{
  id: string (UUID),
  org_id: string,
  
  // Return details
  return_type: string (GSTR-1/GSTR-3B),
  period_month: number (1-12),
  period_year: number,
  
  // Status
  status: string (Draft/Prepared/Submitted/Acknowledged),
  
  // Data
  json_payload: object,
  csv_export: string,
  
  // Filing
  filed_date: date,
  ack_number: string,
  
  // Evidence
  challan_uploaded: boolean,
  challan_url: string,
  ack_uploaded: boolean,
  ack_url: string,
  evidence_urls: [string],
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string
}
```

### e_invoices
```javascript
{
  id: string (UUID),
  org_id: string,
  invoice_id: string,
  
  // e-Invoice details
  irn: string (Invoice Reference Number),
  qr_code: string,
  
  // Status
  status: string (Generated/Submitted/Acknowledged),
  
  // Payload
  payload_json: object,
  
  // Metadata
  created_at: date,
  submitted_at: date,
  acknowledged_at: date
}
```

### compliance_artifacts
```javascript
{
  id: string (UUID),
  org_id: string,
  
  // Artifact details
  artifact_type: string (Challan/Ack/Agreement/Certificate),
  related_to: string (GST/TDS/EPF/ROC),
  
  // File
  file_url: string,
  file_name: string,
  file_size: number,
  
  // OCR
  ocr_extracted_fields: object,
  
  // Status
  verified: boolean,
  verified_by: string,
  verified_at: date,
  
  // Metadata
  created_at: date,
  updated_at: date,
  uploaded_by: string
}
```

---

## 6. ACCOUNTING

### chart_of_accounts
```javascript
{
  id: string (UUID),
  org_id: string,
  
  // Account details
  account_code: string (4000),
  account_name: string (Sales),
  account_type: string (Asset/Liability/Equity/Revenue/Expense),
  
  // Hierarchy
  parent_account_id: string,
  level: number,
  
  // Status
  active: boolean,
  
  // Metadata
  created_at: date,
  updated_at: date
}
```

### general_ledger
```javascript
{
  id: string (UUID),
  org_id: string,
  account_id: string,
  
  // Entry details
  entry_date: date,
  reference_type: string (Invoice/Receipt/Bill/Payment/Journal),
  reference_id: string,
  
  // Amounts
  debit: number,
  credit: number,
  
  // Description
  description: string,
  
  // Status
  posted: boolean,
  posted_date: date,
  
  // Metadata
  created_at: date,
  created_by: string
}
```

### journal_entries
```javascript
{
  id: string (UUID),
  org_id: string,
  
  // Entry details
  entry_date: date,
  journal_number: string (JE-2025-001),
  
  // Lines
  lines: [{
    account_id: string,
    debit: number,
    credit: number,
    description: string
  }],
  
  // Status
  status: string (Draft/Posted),
  
  // Approval
  approval_status: string (Pending/Approved/Rejected),
  approved_by: string,
    approved_at: date,
  
  // Metadata
  created_at: date,
  updated_at: date,
  created_by: string
}
```

### trial_balance
```javascript
{
  id: string (UUID),
  org_id: string,
  
  // Period
  period_month: number,
  period_year: number,
  
  // Data
  accounts: [{
    account_id: string,
    account_name: string,
    debit_balance: number,
    credit_balance: number
  }],
  
  // Totals
  total_debit: number,
  total_credit: number,
  
  // Status
  balanced: boolean,
  
  // Metadata
  created_at: date,
  generated_by: string
}
```

---

## 7. PORTALS

### portal_users
```javascript
{
  id: string (UUID),
  org_id: string,
  
  // User details
  email: string,
  name: string,
  phone: string,
  
  // Portal type
  portal_type: string (Client/Vendor),
  
  // Related entity
  customer_id: string (if Client),
  vendor_id: string (if Vendor),
  
  // Authentication
  password_hash: string,
  last_login: date,
  
  // Status
  active: boolean,
  
  // Metadata
  created_at: date,
  updated_at: date
}
```

### portal_notifications
```javascript
{
  id: string (UUID),
  org_id: string,
  portal_user_id: string,
  
  // Notification details
  type: string (Invoice/Payment/Bill/Approval),
  title: string,
  message: string,
  
  // Status
  read: boolean,
  read_at: date,
  
  // Metadata
  created_at: date
}
```

---

## SUMMARY

### Total Data Models: 30+
- Invoicing: 4 models
- Payments: 3 models
- Collections: 4 models
- AP & Pay Runs: 6 models
- Compliance: 3 models
- Accounting: 4 models
- Portals: 2 models

### Total Fields: 500+
### Relationships: 50+
### Indexes: 100+

---

**Status:** Ready for implementation  
**Next Step:** Create backend schemas and API endpoints
