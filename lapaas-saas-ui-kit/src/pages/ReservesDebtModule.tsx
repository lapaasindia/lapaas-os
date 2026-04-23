import { useState, useEffect } from 'react';
import { PieChart, AlertCircle } from 'lucide-react';

interface ReserveRule {
  id: string;
  name: string;
  percentage: number;
  target_account: string;
  priority: number;
}

interface Debt {
  id: string;
  lender: string;
  type: string;
  principal: number;
  rate: number;
  emi: number;
  remaining_amount: number;
  status: string;
}

interface ReserveLedger {
  date: string;
  inflow_amount: number;
  allocations: Record<string, number>;
  balances: Record<string, number>;
}

export default function ReservesDebtModule() {
  const [rules, setRules] = useState<ReserveRule[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [ledger, setLedger] = useState<ReserveLedger | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reserves');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, debtsRes, ledgerRes] = await Promise.all([
        fetch('http://localhost:3000/api/v1/finance/reserves/rules'),
        fetch('http://localhost:3000/api/v1/finance/debts'),
        fetch('http://localhost:3000/api/v1/finance/reserves/ledger')
      ]);

      if (rulesRes.ok) setRules((await rulesRes.json()).data);
      if (debtsRes.ok) setDebts((await debtsRes.json()).data);
      if (ledgerRes.ok) {
        const ledgerData = await ledgerRes.json();
        setLedger(ledgerData.latest);
      }
    } catch (error) {
      console.error('Error fetching reserves/debt data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Reserves & Debt...</div>
      </div>
    );
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.remaining_amount, 0);
  const totalEMI = debts.reduce((sum, d) => sum + d.emi, 0);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reserves & Debt Management</h1>
          <p className="text-gray-400">Manage reserves allocation and debt strategy</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Debt</p>
            <p className="text-3xl font-bold text-red-400 mt-2">₹{(totalDebt / 100000).toFixed(1)}L</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Monthly EMI</p>
            <p className="text-3xl font-bold text-orange-400 mt-2">₹{(totalEMI / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Active Debts</p>
            <p className="text-3xl font-bold text-white mt-2">{debts.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Reserve Rules</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{rules.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['reserves', 'debts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {tab === 'reserves' ? 'Reserves' : 'Debts'}
            </button>
          ))}
        </div>

        {/* Reserves Tab */}
        {activeTab === 'reserves' && (
          <div className="space-y-6">
            {/* Reserve Rules */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PieChart size={24} className="text-blue-400" />
                Allocation Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.map(rule => (
                  <div key={rule.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-white">{rule.name}</p>
                        <p className="text-sm text-gray-400">{rule.target_account}</p>
                      </div>
                      <p className="text-2xl font-bold text-green-400">{rule.percentage}%</p>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${rule.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reserve Ledger */}
            {ledger && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">Latest Allocation</h3>
                <div className="mb-6">
                  <p className="text-gray-400 mb-2">Inflow Amount</p>
                  <p className="text-3xl font-bold text-green-400">₹{(ledger.inflow_amount / 100000).toFixed(1)}L</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-4">Allocations</h4>
                    <div className="space-y-3">
                      {Object.entries(ledger.allocations).map(([account, amount]) => (
                        <div key={account} className="flex justify-between">
                          <span className="text-gray-300">{account}</span>
                          <span className="text-white font-semibold">₹{(amount / 1000).toFixed(0)}K</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-4">Current Balances</h4>
                    <div className="space-y-3">
                      {Object.entries(ledger.balances).map(([account, balance]) => (
                        <div key={account} className="flex justify-between">
                          <span className="text-gray-300">{account}</span>
                          <span className="text-white font-semibold">₹{(balance / 100000).toFixed(1)}L</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debts Tab */}
        {activeTab === 'debts' && (
          <div className="space-y-6">
            {debts.map(debt => (
              <div key={debt.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">{debt.lender}</h3>
                    <p className="text-sm text-gray-400">{debt.type}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                    {debt.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Principal</p>
                    <p className="text-xl font-bold text-white mt-1">₹{(debt.principal / 100000).toFixed(1)}L</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Interest Rate</p>
                    <p className="text-xl font-bold text-white mt-1">{debt.rate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Monthly EMI</p>
                    <p className="text-xl font-bold text-white mt-1">₹{(debt.emi / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Remaining</p>
                    <p className="text-xl font-bold text-red-400 mt-1">₹{(debt.remaining_amount / 100000).toFixed(1)}L</p>
                  </div>
                </div>

                {/* Repayment Progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Repayment Progress</span>
                    <span className="text-sm text-gray-400">
                      {(((debt.principal - debt.remaining_amount) / debt.principal) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{
                        width: `${((debt.principal - debt.remaining_amount) / debt.principal) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Debt Strategy Hint */}
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-300">
                    Avalanche strategy: Focus on {debt.rate}% interest rate debt first
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
