import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';

export const TransactionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/transactions');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Transactions</span>
        </Link>

        <Card className="p-8 text-center space-y-4">
          <h2 className="text-lg font-bold text-[#F8FAFC]">Record New Transaction</h2>
          <p className="text-xs text-[#A1A1AA]">Opening transaction entry form...</p>
        </Card>

        <TransactionFormModal
          isOpen={isOpen}
          onClose={handleClose}
          onSuccess={(txn) => {
            navigate(`/transactions/${txn.id}`);
          }}
        />
      </div>
    </AppShell>
  );
};
