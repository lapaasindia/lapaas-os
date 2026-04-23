import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, User, Trash2, CheckCircle, Filter } from 'lucide-react';
import { Request, CATEGORY_CONFIG, URGENCY_CONFIG, calculateRemainingMinutes, isSLABreached, getStatusIcon } from '../types/requests';
import { requestService } from '../services/requestService';

interface RequestListProps {
  userId: string;
  orgId: string;
  onRequestSelect?: (request: Request) => void;
}

const RequestList: React.FC<RequestListProps> = ({
  userId,
  orgId,
  onRequestSelect
}) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'assigned' | 'in_progress' | 'resolved'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'P1' | 'P2' | 'P3' | 'P4'>('all');

  useEffect(() => {
    loadRequests();
  }, [userId, orgId]);

  const loadRequests = async () => {
    setLoading(true);
    const allRequests = await requestService.getRequests(orgId);
    setRequests(allRequests);
    setLoading(false);
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('Delete this request?')) {
      const success = await requestService.deleteRequest(requestId);
      if (success) {
        setRequests(requests.filter(r => r.id !== requestId));
      }
    }
  };

  const handleResolveRequest = async (requestId: string) => {
    const updated = await requestService.updateRequestStatus(requestId, 'resolved');
    if (updated) {
      setRequests(requests.map(r => r.id === requestId ? updated : r));
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
    return true;
  });

  const stats = {
    total: requests.length,
    new: requests.filter(r => r.status === 'new').length,
    slaBreached: requests.filter(r => isSLABreached(r.slaDueAt)).length,
    p1: requests.filter(r => r.urgency === 'P1').length
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading requests...</div>;
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertCircle className="text-orange-400" size={28} />
          Requests ({requests.length})
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-slate-700 rounded-lg">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-slate-700 rounded-lg">
            <p className="text-xs text-gray-400">New</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.new}</p>
          </div>
          <div className="p-3 bg-slate-700 rounded-lg">
            <p className="text-xs text-gray-400">P1 Critical</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{stats.p1}</p>
          </div>
          <div className="p-3 bg-slate-700 rounded-lg">
            <p className="text-xs text-gray-400">SLA Breached</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{stats.slaBreached}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <span className="text-sm text-gray-400">Status:</span>
        </div>
        {(['all', 'new', 'assigned', 'in_progress', 'resolved'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}

        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-gray-400">Urgency:</span>
        </div>
        {(['all', 'P1', 'P2', 'P3', 'P4'] as const).map((urgency) => (
          <button
            key={urgency}
            onClick={() => setUrgencyFilter(urgency)}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              urgencyFilter === urgency
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {urgency}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const remaining = calculateRemainingMinutes(request.slaDueAt);
            const breached = isSLABreached(request.slaDueAt);
            const categoryConfig = CATEGORY_CONFIG[request.category] || CATEGORY_CONFIG['other'];
            const urgencyConfig = URGENCY_CONFIG[request.urgency] || URGENCY_CONFIG['P4'];

            return (
              <div
                key={request.id}
                onClick={() => onRequestSelect?.(request)}
                className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                  breached
                    ? 'bg-red-900 border-red-600 hover:border-red-500'
                    : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{categoryConfig?.icon || '📋'}</span>
                      <h3 className="font-semibold text-white">{request.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${urgencyConfig?.bgColor || 'bg-gray-700'} ${urgencyConfig?.color || 'text-gray-400'}`}>
                        {request.urgency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{request.description}</p>
                  </div>
                  <div className="flex gap-2">
                    {request.status === 'resolved' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRequest(request.id);
                        }}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolveRequest(request.id);
                        }}
                        className="text-green-400 hover:text-green-300 transition"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />
                    <span>
                      {breached ? (
                        <span className="text-red-400 font-semibold">SLA Breached</span>
                      ) : (
                        <>
                          {remaining > 60
                            ? `${Math.round(remaining / 60)}h`
                            : `${remaining}m`}
                          remaining
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <span>{getStatusIcon(request.status)}</span>
                    <span className="capitalize">{request.status.replace('_', ' ')}</span>
                  </div>

                  {request.assignedTo && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <User size={16} />
                      <span>{request.assignedTo}</span>
                    </div>
                  )}

                  {request.deadline && (
                    <div className="text-gray-400">
                      📅 Due: {new Date(request.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RequestList;
