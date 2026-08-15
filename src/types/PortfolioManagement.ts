export interface PortfolioManagement {
  id: string;
  salesmanId: string;
  customerId: string;
  portfolioName: string;
  targetRevenue: number;
  actualRevenue: number;
  startDate: string;
  endDate: string;
  items: PortfolioItem[];
  notes?: string;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  targetQuantity: number;
  actualQuantity: number;
  targetValue: number;
  actualValue: number;
}

export interface PortfolioManagementFormData {
  salesmanId: string;
  customerId: string;
  portfolioName: string;
  targetRevenue: number;
  startDate: string;
  endDate: string;
  items: Array<{
    itemId: string;
    targetQuantity: number;
    targetValue: number;
  }>;
  notes?: string;
  status: 'active' | 'inactive' | 'completed';
}
