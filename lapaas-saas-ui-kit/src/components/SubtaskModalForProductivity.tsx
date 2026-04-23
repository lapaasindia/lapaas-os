import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface Subtask {
  item: string;
  done: boolean;
}

interface SubtaskModalForProductivityProps {
  show: boolean;
  taskTitle: string;
  taskId: string;
  subtasks: Subtask[];
  onAddSubtask: (taskId: string, title: string) => void;
  onDeleteSubtask: (taskId: string, index: number) => void;
  onToggleSubtask: (taskId: string, index: number) => void;
  onClose: () => void;
}

const SubtaskModalForProductivity: React.FC<SubtaskModalForProductivityProps> = ({
  show,
  taskTitle,
  taskId,
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
      onAddSubtask(taskId, newSubtask);
      setNewSubtask('');
    }
  };

  const completedCount = subtasks.filter(s => s.done).length;
  const totalCount = subtasks.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Add Subtasks</h2>
            <p className="text-sm text-gray-400 mt-1 truncate">{taskTitle}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">Progress</span>
            <span className="text-sm font-medium text-blue-400">{completedCount}/{totalCount}</span>
          </div>
          <div className="bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        {/* Add Subtask Input */}
        <div className="mb-6 p-4 bg-slate-700 rounded-lg border border-slate-600">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Enter subtask title..."
              className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm transition"
              autoFocus
            />
            <button
              onClick={handleAddSubtask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-1 font-medium"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>

        {/* Subtasks List */}
        <div className="space-y-2 mb-6">
          {subtasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No subtasks yet</p>
              <p className="text-gray-500 text-xs mt-1">Add one above to get started!</p>
            </div>
          ) : (
            subtasks.map((subtask, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition group"
              >
                <input
                  type="checkbox"
                  checked={subtask.done}
                  onChange={() => onToggleSubtask(taskId, idx)}
                  className="w-4 h-4 rounded cursor-pointer accent-blue-500"
                />
                <span
                  className={`flex-1 text-sm ${
                    subtask.done
                      ? 'line-through text-gray-400'
                      : 'text-white'
                  }`}
                >
                  {subtask.item}
                </span>
                <button
                  onClick={() => onDeleteSubtask(taskId, idx)}
                  className="text-red-400 hover:text-red-300 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubtaskModalForProductivity;
