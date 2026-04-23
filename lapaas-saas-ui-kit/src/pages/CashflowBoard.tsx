import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';

interface CashflowLine {
  id: string;
  week_number: number;
  type: string;
  category: string;
  amount: number;
  probability: number;
  status: string;
  notes: string;
}

interface CashflowWeek {
  week_number: number;
  week_start: string;
  inflows_total: number;
  outflows_total: number;
  net: number;
  lines: CashflowLine[];
}

export default function CashflowBoard() {
  const [weeks, setWeeks] = useState<CashflowWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState('base');

  useEffect(() => {
    fetchCashflow();
  }, [scenario]);

  const fetchCashflow = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/finance/cashflow/weeks?scenario=${scenario}`);
      if (response.ok) {
        const result = await response.json();
        setWeeks(result.data);
      }
    } catch (error) {
      console.error('Error fetching cashflow:', error);
      setWeeks(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = (): CashflowWeek[] => {
    const data = [];
    const startDate = new Date('2025-11-10');
    
    for (let i = 0; i < 13; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + i * 7);
      
      let inflows = 0, outflows = 0;
      const lines: CashflowLine[] = [];

      // Vary inflows and outflows
      if (i % 2 === 0) {
        inflows = 250000 + Math.random() * 100000;
        lines.push({
          id: `inflow-${i}`,
          week_number: i + 1,
          type: 'inflow',
          category: 'AR',
          amount: inflows,
          probability: 0.8,
          status: 'expected',
          notes: 'Client payments expected'
        });
      }

      outflows = 420000 + Math.random() * 50000;
      lines.push({
        id: `outflow-${i}`,
        week_number: i + 1,
        type: 'outflow',
        category: 'Payroll',
        amount: outflows,
        probability: 1.0,
        status: 'planned',
        notes: 'Monthly payroll'
      });

      if (i % 3 === 0) {
        const vendorPayment = 100000 + Math.random() * 50000;
        outflows += vendorPayment;
        lines.push({
          id: `vendor-${i}`,
          week_number: i + 1,
          type: 'outflow',
          category: 'Vendors',
          amount: vendorPayment,
          probability: 1.0,
          status: 'planned',
          notes: 'Vendor payments'
        });
      }

      data.push({
        week_number: i + 1,
        week_start: weekStart.toISOString().split('T')[0],
        inflows_total: inflows,
        outflows_total: outflows,
        net: inflows - outflows,
        lines
      });
    }
    return data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading Cashflow Board...</div>
      </div>
    );
  }

  // Calculate cumulative cash
  let cumulativeCash = 1250000; // Starting cash
  const weeksWithCumulative = weeks.map(week => ({
    ...week,
    opening_cash: cumulativeCash,
    closing_cash: (cumulativeCash += week.net)
  }));

  const minCash = Math.min(...weeksWithCumulative.map(w => w.closing_cash));
  const maxCash = Math.max(...weeksWithCumulative.map(w => w.closing_cash));

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">13-Week Cashflow Board</h1>
            <p className="text-gray-400">Plan your cash runway and run scenarios</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="mb-6 flex gap-2">
          {['best', 'base', 'worst'].map(s => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                scenario === s
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} Case
            </button>
          ))}
        </div>

        {/* Cashflow Board */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300 sticky left-0 bg-gray-700">Week</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-green-400">Opening</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-blue-400">Inflows</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-red-400">Outflows</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-yellow-400">Net</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-white">Closing</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {weeksWithCumulative.map((week) => {
                const healthPercent = ((week.closing_cash - minCash) / (maxCash - minCash)) * 100;
                const isHealthy = week.closing_cash > 500000;
                
                return (
                  <tr key={week.week_number} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-3 text-white font-semibold sticky left-0 bg-gray-800">W{week.week_number}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(week.week_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400 font-semibold">
                      ₹{(week.opening_cash / 100000).toFixed(1)}L
                    </td>
                    <td className="px-4 py-3 text-right text-blue-400 font-semibold">
                      ₹{(week.inflows_total / 100000).toFixed(1)}L
                    </td>
                    <td className="px-4 py-3 text-right text-red-400 font-semibold">
                      ₹{(week.outflows_total / 100000).toFixed(1)}L
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${week.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {week.net >= 0 ? '+' : ''}₹{(week.net / 100000).toFixed(1)}L
                    </td>
                    <td className="px-4 py-3 text-right text-white font-semibold">
                      ₹{(week.closing_cash / 100000).toFixed(1)}L
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.max(5, Math.min(95, healthPercent))}%` }}
                          />
                        </div>
                        {isHealthy ? (
                          <TrendingUp size={16} className="text-green-400" />
                        ) : (
                          <TrendingDown size={16} className="text-red-400" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cashflow Details */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inflows Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Inflows by Category</h3>
            <div className="space-y-3">
              {['AR', 'Other Income'].map(cat => {
                const total = weeks.reduce((sum, w) => 
                  sum + w.lines.filter(l => l.type === 'inflow' && l.category === cat).reduce((s, l) => s + l.amount, 0), 0
                );
                return (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-gray-300">{cat}</span>
                    <span className="text-white font-semibold">₹{(total / 100000).toFixed(1)}L</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outflows Breakdown */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Outflows by Category</h3>
            <div className="space-y-3">
              {['Payroll', 'Vendors', 'Other'].map(cat => {
                const total = weeks.reduce((sum, w) => 
                  sum + w.lines.filter(l => l.type === 'outflow' && l.category === cat).reduce((s, l) => s + l.amount, 0), 0
                );
                return (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-gray-300">{cat}</span>
                    <span className="text-red-400 font-semibold">₹{(total / 100000).toFixed(1)}L</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Inflows</p>
              <p className="text-2xl font-bold text-green-400 mt-2">
                ₹{(weeks.reduce((sum, w) => sum + w.inflows_total, 0) / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Outflows</p>
              <p className="text-2xl font-bold text-red-400 mt-2">
                ₹{(weeks.reduce((sum, w) => sum + w.outflows_total, 0) / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Net Change</p>
              <p className={`text-2xl font-bold mt-2 ${
                weeks.reduce((sum, w) => sum + w.net, 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ₹{(weeks.reduce((sum, w) => sum + w.net, 0) / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Min Cash</p>
              <p className="text-2xl font-bold text-yellow-400 mt-2">
                ₹{(minCash / 100000).toFixed(1)}L
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
