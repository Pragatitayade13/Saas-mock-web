import React from 'react';

export type CardVariant = 'standard' | 'metric' | 'interactive' | 'chart' | 'status' | 'glass';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'standard',
  header,
  footer,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300 overflow-hidden';

  const variantStyles: Record<CardVariant, string> = {
    standard: 'bg-white dark:bg-[#111419] border border-slate-200/90 dark:border-white/[0.08] shadow-xs dark:shadow-none hover:border-purple-300 dark:hover:border-white/[0.14]',
    metric: 'bg-white dark:bg-[#111419] border border-slate-200/90 dark:border-white/[0.08] card-hover-effect p-5 sm:p-6 shadow-xs dark:shadow-none',
    interactive:
      'bg-white dark:bg-[#111419] border border-slate-200/90 dark:border-white/[0.08] hover:border-[#8B5CF6]/50 hover:bg-purple-50/40 dark:hover:bg-[#171A20] cursor-pointer shadow-xs dark:shadow-none hover:shadow-md hover:-translate-y-1',
    chart: 'bg-white dark:bg-[#111419] border border-slate-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs dark:shadow-none',
    status: 'bg-slate-50 dark:bg-[#171A20] border border-slate-200/90 dark:border-white/[0.08] p-4 rounded-xl',
    glass: 'bg-white/90 dark:bg-[#111419]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm',
  };

  const isPaddingIncluded = variant === 'metric' || variant === 'chart' || variant === 'status';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {header && (
        <div className="px-5 py-4 border-b border-slate-200/90 dark:border-white/[0.08] flex items-center justify-between text-slate-900 dark:text-[#F8FAFC]">
          {header}
        </div>
      )}
      <div className={isPaddingIncluded ? '' : 'p-5 sm:p-6'}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-200/90 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#0B0D10]/50 text-xs text-slate-600 dark:text-[#A5ACB8]">
          {footer}
        </div>
      )}
    </div>
  );
};
