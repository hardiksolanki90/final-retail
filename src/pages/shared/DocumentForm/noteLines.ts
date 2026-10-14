/** One line of a credit or debit note form — both notes share the same line shape and payload. */
export type NoteItem = { id: string; uuid?: string; itemId: string; uom: string; reason: string; quantity: number; price: number; discount: number; vat: number; net: number; excise: number; total: number };

export const emptyNoteItem: NoteItem = { id: '', itemId: '', uom: '', reason: '', quantity: 1, price: 0, discount: 0, vat: 0, net: 0, excise: 0, total: 0 };

/** The lines a note POSTs: only lines with an item; price/discount are advisory (the server re-prices). */
export const noteLinesPayload = (items: NoteItem[]) => items.filter((item) => item.itemId).map((item) => ({ uuid: item.uuid, itemId: item.itemId, itemUomId: item.uom || undefined, reason: item.reason || undefined, quantity: Number(item.quantity) || 0, price: Number(item.price) || 0, discount: Number(item.discount) || 0 }));
