import { useState, useEffect } from 'react';
import { Activity, AlertCircle, Loader, Filter } from 'lucide-react';

export default function ActivityLog() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/activities');
      const data = await response.json();
      setActivities(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      CREATE: 'bg-green-900 text-green-200',
      UPDATE: 'bg-blue-900 text-blue-200',
      DELETE: 'bg-red-900 text-red-200',
      ADD_MEMBER: 'bg-purple-900 text-purple-200',
      ASSIGN_ROLE: 'bg-yellow-900 text-yellow-200',
    };
    return colors[action] || 'bg-gray-700 text-gray-200';
  };

  const getResourceIcon = (resource: string) => {
    const icons: { [key: string]: string } = {
      USER_PROFILE: '👤',
      ORGANIZATION: '🏢',
      TEAM: '👥',
      USER: '👤',
    };
    return icons[resource] || '📝';
  };

  const filteredActivities = filter === 'ALL' 
    ? activities 
    : activities.filter(a => a.resource === filter);

  const resources = ['ALL', ...new Set(activities.map(a => a.resource))];

  return (
    <div className="dark min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="md3-headline-large mb-2">Activity Log</h1>
          <p className="md3-body-medium text-gray-400">Track all system activities</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="md3-alert md3-alert-error mb-6 md3-animate-fade">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            {resources.map((resource) => (
              <button
                key={resource}
                onClick={() => setFilter(resource)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  filter === resource
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {resource}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        )}

        {/* Activities List */}
        {!loading && (
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="md3-card md3-elevation-1 text-center py-12">
                <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="md3-body-medium text-gray-400">No activities found</p>
              </div>
            ) : (
              filteredActivities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="md3-card md3-elevation-1 md3-animate-fade hover:md3-elevation-2 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-2xl pt-1">
                      {getResourceIcon(activity.resource)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                          {activity.action}
                        </span>
                        <span className="md3-body-small text-gray-400">
                          {activity.resource}
                        </span>
                      </div>

                      <p className="md3-body-medium mb-2">
                        {activity.action === 'CREATE' && `Created ${activity.resource.toLowerCase()}`}
                        {activity.action === 'UPDATE' && `Updated ${activity.resource.toLowerCase()}`}
                        {activity.action === 'DELETE' && `Deleted ${activity.resource.toLowerCase()}`}
                        {activity.action === 'ADD_MEMBER' && `Added member to ${activity.resource.toLowerCase()}`}
                        {activity.action === 'ASSIGN_ROLE' && `Assigned role to user`}
                      </p>

                      <div className="flex items-center gap-4 text-gray-400">
                        <span className="md3-body-small">
                          User: {activity.userId}
                        </span>
                        <span className="md3-body-small">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="text-right">
                      <button className="md3-button md3-button-text text-sm">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats */}
        {!loading && filteredActivities.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md3-card md3-elevation-1 text-center">
              <p className="md3-title-large text-green-400">{activities.length}</p>
              <p className="md3-body-small text-gray-400">Total Activities</p>
            </div>
            <div className="md3-card md3-elevation-1 text-center">
              <p className="md3-title-large text-green-400">
                {new Set(activities.map(a => a.action)).size}
              </p>
              <p className="md3-body-small text-gray-400">Action Types</p>
            </div>
            <div className="md3-card md3-elevation-1 text-center">
              <p className="md3-title-large text-green-400">
                {new Set(activities.map(a => a.resource)).size}
              </p>
              <p className="md3-body-small text-gray-400">Resources</p>
            </div>
            <div className="md3-card md3-elevation-1 text-center">
              <p className="md3-title-large text-green-400">
                {new Set(activities.map(a => a.userId)).size}
              </p>
              <p className="md3-body-small text-gray-400">Users</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
