export type RuleType = 'pricing' | 'promotion' | 'discount';
export type OfferType = 'free_goods' | 'percentage' | 'fixed';
export type RowType = 'order' | 'offer';

/** One row in the Items tab (Promotion/Discount only). */
export interface RuleItemRow {
  id: string;
  rowType: RowType;
  itemId: string;
  itemName?: string;
  uomId?: string;
  uomName?: string;
  quantity?: string;
  price?: string;
}

export interface PricingPromotionRule {
  id?: number;
  uuid?: string;
  type: RuleType;
  name: string;
  customerId?: string | null;
  customerName?: string | null;
  itemGroupId?: string | null;
  itemGroupName?: string | null;
  startDate: string;
  endDate: string;
  price?: number | null;
  offerType?: OfferType | null;
  offerValue?: number | null;
  status?: boolean;
  /** Present on the View/Add-Edit payload; the List endpoint sends `itemCount` instead. */
  items?: RuleItemRow[];
  itemCount?: number;
}

/** Form state for the Add/Edit wizard. */
export interface RuleFormData {
  name: string;
  customerId: string;
  itemGroupId: string;
  startDate: string;
  endDate: string;
  price: string;
  offerType: OfferType | '';
  offerValue: string;
  status?: boolean;
  items: RuleItemRow[];
}

export interface RuleListResponse {
  data: PricingPromotionRule[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}
