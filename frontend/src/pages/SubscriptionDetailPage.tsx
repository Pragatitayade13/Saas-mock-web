import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  DollarSign,
  User,
  Building,
  Sparkles,
  AlertCircle,
  Loader2,
  Clock,
  Ban,
  CheckCircle2,
  Receipt,
  Edit,
} from 'lucide-react';
import {
  Subscription,
  fetchSubscriptionById,
  fetchSubscriptionTransactions,
  PlanTier,
  SubscriptionStatus,
} from '../services/api/subscriptions';
import { Customer, fetchCustomerById } from '../services/api/customers';
import { CustomerTransaction } from '../services/api/customers';
import { ChangePlanModal } from '../components/subscriptions/ChangePlanModal';
import { CancelSubscriptionModal } from '../components/subscriptions/CancelSubscriptionModal';
import { SubscriptionFormModal } from '../components/subscriptions/SubscriptionFormModal';
import { useAuth } from '../hooks/useAuth';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const sub = await fetchSubscriptionById(id);
      setSubscription(sub);

      if (sub.customerId) {
        fetchCustomerById(sub.customerId)
          .then(setCustomer)
          .catch(() => {});
      }

      fetchSubscriptionTransactions(id)
        .then((res) => setTransactions(res.data))
        .catch(() => {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mb-3" />
          <p className="text-xs text-[#A1A1AA]">Loading subscription records...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !subscription) {
    return (
      <AppShell>
        <Card className="p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-[#F8FAFC]">Subscription Not Found</h3>
          <p className="text-xs text-[#A1A1AA]">{error || 'The requested subscription could not be found.'}</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/subscriptions')}>
            Back to Subscriptions
          </Button>
        </Card>
      </AppShell>
    );
  }

  // Calculate Annualized Value (monthly amount * 12 or yearly price)
  const annualizedValue = subscription.billingCycle === 'Yearly'
    ? subscription.amount
    : subscription.amount * 12;

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
      default: return 'inactive';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Back Button */}
        <Link
          to="/subscriptions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subscriptions</span>
        </Link>

        {/* Profile Header Hero Card */}
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#12151C] via-[#181C25] to-[#12151C] border-[#272C36] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20 shrink-0">
                {subscription.plan.charAt(0)}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
                    {subscription.plan} Plan
                  </h1>
                  <Badge status={getStatusBadgeStatus(subscription.status)}>
                    {subscription.status}
                  </Badge>
                  <Badge status={getPlanBadgeStatus(subscription.plan)}>
                    {subscription.billingCycle}
                  </Badge>
                </div>
                <p className="text-xs text-[#A1A1AA] flex items-center gap-2">
                  <span>Subscription ID: <span className="font-mono text-[#F8FAFC] font-semibold">{subscription.id}</span></span>
                  <span>•</span>
                  <span>Customer: <Link to={`/customers/${subscription.customerId}`} className="text-[#8B5CF6] hover:underline font-semibold">{customer?.name || subscription.customerId}</Link></span>
                </p>
              </div>
            </div>

            {/* Price & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-[#71717A] uppercase font-bold block">Current Price</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ${subscription.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-[#71717A] ml-1">/ {subscription.billingCycle === 'Yearly' ? 'year' : 'month'}</span>
              </div>

              {!isViewer && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    leftIcon={<Edit className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsChangePlanOpen(true)}
                    disabled={subscription.status === 'Cancelled'}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Change Plan
                  </Button>
                  {subscription.status !== 'Cancelled' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setIsCancelModalOpen(true)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 2-Column Info & Billing Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscription Info Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <CreditCard className="w-4 h-4 text-[#8B5CF6]" />
              <span>Subscription Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#71717A] block">Subscription ID</span>
                <span className="font-mono font-bold text-[#F8FAFC]">{subscription.id}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Customer</span>
                <Link to={`/customers/${subscription.customerId}`} className="font-bold text-[#8B5CF6] hover:underline">
                  {customer?.name || subscription.customerId}
                </Link>
              </div>
              <div>
                <span className="text-[#71717A] block">Plan Tier</span>
                <span className="font-bold text-[#F8FAFC]">{subscription.plan}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Billing Cycle</span>
                <span className="font-semibold text-[#F8FAFC]">{subscription.billingCycle}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Start Date</span>
                <span className="font-mono text-[#F8FAFC]">{new Date(subscription.startDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Next Billing Date</span>
                <span className="font-mono text-[#F8FAFC]">{new Date(subscription.nextBillingDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Created At</span>
                <span className="font-mono text-[#A1A1AA]">{new Date(subscription.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Last Updated</span>
                <span className="font-mono text-[#A1A1AA]">{new Date(subscription.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Billing Overview Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Billing Overview</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#12151C] border border-[#272C36] flex items-center justify-between">
                <div>
                  <span className="text-[#71717A] block">Annualized Run-Rate Value</span>
                  <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">
                    ${annualizedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
                  ARR Metric
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#12151C] border border-[#272C36]">
                  <span className="text-[#71717A] block">Billing Schedule</span>
                  <span className="font-bold text-[#F8FAFC] mt-0.5 block">{subscription.billingCycle} Recurring</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#12151C] border border-[#272C36]">
                  <span className="text-[#71717A] block">Next Payment Due</span>
                  <span className="font-mono font-bold text-[#F8FAFC] mt-0.5 block">
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Subscription Payment History & Transactions Table */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#272C36] pb-3">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#8B5CF6]" />
              <span>Payment History & Related Transactions</span>
            </h3>
            <span className="text-xs text-[#71717A] font-mono">{transactions.length} records</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#A1A1AA]">
              No transactions logged for this subscription yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#272C36] text-[#71717A] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272C36]/40">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-[#181C25]/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#F8FAFC]">{t.id}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        ${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-[#A1A1AA]">{t.type}</td>
                      <td className="py-3 px-3">
                        <Badge status={t.status === 'Completed' ? 'completed' : 'pending'}>
                          {t.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-[#A1A1AA]">Credit Card</td>
                      <td className="py-3 px-3 text-right font-mono text-[#71717A]">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Subscription Lifecycle History Timeline */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
            <span>Subscription History Timeline</span>
          </h3>

          <div className="space-y-4 text-xs relative pl-4 border-l-2 border-[#272C36] ml-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] absolute -left-[21px] top-1" />
              <div className="font-bold text-[#F8FAFC]">Subscription Record Initialized</div>
              <p className="text-[11px] text-[#A1A1AA]">
                Created on {new Date(subscription.createdAt).toLocaleString()} with {subscription.plan} plan (${subscription.amount}/mo).
              </p>
            </div>

            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -left-[21px] top-1" />
              <div className="font-bold text-[#F8FAFC]">Active Status Verified</div>
              <p className="text-[11px] text-[#A1A1AA]">Next recurring billing scheduled for {new Date(subscription.nextBillingDate).toLocaleDateString()}.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <SubscriptionFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialSubscription={subscription}
        onSuccess={loadData}
      />

      <ChangePlanModal
        isOpen={isChangePlanOpen}
        onClose={() => setIsChangePlanOpen(false)}
        subscription={subscription}
        onSuccess={loadData}
      />

      <CancelSubscriptionModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        subscription={subscription}
        onSuccess={loadData}
      />
    </AppShell>
  );
};
