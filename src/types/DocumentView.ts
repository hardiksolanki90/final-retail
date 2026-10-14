import type { OrderViewLine } from './Order';

interface PartyNames {
  customerName?: string | null;
  customerCode?: string | null;
  salesmanName?: string | null;
  paymentTermName?: string | null;
  paymentTermDays?: number | null;
}

interface Totals {
  totalQty: number;
  totalGross: number;
  totalDiscountAmount: number;
  totalNet: number;
  totalVat: number;
  totalExcise: number;
  grandTotal: number;
}

/** GET /delivery/edit/{uuid} (DeliveryView). */
export interface DeliveryView extends PartyNames, Totals {
  uuid: string;
  editable?: boolean;
  customerId?: string | null;
  salesmanId?: string | null;
  paymentTermId?: string | null;
  warehouseId?: string | null;
  deliveryNumber: string;
  deliveryDate?: string | null;
  deliveryTime?: string | null;
  dueDate?: string | null;
  deliveryTypeId?: number | null;
  orderNumber?: string | null;
  routeName?: string | null;
  warehouseName?: string | null;
  currentStage?: string | null;
  approvalStatus?: string | null;
  notes?: string | null;
  items: OrderViewLine[];
}

/** GET /invoice/edit/{uuid} (InvoiceView). */
export interface InvoiceView extends PartyNames, Totals {
  uuid: string;
  editable?: boolean;
  customerId?: string | null;
  salesmanId?: string | null;
  paymentTermId?: string | null;
  invoiceNumber: string;
  invoiceDate?: string | null;
  dueDate?: string | null;
  orderTypeId?: number | null;
  orderNumber?: string | null;
  deliveryNumber?: string | null;
  routeName?: string | null;
  warehouseId?: string | null;
  warehouseName?: string | null;
  depotName?: string | null;
  vanCode?: string | null;
  currentStage?: string | null;
  approvalStatus?: string | null;
  notes?: string | null;
  items: OrderViewLine[];
}

/** GET /credit-note/edit/{uuid} (CreditNoteView). */
export interface CreditNoteView extends PartyNames, Totals {
  uuid: string;
  editable?: boolean;
  customerId?: string | null;
  salesmanId?: string | null;
  paymentTermId?: string | null;
  invoiceId?: string | null;
  creditNoteNumber: string;
  creditNoteDate?: string | null;
  invoiceNumber?: string | null;
  routeName?: string | null;
  reason?: string | null;
  notes?: string | null;
  approvalStatus?: string | null;
  items: OrderViewLine[];
}

/** GET /debit-note/edit/{uuid} (DebitNoteView). */
export interface DebitNoteView extends PartyNames, Totals {
  uuid: string;
  editable?: boolean;
  customerId?: string | null;
  salesmanId?: string | null;
  paymentTermId?: string | null;
  invoiceId?: string | null;
  debitNoteNumber: string;
  debitNoteDate?: string | null;
  invoiceNumber?: string | null;
  reason?: string | null;
  debitNoteType?: string | null;
  routeName?: string | null;
  notes?: string | null;
  approvalStatus?: string | null;
  items: OrderViewLine[];
}

interface SalesmanRef {
  salesmanId?: string | null;
  salesmanCode?: string | null;
  salesmanName?: string | null;
}

/** GET /salesman-load/edit/{uuid} (SalesmanLoadView). */
export interface SalesmanLoadView extends SalesmanRef {
  uuid: string;
  editable?: boolean;
  vanId?: string | null;
  warehouseId?: string | null;
  loadNumber: string;
  loadDate?: string | null;
  tripNumber?: number | null;
  vanCode?: string | null;
  warehouseName?: string | null;
  depotName?: string | null;
  routeId?: string | null;
  routeName?: string | null;
  loadType?: number | null;
  loadTypeName?: string | null;
  orderNumber?: string | null;
  deliveryNumber?: string | null;
  status: 'loaded' | 'pending';
  approvalStatus?: string | null;
  active: boolean;
  items: {
    uuid?: string;
    itemId?: string | null;
    itemName?: string | null;
    itemCode?: string | null;
    uomName?: string | null;
    quantity: number;
    requestedQty: number;
    lowerQty: number;
    ctnQty: number;
  }[];
}

/** GET /salesman-unload/edit/{uuid} (SalesmanUnloadView). */
export interface SalesmanUnloadView extends SalesmanRef {
  uuid: string;
  editable?: boolean;
  routeId?: string | null;
  warehouseId?: string | null;
  vanId?: string | null;
  unloadNumber: string;
  transactionDate?: string | null;
  routeName?: string | null;
  warehouseName?: string | null;
  vanCode?: string | null;
  status: boolean;
  approvalStatus?: string | null;
  items: {
    uuid?: string;
    itemId?: string | null;
    itemName?: string | null;
    itemCode?: string | null;
    uomName?: string | null;
    uomCode?: string | null;
    quantity: number;
    unloadType?: string | null;
    reasonId?: string | null;
    reasonName?: string | null;
  }[];
}

/** GET /grn/edit/{uuid} (GoodReceiptNoteView). */
export interface GRNView {
  uuid: string;
  editable?: boolean;
  sourceWarehouseId?: string | null;
  destinationWarehouseId?: string | null;
  grnNumber: string;
  grnDate?: string | null;
  sourceWarehouseName?: string | null;
  destinationWarehouseName?: string | null;
  remark?: string | null;
  items: (Pick<OrderViewLine, 'uuid' | 'itemId' | 'itemName' | 'itemCode' | 'uomName' | 'quantity'> & {
    uomCode?: string | null;
    reasonId?: string | null;
    reasonName?: string | null;
    returnReasonId?: string | null;
    returnReasonName?: string | null;
  })[];
}

/** One item row of the view drawer; money columns are left out for documents without prices (GRN). */
export interface SheetLine {
  key: string;
  name?: string | null;
  code?: string | null;
  uom?: string | null;
  quantity: number;
  /** Salesman load lines: the quantity that was asked for, beside the approved quantity. */
  requestedQty?: number;
  price?: number;
  discount?: number;
  tax?: number;
  /** Combined tax rate of the line, e.g. "18%". */
  taxRate?: string | null;
  total?: number;
  free?: boolean;
  /** A short muted note under the item: the plan that priced it, a GRN line's reasons. */
  detail?: string | null;
}

export type SheetTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

/** Every document is normalised to this before it reaches the view drawer. */
export interface DocumentSheet {
  /** "Order", "Delivery", "Credit note", … */
  kind: string;
  /** Still pending, so the drawer offers Edit. */
  editable: boolean;
  number: string;
  badges: { label: string; tone: SheetTone }[];
  dates: { label: string; value?: string | null; hint?: string | null }[];
  /** Who the document is for — the customer, or the salesman on van-sales documents; GRN leaves it out. `meta` lines read as "Salesman · Florida Beatty". */
  party?: { title: string; name?: string | null; code?: string | null; meta: (string | null | undefined)[] } | null;
  detailsTitle: string;
  details: { label: string; value?: string | null }[];
  /** Salesman load: Item Code, Name, UOM, Approved Quantity, Requested Quantity. */
  lineColumns?: 'load';
  lines: SheetLine[];
  totalQty: number;
  summary?: { gross: number; discount: number; net: number; taxes: { label: string; amount: number }[]; excise: number; grand: number } | null;
  notes?: string | null;
}
