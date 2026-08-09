import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { SubscriptionFormModal } from '../components/subscriptions/SubscriptionFormModal';

export const SubscriptionCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    navigate('/subscriptions');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Link
          to="/subscriptions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subscriptions</span>
        </Link>

        <Card className="p-8 text-center space-y-4">
          <h2 className="text-lg font-bold text-[#F8FAFC]">Create New Subscription</h2>
          <p className="text-xs text-[#A1A1AA]">Opening subscription configuration dialog...</p>
        </Card>

        <SubscriptionFormModal
          isOpen={isOpen}
          onClose={handleClose}
          onSuccess={(sub) => {
            navigate(`/subscriptions/${sub.id}`);
          }}
        />
      </div>
    </AppShell>
  );
};
