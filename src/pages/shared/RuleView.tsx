import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInCalendarDays, format, isValid, parseISO, startOfDay } from 'date-fns';
import { Gift, Percent, Power, PowerOff, Tag as TagIcon, Trash2, type LucideIcon } from 'lucide-react';
import { useRuleDetail } from '../../hooks/usePricingPromotionRules';
import { discountApi, pricingApi, promotionApi } from '../../api/PricingPromotionApi';
import { useAuth } from '../../context/AuthContext';
import { DIMENSION_ORDER } from '../shared/PricingPromoDiscountAdd/tabs/SelectKeyCombinationTab';
import { DIMENSION_RELATION } from '../shared/PricingPromoDiscountAdd/index';
import type { DimensionValue, PricingPromotionRule, RuleItemRow, RuleType } from '../../types/PricingPromoDiscount';
import { EntityViewDrawer } from '../shared/RecordView/EntityViewDrawer';
import type { RecordMenuItem } from '../shared/RecordView/RecordViewDrawer';
import { InfoSection, InfoSectionsSkeleton } from '../shared/RecordView/InfoSection';
import { StatusPill } from '../shared/RecordView/StatusPill';

// ─── shared helpers ──────────────────────────────────────────────────────────

const mono = 'font-[family-name:var(--font-mono-ui)] tracking-wide';

const MODULE_LABEL: Record<RuleType, string> = { pricing: 'Pricing', promotion: 'Promotion', discount: 'Discount' };
const MODULE_PATH: Record<RuleType, string> = { pricing: 'pricing', promotion: 'promotion', discount: 'discount' };
const MODULE_ICON: Record<RuleType, LucideIcon> = { pricing: TagIcon, promotion: Gift, discount: Percent };

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

// ─── validity rail ────────────────────────────────────────────────────────────

function ValidityBar({ start, end }: { start?: string | null; end?: string | null }) {
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
    live: { bar: 'bg-[var(--rv-accent)]', label: 'text-[var(--rv-accent)]' },
    scheduled: { bar: 'bg-amber-500', label: 'text-amber-600 dark:text-amber-400' },
    expired: { bar: 'bg-gray-400 dark:bg-gray-600', label: 'text-[var(--rv-muted)]' },
  }[phase];

  return (
    <div className="mt-4">
      <div className="flex justify-between text-[12px] mb-1">
        <span className={`${mono} text-[var(--rv-muted)]`}>{formatDate(start)}</span>
        <span className={`${mono} ${tone.label}`}>{caption}</span>
        <span className={`${mono} text-[var(--rv-muted)]`}>{formatDate(end)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--rv-tint)]">
        <div className={`h-full rounded-full ${tone.bar} transition-[width] duration-700`} style={{ width: `${fraction * 100}%` }} />
      </div>
    </div>
  );
}

// ─── value tag ───────────────────────────────────────────────────────────────

function ValueTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center max-w-full px-2 py-1 rounded-md border border-[var(--rv-accent-border)] bg-[var(--rv-accent-soft)] text-[var(--rv-accent)] text-xs font-medium">
      <span className="truncate">{children}</span>
    </span>
  );
}

// ─── merged tab content ───────────────────────────────────────────────────────

function RuleTab({ moduleType, data, row }: { moduleType: RuleType; data?: PricingPromotionRule | null; row?: PricingPromotionRule | null }) {
  if (!data) {
    // The list row already names the rule, its status and dates; the key combination and items wait for the full record.
    if (!row)
      return (
        <div className="mt-3">
          <InfoSectionsSkeleton titles={['Rule', 'Key Combination', MODULE_LABEL[moduleType]]} />
        </div>
      );
    return (
      <div className="mt-3 space-y-6">
        <InfoSection
          title="Rule"
          rows={[
            { label: 'Name', value: row.name },
            { label: 'Status', value: <StatusPill label={row.status ? 'Active' : 'Inactive'} tone={row.status ? 'success' : 'neutral'} /> },
            { label: 'Start Date', value: formatDate(row.startDate) },
            { label: 'End Date', value: formatDate(row.endDate) },
            ...(moduleType === 'promotion' ? [{ label: 'Offer Type', value: humanize(row.offerType) }] : []),
          ]}
        />
        <InfoSectionsSkeleton titles={['Key Combination', MODULE_LABEL[moduleType]]} />
      </div>
    );
  }

  const dimsWithValues = DIMENSION_ORDER.filter((d) => valuesFor(data, d.key).length > 0);
  const groups = ['Location', 'Customer', 'Item'] as const;

  // Collect rule overview rows
  const overviewRows = [
    { label: 'Name', value: data.name },
    { label: 'Status', value: <StatusPill label={data.status ? 'Active' : 'Inactive'} tone={data.status ? 'success' : 'neutral'} /> },
    { label: 'Start Date', value: formatDate(data.startDate) },
    { label: 'End Date', value: formatDate(data.endDate) },
    ...(moduleType === 'promotion'
      ? [
          { label: 'Offer Type', value: humanize(data.offerType) },
          { label: 'Offer Value', value: withPercent(data.offerValue, data.offerType) },
          { label: 'Buy Condition', value: data.orderItemType === 'any' ? 'Any buy item' : 'All buy items' },
          { label: 'Repeat Offer', value: data.isRepeat === false ? 'Once' : 'Every multiple' },
        ]
      : []),
    ...(moduleType === 'discount'
      ? [
          { label: 'Discount Type', value: data.discountMainType === 'normal' ? 'Normal' : 'Slab' },
          ...(data.discountMainType === 'normal'
            ? [
                { label: 'Value Type', value: humanize(data.discountType) },
                { label: 'Value', value: withPercent(data.discountValue, data.discountType) },
              ]
            : [{ label: 'Slab Based On', value: data.discountApplyOn === 'value' ? 'Value' : 'Quantity' }]),
        ]
      : []),
  ];

  // Item/slab tables
  const items = data.items ?? [];
  const slabs = data.slabs ?? [];

  return (
    <div className="mt-3 space-y-6">
      {/* ── Rule overview ── */}
      <InfoSection title="Rule" rows={overviewRows} />

      {/* ── Validity bar ── */}
      <ValidityBar start={data.startDate} end={data.endDate} />

      {/* ── Key combination ── */}
      {dimsWithValues.length > 0 ? (
        <section className="overflow-hidden rounded-[4px] border border-[var(--rv-border)]">
          <h3 className="flex h-10 items-center bg-[var(--rv-head)] px-[14px] font-semibold text-[var(--rv-text)]">Key Combination</h3>
          <div className="divide-y divide-[var(--rv-border)]">
            {groups.map((group) => {
              const withVals = DIMENSION_ORDER.filter((d) => d.group === group && valuesFor(data, d.key).length > 0);
              if (withVals.length === 0) return null;
              return (
                <div key={group} className="px-[14px] py-3">
                  <p className="text-[11px] uppercase tracking-wide text-[var(--rv-muted)] mb-2">{group}</p>
                  {withVals.map((d) => {
                    const vals = valuesFor(data, d.key);
                    return (
                      <div key={d.key} className="mb-2 last:mb-0">
                        <p className="text-[13px] text-[var(--rv-secondary)] mb-1">{d.label}</p>
                        <div className="flex flex-wrap gap-1">
                          {vals.map((v) => (
                            <ValueTag key={v.id}>{v.name ?? v.id}</ValueTag>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <InfoSection title="Key Combination">
          <p className="px-[14px] py-4 text-[var(--rv-muted)]">No key combination — this rule applies to all customers and items.</p>
        </InfoSection>
      )}

      {/* ── Module tab (items / slabs) ── */}
      {moduleType === 'pricing' && items.length > 0 && <ItemsSection title="Priced Items" items={items} />}

      {moduleType === 'promotion' && (
        <>
          <ItemsSection title="Order Items" items={items.filter((r) => r.rowType === 'order')} />
          <ItemsSection title="Offer Items" items={items.filter((r) => r.rowType === 'offer')} />
          {slabs.length > 0 && (
            <InfoSection title={`Free-goods Slabs (${slabs.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[var(--rv-border)]">
                      {['Min Qty', 'Max Qty', 'Free Qty'].map((h) => (
                        <th key={h} className="px-[14px] py-2 text-left text-[var(--rv-muted)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--rv-border)]">
                    {slabs.map((s) => (
                      <tr key={s.id}>
                        <td className="px-[14px] py-2">{s.minSlab}</td>
                        <td className="px-[14px] py-2">{s.maxSlab}</td>
                        <td className="px-[14px] py-2">{formatAmount(s.value, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </InfoSection>
          )}
        </>
      )}

      {moduleType === 'discount' && data.discountMainType !== 'normal' && slabs.length > 0 && (
        <InfoSection title={`Discount Slabs (${slabs.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--rv-border)]">
                  {['Min', 'Max', 'Value', 'Percentage'].map((h) => (
                    <th key={h} className="px-[14px] py-2 text-left text-[var(--rv-muted)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rv-border)]">
                {slabs.map((s) => (
                  <tr key={s.id}>
                    <td className="px-[14px] py-2">{s.minSlab}</td>
                    <td className="px-[14px] py-2">{s.maxSlab}</td>
                    <td className="px-[14px] py-2">{formatAmount(s.value, 2)}</td>
                    <td className="px-[14px] py-2">{s.percentage ? `${s.percentage}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoSection>
      )}
    </div>
  );
}

function ItemsSection({ title, items }: { title: string; items: RuleItemRow[] }) {
  const hasQty = items.some((r) => r.quantity !== undefined && r.quantity !== null && r.quantity !== '');
  const hasPrice = items.some((r) => r.price !== undefined && r.price !== null && r.price !== '');
  return (
    <InfoSection title={`${title} (${items.length})`}>
      {items.length === 0 ? (
        <p className="px-[14px] py-4 text-[var(--rv-muted)]">No items added.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--rv-border)]">
                <th className="px-[14px] py-2 text-left text-[var(--rv-muted)]">Item</th>
                <th className="px-[14px] py-2 text-left text-[var(--rv-muted)]">UOM</th>
                {hasQty && <th className="px-[14px] py-2 text-right text-[var(--rv-muted)]">Qty</th>}
                {hasPrice && <th className="px-[14px] py-2 text-right text-[var(--rv-muted)]">Price</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rv-border)]">
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="px-[14px] py-2 font-medium text-[var(--rv-ink)]">{r.itemName ?? r.itemId}</td>
                  <td className="px-[14px] py-2 text-[var(--rv-secondary)]">{r.uomName ?? '—'}</td>
                  {hasQty && <td className="px-[14px] py-2 text-right tabular-nums">{formatAmount(r.quantity)}</td>}
                  {hasPrice && <td className="px-[14px] py-2 text-right tabular-nums">{formatAmount(r.price, 2)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </InfoSection>
  );
}

// ─── per-module view components ──────────────────────────────────────────────

const RULE_API = { pricing: pricingApi, promotion: promotionApi, discount: discountApi };

type BulkAction = 'activate' | 'deactivate' | 'delete';

interface RuleViewProps {
  isOpen: boolean;
  onClose: () => void;
  /** uuid of the rule currently selected in the list */
  uuid: string | null;
  /** The list row on screen: names the rule at once while the full record loads. */
  row?: PricingPromotionRule | null;
  /** Called when user picks a different rule in the rail */
  onSelect: (uuid: string, row: PricingPromotionRule) => void;
  /** Activate / deactivate / delete the open rule (the list owns the mutation and its confirmation). */
  onBulkAction?: (action: BulkAction) => void;
  /** The page's own first page of rules, reused as the left list's first page (no request); `pageSize` is that page's size, which the left list keeps for later pages. */
  seed?: { items: PricingPromotionRule[]; hasMore: boolean } | null;
  pageSize?: number;
}

function RuleView({ moduleType, isOpen, onClose, uuid, row, onSelect, onBulkAction, seed, pageSize = 20 }: { moduleType: RuleType } & RuleViewProps) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const Icon = MODULE_ICON[moduleType];
  const query = useRuleDetail(moduleType, uuid);
  const data = uuid ? (query.data ?? null) : null;
  const module = MODULE_PATH[moduleType];
  const can = (action: 'edit' | 'delete') => hasPermission(`${module}.${action}`);
  const actions: RecordMenuItem[] =
    !data || !onBulkAction
      ? []
      : [
          ...(can('edit')
            ? [data.status ? { label: 'Deactivate', icon: PowerOff, onClick: () => onBulkAction('deactivate') } : { label: 'Activate', icon: Power, onClick: () => onBulkAction('activate') }]
            : []),
          ...(can('delete') ? [{ label: 'Delete', icon: Trash2, onClick: () => onBulkAction('delete') }] : []),
        ];

  return (
    <EntityViewDrawer<PricingPromotionRule>
      isOpen={isOpen && Boolean(uuid)}
      onClose={onClose}
      title={data?.name ?? row?.name ?? null}
      rail={{
        queryKey: `${moduleType}-rule-${pageSize}`,
        seed,
        placeholder: `Search ${MODULE_LABEL[moduleType]}`,
        fetchPage: async (page, search) => {
          const res = await RULE_API[moduleType].getList(page, search || undefined, pageSize);
          return { items: res.data, hasMore: res.currentPage < res.lastPage };
        },
        toCard: (r) => ({ key: r.uuid ?? '', title: r.name, subtitle: r.status ? 'Active' : 'Inactive', amount: null }),
        selectedKey: uuid,
        onSelect: (r) => {
          if (r.uuid) onSelect(r.uuid, r);
        },
      }}
      onEdit={() => navigate(`/${module}/edit/${uuid}`)}
      editPermission={`${module}.edit`}
      menu={actions}
      tabs={[{ key: 'rule', label: MODULE_LABEL[moduleType], icon: Icon, content: <RuleTab moduleType={moduleType} data={query.isPending ? undefined : data} row={row} /> }]}
    />
  );
}

export function PricingView(props: RuleViewProps) {
  return <RuleView moduleType="pricing" {...props} />;
}
export function PromotionView(props: RuleViewProps) {
  return <RuleView moduleType="promotion" {...props} />;
}
export function DiscountView(props: RuleViewProps) {
  return <RuleView moduleType="discount" {...props} />;
}
