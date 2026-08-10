import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  CreditCard,
  Search,
  ArrowUpRight,
  Sparkles,
  Activity,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';

const liveRevenueData = [
  { name: 'Jan', revenue: 42000, target: 40000 },
  { name: 'Feb', revenue: 51000, target: 45000 },
  { name: 'Mar', revenue: 58000, target: 50000 },
  { name: 'Apr', revenue: 64000, target: 60000 },
  { name: 'May', revenue: 72000, target: 68000 },
  { name: 'Jun', revenue: 79000, target: 75000 },
  { name: 'Jul', revenue: 84250, target: 80000 },
];

const liveWeeklyVelocityData = [
  { name: 'W1', revenue: 18400, target: 16000 },
  { name: 'W2', revenue: 22100, target: 19500 },
  { name: 'W3', revenue: 26800, target: 24000 },
  { name: 'W4', revenue: 31500, target: 28000 },
  { name: 'W5', revenue: 37200, target: 33000 },
  { name: 'W6', revenue: 43900, target: 39000 },
];

export const LiveGlassDashboardPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenue' | 'expansion'>('revenue');
  const currentChartData = activeTab === 'revenue' ? liveRevenueData : liveWeeklyVelocityData;

  return (
    <div className="relative w-full max-w-5xl mx-auto group">
      {/* Volumetric Ambient Glow Underneath */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] bg-gradient-to-r from-[#8B5CF6]/25 via-[#22D3EE]/20 to-[#6366F1]/25 rounded-3xl blur-3xl animate-pulse-glow pointer-events-none" />

      {/* Main Glass Shell */}
      <div className="relative rounded-3xl border border-white/20 bg-black/60 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 space-y-6 transition-transform duration-700 ease-out group-hover:scale-[1.01]">
        {/* Top Window Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Live Executive Interactive Preview</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value="Search metrics, reports, customers..."
                className="bg-white/5 border border-white/10 rounded-full py-1 pl-8 pr-10 text-xs text-white/70 focus:outline-none cursor-pointer w-64"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 font-mono">⌘K</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>2026 Engine Active</span>
            </div>
          </div>
        </div>

        {/* Live Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-2 hover:border-[#8B5CF6]/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Annual Recurring Revenue</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.4%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading italic">
              $332.8M
            </div>
            <div className="text-[11px] text-white/40">Synced directly from Go ICM store</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-2 hover:border-[#22D3EE]/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Active Customer Cohorts</span>
              <span className="text-[#22D3EE] font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" /> +1,240
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading italic">
              31,373
            </div>
            <div className="text-[11px] text-white/40">Multi-tenant accounts active</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-2 hover:border-purple-400/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Average Revenue Per User</span>
              <span className="text-purple-400 font-semibold flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> +5.2%
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading italic">
              $1,622 / mo
            </div>
            <div className="text-[11px] text-white/40">Enterprise Tier Plan mix</div>
          </div>
        </div>

        {/* Live Recharts Revenue Graph Panel */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Live Revenue ARR Progression</h4>
              <p className="text-xs text-white/50">Real-time telemetry stream</p>
            </div>
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setActiveTab('revenue')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'revenue' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-white/60 hover:text-white'
                }`}
              >
                Monthly ARR
              </button>
              <button
                onClick={() => setActiveTab('expansion')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'expansion' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-white/60 hover:text-white'
                }`}
              >
                Weekly Velocity
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={220}>
              <AreaChart key={activeTab} data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="livePreviewGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val >= 1000 ? val / 1000 + 'k' : val}`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 25, 0.92)',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#FFF',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(12px)',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'ARR']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#livePreviewGradient)"
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Real-time Transactions Stream Preview */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs">
          <div className="flex items-center gap-3 text-white/70">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acme Corp — TXN-3001 ($2,400.00)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 hidden sm:flex">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Starlight Media — Sub Upgraded</span>
            </div>
          </div>

          <button className="text-xs font-semibold text-[#22D3EE] hover:text-white flex items-center gap-1 transition-colors">
            <span>Explore Full Dashboard</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveGlassDashboardPreview;
