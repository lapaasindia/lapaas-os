import React from 'react';
import { X } from 'lucide-react';

interface TaskFormData {
  title: string;
  priority: string;
  recurring: boolean;
  assigned_to: string;
  blocked: boolean;
}

interface TaskModalProps {
  show: boolean;
  editingId: string | null;
  taskForm: TaskFormData;
  onTaskFormChange: (form: TaskFormData) => void;
  onCreate: () => void;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  show,
  editingId,
  taskForm,
  onTaskFormChange,
  onCreate,
  onClose
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{editingId ? 'Edit Task' : 'Create Task'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <input
          type="text"
          placeholder="Task title"
          value={taskForm.title}
          onChange={(e) => onTaskFormChange({ ...taskForm, title: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4"
        />

        <select
          value={taskForm.priority}
          onChange={(e) => onTaskFormChange({ ...taskForm, priority: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4"
        >
          <option value="P1">P1 - Critical</option>
          <option value="P2">P2 - High</option>
          <option value="P3">P3 - Medium</option>
          <option value="P4">P4 - Low</option>
        </select>

        <input
          type="text"
          placeholder="Assign to (team member name)"
          value={taskForm.assigned_to}
          onChange={(e) => onTaskFormChange({ ...taskForm, assigned_to: e.target.value })}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4"
        />

        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={taskForm.recurring}
              onChange={(e) => onTaskFormChange({ ...taskForm, recurring: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span>Recurring</span>
          </label>
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={taskForm.blocked}
              onChange={(e) => onTaskFormChange({ ...taskForm, blocked: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span>Blocked</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCreate}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            {editingId ? 'Update Task' : 'Create Task'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
