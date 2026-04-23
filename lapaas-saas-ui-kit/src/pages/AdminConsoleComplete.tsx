import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, Zap, TrendingUp, Settings, LogOut, Menu, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Module {
  id: string;
  name: string;
  price: number;
  status: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  modules: string[];
  seats: number;
  features: string[];
}

interface DashboardMetrics {
  organizations: number | { total: number; active?: number; growth_this_month?: number };
  users: number | { total: number; active?: number; growth_this_month?: number };
  modules: number | { total: number; active?: number; adoption_rate?: number };
  revenue: number | { monthly: number; growth_this_month?: number; arr?: number };
  subscriptions: number | { total: number; free?: number; starter?: number; pro?: number; scale?: number };
  aiCredits: number | { total_allocated?: number; used_this_month?: number; remaining?: number };
}

export default function AdminConsoleComplete() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    seats: 3,
    modules: [] as string[],
    features: [] as string[]
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard metrics
      const metricsRes = await fetch('http://localhost:3000/api/v1/admin/dashboard/metrics');
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.data);
      }

      // Fetch modules
      const modulesRes = await fetch('http://localhost:3000/api/v1/admin/modules');
      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setModules(modulesData.data);
      }

      // Fetch plans (if endpoint exists)
      const plansRes = await fetch('http://localhost:3000/api/v1/admin/plans');
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.data);
      } else {
        // Use default plans if endpoint doesn't exist
        setPlans(getDefaultPlans());
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      // Use default data on error
      setMetrics(getDefaultMetrics());
      setModules(getDefaultModules());
      setPlans(getDefaultPlans());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultMetrics = (): DashboardMetrics => ({
    organizations: 24,
    users: 156,
    modules: 8,
    revenue: 125400,
    subscriptions: 18,
    aiCredits: 35
  });

  const getDefaultModules = (): Module[] => [
    { id: 'finance-os', name: 'Finance OS', price: 1999, status: 'active' },
    { id: 'sales-os', name: 'Sales OS', price: 1999, status: 'active' },
    { id: 'operations-os', name: 'Operations OS', price: 1999, status: 'active' },
    { id: 'people-os', name: 'People OS', price: 1499, status: 'active' },
    { id: 'customer-os', name: 'Customer OS', price: 1499, status: 'active' },
    { id: 'automation-os', name: 'Automation OS', price: 999, status: 'active' },
    { id: 'founder-os', name: 'Founder OS', price: 999, status: 'active' },
    { id: 'bms-planning', name: 'BMS & Planning', price: 1499, status: 'active' }
  ];

  const getDefaultPlans = (): Plan[] => [
    {
      id: '1',
      name: 'Starter',
      price: 1499,
      seats: 3,
      modules: ['finance-os', 'sales-os'],
      features: ['Basic analytics', 'Email support', '1 team']
    },
    {
      id: '2',
      name: 'Professional',
      price: 7495,
      seats: 10,
      modules: ['finance-os', 'sales-os', 'operations-os', 'people-os'],
      features: ['Advanced analytics', 'Priority support', '5 teams', 'Custom integrations']
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 45000,
      seats: 50,
      modules: ['finance-os', 'sales-os', 'operations-os', 'people-os', 'customer-os', 'automation-os'],
      features: ['Full analytics', '24/7 support', 'Unlimited teams', 'Custom integrations', 'Dedicated account manager']
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleSavePlan = async () => {
    if (!formData.name || formData.price <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const planData = {
      ...formData,
      id: editingPlan?.id || Date.now().toString()
    };

    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? planData : p));
    } else {
      setPlans([...plans, planData]);
    }

    resetForm();
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      seats: plan.seats,
      modules: plan.modules,
      features: plan.features
    });
    setShowPlanForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0, seats: 3, modules: [], features: [] });
    setEditingPlan(null);
    setShowPlanForm(false);
  };

  const toggleModule = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.includes(moduleId)
        ? prev.modules.filter(m => m !== moduleId)
        : [...prev.modules, moduleId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Admin Console...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-green-400 ${sidebarOpen ? 'text-xl' : 'hidden'}`}>Lapaas</h1>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'modules', label: 'Modules', icon: Package },
            { id: 'plans', label: 'Plans', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  activeTab === item.id
                    ? 'bg-green-500 text-white'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white">Admin Console</h2>
          <p className="text-gray-400 mt-1">Manage your Lapaas OS platform</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm">Organizations</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {typeof metrics.organizations === 'object' ? metrics.organizations.total : metrics.organizations}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {typeof metrics.users === 'object' ? metrics.users.total : metrics.users}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-400 text-sm">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    ₹{((typeof metrics.revenue === 'object' ? metrics.revenue.monthly : metrics.revenue) / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(module => (
                <div key={module.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white">{module.name}</h3>
                  <p className="text-gray-400 mt-2">₹{module.price.toLocaleString()}</p>
                  <span className="inline-block mt-4 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                    {module.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Subscription Plans</h3>
                <button
                  onClick={() => setShowPlanForm(true)}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  <Plus size={20} />
                  New Plan
                </button>
              </div>

              {showPlanForm && (
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h4 className="text-lg font-bold text-white mb-4">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Plan Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        placeholder="e.g., Professional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        placeholder="7495"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Seats</label>
                      <input
                        type="number"
                        value={formData.seats}
                        onChange={e => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Included Modules</label>
                      <div className="grid grid-cols-2 gap-2">
                        {modules.map(module => (
                          <label key={module.id} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.modules.includes(module.id)}
                              onChange={() => toggleModule(module.id)}
                              className="w-4 h-4"
                            />
                            {module.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={handleSavePlan}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Save Plan
                      </button>
                      <button
                        onClick={resetForm}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                        <p className="text-2xl font-bold text-green-400 mt-2">₹{plan.price.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{plan.seats} seats</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-300">Modules ({plan.modules.length}):</p>
                      {plan.modules.map(moduleId => {
                        const module = modules.find(m => m.id === moduleId);
                        return module ? (
                          <p key={moduleId} className="text-xs text-gray-400">• {module.name}</p>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Admin Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Platform Name</label>
                  <input type="text" value="Lapaas OS" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Support Email</label>
                  <input type="email" value="support@lapaas.com" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Timezone</label>
                  <input type="text" value="Asia/Kolkata" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white" readOnly />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
