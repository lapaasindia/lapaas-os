import React from 'react';
import clsx from 'clsx';
import { InputProps } from '../../types';

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error = false,
  errorMessage,
  label,
  icon,
  size = 'md',
  disabled = false,
  className,
  ...props
}) => {
  const baseStyles = 'w-full px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-100 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-5 py-3',
    xl: 'text-xl px-6 py-4',
  };

  const borderStyles = error
    ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500'
    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={clsx(
            baseStyles,
            sizeStyles[size],
            borderStyles,
            icon && 'pl-10',
            className
          )}
          {...props}
        />
      </div>
      {error && errorMessage && (
        <p className="text-danger-600 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
};
