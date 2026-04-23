import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'date' | 'datetime-local';
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  allowPastDates?: boolean;
  helperText?: string;
  className?: string;
  disabled?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  type = 'date',
  required = false,
  minDate,
  maxDate,
  allowPastDates = false,
  helperText,
  className = '',
  disabled = false
}) => {
  // Get today's date in the correct format
  const today = new Date();
  const todayStr = type === 'datetime-local' 
    ? today.toISOString().slice(0, 16)
    : today.toISOString().split('T')[0];

  // Calculate min date
  const effectiveMinDate = allowPastDates ? minDate : (minDate || todayStr);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Validate against past dates if not allowed
    if (!allowPastDates && newValue) {
      const selectedDate = new Date(newValue);
      const now = new Date();
      // For date type, compare just the date part
      if (type === 'date') {
        now.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
      }
      
      if (selectedDate < now) {
        // Show visual feedback instead of alert
        return;
      }
    }
    
    onChange(newValue);
  };

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          min={effectiveMinDate}
          max={maxDate}
          disabled={disabled}
          required={required}
          className={`
            w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 pr-10
            text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition [color-scheme:dark]
            ${!value ? 'text-gray-400' : 'text-white'}
          `}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {type === 'datetime-local' ? (
            <Clock size={18} className="text-gray-400" />
          ) : (
            <Calendar size={18} className="text-gray-400" />
          )}
        </div>
      </div>
      {helperText && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
      {!allowPastDates && !helperText && (
        <p className="text-xs text-gray-500 mt-1">
          {type === 'datetime-local' ? 'Select a future date and time' : 'Select a future date'}
        </p>
      )}
    </div>
  );
};

export default DateInput;
