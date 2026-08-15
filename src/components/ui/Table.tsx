import { type ReactNode } from 'react';

// Common base interface for components with alignment
interface BaseTableProps {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

// Utility function for alignment styles
const getAlignClass = (align: 'left' | 'center' | 'right' = 'left'): string => {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  return alignStyles[align];
};

// Table Root
export interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">{children}</table>
    </div>
  );
}

// Table Header
export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <thead className={`bg-gray-50 dark:bg-gray-800 ${className}`}>
      {children}
    </thead>
  );
}

// Table Body
export interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}>
      {children}
    </tbody>
  );
}

// Table Row
export interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  hoverable?: boolean;
}

export function TableRow({
  children,
  className = '',
  onClick,
  selected = false,
  hoverable = true,
}: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`
        ${hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}
        ${selected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

// Table Head Cell
export interface TableHeadProps extends BaseTableProps {
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
  width?: string | number;
}

export function TableHead({
  children,
  className = '',
  align = 'left',
  width,
}: TableHeadProps) {
  return (
    <th
      className={`
        px-4 py-3 text-xs font-bold uppercase tracking-wider
        text-gray-500 dark:text-gray-400
        ${getAlignClass(align)}
        ${className}
      `}
      style={{ width }}
    >
      {children}
    </th>
  );
}

// Table Cell
export interface TableCellProps extends BaseTableProps {
  colSpan?: number;
}

export function TableCell({
  children,
  className = '',
  align = 'left',
  colSpan,
}: TableCellProps) {
  return (
    <td
      className={`
        px-4 py-3 text-sm text-gray-900 dark:text-gray-100
        ${getAlignClass(align)}
        ${className}
      `}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
}

// Empty State
export interface TableEmptyProps {
  colSpan: number;
  message?: string;
  icon?: ReactNode;
}

export function TableEmpty({
  colSpan,
  message = 'No data available',
  icon,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          {icon && <div className="mb-3">{icon}</div>}
          <p>{message}</p>
        </div>
      </td>
    </tr>
  );
}

// Loading State
export interface TableLoadingProps {
  colSpan: number;
  rows?: number;
}

export function TableLoading({ colSpan, rows = 5 }: TableLoadingProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: colSpan }).map((_, cellIndex) => (
            <td key={cellIndex} className="px-4 py-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
