import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Eye, Plus } from 'lucide-react';

interface Bill {
  id: string;
  vendor_id: string;
  vendor_name: string;
  bill_number: string;
  bill_date: string;
  due_date: string;
  po_id: string;
  grn_id: string | null;
  status: string;
  items: any[];
  total: number;
  amount_paid: number;
  outstanding: number;
  three_way_match: {
    po_matched: boolean;
    grn_matched: boolean;
    bill_matched: boolean;
    status: string;
  };
}

interface PurchaseOrder {
  id: string;
  vendor_id: string;
  vendor_name: string;
  po_number: string;
  po_date: string;
  expected_delivery: string;
  status: string;
  items: any[];
  total: number;
}

interface GRN {
  id: string;
  po_id: string;
  vendor_name: string;
  grn_date: string;
  status: string;
  total: number;
}

const PayablesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bills' | 'pos' | 'grn' | 'payments'>('bills');
  const [bills, setBills] = useState<Bill[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBillForm, setShowBillForm] = useState(false);
  const [showPOForm, setShowPOForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsRes, posRes, grnsRes, summaryRes] = await Promise.all([
        fetch('/api/v1/bills?org_id=org-001'),
        fetch('/api/v1/purchase-orders?org_id=org-001'),
        fetch('/api/v1/grn?org_id=org-001'),
        fetch('/api/v1/payables/summary?org_id=org-001')
      ]);

      if (billsRes.ok) setBills(await billsRes.json().then(r => r.data));
      if (posRes.ok) setPos(await posRes.json().then(r => r.data));
      if (grnsRes.ok) setGrns(await grnsRes.json().then(r => r.data));
      if (summaryRes.ok) setSummary(await summaryRes.json().then(r => r.data));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      try {
        const res = await fetch(`/api/v1/bills/${billId}`, { method: 'DELETE' });
        if (res.ok) {
          setBills(bills.filter(b => b.id !== billId));
        }
      } catch (error) {
        console.error('Error deleting bill:', error);
      }
    }
  };

  const handleDeletePO = async (poId: string) => {
    if (confirm('Are you sure you want to delete this PO?')) {
      try {
        const res = await fetch(`/api/v1/purchase-orders/${poId}`, { method: 'DELETE' });
        if (res.ok) {
          setPos(pos.filter(p => p.id !== poId));
        }
      } catch (error) {
        console.error('Error deleting PO:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'paid': 'bg-green-900 text-green-200',
      'part_paid': 'bg-yellow-900 text-yellow-200',
      'received': 'bg-blue-900 text-blue-200',
      'open': 'bg-gray-700 text-gray-200',
      'matched': 'bg-green-900 text-green-200',
      'pending': 'bg-orange-900 text-orange-200'
    };
    return colors[status] || 'bg-gray-700 text-gray-200';
  };

  const getMatchStatus = (match: any) => {
    if (match.status === 'matched') {
      return <span className="text-green-400">✓ Matched</span>;
    }
    return <span className="text-orange-400">⚠ Pending</span>;
  };

  const filteredBills = bills.filter(b =>
    b.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.bill_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPOs = pos.filter(p =>
    p.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.po_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Payables Management</h1>
          <p className="text-gray-400">Manage purchase orders, bills, and vendor payments</p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Total Bills</p>
              <p className="text-3xl font-bold text-white">{summary.total_bills}</p>
              <p className="text-gray-500 text-xs mt-2">Paid: {summary.bills_paid}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Total Payable</p>
              <p className="text-3xl font-bold text-white">₹{(summary.total_payable / 100000).toFixed(1)}L</p>
              <p className="text-gray-500 text-xs mt-2">Outstanding: ₹{(summary.total_outstanding / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">3-Way Matched</p>
              <p className="text-3xl font-bold text-green-400">{summary.three_way_matched}</p>
              <p className="text-gray-500 text-xs mt-2">Pending GRN: {summary.pending_grn}</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Overdue Bills</p>
              <p className="text-3xl font-bold text-red-400">{summary.overdue_bills}</p>
              <p className="text-gray-500 text-xs mt-2">Action Required</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {(['bills', 'pos', 'grn', 'payments'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'bills' && 'Bills'}
              {tab === 'pos' && 'Purchase Orders'}
              {tab === 'grn' && 'GRN'}
              {tab === 'payments' && 'Payments'}
            </button>
          ))}
        </div>

        {/* Search and Create */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by vendor or bill number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          {activeTab === 'bills' && (
            <button
              onClick={() => setShowBillForm(!showBillForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} /> Create Bill
            </button>
          )}
          {activeTab === 'pos' && (
            <button
              onClick={() => setShowPOForm(!showPOForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} /> Create PO
            </button>
          )}
        </div>

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Bill #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vendor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Outstanding</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">3-Way Match</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredBills.map(bill => (
                  <tr key={bill.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">{bill.bill_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{bill.vendor_name}</td>
                    <td className="px-6 py-4 text-sm text-white">₹{(bill.total / 100000).toFixed(1)}L</td>
                    <td className="px-6 py-4 text-sm text-orange-400">₹{(bill.outstanding / 100000).toFixed(1)}L</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getMatchStatus(bill.three_way_match)}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBill(bill.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'pos' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">PO #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vendor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Expected Delivery</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredPOs.map(po => (
                  <tr key={po.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">{po.po_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{po.vendor_name}</td>
                    <td className="px-6 py-4 text-sm text-white">₹{(po.total / 100000).toFixed(1)}L</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{po.expected_delivery}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Eye size={18} />
                      </button>
                      <button className="text-gray-400 hover:text-gray-300 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeletePO(po.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GRN Tab */}
        {activeTab === 'grn' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">GRN #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vendor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {grns.map(grn => (
                  <tr key={grn.id} className="hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 text-sm text-white font-medium">{grn.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{grn.vendor_name}</td>
                    <td className="px-6 py-4 text-sm text-white">₹{(grn.total / 100000).toFixed(1)}L</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{grn.grn_date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(grn.status)}`}>
                        {grn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-gray-400">Payment history and records will be displayed here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayablesManagement;
