import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface SubtaskModalProps {
  show: boolean;
  taskTitle: string;
  subtasks: Subtask[];
  onAddSubtask: (title: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onClose: () => void;
}

const SubtaskModal: React.FC<SubtaskModalProps> = ({
  show,
  taskTitle,
  subtasks,
  onAddSubtask,
  onDeleteSubtask,
  onToggleSubtask,
  onClose
}) => {
  const [newSubtask, setNewSubtask] = useState('');

  if (!show) return null;

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask(newSubtask);
      setNewSubtask('');
    }
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const totalCount = subtasks.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Subtasks</h2>
            <p className="text-sm text-gray-400 mt-1">{taskTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Progress</span>
            <span className="text-sm font-medium text-blue-400">{completedCount}/{totalCount}</span>
          </div>
          <div className="bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        {/* Add Subtask */}
        <div className="mb-4 p-3 bg-slate-700 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Add a subtask..."
              className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              onClick={handleAddSubtask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition flex items-center gap-1"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Subtasks List */}
        <div className="space-y-2">
          {subtasks.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No subtasks yet. Add one to get started!</p>
          ) : (
            subtasks.map(subtask => (
              <div
                key={subtask.id}
                className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
              >
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => onToggleSubtask(subtask.id)}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span
                  className={`flex-1 text-sm ${
                    subtask.completed
                      ? 'line-through text-gray-400'
                      : 'text-white'
                  }`}
                >
                  {subtask.title}
                </span>
                <button
                  onClick={() => onDeleteSubtask(subtask.id)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubtaskModal;
