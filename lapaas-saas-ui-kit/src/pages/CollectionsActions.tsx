import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Send } from 'lucide-react';

interface Action {
  id: string;
  invoice_id: string;
  action_type: string;
  channel?: string;
  notes?: string;
  outcome?: string;
  timestamp: string;
  status: string;
  customer_name?: string;
  amount?: number;
}

export default function CollectionsActions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: '',
    action_type: 'call',
    channel: 'whatsapp',
    notes: '',
    outcome: 'no_answer'
  });

  useEffect(() => {
    fetchActions();
  }, []);

  const fetchActions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/collections/actions');
      if (response.ok) {
        const result = await response.json();
        setActions(result.data);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formData.action_type === 'reminder') {
        const response = await fetch('http://localhost:3000/api/v1/collections/send-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoice_id: formData.invoice_id,
            channel: formData.channel
          })
        });
        if (response.ok) {
          alert('Reminder sent successfully!');
          setFormData({ invoice_id: '', action_type: 'call', channel: 'whatsapp', notes: '', outcome: 'no_answer' });
          setShowForm(false);
          fetchActions();
        }
      } else {
        const response = await fetch('http://localhost:3000/api/v1/collections/log-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoice_id: formData.invoice_id,
            notes: formData.notes,
            outcome: formData.outcome
          })
        });
        if (response.ok) {
          alert('Call logged successfully!');
          setFormData({ invoice_id: '', action_type: 'call', channel: 'whatsapp', notes: '', outcome: 'no_answer' });
          setShowForm(false);
          fetchActions();
        }
      }
    } catch (error) {
      console.error('Error submitting action:', error);
      alert('Failed to submit action');
    }
  };

  const getActionIcon = (actionType: string) => {
    if (actionType === 'reminder_sent') {
      return <Send size={16} className="text-blue-400" />;
    } else if (actionType === 'call_logged') {
      return <Phone size={16} className="text-green-400" />;
    }
    return <MessageSquare size={16} className="text-gray-400" />;
  };

  const getActionLabel = (actionType: string) => {
    switch (actionType) {
      case 'reminder_sent':
        return 'Reminder Sent';
      case 'call_logged':
        return 'Call Logged';
      default:
        return actionType;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading actions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Collections Actions</h1>
            <p className="text-gray-400">Send reminders and log collection calls</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {showForm ? 'Cancel' : 'New Action'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">Log New Action</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Invoice ID</label>
                  <input
                    type="text"
                    value={formData.invoice_id}
                    onChange={e => setFormData({ ...formData, invoice_id: e.target.value })}
                    placeholder="e.g., INV-001"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Action Type</label>
                  <select
                    value={formData.action_type}
                    onChange={e => setFormData({ ...formData, action_type: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="call">Log Call</option>
                    <option value="reminder">Send Reminder</option>
                  </select>
                </div>
              </div>

              {formData.action_type === 'reminder' ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={e => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Call Outcome</label>
                    <select
                      value={formData.outcome}
                      onChange={e => setFormData({ ...formData, outcome: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="no_answer">No Answer</option>
                      <option value="promised">Promised Payment</option>
                      <option value="dispute">Dispute</option>
                      <option value="paid">Paid</option>
                      <option value="callback">Callback Later</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add notes about the call..."
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white h-24"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Submit Action
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Actions Timeline */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Recent Actions</h3>
          <div className="space-y-4">
            {actions.map(action => (
              <div key={action.id} className="flex gap-4 pb-4 border-b border-gray-700 last:border-b-0">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  {getActionIcon(action.action_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">{getActionLabel(action.action_type)}</p>
                      <p className="text-sm text-gray-400">{action.customer_name || action.invoice_id}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(action.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {action.channel && (
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-300">Channel:</span> {action.channel.toUpperCase()}
                    </p>
                  )}
                  {action.outcome && (
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-300">Outcome:</span> {action.outcome}
                    </p>
                  )}
                  {action.notes && (
                    <p className="text-sm text-gray-400 mt-2">
                      <span className="text-gray-300">Notes:</span> {action.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {actions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No actions yet. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
