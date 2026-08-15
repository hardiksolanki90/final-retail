export interface RouteItemGrouping {
  id: string;
  routeId: string;
  itemGroupId: string;
  itemIds: string[];
  groupName: string;
  description?: string;
  priority: number;
  effectiveDate: string;
  expiryDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface RouteItemGroupingItem {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  sortOrder: number;
}

export interface RouteItemGroupingFormData {
  routeId: string;
  groupName: string;
  description?: string;
  priority: number;
  effectiveDate: string;
  expiryDate?: string;
  itemIds: string[];
  status: 'active' | 'inactive';
}
