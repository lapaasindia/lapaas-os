import React, { useState, useEffect } from 'react';
import { Shield, Clock, BookOpen, AlertCircle, TrendingDown } from 'lucide-react';
import OfficeHoursManager from '../components/OfficeHoursManager';
import KBArticleSearch from '../components/KBArticleSearch';

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

const InterruptionFirewall: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'office-hours' | 'kb' | 'stats'>('office-hours');
  const [slaStats, setSlaStats] = useState<SLAStats | null>(null);
  const [deflectionStats, setDeflectionStats] = useState<DeflectionStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [slaResponse, deflectionResponse] = await Promise.all([
        fetch('http://localhost:3000/api/v1/sla-tracking/stats'),
        fetch('http://localhost:3000/api/v1/deflections/stats')
      ]);

      if (slaResponse.ok) {
        const slaData = await slaResponse.json();
        setSlaStats(slaData.data);
      }

      if (deflectionResponse.ok) {
        const deflectionData = await deflectionResponse.json();
        setDeflectionStats(deflectionData.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-400" size={32} />
            <h1 className="text-3xl font-bold text-white">Interruption Firewall</h1>
          </div>
          <p className="text-gray-400">Manage office hours, KB articles, and request deflection</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-blue-400" size={20} />
              <h3 className="text-sm font-medium text-gray-400">Total Requests</h3>
            </div>
            <p className="text-2xl font-bold text-white">{slaStats?.total_requests || 0}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="text-green-400" size={20} />
              <h3 className="text-sm font-medium text-gray-400">SLA Compliance</h3>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {slaStats?.sla_compliance_rate || 0}%
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-purple-400" size={20} />
              <h3 className="text-sm font-medium text-gray-400">Deflection Rate</h3>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {deflectionStats?.deflection_rate || 0}%
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="text-yellow-400" size={20} />
              <h3 className="text-sm font-medium text-gray-400">Deflections</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {deflectionStats?.successful_deflections || 0}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('office-hours')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'office-hours'
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
            onClick={() => setActiveTab('kb')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'kb'
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
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'stats'
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
          {activeTab === 'office-hours' && (
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

          {activeTab === 'kb' && (
            <div className="grid grid-cols-2 gap-6">
              <KBArticleSearch />
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">KB Deflection</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <p>✅ Show relevant articles as users type requests</p>
                  <p>✅ Measure deflection rate automatically</p>
                  <p>✅ Track which articles are most helpful</p>
                  <p>✅ Reduce duplicate questions</p>
                  <p>✅ Improve team self-service</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-slate-700/50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Attempts</span>
                      <span className="text-white font-semibold">
                        {deflectionStats?.total_attempts || 0}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Successful</span>
                      <span className="text-green-400 font-semibold">
                        {deflectionStats?.successful_deflections || 0}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/50 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Deflection Rate</span>
                      <span className="text-purple-400 font-semibold">
                        {deflectionStats?.deflection_rate || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">SLA Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Compliance Rate</span>
                      <span className="text-white font-semibold">
                        {slaStats?.sla_compliance_rate || 0}%
                      </span>
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
                      <span className="text-white font-semibold">
                        {deflectionStats?.deflection_rate || 0}%
                      </span>
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
                      <p className="text-2xl font-bold text-white">
                        {deflectionStats?.total_attempts || 0}
                      </p>
                      <p className="text-xs text-gray-400">Attempts</p>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {deflectionStats?.successful_deflections || 0}
                      </p>
                      <p className="text-xs text-gray-400">Deflected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterruptionFirewall;
