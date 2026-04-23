import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TimeBlockModalProps {
  show: boolean;
  editingId: string | null;
  timeBlockForm: { title: string; start_time: string; end_time: string };
  onFormChange: (form: { title: string; start_time: string; end_time: string }) => void;
  onCreate: () => void;
  onClose: () => void;
}

const TimeBlockModal: React.FC<TimeBlockModalProps> = ({
  show,
  editingId,
  timeBlockForm,
  onFormChange,
  onCreate,
  onClose
}) => {
  const [blockWholeDay, setBlockWholeDay] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Check if current form is a whole day block
  useEffect(() => {
    if (show) {
      const isWholeDay = timeBlockForm.start_time === '00:00' && timeBlockForm.end_time === '23:59';
      setBlockWholeDay(isWholeDay);
      setValidationError(null);
    }
  }, [show, timeBlockForm]);

  if (!show) return null;

  const handleBlockWholeDayChange = (checked: boolean) => {
    setBlockWholeDay(checked);
    setValidationError(null);
    if (checked) {
      onFormChange({ ...timeBlockForm, start_time: '00:00', end_time: '23:59' });
    } else {
      // Reset to default times when unchecked
      onFormChange({ ...timeBlockForm, start_time: '09:00', end_time: '10:00' });
    }
  };

  const validateForm = (): boolean => {
    // Check if title is provided
    if (!timeBlockForm.title.trim()) {
      setValidationError('❌ Please enter a title for the time block');
      return false;
    }

    // Check if start time is before end time
    if (!blockWholeDay && timeBlockForm.start_time >= timeBlockForm.end_time) {
      setValidationError('❌ Start time must be before end time');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleCreateClick = () => {
    if (validateForm()) {
      onCreate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{editingId ? 'Edit' : 'Create'} Time Block</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={timeBlockForm.title}
              onChange={(e) => onFormChange({ ...timeBlockForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="e.g., Focus Time, Meeting Prep, Out of Office"
            />
          </div>

          {/* Block Whole Day Toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition cursor-pointer" onClick={() => handleBlockWholeDayChange(!blockWholeDay)}>
            <input
              type="checkbox"
              id="blockWholeDay"
              checked={blockWholeDay}
              onChange={(e) => handleBlockWholeDayChange(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="blockWholeDay" className="text-sm font-medium text-gray-300 cursor-pointer flex-1">
              Block Whole Day (00:00 - 23:59)
            </label>
          </div>

          {/* Time Selection */}
          {!blockWholeDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="time"
                  value={timeBlockForm.start_time}
                  onChange={(e) => onFormChange({ ...timeBlockForm, start_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input
                  type="time"
                  value={timeBlockForm.end_time}
                  onChange={(e) => onFormChange({ ...timeBlockForm, end_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {blockWholeDay && (
            <div className="p-3 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-sm text-red-200">
                🚫 You are BLOCKED for the entire day. You will not be available for any meetings or tasks.
              </p>
            </div>
          )}

          {validationError && (
            <div className="p-3 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-sm text-red-200">{validationError}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCreateClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeBlockModal;
