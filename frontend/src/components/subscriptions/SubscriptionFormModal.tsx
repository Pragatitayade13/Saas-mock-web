import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Overlays';
import { Input, Select } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { AlertTriangle, CheckCircle2, Search, Sparkles } from 'lucide-react';
import {
  Subscription,
  PlanTier,
  BillingCycle,
  SubscriptionStatus,
  createSubscription,
  updateSubscription,
  fetchPlans,
  PlanConfig,
} from '../../services/api/subscriptions';
import { Customer, fetchCustomers } from '../../services/api/customers';
import { ApiError } from '../../services/api/client';

export interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subscription: Subscription) => void;
  initialSubscription?: Subscription | null;
  preselectedCustomerId?: string;
}

export const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialSubscription,
  preselectedCustomerId,
}) => {
  const isEditMode = !!initialSubscription;

  // Customers Searchable Dropdown State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  // Subscription Fields State
  const [plan, setPlan] = useState<PlanTier>('Starter');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('Monthly');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<SubscriptionStatus>('Active');

  // Backend Centralized Plans
  const [plans, setPlans] = useState<PlanConfig[]>([]);

  // Submission & Error State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load plans & initial customers on mount/open
  useEffect(() => {
    if (!isOpen) return;

    fetchPlans()
      .then((data) => setPlans(data))
      .catch(() => {});

    fetchCustomers({ limit: 50 })
      .then((res) => setCustomers(res.data))
      .catch(() => {});

    if (initialSubscription) {
      setSelectedCustomerId(initialSubscription.customerId);
      setPlan(initialSubscription.plan);
      setBillingCycle(initialSubscription.billingCycle);
      setStatus(initialSubscription.status);
      setStartDate(
        initialSubscription.startDate
          ? new Date(initialSubscription.startDate).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10)
      );
    } else {
      setSelectedCustomerId(preselectedCustomerId || '');
      setPlan('Starter');
      setBillingCycle('Monthly');
      setStatus('Active');
      setStartDate(new Date().toISOString().slice(0, 10));
    }
    setErrorMessage(null);
  }, [isOpen, initialSubscription, preselectedCustomerId]);

  // Handle customer search input
  useEffect(() => {
    if (!customerSearch.trim()) return;
    const timer = setTimeout(async () => {
      setIsSearchingCustomers(true);
      try {
        const res = await fetchCustomers({ search: customerSearch.trim(), limit: 50 });
        setCustomers(res.data);
      } catch {
        // ignore
      } finally {
        setIsSearchingCustomers(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  // Derived price calculation from centralized pricing
  const currentPlanConfig = plans.find((p) => p.plan === plan);
  const calculatedPrice = currentPlanConfig
    ? billingCycle === 'Yearly'
      ? currentPlanConfig.yearlyPrice
      : currentPlanConfig.monthlyPrice
    : plan === 'Free'
    ? 0
    : plan === 'Starter'
    ? billingCycle === 'Yearly'
      ? 290
      : 29
    : plan === 'Professional'
    ? billingCycle === 'Yearly'
      ? 990
      : 99
    : billingCycle === 'Yearly'
    ? 2990
    : 299;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedCustomerId) {
      setErrorMessage('Please select a customer for this subscription.');
      return;
    }

    setIsSubmitting(true);
    try {
      let result: Subscription;
      if (isEditMode && initialSubscription) {
        result = await updateSubscription(initialSubscription.id, {
          plan,
          billingCycle,
          status,
        });
      } else {
        result = await createSubscription({
          customerId: selectedCustomerId,
          plan,
          billingCycle,
          startDate: new Date(startDate).toISOString(),
          status,
        });
      }

      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === 'ACTIVE_SUBSCRIPTION_EXISTS') {
          setErrorMessage('This customer already has an active subscription. Only one active subscription is allowed per customer.');
        } else {
          setErrorMessage(err.message || 'Failed to save subscription.');
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Subscription — ${initialSubscription?.id}` : 'Create New Subscription'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Customer Selection (Disabled in Edit mode) */}
        <div>
          <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Select Customer *</label>
          {isEditMode ? (
            <div className="p-3 rounded-xl bg-[#12151C] border border-[#272C36] text-xs font-bold text-[#F8FAFC]">
              Customer ID: {selectedCustomerId}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Type customer name or company to filter list..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[#71717A]" />}
              />
              <Select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                options={[
                  { label: isSearchingCustomers ? 'Searching...' : 'Select a customer...', value: '' },
                  ...customers.map((c) => ({
                    label: `${c.name} (${c.company})`,
                    value: c.id,
                  })),
                ]}
              />
            </div>
          )}
        </div>

        {/* Interactive Plan Selector Cards */}
        <div>
          <label className="block text-xs font-semibold text-[#A1A1AA] mb-2">Select Plan Tier *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(['Free', 'Starter', 'Professional', 'Enterprise'] as PlanTier[]).map((p) => {
              const isSelected = plan === p;
              const price = billingCycle === 'Yearly'
                ? (p === 'Free' ? 0 : p === 'Starter' ? 290 : p === 'Professional' ? 990 : 2990)
                : (p === 'Free' ? 0 : p === 'Starter' ? 29 : p === 'Professional' ? 99 : 299);

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-white shadow-md'
                      : 'bg-[#12151C] border-[#272C36] text-[#A1A1AA] hover:bg-[#181C25]'
                  }`}
                >
                  {p === 'Professional' && (
                    <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#8B5CF6] text-white">
                      POPULAR
                    </span>
                  )}
                  <span className="font-bold text-xs block text-[#F8FAFC]">{p}</span>
                  <span className="font-mono text-sm font-black text-emerald-400 mt-1 block">
                    ${price.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#71717A]">{billingCycle === 'Yearly' ? '/yr' : '/mo'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Billing Cycle Toggle & Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Billing Cycle *</label>
            <div className="flex gap-2 p-1 rounded-xl bg-[#12151C] border border-[#272C36]">
              {(['Monthly', 'Yearly'] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    billingCycle === cycle
                      ? 'bg-[#8B5CF6] text-white'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {cycle} {cycle === 'Yearly' && <span className="text-[10px] text-emerald-300 font-normal">(Save 17%)</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Subscription Status</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Trial', value: 'Trial' },
                { label: 'Past Due', value: 'PastDue' },
              ]}
            />
          </div>

          {!isEditMode && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Start Date *</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Derived Price Summary Box */}
        <div className="p-3.5 rounded-xl bg-[#12151C] border border-[#272C36] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
            <span className="text-[#A1A1AA]">Calculated Price (Backend Derived):</span>
          </div>
          <span className="font-mono font-black text-emerald-400 text-sm">
            ${calculatedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {billingCycle === 'Yearly' ? 'year' : 'month'}
          </span>
        </div>

        <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            {isEditMode ? 'Save Changes' : 'Create Subscription'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
