import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle, Phone, MessageSquare, Eye } from 'lucide-react';

interface DashboardData {
  summary: {
    total_outstanding: number;
    collection_current: number;
    dso: number;
    total_invoices: number;
    overdue_invoices: number;
    pending_invoices: number;
  };
  by_age: {
    '0_30': number;
    '30_60': number;
    '60_90': number;
    '90_plus': number;
  };
  by_customer: Array<{
    customer_id: string;
    customer_name: string;
    total_outstanding: number;
    invoice_count: number;
  }>;
}

export default function CollectionsUserDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/collections/dashboard');
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Collections Dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-red-400 text-xl">Failed to load dashboard</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Collections Dashboard</h1>
          <p className="text-gray-400">Track and manage your collections</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Outstanding</p>
                <p className="text-3xl font-bold text-white mt-2">₹{(data.summary.total_outstanding / 100000).toFixed(1)}L</p>
              </div>
              <BarChart3 className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Collection Current %</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{data.summary.collection_current}%</p>
              </div>
              <TrendingUp className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">DSO (Days)</p>
                <p className="text-3xl font-bold text-white mt-2">{data.summary.dso}</p>
              </div>
              <AlertCircle className="text-yellow-400" size={32} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Overdue Invoices</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{data.summary.overdue_invoices}</p>
              </div>
              <AlertCircle className="text-red-400" size={32} />
            </div>
          </div>
        </div>

        {/* Age Buckets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Outstanding by Age</h3>
            <div className="space-y-4">
              {[
                { label: '0-30 Days', key: '0_30', color: 'bg-green-500' },
                { label: '30-60 Days', key: '30_60', color: 'bg-yellow-500' },
                { label: '60-90 Days', key: '60_90', color: 'bg-orange-500' },
                { label: '90+ Days', key: '90_plus', color: 'bg-red-500' }
              ].map(bucket => {
                const amount = data.by_age[bucket.key as keyof typeof data.by_age];
                const percentage = (amount / data.summary.total_outstanding) * 100;
                return (
                  <div key={bucket.key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">{bucket.label}</span>
                      <span className="text-white font-semibold">₹{(amount / 1000).toFixed(0)}K ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="bg-gray-700 rounded-full h-2">
                      <div className={`${bucket.color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <span className="text-gray-400">Total Invoices</span>
                <span className="text-white font-semibold">{data.summary.total_invoices}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <span className="text-gray-400">Overdue</span>
                <span className="text-red-400 font-semibold">{data.summary.overdue_invoices}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <span className="text-gray-400">Pending</span>
                <span className="text-yellow-400 font-semibold">{data.summary.pending_invoices}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Collection Rate</span>
                <span className="text-green-400 font-semibold">{data.summary.collection_current}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Top Customers by Outstanding</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Outstanding</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Invoices</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.by_customer.map(customer => (
                  <tr key={customer.customer_id} className="hover:bg-gray-700 transition">
                    <td className="px-6 py-4 text-white font-semibold">{customer.customer_name}</td>
                    <td className="px-6 py-4 text-gray-300">₹{(customer.total_outstanding / 1000).toFixed(0)}K</td>
                    <td className="px-6 py-4 text-gray-300">{customer.invoice_count}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition">
                          <MessageSquare size={16} />
                        </button>
                        <button className="p-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition">
                          <Phone size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
