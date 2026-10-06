/**
 * Numeric id stored for each document-type label (orders.order_type_id,
 * deliveries.delivery_type, invoices.order_type_id). The columns are plain
 * integers with no lookup table, so this is the single definition — keep
 * ids stable, add new labels at the end.
 */
export const DOCUMENT_TYPE_IDS: Record<string, number> = { Cash: 1, Credit: 2, Return: 3, Depot: 4, Sample: 5, Proforma: 6 };

export const documentTypeId = (label: string): number | undefined => DOCUMENT_TYPE_IDS[label];
