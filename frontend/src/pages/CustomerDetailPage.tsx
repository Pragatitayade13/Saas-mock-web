import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Button } from '../components/ui/Button';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Table, Column } from '../components/ui/Table';
import { Modal } from '../components/ui/Overlays';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { SubscriptionFormModal } from '../components/subscriptions/SubscriptionFormModal';
import { Subscription, fetchCustomerSubscription } from '../services/api/subscriptions';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Activity,
  Receipt,
  UserCheck,
} from 'lucide-react';
import {
  Customer,
  CustomerTransaction,
  fetchCustomerById,
  deleteCustomer,
  updateCustomer,
  fetchCustomerTransactions,
} from '../services/api/customers';
import { ApiError } from '../services/api/client';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRole = user?.role || 'Viewer';
  const canEdit = userRole === 'Administrator' || userRole === 'Manager';
  const canDelete = userRole === 'Administrator';

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit & Subscription Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Delete Dialog State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hasDependenciesError, setHasDependenciesError] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [custData, txnsData, subData] = await Promise.all([
        fetchCustomerById(id),
        fetchCustomerTransactions(id).catch(() => ({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } })),
        fetchCustomerSubscription(id).catch(() => null),
      ]);
      setCustomer(custData);
      setTransactions(txnsData.data);
      setActiveSubscription(subData);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'CUSTOMER_NOT_FOUND') {
        setError('Customer not found. The record may have been removed or does not exist.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load customer details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!customer) return;
    setIsDeleting(true);
    setDeleteError(null);
    setHasDependenciesError(false);

    try {
      await deleteCustomer(customer.id);
      setIsDeleteModalOpen(false);
      navigate('/customers');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'CUSTOMER_HAS_DEPENDENCIES') {
        setHasDependenciesError(true);
        setDeleteError('This customer cannot be deleted because related subscriptions or transactions exist.');
      } else if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete customer.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!customer) return;
    setIsDeactivating(true);
    try {
      const updated = await updateCustomer(customer.id, { status: 'Suspended' });
      setCustomer(updated);
      setIsDeleteModalOpen(false);
      setHasDependenciesError(false);
      setDeleteError(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate customer.');
    } finally {
      setIsDeactivating(false);
    }
  };

  const transactionColumns: Column<CustomerTransaction>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (row) => <span className="font-mono text-xs font-semibold text-[#F8FAFC]">{row.id}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <span className="text-xs text-[#A1A1AA]">{row.type}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-emerald-400">
          ${row.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge status={row.status === 'Completed' ? 'completed' : row.status === 'Pending' ? 'pending' : 'failed'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <span className="text-xs text-[#71717A]">
          {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-[#181C25] rounded-lg"></div>
          <div className="h-32 bg-[#181C25] rounded-2xl border border-[#272C36]"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-[#181C25] rounded-2xl border border-[#272C36]"></div>
            <div className="h-64 bg-[#181C25] rounded-2xl border border-[#272C36]"></div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !customer) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">Customer Not Found</h2>
          <p className="text-xs text-[#A1A1AA]">{error || 'The customer you are looking for does not exist.'}</p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/customers')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Customers
            </Button>
            <Button variant="primary" onClick={() => loadData()} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Retry
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  const annualizedRevenue = (customer.monthlyRevenue || 0) * 12;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/customers"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Customers
          </Link>

          <div className="flex items-center gap-2.5">
            {canEdit && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Edit className="w-4 h-4 text-[#8B5CF6]" />}
              >
                Edit Customer
              </Button>
            )}
            {canDelete && (
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setDeleteError(null);
                  setHasDependenciesError(false);
                  setIsDeleteModalOpen(true);
                }}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Customer
              </Button>
            )}
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="p-6 rounded-2xl bg-[#181C25] border border-[#272C36] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar name={customer.name} src={customer.avatar} size="xl" className="ring-2 ring-[#8B5CF6]/40" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold text-[#F8FAFC] tracking-tight">{customer.name}</h1>
                <Badge status={customer.status.toLowerCase() as BadgeStatus}>{customer.status}</Badge>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                  {customer.plan} Plan
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-1 flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-[#22D3EE]" /> {customer.company}
                <span className="text-[#3F3F46]">•</span>
                <Mail className="w-3.5 h-3.5 text-[#8B5CF6]" /> {customer.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#272C36] pt-4 md:pt-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">Monthly Revenue</span>
              <span className="font-mono text-xl font-extrabold text-[#F8FAFC]">
                ${customer.monthlyRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-left md:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] block">Annualized Run-Rate</span>
              <span className="font-mono text-xl font-extrabold text-emerald-400">
                ${annualizedRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Two-Column Information & Account Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information Card */}
          <div className="p-6 rounded-2xl bg-[#181C25] border border-[#272C36] space-y-4">
            <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#8B5CF6]" /> Customer Information
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#8B5CF6]" /> Full Name
                </span>
                <span className="font-bold text-[#F8FAFC]">{customer.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#22D3EE]" /> Email Address
                </span>
                <span className="font-semibold text-[#F8FAFC]">{customer.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" /> Company
                </span>
                <span className="font-semibold text-[#F8FAFC]">{customer.company}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" /> Location
                </span>
                <span className="font-semibold text-[#F8FAFC]">{customer.location || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" /> Customer Created
                </span>
                <span className="font-semibold text-[#A1A1AA]">
                  {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#12151C] border border-[#272C36]">
                <span className="text-[#A1A1AA] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" /> Last Updated
                </span>
                <span className="font-semibold text-[#A1A1AA]">
                  {new Date(customer.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Account Overview Card */}
          <div className="p-6 rounded-2xl bg-[#181C25] border border-[#272C36] space-y-4">
            <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#22D3EE]" /> Account Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#12151C] border border-[#272C36] space-y-1">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Monthly Revenue
                </span>
                <p className="font-mono text-2xl font-black text-[#F8FAFC]">
                  ${customer.monthlyRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-[#A1A1AA]">Billed recurring every month</p>
              </div>

              <div className="p-4 rounded-xl bg-[#12151C] border border-[#272C36] space-y-1">
                <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#8B5CF6]" /> Annualized Run-Rate
                </span>
                <p className="font-mono text-2xl font-black text-emerald-400">
                  ${annualizedRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-[#A1A1AA]">Calculated as (Monthly × 12)</p>
              </div>
            </div>

              {/* Active Subscription Section */}
              <div className="p-4 rounded-xl bg-[#12151C] border border-[#272C36] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#A1A1AA] font-semibold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#8B5CF6]" /> Active Subscription
                  </span>
                  {activeSubscription && (
                    <Link to={`/subscriptions/${activeSubscription.id}`}>
                      <Button variant="ghost" size="sm" className="text-xs text-[#8B5CF6] py-1 px-2.5">
                        View Subscription
                      </Button>
                    </Link>
                  )}
                </div>

                {activeSubscription ? (
                  <div className="space-y-2 pt-1 border-t border-[#272C36]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#71717A]">Plan & Cycle:</span>
                      <span className="font-bold text-[#F8FAFC]">
                        {activeSubscription.plan} ({activeSubscription.billingCycle})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#71717A]">Amount:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ${activeSubscription.amount.toLocaleString()}/{activeSubscription.billingCycle === 'Yearly' ? 'yr' : 'mo'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#71717A]">Next Billing Date:</span>
                      <span className="font-mono text-[#A1A1AA]">
                        {new Date(activeSubscription.nextBillingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center space-y-2">
                    <p className="text-[#71717A]">No active subscription for this customer.</p>
                    {canEdit && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setIsSubModalOpen(true)}
                      >
                        + Create Subscription
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Activity Timeline */}
        <div className="p-6 rounded-2xl bg-[#181C25] border border-[#272C36] space-y-4">
          <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#8B5CF6]" /> Customer Activity Timeline
          </h2>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#272C36]">
            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#8B5CF6] ring-4 ring-[#181C25]"></div>
              <div>
                <p className="text-xs font-bold text-[#F8FAFC]">Subscription Active — {customer.plan} Tier</p>
                <p className="text-[11px] text-[#A1A1AA]">
                  Current recurring tier is active with monthly revenue of ${customer.monthlyRevenue?.toLocaleString()}.
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#22D3EE] ring-4 ring-[#181C25]"></div>
              <div>
                <p className="text-xs font-bold text-[#F8FAFC]">Customer Account Profile Updated</p>
                <p className="text-[11px] text-[#A1A1AA]">
                  Last profile modification recorded on{' '}
                  {new Date(customer.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-[#181C25]"></div>
              <div>
                <p className="text-xs font-bold text-[#F8FAFC]">Customer Created in Workspace</p>
                <p className="text-[11px] text-[#A1A1AA]">
                  Initial customer onboarding completed on{' '}
                  {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Transactions */}
        <div className="p-6 rounded-2xl bg-[#181C25] border border-[#272C36] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#22D3EE]" /> Recent Related Transactions
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#A1A1AA]">{transactions.length} record(s) found</span>
              <Link to={`/transactions?customerId=${customer.id}`}>
                <Button variant="ghost" size="sm" className="text-xs text-[#8B5CF6]">
                  View All Transactions
                </Button>
              </Link>
            </div>
          </div>

          <Table<CustomerTransaction>
            columns={transactionColumns}
            data={transactions}
            keyExtractor={(row) => row.id}
            emptyTitle="No transactions found for this customer."
            emptyDescription="Financial records will appear here as payments and subscriptions occur."
          />
        </div>

        {/* Edit Customer Modal */}
        <CustomerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialCustomer={customer}
          onSuccess={(updated) => setCustomer(updated)}
        />

        <SubscriptionFormModal
          isOpen={isSubModalOpen}
          onClose={() => setIsSubModalOpen(false)}
          preselectedCustomerId={customer.id}
          onSuccess={loadData}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Customer Account"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#F8FAFC]">{customer.name}</strong> ({customer.company})?
            </p>

            {deleteError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Cannot Delete Customer</span>
                </div>
                <p className="leading-normal">{deleteError}</p>
                {hasDependenciesError && (
                  <div className="pt-2 border-t border-rose-500/20 flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDeactivate}
                      isLoading={isDeactivating}
                    >
                      Deactivate Customer Instead
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
                Delete Customer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
};
