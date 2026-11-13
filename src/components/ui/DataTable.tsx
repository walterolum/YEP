import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  caption,
  emptyState,
  className,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string;
  caption: string;
  emptyState?: ReactNode;
  className?: string;
}) {
  if (rows.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div className={className}>
      <div className="hidden overflow-x-auto md:block">
        <table className="ui-table data-table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={column.className}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="ui-table-mobile divide-y divide-line md:hidden" aria-label={caption}>
        {rows.map((row) => {
          const [primary, ...rest] = columns;
          return (
            <li key={getRowKey(row)} className="px-4 py-4">
              <div className="mb-2 text-sm font-semibold text-ink">{primary.render(row)}</div>
              <dl className="space-y-1.5">
                {rest
                  .filter((column) => !column.mobileHidden)
                  .map((column) => (
                    <div key={column.key} className="flex items-start justify-between gap-3">
                      <dt className="text-2xs font-semibold uppercase tracking-[0.08em] text-slate">{column.header}</dt>
                      <dd className={cn('text-right text-xs leading-5 text-ink', column.className)}>{column.render(row)}</dd>
                    </div>
                  ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
