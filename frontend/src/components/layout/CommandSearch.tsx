import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  LineChart,
  FileText,
  Bell,
  Settings,
  X,
  ArrowRight,
} from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  category: string;
  path: string;
  icon: React.ElementType;
}

const commands: CommandItem[] = [
  { id: 'dashboard', name: 'Dashboard Overview', category: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { id: 'customers', name: 'Customer Directory & Segmentation', category: 'Workspace', path: '/customers', icon: Users },
  { id: 'subscriptions', name: 'Subscription Plans & Churn', category: 'Workspace', path: '/subscriptions', icon: CreditCard },
  { id: 'transactions', name: 'Financial Transaction Ledger', category: 'Workspace', path: '/transactions', icon: Receipt },
  { id: 'analytics', name: 'Advanced Cohort Analytics', category: 'Insights', path: '/analytics', icon: LineChart },
  { id: 'reports', name: 'Revenue & Tax Reports Generator', category: 'Insights', path: '/reports', icon: FileText },
  { id: 'notifications', name: 'System Notifications & Webhooks', category: 'System', path: '/notifications', icon: Bell },
  { id: 'settings', name: 'Platform Settings & API Keys', category: 'System', path: '/settings', icon: Settings },
];

export interface CommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandSearch: React.FC<CommandSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open trigger handled outside or via global listener
        }
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          navigate(filteredCommands[selectedIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-[#12151C] border border-[#272C36] rounded-xl shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#272C36] gap-3">
          <Search className="w-5 h-5 text-[#8B5CF6] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages, metrics..."
            className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-xs text-[#71717A] hover:text-white">
              Clear
            </button>
          )}
          <button onClick={onClose} className="p-1 text-[#71717A] hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-[#71717A] text-xs">
              No matching pages or commands found for &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    navigate(cmd.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors text-xs ${
                    isSelected ? 'bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#F8FAFC]' : 'text-[#A1A1AA] hover:bg-[#181C25]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg border ${
                        isSelected ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]' : 'bg-[#181C25] border-[#272C36] text-[#A1A1AA]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#F8FAFC]">{cmd.name}</span>
                      <span className="text-[10px] text-[#71717A]">{cmd.category}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#8B5CF6]">
                      <span>Jump to</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 border-t border-[#272C36] bg-[#0B0D12]/60 text-[11px] text-[#71717A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#181C25] border border-[#272C36] font-mono text-[10px]">↑↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#181C25] border border-[#272C36] font-mono text-[10px]">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#181C25] border border-[#272C36] font-mono text-[10px]">ESC</kbd> Close
            </span>
          </div>
          <span className="font-medium text-[#8B5CF6]">Nexora Command</span>
        </div>
      </div>
    </div>
  );
};
