import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  type: 'product' | 'service';
  description: string;
  hsn_sac: string;
  unit: string;
  rate: number;
  tax_rate: number;
  cgst_rate: number;
  sgst_rate: number;
  stock_quantity?: number;
  reorder_level?: number;
  status: string;
}

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'services' | 'inventory'>('products');
  const [formData, setFormData] = useState({
    name: '',
    type: 'product' as 'product' | 'service',
    description: '',
    hsn_sac: '',
    unit: 'piece',
    rate: '',
    cgst_rate: 9,
    sgst_rate: 9,
    stock_quantity: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/v1/products?org_id=org-001');
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.rate) {
      alert('Please fill required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/v1/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rate: parseFloat(formData.rate),
          stock_quantity: formData.type === 'service' ? 0 : parseInt(formData.stock_quantity || '0'),
          org_id: 'org-001'
        })
      });

      if (response.ok) {
        setFormData({
          name: '',
          type: 'product',
          description: '',
          hsn_sac: '',
          unit: 'piece',
          rate: '',
          cgst_rate: 9,
          sgst_rate: 9,
          stock_quantity: ''
        });
        setShowForm(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/v1/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeTab === 'products') return p.type === 'product';
    if (activeTab === 'services') return p.type === 'service';
    return true;
  });

  const lowStockProducts = products.filter(p => 
    p.type === 'product' && p.stock_quantity && p.reorder_level && p.stock_quantity <= p.reorder_level
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
            <h1 className="text-4xl font-bold mb-2">Products & Services</h1>
            <p className="text-gray-400">Manage your products, services, and inventory</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product/Service
          </button>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-yellow-200">Low Stock Alert</div>
              <div className="text-sm text-yellow-300">
                {lowStockProducts.length} product(s) below reorder level
              </div>
            </div>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Add New Product/Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Product/Service name"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">HSN/SAC Code</label>
                <input
                  type="text"
                  value={formData.hsn_sac}
                  onChange={(e) => setFormData({...formData, hsn_sac: e.target.value})}
                  placeholder="e.g., 9989"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="piece">Piece</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="license">License</option>
                  <option value="kg">Kg</option>
                  <option value="liter">Liter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Rate (₹) *</label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: e.target.value})}
                  placeholder="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">CGST Rate (%)</label>
                <input
                  type="number"
                  value={formData.cgst_rate}
                  onChange={(e) => setFormData({...formData, cgst_rate: parseInt(e.target.value) || 0})}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
              {formData.type === 'product' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Initial Stock</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                    placeholder="0"
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              )}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Product/Service description"
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleCreateProduct}
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
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'products'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Products ({products.filter(p => p.type === 'product').length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'services'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Services ({products.filter(p => p.type === 'service').length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Inventory
          </button>
        </div>

        {/* Products/Services Table */}
        {(activeTab === 'products' || activeTab === 'services') && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">HSN/SAC</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Unit</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Rate</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold">Tax</th>
                  {activeTab === 'products' && (
                    <th className="px-6 py-3 text-right text-sm font-semibold">Stock</th>
                  )}
                  <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                    <td className="px-6 py-4 text-sm">{product.hsn_sac}</td>
                    <td className="px-6 py-4 text-sm">{product.unit}</td>
                    <td className="px-6 py-4 text-sm text-right">₹{product.rate}</td>
                    <td className="px-6 py-4 text-sm text-right">{product.cgst_rate}%</td>
                    {activeTab === 'products' && (
                      <td className={`px-6 py-4 text-sm text-right font-semibold ${
                        product.stock_quantity && product.stock_quantity <= (product.reorder_level || 0)
                          ? 'text-red-400'
                          : 'text-green-400'
                      }`}>
                        {product.stock_quantity || 0}
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {products.filter(p => p.type === 'product').map(product => (
              <div key={product.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-white">{product.name}</div>
                  <Package className="w-4 h-4 text-gray-500" />
                </div>
                <div className="text-sm text-gray-400 mb-3">{product.description}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stock:</span>
                    <span className={product.stock_quantity && product.stock_quantity <= (product.reorder_level || 0) ? 'text-red-400 font-semibold' : 'text-green-400'}>
                      {product.stock_quantity || 0} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rate:</span>
                    <span className="text-white">₹{product.rate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Value:</span>
                    <span className="text-white">₹{((product.stock_quantity || 0) * product.rate).toLocaleString()}</span>
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
