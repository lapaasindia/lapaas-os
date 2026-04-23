import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, BarChart3, DollarSign, FileText, PieChart, Lock, LogOut } from 'lucide-react';

export default function FinanceNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const financeModules = [
    { name: 'Dashboard', path: '/finance', icon: BarChart3 },
    { name: 'Cashflow', path: '/finance/cashflow', icon: DollarSign },
    { name: 'Invoicing', path: '/finance/invoicing', icon: FileText },
    { name: 'Collections', path: '/finance/collections-dashboard', icon: DollarSign },
    { name: 'Payables', path: '/finance/payables', icon: FileText },
    { name: 'Compliance', path: '/finance/compliance', icon: FileText },
    { name: 'Reserves', path: '/finance/reserves', icon: PieChart },
    { name: 'Controls', path: '/finance/controls', icon: Lock }
  ];

  const isFinancePage = location.pathname.startsWith('/finance');

  if (!isFinancePage) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <Home size={20} />
              <span className="text-sm">Dashboard</span>
            </button>
            <ChevronRight size={16} className="text-gray-600" />
            <span className="text-sm text-gray-300">Finance OS</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Module Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {financeModules.map(module => {
            const Icon = module.icon;
            const isActive = location.pathname === module.path;
            return (
              <button
                key={module.path}
                onClick={() => navigate(module.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon size={16} />
                {module.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
