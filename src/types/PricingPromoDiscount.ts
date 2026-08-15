// ─── Module type (drives page title + last tab label) ─────────────────────────
export type ModuleType = 'Promotion' | 'Pricing' | 'Discount';

// ─── Tab 1 – Select Key Combination ──────────────────────────────────────────
export interface KeyCombination {
  id: string;
  label: string; // e.g. "Customer/Material"
}

export interface LocationKeys {
  country: boolean;
  region: boolean;
  area: boolean;
  route: boolean;
}

export interface CustomerKeys {
  salesOrganisation: boolean;
  channel: boolean;
  customerCategory: boolean;
  customer: boolean;
}

export interface ItemKeys {
  majorCategory: boolean;
  itemGroup: boolean;
}

export interface SelectKeyCombinationData {
  selectedCombination: string;
  location: LocationKeys;
  customer: CustomerKeys;
  item: ItemKeys;
}

// ─── Tab 2 – Key Value ────────────────────────────────────────────────────────
export interface KeyValueData {
  customerId: string;
  itemGroupId: string;
}

// ─── Tab 3 – Module Detail (Promotion / Pricing / Discount) ─────────────────
export interface OrderItemRow {
  id: string;
  itemName: string;
  quantity: string;
  uom: string;
  price: string;
}

export interface OfferItemRow {
  id: string;
  itemName: string;
  uom: string;
  offeredQuantity: string;
}

export interface ModuleDetailData {
  name: string;
  startDate: string;
  endDate: string;
  orderType: string;
  offerType: string;
  orderItems: OrderItemRow[];
  offerItems: OfferItemRow[];
}
