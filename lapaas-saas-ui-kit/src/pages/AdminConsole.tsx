import { useState } from 'react';
import { BarChart3, Users, Package, Zap, TrendingUp, Settings, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminConsole() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const metrics = {
    organizations: 24,
    users: 156,
    modules: 8,
    revenue: 125400,
    subscriptions: 18,
    aiCredits: 35
  };

  const moduleAdoption = [
    { name: 'Finance OS', adoption: 85, orgs: 15 },
    { name: 'Sales OS', adoption: 72, orgs: 12 },
    { name: 'Operations OS', adoption: 68, orgs: 10 },
    { name: 'People OS', adoption: 65, orgs: 9 },
    { name: 'Customer OS', adoption: 58, orgs: 8 }
  ];

  const organizations = [
    { id: 1, name: 'TechStartup Inc', plan: 'Pro', users: 5, spend: 7495 },
    { id: 2, name: 'Manufacturing Co', plan: 'Scale', users: 24, spend: 45000 },
    { id: 3, name: 'Service Agency', plan: 'Starter', users: 3, spend: 1499 }
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className={`font-bold text-green-400 ${sidebarOpen ? 'text-xl' : 'hidden'}`}>Lapaas</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === 'overview'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <BarChart3 size={20} />
            {sidebarOpen && <span>Overview</span>}
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === 'modules'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Package size={20} />
            {sidebarOpen && <span>Modules</span>}
          </button>

          <button
            onClick={() => setActiveTab('organizations')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === 'organizations'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Users size={20} />
            {sidebarOpen && <span>Organizations</span>}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === 'settings'
                ? 'bg-green-500 text-white'
                : 'text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Settings size={20} />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </nav>

        {/* Logout */}
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
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-white">Admin Console</h2>
          <p className="text-gray-400 mt-1">Manage your Lapaas OS platform</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Organizations</p>
                      <p className="text-3xl font-bold text-white mt-2">{metrics.organizations}</p>
                    </div>
                    <Users className="text-blue-400" size={32} />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-white mt-2">{metrics.users}</p>
                    </div>
                    <Users className="text-green-400" size={32} />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-white mt-2">₹{(metrics.revenue / 1000).toFixed(0)}K</p>
                    </div>
                    <TrendingUp className="text-green-400" size={32} />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Modules</p>
                      <p className="text-3xl font-bold text-white mt-2">{metrics.modules}</p>
                    </div>
                    <Package className="text-purple-400" size={32} />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Subscriptions</p>
                      <p className="text-3xl font-bold text-white mt-2">{metrics.subscriptions}</p>
                    </div>
                    <BarChart3 className="text-orange-400" size={32} />
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">AI Credits Used</p>
                      <p className="text-3xl font-bold text-white mt-2">{metrics.aiCredits}%</p>
                    </div>
                    <Zap className="text-yellow-400" size={32} />
                  </div>
                </div>
              </div>

              {/* Module Adoption */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Module Adoption</h3>
                <div className="space-y-4">
                  {moduleAdoption.map((module, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">{module.name}</span>
                        <span className="text-green-400 font-semibold">{module.adoption}%</span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${module.adoption}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{module.orgs} organizations</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Organizations Tab */}
          {activeTab === 'organizations' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Organization</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Plan</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Users</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Monthly Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-700 transition">
                        <td className="px-6 py-4 text-white font-semibold">{org.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                            {org.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{org.users}</td>
                        <td className="px-6 py-4 text-gray-300 font-semibold">₹{org.spend.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Finance OS', status: 'Active', users: 45 },
                { name: 'Sales OS', status: 'Active', users: 36 },
                { name: 'Operations OS', status: 'Active', users: 30 },
                { name: 'People OS', status: 'Active', users: 27 },
                { name: 'Customer OS', status: 'Active', users: 24 },
                { name: 'Automation OS', status: 'Active', users: 18 }
              ].map((module, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{module.name}</h3>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      {module.status}
                    </span>
                  </div>
                  <p className="text-gray-400">Active Users: <span className="text-white font-semibold">{module.users}</span></p>
                </div>
              ))}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Admin Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Platform Name</label>
                  <input
                    type="text"
                    value="Lapaas OS"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Support Email</label>
                  <input
                    type="email"
                    value="support@lapaas.com"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Timezone</label>
                  <input
                    type="text"
                    value="Asia/Kolkata"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                    readOnly
                  />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-gray-300">Two-Factor Authentication</span>
                  <input type="checkbox" checked readOnly className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
