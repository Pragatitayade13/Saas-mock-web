import React from 'react';
import { useHealth } from '../../hooks/useHealth';

export const ApiStatusBadge: React.FC = () => {
  const { status } = useHealth(12000);

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#181C25] border border-[#272C36] text-[11px] font-medium text-[#A1A1AA]">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
        <span>API Syncing...</span>
      </div>
    );
  }

  if (status === 'connected') {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[11px] font-medium text-[#22C55E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
        <span>API ● Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EF4444]/10 border border-[#EF4444]/20 text-[11px] font-medium text-[#EF4444]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
      <span>API ● Offline</span>
    </div>
  );
};
