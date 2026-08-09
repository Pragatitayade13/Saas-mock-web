import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Overlays';
import { Input, Select } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { AlertTriangle, CheckCircle2, Search, DollarSign } from 'lucide-react';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  createTransaction,
} from '../../services/api/transactions';
import { Customer, fetchCustomers } from '../../services/api/customers';
import { Subscription, fetchSubscriptions } from '../../services/api/subscriptions';
import { ApiError } from '../../services/api/client';

export interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
  preselectedCustomerId?: string;
  preselectedSubscriptionId?: string;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedCustomerId,
  preselectedSubscriptionId,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  const [type, setType] = useState<TransactionType>('Subscription');
  const [amount, setAmount] = useState<string>('99.00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>('Card');
  const [status, setStatus] = useState<TransactionStatus>('Completed');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    fetchCustomers({ limit: 50 })
      .then((res) => setCustomers(res.data))
      .catch(() => {});

    setSelectedCustomerId(preselectedCustomerId || '');
    setSelectedSubscriptionId(preselectedSubscriptionId || '');
    setType('Subscription');
    setAmount('99.00');
    setPaymentMethod('Card');
    setStatus('Completed');
    setDescription('');
    setTransactionDate(new Date().toISOString().slice(0, 10));
    setErrorMessage(null);
  }, [isOpen, preselectedCustomerId, preselectedSubscriptionId]);

  useEffect(() => {
    if (!selectedCustomerId) {
      setSubscriptions([]);
      return;
    }
    fetchSubscriptions({ customerId: selectedCustomerId, limit: 50 })
      .then((res) => setSubscriptions(res.data))
      .catch(() => {});
  }, [selectedCustomerId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedCustomerId) {
      setErrorMessage('Please select a customer for this transaction.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      setErrorMessage('Please enter a valid non-negative transaction amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTransaction({
        customerId: selectedCustomerId,
        subscriptionId: selectedSubscriptionId || undefined,
        amount: numAmount,
        type,
        paymentMethod,
        status,
        description: description.trim() || undefined,
        transactionDate: new Date(transactionDate).toISOString(),
      });

      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || 'Failed to record transaction.');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Record New Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Customer Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Select Customer *</label>
          <div className="space-y-2">
            <Input
              placeholder="Search customer name or company..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-[#71717A]" />}
            />
            <Select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              options={[
                { label: isSearchingCustomers ? 'Searching...' : 'Select customer...', value: '' },
                ...customers.map((c) => ({
                  label: `${c.name} (${c.company})`,
                  value: c.id,
                })),
              ]}
            />
          </div>
        </div>

        {/* Optional Subscription Association */}
        {subscriptions.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Associated Subscription (Optional)</label>
            <Select
              value={selectedSubscriptionId}
              onChange={(e) => setSelectedSubscriptionId(e.target.value)}
              options={[
                { label: 'None (Standalone payment)', value: '' },
                ...subscriptions.map((sub) => ({
                  label: `${sub.id} — ${sub.plan} ($${sub.amount}/${sub.billingCycle})`,
                  value: sub.id,
                })),
              ]}
            />
          </div>
        )}

        {/* Type & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Transaction Type *</label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              options={[
                { label: 'Subscription Payment', value: 'Subscription' },
                { label: 'Plan Upgrade', value: 'Upgrade' },
                { label: 'Plan Downgrade', value: 'Downgrade' },
                { label: 'Account Credit', value: 'Credit' },
                { label: 'Adjustment', value: 'Adjustment' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Payment Method *</label>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { label: 'Credit Card', value: 'Card' },
                { label: 'UPI / Instant Pay', value: 'UPI' },
                { label: 'Bank Transfer (ACH/Wire)', value: 'Bank Transfer' },
                { label: 'Demo Payment Gateway', value: 'Demo Payment' },
              ]}
            />
          </div>
        </div>

        {/* Amount & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Amount (USD) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              leftIcon={<DollarSign className="w-4 h-4 text-emerald-400" />}
              placeholder="99.00"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Status *</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as TransactionStatus)}
              options={[
                { label: 'Completed', value: 'Completed' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Failed', value: 'Failed' },
              ]}
            />
          </div>
        </div>

        {/* Transaction Date & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Transaction Date *</label>
            <Input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Description (Optional)</label>
            <Input
              placeholder="e.g. Monthly recurring plan payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-3 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            Record Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
};
