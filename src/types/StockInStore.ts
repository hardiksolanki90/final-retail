export interface StockInStore {
  id: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  checkDate: string;
  salesmanId: string;
  items: StockInStoreItem[];
  totalValue: number;
  notes?: string;
  status: 'pending' | 'verified' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export interface StockInStoreItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  totalValue: number;
  expiryDate?: string;
  batchNumber?: string;
}

export interface StockInStoreFormData {
  customerId: string;
  storeId: string;
  checkDate: string;
  salesmanId: string;
  items: Array<{
    itemId: string;
    currentStock: number;
    minStockLevel: number;
    maxStockLevel: number;
    unitPrice: number;
    expiryDate?: string;
    batchNumber?: string;
  }>;
  notes?: string;
  status: 'pending' | 'verified' | 'approved';
}
