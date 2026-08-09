import React from 'react';
import { useHealth } from '../../hooks/useHealth';
import { Sparkles } from 'lucide-react';

export const ApiStatusBadge: React.FC = () => {
  const { status } = useHealth(12000);

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-600 dark:text-amber-400">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>API Syncing...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>API ● Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-bold text-purple-700 dark:text-purple-300">
      <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
      <span>Demo Mode (In-Memory)</span>
    </div>
  );
};
