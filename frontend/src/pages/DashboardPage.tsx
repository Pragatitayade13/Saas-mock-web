import React, { useState, useEffect, useCallback } from 'react';
import { Download, RefreshCw, AlertTriangle, RotateCcw, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { AppShell } from '../layouts/AppShell';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/FormControls';
import { Card } from '../components/ui/Card';
import { MetricCards } from '../components/dashboard/MetricCards';
import { RevenueOverviewChart, SubscriptionMixChart, UserGrowthChart } from '../components/dashboard/Charts';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { ActivityTimeline } from '../components/dashboard/ActivityTimeline';
import { SaaSDataObject3D } from '../components/dashboard/SaaSDataObject3D';
import { fetchDashboardData, DashboardData } from '../services/api/dashboard';
import { resetDemoStore } from '../services/api/demo';

export const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Go backend API.';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset Go in-memory store to original seed data?')) return;
    setIsResetting(true);
    try {
      await resetDemoStore();
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 sm:space-y-8">
        {/* Premium Dashboard Hero Header Banner */}
        <Card variant="glass" className="relative overflow-hidden border-white/[0.1] bg-gradient-to-r from-[#111419]/90 via-[#171A20]/80 to-[#1D2128]/90">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nexora SaaS Core v2.4 Active</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F8FA] tracking-tight">
                Good morning, Pragati 👋
              </h1>

              <p className="text-xs sm:text-sm text-[#A5ACB8] leading-relaxed">
                Here is your live revenue velocity, customer expansion rate, and active transaction metrics synced directly from your Go in-memory state engine.
              </p>

              <div className="flex items-center gap-4 text-xs font-semibold text-[#707784] pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Multi-tenant Isolation Enforced</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Real-time ICM Stream</span>
                </div>
              </div>
            </div>

            {/* Interactive 3D Visual Hero Component */}
            <div className="w-full lg:w-72 h-56 rounded-2xl border border-white/[0.08] bg-[#0B0D10]/40 backdrop-blur-md overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
              <SaaSDataObject3D />
            </div>
          </div>
        </Card>

        {/* Dashboard Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#A5ACB8] uppercase tracking-wider">Date Range Filter</span>
            <div className="w-36">
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={[
                  { label: 'Last 7 Days', value: '7d' },
                  { label: 'Last 30 Days', value: '30d' },
                  { label: 'Last 90 Days', value: '90d' },
                  { label: 'Year to Date', value: 'ytd' },
                ]}
                className="text-xs py-1.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="secondary"
              size="md"
              onClick={() => loadData(true)}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Sync API
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleResetDemo}
              isLoading={isResetting}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
            >
              Reset Seed
            </Button>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export Report
            </Button>
          </div>
        </div>

        {/* Error Alert State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold">API Connection Error</p>
                <p className="text-xs text-rose-400/80">{error}</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => loadData()}>
              Retry
            </Button>
          </div>
        )}

        {/* Metric Cards Row */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-[#171A20]/60 border border-white/[0.08] animate-shimmer" />
            ))}
          </div>
        ) : (
          <MetricCards metrics={dashboardData ? {
            revenue: dashboardData.revenue,
            customers: dashboardData.customers,
            subscriptions: dashboardData.subscriptions,
            conversion: dashboardData.conversion,
          } : undefined} />
        )}

        {/* Row 1: Revenue Overview (2 cols) & Subscription Mix (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 flex flex-col">
            <RevenueOverviewChart
              monthlyData={dashboardData?.monthlyRevenueChart}
              weeklyData={dashboardData?.weeklyRevenueChart}
            />
          </div>
          <div className="flex flex-col">
            <SubscriptionMixChart data={dashboardData?.subscriptionMixChart} />
          </div>
        </div>

        {/* Row 2: Recent Transactions (2 cols) & Customer Growth + Activity Feed (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <RecentTransactionsTable transactions={dashboardData?.recentTransactions} />
          </div>
          <div className="space-y-6">
            <UserGrowthChart data={dashboardData?.userGrowthChart} />
            <ActivityTimeline activities={dashboardData?.recentActivity} />
          </div>
        </div>
      </div>
    </AppShell>
  );
};
