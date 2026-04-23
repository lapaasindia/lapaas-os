import { useState, useEffect } from 'react';
import { Download, BarChart3 } from 'lucide-react';

interface ReportData {
  title: string;
  generated_at: string;
  by_age: {
    [key: string]: {
      amount: number;
      count: number;
      invoices: Array<{
        id: string;
        customer: string;
        amount: number;
        days_overdue: number;
      }>;
    };
  };
  summary: {
    total_outstanding: number;
    total_invoices: number;
    overdue_invoices: number;
  };
}

export default function CollectionsReport() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/collections/report');
      if (response.ok) {
        const result = await response.json();
        setReport(result.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!report) return;
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `collections-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-red-400 text-xl">Failed to load report</div>
      </div>
    );
  }

  const ageBuckets = [
    { key: '0_30', label: '0-30 Days', color: 'bg-green-500' },
    { key: '30_60', label: '30-60 Days', color: 'bg-yellow-500' },
    { key: '60_90', label: '60-90 Days', color: 'bg-orange-500' },
    { key: '90_plus', label: '90+ Days', color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Collections Aging Report</h1>
            <p className="text-gray-400">
              Generated on {new Date(report.generated_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            <Download size={20} />
            Download
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Outstanding</p>
            <p className="text-3xl font-bold text-white mt-2">₹{(report.summary.total_outstanding / 100000).toFixed(1)}L</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Invoices</p>
            <p className="text-3xl font-bold text-white mt-2">{report.summary.total_invoices}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm">Overdue Invoices</p>
            <p className="text-3xl font-bold text-red-400 mt-2">{report.summary.overdue_invoices}</p>
          </div>
        </div>

        {/* Age Buckets */}
        <div className="space-y-6">
          {ageBuckets.map(bucket => {
            const data = report.by_age[bucket.key];
            if (!data) return null;

            const percentage = (data.amount / report.summary.total_outstanding) * 100;

            return (
              <div key={bucket.key} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${bucket.color}`} />
                      <h3 className="text-xl font-bold text-white">{bucket.label}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">₹{(data.amount / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-gray-400">{percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3">
                    <div
                      className={`${bucket.color} h-3 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{data.count} invoices</p>
                </div>

                {/* Invoices in this bucket */}
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-sm font-semibold text-gray-300 mb-3">Invoices:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.invoices.map(invoice => (
                      <div key={invoice.id} className="flex justify-between items-center text-sm bg-gray-700/50 p-3 rounded">
                        <div>
                          <p className="text-white font-semibold">{invoice.id}</p>
                          <p className="text-gray-400">{invoice.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">₹{(invoice.amount / 1000).toFixed(0)}K</p>
                          <p className="text-gray-400">{invoice.days_overdue} days</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 size={24} />
            Report Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 mb-2">Outstanding by Age</p>
              <div className="space-y-2">
                {ageBuckets.map(bucket => {
                  const data = report.by_age[bucket.key];
                  if (!data) return null;
                  const percentage = (data.amount / report.summary.total_outstanding) * 100;
                  return (
                    <div key={bucket.key} className="flex justify-between text-sm">
                      <span className="text-gray-300">{bucket.label}</span>
                      <span className="text-white font-semibold">₹{(data.amount / 1000).toFixed(0)}K ({percentage.toFixed(1)}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Invoice Count by Age</p>
              <div className="space-y-2">
                {ageBuckets.map(bucket => {
                  const data = report.by_age[bucket.key];
                  if (!data) return null;
                  return (
                    <div key={bucket.key} className="flex justify-between text-sm">
                      <span className="text-gray-300">{bucket.label}</span>
                      <span className="text-white font-semibold">{data.count} invoices</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
