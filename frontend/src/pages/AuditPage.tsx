import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import { Modal } from '../components/ui/Overlays';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AuditLogItem,
  AuditSummary,
  fetchAuditLogs,
  fetchAuditSummary,
  AuditResult,
} from '../services/api/audit';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [summary, setSummary] = useState<AuditSummary>({
    totalEventsToday: 0,
    successCount: 0,
    deniedCount: 0,
    failedCount: 0,
  });
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [action, setAction] = useState('all');
  const [result, setResult] = useState('all');
  const [page, setPage] = useState(1);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

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
        fetchAuditLogs({
          search: debouncedSearch,
          action,
          result,
          page,
          limit: 20,
        }),
        fetchAuditSummary(),
      ]);
      setLogs(listRes.data);
      setMeta(listRes.meta);
      setSummary(sumRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load security audit log.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, action, result, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getResultBadgeStatus = (res: AuditResult): BadgeStatus => {
    switch (res) {
      case 'Success': return 'completed';
      case 'Denied': return 'failed';
      case 'Failed': return 'failed';
      default: return 'inactive';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Premium 3D Security Shield Hero Banner */}
        <Card variant="glass" className="relative overflow-hidden border-white/[0.1] bg-gradient-to-r from-[#111419]/90 via-[#171A20]/80 to-[#1D2128]/90">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Enterprise Data Privacy & Security Audit Matrix</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F7F8FA] tracking-tight">
                Security Audit Log & Immutable Access Control
              </h1>

              <p className="text-xs sm:text-sm text-[#A5ACB8] leading-relaxed">
                Immutable, append-only security event history tracking authentication, authorization, RBAC rejections, and critical state mutations.
              </p>
            </div>

            <div className="w-full lg:w-80 h-44 rounded-2xl border border-white/[0.08] overflow-hidden shrink-0 shadow-2xl group">
              <img
                src="/security_3d_shield.png"
                alt="3D Translucent SaaS Security Shield"
                className="w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </Card>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Audit Events Today</span>
              <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-[#F8FAFC] mt-2">{summary.totalEventsToday}</p>
            <p className="text-[11px] text-[#A1A1AA] mt-1">Logged security events</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Success</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-2">{summary.successCount}</p>
            <p className="text-[11px] text-[#71717A] mt-1">Authorized operations</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Access Denied</span>
              <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-[#F59E0B] mt-2">{summary.deniedCount}</p>
            <p className="text-[11px] text-[#71717A] mt-1">RBAC authorization rejections</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Failed Operations</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-rose-400 mt-2">{summary.failedCount}</p>
            <p className="text-[11px] text-rose-400/80 mt-1">Execution failures</p>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search by action, entity name, actor, or ID..."
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
                { label: 'Customer Created', value: 'Customer Created' },
                { label: 'Customer Updated', value: 'Customer Updated' },
                { label: 'Report Created', value: 'Report Created' },
                { label: 'Report Deleted', value: 'Report Deleted' },
              ]}
              className="text-xs py-1.5 min-w-[150px]"
            />

            <Select
              value={result}
              onChange={(e) => { setResult(e.target.value); setPage(1); }}
              options={[
                { label: 'All Results', value: 'all' },
                { label: 'Success', value: 'Success' },
                { label: 'Denied', value: 'Denied' },
                { label: 'Failed', value: 'Failed' },
              ]}
              className="text-xs py-1.5 min-w-[130px]"
            />
          </div>
        </Card>

        {/* Audit Table */}
        {isLoading ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mb-3" />
            <p className="text-xs text-[#A1A1AA]">Loading security audit log...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 bg-rose-500/10 border-rose-500/20 text-rose-300 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
            <Button variant="secondary" size="sm" onClick={loadData}>Retry</Button>
          </Card>
        ) : logs.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-[#71717A] mb-3" />
            <h3 className="text-base font-bold text-[#F8FAFC]">No audit records found</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">There are no audit events matching your search or filters.</p>
          </Card>
        ) : (
          <>
            <div className="hidden md:block overflow-hidden rounded-2xl border border-[#272C36] bg-[#12151C]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#272C36] bg-[#181C25]/60 text-[#A1A1AA] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Event ID</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Entity</th>
                    <th className="py-3.5 px-4">Result</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272C36]/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#181C25]/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#8B5CF6]">#{log.id}</td>
                      <td className="py-3.5 px-4 font-bold text-[#F8FAFC]">{log.action}</td>
                      <td className="py-3.5 px-4 text-[#A1A1AA]">{log.actorName}</td>
                      <td className="py-3.5 px-4 text-[#A1A1AA]">
                        {log.entityName ? `${log.entityType} (${log.entityName})` : log.entityType}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={getResultBadgeStatus(log.result)}>{log.result}</Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#71717A]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          onClick={() => setSelectedLog(log)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#8B5CF6]">#{log.id}</span>
                    <Badge status={getResultBadgeStatus(log.result)}>{log.result}</Badge>
                  </div>
                  <p className="font-bold text-xs text-[#F8FAFC]">{log.action}</p>
                  <div className="text-[11px] text-[#A1A1AA] space-y-0.5">
                    <div>Actor: {log.actorName}</div>
                    <div>Entity: {log.entityName || log.entityType}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#272C36]">
                    <span className="text-[10px] text-[#71717A] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                      Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#12151C] border border-[#272C36] text-xs text-[#A1A1AA]">
                <div>Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} audit events</div>
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
          </>
        )}
      </div>

      {/* Audit Detail Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Security Audit Event Detail">
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#272C36]">
              <span className="font-mono text-[#8B5CF6] font-bold text-sm">#{selectedLog.id}</span>
              <Badge status={getResultBadgeStatus(selectedLog.result)}>{selectedLog.result}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[#71717A] block">Action</span>
                <span className="font-bold text-[#F8FAFC]">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Actor</span>
                <span className="text-[#F8FAFC]">{selectedLog.actorName}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Entity Type</span>
                <span className="text-[#F8FAFC]">{selectedLog.entityType}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Entity Name</span>
                <span className="font-semibold text-[#8B5CF6]">{selectedLog.entityName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">IP Address (Mock)</span>
                <span className="font-mono text-[#F8FAFC]">{selectedLog.ipAddress}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Timestamp</span>
                <span className="font-mono text-[#A1A1AA]">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#272C36]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppShell>
  );
};
