import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { CustomerTransactionType } from '../../types/Customer';
import type { DocumentSheet } from '../../types/DocumentView';
import { getOrderDetails } from '../../api/OrderApi';
import { getDeliveryDetails } from '../../api/DeliveryApi';
import { getInvoiceDetails } from '../../api/InvoiceApi';
import { getCreditNoteByUuid } from '../../api/CreditNoteApi';
import { getDebitNoteByUuid } from '../../api/DebitNoteApi';
import { useMoney } from '../../hooks/Currency/useMoney';
import { DETAIL_STALE_MS } from '../../hooks/useEntityDetail';
import { creditNoteSheet, debitNoteSheet, deliverySheet, invoiceSheet, orderSheet } from '../../utils/documentSheets';
import { creditNoteRail, debitNoteRail, deliveryRail, invoiceRail, orderRail, type DocumentRail } from '../../utils/documentRails';
import { DocumentViewDrawer } from '../shared/DocumentViewDrawer';

interface TypedProps<T extends { uuid?: string }, V> {
  uuid: string;
  /** The document number as the customer's list shows it, until the document itself loads. */
  number?: string;
  onSelect: (uuid: string) => void;
  onClose: () => void;
  title: string;
  /** Cache key shared with the document's own list drawer, so saving a document refreshes this view too. */
  cacheKey: string;
  fetcher: (uuid: string) => Promise<V>;
  toSheet: (view: V) => DocumentSheet;
  rail: DocumentRail<T>;
  editPath: string;
  editPermission: string;
}

function TypedDocumentDrawer<T extends { uuid?: string }, V>({ uuid, number, onSelect, onClose, title, cacheKey, fetcher, toSheet, rail, editPath, editPermission }: TypedProps<T, V>) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: [cacheKey, uuid], queryFn: () => fetcher(uuid), staleTime: DETAIL_STALE_MS, refetchOnWindowFocus: false });
  return (
    <DocumentViewDrawer<T>
      isOpen
      onClose={onClose}
      title={title}
      sheet={data ? toSheet(data) : undefined}
      isLoading={isLoading}
      number={number}
      editPermission={editPermission}
      onEdit={() => navigate(`${editPath}/${uuid}`)}
      rail={{
        ...rail,
        selectedKey: uuid,
        onSelect: (row) => {
          if (row.uuid) onSelect(row.uuid);
        },
      }}
    />
  );
}

interface TransactionDocumentDrawerProps {
  type: CustomerTransactionType;
  uuid: string;
  number?: string;
  onSelect: (uuid: string) => void;
  onClose: () => void;
}

/** A customer's transaction opened on top of the customer view: the same document view the document's own list shows. */
export function TransactionDocumentDrawer({ type, uuid, number, onSelect, onClose }: TransactionDocumentDrawerProps) {
  const { format } = useMoney();
  const common = { uuid, number, onSelect, onClose };
  switch (type) {
    case 'order':
      return (
        <TypedDocumentDrawer
          {...common}
          title="Order"
          cacheKey="order-details"
          fetcher={getOrderDetails}
          toSheet={orderSheet}
          rail={orderRail(format)}
          editPath="/order/edit"
          editPermission="order.edit"
        />
      );
    case 'delivery':
      return (
        <TypedDocumentDrawer
          {...common}
          title="Delivery"
          cacheKey="delivery-details"
          fetcher={getDeliveryDetails}
          toSheet={deliverySheet}
          rail={deliveryRail(format)}
          editPath="/delivery/edit"
          editPermission="delivery.edit"
        />
      );
    case 'invoice':
      return (
        <TypedDocumentDrawer
          {...common}
          title="Invoice"
          cacheKey="invoice-details"
          fetcher={getInvoiceDetails}
          toSheet={invoiceSheet}
          rail={invoiceRail(format)}
          editPath="/invoice/edit"
          editPermission="invoice.edit"
        />
      );
    case 'credit-note':
      return (
        <TypedDocumentDrawer
          {...common}
          title="Credit note"
          cacheKey="credit-note-detail"
          fetcher={getCreditNoteByUuid}
          toSheet={creditNoteSheet}
          rail={creditNoteRail(format)}
          editPath="/credit-note/edit"
          editPermission="credit-notes.edit"
        />
      );
    case 'debit-note':
      return (
        <TypedDocumentDrawer
          {...common}
          title="Debit note"
          cacheKey="debit-note-detail"
          fetcher={getDebitNoteByUuid}
          toSheet={debitNoteSheet}
          rail={debitNoteRail(format)}
          editPath="/debit-note/edit"
          editPermission="debit-note.edit"
        />
      );
  }
}
