import { useState } from 'react';
import { FileDown, Package, Printer, SquarePen } from 'lucide-react';
import type { Delivery } from '../../types/Delivery';
import type { DeliveryView as DeliveryViewData } from '../../types/DocumentView';
import type { DocumentSheet, SheetLine } from '../../types/DocumentView';
import { getDeliveryDetails } from '../../api/DeliveryApi';
import { useMoney } from '../../hooks/Currency/useMoney';
import { useEntityDetail } from '../../hooks/useEntityDetail';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../lib/toast';
import { downloadSheetPdf, printSheetPdf } from '../../utils/documentPdf';
import { deliveryRail } from '../../utils/documentRails';
import { deliverySheet } from '../../utils/documentSheets';
import { RecordViewDrawer } from '../shared/RecordView/RecordViewDrawer';
import { RecordTable, type RecordColumn } from '../shared/RecordView/RecordTable';
import { InfoSection, InfoSectionsSkeleton } from '../shared/RecordView/InfoSection';
import { StatusPill } from '../shared/RecordView/StatusPill';

const metaRow = (text: string) => {
  const [label, ...rest] = text.split(' · ');
  if (rest.length > 0) return { label, value: rest.join(' · ') };
  return text.startsWith('No ')
    ? { label: text.charAt(3).toUpperCase() + text.slice(4), value: null }
    : { label: text, value: null };
};

function DeliveryTab({ sheet }: { sheet?: DocumentSheet }) {
  const { digits, code } = useMoney();
  const amount = (value?: number) =>
    (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const priced = Boolean(sheet?.lines.some((l) => l.price !== undefined));
  const columns: RecordColumn<SheetLine & { index: number }>[] = [
    { key: 'index', label: '#', width: 'w-14', render: (l) => <span className="text-[var(--rv-muted)] tabular-nums">{l.index + 1}</span> },
    {
      key: 'item', label: 'Item', width: priced ? 'w-[34%]' : undefined,
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
    ...(priced ? ([
      { key: 'price', label: 'Price', align: 'right', render: (l: SheetLine) => amount(l.price) },
      { key: 'discount', label: 'Discount', align: 'right', render: (l: SheetLine) => amount(l.discount) },
      { key: 'tax', label: 'Tax', align: 'right', render: (l: SheetLine) => <span title={l.taxRate ?? undefined}>{amount(l.tax)}</span> },
      { key: 'total', label: 'Total', align: 'right', render: (l: SheetLine) => <span className="font-semibold text-[var(--rv-ink)]">{amount(l.total)}</span> },
    ] as RecordColumn<SheetLine & { index: number }>[]) : []),
  ];

  const s = sheet?.summary;
  const summaryLine = (label: string, value: string) => (
    <div className="flex justify-between gap-6">
      <dt className="text-[var(--rv-secondary)]">{label}</dt>
      <dd className="tabular-nums text-[var(--rv-ink)]">{value}</dd>
    </div>
  );

  if (!sheet) {
    return (
      <>
        <p className="mt-3 flex h-10 items-center text-[var(--rv-secondary)]" />
        <div className="mt-[17px]"><RecordTable columns={columns} rows={[]} rowKey={(l) => l.key} isLoading emptyLabel="No items on this delivery" /></div>
        <div className="mt-8"><InfoSectionsSkeleton titles={['Dates', 'Customer', 'Logistics', 'Notes']} /></div>
      </>
    );
  }

  return (
    <>
      <p className="mt-3 flex h-10 items-center text-[var(--rv-secondary)]">
        {`${sheet.lines.length} ${sheet.lines.length === 1 ? 'line' : 'lines'} · ${Number(sheet.totalQty.toFixed(3))} units`}
      </p>
      <div className="mt-[17px]">
        <RecordTable columns={columns} rows={sheet.lines.map((l, index) => ({ ...l, index }))} rowKey={(l) => l.key} isLoading={false} emptyLabel="No items on this delivery" />
      </div>
      {s && (
        <dl className="ml-auto mt-4 w-full max-w-[360px] space-y-2 rounded-[4px] border border-[var(--rv-border)] px-[14px] py-3">
          {summaryLine('Gross', amount(s.gross))}
          {summaryLine('Discount', `− ${amount(s.discount)}`)}
          {summaryLine('Net', amount(s.net))}
          {s.excise > 0 && summaryLine('Excise', `+ ${amount(s.excise)}`)}
          {s.taxes.map((t) => <div key={t.label}>{summaryLine(t.label, `+ ${amount(t.amount)}`)}</div>)}
          <div className="flex items-end justify-between gap-6 border-t border-[var(--rv-border)] pt-2.5">
            <dt className="font-semibold text-[var(--rv-ink)]">Grand Total{code ? ` (${code})` : ''}</dt>
            <dd className="text-[20px] font-semibold leading-7 tabular-nums text-[var(--rv-ink)]">{amount(s.grand)}</dd>
          </div>
        </dl>
      )}
      <div className="mt-8 space-y-4">
        {sheet.badges.length > 0 && (
          <div className="flex h-10 flex-wrap items-center gap-2">
            {sheet.badges.map((b) => <StatusPill key={b.label} label={b.label} tone={b.tone} />)}
          </div>
        )}
        <InfoSection title="Dates" rows={sheet.dates.map((d) => ({ label: d.label, value: d.value && (<>{d.value}{d.hint && <span className="ml-1.5 text-[13px] text-[var(--rv-muted)]">{d.hint}</span>}</>) }))} />
        {sheet.party && (
          <InfoSection title={sheet.party.title} rows={[{ label: 'Name', value: sheet.party.name }, { label: 'Code', value: sheet.party.code }, ...sheet.party.meta.filter((m): m is string => Boolean(m)).map(metaRow)]} />
        )}
        <InfoSection title={sheet.detailsTitle} rows={sheet.details} />
        <InfoSection title="Notes">
          <p className={`whitespace-pre-wrap px-[14px] py-4 leading-5 ${sheet.notes ? 'text-[var(--rv-ink)]' : 'text-[var(--rv-muted)]'}`}>{sheet.notes || 'No notes.'}</p>
        </InfoSection>
      </div>
    </>
  );
}

interface DeliveryViewProps {
  isOpen: boolean;
  onClose: () => void;
  data: Delivery | null;
  onSelect: (delivery: Delivery) => void;
  onEdit?: () => void;
}

export function DeliveryView({ isOpen, onClose, data, onSelect, onEdit }: DeliveryViewProps) {
  const { format, code, digits } = useMoney();
  const { organisation: org, hasPermission } = useAuth();
  const [busy, setBusy] = useState<'print' | 'pdf' | null>(null);

  const { data: deliveryView, isLoading } = useEntityDetail<DeliveryViewData>('delivery', getDeliveryDetails, data?.uuid);
  const sheet = deliveryView && !isLoading ? deliverySheet(deliveryView) : undefined;
  const canEdit = Boolean(onEdit && sheet?.editable && hasPermission('delivery.edit'));

  const runExport = async (kind: 'print' | 'pdf') => {
    if (!sheet || busy) return;
    setBusy(kind);
    try {
      await (kind === 'pdf' ? downloadSheetPdf : printSheetPdf)(sheet, { organisation: org?.org_name, currency: code, digits });
    } catch {
      showToast.error(kind === 'pdf' ? "Couldn't create the PDF. Try again." : "Couldn't open the print dialog. Try again.");
    } finally { setBusy(null); }
  };

  return (
    <RecordViewDrawer<Delivery>
      isOpen={isOpen && Boolean(data)}
      onClose={onClose}
      title={sheet?.number ?? null}
      rail={{ ...deliveryRail(format), selectedKey: data?.uuid, onSelect }}
      action={sheet ? { label: busy === 'pdf' ? 'Creating PDF…' : 'Print', icon: Printer, busy: busy !== null, onClick: () => runExport('print'), menu: [{ label: 'Download PDF', icon: FileDown, onClick: () => runExport('pdf') }] } : null}
      menu={canEdit && onEdit ? [{ label: 'Edit', icon: SquarePen, onClick: onEdit }] : []}
      tabs={[{ key: 'delivery', label: 'Delivery', icon: Package, content: <DeliveryTab sheet={sheet} /> }]}
    />
  );
}
