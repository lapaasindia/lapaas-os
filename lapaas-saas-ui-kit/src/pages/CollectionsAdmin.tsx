import React, { useState } from 'react';
import { Settings, Mail, MessageSquare, Zap, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';

export default function CollectionsAdmin() {
  const [activeTab, setActiveTab] = useState('policy');

  const [policy] = useState({
    credit_terms: 'Net 30',
    late_fee_percentage: 2,
    escalation_days: 30,
    dunning_ladder: [
      { day: 3, channel: 'email', template: 'friendly_reminder', status: 'active' },
      { day: 0, channel: 'whatsapp', template: 'payment_due', status: 'active' },
      { day: 7, channel: 'email', template: 'first_followup', status: 'active' },
      { day: 15, channel: 'whatsapp', template: 'urgent_reminder', status: 'active' }
    ]
  });

  const [templates] = useState([
    {
      id: '1',
      name: 'Friendly Reminder',
      channel: 'email',
      content: 'Hi {{customer_name}}, gentle reminder that invoice {{invoice_id}} for {{amount}} is due on {{due_date}}.',
      status: 'active'
    },
    {
      id: '2',
      name: 'Payment Due',
      channel: 'whatsapp',
      content: 'Payment due today for invoice {{invoice_id}}: {{amount}}. Please pay by {{due_date}}.',
      status: 'active'
    },
    {
      id: '3',
      name: 'First Follow-up',
      channel: 'email',
      content: 'Invoice {{invoice_id}} ({{amount}}) is now overdue. Please arrange payment immediately.',
      status: 'active'
    },
    {
      id: '4',
      name: 'Urgent Reminder',
      channel: 'whatsapp',
      content: 'URGENT: Invoice {{invoice_id}} is {{days_overdue}} days overdue. Amount: {{amount}}. Please pay now.',
      status: 'active'
    }
  ]);

  const [agent] = useState({
    enabled: true,
    schedule: 'daily',
    status: 'active',
    last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reminders_sent_today: 45,
    reminders_sent_this_month: 892
  });

  const [automations] = useState([
    {
      id: '1',
      name: 'Send Reminder on Day 3',
      trigger: 'invoice_due_3_days',
      action: 'send_reminder',
      template: 'friendly_reminder',
      channel: 'email',
      enabled: true,
      executions: 234
    },
    {
      id: '2',
      name: 'Send WhatsApp on Due Date',
      trigger: 'invoice_due_today',
      action: 'send_reminder',
      template: 'payment_due',
      channel: 'whatsapp',
      enabled: true,
      executions: 189
    },
    {
      id: '3',
      name: 'Escalate After 7 Days',
      trigger: 'invoice_overdue_7_days',
      action: 'escalate',
      template: 'first_followup',
      channel: 'email',
      enabled: true,
      executions: 45
    },
    {
      id: '4',
      name: 'Urgent Reminder After 15 Days',
      trigger: 'invoice_overdue_15_days',
      action: 'send_reminder',
      template: 'urgent_reminder',
      channel: 'whatsapp',
      enabled: true,
      executions: 12
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Collections Engine Admin</h1>
          <p className="text-gray-600 mt-2">Configure policies, templates, agent, and automations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'policy'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings size={20} className="inline mr-2" />
            Policy
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'templates'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail size={20} className="inline mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'agent'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap size={20} className="inline mr-2" />
            Agent
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`px-6 py-3 font-semibold border-b-2 transition ${
              activeTab === 'automations'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 size={20} className="inline mr-2" />
            Automations
          </button>
        </div>

        {/* Policy Tab */}
        {activeTab === 'policy' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Collections Policy</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Terms</label>
                <input
                  type="text"
                  value={policy.credit_terms}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Late Fee (%)</label>
                <input
                  type="number"
                  value={policy.late_fee_percentage}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  readOnly
                />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Dunning Ladder</h3>
            <div className="space-y-4">
              {policy.dunning_ladder.map((step, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Day {step.day}</p>
                      <p className="text-sm text-gray-600">
                        Send via {step.channel.toUpperCase()} - {step.template}
                      </p>
                    </div>
                    <CheckCircle className="text-green-500" size={24} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Collections Templates</h2>
            
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-600">
                        {template.channel === 'email' ? <Mail size={16} className="inline mr-1" /> : <MessageSquare size={16} className="inline mr-1" />}
                        {template.channel.toUpperCase()}
                      </p>
                    </div>
                    <CheckCircle className="text-green-500" size={24} />
                  </div>
                  <p className="text-gray-700 bg-white p-3 rounded border border-gray-200 text-sm">
                    {template.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Tab */}
        {activeTab === 'agent' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Collections Agent</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-3xl font-bold text-green-600">Active</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <p className="text-gray-600 text-sm">Reminders Today</p>
                <p className="text-3xl font-bold text-blue-600">{agent.reminders_sent_today}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <p className="text-gray-600 text-sm">This Month</p>
                <p className="text-3xl font-bold text-purple-600">{agent.reminders_sent_this_month}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Agent Configuration</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Enabled</span>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Schedule</span>
                  <span className="font-semibold text-gray-900">{agent.schedule}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Auto-send Reminders</span>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Escalation Enabled</span>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Automations Tab */}
        {activeTab === 'automations' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Collections Automations</h2>
            
            <div className="space-y-4">
              {automations.map((automation) => (
                <div key={automation.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{automation.name}</p>
                      <p className="text-sm text-gray-600">
                        Trigger: {automation.trigger} → Action: {automation.action}
                      </p>
                    </div>
                    {automation.enabled ? (
                      <CheckCircle className="text-green-500" size={24} />
                    ) : (
                      <AlertCircle className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {automation.channel.toUpperCase()} • {automation.template}
                    </span>
                    <span className="font-semibold text-gray-900">{automation.executions} executions</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
