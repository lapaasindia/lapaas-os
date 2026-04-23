import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Edit2, Trash2, Play } from 'lucide-react';
import { getPriorityColor } from '../utils/timerUtils';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  due_at: string;
  recurring?: boolean;
  time_tracked?: number;
  assigned_to?: string;
  blocked?: boolean;
  subtasks?: Subtask[];
  type?: 'task' | 'meeting' | 'commitment' | 'request';
}

interface TaskListProps {
  tasks: Task[];
  timerRunning: string | null;
  timerValues: { [key: string]: number };
  onToggleStatus: (task: Task) => void;
  onStartTimer: (taskId: string) => void;
  onPauseTimer: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask?: (taskId: string, subtaskTitle: string) => void;
  onDeleteSubtask?: (taskId: string, subtaskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onShowSubtaskModal?: (task: Task) => void;
  onAddNewTask?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  timerRunning: _timerRunning,
  timerValues: _timerValues,
  onToggleStatus,
  onStartTimer: _onStartTimer,
  onPauseTimer: _onPauseTimer,
  onEdit,
  onDelete,
  onAddSubtask: _onAddSubtask,
  onDeleteSubtask,
  onToggleSubtask,
  onShowSubtaskModal,
  onAddNewTask
}) => {
  // Prefixed unused props with _ to suppress warnings
  void _timerRunning; void _timerValues; void _onStartTimer; void _onPauseTimer; void _onAddSubtask;
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done' | 'blocked'>('all');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return task.status === 'pending' && !task.blocked;
    if (filterStatus === 'done') return task.status === 'done';
    if (filterStatus === 'blocked') return task.blocked;
    return true;
  });

  const getTaskTypeColor = (task: Task) => {
    const isRequest = task.title.startsWith('[REQUEST]');
    if (isRequest) return { bg: 'bg-orange-900', border: 'border-l-4 border-orange-500', label: '🚨 Request', color: 'text-orange-300' };
    
    if (task.recurring && task.type === 'commitment') return { bg: 'bg-purple-900', border: 'border-l-4 border-purple-500', label: '🔄 Daily Commitment', color: 'text-purple-300' };
    if (task.type === 'commitment') return { bg: 'bg-purple-900', border: 'border-l-4 border-purple-500', label: '🎯 Commitment', color: 'text-purple-300' };
    if (task.type === 'meeting') return { bg: 'bg-blue-900', border: 'border-l-4 border-blue-500', label: '📅 Meeting', color: 'text-blue-300' };
    
    return { bg: 'bg-slate-700', border: 'border-l-4 border-slate-600', label: '📋 Task', color: 'text-slate-300' };
  };

  const getStatusBadge = (task: Task) => {
    if (task.blocked) return { text: '🔒 Blocked', color: 'bg-red-900 text-red-200' };
    if (task.status === 'done') return { text: '✅ Done', color: 'bg-green-900 text-green-200' };
    if (task.status === 'in_progress') return { text: '⏳ In Progress', color: 'bg-blue-900 text-blue-200' };
    return { text: '⏸️ Pending', color: 'bg-yellow-900 text-yellow-200' };
  };

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  // Separate tasks from other types
  const regularTasks = filteredTasks.filter(t => t.type === 'task');
  const otherItems = filteredTasks.filter(t => t.type !== 'task');

  return (
    <div className="space-y-8">
      {/* REGULAR TASKS SECTION - Card Layout */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="text-green-400" size={24} />
            Tasks
          </h2>
          <button 
            onClick={onAddNewTask}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
          >
            + New Task
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'done', 'blocked'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                filterStatus === status
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {status === 'all' && '📋 All'}
              {status === 'pending' && '⏸️ Pending'}
              {status === 'done' && '✅ Done'}
              {status === 'blocked' && '🔒 Blocked'}
            </button>
          ))}
        </div>

        {/* Tasks Cards */}
        <div className="space-y-4">
          {regularTasks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No tasks in this category</p>
          ) : (
            regularTasks.map(task => {
              const statusBadge = getStatusBadge(task);
              const isExpanded = expandedTasks.has(task.id);
              const hasSubtasks = task.subtasks && task.subtasks.length > 0;
              const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;

              return (
                <div key={task.id} className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 hover:bg-green-900/50 transition">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={() => onToggleStatus(task)}
                        className="w-5 h-5 rounded cursor-pointer mt-1"
                      />
                      <div className="flex-1">
                        <button
                          onClick={() => navigate(`/task/${task.id}`)}
                          className={`font-semibold text-left hover:underline transition block ${
                            task.status === 'done' ? 'line-through text-gray-400' : 'text-white hover:text-green-300'
                          }`}
                        >
                          {task.title}
                        </button>
                        <p className="text-sm text-gray-400 mt-1">
                          {task.assigned_to ? `Assigned to ${task.assigned_to}` : 'Build calendar UI and API endpoints'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(task)}
                        className="text-blue-400 hover:text-blue-300 transition px-3 py-1 rounded hover:bg-slate-700"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-red-400 hover:text-red-300 transition px-3 py-1 rounded hover:bg-slate-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Subtasks Section */}
                  <div className="ml-8 mb-3">
                    {/* Subtasks List */}
                    {hasSubtasks && (
                      <div className="space-y-2 mb-3">
                        {task.subtasks?.map(subtask => (
                          <div key={subtask.id} className="flex items-center gap-2 group">
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={() => onToggleSubtask?.(task.id, subtask.id)}
                              className="w-4 h-4 rounded cursor-pointer"
                            />
                            <span
                              className={`text-sm flex-1 ${
                                subtask.completed
                                  ? 'line-through text-gray-400'
                                  : 'text-gray-300'
                              }`}
                            >
                              {subtask.title}
                            </span>
                            <button
                              onClick={() => onDeleteSubtask?.(task.id, subtask.id)}
                              className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                              title="Delete subtask"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Add Subtask Button */}
                    <button
                      onClick={() => onShowSubtaskModal?.(task)}
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition"
                    >
                      + Add subtask
                    </button>
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-green-700/30">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${statusBadge.color}`}>
                        {statusBadge.text}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-400">Due: {new Date(task.due_at).toLocaleDateString()}</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition">
                      <Play size={14} /> Timer
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* OTHER ITEMS SECTION - Requests only */}
      {otherItems.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Requests</h2>
          <div className="space-y-3">
            {otherItems.map(task => {
              const statusBadge = getStatusBadge(task);
              const typeColor = getTaskTypeColor(task);
              const hasSubtasks = task.subtasks && task.subtasks.length > 0;
              const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;

              return (
                <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg transition ${typeColor.bg} ${typeColor.border}`}>
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => onToggleStatus(task)}
                      className="w-5 h-5 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${typeColor.color}`}>
                          {typeColor.label}
                        </span>
                        {hasSubtasks && (
                          <span className="text-xs text-gray-400">({completedSubtasks}/{task.subtasks?.length})</span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (task.type === 'meeting') {
                            navigate(`/meeting/${task.id}`);
                          } else if (task.type === 'commitment') {
                            navigate(`/commitment/${task.id}`);
                          } else if (task.type === 'request') {
                            navigate(`/request/${task.id}`);
                          } else {
                            navigate(`/task/${task.id}`);
                          }
                        }}
                        className={`font-semibold mt-1 text-left hover:underline transition ${
                          task.status === 'done' ? 'line-through text-gray-400' : 'text-white hover:text-blue-300'
                        }`}
                      >
                        {task.title}
                      </button>
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {new Date(task.due_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${statusBadge.color}`}>
                      {statusBadge.text}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {(task.type === 'task' || task.type === 'meeting' || task.type === 'commitment') && (
                      <button
                        onClick={() => onEdit(task)}
                        className="text-blue-400 hover:text-blue-300 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
