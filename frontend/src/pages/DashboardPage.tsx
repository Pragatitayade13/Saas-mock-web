import React, { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, RotateCcw, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { AppShell } from '../layouts/AppShell';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/FormControls';
import { Card } from '../components/ui/Card';
import { MetricCards } from '../components/dashboard/MetricCards';
import { RevenueOverviewChart, SubscriptionMixChart, UserGrowthChart } from '../components/dashboard/Charts';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { SaaSDataObject3D } from '../components/dashboard/SaaSDataObject3D';
import { fetchDashboardData, DashboardData, METRICS_BY_RANGE } from '../services/api/dashboard';
import { resetDemoStore } from '../services/api/demo';

export const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [dashboardData, setDashboardData] = useState<DashboardData>(METRICS_BY_RANGE['30d']);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const loadData = useCallback(async (showRefreshIndicator = false, range = dateRange) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    try {
      const data = await fetchDashboardData(range);
      setDashboardData(data || METRICS_BY_RANGE[range] || METRICS_BY_RANGE['30d']);
    } catch {
      setDashboardData(METRICS_BY_RANGE[range] || METRICS_BY_RANGE['30d']);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData(false, dateRange);
  }, [dateRange, loadData]);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset Go in-memory store to original seed data?')) return;
    setIsResetting(true);
    try {
      await resetDemoStore();
      await loadData(false, dateRange);
    } catch {
      setDashboardData(METRICS_BY_RANGE['30d']);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 sm:space-y-8 text-left">
        {/* Premium Dashboard Hero Header Banner */}
        <Card variant="glass" className="relative overflow-hidden border-slate-200/90 dark:border-white/[0.1] bg-gradient-to-r from-purple-500/10 via-slate-100/90 to-indigo-500/10 dark:from-[#111419]/90 dark:via-[#171A20]/80 dark:to-[#1D2128]/90">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-3 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                <Sparkles className="w-4 h-4" />
                <span>Nexora SaaS Core v2.4 Active</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F7F8FA] tracking-tight font-heading italic">
                Good morning, Pragati 👋
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-[#A5ACB8] leading-relaxed font-medium">
                Here is your live revenue velocity, customer expansion rate, and active transaction metrics synced directly from your Go in-memory state engine.
              </p>

              <div className="flex items-center gap-5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-[#707784] pt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-500 dark:text-emerald-400" />
                  <span>Multi-tenant Isolation Enforced</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-[#8B5CF6]" />
                  <span>Real-time ICM Stream</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Dashboard Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-[#A5ACB8] uppercase tracking-wider">Date Range Filter</span>
            <div className="w-52">
              <Select
                value={dateRange}
                onChange={(e) => {
                  const newRange = e.target.value;
                  setDateRange(newRange);
                  loadData(false, newRange);
                }}
                options={[
                  { label: 'Last 7 Days (Daily)', value: '7d' },
                  { label: 'Last 30 Days (Weekly)', value: '30d' },
                  { label: 'Last 90 Days (Quarterly)', value: '90d' },
                  { label: 'Year to Date (Monthly)', value: 'ytd' },
                ]}
                className="text-xs sm:text-sm py-2 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="secondary"
              size="md"
              onClick={() => loadData(true, dateRange)}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Sync API
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleResetDemo}
              isLoading={isResetting}
              leftIcon={<RotateCcw className="w-4 h-4 text-amber-500" />}
            >
              Reset Seed
            </Button>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Report
            </Button>
          </div>
        </div>

        {/* Metric Cards Row */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-slate-200/60 dark:bg-[#171A20]/60 border border-slate-200 dark:border-white/[0.08] animate-shimmer" />
            ))}
          </div>
        ) : (
          <MetricCards key={dateRange} metrics={{
            revenue: dashboardData.revenue,
            customers: dashboardData.customers,
            subscriptions: dashboardData.subscriptions,
            conversion: dashboardData.conversion,
          }} />
        )}

        {/* Analytics Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueOverviewChart
              monthlyData={dashboardData.monthlyRevenueChart}
              weeklyData={dashboardData.weeklyRevenueChart}
              selectedDateRange={dateRange}
            />
          </div>
          <div>
            <SubscriptionMixChart data={dashboardData.subscriptionMixChart} />
          </div>
        </div>

        {/* Customer Growth & Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UserGrowthChart data={dashboardData.userGrowthChart} />
          </div>
          <div className="lg:col-span-2">
            <ActivityTimeline initialItems={dashboardData.recentActivity} />
          </div>
        </div>

        {/* Recent Transactions Data Table */}
        <RecentTransactionsTable transactions={dashboardData.recentTransactions} />
      </div>
    </AppShell>
  );
};
