import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, CheckCircle, AlertCircle, User, Building2 } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstin: string;
  pan: string;
  city: string;
  state: string;
  contact_person: string;
  credit_limit: number;
  credit_used: number;
  outstanding_amount: number;
  kyc_status: string;
  status: string;
  rating: number;
  total_invoices: number;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstin: string;
  pan: string;
  city: string;
  state: string;
  contact_person: string;
  payment_terms: string;
  kyc_status: string;
  status: string;
  rating: number;
  total_bills: number;
  outstanding_amount: number;
}

export default function CustomersVendorsManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'vendors'>('customers');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    credit_limit: '',
    payment_terms: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersRes, vendorsRes, summaryRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/customers?org_id=org-001'),
        fetch('http://localhost:3000/api/v1/vendors?org_id=org-001'),
        fetch('http://localhost:3000/api/v1/customers-vendors/summary?org_id=org-001')
      ]);

      const customersData = await customersRes.json();
      const vendorsData = await vendorsRes.json();
      const summaryData = await summaryRes.json();

      setCustomers(customersData.data || []);
      setVendors(vendorsData.data || []);
      setSummary(summaryData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          credit_limit: parseFloat(formData.credit_limit || '0'),
          org_id: 'org-001'
        })
      });

      if (response.ok) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          gstin: '',
          pan: '',
          address: '',
          city: '',
          state: '',
          contact_person: '',
          contact_email: '',
          contact_phone: '',
          credit_limit: '',
          payment_terms: ''
        });
        setShowForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };

  const handleCreateVendor = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          org_id: 'org-001'
        })
      });

      if (response.ok) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          gstin: '',
          pan: '',
          address: '',
          city: '',
          state: '',
          contact_person: '',
          contact_email: '',
          contact_phone: '',
          credit_limit: '',
          payment_terms: ''
        });
        setShowForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating vendor:', error);
    }
  };

  const handleDelete = async (id: string, type: 'customer' | 'vendor') => {
    if (!confirm('Are you sure?')) return;

    try {
      const endpoint = type === 'customer' ? 'customers' : 'vendors';
      const response = await fetch(`http://localhost:3000/api/v1/${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Customers & Vendors</h1>
            <p className="text-gray-400">Manage your customers and vendors</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'customers' ? 'Customer' : 'Vendor'}
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">Total Customers</div>
              <div className="text-3xl font-bold text-blue-400">{summary.customers.total}</div>
              <div className="text-xs text-green-400 mt-2">{summary.customers.active} Active</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">Credit Limit</div>
              <div className="text-3xl font-bold text-green-400">₹{(summary.customers.total_credit_limit / 100000).toFixed(1)}L</div>
              <div className="text-xs text-yellow-400 mt-2">Outstanding: ₹{(summary.customers.total_outstanding / 100000).toFixed(1)}L</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">Total Vendors</div>
              <div className="text-3xl font-bold text-purple-400">{summary.vendors.total}</div>
              <div className="text-xs text-green-400 mt-2">{summary.vendors.active} Active</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="text-sm text-gray-400 mb-1">Vendor Outstanding</div>
              <div className="text-3xl font-bold text-orange-400">₹{(summary.vendors.total_outstanding / 100000).toFixed(1)}L</div>
              <div className="text-xs text-gray-400 mt-2">{summary.vendors.total} Vendors</div>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Add New {activeTab === 'customers' ? 'Customer' : 'Vendor'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Name *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
              <input
                type="text"
                placeholder="GSTIN"
                value={formData.gstin}
                onChange={(e) => setFormData({...formData, gstin: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
              <input
                type="text"
                placeholder="PAN"
                value={formData.pan}
                onChange={(e) => setFormData({...formData, pan: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
              <input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
              <input
                type="text"
                placeholder="Contact Person"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
              <input
                type="email"
                placeholder="Contact Email"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
              {activeTab === 'customers' && (
                <input
                  type="number"
                  placeholder="Credit Limit (₹)"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({...formData, credit_limit: e.target.value})}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              )}
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={activeTab === 'customers' ? handleCreateCustomer : handleCreateVendor}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'customers'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <User className="w-4 h-4" />
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'vendors'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Vendors ({vendors.length})
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded pl-10 px-3 py-2 text-white"
          />
        </div>

        {/* Customers Table */}
        {activeTab === 'customers' && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">City</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Credit Limit</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Outstanding</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">KYC</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>{customer.contact_person}</div>
                      <div className="text-xs text-gray-500">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{customer.city}</td>
                    <td className="px-6 py-4 text-sm text-right">₹{(customer.credit_limit / 100000).toFixed(1)}L</td>
                    <td className={`px-6 py-4 text-sm text-right font-semibold ${customer.outstanding_amount > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                      ₹{(customer.outstanding_amount / 100000).toFixed(1)}L
                    </td>
                    <td className="px-6 py-4 text-center">
                      {customer.kyc_status === 'verified' ? (
                        <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="text-blue-400 hover:text-blue-300">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, 'customer')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vendors Table */}
        {activeTab === 'vendors' && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">City</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Payment Terms</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Outstanding</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">KYC</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredVendors.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{vendor.name}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>{vendor.contact_person}</div>
                      <div className="text-xs text-gray-500">{vendor.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{vendor.city}</td>
                    <td className="px-6 py-4 text-sm">{vendor.payment_terms}</td>
                    <td className={`px-6 py-4 text-sm text-right font-semibold ${vendor.outstanding_amount > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                      ₹{(vendor.outstanding_amount / 100000).toFixed(1)}L
                    </td>
                    <td className="px-6 py-4 text-center">
                      {vendor.kyc_status === 'verified' ? (
                        <CheckCircle className="w-4 h-4 text-green-400 mx-auto" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="text-blue-400 hover:text-blue-300">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vendor.id, 'vendor')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
