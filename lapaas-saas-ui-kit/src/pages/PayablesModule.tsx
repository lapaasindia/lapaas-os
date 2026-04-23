import { useState, useEffect } from 'react';
import { Check, Eye } from 'lucide-react';

interface Bill {
  id: string;
  vendor_name: string;
  amount: number;
  due_date: string;
  status: string;
  approval_state: string;
  po_id: string;
  grn_id: string;
}

interface Vendor {
  id: string;
  name: string;
  happiness_score: number;
  total_paid: number;
  payment_count: number;
  terms_days: number;
}

interface PayRun {
  id: string;
  run_date: string;
  total_amount: number;
  bill_count: number;
  status: string;
}

export default function PayablesModule() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [payRuns, setPayRuns] = useState<PayRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bills');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, vendorsRes, payRunsRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/finance/payables/bills'),
        fetch('http://localhost:3000/api/v1/finance/payables/vendors'),
        fetch('http://localhost:3000/api/v1/finance/payables/pay-runs')
      ]);

      if (billsRes.ok) setBills((await billsRes.json()).data);
      if (vendorsRes.ok) setVendors((await vendorsRes.json()).data);
      if (payRunsRes.ok) setPayRuns((await payRunsRes.json()).data);
    } catch (error) {
      console.error('Error fetching payables data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBill = async (billId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/finance/payables/bills/${billId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approver_id: 'user-001' })
      });
      if (response.ok) {
        alert('Bill approved!');
        fetchData();
      }
    } catch (error) {
      console.error('Error approving bill:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getHappinessColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Payables...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Payables Management</h1>
          <p className="text-gray-400">Manage bills, vendors, and payment runs</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Bills</p>
            <p className="text-3xl font-bold text-white mt-2">{bills.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Vendors</p>
            <p className="text-3xl font-bold text-white mt-2">{vendors.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Pending Bills</p>
            <p className="text-3xl font-bold text-orange-400 mt-2">
              {bills.filter(b => b.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Outstanding</p>
            <p className="text-3xl font-bold text-red-400 mt-2">
              ₹{(bills.reduce((sum, b) => sum + b.amount, 0) / 100000).toFixed(1)}L
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['bills', 'vendors', 'payRuns'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab === 'bills' ? 'Bills' : tab === 'vendors' ? 'Vendors' : 'Pay Runs'}
            </button>
          ))}
        </div>

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Bill ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Vendor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Due Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">PO/GRN</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {bills.map(bill => (
                    <tr key={bill.id} className="hover:bg-gray-700 transition">
                      <td className="px-6 py-4 text-white font-semibold">{bill.id}</td>
                      <td className="px-6 py-4 text-gray-300">{bill.vendor_name}</td>
                      <td className="px-6 py-4 text-white font-semibold">₹{(bill.amount / 1000).toFixed(0)}K</td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(bill.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bill.status)}`}>
                          {bill.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {bill.po_id} / {bill.grn_id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {bill.status === 'pending' && (
                            <button
                              onClick={() => handleApproveBill(bill.id)}
                              className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition"
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendors.map(vendor => (
              <div key={vendor.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{vendor.name}</h3>
                    <p className="text-sm text-gray-400">Terms: {vendor.terms_days} days</p>
                  </div>
                  <div className={`text-2xl font-bold ${getHappinessColor(vendor.happiness_score)}`}>
                    {vendor.happiness_score}%
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Paid</span>
                    <span className="text-white font-semibold">₹{(vendor.total_paid / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Count</span>
                    <span className="text-white font-semibold">{vendor.payment_count}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-700">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          vendor.happiness_score >= 85
                            ? 'bg-green-500'
                            : vendor.happiness_score >= 75
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${vendor.happiness_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pay Runs Tab */}
        {activeTab === 'payRuns' && (
          <div className="space-y-4">
            {payRuns.map(payRun => (
              <div key={payRun.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{payRun.id}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(payRun.run_date).toLocaleDateString()} • {payRun.bill_count} bills
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">₹{(payRun.total_amount / 100000).toFixed(1)}L</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded mt-2 inline-block ${
                      payRun.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {payRun.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
