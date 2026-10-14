export interface PortfolioManagement {
  id?: number;
  uuid: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: boolean;
  customerId?: number | string | null;
  customerUserId?: number | null;
  customerCode?: string | null;
  customerName?: string | null;
  customerCount?: number;
  itemCount?: number;
}

export interface PortfolioManagementCustomer {
  id?: number;
  uuid?: string;
  userId: number;
  customerId?: number | string | null;
  customerCode?: string | null;
  customerName?: string | null;
}

export interface PortfolioManagementItem {
  id?: number;
  uuid?: string;
  itemId: number;
  itemCode?: string | null;
  itemName?: string | null;
  storePrice: number;
  listingFees: number;
  customerItemCode?: string | null;
  uomId?: number | null;
  uomCode?: string | null;
  uomName?: string | null;
}

export interface PortfolioManagementDetail extends PortfolioManagement {
  customers: PortfolioManagementCustomer[];
  items: PortfolioManagementItem[];
}

export interface PortfolioManagementPayload {
  code?: string;
  name: string;
  startDate: string;
  endDate: string;
  status?: boolean;
  customerId?: number | string | null;
  customers?: Array<{ userId?: number; customerId?: number | string }>;
  items: Array<{
    itemId: number;
    storePrice: number;
    listingFees?: number;
    customerItemCode?: string | null;
    uomId?: number | null;
  }>;
}

export interface PortfolioManagementListParams {
  page?: number;
  perPage?: number;
  search?: string;
  customerId?: number | string;
  status?: boolean;
  startDate?: string;
  endDate?: string;
}
