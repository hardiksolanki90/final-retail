import { SquarePen } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { RecordViewDrawer, type RecordAction, type RecordMenuItem, type RecordTab } from './RecordViewDrawer';
import type { RecordRailProps } from './RecordRail';

interface EntityViewDrawerProps<T> {
  isOpen: boolean;
  onClose: () => void;
  /** Record name in the header; a skeleton stands in while it's null. */
  title?: string | null;
  rail: RecordRailProps<T>;
  tabs: RecordTab[];
  /** Opens the record's editor; shown as Edit in the kebab menu when the user holds `editPermission` (or none is required). */
  onEdit?: () => void;
  editPermission?: string;
  /** Other kebab items, after Edit. */
  menu?: RecordMenuItem[];
  action?: RecordAction | null;
}

/** The record view (left list, header, tabs) for a master record such as an item, salesman or journey plan, with the standard Edit menu. */
export function EntityViewDrawer<T>({ onEdit, editPermission, menu = [], ...rest }: EntityViewDrawerProps<T>) {
  const { hasPermission } = useAuth();
  const canEdit = Boolean(onEdit && rest.title && (!editPermission || hasPermission(editPermission)));
  const items: RecordMenuItem[] = canEdit && onEdit ? [{ label: 'Edit', icon: SquarePen, onClick: onEdit }, ...menu] : menu;
  return <RecordViewDrawer<T> {...rest} menu={items} />;
}
