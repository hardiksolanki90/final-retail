import type { ReactNode } from 'react';
import { Info, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRecordDetail } from '../../hooks/useRecordDetail';
import { readPath } from '../../utils/readPath';
import { EntityViewDrawer } from './RecordView/EntityViewDrawer';
import { InfoSection, InfoSectionsSkeleton, type InfoRow } from './RecordView/InfoSection';
import { StatusPill } from './RecordView/StatusPill';

/** Records the left list loads per scroll when the page doesn't say. */
export const SETTING_PAGE_SIZE = 20;

/** A master-data row as the list endpoint sends it (names and codes, plus nested {name} objects). */
export type SettingRow = { uuid?: string; id?: string | number } & Record<string, unknown>;

export interface SettingField {
  label: string;
  /** Key of the value, or the first of several that holds one; dots reach into nested objects ("area.name"). */
  path: string | string[];
  /** status: Active / Inactive pill; bool: Yes / No; map: shows the label for a coded value. */
  kind?: 'text' | 'bool' | 'status' | 'map' | 'list';
  map?: Record<string, string>;
  /** list: a list of strings, or of objects whose text is at this path (first filled one wins). */
  itemPath?: string | string[];
}

export interface SettingViewConfig {
  /** "Brand", "Area" … — names the search box. */
  title: string;
  /** Cache key for this screen's list and details. */
  queryKey: string;
  /** Permission needed to edit, e.g. "brand.edit". */
  editPermission: string;
  fetchPage: (page: number, search: string, perPage: number) => Promise<{ items: SettingRow[]; hasMore: boolean }>;
  /** Where the record's name (header and list card) and code (card subtitle, "code - name" header) live. */
  name: string[];
  code?: string[];
  /** Fetches fields the list row doesn't carry (description, logo …); the row's own values show until it arrives. */
  getDetails?: (uuid: string) => Promise<object>;
  sections: { title: string; fields: SettingField[] }[];
}

const read = readPath;
const filled = (value: unknown) => value !== undefined && value !== null && value !== '';
/** A path with spaces joins several values ("firstname lastname"); otherwise the first filled path wins. */
const first = (source: unknown, paths: string[] | string): unknown =>
  (Array.isArray(paths) ? paths : [paths])
    .map((p) => (p.includes(' ') ? p.split(' ').map((part) => read(source, part)).filter(filled).join(' ') : read(source, p)))
    .find(filled);

const toRow = (record: SettingRow, field: SettingField): InfoRow => {
  const value = first(record, field.path);
  if (field.kind === 'status') return { label: field.label, value: filled(value) ? <StatusPill label={value ? 'Active' : 'Inactive'} tone={value ? 'success' : 'neutral'} /> : null };
  if (field.kind === 'bool') return { label: field.label, value: filled(value) ? (value ? 'Yes' : 'No') : null };
  if (field.kind === 'list') {
    const lines = (Array.isArray(value) ? value : []).map((item) => String(typeof item === 'object' && item !== null ? (first(item, field.itemPath ?? 'name') ?? '') : item)).filter(Boolean);
    return { label: field.label, value: lines.length > 0 ? <ul className="list-disc space-y-0.5 pl-4">{lines.map((line, i) => <li key={`${i}:${line}`}>{line}</li>)}</ul> : null };
  }
  if (field.kind === 'map') return { label: field.label, value: filled(value) ? (field.map?.[String(value)] ?? String(value)) : null };
  return { label: field.label, value: filled(value) ? String(value) : null };
};

const text = (row: SettingRow | null, paths: string[]) => (row ? first(row, paths) : undefined);
const label = (row: SettingRow | null, paths?: string[]) => (paths ? String(text(row, paths) ?? '') : '');

/** A tab after Details for one screen (a warehouse's stock): `render` gets the record shown. */
export interface SettingExtraTab {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Hide the tab for users who lack this permission. */
  permission?: string;
  render: (record: SettingRow) => ReactNode;
}

interface SettingViewDrawerProps {
  config: SettingViewConfig;
  isOpen: boolean;
  onClose: () => void;
  /** The list row on screen; null while nothing is selected. */
  data: SettingRow | null;
  /** Another record picked in the left list. */
  onSelect: (row: SettingRow) => void;
  onEdit?: () => void;
  /** The page's own first page of rows, reused as the left list's first page (no request); `pageSize` is that page's size, which the left list keeps for later pages. */
  seed?: { items: SettingRow[]; hasMore: boolean } | null;
  pageSize?: number;
  extraTabs?: SettingExtraTab[];
}

/** View for a Settings master record (brand, area, route …): every record on the left, a Details tab on the right. One config per screen. */
export function SettingViewDrawer({ config, isOpen, onClose, data, onSelect, onEdit, seed, pageSize = SETTING_PAGE_SIZE, extraTabs = [] }: SettingViewDrawerProps) {
  const { hasPermission } = useAuth();
  const uuid = data?.uuid;
  const { record } = useRecordDetail({ entity: config.queryKey, uuid, row: data, fetcher: config.getDetails, shown: config.sections.flatMap((section) => section.fields.map((f) => f.path)) }) as { record: SettingRow | null };
  const name = label(record, config.name);
  const code = label(record, config.code);
  const title = record ? [code, name].filter(Boolean).join(' - ') || config.title : null;

  const content = !record ? (
    <InfoSectionsSkeleton titles={config.sections.map((s) => s.title)} />
  ) : (
    <div className="mt-3 space-y-4">
      {config.sections.map((section) => (
        <InfoSection key={section.title} title={section.title} rows={section.fields.map((f) => toRow(record, f))} />
      ))}
    </div>
  );

  return (
    <EntityViewDrawer<SettingRow>
      isOpen={isOpen && Boolean(data)}
      onClose={onClose}
      title={title}
      rail={{
        queryKey: `setting-${config.queryKey}-${pageSize}`,
        seed,
        placeholder: `Search ${config.title}`,
        fetchPage: (page, search) => config.fetchPage(page, search, pageSize),
        toCard: (row) => ({ key: String(row.uuid ?? row.id ?? ''), title: label(row, config.name) || config.title, subtitle: label(row, config.code) || null }),
        selectedKey: uuid ?? (data?.id !== undefined ? String(data.id) : null),
        onSelect,
      }}
      onEdit={onEdit}
      editPermission={config.editPermission}
      tabs={[{ key: 'details', label: 'Details', icon: Info, content }, ...extraTabs.filter((tab) => record && (!tab.permission || hasPermission(tab.permission))).map((tab) => ({ key: tab.key, label: tab.label, icon: tab.icon, content: record ? tab.render(record) : null }))]}
    />
  );
}
