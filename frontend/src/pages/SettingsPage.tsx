import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select, Switch } from '../components/ui/FormControls';
import { Modal } from '../components/ui/Overlays';
import {
  Building2,
  Users,
  Shield,
  Lock,
  User,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  LogOut,
  Mail,
  Clock,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole, UserStatus } from '../types/api';

// APIs
import { fetchOrganization, updateOrganization, Organization } from '../services/api/organization';
import { fetchTeamMembers, updateTeamMemberRole, updateTeamMemberStatus, TeamMember } from '../services/api/team';
import { fetchInvitations, createInvitation, revokeInvitation, resendInvitation, Invitation } from '../services/api/invitations';
import { fetchActiveSessions, revokeOtherSessions, SessionItem } from '../services/api/security';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';
  const isViewer = user?.role === 'Viewer';
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'organization';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // State: Organization
  const [org, setOrg] = useState<Organization | null>(null);
  const [isOrgLoading, setIsOrgLoading] = useState(false);
  const [isOrgSaving, setIsOrgSaving] = useState(false);
  const [orgSuccess, setOrgSuccess] = useState(false);

  // State: Team & Invitations
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // State: Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Manager');
  const [isInviting, setIsInviting] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<Invitation | null>(null);

  // State: Security Sessions
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  // State: General Error / Notice
  const [error, setError] = useState<string | null>(null);

  // Load Organization Data
  const loadOrg = useCallback(async () => {
    setIsOrgLoading(true);
    setError(null);
    try {
      const data = await fetchOrganization();
      setOrg(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load organization profile.');
    } finally {
      setIsOrgLoading(false);
    }
  }, []);

  // Load Team & Invitations
  const loadTeam = useCallback(async () => {
    setIsTeamLoading(true);
    setError(null);
    try {
      const [membersRes, invRes] = await Promise.all([
        fetchTeamMembers({ search: teamSearch, role: roleFilter, limit: 100 }),
        fetchInvitations(),
      ]);
      setMembers(membersRes.data);
      setInvitations(invRes.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load team members.');
    } finally {
      setIsTeamLoading(false);
    }
  }, [teamSearch, roleFilter]);

  // Load Security Sessions
  const loadSessions = useCallback(async () => {
    setIsSessionsLoading(true);
    try {
      const data = await fetchActiveSessions();
      setSessions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load active sessions.');
    } finally {
      setIsSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'organization') loadOrg();
    if (activeTab === 'team') loadTeam();
    if (activeTab === 'security') loadSessions();
  }, [activeTab, loadOrg, loadTeam, loadSessions]);

  // Handle Organization Update
  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setIsOrgSaving(true);
    setError(null);
    setOrgSuccess(false);
    try {
      const updated = await updateOrganization(org);
      setOrg(updated);
      setOrgSuccess(true);
      setTimeout(() => setOrgSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update organization.');
    } finally {
      setIsOrgSaving(false);
    }
  };

  // Handle Member Role Update
  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    setError(null);
    try {
      await updateTeamMemberRole(memberId, newRole);
      loadTeam();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change role.');
    }
  };

  // Handle Member Status Update
  const handleStatusChange = async (memberId: string, currentStatus: UserStatus) => {
    setError(null);
    const newStatus: UserStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateTeamMemberStatus(memberId, newStatus);
      loadTeam();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update user status.');
    }
  };

  // Handle Invite Member Submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setError(null);
    try {
      const inv = await createInvitation({
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      setCreatedInvite(inv);
      loadTeam();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  // Handle Revoke Sessions
  const handleRevokeSessions = async () => {
    setIsRevoking(true);
    setError(null);
    try {
      await revokeOtherSessions();
      loadSessions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to revoke other sessions.');
    } finally {
      setIsRevoking(false);
    }
  };

  const getStatusBadge = (st: UserStatus | string): BadgeStatus => {
    switch (st) {
      case 'Active': return 'completed';
      case 'Invited': return 'pending';
      case 'Pending': return 'pending';
      case 'Suspended': return 'failed';
      default: return 'inactive';
    }
  };

  const permissionMatrix = [
    { category: 'Dashboard & Analytics', admin: true, manager: true, viewer: true },
    { category: 'Customer & Subscription View', admin: true, manager: true, viewer: true },
    { category: 'Customer & Subscription Management', admin: true, manager: true, viewer: false },
    { category: 'Transactions & Refunds', admin: true, manager: true, viewer: false },
    { category: 'Reports Generation & Export', admin: true, manager: true, viewer: false },
    { category: 'Report Deletion', admin: true, manager: false, viewer: false },
    { category: 'Security Audit Log Access', admin: true, manager: true, viewer: false },
    { category: 'Team Invitation & Role Assignment', admin: true, manager: false, viewer: false },
    { category: 'Organization Settings Edit', admin: true, manager: false, viewer: false },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Premium 3D Team Collaboration Hero Banner */}
        <Card variant="glass" className="relative overflow-hidden border-white/[0.1] bg-gradient-to-r from-[#111419]/90 via-[#171A20]/80 to-[#1D2128]/90">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                <Users className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Multi-User Enterprise Workspace & Team Control</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F8FA] tracking-tight">
                Organization, Team & Security Settings
              </h1>

              <p className="text-xs sm:text-sm text-[#A5ACB8] leading-relaxed">
                Manage organization profiles, team invitations, RBAC permission matrices, active session revocations, and user security.
              </p>
            </div>

            <div className="w-full lg:w-80 h-44 rounded-2xl border border-white/[0.08] overflow-hidden shrink-0 shadow-2xl group">
              <img
                src="/team_collaboration_3d.png"
                alt="3D SaaS Team Collaboration Workspace"
                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </Card>

        {/* Settings Tab Header */}
        <div className="flex items-center gap-1 border-b border-[#272C36] overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('organization')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'organization'
                ? 'border-[#8B5CF6] text-[#8B5CF6]'
                : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organization</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'team'
                ? 'border-[#8B5CF6] text-[#8B5CF6]'
                : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team & Invitations</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'roles'
                ? 'border-[#8B5CF6] text-[#8B5CF6]'
                : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles & Permissions</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#8B5CF6] text-[#8B5CF6]'
                : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security & Sessions</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#8B5CF6] text-[#8B5CF6]'
                : 'border-transparent text-[#71717A] hover:text-[#A1A1AA]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">Dismiss</button>
          </div>
        )}

        {/* TAB 1: ORGANIZATION */}
        {activeTab === 'organization' && (
          <div className="max-w-4xl space-y-6">
            {isOrgLoading || !org ? (
              <Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#A1A1AA]">Loading organization settings...</p>
              </Card>
            ) : (
              <form onSubmit={handleOrgSubmit} className="space-y-6">
                <Card className="p-6 space-y-6 bg-[#12151C] border-[#272C36]">
                  <div className="flex items-center justify-between border-b border-[#272C36] pb-4">
                    <div>
                      <h2 className="text-base font-bold text-[#F8FAFC]">Organization Profile</h2>
                      <p className="text-xs text-[#A1A1AA]">Business details, contact info, and branding.</p>
                    </div>
                    {orgSuccess && (
                      <Badge status="completed" className="animate-fade-in">
                        ✓ Saved Successfully
                      </Badge>
                    )}
                  </div>

                  {/* Logo Preview */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#181C25] border border-[#272C36] flex items-center justify-center font-bold text-xl text-[#8B5CF6] overflow-hidden shrink-0">
                      {org.logo ? (
                        <img src={org.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        org.name.charAt(0)
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#F8FAFC]">Organization Logo</span>
                      <p className="text-[11px] text-[#71717A]">Demo logo URL preview.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#F8FAFC]">Organization Name *</label>
                      <Input
                        value={org.name}
                        onChange={(e) => setOrg({ ...org, name: e.target.value })}
                        disabled={!isAdmin}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#F8FAFC]">Organization Slug</label>
                      <Input value={org.slug} readOnly className="bg-[#181C25]" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#F8FAFC]">Business Email</label>
                      <Input
                        type="email"
                        value={org.email}
                        onChange={(e) => setOrg({ ...org, email: e.target.value })}
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#F8FAFC]">Website URL</label>
                      <Input
                        value={org.website || ''}
                        onChange={(e) => setOrg({ ...org, website: e.target.value })}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#272C36]">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#F8FAFC]">Industry</label>
                      <Input
                        value={org.industry || ''}
                        onChange={(e) => setOrg({ ...org, industry: e.target.value })}
                        disabled={!isAdmin}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#F8FAFC]">Timezone</label>
                      <Select
                        value={org.timezone}
                        onChange={(e) => setOrg({ ...org, timezone: e.target.value })}
                        disabled={!isAdmin}
                        options={[
                          { label: 'Asia/Kolkata (IST +5:30)', value: 'Asia/Kolkata' },
                          { label: 'UTC (GMT +0:00)', value: 'UTC' },
                          { label: 'America/New_York (EST -5:00)', value: 'America/New_York' },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#F8FAFC]">Currency</label>
                      <Select
                        value={org.currency}
                        onChange={(e) => setOrg({ ...org, currency: e.target.value })}
                        disabled={!isAdmin}
                        options={[
                          { label: 'INR (₹)', value: 'INR' },
                          { label: 'USD ($)', value: 'USD' },
                          { label: 'EUR (€)', value: 'EUR' },
                        ]}
                      />
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex justify-end pt-4 border-t border-[#272C36]">
                      <Button variant="primary" type="submit" isLoading={isOrgSaving}>
                        Save Organization Changes
                      </Button>
                    </div>
                  )}
                </Card>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: TEAM & INVITATIONS */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#F8FAFC]">Team Members ({members.length})</h2>
                <p className="text-xs text-[#A1A1AA]">Manage members, assign roles, and issue workspace invitations.</p>
              </div>

              {isAdmin && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsInviteOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Invite Member
                </Button>
              )}
            </div>

            {/* Team Controls */}
            <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="Search members by name or email..."
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-[#71717A]" />}
                />
              </div>

              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { label: 'All Roles', value: 'all' },
                  { label: 'Administrator', value: 'Administrator' },
                  { label: 'Manager', value: 'Manager' },
                  { label: 'Viewer', value: 'Viewer' },
                ]}
                className="text-xs py-1.5 min-w-[140px]"
              />
            </Card>

            {/* Members Table */}
            {isTeamLoading ? (
              <Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#A1A1AA]">Loading team members...</p>
              </Card>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#272C36] bg-[#12151C]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#272C36] bg-[#181C25]/60 text-[#A1A1AA] font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Member</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#272C36]/50">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-[#181C25]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <div>
                              <span className="font-bold text-[#F8FAFC] block">{m.name}</span>
                              <span className="text-[11px] text-[#A1A1AA] font-mono">{m.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isAdmin ? (
                            <Select
                              value={m.role}
                              onChange={(e) => handleRoleChange(m.id, e.target.value as UserRole)}
                              options={[
                                { label: 'Administrator', value: 'Administrator' },
                                { label: 'Manager', value: 'Manager' },
                                { label: 'Viewer', value: 'Viewer' },
                              ]}
                              className="text-xs py-1"
                            />
                          ) : (
                            <Badge status="info">{m.role}</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={getStatusBadge(m.status)}>{m.status}</Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#71717A]">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isAdmin && m.id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={m.status === 'Active' ? 'text-amber-400' : 'text-emerald-400'}
                              onClick={() => handleStatusChange(m.id, m.status)}
                            >
                              {m.status === 'Active' ? 'Suspend' : 'Reactivate'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pending Invitations Section */}
            {invitations.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-[#272C36]">
                <h3 className="text-sm font-bold text-[#F8FAFC]">Pending Workspace Invitations ({invitations.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {invitations.map((inv) => (
                    <Card key={inv.id} className="p-4 space-y-2 border-[#272C36]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#F8FAFC]">{inv.name}</span>
                        <Badge status="pending">{inv.status}</Badge>
                      </div>
                      <p className="text-xs text-[#A1A1AA] font-mono">{inv.email}</p>
                      <div className="flex items-center justify-between text-[11px] text-[#71717A] pt-2 border-t border-[#272C36]">
                        <span>Role: {inv.role}</span>
                        <span>Token: {inv.token.slice(0, 12)}...</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ROLES & PERMISSIONS */}
        {activeTab === 'roles' && (
          <div className="max-w-4xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#F8FAFC]">Predefined Roles & Permission Matrix</h2>
              <p className="text-xs text-[#A1A1AA]">Role definitions and access boundaries across workspace capabilities.</p>
            </div>

            <Card className="overflow-hidden border-[#272C36] bg-[#12151C]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#272C36] bg-[#181C25]/60 text-[#A1A1AA] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Permission Category</th>
                    <th className="py-3.5 px-4 text-center">Administrator</th>
                    <th className="py-3.5 px-4 text-center">Manager</th>
                    <th className="py-3.5 px-4 text-center">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272C36]/50">
                  {permissionMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#181C25]/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#F8FAFC]">{item.category}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400">✓</td>
                      <td className="py-3.5 px-4 text-center font-bold">{item.manager ? <span className="text-emerald-400">✓</span> : <span className="text-rose-400">✗</span>}</td>
                      <td className="py-3.5 px-4 text-center font-bold">{item.viewer ? <span className="text-emerald-400">✓</span> : <span className="text-rose-400">✗</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* TAB 4: SECURITY & SESSIONS */}
        {activeTab === 'security' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#F8FAFC]">Active Browser Sessions</h2>
                <p className="text-xs text-[#A1A1AA]">Manage your active logged-in devices and sign out other sessions.</p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleRevokeSessions}
                isLoading={isRevoking}
                leftIcon={<LogOut className="w-4 h-4 text-rose-400" />}
              >
                Sign Out Other Sessions
              </Button>
            </div>

            {isSessionsLoading ? (
              <Card className="p-12 text-center">
                <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mx-auto mb-3" />
                <p className="text-xs text-[#A1A1AA]">Loading active sessions...</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {sessions.map((sess) => (
                  <Card key={sess.id} className="p-4 flex items-center justify-between border-[#272C36]">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${sess.isCurrent ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#181C25] text-[#71717A]'}`}>
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#F8FAFC]">{sess.userAgent}</span>
                          {sess.isCurrent && <Badge status="completed">Current Session</Badge>}
                        </div>
                        <span className="text-[11px] text-[#71717A] font-mono block">IP: {sess.ipAddress}</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-[#71717A] font-mono">
                      Logged in: {new Date(sess.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MY PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-6 space-y-6 bg-[#12151C] border-[#272C36]">
              <h2 className="text-base font-bold text-[#F8FAFC] border-b border-[#272C36] pb-3">User Profile</h2>
              <div className="flex items-center gap-4">
                <img src={user?.avatar} alt={user?.name} className="w-16 h-16 rounded-full object-cover shrink-0 ring-2 ring-[#8B5CF6]/40" />
                <div>
                  <span className="font-bold text-sm text-[#F8FAFC] block">{user?.name}</span>
                  <Badge status="info" className="mt-1">{user?.role}</Badge>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[#71717A] block font-semibold">Full Name</span>
                  <Input value={user?.name || ''} readOnly className="bg-[#181C25]" />
                </div>
                <div>
                  <span className="text-[#71717A] block font-semibold">Email Address</span>
                  <Input value={user?.email || ''} readOnly className="bg-[#181C25]" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => { setIsInviteOpen(false); setCreatedInvite(null); }} title="Invite Team Member">
        {createdInvite ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-2">
              <span className="font-bold text-sm block">✓ Invitation Created Successfully!</span>
              <p>Demo invitation link generated for <span className="font-bold">{createdInvite.name}</span>:</p>
              <div className="p-2 rounded-lg bg-[#12151C] border border-[#272C36] font-mono text-[#8B5CF6] break-all">
                {window.location.origin}/invite/{createdInvite.token}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button variant="primary" size="sm" onClick={() => { setIsInviteOpen(false); setCreatedInvite(null); }}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="font-bold text-[#F8FAFC]">Full Name *</label>
              <Input
                placeholder="e.g. Sarah Connor"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-[#F8FAFC]">Email Address *</label>
              <Input
                type="email"
                placeholder="sarah@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-[#F8FAFC]">Workspace Role *</label>
              <Select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as UserRole)}
                options={[
                  { label: 'Manager (Business Operations)', value: 'Manager' },
                  { label: 'Viewer (Read-Only)', value: 'Viewer' },
                  { label: 'Administrator (Full Access)', value: 'Administrator' },
                ]}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#272C36]">
              <Button variant="secondary" type="button" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit" isLoading={isInviting}>Send Invitation</Button>
            </div>
          </form>
        )}
      </Modal>
    </AppShell>
  );
};
