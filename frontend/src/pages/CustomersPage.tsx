import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import { Table, Column } from '../components/ui/Table';
import { Badge, BadgeStatus } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Modal } from '../components/ui/Overlays';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { useAuth } from '../hooks/useAuth';
import {
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  UserCheck,
} from 'lucide-react';
import {
  Customer,
  CustomerQueryParams,
  fetchCustomers,
  deleteCustomer,
  updateCustomer,
} from '../services/api/customers';
import { ApiError } from '../services/api/client';

export const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRole = user?.role || 'Viewer';
  const canCreate = userRole === 'Administrator' || userRole === 'Manager';
  const canEdit = userRole === 'Administrator' || userRole === 'Manager';
  const canDelete = userRole === 'Administrator';

  // Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Filter Values
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');

  // Sort State
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Loading & Error State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [hasDependenciesError, setHasDependenciesError] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: CustomerQueryParams = {
        search: debouncedSearch,
        status: selectedStatuses.length === 1 ? selectedStatuses[0] : undefined,
        plan: selectedPlans.length === 1 ? selectedPlans[0] : undefined,
        location: locationFilter.trim() || undefined,
        page,
        limit,
        sortBy,
        sortOrder,
      };

      const res = await fetchCustomers(params);
      let filtered = res.data;

      // Multi-filter client-side refinement if multiple statuses/plans selected
      if (selectedStatuses.length > 1) {
        filtered = filtered.filter((c) => selectedStatuses.includes(c.status));
      }
      if (selectedPlans.length > 1) {
        filtered = filtered.filter((c) => selectedPlans.includes(c.plan));
      }

      setCustomers(filtered);
      setTotalCount(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load customers from API.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, selectedStatuses, selectedPlans, locationFilter, page, limit, sortBy, sortOrder]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleApplyFilters = () => {
    setPage(1);
    loadCustomers();
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedStatuses([]);
    setSelectedPlans([]);
    setLocationFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const toggleStatusFilter = (st: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  const togglePlanFilter = (pl: string) => {
    setSelectedPlans((prev) =>
      prev.includes(pl) ? prev.filter((p) => p !== pl) : [...prev, pl]
    );
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (customers.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Company', 'Plan', 'Status', 'Monthly Revenue', 'Location', 'Created At'];
    const rows = customers.map((c) => [
      `"${c.id}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.company.replace(/"/g, '""')}"`,
      `"${c.plan}"`,
      `"${c.status}"`,
      `"${c.monthlyRevenue}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      `"${c.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexora_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Customer Handler
  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    setDeleteError(null);
    setHasDependenciesError(false);

    try {
      await deleteCustomer(deletingCustomer.id);
      setDeletingCustomer(null);
      await loadCustomers();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'CUSTOMER_HAS_DEPENDENCIES') {
        setHasDependenciesError(true);
        setDeleteError('This customer cannot be deleted because related subscriptions or transactions exist.');
      } else if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError('Failed to delete customer.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivateInDeleteModal = async () => {
    if (!deletingCustomer) return;
    try {
      await updateCustomer(deletingCustomer.id, { status: 'Suspended' });
      setDeletingCustomer(null);
      await loadCustomers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate customer.');
    }
  };

  // Table Columns Setup
  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatar} size="sm" />
          <div className="flex flex-col">
            <span className="font-bold text-[#F7F8FA]">{row.name}</span>
            <span className="text-[11px] text-[#A5ACB8]">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (row) => <span className="font-semibold text-[#A5ACB8]">{row.company}</span>,
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
          {row.plan}
        </span>
      ),
    },
    {
      key: 'monthlyRevenue',
      header: 'Monthly Revenue',
      align: 'right',
      render: (row) => (
        <span className="font-mono font-bold text-[#F7F8FA]">
          ₹{row.monthlyRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <Badge status={row.status.toLowerCase() as BadgeStatus}>{row.status}</Badge>,
    },
    {
      key: 'location',
      header: 'Location',
      render: (row) => <span className="text-[#707784] text-xs">{row.location || 'N/A'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => (
        <span className="text-[#707784] text-xs">
          {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/customers/${row.id}`)}
            title="View Details"
            aria-label="View Customer Details"
          >
            <Eye className="w-4 h-4 text-[#A5ACB8] hover:text-[#F7F8FA]" />
          </Button>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingCustomer(row);
                setIsAddEditModalOpen(true);
              }}
              title="Edit Account"
              aria-label="Edit Customer"
            >
              <Edit className="w-4 h-4 text-[#8B5CF6]" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDeletingCustomer(row);
                setDeleteError(null);
                setHasDependenciesError(false);
              }}
              title="Delete Account"
              aria-label="Delete Customer"
            >
              <Trash2 className="w-4 h-4 text-rose-400 hover:text-rose-300" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const hasActiveFilters =
    debouncedSearch !== '' ||
    selectedStatuses.length > 0 ||
    selectedPlans.length > 0 ||
    locationFilter !== '';

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-[#F7F8FA] tracking-tight">Customers</h1>
            <p className="text-xs text-[#A5ACB8]">Manage customer accounts, relationships, and recurring subscriptions.</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={handleExportCSV}
              disabled={customers.length === 0}
              leftIcon={<Download className="w-4 h-4 text-[#22D3EE]" />}
            >
              Export CSV
            </Button>

            {canCreate && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingCustomer(null);
                  setIsAddEditModalOpen(true);
                }}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Customer
              </Button>
            )}
          </div>
        </div>

        {/* Toolbar Bar — Search, Filter Toggle, Sort Select */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="w-full sm:flex-1 relative">
            <Input
              placeholder="Search customers by name, company, or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-[#707784]" />}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A5ACB8] hover:text-[#F7F8FA]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Panel Toggle Button */}
          <Button
            variant={isFilterPanelOpen || hasActiveFilters ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white ml-1"></span>}
          </Button>

          {/* Whitelisted Sorting Select */}
          <div className="w-full sm:w-56 flex items-center gap-2">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { label: 'Sort by Created Date', value: 'createdAt' },
                { label: 'Sort by Name', value: 'name' },
                { label: 'Sort by Revenue', value: 'monthlyRevenue' },
                { label: 'Sort by Status', value: 'status' },
              ]}
            />
            <Button
              variant="secondary"
              size="md"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Switch to ${sortOrder === 'asc' ? 'descending' : 'ascending'} order`}
              aria-label="Toggle sort direction"
            >
              <ArrowUpDown className={`w-4 h-4 ${sortOrder === 'asc' ? 'rotate-180' : ''} transition-transform`} />
            </Button>
          </div>
        </div>

        {/* Filter Expandable Panel */}
        {isFilterPanelOpen && (
          <div className="p-5 rounded-2xl bg-[#171A20] border border-white/[0.08] shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-bold text-[#F7F8FA] uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[#8B5CF6]" /> Customer Filters
              </h3>
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className="text-xs text-[#8B5CF6] hover:underline font-semibold">
                  Reset All Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {/* Status Filter Checkboxes */}
              <div>
                <label className="block font-bold text-[#A5ACB8] mb-2 uppercase tracking-wider text-[10px]">
                  Customer Status
                </label>
                <div className="space-y-2">
                  {['Active', 'Trial', 'Inactive', 'Suspended'].map((st) => (
                    <label key={st} className="flex items-center gap-2.5 text-[#F7F8FA] cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(st)}
                        onChange={() => toggleStatusFilter(st)}
                        className="rounded border-white/[0.08] bg-[#111419] text-[#8B5CF6] focus:ring-0"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Plan Filter Checkboxes */}
              <div>
                <label className="block font-bold text-[#A5ACB8] mb-2 uppercase tracking-wider text-[10px]">
                  Plan Tier
                </label>
                <div className="space-y-2">
                  {['Free', 'Starter', 'Professional', 'Enterprise'].map((pl) => (
                    <label key={pl} className="flex items-center gap-2.5 text-[#F7F8FA] cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={selectedPlans.includes(pl)}
                        onChange={() => togglePlanFilter(pl)}
                        className="rounded border-white/[0.08] bg-[#111419] text-[#8B5CF6] focus:ring-0"
                      />
                      <span>{pl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Input Filter */}
              <div>
                <label className="block font-bold text-[#A5ACB8] mb-2 uppercase tracking-wider text-[10px]">
                  Location
                </label>
                <Input
                  placeholder="Filter by city, state or country..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5 border-t border-white/[0.08]">
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Clear
              </Button>
              <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Error Alert State */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-xs sm:text-sm font-semibold">{error}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => loadCustomers()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && customers.length === 0 ? (
          <div className="h-64 rounded-2xl bg-[#171A20] border border-white/[0.08] animate-shimmer flex items-center justify-center text-xs text-[#A5ACB8]">
            Fetching customers from Go API store...
          </div>
        ) : customers.length === 0 ? (
          /* Empty States */
          <div className="p-12 text-center rounded-2xl bg-[#171A20] border border-white/[0.08] space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center mx-auto text-[#8B5CF6]">
              <UserCheck className="w-8 h-8" />
            </div>
            {hasActiveFilters ? (
              <>
                <h3 className="text-base font-bold text-[#F7F8FA]">No customers found matching criteria</h3>
                <p className="text-xs text-[#A5ACB8]">Try adjusting your search query or clearing filter rules.</p>
                <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-[#F7F8FA]">No customers yet</h3>
                <p className="text-xs text-[#A5ACB8]">Create your first customer account to get started.</p>
                {canCreate && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingCustomer(null);
                      setIsAddEditModalOpen(true);
                    }}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Customer
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block">
              <Table<Customer>
                columns={columns}
                data={customers}
                keyExtractor={(row) => row.id}
                onRowClick={(row) => navigate(`/customers/${row.id}`)}
              />
            </div>

            {/* Mobile Touch-Friendly Customer Cards View (Shown on small screens) */}
            <div className="md:hidden space-y-3">
              {customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="p-4 rounded-2xl bg-[#171A20] border border-white/[0.08] space-y-3 shadow-md active:bg-[#111419] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} src={c.avatar} size="md" />
                      <div>
                        <h4 className="font-bold text-sm text-[#F7F8FA]">{c.name}</h4>
                        <p className="text-[11px] text-[#A5ACB8]">{c.email}</p>
                      </div>
                    </div>
                    <Badge status={c.status.toLowerCase() as BadgeStatus}>{c.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/[0.08]">
                    <div>
                      <span className="text-[10px] text-[#707784] uppercase font-bold block">Company</span>
                      <span className="font-semibold text-[#A5ACB8]">{c.company}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#707784] uppercase font-bold block">Plan</span>
                      <span className="font-semibold text-[#8B5CF6]">{c.plan}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#707784] uppercase font-bold block">Monthly Revenue</span>
                      <span className="font-mono font-bold text-[#F7F8FA]">₹{c.monthlyRevenue?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#707784] uppercase font-bold block">Location</span>
                      <span className="text-[#A5ACB8]">{c.location || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/customers/${c.id}`)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                      View
                    </Button>
                    {canEdit && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingCustomer(c);
                          setIsAddEditModalOpen(true);
                        }}
                        leftIcon={<Edit className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setDeletingCustomer(c);
                          setDeleteError(null);
                          setHasDependenciesError(false);
                        }}
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#171A20] border border-white/[0.08] text-xs">
              <span className="text-[#A5ACB8]">
                Showing <strong className="text-[#F7F8FA]">{customers.length > 0 ? (page - 1) * limit + 1 : 0}</strong>–
                <strong className="text-[#F7F8FA]">{Math.min(page * limit, totalCount)}</strong> of{' '}
                <strong className="text-[#F7F8FA]">{totalCount}</strong> customers
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage(page - 1)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        p === page
                          ? 'bg-[#8B5CF6] text-white shadow-md'
                          : 'bg-[#111419] text-[#A5ACB8] hover:text-[#F7F8FA] hover:bg-[#1D2128]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage(page + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Add / Edit Customer Modal */}
        <CustomerFormModal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          initialCustomer={editingCustomer}
          onSuccess={() => loadCustomers()}
        />

        {/* Delete Customer Confirmation Modal */}
        <Modal
          isOpen={!!deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          title="Delete Customer Account"
        >
          {deletingCustomer && (
            <div className="space-y-4">
              <p className="text-xs text-[#A5ACB8] leading-relaxed">
                Are you sure you want to delete <strong className="text-[#F7F8FA]">{deletingCustomer.name}</strong> ({deletingCustomer.company})?
              </p>

              {deleteError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Cannot Delete Customer</span>
                  </div>
                  <p className="leading-normal">{deleteError}</p>
                  {hasDependenciesError && (
                    <div className="pt-2 border-t border-rose-500/20 flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleDeactivateInDeleteModal}
                      >
                        Deactivate Customer Instead
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setDeletingCustomer(null)} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteCustomer} isLoading={isDeleting}>
                  Delete Customer
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
};
