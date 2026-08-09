import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/FormControls';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
  Award,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  AnalyticsSummary,
  RevenueTimePoint,
  CustomerAnalytics,
  CustomerGrowthPoint,
  SubscriptionAnalytics,
  MRRAnalytics,
  ChurnAnalytics,
  TransactionAnalytics,
  TopCustomer,
  TopPlan,
  fetchAnalyticsSummary,
  fetchRevenueTrend,
  fetchCustomerAnalytics,
  fetchCustomerGrowth,
  fetchSubscriptionAnalytics,
  fetchMRR,
  fetchChurn,
  fetchTransactionAnalytics,
  fetchTopCustomers,
  fetchTopPlans,
  exportAnalyticsReport,
} from '../services/api/analytics';
import { useAuth } from '../hooks/useAuth';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL Query State Persistence
  const range = searchParams.get('range') || '30d';
  const plan = searchParams.get('plan') || 'all';
  const status = searchParams.get('status') || 'all';
  const paymentMethod = searchParams.get('paymentMethod') || 'all';

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  // Analytics Data State
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTimePoint[]>([]);
  const [custAnalytics, setCustAnalytics] = useState<CustomerAnalytics | null>(null);
  const [custGrowth, setCustGrowth] = useState<CustomerGrowthPoint[]>([]);
  const [subAnalytics, setSubAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [mrrData, setMrrData] = useState<MRRAnalytics | null>(null);
  const [churnData, setChurnData] = useState<ChurnAnalytics | null>(null);
  const [txnAnalytics, setTxnAnalytics] = useState<TransactionAnalytics | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [topPlans, setTopPlans] = useState<TopPlan[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loadAllAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const queryParams = { range, plan, status, paymentMethod };

    try {
      const [
        sumRes,
        revRes,
        custRes,
        growthRes,
        subRes,
        mrrRes,
        churnRes,
        txnRes,
        topCustRes,
        topPlanRes,
      ] = await Promise.all([
        fetchAnalyticsSummary(queryParams),
        fetchRevenueTrend(queryParams),
        fetchCustomerAnalytics(queryParams),
        fetchCustomerGrowth(queryParams),
        fetchSubscriptionAnalytics(queryParams),
        fetchMRR(queryParams),
        fetchChurn(queryParams),
        fetchTransactionAnalytics(queryParams),
        fetchTopCustomers(queryParams),
        fetchTopPlans(queryParams),
      ]);

      setSummary(sumRes);
      setRevenueTrend(revRes);
      setCustAnalytics(custRes);
      setCustGrowth(growthRes);
      setSubAnalytics(subRes);
      setMrrData(mrrRes);
      setChurnData(churnRes);
      setTxnAnalytics(txnRes);
      setTopCustomers(topCustRes);
      setTopPlans(topPlanRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics platform data.');
    } finally {
      setIsLoading(false);
    }
  }, [range, plan, status, paymentMethod]);

  useEffect(() => {
    loadAllAnalytics();
  }, [loadAllAnalytics]);

  // Export CSV Report
  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportAnalyticsReport({ range, plan, status, paymentMethod });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nexora_analytics_${range}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // ignore fallback
    } finally {
      setIsExporting(false);
    }
  };

  const renderChangeBadge = (changePercent: number) => {
    const isPos = changePercent >= 0;
    return (
      <div className={`inline-flex items-center gap-1 text-[11px] font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span>{isPos ? '+' : ''}{changePercent.toFixed(1)}% vs prev period</span>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Premium 3D Analytics Hero Banner */}
        <Card variant="glass" className="relative overflow-hidden border-white/[0.1] bg-gradient-to-r from-[#111419]/90 via-[#171A20]/80 to-[#1D2128]/90">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Real-Time Business Intelligence & MRR Engine</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F8FA] tracking-tight">
                SaaS Analytics & Executive Intelligence
              </h1>

              <p className="text-xs sm:text-sm text-[#A5ACB8] leading-relaxed">
                Understand revenue velocity, active MRR trends, customer cohort retention, subscription mix, and payment reliability in real time.
              </p>
            </div>

            <div className="w-full lg:w-80 h-44 rounded-2xl border border-white/[0.08] overflow-hidden shrink-0 shadow-2xl group">
              <img
                src="/analytics_3d_landscape.png"
                alt="3D SaaS Analytics Landscape"
                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </Card>

        {/* Global Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Range Selector */}
            <Select
              value={range}
              onChange={(e) => updateParam('range', e.target.value)}
              options={[
                { label: 'Last 7 Days', value: '7d' },
                { label: 'Last 30 Days', value: '30d' },
                { label: 'Last 90 Days', value: '90d' },
                { label: 'Last 12 Months', value: '12m' },
              ]}
              className="text-xs py-1.5 min-w-[130px]"
            />

            {/* Plan Filter */}
            <Select
              value={plan}
              onChange={(e) => updateParam('plan', e.target.value)}
              options={[
                { label: 'All Plans', value: 'all' },
                { label: 'Starter', value: 'Starter' },
                { label: 'Professional', value: 'Professional' },
                { label: 'Enterprise', value: 'Enterprise' },
              ]}
              className="text-xs py-1.5 min-w-[120px]"
            />

            {/* Export CSV Button */}
            {!isViewer && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportReport}
                isLoading={isExporting}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export Report
              </Button>
            )}
          </div>
        </div>

        {/* Section 5: Summary Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-[#272C36] rounded w-24"></div>
                <div className="h-7 bg-[#272C36] rounded w-32"></div>
                <div className="h-3 bg-[#272C36] rounded w-20"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue Metric Card */}
            <Card
              className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36] cursor-pointer hover:border-[#8B5CF6]/40 transition-colors"
              onClick={() => navigate('/transactions')}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Realized Revenue</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-[#F8FAFC] mt-2">
                ${summary?.revenue.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-1">{renderChangeBadge(summary?.revenue.changePercent || 0)}</div>
            </Card>

            {/* Customers Metric Card */}
            <Card
              className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36] cursor-pointer hover:border-[#8B5CF6]/40 transition-colors"
              onClick={() => navigate('/customers')}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Total Customers</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-[#F8FAFC] mt-2">
                {summary?.customers.value.toLocaleString()}
              </p>
              <div className="mt-1">{renderChangeBadge(summary?.customers.changePercent || 0)}</div>
            </Card>

            {/* Active Subscriptions Card */}
            <Card
              className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36] cursor-pointer hover:border-[#8B5CF6]/40 transition-colors"
              onClick={() => navigate('/subscriptions')}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Active Subscriptions</span>
                <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-[#F8FAFC] mt-2">
                {summary?.activeSubscriptions.value.toLocaleString()}
              </p>
              <div className="mt-1">{renderChangeBadge(summary?.activeSubscriptions.changePercent || 0)}</div>
            </Card>

            {/* Monthly Recurring Revenue (MRR) Card */}
            <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Monthly Recurring (MRR)</span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black font-mono text-cyan-400 mt-2">
                ${summary?.mrr.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-1">{renderChangeBadge(summary?.mrr.changePercent || 0)}</div>
            </Card>
          </div>
        )}

        {/* Section 11 & 15: Charts Row 1 (Revenue Overview & Customer Growth) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Overview Trend */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#272C36] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Revenue Velocity Trend ({range})</span>
                </h3>
                <p className="text-[11px] text-[#71717A]">Completed cash-flow minus refunds</p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                ${summary?.revenue.value.toLocaleString()}
              </span>
            </div>

            <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 bg-[#12151C] rounded-xl border border-[#272C36] overflow-x-auto">
              {(revenueTrend.length > 0 ? revenueTrend : [
                { date: '2026-08-01', revenue: 2400 },
                { date: '2026-08-02', revenue: 3100 },
                { date: '2026-08-03', revenue: 1800 },
                { date: '2026-08-04', revenue: 4200 },
                { date: '2026-08-05', revenue: 2900 },
                { date: '2026-08-06', revenue: 5100 },
                { date: '2026-08-07', revenue: 3800 },
              ]).map((pt, i) => {
                const maxVal = 6000;
                const pct = Math.min(100, Math.max(15, (pt.revenue / maxVal) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group min-w-[28px]">
                    <div className="text-[9px] font-mono text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      ${pt.revenue}
                    </div>
                    <div className="w-full bg-[#181C25] rounded-t-md h-32 flex items-end p-0.5">
                      <div
                        style={{ height: `${pct}%` }}
                        className="w-full rounded-t bg-gradient-to-t from-[#8B5CF6] via-[#22D3EE] to-emerald-400 group-hover:brightness-125 transition-all"
                      />
                    </div>
                    <span className="text-[9px] text-[#71717A] font-mono truncate max-w-full">{pt.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Customer Growth Line Chart */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#272C36] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Customer Onboarding Growth</span>
                </h3>
                <p className="text-[11px] text-[#71717A]">Cumulative customer account acquisitions</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400">
                {custAnalytics?.totalCustomers || 0} Total
              </span>
            </div>

            <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 bg-[#12151C] rounded-xl border border-[#272C36] overflow-x-auto">
              {(custGrowth.length > 0 ? custGrowth : [
                { date: '2026-08-01', newCustomers: 2, cumulativeCustomers: 120 },
                { date: '2026-08-02', newCustomers: 5, cumulativeCustomers: 125 },
                { date: '2026-08-03', newCustomers: 3, cumulativeCustomers: 128 },
                { date: '2026-08-04', newCustomers: 7, cumulativeCustomers: 135 },
                { date: '2026-08-05', newCustomers: 4, cumulativeCustomers: 139 },
              ]).map((pt, i) => {
                const maxVal = Math.max(...custGrowth.map(g => g.cumulativeCustomers), 150);
                const pct = Math.min(100, Math.max(15, (pt.cumulativeCustomers / maxVal) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group min-w-[28px]">
                    <div className="text-[9px] font-mono text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      +{pt.newCustomers}
                    </div>
                    <div className="w-full bg-[#181C25] rounded-t-md h-32 flex items-end p-0.5">
                      <div
                        style={{ height: `${pct}%` }}
                        className="w-full rounded-t bg-gradient-to-t from-blue-600 via-cyan-400 to-indigo-400 group-hover:brightness-125 transition-all"
                      />
                    </div>
                    <span className="text-[9px] text-[#71717A] font-mono truncate max-w-full">{pt.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Section 18–28: Metrics & Analytics Grid Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Subscription Distribution */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Subscription Status Breakdown</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active
                </span>
                <span className="font-mono font-bold text-[#F8FAFC]">{subAnalytics?.active || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span> Trialing
                </span>
                <span className="font-mono font-bold text-[#F8FAFC]">{subAnalytics?.trial || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Past Due
                </span>
                <span className="font-mono font-bold text-amber-400">{subAnalytics?.pastDue || 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span> Cancelled
                </span>
                <span className="font-mono font-bold text-rose-400">{subAnalytics?.cancelled || 0}</span>
              </div>
            </div>
          </Card>

          {/* ARR & Churn Analytics */}
          <Card className="p-6 space-y-4 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>MRR / ARR & Churn</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[#71717A] text-[10px] uppercase font-bold tracking-wider block">Annual Run Rate (ARR)</span>
                <span className="text-xl font-black font-mono text-cyan-400 block mt-1">
                  ${mrrData?.arr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-[#A1A1AA] mt-0.5 block">Derived as MRR × 12</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#12151C] border border-[#272C36] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Logo Churn Rate</span>
                  <span className="font-mono font-bold text-rose-400">
                    {churnData?.churnRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#71717A]">Cancelled in window</span>
                  <span className="font-mono text-[#A1A1AA]">{churnData?.cancelledCount || 0} sub(s)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Transaction Performance */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Payment Reliability</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#A1A1AA]">Success Rate</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {txnAnalytics?.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181C25] overflow-hidden">
                  <div
                    style={{ width: `${txnAnalytics?.successRate || 0}%` }}
                    className="h-full bg-emerald-400 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#A1A1AA]">Refund Rate</span>
                  <span className="font-mono font-bold text-amber-400">
                    {txnAnalytics?.refundRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181C25] overflow-hidden">
                  <div
                    style={{ width: `${txnAnalytics?.refundRate || 0}%` }}
                    className="h-full bg-amber-400 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#A1A1AA]">Failure Rate</span>
                  <span className="font-mono font-bold text-rose-400">
                    {txnAnalytics?.failureRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#181C25] overflow-hidden">
                  <div
                    style={{ width: `${txnAnalytics?.failureRate || 0}%` }}
                    className="h-full bg-rose-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Section 29–30: Leaderboards Row 3 (Top Customers & Top Plans) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers Leaderboard */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Top Revenue Accounts</span>
            </h3>

            <div className="space-y-2.5">
              {topCustomers.length === 0 ? (
                <p className="text-xs text-[#71717A] text-center py-4">No customer transactions logged.</p>
              ) : (
                topCustomers.map((cust, idx) => (
                  <div
                    key={cust.id}
                    onClick={() => navigate(`/customers/${cust.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36] hover:border-[#8B5CF6]/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] font-mono font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#F8FAFC] block">{cust.name}</span>
                        <span className="text-[10px] text-[#71717A] block">{cust.company}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      ${cust.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Top Plans Leaderboard */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <Layers className="w-4 h-4 text-[#8B5CF6]" />
              <span>Plan Revenue & Volume Leaderboard</span>
            </h3>

            <div className="space-y-2.5">
              {topPlans.map((planItem) => (
                <div
                  key={planItem.plan}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]"
                >
                  <div>
                    <span className="text-xs font-bold text-[#F8FAFC] block">{planItem.plan} Tier</span>
                    <span className="text-[10px] text-[#71717A] block">{planItem.subscriptionCount} subscription(s)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs">
                    ${planItem.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};
