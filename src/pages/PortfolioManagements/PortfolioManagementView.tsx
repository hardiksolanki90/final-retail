import { useState, useEffect, useMemo } from 'react';
import { CircleUserRound, Package, Users, SquarePen, Trash2, Search } from 'lucide-react';
import type {
  PortfolioManagement,
  PortfolioManagementDetail,
  PortfolioManagementCustomer,
  PortfolioManagementItem,
} from '../../types/PortfolioManagement';
import { getPortfolioManagement, getPortfolioManagements } from '../../api/PortfolioManagementApi';
import { usePortfolioManagement, usePortfolioManagementActions } from '../../hooks/PortfolioManagements/usePortfolioManagements';
import { useAuth } from '../../context/AuthContext';
import { useMoney } from '../../hooks/Currency/useMoney';
import { formatDay } from '../../utils/documentSheets';
import { RecordViewDrawer, type RecordMenuItem } from '../shared/RecordView/RecordViewDrawer';
import { RecordTable, type RecordColumn, type RecordSort } from '../shared/RecordView/RecordTable';
import { InfoSection, InfoSectionsSkeleton } from '../shared/RecordView/InfoSection';
import { StatusPill } from '../shared/RecordView/StatusPill';

const fetchPortfolios = async (page: number, search: string, perPage: number) => {
  const res = await getPortfolioManagements({ page, search: search || undefined, perPage });
  return { items: res.data, hasMore: res.meta.has_more_pages };
};

function OverviewTab({
  data,
  row,
}: {
  data: PortfolioManagementDetail | null;
  row: PortfolioManagement | null;
}) {
  const shown = data ?? row;
  if (!shown) {
    return <InfoSectionsSkeleton titles={['General Details', 'Validity & Schedule']} />;
  }

  const items = data?.items ?? [];
  const customers = data?.customers ?? [];

  return (
    <div className="mt-3 space-y-4">
      <InfoSection
        title="General Details"
        rows={[
          { label: 'Portfolio Name', value: shown.name },
          { label: 'Portfolio Code', value: shown.code ? <span className="font-mono">{shown.code}</span> : null },
          { label: 'Valid From', value: formatDay(shown.startDate) ?? shown.startDate ?? null },
          { label: 'Valid To', value: formatDay(shown.endDate) ?? shown.endDate ?? null },
          {
            label: 'Status',
            value: (
              <StatusPill
                label={shown.status ? 'Active' : 'Inactive'}
                tone={shown.status ? 'success' : 'neutral'}
              />
            ),
          },
          {
            label: 'Total Items',
            value: data ? `${items.length} items` : shown.itemCount != null ? `${shown.itemCount} items` : null,
          },
          {
            label: 'Total Customers',
            value: data
              ? `${customers.length} customers`
              : shown.customerCount != null
                ? `${shown.customerCount} customers`
                : null,
          },
        ]}
      />

      <InfoSection
        title="Validity & Schedule"
        rows={[
          { label: 'Valid From', value: shown.startDate || null },
          { label: 'Valid To', value: shown.endDate || null },
          { label: 'Schedule Status', value: shown.status ? 'Currently Active' : 'Inactive' },
          { label: 'Assigned Customers', value: `${customers.length} customer${customers.length === 1 ? '' : 's'}` },
        ]}
      />
    </div>
  );
}

function ItemsTab({ items, isLoading }: { items: PortfolioManagementItem[]; isLoading: boolean }) {
  const { format } = useMoney();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<RecordSort | null>(null);

  const filtered = useMemo(() => {
    let list = items;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (it) =>
          it.itemName?.toLowerCase().includes(q) ||
          it.itemCode?.toLowerCase().includes(q) ||
          it.customerItemCode?.toLowerCase().includes(q) ||
          it.uomName?.toLowerCase().includes(q)
      );
    }
    if (sort) {
      list = [...list].sort((a, b) => {
        let va: string | number = '';
        let vb: string | number = '';
        if (sort.key === 'itemName') {
          va = a.itemName || '';
          vb = b.itemName || '';
        } else if (sort.key === 'storePrice') {
          va = Number(a.storePrice) || 0;
          vb = Number(b.storePrice) || 0;
        } else if (sort.key === 'listingFees') {
          va = Number(a.listingFees) || 0;
          vb = Number(b.listingFees) || 0;
        } else if (sort.key === 'customerItemCode') {
          va = a.customerItemCode || '';
          vb = b.customerItemCode || '';
        }
        if (va < vb) return sort.direction === 'asc' ? -1 : 1;
        if (va > vb) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [items, search, sort]);

  const totalListingFees = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.listingFees) || 0), 0),
    [items]
  );

  const columns: RecordColumn<PortfolioManagementItem>[] = [
    {
      key: 'item',
      label: 'Item',
      sortable: true,
      render: (it) => (
        <div className="py-1">
          <p className="font-semibold text-[var(--rv-ink)]">{it.itemName || 'Unknown Item'}</p>
          {it.itemCode && <p className="font-mono text-xs text-[var(--rv-muted)]">{it.itemCode}</p>}
        </div>
      ),
    },
    {
      key: 'customerItemCode',
      label: 'Customer Item Code',
      sortable: true,
      render: (it) =>
        it.customerItemCode ? (
          <span className="font-mono text-[13px] text-[var(--rv-ink)]">{it.customerItemCode}</span>
        ) : (
          <span className="text-[var(--rv-muted)]">—</span>
        ),
    },
    {
      key: 'uom',
      label: 'UOM',
      render: (it) =>
        it.uomName ? (
          <span className="inline-block rounded-[3px] bg-[var(--rv-head)] px-2 py-0.5 text-xs font-medium text-[var(--rv-secondary)]">
            {it.uomName}
          </span>
        ) : (
          <span className="text-[var(--rv-muted)]">—</span>
        ),
    },
    {
      key: 'storePrice',
      label: 'Store Price',
      align: 'right',
      sortable: true,
      render: (it) => <span className="font-mono font-semibold text-[var(--rv-ink)]">{format(it.storePrice)}</span>,
    },
    {
      key: 'listingFees',
      label: 'Listing Fees',
      align: 'right',
      sortable: true,
      render: (it) => (
        <span className="font-mono text-[var(--rv-secondary)]">
          {it.listingFees ? format(it.listingFees) : '—'}
        </span>
      ),
    },
  ];

  const footCell =
    'h-12 border-t border-[var(--rv-border)] bg-[var(--rv-head)] px-[14px] font-semibold text-[var(--rv-text)]';

  return (
    <>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rv-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or code…"
            className="h-10 w-full rounded-[4px] border border-[var(--rv-border)] bg-[var(--rv-bg)] pl-9 pr-3 text-[14px] text-[var(--rv-ink)] placeholder-[var(--rv-muted)] focus:border-[var(--rv-accent)] focus:outline-none"
          />
        </div>
        <span className="text-[13px] text-[var(--rv-secondary)]">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      <div className="mt-[17px]">
        <RecordTable
          columns={columns}
          rows={filtered}
          rowKey={(it, idx) => `${it.itemId || idx}:${it.uomId || ''}`}
          isLoading={isLoading}
          emptyLabel={search ? 'No items match your search' : 'No items added to this portfolio'}
          sort={sort}
          onSort={setSort}
          footer={
            items.length > 0 && (
              <tr>
                <td colSpan={3} className={footCell}>
                  Total ({items.length} {items.length === 1 ? 'item' : 'items'})
                </td>
                <td className={`${footCell} text-right tabular-nums`}>—</td>
                <td className={`${footCell} text-right font-mono tabular-nums`}>
                  {format(totalListingFees)}
                </td>
              </tr>
            )
          }
        />
      </div>
    </>
  );
}

function CustomersTab({
  customers,
  isLoading,
}: {
  customers: PortfolioManagementCustomer[];
  isLoading: boolean;
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<RecordSort | null>(null);

  const filtered = useMemo(() => {
    let list = customers;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.customerName?.toLowerCase().includes(q) ||
          c.customerCode?.toLowerCase().includes(q) ||
          String(c.userId).includes(q)
      );
    }
    if (sort) {
      list = [...list].sort((a, b) => {
        let va: string | number = '';
        let vb: string | number = '';
        if (sort.key === 'customerCode') {
          va = a.customerCode || '';
          vb = b.customerCode || '';
        } else if (sort.key === 'customerName') {
          va = a.customerName || '';
          vb = b.customerName || '';
        } else if (sort.key === 'userId') {
          va = Number(a.userId) || 0;
          vb = Number(b.userId) || 0;
        }
        if (va < vb) return sort.direction === 'asc' ? -1 : 1;
        if (va > vb) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [customers, search, sort]);

  const columns: RecordColumn<PortfolioManagementCustomer>[] = [
    {
      key: 'customerCode',
      label: 'Customer Code',
      sortable: true,
      render: (c) => (
        <span className="font-mono font-medium text-[var(--rv-ink)]">
          {c.customerCode || '—'}
        </span>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      sortable: true,
      render: (c) => (
        <span className="font-medium text-[var(--rv-ink)]">
          {c.customerName || 'Unnamed Customer'}
        </span>
      ),
    },
    {
      key: 'userId',
      label: 'User ID',
      align: 'right',
      sortable: true,
      render: (c) => (
        <span className="font-mono text-xs text-[var(--rv-muted)]">
          {c.userId || c.customerId || '—'}
        </span>
      ),
    },
  ];

  const footCell =
    'h-12 border-t border-[var(--rv-border)] bg-[var(--rv-head)] px-[14px] font-semibold text-[var(--rv-text)]';

  return (
    <div className="flex flex-col min-h-[400px]">
      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--rv-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name or code…"
            className="h-10 w-full rounded-[4px] border border-[var(--rv-border)] bg-[var(--rv-bg)] pl-9 pr-3 text-[14px] text-[var(--rv-ink)] placeholder-[var(--rv-muted)] focus:border-[var(--rv-accent)] focus:outline-none"
          />
        </div>
        <span className="text-[13px] text-[var(--rv-secondary)]">
          {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
        </span>
      </div>
      <div className="mt-[17px] min-h-[340px] max-h-[calc(100vh-230px)] overflow-y-auto overflow-x-auto rounded-[4px] border border-[var(--rv-border)]">
        <RecordTable
          columns={columns}
          rows={filtered}
          rowKey={(c, idx) => `${c.id || c.uuid || idx}:${c.userId}`}
          isLoading={isLoading}
          emptyLabel={search ? 'No customers match your search' : 'No customers assigned to this portfolio'}
          sort={sort}
          onSort={setSort}
          bare
          footer={
            customers.length > 0 && (
              <tr>
                <td colSpan={2} className={footCell}>
                  Total Assigned Customers
                </td>
                <td className={`${footCell} text-right font-mono tabular-nums`}>
                  {customers.length}
                </td>
              </tr>
            )
          }
        />
      </div>
    </div>
  );
}

export interface PortfolioManagementViewProps {
  isOpen?: boolean;
  onClose: () => void;
  uuid?: string | null;
  portfolio?: PortfolioManagement | null;
  onSelect?: (uuid: string, row: PortfolioManagement) => void;
  row?: PortfolioManagement | null;
  data?: PortfolioManagementDetail | null;
  onEdit?: (uuid: string) => void;
  seed?: { items: PortfolioManagement[]; hasMore: boolean } | null;
  pageSize?: number;
}

export function PortfolioManagementView({
  isOpen = true,
  onClose,
  uuid: propUuid,
  portfolio,
  onSelect,
  row: propRow,
  data: propData,
  onEdit,
  seed,
  pageSize = 15,
}: PortfolioManagementViewProps) {
  const { hasPermission } = useAuth();
  const initialUuid = propUuid ?? portfolio?.uuid ?? null;
  const [selectedUuid, setSelectedUuid] = useState<string | null>(initialUuid);
  const [selectedRow, setSelectedRow] = useState<PortfolioManagement | null>(propRow ?? portfolio ?? null);

  useEffect(() => {
    if (initialUuid) {
      setSelectedUuid(initialUuid);
    }
  }, [initialUuid]);

  useEffect(() => {
    if (propRow ?? portfolio) {
      setSelectedRow(propRow ?? portfolio ?? null);
    }
  }, [propRow, portfolio]);

  const activeUuid = selectedUuid ?? initialUuid;
  const { data: detailData, isLoading } = usePortfolioManagement(isOpen ? activeUuid : null);
  const { remove } = usePortfolioManagementActions();

  const data = propData ?? detailData ?? null;
  const shown = data ?? selectedRow;

  const handleDelete = () => {
    if (!shown) return;
    if (window.confirm(`Delete portfolio ${shown.code} - ${shown.name}?`)) {
      remove.mutate(shown.uuid, {
        onSuccess: () => onClose(),
      });
    }
  };

  const menu: RecordMenuItem[] = [];
  if (shown && onEdit && hasPermission('portfolio-management.edit')) {
    menu.push({
      label: 'Edit',
      icon: SquarePen,
      onClick: () => onEdit(shown.uuid),
    });
  }
  if (shown && hasPermission('portfolio-management.delete')) {
    menu.push({
      label: 'Delete',
      icon: Trash2,
      onClick: handleDelete,
    });
  }

  const items = data?.items ?? [];
  const customers = data?.customers ?? [];

  return (
    <RecordViewDrawer<PortfolioManagement>
      isOpen={isOpen && Boolean(shown || activeUuid)}
      onClose={onClose}
      title={shown ? [shown.code, shown.name].filter(Boolean).join(' - ') : null}
      rail={{
        queryKey: `portfolio-management-${pageSize}`,
        seed,
        prefetch: {
          key: (pm) => ['portfolio-management-detail', pm.uuid],
          fetch: (pm) => getPortfolioManagement(pm.uuid),
        },
        placeholder: 'Search Portfolio',
        fetchPage: (page, search) => fetchPortfolios(page, search, pageSize),
        toCard: (pm) => ({
          key: pm.uuid,
          title: pm.name,
          subtitle: pm.code,
          amount: pm.status ? 'Active' : 'Inactive',
        }),
        selectedKey: activeUuid,
        keyboard: true,
        onSelect: (pm) => {
          if (pm.uuid) {
            setSelectedUuid(pm.uuid);
            setSelectedRow(pm);
            onSelect?.(pm.uuid, pm);
          }
        },
      }}
      action={
        shown && onEdit && hasPermission('portfolio-management.edit')
          ? {
            label: 'Edit Portfolio',
            icon: SquarePen,
            onClick: () => onEdit(shown.uuid),
          }
          : null
      }
      menu={menu}
      tabs={[
        {
          key: 'overview',
          label: 'Overview',
          icon: CircleUserRound,
          content: <OverviewTab data={data} row={shown} />,
        },
        {
          key: 'items',
          label: `Items (${items.length})`,
          icon: Package,
          content: <ItemsTab items={items} isLoading={isLoading && !data} />,
        },
        {
          key: 'customers',
          label: `Customers (${customers.length})`,
          icon: Users,
          content: <CustomersTab customers={customers} isLoading={isLoading && !data} />,
        },
      ]}
    />
  );
}
