import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Clock } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  due_at: string;
  priority: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  checklist_json: Array<{ item: string; done: boolean }>;
  time_spent_minutes: number;
  time_logs: Array<{ start: string; end: string; duration: number }>;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timerRunning, setTimerRunning] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/v1/tasks?org_id=org-001&user_id=user-001');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'P1': 'bg-red-900 text-red-200',
      'P2': 'bg-orange-900 text-orange-200',
      'P3': 'bg-yellow-900 text-yellow-200',
      'P4': 'bg-blue-900 text-blue-200'
    };
    return colors[priority] || 'bg-gray-700 text-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'todo': 'bg-gray-700 text-gray-200',
      'in_progress': 'bg-blue-700 text-blue-200',
      'done': 'bg-green-700 text-green-200',
      'blocked': 'bg-red-700 text-red-200'
    };
    return colors[status] || 'bg-gray-700 text-gray-200';
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const startTimer = (taskId: string) => {
    setTimerRunning(taskId);
  };

  const stopTimer = async (taskId: string) => {
    setTimerRunning(null);
    try {
      await fetch(`/api/v1/tasks/${taskId}/timer/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_time: new Date(Date.now() - 5 * 60000).toISOString() })
      });
      fetchTasks();
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/v1/tasks/${taskId}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading tasks...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Tasks</h1>
            <p className="text-gray-400">Manage your tasks and track time</p>
          </div>
          <button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition">
            <Plus size={20} /> New Task
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <div className="flex gap-2">
            {(['list', 'kanban'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-lg transition ${view === v ? 'bg-green-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(['all', 'todo', 'in_progress', 'done'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg transition text-sm ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}>
                {f.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div key={task.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done')} className="text-gray-400 hover:text-white transition">
                        {task.status === 'done' ? <CheckCircle size={20} className="text-green-400" /> : <Circle size={20} />}
                      </button>
                      <h3 className={`text-lg font-semibold ${task.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-400 ml-8 mb-2">{task.description}</p>
                    <div className="flex items-center gap-3 ml-8">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">Due: {new Date(task.due_at).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={14} /> {task.time_spent_minutes} min
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {timerRunning === task.id ? (
                      <button onClick={() => stopTimer(task.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">
                        Stop
                      </button>
                    ) : (
                      <button onClick={() => startTimer(task.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition">
                        Timer
                      </button>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="bg-red-900 hover:bg-red-800 text-red-200 px-3 py-1 rounded text-sm transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Checklist */}
                {task.checklist_json.length > 0 && (
                  <div className="ml-8 mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-gray-400 mb-2">Checklist:</p>
                    <div className="space-y-1">
                      {task.checklist_json.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked={item.done} className="w-4 h-4" />
                          <span className={item.done ? 'line-through text-gray-500' : 'text-gray-300'}>
                            {item.item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="grid grid-cols-4 gap-4">
            {(['todo', 'in_progress', 'done', 'blocked'] as const).map(status => (
              <div key={status} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h3 className="font-bold text-white mb-4 text-sm uppercase">{status.replace('_', ' ')}</h3>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === status).map(task => (
                    <div key={task.id} className="bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition cursor-move">
                      <p className="font-semibold text-white text-sm mb-2">{task.title}</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(task.due_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total Tasks</p>
            <p className="text-3xl font-bold text-white mt-2">{tasks.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">In Progress</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">{tasks.filter(t => t.status === 'in_progress').length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{tasks.filter(t => t.status === 'done').length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Time Tracked</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">{Math.round(tasks.reduce((sum, t) => sum + t.time_spent_minutes, 0) / 60)}h</p>
          </div>
        </div>
      </div>

      {/* New Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">New Task</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Task title" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-500" />
              <textarea placeholder="Description" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-500 h-20"></textarea>
              <input type="date" className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white" />
              <select className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white">
                <option value="P1">P1 - Urgent</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowForm(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition">
                  Cancel
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
