import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenText, Calendar, CircleUserRound, CreditCard, FileText, SquarePen } from 'lucide-react';
import type { Customer, CustomerActivityFilters, CustomerTransaction, CustomerTransactionType } from '../../types/Customer';
import { getCustomerDetails, getCustomerList } from '../../api/CustomerApi';
import { useAuth } from '../../context/AuthContext';
import { useMoney } from '../../hooks/Currency/useMoney';
import { detailKey } from '../../hooks/useEntityDetail';
import { useCustomerItemReport, useCustomerLedger, useCustomerTransactions } from '../../hooks/Customers/useCustomerActivity';
import { formatDay, toneOf } from '../../utils/documentSheets';
import { RecordViewDrawer, type RecordMenuItem } from '../shared/RecordView/RecordViewDrawer';
import { RecordTable, type RecordColumn, type RecordSort } from '../shared/RecordView/RecordTable';
import { FilterSelect } from '../shared/RecordView/FilterSelect';
import { InfoSection, InfoSectionsSkeleton } from '../shared/RecordView/InfoSection';
import { TransactionDocumentDrawer } from './TransactionDocumentDrawer';
import { StatusPill } from '../shared/RecordView/StatusPill';
import { DATE_RANGES, DEFAULT_RANGE, rangeDates } from '../shared/RecordView/dateRanges';

const PARTNER_FUNCTIONS = [
  { key: 'shipTo', label: 'Ship To Party' },
  { key: 'soldTo', label: 'Sold To Party' },
  { key: 'payer', label: 'Payer' },
  { key: 'billTo', label: 'Bill To Party' },
] as const;

/** Document kinds in the Transactions tab, with the permission that lets the user see them. */
const TRANSACTION_TYPES: { value: CustomerTransactionType; label: string; permission: string }[] = [
  { value: 'order', label: 'Order', permission: 'order.view' },
  { value: 'delivery', label: 'Delivery', permission: 'delivery.view' },
  { value: 'invoice', label: 'Sales Invoice', permission: 'invoice.view' },
  { value: 'credit-note', label: 'Credit Note', permission: 'credit-notes.view' },
  { value: 'debit-note', label: 'Debit Note', permission: 'debit-note.view' },
];

const TYPE_LABEL = Object.fromEntries(TRANSACTION_TYPES.map((t) => [t.value, t.label])) as Record<CustomerTransactionType, string>;

/** Workflow stages a document can be in (orders have a few more than invoices / deliveries; notes read Pending). */
const STATUSES = ['Pending', 'Approved', 'Rejected', 'In-Process', 'Partial-Deliver', 'Picking', 'Shipping', 'Completed', 'Cancelled'].map((s) => ({ value: s, label: s }));

/** "Create …" choices of the header's split button, first allowed one is the main button. */
const CREATORS = [
  { label: 'Create Sales Invoice', path: '/invoice/add', permission: 'invoice.create' },
  { label: 'Create Order', path: '/order/add', permission: 'order.create' },
  { label: 'Create Delivery', path: '/delivery/add', permission: 'delivery.create' },
  { label: 'Create Credit Note', path: '/credit-note/add', permission: 'credit-notes.create' },
  { label: 'Create Debit Note', path: '/debit-note/add', permission: 'debit-note.create' },
];

/** The customer's own name (their user's first + last name), as opposed to the shop name. */
const personName = (c: Pick<Customer, 'firstName' | 'lastName'>) => `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();

const customerName = (c: Pick<Customer, 'shopName' | 'firstName' | 'lastName'>) => c.shopName || `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() || 'Unknown customer';

const fetchCustomers = async (page: number, search: string, perPage: number) => {
  const res = await getCustomerList(page, search || undefined, perPage);
  return { items: res.data, hasMore: res.meta.has_more_pages };
};

function DateFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <FilterSelect label="Period" value={value} onChange={onChange} options={DATE_RANGES} icon={Calendar} width="w-[233px]" />;
}

function TransactionsTab({ uuid, onOpen }: { uuid: string | null; onOpen: (t: CustomerTransaction) => void }) {
  const { format } = useMoney();
  const { hasPermission } = useAuth();
  const [range, setRange] = useState(DEFAULT_RANGE);
  const [type, setType] = useState<CustomerTransactionType | ''>('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<RecordSort | null>(null);
  const filters: CustomerActivityFilters = { ...rangeDates(range), type, status, sort: sort?.key as CustomerActivityFilters['sort'], direction: sort?.direction };
  const query = useCustomerTransactions(uuid, filters);
  const rows = query.data?.pages.flatMap((p) => p.data) ?? [];
  const columns: RecordColumn<CustomerTransaction>[] = [
    { key: 'date', label: 'Date', sortable: true, render: (t) => formatDay(t.date) ?? '—' },
    { key: 'type', label: 'Transaction Type', render: (t) => TYPE_LABEL[t.type] ?? t.type },
    { key: 'number', label: 'Transaction Number', render: (t) => t.number },
    { key: 'amount', label: 'Amount', sortable: true, render: (t) => format(t.amount) },
    { key: 'status', label: 'Status', render: (t) => (t.status ? <StatusPill label={t.status} tone={toneOf(t.status)} /> : '—') },
  ];
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-[17px]">
        <DateFilter value={range} onChange={setRange} />
        <FilterSelect
          label="Transaction type"
          value={type}
          onChange={(v) => setType(v as CustomerTransactionType | '')}
          placeholder="Select Transaction Type"
          options={TRANSACTION_TYPES.filter((t) => hasPermission(t.permission))}
          width="w-[233px]"
        />
        <FilterSelect label="Status" value={status} onChange={setStatus} placeholder="Select Status" options={STATUSES} width="w-[137px]" />
      </div>
      <div className="mt-[17px]">
        <RecordTable
          columns={columns}
          rows={rows}
          rowKey={(t) => `${t.type}:${t.uuid}`}
          isLoading={query.isPending}
          emptyLabel="No transactions for the selected time period"
          sort={sort}
          onSort={setSort}
          onRowClick={onOpen}
          hasMore={query.hasNextPage}
          isLoadingMore={query.isFetchingNextPage}
          onLoadMore={query.fetchNextPage}
        />
      </div>
    </>
  );
}

function ProfileTab({ data }: { data: Customer | null }) {
  const { format } = useMoney();
  if (!data) return <InfoSectionsSkeleton titles={['General Details', 'Credit Details', 'Address']} />;
  const address = [data.customerOfficeAddress, data.customerOfficeCity, data.customerOfficeState, data.customerOfficeZipcode].filter(Boolean).join(', ');
  return (
    <div className="mt-3 space-y-4">
      <InfoSection
        title="General Details"
        rows={[
          { label: 'Customer Name', value: personName(data) || null },
          { label: 'Shop Name', value: data.shopName },
          { label: 'Code', value: data.code },
          { label: 'Mobile', value: data.phoneNumber },
          { label: 'Email', value: data.email },
          { label: 'Customer Type', value: data.customerType?.name },
          { label: 'Category', value: data.customerCategory?.name },
          { label: 'Channel', value: data.channel?.name },
          { label: 'Route', value: data.route?.name },
          { label: 'Salesman', value: data.salesman?.name },
          { label: 'Status', value: <StatusPill label={data.status ? 'Active' : 'Inactive'} tone={data.status ? 'success' : 'neutral'} /> },
        ]}
      />
      <InfoSection
        title="Credit Details"
        rows={[
          { label: 'Balance', value: format(data.balance) },
          { label: 'Credit Limit', value: data.creditLimit ? format(data.creditLimit) : null },
          { label: 'Available Credit', value: data.availableCredit !== undefined ? format(data.availableCredit) : null },
          { label: 'Credit Days', value: data.creditDays || null },
          { label: 'Payment Term', value: data.paymentTerm?.name },
        ]}
      />
      <InfoSection
        title="Address"
        rows={[
          { label: 'Office Address', value: address },
          { label: 'Office Phone', value: data.customerOfficePhone },
          { label: 'Country', value: data.country?.name },
          { label: 'Region', value: data.region?.name },
        ]}
      />
      <InfoSection
        title="Partner Functions"
        rows={PARTNER_FUNCTIONS.map(({ key, label }) => {
          const p = data.partners?.[key];
          return {
            label,
            value: p && (
              <>
                <span className="font-semibold">{p.shopName || p.fullName}</span>
                {p.code && <span className="ml-1.5 text-[var(--rv-muted)]">{p.code}</span>}
                {p.isSelf && <span className="ml-1.5 text-[var(--rv-accent)]">· Same customer</span>}
                {p.fullAddress && <span className="block text-[13px] text-[var(--rv-secondary)]">{p.fullAddress}</span>}
              </>
            ),
          };
        })}
      />
    </div>
  );
}

interface LedgerRow {
  key: string;
  type?: CustomerTransactionType;
  uuid?: string;
  date?: string | null;
  voucher: string;
  number?: string;
  debit?: number;
  credit?: number;
  balance: number;
}

function LedgerTab({ uuid, onOpen }: { uuid: string | null; onOpen: (type: CustomerTransactionType, uuid: string, number?: string) => void }) {
  const { format } = useMoney();
  const [range, setRange] = useState(DEFAULT_RANGE);
  const dates = rangeDates(range);
  const query = useCustomerLedger(uuid, dates);
  const ledger = query.data;
  const rows: LedgerRow[] =
    ledger && (ledger.entries.length > 0 || ledger.openingBalance !== 0)
      ? [
          { key: 'opening', date: dates.from, voucher: 'Opening Balance', balance: ledger.openingBalance },
          ...ledger.entries.map((e) => ({
            key: `${e.type}:${e.uuid}`,
            type: e.type,
            uuid: e.uuid,
            date: e.date,
            voucher: TYPE_LABEL[e.type],
            number: e.number,
            debit: e.debit,
            credit: e.credit,
            balance: e.balance,
          })),
        ]
      : [];
  const money = (v?: number) => (v ? format(v) : '');
  const columns: RecordColumn<LedgerRow>[] = [
    { key: 'date', label: 'Date', render: (r) => formatDay(r.date) ?? '—' },
    { key: 'voucher', label: 'Voucher', render: (r) => (r.key === 'opening' ? <span className="font-semibold">{r.voucher}</span> : r.voucher) },
    { key: 'number', label: 'Number', render: (r) => r.number ?? '' },
    { key: 'debit', label: 'Debit', align: 'right', render: (r) => money(r.debit) },
    { key: 'credit', label: 'Credit', align: 'right', render: (r) => money(r.credit) },
    { key: 'balance', label: 'Balance', align: 'right', render: (r) => format(r.balance) },
  ];
  const footCell = 'h-12 border-t border-[var(--rv-border)] bg-[var(--rv-head)] px-[14px] font-semibold text-[var(--rv-text)]';
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-[17px]">
        <DateFilter value={range} onChange={setRange} />
      </div>
      <div className="mt-[17px]">
        <RecordTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.key}
          isLoading={query.isPending}
          emptyLabel="No transactions for the selected time period"
          onRowClick={(r) => r.type && r.uuid && onOpen(r.type, r.uuid, r.number)}
          footer={
            ledger && (
              <tr>
                <td colSpan={3} className={footCell}>
                  Closing Balance
                </td>
                <td className={`${footCell} text-right tabular-nums`}>{format(ledger.totalDebit)}</td>
                <td className={`${footCell} text-right tabular-nums`}>{format(ledger.totalCredit)}</td>
                <td className={`${footCell} text-right tabular-nums`}>{format(ledger.closingBalance)}</td>
              </tr>
            )
          }
        />
      </div>
    </>
  );
}

type ItemRow = NonNullable<ReturnType<typeof useCustomerItemReport>['data']>['items'][number];

function ItemReportTab({ uuid }: { uuid: string | null }) {
  const { format } = useMoney();
  const [range, setRange] = useState(DEFAULT_RANGE);
  const query = useCustomerItemReport(uuid, rangeDates(range));
  const columns: RecordColumn<ItemRow>[] = [
    { key: 'name', label: 'Item Name', render: (i) => i.itemName ?? 'Unknown item' },
    { key: 'code', label: 'Item Code', render: (i) => i.itemCode ?? '—' },
    { key: 'uom', label: 'UOM', render: (i) => i.uomName ?? '—' },
    { key: 'quantity', label: 'Quantity', align: 'right', render: (i) => Number(i.quantity.toFixed(3)) },
    { key: 'amount', label: 'Amount', align: 'right', render: (i) => format(i.amount) },
  ];
  const footCell = 'h-12 border-t border-[var(--rv-border)] bg-[var(--rv-head)] px-[14px] font-semibold text-[var(--rv-text)]';
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-[17px]">
        <DateFilter value={range} onChange={setRange} />
      </div>
      <div className="mt-[17px]">
        <RecordTable
          columns={columns}
          rows={query.data?.items ?? []}
          rowKey={(i) => `${i.itemId}:${i.uomName}`}
          isLoading={query.isPending}
          emptyLabel="No items sold in the selected time period"
          footer={
            <tr>
              <td colSpan={4} className={footCell}>
                Total
              </td>
              <td className={`${footCell} text-right tabular-nums`}>{format(query.data?.totalAmount)}</td>
            </tr>
          }
        />
      </div>
    </>
  );
}

interface CustomerViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Customer on screen; picking another one in the left list calls `onSelect` with its uuid. */
  uuid: string | null;
  onSelect: (uuid: string, row: Customer) => void;
  /** The list row on screen: names the customer at once while `data` (the full record) loads. */
  row: Customer | null;
  data: Customer | null;
  onEdit?: (customer: Customer) => void;
  /** The page's own first page of customers, reused as the left list's first page (no request); `pageSize` is that page's size, which the left list then keeps for later pages. */
  seed?: { items: Customer[]; hasMore: boolean } | null;
  pageSize: number;
}

/** Party view: every customer on the left, the picked one's transactions, profile, ledger and item-wise sales on the right. */
export function CustomerViewDrawer({ isOpen, onClose, uuid, onSelect, row, data, onEdit, seed, pageSize }: CustomerViewDrawerProps) {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [openDoc, setOpenDoc] = useState<{ type: CustomerTransactionType; uuid: string; number?: string } | null>(null);
  // The row is enough for the header, the Create buttons and Edit; the Profile tab waits for the full record.
  const shown = data ?? row;
  const name = shown ? customerName(shown) : null;
  // The Add form preselects this customer (router state carries its uuid + the dropdown label).
  const creators: RecordMenuItem[] = CREATORS.filter((c) => hasPermission(c.permission)).map((c) => ({
    label: c.label,
    onClick: () => navigate(c.path, { state: { customer: { id: uuid, label: shown?.code ? `${shown.code} - ${name}` : name } } }),
  }));
  const [primary, ...more] = creators;
  const menu: RecordMenuItem[] = shown && onEdit && hasPermission('customer.edit') ? [{ label: 'Edit', icon: SquarePen, onClick: () => onEdit(shown) }] : [];

  return (
    <>
      <RecordViewDrawer<Customer>
        isOpen={isOpen}
        onClose={openDoc ? () => undefined : () => onClose()}
        title={shown ? [shown.code, personName(shown) || name].filter(Boolean).join(' - ') : null}
        rail={{
          queryKey: `customer-${pageSize}`,
          seed,
          prefetch: { key: (c) => [detailKey('customer'), c.uuid], fetch: (c) => getCustomerDetails(c.uuid!) },
          placeholder: 'Search Party',
          fetchPage: (page, search) => fetchCustomers(page, search, pageSize),
          toCard: (c) => ({ key: c.uuid ?? '', title: personName(c) || customerName(c), subtitle: c.code || 'Customer', amount: c.shopName || null }),
          selectedKey: uuid,
          keyboard: !openDoc,
          onSelect: (c) => {
            if (c.uuid) onSelect(c.uuid, c);
          },
        }}
        action={primary && shown ? { ...primary, icon: FileText, menu: more } : null}
        menu={menu}
        tabs={[
          { key: 'profile', label: 'Profile', icon: CircleUserRound, content: <ProfileTab data={data} /> },
          { key: 'transactions', label: 'Transactions', icon: CreditCard, content: <TransactionsTab uuid={uuid} onOpen={(t) => setOpenDoc({ type: t.type, uuid: t.uuid, number: t.number })} /> },
          { key: 'ledger', label: 'Ledger (Statement)', icon: BookOpenText, content: <LedgerTab uuid={uuid} onOpen={(type, docUuid, number) => setOpenDoc({ type, uuid: docUuid, number })} /> },
          { key: 'items', label: 'Item Wise Report', icon: FileText, content: <ItemReportTab uuid={uuid} /> },
        ]}
      />
      {isOpen && openDoc && <TransactionDocumentDrawer type={openDoc.type} uuid={openDoc.uuid} number={openDoc.number} onSelect={(next) => setOpenDoc({ ...openDoc, uuid: next, number: undefined })} onClose={() => setOpenDoc(null)} />}
    </>
  );
}
