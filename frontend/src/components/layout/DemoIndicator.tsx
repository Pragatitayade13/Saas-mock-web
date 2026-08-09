import React from 'react';

export const DemoIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 ${className}`}
      title="This instance uses in-memory mock presentation data"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
      <span>Demo Mode · In-Memory Data</span>
    </div>
  );
};
