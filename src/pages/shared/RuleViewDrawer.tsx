import { useState, useRef, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInCalendarDays, format, isValid, parseISO, startOfDay } from 'date-fns';
import { Ban, ChevronDown, CircleCheck, Gift, Inbox, MoreHorizontal, Pencil, Percent, Tag as TagIcon, Trash2, type LucideIcon } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Skeleton, SkeletonRegion } from '../../components/ui/skeleton';
import { DIMENSION_ORDER } from './PricingPromoDiscountAdd/tabs/SelectKeyCombinationTab';
import { DIMENSION_RELATION } from './PricingPromoDiscountAdd/index';
import type { DimensionValue, PricingPromotionRule, RuleItemRow, RuleType } from '../../types/PricingPromoDiscount';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  moduleType: RuleType;
  data: PricingPromotionRule | null;
  isLoading?: boolean;
  onBulkAction?: (action: 'activate' | 'deactivate' | 'delete') => void;
}

type TabId = 'overview' | 'keyValue' | 'module';

// Same "ledger" type pairing as the Add wizard (Space Grotesk display +
// IBM Plex Mono micro-labels) so a rule reads the same whether it's being
// built or viewed.
const mono = 'font-[family-name:var(--font-mono-ui)] tracking-wide';
const eyebrowCls = `text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] ${mono}`;
const sectionLabelCls = `text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] ${mono}`;
const cardCls = 'rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]';
const actionBtnCls =
  'inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--border-color)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-colors cursor-pointer';

const MODULE_LABEL: Record<RuleType, string> = { pricing: 'Pricing', promotion: 'Promotion', discount: 'Discount' };
const MODULE_PATH: Record<RuleType, string> = { pricing: 'pricing', promotion: 'promotion', discount: 'discount' };
const MODULE_ICON: Record<RuleType, LucideIcon> = { pricing: TagIcon, promotion: Gift, discount: Percent };

// ── Formatting (display only) ─────────────────────────────────────────────────

function humanize(value?: string | null): string {
  if (!value) return '—';
  const text = value.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatAmount(value: unknown, decimals?: number): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return decimals === undefined ? String(n) : n.toFixed(decimals);
}

function withPercent(value: unknown, type?: string | null): string {
  const formatted = formatAmount(value, type === 'percentage' ? undefined : 2);
  return formatted !== '—' && type === 'percentage' ? `${formatted}%` : formatted;
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function formatDate(value?: string | null): string {
  const date = toDate(value);
  return date ? format(date, 'dd MMM yyyy') : value || '—';
}

function valuesFor(data: PricingPromotionRule, key: (typeof DIMENSION_ORDER)[number]['key']): DimensionValue[] {
  return (data[DIMENSION_RELATION[key]] as DimensionValue[] | undefined) ?? [];
}

// ── Drawer ───────────────────────────────────────────────────────────────────

export function RuleViewDrawer({ isOpen, onClose, moduleType, data, isLoading, onBulkAction }: Props) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setActiveTab('overview');
  }, [isOpen, data?.uuid]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setIsMoreOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoading && !data) return null;

  const runAction = (action: 'activate' | 'deactivate' | 'delete') => {
    setIsMoreOpen(false);
    onBulkAction?.(action);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isLoading ? 'Loading…' : (data?.name ?? '')}
      width="w-full sm:w-[92%] lg:w-[80%] xl:w-[70%] max-w-6xl"
      headerActions={
        data ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate(`/${MODULE_PATH[moduleType]}/edit/${data.uuid}`)} className={actionBtnCls} title="Edit" aria-label="Edit rule">
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            {onBulkAction && (
              <div className="relative" ref={moreRef}>
                <button type="button" onClick={() => setIsMoreOpen((prev) => !prev)} className={actionBtnCls} aria-haspopup="menu" aria-expanded={isMoreOpen} aria-label="More actions">
                  <MoreHorizontal className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">More</span>
                  <ChevronDown className={`hidden sm:block w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMoreOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-44 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg z-20">
                    <MenuItem icon={CircleCheck} label="Activate" onClick={() => runAction('activate')} />
                    <MenuItem icon={Ban} label="Deactivate" onClick={() => runAction('deactivate')} />
                    <div className="my-1 border-t border-[var(--border-color)]" />
                    <MenuItem icon={Trash2} label="Delete" onClick={() => runAction('delete')} danger />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : undefined
      }
    >
      {isLoading || !data ? (
        <DrawerSkeleton label={`Loading ${MODULE_LABEL[moduleType].toLowerCase()} details`} />
      ) : (
        <RuleDetail moduleType={moduleType} data={data} activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </Drawer>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors cursor-pointer ${
        danger ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </button>
  );
}

// ── Body ─────────────────────────────────────────────────────────────────────

function RuleDetail({ moduleType, data, activeTab, onTabChange }: { moduleType: RuleType; data: PricingPromotionRule; activeTab: TabId; onTabChange: (tab: TabId) => void }) {
  const dimsWithValues = DIMENSION_ORDER.filter((d) => valuesFor(data, d.key).length > 0);
  const moduleCount = moduleType === 'discount' ? (data.discountMainType === 'normal' ? undefined : (data.slabs ?? []).length) : (data.items ?? []).length;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'keyValue', label: 'Key Value', count: dimsWithValues.length },
    { id: 'module', label: MODULE_LABEL[moduleType], count: moduleCount },
  ];

  return (
    <div className="min-h-full bg-[var(--bg-primary)]">
      <RuleSummary moduleType={moduleType} data={data} keyLabels={dimsWithValues.map((d) => d.label)} />

      <nav
        role="tablist"
        aria-label="Rule sections"
        className="sticky top-0 z-10 px-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg-card)]/85"
      >
        <div className="flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-3.5 -mb-px border-b-2 whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-[var(--text-primary)] ${
                  isActive ? 'border-primary-600 text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
                }`}
              >
                <span className={`text-[10px] ${mono} ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-[var(--text-muted)]'}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`min-w-5 px-1.5 py-0.5 rounded-md text-[10px] leading-none text-center ${mono} ${
                      isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="px-6 py-6 lg:py-8">
        {activeTab === 'overview' && <OverviewTab moduleType={moduleType} data={data} />}
        {activeTab === 'keyValue' && <KeyValueReadOnlyTab data={data} />}
        {activeTab === 'module' && <ModuleTab moduleType={moduleType} data={data} />}
      </div>
    </div>
  );
}

function RuleSummary({ moduleType, data, keyLabels }: { moduleType: RuleType; data: PricingPromotionRule; keyLabels: string[] }) {
  const Icon = MODULE_ICON[moduleType];

  return (
    <section className="px-6 pt-5 pb-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 pr-1">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
            <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
          </span>
          <span className={eyebrowCls}>{MODULE_LABEL[moduleType]} rule</span>
        </span>
        <StatusChip active={Boolean(data.status)} />
        {keyLabels.length > 0 && (
          <span
            className={`inline-flex items-center gap-1.5 max-w-full px-2.5 py-1 rounded-full text-[11px] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] ${mono}`}
            title={keyLabels.join(', ')}
          >
            KEY <span className="truncate text-primary-600 dark:text-primary-400">{keyLabels.join(', ')}</span>
          </span>
        )}
      </div>

      <ValidityRail start={data.startDate} end={data.endDate} />
    </section>
  );
}

function StatusChip({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
        active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

/**
 * Start → end window with today's position on it — tells at a glance whether
 * the rule is live, not started yet, or already over.
 */
function ValidityRail({ start, end }: { start?: string | null; end?: string | null }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return null;

  const today = startOfDay(new Date());
  const span = differenceInCalendarDays(endDate, startDate);
  const elapsed = differenceInCalendarDays(today, startDate);
  const fraction = Math.min(1, Math.max(0, span > 0 ? elapsed / span : elapsed >= 0 ? 1 : 0));
  const phase = today < startDate ? 'scheduled' : today > endDate ? 'expired' : 'live';

  const days = (n: number) => `${n} day${n === 1 ? '' : 's'}`;
  const caption = {
    live: (() => {
      const left = differenceInCalendarDays(endDate, today);
      return left === 0 ? 'Live · ends today' : `Live · ${days(left)} left`;
    })(),
    scheduled: `Scheduled · starts in ${days(differenceInCalendarDays(startDate, today))}`,
    expired: `Expired · ended ${days(differenceInCalendarDays(today, endDate))} ago`,
  }[phase];

  const tone = {
    live: { text: 'text-primary-600 dark:text-primary-400', fill: 'bg-primary-600' },
    scheduled: { text: 'text-amber-600 dark:text-amber-400', fill: 'bg-amber-500' },
    expired: { text: 'text-[var(--text-muted)]', fill: 'bg-gray-400 dark:bg-gray-600' },
  }[phase];

  const percent = `${(drawn ? fraction : 0) * 100}%`;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-2.5">
        <span className={eyebrowCls}>Validity</span>
        <span className={`text-[11px] uppercase tracking-[0.14em] ${mono} ${tone.text}`}>{caption}</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-[var(--bg-tertiary)]" role="img" aria-label={`Valid ${formatDate(start)} to ${formatDate(end)}. ${caption}`}>
        <div className={`absolute inset-y-0 left-0 rounded-full ${tone.fill} transition-[width] duration-700 ease-out motion-reduce:transition-none`} style={{ width: percent }} />
        {phase === 'live' && (
          <span
            className="absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-600 ring-4 ring-primary-100 dark:ring-primary-900/50 transition-[left] duration-700 ease-out motion-reduce:transition-none"
            style={{ left: percent }}
          />
        )}
      </div>
      <div className={`mt-2 flex justify-between gap-4 text-[11px] text-[var(--text-secondary)] ${mono}`}>
        <span>{formatDate(start)}</span>
        <span>{formatDate(end)}</span>
      </div>
    </div>
  );
}

// ── Building blocks ──────────────────────────────────────────────────────────

function SectionTitle({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h3 className={`flex items-center gap-2 mb-3 ${sectionLabelCls}`}>
      {children}
      {count !== undefined && <span className="text-[var(--text-secondary)]">· {count}</span>}
    </h3>
  );
}

function LedgerGrid({ children }: { children: ReactNode }) {
  // gap-px over a border-coloured backdrop draws hairline dividers between
  // cells at any column count.
  return <dl className="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--border-color)]">{children}</dl>;
}

function LedgerCell({ label, children, wide, numeric }: { label: string; children: ReactNode; wide?: boolean; numeric?: boolean }) {
  return (
    <div className={`bg-[var(--bg-card)] px-5 py-4 min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
      <dt className={`text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] ${mono}`}>{label}</dt>
      <dd className={`mt-1.5 text-sm text-[var(--text-primary)] break-words ${numeric ? `tabular-nums ${mono}` : ''}`}>{children}</dd>
    </div>
  );
}

function EmptyState({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className={`${cardCls} px-6 py-14 flex flex-col items-center justify-center gap-3 text-center`}>
      <div className="flex items-center justify-center w-11 h-11 rounded-lg border border-dashed border-[var(--border-color)] text-[var(--text-muted)]">
        <Inbox className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
        {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      </div>
    </div>
  );
}

interface LedgerColumn {
  key: string;
  label: string;
  numeric?: boolean;
}

interface LedgerRow {
  id: string;
  cells: Record<string, ReactNode>;
}

/**
 * Table from md up; stacked cards below it. A non-numeric first column becomes
 * the card title, everything else a label/value pair.
 */
function LedgerTable({ columns, rows, emptyLabel }: { columns: LedgerColumn[]; rows: LedgerRow[]; emptyLabel: string }) {
  if (rows.length === 0) return <EmptyState label={emptyLabel} />;

  const [first, ...rest] = columns;
  const titled = !first.numeric;
  const cardColumns = titled ? rest : columns;

  return (
    <div className={`${cardCls} overflow-hidden`}>
      <table className="hidden md:table w-full text-sm">
        <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-5 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)] ${mono} ${column.numeric ? 'text-right' : 'text-left'}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-[var(--bg-secondary)]/60 transition-colors">
              {columns.map((column, index) => (
                <td
                  key={column.key}
                  className={`px-5 py-3.5 ${
                    column.numeric ? `text-right tabular-nums ${mono} text-[var(--text-primary)]` : ''
                  } ${index === 0 && !column.numeric ? 'font-medium text-[var(--text-primary)]' : ''} ${index !== 0 && !column.numeric ? 'text-[var(--text-secondary)]' : ''}`}
                >
                  {row.cells[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="md:hidden divide-y divide-[var(--border-color)]">
        {rows.map((row) => (
          <li key={row.id} className="px-4 py-3.5">
            {titled && <p className="text-sm font-medium text-[var(--text-primary)] break-words">{row.cells[first.key]}</p>}
            <dl className={`grid grid-cols-2 gap-x-4 gap-y-2 ${titled ? 'mt-2.5' : ''}`}>
              {cardColumns.map((column) => (
                <div key={column.key} className="min-w-0">
                  <dt className={`text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] ${mono}`}>{column.label}</dt>
                  <dd className={`mt-0.5 text-sm text-[var(--text-primary)] truncate ${column.numeric ? `tabular-nums ${mono}` : ''}`}>{row.cells[column.key]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DrawerSkeleton({ label }: { label: string }) {
  return (
    <SkeletonRegion label={label} className="min-h-full bg-[var(--bg-primary)]">
      <div className="px-6 pt-5 pb-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] space-y-5">
        <div className="flex gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--border-color)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] px-5 py-4 space-y-2.5">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </SkeletonRegion>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────

function OverviewTab({ moduleType, data }: { moduleType: RuleType; data: PricingPromotionRule }) {
  return (
    <div className="space-y-8 max-w-4xl">
      <section>
        <SectionTitle>Rule</SectionTitle>
        <LedgerGrid>
          <LedgerCell label="Name">{data.name}</LedgerCell>
          <LedgerCell label="Status">
            <StatusChip active={Boolean(data.status)} />
          </LedgerCell>
          <LedgerCell label="Start Date" numeric>
            {formatDate(data.startDate)}
          </LedgerCell>
          <LedgerCell label="End Date" numeric>
            {formatDate(data.endDate)}
          </LedgerCell>
        </LedgerGrid>
      </section>

      {moduleType === 'promotion' && (
        <section>
          <SectionTitle>Offer</SectionTitle>
          <LedgerGrid>
            <LedgerCell label="Offer Type">{humanize(data.offerType)}</LedgerCell>
            <LedgerCell label="Offer Value" numeric>
              {withPercent(data.offerValue, data.offerType)}
            </LedgerCell>
            <LedgerCell label="Buy Condition">{data.orderItemType === 'any' ? 'Any buy item' : 'All buy items'}</LedgerCell>
            <LedgerCell label="Repeat Offer">{data.isRepeat === false ? 'Once' : 'Every multiple'}</LedgerCell>
          </LedgerGrid>
        </section>
      )}

      {moduleType === 'discount' && (
        <section>
          <SectionTitle>Discount</SectionTitle>
          <LedgerGrid>
            <LedgerCell label="Type" wide={data.discountMainType === 'normal'}>
              {data.discountMainType === 'normal' ? 'Normal' : 'Slab'}
            </LedgerCell>
            {data.discountMainType !== 'normal' && <LedgerCell label="Slab Based On">{data.discountApplyOn === 'value' ? 'Value' : 'Quantity'}</LedgerCell>}
            {data.discountMainType === 'normal' && (
              <>
                <LedgerCell label="Discount Type">{humanize(data.discountType)}</LedgerCell>
                <LedgerCell label="Value" numeric>
                  {withPercent(data.discountValue, data.discountType)}
                </LedgerCell>
              </>
            )}
          </LedgerGrid>
        </section>
      )}
    </div>
  );
}

function KeyValueReadOnlyTab({ data }: { data: PricingPromotionRule }) {
  const groups = ['Location', 'Customer', 'Item'] as const;
  const anySelected = DIMENSION_ORDER.some((d) => valuesFor(data, d.key).length > 0);

  if (!anySelected) {
    return <EmptyState label="No key combination selected" hint="This rule isn't scoped to any location, customer or item." />;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {groups.map((group) => {
        const withValues = DIMENSION_ORDER.filter((d) => d.group === group && valuesFor(data, d.key).length > 0);
        if (withValues.length === 0) return null;

        return (
          <section key={group}>
            <SectionTitle count={withValues.length}>{group}</SectionTitle>
            <div className={`${cardCls} divide-y divide-[var(--border-color)]`}>
              {withValues.map((d) => {
                const values = valuesFor(data, d.key);
                return (
                  <div key={d.key} className="grid gap-2.5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6 px-5 py-4">
                    <div className="flex items-center gap-2 sm:items-start sm:pt-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{d.label}</span>
                      <span className={`text-[10px] text-[var(--text-muted)] ${mono}`}>{values.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {values.map((v) => (
                        <ValueTag key={v.id}>{v.name ?? v.id}</ValueTag>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ValueTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center max-w-full px-2 py-1 rounded-md border border-primary-100 dark:border-primary-800/60 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-medium">
      <span className="truncate">{children}</span>
    </span>
  );
}

function ItemTable({ rows, emptyLabel }: { rows: RuleItemRow[]; emptyLabel: string }) {
  const hasQuantity = rows.some((r) => r.quantity !== undefined && r.quantity !== null && r.quantity !== '');
  const hasPrice = rows.some((r) => r.price !== undefined && r.price !== null && r.price !== '');

  const columns: LedgerColumn[] = [
    { key: 'item', label: 'Item' },
    { key: 'uom', label: 'UOM' },
    ...(hasQuantity ? [{ key: 'quantity', label: 'Qty', numeric: true }] : []),
    ...(hasPrice ? [{ key: 'price', label: 'Price', numeric: true }] : []),
  ];

  return (
    <LedgerTable
      columns={columns}
      emptyLabel={emptyLabel}
      rows={rows.map((row) => ({ id: row.id, cells: { item: row.itemName ?? row.itemId, uom: row.uomName ?? '—', quantity: formatAmount(row.quantity), price: formatAmount(row.price, 2) } }))}
    />
  );
}

function ModuleTab({ moduleType, data }: { moduleType: RuleType; data: PricingPromotionRule }) {
  if (moduleType === 'discount') {
    if (data.discountMainType === 'normal') {
      return (
        <div className="max-w-4xl">
          <SectionTitle>Normal discount</SectionTitle>
          <LedgerGrid>
            <LedgerCell label="Discount Type">{humanize(data.discountType)}</LedgerCell>
            <LedgerCell label="Value" numeric>
              {withPercent(data.discountValue, data.discountType)}
            </LedgerCell>
          </LedgerGrid>
        </div>
      );
    }

    const slabs = data.slabs ?? [];
    return (
      <div className="max-w-5xl">
        <SectionTitle count={slabs.length}>Discount slabs</SectionTitle>
        <LedgerTable
          emptyLabel="No slabs added"
          columns={[
            { key: 'min', label: 'Min Qty', numeric: true },
            { key: 'max', label: 'Max Qty', numeric: true },
            { key: 'value', label: 'Value', numeric: true },
            { key: 'percentage', label: 'Percentage', numeric: true },
          ]}
          rows={slabs.map((s) => ({
            id: s.id,
            cells: {
              min: formatAmount(s.minSlab),
              max: formatAmount(s.maxSlab),
              value: formatAmount(s.value, 2),
              percentage: s.percentage !== '' && s.percentage != null ? `${formatAmount(s.percentage)}%` : '—',
            },
          }))}
        />
      </div>
    );
  }

  const items = data.items ?? [];

  if (moduleType === 'promotion') {
    const orderRows = items.filter((r) => r.rowType === 'order');
    const offerRows = items.filter((r) => r.rowType === 'offer');
    return (
      <div className="space-y-8 max-w-5xl">
        <section>
          <SectionTitle count={orderRows.length}>Order items</SectionTitle>
          <ItemTable rows={orderRows} emptyLabel="No items added" />
        </section>
        <section>
          <SectionTitle count={offerRows.length}>Offer items</SectionTitle>
          <ItemTable rows={offerRows} emptyLabel="No items added" />
        </section>
        {(data.slabs ?? []).length > 0 && (
          <section>
            <SectionTitle count={data.slabs!.length}>Free-goods slabs</SectionTitle>
            <LedgerTable
              emptyLabel="No slabs added"
              columns={[
                { key: 'min', label: 'Min Qty', numeric: true },
                { key: 'max', label: 'Max Qty', numeric: true },
                { key: 'free', label: 'Free Qty (per offer item)', numeric: true },
              ]}
              rows={data.slabs!.map((s) => ({ id: s.id, cells: { min: formatAmount(s.minSlab), max: formatAmount(s.maxSlab), free: formatAmount(s.value, 2) } }))}
            />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <SectionTitle count={items.length}>Priced items</SectionTitle>
      <ItemTable rows={items} emptyLabel="No items added" />
    </div>
  );
}
