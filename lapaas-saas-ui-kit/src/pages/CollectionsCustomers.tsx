import { useState, useEffect } from 'react';
import { Eye, MessageSquare, Phone } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_outstanding: number;
  invoice_count: number;
  overdue_count: number;
}

interface CustomerDetail extends Customer {
  invoices: Array<{
    id: string;
    amount: number;
    due_date: string;
    status: string;
    days_overdue: number;
  }>;
}

export default function CollectionsCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/collections/customers');
      if (response.ok) {
        const result = await response.json();
        setCustomers(result.data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = async (customerId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/collections/customers/${customerId}`);
      if (response.ok) {
        const result = await response.json();
        setSelectedCustomer(result.data);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
          <p className="text-gray-400">Manage customer collections</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customers List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="bg-gray-700 p-4 border-b border-gray-600">
                <h3 className="text-lg font-bold text-white">Customers ({customers.length})</h3>
              </div>
              <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                {customers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => handleViewCustomer(customer.id)}
                    className={`w-full p-4 text-left transition ${
                      selectedCustomer?.id === customer.id
                        ? 'bg-green-500/20 border-l-4 border-green-500'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <p className="text-white font-semibold">{customer.name}</p>
                    <p className="text-sm text-gray-400 mt-1">₹{(customer.total_outstanding / 1000).toFixed(0)}K outstanding</p>
                    {customer.overdue_count > 0 && (
                      <p className="text-xs text-red-400 mt-1">{customer.overdue_count} overdue</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="lg:col-span-2">
            {selectedCustomer ? (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedCustomer.name}</h2>
                      <p className="text-gray-400 mt-1">{selectedCustomer.email}</p>
                      <p className="text-gray-400">{selectedCustomer.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition">
                        <MessageSquare size={20} />
                      </button>
                      <button className="p-3 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition">
                        <Phone size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded p-4">
                      <p className="text-gray-400 text-sm">Total Outstanding</p>
                      <p className="text-2xl font-bold text-white mt-2">₹{(selectedCustomer.total_outstanding / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="bg-gray-700 rounded p-4">
                      <p className="text-gray-400 text-sm">Total Invoices</p>
                      <p className="text-2xl font-bold text-white mt-2">{selectedCustomer.invoice_count}</p>
                    </div>
                    <div className="bg-gray-700 rounded p-4">
                      <p className="text-gray-400 text-sm">Overdue</p>
                      <p className={`text-2xl font-bold mt-2 ${selectedCustomer.overdue_count > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {selectedCustomer.overdue_count}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invoices */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-6">Invoices</h3>
                  <div className="space-y-3">
                    {selectedCustomer.invoices.map(invoice => (
                      <div key={invoice.id} className="flex justify-between items-center p-4 bg-gray-700 rounded hover:bg-gray-600 transition">
                        <div>
                          <p className="text-white font-semibold">{invoice.id}</p>
                          <p className="text-sm text-gray-400">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">₹{(invoice.amount / 1000).toFixed(0)}K</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              invoice.status === 'paid'
                                ? 'bg-green-500/20 text-green-400'
                                : invoice.status === 'overdue'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {invoice.status.toUpperCase()}
                            </span>
                            {invoice.days_overdue > 0 && (
                              <span className="text-xs text-red-400">{invoice.days_overdue}d overdue</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedCustomer.invoices.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No invoices for this customer</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
                <Eye size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">Select a customer to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
