import React, { useState, useEffect } from 'react';
import { 
  Users, CheckSquare, Inbox, Clock, Target, Book, 
  BarChart, Calendar, Settings, ToggleLeft, ToggleRight,
  Shield, ChevronDown, ChevronUp, Loader2
} from 'lucide-react';

interface Feature {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
  icon: string;
  is_enabled: number;
  is_active: number;
}

interface TeamFeaturesProps {
  teamId: string;
  teamName: string;
  isAdmin: boolean;
}

const iconMap: { [key: string]: React.ReactNode } = {
  Users: <Users size={20} />,
  CheckSquare: <CheckSquare size={20} />,
  Inbox: <Inbox size={20} />,
  Clock: <Clock size={20} />,
  Target: <Target size={20} />,
  Book: <Book size={20} />,
  BarChart: <BarChart size={20} />,
  Calendar: <Calendar size={20} />,
  Settings: <Settings size={20} />,
};

const categoryColors: { [key: string]: string } = {
  collaboration: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  productivity: 'bg-green-500/20 text-green-400 border-green-500/30',
  admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  reporting: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const TeamFeatures: React.FC<TeamFeaturesProps> = ({ teamId, teamName, isAdmin }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('all');

  useEffect(() => {
    fetchFeatures();
  }, [teamId]);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/v1/teams/${teamId}/features`);
      if (response.ok) {
        const data = await response.json();
        setFeatures(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureId: string, currentState: number) => {
    if (!isAdmin) return;
    
    setSaving(featureId);
    try {
      const response = await fetch(`http://localhost:3000/api/v1/teams/${teamId}/features/${featureId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_enabled: currentState ? 0 : 1,
          enabled_by: 'user-001'
        })
      });
      
      if (response.ok) {
        setFeatures(prev => prev.map(f => 
          f.id === featureId ? { ...f, is_enabled: currentState ? 0 : 1 } : f
        ));
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
    } finally {
      setSaving(null);
    }
  };

  const categories = [...new Set(features.map(f => f.category))];
  const enabledCount = features.filter(f => f.is_enabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm sm:text-base">Feature Access</h3>
            <p className="text-gray-400 text-xs sm:text-sm">{teamName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm font-medium">
            {enabledCount}/{features.length} enabled
          </span>
        </div>
      </div>

      {/* Category Filter - Mobile Scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <button
          onClick={() => setExpandedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition ${
            expandedCategory === 'all'
              ? 'bg-green-500 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          All Features
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setExpandedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap capitalize transition ${
              expandedCategory === cat
                ? 'bg-green-500 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Features Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features
          .filter(f => expandedCategory === 'all' || f.category === expandedCategory)
          .map(feature => (
            <div
              key={feature.id}
              className={`p-4 rounded-lg border transition-all ${
                feature.is_enabled
                  ? 'bg-slate-800 border-green-500/30'
                  : 'bg-slate-800/50 border-slate-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    feature.is_enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-gray-500'
                  }`}>
                    {iconMap[feature.icon] || <Settings size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-medium text-sm truncate">{feature.display_name}</h4>
                    <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{feature.description}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs capitalize border ${categoryColors[feature.category] || 'bg-slate-700 text-gray-400'}`}>
                      {feature.category}
                    </span>
                  </div>
                </div>
                
                {/* Toggle Button */}
                <button
                  onClick={() => toggleFeature(feature.id, feature.is_enabled)}
                  disabled={!isAdmin || saving === feature.id}
                  className={`flex-shrink-0 p-1 rounded transition ${
                    isAdmin ? 'hover:bg-slate-700 cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  {saving === feature.id ? (
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  ) : feature.is_enabled ? (
                    <ToggleRight className="w-8 h-8 text-green-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-xs sm:text-sm text-center">
            Only team leaders and admins can modify feature access
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamFeatures;
