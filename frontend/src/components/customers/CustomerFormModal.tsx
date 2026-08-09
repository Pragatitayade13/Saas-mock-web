import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Overlays';
import { Input, Select } from '../ui/FormControls';
import { Button } from '../ui/Button';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Customer, createCustomer, updateCustomer } from '../../services/api/customers';
import { ApiError } from '../../services/api/client';

export interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
  initialCustomer?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialCustomer,
}) => {
  const isEditMode = !!initialCustomer;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [plan, setPlan] = useState<'Free' | 'Starter' | 'Professional' | 'Enterprise'>('Starter');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Trial' | 'Suspended'>('Active');
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>('0');
  const [location, setLocation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialCustomer) {
      setName(initialCustomer.name || '');
      setEmail(initialCustomer.email || '');
      setCompany(initialCustomer.company || '');
      setPlan(initialCustomer.plan || 'Starter');
      setStatus(initialCustomer.status || 'Active');
      setMonthlyRevenue(initialCustomer.monthlyRevenue?.toString() || '0');
      setLocation(initialCustomer.location || '');
    } else {
      setName('');
      setEmail('');
      setCompany('');
      setPlan('Starter');
      setStatus('Active');
      setMonthlyRevenue('0');
      setLocation('New York, USA');
    }
    setErrorMessage(null);
    setFieldErrors({});
  }, [initialCustomer, isOpen]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Full name is required';
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Invalid email address format';
    }
    if (!company.trim()) errors.company = 'Company name is required';

    const rev = parseFloat(monthlyRevenue);
    if (isNaN(rev) || rev < 0) {
      errors.monthlyRevenue = 'Monthly revenue must be 0 or greater';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<Customer> = {
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        plan,
        status,
        monthlyRevenue: parseFloat(monthlyRevenue) || 0,
        location: location.trim(),
      };

      let result: Customer;
      if (isEditMode && initialCustomer) {
        result = await updateCustomer(initialCustomer.id, payload);
      } else {
        result = await createCustomer(payload);
      }

      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === 'CUSTOMER_EMAIL_EXISTS') {
          setErrorMessage('A customer with this email address already exists in the workspace.');
        } else {
          setErrorMessage(err.message || 'Failed to save customer details.');
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Customer — ${initialCustomer?.name}` : 'Add New Customer'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Full Name *</label>
            <Input
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
              }}
              error={fieldErrors.name}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Email Address *</label>
            <Input
              type="email"
              placeholder="e.g. s.jenkins@acme.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
              }}
              error={fieldErrors.email}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Company *</label>
            <Input
              placeholder="e.g. Acme Corporation"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (fieldErrors.company) setFieldErrors({ ...fieldErrors, company: '' });
              }}
              error={fieldErrors.company}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Location</label>
            <Input
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Plan Tier *</label>
            <Select
              value={plan}
              onChange={(e) => setPlan(e.target.value as any)}
              options={[
                { label: 'Free ($0/mo)', value: 'Free' },
                { label: 'Starter ($99/mo)', value: 'Starter' },
                { label: 'Professional ($499/mo)', value: 'Professional' },
                { label: 'Enterprise ($2,400/mo)', value: 'Enterprise' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Customer Status *</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Trial', value: 'Trial' },
                { label: 'Inactive', value: 'Inactive' },
                { label: 'Suspended', value: 'Suspended' },
              ]}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Monthly Revenue ($ USD)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 2450.00"
              value={monthlyRevenue}
              onChange={(e) => {
                setMonthlyRevenue(e.target.value);
                if (fieldErrors.monthlyRevenue) setFieldErrors({ ...fieldErrors, monthlyRevenue: '' });
              }}
              error={fieldErrors.monthlyRevenue}
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
            {isEditMode ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
