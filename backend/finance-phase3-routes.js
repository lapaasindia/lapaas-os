// Finance OS Phase 3 Routes - Automation & AI
// Includes: Dunning Automation, Pay Run Automation, Compliance Reminders, AI Copilots

module.exports = (app) => {
  // ==================== DUNNING AUTOMATION ====================

  app.get('/api/v1/finance/automation/dunning-schedule', (req, res) => {
    try {
      const schedule = [
        {
          id: 'DS-001',
          invoice_id: 'INV-001',
          customer: 'Acme Corp',
          amount: 50000,
          days_overdue: 5,
          next_action: 'friendly_reminder',
          next_action_date: '2025-11-10',
          channel: 'email',
          status: 'scheduled'
        },
        {
          id: 'DS-002',
          invoice_id: 'INV-003',
          customer: 'TechVision Ltd',
          amount: 75000,
          days_overdue: 45,
          next_action: 'firm_reminder',
          next_action_date: '2025-11-09',
          channel: 'whatsapp',
          status: 'scheduled'
        },
        {
          id: 'DS-003',
          invoice_id: 'INV-004',
          customer: 'Global Solutions',
          amount: 120000,
          days_overdue: 25,
          next_action: 'escalation',
          next_action_date: '2025-11-12',
          channel: 'phone_call',
          status: 'pending'
        }
      ];
      res.json({ success: true, data: schedule });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/automation/dunning-execute', (req, res) => {
    try {
      const { dunning_id, action } = req.body;
      const result = {
        id: dunning_id,
        action,
        executed_at: new Date().toISOString(),
        status: 'success',
        message: `${action} executed successfully`,
        next_followup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PAY RUN AUTOMATION ====================

  app.get('/api/v1/finance/automation/payrun-suggestions', (req, res) => {
    try {
      const suggestions = [
        {
          id: 'PS-001',
          run_date: '2025-11-15',
          bills: ['B-002', 'B-004'],
          total_amount: 100000,
          early_pay_discount: 3000,
          discount_percentage: 3,
          reason: 'Early payment discount available',
          priority: 'high'
        },
        {
          id: 'PS-002',
          run_date: '2025-11-01',
          bills: ['B-001', 'B-003', 'B-005'],
          total_amount: 230000,
          early_pay_discount: 0,
          discount_percentage: 0,
          reason: 'Regular scheduled payment',
          priority: 'medium'
        }
      ];
      res.json({ success: true, data: suggestions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/automation/payrun-create', (req, res) => {
    try {
      const { run_date, bills, apply_discount } = req.body;
      const total = bills.reduce((sum, b) => sum + (Math.random() * 100000), 0);
      const discount = apply_discount ? total * 0.03 : 0;
      
      const payRun = {
        id: `PR-AUTO-${Date.now()}`,
        run_date,
        bills,
        total_amount: total,
        discount_applied: discount,
        final_amount: total - discount,
        status: 'created',
        created_at: new Date().toISOString()
      };
      res.status(201).json({ success: true, data: payRun });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== COMPLIANCE AUTOMATION ====================

  app.get('/api/v1/finance/automation/compliance-reminders', (req, res) => {
    try {
      const reminders = [
        {
          id: 'CR-001',
          compliance_id: 'GSTR-3B-OCT',
          type: 'GST',
          name: 'GSTR-3B (October 2025)',
          due_date: '2025-11-20',
          days_until_due: 12,
          urgency: 'medium',
          reminder_type: 'email',
          owner: 'Finance Admin',
          status: 'pending'
        },
        {
          id: 'CR-002',
          compliance_id: 'TDS-Q2',
          type: 'TDS',
          name: 'TDS Quarterly Return',
          due_date: '2025-12-07',
          days_until_due: 29,
          urgency: 'low',
          reminder_type: 'calendar',
          owner: 'Finance Admin',
          status: 'pending'
        }
      ];
      res.json({ success: true, data: reminders });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/automation/compliance-send-reminder', (req, res) => {
    try {
      const { compliance_id, channel } = req.body;
      const result = {
        id: `REMIND-${Date.now()}`,
        compliance_id,
        channel,
        sent_at: new Date().toISOString(),
        status: 'sent',
        message: `Reminder sent via ${channel}`
      };
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== AI COPILOTS ====================

  app.post('/api/v1/finance/ai/cashflow-forecast', (req, res) => {
    try {
      const { historical_data, scenario } = req.body;
      const forecast = {
        scenario: scenario || 'base',
        weeks: [],
        insights: [
          'Cash flow shows seasonal pattern with peaks in Q4',
          'Recommend increasing reserves by 15% in next quarter',
          'Risk: Week 8 shows potential cash dip below ₹500K threshold'
        ],
        recommendations: [
          'Accelerate collections for Q4 invoices',
          'Negotiate extended payment terms with top 3 vendors',
          'Consider short-term credit facility as backup'
        ]
      };

      for (let i = 1; i <= 13; i++) {
        forecast.weeks.push({
          week: i,
          inflow: 200000 + Math.random() * 100000,
          outflow: 300000 + Math.random() * 100000,
          confidence: 0.85 - (i * 0.02)
        });
      }

      res.json({ success: true, data: forecast });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/ai/collections-copilot', (req, res) => {
    try {
      const { invoice_id, customer_history } = req.body;
      const suggestions = {
        invoice_id,
        recommended_tone: 'firm',
        suggested_message: 'Dear Customer, This is a reminder that invoice INV-001 for ₹50,000 is now 5 days overdue. Please arrange payment at your earliest convenience.',
        call_script: 'Hi [Customer], I\'m calling regarding invoice INV-001. When can we expect payment?',
        payment_probability: 0.72,
        best_contact_time: '10:00 AM - 12:00 PM',
        suggested_channel: 'whatsapp',
        escalation_recommended: false
      };
      res.json({ success: true, data: suggestions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/ai/dispute-assistant', (req, res) => {
    try {
      const { dispute_id, description } = req.body;
      const analysis = {
        dispute_id,
        reason_code: 'quality_issue',
        confidence: 0.85,
        suggested_resolution: 'Offer 10% credit note',
        proof_requirements: [
          'Quality report from customer',
          'Delivery receipt with damage notes',
          'Photographic evidence'
        ],
        resolution_template: 'We apologize for the quality issue. We are issuing a credit note for 10% of the invoice amount.',
        estimated_resolution_time: '3-5 business days'
      };
      res.json({ success: true, data: analysis });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/ai/payables-optimizer', (req, res) => {
    try {
      const { bills, cash_position } = req.body;
      const optimization = {
        early_pay_opportunities: [
          { bill_id: 'B-001', discount: 3000, discount_rate: 2.5, roi: '45% annualized' },
          { bill_id: 'B-003', discount: 5000, discount_rate: 2.0, roi: '36% annualized' }
        ],
        payment_sequence: ['B-001', 'B-003', 'B-005', 'B-002', 'B-004'],
        rationale: 'Sequence maximizes vendor happiness while maintaining minimum cash balance',
        total_savings: 8000,
        cash_impact: -8000,
        vendor_trust_impact: '+12%'
      };
      res.json({ success: true, data: optimization });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/ai/anomaly-detection', (req, res) => {
    try {
      const anomalies = [
        {
          id: 'ANOM-001',
          type: 'duplicate_payment',
          severity: 'critical',
          description: 'Bill B-001 appears to have been paid twice',
          amount: 78000,
          detected_at: new Date().toISOString(),
          recommended_action: 'Initiate reversal process'
        },
        {
          id: 'ANOM-002',
          type: 'unusual_vendor',
          severity: 'high',
          description: 'New vendor with large payment request',
          amount: 250000,
          detected_at: new Date().toISOString(),
          recommended_action: 'Verify vendor details and PAN'
        },
        {
          id: 'ANOM-003',
          type: 'amount_spike',
          severity: 'medium',
          description: 'Invoice amount 40% higher than historical average',
          amount: 140000,
          detected_at: new Date().toISOString(),
          recommended_action: 'Review invoice details with vendor'
        }
      ];
      res.json({ success: true, data: anomalies });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== VARIANCE ANALYSIS ====================

  app.get('/api/v1/finance/ai/variance-analysis', (req, res) => {
    try {
      const analysis = {
        period: 'Week 1-4 Nov 2025',
        planned_cashflow: 1500000,
        actual_cashflow: 1350000,
        variance: -150000,
        variance_percentage: -10,
        variance_reasons: [
          {
            factor: 'Collections Slippage',
            impact: -100000,
            percentage: 67,
            explanation: '2 invoices delayed by 1 week'
          },
          {
            factor: 'Unexpected Expense',
            impact: -50000,
            percentage: 33,
            explanation: 'Emergency equipment repair'
          }
        ],
        corrective_actions: [
          'Accelerate collection calls for delayed invoices',
          'Reduce discretionary spending by 15%',
          'Consider short-term credit facility'
        ],
        forecast_impact: 'Runway reduced from 13 weeks to 12 weeks',
        confidence_level: 0.88
      };
      res.json({ success: true, data: analysis });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== COMPLIANCE GUIDE ====================

  app.get('/api/v1/finance/ai/compliance-guide/:type', (req, res) => {
    try {
      const { type } = req.params;
      const guides = {
        'GSTR-3B': {
          title: 'GSTR-3B Filing Guide',
          steps: [
            'Reconcile sales from GSTR-1',
            'Reconcile purchases from GSTR-2A',
            'Calculate ITC eligibility',
            'Calculate tax liability',
            'Make tax payment',
            'File return on GST portal'
          ],
          forms_required: ['GSTR-1', 'GSTR-2A', 'Bank statement'],
          timeline: '20 days from month end',
          penalties: '₹100 per day if late'
        },
        'TDS': {
          title: 'TDS Quarterly Return Guide',
          steps: [
            'Collect TDS certificates from vendors',
            'Reconcile with payment records',
            'File quarterly return',
            'Deposit TDS amount',
            'Upload challan'
          ],
          forms_required: ['TDS certificates', 'Challan', 'Bank statement'],
          timeline: '7 days from quarter end',
          penalties: '₹200 per day if late'
        }
      };
      
      const guide = guides[type] || guides['GSTR-3B'];
      res.json({ success: true, data: guide });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
