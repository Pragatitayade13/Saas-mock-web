import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Receipt,
  DollarSign,
  User,
  CreditCard,
  Building,
  Mail,
  Calendar,
  Clock,
  RotateCcw,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import {
  Transaction,
  fetchTransactionById,
  TransactionStatus,
  TransactionType,
} from '../services/api/transactions';
import { Customer, fetchCustomerById } from '../services/api/customers';
import { Subscription, fetchSubscriptionById } from '../services/api/subscriptions';
import { RefundTransactionModal } from '../components/transactions/RefundTransactionModal';
import { useAuth } from '../hooks/useAuth';

export const TransactionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';

  const [txn, setTxn] = useState<Transaction | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTransactionById(id);
      setTxn(data);

      if (data.customerId) {
        fetchCustomerById(data.customerId)
          .then(setCustomer)
          .catch(() => {});
      }

      if (data.subscriptionId) {
        fetchSubscriptionById(data.subscriptionId)
          .then(setSubscription)
          .catch(() => {});
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction details.');
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
          <p className="text-xs text-[#A1A1AA]">Loading transaction details...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !txn) {
    return (
      <AppShell>
        <Card className="p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-[#F8FAFC]">Transaction Not Found</h3>
          <p className="text-xs text-[#A1A1AA]">{error || 'The requested transaction record could not be found.'}</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/transactions')}>
            Back to Transactions
          </Button>
        </Card>
      </AppShell>
    );
  }

  const isRefundType = txn.type === 'Refund';

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
        {/* Top Back Navigation */}
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transactions</span>
        </Link>

        {/* Hero Card Banner */}
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#12151C] via-[#181C25] to-[#12151C] border-[#272C36] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20 shrink-0">
                <Receipt className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight font-mono">
                    #{txn.id}
                  </h1>
                  <Badge status={getStatusBadgeStatus(txn.status)}>
                    {txn.status}
                  </Badge>
                  <Badge status={getTypeBadgeStatus(txn.type)}>
                    {txn.type}
                  </Badge>
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  Logged on {new Date(txn.transactionDate || txn.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Amount & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-[#71717A] uppercase font-bold block">Amount</span>
                <span className={`text-2xl font-black font-mono ${isRefundType ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isRefundType ? '-' : '+'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-[#71717A] ml-1 font-mono">{txn.currency || 'USD'}</span>
              </div>

              {!isViewer && txn.status === 'Completed' && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsRefundModalOpen(true)}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Issue Refund
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* 2-Column Info Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Information Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <Receipt className="w-4 h-4 text-[#8B5CF6]" />
              <span>Transaction Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#71717A] block">Transaction ID</span>
                <span className="font-mono font-bold text-[#F8FAFC]">{txn.id}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Type</span>
                <span className="font-bold text-[#F8FAFC]">{txn.type}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Status</span>
                <Badge status={getStatusBadgeStatus(txn.status)}>{txn.status}</Badge>
              </div>
              <div>
                <span className="text-[#71717A] block">Transaction Date</span>
                <span className="font-mono text-[#F8FAFC]">
                  {new Date(txn.transactionDate || txn.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[#71717A] block">Description</span>
                <span className="text-[#F8FAFC]">{txn.description || 'Standard recurring payment transaction.'}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Created At</span>
                <span className="font-mono text-[#A1A1AA]">{new Date(txn.createdAt).toLocaleString()}</span>
              </div>
              {txn.updatedAt && (
                <div>
                  <span className="text-[#71717A] block">Updated At</span>
                  <span className="font-mono text-[#A1A1AA]">{new Date(txn.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Information Card */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Payment Details</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA]">Amount</span>
                <span className={`font-mono font-bold text-sm ${isRefundType ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isRefundType ? '-' : '+'}${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA]">Currency</span>
                <span className="font-mono font-bold text-[#F8FAFC]">{txn.currency || 'USD'}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA]">Payment Method</span>
                <span className="font-bold text-[#F8FAFC]">{txn.paymentMethod || 'Credit Card'}</span>
              </div>

              {txn.originalTransactionId && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                  <span className="text-[#A1A1AA]">Original Transaction</span>
                  <Link to={`/transactions/${txn.originalTransactionId}`} className="font-mono font-bold text-[#8B5CF6] hover:underline">
                    #{txn.originalTransactionId}
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Relationships: Customer & Subscription Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Relationship Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#272C36] pb-3">
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <User className="w-4 h-4 text-[#8B5CF6]" />
                <span>Customer Association</span>
              </h3>
              <Link to={`/customers/${txn.customerId}`}>
                <Button variant="ghost" size="sm" className="text-xs text-[#8B5CF6]">
                  View Customer <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            {customer ? (
              <div className="p-4 rounded-xl bg-[#12151C] border border-[#272C36] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Customer Name:</span>
                  <span className="font-bold text-[#F8FAFC]">{customer.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Company:</span>
                  <span className="font-semibold text-[#F8FAFC]">{customer.company}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Email:</span>
                  <span className="font-mono text-[#A1A1AA]">{customer.email}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-xs font-mono text-[#F8FAFC] bg-[#12151C] rounded-xl border border-[#272C36]">
                Customer ID: {txn.customerId}
              </div>
            )}
          </Card>

          {/* Subscription Relationship Card */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#272C36] pb-3">
              <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#22D3EE]" />
                <span>Subscription Association</span>
              </h3>
              {txn.subscriptionId && (
                <Link to={`/subscriptions/${txn.subscriptionId}`}>
                  <Button variant="ghost" size="sm" className="text-xs text-[#8B5CF6]">
                    View Subscription <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>

            {subscription ? (
              <div className="p-4 rounded-xl bg-[#12151C] border border-[#272C36] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Subscription ID:</span>
                  <span className="font-mono font-bold text-[#F8FAFC]">{subscription.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Plan & Cycle:</span>
                  <span className="font-bold text-[#F8FAFC]">
                    {subscription.plan} ({subscription.billingCycle})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717A]">Subscription Status:</span>
                  <Badge status={subscription.status === 'Active' ? 'active' : 'inactive'}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#71717A] bg-[#12151C] rounded-xl border border-[#272C36]">
                No subscription associated with this transaction.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modals */}
      <RefundTransactionModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        transaction={txn}
        onSuccess={loadData}
      />
    </AppShell>
  );
};
