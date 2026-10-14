export type StockLevel = 'low' | 'medium' | 'good';

/** One item's on-hand quantity in one warehouse, in the item's base unit. */
export interface StockBalance {
  warehouseId: number;
  warehouseName: string | null;
  itemId: number;
  itemCode: string | null;
  itemName: string | null;
  onHand: string;
  baseUomId: number | null;
  baseUomName: string | null;
  /** Against the organisation's Low / Medium quantities (Preferences). */
  level: StockLevel;
  updatedAt: string | null;
}

export type StockMovementType = 'opening' | 'receipt' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'load' | 'unload' | 'sale' | 'return' | 'reversal';

export interface StockMovement {
  uuid: string;
  occurredAt: string | null;
  warehouseId: number;
  warehouseName: string | null;
  itemId: number;
  itemCode: string | null;
  itemName: string | null;
  movementType: StockMovementType;
  quantityChange: string;
  balanceAfter: string;
  enteredQuantity: string | null;
  enteredUomId: number | null;
  reversalOfUuid: string | null;
  sourceType: string | null;
  sourceNumber: string | null;
  remark: string | null;
}

/** An item as the stock entry form offers it: integer ids as strings (what the Select holds), with the UOMs it can be received in. */
export interface StockItemOption {
  value: string;
  label: string;
  uoms: { value: string; label: string; isBase: boolean }[];
}

export type StockEntryType = 'opening' | 'receipt';

export interface StockEntryLineForm {
  itemId: string;
  itemUomId: string;
  quantity: string;
}

export interface StockEntryFormData {
  entryType: StockEntryType;
  entryDate: string;
  remark: string;
  items: StockEntryLineForm[];
}

export interface StockEntryPayload {
  entryType: StockEntryType;
  warehouseId: number;
  entryDate: string;
  remark?: string;
  post: boolean;
  items: { itemId: number; itemUomId?: number; quantity: number }[];
}

/** Sets what one item holds in a warehouse; quantity 0 removes it. The quantity is in `itemUomId` (none = the base unit). */
export interface StockSetPayload {
  warehouseId: number;
  itemId: number;
  itemUomId?: number;
  quantity: number;
}

/** Whether one document line can be served from a warehouse (quantities in the item's base unit). */
export interface StockAvailability {
  onHand: string;
  required: string;
  baseUomName: string | null;
  enough: boolean;
}

export interface StockSettings {
  allowNegativeStock: boolean;
  /** Quantities (base unit): at or below low is Low, at or below medium is Medium, above is Good. */
  lowStockQty: string;
  mediumStockQty: string;
}

export interface StockImportResult {
  rowCount: number;
  itemCount: number;
}
