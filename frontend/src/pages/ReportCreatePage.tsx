import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import { ArrowLeft, FileText, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createReport, ReportType } from '../services/api/reports';

export const ReportCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as ReportType) || 'Revenue';

  const [type, setType] = useState<ReportType>(initialType);
  const [name, setName] = useState(`${initialType} Performance & Audit Summary`);
  const [range, setRange] = useState('30d');
  const [format, setFormat] = useState('CSV');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await createReport({
        name,
        type,
        format,
        parameters: {
          range,
          statusFilter,
          planFilter,
        },
      });
      navigate(`/reports/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (newType: ReportType) => {
    setType(newType);
    setName(`${newType} Report — ${new Date().toLocaleDateString()}`);
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reports</span>
        </Link>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] tracking-tight">Generate New Business Report</h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            Configure dataset parameters and filters to generate a clean structured CSV export.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-[#12151C] border-[#272C36]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F8FAFC]">Report Name *</label>
              <Input
                placeholder="e.g. Q3 Executive Revenue Summary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#F8FAFC]">Report Type *</label>
                <Select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as ReportType)}
                  options={[
                    { label: 'Revenue & Financial Velocity', value: 'Revenue' },
                    { label: 'Customer Onboarding & Cohorts', value: 'Customer' },
                    { label: 'Subscription Plan Mix', value: 'Subscription' },
                    { label: 'Transaction & Refund History', value: 'Transaction' },
                    { label: 'Executive Analytics', value: 'Analytics' },
                    { label: 'System Activity & Audit Log', value: 'Activity' },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#F8FAFC]">Date Range *</label>
                <Select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  options={[
                    { label: 'Last 7 Days', value: '7d' },
                    { label: 'Last 30 Days', value: '30d' },
                    { label: 'Last 90 Days', value: '90d' },
                    { label: 'Last 12 Months', value: '12m' },
                  ]}
                />
              </div>
            </div>

            {/* Type Specific Filters */}
            <div className="p-4 rounded-2xl bg-[#181C25] border border-[#272C36] space-y-4">
              <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Report Filters ({type})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#A1A1AA]">Status Filter</label>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                      { label: 'All Statuses', value: 'all' },
                      { label: 'Active / Completed', value: 'Active' },
                      { label: 'Pending / Trial', value: 'Pending' },
                      { label: 'Cancelled / Failed', value: 'Cancelled' },
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#A1A1AA]">Plan Filter</label>
                  <Select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value)}
                    options={[
                      { label: 'All Plans', value: 'all' },
                      { label: 'Starter Tier ($29/mo)', value: 'Starter' },
                      { label: 'Professional Tier ($99/mo)', value: 'Professional' },
                      { label: 'Enterprise Tier ($299/mo)', value: 'Enterprise' },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F8FAFC]">Export Format *</label>
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                options={[
                  { label: 'CSV (Comma Separated Values)', value: 'CSV' },
                ]}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#272C36]">
              <Button variant="secondary" type="button" onClick={() => navigate('/reports')}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Generate Report
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
};
