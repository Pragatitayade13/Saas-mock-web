import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import { Modal } from '../components/ui/Overlays';
import {
  Activity as ActivityIcon,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  ActivityItem,
  ActivitySummary,
  fetchActivities,
  fetchActivitySummary,
  ActivitySeverity,
} from '../services/api/activity';
import { Link } from 'react-router-dom';

export const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [summary, setSummary] = useState<ActivitySummary>({
    totalToday: 0,
    successfulCount: 0,
    warningCount: 0,
    criticalCount: 0,
  });
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [action, setAction] = useState('all');
  const [entityType, setEntityType] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [page, setPage] = useState(1);

  // Activity Details Drawer
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listRes, sumRes] = await Promise.all([
        fetchActivities({
          search: debouncedSearch,
          action,
          entityType,
          severity,
          page,
          limit: 20,
        }),
        fetchActivitySummary(),
      ]);
      setActivities(listRes.data);
      setMeta(listRes.meta);
      setSummary(sumRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load system activity.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, action, entityType, severity, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getSeverityBadgeStatus = (sev: ActivitySeverity): BadgeStatus => {
    switch (sev) {
      case 'Success': return 'completed';
      case 'Info': return 'info';
      case 'Warning': return 'pending';
      case 'Critical': return 'failed';
      default: return 'inactive';
    }
  };

  const getSeverityIcon = (sev: ActivitySeverity) => {
    switch (sev) {
      case 'Success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'Warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Critical': return <AlertOctagon className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Premium 3D Automation Workflow Hero Banner */}
        <Card variant="glass" className="relative overflow-hidden border-white/[0.1] bg-gradient-to-r from-[#111419]/90 via-[#171A20]/80 to-[#1D2128]/90">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                <ActivityIcon className="w-3.5 h-3.5" />
                <span>Intelligent Business Automation & Activity Center</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F8FA] tracking-tight">
                System Workflows & Real-Time Activity Center
              </h1>

              <p className="text-xs sm:text-sm text-[#A5ACB8] leading-relaxed">
                Track user operations, background automated process triggers, decision nodes, and system events in real time.
              </p>
            </div>

            <div className="w-full lg:w-80 h-44 rounded-2xl border border-white/[0.08] overflow-hidden shrink-0 shadow-2xl group">
              <img
                src="/automation_3d_workflow.png"
                alt="3D SaaS Automation Workflow System"
                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </Card>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Today's Activity</span>
              <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
                <ActivityIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-[#F8FAFC] mt-2">{summary.totalToday}</p>
            <p className="text-[11px] text-[#A1A1AA] mt-1">Events recorded today</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Successful</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-2">{summary.successfulCount}</p>
            <p className="text-[11px] text-[#71717A] mt-1">Clean operations</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Warnings</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-amber-400 mt-2">{summary.warningCount}</p>
            <p className="text-[11px] text-[#71717A] mt-1">Deletions & cancellations</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Critical</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-rose-400 mt-2">{summary.criticalCount}</p>
            <p className="text-[11px] text-rose-400/80 mt-1">Critical security alerts</p>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search by action, description, entity, or actor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-[#71717A]" />}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#71717A] hover:text-[#A1A1AA]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              options={[
                { label: 'All Actions', value: 'all' },
                { label: 'Created', value: 'Created' },
                { label: 'Updated', value: 'Updated' },
                { label: 'Deleted', value: 'Deleted' },
                { label: 'Refunded', value: 'Refunded' },
                { label: 'Exported', value: 'Exported' },
              ]}
              className="text-xs py-1.5 min-w-[130px]"
            />

            <Select
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
              options={[
                { label: 'All Entities', value: 'all' },
                { label: 'Customer', value: 'Customer' },
                { label: 'Subscription', value: 'Subscription' },
                { label: 'Transaction', value: 'Transaction' },
                { label: 'Report', value: 'Report' },
                { label: 'User', value: 'User' },
              ]}
              className="text-xs py-1.5 min-w-[130px]"
            />

            <Select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              options={[
                { label: 'All Severities', value: 'all' },
                { label: 'Info', value: 'Info' },
                { label: 'Success', value: 'Success' },
                { label: 'Warning', value: 'Warning' },
                { label: 'Critical', value: 'Critical' },
              ]}
              className="text-xs py-1.5 min-w-[130px]"
            />
          </div>
        </Card>

        {/* Activity Timeline List */}
        {isLoading ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mb-3" />
            <p className="text-xs text-[#A1A1AA]">Loading activity timeline...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 bg-rose-500/10 border-rose-500/20 text-rose-300 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
            <Button variant="secondary" size="sm" onClick={loadData}>Retry</Button>
          </Card>
        ) : activities.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <ActivityIcon className="w-10 h-10 text-[#71717A] mb-3" />
            <h3 className="text-base font-bold text-[#F8FAFC]">No activity found</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">There are no events matching your search or filters.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#272C36]">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedItem(act)}
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 sm:-left-8 top-3.5 w-4 h-4 rounded-full bg-[#12151C] border-2 border-[#272C36] group-hover:border-[#8B5CF6] flex items-center justify-center transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></div>
                  </div>

                  <Card className="p-4 bg-[#12151C] hover:bg-[#181C25]/80 border-[#272C36] hover:border-[#8B5CF6]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getSeverityIcon(act.severity)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[#F8FAFC]">{act.action} {act.entityType}</span>
                          <Badge status={getSeverityBadgeStatus(act.severity)}>{act.severity}</Badge>
                          {act.entityName && (
                            <span className="text-[11px] font-semibold text-[#8B5CF6]">
                              • {act.entityName}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#A1A1AA]">{act.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-[#71717A] font-mono">
                          <span>Actor: {act.actorName}</span>
                          <span>Entity ID: #{act.entityId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-[#71717A] font-mono block">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-[#A1A1AA]">
                        {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#12151C] border border-[#272C36] text-xs text-[#A1A1AA]">
                <div>Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} activity logs</div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)} leftIcon={<ChevronLeft className="w-4 h-4" />}>
                    Previous
                  </Button>
                  <span className="px-3 py-1 bg-[#181C25] font-mono font-bold text-[#F8FAFC]">{meta.page} / {meta.totalPages}</span>
                  <Button variant="secondary" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => setPage(meta.page + 1)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity Details Drawer */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Activity Details">
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#272C36]">
              <div className="flex items-center gap-2">
                {getSeverityIcon(selectedItem.severity)}
                <span className="font-bold text-[#F8FAFC] text-sm">{selectedItem.action} {selectedItem.entityType}</span>
              </div>
              <Badge status={getSeverityBadgeStatus(selectedItem.severity)}>{selectedItem.severity}</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[#71717A] block font-semibold">Description</span>
                <p className="text-[#F8FAFC] mt-0.5">{selectedItem.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="text-[#71717A] block">Actor</span>
                  <span className="font-bold text-[#F8FAFC]">{selectedItem.actorName}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">Entity Type</span>
                  <span className="text-[#F8FAFC]">{selectedItem.entityType}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">Entity Name</span>
                  <span className="font-semibold text-[#8B5CF6]">{selectedItem.entityName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">Entity ID</span>
                  <span className="font-mono text-[#F8FAFC]">{selectedItem.entityId}</span>
                </div>
                <div>
                  <span className="text-[#71717A] block">Timestamp</span>
                  <span className="font-mono text-[#A1A1AA]">{new Date(selectedItem.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#272C36]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
};
