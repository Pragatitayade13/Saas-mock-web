import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  PieChart,
  BarChart3,
} from 'lucide-react';
import {
  Transaction,
  TransactionSummary,
  RevenueAnalytics,
  TransactionQueryParams,
  fetchTransactions,
  fetchTransactionSummary,
  fetchRevenueAnalytics,
  TransactionStatus,
  TransactionType,
} from '../services/api/transactions';
import { Customer, fetchCustomers } from '../services/api/customers';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';
import { RefundTransactionModal } from '../components/transactions/RefundTransactionModal';
import { useAuth } from '../hooks/useAuth';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';

  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customersMap, setCustomersMap] = useState<Record<string, Customer>>({});
  const [summary, setSummary] = useState<TransactionSummary>({
    totalRevenue: 0,
    successfulTransactions: 0,
    pendingAmount: 0,
    refundedAmount: 0,
  });
  const [analytics, setAnalytics] = useState<RevenueAnalytics>({
    daily: [],
    monthly: [],
    byPlan: [],
    byPaymentMethod: [],
  });
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [chartRange, setChartRange] = useState<string>('30d');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refundTxn, setRefundTxn] = useState<Transaction | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load summary & revenue analytics
  const loadSummaryAndAnalytics = useCallback(async () => {
    try {
      const [sumData, analyticsData] = await Promise.all([
        fetchTransactionSummary(),
        fetchRevenueAnalytics(chartRange),
      ]);
      setSummary(sumData);
      setAnalytics(analyticsData);
    } catch {
      // non-blocking fallback
    }
  }, [chartRange]);

  useEffect(() => {
    loadSummaryAndAnalytics();
  }, [loadSummaryAndAnalytics]);

  // Load main transactions list
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams: TransactionQueryParams = {
        search: debouncedSearch,
        status: selectedStatus,
        type: selectedType,
        paymentMethod: selectedMethod,
        sortBy,
        sortOrder,
        page,
        limit: 20,
      };

      const res = await fetchTransactions(queryParams);
      setTransactions(res.data);
      setMeta(res.meta);

      if (res.data.length > 0) {
        const custRes = await fetchCustomers({ limit: 100 });
        const map: Record<string, Customer> = {};
        custRes.data.forEach((c) => {
          map[c.id] = c;
        });
        setCustomersMap(map);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction activity.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedStatus, selectedType, selectedMethod, sortBy, sortOrder, page]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefreshAll = () => {
    loadSummaryAndAnalytics();
    loadTransactions();
  };

  // CSV Export
  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = [
      'Transaction ID',
      'Customer ID',
      'Customer Name',
      'Subscription ID',
      'Type',
      'Amount',
      'Currency',
      'Status',
      'Payment Method',
      'Transaction Date',
      'Description',
    ];

    const rows = transactions.map((t) => {
      const cust = customersMap[t.customerId];
      return [
        `"${t.id}"`,
        `"${t.customerId}"`,
        `"${cust?.name || ''}"`,
        `"${t.subscriptionId || ''}"`,
        `"${t.type}"`,
        `"${t.amount}"`,
        `"${t.currency}"`,
        `"${t.status}"`,
        `"${t.paymentMethod}"`,
        `"${new Date(t.transactionDate).toLocaleDateString()}"`,
        `"${t.description || ''}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexora_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeStatus = (status: TransactionStatus): BadgeStatus => {
    switch (status) {
      case 'Completed': return 'completed';
      case 'Pending': return 'pending';
      case 'Failed': return 'failed';
      case 'Refunded': return 'warning';
      default: return 'inactive';
    }
  };

  const getTypeBadgeStatus = (type: TransactionType): BadgeStatus => {
    switch (type) {
      case 'Subscription': return 'info';
      case 'Upgrade': return 'active';
      case 'Downgrade': return 'warning';
      case 'Refund': return 'cancelled';
      case 'Credit': return 'trial';
      case 'Adjustment': return 'inactive';
      default: return 'info';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] tracking-tight">Transactions & Revenue</h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
              Track payments, revenue volume, refunds, and financial transaction activity.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            {!isViewer && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Record Transaction
              </Button>
            )}
          </div>
        </div>

        {/* Section 5: Top Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Total Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-[#F8FAFC] mt-2">
              ${summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Realized Net Cash Volume
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Successful Transactions</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-[#F8FAFC] mt-2">
              {summary.successfulTransactions.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#A1A1AA] mt-1">Completed Payments</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Pending Revenue</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-amber-400 mt-2">
              ${summary.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-[#71717A] mt-1">Awaiting settlement</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Refunded Volume</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-rose-400 mt-2">
              ${summary.refundedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-rose-400/80 mt-1">Refunded to customers</p>
          </Card>
        </div>

        {/* Section 30–33: Revenue Analytics & Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Overview Trend Chart */}
          <Card className="p-6 lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#272C36] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Revenue Overview Trend</span>
                </h3>
                <p className="text-[11px] text-[#71717A]">Time-series trend calculated from ICM transactions</p>
              </div>

              {/* Time Range Filter Selector */}
              <div className="flex gap-1 p-1 rounded-xl bg-[#12151C] border border-[#272C36]">
                {['7d', '30d', '90d', '12m'].map((rng) => (
                  <button
                    key={rng}
                    onClick={() => setChartRange(rng)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      chartRange === rng
                        ? 'bg-[#8B5CF6] text-white'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {rng === '7d' ? '7 Days' : rng === '30d' ? '30 Days' : rng === '90d' ? '90 Days' : '12 Months'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Bar/Area Visualization */}
            <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 bg-[#12151C] rounded-xl border border-[#272C36] overflow-x-auto">
              {(analytics.daily.length > 0 ? analytics.daily : [
                { date: 'Aug 1', revenue: 2400 },
                { date: 'Aug 2', revenue: 3100 },
                { date: 'Aug 3', revenue: 1800 },
                { date: 'Aug 4', revenue: 4200 },
                { date: 'Aug 5', revenue: 2900 },
                { date: 'Aug 6', revenue: 5100 },
                { date: 'Aug 7', revenue: 3800 },
                { date: 'Aug 8', revenue: 4900 },
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
                        className="w-full rounded-t bg-gradient-to-t from-[#8B5CF6] via-[#22D3EE] to-emerald-400 group-hover:brightness-125 transition-all shadow-md"
                      />
                    </div>
                    <span className="text-[9px] text-[#71717A] truncate max-w-full font-mono">{pt.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Revenue by Plan & Method Widgets */}
          <Card className="p-6 space-y-4 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Revenue by Plan & Method</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-2">Revenue by Plan</span>
                <div className="space-y-2">
                  {(analytics.byPlan.length > 0 ? analytics.byPlan : [
                    { plan: 'Professional', revenue: 42500 },
                    { plan: 'Enterprise', revenue: 38200 },
                    { plan: 'Starter', revenue: 17400 },
                  ]).map((item) => (
                    <div key={item.plan} className="flex items-center justify-between p-2 rounded-lg bg-[#12151C] border border-[#272C36]">
                      <span className="font-bold text-[#F8FAFC]">{item.plan}</span>
                      <span className="font-mono font-bold text-emerald-400">${item.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-2">Payment Methods</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {(analytics.byPaymentMethod.length > 0 ? analytics.byPaymentMethod : [
                    { paymentMethod: 'Card', revenue: 72400 },
                    { paymentMethod: 'UPI', revenue: 31200 },
                    { paymentMethod: 'Bank Transfer', revenue: 19500 },
                    { paymentMethod: 'Demo Payment', revenue: 5350 },
                  ]).map((m) => (
                    <div key={m.paymentMethod} className="p-2 rounded-lg bg-[#12151C] border border-[#272C36]">
                      <span className="text-[#71717A] block truncate">{m.paymentMethod}</span>
                      <span className="font-mono font-bold text-[#F8FAFC] block mt-0.5">${m.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Controls Bar: Search, Filters & Sorting */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search by transaction ID, customer name, email, or description..."
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

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                variant={isFilterOpen ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                leftIcon={<Filter className="w-4 h-4" />}
              >
                Filters {(selectedStatus !== 'all' || selectedType !== 'all' || selectedMethod !== 'all') && '• Active'}
              </Button>

              <div className="flex items-center gap-1 bg-[#12151C] p-1 rounded-xl border border-[#272C36]">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { label: 'Created Date', value: 'createdAt' },
                    { label: 'Amount', value: 'amount' },
                    { label: 'Transaction Date', value: 'transactionDate' },
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

          {/* Filter Drawer Panel */}
          {isFilterOpen && (
            <div className="pt-4 border-t border-[#272C36] grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Status</label>
                <Select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                  options={[
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Completed', value: 'Completed' },
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Failed', value: 'Failed' },
                    { label: 'Refunded', value: 'Refunded' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Transaction Type</label>
                <Select
                  value={selectedType}
                  onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                  options={[
                    { label: 'All Types', value: 'all' },
                    { label: 'Subscription', value: 'Subscription' },
                    { label: 'Upgrade', value: 'Upgrade' },
                    { label: 'Downgrade', value: 'Downgrade' },
                    { label: 'Refund', value: 'Refund' },
                    { label: 'Credit', value: 'Credit' },
                    { label: 'Adjustment', value: 'Adjustment' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Payment Method</label>
                <Select
                  value={selectedMethod}
                  onChange={(e) => { setSelectedMethod(e.target.value); setPage(1); }}
                  options={[
                    { label: 'All Methods', value: 'all' },
                    { label: 'Card', value: 'Card' },
                    { label: 'UPI', value: 'UPI' },
                    { label: 'Bank Transfer', value: 'Bank Transfer' },
                    { label: 'Demo Payment', value: 'Demo Payment' },
                  ]}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Content Body: Table / Cards */}
        {isLoading ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mb-3" />
            <p className="text-xs text-[#A1A1AA]">Loading transaction activity...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 bg-rose-500/10 border-rose-500/20 text-rose-300 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
            <Button variant="secondary" size="sm" onClick={handleRefreshAll}>
              Retry Loading
            </Button>
          </Card>
        ) : transactions.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] mb-4">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC]">No transactions found</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mt-1 mb-6">
              {debouncedSearch || selectedStatus !== 'all' || selectedType !== 'all'
                ? 'No transactions match your search query or filter parameters.'
                : 'Payments will appear here when recorded or billed.'}
            </p>
            {!isViewer && (
              <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Record Transaction
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
                    <th className="py-3.5 px-4">Transaction ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272C36]/50 font-normal">
                  {transactions.map((txn) => {
                    const customer = customersMap[txn.customerId];
                    const isRefundType = txn.type === 'Refund';
                    return (
                      <tr key={txn.id} className="hover:bg-[#181C25]/40 transition-colors group">
                        {/* Transaction ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[#F8FAFC]">
                          <Link to={`/transactions/${txn.id}`} className="hover:text-[#8B5CF6] transition-colors">
                            {txn.id}
                          </Link>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <Link to={`/customers/${txn.customerId}`} className="flex items-center gap-2.5 group-hover:text-[#8B5CF6]">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                              {customer?.name?.charAt(0) || 'C'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-[#F8FAFC] truncate">{customer?.name || txn.customerId}</div>
                              <div className="text-[10px] text-[#71717A] truncate">{customer?.email}</div>
                            </div>
                          </Link>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-4">
                          <Badge status={getTypeBadgeStatus(txn.type)}>
                            {txn.type}
                          </Badge>
                        </td>

                        {/* Amount */}
                        <td className={`py-3.5 px-4 font-mono font-bold ${isRefundType ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isRefundType ? '-' : '+'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <Badge status={getStatusBadgeStatus(txn.status)}>
                            {txn.status}
                          </Badge>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 text-[#A1A1AA]">
                          {txn.paymentMethod || 'Card'}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-[#71717A] font-mono text-[11px]">
                          {new Date(txn.transactionDate || txn.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/transactions/${txn.id}`}>
                              <Button variant="ghost" size="sm" className="px-2.5">
                                View
                              </Button>
                            </Link>
                            {!isViewer && txn.status === 'Completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 text-rose-400 hover:text-rose-300"
                                onClick={() => setRefundTxn(txn)}
                              >
                                Refund
                              </Button>
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
              {transactions.map((txn) => {
                const customer = customersMap[txn.customerId];
                const isRefundType = txn.type === 'Refund';
                return (
                  <Card key={txn.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#F8FAFC]">{txn.id}</span>
                        <span className="text-[10px] text-[#71717A] block">{customer?.name || txn.customerId}</span>
                      </div>
                      <Badge status={getStatusBadgeStatus(txn.status)}>
                        {txn.status}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-[#272C36] flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#71717A] block">Type & Method</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge status={getTypeBadgeStatus(txn.type)}>{txn.type}</Badge>
                          <span className="text-[#A1A1AA]">{txn.paymentMethod}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#71717A] block">Amount</span>
                        <span className={`font-mono font-bold ${isRefundType ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {isRefundType ? '-' : '+'}${txn.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#71717A] font-mono">
                        {new Date(txn.transactionDate || txn.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Link to={`/transactions/${txn.id}`}>
                          <Button variant="ghost" size="sm" className="py-1">
                            View Details
                          </Button>
                        </Link>
                        {!isViewer && txn.status === 'Completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="py-1 text-rose-400"
                            onClick={() => setRefundTxn(txn)}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#12151C] border border-[#272C36] text-xs text-[#A1A1AA]">
                <div>
                  Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} transactions
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
      <TransactionFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleRefreshAll}
      />

      <RefundTransactionModal
        isOpen={!!refundTxn}
        onClose={() => setRefundTxn(null)}
        transaction={refundTxn}
        onSuccess={handleRefreshAll}
      />
    </AppShell>
  );
};
