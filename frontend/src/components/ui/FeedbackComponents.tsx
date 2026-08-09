import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, ChevronLeft, ChevronRight, Home, ChevronRight as ChevronIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

// --- Alert Component ---
export type AlertType = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const typeConfig: Record<AlertType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      icon: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
    },
    danger: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      icon: <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
    },
  };

  const config = typeConfig[type];

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${config.bg} ${config.border} ${className}`}>
      {config.icon}
      <div className="flex-1 text-xs sm:text-sm">
        {title && <h4 className={`font-semibold mb-1 ${config.text}`}>{title}</h4>}
        <div className="text-[#F8FAFC]">{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-[#A1A1AA] hover:text-white text-xs">
          ✕
        </button>
      )}
    </div>
  );
};

// --- Spinner Component ---
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={`rounded-full border-[#272C36] border-t-[#8B5CF6] animate-spin ${sizeStyles[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// --- Skeleton Component ---
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'rectangle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text' }) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    card: 'h-32 w-full rounded-xl',
    circle: 'w-10 h-10 rounded-full',
    rectangle: 'h-24 w-full rounded-lg',
  };

  return <div className={`animate-shimmer rounded ${variantStyles[variant]} ${className}`} />;
};

// --- EmptyState Component ---
export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="p-8 sm:p-12 border border-dashed border-[#272C36] rounded-xl text-center flex flex-col items-center justify-center bg-[#12151C]/50">
      {icon && <div className="w-12 h-12 rounded-full bg-[#181C25] border border-[#272C36] flex items-center justify-center text-[#8B5CF6] mb-4">{icon}</div>}
      <h3 className="text-base font-bold text-[#F8FAFC] mb-1">{title}</h3>
      <p className="text-xs text-[#A1A1AA] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// --- ErrorState Component ---
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
}) => {
  return (
    <div className="p-6 border border-red-500/30 rounded-xl bg-red-500/10 text-center flex flex-col items-center justify-center">
      <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
      <h3 className="text-sm font-bold text-red-400 mb-1">{title}</h3>
      <p className="text-xs text-[#F8FAFC] max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

// --- Divider Component ---
export const Divider: React.FC<{ orientation?: 'horizontal' | 'vertical'; className?: string }> = ({
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return <div className={`w-[1px] h-full bg-[#272C36] ${className}`} />;
  }
  return <div className={`w-full h-[1px] bg-[#272C36] my-4 ${className}`} />;
};

// --- Breadcrumb Component ---
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#71717A] overflow-x-auto no-scrollbar py-1">
      <Link to="/dashboard" className="hover:text-[#F8FAFC] transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronIcon className="w-3 h-3 text-[#272C36] flex-shrink-0" />
          {item.path ? (
            <Link to={item.path} className="hover:text-[#F8FAFC] transition-colors font-medium whitespace-nowrap">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#F8FAFC] font-semibold whitespace-nowrap">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// --- Pagination Component ---
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between gap-2 text-xs py-3">
      <span className="text-[#A1A1AA]">
        Page <span className="font-semibold text-[#F8FAFC]">{currentPage}</span> of{' '}
        <span className="font-semibold text-[#F8FAFC]">{totalPages}</span>
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
