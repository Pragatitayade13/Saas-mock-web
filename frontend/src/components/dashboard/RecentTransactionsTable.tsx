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
  { id: 'TXN-3001', customer: 'Acme Corp', plan: 'Enterprise', amount: '$2,400.00', status: 'completed', date: 'Aug 08, 2026' },
  { id: 'TXN-3002', customer: 'Starlight Media', plan: 'Professional', amount: '$499.00', status: 'completed', date: 'Aug 08, 2026' },
  { id: 'TXN-3003', customer: 'Vortex Dynamics', plan: 'Enterprise', amount: '$2,400.00', status: 'pending', date: 'Aug 07, 2026' },
  { id: 'TXN-3004', customer: 'Nexus Labs', plan: 'Starter', amount: '$99.00', status: 'active', date: 'Aug 07, 2026' },
  { id: 'TXN-3005', customer: 'CyberDyne LLC', plan: 'Professional', amount: '$499.00', status: 'failed', date: 'Aug 06, 2026' },
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
        status: (t.status as BadgeStatus) || 'completed',
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
      render: (row) => <span className="font-semibold text-[#F8FAFC]">{row.customer}</span>,
    },
    {
      key: 'plan',
      header: 'Plan Tier',
      render: (row) => <span className="text-[#A1A1AA]">{row.plan}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (row) => <span className="font-mono font-bold text-[#F8FAFC]">{row.amount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => <span className="text-[#71717A] text-[11px]">{row.date}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: () => (
        <Button variant="ghost" size="sm" aria-label="Transaction options">
          <MoreHorizontal className="w-4 h-4 text-[#A1A1AA]" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-bold text-[#F8FAFC]">Recent Transactions</h3>
          <p className="text-xs text-[#A1A1AA]">Real-time payment ledger audit</p>
        </div>
        <Button variant="ghost" size="sm">
          View All Ledger
        </Button>
      </div>

      <Table
        columns={columns}
        data={displayData}
        keyExtractor={(row) => row.id}
      />
    </div>
  );
};
