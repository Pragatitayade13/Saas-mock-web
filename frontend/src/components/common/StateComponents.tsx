import React from 'react';
import { Loader2, AlertTriangle, CheckCircle2, FileQuestion, Inbox } from 'lucide-react';

interface CommonStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const LoadingState: React.FC<CommonStateProps> = ({
  title = 'Loading Data...',
  description = 'Please wait while we retrieve the requested information.',
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#12151C] border border-[#272C36] ${className}`}>
    <div className="p-3 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] mb-3 animate-spin">
      <Loader2 className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-[#F8FAFC]">{title}</h3>
    <p className="mt-1 text-xs text-[#A1A1AA] max-w-sm">{description}</p>
  </div>
);

export const EmptyState: React.FC<CommonStateProps> = ({
  title = 'No Data Found',
  description = 'There are no records matching your current filter criteria or setup.',
  actionText,
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#12151C] border border-[#272C36] ${className}`}>
    <div className="p-3 rounded-full bg-[#272C36]/50 text-[#71717A] mb-3">
      <Inbox className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-[#F8FAFC]">{title}</h3>
    <p className="mt-1 text-xs text-[#A1A1AA] max-w-sm">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#8B5CF6] hover:bg-[#7C3AED] text-white transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const ErrorState: React.FC<CommonStateProps> = ({
  title = 'An Error Occurred',
  description = 'We encountered an issue processing your request. Please try again.',
  actionText = 'Retry Request',
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#12151C] border border-[#EF4444]/30 ${className}`}>
    <div className="p-3 rounded-full bg-[#EF4444]/10 text-[#EF4444] mb-3">
      <AlertTriangle className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-[#F8FAFC]">{title}</h3>
    <p className="mt-1 text-xs text-[#A1A1AA] max-w-sm">{description}</p>
    {onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444]/40 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const SuccessState: React.FC<CommonStateProps> = ({
  title = 'Action Completed',
  description = 'Your operation was executed successfully.',
  actionText,
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center p-8 text-center rounded-xl bg-[#12151C] border border-[#22C55E]/30 ${className}`}>
    <div className="p-3 rounded-full bg-[#22C55E]/10 text-[#22C55E] mb-3">
      <CheckCircle2 className="w-6 h-6" />
    </div>
    <h3 className="text-sm font-semibold text-[#F8FAFC]">{title}</h3>
    <p className="mt-1 text-xs text-[#A1A1AA] max-w-sm">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#22C55E]/20 hover:bg-[#22C55E]/30 text-[#22C55E] transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const NotFoundState: React.FC<CommonStateProps> = ({
  title = '404 — Page Not Found',
  description = 'The page or resource you are looking for does not exist or has been moved.',
  actionText = 'Return to Dashboard',
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 text-center rounded-xl bg-[#12151C] border border-[#272C36] ${className}`}>
    <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] mb-4">
      <FileQuestion className="w-8 h-8" />
    </div>
    <h2 className="text-xl font-bold text-[#F8FAFC]">{title}</h2>
    <p className="mt-2 text-xs text-[#A1A1AA] max-w-md">{description}</p>
    {onAction && (
      <button
        onClick={onAction}
        className="mt-6 px-4 py-2 rounded-lg text-xs font-semibold bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-glow-primary transition-all"
      >
        {actionText}
      </button>
    )}
  </div>
);
