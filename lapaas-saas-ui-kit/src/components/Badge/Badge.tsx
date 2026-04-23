import React from 'react';
import clsx from 'clsx';
import { BadgeProps } from '../../types';

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-sm font-medium',
    lg: 'px-4 py-1.5 text-base font-medium',
    xl: 'px-5 py-2 text-lg font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
