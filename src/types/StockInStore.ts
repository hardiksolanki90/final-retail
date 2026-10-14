export interface StockInStoreCustomer {
  id?: string | number;
  code: string;
  name: string;
}

export interface StockInStoreItemDetail {
  id: string;
  itemId?: string;
  itemCode: string;
  itemName: string;
  itemUom: string;
  uomId?: string;
  capacity: string | number;
}

export interface StockInStorePost {
  id?: string;
  date: string;
  itemCode: string;
  item: string;
  customerCode: string;
  customer: string;
  uom: string;
  capacity: string | number;
  goodSaleableQty: number;
  refillQty: number;
  reorderQty: number;
  fill: number;
  outOfStock: number;
}

export interface StockInStoreDamage {
  id?: string;
  date: string;
  merchandiser: string;
  customerCode: string;
  customerName: string;
  itemCode: string;
  itemName: string;
  damageItem: number;
  expiredItem: number;
  saleableItem: number;
}

export interface StockInStoreRecord {
  id: number | string;
  uuid: string;
  activityName: string;
  dateFrom: string;
  dateTo: string;
  status?: boolean | string;
  customers: StockInStoreCustomer[];
  items: StockInStoreItemDetail[];
  posts?: StockInStorePost[];
  damages?: StockInStoreDamage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StockInStoreFormData {
  activityName: string;
  dateFrom: string;
  dateTo: string;
  assignedCustomers: string[];
  items: StockInStoreItemDetail[];
}

// Legacy alias for backwards compatibility
export type StockInStore = StockInStoreRecord;
export type StockInStoreItem = StockInStoreItemDetail;
