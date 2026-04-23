import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, BookOpen, TrendingDown, Clock, Plus, X, ChevronDown, Send, UserPlus, ArrowRight, XCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import OfficeHoursManager from '../components/OfficeHoursManager';
import KnowledgeBaseManager from '../components/KnowledgeBaseManager';

interface Request {
  id: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  sla_at: string;
  routed_to_id: string;
  routed_to_name?: string;
  routed_to_email?: string;
  requester_id?: string;
  requester_name?: string;
  requester_email?: string;
  request_type?: 'to_founder' | 'to_team';
  what_tried?: string;
  impact?: string;
  deadline?: string;
  created_at?: string;
  rejection_reason?: string;
  resolution_notes?: string;
}

interface TeamMember {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role?: string;
}

interface SLAStats {
  total_requests: number;
  breached: number;
  resolved: number;
  sla_compliance_rate: number;
}

interface DeflectionStats {
  total_attempts: number;
  successful_deflections: number;
  deflection_rate: number;
}

const FounderOSFirewall: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subTab, setSubTab] = useState<'queue' | 'hours' | 'kb' | 'analytics'>('queue');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [slaStats, setSlaStats] = useState<SLAStats | null>(null);
  const [deflectionStats, setDeflectionStats] = useState<DeflectionStats | null>(null);
  
  // Filter state for request queue
  const [requestFilter, setRequestFilter] = useState<'all' | 'received' | 'sent'>('all');
  
  // New state for create/view/delegate/reject
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Form state for new request
  const [newRequest, setNewRequest] = useState({
    description: '',
    category: 'general',
    urgency: 'P3',
    what_tried: '',
    impact: '',
    deadline: '',
    routed_to_id: ''
  });
  
  // Delegate state
  const [delegateTo, setDelegateTo] = useState('');

  useEffect(() => {
    const subTabFromUrl = searchParams.get('subTab') as 'queue' | 'hours' | 'kb' | 'analytics' | null;
    if (subTabFromUrl && ['queue', 'hours', 'kb', 'analytics'].includes(subTabFromUrl)) {
      setSubTab(subTabFromUrl);
    }
  }, []);

  const handleSubTabChange = (tab: 'queue' | 'hours' | 'kb' | 'analytics') => {
    setSubTab(tab);
    setSearchParams({ subTab: tab });
  };

  useEffect(() => {
    // Always fetch data, even without user context
    fetchData();
    fetchTeamMembers();
  }, [user, userLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get user-specific IDs
      const userId = user?.id || '';
      const orgId = user?.orgId || 'org-001';
      
      // Fetch requests for user - show requests where user is requester OR routed_to
      const requestsUrl = userId 
        ? `http://localhost:3000/api/v1/requests?org_id=${orgId}&user_id=${userId}`
        : `http://localhost:3000/api/v1/requests?org_id=${orgId}`;
      
      const [requestsRes, slaRes, deflectionRes] = await Promise.all([
        fetch(requestsUrl),
        fetch('http://localhost:3000/api/v1/sla-tracking/stats'),
        fetch('http://localhost:3000/api/v1/deflections/stats')
      ]);

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data.data || data || []);
      }
      if (slaRes.ok) {
        const data = await slaRes.json();
        setSlaStats(data.data);
      }
      if (deflectionRes.ok) {
        const data = await deflectionRes.json();
        setDeflectionStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const allMembers: TeamMember[] = [];
      const seenEmails = new Set<string>();
      
      // First, try to fetch all users directly (primary source) - using public endpoint
      try {
        const usersResponse = await fetch('http://localhost:3000/api/v1/users/list');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const users = usersData.data || usersData || [];
          
          for (const user of users) {
            if (user.email && !seenEmails.has(user.email)) {
              seenEmails.add(user.email);
              allMembers.push(user);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      
      // Also fetch from teams
      try {
        const teamsResponse = await fetch('http://localhost:3000/api/v1/teams', { headers });
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          const teams = teamsData.data || [];
          
          for (const team of teams) {
            try {
              const membersResponse = await fetch(`http://localhost:3000/api/v1/teams/${team.id}/members`, { headers });
              if (membersResponse.ok) {
                const membersData = await membersResponse.json();
                const members = membersData.data || [];
                
                for (const member of members) {
                  if (member.email && !seenEmails.has(member.email)) {
                    seenEmails.add(member.email);
                    allMembers.push(member);
                  }
                }
              }
            } catch (error) {
              console.error(`Error fetching members for team ${team.id}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
      
      setTeamMembers(allMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const getMemberDisplayName = (member: TeamMember): string => {
    if (member.firstName && member.lastName) {
      return `${member.firstName} ${member.lastName}`;
    }
    if (member.firstName) {
      return member.firstName;
    }
    if (member.name) {
      return member.name;
    }
    return member.email.split('@')[0];
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!newRequest.routed_to_id) {
      alert('Please select who to send this request to');
      return;
    }
    
    // Find the selected recipient's details
    const recipient = teamMembers.find(m => m.id === newRequest.routed_to_id || m.email === newRequest.routed_to_id);
    const recipientName = recipient ? getMemberDisplayName(recipient) : 'Unknown';
    const recipientEmail = recipient?.email || '';
    
    setSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: 'org-001',
          ...newRequest,
          requester_id: user?.id || 'user-001',
          requester_name: user ? `${user.firstName} ${user.lastName}` : 'Current User',
          requester_email: user?.email || 'user@company.com',
          routed_to_name: recipientName,
          routed_to_email: recipientEmail,
          status: 'pending'
        })
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        setNewRequest({
          description: '',
          category: 'general',
          urgency: 'P3',
          what_tried: '',
          impact: '',
          deadline: '',
          routed_to_id: ''
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelegateRequest = async () => {
    if (!selectedRequest || !delegateTo) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routed_to_id: delegateTo,
          status: 'in_progress'
        })
      });
      
      if (response.ok) {
        setShowDelegateModal(false);
        setSelectedRequest(null);
        setDelegateTo('');
        fetchData();
      }
    } catch (error) {
      console.error('Error delegating request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleOpenDelegate = (request: Request) => {
    setSelectedRequest(request);
    setShowDelegateModal(true);
  };

  const handleOpenReject = (request: Request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/requests/${selectedRequest.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejection_reason: rejectionReason || 'Request rejected'
        })
      });
      
      if (response.ok) {
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectionReason('');
        fetchData();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveRequest = async (request: Request) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/requests/${request.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution_notes: 'Request approved'
        })
      });
      
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  // Filter requests based on current user (match by email or ID)
  const getFilteredRequests = () => {
    const currentUserEmail = user?.email || 'admin@lapaas.com';
    const currentUserId = user?.id || 'user-001';
    
    if (requestFilter === 'received') {
      // Match by email or ID
      return requests.filter(r => 
        r.routed_to_id === currentUserId || 
        r.routed_to_id === 'user-001' || // Admin user
        r.routed_to_email === currentUserEmail
      );
    } else if (requestFilter === 'sent') {
      return requests.filter(r => 
        r.requester_id === currentUserId || 
        r.requester_id === 'user-001' ||
        r.requester_email === currentUserEmail
      );
    }
    return requests;
  };

  // Check if current user is the recipient of a request
  const isReceivedByCurrentUser = (request: Request) => {
    const currentUserEmail = user?.email || 'admin@lapaas.com';
    return request.routed_to_id === 'user-001' || 
           request.routed_to_email === currentUserEmail ||
           request.routed_to_email === 'admin@lapaas.com';
  };

  // Check if current user sent the request
  const isSentByCurrentUser = (request: Request) => {
    const currentUserEmail = user?.email || 'admin@lapaas.com';
    return request.requester_id === 'user-001' || 
           request.requester_email === currentUserEmail ||
           request.requester_email === 'admin@lapaas.com';
  };

  const filteredRequests = getFilteredRequests();

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'P1': 'bg-red-900 text-red-200 border-red-700',
      'P2': 'bg-orange-900 text-orange-200 border-orange-700',
      'P3': 'bg-yellow-900 text-yellow-200 border-yellow-700',
      'P4': 'bg-blue-900 text-blue-200 border-blue-700'
    };
    return colors[priority] || 'bg-gray-700 text-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-700 text-yellow-200',
      'in_progress': 'bg-blue-700 text-blue-200',
      'resolved': 'bg-green-700 text-green-200',
      'completed': 'bg-green-700 text-green-200',
      'rejected': 'bg-red-700 text-red-200',
      'escalated': 'bg-orange-700 text-orange-200'
    };
    return colors[status] || 'bg-gray-700 text-gray-200';
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  const overdue = requests.filter(r => new Date(r.sla_at) < new Date() && r.status === 'pending');
  const today = requests.filter(r => {
    const slaDate = new Date(r.sla_at).toDateString();
    const todayDate = new Date().toDateString();
    return slaDate === todayDate && r.status === 'pending';
  });
  const thisWeek = requests.filter(r => {
    const slaDate = new Date(r.sla_at);
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return slaDate <= weekFromNow && r.status === 'pending';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full">
        {/* Header with Stats */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <Shield className="text-blue-400 w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Interruption Firewall</h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6">Manage office hours, KB articles, and request deflection</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <AlertCircle className="text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-400">Total Requests</h3>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{slaStats?.total_requests || 0}</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <TrendingDown className="text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-400">SLA Compliance</h3>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">{slaStats?.sla_compliance_rate || 0}%</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <Shield className="text-purple-400 w-4 h-4 sm:w-5 sm:h-5" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-400">Deflection Rate</h3>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-400">{deflectionStats?.deflection_rate || 0}%</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                <BookOpen className="text-yellow-400 w-4 h-4 sm:w-5 sm:h-5" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-400">Deflections</h3>
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{deflectionStats?.successful_deflections || 0}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-slate-700 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => handleSubTabChange('queue')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
              subTab === 'queue'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              Request Queue
            </div>
          </button>
          <button
            onClick={() => handleSubTabChange('hours')}
            className={`px-4 py-2 font-medium transition ${
              subTab === 'hours'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={18} />
              Office Hours
            </div>
          </button>
          <button
            onClick={() => handleSubTabChange('kb')}
            className={`px-4 py-2 font-medium transition ${
              subTab === 'kb'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} />
              Knowledge Base
            </div>
          </button>
          <button
            onClick={() => handleSubTabChange('analytics')}
            className={`px-4 py-2 font-medium transition ${
              subTab === 'analytics'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingDown size={18} />
              Statistics
            </div>
          </button>
        </div>

        {/* Content */}
        <div>
          {/* Queue Tab */}
          {subTab === 'queue' && (
            <div>
              {/* Header with Filter and Create Button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-white">Request Queue</h2>
                  {/* Filter Tabs */}
                  <div className="flex bg-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => setRequestFilter('all')}
                      className={`px-3 py-1 text-sm rounded ${requestFilter === 'all' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      All ({requests.length})
                    </button>
                    <button
                      onClick={() => setRequestFilter('received')}
                      className={`px-3 py-1 text-sm rounded ${requestFilter === 'received' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      📥 Received
                    </button>
                    <button
                      onClick={() => setRequestFilter('sent')}
                      className={`px-3 py-1 text-sm rounded ${requestFilter === 'sent' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      📤 Sent
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <Plus size={18} />
                  Create Request
                </button>
              </div>

              {/* SLA Board */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                  <p className="text-red-200 text-sm font-semibold mb-2">⚠️ Overdue</p>
                  <p className="text-3xl font-bold text-red-300">{overdue.length}</p>
                  <p className="text-xs text-red-200 mt-1">Requires immediate action</p>
                </div>
                <div className="bg-orange-900 border border-orange-700 rounded-lg p-4">
                  <p className="text-orange-200 text-sm font-semibold mb-2">📅 Today</p>
                  <p className="text-3xl font-bold text-orange-300">{today.length}</p>
                  <p className="text-xs text-orange-200 mt-1">Due today</p>
                </div>
                <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm font-semibold mb-2">📆 This Week</p>
                  <p className="text-3xl font-bold text-yellow-300">{thisWeek.length}</p>
                  <p className="text-xs text-yellow-200 mt-1">Due this week</p>
                </div>
              </div>

              {/* Requests List */}
              <div className="space-y-3">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
                    <AlertCircle size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 mb-4">No requests {requestFilter !== 'all' ? `in "${requestFilter}" filter` : 'yet'}</p>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 transition"
                    >
                      <Plus size={18} /> Create Your First Request
                    </button>
                  </div>
                ) : (
                  filteredRequests.map(request => {
                    const isReceivedByMe = isReceivedByCurrentUser(request);
                    const isSentByMe = isSentByCurrentUser(request);
                    
                    return (
                      <div 
                        key={request.id} 
                        className={`p-4 bg-slate-800 border rounded-lg hover:border-slate-500 transition cursor-pointer ${
                          request.request_type === 'to_founder' ? 'border-green-700/50' : 'border-slate-700'
                        }`}
                        onClick={() => handleViewRequest(request)}
                      >
                        {/* Request Type Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          {request.request_type === 'to_founder' ? (
                            <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-400 rounded border border-green-700/50">
                              🎯 To Founder
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded border border-blue-700/50">
                              👥 Team Request
                            </span>
                          )}
                          {isReceivedByMe && (
                            <span className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-400 rounded">
                              📥 Received
                            </span>
                          )}
                          {isSentByMe && (
                            <span className="text-xs px-2 py-0.5 bg-orange-900/50 text-orange-400 rounded">
                              📤 Sent by you
                            </span>
                          )}
                        </div>

                        {/* Request Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-lg">{request.description}</p>
                            <p className="text-sm text-gray-400 mt-1">
                              <span className="text-gray-500">Category:</span> {request.category}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getPriorityColor(request.urgency)}`}>
                              {request.urgency}
                            </span>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                        </div>

                        {/* Requester & Recipient Info */}
                        <div className="grid grid-cols-2 gap-4 mt-3 p-3 bg-slate-900/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold">
                              {(request.requester_name || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Requested by</p>
                              <p className="text-sm text-white font-medium">{request.requester_name || 'Unknown'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowRight size={16} className="text-gray-500" />
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {(request.routed_to_name || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Sent to</p>
                              <p className="text-sm text-white font-medium">{request.routed_to_name || 'Unassigned'}</p>
                            </div>
                          </div>
                        </div>

                        {/* SLA Info */}
                        <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Created: {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className={`flex items-center gap-1 ${new Date(request.sla_at) < new Date() ? 'text-red-400' : 'text-gray-400'}`}>
                            <AlertCircle size={12} />
                            SLA: {new Date(request.sla_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Action Buttons - Only show for received requests that are pending */}
                        {request.status === 'pending' && isReceivedByMe && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleApproveRequest(request); }}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition"
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenReject(request); }}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenDelegate(request); }}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition"
                            >
                              <UserPlus size={14} />
                              Delegate
                            </button>
                          </div>
                        )}

                        {/* Show rejection reason if rejected */}
                        {request.status === 'rejected' && request.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                            <p className="text-xs text-red-400 font-medium">Rejection Reason:</p>
                            <p className="text-sm text-red-200">{request.rejection_reason}</p>
                          </div>
                        )}

                        {/* View Details for non-actionable requests */}
                        {(request.status !== 'pending' || !isReceivedByMe) && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleViewRequest(request); }}
                              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition"
                            >
                              <MessageSquare size={14} />
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Office Hours Tab */}
          {subTab === 'hours' && (
            <div className="grid grid-cols-2 gap-6">
              <OfficeHoursManager userId="user-001" />
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">How Office Hours Work</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>✅ Configure when you're available for non-urgent requests</p>
                  <p>✅ P3 and P4 requests automatically batched to office hours</p>
                  <p>✅ Reduces interruptions during focus time</p>
                  <p>✅ Team members see your availability</p>
                  <p>✅ Auto-batch notifications sent before office hours</p>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                  <p className="text-sm text-blue-400">
                    💡 Tip: Set office hours during natural breaks in your schedule
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* KB Tab */}
          {subTab === 'kb' && (
            <KnowledgeBaseManager 
              isFounder={user?.role === 'admin'} 
              orgId="org-001"
              userId={user?.id}
            />
          )}

          {/* Analytics Tab */}
          {subTab === 'analytics' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">SLA Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Compliance Rate</span>
                      <span className="text-white font-semibold">{slaStats?.sla_compliance_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${slaStats?.sla_compliance_rate || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="p-3 bg-slate-700/50 rounded text-center">
                      <p className="text-2xl font-bold text-white">{slaStats?.total_requests || 0}</p>
                      <p className="text-xs text-gray-400">Total</p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded text-center">
                      <p className="text-2xl font-bold text-green-400">{slaStats?.resolved || 0}</p>
                      <p className="text-xs text-gray-400">Resolved</p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded text-center">
                      <p className="text-2xl font-bold text-red-400">{slaStats?.breached || 0}</p>
                      <p className="text-xs text-gray-400">Breached</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Deflection Impact</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Deflection Rate</span>
                      <span className="text-white font-semibold">{deflectionStats?.deflection_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${deflectionStats?.deflection_rate || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-slate-700/50 rounded text-center">
                      <p className="text-2xl font-bold text-white">{deflectionStats?.total_attempts || 0}</p>
                      <p className="text-xs text-gray-400">Attempts</p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded text-center">
                      <p className="text-2xl font-bold text-purple-400">{deflectionStats?.successful_deflections || 0}</p>
                      <p className="text-xs text-gray-400">Deflected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Request Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Create New Request</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white h-24"
                  placeholder="Describe your request..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <div className="relative">
                    <select
                      value={newRequest.category}
                      onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white appearance-none cursor-pointer"
                    >
                      <option value="general">General</option>
                      <option value="technical">Technical</option>
                      <option value="hr">HR</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Operations</option>
                      <option value="sales">Sales</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Urgency</label>
                  <div className="relative">
                    <select
                      value={newRequest.urgency}
                      onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white appearance-none cursor-pointer"
                    >
                      <option value="P1">P1 - Critical</option>
                      <option value="P2">P2 - High</option>
                      <option value="P3">P3 - Medium</option>
                      <option value="P4">P4 - Low</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">What have you tried?</label>
                <textarea
                  value={newRequest.what_tried}
                  onChange={(e) => setNewRequest({ ...newRequest, what_tried: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white h-20"
                  placeholder="Describe what you've already tried..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Impact</label>
                <input
                  type="text"
                  value={newRequest.impact}
                  onChange={(e) => setNewRequest({ ...newRequest, impact: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  placeholder="What's the impact if not resolved?"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={newRequest.deadline}
                    onChange={(e) => setNewRequest({ ...newRequest, deadline: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Send To</label>
                  <div className="relative">
                    <select
                      value={newRequest.routed_to_id}
                      onChange={(e) => setNewRequest({ ...newRequest, routed_to_id: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white appearance-none cursor-pointer"
                    >
                      <option value="">Select recipient...</option>
                      {teamMembers.map((member) => (
                        <option key={member.id || member.email} value={member.id || member.email}>
                          {getMemberDisplayName(member)} ({member.email})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
                >
                  <Send size={18} />
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Request Details</h3>
                {selectedRequest.request_type === 'to_founder' ? (
                  <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-400 rounded border border-green-700/50">
                    🎯 To Founder
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 bg-blue-900/50 text-blue-400 rounded border border-blue-700/50">
                    👥 Team Request
                  </span>
                )}
              </div>
              <button onClick={() => { setShowViewModal(false); setSelectedRequest(null); }} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Requester & Recipient Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold">
                    {(selectedRequest.requester_name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Requested by</p>
                    <p className="text-white font-medium">{selectedRequest.requester_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{selectedRequest.requester_email || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowRight size={20} className="text-gray-500" />
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {(selectedRequest.routed_to_name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Sent to</p>
                    <p className="text-white font-medium">{selectedRequest.routed_to_name || 'Unassigned'}</p>
                    <p className="text-xs text-gray-400">{selectedRequest.routed_to_email || ''}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400">Description</p>
                <p className="text-white font-medium">{selectedRequest.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="text-white">{selectedRequest.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Urgency</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getPriorityColor(selectedRequest.urgency)}`}>
                    {selectedRequest.urgency}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">SLA Deadline</p>
                  <p className={`text-sm ${new Date(selectedRequest.sla_at) < new Date() ? 'text-red-400' : 'text-white'}`}>
                    {new Date(selectedRequest.sla_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedRequest.what_tried && (
                <div>
                  <p className="text-sm text-gray-400">What was tried</p>
                  <p className="text-white">{selectedRequest.what_tried}</p>
                </div>
              )}
              
              {selectedRequest.impact && (
                <div>
                  <p className="text-sm text-gray-400">Impact</p>
                  <p className="text-white">{selectedRequest.impact}</p>
                </div>
              )}

              {/* Show rejection reason if rejected */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejection_reason && (
                <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <p className="text-xs text-red-400 font-medium">Rejection Reason:</p>
                  <p className="text-sm text-red-200">{selectedRequest.rejection_reason}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                {selectedRequest.status === 'pending' && isReceivedByCurrentUser(selectedRequest) && (
                  <>
                    <button
                      onClick={() => { setShowViewModal(false); handleApproveRequest(selectedRequest); }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => { setShowViewModal(false); handleOpenReject(selectedRequest); }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setShowViewModal(false); handleOpenDelegate(selectedRequest); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
                >
                  <UserPlus size={18} />
                  Delegate
                </button>
                <button
                  onClick={() => { setShowViewModal(false); setSelectedRequest(null); }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delegate Request Modal */}
      {showDelegateModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Delegate Request</h3>
              <button onClick={() => { setShowDelegateModal(false); setSelectedRequest(null); setDelegateTo(''); }} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-700 rounded">
                <p className="text-sm text-gray-400">Request</p>
                <p className="text-white font-medium">{selectedRequest.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Delegate To</label>
                <div className="relative">
                  <select
                    value={delegateTo}
                    onChange={(e) => setDelegateTo(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2.5 text-white appearance-none cursor-pointer"
                  >
                    <option value="">Select team member...</option>
                    {teamMembers.map((member) => (
                      <option key={member.id || member.email} value={member.id || member.email}>
                        {getMemberDisplayName(member)} ({member.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleDelegateRequest}
                  disabled={!delegateTo || submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
                >
                  <UserPlus size={18} />
                  {submitting ? 'Delegating...' : 'Delegate'}
                </button>
                <button
                  onClick={() => { setShowDelegateModal(false); setSelectedRequest(null); setDelegateTo(''); }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Request Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <XCircle className="text-red-400" size={24} />
                Reject Request
              </h3>
              <button onClick={() => { setShowRejectModal(false); setSelectedRequest(null); setRejectionReason(''); }} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-700 rounded">
                <p className="text-sm text-gray-400">Request from {selectedRequest.requester_name || 'Unknown'}</p>
                <p className="text-white font-medium">{selectedRequest.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white h-24"
                  placeholder="Please provide a reason for rejecting this request..."
                  required
                />
              </div>
              
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                <p className="text-sm text-red-300">
                  ⚠️ This action will notify the requester that their request has been rejected.
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleRejectRequest}
                  disabled={!rejectionReason.trim() || submitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
                >
                  <XCircle size={18} />
                  {submitting ? 'Rejecting...' : 'Reject Request'}
                </button>
                <button
                  onClick={() => { setShowRejectModal(false); setSelectedRequest(null); setRejectionReason(''); }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderOSFirewall;
