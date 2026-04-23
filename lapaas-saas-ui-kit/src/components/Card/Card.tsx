import React from 'react';
import clsx from 'clsx';
import { CardProps } from '../../types';

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  bordered = true,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-lg bg-white dark:bg-gray-800 p-6',
        bordered && 'border border-gray-200 dark:border-gray-700',
        hoverable && 'transition-all duration-200 hover:shadow-lg cursor-pointer',
        'shadow-sm dark:shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
