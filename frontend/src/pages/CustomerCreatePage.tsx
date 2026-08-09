import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Button } from '../components/ui/Button';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Customer } from '../services/api/customers';

export const CustomerCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (newCustomer: Customer) => {
    navigate(`/customers/${newCustomer.id}`);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/customers"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F8FAFC] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Customers
          </Link>
        </div>

        <div className="p-6 rounded-2xl bg-[#181C25] border border-[#272C36] shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-[#272C36] pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#F8FAFC]">Add New Customer Account</h1>
              <p className="text-xs text-[#A1A1AA]">Register a new enterprise customer in your Go in-memory workspace.</p>
            </div>
          </div>

          <CustomerFormModal
            isOpen={true}
            onClose={() => navigate('/customers')}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </AppShell>
  );
};
