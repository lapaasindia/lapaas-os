// Finance OS Database with Real Data
// In-memory database for Phase 2 with realistic data

const financeDatabase = {
  // ==================== PAYABLES DATA ====================
  bills: [
    {
      id: 'B-001',
      vendor_id: 'V-001',
      vendor_name: 'PrintCo',
      bill_number: 'INV-2025-001',
      bill_date: '2025-11-01',
      due_date: '2025-11-15',
      amount: 78000,
      status: 'approved',
      po_id: 'PO-221',
      grn_id: 'GRN-414',
      description: 'Printing services for Q4 2025',
      approval_state: 'approved',
      approver_id: 'user-001',
      approved_at: '2025-11-02',
      payment_status: 'pending',
      created_at: '2025-11-01'
    },
    {
      id: 'B-002',
      vendor_id: 'V-002',
      vendor_name: 'OfficeSupply Inc',
      bill_number: 'INV-2025-002',
      bill_date: '2025-11-05',
      due_date: '2025-11-20',
      amount: 45000,
      status: 'pending',
      po_id: 'PO-222',
      grn_id: 'GRN-415',
      description: 'Office supplies and stationery',
      approval_state: 'pending',
      approver_id: null,
      approved_at: null,
      payment_status: 'pending',
      created_at: '2025-11-05'
    },
    {
      id: 'B-003',
      vendor_id: 'V-003',
      vendor_name: 'CloudServices Ltd',
      bill_number: 'INV-2025-003',
      bill_date: '2025-10-25',
      due_date: '2025-11-10',
      amount: 120000,
      status: 'approved',
      po_id: 'PO-223',
      grn_id: 'GRN-416',
      description: 'Cloud hosting and SaaS subscriptions',
      approval_state: 'approved',
      approver_id: 'user-001',
      approved_at: '2025-10-26',
      payment_status: 'pending',
      created_at: '2025-10-25'
    },
    {
      id: 'B-004',
      vendor_id: 'V-004',
      vendor_name: 'Marketing Agency',
      bill_number: 'INV-2025-004',
      bill_date: '2025-11-03',
      due_date: '2025-11-25',
      amount: 55000,
      status: 'pending',
      po_id: 'PO-224',
      grn_id: 'GRN-417',
      description: 'Digital marketing campaign',
      approval_state: 'pending',
      approver_id: null,
      approved_at: null,
      payment_status: 'pending',
      created_at: '2025-11-03'
    },
    {
      id: 'B-005',
      vendor_id: 'V-005',
      vendor_name: 'Logistics Partner',
      bill_number: 'INV-2025-005',
      bill_date: '2025-11-02',
      due_date: '2025-11-12',
      amount: 32000,
      status: 'approved',
      po_id: 'PO-225',
      grn_id: 'GRN-418',
      description: 'Shipping and logistics services',
      approval_state: 'approved',
      approver_id: 'user-001',
      approved_at: '2025-11-02',
      payment_status: 'pending',
      created_at: '2025-11-02'
    }
  ],

  vendors: [
    {
      id: 'V-001',
      name: 'PrintCo',
      email: 'contact@printco.com',
      phone: '+91-9876543210',
      gst_number: '27AABCT1234H1Z0',
      pan_number: 'AABCT1234H',
      bank_account: '1234567890123456',
      ifsc_code: 'SBIN0001234',
      terms_days: 15,
      discount_rate: 2.5,
      happiness_score: 85,
      total_paid: 450000,
      payment_count: 12,
      last_payment_date: '2025-10-15',
      status: 'active'
    },
    {
      id: 'V-002',
      name: 'OfficeSupply Inc',
      email: 'sales@officesupply.com',
      phone: '+91-9876543211',
      gst_number: '27AABCU1234H1Z0',
      pan_number: 'AABCU1234H',
      bank_account: '2234567890123456',
      ifsc_code: 'HDFC0001234',
      terms_days: 30,
      discount_rate: 3.0,
      happiness_score: 78,
      total_paid: 280000,
      payment_count: 8,
      last_payment_date: '2025-10-20',
      status: 'active'
    },
    {
      id: 'V-003',
      name: 'CloudServices Ltd',
      email: 'billing@cloudservices.com',
      phone: '+91-9876543212',
      gst_number: '27AABCV1234H1Z0',
      pan_number: 'AABCV1234H',
      bank_account: '3234567890123456',
      ifsc_code: 'ICIC0001234',
      terms_days: 45,
      discount_rate: 5.0,
      happiness_score: 92,
      total_paid: 720000,
      payment_count: 6,
      last_payment_date: '2025-10-10',
      status: 'active'
    },
    {
      id: 'V-004',
      name: 'Marketing Agency',
      email: 'accounts@marketingagency.com',
      phone: '+91-9876543213',
      gst_number: '27AABCW1234H1Z0',
      pan_number: 'AABCW1234H',
      bank_account: '4234567890123456',
      ifsc_code: 'AXIS0001234',
      terms_days: 30,
      discount_rate: 2.0,
      happiness_score: 72,
      total_paid: 165000,
      payment_count: 3,
      last_payment_date: '2025-09-25',
      status: 'active'
    },
    {
      id: 'V-005',
      name: 'Logistics Partner',
      email: 'logistics@partner.com',
      phone: '+91-9876543214',
      gst_number: '27AABCX1234H1Z0',
      pan_number: 'AABCX1234H',
      bank_account: '5234567890123456',
      ifsc_code: 'BKID0001234',
      terms_days: 10,
      discount_rate: 1.5,
      happiness_score: 88,
      total_paid: 320000,
      payment_count: 10,
      last_payment_date: '2025-10-25',
      status: 'active'
    }
  ],

  pay_runs: [
    {
      id: 'PR-001',
      run_date: '2025-11-01',
      run_number: 'PR-2025-001',
      total_amount: 235000,
      bill_count: 3,
      status: 'completed',
      approver_id: 'user-001',
      approved_at: '2025-11-01',
      payment_date: '2025-11-01',
      bills: ['B-001', 'B-003', 'B-005'],
      created_at: '2025-11-01'
    },
    {
      id: 'PR-002',
      run_date: '2025-11-15',
      run_number: 'PR-2025-002',
      total_amount: 100000,
      bill_count: 2,
      status: 'pending',
      approver_id: null,
      approved_at: null,
      payment_date: null,
      bills: ['B-002', 'B-004'],
      created_at: '2025-11-08'
    }
  ],

  // ==================== COMPLIANCE DATA ====================
  compliance_items: [
    {
      id: 'GSTR-3B-OCT',
      org_id: 'org-001',
      type: 'GST',
      name: 'GSTR-3B (October 2025)',
      description: 'Monthly GST return',
      due_date: '2025-11-20',
      status: 'pending',
      owner_id: 'user-001',
      owner_name: 'Finance Admin',
      checklist: {
        reconcile_sales: true,
        reconcile_purchases: true,
        reconcile_itc: false,
        calculate_tax: false,
        pay_tax: false
      },
      documents: [],
      created_at: '2025-10-01',
      updated_at: '2025-11-08'
    },
    {
      id: 'TDS-Q2',
      org_id: 'org-001',
      type: 'TDS',
      name: 'TDS Quarterly Return (Q2 2025)',
      description: 'Tax Deducted at Source quarterly filing',
      due_date: '2025-12-07',
      status: 'pending',
      owner_id: 'user-001',
      owner_name: 'Finance Admin',
      checklist: {
        collect_forms: true,
        reconcile_payments: false,
        file_return: false,
        deposit_tax: false
      },
      documents: [],
      created_at: '2025-09-01',
      updated_at: '2025-11-08'
    },
    {
      id: 'EPF-NOV',
      org_id: 'org-001',
      type: 'EPF',
      name: 'EPF Monthly Return (November 2025)',
      description: 'Employee Provident Fund monthly filing',
      due_date: '2025-11-15',
      status: 'completed',
      owner_id: 'user-002',
      owner_name: 'HR Manager',
      checklist: {
        reconcile_employees: true,
        calculate_contributions: true,
        submit_return: true,
        confirm_receipt: true
      },
      documents: [
        {
          id: 'DOC-001',
          name: 'EPF_Receipt_Nov_2025.pdf',
          url: 'https://example.com/epf-receipt.pdf',
          uploaded_at: '2025-11-10',
          verified: true
        }
      ],
      created_at: '2025-11-01',
      updated_at: '2025-11-10'
    },
    {
      id: 'ESI-NOV',
      org_id: 'org-001',
      type: 'ESI',
      name: 'ESI Monthly Return (November 2025)',
      description: 'Employee State Insurance monthly filing',
      due_date: '2025-11-15',
      status: 'completed',
      owner_id: 'user-002',
      owner_name: 'HR Manager',
      checklist: {
        reconcile_employees: true,
        calculate_contributions: true,
        submit_return: true,
        confirm_receipt: true
      },
      documents: [
        {
          id: 'DOC-002',
          name: 'ESI_Receipt_Nov_2025.pdf',
          url: 'https://example.com/esi-receipt.pdf',
          uploaded_at: '2025-11-10',
          verified: true
        }
      ],
      created_at: '2025-11-01',
      updated_at: '2025-11-10'
    }
  ],

  // ==================== RESERVES & DEBT DATA ====================
  reserve_rules: [
    {
      id: 'RR-001',
      org_id: 'org-001',
      name: 'Taxes Holdback',
      description: 'Hold back 5% for tax obligations',
      percentage: 5,
      target_account: 'Tax Reserve',
      priority: 1,
      status: 'active',
      created_at: '2025-01-01'
    },
    {
      id: 'RR-002',
      org_id: 'org-001',
      name: 'Emergency Reserve',
      description: 'Build 10% emergency fund',
      percentage: 10,
      target_account: 'Emergency Fund',
      priority: 2,
      status: 'active',
      created_at: '2025-01-01'
    },
    {
      id: 'RR-003',
      org_id: 'org-001',
      name: 'Operations',
      description: 'Allocate 70% to operations',
      percentage: 70,
      target_account: 'Operations Account',
      priority: 3,
      status: 'active',
      created_at: '2025-01-01'
    },
    {
      id: 'RR-004',
      org_id: 'org-001',
      name: 'Owner Draw',
      description: 'Allocate 15% to owner',
      percentage: 15,
      target_account: 'Owner Account',
      priority: 4,
      status: 'active',
      created_at: '2025-01-01'
    }
  ],

  reserve_ledger: [
    {
      id: 'RL-001',
      org_id: 'org-001',
      date: '2025-11-08',
      inflow_amount: 500000,
      allocations: {
        'Tax Reserve': 25000,
        'Emergency Fund': 50000,
        'Operations Account': 350000,
        'Owner Account': 75000
      },
      balances: {
        'Tax Reserve': 125000,
        'Emergency Fund': 250000,
        'Operations Account': 1750000,
        'Owner Account': 375000
      },
      created_at: '2025-11-08'
    }
  ],

  debts: [
    {
      id: 'D-001',
      org_id: 'org-001',
      lender: 'Bank A',
      type: 'Term Loan',
      principal: 500000,
      rate: 10.5,
      emi: 15000,
      tenure_months: 36,
      due_day: 15,
      status: 'active',
      start_date: '2025-01-15',
      end_date: '2028-01-15',
      paid_amount: 45000,
      remaining_amount: 455000,
      covenants: {
        min_cash_balance: 500000,
        max_debt_to_equity: 2.0,
        min_interest_coverage: 2.5
      },
      created_at: '2025-01-15'
    },
    {
      id: 'D-002',
      org_id: 'org-001',
      lender: 'Bank B',
      type: 'Overdraft',
      principal: 200000,
      rate: 12.0,
      emi: 0,
      tenure_months: 12,
      due_day: 30,
      status: 'active',
      start_date: '2025-06-01',
      end_date: '2026-06-01',
      paid_amount: 0,
      remaining_amount: 200000,
      covenants: {
        max_utilization: 200000,
        interest_payment_frequency: 'monthly'
      },
      created_at: '2025-06-01'
    }
  ],

  // ==================== CONTROLS DATA ====================
  bank_reconciliations: [
    {
      id: 'BR-001',
      org_id: 'org-001',
      account: 'Main Account',
      account_number: '1234567890',
      statement_from: '2025-11-01',
      statement_to: '2025-11-07',
      bank_balance: 1250000,
      book_balance: 1250000,
      status: 'completed',
      reconciled_by: 'user-001',
      reconciled_at: '2025-11-08',
      exceptions: 0,
      created_at: '2025-11-08'
    },
    {
      id: 'BR-002',
      org_id: 'org-001',
      account: 'Savings Account',
      account_number: '0987654321',
      statement_from: '2025-11-01',
      statement_to: '2025-11-07',
      bank_balance: 500000,
      book_balance: 495000,
      status: 'pending',
      reconciled_by: null,
      reconciled_at: null,
      exceptions: 2,
      exception_details: [
        { type: 'timing_difference', amount: 5000, description: 'Check not cleared' }
      ],
      created_at: '2025-11-08'
    }
  ],

  control_exceptions: [
    {
      id: 'CE-001',
      org_id: 'org-001',
      type: 'duplicate_payment',
      title: 'Duplicate payment detected',
      description: 'Bill B-001 appears to have been paid twice',
      severity: 'critical',
      ref_id: 'B-001',
      ref_type: 'bill',
      status: 'open',
      created_at: '2025-11-07',
      resolved_at: null,
      resolved_by: null,
      resolution_notes: null
    },
    {
      id: 'CE-002',
      org_id: 'org-001',
      type: 'mismatch',
      title: '3-way match failed',
      description: 'PO amount ₹100K, GRN ₹98K, Bill ₹102K',
      severity: 'high',
      ref_id: 'B-002',
      ref_type: 'bill',
      status: 'open',
      created_at: '2025-11-06',
      resolved_at: null,
      resolved_by: null,
      resolution_notes: null
    },
    {
      id: 'CE-003',
      org_id: 'org-001',
      type: 'limit_breach',
      title: 'Vendor credit limit exceeded',
      severity: 'medium',
      description: 'Vendor V-001 credit limit ₹200K, outstanding ₹210K',
      ref_id: 'V-001',
      ref_type: 'vendor',
      status: 'open',
      created_at: '2025-11-05',
      resolved_at: null,
      resolved_by: null,
      resolution_notes: null
    }
  ]
};

module.exports = financeDatabase;
