import React, { useState } from 'react';
import {
  Cpu,
  Code2,
  Zap,
  Sparkles,
  Database,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowUpRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface TechItem {
  id: string;
  name: string;
  badge: string;
  category: string;
  icon: React.ElementType;
  color: string;
  bgGlow: string;
  borderColor: string;
  summary: string;
  details: {
    title: string;
    metrics: string;
    bullets: string[];
  };
}

const techStackData: TechItem[] = [
  {
    id: 'go',
    name: 'Go 1.22 Engine',
    badge: 'Backend Core',
    category: 'High-Concurrency Runtime',
    icon: Cpu,
    color: 'text-[#8B5CF6]',
    bgGlow: 'bg-[#8B5CF6]/15',
    borderColor: 'border-[#8B5CF6]/40',
    summary: 'Sub-millisecond REST API server with thread-safe memory locks.',
    details: {
      title: 'Compiled Concurrency Engine',
      metrics: '< 1ms Latency • 100% Type-Safe',
      bullets: [
        'Goroutine worker pools for non-blocking I/O handling',
        'Thread-safe sync.RWMutex in-memory store architecture',
        'Built-in structured logger and JSON error middleware',
      ],
    },
  },
  {
    id: 'gin',
    name: 'Gin Web Framework',
    badge: 'REST Router',
    category: 'Fast HTTP Router',
    icon: Code2,
    color: 'text-[#22D3EE]',
    bgGlow: 'bg-[#22D3EE]/15',
    borderColor: 'border-[#22D3EE]/40',
    summary: 'Radix tree router with role-based auth middleware chain.',
    details: {
      title: 'Enterprise Routing & Security',
      metrics: '40x Faster than standard HTTP • Zero Allocations',
      bullets: [
        'Role-Based Access Control (Admin, Manager, Viewer)',
        'Automatic CORS, recovery, and header protection',
        'Clean handler isolation adhering to Clean Architecture',
      ],
    },
  },
  {
    id: 'react',
    name: 'React 18',
    badge: 'Frontend Shell',
    category: 'Concurrent UI Library',
    icon: Zap,
    color: 'text-[#6366F1]',
    bgGlow: 'bg-[#6366F1]/15',
    borderColor: 'border-[#6366F1]/40',
    summary: 'Responsive executive dashboard with live Recharts telemetry.',
    details: {
      title: 'Component-Driven Dashboard',
      metrics: '60 FPS Transitions • Zero Layout Shift',
      bullets: [
        'Context-driven state management for Auth and Theme',
        'Custom hooks for real-time data polling and caching',
        'Liquid glassmorphism components with Tailwind styling',
      ],
    },
  },
  {
    id: 'vite',
    name: 'Vite + TypeScript',
    badge: 'Build Tooling',
    category: 'Sub-Second HMR',
    icon: Sparkles,
    color: 'text-[#C084FC]',
    bgGlow: 'bg-[#C084FC]/15',
    borderColor: 'border-[#C084FC]/40',
    summary: 'Ultra-fast ESM bundling and 100% strict type safety.',
    details: {
      title: 'Developer Experience & Bundling',
      metrics: 'Instant Server Cold-Start • Optimized Rollup',
      bullets: [
        'Native ES module imports for instant browser updates',
        'Strict TypeScript type definitions across API contracts',
        'Automated chunk splitting for production builds',
      ],
    },
  },
  {
    id: 'memory',
    name: 'In-Memory Store',
    badge: 'State Engine',
    category: 'In-Memory Ledger',
    icon: Database,
    color: 'text-[#22C55E]',
    bgGlow: 'bg-[#22C55E]/15',
    borderColor: 'border-[#22C55E]/40',
    summary: 'Sub-millisecond state engine with instant demo data resets.',
    details: {
      title: 'Real-Time In-Memory Ledger',
      metrics: 'Sub-ms Atomic Updates • Seed Data Reset',
      bullets: [
        'Atomic counters for transaction tracking and user metrics',
        'Instant POST /api/demo/reset seed data restoration',
        'Multi-tenant data isolation and filtered query indexing',
      ],
    },
  },
];

export const InteractiveTechStack: React.FC = () => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const isAllExpanded = techStackData.every((item) => expandedCards[item.id]);

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedCards({});
    } else {
      const allOpen: Record<string, boolean> = {};
      techStackData.forEach((item) => {
        allOpen[item.id] = true;
      });
      setExpandedCards(allOpen);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Header Bar with Expand All Toggle (No Heavy Border Lines) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] block">
            Technical Stack Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading italic text-white">
            Powered by Industry-Standard Tech Stack
          </h2>
          <p className="text-xs text-white/60">
            Click any card to inspect implementation details or toggle all cards at once.
          </p>
        </div>

        {/* Global Expand All / Collapse All Button */}
        <button
          onClick={toggleAll}
          className="liquid-glass-strong rounded-full px-5 py-2.5 text-xs font-semibold text-white flex items-center gap-2 hover:bg-white/10 transition-all self-start sm:self-auto shrink-0 shadow-lg"
        >
          {isAllExpanded ? (
            <>
              <Minimize2 className="w-4 h-4 text-[#22D3EE]" />
              <span>Collapse All Cards</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 text-[#8B5CF6]" />
              <span>Open All Stack Cards</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Expandable Cards Grid (No Heavy Lines) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
        {techStackData.map((item) => {
          const isExpanded = !!expandedCards[item.id];
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => toggleCard(item.id)}
              className={`
                group relative rounded-2xl cursor-pointer transition-all duration-300 select-none p-5
                backdrop-blur-xl bg-black/60 border overflow-hidden
                ${isExpanded ? `${item.borderColor} shadow-2xl scale-[1.02] ${item.bgGlow}` : 'border-white/10 hover:border-white/20 hover:bg-black/70'}
              `}
            >
              {/* Top Card Bar */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${item.bgGlow} border border-white/10 flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                  {item.badge}
                </span>
              </div>

              {/* Title & Summary */}
              <div className="space-y-1 text-left">
                <h3 className="text-base font-bold text-white flex items-center justify-between">
                  <span>{item.name}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-white/60 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/40 group-hover:text-white shrink-0 transition-colors" />
                  )}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              {/* Expanded Detail Content with Animation */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3 text-left animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="text-[11px] font-bold text-[#22D3EE] font-mono">
                    {item.details.metrics}
                  </div>

                  <ul className="space-y-2 text-xs text-white/80">
                    {item.details.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${item.color}`} />
                        <span className="leading-tight text-[11px] text-white/70">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-white/50 group-hover:text-white transition-colors">
                    <span>Active Architecture</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveTechStack;
