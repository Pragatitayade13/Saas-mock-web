import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Overlays';
import {
  ArrowLeft,
  FileText,
  Download,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Activity,
  Layers,
} from 'lucide-react';
import {
  Report,
  fetchReportById,
  deleteReport,
  downloadReportCSV,
  ReportStatus,
} from '../services/api/reports';
import { useAuth } from '../hooks/useAuth';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Administrator';
  const isViewer = user?.role === 'Viewer';

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete Modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchReportById(id);
      setReport(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownload = async () => {
    if (!report) return;
    try {
      const blob = await downloadReportCSV(report.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.name.replace(/\s+/g, '_')}_${report.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // ignore
    }
  };

  const handleDelete = async () => {
    if (!report) return;
    setIsDeleting(true);
    try {
      await deleteReport(report.id);
      navigate('/reports');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete report.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin mb-3" />
          <p className="text-xs text-[#A1A1AA]">Loading report details...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !report) {
    return (
      <AppShell>
        <Card className="p-8 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-[#F8FAFC]">Report Not Found</h3>
          <p className="text-xs text-[#A1A1AA]">{error || 'The requested report file could not be found.'}</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/reports')}>
            Back to Reports
          </Button>
        </Card>
      </AppShell>
    );
  }

  const getStatusBadgeStatus = (st: ReportStatus): BadgeStatus => {
    switch (st) {
      case 'Completed': return 'completed';
      case 'Processing': return 'pending';
      case 'Pending': return 'pending';
      case 'Failed': return 'failed';
      default: return 'inactive';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </Link>

        {/* Hero Card */}
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-[#12151C] via-[#181C25] to-[#12151C] border-[#272C36]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-[#8B5CF6]/20 shrink-0">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">{report.name}</h1>
                  <Badge status={getStatusBadgeStatus(report.status)}>{report.status}</Badge>
                  <Badge status="info">{report.type}</Badge>
                </div>
                <p className="text-xs text-[#A1A1AA] font-mono">Report ID: #{report.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownload}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download CSV
              </Button>
              {isAdmin && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsDeleteOpen(true)}
                  leftIcon={<Trash2 className="w-4 h-4" />}
                >
                  Delete Report
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <FileText className="w-4 h-4 text-[#8B5CF6]" />
              <span>Report Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#71717A] block">Report Name</span>
                <span className="font-bold text-[#F8FAFC]">{report.name}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Type</span>
                <span className="font-bold text-[#F8FAFC]">{report.type}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Format</span>
                <span className="font-mono text-[#F8FAFC]">{report.format}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Records Processed</span>
                <span className="font-mono font-bold text-emerald-400">{report.recordCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Created By</span>
                <span className="text-[#F8FAFC]">{report.createdBy}</span>
              </div>
              <div>
                <span className="text-[#71717A] block">Created Date</span>
                <span className="font-mono text-[#A1A1AA]">{new Date(report.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Activity History for Report */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2 border-b border-[#272C36] pb-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Report Activity Lifecycle</span>
            </h3>

            <div className="relative pl-6 space-y-4 text-xs before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#272C36]">
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-[#181C25]"></div>
                <div>
                  <span className="font-bold text-[#F8FAFC] block">Report Generated & Ready</span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    {report.completedAt ? new Date(report.completedAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
              </div>

              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#8B5CF6] ring-4 ring-[#181C25]"></div>
                <div>
                  <span className="font-bold text-[#F8FAFC] block">Report Creation Request Initiated</span>
                  <span className="text-[11px] text-[#A1A1AA]">Created by {report.createdBy}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Report?">
        <div className="space-y-4">
          <p className="text-xs text-[#A1A1AA]">
            Are you sure you want to delete report <span className="font-bold text-[#F8FAFC]">{report.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-[#272C36]">
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} leftIcon={<Trash2 className="w-4 h-4" />}>
              Delete Report
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
};
