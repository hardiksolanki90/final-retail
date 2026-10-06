export type RuleType = 'pricing' | 'promotion' | 'discount';
export type OfferType = 'free_goods' | 'percentage' | 'fixed';
export type RowType = 'order' | 'offer';
export type DiscountMainType = 'slab' | 'normal';
export type DiscountType = 'fixed' | 'percentage';

/** One row in the Items tab (Pricing/Promotion). */
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

/** One row in the Slabs tab (Discount only) — a qty range with a flat value or a percentage. */
export interface RuleSlabRow {
  id: string;
  minSlab: string;
  maxSlab: string;
  value: string;
  percentage: string;
}

/** A dimension's selected value as returned by the API — internal id is never exposed, uuid only. */
export interface DimensionValue {
  id: string;
  name: string | null;
}

export interface PricingPromotionRule {
  id?: number;
  uuid?: string;
  type: RuleType;
  name: string;
  countries?: DimensionValue[];
  regions?: DimensionValue[];
  areas?: DimensionValue[];
  routes?: DimensionValue[];
  salesOrganisations?: DimensionValue[];
  channels?: DimensionValue[];
  customerCategories?: DimensionValue[];
  customers?: DimensionValue[];
  itemCategories?: DimensionValue[];
  itemGroups?: DimensionValue[];
  itemValues?: DimensionValue[];
  startDate: string;
  endDate: string;
  offerType?: OfferType | null;
  offerValue?: number | null;
  discountMainType?: DiscountMainType | null;
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountApplyOn?: DiscountApplyOn | null;
  orderItemType?: OrderItemType | null;
  isRepeat?: boolean;
  status?: boolean;
  /** Present on the View/Add-Edit payload; the List endpoint sends `itemCount` instead. */
  items?: RuleItemRow[];
  itemCount?: number;
  slabs?: RuleSlabRow[];
}

export type DiscountApplyOn = 'quantity' | 'value';
export type OrderItemType = 'all' | 'any';

/** Form state for the Add/Edit wizard. */
export interface RuleFormData {
  name: string;
  countryIds: string[];
  regionIds: string[];
  areaIds: string[];
  routeIds: string[];
  salesOrganisationIds: string[];
  channelIds: string[];
  customerCategoryIds: string[];
  customerIds: string[];
  itemCategoryIds: string[];
  itemGroupIds: string[];
  itemIds: string[];
  startDate: string;
  endDate: string;
  offerType: OfferType | '';
  offerValue: string;
  discountMainType: DiscountMainType;
  discountType: DiscountType | '';
  discountValue: string;
  /** Slab ranges compare against line quantity or line gross value. */
  discountApplyOn: DiscountApplyOn;
  /** Promotion buy rows: all must be met, or any of them pooled. */
  orderItemType: OrderItemType;
  /** Offer scales per multiple of the buy qty, or is granted once. */
  isRepeat: boolean;
  status?: boolean;
  items: RuleItemRow[];
  slabs: RuleSlabRow[];
}

export interface RuleListResponse {
  data: PricingPromotionRule[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}
