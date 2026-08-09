import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3.5 py-1.5 text-xs min-h-[38px] min-w-[38px]',
    md: 'px-4 py-2.5 text-xs sm:text-xs font-semibold min-h-[44px]',
    lg: 'px-5 py-3 text-sm font-semibold min-h-[48px]',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/25 hover:shadow-glow-primary border border-[#8B5CF6]/40',
    secondary:
      'bg-[#171A20] hover:bg-[#1D2128] text-[#F7F8FA] border border-white/[0.08] hover:border-white/[0.16] shadow-sm',
    ghost:
      'bg-transparent hover:bg-[#171A20] text-[#A5ACB8] hover:text-[#F7F8FA] border border-transparent',
    danger:
      'bg-[#EF4444] hover:bg-red-600 text-white shadow-lg shadow-red-500/25 border border-red-500/40',
    outline:
      'bg-transparent hover:bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/40 hover:border-[#8B5CF6]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current shrink-0" />}
      {!isLoading && leftIcon && <span className="mr-2 inline-flex items-center shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="ml-2 inline-flex items-center shrink-0">{rightIcon}</span>}
    </button>
  );
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  ariaLabel: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  ariaLabel,
  variant = 'ghost',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'w-9 h-9 p-1.5 text-xs min-h-[38px] min-w-[38px]',
    md: 'w-11 h-11 p-2 text-sm min-h-[44px] min-w-[44px]',
    lg: 'w-12 h-12 p-3 text-base min-h-[48px] min-w-[48px]',
  };

  return (
    <button
      aria-label={ariaLabel}
      title={ariaLabel}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
        sizeStyles[size]
      } ${
        variant === 'ghost'
          ? 'text-[#A5ACB8] hover:text-[#F7F8FA] hover:bg-[#171A20] border border-transparent'
          : variant === 'secondary'
          ? 'bg-[#171A20] hover:bg-[#1D2128] text-[#F7F8FA] border border-white/[0.08]'
          : variant === 'primary'
          ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/25'
          : 'text-[#A5ACB8] hover:bg-[#171A20]'
      } ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
    </button>
  );
};
