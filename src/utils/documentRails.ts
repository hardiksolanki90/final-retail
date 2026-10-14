import { getOrderDetails, getOrderList } from '../api/OrderApi';
import { getDeliveryDetails, getDeliveryList } from '../api/DeliveryApi';
import { getInvoiceDetails, getInvoiceList } from '../api/InvoiceApi';
import { getCreditNoteByUuid, getCreditNoteList } from '../api/CreditNoteApi';
import { getDebitNoteByUuid, getDebitNoteList } from '../api/DebitNoteApi';
import { getGRNByUuid, getGRNList } from '../api/GRNApi';
import { getSalesmanLoadByUuid, getSalesmanLoadList, type SalesmanLoadListRow } from '../api/SalesmanLoadApi';
import { getSalesmanUnloadByUuid, getSalesmanUnloadList } from '../api/SalesmanUnloadApi';
import type { Order } from '../types/Order';
import type { Delivery } from '../types/Delivery';
import type { Invoice } from '../types/Invoice';
import type { CreditNote } from '../types/CreditNote';
import type { DebitNoteListRow } from '../types/DebitNote';
import type { GRN } from '../types/GRN';
import type { SalesmanUnload } from '../types/SalesmanUnload';
import type { RecordRailProps } from '../pages/shared/RecordView/RecordRail';
import { detailKey } from '../hooks/useEntityDetail';
import { formatDay } from './documentSheets';

/** A document list's left rail, minus what the page decides: which one is selected and what picking one does. */
export type DocumentRail<T> = Omit<RecordRailProps<T>, 'selectedKey' | 'onSelect'>;

type Money = (value?: number | null) => string;

const PER_PAGE = 20;
const more = (r: { currentPage: number; lastPage: number }) => r.currentPage < r.lastPage;

export const orderRail = (money: Money, perPage = PER_PAGE): DocumentRail<Order> => ({
  queryKey: `order-${perPage}`,
  prefetch: { key: (o) => ['order-details', o.uuid], fetch: (o) => getOrderDetails(o.uuid!) },
  placeholder: 'Search Orders',
  fetchPage: async (page, search) => {
    const r = await getOrderList(page, search || undefined, perPage);
    return { items: r.orders ?? r.data ?? [], hasMore: more(r) };
  },
  toCard: (o) => ({ key: o.uuid ?? '', title: o.orderNumber, subtitle: o.customer?.name ?? o.customer?.shopName, amount: o.total != null ? money(o.total) : formatDay(o.date) }),
});

export const deliveryRail = (money: Money, perPage = PER_PAGE): DocumentRail<Delivery> => ({
  queryKey: `delivery-${perPage}`,
  prefetch: { key: (d) => ['delivery-details', d.uuid], fetch: (d) => getDeliveryDetails(d.uuid!) },
  placeholder: 'Search Deliveries',
  fetchPage: async (page, search) => {
    const r = await getDeliveryList(page, search || undefined, perPage);
    return { items: r.deliveries ?? r.data ?? [], hasMore: more(r) };
  },
  toCard: (d) => ({ key: d.uuid ?? '', title: d.deliveryNumber, subtitle: d.customer?.name ?? d.customer?.shopName, amount: d.total != null ? money(d.total) : formatDay(d.date) }),
});

export const invoiceRail = (money: Money, perPage = PER_PAGE): DocumentRail<Invoice> => ({
  queryKey: `invoice-${perPage}`,
  prefetch: { key: (i) => ['invoice-details', i.uuid], fetch: (i) => getInvoiceDetails(i.uuid!) },
  placeholder: 'Search Invoices',
  fetchPage: async (page, search) => {
    const r = await getInvoiceList(page, search || undefined, perPage);
    return { items: r.invoices ?? r.data ?? [], hasMore: more(r) };
  },
  toCard: (i) => ({ key: i.uuid ?? '', title: i.invoiceNumber, subtitle: i.customer?.name ?? i.customer?.shopName, amount: i.total != null ? money(i.total) : formatDay(i.date) }),
});

export const creditNoteRail = (money: Money, perPage = PER_PAGE): DocumentRail<CreditNote> => ({
  queryKey: `credit-note-${perPage}`,
  prefetch: { key: (c) => [detailKey('credit-note'), c.uuid], fetch: (c) => getCreditNoteByUuid(c.uuid!) },
  placeholder: 'Search Credit Notes',
  fetchPage: async (page, search) => {
    const r = await getCreditNoteList(page, search || undefined, perPage);
    return { items: r.data, hasMore: more(r) };
  },
  toCard: (c) => ({ key: c.uuid ?? '', title: c.creditNoteNumber, subtitle: c.customer, amount: money(c.finalTotal) }),
});

export const debitNoteRail = (money: Money, perPage = PER_PAGE): DocumentRail<DebitNoteListRow> => ({
  queryKey: `debit-note-${perPage}`,
  prefetch: { key: (d) => [detailKey('debit-note'), d.uuid], fetch: (d) => getDebitNoteByUuid(d.uuid) },
  placeholder: 'Search Debit Notes',
  fetchPage: async (page, search) => {
    const r = await getDebitNoteList(page, search || undefined, perPage);
    return { items: r.data, hasMore: more(r) };
  },
  toCard: (d) => ({ key: d.uuid, title: d.noteNo, subtitle: d.customer, amount: money(d.amount) }),
});

export const grnRail = (perPage = PER_PAGE): DocumentRail<GRN> => ({
  queryKey: `grn-${perPage}`,
  prefetch: { key: (g) => [detailKey('grn'), g.uuid], fetch: (g) => getGRNByUuid(g.uuid!) },
  placeholder: 'Search GRNs',
  fetchPage: async (page, search) => {
    const r = await getGRNList(page, search || undefined, perPage);
    return { items: r.data, hasMore: more(r) };
  },
  toCard: (g) => ({ key: g.uuid ?? '', title: g.grnNumber, subtitle: [g.sourceWarehouseName, g.destinationWarehouseName].filter(Boolean).join(' → ') || null, amount: formatDay(g.grnDate) }),
});

export const salesmanLoadRail = (perPage = PER_PAGE): DocumentRail<SalesmanLoadListRow> => ({
  queryKey: `salesman-load-${perPage}`,
  prefetch: { key: (l) => [detailKey('salesman-load'), l.uuid], fetch: (l) => getSalesmanLoadByUuid(l.uuid) },
  placeholder: 'Search Salesman Loads',
  fetchPage: async (page, search) => {
    const r = await getSalesmanLoadList(page, search || undefined, perPage);
    return { items: r.data, hasMore: more(r) };
  },
  toCard: (l) => ({ key: l.uuid, title: l.loadPeriodNumber, subtitle: l.salesman, amount: formatDay(l.date) }),
});

export const salesmanUnloadRail = (perPage = PER_PAGE): DocumentRail<SalesmanUnload> => ({
  queryKey: `salesman-unload-${perPage}`,
  prefetch: { key: (u) => [detailKey('salesman-unload'), u.uuid], fetch: (u) => getSalesmanUnloadByUuid(u.uuid!) },
  placeholder: 'Search Salesman Unloads',
  fetchPage: async (page, search) => {
    const r = await getSalesmanUnloadList(page, search || undefined, perPage);
    return { items: r.data, hasMore: more(r) };
  },
  toCard: (u) => ({ key: u.uuid ?? '', title: u.unloadNumber, subtitle: u.salesmanName, amount: formatDay(u.transactionDate) }),
});
