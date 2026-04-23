import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  type: string;
  rate: number;
  hsn_sac: string;
  unit: string;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  stock_quantity?: number;
}

interface LineItem {
  id: string;
  product_id: string;
  product_name: string;
  hsn_sac: string;
  unit: string;
  qty: number;
  rate: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

interface DetailedInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceData: any) => void;
}

export default function DetailedInvoiceModal({ isOpen, onClose, onSave }: DetailedInvoiceModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<'all' | 'product' | 'service'>('all');
  
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes_en: '',
    notes_hi: '',
    place_of_supply: 'INTRA'
  });

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/products?org_id=org-001');
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.hsn_sac.includes(searchTerm);
    const matchesType = selectedProductType === 'all' || p.type === selectedProductType;
    return matchesSearch && matchesType;
  });

  const addLineItem = (product: Product) => {
    const lineItem: LineItem = {
      id: `li-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      hsn_sac: product.hsn_sac,
      unit: product.unit,
      qty: 1,
      rate: product.rate,
      cgst_rate: product.cgst_rate,
      sgst_rate: product.sgst_rate,
      igst_rate: product.igst_rate,
      amount: product.rate,
      cgst: (product.rate * product.cgst_rate) / 100,
      sgst: (product.rate * product.sgst_rate) / 100,
      igst: (product.rate * product.igst_rate) / 100,
      total: product.rate * (1 + (product.cgst_rate + product.sgst_rate + product.igst_rate) / 100)
    };
    
    setLineItems([...lineItems, lineItem]);
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        
        // Recalculate amounts
        const amount = updatedItem.qty * updatedItem.rate;
        const cgst = (amount * updatedItem.cgst_rate) / 100;
        const sgst = (amount * updatedItem.sgst_rate) / 100;
        const igst = (amount * updatedItem.igst_rate) / 100;
        const total = amount + cgst + sgst + igst;
        
        return {
          ...updatedItem,
          amount,
          cgst,
          sgst,
          igst,
          total
        };
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const totalCGST = lineItems.reduce((sum, item) => sum + item.cgst, 0);
    const totalSGST = lineItems.reduce((sum, item) => sum + item.sgst, 0);
    const totalIGST = lineItems.reduce((sum, item) => sum + item.igst, 0);
    const total = lineItems.reduce((sum, item) => sum + item.total, 0);
    
    return { subtotal, totalCGST, totalSGST, totalIGST, total };
  };

  const handleSave = () => {
    if (!formData.customer_id || lineItems.length === 0) {
      alert('Please fill customer ID and add at least one line item');
      return;
    }
    
    const totals = calculateTotals();
    
    const invoiceData = {
      ...formData,
      line_items: lineItems,
      subtotal: totals.subtotal,
      cgst: totals.totalCGST,
      sgst: totals.totalSGST,
      igst: totals.totalIGST,
      total: totals.total
    };
    
    onSave(invoiceData);
    onClose();
  };

  const totals = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Create Detailed Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Customer ID *</label>
              <input
                type="text"
                value={formData.customer_id}
                onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                placeholder="e.g., cust-001"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Customer Name</label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                placeholder="Customer name"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Place of Supply</label>
              <select
                value={formData.place_of_supply}
                onChange={(e) => setFormData({...formData, place_of_supply: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              >
                <option>INTRA</option>
                <option>INTER</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Issue Date</label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Notes (English)</label>
              <textarea
                value={formData.notes_en}
                onChange={(e) => setFormData({...formData, notes_en: e.target.value})}
                placeholder="Invoice notes in English"
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Notes (Hindi)</label>
              <textarea
                value={formData.notes_hi}
                onChange={(e) => setFormData({...formData, notes_hi: e.target.value})}
                placeholder="Invoice notes in Hindi"
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="border-t border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Line Items</h3>
              <button
                onClick={() => setShowProductSearch(!showProductSearch)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product/Service
              </button>
            </div>

            {/* Product Search */}
            {showProductSearch && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search by name or HSN/SAC code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded pl-10 px-3 py-2 text-white"
                    />
                  </div>
                  <select
                    value={selectedProductType}
                    onChange={(e) => setSelectedProductType(e.target.value as any)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="product">Products</option>
                    <option value="service">Services</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => addLineItem(product)}
                      className="text-left p-3 bg-gray-700 hover:bg-gray-600 rounded border border-gray-600 transition-colors"
                    >
                      <div className="font-semibold text-white">{product.name}</div>
                      <div className="text-sm text-gray-400">
                        ₹{product.rate} | HSN/SAC: {product.hsn_sac} | {product.unit}
                      </div>
                      {product.stock_quantity !== undefined && product.stock_quantity > 0 && (
                        <div className="text-xs text-green-400">Stock: {product.stock_quantity}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Line Items Table */}
            {lineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left">Product/Service</th>
                      <th className="px-4 py-2 text-left">HSN/SAC</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-right">Rate</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-right">CGST</th>
                      <th className="px-4 py-2 text-right">SGST</th>
                      <th className="px-4 py-2 text-right">Total</th>
                      <th className="px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {lineItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-800">
                        <td className="px-4 py-2">{item.product_name}</td>
                        <td className="px-4 py-2">{item.hsn_sac}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateLineItem(item.id, { qty: parseInt(e.target.value) || 1 })}
                            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-center"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">₹{item.rate}</td>
                        <td className="px-4 py-2 text-right">₹{item.amount.toFixed(0)}</td>
                        <td className="px-4 py-2 text-right text-green-400">₹{item.cgst.toFixed(0)}</td>
                        <td className="px-4 py-2 text-right text-green-400">₹{item.sgst.toFixed(0)}</td>
                        <td className="px-4 py-2 text-right font-semibold">₹{item.total.toFixed(0)}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No line items added. Click "Add Product/Service" to get started.
              </div>
            )}
          </div>

          {/* Totals */}
          {lineItems.length > 0 && (
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-end">
                <div className="w-full md:w-96 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>₹{totals.subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>CGST (9%):</span>
                    <span>₹{totals.totalCGST.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>SGST (9%):</span>
                    <span>₹{totals.totalSGST.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>IGST:</span>
                    <span>₹{totals.totalIGST.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-2">
                    <span>Total:</span>
                    <span>₹{totals.total.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-700 pt-6 flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.customer_id || lineItems.length === 0}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
