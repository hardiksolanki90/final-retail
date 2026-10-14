import { documentTypeLabel } from '../constants/documentTypes';
import type { CreditNoteView, DebitNoteView, DeliveryView, DocumentSheet, GRNView, InvoiceView, SalesmanLoadView, SalesmanUnloadView, SheetLine, SheetTone } from '../types/DocumentView';
import type { OrderView, OrderViewLine } from '../types/Order';

type Party = { customerName?: string | null; customerCode?: string | null; salesmanName?: string | null; paymentTermName?: string | null; paymentTermDays?: number | null };
type Totals = { totalQty: number; totalGross: number; totalDiscountAmount: number; totalNet: number; totalVat: number; totalExcise: number; grandTotal: number };

const DAY_MS = 24 * 60 * 60 * 1000;
const parseDay = (date: string) => new Date(`${date.slice(0, 10)}T00:00:00`);

/** "06 Oct 2026" from an ISO date. */
export const formatDay = (date?: string | null) => (date ? parseDay(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null);

/** "today", "in 2 days", "3 days ago" — relative to today. */
export const relativeDay = (date?: string | null) => {
  if (!date) return null;
  const today = new Date();
  const days = Math.round((parseDay(date).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / DAY_MS);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
};

const typeLabel = (id?: number | null) => documentTypeLabel(id) ?? null;

/** Status colour from the words the workflow uses; anything unknown stays neutral. */
export const toneOf = (status: string): SheetTone => {
  const s = status.toLowerCase();
  if (/(cancel|reject|fail|void)/.test(s)) return 'danger';
  if (/(deliver|complete|approved|paid|closed|done|loaded)/.test(s)) return 'success';
  if (/(pending|hold|wait|progress|review)/.test(s)) return 'warning';
  return 'neutral';
};

const badges = (stage?: string | null, approval?: string | null, type?: string | null) => [
  ...(stage ? [{ label: stage, tone: toneOf(stage) }] : []),
  ...(approval ? [{ label: `Approval: ${approval.toLowerCase()}`, tone: toneOf(approval) }] : []),
  ...(type ? [{ label: type, tone: 'accent' as const }] : []),
];

const date = (label: string, value?: string | null, hint?: string | null) => ({ label, value: formatDay(value), hint: hint === undefined ? relativeDay(value) : hint });

const party = (p: Party) => ({
  title: 'Customer',
  name: p.customerName,
  code: p.customerCode,
  meta: [
    p.salesmanName ? `Salesman · ${p.salesmanName}` : 'No salesman',
    p.paymentTermName ? `Terms · ${p.paymentTermName}${p.paymentTermDays != null ? ` (${p.paymentTermDays} days)` : ''}` : 'No payment terms',
  ],
});

const salesmanParty = (s: { salesmanName?: string | null; salesmanCode?: string | null }, meta: (string | null | undefined)[]) => ({
  title: 'Salesman',
  name: s.salesmanName,
  code: s.salesmanCode,
  meta,
});

const rate = (line: OrderViewLine) => {
  const total = line.taxes.reduce((sum, t) => sum + (t.rate ?? 0), 0);
  return total > 0 ? `${Number(total.toFixed(3))}%` : null;
};

const planNote = (line: OrderViewLine) =>
  [line.pricingPlanName && `Price · ${line.pricingPlanName}`, line.discountPlanName && `Discount · ${line.discountPlanName}`, line.promotionPlanName && `Promotion · ${line.promotionPlanName}`]
    .filter(Boolean)
    .join('  ·  ') || null;

/** Orders: how much of the line is on deliveries so far. */
const progressNote = (line: OrderViewLine) => (line.deliveredQty ? `Delivered ${line.deliveredQty} of ${line.quantity}` : null);

const priced = (items: OrderViewLine[]): SheetLine[] =>
  items.map((l, i) => ({
    key: l.uuid ?? String(i),
    name: l.itemName,
    code: l.itemCode,
    uom: l.uomName,
    quantity: l.quantity,
    price: l.price,
    discount: l.discount,
    tax: l.vat,
    taxRate: rate(l),
    total: l.total,
    free: l.isFree,
    detail: [planNote(l), progressNote(l)].filter(Boolean).join('  ·  ') || null,
  }));

/** Tax split by code (CGST / SGST, GST / PST, VAT…) from the saved line taxes; one "Tax" row when lines carry none. */
const summary = (t: Totals, items: OrderViewLine[]) => {
  const byCode = new Map<string, number>();
  items.forEach((l) => l.taxes.forEach((tax) => byCode.set(tax.code || tax.name, (byCode.get(tax.code || tax.name) ?? 0) + tax.amount)));
  const taxes = byCode.size > 0 ? [...byCode].map(([label, amount]) => ({ label, amount })) : [{ label: 'Tax', amount: t.totalVat }];
  return { gross: t.totalGross, discount: t.totalDiscountAmount, net: t.totalNet, taxes, excise: t.totalExcise, grand: t.grandTotal };
};

export const orderSheet = (o: OrderView): DocumentSheet => ({
  kind: 'Order',
  editable: o.editable === true,
  number: o.orderNumber,
  badges: badges(o.currentStage, o.approvalStatus, typeLabel(o.orderTypeId)),
  dates: [date('Order date', o.orderDate), date('Delivery date', o.deliveryDate), date('Due date', o.dueDate)],
  party: party(o),
  detailsTitle: 'Logistics',
  details: [
    { label: 'Route', value: o.routeName },
    { label: 'Warehouse', value: o.warehouseName },
    { label: 'Depot', value: o.depotName },
  ],
  lines: priced(o.items),
  totalQty: o.totalQty,
  summary: summary(o, o.items),
  notes: o.notes,
});

export const deliverySheet = (d: DeliveryView): DocumentSheet => ({
  kind: 'Delivery',
  editable: d.editable === true,
  number: d.deliveryNumber,
  badges: badges(d.currentStage, d.approvalStatus, typeLabel(d.deliveryTypeId)),
  dates: [date('Delivery date', d.deliveryDate, [relativeDay(d.deliveryDate), d.deliveryTime].filter(Boolean).join(' · ') || null), date('Due date', d.dueDate)],
  party: party(d),
  detailsTitle: 'Logistics',
  details: [
    { label: 'Order', value: d.orderNumber },
    { label: 'Route', value: d.routeName },
    { label: 'Warehouse', value: d.warehouseName },
  ],
  lines: priced(d.items),
  totalQty: d.totalQty,
  summary: summary(d, d.items),
  notes: d.notes,
});

export const invoiceSheet = (i: InvoiceView): DocumentSheet => ({
  kind: 'Invoice',
  editable: i.editable === true,
  number: i.invoiceNumber,
  badges: badges(i.currentStage, i.approvalStatus, typeLabel(i.orderTypeId)),
  dates: [date('Invoice date', i.invoiceDate), date('Due date', i.dueDate)],
  party: party(i),
  detailsTitle: 'Reference',
  details: [
    { label: 'Order', value: i.orderNumber },
    { label: 'Delivery', value: i.deliveryNumber },
    { label: 'Route', value: i.routeName },
    { label: 'Warehouse', value: i.warehouseName },
    { label: 'Depot', value: i.depotName },
    { label: 'Van', value: i.vanCode },
  ],
  lines: priced(i.items),
  totalQty: i.totalQty,
  summary: summary(i, i.items),
  notes: i.notes,
});

export const creditNoteSheet = (c: CreditNoteView): DocumentSheet => ({
  kind: 'Credit note',
  editable: c.editable === true,
  number: c.creditNoteNumber,
  badges: badges(null, c.approvalStatus, null),
  dates: [date('Credit note date', c.creditNoteDate)],
  party: party(c),
  detailsTitle: 'Reference',
  details: [
    { label: 'Invoice', value: c.invoiceNumber },
    { label: 'Reason', value: c.reason },
    { label: 'Route', value: c.routeName },
  ],
  lines: priced(c.items),
  totalQty: c.totalQty,
  summary: summary(c, c.items),
  notes: c.notes,
});

export const debitNoteSheet = (d: DebitNoteView): DocumentSheet => ({
  kind: 'Debit note',
  editable: d.editable === true,
  number: d.debitNoteNumber,
  badges: badges(null, d.approvalStatus, d.debitNoteType),
  dates: [date('Debit note date', d.debitNoteDate)],
  party: party(d),
  detailsTitle: 'Reference',
  details: [
    { label: 'Invoice', value: d.invoiceNumber },
    { label: 'Reason', value: d.reason },
    { label: 'Route', value: d.routeName },
  ],
  lines: priced(d.items),
  totalQty: d.totalQty,
  summary: summary(d, d.items),
  notes: d.notes,
});

export const grnSheet = (g: GRNView): DocumentSheet => ({
  kind: 'GRN',
  editable: g.editable === true,
  number: g.grnNumber,
  badges: [],
  dates: [date('GRN date', g.grnDate)],
  party: null,
  detailsTitle: 'Warehouses',
  details: [
    { label: 'Source', value: g.sourceWarehouseName },
    { label: 'Destination', value: g.destinationWarehouseName },
  ],
  lines: g.items.map((l, i) => ({
    key: l.uuid ?? String(i),
    name: l.itemName,
    code: l.itemCode,
    uom: l.uomName,
    quantity: l.quantity,
    detail: [l.reasonName && `Reason · ${l.reasonName}`, l.returnReasonName && `Return reason · ${l.returnReasonName}`].filter(Boolean).join('  ·  ') || null,
  })),
  totalQty: g.items.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0),
  summary: null,
  notes: g.remark,
});

export const salesmanLoadSheet = (l: SalesmanLoadView): DocumentSheet => ({
  kind: 'Salesman load',
  editable: l.editable === true,
  number: l.loadNumber,
  badges: [
    { label: l.status === 'loaded' ? 'Confirm' : 'Pending', tone: l.status === 'loaded' ? 'success' : 'warning' },
    ...(l.active ? [] : [{ label: 'Inactive', tone: 'danger' as const }]),
  ],
  dates: [{ label: 'Date', value: l.loadDate ?? null }],
  party: null,
  detailsTitle: 'Overview',
  details: [
    { label: 'Depot', value: l.depotName },
    { label: 'Route', value: l.routeName },
    { label: 'Load Type', value: l.loadTypeName },
    { label: 'Salesman', value: l.salesmanName },
  ],
  lineColumns: 'load',
  lines: l.items.map((line, i) => ({
    key: line.uuid ?? String(i),
    code: line.itemCode,
    name: line.itemName,
    uom: line.uomName,
    quantity: line.quantity,
    requestedQty: line.requestedQty,
  })),
  totalQty: l.items.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0),
  summary: null,
  notes: null,
});

export const salesmanUnloadSheet = (u: SalesmanUnloadView): DocumentSheet => ({
  kind: 'Salesman unload',
  editable: u.editable === true,
  number: u.unloadNumber,
  badges: [...badges(null, u.approvalStatus, null), ...(u.status ? [] : [{ label: 'Inactive', tone: 'danger' as const }])],
  dates: [date('Unload date', u.transactionDate)],
  party: salesmanParty(u, [u.vanCode ? `Van · ${u.vanCode}` : 'No van']),
  detailsTitle: 'Logistics',
  details: [
    { label: 'Route', value: u.routeName },
    { label: 'Warehouse', value: u.warehouseName },
  ],
  lines: u.items.map((line, i) => ({
    key: line.uuid ?? String(i),
    name: line.itemName,
    code: line.itemCode,
    uom: line.uomName,
    quantity: line.quantity,
    detail: [line.unloadType && `Type · ${line.unloadType}`, line.reasonName && `Reason · ${line.reasonName}`].filter(Boolean).join('  ·  ') || null,
  })),
  totalQty: u.items.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0),
  summary: null,
  notes: null,
});
