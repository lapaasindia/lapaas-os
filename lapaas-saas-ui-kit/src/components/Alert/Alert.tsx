import React from 'react';
import clsx from 'clsx';
import { AlertProps } from '../../types';
import { X } from 'lucide-react';

export const Alert: React.FC<AlertProps> = ({
  variant = 'primary',
  title,
  children,
  closeable = false,
  onClose,
  icon,
  className,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-primary-50 border-primary-200 text-primary-800',
    secondary: 'bg-secondary-50 border-secondary-200 text-secondary-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    danger: 'bg-danger-50 border-danger-200 text-danger-800',
  };

  return (
    <div
      className={clsx(
        'rounded-lg border p-4 flex gap-3',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        <div className="text-sm">{children}</div>
      </div>
      {closeable && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
