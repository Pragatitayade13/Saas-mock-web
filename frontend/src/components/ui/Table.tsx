import React from 'react';
import { Skeleton } from './FeedbackComponents';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string | number;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There is nothing to display right now.',
  onRowClick,
  keyExtractor,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200/90 dark:border-[#272C36] bg-white dark:bg-[#12151C] shadow-xs">
      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-slate-200/90 dark:border-[#272C36] bg-slate-50 dark:bg-[#181C25]/60 text-slate-500 dark:text-[#A1A1AA] uppercase tracking-wider font-semibold">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/90 dark:divide-[#272C36] text-slate-900 dark:text-[#F8FAFC]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-4">
                      <Skeleton className="h-4 w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500 dark:text-[#71717A]">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">{emptyTitle}</p>
                    <p className="text-xs text-slate-500 dark:text-[#A1A1AA] mt-1">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-slate-50 dark:hover:bg-[#181C25]/80 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 whitespace-nowrap text-xs ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
