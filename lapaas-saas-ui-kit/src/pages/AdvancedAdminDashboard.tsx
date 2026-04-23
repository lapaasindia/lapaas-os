import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, Package, Zap, CreditCard, Download, Settings, FileText, Lock } from 'lucide-react';

export default function AdvancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const metrics = {
    organizations: { total: 24, active: 22, growth: 3 },
    users: { total: 156, active: 142, growth: 18 },
    revenue: { monthly: 125400, growth: 15, arr: 1504800 },
    subscriptions: { total: 18, free: 4, starter: 6, pro: 7, scale: 1 },
    modules: { active: 8, adoption: 78 },
    ai_credits: { used: 52500, total: 150000, usage: 35 }
  };

  const reports = [
    { id: 1, name: 'Organization Report', type: 'organizations', generated: '2025-11-08', rows: 24 },
    { id: 2, name: 'Module Adoption Report', type: 'modules', generated: '2025-11-08', rows: 10 },
    { id: 3, name: 'AI Usage Report', type: 'ai-usage', generated: '2025-11-08', rows: 52 },
    { id: 4, name: 'Revenue Report', type: 'revenue', generated: '2025-11-08', rows: 18 }
  ];

  const auditLogs = [
    { id: 1, timestamp: '2 hours ago', actor: 'admin@lapaas.com', action: 'create_organization', resource: 'org-024', status: 'success' },
    { id: 2, timestamp: '3 hours ago', actor: 'admin@lapaas.com', action: 'assign_module', resource: 'finance-os', status: 'success' },
    { id: 3, timestamp: '4 hours ago', actor: 'admin@lapaas.com', action: 'allocate_credits', resource: 'org-024', status: 'success' },
    { id: 4, timestamp: '5 hours ago', actor: 'admin@lapaas.com', action: 'create_subscription', resource: 'sub-024', status: 'success' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Advanced Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Dashboard, Reports, Settings, and Audit Logs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'audit', label: 'Audit Logs', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className="inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Organizations</p>
                    <p className="text-4xl font-bold text-gray-900">{metrics.organizations.total}</p>
                    <p className="text-green-600 text-sm mt-1">+{metrics.organizations.growth} this month</p>
                  </div>
                  <Users className="text-blue-500" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-4xl font-bold text-gray-900">{metrics.users.total}</p>
                    <p className="text-green-600 text-sm mt-1">+{metrics.users.growth} this month</p>
                  </div>
                  <Users className="text-green-500" size={40} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Monthly Revenue</p>
                    <p className="text-4xl font-bold text-gray-900">₹{(metrics.revenue.monthly / 1000).toFixed(0)}K</p>
                    <p className="text-green-600 text-sm mt-1">+{metrics.revenue.growth}% growth</p>
                  </div>
                  <TrendingUp className="text-green-500" size={40} />
                </div>
              </div>
            </div>

            {/* Revenue & Subscriptions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Annual Revenue</h3>
                <p className="text-4xl font-bold text-gray-900">₹{(metrics.revenue.arr / 100000).toFixed(1)}L</p>
                <p className="text-gray-600 text-sm mt-2">Based on current MRR</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Subscription Distribution</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pro</span>
                    <span className="font-semibold">{metrics.subscriptions.pro} (39%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Starter</span>
                    <span className="font-semibold">{metrics.subscriptions.starter} (33%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Free</span>
                    <span className="font-semibold">{metrics.subscriptions.free} (22%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Scale</span>
                    <span className="font-semibold">{metrics.subscriptions.scale} (6%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Credits & Modules */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI Credits Usage</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Used</span>
                    <span className="font-semibold">{metrics.ai_credits.usage}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3">
                    <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${metrics.ai_credits.usage}%` }} />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {metrics.ai_credits.used.toLocaleString()} / {metrics.ai_credits.total.toLocaleString()} credits
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Module Adoption</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Modules</span>
                    <span className="font-semibold">{metrics.modules.active} / 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adoption Rate</span>
                    <span className="font-semibold">{metrics.modules.adoption}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Reports</h2>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{report.name}</p>
                    <p className="text-sm text-gray-600">Generated: {report.generated} • {report.rows} rows</p>
                  </div>
                  <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition">
                    <Download size={18} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Settings</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">General Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Platform Name</label>
                    <input type="text" value="Lapaas OS" className="w-full px-4 py-2 border border-gray-300 rounded-lg" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Support Email</label>
                    <input type="email" value="support@lapaas.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Timezone</label>
                    <input type="text" value="Asia/Kolkata" className="w-full px-4 py-2 border border-gray-300 rounded-lg" readOnly />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Security Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Two-Factor Authentication</span>
                    <input type="checkbox" checked readOnly className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Session Timeout (minutes)</span>
                    <input type="number" value={30} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" readOnly />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Data Retention</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Audit Logs Retention (days)</span>
                    <input type="number" value={90} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" readOnly />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Backup Retention (days)</span>
                    <input type="number" value={365} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" readOnly />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Audit Logs</h2>
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-sm text-gray-600">By: {log.actor} • {log.timestamp}</p>
                    <p className="text-sm text-gray-600">Resource: {log.resource}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {log.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
