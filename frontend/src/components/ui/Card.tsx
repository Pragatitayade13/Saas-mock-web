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
    standard: 'bg-[#111419] border border-white/[0.08] shadow-sm hover:border-white/[0.14]',
    metric: 'bg-[#111419] border border-white/[0.08] card-hover-effect p-5 sm:p-6 shadow-sm',
    interactive:
      'bg-[#111419] border border-white/[0.08] hover:border-[#8B5CF6]/50 hover:bg-[#171A20] cursor-pointer shadow-sm hover:shadow-glow-primary hover:-translate-y-1',
    chart: 'bg-[#111419] border border-white/[0.08] p-5 sm:p-6 shadow-sm',
    status: 'bg-[#171A20] border border-white/[0.08] p-4 rounded-xl',
    glass: 'glass-card shadow-glass',
  };

  const isPaddingIncluded = variant === 'metric' || variant === 'chart' || variant === 'status';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {header && (
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={isPaddingIncluded ? '' : 'p-5 sm:p-6'}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-white/[0.08] bg-[#0B0D10]/50 text-xs text-[#A5ACB8]">
          {footer}
        </div>
      )}
    </div>
  );
};
