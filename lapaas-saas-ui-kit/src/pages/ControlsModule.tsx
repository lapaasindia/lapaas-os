import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Lock } from 'lucide-react';

interface BankRec {
  id: string;
  account: string;
  statement_from: string;
  statement_to: string;
  bank_balance: number;
  book_balance: number;
  status: string;
  exceptions: number;
}

interface ControlException {
  id: string;
  type: string;
  title: string;
  severity: string;
  ref_id: string;
  status: string;
  created_at: string;
}

export default function ControlsModule() {
  const [bankRecs, setBankRecs] = useState<BankRec[]>([]);
  const [exceptions, setExceptions] = useState<ControlException[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reconciliation');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recsRes, exceptionsRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/finance/controls/bank-recs'),
        fetch('http://localhost:3000/api/v1/finance/controls/exceptions')
      ]);

      if (recsRes.ok) setBankRecs((await recsRes.json()).data);
      if (exceptionsRes.ok) setExceptions((await exceptionsRes.json()).data);
    } catch (error) {
      console.error('Error fetching controls data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveException = async (exceptionId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/finance/controls/exceptions/${exceptionId}/resolve`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolved_by: 'user-001', resolution_notes: 'Resolved' })
        }
      );
      if (response.ok) {
        alert('Exception resolved!');
        fetchData();
      }
    } catch (error) {
      console.error('Error resolving exception:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-l-4 border-red-500';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-l-4 border-orange-500';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-l-4 border-yellow-500';
      default:
        return 'bg-blue-500/20 text-blue-400 border-l-4 border-blue-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="text-red-400" size={20} />;
      case 'high':
        return <AlertCircle className="text-orange-400" size={20} />;
      default:
        return <AlertCircle className="text-yellow-400" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Controls...</div>
      </div>
    );
  }

  const completedRecs = bankRecs.filter(r => r.status === 'completed').length;
  const openExceptions = exceptions.filter(e => e.status === 'open').length;
  const criticalExceptions = exceptions.filter(e => e.severity === 'critical').length;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Controls & Reconciliation</h1>
          <p className="text-gray-400">Bank reconciliation, 3-way match, and exception management</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Bank Accounts</p>
            <p className="text-3xl font-bold text-white mt-2">{bankRecs.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Reconciled</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{completedRecs}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Open Exceptions</p>
            <p className="text-3xl font-bold text-orange-400 mt-2">{openExceptions}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Critical</p>
            <p className="text-3xl font-bold text-red-400 mt-2">{criticalExceptions}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['reconciliation', 'exceptions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab === 'reconciliation' ? 'Bank Reconciliation' : 'Exceptions'}
            </button>
          ))}
        </div>

        {/* Bank Reconciliation Tab */}
        {activeTab === 'reconciliation' && (
          <div className="space-y-4">
            {bankRecs.map(rec => (
              <div key={rec.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{rec.account}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(rec.statement_from).toLocaleDateString()} to{' '}
                      {new Date(rec.statement_to).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {rec.status === 'completed' ? (
                      <CheckCircle className="text-green-400" size={24} />
                    ) : (
                      <AlertCircle className="text-yellow-400" size={24} />
                    )}
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      rec.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {rec.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Bank Balance</p>
                    <p className="text-2xl font-bold text-white mt-2">₹{(rec.bank_balance / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Book Balance</p>
                    <p className="text-2xl font-bold text-white mt-2">₹{(rec.book_balance / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Difference</p>
                    <p className={`text-2xl font-bold mt-2 ${
                      rec.bank_balance === rec.book_balance ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ₹{Math.abs((rec.bank_balance - rec.book_balance) / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                {rec.exceptions > 0 && (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                    <p className="text-sm text-yellow-300">{rec.exceptions} exceptions to resolve</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Exceptions Tab */}
        {activeTab === 'exceptions' && (
          <div className="space-y-4">
            {exceptions.map(exception => (
              <div key={exception.id} className={`p-6 rounded-lg ${getSeverityColor(exception.severity)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(exception.severity)}
                    <div>
                      <h3 className="font-bold">{exception.title}</h3>
                      <p className="text-sm opacity-80 mt-1">{exception.type}</p>
                      <p className="text-xs opacity-60 mt-1">Ref: {exception.ref_id}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    exception.status === 'open'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {exception.status.toUpperCase()}
                  </span>
                </div>

                {exception.status === 'open' && (
                  <button
                    onClick={() => handleResolveException(exception.id)}
                    className="mt-4 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded font-semibold transition"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 3-Way Match Info */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lock size={24} className="text-blue-400" />
            3-Way Match Process
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="font-semibold text-white mb-2">1. Purchase Order</p>
              <p className="text-sm text-gray-400">Verify PO amount and terms</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="font-semibold text-white mb-2">2. Goods Receipt Note</p>
              <p className="text-sm text-gray-400">Confirm GRN quantity and amount</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="font-semibold text-white mb-2">3. Vendor Bill</p>
              <p className="text-sm text-gray-400">Match bill with PO & GRN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
