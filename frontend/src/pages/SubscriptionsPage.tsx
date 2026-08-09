import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  Calendar,
  User,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
  Loader2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  Subscription,
  SubscriptionQueryParams,
  fetchSubscriptions,
  PlanTier,
  SubscriptionStatus,
  BillingCycle,
} from '../services/api/subscriptions';
import { Customer, fetchCustomers } from '../services/api/customers';
import { SubscriptionFormModal } from '../components/subscriptions/SubscriptionFormModal';
import { ChangePlanModal } from '../components/subscriptions/ChangePlanModal';
import { CancelSubscriptionModal } from '../components/subscriptions/CancelSubscriptionModal';
import { useAuth } from '../hooks/useAuth';

export const SubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isViewer = user?.role === 'Viewer';

  // Subscriptions & Metadata State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customersMap, setCustomersMap] = useState<Record<string, Customer>>({});
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Query Controls State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [changePlanSub, setChangePlanSub] = useState<Subscription | null>(null);
  const [cancelSub, setCancelSub] = useState<Subscription | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load Subscriptions & Lookup Customers
  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams: SubscriptionQueryParams = {
        search: debouncedSearch,
        plan: selectedPlan,
        status: selectedStatus,
        billingCycle: selectedCycle,
        sortBy,
        sortOrder,
        page,
        limit: 20,
      };

      const res = await fetchSubscriptions(queryParams);
      setSubscriptions(res.data);
      setMeta(res.meta);

      // Fetch related customer details for avatars/names
      if (res.data.length > 0) {
        const custRes = await fetchCustomers({ limit: 100 });
        const map: Record<string, Customer> = {};
        custRes.data.forEach((c) => {
          map[c.id] = c;
        });
        setCustomersMap(map);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedPlan, selectedStatus, selectedCycle, sortBy, sortOrder, page]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (subscriptions.length === 0) return;

    const headers = [
      'Subscription ID',
      'Customer ID',
      'Customer Name',
      'Customer Email',
      'Plan',
      'Status',
      'Amount',
      'Billing Cycle',
      'Start Date',
      'Next Billing Date',
    ];

    const rows = subscriptions.map((sub) => {
      const cust = customersMap[sub.customerId];
      return [
        `"${sub.id}"`,
        `"${sub.customerId}"`,
        `"${cust?.name || ''}"`,
        `"${cust?.email || ''}"`,
        `"${sub.plan}"`,
        `"${sub.status}"`,
        `"${sub.amount}"`,
        `"${sub.billingCycle}"`,
        `"${new Date(sub.startDate).toLocaleDateString()}"`,
        `"${new Date(sub.nextBillingDate).toLocaleDateString()}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexora_subscriptions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPlanBadgeStatus = (plan: PlanTier): BadgeStatus => {
    switch (plan) {
      case 'Enterprise': return 'premium';
      case 'Professional': return 'info';
      case 'Starter': return 'trial';
      default: return 'inactive';
    }
  };

  const getStatusBadgeStatus = (status: SubscriptionStatus): BadgeStatus => {
    switch (status) {
      case 'Active': return 'active';
      case 'Trial': return 'trial';
      case 'PastDue': return 'warning';
      case 'Cancelled': return 'cancelled';
      case 'Expired': return 'inactive';
      default: return 'inactive';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Premium 3D Subscriptions Growth Hero Banner */}
        <Card variant="glass" className="relative overflow-hidden border-white/[0.1] bg-gradient-to-r from-[#111419]/90 via-[#171A20]/80 to-[#1D2128]/90">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                <CreditCard className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Subscription Lifecycle & Recurring Revenue Growth</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F8FA] tracking-tight">
                Subscription Lifecycle Management
              </h1>

              <p className="text-xs sm:text-sm text-[#A5ACB8] leading-relaxed">
                Manage customer recurring plans, upgrades, billing cycles, trial transitions, status changes, and MRR growth.
              </p>
            </div>

            <div className="w-full lg:w-80 h-44 rounded-2xl border border-white/[0.08] overflow-hidden shrink-0 shadow-2xl group">
              <img
                src="/subscriptions_3d_growth.png"
                alt="3D SaaS Subscriptions Revenue Growth Visual"
                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </Card>

        {/* Top Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              disabled={subscriptions.length === 0}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>

          {!isViewer && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Subscription
            </Button>
          )}
        </div>

        {/* Search, Filter Drawer Toggle & Sort Controls */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Input
                placeholder="Search by customer name, email, or subscription ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[#71717A]" />}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71717A] hover:text-[#A1A1AA]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Toggle & Sort Selectors */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                variant={isFilterOpen ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                leftIcon={<Filter className="w-4 h-4" />}
              >
                Filters {(selectedPlan !== 'all' || selectedStatus !== 'all' || selectedCycle !== 'all') && '• Active'}
              </Button>

              <div className="flex items-center gap-1 bg-[#12151C] p-1 rounded-xl border border-[#272C36]">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { label: 'Created Date', value: 'createdAt' },
                    { label: 'Amount', value: 'amount' },
                    { label: 'Start Date', value: 'startDate' },
                    { label: 'Next Billing', value: 'nextBillingDate' },
                    { label: 'Customer Name', value: 'customerName' },
                  ]}
                  className="border-none bg-transparent text-xs py-1"
                />
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#181C25] transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Filter Panel */}
          {isFilterOpen && (
            <div className="pt-4 border-t border-[#272C36] grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Plan Tier</label>
                <Select
                  value={selectedPlan}
                  onChange={(e) => { setSelectedPlan(e.target.value); setPage(1); }}
                  options={[
                    { label: 'All Plans', value: 'all' },
                    { label: 'Free', value: 'Free' },
                    { label: 'Starter', value: 'Starter' },
                    { label: 'Professional', value: 'Professional' },
                    { label: 'Enterprise', value: 'Enterprise' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Status</label>
                <Select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Active', value: 'Active' },
                    { label: 'Trial', value: 'Trial' },
                    { label: 'Past Due', value: 'PastDue' },
                    { label: 'Cancelled', value: 'Cancelled' },
                    { label: 'Expired', value: 'Expired' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Billing Cycle</label>
                <Select
                  value={selectedCycle}
                  onChange={(e) => { setSelectedCycle(e.target.value); setPage(1); }}
                  options={[
                    { label: 'All Cycles', value: 'all' },
                    { label: 'Monthly', value: 'Monthly' },
                    { label: 'Yearly', value: 'Yearly' },
                  ]}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Content Body: Loading / Error / Empty / Table / Mobile Cards */}
        {isLoading ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mb-3" />
            <p className="text-xs text-[#A1A1AA] font-medium">Loading subscription data...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 bg-rose-500/10 border-rose-500/20 text-rose-300 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
            <Button variant="secondary" size="sm" onClick={loadSubscriptions}>
              Retry Loading
            </Button>
          </Card>
        ) : subscriptions.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">No subscriptions found</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-6">
              {debouncedSearch || selectedPlan !== 'all' || selectedStatus !== 'all'
                ? 'No subscriptions match your search parameters or active filters.'
                : 'Get started by creating a new subscription plan for a customer.'}
            </p>
            {!isViewer && (
              <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                New Subscription
              </Button>
            )}
          </Card>
        ) : (
          <>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-[#272C36] bg-[#12151C] shadow-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#272C36] bg-[#181C25]/60 text-[#A1A1AA] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Plan</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Cycle</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Next Billing</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272C36]/50 font-normal">
                  {subscriptions.map((sub) => {
                    const customer = customersMap[sub.customerId];
                    return (
                      <tr key={sub.id} className="hover:bg-[#181C25]/40 transition-colors group">
                        {/* Customer Info */}
                        <td className="py-3.5 px-4">
                          <Link to={`/subscriptions/${sub.id}`} className="flex items-center gap-3 group-hover:text-[#8B5CF6]">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md">
                              {customer?.name?.charAt(0) || 'C'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#F8FAFC] group-hover:text-[#8B5CF6] transition-colors truncate">
                                {customer?.name || sub.customerId}
                              </div>
                              <div className="text-[11px] text-[#71717A] truncate">{customer?.company || customer?.email}</div>
                            </div>
                          </Link>
                        </td>

                        {/* Plan Badge */}
                        <td className="py-3.5 px-4">
                          <Badge status={getPlanBadgeStatus(sub.plan)}>
                            {sub.plan}
                          </Badge>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#F8FAFC]">
                          ${sub.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Billing Cycle */}
                        <td className="py-3.5 px-4 text-[#A1A1AA]">
                          {sub.billingCycle}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <Badge status={getStatusBadgeStatus(sub.status)}>
                            {sub.status}
                          </Badge>
                        </td>

                        {/* Next Billing Date */}
                        <td className="py-3.5 px-4 text-[#A1A1AA] font-mono text-[11px]">
                          {new Date(sub.nextBillingDate).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/subscriptions/${sub.id}`}>
                              <Button variant="ghost" size="sm" className="px-2.5">
                                View
                              </Button>
                            </Link>

                            {!isViewer && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="px-2 text-[#8B5CF6]"
                                  onClick={() => setChangePlanSub(sub)}
                                  disabled={sub.status === 'Cancelled' || sub.status === 'Expired'}
                                >
                                  Change Plan
                                </Button>

                                {sub.status !== 'Cancelled' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="px-2 text-rose-400 hover:text-rose-300"
                                    onClick={() => setCancelSub(sub)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 768px) */}
            <div className="md:hidden space-y-3">
              {subscriptions.map((sub) => {
                const customer = customersMap[sub.customerId];
                return (
                  <Card key={sub.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white font-bold flex items-center justify-center text-xs">
                          {customer?.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#F8FAFC]">{customer?.name || sub.customerId}</h4>
                          <p className="text-[10px] text-[#71717A]">{customer?.company}</p>
                        </div>
                      </div>
                      <Badge status={getStatusBadgeStatus(sub.status)}>
                        {sub.status}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-[#272C36] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#71717A] block">Plan & Amount</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge status={getPlanBadgeStatus(sub.plan)}>{sub.plan}</Badge>
                          <span className="font-mono font-bold text-[#F8FAFC]">${sub.amount}/{sub.billingCycle === 'Yearly' ? 'yr' : 'mo'}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#71717A] block">Next Billing</span>
                        <span className="font-mono text-[11px] text-[#A1A1AA]">{new Date(sub.nextBillingDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <Link to={`/subscriptions/${sub.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs py-1">
                          View Details
                        </Button>
                      </Link>
                      {!isViewer && sub.status !== 'Cancelled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-400 py-1"
                          onClick={() => setCancelSub(sub)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#12151C] border border-[#272C36] text-xs text-[#A1A1AA]">
                <div>
                  Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} subscriptions
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.page <= 1}
                    onClick={() => setPage(meta.page - 1)}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-1 rounded-lg bg-[#181C25] font-mono font-bold text-[#F8FAFC]">
                    {meta.page} / {meta.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setPage(meta.page + 1)}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <SubscriptionFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadSubscriptions}
      />

      <ChangePlanModal
        isOpen={!!changePlanSub}
        onClose={() => setChangePlanSub(null)}
        subscription={changePlanSub}
        onSuccess={loadSubscriptions}
      />

      <CancelSubscriptionModal
        isOpen={!!cancelSub}
        onClose={() => setCancelSub(null)}
        subscription={cancelSub}
        onSuccess={loadSubscriptions}
      />
    </AppShell>
  );
};
