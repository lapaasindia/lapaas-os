import { useState, useEffect } from 'react';
import { ChevronRight, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: string;
  color: string;
  pages: Array<{
    id: string;
    name: string;
    icon: string;
    url: string;
  }>;
}

interface DashboardStats {
  runway_weeks: number;
  current_cash: number;
  collections_current: number;
  payables_due: number;
  compliance_pending: number;
  total_invoices: number;
  overdue_invoices: number;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  const modules: Module[] = [
    {
      id: 'finance',
      name: 'Finance OS',
      icon: '📊',
      description: '13-week cashflow, collections, payables, compliance',
      status: 'active',
      color: 'from-blue-500 to-blue-600',
      pages: [
        { id: 'dashboard', name: 'Finance Dashboard', icon: '📊', url: '/finance' },
        { id: 'cashflow', name: 'Cashflow Board', icon: '💹', url: '/finance/cashflow' },
        { id: 'collections', name: 'Collections', icon: '💰', url: '/finance/collections' },
        { id: 'payables', name: 'Payables', icon: '📤', url: '/finance/payables' },
        { id: 'compliance', name: 'Compliance', icon: '📋', url: '/finance/compliance' },
        { id: 'reserves', name: 'Reserves', icon: '🏦', url: '/finance/reserves' },
        { id: 'controls', name: 'Controls', icon: '🔒', url: '/finance/controls' }
      ]
    },
    {
      id: 'founder-os',
      name: 'Founder OS',
      icon: '🚀',
      description: 'Personal productivity, meetings, interruption firewall',
      status: 'active',
      color: 'from-green-500 to-green-600',
      pages: [
        { id: 'dashboard', name: 'Founder OS', icon: '🚀', url: '/founder-os' },
        { id: 'calendar', name: 'Calendar', icon: '📅', url: '/calendar' },
        { id: 'tasks', name: 'Tasks', icon: '✓', url: '/tasks' },
        { id: 'my-week', name: 'My Week', icon: '📋', url: '/my-week' }
      ]
    },
    {
      id: 'sales',
      name: 'Sales OS',
      icon: '🎯',
      description: 'Pipeline, deals, forecasting (Coming Soon)',
      status: 'coming',
      color: 'from-purple-500 to-purple-600',
      pages: []
    },
    {
      id: 'operations',
      name: 'Operations OS',
      icon: '⚙️',
      description: 'Projects, tasks, workflows (Coming Soon)',
      status: 'coming',
      color: 'from-orange-500 to-orange-600',
      pages: []
    },
    {
      id: 'hr',
      name: 'HR OS',
      icon: '👔',
      description: 'Team, payroll, performance (Coming Soon)',
      status: 'coming',
      color: 'from-pink-500 to-pink-600',
      pages: []
    },
    {
      id: 'analytics',
      name: 'Analytics OS',
      icon: '📈',
      description: 'Reports, dashboards, insights (Coming Soon)',
      status: 'coming',
      color: 'from-indigo-500 to-indigo-600',
      pages: []
    }
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/finance/dashboard');
      if (response.ok) {
        const result = await response.json();
        setStats({
          runway_weeks: result.data.runway_weeks,
          current_cash: result.data.current_cash,
          collections_current: result.data.collections_current,
          payables_due: result.data.payables_due,
          compliance_pending: result.data.compliance_pending,
          total_invoices: 5,
          overdue_invoices: 3
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        runway_weeks: 13,
        current_cash: 1250000,
        collections_current: 75,
        payables_due: 300000,
        compliance_pending: 3,
        total_invoices: 5,
        overdue_invoices: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🚀</div>
            <div>
              <h1 className="text-2xl font-bold text-white">LaPaaS OS</h1>
              <p className="text-sm text-gray-400">Business Operating System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
            >
              <Settings size={18} />
              Admin
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs">Runway</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.runway_weeks}w</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs">Cash</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">₹{(stats.current_cash / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs">Collections %</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{stats.collections_current}%</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs">Payables Due</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">₹{(stats.payables_due / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-xs">Overdue</p>
              <p className="text-2xl font-bold text-red-400 mt-1">{stats.overdue_invoices}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Modules Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-white mb-6">Business Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map(module => (
                <div
                  key={module.id}
                  onClick={() => setSelectedModule(module)}
                  className={`p-6 rounded-lg border cursor-pointer transition transform hover:scale-105 ${
                    selectedModule?.id === module.id
                      ? 'bg-gradient-to-br ' + module.color + ' border-transparent'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{module.icon}</div>
                    {module.status === 'coming' && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">Coming Soon</span>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${selectedModule?.id === module.id ? 'text-white' : 'text-white'}`}>
                    {module.name}
                  </h3>
                  <p className={`text-sm ${selectedModule?.id === module.id ? 'text-white/80' : 'text-gray-400'}`}>
                    {module.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Module Pages Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 sticky top-24">
              {selectedModule ? (
                <>
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-bold text-white">{selectedModule.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{selectedModule.pages.length} pages</p>
                  </div>
                  <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                    {selectedModule.pages.length > 0 ? (
                      selectedModule.pages.map(page => (
                        <button
                          key={page.id}
                          onClick={() => navigate(page.url)}
                          className="w-full p-3 text-left hover:bg-gray-700 transition flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{page.icon}</span>
                            <span className="text-sm text-gray-300 group-hover:text-white">{page.name}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-400">Coming soon...</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-400 text-sm">Select a module to view pages</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/finance')}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition group"
            >
              <p className="text-sm text-gray-400 group-hover:text-gray-300">Finance Dashboard</p>
              <p className="text-lg font-semibold text-white mt-1">13-Week Runway</p>
            </button>
            <button
              onClick={() => navigate('/collections')}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition group"
            >
              <p className="text-sm text-gray-400 group-hover:text-gray-300">Collections</p>
              <p className="text-lg font-semibold text-white mt-1">Invoice Tracking</p>
            </button>
            <button
              onClick={() => navigate('/finance/cashflow')}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition group"
            >
              <p className="text-sm text-gray-400 group-hover:text-gray-300">Cashflow</p>
              <p className="text-lg font-semibold text-white mt-1">Forecast Board</p>
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition group"
            >
              <p className="text-sm text-gray-400 group-hover:text-gray-300">Admin</p>
              <p className="text-lg font-semibold text-white mt-1">Settings</p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>LaPaaS OS v1.0 • Finance OS Phase 1 • Collections Engine Integrated</p>
        </div>
      </div>
    </div>
  );
}
