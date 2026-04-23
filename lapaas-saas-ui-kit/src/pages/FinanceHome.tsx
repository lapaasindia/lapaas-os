import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, Clock, DollarSign, Users, FileText, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardData {
  runway_weeks: number;
  current_cash: number;
  monthly_burn: number;
  collections_current: number;
  payables_due: number;
  compliance_pending: number;
  today_actions: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    due_at: string;
  }>;
  exceptions: Array<{
    id: string;
    type: string;
    title: string;
    severity: string;
    action: string;
  }>;
  modules: Array<{
    id: string;
    name: string;
    icon: string;
    status: string;
    url: string;
  }>;
}

export default function FinanceHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/finance/dashboard');
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      // Use fallback data
      setData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = (): DashboardData => ({
    runway_weeks: 13,
    current_cash: 1250000,
    monthly_burn: 420000,
    collections_current: 75,
    payables_due: 300000,
    compliance_pending: 3,
    today_actions: [
      {
        id: '1',
        type: 'collections',
        title: 'Send reminders to 3 overdue invoices',
        description: 'INV-001, INV-003, INV-004',
        priority: 'high',
        due_at: '2025-11-08'
      },
      {
        id: '2',
        type: 'payables',
        title: 'Approve pay run for 15th',
        description: '₹300K to 5 vendors',
        priority: 'high',
        due_at: '2025-11-08'
      },
      {
        id: '3',
        type: 'compliance',
        title: 'GST filing due in 12 days',
        description: 'GSTR-3B for Oct 2025',
        priority: 'medium',
        due_at: '2025-11-20'
      },
      {
        id: '4',
        type: 'cashflow',
        title: 'Update weekly forecast',
        description: 'Review variance from last week',
        priority: 'medium',
        due_at: '2025-11-10'
      }
    ],
    exceptions: [
      {
        id: '1',
        type: 'collections',
        title: 'INV-003 45 days overdue',
        severity: 'critical',
        action: 'Escalate to CFO'
      },
      {
        id: '2',
        type: 'payables',
        title: 'Vendor B payment mismatch',
        severity: 'high',
        action: 'Review 3-way match'
      },
      {
        id: '3',
        type: 'cashflow',
        title: 'Week 5 cash dip below ₹500K',
        severity: 'medium',
        action: 'Review scenarios'
      }
    ],
    modules: [
      {
        id: '1',
        name: 'Cashflow',
        icon: '📊',
        status: 'active',
        url: '/finance/cashflow'
      },
      {
        id: '2',
        name: 'Collections',
        icon: '💰',
        status: 'active',
        url: '/finance/collections'
      },
      {
        id: '3',
        name: 'Payables',
        icon: '📤',
        status: 'active',
        url: '/finance/payables'
      },
      {
        id: '4',
        name: 'Compliance',
        icon: '📋',
        status: 'active',
        url: '/finance/compliance'
      },
      {
        id: '5',
        name: 'Reserves',
        icon: '🏦',
        status: 'active',
        url: '/finance/reserves'
      },
      {
        id: '6',
        name: 'Controls',
        icon: '🔒',
        status: 'active',
        url: '/finance/controls'
      }
    ]
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Finance Dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-red-400 text-xl">Failed to load dashboard</div>
      </div>
    );
  }

  const getRunwayColor = (weeks: number) => {
    if (weeks >= 13) return 'text-green-400';
    if (weeks >= 8) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-l-4 border-red-500';
      case 'high':
        return 'bg-orange-500/10 border-l-4 border-orange-500';
      case 'medium':
        return 'bg-yellow-500/10 border-l-4 border-yellow-500';
      default:
        return 'bg-blue-500/10 border-l-4 border-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Finance Command Center</h1>
          <p className="text-gray-400">Your weekly rhythm for cash clarity, collections, and compliance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Runway</p>
                <p className={`text-3xl font-bold mt-2 ${getRunwayColor(data.runway_weeks)}`}>
                  {data.runway_weeks} weeks
                </p>
              </div>
              <TrendingUp className={`${getRunwayColor(data.runway_weeks)}`} size={32} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Cash</p>
                <p className="text-3xl font-bold text-white mt-2">₹{(data.current_cash / 100000).toFixed(1)}L</p>
              </div>
              <DollarSign className="text-blue-400" size={32} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Collections Current %</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{data.collections_current}%</p>
              </div>
              <Users className="text-green-400" size={32} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Payables Due</p>
                <p className="text-3xl font-bold text-orange-400 mt-2">₹{(data.payables_due / 100000).toFixed(1)}L</p>
              </div>
              <Clock className="text-orange-400" size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Actions */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap size={24} className="text-yellow-400" />
              Today's Actions
            </h3>
            <div className="space-y-3">
              {data.today_actions.map(action => (
                <div key={action.id} className={`p-4 rounded-lg border ${getPriorityColor(action.priority)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{action.title}</p>
                      <p className="text-sm opacity-80 mt-1">{action.description}</p>
                    </div>
                    <span className="text-xs opacity-70 whitespace-nowrap ml-2">
                      {new Date(action.due_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText size={24} className="text-blue-400" />
              Compliance
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Pending Filings</p>
                <p className="text-3xl font-bold text-white mt-2">{data.compliance_pending}</p>
              </div>
              <Link
                to="/finance/compliance"
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-semibold transition text-center flex items-center justify-center gap-2"
              >
                View Calendar <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Exceptions */}
        {data.exceptions.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <AlertCircle size={24} className="text-red-400" />
              Exceptions & Alerts
            </h3>
            <div className="space-y-3">
              {data.exceptions.map(exception => (
                <div key={exception.id} className={`p-4 rounded-lg ${getSeverityColor(exception.severity)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">{exception.title}</p>
                      <p className="text-sm text-gray-300 mt-1">{exception.action}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      exception.severity === 'critical' ? 'bg-red-500/30 text-red-300' :
                      exception.severity === 'high' ? 'bg-orange-500/30 text-orange-300' :
                      'bg-yellow-500/30 text-yellow-300'
                    }`}>
                      {exception.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finance Modules */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-6">Finance Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.modules.map(module => (
              <Link
                key={module.id}
                to={module.url}
                className="p-6 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl mb-2">{module.icon}</p>
                    <p className="text-white font-semibold">{module.name}</p>
                    <p className="text-xs text-gray-400 mt-1 capitalize">{module.status}</p>
                  </div>
                  <ChevronRight className="text-gray-500 group-hover:text-gray-300 transition" size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
