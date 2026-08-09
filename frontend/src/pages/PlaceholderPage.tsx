import React from 'react';
import { AppShell } from '../layouts/AppShell';
import { Layers, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  moduleName: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, moduleName }) => {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="pb-4 border-b border-[#272C36]">
          <h1 className="text-2xl font-bold text-[#F8FAFC]">{title}</h1>
          <p className="text-xs text-[#A1A1AA] mt-1">{description}</p>
        </div>

        {/* Placeholder Card */}
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#12151C] border border-[#272C36] min-h-[380px]">
          <div className="p-4 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full bg-[#181C25] border border-[#272C36] text-[11px] text-[#22D3EE] font-semibold mb-3">
            Module: {moduleName}
          </span>
          <h2 className="text-xl font-bold text-[#F8FAFC]">Coming in Next Vertical Slice</h2>
          <p className="mt-2 text-xs text-[#A1A1AA] max-w-md leading-relaxed">
            The foundation routing, layout shell, design tokens, and API client for <strong className="text-[#F8FAFC]">{title}</strong> are established. Full business logic and interactive charts will be implemented in future vertical slices.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 px-4 py-2 rounded-lg text-xs font-semibold bg-[#181C25] hover:bg-[#272C36] border border-[#272C36] text-[#F8FAFC] transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
};
