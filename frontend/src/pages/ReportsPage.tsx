import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import { Modal } from '../components/ui/Overlays';
import {
  FileText,
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Receipt,
  Activity,
  ArrowUpDown,
} from 'lucide-react';
import {
  Report,
  ReportSummary,
  ReportQueryParams,
  fetchReports,
  fetchReportSummary,
  deleteReport,
  downloadReportCSV,
  ReportType,
  ReportStatus,
} from '../services/api/reports';
import { useAuth } from '../hooks/useAuth';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';
  const isViewer = user?.role === 'Viewer';
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalGenerated: 0,
    completedCount: 0,
    failedCount: 0,
    thisMonthCount: 0,
  });
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        fetchReports({
          search: debouncedSearch,
          type: selectedType,
          status: selectedStatus,
          page,
          limit: 20,
          sortBy,
          sortOrder,
        }),
        fetchReportSummary(),
      ]);
      setReports(listRes.data);
      setMeta(listRes.meta);
      setSummary(sumRes);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load reports history.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedType, selectedStatus, page, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownload = async (id: string, name: string) => {
    try {
      const blob = await downloadReportCSV(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name.replace(/\s+/g, '_')}_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // ignore fallback
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteReport(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete report.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeStatus = (st: ReportStatus): BadgeStatus => {
    switch (st) {
      case 'Completed': return 'completed';
      case 'Processing': return 'pending';
      case 'Pending': return 'pending';
      case 'Failed': return 'failed';
      default: return 'inactive';
    }
  };

  const templates = [
    { type: 'Revenue', name: 'Revenue & Financial Velocity', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { type: 'Customer', name: 'Customer Onboarding & Cohorts', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { type: 'Subscription', name: 'Subscription Plan Mix', icon: CreditCard, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
    { type: 'Transaction', name: 'Transaction & Refund History', icon: Receipt, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { type: 'Analytics', name: 'Executive SaaS Analytics', icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { type: 'Activity', name: 'System Activity & Audit Log', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] tracking-tight">Business Reports</h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
              Generate, download, and review structured operational and financial reports.
            </p>
          </div>

          {!isViewer && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/reports/new')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Generate Report
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Total Reports</span>
              <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-[#F8FAFC] mt-2">{summary.totalGenerated}</p>
            <p className="text-[11px] text-[#A1A1AA] mt-1">Generated report files</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Completed</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-2">{summary.completedCount}</p>
            <p className="text-[11px] text-[#71717A] mt-1">Available for download</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">This Month</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-cyan-400 mt-2">{summary.thisMonthCount}</p>
            <p className="text-[11px] text-[#71717A] mt-1">Created in current month</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-[#12151C] to-[#181C25] border-[#272C36]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">Failed</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono text-rose-400 mt-2">{summary.failedCount}</p>
            <p className="text-[11px] text-rose-400/80 mt-1">Generation errors</p>
          </Card>
        </div>

        {/* Quick Report Template Cards */}
        <div>
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-3 uppercase tracking-wider">Report Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <Card
                  key={tpl.type}
                  className="p-4 border-[#272C36] hover:border-[#8B5CF6]/40 cursor-pointer transition-all group flex items-start justify-between"
                  onClick={() => !isViewer && navigate(`/reports/new?type=${tpl.type}`)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${tpl.bg} ${tpl.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-[#F8FAFC]">{tpl.name}</span>
                    </div>
                    <p className="text-[11px] text-[#71717A]">Export detailed {tpl.type.toLowerCase()} dataset.</p>
                  </div>
                  {!isViewer && (
                    <Button variant="ghost" size="sm" className="px-2 text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity">
                      Generate
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Controls: Search & Filter */}
        <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search reports by name, type, or creator..."
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
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
              options={[
                { label: 'All Report Types', value: 'all' },
                { label: 'Revenue', value: 'Revenue' },
                { label: 'Customer', value: 'Customer' },
                { label: 'Subscription', value: 'Subscription' },
                { label: 'Transaction', value: 'Transaction' },
                { label: 'Analytics', value: 'Analytics' },
                { label: 'Activity', value: 'Activity' },
              ]}
              className="text-xs py-1.5 min-w-[140px]"
            />

            <Select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Completed', value: 'Completed' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Failed', value: 'Failed' },
              ]}
              className="text-xs py-1.5 min-w-[120px]"
            />
          </div>
        </Card>

        {/* Recent Reports Table */}
        {isLoading ? (
          <Card className="p-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mb-3" />
            <p className="text-xs text-[#A1A1AA]">Loading reports history...</p>
          </Card>
        ) : error ? (
          <Card className="p-8 bg-rose-500/10 border-rose-500/20 text-rose-300 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
            <Button variant="secondary" size="sm" onClick={loadData}>Retry</Button>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 text-[#71717A] mb-3" />
            <h3 className="text-base font-bold text-[#F8FAFC]">No reports found</h3>
            <p className="text-xs text-[#A1A1AA] mt-1 mb-4">No reports match your filters.</p>
            {!isViewer && (
              <Button variant="primary" size="sm" onClick={() => navigate('/reports/new')}>
                Generate Report
              </Button>
            )}
          </Card>
        ) : (
          <>
            <div className="hidden md:block overflow-hidden rounded-2xl border border-[#272C36] bg-[#12151C]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#272C36] bg-[#181C25]/60 text-[#A1A1AA] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Report Name</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Created By</th>
                    <th className="py-3.5 px-4">Records</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272C36]/50">
                  {reports.map((rpt) => (
                    <tr key={rpt.id} className="hover:bg-[#181C25]/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#F8FAFC]">
                        <Link to={`/reports/${rpt.id}`} className="hover:text-[#8B5CF6] transition-colors">
                          {rpt.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status="info">{rpt.type}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#A1A1AA]">{rpt.createdBy}</td>
                      <td className="py-3.5 px-4 font-mono text-[#F8FAFC]">{rpt.recordCount.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={getStatusBadgeStatus(rpt.status)}>{rpt.status}</Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#71717A]">
                        {new Date(rpt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/reports/${rpt.id}`}>
                            <Button variant="ghost" size="sm" className="px-2">View</Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 text-emerald-400 hover:text-emerald-300"
                            onClick={() => handleDownload(rpt.id, rpt.name)}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-2 text-rose-400 hover:text-rose-300"
                              onClick={() => setDeleteTarget(rpt)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {reports.map((rpt) => (
                <Card key={rpt.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#F8FAFC]">{rpt.name}</span>
                    <Badge status={getStatusBadgeStatus(rpt.status)}>{rpt.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
                    <span>Type: {rpt.type}</span>
                    <span>Records: {rpt.recordCount}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#272C36]">
                    <span className="text-[10px] text-[#71717A] font-mono">{new Date(rpt.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(rpt.id, rpt.name)}>
                        Download
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm" className="text-rose-400" onClick={() => setDeleteTarget(rpt)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#12151C] border border-[#272C36] text-xs text-[#A1A1AA]">
                <div>Showing {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} reports</div>
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Report?">
        <div className="space-y-4">
          <p className="text-xs text-[#A1A1AA]">
            Are you sure you want to delete report <span className="font-bold text-[#F8FAFC]">{deleteTarget?.name}</span> ({deleteTarget?.id})? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#272C36]">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} isLoading={isDeleting} leftIcon={<Trash2 className="w-4 h-4" />}>
              Delete Report
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
};
