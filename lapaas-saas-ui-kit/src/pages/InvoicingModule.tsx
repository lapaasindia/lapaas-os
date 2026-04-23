import { useState, useEffect } from 'react';
import { Plus, Eye, Download, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import DetailedInvoiceModal from '../components/DetailedInvoiceModal';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  issue_date: string;
  due_date: string;
  total: number;
  status: string;
  approval_status: string;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  line_items?: Array<{
    id?: string;
    description: string;
    hsn_sac?: string;
    qty?: number;
    rate?: number;
    amount: number;
  }>;
}

interface Receipt {
  id: string;
  receipt_number: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  status: string;
}

interface Dashboard {
  total_invoiced: number;
  total_collected: number;
  outstanding: number;
  invoices_issued: number;
  invoices_paid: number;
  invoices_overdue: number;
  collection_rate: number;
}

export default function InvoicingModule() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailedInvoiceModal, setShowDetailedInvoiceModal] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [receiptForm, setReceiptForm] = useState({ invoiceId: '', amount: '', method: 'NEFT', utr: '' });
  // TODO: Implement invoice detail modal using these states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  void selectedInvoice; void showInvoiceModal; // Suppress unused warnings until modal is implemented
  const [convertToReceiptMode, setConvertToReceiptMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, receiptsRes, dashboardRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/invoicing/invoices?org_id=org-001'),
        fetch('http://localhost:3000/api/v1/invoicing/receipts?org_id=org-001'),
        fetch('http://localhost:3000/api/v1/invoicing/dashboard?org_id=org-001')
      ]);

      const invoicesData = await invoicesRes.json();
      const receiptsData = await receiptsRes.json();
      const dashboardData = await dashboardRes.json();

      setInvoices(invoicesData.data || []);
      setReceipts(receiptsData.data || []);
      setDashboard(dashboardData.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-900 text-green-200';
      case 'Issued':
        return 'bg-blue-900 text-blue-200';
      case 'Overdue':
        return 'bg-red-900 text-red-200';
      case 'Part-paid':
        return 'bg-yellow-900 text-yellow-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'Overdue':
        return <AlertCircle className="w-4 h-4" />;
      case 'Part-paid':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleSaveDetailedInvoice = async (invoiceData: any) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/invoicing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'org-001',
          customer_id: invoiceData.customer_id,
          customer_name: invoiceData.customer_name,
          invoice_number: `INV-2025-${Date.now()}`,
          issue_date: invoiceData.issue_date,
          due_date: invoiceData.due_date,
          line_items: invoiceData.line_items,
          subtotal: invoiceData.subtotal,
          cgst: invoiceData.cgst,
          sgst: invoiceData.sgst,
          igst: invoiceData.igst,
          total: invoiceData.total,
          currency: 'INR',
          notes_en: invoiceData.notes_en,
          notes_hi: invoiceData.notes_hi,
          place_of_supply: invoiceData.place_of_supply,
          reverse_charge: false
        })
      });
      if (response.ok) {
        fetchData();
        alert('Invoice created successfully!');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice');
    }
  };

  const handleCreateReceipt = async () => {
    if (!receiptForm.invoiceId || !receiptForm.amount) {
      alert('Please fill all fields');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/v1/invoicing/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'org-001',
          invoice_id: receiptForm.invoiceId,
          amount: parseFloat(receiptForm.amount),
          currency: 'INR',
          receipt_date: new Date().toISOString().split('T')[0],
          receipt_number: `REC-2025-${Date.now()}`,
          payment_method: receiptForm.method,
          utr: receiptForm.utr,
          bank_reference: `BANK-${Date.now()}`,
          status: 'Draft'
        })
      });
      if (response.ok) {
        setReceiptForm({ invoiceId: '', amount: '', method: 'NEFT', utr: '' });
        setShowReceiptForm(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const invoiceData = `
INVOICE
Invoice #: ${invoice.invoice_number}
Date: ${invoice.issue_date}
Due Date: ${invoice.due_date}

Customer: ${invoice.customer_id}

Items:
${invoice.line_items?.map(item => `- ${item.description}: ₹${item.amount}`).join('\n')}

Subtotal: ₹${invoice.subtotal}
CGST (9%): ₹${invoice.cgst}
SGST (9%): ₹${invoice.sgst}
Total: ₹${invoice.total}

Status: ${invoice.status}
    `;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceData));
    element.setAttribute('download', `${invoice.invoice_number}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    alert(`Invoice ${invoice.invoice_number} sent to ${invoice.customer_id}`);
    // In production, this would send via email API
  };

  const handleConvertToReceipt = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setConvertToReceiptMode(true);
    setReceiptForm({
      invoiceId: invoice.id,
      amount: (invoice.total).toString(),
      method: 'NEFT',
      utr: ''
    });
    setActiveTab('receipts');
    setShowReceiptForm(true);
  };

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Invoicing & Receipts</h1>
          <p className="text-gray-400">Manage invoices, receipts, and collections</p>
        </div>

        {/* Dashboard Cards */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="text-gray-400 text-sm mb-2">Total Invoiced</div>
              <div className="text-3xl font-bold">₹{(dashboard.total_invoiced / 100000).toFixed(1)}L</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="text-gray-400 text-sm mb-2">Total Collected</div>
              <div className="text-3xl font-bold text-green-400">₹{(dashboard.total_collected / 100000).toFixed(1)}L</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="text-gray-400 text-sm mb-2">Outstanding</div>
              <div className="text-3xl font-bold text-yellow-400">₹{(dashboard.outstanding / 100000).toFixed(1)}L</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="text-gray-400 text-sm mb-2">Collection Rate</div>
              <div className="text-3xl font-bold text-blue-400">{dashboard.collection_rate}%</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'invoices'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'receipts'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Receipts ({receipts.length})
          </button>
        </div>

        {/* Detailed Invoice Modal */}
        <DetailedInvoiceModal
          isOpen={showDetailedInvoiceModal}
          onClose={() => setShowDetailedInvoiceModal(false)}
          onSave={handleSaveDetailedInvoice}
        />

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Invoices</h2>
              <button
                onClick={() => setShowDetailedInvoiceModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Detailed Invoice
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Invoice #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{invoice.invoice_number}</td>
                      <td className="px-6 py-4 text-sm">{invoice.customer_id}</td>
                      <td className="px-6 py-4 text-sm font-semibold">₹{(invoice.total / 100000).toFixed(1)}L</td>
                      <td className="px-6 py-4 text-sm">{invoice.due_date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            title="View Invoice"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(invoice)}
                            title="Download Invoice"
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendInvoice(invoice)}
                            title="Send Invoice"
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleConvertToReceipt(invoice)}
                            title="Convert to Receipt"
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            💰
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

        {/* Receipts Tab */}
        {activeTab === 'receipts' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Receipts</h2>
              <button
                onClick={() => setShowReceiptForm(!showReceiptForm)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Receipt
              </button>
            </div>

            {showReceiptForm && (
              <div className="bg-gray-900 rounded-lg p-6 mb-6 border border-gray-800">
                <h3 className="text-xl font-bold mb-4">{convertToReceiptMode ? 'Convert Invoice to Receipt' : 'Create New Receipt'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Invoice ID"
                    value={receiptForm.invoiceId}
                    onChange={(e) => setReceiptForm({...receiptForm, invoiceId: e.target.value})}
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Amount (₹) - Supports Partial Payment</label>
                    <input
                      type="number"
                      placeholder="Amount (₹)"
                      value={receiptForm.amount}
                      onChange={(e) => setReceiptForm({...receiptForm, amount: e.target.value})}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white w-full"
                    />
                  </div>
                  <select
                    value={receiptForm.method}
                    onChange={(e) => setReceiptForm({...receiptForm, method: e.target.value})}
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  >
                    <option>NEFT</option>
                    <option>RTGS</option>
                    <option>UPI</option>
                    <option>Cheque</option>
                    <option>Cash</option>
                  </select>
                  <input
                    type="text"
                    placeholder="UTR/Reference"
                    value={receiptForm.utr}
                    onChange={(e) => setReceiptForm({...receiptForm, utr: e.target.value})}
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-xs text-gray-400">
                    💡 Tip: Enter any amount to record partial payments. The invoice status will automatically update to "Part-paid" if less than full amount.
                  </p>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleCreateReceipt}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {convertToReceiptMode ? 'Convert & Create Receipt' : 'Create Receipt'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReceiptForm(false);
                      setConvertToReceiptMode(false);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Receipt #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Invoice</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {receipts.map((receipt) => (
                    <tr key={receipt.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{receipt.receipt_number}</td>
                      <td className="px-6 py-4 text-sm">{receipt.invoice_id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-400">₹{(receipt.amount / 100000).toFixed(1)}L</td>
                      <td className="px-6 py-4 text-sm">{receipt.payment_method}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                          {getStatusIcon(receipt.status)}
                          {receipt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-2">Invoices Issued</div>
            <div className="text-2xl font-bold">{dashboard?.invoices_issued || 0}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-2">Invoices Paid</div>
            <div className="text-2xl font-bold text-green-400">{dashboard?.invoices_paid || 0}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm mb-2">Invoices Overdue</div>
            <div className="text-2xl font-bold text-red-400">{dashboard?.invoices_overdue || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
