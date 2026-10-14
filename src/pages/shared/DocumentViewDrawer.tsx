import { useState } from 'react';
import { FileDown, Package, Printer, SquarePen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../lib/toast';
import { downloadSheetPdf, printSheetPdf } from '../../utils/documentPdf';
import { useMoney } from '../../hooks/Currency/useMoney';
import type { DocumentSheet, SheetLine } from '../../types/DocumentView';
import { RecordViewDrawer, type RecordMenuItem } from './RecordView/RecordViewDrawer';
import type { RecordRailProps } from './RecordView/RecordRail';
import { RecordTable, type RecordColumn } from './RecordView/RecordTable';
import { InfoSection, InfoSectionsSkeleton, type InfoRow } from './RecordView/InfoSection';
import { StatusPill } from './RecordView/StatusPill';

interface DocumentViewDrawerProps<T> {
  isOpen: boolean;
  onClose: () => void;
  /** Document kind, e.g. "Order" — names the left list's search box. */
  title: string;
  sheet?: DocumentSheet;
  isLoading?: boolean;
  /** Opens the editor for this document; the kebab's Edit shows only while the document is still pending and the user may edit. */
  onEdit?: () => void;
  /** Permission needed to edit, e.g. "order.edit". */
  editPermission?: string;
  /** The left list: every document of this kind, searchable; picking one shows it here. */
  rail: RecordRailProps<T>;
  /** The opened document's number as the list row shows it: the header names the document at once while the full document loads. */
  number?: string | null;
  /** More kebab-menu entries, listed below Edit (e.g. "Convert to Delivery"). */
  menuExtra?: RecordMenuItem[];
}

/** "Salesman · Florida Beatty" → Salesman / Florida Beatty; "No salesman" → Salesman / empty. */
const metaRow = (text: string): InfoRow => {
  const [label, ...rest] = text.split(' · ');
  if (rest.length > 0) return { label, value: rest.join(' · ') };
  return text.startsWith('No ') ? { label: text.charAt(3).toUpperCase() + text.slice(4), value: null } : { label: text, value: null };
};

/** The document's one tab: badges, dates, party, details and notes first, then its items and totals. */
function ItemsTab({ sheet }: { sheet?: DocumentSheet }) {
  const { digits, code } = useMoney();
  const amount = (value?: number) => (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const priced = Boolean(sheet?.lines.some((l) => l.price !== undefined));
  const qty = (value?: number) => (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const columns: RecordColumn<SheetLine & { index: number }>[] = sheet?.lineColumns === 'load'
    ? [
        { key: 'index', label: '#', width: 'w-14', render: (l) => <span className="text-[var(--rv-muted)] tabular-nums">{l.index + 1}</span> },
        { key: 'code', label: 'Item Code', render: (l) => l.code ?? '—' },
        { key: 'name', label: 'Name', render: (l) => l.name ?? 'Unknown item' },
        { key: 'uom', label: 'UOM', render: (l) => l.uom ?? '—' },
        { key: 'approved', label: 'Approved Quantity', align: 'right', render: (l) => qty(l.quantity) },
        { key: 'requested', label: 'Requested Quantity', align: 'right', render: (l) => qty(l.requestedQty) },
      ]
    : [
    { key: 'index', label: '#', width: 'w-14', render: (l) => <span className="text-[var(--rv-muted)] tabular-nums">{l.index + 1}</span> },
    {
      key: 'item',
      label: 'Item',
      width: priced ? 'w-[34%]' : undefined,
      render: (l) => (
        <div className="py-2.5">
          <p className="truncate font-semibold text-[var(--rv-ink)]">
            {l.name ?? 'Unknown item'}
            {l.free && <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">Free</span>}
          </p>
          {l.code && <p className="truncate text-[13px] text-[var(--rv-muted)]">{l.code}</p>}
          {l.detail && <p className="truncate text-[13px] text-[var(--rv-secondary)]">{l.detail}</p>}
        </div>
      ),
    },
    { key: 'uom', label: 'UOM', render: (l) => l.uom ?? '—' },
    { key: 'qty', label: 'Qty', align: 'right', render: (l) => l.quantity },
    ...(priced
      ? ([
          { key: 'price', label: 'Price', align: 'right', render: (l) => amount(l.price) },
          { key: 'discount', label: 'Discount', align: 'right', render: (l) => amount(l.discount) },
          { key: 'tax', label: 'Tax', align: 'right', render: (l) => <span title={l.taxRate ?? undefined}>{amount(l.tax)}</span> },
          { key: 'total', label: 'Total', align: 'right', render: (l) => <span className="font-semibold text-[var(--rv-ink)]">{amount(l.total)}</span> },
        ] as RecordColumn<SheetLine & { index: number }>[])
      : []),
  ];
  const s = sheet?.summary;
  const line = (label: string, value: string) => (
    <div className="flex justify-between gap-6">
      <dt className="text-[var(--rv-secondary)]">{label}</dt>
      <dd className="tabular-nums text-[var(--rv-ink)]">{value}</dd>
    </div>
  );
  return (
    <>
      <DetailsTab sheet={sheet} />
      <p className="mt-6 flex h-10 items-center text-[var(--rv-secondary)]">
        <span className="mr-2 font-semibold text-[var(--rv-text)]">Items</span>
        {sheet ? `${sheet.lines.length} ${sheet.lines.length === 1 ? 'line' : 'lines'} · ${Number(sheet.totalQty.toFixed(3))} units` : ''}
      </p>
      <div className="mt-[17px]">
        <RecordTable
          columns={columns}
          rows={(sheet?.lines ?? []).map((l, index) => ({ ...l, index }))}
          rowKey={(l) => l.key}
          isLoading={!sheet}
          emptyLabel={`No items on this ${sheet?.kind.toLowerCase() ?? 'document'}`}
        />
      </div>
      {s && (
        <dl className="ml-auto mt-4 w-full max-w-[360px] space-y-2 rounded-[4px] border border-[var(--rv-border)] px-[14px] py-3">
          {line('Gross', amount(s.gross))}
          {line('Discount', `− ${amount(s.discount)}`)}
          {line('Net', amount(s.net))}
          {s.excise > 0 && line('Excise', `+ ${amount(s.excise)}`)}
          {s.taxes.map((t) => (
            <div key={t.label}>{line(t.label, `+ ${amount(t.amount)}`)}</div>
          ))}
          <div className="flex items-end justify-between gap-6 border-t border-[var(--rv-border)] pt-2.5">
            <dt className="font-semibold text-[var(--rv-ink)]">Grand Total{code ? ` (${code})` : ''}</dt>
            <dd className="text-[20px] font-semibold leading-7 tabular-nums text-[var(--rv-ink)]">{amount(s.grand)}</dd>
          </div>
        </dl>
      )}
    </>
  );
}

function DetailsTab({ sheet }: { sheet?: DocumentSheet }) {
  if (!sheet) return <InfoSectionsSkeleton titles={['Dates', 'Customer', 'Details']} />;
  return (
    <div className="mt-3 space-y-4">
      {sheet.badges.length > 0 && (
        <div className="flex h-10 flex-wrap items-center gap-2">
          {sheet.badges.map((b) => (
            <StatusPill key={b.label} label={b.label} tone={b.tone} />
          ))}
        </div>
      )}
      <InfoSection
        title="Dates"
        rows={sheet.dates.map((d) => ({
          label: d.label,
          value: d.value && (
            <>
              {d.value}
              {d.hint && <span className="ml-1.5 text-[13px] text-[var(--rv-muted)]">{d.hint}</span>}
            </>
          ),
        }))}
      />
      {sheet.party && (
        <InfoSection
          title={sheet.party.title}
          rows={[{ label: 'Name', value: sheet.party.name }, { label: 'Code', value: sheet.party.code }, ...sheet.party.meta.filter((m): m is string => Boolean(m)).map(metaRow)]}
        />
      )}
      <InfoSection title={sheet.detailsTitle} rows={sheet.details} />
      <InfoSection title="Notes">
        <p className={`whitespace-pre-wrap px-[14px] py-4 leading-5 ${sheet.notes ? 'text-[var(--rv-ink)]' : 'text-[var(--rv-muted)]'}`}>{sheet.notes || 'No notes.'}</p>
      </InfoSection>
    </div>
  );
}

/** Full-screen view of one saved document (order, delivery, invoice, credit/debit note, GRN, salesman load / unload), built from a DocumentSheet. */
export function DocumentViewDrawer<T>({ isOpen, onClose, title, sheet, isLoading = false, onEdit, editPermission, rail, number, menuExtra = [] }: DocumentViewDrawerProps<T>) {
  const { code, digits } = useMoney();
  const { organisation: org, hasPermission } = useAuth();
  const shown = isLoading ? undefined : sheet;
  // A document picked in the left list names itself from that card too.
  const [picked, setPicked] = useState<{ key: string; title: string } | null>(null);
  const heading = shown?.number ?? (picked && picked.key === rail.selectedKey ? picked.title : number);
  const canEdit = Boolean(onEdit && shown?.editable && (!editPermission || hasPermission(editPermission)));
  // Which export is being built (the PDF library loads on first use), so its button shows progress and can't fire twice.
  const [busy, setBusy] = useState<'print' | 'pdf' | null>(null);
  const runExport = async (kind: 'print' | 'pdf') => {
    if (!shown || busy) return;
    setBusy(kind);
    try {
      await (kind === 'pdf' ? downloadSheetPdf : printSheetPdf)(shown, { organisation: org?.org_name, currency: code, digits });
    } catch {
      showToast.error(kind === 'pdf' ? "Couldn't create the PDF. Try again." : "Couldn't open the print dialog. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <RecordViewDrawer<T>
      isOpen={isOpen}
      onClose={onClose}
      title={heading}
      rail={{ ...rail, placeholder: rail.placeholder || `Search ${title}`, onSelect: (row) => { const card = rail.toCard(row); setPicked({ key: card.key, title: card.title }); rail.onSelect(row); } }}
      action={
        shown
          ? {
              label: busy === 'pdf' ? 'Creating PDF…' : 'Print',
              icon: Printer,
              busy: busy !== null,
              onClick: () => runExport('print'),
              menu: [{ label: 'Download PDF', icon: FileDown, onClick: () => runExport('pdf') }],
            }
          : null
      }
      menu={[...(canEdit && onEdit ? [{ label: 'Edit', icon: SquarePen, onClick: onEdit }] : []), ...menuExtra]}
      tabs={[{ key: 'items', label: 'Items', icon: Package, content: <ItemsTab sheet={shown} /> }]}
    />
  );
}
