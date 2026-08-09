import React, { useState } from 'react';
import { Modal } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';
import { Subscription, cancelSubscription } from '../../services/api/subscriptions';

export interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onSuccess: (cancelled: Subscription) => void;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!subscription) return null;

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await cancelSubscription(subscription.id);
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to cancel subscription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Subscription?"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-rose-300 block text-sm">Are you sure you want to cancel this subscription?</span>
            <p className="text-[#A1A1AA]">
              Subscription <span className="font-mono text-white font-bold">{subscription.id}</span> ({subscription.plan} Plan, ${subscription.amount}/mo) will be marked as <span className="font-bold text-rose-300">Cancelled</span>.
            </p>
            <p className="text-[11px] text-[#71717A]">
              Historical records will remain in the database, but active access will terminate and recurring billing will stop.
            </p>
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
        )}

        <div className="pt-3 flex justify-end gap-3 border-t border-[#272C36]">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Keep Subscription
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel} isLoading={isSubmitting}>
            Confirm Cancellation
          </Button>
        </div>
      </div>
    </Modal>
  );
};
