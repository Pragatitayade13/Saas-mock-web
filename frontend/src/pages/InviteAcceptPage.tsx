import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Building2, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { fetchInvitationByToken, acceptInvitation, Invitation } from '../services/api/invitations';

export const InviteAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvitation = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInvitationByToken(token);
      setInvitation(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired invitation token.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInvitation();
  }, [loadInvitation]);

  const handleAccept = async () => {
    if (!token) return;
    setIsAccepting(true);
    setError(null);
    try {
      await acceptInvitation(token);
      setIsAccepted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex items-center justify-center p-4">
        <Card className="p-12 text-center max-w-md w-full">
          <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#A1A1AA]">Validating workspace invitation token...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] flex flex-col items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full bg-[#12151C] border-[#272C36] space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#8B5CF6]/20">
          <Building2 className="w-7 h-7" />
        </div>

        {isAccepted ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-[#F8FAFC]">Invitation Accepted!</h2>
            <p className="text-xs text-[#A1A1AA]">
              Welcome to <span className="font-bold text-white">Nexora Technologies</span>. Your workspace account has been created.
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Workspace Login
            </Button>
          </div>
        ) : error || !invitation ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-[#F8FAFC]">Invitation Invalid</h2>
            <p className="text-xs text-rose-300">{error || 'This invitation is no longer active.'}</p>
            <Button variant="secondary" className="w-full" onClick={() => navigate('/login')}>
              Return to Login
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#F8FAFC]">You're Invited!</h2>
              <p className="text-xs text-[#A1A1AA] mt-1">
                <span className="font-bold text-white">{invitation.createdBy}</span> invited you to join <span className="font-bold text-white">Nexora Technologies</span>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#181C25] border border-[#272C36] space-y-2 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">Invitee Name</span>
                <span className="font-bold text-[#F8FAFC]">{invitation.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#71717A]">Email Address</span>
                <span className="font-mono text-[#F8FAFC]">{invitation.email}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#272C36]">
                <span className="text-[#71717A]">Assigned Role</span>
                <Badge status="info">{invitation.role}</Badge>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleAccept}
              isLoading={isAccepting}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Accept Invitation & Join Workspace
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
