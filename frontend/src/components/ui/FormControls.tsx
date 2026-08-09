import React, { useId } from 'react';

// --- Input Component ---
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs sm:text-sm font-bold text-slate-700 dark:text-[#A1A1AA]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-400 dark:text-[#71717A] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full bg-white dark:bg-[#12151C] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#71717A] text-xs sm:text-sm font-medium rounded-xl border border-slate-300 dark:border-[#272C36] py-2.5 px-3.5 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-purple-100 dark:focus:ring-[#8B5CF6]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-slate-400 dark:text-[#71717A] flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}
        {!error && helperText && <span className="text-xs text-slate-500 dark:text-[#71717A]">{helperText}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// --- Textarea Component ---
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = '', id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="text-xs sm:text-sm font-bold text-slate-700 dark:text-[#A1A1AA]">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          className={`w-full bg-white dark:bg-[#12151C] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#71717A] text-xs sm:text-sm font-medium rounded-xl border border-slate-300 dark:border-[#272C36] p-3.5 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-purple-100 dark:focus:ring-[#8B5CF6]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px] ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-200' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}
        {!error && helperText && <span className="text-xs text-slate-500 dark:text-[#71717A]">{helperText}</span>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// --- Select Component ---
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, className = '', id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-xs sm:text-sm font-bold text-slate-700 dark:text-[#A1A1AA]">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          disabled={disabled}
          className={`w-full bg-white dark:bg-[#12151C] text-slate-900 dark:text-[#F8FAFC] text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-[#272C36] py-2.5 px-3.5 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-purple-100 dark:focus:ring-[#8B5CF6]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-rose-500' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#12151C] text-slate-900 dark:text-[#F8FAFC]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-rose-500 font-semibold">{error}</span>}
        {!error && helperText && <span className="text-xs text-slate-500 dark:text-[#71717A]">{helperText}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// --- Checkbox Component ---
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <label htmlFor={checkboxId} className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <input
          id={checkboxId}
          type="checkbox"
          ref={ref}
          disabled={disabled}
          className={`w-4 h-4 rounded bg-white dark:bg-[#12151C] border-slate-300 dark:border-[#272C36] text-[#8B5CF6] focus:ring-[#8B5CF6] accent-[#8B5CF6] ${className}`}
          {...props}
        />
        {label && <span className="text-xs sm:text-sm text-slate-900 dark:text-[#F8FAFC] font-semibold">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// --- Switch Component ---
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] ${
          checked ? 'bg-[#8B5CF6]' : 'bg-slate-300 dark:bg-[#272C36]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      {label && <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">{label}</span>}
    </label>
  );
};
