import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, AlertCircle, Clock, User } from 'lucide-react';

interface Request {
  id: string;
  title: string;
  description?: string;
  urgency: string;
  status: string;
  requested_by?: string;
  assigned_to?: string;
  due_at?: string;
  created_at?: string;
  updated_at?: string;
}

const RequestDetailPage: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    urgency: 'P2',
    assigned_to: '',
    due_at: ''
  });

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/requests/${requestId}?org_id=org-001`);
      if (response.ok) {
        const data = await response.json();
        const requestData = data.data || data;
        setRequest(requestData);
        setEditForm({
          title: requestData.title || '',
          description: requestData.description || '',
          status: requestData.status || 'pending',
          urgency: requestData.urgency || 'P2',
          assigned_to: requestData.assigned_to || '',
          due_at: requestData.due_at || ''
        });
      }
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!request) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/requests/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data.data || data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleDelete = async () => {
    if (!request || !window.confirm('Are you sure you want to delete this request?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/v1/requests/${request.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        navigate('/founder-os');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'P1':
        return 'text-red-400 bg-red-900/30 border border-red-700/50';
      case 'P2':
        return 'text-orange-400 bg-orange-900/30 border border-orange-700/50';
      case 'P3':
        return 'text-yellow-400 bg-yellow-900/30 border border-yellow-700/50';
      case 'P4':
        return 'text-blue-400 bg-blue-900/30 border border-blue-700/50';
      default:
        return 'text-gray-400 bg-gray-900/30 border border-gray-700/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-400 bg-green-900/30';
      case 'in_progress':
        return 'text-blue-400 bg-blue-900/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p>Loading request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <p className="text-xl">Request not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/founder-os')}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
          >
            <ArrowLeft size={20} />
            Back to My Week
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-400 hover:text-blue-300 transition px-4 py-2 rounded hover:bg-slate-700 flex items-center gap-2"
            >
              <Edit2 size={18} />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 transition px-4 py-2 rounded hover:bg-slate-700 flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          {/* Title */}
          <div className="mb-6">
            {isEditing ? (
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white text-2xl font-bold mb-3"
              />
            ) : (
              <h1 className="text-3xl font-bold mb-2">{request.title}</h1>
            )}
            {isEditing ? (
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Add description..."
                className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-gray-300 text-sm"
                rows={3}
              />
            ) : (
              <p className="text-gray-400">{request.description || 'No description provided'}</p>
            )}
          </div>

          {/* Status and Urgency */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Urgency</p>
              {isEditing ? (
                <select
                  value={editForm.urgency}
                  onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white"
                >
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - High</option>
                  <option value="P3">P3 - Medium</option>
                  <option value="P4">P4 - Low</option>
                </select>
              ) : (
                <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getUrgencyColor(request.urgency)}`}>
                  {request.urgency}
                </div>
              )}
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Status</p>
              {isEditing ? (
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white"
                >
                  <option value="pending">⏸️ Pending</option>
                  <option value="in_progress">⏳ In Progress</option>
                  <option value="resolved">✅ Resolved</option>
                </select>
              ) : (
                <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getStatusColor(request.status)}`}>
                  {request.status === 'pending' && '⏸️ Pending'}
                  {request.status === 'in_progress' && '⏳ In Progress'}
                  {request.status === 'resolved' && '✅ Resolved'}
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <User size={16} />
                Requested By
              </p>
              <p className="text-white font-semibold">{request.requested_by || 'Unknown'}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <User size={16} />
                Assigned To
              </p>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.assigned_to}
                  onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                  placeholder="Team member name"
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white"
                />
              ) : (
                <p className="text-white font-semibold">{request.assigned_to || 'Unassigned'}</p>
              )}
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Created
              </p>
              <p className="text-white font-semibold">
                {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Due Date
              </p>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.due_at}
                  onChange={(e) => setEditForm({ ...editForm, due_at: e.target.value })}
                  className="w-full bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white"
                />
              ) : (
                <p className="text-white font-semibold">
                  {request.due_at ? new Date(request.due_at).toLocaleDateString() : 'No due date'}
                </p>
              )}
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex gap-4">
              <button
                onClick={handleUpdate}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded font-semibold transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;
