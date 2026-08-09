import React, { useState } from 'react';
import { Modal } from '../ui/Overlays';
import { Button } from '../ui/Button';
import { AlertTriangle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Subscription, PlanTier, changeSubscriptionPlan } from '../../services/api/subscriptions';

export interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onSuccess: (updated: Subscription) => void;
}

export const ChangePlanModal: React.FC<ChangePlanModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(subscription?.plan || 'Professional');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!subscription) return null;

  const currentPlan = subscription.plan;
  const isYearly = subscription.billingCycle === 'Yearly';

  const prices: Record<PlanTier, { monthly: number; yearly: number }> = {
    Free: { monthly: 0, yearly: 0 },
    Starter: { monthly: 29, yearly: 290 },
    Professional: { monthly: 99, yearly: 990 },
    Enterprise: { monthly: 299, yearly: 2990 },
  };

  const currentPrice = isYearly ? prices[currentPlan].yearly : prices[currentPlan].monthly;
  const newPrice = isYearly ? prices[selectedPlan].yearly : prices[selectedPlan].monthly;

  const handleApply = async () => {
    if (selectedPlan === currentPlan) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const updated = await changeSubscriptionPlan(subscription.id, selectedPlan);
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to change subscription plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Plan Tier — ${subscription.id}`}
    >
      <div className="space-y-5">
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Current vs Target Comparison */}
        <div className="p-4 rounded-xl bg-[#12151C] border border-[#272C36] flex items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-[10px] text-[#71717A] uppercase font-bold block">Current Plan</span>
            <span className="font-bold text-[#F8FAFC] text-sm">{currentPlan}</span>
            <span className="font-mono text-emerald-400 block font-bold mt-0.5">
              ${currentPrice.toLocaleString()} / {isYearly ? 'yr' : 'mo'}
            </span>
          </div>

          <ArrowRight className="w-5 h-5 text-[#8B5CF6] shrink-0" />

          <div>
            <span className="text-[10px] text-[#71717A] uppercase font-bold block">New Plan</span>
            <span className="font-bold text-[#8B5CF6] text-sm">{selectedPlan}</span>
            <span className="font-mono text-emerald-400 block font-bold mt-0.5">
              ${newPrice.toLocaleString()} / {isYearly ? 'yr' : 'mo'}
            </span>
          </div>
        </div>

        {/* Plan Tier Options */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#A1A1AA]">Choose Target Tier</label>
          {(['Free', 'Starter', 'Professional', 'Enterprise'] as PlanTier[]).map((p) => {
            const isSelected = selectedPlan === p;
            const isCurrent = currentPlan === p;
            const price = isYearly ? prices[p].yearly : prices[p].monthly;

            return (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPlan(p)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-white shadow-md'
                    : 'bg-[#12151C] border-[#272C36] text-[#A1A1AA] hover:bg-[#181C25]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#8B5CF6] bg-[#8B5CF6]' : 'border-[#71717A]'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#F8FAFC]">{p}</span>
                    {isCurrent && <span className="text-[10px] text-[#8B5CF6] font-semibold ml-2">(Current)</span>}
                  </div>
                </div>

                <span className="font-mono text-xs font-bold text-emerald-400">
                  ${price.toLocaleString()} / {isYearly ? 'year' : 'month'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-[#272C36]">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            isLoading={isSubmitting}
            disabled={selectedPlan === currentPlan}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Apply Plan Change
          </Button>
        </div>
      </div>
    </Modal>
  );
};
