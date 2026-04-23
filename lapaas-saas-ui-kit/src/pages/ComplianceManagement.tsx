import React, { useState, useEffect } from 'react';
import { Edit2, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface GSTReturn {
  id: string;
  quarter: string;
  year: number;
  return_type: string;
  status: string;
  total_taxable_value: number;
  total_tax: number;
  filing_date: string | null;
  due_date: string;
}

interface TDSRecord {
  id: string;
  tds_type: string;
  deductee_name: string;
  amount: number;
  tds_amount: number;
  status: string;
  deduction_date: string;
}

interface Notice {
  id: string;
  notice_type: string;
  notice_number: string;
  subject: string;
  status: string;
  priority: string;
  due_date: string;
  issued_date: string;
}

const ComplianceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gst' | 'tds' | 'epf' | 'roc' | 'notices'>('gst');
  const [gstReturns, setGstReturns] = useState<GSTReturn[]>([]);
  const [tdsRecords, setTdsRecords] = useState<TDSRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gstRes, tdsRes, noticesRes, summaryRes] = await Promise.all([
        fetch('/api/v1/gst-returns?org_id=org-001'),
        fetch('/api/v1/tds-records?org_id=org-001'),
        fetch('/api/v1/notices?org_id=org-001'),
        fetch('/api/v1/compliance/summary?org_id=org-001')
      ]);

      if (gstRes.ok) setGstReturns(await gstRes.json().then(r => r.data));
      if (tdsRes.ok) setTdsRecords(await tdsRes.json().then(r => r.data));
      if (noticesRes.ok) setNotices(await noticesRes.json().then(r => r.data));
      if (summaryRes.ok) setSummary(await summaryRes.json().then(r => r.data));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'filed': 'bg-green-900 text-green-200',
      'draft': 'bg-gray-700 text-gray-200',
      'ready': 'bg-blue-900 text-blue-200',
      'deposited': 'bg-green-900 text-green-200',
      'pending': 'bg-orange-900 text-orange-200',
      'submitted': 'bg-green-900 text-green-200',
      'open': 'bg-red-900 text-red-200',
      'resolved': 'bg-green-900 text-green-200'
    };
    return colors[status] || 'bg-gray-700 text-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'critical': 'bg-red-900 text-red-200',
      'high': 'bg-orange-900 text-orange-200',
      'medium': 'bg-yellow-900 text-yellow-200',
      'low': 'bg-blue-900 text-blue-200'
    };
    return colors[priority] || 'bg-gray-700 text-gray-200';
  };

  const filteredGST = gstReturns.filter(g =>
    g.return_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTDS = tdsRecords.filter(t =>
    t.deductee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotices = notices.filter(n =>
    n.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.notice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Compliance Management</h1>
          <p className="text-gray-400">Manage GST, TDS, EPF/ESI, ROC/MCA filings and notices</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">GST Returns</p>
              <p className="text-3xl font-bold text-white">{summary.gst_returns_filed}</p>
              <p className="text-gray-500 text-xs mt-2">Pending: {summary.gst_returns_pending}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">TDS Deposited</p>
              <p className="text-3xl font-bold text-green-400">{summary.tds_deposited}</p>
              <p className="text-gray-500 text-xs mt-2">Pending: {summary.tds_pending}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">ROC/MCA Filings</p>
              <p className="text-3xl font-bold text-white">{summary.roc_mca_filed}</p>
              <p className="text-gray-500 text-xs mt-2">Pending: {summary.roc_mca_pending}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Open Notices</p>
              <p className="text-3xl font-bold text-red-400">{summary.open_notices}</p>
              <p className="text-gray-500 text-xs mt-2">Critical: {summary.critical_notices}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700 overflow-x-auto">
          {(['gst', 'tds', 'epf', 'roc', 'notices'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'gst' && 'GST Returns'}
              {tab === 'tds' && 'TDS Records'}
              {tab === 'epf' && 'EPF/ESI'}
              {tab === 'roc' && 'ROC/MCA'}
              {tab === 'notices' && 'Notices'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* GST Returns Tab */}
        {activeTab === 'gst' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Return Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Quarter</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Taxable Value</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Tax</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredGST.map(gst => (
                  <tr key={gst.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">{gst.return_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{gst.quarter} {gst.year}</td>
                    <td className="px-6 py-4 text-sm text-white">₹{(gst.total_taxable_value / 100000).toFixed(1)}L</td>
                    <td className="px-6 py-4 text-sm text-white">₹{(gst.total_tax / 100000).toFixed(1)}L</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{gst.due_date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(gst.status)}`}>
                        {gst.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TDS Records Tab */}
        {activeTab === 'tds' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TDS Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Deductee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TDS Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredTDS.map(tds => (
                  <tr key={tds.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">{tds.tds_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{tds.deductee_name}</td>
                    <td className="px-6 py-4 text-sm text-white">₹{(tds.amount / 100000).toFixed(1)}L</td>
                    <td className="px-6 py-4 text-sm text-orange-400">₹{(tds.tds_amount / 100000).toFixed(2)}L</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{tds.deduction_date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tds.status)}`}>
                        {tds.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EPF/ESI Tab */}
        {activeTab === 'epf' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">EPF/ESI records will be displayed here</p>
          </div>
        )}

        {/* ROC/MCA Tab */}
        {activeTab === 'roc' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">ROC/MCA filings will be displayed here</p>
          </div>
        )}

        {/* Notices Tab */}
        {activeTab === 'notices' && (
          <div className="space-y-4">
            {filteredNotices.map(notice => (
              <div key={notice.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {notice.status === 'open' && <AlertCircle className="text-red-400" size={20} />}
                      {notice.status === 'resolved' && <CheckCircle className="text-green-400" size={20} />}
                      {notice.status === 'in_progress' && <Clock className="text-yellow-400" size={20} />}
                      <h3 className="text-lg font-semibold text-white">{notice.subject}</h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{notice.notice_type} - {notice.notice_number}</p>
                    <div className="flex gap-4 text-sm">
                      <span className={`px-3 py-1 rounded-full ${getStatusColor(notice.status)}`}>
                        {notice.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                      <span className="text-gray-400">Due: {notice.due_date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 transition-colors">
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceManagement;
