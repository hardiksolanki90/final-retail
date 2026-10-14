import { CircleUserRound, Package, FileText, AlertTriangle, SquarePen, Trash2 } from 'lucide-react';
import { RecordViewDrawer, type RecordMenuItem } from '../shared/RecordView/RecordViewDrawer';
import { OverviewTab } from './tabs/OverviewTab';
import { AssignInventoryTab } from './tabs/AssignInventoryTab';
import { ViewInventoryPostTab } from './tabs/ViewInventoryPostTab';
import { DamagedTab } from './tabs/DamagedTab';
import type { StockInStoreRecord } from '../../types/StockInStore';

interface StockInStoreViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  uuid: string | null;
  selectedItem: StockInStoreRecord | null;
  records: StockInStoreRecord[];
  onSelect: (uuid: string, record: StockInStoreRecord) => void;
  onEdit?: (record: StockInStoreRecord) => void;
  onDelete?: (record: StockInStoreRecord) => void;
  pageSize?: number;
}

export function StockInStoreViewDrawer({
  isOpen,
  onClose,
  uuid,
  selectedItem,
  records,
  onSelect,
  onEdit,
  onDelete,
  pageSize = 15,
}: StockInStoreViewDrawerProps) {
  if (!isOpen || !selectedItem) return null;

  const currentUuid = uuid || selectedItem.uuid || String(selectedItem.id);

  // Left rail pagination/search function
  const fetchRailPage = async (_page: number, search: string) => {
    const term = search.toLowerCase().trim();
    const filtered = records.filter(
      (r) =>
        !term ||
        r.activityName.toLowerCase().includes(term) ||
        (r.dateFrom && r.dateFrom.includes(term))
    );
    return { items: filtered, hasMore: false };
  };

  const menu: RecordMenuItem[] = [];
  if (onDelete && selectedItem) {
    menu.push({
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDelete(selectedItem),
    });
  }

  return (
    <RecordViewDrawer<StockInStoreRecord>
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem.activityName}
      rail={{
        queryKey: `stock-in-store-${pageSize}`,
        seed: { items: records, hasMore: false },
        placeholder: 'Search Activity',
        fetchPage: fetchRailPage,
        toCard: (r) => ({
          key: r.uuid || String(r.id),
          title: r.activityName,
          subtitle: r.dateFrom ? `${r.dateFrom} - ${r.dateTo || ''}` : 'Activity',
          amount: r.items && r.items.length > 0 ? `${r.items.length} items` : null,
        }),
        selectedKey: currentUuid,
        onSelect: (r) => {
          onSelect(r.uuid || String(r.id), r);
        },
      }}
      action={
        onEdit && selectedItem
          ? {
              label: 'Edit Inventory',
              icon: SquarePen,
              onClick: () => onEdit(selectedItem),
            }
          : null
      }
      menu={menu}
      tabs={[
        {
          key: 'overview',
          label: 'Overview',
          icon: CircleUserRound,
          content: <OverviewTab selectedItem={selectedItem} />,
        },
        {
          key: 'assign',
          label: `Assign Inventory${selectedItem.items?.length ? ` (${selectedItem.items.length})` : ''}`,
          icon: Package,
          content: <AssignInventoryTab selectedItem={selectedItem} />,
        },
        {
          key: 'view-post',
          label: 'View Inventory Post',
          icon: FileText,
          content: <ViewInventoryPostTab selectedItem={selectedItem} />,
        },
        {
          key: 'damaged',
          label: 'Damaged',
          icon: AlertTriangle,
          content: <DamagedTab selectedItem={selectedItem} />,
        },
      ]}
    />
  );
}
