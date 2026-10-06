export interface PdpResolveParams {
  customerId: string;
  itemId: string;
  itemUomId?: string;
  quantity: number;
  /** Manual price — only used for the discount preview when no Pricing plan matches. */
  price?: number;
}

export interface PdpFreeGoodsOffer {
  itemId: string | null;
  itemName: string | null;
  itemUomId: string | null;
  itemUomName: string | null;
  quantity: number;
}

/** Advisory preview of what the server will apply on save. */
export interface PdpResolution {
  /** Server price — from a pricing plan, else the item master price. Null = manual. */
  price: number | null;
  priceSource: 'plan' | 'master' | null;
  pricingPlanName: string | null;
  discount: number | null;
  discountPlanName: string | null;
}

export interface PdpPromotionLine {
  /** Caller's row key, echoed back. */
  key: string;
  itemId: string;
  itemUomId?: string;
  quantity: number;
  price?: number;
}

/** A promotion the whole basket earns; lineKeys are the rows that fed it. */
export interface PdpPromotion {
  planName: string;
  lineKeys: string[];
  offers: PdpFreeGoodsOffer[];
  /** Total taken off the buy lines by a percentage / fixed offer. */
  discount: number;
}
