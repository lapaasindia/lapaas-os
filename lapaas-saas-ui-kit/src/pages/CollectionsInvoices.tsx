import { useState, useEffect } from 'react';
import { MessageSquare, Check, Eye, AlertCircle } from 'lucide-react';

interface Invoice {
  id: string;
  customer_name: string;
  amount: number;
  due_date: string;
  status: string;
  days_overdue: number;
  reminders_sent: number;
  last_reminder: string | null;
}

export default function CollectionsInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchInvoices();
  }, [filter, page]);

  const fetchInvoices = async () => {
    try {
      const url = filter === 'all' 
        ? `http://localhost:3000/api/v1/collections/invoices?page=${page}`
        : `http://localhost:3000/api/v1/collections/invoices?page=${page}&status=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setInvoices(result.data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/collections/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId, channel: 'whatsapp' })
      });
      if (response.ok) {
        alert('Reminder sent successfully!');
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/collections/invoices/${invoiceId}/mark-paid`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        alert('Invoice marked as paid!');
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Invoices</h1>
          <p className="text-gray-400">Manage and track your invoices</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          {['all', 'overdue', 'pending', 'paid'].map(status => (
            <button
              key={status}
              onClick={() => { setFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === status
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Invoice ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Days Overdue</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Reminders</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {invoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-700 transition">
                    <td className="px-6 py-4 text-white font-semibold">{invoice.id}</td>
                    <td className="px-6 py-4 text-gray-300">{invoice.customer_name}</td>
                    <td className="px-6 py-4 text-white font-semibold">₹{(invoice.amount / 1000).toFixed(0)}K</td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.days_overdue > 0 ? (
                        <span className="text-red-400 font-semibold flex items-center gap-1">
                          <AlertCircle size={16} />
                          {invoice.days_overdue}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{invoice.reminders_sent}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendReminder(invoice.id)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition"
                          title="Send Reminder"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => handleMarkPaid(invoice.id)}
                          className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition"
                          title="Mark as Paid"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="p-2 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition"
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

        {/* Empty State */}
        {invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  );
}
