export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type Size = 'sm' | 'md' | 'lg' | 'xl';
export type Theme = 'light' | 'dark';

export interface BaseComponentProps {
  className?: string;
  disabled?: boolean;
  id?: string;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  icon?: React.ReactNode;
  size?: Size;
}

export interface CardProps extends BaseComponentProps {
  children: React.ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
}

export interface BadgeProps extends BaseComponentProps {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export interface ToastProps {
  id: string;
  message: string;
  variant?: Variant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface SelectProps extends BaseComponentProps {
  options: Array<{ label: string; value: string }>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: boolean;
  errorMessage?: string;
}

export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  indeterminate?: boolean;
}

export interface RadioProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  name?: string;
  value?: string;
}

export interface SwitchProps extends BaseComponentProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: Size;
  variant?: 'circle' | 'square';
}

export interface TabsProps extends BaseComponentProps {
  tabs: Array<{ label: string; value: string; content: React.ReactNode }>;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPreviousNext?: boolean;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: Array<{ label: string; href?: string }>;
  separator?: React.ReactNode;
}

export interface AlertProps extends BaseComponentProps {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
  closeable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
}

export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  variant?: Variant;
  showLabel?: boolean;
  size?: Size;
}

export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  count?: number;
  circle?: boolean;
}

export interface TooltipProps extends BaseComponentProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

export interface PopoverProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export interface DropdownProps extends BaseComponentProps {
  trigger: React.ReactNode;
  items: Array<{ label: string; onClick: () => void; icon?: React.ReactNode }>;
  position?: 'top' | 'right' | 'bottom' | 'left';
}
