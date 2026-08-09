import React, { useState } from 'react';
import { Modal } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Transaction, refundTransaction } from '../../services/api/transactions';

export interface RefundTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSuccess: (refunded: Transaction) => void;
}

export const RefundTransactionModal: React.FC<RefundTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!transaction) return null;

  const handleConfirmRefund = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await refundTransaction(transaction.id);
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to process refund.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Transaction Refund?">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300 block text-sm">Confirm Refund Action</span>
            <p className="text-[#A1A1AA]">
              Transaction <span className="font-mono text-white font-bold">{transaction.id}</span> for{' '}
              <span className="font-mono text-emerald-400 font-bold">
                ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>{' '}
              will be refunded.
            </p>
            <p className="text-[11px] text-[#71717A]">
              This will issue a negative refund transaction (-${transaction.amount}), update the status of the original record to <span className="font-bold text-amber-300">Refunded</span>, and subtract the amount from realized revenue.
            </p>
          </div>
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
        )}

        <div className="pt-3 flex justify-end gap-3 border-t border-[#272C36]">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmRefund}
            isLoading={isSubmitting}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Confirm Refund
          </Button>
        </div>
      </div>
    </Modal>
  );
};
