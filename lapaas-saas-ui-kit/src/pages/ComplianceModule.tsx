import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Upload, FileText } from 'lucide-react';

interface ComplianceItem {
  id: string;
  type: string;
  name: string;
  due_date: string;
  status: string;
  owner_name: string;
  checklist: Record<string, boolean>;
  documents: Array<{ id: string; name: string; verified: boolean }>;
}

export default function ComplianceModule() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [calendar, setCalendar] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, calendarRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/finance/compliance/items'),
        fetch('http://localhost:3000/api/v1/finance/compliance/calendar')
      ]);

      if (itemsRes.ok) setItems((await itemsRes.json()).data);
      if (calendarRes.ok) setCalendar((await calendarRes.json()).data);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistUpdate = async (itemId: string, key: string, value: boolean) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/finance/compliance/items/${itemId}/checklist`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checklist: { [key]: value } })
        }
      );
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="text-green-400" size={20} />;
    } else if (status === 'pending') {
      const daysLeft = Math.ceil(
        (new Date(items.find(i => i.status === status)?.due_date || '').getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return daysLeft <= 3 ? (
        <AlertCircle className="text-red-400" size={20} />
      ) : (
        <Clock className="text-yellow-400" size={20} />
      );
    }
    return null;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GST':
        return 'bg-blue-500/20 text-blue-400';
      case 'TDS':
        return 'bg-purple-500/20 text-purple-400';
      case 'EPF':
        return 'bg-green-500/20 text-green-400';
      case 'ESI':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Compliance...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Compliance Management</h1>
          <p className="text-gray-400">Track filings, checklists, and evidence</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Items</p>
            <p className="text-3xl font-bold text-white mt-2">{items.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-400 mt-2">
              {items.filter(i => i.status === 'completed').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {items.filter(i => i.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Overdue</p>
            <p className="text-3xl font-bold text-red-400 mt-2">
              {items.filter(i => i.status === 'pending' && new Date(i.due_date) < new Date()).length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compliance Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-6 rounded-lg border cursor-pointer transition ${
                  selectedItem?.id === item.id
                    ? 'bg-gray-700 border-green-500'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="text-lg font-bold text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400">{item.owner_name}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Due: {new Date(item.due_date).toLocaleDateString()}
                  </p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    item.status === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>

                {/* Checklist Progress */}
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs text-gray-400">
                      {Object.values(item.checklist).filter(Boolean).length}/{Object.keys(item.checklist).length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          (Object.values(item.checklist).filter(Boolean).length /
                            Object.keys(item.checklist).length) *
                          100
                        }%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            {selectedItem ? (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-6">{selectedItem.name}</h3>

                {/* Checklist */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Checklist</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedItem.checklist).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={e =>
                            handleChecklistUpdate(selectedItem.id, key, e.target.checked)
                          }
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-300 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Documents</h4>
                  {selectedItem.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedItem.documents.map(doc => (
                        <div key={doc.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                          <FileText size={16} className="text-blue-400" />
                          <span className="text-sm text-gray-300 flex-1">{doc.name}</span>
                          {doc.verified && <CheckCircle size={16} className="text-green-400" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button className="w-full flex items-center justify-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition">
                      <Upload size={16} />
                      Upload Document
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
                <p className="text-gray-400">Select an item to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar View */}
        {Object.keys(calendar).length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">Compliance Calendar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(calendar).map(([month, monthItems]: [string, any]) => (
                <div key={month} className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">{month}</h4>
                  <div className="space-y-2">
                    {Array.isArray(monthItems) && monthItems.map((item: any) => (
                      <div key={item.id} className="text-sm">
                        <p className="text-gray-300">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
