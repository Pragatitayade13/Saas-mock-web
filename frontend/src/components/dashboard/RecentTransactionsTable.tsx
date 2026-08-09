import React from 'react';
import { Table, Column } from '../ui/Table';
import { Badge, BadgeStatus } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MoreHorizontal } from 'lucide-react';
import { DashboardTransaction } from '../../services/api/dashboard';

export interface TransactionRow {
  id: string;
  customer: string;
  plan: string;
  amount: string;
  status: BadgeStatus;
  date: string;
}

const mockTransactions: TransactionRow[] = [
  { id: 'TXN-3001', customer: 'Acme Corp', plan: 'Enterprise', amount: '₹12,499.00', status: 'completed', date: 'Aug 08, 2026' },
  { id: 'TXN-3002', customer: 'Starlight Media', plan: 'Professional', amount: '₹4,999.00', status: 'completed', date: 'Aug 08, 2026' },
  { id: 'TXN-3003', customer: 'Vortex Dynamics', plan: 'Enterprise', amount: '₹12,499.00', status: 'pending', date: 'Aug 07, 2026' },
  { id: 'TXN-3004', customer: 'Nexus Labs', plan: 'Starter', amount: '₹1,999.00', status: 'active', date: 'Aug 07, 2026' },
  { id: 'TXN-3005', customer: 'CyberDyne LLC', plan: 'Professional', amount: '₹4,999.00', status: 'failed', date: 'Aug 06, 2026' },
];

interface RecentTransactionsTableProps {
  transactions?: DashboardTransaction[];
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({ transactions }) => {
  const displayData: TransactionRow[] = transactions?.length
    ? transactions.map((t) => ({
        id: t.id,
        customer: t.customer,
        plan: t.plan,
        amount: t.amount,
        status: (t.status.toLowerCase() as BadgeStatus) || 'completed',
        date: t.date,
      }))
    : mockTransactions;

  const columns: Column<TransactionRow>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (row) => <span className="font-mono text-xs text-[#8B5CF6] font-semibold">{row.id}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{row.customer}</span>,
    },
    {
      key: 'plan',
      header: 'Plan Tier',
      render: (row) => <span className="text-slate-600 dark:text-[#A1A1AA]">{row.plan}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => <span className="font-bold text-slate-900 dark:text-[#F8FAFC]">{row.amount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <Badge status={row.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      align: 'right',
      render: (row) => <span className="text-slate-500 dark:text-[#71717A] text-xs">{row.date}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: () => (
        <Button variant="ghost" size="sm" aria-label="Transaction actions">
          <MoreHorizontal className="w-4 h-4 text-slate-400 dark:text-[#71717A]" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">Recent Transactions</h3>
          <p className="text-xs text-slate-500 dark:text-[#A1A1AA]">Latest financial activity across all customer accounts</p>
        </div>
      </div>
      <Table
        columns={columns}
        data={displayData}
        keyExtractor={(row) => row.id}
        emptyTitle="No transactions found"
        emptyDescription="New billing transactions will appear here."
      />
    </div>
  );
};
